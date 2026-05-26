import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from "react-native";
import api from "../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchWorkersScreen({ route, navigation }) {
  const { skill, categoryName } = route.params;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchWorkers = async (searchArea = "") => {
    setSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const url = searchArea
        ? `/api/workers/search?skill=${skill}&area=${searchArea}`
        : `/api/workers/search?skill=${skill}`;

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setWorkers(response.data.data);
      }
    } catch (err) {
      console.log("Error fetching workers:", err.message);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const renderWorker = ({ item }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() =>
        navigation.navigate("WorkerProfile", { workerId: item.id })
      }
    >
      <View style={styles.workerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.fullName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.fullName}</Text>
          <Text style={styles.workerArea}>{item.serviceArea}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>
              {item.averageRating ? item.averageRating.toFixed(1) : "New"}
            </Text>
            <Text style={styles.reviews}>
              ({item.totalReviews || 0} reviews)
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{item.hourlyRate}</Text>
          <Text style={styles.priceLabel}>/hr</Text>
        </View>
      </View>

      <View style={styles.skillsRow}>
        {item.skills?.slice(0, 3).map((skill) => (
          <View key={skill} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate("WorkerProfile", { workerId: item.id })
        }
      >
        <Text style={styles.bookButtonText}>View Profile & Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by area (e.g. Kozhikode)"
          value={area}
          onChangeText={setArea}
          onSubmitEditing={() => fetchWorkers(area)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => fetchWorkers(area)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading || searching ? (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      ) : workers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No workers found</Text>
          <Text style={styles.emptySubtext}>Try a different area or skill</Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorker}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  searchButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 12,
  },
  workerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  workerArea: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  star: {
    fontSize: 12,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 2,
  },
  reviews: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563EB",
  },
  priceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skillText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
});
