import { useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGraphQl } from "../../hooks/useGraphql";
import { SEARCH_SONGS } from "../../graphql/queries";
import { Song } from '@/common/types'
import { styles } from "./styles";
import { globalStyles } from "@/globalStyles";
import SearchItem from "./SearchItem";

const renderFunction = ({ item }: { item: Song }) => <SearchItem key={item.instanceId} song={item} />

export default function SearchBar() {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useGraphQl<{ search: Song[] }, { query: string, limit?: number }>(
    SEARCH_SONGS,
    { query: searchQuery },
    { enabled: searchQuery.length > 3 }
  )
  const handleClick = () => {
    setSearchQuery(input);
    setInput('');
  }

  return (
    <View style={{ flex: 1, padding: 5 }}>
      <View style={styles.searchBarPanel}>
        <TextInput style={styles.searchInput}
          onChangeText={setInput}
          value={input}
          placeholder="Search music" />
        <TouchableOpacity style={globalStyles.button} onPress={handleClick}>
          <Text style={globalStyles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {isLoading &&
        <View>
          <ActivityIndicator />
          <Text>Searching</Text>
        </View>}
      {data?.search ?
        <View>
          <Text>found {data.search.length}</Text>
          <FlatList<Song>
            data={data.search.sort((currentSong, otherSong) => (
              Number(otherSong.local) - (Number(currentSong.local)))
            )}
            keyExtractor={item => item.id}
            renderItem={renderFunction}

            maxToRenderPerBatch={10}
          />
        </View>
        :
        !isLoading && <Text>no data yet</Text>
      }

    </View>
  )
}