import { useEffect, useState } from "react";
import TrackPlayer, { Capability } from "react-native-track-player";

const MAX_LOGIN_ATTEMPTS = 3;

export function useRNTrackPlayer() {
  const [status, setStatus] = useState<'Loading' | 'Error' | 'Ready'>('Loading');

  useEffect(function setUpTrackPlayer() {
    let isMounted = true;
    const setupPlayer = async (attempts = 0): Promise<boolean> => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          notificationCapabilities: [
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          progressUpdateEventInterval: 1
        });
        setStatus('Ready');
        return true;
      } catch (error) {
        if (error instanceof Error &&
          error.message === 'The player has already been initialized via setupPlayer.')
          return true;

        console.error('Error initilizating track player', error);
        if (attempts < MAX_LOGIN_ATTEMPTS) return await setupPlayer(attempts + 1);
        else return false;
      }
    }
    setupPlayer().then(ready => {
      if (isMounted)
        setStatus(ready ? 'Ready' : 'Error');
    });
    return () => { isMounted = false; }
  }, []);
  return status;
}