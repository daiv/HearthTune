import { Text, TouchableOpacity } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import TrackPlayer, { usePlaybackState } from "react-native-track-player";
export default function PlayButton() {

  const playBackState = usePlaybackState();

  const handleClick = async () => {
    console.log(playBackState);
    if (playBackState.state === 'playing') {
      TrackPlayer.pause();
      return;
    }
    if (playBackState.state === 'ended')
      await TrackPlayer.skip(0);

    TrackPlayer.play();
  }

  return (
    <>
      <Text>{playBackState.state}</Text>
      <TouchableOpacity
        onPress={handleClick}  >
        {playBackState.state === 'playing' ?
          <FontAwesome name="pause" size={54} color="black" />
          :
          <FontAwesome name="play" size={54} color="black" />
        }
      </TouchableOpacity>
    </>
  );
}