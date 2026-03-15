import { View } from "react-native";
import Slider from "@react-native-community/slider"
import { useRef } from "react";

type SongProgressProps = {
  duration: number;
  position: number;
}
export default function SongProgressBar({ progression }: { progression: SongProgressProps }) {
  const { position, duration } = progression;
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