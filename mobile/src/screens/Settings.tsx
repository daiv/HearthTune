import { AsyncButton } from "@/components";
import { useAuthContext } from "@/contexts/AuthContext";
import { globalStyles } from "@/globalStyles";
import { Text, View } from "react-native";

export function Settings() {
  const { logout } = useAuthContext();
  return <View>
    <AsyncButton
      onPress={logout}
      style={globalStyles.button}>
      <Text style={globalStyles.buttonText}>Logout</Text>
    </AsyncButton>
  </View>
}