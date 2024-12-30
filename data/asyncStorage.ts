// src/data/gameState.ts


import { PlayerResources, Ships } from "@/utils/defaults";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Achievement } from "./achievements";
import { Upgrade } from "./upgrades";

export interface GameState {
    resources: PlayerResources;
    achievements: Achievement[];
    upgrades: Upgrade[];
    ships: Ships;
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
