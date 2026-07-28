import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider"
import { useEffect, useState } from "react";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { usePlayListContext } from "@/contexts/PlayerContext";

export function SongProgressBar() {
  const { position, duration } = useProgress();
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [totalTime, setTotalTime] = useState<string>('0:00');

  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(0);

  const { isCurrentTrackLocal } = usePlayListContext();
  const isSlidingEnabled = isCurrentTrackLocal();

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  useEffect(function updateTime() {
    const activePosition = (isSeeking && isSlidingEnabled) ? sliderValue : position;
    setCurrentTime(formatTime(activePosition));
    setTotalTime(formatTime(duration));
  }, [position, duration, sliderValue, isSeeking, isSlidingEnabled]);

  return (
    <View style={style.main}>
      <Text style={style.text}>{currentTime}</Text>
      <Slider
        style={style.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={isSeeking ? sliderValue : position}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#ccc"
        onSlidingStart={() => isSlidingEnabled && setIsSeeking(true)}
        onValueChange={val => {

          if (isSeeking && isSlidingEnabled) setSliderValue(val);
        }}
        onSlidingComplete={async val => {
          if (isSlidingEnabled) {
            try {
              await TrackPlayer.seekTo(val);
            } finally {
              setIsSeeking(false);
            }
          }
        }}
      />
      <Text style={style.text}>{totalTime}</Text>
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