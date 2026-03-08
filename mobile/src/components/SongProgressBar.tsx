import { Text, View } from "react-native";
import Slider from "@react-native-community/slider"
import { useProgress } from "react-native-track-player";
export default function SongProgressBar() {
  const { position, duration, buffered } = useProgress();

  return (
    <View>
      <Slider
        minimumValue={0}
        maximumValue={duration}
        value={position}
      />
    </View>
  );
}