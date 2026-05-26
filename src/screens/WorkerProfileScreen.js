import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import api from "../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WorkerProfileScreen({ route, navigation }) {
  const { workerId } = route.params;
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const [workerRes, reviewsRes] = await Promise.all([
          api.get(`/api/workers/${workerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/api/reviews/worker/${workerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (workerRes.data.success) setWorker(workerRes.data.data);
        if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
      } catch (err) {
        console.log("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.centered}>
        <Text>Worker not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {worker.fullName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{worker.fullName}</Text>
          <Text style={styles.area}>{worker.serviceArea}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {worker.averageRating ? worker.averageRating.toFixed(1) : "New"}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {worker.totalJobsCompleted || 0}
              </Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {worker.experienceYears || 0}yr
              </Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <Text style={styles.price}>₹{worker.hourlyRate} / hour</Text>
        </View>

        {/* Bio */}
        {worker.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{worker.bio}</Text>
          </View>
        )}

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsRow}>
            {worker.skills?.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet</Text>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.customerName}</Text>
                  <Text style={styles.reviewRating}>
                    {"⭐".repeat(review.rating)}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate("CreateBooking", {
              workerId: worker.id,
              workerName: worker.fullName,
              hourlyRate: worker.hourlyRate,
            })
          }
        >
          <Text style={styles.bookButtonText}>Book {worker.fullName}</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#2563EB" },
  name: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  area: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    width: "100%",
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#E5E7EB" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  price: { fontSize: 24, fontWeight: "bold", color: "#2563EB" },
  bio: { fontSize: 14, color: "#4B5563", lineHeight: 22 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: { fontSize: 13, color: "#2563EB", fontWeight: "500" },
  noReviews: { fontSize: 14, color: "#9CA3AF" },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewerName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  reviewRating: { fontSize: 12 },
  reviewComment: { fontSize: 13, color: "#4B5563" },
  bookButton: {
    backgroundColor: "#2563EB",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
