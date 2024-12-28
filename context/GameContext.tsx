import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { loadGameState, saveGameState } from "@/data/asyncStorage";
import defaultUpgradeList, { Upgrade, UpgradeCost } from "@/data/upgrades";
import achievementsData, { Achievement } from "@/data/achievements";
import { Resources, Resource, initialResources } from "@/utils/defaults";

interface GameState {
    resources: Resources;
    achievements: Achievement[];
    upgrades: Upgrade[];
}

interface GameContextType {
    resources: Resources; // Tracks resource states like energy, fuel, etc.
    achievements: Achievement[]; // Tracks all achievements and their states
    upgrades: Upgrade[]; // Tracks upgrades including their levels and costs
    autoEnergyGenerationRate: number; // Tracks the current energy generation rate per second

    // State setters
    setAutoEnergyGenerationRate: React.Dispatch<React.SetStateAction<number>>;

    // Resource management functions
    updateResources: (type: keyof Resources, changes: Partial<Resource>) => void;
    upgradeResourceEfficiency: (type: keyof Resources, increment: number) => void;

    // Upgrade management functions
    purchaseUpgrade: (id: string) => void;
    downgradeUpgrade: (id: string) => void;

    // General game actions
    resetResources: () => void;
    repairShip: () => void;
    generateResource: (type: keyof Resources, energyCost: number, output: number, cooldown: number) => void;

    // Achievement tracking functions
    updateAchievProgressFromResources: (resources: Record<string, { current: number }>) => void;
    updateAchievProgressForUpgrades: (upgradeId: string, level: number) => void;

    // State-checking functions
    isAchievementUnlocked: (id: string) => boolean;
    isUpgradeUnlocked: (upgradeId: string) => boolean;
}


