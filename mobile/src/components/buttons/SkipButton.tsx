import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import TrackPlayer from "react-native-track-player";

type SkipButtonProps = {
  to: 'prev' | 'next';
}

export function SkipButton({ to }: SkipButtonProps) {

  const action = () => to === 'prev' ? TrackPlayer.skipToPrevious() : TrackPlayer.skipToNext();

  return <TouchableOpacity
    onPress={action}
  >
    {
      to === 'prev' ?
        <FontAwesome name="step-backward" size={24} color="black" />
        :
        <FontAwesome name="step-forward" size={24} color="black" />
    }

  </TouchableOpacity >



}