import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity } from "react-native";
import TrackPlayer from "react-native-track-player";

export function SkiptoNextButton() {
  return <TouchableOpacity
    onPress={() => TrackPlayer.skipToNext()}>
    <FontAwesome name="step-forward" size={54} color="black" />
  </TouchableOpacity>
}