import upgrades, { UpgradeCost } from "@/data/upgrades";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { GameContext } from "./GameContext";

interface UpgradeState {
    level: number;
    costs: UpgradeCost[]; // Change 'cost' to 'costs' and use an array for multiple costs
}

interface UpgradesContextType {
    upgradesState: Record<string, UpgradeState>;
    purchaseUpgrade: (id: string) => void;
    downgradeUpgrade: (id: string) => void;
}

const UpgradesContext = createContext<UpgradesContextType | undefined>(undefined);

export const UpgradesProvider = ({ children }: { children: ReactNode }) => {
    const gameContext = useContext(GameContext); // Access GameContext safely

    if (!gameContext) {
        throw new Error("UpgradesProvider must be used within a GameProvider");
    }

    const { resources, updateResources, setAutoEnergyGenerationRate, upgradeReactorStorage } = gameContext;

    const [upgradesState, setUpgradesState] = useState<Record<string, UpgradeState>>(
        upgrades.reduce((acc, upgrade) => {
            acc[upgrade.id] = {
                level: 0,
                costs: upgrade.costs.map((cost) => ({ ...cost })) // Copy the costs array
            };
            return acc;
        }, {} as Record<string, UpgradeState>)
    );


    const handleSpecialUpgrades = (id: string) => {
        switch (id) {
            case "reactor_optimization":
                setAutoEnergyGenerationRate((prev: number) => prev + 1); // Add 1 energy/sec per level
                break;
            case "reactor_storage":
                upgradeReactorStorage(); // Handles increasing storage
                break;
            case "core_operations_efficiency":
                gameContext.upgradeResourceEfficiency("fuel", 0.05);
                gameContext.upgradeResourceEfficiency("solarPlasma", 0.05);
                gameContext.upgradeResourceEfficiency("darkMatter", 0.05);
                gameContext.upgradeResourceEfficiency("alloys", 0.05);
                gameContext.upgradeResourceEfficiency("frozenHydrogen", 0.05);
                break;
            default:
                break;
        }
    };

    const purchaseUpgrade = (id: string) => {
        const upgrade = upgrades.find((u) => u.id === id);
        if (!upgrade) return;

        const currentUpgrade = upgradesState[id] || { level: 0, costs: upgrade.costs };

        // Check if all resources are sufficient
        const canAfford = currentUpgrade.costs.every((cost) => {
            const resource = resources[cost.resourceType];
            return resource && resource.current >= cost.amount;
        });

        if (!canAfford) {
            alert("Not enough resources to purchase this upgrade!");
            return;
        }

        // Deduct all resources
        currentUpgrade.costs.forEach((cost) => {
            updateResources(cost.resourceType, {
                current: resources[cost.resourceType].current - cost.amount,
            });
        });

        // Update upgrade state
        setUpgradesState((prev) => ({
            ...prev,
            [id]: {
                level: currentUpgrade.level + 1,
                costs: currentUpgrade.costs.map((cost) => ({
                    ...cost,
                    amount: Math.round(cost.amount * upgrade.baseCostMultiplier),
                })),
            },
        }));

        // Handle special upgrades
        handleSpecialUpgrades(id);
    };


    const downgradeUpgrade = (id: string) => {
        const upgrade = upgrades.find((u) => u.id === id);
        if (!upgrade) return;

        const refundPercentage = 0.2; // 20% refund
        const currentUpgrade = upgradesState[id];

        if (currentUpgrade.level > 0) {
            // Refund a percentage of each resource cost
            currentUpgrade.costs.forEach((cost) => {
                const refundAmount = Math.floor(cost.amount * refundPercentage);
                updateResources(cost.resourceType, {
                    current: Math.min(resources[cost.resourceType].max, resources[cost.resourceType].current + refundAmount),
                });
            });

            // Update upgrade state
            const previousCosts = currentUpgrade.costs.map((cost) => ({
                ...cost,
                amount: Math.floor(cost.amount / (upgrade.baseCostMultiplier || 1.25)),
            }));

            setUpgradesState((prev) => ({
                ...prev,
                [id]: {
                    level: currentUpgrade.level - 1,
                    costs: previousCosts,
                },
            }));

            // Handle special downgrade cases
            switch (id) {
                case "reactor_optimization":
                    setAutoEnergyGenerationRate((prev: number) => prev - 1);
                    break;
                case "core_operations_efficiency":
                    gameContext.upgradeResourceEfficiency("fuel", -0.05);
                    gameContext.upgradeResourceEfficiency("solarPlasma", -0.05);
                    gameContext.upgradeResourceEfficiency("darkMatter", -0.05);
                    gameContext.upgradeResourceEfficiency("alloys", -0.05);
                    gameContext.upgradeResourceEfficiency("frozenHydrogen", -0.05);
                    break;
                default:
                    break;
            }
        } else {
            alert("No upgrades to downgrade!");
        }
    };



    return (
        <UpgradesContext.Provider value={{ upgradesState, purchaseUpgrade, downgradeUpgrade }}>
            {children}
        </UpgradesContext.Provider>
    );
};

export const useUpgrades = () => {
    const context = useContext(UpgradesContext);
    if (!context) throw new Error("useUpgrades must be used within an UpgradesProvider");
    return context;
};
