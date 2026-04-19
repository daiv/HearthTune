import { useEffect, useState } from 'react';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PlayerProvider } from './context/PlayerContext';
import { Controls } from './components';
import { Home, Library, Playing, Settings } from './screens';
import { styles } from './styles';

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

  const screenOptions = { headerShown: false };
  const SIZE = 24;
  const screens: { name: string, component: React.FC, tabBarIcon: ({ focused }: { focused: boolean }) => React.JSX.Element }[] =
    [
      {
        name: 'Home',
        component: Home,
        tabBarIcon: ({ focused }) => <AntDesign name="home" size={SIZE} color={focusColor(focused)} />
      },
      {
        name: 'Playing',
        component: Playing,
        tabBarIcon: ({ focused }) => <AntDesign name="unordered-list" size={SIZE} color={focusColor(focused)} />
      },
      {
        name: 'Library',
        component: Library,
        tabBarIcon: ({ focused }) => <MaterialIcons name="library-music" size={SIZE} color={focusColor(focused)} />
      },
      {
        name: 'Settings',
        component: Settings,
        tabBarIcon: ({ focused }) => <Ionicons name="settings" size={SIZE} color={focusColor(focused)} />
      }
    ];

  const Tab = createBottomTabNavigator();

  const queryclient = new QueryClient();
  const focusColor = (focused: boolean) => focused ? "blue" : "black";
  return (
    <QueryClientProvider client={queryclient}>

      <SafeAreaView style={{ flex: 1 }}>
        {
          status === 'Error' ? <Text>Error initializating player</Text>
            :
            status === 'Ready' ?
              <PlayerProvider>
                <NavigationContainer>
                  <Tab.Navigator screenOptions={screenOptions}
                    screenLayout={({ children }) => (
                      <View style={styles.screens}>{children}</View>
                    )}
                  >
                    {screens.map(screen => {
                      return <Tab.Screen
                        name={screen.name}
                        component={screen.component}
                        options={{ tabBarIcon: screen.tabBarIcon }}
                      ></Tab.Screen>
                    })}
                  </Tab.Navigator>
                  <View style={styles.floatingControls}>
                    <Controls />
                  </View>
                </NavigationContainer>
              </PlayerProvider>

              : <View>
                <ActivityIndicator />
                <Text>Loading</Text>
              </View>
        }
      </SafeAreaView>
    </QueryClientProvider >
  )
}
