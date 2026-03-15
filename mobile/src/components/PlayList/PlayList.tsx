import { Song } from "@/common/types";
import { FlatList, Text, View } from "react-native";
import PlayListItem from "./PlayListItem";
import { usePlayListContext } from "@/context/PlayListContext";

const renderFunction = ({ item }: { item: Song }) => <PlayListItem key={item.instanceId} song={item} />

export default function PlayList() {

  const { playList } = usePlayListContext();
  return <View style={{ flex: 1 }}>
    <Text>PlayList</Text>
    <FlatList<Song>
      data={playList}
      keyExtractor={item => item.id}
      renderItem={renderFunction}
    />
  </View>
}