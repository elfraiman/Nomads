// src/data/gameState.ts


import { IAsteroid, IGalaxy, IMainShip, PlayerResources, Ships, IMission } from "@/utils/defaults";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Upgrade } from "./upgrades";
import { IAchievement } from "./achievements";
import { IWeapon } from "./weapons";

export interface GameState {
    mainShip: IMainShip;
    achievements: IAchievement[];
    upgrades: Upgrade[];
    ships: Ships;
    allocatedDrones: {
        mining: Record<string, number>;
    };
    foundAsteroids: IAsteroid[];
    galaxies: IGalaxy[];
    weapons: IWeapon[];
    missions?: IMission[];
    activeMissions?: IMission[];
    missionTimers?: Record<string, number>;
    missionCooldowns?: Record<string, number>;
}

const GAME_STATE_KEY = "GAME_STATE";

// Save the entire game state
export const saveGameState = async (state: GameState) => {
    try {
        const serializedState = JSON.stringify(state);
        await AsyncStorage.setItem(GAME_STATE_KEY, serializedState);
    } catch (error) {
        console.error("Failed to save game state:", error);
    }
};

// Load the entire game state
export const loadGameState = async (): Promise<GameState | null> => {
    try {
        const serializedState = await AsyncStorage.getItem(GAME_STATE_KEY);
        if (!serializedState) return null;
        return JSON.parse(serializedState) as GameState;
    } catch (error) {
        console.error("Failed to load game state:", error);
        return null;
    }
};
