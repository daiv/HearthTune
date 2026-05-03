import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRNTrackPlayer } from './hooks/useRNTrackPlayer';
import { Router } from './screens/Router';
import { ProviderWrapper } from './providers/ProviderWrapper';

export default function App() {

  const status = useRNTrackPlayer();

  if (status === 'Loading')
    return (<ActivityIndicator />);
  if (status === 'Error')
    return <Text>Error loading app</Text>;
  if (status === 'Ready')
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ProviderWrapper>
          <Router />
        </ProviderWrapper>

      </SafeAreaView>
    )
}
