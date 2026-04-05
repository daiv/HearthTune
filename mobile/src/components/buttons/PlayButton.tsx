import { Text, TouchableOpacity, View } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import TrackPlayer, { State, usePlaybackState } from "react-native-track-player";
export function PlayButton() {

  const playBackState = usePlaybackState();
  const color = "black";

  const handleClick = async () => {
    console.log(playBackState);
    const state = playBackState.state;
    const isPlaying = state === State.Playing;
    if (isPlaying) {
      TrackPlayer.pause();
    } else {
      if (state === State.Ended) await TrackPlayer.skip(0);
      TrackPlayer.play();
    }
  }

  return (
    <View>
      <Text>{playBackState.state}</Text>
      <TouchableOpacity
        onPress={handleClick}  >
        <FontAwesome name={playBackState.state === State.Playing ? "pause" : "play"} size={24} color={color} />
      </TouchableOpacity>
    </View>
  );
}