// src/data/GameStateManager.ts

import { loadGameState, saveGameState } from "@/data/asyncStorage";

export interface GameState {
    resources: Record<string, any>;
    achievements: Record<string, any>;
    upgrades: Record<string, any>;
}

let currentGameState: GameState = {
    resources: {},
    achievements: {},
    upgrades: {},
};

// Save the current state
export const saveCurrentState = async () => {
    await saveGameState(currentGameState as any);
};

// Load the saved state
export const loadCurrentState = async (): Promise<GameState> => {
    const savedState = await loadGameState();
    if (savedState) {
        currentGameState = savedState;
    }
    return currentGameState;
};

// Update part of the state
export const updateState = (key: keyof GameState, value: any) => {
    currentGameState[key] = value;
    saveCurrentState(); // Save whenever a change is made
};

// Get part of the state
export const getState = (key: keyof GameState): any => {
    return currentGameState[key];
};
