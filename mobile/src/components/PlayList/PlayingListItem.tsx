import { Song } from "@/common/types"
import { Text, TouchableOpacity, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePlayListContext } from "@/context/PlayerContext";
import { BlinkingPlayButton } from "../buttons/BlinkingPlayButton";
import { formatTime } from "@/helpers/helpers";

export function PlayingListItem({ song, index, isPlaying }: { song: Song, index: number, isPlaying: boolean }) {

  const { dequeue, skipToByInstanceId } = usePlayListContext();
  const formattedTime = formatTime(song.duration);
  return <View style={{ borderWidth: 1, borderColor: 'black' }}>
    <TouchableOpacity
      onPress={() => {
        skipToByInstanceId(song.instanceId!);
      }}>
      {isPlaying && <BlinkingPlayButton />}
      <Text>index: {index}</Text>
      <Text>title: {song.title}</Text>
      <Text>duration: {formattedTime}</Text>
      <Text>source: {song.source}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => dequeue(song.instanceId!)}>
      <FontAwesome name="trash" size={24} color="black" />
    </TouchableOpacity>
  </View>

}