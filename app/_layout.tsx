import { GameProvider, useGame } from '@/context/GameContext';
import colors from '@/utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState, useContext } from 'react';
import { StatusBar, TouchableOpacity, Platform } from 'react-native';
import CombatPage from './combatPage';
import Dashboard from './dashboard';
import Exploration from './exploration';
import WeaponManagementPage from './weaponsManagmentPage';
import React from 'react';
import DroneManagement from './droneManagment';
import { Slot } from "expo-router";
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="black"
      />
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          drawerStyle: {
            backgroundColor: colors.background,
            width: 240,
            borderRightWidth: 1,
            borderColor: colors.border,
          },
          drawerActiveTintColor: colors.glowEffect,
          drawerInactiveTintColor: colors.textSecondary,
          headerLeft: () => (
            <TouchableOpacity
              style={[
                styles.menuButton,
                { marginLeft: Platform.OS === 'ios' ? 16 : 8 }
              ]}
              onPress={() => navigation.toggleDrawer()}
            >
              <Ionicons
                name="menu-outline"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.background,
            height: Platform.OS === 'ios' ? 44 : 60,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            shadowColor: colors.glowEffect,
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          },
          headerTitleContainerStyle: {
            left: Platform.OS === 'ios' ? 0 : 0,
          },
          headerLeftContainerStyle: {
            paddingTop: 0,
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: 1,
          },
          headerTitleAlign: 'center',
          headerTintColor: colors.textPrimary,
          headerMode: 'float',
          headerStatusBarHeight: 0,
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
      </Drawer.Navigator>
    </SafeAreaView>
  );
}


const RootLayout = () => {

  return (
    <GameProvider>
      <WrappedRootLayout />
    </GameProvider>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    borderRadius: 4,
  },
  menuButtonGradient: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(73, 143, 225, 0.3)',
  },
});

export default RootLayout