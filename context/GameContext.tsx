import initialAchievements, { IAchievement } from "@/data/achievements";
import { loadGameState, saveGameState } from "@/data/asyncStorage";
import initialUpgradeList, { Upgrade, UpgradeCost } from "@/data/upgrades";
import initialWeapons, { IWeapon } from "@/data/weapons";
import initialMissions from "@/data/missions";
import { IResource, PlayerResources, Ships, initialShips, IAsteroid, IGalaxy, initialGalaxies, IMainShip, initialMainShip, IMission } from "@/utils/defaults";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert, AppState, AppStateStatus, Platform } from "react-native";

export interface GameContextType {
    resources: PlayerResources; // Tracks resource states like energy, fuel, etc.
    achievements: IAchievement[]; // Tracks all achievements and their states
    upgrades: Upgrade[]; // Tracks upgrades including their levels and costs
    ships: Ships; // Tracks the number of ships the player has
    miningDroneAllocation: Record<string, number>;
    foundAsteroids: IAsteroid[];
    galaxies: IGalaxy[];
    weapons: IWeapon[];
    mainShip: IMainShip;
    missions: IMission[]; // NEW: Mission management
    activeMissions: IMission[]; // NEW: Currently active missions
    missionTimers: Record<string, number>; // NEW: Mission timers
    missionCooldowns: Record<string, number>; // NEW: Mission cooldowns

    // Combat
    updateMainShip: (updatedMainShip: IMainShip) => void;
    updateWeapons: (weaponId: string, newAmount: number) => void;
    manufactureWeapon: (weaponId: string) => void;
    setMainShip: React.Dispatch<React.SetStateAction<IMainShip>>

    // Drones
    allocateMiningDrones: (asteroid: IAsteroid, count: number) => void;

    // Resource management functions
    updateResources: (type: keyof PlayerResources, changes: Partial<IResource>) => void;
    upgradeResourceEfficiency: (type: keyof PlayerResources, increment: number) => void;

    // Upgrade management functions
    purchaseUpgrade: (id: string) => void;
    updateShips: (shipType: keyof Ships, amount: number) => void;

    // General game actions
    resetResources: () => void;
    repairShip: () => void;
    generateResource: (type: keyof PlayerResources, energyCost: number, output: number, cooldown: number) => void;

    // Achievement tracking functions
    updateAchievProgressFromResources: (resources: Record<string, { current: number }>) => void;
    updateAchievProgressForUpgrades: (upgradeId: string, level: number) => void;
    updateAchievProgressForShips: (shipType: string, count: number) => void;
    updateAchievToCompleted: (id: string) => void;

    // State-checking functions
    isAchievementUnlocked: (id: string) => boolean;
    isUpgradeUnlocked: (upgradeId: string) => boolean;

    // Exploration
    setFoundAsteroids: (asteroids: IAsteroid[]) => void;
    setUnlockedGalaxies: (galaxies: IGalaxy[]) => void;

    // NEW: Mission management functions
    startMission: (missionId: string) => void;
    completeMission: (missionId: string) => void;
    cancelMission: (missionId: string) => void;
    canStartMission: (missionId: string) => boolean;
    formatTime: (seconds: number) => string;
}


