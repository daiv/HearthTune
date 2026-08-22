import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingControls: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  screens: {
    margin: 5,
    flex: 1,
    marginBottom: 185,
  }
});