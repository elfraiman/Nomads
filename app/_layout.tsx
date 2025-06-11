import { GameProvider, useGame } from '@/context/GameContext';
import colors from '@/utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CombatPage from './combatPage';
import Dashboard from './dashboard';
import DroneManagement from './dronemanagment';
import Exploration from './exploration';
import WeaponManagementPage from './weaponsManagmentPage';
import MissionsPage from './missions';

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

function DevResetScreen() {
  const { devResetWithCompletedAchievements } = useGame();
  const router = useRouter();

  useEffect(() => {
    // Execute reset when component mounts
    devResetWithCompletedAchievements();
    
    // Navigate back to dashboard after reset
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 100);

    return () => clearTimeout(timer);
  }, [devResetWithCompletedAchievements, router]);

  return (
    <View style={styles.devResetContainer}>
      <Text style={styles.devResetText}>🔧 Resetting game state...</Text>
      <Text style={styles.devResetSubtext}>All achievements completed, 100k resources added</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  devResetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  devResetText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  devResetSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

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
  const { isAchievementUnlocked, isDevMode, devResetWithCompletedAchievements } = useGame(); // Example: `{ exploration: true, droneManagement: false }`


  return (
    <>
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

        {/* Conditional rendering for Drone Management */}
        {isAchievementUnlocked("build_mining_drones") ? (
          <Drawer.Screen
            name="weaponsManagement"
            component={WeaponManagementPage}
            options={{
              title: 'Weapons Management',
              drawerIcon: ({ color }) => <Ionicons name="rocket-outline" size={24} color={color} />,
            }}
          />
        ) : (
          <Drawer.Screen
            name="weaponsManagementLocked"
            component={WeaponManagementPage}
            options={{
              title: 'Locked',
              drawerIcon: ({ color }) => <Ionicons name="lock-closed-outline" size={24} color={color} />,
              drawerItemStyle: { backgroundColor: colors.lockedBackground },
            }}
          />
        )}

        {/* Conditional rendering for Missions */}
        {isAchievementUnlocked("build_mining_drones") ? (
          <Drawer.Screen
            name="missions"
            component={MissionsPage}
            options={{
              title: 'Missions',
              drawerIcon: ({ color }) => <Ionicons name="rocket-outline" size={24} color={color} />,
            }}
          />
        ) : (
          <Drawer.Screen
            name="missionsLocked"
            component={MissionsPage}
            options={{
              title: 'Locked',
              drawerIcon: ({ color }) => <Ionicons name="lock-closed-outline" size={24} color={color} />,
              drawerItemStyle: { backgroundColor: colors.lockedBackground },
            }}
          />
        )}

        {/* Dev Mode Button - Only show in dev mode */}
        {__DEV__ && isDevMode && (
          <Drawer.Screen
            name="devReset"
            component={DevResetScreen}
            options={{
              title: '🔧 DEV: Reset + Complete All',
              drawerIcon: ({ color }) => <Ionicons name="refresh-outline" size={24} color={color} />,
              drawerItemStyle: { backgroundColor: '#ff4444' }, // Red background for dev button
            }}
          />
        )}
      </Drawer.Navigator>
    </>
  );
}


const RootLayout = () => (

  <ThemeProvider value={DarkTheme}>
    <GameProvider>
      <WrappedRootLayout />
    </GameProvider>
  </ThemeProvider>
);

export default RootLayout