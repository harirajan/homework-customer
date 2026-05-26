import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function WorkerHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get("/api/workers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (err) {
      console.log("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.put(
        "/api/workers/availability",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setProfile((prev) => ({ ...prev, available: !prev.available }));
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update availability");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.fullName?.split(" ")[0]} 👷
          </Text>
          <Text style={styles.subGreeting}>Worker Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Availability Toggle */}
      <View style={styles.availabilityCard}>
        <View>
          <Text style={styles.availabilityTitle}>Availability</Text>
          <Text style={styles.availabilitySubtitle}>
            {profile?.available
              ? "You are visible to customers"
              : "You are hidden from customers"}
          </Text>
        </View>
        <Switch
          value={profile?.available || false}
          onValueChange={handleToggleAvailability}
          disabled={toggling}
          trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
          thumbColor={profile?.available ? "#2563EB" : "#9CA3AF"}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ⭐{" "}
            {profile?.averageRating ? profile.averageRating.toFixed(1) : "New"}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {profile?.totalJobsCompleted || 0}
          </Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{profile?.totalEarnings || 0}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>

      {/* KYC Status */}
      {profile?.kycStatus !== "APPROVED" && (
        <View style={styles.kycWarning}>
          <Text style={styles.kycWarningText}>
            ⚠️ KYC Status: {profile?.kycStatus} — Contact admin for approval
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("WorkerBookings")}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>My Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("WorkerActive")}
        >
          <Text style={styles.actionIcon}>🔧</Text>
          <Text style={styles.actionLabel}>Active Job</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("WorkerReviews")}
        >
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionLabel}>My Reviews</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  subGreeting: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  logout: { fontSize: 14, color: "#EF4444" },
  availabilityCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  availabilitySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    maxWidth: 220,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  kycWarning: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  kycWarningText: { fontSize: 13, color: "#D97706" },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
});
