import { Song } from "@/common/types";
import { FlatList, Text, View } from "react-native";
import PlayListItem from "./PlayListItem";
import { usePlayListContext } from "@/context/PlayListContext";
import { useActiveTrack, usePlaybackState } from "react-native-track-player";

export default function PlayList() {
  const activeTrack = useActiveTrack();
  const { playList } = usePlayListContext();

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
      data={playList}
      keyExtractor={item => item.instanceId!}
      renderItem={renderFunction}
    />
  </View>
}