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
  },
  modalContainer: {
    width: 260,
    alignItems: 'stretch',
  },
  modalTextInput: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    marginBottom: 16,
  },
  modalPlaceHolder: {
    color: "#6b7280"
  }
});
