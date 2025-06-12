import initialAchievements, { IAchievement } from "@/data/achievements";
import { loadGameState, saveGameState } from "@/data/asyncStorage";
import initialUpgradeList, { Upgrade, UpgradeCost } from "@/data/upgrades";
import initialWeapons, { IWeapon } from "@/data/weapons";
import initialMissions from "@/data/missions";
import researchData, { IResearchNode } from "@/data/research";
import { IResource, PlayerResources, Ships, initialShips, IAsteroid, IGalaxy, initialGalaxies, IMainShip, initialMainShip, IMission, IMerchant, IMerchantTransaction } from "@/utils/defaults";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import Constants from 'expo-constants';
import { CompletionReward } from "@/components/ui/CompletionNotification";
import CompletionNotification from "@/components/ui/CompletionNotification";
import KillTrackingNotification from "@/components/KillTrackingNotification";
import GeneralNotification from "@/components/GeneralNotification";

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

    // NEW: Merchant system
    merchants: IMerchant[];
    merchantTransactions: IMerchantTransaction[];
    lastMerchantSpawnTime: number;

    // NEW: Research system
    researchNodes: IResearchNode[];
    activeResearch: string | null; // Currently researching node ID
    researchTimer: number; // Time remaining for current research

    // DEV MODE
    isDevMode: boolean;
    toggleDevMode: () => void;
    giveDevResources: () => void;
    simulateEnemyKill: (enemyType: string) => void;
    devResetWithCompletedAchievements: () => void;
    logFoundAsteroids: () => void;
    devSpawnMerchantAt: (x: number, y: number, galaxyId: number) => void;

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

    // NEW: Merchant functions
    spawnMerchant: () => void;
    moveMerchant: (merchantId: string, newGalaxyId: number) => void;
    tradeMerchant: (merchantId: string, itemType: "weapon" | "resource" | "special", itemId: string) => boolean;
    setMerchants: (merchants: IMerchant[]) => void;

    // NEW: Mission management functions
    startMission: (missionId: string) => void;
    completeMission: (missionId: string) => void;
    cancelMission: (missionId: string) => void;
    canStartMission: (missionId: string) => boolean;
    canCompleteMission: (missionId: string) => boolean;
    formatTime: (seconds: number) => string;

    // NEW: Research management functions
    startResearch: (nodeId: string) => void;
    completeResearch: (nodeId: string) => void;
    updateResearchProgress: (nodeId: string, progress: number) => void;

    // Combat tracking
    combatStats: {
        enemiesKilled: Record<string, number>;
        totalKills: number;
    };
    recordEnemyKill: (enemyName: string) => void;

    // Notification system
    notification: {
        visible: boolean;
        title: string;
        description: string;
        rewards: CompletionReward[];
        type: 'mission' | 'achievement';
    } | null;
    showNotification: (notification: {
        title: string;
        description: string;
        rewards: CompletionReward[];
        type: 'mission' | 'achievement';
    }) => void;
    hideNotification: () => void;

    // Kill tracking notification
    killNotification: {
        visible: boolean;
        enemyName: string;
        currentKills: number;
        targetKills: number;
        missionTitle: string;
    } | null;
    showKillNotification: (data: {
        enemyName: string;
        currentKills: number;
        targetKills: number;
        missionTitle: string;
    }) => void;
    hideKillNotification: () => void;

    // General notification system (for asteroid discoveries, warnings, etc.)
    generalNotification: {
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'info' | 'error';
        icon?: string;
    } | null;
    showGeneralNotification: (data: {
        title: string;
        message: string;
        type: 'success' | 'warning' | 'info' | 'error';
        icon?: string;
    }) => void;
    hideGeneralNotification: () => void;
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
    const [merchants, setMerchants] = useState<IMerchant[]>([]);
    const [merchantTransactions, setMerchantTransactions] = useState<IMerchantTransaction[]>([]);

    // Research system state
    const [researchNodes, setResearchNodes] = useState<IResearchNode[]>(
        researchData.flatMap(category => category.trees.flatMap(tree => tree.nodes))
    );
    const [activeResearch, setActiveResearch] = useState<string | null>(null);
    const [researchTimer, setResearchTimer] = useState<number>(0);
    const [lastMerchantSpawnTime, setLastMerchantSpawnTime] = useState<number>(0);
    const [notification, setNotification] = useState<{
        visible: boolean;
        title: string;
        description: string;
        rewards: CompletionReward[];
        type: 'mission' | 'achievement';
    } | null>(null);

    const [killNotification, setKillNotification] = useState<{
        visible: boolean;
        enemyName: string;
        currentKills: number;
        targetKills: number;
        missionTitle: string;
    } | null>(null);

    const [generalNotification, setGeneralNotification] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'info' | 'error';
        icon?: string;
    } | null>(null);
    const [combatStats, setCombatStats] = useState<{
        enemiesKilled: Record<string, number>;
        totalKills: number;
    }>({
        enemiesKilled: {},
        totalKills: 0,
    });
    
    // DEV MODE - Only enabled in development
    const [isDevMode, setIsDevMode] = useState(__DEV__);

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
                merchants, merchantTransactions, lastMerchantSpawnTime,
                researchNodes, activeResearch, researchTimer,
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
    }, [mainShip, achievements, upgrades, ships, foundAsteroids, miningDroneAllocation, galaxies, weapons, missions, activeMissions, missionTimers, missionCooldowns, researchNodes, activeResearch, researchTimer]);

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
                setMerchants(savedState.merchants || []);
                setMerchantTransactions(savedState.merchantTransactions || []);
                setLastMerchantSpawnTime(savedState.lastMerchantSpawnTime || 0);

                // Load research data
                if (savedState.researchNodes) {
                    setResearchNodes(savedState.researchNodes);
                }
                setActiveResearch(savedState.activeResearch || null);
                setResearchTimer(savedState.researchTimer || 0);

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
                    showNotification({
                        title: achievement.title,
                        description: achievement.story,
                        rewards: [],
                        type: 'achievement'
                    });
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

                    showNotification({
                        title: achievement.title,
                        description: achievement.story,
                        rewards: [],
                        type: 'achievement'
                    });
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
                        showGeneralNotification({
                            title: "Scout Fleet Ready!",
                            message: "You have built your first Scout Fleet! This unlocks advanced exploration features.",
                            type: "success",
                            icon: "🚀"
                        });
                    }

                    showNotification({
                        title: achievement.title,
                        description: achievement.story,
                        rewards: [],
                        type: 'achievement'
                    });
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
            
            // Unlock basic weapon modules when exploration is unlocked
            const basicWeapons = ["light_plasma_blaster", "light_pulse_laser", "light_rocket_launcher", "light_railgun"];
            basicWeapons.forEach(weaponId => {
                const weapon = weapons.find(w => w.id === weaponId);
                if (weapon && weapon.amount === 0) {
                    updateWeapons(weaponId, 1); // Give 1 of each basic weapon
                }
            });
            
            showGeneralNotification({
                title: "Weapon Modules Unlocked! ⚔️",
                message: "Basic weapon crafting is now available! Check the Dashboard to craft advanced weapons.",
                type: "success",
                icon: "🔧"
            });
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
            showGeneralNotification({
                title: "Upgrade Locked",
                message: "This upgrade is not unlocked yet!",
                type: "warning",
                icon: "🔐"
            });
            return;
        }

        // Check if the player can afford the upgrade
        const canAfford = upgrade.costs.every((cost: UpgradeCost) => {
            const resource = mainShip.resources[cost.resourceType];
            return resource && resource.current >= cost.amount;
        });

        if (!canAfford) {
            showGeneralNotification({
                title: "Insufficient Resources",
                message: "Not enough resources to purchase this upgrade!",
                type: "error",
                icon: "💰"
            });
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
            console.log("Upgrade core operations efficiency - Level:", newLevel);
            setMainShip((prev) => {
                const efficiencyBonus = 1.20; // 20% multiplicative increase per level
                
                // Log previous efficiency values
                console.log("Previous efficiency values:", Object.fromEntries(
                    Object.entries(prev.resources).map(([key, value]) => [key, value.efficiency])
                ));

                const updatedResources = Object.fromEntries(
                    Object.entries(prev.resources).map(([key, value]) => [
                        key,
                        key === "energy" ? value : { // Don't modify energy efficiency
                            ...value,
                            efficiency: Math.round((value.efficiency * efficiencyBonus) * 100) / 100 // Round to 2 decimal places
                        },
                    ])
                ) as PlayerResources;

                // Log new efficiency values
                console.log("New efficiency values:", Object.fromEntries(
                    Object.entries(updatedResources).map(([key, value]) => [key, value.efficiency])
                ));

                // Show notification about efficiency improvement
                showGeneralNotification({
                    title: "Core Operations Efficiency Upgraded! 🔧",
                    message: `All resource generation efficiency increased by 5%! Level ${newLevel} efficiency boost active.`,
                    type: "success",
                    icon: "⚡"
                });

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
            showGeneralNotification({
                title: "Insufficient Energy",
                message: "Not enough energy to repair the ship!",
                type: "error",
                icon: "⚡"
            });
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
            showGeneralNotification({
                title: "Insufficient Energy",
                message: "Not enough energy!",
                type: "error",
                icon: "⚡"
            });
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

    // Mining functions are now handled directly in the useEffect for better performance


    // Auto ticker for resources and mining
    useEffect(() => {
        const interval = setInterval(() => {
            // Handle energy generation
            setMainShip((prevMainShip) => {
                let updatedResources = { ...prevMainShip.resources };

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

                return { ...prevMainShip, resources: updatedResources };
            });

            // Handle mining drone resource generation
            if (Object.keys(miningDroneAllocation).length > 0) {
                setFoundAsteroids((prevAsteroids) => {
                    const updatedAsteroids = prevAsteroids.map((asteroid) => {
                        const allocationCount = miningDroneAllocation[asteroid.id.toString()];
                        if (allocationCount && allocationCount > 0 && asteroid.maxResources > 0) {
                            const resourcesToMine = Math.min(allocationCount, asteroid.maxResources);
                            
                            // Update resources for this asteroid type
                            setMainShip((prevMainShip) => ({
                                ...prevMainShip,
                                resources: {
                                    ...prevMainShip.resources,
                                    [asteroid.resource]: {
                                        ...prevMainShip.resources[asteroid.resource as keyof PlayerResources],
                                        current: Math.min(
                                            prevMainShip.resources[asteroid.resource as keyof PlayerResources].current + resourcesToMine,
                                            prevMainShip.resources[asteroid.resource as keyof PlayerResources].max
                                        ),
                                    },
                                },
                            }));

                            return {
                                ...asteroid,
                                maxResources: asteroid.maxResources - resourcesToMine,
                            };
                        }
                        return asteroid;
                    });

                    // Filter out depleted asteroids and handle cleanup
                    const filteredAsteroids = updatedAsteroids.filter((asteroid) => {
                        const allocationCount = miningDroneAllocation[asteroid.id.toString()];
                        if (allocationCount && allocationCount > 0 && asteroid.maxResources <= 0) {
                            // Handle depleted asteroid
                            setMiningDroneAllocation((prev) => {
                                const { [asteroid.id.toString()]: removed, ...remainingAllocation } = prev;
                                return remainingAllocation;
                            });
                            showGeneralNotification({
                                title: "Asteroid Depleted",
                                message: `${asteroid.name} has been depleted!`,
                                type: "info",
                                icon: "🪨"
                            });
                            return false;
                        }
                        return true;
                    });

                    return filteredAsteroids;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [miningDroneAllocation, upgrades]);

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
        const notificationRewards: CompletionReward[] = [];
        
        Object.entries(rewards).forEach(([key, value]) => {
            if (key === 'experience' || key === 'unlocks' || key === 'ships') return;
            
            // Handle weapon rewards
            if (key === 'weapons' && typeof value === 'object') {
                const weaponRewards = value as Record<string, number>;
                Object.entries(weaponRewards).forEach(([weaponId, amount]) => {
                    updateWeapons(weaponId, amount);
                    notificationRewards.push({
                        type: weaponId,
                        amount: amount,
                    });
                });
            } else if (typeof value === 'number') {
                const currentResource = mainShip.resources[key as keyof PlayerResources];
                if (currentResource) {
                    updateResources(key as keyof PlayerResources, {
                        current: Math.min(currentResource.current + value, currentResource.max)
                    });
                    
                    // Add to notification rewards
                    notificationRewards.push({
                        type: key,
                        amount: value,
                    });
                }
            }
        });

        // Show completion notification
        showNotification({
            title: mission.title,
            description: `Mission completed successfully! ${mission.description}`,
            rewards: notificationRewards,
            type: 'mission',
        });

        // Update mission status and unlock new missions
        setMissions(prev => prev.map(m => {
            if (m.id === missionId) {
                const completedMission = { 
                    ...m, 
                    active: false, 
                    completed: true,
                    // For combat missions, preserve the objective progress
                    objective: m.type === 'combat' && m.objective ? {
                        ...m.objective,
                        currentAmount: m.objective.targetAmount // Set to completed amount
                    } : m.objective
                };
                
                // Unlock missions that this mission unlocks
                if (completedMission.unlocks) {
                    setTimeout(() => {
                        setMissions(prevMissions => prevMissions.map(mission => {
                            if (completedMission.unlocks!.includes(mission.id) && mission.locked) {
                                return { ...mission, locked: false };
                            }
                            return mission;
                        }));
                    }, 100); // Small delay to ensure proper state updates
                }
                
                return completedMission;
            }
            return m;
        }));
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
        if (!mission || mission.active || mission.locked || missionCooldowns[missionId] > 0) return false;

        // Check requirements
        const requirements = mission.requirements;
        for (const [key, value] of Object.entries(requirements)) {
            if (key === 'ships') {
                const shipReqs = value as Partial<Ships>;
                for (const [shipType, count] of Object.entries(shipReqs)) {
                    if (ships[shipType as keyof Ships] < (count || 0)) return false;
                }
            } else if (key === 'weapons') {
                const weaponReqs = value as Record<string, number>;
                for (const [weaponId, count] of Object.entries(weaponReqs)) {
                    const weapon = weapons.find(w => w.id === weaponId);
                    if (!weapon || weapon.amount < count) return false;
                }
            } else if (key === 'enemyKills') {
                const killReqs = value as Record<string, number>;
                for (const [enemyType, count] of Object.entries(killReqs)) {
                    const currentKills = combatStats.enemiesKilled[enemyType] || 0;
                    if (currentKills < count) return false;
                }
            } else if (typeof value === 'number') {
                const currentResource = mainShip.resources[key as keyof PlayerResources];
                if (!currentResource || currentResource.current < value) return false;
            }
        }
        return true;
    };

    const canCompleteMission = (missionId: string): boolean => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !mission.active) return false;

        // Combat missions auto-complete, so they never show a "Complete Now" button
        if (mission.type === 'combat') return false;

        // For timed missions, check if time limit has passed or if they can be completed early
        if (mission.type === 'timed') {
            // Allow early completion if the mission is active (player has met requirements to start)
            return true;
        }

        // For resource_chain missions, check if all steps are completed
        if (mission.type === 'resource_chain') {
            // Check mission progress - if it has steps, they need to be completed
            if (mission.steps && mission.progress !== undefined) {
                return mission.progress >= mission.steps.length;
            }
            // If no steps defined or progress tracking, allow completion
            return true;
        }

        // For exploration and trading missions with duration timers
        // These can be completed early with "Complete Now" functionality
        if (mission.type === 'exploration' || mission.type === 'trading') {
            return true;
        }

        // Default: allow completion for active non-combat missions
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

    // Notification functions
    const showNotification = (notificationData: {
        title: string;
        description: string;
        rewards: CompletionReward[];
        type: 'mission' | 'achievement';
    }) => {
        setNotification({
            visible: true,
            ...notificationData,
        });
    };

    const hideNotification = () => {
        setNotification(null);
    };

    const showKillNotification = (data: {
        enemyName: string;
        currentKills: number;
        targetKills: number;
        missionTitle: string;
    }) => {
        setKillNotification({
            visible: true,
            ...data
        });
    };

    const hideKillNotification = () => {
        setKillNotification(null);
    };

    const showGeneralNotification = (data: {
        title: string;
        message: string;
        type: 'success' | 'warning' | 'info' | 'error';
        icon?: string;
    }) => {
        setGeneralNotification({
            visible: true,
            ...data
        });
    };

    const hideGeneralNotification = () => {
        setGeneralNotification(null);
    };

    // Combat tracking functions
    const recordEnemyKill = (enemyName: string) => {
        // Get current stats before updating
        const currentEnemyKills = combatStats.enemiesKilled[enemyName] || 0;
        const currentTotalKills = combatStats.totalKills || 0;
        const newTotalKills = currentTotalKills + 1;
        const newEnemyKills = currentEnemyKills + 1;

        setCombatStats(prev => ({
            enemiesKilled: {
                ...prev.enemiesKilled,
                [enemyName]: newEnemyKills,
            },
            totalKills: newTotalKills,
        }));

        // Award scaled resources based on enemy difficulty
        const rewardResources = (enemyName: string) => {
            // Define enemy categories and their reward multipliers
            const enemyRewards: Record<string, { 
                category: string, 
                baseReward: number, 
                primaryResource: keyof PlayerResources,
                secondaryResource: keyof PlayerResources 
            }> = {
                // Nebula Marauders
                "Missile Corvette": { category: "Corvette", baseReward: 1, primaryResource: "fuel", secondaryResource: "energy" },
                "Laser Interceptor": { category: "Cruiser", baseReward: 1.5, primaryResource: "energy", secondaryResource: "alloys" },
                "Nebula Ravager": { category: "Dreadnought", baseReward: 3, primaryResource: "solarPlasma", secondaryResource: "fuel" },
                "Titan Breaker": { category: "Battleship", baseReward: 5, primaryResource: "alloys", secondaryResource: "solarPlasma" },
                "Nebula Titan": { category: "Titan", baseReward: 8, primaryResource: "quantumCores", secondaryResource: "darkMatter" },
                
                // Void Corsairs
                "Stealth Raider": { category: "Corvette", baseReward: 1.2, primaryResource: "darkMatter", secondaryResource: "energy" },
                "Ion Saboteur": { category: "Cruiser", baseReward: 1.8, primaryResource: "energy", secondaryResource: "frozenHydrogen" },
                "Corsair Warlord": { category: "Dreadnought", baseReward: 3.5, primaryResource: "darkMatter", secondaryResource: "alloys" },
                "Void Destroyer": { category: "Battleship", baseReward: 6, primaryResource: "exoticMatter", secondaryResource: "darkMatter" },
                "Corsair Titan": { category: "Titan", baseReward: 10, primaryResource: "exoticMatter", secondaryResource: "quantumCores" },
                
                // Star Scavengers
                "Salvage Fighter": { category: "Corvette", baseReward: 1.3, primaryResource: "alloys", secondaryResource: "fuel" },
                "Repurposed Frigate": { category: "Cruiser", baseReward: 2, primaryResource: "alloys", secondaryResource: "solarPlasma" },
                "Scavenger Overseer": { category: "Dreadnought", baseReward: 4, primaryResource: "alloys", secondaryResource: "exoticMatter" },
                "Junkyard Marauder": { category: "Battleship", baseReward: 6.5, primaryResource: "quantumCores", secondaryResource: "alloys" },
                "Scavenger Colossus": { category: "Titan", baseReward: 12, primaryResource: "ancientArtifacts", secondaryResource: "quantumCores" },
                
                // Titan Vanguard
                "Titan Enforcer": { category: "Corvette", baseReward: 1.5, primaryResource: "tokens", secondaryResource: "energy" },
                "Shieldbreaker Cruiser": { category: "Cruiser", baseReward: 2.5, primaryResource: "tokens", secondaryResource: "quantumCores" },
                "Titan Dreadnought": { category: "Dreadnought", baseReward: 5, primaryResource: "tokens", secondaryResource: "exoticMatter" },
                "Vanguard Battleship": { category: "Battleship", baseReward: 8, primaryResource: "tokens", secondaryResource: "ancientArtifacts" },
                "Titan Colossus": { category: "Titan", baseReward: 15, primaryResource: "ancientArtifacts", secondaryResource: "tokens" },
            };

            const enemyData = enemyRewards[enemyName];
            if (!enemyData) return; // Unknown enemy, no rewards

            // Calculate rewards based on enemy difficulty
            const primaryAmount = Math.floor(enemyData.baseReward * 50); // Base 50 resources
            const secondaryAmount = Math.floor(enemyData.baseReward * 25); // Base 25 resources
            const bonusTokens = Math.floor(enemyData.baseReward * 10); // Base 10 tokens

            // Award primary resource
            const primaryResource = mainShip.resources[enemyData.primaryResource];
            if (primaryResource) {
                updateResources(enemyData.primaryResource, {
                    current: Math.min(primaryResource.current + primaryAmount, primaryResource.max)
                });
            }

            // Award secondary resource
            const secondaryResource = mainShip.resources[enemyData.secondaryResource];
            if (secondaryResource) {
                updateResources(enemyData.secondaryResource, {
                    current: Math.min(secondaryResource.current + secondaryAmount, secondaryResource.max)
                });
            }

            // Award bonus tokens (universal currency)
            const tokensResource = mainShip.resources.tokens;
            updateResources("tokens", {
                current: Math.min(tokensResource.current + bonusTokens, tokensResource.max)
            });

            // Show reward notification
            showGeneralNotification({
                title: `${enemyName} Defeated! 💰`,
                message: `Gained ${primaryAmount} ${enemyData.primaryResource}, ${secondaryAmount} ${enemyData.secondaryResource}, ${bonusTokens} tokens`,
                type: "success",
                icon: "⚔️"
            });
        };

        // Award the resources
        rewardResources(enemyName);

        // Bonus rewards for milestones and streaks
        const totalKills = newTotalKills;
        const enemyKillCount = newEnemyKills;

        // First kill bonus for each enemy type
        if (enemyKillCount === 1) {
            const bonusAmount = 100;
            updateResources("energy", {
                current: Math.min(mainShip.resources.energy.current + bonusAmount, mainShip.resources.energy.max)
            });
            
            showGeneralNotification({
                title: `First ${enemyName} Kill! 🎯`,
                message: `Bonus: +${bonusAmount} Energy for first-time defeat!`,
                type: "success",
                icon: "🏆"
            });
        }

        // Kill milestone bonuses
        if (totalKills % 10 === 0) {
            const milestoneBonus = totalKills * 5; // Scaling bonus
            updateResources("tokens", {
                current: Math.min(mainShip.resources.tokens.current + milestoneBonus, mainShip.resources.tokens.max)
            });
            
            showGeneralNotification({
                title: `Combat Milestone! 🏆`,
                message: `${totalKills} total kills achieved! Bonus: +${milestoneBonus} tokens`,
                type: "success",
                icon: "💫"
            });
        }

        // Special bonuses for major milestones
        if (totalKills === 25) {
            updateResources("quantumCores", {
                current: Math.min(mainShip.resources.quantumCores.current + 50, mainShip.resources.quantumCores.max)
            });
            showGeneralNotification({
                title: "Veteran Pilot! 🚀",
                message: "25 kills achieved! Bonus: +50 Quantum Cores",
                type: "success",
                icon: "⭐"
            });
        } else if (totalKills === 50) {
            updateResources("exoticMatter", {
                current: Math.min(mainShip.resources.exoticMatter.current + 100, mainShip.resources.exoticMatter.max)
            });
            showGeneralNotification({
                title: "Elite Commander! 👑",
                message: "50 kills achieved! Bonus: +100 Exotic Matter",
                type: "success",
                icon: "🌟"
            });
        } else if (totalKills === 100) {
            updateResources("ancientArtifacts", {
                current: Math.min(mainShip.resources.ancientArtifacts.current + 25, mainShip.resources.ancientArtifacts.max)
            });
            showGeneralNotification({
                title: "Legendary Warrior! 👑",
                message: "100 kills achieved! Bonus: +25 Ancient Artifacts",
                type: "success",
                icon: "💎"
            });
        }

        // Update mission progress for kill objectives and show notification
        setMissions(prev => prev.map(mission => {
            if (mission.active && mission.objective?.type === 'kill') {
                const target = mission.objective.target;
                let shouldUpdate = false;

                // Check if this kill applies to the mission
                if (target === enemyName) {
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    const newCurrentAmount = (mission.objective.currentAmount || 0) + 1;
                    const updatedMission = {
                        ...mission,
                        objective: {
                            ...mission.objective,
                            currentAmount: newCurrentAmount
                        }
                    };

                    // Show kill tracking notification
                    showKillNotification({
                        enemyName: enemyName,
                        currentKills: newCurrentAmount,
                        targetKills: mission.objective.targetAmount!,
                        missionTitle: mission.title
                    });

                    // Auto-complete mission if target reached
                    if (newCurrentAmount >= mission.objective.targetAmount!) {
                        setTimeout(() => completeMission(mission.id), 1000); // Small delay for better UX
                    }

                    return updatedMission;
                }
            }
            return mission;
        }));
    };

    // DEV MODE FUNCTIONS
    const toggleDevMode = () => {
        if (__DEV__) {
            setIsDevMode(prev => !prev);
        }
    };

    const giveDevResources = () => {
        if (!__DEV__ || !isDevMode) return;
        
        setMainShip(prevMainShip => {
            const updatedResources = { ...prevMainShip.resources };
            
            // Give max resources for all unlocked resources
            Object.keys(updatedResources).forEach(resourceKey => {
                const resource = updatedResources[resourceKey as keyof PlayerResources];
                if (!resource.locked) {
                    resource.current = resource.max;
                }
            });
            
            return {
                ...prevMainShip,
                resources: updatedResources
            };
        });
        
        // Also give ships
        setShips(prevShips => ({
            ...prevShips,
            miningDrones: Math.max(prevShips.miningDrones, 20),
            scanningDrones: Math.max(prevShips.scanningDrones, 10),
        }));
    };

    const simulateEnemyKill = (enemyType: string) => {
        if (!__DEV__ || !isDevMode) return;
        recordEnemyKill(enemyType);
    };

    const devResetWithCompletedAchievements = () => {
        const completedAchievements = achievements.filter(ach => ach.completed);
        setMainShip(initialMainShip);
        setAchievements(prev => prev.map(ach => ({
            ...ach,
            completed: completedAchievements.some(ca => ca.id === ach.id)
        })));
        setShips(initialShips);
        setMiningDroneAllocation({});
        setMissions(initialMissions);
        setActiveMissions([]);
        setMissionTimers({});
        setMissionCooldowns({});
        setCombatStats({ enemiesKilled: {}, totalKills: 0 });
    };

    const logFoundAsteroids = () => {
        console.log('=== FOUND ASTEROIDS DEBUG ===');
        console.log('foundAsteroids array:', foundAsteroids);
        console.log('foundAsteroids length:', foundAsteroids.length);
        foundAsteroids.forEach((asteroid, index) => {
            console.log(`Asteroid ${index}:`, asteroid);
        });
        console.log('=== END DEBUG ===');
    };

    // Research system functions
    const startResearch = (nodeId: string) => {
        const node = researchNodes.find(n => n.id === nodeId);
        if (!node) return;

        // Check if player can afford the research
        const canAfford = node.costs.every(cost => 
            mainShip.resources[cost.resourceType].current >= cost.amount
        );

        if (!canAfford) {
            showGeneralNotification({
                title: "Insufficient Resources",
                message: "Not enough resources to start this research!",
                type: "error",
                icon: "🧪"
            });
            return;
        }

        // Check prerequisites
        const prereqsMet = !node.prerequisites || node.prerequisites.every(prereqId => {
            const prereqNode = researchNodes.find(n => n.id === prereqId);
            return prereqNode?.completed || false;
        });

        if (!prereqsMet) {
            showGeneralNotification({
                title: "Prerequisites Required",
                message: "Complete prerequisite research first!",
                type: "warning",
                icon: "⚠️"
            });
            return;
        }

        // Deduct resources
        node.costs.forEach(cost => {
            updateResources(cost.resourceType, {
                current: mainShip.resources[cost.resourceType].current - cost.amount,
            });
        });

        // Start research
        setResearchNodes(prev => prev.map(n => 
            n.id === nodeId 
                ? { ...n, inProgress: true, progress: 0 }
                : n
        ));
        setActiveResearch(nodeId);
        setResearchTimer(node.duration);

        showGeneralNotification({
            title: "Research Started! 🧪",
            message: `${node.title} research is now in progress.`,
            type: "success",
            icon: "🔬"
        });
    };

    const completeResearch = (nodeId: string) => {
        const node = researchNodes.find(n => n.id === nodeId);
        if (!node) return;

        // Apply research effects
        node.effects.forEach(effect => {
            switch (effect.type) {
                case 'passive_efficiency':
                    if (effect.target && effect.value) {
                        setMainShip(prev => {
                            const updatedResources = { ...prev.resources };
                            if (effect.target === 'all_materials' || effect.target === 'all_core_operations' || effect.target === 'all_systems') {
                                // Apply to multiple resources
                                Object.keys(updatedResources).forEach(key => {
                                    if (key !== 'energy') {
                                        updatedResources[key as keyof PlayerResources] = {
                                            ...updatedResources[key as keyof PlayerResources],
                                            efficiency: updatedResources[key as keyof PlayerResources].efficiency * effect.value!
                                        };
                                    }
                                });
                            } else {
                                // Apply to specific resource
                                const resourceKey = effect.target as keyof PlayerResources;
                                if (updatedResources[resourceKey] && effect.value) {
                                    updatedResources[resourceKey] = {
                                        ...updatedResources[resourceKey],
                                        efficiency: updatedResources[resourceKey].efficiency * effect.value
                                    };
                                }
                            }
                            return { ...prev, resources: updatedResources };
                        });
                    }
                    break;
                case 'increase_capacity':
                    if (effect.target && effect.value) {
                        setMainShip(prev => {
                            const updatedResources = { ...prev.resources };
                            if (effect.target === 'all_resources') {
                                Object.keys(updatedResources).forEach(key => {
                                    updatedResources[key as keyof PlayerResources] = {
                                        ...updatedResources[key as keyof PlayerResources],
                                        max: updatedResources[key as keyof PlayerResources].max + effect.value!
                                    };
                                });
                            }
                            return { ...prev, resources: updatedResources };
                        });
                    }
                    break;
                case 'unlock_slot':
                    if (effect.target === 'weapon_slots' && effect.value) {
                        setMainShip(prev => ({
                            ...prev,
                            maxWeaponSlots: prev.maxWeaponSlots + effect.value!
                        }));
                    }
                    break;
                // TODO: Implement unlock_weapon and unlock_upgrade cases
            }
        });

        // Mark research as completed
        setResearchNodes(prev => prev.map(n => 
            n.id === nodeId 
                ? { ...n, completed: true, inProgress: false, progress: 100 }
                : n
        ));
        setActiveResearch(null);
        setResearchTimer(0);

        showGeneralNotification({
            title: "Research Complete! 🎉",
            message: `${node.title} research has been completed! Effects applied.`,
            type: "success",
            icon: "✅"
        });
    };

    const updateResearchProgress = (nodeId: string, progress: number) => {
        setResearchNodes(prev => prev.map(n => 
            n.id === nodeId 
                ? { ...n, progress }
                : n
        ));
    };

    const devSpawnMerchantAt = (x: number, y: number, galaxyId: number) => {
        if (!__DEV__ || !isDevMode) return;

        const now = Date.now();
        const merchantTypes: ("weapons" | "resources" | "general")[] = ["weapons", "resources", "general"];
        const merchantType = merchantTypes[Math.floor(Math.random() * merchantTypes.length)];

        // Get the galaxy to check for existing objects
        const targetGalaxy = galaxies.find(g => g.id === galaxyId);
        if (!targetGalaxy) return;

        // Get existing objects in this galaxy to check for collisions
        const existingObjects = [
            // Existing asteroids in this galaxy
            ...foundAsteroids
                .filter(a => a.galaxyId === galaxyId && a.x !== undefined && a.y !== undefined)
                .map(a => ({
                    x: a.x!,
                    y: a.y!,
                    radius: Math.max(8, 8 + (a.maxResources / 1000) * 8) + 20
                })),
            // Planets in this galaxy
            ...targetGalaxy.planets
                .filter((p: any) => !p.locked)
                .map((p: any) => ({
                    x: p.position.x,
                    y: p.position.y,
                    radius: 40
                })),
            // Other merchants in this galaxy
            ...merchants
                .filter(m => m.galaxyId === galaxyId)
                .map(m => ({
                    x: m.x,
                    y: m.y,
                    radius: 35
                }))
        ];

        // Helper function for collision detection (simplified version for GameContext)
        const checkCollision = (obj1: any, obj2: any, minDistance: number = 10): boolean => {
            const dx = obj1.x - obj2.x;
            const dy = obj1.y - obj2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (obj1.radius + obj2.radius + minDistance);
        };

        let finalX = x;
        let finalY = y;
        const proposedMerchant = { x: finalX, y: finalY, radius: 35 };
        
        // Check if the proposed position would cause overlap
        const hasCollision = existingObjects.some(existing => 
            checkCollision(proposedMerchant, existing, 15)
        );
        
        if (hasCollision) {
            // Try to find a nearby non-overlapping position
            const attempts = 20;
            let found = false;
            
            for (let attempt = 0; attempt < attempts && !found; attempt++) {
                const angle = (Math.PI * 2 * attempt) / attempts;
                const distance = 50 + (attempt * 10); // Gradually increase distance
                const testX = x + Math.cos(angle) * distance;
                const testY = y + Math.sin(angle) * distance;
                
                // Keep within bounds
                if (testX >= 80 && testX <= 400 - 80 && testY >= 80 && testY <= 600 - 80) {
                    const testMerchant = { x: testX, y: testY, radius: 35 };
                    
                    const testCollision = existingObjects.some(existing => 
                        checkCollision(testMerchant, existing, 15)
                    );
                    
                    if (!testCollision) {
                        finalX = testX;
                        finalY = testY;
                        found = true;
                    }
                }
            }
        }

        const newMerchant: IMerchant = {
            id: `dev_merchant_${now}`,
            name: `DEV ${merchantType.charAt(0).toUpperCase() + merchantType.slice(1)} Trader`,
            type: merchantType,
            galaxyId: galaxyId,
            x: finalX,
            y: finalY,
            spawnTime: now,
            nextMoveTime: now + (15 * 60 * 1000), // Stay for 15 minutes
            inventory: generateMerchantInventory(merchantType),
            image: "🛸"
        };

        setMerchants(prev => [...prev, newMerchant]);

        const positionText = (finalX !== x || finalY !== y) ? 
            ` (adjusted to ${Math.round(finalX)}, ${Math.round(finalY)} to avoid overlap)` : 
            ` at (${Math.round(finalX)}, ${Math.round(finalY)})`;

        showGeneralNotification({
            title: "DEV: Merchant Spawned! 🚀",
            message: `Dev spawned ${merchantType} trader${positionText}`,
            type: "info",
            icon: "🛸"
        });
    };

    // Merchant system functions
    const generateMerchantInventory = (type: "weapons" | "resources" | "general") => {
        const inventory: IMerchant['inventory'] = {};
        
        if (type === "weapons" || type === "general") {
            // Generate 2-4 random weapons for sale
            const availableWeapons = weapons.filter(w => w.amount === 0); // Weapons player doesn't have
            const selectedWeapons = availableWeapons
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 2);
            
            inventory.weapons = selectedWeapons.map(weapon => ({
                weaponId: weapon.id,
                price: {
                    energy: Math.floor((weapon.costs.find(c => c.resourceType === 'energy')?.amount || 1000) * 1.5),
                    fuel: Math.floor((weapon.costs.find(c => c.resourceType === 'fuel')?.amount || 500) * 1.5),
                    solarPlasma: Math.floor((weapon.costs.find(c => c.resourceType === 'solarPlasma')?.amount || 300) * 1.5),
                },
                quantity: Math.floor(Math.random() * 3) + 1
            }));
        }
        
        if (type === "resources" || type === "general") {
            // Generate random resource packages
            const resourceTypes: (keyof PlayerResources)[] = ['fuel', 'solarPlasma', 'darkMatter', 'alloys', 'frozenHydrogen'];
            const selectedResources = resourceTypes
                .filter(resource => !mainShip.resources[resource].locked) // Only include unlocked resources
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 2);
            
            inventory.resources = selectedResources.map(resourceType => ({
                resourceType,
                amount: Math.floor(Math.random() * 500) + 200,
                price: {
                    energy: Math.floor(Math.random() * 200) + 100,
                    fuel: Math.floor(Math.random() * 150) + 75,
                }
            }));
        }
        
        return inventory;
    };

    const spawnMerchant = () => {
        // Only spawn if enough time has passed (30 minutes minimum)
        const now = Date.now();
        if (now - lastMerchantSpawnTime < 30 * 60 * 1000) return;
        
        // Random chance to spawn (30% chance every 30 minutes)
        if (Math.random() > 0.3) return;
        
        const unlockedGalaxies = galaxies.filter(g => g.found);
        if (unlockedGalaxies.length === 0) return;
        
        const randomGalaxy = unlockedGalaxies[Math.floor(Math.random() * unlockedGalaxies.length)];
        const merchantTypes: ("weapons" | "resources" | "general")[] = ["weapons", "resources", "general"];
        const merchantType = merchantTypes[Math.floor(Math.random() * merchantTypes.length)];
        
        // Calculate safe positioning with collision detection
        const topMenuHeight = 80;
        const bottomMenuHeight = 120;
        const sideMargin = 80;
        const merchantRadius = 35;
        
        const safeX = sideMargin + merchantRadius;
        const safeY = topMenuHeight + merchantRadius;
        const safeWidth = (400 - (sideMargin * 2) - (merchantRadius * 2)); // Use a fixed width
        const safeHeight = (600 - topMenuHeight - bottomMenuHeight - (merchantRadius * 2)); // Use a fixed height
        
        // Get existing objects in this galaxy to avoid collisions
        const existingObjects = [
            // Existing asteroids in this galaxy
            ...foundAsteroids
                .filter(a => a.galaxyId === randomGalaxy.id && a.x !== undefined && a.y !== undefined)
                .map(a => ({
                    x: a.x!,
                    y: a.y!,
                    radius: Math.max(8, 8 + (a.maxResources / 1000) * 8) + 20
                })),
            // Planets in this galaxy
            ...randomGalaxy.planets
                .filter((p: any) => !p.locked)
                .map((p: any) => ({
                    x: p.position.x,
                    y: p.position.y,
                    radius: 40
                })),
            // Other merchants in this galaxy
            ...merchants
                .filter(m => m.galaxyId === randomGalaxy.id)
                .map(m => ({
                    x: m.x,
                    y: m.y,
                    radius: 35
                }))
        ];

        // Helper function for collision detection (simplified version for GameContext)
        const checkCollision = (obj1: any, obj2: any, minDistance: number = 10): boolean => {
            const dx = obj1.x - obj2.x;
            const dy = obj1.y - obj2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (obj1.radius + obj2.radius + minDistance);
        };

        // Try to find a non-overlapping position
        let merchantX = Math.random() * safeWidth + safeX;
        let merchantY = Math.random() * safeHeight + safeY;
        
        for (let attempt = 0; attempt < 50; attempt++) {
            const proposedMerchant = { x: merchantX, y: merchantY, radius: merchantRadius };
            
            const hasCollision = existingObjects.some(existing => 
                checkCollision(proposedMerchant, existing, 15)
            );
            
            if (!hasCollision) {
                break; // Found a good position
            }
            
            // Try a new random position
            merchantX = Math.random() * safeWidth + safeX;
            merchantY = Math.random() * safeHeight + safeY;
        }
        
        const newMerchant: IMerchant = {
            id: `merchant_${now}`,
            name: `${merchantType.charAt(0).toUpperCase() + merchantType.slice(1)} Trader`,
            type: merchantType,
            galaxyId: randomGalaxy.id,
            x: merchantX,
            y: merchantY,
            spawnTime: now,
            nextMoveTime: now + (15 * 60 * 1000), // Stay for 15 minutes
            inventory: generateMerchantInventory(merchantType),
            image: "🛸" // Using emoji for now, can be replaced with actual image
        };
        
        setMerchants(prev => [...prev, newMerchant]);
        setLastMerchantSpawnTime(now);
        
        showGeneralNotification({
            title: "Merchant Arrived! 🚀",
            message: `A ${merchantType} trader has appeared in ${randomGalaxy.name}! They won't stay long.`,
            type: "info",
            icon: "🛸"
        });
    };

    const moveMerchant = (merchantId: string, newGalaxyId: number) => {
        setMerchants(prev => prev.map(merchant => 
            merchant.id === merchantId 
                ? { 
                    ...merchant, 
                    galaxyId: newGalaxyId,
                    nextMoveTime: Date.now() + (15 * 60 * 1000) // Stay for another 15 minutes
                }
                : merchant
        ));
    };

    const tradeMerchant = (merchantId: string, itemType: "weapon" | "resource" | "special", itemId: string): boolean => {
        const merchant = merchants.find(m => m.id === merchantId);
        if (!merchant) return false;
        
        let item: any = null;
        let canAfford = false;
        
        if (itemType === "weapon" && merchant.inventory.weapons) {
            item = merchant.inventory.weapons.find(w => w.weaponId === itemId);
            if (item) {
                canAfford = Object.entries(item.price).every(([resource, amount]) => 
                    mainShip.resources[resource as keyof PlayerResources]?.current >= (amount as number)
                );
                
                if (canAfford) {
                    // Deduct resources
                    Object.entries(item.price).forEach(([resource, amount]) => {
                        updateResources(resource as keyof PlayerResources, {
                            current: mainShip.resources[resource as keyof PlayerResources].current - (amount as number)
                        });
                    });
                    
                    // Add weapon to inventory
                    const weapon = weapons.find(w => w.id === itemId);
                    if (weapon) {
                        updateWeapons(itemId, weapon.amount + item.quantity);
                    }
                    
                    // Remove item from merchant inventory
                    setMerchants(prev => prev.map(m => 
                        m.id === merchantId 
                            ? {
                                ...m,
                                inventory: {
                                    ...m.inventory,
                                    weapons: m.inventory.weapons?.filter(w => w.weaponId !== itemId)
                                }
                            }
                            : m
                    ));
                }
            }
        } else if (itemType === "resource" && merchant.inventory.resources) {
            item = merchant.inventory.resources.find(r => r.resourceType === itemId);
            if (item) {
                canAfford = Object.entries(item.price).every(([resource, amount]) => 
                    mainShip.resources[resource as keyof PlayerResources]?.current >= (amount as number)
                );
                
                if (canAfford) {
                    // Deduct payment resources
                    Object.entries(item.price).forEach(([resource, amount]) => {
                        updateResources(resource as keyof PlayerResources, {
                            current: mainShip.resources[resource as keyof PlayerResources].current - (amount as number)
                        });
                    });
                    
                    // Add purchased resource
                    const resourceType = item.resourceType as keyof PlayerResources;
                    updateResources(resourceType, {
                        current: Math.min(
                            mainShip.resources[resourceType].current + item.amount,
                            mainShip.resources[resourceType].max
                        )
                    });
                    
                    // Remove item from merchant inventory
                    setMerchants(prev => prev.map(m => 
                        m.id === merchantId 
                            ? {
                                ...m,
                                inventory: {
                                    ...m.inventory,
                                    resources: m.inventory.resources?.filter(r => r.resourceType !== (itemId as keyof PlayerResources))
                                }
                            }
                            : m
                    ));
                }
            }
        }
        
        if (canAfford) {
            // Record transaction
            const transaction: IMerchantTransaction = {
                id: `transaction_${Date.now()}`,
                merchantId,
                itemType,
                itemId,
                price: item.price,
                timestamp: Date.now()
            };
            setMerchantTransactions(prev => [...prev, transaction]);
            
            // Check for first merchant encounter achievement
            if (!isAchievementUnlocked("first_merchant_encounter")) {
                updateAchievToCompleted("first_merchant_encounter");
                const achievement = achievements.find(ach => ach.id === "first_merchant_encounter");
                if (achievement) {
                    showNotification({
                        title: achievement.title,
                        description: achievement.story,
                        rewards: [],
                        type: 'achievement',
                    });
                }
            }
            
            showGeneralNotification({
                title: "Trade Successful! 💰",
                message: `You successfully traded with ${merchant.name}!`,
                type: "success",
                icon: "✅"
            });
            
            return true;
        } else {
            showGeneralNotification({
                title: "Insufficient Resources",
                message: "You don't have enough resources for this trade.",
                type: "error",
                icon: "❌"
            });
            return false;
        }
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

            // Handle research timer
            if (activeResearch && researchTimer > 0) {
                setResearchTimer(prev => {
                    const newTimer = prev - 1;
                    if (newTimer <= 0) {
                        // Research completed
                        completeResearch(activeResearch);
                        return 0;
                    }
                    return newTimer;
                });
            }

            // Handle merchant movement and removal
            const now = Date.now();
            setMerchants(prev => prev.filter(merchant => {
                if (now > merchant.nextMoveTime) {
                    // Merchant moves to a different galaxy or leaves
                    const unlockedGalaxies = galaxies.filter(g => g.found && g.id !== merchant.galaxyId);
                    if (unlockedGalaxies.length > 0 && Math.random() < 0.7) {
                        // 70% chance to move to another galaxy
                        const newGalaxy = unlockedGalaxies[Math.floor(Math.random() * unlockedGalaxies.length)];
                        moveMerchant(merchant.id, newGalaxy.id);
                        return true; // Keep the merchant
                    } else {
                        // 30% chance to leave entirely
                        showGeneralNotification({
                            title: "Merchant Departed 🚀",
                            message: `${merchant.name} has left this sector.`,
                            type: "info",
                            icon: "👋"
                        });
                        return false; // Remove the merchant
                    }
                }
                return true; // Keep the merchant
            }));

            // Handle automatic resource generation
            setMainShip(prevMainShip => {
                const updatedResources = { ...prevMainShip.resources };
                
                // Apply dev mode multiplier if active
                const devMultiplier = (isDevMode && __DEV__) ? 10 : 1;
                
                // Energy generation from reactor optimization
                const reactorLevel = upgrades.find(upgrade => upgrade.id === "reactor_optimization")?.level || 0;
                if (reactorLevel > 0) {
                    const baseEnergyRate = 1.85;
                    const energyGeneration = reactorLevel * baseEnergyRate * devMultiplier;
                    
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
                    const researchGeneration = researchLabLevel * baseResearchRate * devMultiplier;
                    
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
                        const fuelGeneration = 0.1 * quantumBonus * devMultiplier; // Small passive fuel generation
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
                        const alloyGeneration = fleetAILevel * 0.05 * devMultiplier; // Very small passive generation
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
    }, [upgrades, galaxies, moveMerchant, showGeneralNotification, activeResearch, researchTimer, completeResearch]); // Include dependencies

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
                merchants,
                merchantTransactions,
                lastMerchantSpawnTime,
                researchNodes,
                activeResearch,
                researchTimer,
                isDevMode,
                toggleDevMode,
                giveDevResources,
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
                spawnMerchant,
                moveMerchant,
                tradeMerchant,
                setMerchants,
                startMission,
                completeMission,
                cancelMission,
                canStartMission,
                canCompleteMission,
                formatTime,
                startResearch,
                completeResearch,
                updateResearchProgress,
                notification,
                showNotification,
                hideNotification,
                killNotification,
                showKillNotification,
                hideKillNotification,
                generalNotification,
                showGeneralNotification,
                hideGeneralNotification,
                combatStats,
                recordEnemyKill,
                simulateEnemyKill,
                devResetWithCompletedAchievements,
                logFoundAsteroids,
                devSpawnMerchantAt,
            }}
        >
            {children}
            
            {/* Global notification system */}
            {notification && (
                <CompletionNotification
                    visible={notification.visible}
                    title={notification.title}
                    description={notification.description}
                    rewards={notification.rewards}
                    type={notification.type}
                    onClose={hideNotification}
                />
            )}
            
            {/* Kill tracking notification */}
            {killNotification && (
                <KillTrackingNotification
                    visible={killNotification.visible}
                    enemyName={killNotification.enemyName}
                    currentKills={killNotification.currentKills}
                    targetKills={killNotification.targetKills}
                    missionTitle={killNotification.missionTitle}
                    onAnimationComplete={hideKillNotification}
                />
            )}
            
            {/* General notification */}
            {generalNotification && (
                <GeneralNotification
                    visible={generalNotification.visible}
                    title={generalNotification.title}
                    message={generalNotification.message}
                    type={generalNotification.type}
                    icon={generalNotification.icon}
                    onAnimationComplete={hideGeneralNotification}
                />
            )}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
};