const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [resources, setResources] = useState<Resources>(initialResources);
    const [achievements, setAchievements] = useState<Achievement[]>(achievementsData);
    const [upgrades, setUpgrades] = useState<Upgrade[]>(defaultUpgradeList);
    const [autoEnergyGenerationRate, setAutoEnergyGenerationRate] = useState(0);

    // Load and save state
    useEffect(() => {
        const loadState = async () => {
            const savedState = await loadGameState();
            if (savedState) {
                setResources(savedState.resources || initialResources);
                setAchievements(savedState.achievements || achievementsData);
                setUpgrades(
                    defaultUpgradeList.map((defaultUpgrade) => {
                        const savedUpgrade = savedState.upgrades?.find((u) => u.id === defaultUpgrade.id);
                        return {
                            ...defaultUpgrade,
                            level: savedUpgrade?.level || 0,
                            costs: savedUpgrade?.costs || defaultUpgrade.costs,
                        };
                    })
                );
            }

            // Check for unlocked upgrades and apply special effects
            // might need to find a new way to do this rather then here
            //
            upgrades.forEach((upgrade) => {
                if (upgrade.level > 0) {
                    if (upgrade.id === "reactor_storage") {
                        setResources((prev) => ({
                            ...prev,
                            energy: { ...prev.energy, max: prev.energy.max + 100 },
                        }));
                    } else if (upgrade.id === "reactor_optimization") {
                        setAutoEnergyGenerationRate((prev) => prev + 1);
                    }
                }
            });
        };

        loadState();
    }, []);
    useEffect(() => {
        const saveState = async () => {
            const serializableUpgrades = upgrades.map((upgrade) => ({
                id: upgrade.id,
                level: upgrade.level,
                costs: upgrade.costs,
                title: upgrade.title,
                description: upgrade.description,
                baseCostMultiplier: upgrade.baseCostMultiplier,
            }));
            await saveGameState({ resources, achievements, upgrades: serializableUpgrades });
        };
        saveState();
    }, [resources, achievements, upgrades]);
    // Resource updates
    const updateResources = (type: keyof Resources, changes: Partial<Resource>) => {
        setResources((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                ...changes,
                current: Math.min(changes.current ?? prev[type].current, prev[type].max),
            },
        }));

        updateAchievProgressFromResources({ [type]: { current: changes.current ?? resources[type].current } });
    };

    const upgradeResourceEfficiency = (type: keyof Resources, increment: number) => {
        setResources((prev) => ({
            ...prev,
            [type]: { ...prev[type], efficiency: prev[type].efficiency + increment },
        }));
    };

    // Achievements
    //
    const updateAchievProgressFromResources = (updatedResources: Record<string, { current: number }>) => {
        setAchievements((prevAchievements) => {
            const newAchievements = prevAchievements.map((achievement) => {
                // Skip completed achievements or those without resource goals
                if (achievement.completed || !achievement.resourceGoals) return achievement;

                // Combine updatedResources with the current state of all resources
                const combinedResources = { ...resources, ...updatedResources } as any;

                // Update progress for each resource goal
                const updatedProgress = { ...achievement.progress.resources };
                let isComplete = true;

                for (const [resource, goal] of Object.entries(achievement.resourceGoals)) {
                    const current = combinedResources[resource]?.current || 0;
                    updatedProgress[resource] = Math.min(goal, current);

                    // If any resource goal is not met, the achievement is not complete
                    if (updatedProgress[resource] < goal) {
                        isComplete = false;
                    }
                }

                // If all goals are met, mark as completed and trigger `onComplete`
                if (isComplete) {
                    alert(`Achievement Unlocked: ${achievement.title}\n\n${achievement.story}`);
                    achievement.onComplete?.();

                    return {
                        ...achievement,
                        completed: true,
                        progress: {
                            ...achievement.progress,
                            resources: updatedProgress,
                        },
                    };
                }

                // Otherwise, just update the progress
                return {
                    ...achievement,
                    progress: {
                        ...achievement.progress,
                        resources: updatedProgress,
                    },
                };
            });

            return newAchievements;
        });
    };


    const updateAchievProgressForUpgrades = (upgradeId: string, level: number) => {
        console.log("updateAchievProgressForUpgrades", upgradeId, level);
        setAchievements((prev) =>
            prev.map((achievement) => {
                if (achievement.completed || !achievement.upgradeGoals) return achievement;

                const updatedProgress = { ...achievement.progress.upgrades };
                let isComplete = true;

                for (const [requiredUpgrade, goal] of Object.entries(achievement.upgradeGoals)) {
                    const current = requiredUpgrade === upgradeId ? level : updatedProgress[requiredUpgrade] || 0;
                    updatedProgress[requiredUpgrade] = Math.min(goal, current);

                    if (updatedProgress[requiredUpgrade] < goal) {
                        isComplete = false;
                    }
                }

                if (isComplete) {
                    alert(`Achievement Unlocked: ${achievement.title}\n\n${achievement.story}`);
                    return { ...achievement, completed: true, progress: { upgrades: updatedProgress } };
                }

                return { ...achievement, progress: { upgrades: updatedProgress } };
            })
        );
    };

    const isAchievementUnlocked = (id: string) => achievements.some((a) => a.id === id && a.completed);

    const isUpgradeUnlocked = (upgradeId: string): boolean => {
        return achievements.some(
            (achievement) => achievement.unlocks.includes(upgradeId) && achievement.completed
        );
    };

    // Upgrades logic
    const purchaseUpgrade = (id: string) => {
        const upgrade = upgrades.find((u) => u.id === id);

        if (!upgrade || !isUpgradeUnlocked(id)) {
            alert("Upgrade not unlocked!");
            return;
        }

        // Check if the player can afford the upgrade
        const canAfford = upgrade.costs.every((cost: UpgradeCost) => {
            const resource = resources[cost.resourceType];
            return resource && resource.current >= cost.amount;
        });

        if (!canAfford) {
            alert("Not enough resources to purchase this upgrade!");
            return;
        }

        // Deduct the costs from the player's resources
        //
        upgrade.costs.forEach((cost: UpgradeCost) => {
            updateResources(cost.resourceType, {
                current: resources[cost.resourceType].current - cost.amount,
            });
        });

        // Increment the upgrade level and update the costs for the next level
        const newLevel = upgrade.level + 1;
        setUpgrades((prevUpgrades) =>
            prevUpgrades.map((upgrade) =>
                upgrade.id === id
                    ? {
                        ...upgrade,
                        level: newLevel,
                        costs: upgrade.costs.map((cost) => ({
                            ...cost,
                            amount: Math.round(cost.amount * upgrade.baseCostMultiplier),
                        })),
                    }
                    : upgrade
            )
        );


        // Apply special effects for this upgrade
        if (id === "reactor_storage") {
            setResources((prev) => ({
                ...prev,
                energy: { ...prev.energy, max: prev.energy.max + 100 },
            }));

            //  upgradeResourceEfficiency("energy", newLevel * 0.1); // Example effect
        } else if (id === "reactor_optimization") {
            setAutoEnergyGenerationRate((prev) => prev + 1); // Example effect
        }

        // Update achievements for upgrades
        updateAchievProgressForUpgrades(id, newLevel);
    };


    const downgradeUpgrade = (id: string) => {
        const upgrade = defaultUpgradeList.find((u: Upgrade) => u.id === id);
        if (!upgrade) return;

        const currentUpgrade = upgrades[id as any];
        const refundPercentage = 0.2; // Refund 20% of the cost

        if (currentUpgrade.level > 0) {
            // Refund part of the costs
            currentUpgrade.costs.forEach((cost: UpgradeCost) => {
                const refundAmount = Math.floor(cost.amount * refundPercentage);
                updateResources(cost.resourceType, {
                    current: Math.min(
                        resources[cost.resourceType].max,
                        resources[cost.resourceType].current + refundAmount
                    ),
                });
            });

            // Decrease the upgrade level and adjust costs
            setUpgrades((prevUpgrades) => ({
                ...prevUpgrades,
                [id]: {
                    level: currentUpgrade.level - 1,
                    costs: currentUpgrade.costs.map((cost: UpgradeCost) => ({
                        ...cost,
                        amount: Math.floor(cost.amount / upgrade.baseCostMultiplier),
                    })),
                },
            }));

            // Revert any special effects caused by the upgrade
            if (id === "reactor_storage") {
                upgradeResourceEfficiency("energy", -0.1); // Example effect
            } else if (id === "reactor_optimization") {
                setAutoEnergyGenerationRate((prev) => prev - 1); // Example effect
            }
        } else {
            alert("No upgrades to downgrade!");
        }
    };

    // Reset resources to initial state
    const resetResources = () => setResources(initialResources);

    // Repair ship logic
    const repairShip = () => {
        if (resources.energy.current >= 20) {
            updateResources("energy", { current: resources.energy.current - 20 });
            updateResources("fuel", { current: resources.fuel.current + 10 });
        } else {
            alert("Not enough energy to repair the ship!");
        }
    };

    // Generate resources with cooldown and cost
    const generateResource = (
        type: keyof Resources,
        energyCost: number,
        output: number,
        cooldown: number
    ) => {
        if (resources.energy.current < energyCost) {
            alert("Not enough energy!");
            return;
        }

        // Deduct energy
        updateResources("energy", { current: resources.energy.current - energyCost });

        // Calculate actual output using efficiency multiplier
        const actualOutput = Math.round(output * resources[type].efficiency);

        // Add resource after cooldown
        setTimeout(() => {
            const updatedAmount = Math.min(resources[type].max, resources[type].current + actualOutput);
            updateResources(type, { current: updatedAmount });

            // Update achievement progress
            updateAchievProgressFromResources({
                [type]: { current: updatedAmount },
            });
        }, cooldown * 1000);
    };

    // Auto generate energy based on the Rate if the player has upgraded
    // the reactor_optimization upgrade
    useEffect(() => {
        const interval = setInterval(() => {
            if (autoEnergyGenerationRate > 0) {
                generateResource("energy", 0, autoEnergyGenerationRate, 0); // No cost, instant generation
            }
        }, 1000); // Generate energy every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, [autoEnergyGenerationRate, resources.energy.current]);

    return (
        <GameContext.Provider
            value={{
                resources,
                achievements,
                upgrades,
                autoEnergyGenerationRate,
                setAutoEnergyGenerationRate,
                updateResources,
                upgradeResourceEfficiency,
                purchaseUpgrade,
                downgradeUpgrade,
                resetResources,
                repairShip,
                generateResource,
                updateAchievProgressFromResources,
                updateAchievProgressForUpgrades,
                isAchievementUnlocked,
                isUpgradeUnlocked,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
};
