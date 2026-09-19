import { useAuthContext } from "@/contexts/AuthContext";
import { Text, View } from "react-native";

export function Salute() {
  const { nick } = useAuthContext();
  return <View><Text>Hello {nick}</Text></View>
}