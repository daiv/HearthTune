import { AsyncButton } from "@/components";
import { useAuthContext } from "@/contexts/AuthContext";
import { Text, View } from "react-native";

export function Settings() {
  const { logout } = useAuthContext();
  return <View>
    <Text>settings</Text>
    <AsyncButton
      onPress={logout}>
      <Text>Logout</Text>
    </AsyncButton>
  </View>
}