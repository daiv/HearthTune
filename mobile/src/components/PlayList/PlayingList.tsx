import { Song } from "@/common/types";
import { Alert, FlatList, Text, View } from "react-native";
import { usePlayListContext } from "@/context/PlayerContext";
import { useActiveTrack } from "react-native-track-player";
import { PlayingListItem } from "./PlayingListItem";
import { PlayListControls } from "../PlayListControls";
import { formatTime } from "@/helpers/helpers";

export function PlayList() {
  const activeTrack = useActiveTrack();
  const { queue, enqueueRelatedSong } = usePlayListContext();

  const totalDuration = queue.map(song => song.duration);
  const formattedTime = totalDuration ? formatTime(totalDuration.reduce((ac, val) => ac + val, 0)) : '0:00';

  const renderFunction = ({ item, index }: { item: Song, index: number }) => {
    return <PlayingListItem
      key={item.instanceId}
      song={item}
      index={index}
      isPlaying={activeTrack?.mediaId == item.instanceId
      } />
  }

  return <View style={{ flex: 1, margin: 10 }}>
    <Text>PlayList -{formattedTime}</Text>
    <PlayListControls
      showPanel={queue && queue.length > 0}
      enqueueRelatedSong={enqueueRelatedSong}
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