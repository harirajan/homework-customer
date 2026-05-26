import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const CATEGORY_ICONS = {
  PLUMBER: "🔧",
  ELECTRICIAN: "⚡",
  CARPENTER: "🪚",
  PAINTER: "🎨",
  CLEANER: "🧹",
  GARDENER: "🌱",
  AC_TECHNICIAN: "❄️",
  APPLIANCE_REPAIR: "🔌",
  PEST_CONTROL: "🐛",
  COOK: "👨‍🍳",
  DRIVER: "🚗",
  HANDYMAN: "🛠️",
};

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.log("Error fetching categories:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryPress = (category) => {
    navigation.navigate("SearchWorkers", {
      skill: category.serviceType,
      categoryName: category.displayName,
    });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Text style={styles.categoryIcon}>
        {CATEGORY_ICONS[item.serviceType] || "🔨"}
      </Text>
      <Text style={styles.categoryName}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.fullName?.split(" ")[0]} 👋
          </Text>
          <Text style={styles.subGreeting}>
            What service do you need today?
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("MyBookings")}
          style={styles.bookingsButton}
        >
          <Text style={styles.bookingsButtonText}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  subGreeting: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  logout: {
    fontSize: 14,
    color: "#EF4444",
  },
  loader: {
    marginTop: 40,
  },
  grid: {
    padding: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },
  bookingsButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookingsButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
});
