import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SearchWorkersScreen from "./src/screens/SearchWorkersScreen";
import WorkerProfileScreen from "./src/screens/WorkerProfileScreen";
import CreateBookingScreen from "./src/screens/CreateBookingScreen";
import MyBookingsScreen from "./src/screens/MyBookingsScreen";
import BookingDetailScreen from "./src/screens/BookingDetailScreen";
import WorkerHomeScreen from "./src/screens/WorkerHomeScreen";
import WorkerBookingsScreen from "./src/screens/WorkerBookingsScreen";
import WorkerBookingDetailScreen from "./src/screens/WorkerBookingDetailScreen";
import WorkerActiveJobScreen from "./src/screens/WorkerActiveJobScreen";
import ReviewScreen from "./src/screens/ReviewScreen";
import WorkerReviewsScreen from "./src/screens/WorkerReviewsScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator initialRouteName="Login">
      {/* Auth screens — always accessible */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />

      {/* Customer screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchWorkers"
        component={SearchWorkersScreen}
        options={{ title: "Find Workers" }}
      />
      <Stack.Screen
        name="WorkerProfile"
        component={WorkerProfileScreen}
        options={{ title: "Worker Profile" }}
      />
      <Stack.Screen
        name="CreateBooking"
        component={CreateBookingScreen}
        options={{ title: "Create Booking" }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: "My Bookings" }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: "Booking Detail" }}
      />

      {/* Worker screens */}
      <Stack.Screen
        name="WorkerHome"
        component={WorkerHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkerBookings"
        component={WorkerBookingsScreen}
        options={{ title: "My Jobs" }}
      />
      <Stack.Screen
        name="WorkerBookingDetail"
        component={WorkerBookingDetailScreen}
        options={{ title: "Job Detail" }}
      />
      <Stack.Screen
        name="WorkerActive"
        component={WorkerActiveJobScreen}
        options={{ title: "Active Job" }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: "Leave a Review" }}
      />
      <Stack.Screen
        name="WorkerReviews"
        component={WorkerReviewsScreen}
        options={{ title: "My Reviews" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
