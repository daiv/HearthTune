import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "./Button";
import { Text } from "react-native";
import { globalStyles } from "@/globalStyles";

export function LogoutButton() {
  const { logout } = useAuthContext();
  return <Button onPress={logout}
    style={globalStyles.button}>
    <Text style={globalStyles.buttonText}>Logout</Text>
  </Button>

}