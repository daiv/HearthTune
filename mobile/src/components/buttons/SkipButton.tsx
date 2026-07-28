import { usePlayListContext } from "@/contexts/PlayerContext";
import { SkipSongFunctionArgs } from "@/types/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";

type SkipButtonProps = {
  to: SkipSongFunctionArgs
}

export function SkipButton({ to }: SkipButtonProps) {
  const { skipSong } = usePlayListContext();
  const action = () => skipSong(to);

  return <TouchableOpacity
    onPress={action}
  >
    {
      to === 'Prev' ?
        <FontAwesome name="step-backward" size={24} color="black" />
        :
        <FontAwesome name="step-forward" size={24} color="black" />
    }

  </TouchableOpacity >



}