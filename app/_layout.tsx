import { GameProvider } from '@/context/GameContext';
import colors from '@/utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import CombatPage from './combatPage';
import Dashboard from './dashboard';
import DroneManagement from './dronemanagment';
import Exploration from './exploration';

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function ExplorationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide headers for a seamless transition
      }}
    >
      <Stack.Screen name="Exploration" component={Exploration} />
      <Stack.Screen name="CombatPage" component={CombatPage} />
    </Stack.Navigator>
  );
}


export default function RootLayout() {
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // Redirect to `/dashboard` when app loads
      router.replace('/dashboard');
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GameProvider>
      <ThemeProvider value={DarkTheme}>
        <StatusBar
          barStyle="light-content" // Options: "light-content", "dark-content"
          backgroundColor="black" // Android-specific
        />
        <Drawer.Navigator
          screenOptions={({ navigation }) => ({
            drawerStyle: {
              backgroundColor: colors.background,
              width: 240,
            },
            drawerActiveTintColor: colors.primary,
            drawerInactiveTintColor: '#ccc',
            headerLeft: () => (
              <Ionicons
                name="menu-outline"
                size={24}
                color="#fff"
                style={{ marginLeft: 10 }}
                onPress={() => navigation.toggleDrawer()}
              />
            ),
            headerStyle: {
              backgroundColor: colors.background, // Darker background for the header
              borderBottomWidth: 2,
              borderBottomColor: colors.primary, // Futuristic border glow
              shadowColor: colors.glowEffect,
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 6,
            },
            headerTintColor: colors.textPrimary, // Futuristic cyan color
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.textPrimary,
              textTransform: 'uppercase',
              letterSpacing: 2,
              textShadowColor: colors.glowEffect,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            },
          })}
        >
          <Drawer.Screen
            name="dashboard"
            component={Dashboard}
            options={{
              title: 'Dashboard',
              drawerIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
            }}
          />
          <Drawer.Screen
            name="explorationStack"
            component={ExplorationStack} // Use the stack for Exploration and Combat
            options={{
              title: 'Exploration',
              drawerIcon: ({ color }) => <Ionicons name="planet-outline" size={24} color={color} />,
            }}
          />
          <Drawer.Screen
            name="droneManagement"
            component={DroneManagement}
            options={{
              title: 'Drone Management',
              drawerIcon: ({ color }) => <Ionicons name="airplane" size={24} color={color} />,
            }}
          />
          <Stack.Screen name="CombatPage" component={CombatPage} />
        </Drawer.Navigator>
      </ThemeProvider>
    </GameProvider >
  );
}