const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [achievements, setAchievements] = useState<IAchievement[]>(initialAchievements);
    const [ships, setShips] = useState(initialShips);
    const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgradeList);
    const [miningDroneAllocation, setMiningDroneAllocation] = useState<Record<string, number>>({});
    const [foundAsteroids, setFoundAsteroids] = useState<IAsteroid[]>([]);
    const [galaxies, setUnlockedGalaxies] = useState<IGalaxy[]>(initialGalaxies);
    const [weapons, setWeapons] = useState<IWeapon[]>(initialWeapons);
    const [mainShip, setMainShip] = useState<IMainShip>(initialMainShip);
    const [missions, setMissions] = useState<IMission[]>(initialMissions);
    const [activeMissions, setActiveMissions] = useState<IMission[]>([]);
    const [missionTimers, setMissionTimers] = useState<Record<string, number>>({});
    const [missionCooldowns, setMissionCooldowns] = useState<Record<string, number>>({});

    // Save state
    //
    useEffect(() => {
        const handleSaveGameState = async () => {
            const serializableUpgrades = upgrades.map((upgrade) => ({
                id: upgrade.id,
                level: upgrade.level,
                costs: upgrade.costs,
                title: upgrade.title,
                description: upgrade.description,
                baseCostMultiplier: upgrade.baseCostMultiplier,
            }));


            await saveGameState({
                mainShip, achievements, upgrades: serializableUpgrades,
                ships, allocatedDrones: { mining: miningDroneAllocation },
                foundAsteroids, galaxies, weapons,
                missions, activeMissions, missionTimers, missionCooldowns,
            });
        };

        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === "background" || nextAppState === "inactive") {
                await handleSaveGameState();
            }
        };

        if (Platform.OS === "web") {
            // For browser refresh or close
            const handleBeforeUnload = (event: BeforeUnloadEvent) => {
                handleSaveGameState();
                event.preventDefault();
                event.returnValue = ""; // Ensures the confirmation dialog shows on some browsers
            };

            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => {
                window.removeEventListener("beforeunload", handleBeforeUnload);
            };
        } else {
            // For React Native AppState
            const subscription = AppState.addEventListener("change", handleAppStateChange);
            return () => {
                subscription.remove();
            };
        }
    }, [mainShip, achievements, upgrades, ships, foundAsteroids, miningDroneAllocation, galaxies, weapons, missions, activeMissions, missionTimers, missionCooldowns]);

    // Load game state on initial render
    useEffect(() => {
        const loadState = async () => {
            const savedState = await loadGameState();
            if (savedState) {
                setAchievements(savedState.achievements || initialAchievements);
                setShips(savedState.ships || initialShips);
                setFoundAsteroids(savedState.foundAsteroids || []);
                setMiningDroneAllocation(savedState.allocatedDrones?.mining || {});
                setUnlockedGalaxies(savedState.galaxies || initialGalaxies);
                setMainShip(savedState.mainShip || initialMainShip);
                setMissions(savedState.missions || initialMissions);
                setActiveMissions(savedState.activeMissions || []);
                setMissionTimers(savedState.missionTimers || {});
                setMissionCooldowns(savedState.missionCooldowns || {});

                const upgradesFromSaveFile = initialUpgradeList.map((defaultUpgrade) => {
                    const savedUpgrade = savedState.upgrades?.find((u) => u.id === defaultUpgrade.id);

                    return {
                        ...defaultUpgrade,
                        level: savedUpgrade?.level || 0,
                        costs: savedUpgrade?.costs || defaultUpgrade.costs,
                    };
                })

                const weaponsFromSaveFile = initialWeapons.map((defaultWeapon) => {
                    const savedWeapon = savedState.weapons?.find((u) => u.id === defaultWeapon.id);

                    return {
                        ...defaultWeapon,
                        amount: savedWeapon?.amount || 0,
                    };
                })


                // Check for unlocked upgrades and apply special effects
                // might need to find a new way to do this rather then here
                //
                upgradesFromSaveFile.forEach((upgrade) => {
                    if (upgrade.level > 0) {
                        if (upgrade.id === "reactor_storage") {
                        } else if (upgrade.id === 'core_operations_storage') {
                            /*     setMainShip((prev) => {
                                    const updatedResources = Object.fromEntries(
                                        Object.entries(prev.resources).map(([key, value]) => [
                                            key,
                                            key === "energy" ? value : { ...value, max: value.max + (upgrade.level * 200) },
                                        ])
                                    ) as PlayerResources;
    
                                    return {
                                        ...prev,
                                        resources: updatedResources,
                                    };
                                }); */
                        }
                    }
                });

                setUpgrades(
                    upgradesFromSaveFile
                );

                setWeapons(weaponsFromSaveFile)
            }
        };


        loadState();
    }, []);

    // Resource updates
    const updateResources = (type: keyof PlayerResources, changes: Partial<IResource>) => {
        setMainShip((prev) => ({
            ...prev,
            resources: {
                ...prev.resources,
                [type]: {
                    ...prev.resources[type],
                    ...changes,
                    current: Math.min(changes.current ?? prev.resources[type].current, prev.resources[type].max),
                },
            },
        }));

        updateAchievProgressFromResources({ [type]: { current: changes.current ?? mainShip.resources[type].current } });
    };

    const allocateMiningDrones = (asteroid: IAsteroid, count: number) => {
        setMiningDroneAllocation((prev) => {
            const newCount = (prev[asteroid.id] || 0) + count;
            return {
                ...prev,
                [asteroid.id]: Math.max(0, newCount), // Prevent negative allocation
            };
        });
    };

    const upgradeResourceEfficiency = (type: keyof PlayerResources, increment: number) => {
        setMainShip((prev) => ({
            ...prev,
            resources: {
                ...prev.resources,
                [type]: { ...prev.resources[type], efficiency: Math.round(prev.resources[type].efficiency + increment) },
            },
        }));
    };

    // Ship & Weapons
    // Update the `mainShip` with new stats or equipped weapons
    const updateMainShip = (updatedMainShip: IMainShip) => {
        setMainShip(updatedMainShip);
    };

    const updateWeapons = (weaponId: string, newAmount: number) => {
        setWeapons((prev) =>
            prev.map((weapon) =>
                weapon.id === weaponId ? { ...weapon, amount: newAmount } : weapon
            )
        );
    };

    // Manufacture a weapon (increase its amount in inventory)
    const manufactureWeapon = (weaponId: string) => {
        const weapon = weapons.find((w) => w.id === weaponId);
        if (!weapon) return;

        const canAfford = weapon.costs.every(
            (cost) => mainShip.resources[cost.resourceType as keyof PlayerResources]?.current >= cost.amount
        );

        if (canAfford) {
            // Deduct resources
            const updatedResources = { ...mainShip.resources };
            weapon.costs.forEach((cost) => {
                updatedResources[cost.resourceType as keyof PlayerResources].current -= cost.amount;
            });

            setMainShip((prev) => ({
                ...prev,
                resources: updatedResources,
            }));

            // Increase weapon amount
            updateWeapons(weaponId, weapon.amount + 1);
        }
    };

    // Achievements
    //
    const updateAchievProgressFromResources = (updatedResources: Record<string, { current: number }>) => {
        setAchievements((prevAchievements) => {
            const newAchievements = prevAchievements.map((achievement) => {
                // Skip completed achievements or those without resource goals
                if (achievement.completed || !achievement.resourceGoals || !achievement.progress) return achievement;

                // Combine updatedResources with the current state of all resources
                const combinedResources = { ...mainShip.resources, ...updatedResources } as any;

                // Update progress for each resource goal
                const updatedProgress = { ...achievement.progress?.resources };
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
        setAchievements((prev) =>
            prev.map((achievement) => {
                if (achievement.completed || !achievement.upgradeGoals || !achievement.progress) return achievement;

                const updatedProgress = { ...achievement.progress?.upgrades };
                let isComplete = true;

                for (const [requiredUpgrade, goal] of Object.entries(achievement.upgradeGoals)) {
                    const current = requiredUpgrade === upgradeId ? level : updatedProgress[requiredUpgrade] || 0;
                    updatedProgress[requiredUpgrade] = Math.min(goal, current);

                    if (updatedProgress[requiredUpgrade] < goal) {
                        isComplete = false;
                    }
                }

                if (isComplete) {
                    // When we achieve upgrade core operations efficiency we unlock solar plasma
                    //
                    if (achievement.id === 'upgrade_core_operations_efficiency') {
                        setMainShip((prev) => ({
                            ...prev,
                            resources: {
                                ...prev.resources,
                                solarPlasma: { ...prev.resources.solarPlasma, locked: false },
                            }

                        }));
                    }

                    Alert.alert(`Achievement Unlocked: ${achievement.title}\n\n${achievement.story}`);
                    return { ...achievement, completed: true, progress: { upgrades: updatedProgress } };
                }

                return { ...achievement, progress: { upgrades: updatedProgress } };
            })
        );
    };

    const updateAchievProgressForShips = (shipType: string, count: number) => {
        setAchievements((prev) =>
            prev.map((achievement) => {
                if (achievement.completed || !achievement.shipGoals || !achievement.progress) return achievement;

                const updatedProgress = { ...achievement.progress?.ships };
                let isComplete = true;

                for (const [requiredShip, goal] of Object.entries(achievement.shipGoals)) {
                    const current = requiredShip === shipType ? count : updatedProgress[requiredShip] || 0;
                    updatedProgress[requiredShip] = Math.min(goal, current);

                    if (updatedProgress[requiredShip] < goal) {
                        isComplete = false;
                    }
                }

                if (isComplete) {
                    // Custom logic for specific ship-related achievements
                    //
                    if (achievement.id === "build_scout_fleet") {
                        alert("You have built your first Scout Fleet! This unlocks advanced exploration features.");
                    }

                    alert(`Achievement Unlocked: ${achievement.title}\n\n${achievement.story}`);
                    return { ...achievement, completed: true, progress: { ships: updatedProgress } };
                }

                return { ...achievement, progress: { ships: updatedProgress } };
            })
        );
    };

    const unlockGalaxy = (galaxyId: number) => {
        setUnlockedGalaxies((prev) =>
            prev.map(galaxy => galaxy.id === galaxyId ? { ...galaxy, found: true } : galaxy));
    }

    const updateAchievToCompleted = (id: string) => {
        if (id === "build_scanning_drones") {
            unlockGalaxy(1);
        }

        setAchievements((prev) =>
            prev.map((achievement) =>
                achievement.id === id
                    ? { ...achievement, completed: true }
                    : achievement
            )
        );
    };

    const isAchievementUnlocked = (id: string) => {
        if (achievements) {
            return achievements.some((a) => a.id === id && a.completed);
        } else {
            return false;
        }
    }

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
            const resource = mainShip.resources[cost.resourceType];
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
                current: mainShip.resources[cost.resourceType].current - cost.amount,
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
            updateResources("energy", { max: mainShip.resources.energy.max + 100 });
        } else if (id === "core_operations_storage") {
            setMainShip((prev) => {
                const updatedResources = Object.fromEntries(
                    Object.entries(prev.resources).map(([key, value]) => [
                        key,
                        key === "energy" ? value : { ...value, max: value.max + 200 },
                    ])
                ) as PlayerResources;

                return {
                    ...prev,
                    resources: updatedResources,
                };
            });
        } else if (id === "core_operations_efficiency") {
            console.log("Upgrade core operations efficiency");
            setMainShip((prev) => {
                const efficiencyBonus = 1.05; // 5% multiplicative increase per level
                
                const updatedResources = Object.fromEntries(
                    Object.entries(prev.resources).map(([key, value]) => [
                        key,
                        key === "energy" ? value : { // Don't modify energy efficiency
                            ...value,
                            efficiency: Math.round((value.efficiency * efficiencyBonus) * 100) / 100 // Round to 2 decimal places
                        },
                    ])
                ) as PlayerResources;

                return {
                    ...prev,
                    resources: updatedResources,
                };
            });
        }

        // Update achievements for upgrades
        updateAchievProgressForUpgrades(id, newLevel);
    };

    const updateShips = (shipType: keyof Ships, amount: number) => {
        setShips((prev) => ({
            ...prev,
            [shipType]: amount,
        }));

        updateAchievProgressForShips(shipType, amount);
    };



    // Reset resources to initial state
    const resetResources = () => setMainShip({ ...mainShip, resources: initialMainShip.resources });

    // Repair ship logic
    const repairShip = () => {
        if (mainShip.resources.energy.current >= 20) {
            updateResources("energy", { current: mainShip.resources.energy.current - 20 });
            updateResources("fuel", { current: mainShip.resources.fuel.current + 10 });
        } else {
            alert("Not enough energy to repair the ship!");
        }
    };

    // Generate resources with cooldown and cost
    const generateResource = (
        type: keyof PlayerResources,
        energyCost: number,
        output: number,
        cooldown: number
    ) => {
        if (mainShip.resources.energy.current < energyCost) {
            alert("Not enough energy!");
            return;
        }

        // Deduct energy
        if (energyCost > 0) {
            updateResources("energy", { current: mainShip.resources.energy.current - energyCost });
        }

        // Calculate actual output using efficiency multiplier
        const actualOutput = Math.round(output * mainShip.resources[type].efficiency);

        // Add resource after cooldown
        setTimeout(() => {
            const updatedAmount = Math.min(mainShip.resources[type].max, mainShip.resources[type].current + actualOutput);

            updateResources(type, { current: updatedAmount });

            // Update achievement progress
            updateAchievProgressFromResources({
                [type]: { current: updatedAmount },
            });
        }, cooldown * 1000);
    };

    // Mining
    const mineAsteroid = (asteroidId: number, amount: number) => {
        setFoundAsteroids((prev) =>
            prev
                .map((asteroid) =>
                    asteroid.id === asteroidId
                        ? {
                            ...asteroid,
                            maxResources: asteroid.maxResources - amount,
                        }
                        : asteroid
                )
        );
    };

    // When an asteroid is mined to 0, it will get depleted
    // we handle returning the drones and alerting the player.
    //
    const handleDepletedAsteroid = (asteroidId: string) => {
        setFoundAsteroids((prev) => prev.filter((a) => a.id.toString() !== asteroidId));
        setMiningDroneAllocation((prev) => {
            const { [asteroidId]: removed, ...remainingAllocation } = prev;
            return remainingAllocation;
        });

        const depletedAsteroid = foundAsteroids.find((a) => a.id.toString() === asteroidId);
        if (depletedAsteroid) {
            alert(`${depletedAsteroid.name} has been depleted!`);
        }
    };


    // Auto ticker for resources
    useEffect(() => {
        const interval = setInterval(() => {
            setMainShip((prevMainShip) => {
                let updatedResources = { ...prevMainShip.resources };
                let updatedMainShip = { ...prevMainShip, resources: updatedResources };

                // Auto-generate energy based on reactor optimization level
                const reactorOptimizationUpgrade = upgrades.find((u) => u.id === "reactor_optimization");
                const optimizationLevel = reactorOptimizationUpgrade?.level || 0;
                
                if (optimizationLevel > 0) {
                    // Base energy generation rate of 1.85 per level (as described in upgrade description)
                    const baseEnergyRate = 1.85;
                    const energyGenerationRate = optimizationLevel * baseEnergyRate;
                    
                    updatedResources.energy = {
                        ...updatedResources.energy,
                        current: Math.round(Math.min(
                            updatedResources.energy.current + energyGenerationRate,
                            updatedResources.energy.max
                        )),
                    };
                }

                // Generate resources for mining drones
                Object.entries(miningDroneAllocation).forEach(([asteroidId, count]) => {
                    const asteroid = foundAsteroids.find((a) => a.id.toString() === asteroidId);
                    const asteroidResourceType = asteroid?.resource as keyof PlayerResources;

                    if (asteroid && prevMainShip.resources[asteroidResourceType]) {
                        if (asteroid.maxResources > 0) {
                            const resourcesToMine = Math.min(count, asteroid.maxResources);

                            updatedResources[asteroidResourceType] = {
                                ...updatedResources[asteroidResourceType],
                                current: Math.min(
                                    updatedResources[asteroidResourceType].current + resourcesToMine,
                                    updatedResources[asteroidResourceType].max
                                ),
                            };

                            mineAsteroid(asteroid.id, resourcesToMine);
                        } else {
                            handleDepletedAsteroid(asteroidId);
                        }
                    }
                });
                return updatedMainShip;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [miningDroneAllocation, upgrades, setMainShip, mineAsteroid, foundAsteroids]);

    // NEW: Mission management functions
    const startMission = (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !canStartMission(missionId)) return;

        // Check and deduct requirements
        const requirements = mission.requirements;
        Object.entries(requirements).forEach(([key, value]) => {
            if (key === 'ships') return; // Handle ships separately
            if (typeof value === 'number') {
                const currentResource = mainShip.resources[key as keyof PlayerResources];
                if (currentResource && currentResource.current >= value) {
                    updateResources(key as keyof PlayerResources, {
                        current: currentResource.current - value
                    });
                }
            }
        });

        // Update mission status
        const updatedMission = { ...mission, active: true };
        setMissions(prev => prev.map(m => m.id === missionId ? updatedMission : m));
        setActiveMissions(prev => [...prev, updatedMission]);

        // Set timer if duration exists
        if (mission.duration) {
            setMissionTimers(prev => ({
                ...prev,
                [missionId]: mission.duration!
            }));
        }
    };

    const completeMission = (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) return;

        // Award rewards
        const rewards = mission.rewards;
        Object.entries(rewards).forEach(([key, value]) => {
            if (key === 'experience' || key === 'unlocks' || key === 'ships') return;
            if (typeof value === 'number') {
                const currentResource = mainShip.resources[key as keyof PlayerResources];
                if (currentResource) {
                    updateResources(key as keyof PlayerResources, {
                        current: Math.min(currentResource.current + value, currentResource.max)
                    });
                }
            }
        });

        // Update mission status
        setMissions(prev => prev.map(m => 
            m.id === missionId ? { ...m, active: false, completed: true } : m
        ));
        setActiveMissions(prev => prev.filter(m => m.id !== missionId));
        
        // Remove timer
        setMissionTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[missionId];
            return newTimers;
        });

        // Set cooldown
        if (mission.cooldown) {
            setMissionCooldowns(prev => ({
                ...prev,
                [missionId]: mission.cooldown!
            }));
        }
    };

    const cancelMission = (missionId: string) => {
        setMissions(prev => prev.map(m => 
            m.id === missionId ? { ...m, active: false } : m
        ));
        setActiveMissions(prev => prev.filter(m => m.id !== missionId));
        
        // Remove timer
        setMissionTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[missionId];
            return newTimers;
        });
    };

    const canStartMission = (missionId: string): boolean => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || mission.active || missionCooldowns[missionId] > 0) return false;

        // Check requirements
        const requirements = mission.requirements;
        for (const [key, value] of Object.entries(requirements)) {
            if (key === 'ships') {
                const shipReqs = value as Partial<Ships>;
                for (const [shipType, count] of Object.entries(shipReqs)) {
                    if (ships[shipType as keyof Ships] < (count || 0)) return false;
                }
            } else if (typeof value === 'number') {
                const currentResource = mainShip.resources[key as keyof PlayerResources];
                if (!currentResource || currentResource.current < value) return false;
            }
        }
        return true;
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Mission timer and automatic resource generation effect
    useEffect(() => {
        const interval = setInterval(() => {
            // Handle mission timers
            setMissionTimers(prev => {
                const newTimers = { ...prev };
                Object.keys(newTimers).forEach(missionId => {
                    if (newTimers[missionId] > 0) {
                        newTimers[missionId] -= 1;
                    } else {
                        completeMission(missionId);
                        delete newTimers[missionId];
                    }
                });
                return newTimers;
            });

            // Handle mission cooldowns
            setMissionCooldowns(prev => {
                const newCooldowns = { ...prev };
                Object.keys(newCooldowns).forEach(missionId => {
                    if (newCooldowns[missionId] > 0) {
                        newCooldowns[missionId] -= 1;
                    } else {
                        delete newCooldowns[missionId];
                    }
                });
                return newCooldowns;
            });

            // Handle automatic resource generation
            setMainShip(prevMainShip => {
                const updatedResources = { ...prevMainShip.resources };
                
                // Energy generation from reactor optimization
                const reactorLevel = upgrades.find(upgrade => upgrade.id === "reactor_optimization")?.level || 0;
                if (reactorLevel > 0) {
                    const baseEnergyRate = 1.85;
                    const energyGeneration = reactorLevel * baseEnergyRate;
                    
                    updatedResources.energy = {
                        ...updatedResources.energy,
                        current: Math.min(
                            updatedResources.energy.current + energyGeneration,
                            updatedResources.energy.max
                        )
                    };
                }

                // Research Points generation from research lab
                const researchLabLevel = upgrades.find(upgrade => upgrade.id === "research_lab")?.level || 0;
                if (researchLabLevel > 0 && !updatedResources.researchPoints.locked) {
                    const baseResearchRate = 0.5; // 0.5 research points per second per level
                    const researchGeneration = researchLabLevel * baseResearchRate;
                    
                    updatedResources.researchPoints = {
                        ...updatedResources.researchPoints,
                        current: Math.min(
                            updatedResources.researchPoints.current + researchGeneration,
                            updatedResources.researchPoints.max
                        )
                    };
                }

                // Enhanced resource generation from quantum computing
                const quantumLevel = upgrades.find(upgrade => upgrade.id === "quantum_computing")?.level || 0;
                if (quantumLevel > 0) {
                    const quantumBonus = 1 + (quantumLevel * 0.05); // 5% bonus per level
                    
                    // Apply quantum bonus to fuel generation (if player has fuel generation)
                    if (!updatedResources.fuel.locked && updatedResources.fuel.efficiency > 1) {
                        const fuelGeneration = 0.1 * quantumBonus; // Small passive fuel generation
                        updatedResources.fuel = {
                            ...updatedResources.fuel,
                            current: Math.min(
                                updatedResources.fuel.current + fuelGeneration,
                                updatedResources.fuel.max
                            )
                        };
                    }
                }

                // Automated mining bonus from fleet AI
                const fleetAILevel = upgrades.find(upgrade => upgrade.id === "fleet_ai")?.level || 0;
                if (fleetAILevel > 0) {
                    // This would affect mining drone efficiency, but we'll implement that separately
                    // For now, just add a small passive alloy generation if unlocked
                    if (!updatedResources.alloys.locked) {
                        const alloyGeneration = fleetAILevel * 0.05; // Very small passive generation
                        updatedResources.alloys = {
                            ...updatedResources.alloys,
                            current: Math.min(
                                updatedResources.alloys.current + alloyGeneration,
                                updatedResources.alloys.max
                            )
                        };
                    }
                }
                
                return {
                    ...prevMainShip,
                    resources: updatedResources
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [upgrades]); // Include upgrades in dependency array

    return (
        <GameContext.Provider
            value={{
                resources: mainShip.resources,
                achievements,
                upgrades,
                ships,
                mainShip,
                miningDroneAllocation,
                foundAsteroids,
                galaxies,
                weapons,
                missions,
                activeMissions,
                missionTimers,
                missionCooldowns,
                allocateMiningDrones,
                updateResources,
                upgradeResourceEfficiency,
                updateMainShip,
                updateWeapons,
                manufactureWeapon,
                setMainShip,
                updateAchievProgressFromResources,
                updateAchievProgressForUpgrades,
                updateAchievProgressForShips,
                isAchievementUnlocked,
                isUpgradeUnlocked,
                purchaseUpgrade,
                resetResources,
                repairShip,
                generateResource,
                updateShips,
                updateAchievToCompleted,
                setFoundAsteroids,
                setUnlockedGalaxies,
                startMission,
                completeMission,
                cancelMission,
                canStartMission,
                formatTime,
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
