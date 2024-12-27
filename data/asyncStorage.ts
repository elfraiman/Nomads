// src/data/gameState.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Resources } from "@/context/GameContext";
import { UpgradeState } from "@/context/UpgradesContext";
import { Achievement } from "./achievements";

export interface GameState {
    resources: Resources;
    achievements: Achievement[];
    upgrades?: Record<string, UpgradeState>;
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
