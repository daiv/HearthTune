import { useEffect, useState } from 'react';
import { Main } from './screens/Main';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const MAX_LOGIN_ATTEMPTS = 3;
export default function App() {
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
            Capability.Stop,
          ],
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
  const queryclient = new QueryClient();
  return (
    <QueryClientProvider client={queryclient}>

      <SafeAreaView>
        {
          status === 'Error' ? <Text>Error initializating player</Text>
            :
            status === 'Ready' ?
              <Main />
              : <View>
                <ActivityIndicator />
                <Text>Loading</Text>
              </View>
        }
      </SafeAreaView>
    </QueryClientProvider >
  )
}
