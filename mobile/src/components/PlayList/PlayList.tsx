import { Song } from "@/common/types";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { usePlayListContext } from "@/context/PlayerContext";
import { useActiveTrack } from "react-native-track-player";
import { PlayListItem } from "./PlayListItem";

export function PlayList() {
  const activeTrack = useActiveTrack();
  const { queue, enqueueRelatedSong } = usePlayListContext();

  const renderFunction = ({ item, index }: { item: Song, index: number }) => {
    return <PlayListItem
      key={item.instanceId}
      song={item}
      index={index}
      isPlaying={activeTrack?.mediaId == item.instanceId
      } />
  }

  return <View style={{ flex: 1, margin: 10 }}>
    <Text>PlayList</Text>
    <TouchableOpacity
      style={{ borderColor: 'black', borderWidth: 1, width: 100, backgroundColor: "#1c91b4" }}
      onPress={() => enqueueRelatedSong()}
    >
      <Text>Add related</Text>
    </TouchableOpacity>
    <FlatList<Song>
      data={queue}
      keyExtractor={item => item.instanceId!}
      renderItem={renderFunction}
    />
  </View>
}