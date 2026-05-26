import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SearchWorkersScreen from "./src/screens/SearchWorkersScreen";
import WorkerProfileScreen from "./src/screens/WorkerProfileScreen";
import CreateBookingScreen from "./src/screens/CreateBookingScreen";
import MyBookingsScreen from "./src/screens/MyBookingsScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import BookingDetailScreen from "./src/screens/BookingDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
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
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookingDetail"
            component={BookingDetailScreen}
            options={{ title: "Booking Detail" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
