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

  const totalDuration = queue.map(song => song.duration);
  const formattedTime = totalDuration ? formatTime(totalDuration.reduce((ac, val) => ac + val, 0)) : '0:00';

  const renderFunction = ({ item, index }: { item: Song, index: number }) => {
    return <PlayListItem
      key={item.instanceId}
      song={item}
      index={index}
      isPlaying={activeTrack?.mediaId == item.instanceId
      } />
  }

  return <View style={{ flex: 1 }}>
    <Text>PlayList -{formattedTime}</Text>
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