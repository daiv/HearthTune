import { useState } from "react";
import { StyleSheet, ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGraphQl } from "@/hooks/";
import { SEARCH_SONGS } from "@/graphql/queries";
import { Song } from '@/common/types'
import { SearchItem } from "./SearchItem";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const renderFunction = ({ item }: { item: Song }) => <SearchItem key={item.instanceId} song={item} />

export function SearchBar() {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useGraphQl<{ search: Song[] }, { query: string, limit?: number }>(
    SEARCH_SONGS,
    { query: searchQuery },
    { enabled: searchQuery.length > 3 }
  )
  const songs = [... new Map(data?.search?.map(s => [s.id, s]) || []).values()];
  const handleClick = () => {
    setSearchQuery(input);
    setInput('');
  }
  return (
    <View style={styles.container}>
      <View style={styles.searchBarPanel}>
        <View style={styles.inputContainer}>
          <FontAwesome name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            onChangeText={setInput}
            value={input}
            placeholder="Search music..."
            placeholderTextColor={"#94a3b8"}
            returnKeyType="search"
            onSubmitEditing={handleClick}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleClick}
          activeOpacity={0.8}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {isLoading &&
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text>Searching...</Text>
        </View>
      }

      {songs ?
        <View style={{ flex: 1 }}>
          <Text style={styles.resultsCount}>Found {songs.length} results</Text>
          <FlatList<Song>
            data={songs.sort((currentSong, otherSong) => (
              Number(otherSong.local) - (Number(currentSong.local)))
            )}
            keyExtractor={item => item.id}
            renderItem={renderFunction}

            maxToRenderPerBatch={10}
          />
        </View>
        :
        !isLoading && (
          <View style={styles.centerContainer}>
            <FontAwesome name="music" size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.noDataText}>Search for your favorite tracks</Text>
          </View>

        )
      }

    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc', // Fondo general ligeramente gris para que resalten las tarjetas
  },
  searchBarPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
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
    backgroundColor: '#0d9488', // Tu verde corporativo
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
    paddingBottom: 100, // Evita que la barra inferior tape el último resultado
  },
});
