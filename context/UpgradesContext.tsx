import { loadGameState, saveGameState } from "@/data/asyncStorage";
import upgrades, { UpgradeCost } from "@/data/upgrades";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContext";

// Define the shape of an upgrade's state
export interface UpgradeState {
    level: number;
    costs: UpgradeCost[]; // Costs required for each level of the upgrade
}

// Define the context for managing upgrades
interface UpgradesContextType {
    upgradesState: Record<string, UpgradeState>; // Tracks the state of all upgrades
    purchaseUpgrade: (id: string) => void; // Function to purchase an upgrade
    downgradeUpgrade: (id: string) => void; // Function to downgrade an upgrade
    setUpgradesState: React.Dispatch<React.SetStateAction<Record<string, UpgradeState>>>; // Function to set the upgrades state
}

// Create the Upgrades context
const UpgradesContext = createContext<UpgradesContextType | undefined>(undefined);

export const UpgradesProvider = ({ children }: { children: ReactNode }) => {
    // Access the GameContext to manage resources and game state
    const gameContext = useContext(GameContext);
    if (!gameContext) {
        throw new Error("UpgradesProvider must be used within a GameProvider");
    }
    const { resources, updateResources, setAutoEnergyGenerationRate, upgradeReactorStorage } = gameContext;

    // Initialize the upgrades state
    const [upgradesState, setUpgradesState] = useState<Record<string, UpgradeState>>(
        upgrades.reduce((state, upgrade) => {
            state[upgrade.id] = {
                level: 0, // Start at level 0 for all upgrades
                costs: upgrade.costs.map((cost) => ({ ...cost })), // Copy the initial costs
            };
            return state;
        }, {} as Record<string, UpgradeState>)
    );


    useEffect(() => {
        const loadState = async () => {
            const savedState = await loadGameState();
            // If `savedState.upgrades` is missing, initialize it with the default state
            if (savedState && Object.keys(savedState.upgrades)) {
                setUpgradesState(savedState.upgrades);
            } else {
                setUpgradesState(
                    upgrades.reduce((state, upgrade) => {
                        state[upgrade.id] = {
                            level: 0,
                            costs: upgrade.costs.map((cost) => ({ ...cost })),
                        };
                        return state;
                    }, {} as Record<string, UpgradeState>)
                );
            }
        };

        loadState();
    }, []);

    useEffect(() => {
        const saveState = async () => {
            const gameState = await loadGameState();

            if (gameState) {
                gameState.upgrades = upgradesState;
                await saveGameState(gameState);
            }
        };

        saveState();
    }, [upgradesState]);


    // Handle upgrades that trigger special effects
    const handleSpecialUpgrades = (id: string, level: number) => {
        if (id === "reactor_storage") {
            upgradeReactorStorage(level); // Increase energy storage
        } else if (id === "reactor_optimization") {
            setAutoEnergyGenerationRate((prev) => prev + 1); // Increase energy generation
        } else if (id === "core_operations_efficiency") {
            // Improve efficiency for multiple resources
            const resourcesToBoost = ["fuel", "solarPlasma", "darkMatter", "alloys", "frozenHydrogen"];
            resourcesToBoost.forEach((resource) =>
                gameContext.upgradeResourceEfficiency(resource as keyof typeof resources, 0.05)
            );
        }
    };

    // Purchase an upgrade
    const purchaseUpgrade = (id: string) => {
        const upgrade = upgrades.find((u) => u.id === id);
        console.log("Upgrade ID:", id);
        console.log("Upgrade:", upgrade, upgradesState);
        if (!upgrade) return;

        const currentUpgrade = upgradesState[id];

        // Check if the player can afford the upgrade
        const canAfford = currentUpgrade.costs.every((cost) => {
            const resource = resources[cost.resourceType];
            return resource && resource.current >= cost.amount;
        });

        if (!canAfford) {
            alert("Not enough resources to purchase this upgrade!");
            return;
        }

        // Deduct the costs from the player's resources
        currentUpgrade.costs.forEach((cost) => {
            updateResources(cost.resourceType, {
                current: resources[cost.resourceType].current - cost.amount,
            });
        });

        // Increment the upgrade level and update the costs for the next level
        const newLevel = currentUpgrade.level + 1;

        setUpgradesState((prevState) => ({
            ...prevState,
            [id]: {
                level: newLevel,
                costs: currentUpgrade.costs.map((cost) => ({
                    ...cost,
                    amount: Math.round(cost.amount * upgrade.baseCostMultiplier), // Increase cost for next level
                })),
            },
        }));

        // Apply special effects for this upgrade
        handleSpecialUpgrades(id, newLevel);
    };

    // Downgrade an upgrade (reduce its level)
    const downgradeUpgrade = (id: string) => {
        const upgrade = upgrades.find((u) => u.id === id);
        if (!upgrade) return;

        const currentUpgrade = upgradesState[id];
        const refundPercentage = 0.2; // Refund 20% of the cost

        if (currentUpgrade.level > 0) {
            // Refund part of the costs
            currentUpgrade.costs.forEach((cost) => {
                const refundAmount = Math.floor(cost.amount * refundPercentage);
                updateResources(cost.resourceType, {
                    current: Math.min(resources[cost.resourceType].max, resources[cost.resourceType].current + refundAmount),
                });
            });

            // Decrease the upgrade level and adjust costs
            setUpgradesState((prevState) => ({
                ...prevState,
                [id]: {
                    level: currentUpgrade.level - 1,
                    costs: currentUpgrade.costs.map((cost) => ({
                        ...cost,
                        amount: Math.floor(cost.amount / upgrade.baseCostMultiplier), // Reduce cost for previous level
                    })),
                },
            }));

            // Revert any special effects caused by the upgrade
            if (id === "reactor_optimization") {
                setAutoEnergyGenerationRate((rate) => rate - 1);
            } else if (id === "core_operations_efficiency") {
                const resourcesToReduce = ["fuel", "solarPlasma", "darkMatter", "alloys", "frozenHydrogen"];
                resourcesToReduce.forEach((resource) =>
                    gameContext.upgradeResourceEfficiency(resource as keyof typeof resources, -0.05)
                );
            }
        } else {
            alert("No upgrades to downgrade!");
        }
    };

    return (
        <UpgradesContext.Provider value={{ upgradesState, purchaseUpgrade, downgradeUpgrade, setUpgradesState }}>
            {children}
        </UpgradesContext.Provider>
    );
};

// Custom hook to use the upgrades context
export const useUpgrades = () => {
    const context = useContext(UpgradesContext);
    if (!context) {
        throw new Error("useUpgrades must be used within an UpgradesProvider");
    }
    return context;
};
