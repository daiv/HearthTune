import { Song } from "@/common/types"
import { Text, TouchableOpacity, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePlayListContext } from "@/context/PlayListContext";
import { BlinkingPlay } from "../BlinkingPlay";

export  function PlayListItem({ song, index, isPlaying }: { song: Song, index: number, isPlaying: boolean }) {

  const { removeSongByInstanceId, skipToByInstanceId } = usePlayListContext();
  const minutes = Math.floor(song.duration / 60);
  const seconds = Math.floor(song.duration % 60);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return <View style={{ borderWidth: 1, borderColor: 'black' }}>
    <TouchableOpacity
      onPress={() => {
        skipToByInstanceId(song.instanceId!);
      }}>
      {isPlaying && <BlinkingPlay />}
      <Text>index: {index}</Text>
      <Text>title: {song.title}</Text>
      <Text>duration: {formattedTime}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => removeSongByInstanceId(song.instanceId!)}>
      <FontAwesome name="trash" size={24} color="black" />
    </TouchableOpacity>
  </View>

}