import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider"
import { useEffect, useState } from "react";
import { useProgress } from "react-native-track-player";

export function SongProgressBar() {
  const { position, duration } = useProgress();
  const [time, setTime] = useState<string>('0:00');

  useEffect(() => {
    const minutes = Math.floor(position / 60);
    const seconds = Math.floor(position % 60);
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    setTime(formatted);
  }, [position]);

  return (
    <View style={style.main}>
      <Slider
        style={style.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
      />
      <Text style={style.text}>{time}</Text>
    </View>
  );
}
const style = StyleSheet.create({
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  text: {
    color: 'black',
    fontFamily: 'monospace',
    marginLeft: 10,
    minWidth: 45,
  },
});