import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  searchBarPanel: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },

  searchItem: {
    borderColor: 'white',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    height: '100%',
  },
  searchButton: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 4,
  },
  noDataText: {
    color: '#64748b',
    fontSize: 15,
  },
  listContainer: {
    paddingBottom: 100,
  },
    card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duration: {
    fontSize: 13,
    color: '#64748b',
  },
  source: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionIcon: {
    paddingLeft: 8,
  },
})