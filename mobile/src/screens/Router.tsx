import { useAuthContext } from "@/contexts/AuthContext";
import { Navigation } from '@/navigation/Navigation';
import { Login } from "./Login";
import { ActivityIndicator, Text, View } from "react-native";

export function Router() {
  const { isAuthenticated, isInitializing } = useAuthContext();
  if (isInitializing) return <View>
    <ActivityIndicator />
    <Text>Loading</Text>
  </View>

  return isAuthenticated
    ? <Navigation />
    : <Login />

}