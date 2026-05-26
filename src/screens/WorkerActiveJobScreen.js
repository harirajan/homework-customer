import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";

export default function WorkerActiveJobScreen({ navigation }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchActiveJob();
  }, []);

  const fetchActiveJob = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get("/api/bookings/worker/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const data = response.data.data;
        // API returns array — get the IN_PROGRESS one first
        // otherwise get the first one
        if (Array.isArray(data) && data.length > 0) {
          const inProgress = data.find((b) => b.status === "IN_PROGRESS");
          setBooking(inProgress || data[0]);
        } else if (!Array.isArray(data)) {
          setBooking(data);
        } else {
          setBooking(null);
        }
      }
    } catch (err) {
      console.log("No active job:", err.message);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    Alert.alert("Complete Job", "Mark this job as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          setActionLoading(true);
          try {
            const token = await AsyncStorage.getItem("token");
            await api.put(
              `/api/bookings/${booking.id}/status`,
              {
                status: "COMPLETED",
                workerNotes: "Job completed",
                finalAmount: booking.agreedPrice || 500,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            Alert.alert("Done!", "Job marked as completed", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (err) {
            Alert.alert("Error", "Failed to complete job");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>No active job</Text>
          <Text style={styles.emptySubtext}>
            You have no job in progress right now
          </Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate("WorkerBookings")}
          >
            <Text style={styles.viewAllText}>View All Jobs</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activeCard}>
        <Text style={styles.activeLabel}>🔧 Active Job</Text>
        <Text style={styles.serviceType}>{booking.serviceType}</Text>
        <Text style={styles.customerName}>👤 {booking.customerName}</Text>
        <Text style={styles.address}>📍 {booking.serviceAddress}</Text>

        {booking.arrivalOtp && (
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>Your OTP</Text>
            <Text style={styles.otpValue}>{booking.arrivalOtp}</Text>
          </View>
        )}

        <View style={styles.otpStatus}>
          <Text style={styles.otpStatusText}>
            {booking.otpVerified
              ? "✅ Customer verified your arrival"
              : "⏳ Waiting for customer OTP verification"}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchActiveJob}>
          <Text style={styles.refreshText}>↻ Refresh Status</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.completeBtn, actionLoading && styles.btnDisabled]}
        onPress={handleComplete}
        disabled={actionLoading}
      >
        {actionLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.completeBtnText}>🏁 Mark as Completed</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  viewAllBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  viewAllText: { color: "#fff", fontWeight: "600" },
  activeCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activeLabel: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  serviceType: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  customerName: { fontSize: 16, color: "#4B5563", marginBottom: 4 },
  address: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  otpCard: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  otpLabel: { color: "#BFDBFE", fontSize: 13, marginBottom: 6 },
  otpValue: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    letterSpacing: 6,
  },
  otpStatus: { backgroundColor: "#F3F4F6", borderRadius: 8, padding: 10 },
  otpStatusText: { fontSize: 13, color: "#4B5563", textAlign: "center" },
  completeBtn: {
    backgroundColor: "#2563EB",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  completeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  refreshBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  refreshText: { color: "#2563EB", fontWeight: "600", fontSize: 14 },
});
