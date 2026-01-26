import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGraphQl } from "../hooks/useGraphql";
import { SEARCH_SONGS } from "../graphql/queries";
import { Song } from '@/common/types'


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
    <View>
      <TextInput
        onChangeText={setInput}
        value={input}
        placeholder="Search music" />
      <TouchableOpacity onPress={handleClick}>
        <Text>SendButton</Text>
      </TouchableOpacity>
      {isLoading ?
        <View>
          <ActivityIndicator />
          <Text>Searching</Text>
        </View>
        : data ?
          data?.search.map((a: Song) => <Text key={a.id}>{a.title}</Text>)
          :
          <Text>no data yet</Text>
      }

    </View>
  )
}