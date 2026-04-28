import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRNTrackPlayer } from './hooks/useRNTrackPlayer';
import { Auth } from './screens';
import { ProviderWrapper } from './providers/ProviderWrapper';

export default function App() {

  const status = useRNTrackPlayer();
  const screens = {
    Loading: <ActivityIndicator />,
    Error: <Text>Error loading app</Text>,
    Ready: <Auth />
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProviderWrapper>
        {screens[status]}
      </ProviderWrapper>

    </SafeAreaView>
  )
}
