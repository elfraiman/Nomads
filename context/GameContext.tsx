import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useAchievements } from "./AchievementsContext";
import { GameState, loadGameState, saveGameState } from "@/data/asyncStorage";
import { useUpgrades } from "./UpgradesContext";




interface Resource {
    current: number;
    max: number;
    efficiency: number; // New field for efficiency multiplier
}

export interface Resources {
    energy: Resource;
    fuel: Resource;
    solarPlasma: Resource;
    darkMatter: Resource;
    frozenHydrogen: Resource;
    alloys: Resource;
    tokens: Resource;
}

interface GameContextType {
    resources: Resources;
    updateResources: (type: keyof Resources, changes: Partial<Resource>) => void;
    repairShip: () => void;
    resetResources: () => void;
    autoEnergyGenerationRate: number; // New property for tracking auto-generation
    setAutoEnergyGenerationRate: React.Dispatch<React.SetStateAction<number>>;
    upgradeReactorStorage: (level: number) => void;
    generateResource: (type: keyof Resources, energyCost: number, output: number, cooldown: number) => void;
    upgradeResourceEfficiency: (type: keyof Resources, increment: number) => void;
}

const initialResources: Resources = {
    energy: { current: 99, max: 100, efficiency: 1 },
    fuel: { current: 0, max: 100, efficiency: 1.8 },
    solarPlasma: { current: 0, max: 100, efficiency: 1.6 },
    darkMatter: { current: 0, max: 100, efficiency: 1.2 },
    frozenHydrogen: { current: 0, max: 100, efficiency: 0.9 },
    alloys: { current: 0, max: 100, efficiency: 0.3 },
    tokens: { current: 0, max: 100, efficiency: 1 },
};


export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [resources, setResources] = useState<Resources>(initialResources);
    const [autoEnergyGenerationRate, setAutoEnergyGenerationRate] = useState(0); // Tracks energy/sec
    const { updateProgressFromResources, updateProgressForUpgrade } = useAchievements();
    const { setAchievementsState, achievementsState } = useAchievements(); // New method to set achievements

    // Load game state on mount
    // I need to refine this to work better with UpgradesContext
    // since theres a circular dependency atm
    //
    useEffect(() => {
        const loadState = async () => {
            const savedState = await loadGameState();
            if (savedState) {
                setResources(savedState.resources);
                setAchievementsState(savedState.achievements);
            }
        };
        loadState();
    }, []);

    // Save game state whenever resources or achievements change
    useEffect(() => {
        const saveState = async () => {
            const savedState = await loadGameState();
            const gameState: GameState = {
                ...savedState,
                resources,
                achievements: achievementsState, // Add achievements from context
            };
            await saveGameState(gameState);
        };
        saveState();
    }, [resources, achievementsState]); // Add dependencies for achievements and upgrades


    // Core operations resource generation
    //
    const generateResource = (
        type: keyof Resources,
        energyCost: number,
        baseOutput: number,
        cooldown: number
    ) => {
        if (resources.energy.current < energyCost) {
            alert("Not enough energy!");
            return;
        }

        // Deduct energy
        updateResources("energy", { current: resources.energy.current - energyCost });

        // Calculate actual output using efficiency multiplier
        const actualOutput = Math.round(baseOutput * resources[type].efficiency);

        // Add resource after cooldown
        setTimeout(() => {
            updateResources(type, {
                current: Math.min(resources[type].max, resources[type].current + actualOutput),
            });
        }, cooldown * 1000); // Cooldown in seconds
    };

    //  `updateResources` to track achievement progress
    // and update resources.
    // Function to update resource properties, including efficiency
    const updateResources = (type: keyof Resources, changes: Partial<Resource>) => {
        setResources((prev) => {
            const updated = {
                ...prev,
                [type]: {
                    ...prev[type],
                    ...changes,
                    current: Math.min(
                        changes.current ?? prev[type].current,
                        changes.max ?? prev[type].max
                    ),
                    max: changes.max ?? prev[type].max,
                    efficiency: changes.efficiency ?? prev[type].efficiency, // Update efficiency
                },
            };

            // Notify the achievements system
            updateProgressFromResources(updated);

            return updated;
        });
    };

    // Repairs the ship (basic example)
    const repairShip = () => {
        if (resources.energy.current >= 20) {
            updateResources("energy", { current: resources.energy.current - 20 });
            updateResources("fuel", { current: resources.fuel.current + 10 });
        } else {
            alert("Not enough energy to repair the ship!");
        }
    };

    // Reset all resources
    const resetResources = () => {
        setResources(initialResources);
    };
    const upgradeReactorStorage = (level: number) => {
        const additionalStoragePerLevel = 100; // Amount of storage increase per level
        const newMaxStorage = resources.energy.max + additionalStoragePerLevel;

        updateResources("energy", { max: Math.round(newMaxStorage) });

        // Track the progress of the reactor storage upgrade
        updateProgressForUpgrade("reactor_storage", level);
    };

    // Function to upgrade efficiency for a resource
    const upgradeResourceEfficiency = (type: keyof Resources, increment: number) => {
        setResources((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                efficiency: prev[type].efficiency + increment, // Increment efficiency
            },
        }));
    };


    // Auto-generate energy based on rate
    useEffect(() => {
        const interval = setInterval(() => {
            if (autoEnergyGenerationRate > 0) {
                updateResources("energy", {
                    current: resources.energy.current + autoEnergyGenerationRate,
                });
            }
        }, 1000); // Generate energy every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, [autoEnergyGenerationRate, resources.energy.current]);

    return (
        <GameContext.Provider
            value={{
                resources,
                updateResources,
                repairShip,
                resetResources,
                autoEnergyGenerationRate,
                setAutoEnergyGenerationRate,
                upgradeReactorStorage,
                generateResource,
                upgradeResourceEfficiency,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
