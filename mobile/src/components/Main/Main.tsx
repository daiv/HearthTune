import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, Library, Playing, Settings } from '@/screens';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { Controls } from '../controls';
import { styles } from './styles';

const screenOptions = { headerShown: false };
const focusColor = (focused: boolean) => focused ? "blue" : "black";
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
export function Main() {
  const Tab = createBottomTabNavigator();
  return <NavigationContainer>
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
}