import { Song } from "@/common/types";
import { Alert, FlatList, Text, View } from "react-native";
import { usePlayListContext } from "@/contexts/PlayerContext";
import { useActiveTrack } from "react-native-track-player";
import { PlayListItem } from "./PlayListItem";
import { PlayListControls } from "../PlayListControls";
import { formatTime } from "@/helpers/helpers";

export function PlayList() {
  const activeTrack = useActiveTrack();
  const { queue, enqueueRelatedSong, resetQueue, shuffleQueue } = usePlayListContext();

  const formattedTime: string = formatTime(queue.reduce((acc, song) => acc + (song.duration || 0), 0));
  const renderFunction = ({ item, index }: { item: Song, index: number }) => {
    return <PlayListItem
      key={item.instanceId}
      song={item}
      index={index}
      isPlaying={activeTrack?.mediaId == item.instanceId
      } />
  }

  return <View style={{ flex: 1 }}>
    <Text>Songs:{queue.length}, duration:{formattedTime}</Text>
    <PlayListControls
      showPanel={queue && queue.length > 0}
      enqueueRelatedSong={enqueueRelatedSong}
      resetQueue={resetQueue}
      shuffleQueue={shuffleQueue}
      savePlayList={() => {
        Alert.alert('title', 'message',
          [{ text: 'Cancel' },
          {
            text: 'Ok',
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