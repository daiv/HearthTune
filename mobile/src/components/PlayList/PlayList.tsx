import { Song } from "@/common/types";
import { Alert, FlatList, Text, View } from "react-native";
import { usePlayListContext } from "@/context/PlayerContext";
import { useActiveTrack } from "react-native-track-player";
import { PlayListItem } from "./PlayListItem";
import { PlayListControls } from "../PlayListControls";

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
    <PlayListControls
      showPanel={queue && queue.length > 0}
      enqueueRelatedSong={enqueueRelatedSong}
      savePlayList={() => {
        Alert.alert('title', 'message',
          [{ text: 'Cancel' },
          {
            text: 'ok',
            onPress: () => { console.log('savePlaylist') }
          }
          ]);
      }
      } />
    <FlatList<Song>
      data={queue}
      keyExtractor={item => item.instanceId!}
      renderItem={renderFunction}
    />
  </View>
}