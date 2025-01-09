import { GameProvider, useGame } from '@/context/GameContext';
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


function WrappedRootLayout() {
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
  const { isAchievementUnlocked } = useGame(); // Example: `{ exploration: true, droneManagement: false }`


  return (

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
            backgroundColor: colors.background,
            borderBottomWidth: 2,
            borderBottomColor: colors.primary,
            shadowColor: colors.glowEffect,
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 6,
          },
          headerTintColor: colors.textPrimary,
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
        {/* Dashboard is always available */}
        <Drawer.Screen
          name="dashboard"
          component={Dashboard}
          options={{
            title: 'Dashboard',
            drawerIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
          }}
        />

        {/* Conditional rendering for Exploration */}
        {isAchievementUnlocked("build_scanning_drones") ? (
          <Drawer.Screen
            name="explorationStack"
            component={ExplorationStack}
            options={{
              title: 'Exploration',
              drawerIcon: ({ color }) => <Ionicons name="planet-outline" size={24} color={color} />,
            }}
          />
        ) : (
          <Drawer.Screen
            name="explorationLocked"
            component={Dashboard}
            options={{
              title: 'Locked',
              drawerIcon: ({ color }) => <Ionicons name="lock-closed-outline" size={24} color={color} />,
              drawerItemStyle: { backgroundColor: colors.lockedBackground }, // Style for locked items
            }}
          />
        )}

        {/* Conditional rendering for Drone Management */}
        {isAchievementUnlocked("build_mining_drones") ? (
          <Drawer.Screen
            name="droneManagement"
            component={DroneManagement}
            options={{
              title: 'Drone Management',
              drawerIcon: ({ color }) => <Ionicons name="airplane" size={24} color={color} />,
            }}
          />
        ) : (
          <Drawer.Screen
            name="droneManagementLocked"
            component={Dashboard}
            options={{
              title: 'Locked',
              drawerIcon: ({ color }) => <Ionicons name="lock-closed-outline" size={24} color={color} />,
              drawerItemStyle: { backgroundColor: colors.lockedBackground },
            }}
          />
        )}
      </Drawer.Navigator>
    </ThemeProvider>
  );
}


const RootLayout = () => (
  <GameProvider>
    <WrappedRootLayout />
  </GameProvider>
);

export default RootLayout