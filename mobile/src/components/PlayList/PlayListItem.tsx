import { Song } from "@/common/types"
import { Text, TouchableOpacity, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePlayListContext } from "@/context/PlayListContext";
export default function PlayListItem({ song }: { song: Song }) {

  const { removeSongByInstanceId } = usePlayListContext();

  return <View>
    <Text>{song.title}</Text>
    <TouchableOpacity
      onPress={() => removeSongByInstanceId(song.instanceId!)}>
      <FontAwesome name="trash" size={24} color="black" />
    </TouchableOpacity>
  </View>

}