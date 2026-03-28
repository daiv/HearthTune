import { Text } from "react-native";
import { useActiveTrack } from "react-native-track-player";

export function SongTitle() {
  const track = useActiveTrack();

  return <Text>{track?.title || 'no title'}</Text>
}