import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  searchBarPanel: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 8,
    flexBasis: 0,
  },
  searchButton: {
    flex: 1,
    flexBasis: 0,
  },
  searchItem: {
    borderColor: 'white',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center'
  }
})