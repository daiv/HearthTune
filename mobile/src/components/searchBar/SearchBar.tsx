import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGraphQl } from "@/hooks/";
import { SEARCH_LOCALLY, SEARCH_SONGS } from "@/graphql/queries";
import { Song } from '@/common/types'
import { SearchItem } from "./SearchItem";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { styles } from "./styles";

const renderFunction = ({ item }: { item: Song }) => <SearchItem key={item.instanceId} song={item} />
const mergeSongs = (local: Song[], remote: Song[]): Song[] => {
  const mergedMap = new Map<string, Song>(local.map(s => [s.id, s]));
  remote.forEach(song => {
    if (mergedMap.has(song.id)) {
      const localSong = mergedMap.get(song.id);
      mergedMap.set(song.id, {
        ...localSong,
        ...song,
      });
    } else mergedMap.set(song.id, { ...song });
  });
  return Array.from(mergedMap.values());
}

export function SearchBar() {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: localData, isLoading } = useGraphQl<{ searchLocally: Song[] }, { query: string, limit?: number }>(
    SEARCH_LOCALLY,
    { query: searchQuery },
    { enabled: searchQuery.length > 3 }
  );
  const { data: remoteData } = useGraphQl<{ search: Song[] }, { query: string, limit?: number }>(
    SEARCH_SONGS,
    { query: searchQuery },
    { enabled: searchQuery.length > 3 }
  );

  const songs = useMemo(() => {
    const localSongs = localData?.searchLocally.map(s => ({ ...s, local: true, })) || [];
    const remoteSongs = remoteData?.search || [];
    return mergeSongs(localSongs, remoteSongs);
  }, [localData, remoteData]);

  const handleClick = () => {
    setSearchQuery(input);
    setInput('');
  }

  const showNoResults = !isLoading && songs.length === 0;
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

      {songs && songs.length > 0 ?
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
        showNoResults && (
          <View style={styles.centerContainer}>
            <FontAwesome name="music" size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.noDataText}>Search for your favorite tracks</Text>
          </View>

        )
      }

    </View>
  )
}
