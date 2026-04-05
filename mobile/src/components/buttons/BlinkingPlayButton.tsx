import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { State, usePlaybackState } from 'react-native-track-player';
export function BlinkingPlayButton() {
  const [visibility, setVisibility] = useState(true);
  const state = usePlaybackState();
  useEffect(() => {
    if (state.state === State.Playing) {
      const interval = setInterval(() => {
        setVisibility(visibility => !visibility);
      }, 750);
      return () => clearInterval(interval);
    } else setVisibility(true);

  }, [state]);

  return <FontAwesome name="play" size={14} color="black" style={{ opacity: visibility ? 1 : 0 }} />
}