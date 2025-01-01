import { GameProvider } from '@/context/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import Dashboard from './dashboard';
import Exploration from './exploration';
import DroneManagement from './dronemanagment';

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

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
              backgroundColor: '#222',
              width: 240,
            },
            drawerActiveTintColor: '#FFD93D',
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
              backgroundColor: '#111', // Darker background for the header
              borderBottomWidth: 2,
              borderBottomColor: '#FFD93D', // Futuristic border glow
              shadowColor: '#FFD93D',
              shadowOpacity: 0.8,
              shadowRadius: 15,
              elevation: 10,
            },
            headerTintColor: '#FFD93D', // Futuristic cyan color
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: 'bold',
              color: '#FFD93D',
              textTransform: 'uppercase',
              letterSpacing: 2,
              textShadowColor: '#FFD93D',
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
            name="exploration"
            component={Exploration}
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
        </Drawer.Navigator>
      </ThemeProvider>
    </GameProvider >
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
