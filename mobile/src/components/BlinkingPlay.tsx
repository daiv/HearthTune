import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { usePlaybackState } from 'react-native-track-player';
export function BlinkingPlay() {
  const [visibility, setVisibility] = useState(true);
  const state = usePlaybackState();
  useEffect(() => {
    if (state.state === 'playing') {
      const interval = setInterval(() => {
        setVisibility(visibility => !visibility);
      }, 750);
      return () => clearInterval(interval);
    } else setVisibility(true);

  }, [state]);

  return <FontAwesome name="play" size={14} color="black" style={{ opacity: visibility ? 1 : 0 }} />
}