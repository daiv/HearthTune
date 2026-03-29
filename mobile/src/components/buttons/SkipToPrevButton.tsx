import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity } from "react-native";
import TrackPlayer from "react-native-track-player";

export  function SkiptoPrevButton() {
  return <TouchableOpacity
    onPress={() => TrackPlayer.skipToPrevious()}>
    <FontAwesome name="step-backward" size={24} color="black" />
  </TouchableOpacity>
}