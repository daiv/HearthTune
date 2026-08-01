import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  spacer: { flex: 1 },
  button: {
    padding: 10,
    backgroundColor: "#207e85",
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',

  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});
