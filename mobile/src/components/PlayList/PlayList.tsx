import { Song } from "@/common/types";
import { FlatList, Text, View } from "react-native";
import { usePlayListContext } from "@/context/PlayerContext";
import { useActiveTrack } from "react-native-track-player";
import { PlayListItem } from "./PlayListItem";

export function PlayList() {
  const activeTrack = useActiveTrack();
  const { queue } = usePlayListContext();

  const renderFunction = ({ item, index }: { item: Song, index: number }) => {
    return <PlayListItem
      key={item.instanceId}
      song={item}
      index={index}
      isPlaying={activeTrack?.mediaId == item.instanceId
      } />
  }

  return <View style={{ flex: 1 }}>
    <Text>PlayList</Text>
    <FlatList<Song>
      data={queue}
      keyExtractor={item => item.instanceId!}
      renderItem={renderFunction}
    />
  </View>
}