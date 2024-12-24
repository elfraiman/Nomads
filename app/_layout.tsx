import { GameProvider } from '@/context/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from './dashboard';
import Exploration from './exploration';

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
        <Drawer.Navigator
          screenOptions={({ navigation }) => ({
            drawerStyle: {
              backgroundColor: '#222',
              width: 240,
            },
            drawerActiveTintColor: '#fff',
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
              backgroundColor: '#222',
            },
            headerTintColor: '#fff',
            headerTitleAlign: 'center',
            headerTitleStyle: styles.headerTitle,
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
        </Drawer.Navigator>
      </ThemeProvider>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
