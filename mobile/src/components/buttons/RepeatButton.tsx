import { usePlayListContext } from '@/contexts/PlayerContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import TrackPlayer, { Event, RepeatMode, useTrackPlayerEvents } from "react-native-track-player";

type RepeatButtonMode =
  'repeat-off' |
  'repeat-once' |
  'repeat-variant' | //Repeat track forever
  'repeat'; //Repeat Queue forever

const modes: RepeatButtonMode[] = ['repeat-off', 'repeat-once', 'repeat-variant', 'repeat'];

export function RepeatButton() {
  const [repeatMode, setRepeatMode] = useState<number>(RepeatMode.Off);
  const repeatOnce = useRef(-1);
  const positionRef = useRef(-1);
  const { pauseAutoQueue } = usePlayListContext();

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], async event => {
    const { position } = event;
    positionRef.current = position;

    if (repeatMode === RepeatMode.Track && repeatOnce.current !== -1) {
      if (repeatOnce.current < 1 || position < repeatOnce.current) {
        repeatOnce.current = -1;
        await changeMode(RepeatMode.Off);
      }
    }
  });

  const changeMode = async (mode?: number) => {
    let newRepeatMode;
    const newMode = mode ?? (repeatMode + 1) % modes.length;
    switch (newMode) {
      case 0: //Off
        repeatOnce.current = -1;
        newRepeatMode = RepeatMode.Off;
        break;
      case 1://once
        repeatOnce.current = positionRef.current;
        newRepeatMode = RepeatMode.Track
        break;
      case 2: //Track
        newRepeatMode = RepeatMode.Track
        repeatOnce.current = -1;
        break;
      case 3: //Queue
        newRepeatMode = RepeatMode.Queue;
        repeatOnce.current = -1;
        break;
      default:
        newRepeatMode = RepeatMode.Off;
    }

    await TrackPlayer.setRepeatMode(newRepeatMode);
    pauseAutoQueue(newRepeatMode !== RepeatMode.Off);
    console.log('mode is', modes[newMode]);
    setRepeatMode(mode => newMode);
  }

  return <TouchableOpacity
    onPress={() => changeMode()}
  >
    <MaterialCommunityIcons name={modes[repeatMode]} size={24} color="black" />
  </TouchableOpacity>

}
