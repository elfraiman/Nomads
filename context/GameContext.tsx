import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useAchievements } from "./AchievementsContext";




interface Resource {
    current: number;
    max: number;
    efficiency: number; // New field for efficiency multiplier
}

interface Resources {
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
    upgradeReactorStorage: () => void;
    generateResource: (type: keyof Resources, energyCost: number, output: number, cooldown: number) => void;
    upgradeResourceEfficiency: (type: keyof Resources, increment: number) => void;
}

const initialResources: Resources = {
    energy: { current: 99, max: 100, efficiency: 1 },
    fuel: { current: 0, max: 100, efficiency: 1 },
    solarPlasma: { current: 0, max: 100, efficiency: 1 },
    darkMatter: { current: 0, max: 100, efficiency: 1 },
    frozenHydrogen: { current: 0, max: 100, efficiency: 1 },
    alloys: { current: 0, max: 100, efficiency: 1 },
    tokens: { current: 0, max: 100, efficiency: 1 },
};


export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [resources, setResources] = useState<Resources>(initialResources);
    const [autoEnergyGenerationRate, setAutoEnergyGenerationRate] = useState(0); // Tracks energy/sec
    const { updateProgressFromResources } = useAchievements();



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

    const upgradeReactorStorage = () => {
        updateResources("energy", { max: Math.round((resources.energy.max + 100)) });
    }
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
