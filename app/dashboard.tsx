import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import BuildOperations from "@/components/ui/BuildPanel";
import ResourceIcon from "@/components/ui/ResourceIcon";
import CoreOperations from "@/components/ui/ResourcePanel";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import colors from "@/utils/colors";
import { PlayerResources } from "@/utils/defaults";
import { isGatherEnergyAchievementComplete } from "@/utils/gameUtils";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import { Button, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View, PanResponder, Animated } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const LockedPanel = ({ title, unlockHint }: { title: string; unlockHint: string }) => (
    <View style={[styles.panel, styles.lockedPanel]}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.lockedText}>{unlockHint}</Text>
    </View>
);

const UpgradeModule = ({
    title,
    costs,
    onUpgrade,
    description,
    resources,
}: {
    title: string;
    costs: any[];
    onUpgrade: () => void;
    description: string;
    resources: any;
}) => {
    // Check if the player can afford the upgrade
    const canAfford = costs.every(
        (cost) => resources[cost.resourceType]?.current >= cost.amount
    );

    return (
        <Collapsible title={title}>
            <View style={styles.upgradeContainer}>
                <View style={styles.costContainer}>
                    <Text style={styles.costText}>Cost:</Text>
                    {costs.map((cost, index) => (
                        <View key={index} style={styles.resourceContainer}>
                            <ResourceIcon type={cost.resourceType} size={20} />
                            <Text style={styles.costText}>{cost.amount}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.description}>{description}</Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        onPress={onUpgrade}
                        style={[
                            styles.upgradeButton,
                            !canAfford && styles.disabledButton,
                        ]}
                        disabled={!canAfford}
                    >
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Collapsible>
    );
};

const ShopItem = ({
    title,
    cost,
    onPurchase,
    description,
    locked,
    tokens,
}: {
    title: string;
    cost: number;
    onPurchase: () => void;
    description: string;
    locked: boolean;
    tokens: number;
}) => {
    const canAfford = tokens >= cost;

    return (
        <Collapsible title={title}>
            <View style={styles.shopItemContainer}>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.costContainer}>
                    <Text style={styles.costText}>Cost: {cost} Tokens</Text>
                </View>
                <TouchableOpacity
                    onPress={onPurchase}
                    style={[styles.purchaseButton, !canAfford && styles.disabledButton]}
                    disabled={!canAfford}
                >
                    <Text style={styles.purchaseButtonText}>Purchase</Text>
                </TouchableOpacity>
            </View>
        </Collapsible>
    );
};

const DevPanel = () => {
    const game = useGame();
    const { isDevMode, toggleDevMode, giveDevResources } = game;

    // Only show dev panel in development mode
    if (!__DEV__) return null;

    return (
        <View style={styles.devPanel}>
            <Text style={styles.devPanelTitle}>🔧 Developer Panel</Text>
            <View style={styles.devControls}>
                <TouchableOpacity
                    onPress={toggleDevMode}
                    style={[
                        styles.devButton,
                        isDevMode ? styles.devButtonActive : styles.devButtonInactive
                    ]}
                >
                    <Text style={styles.devButtonText}>
                        Dev Mode: {isDevMode ? 'ON' : 'OFF'}
                    </Text>
                </TouchableOpacity>

                {isDevMode && (
                    <TouchableOpacity
                        onPress={giveDevResources}
                        style={[styles.devButton, styles.devButtonResource]}
                    >
                        <Text style={styles.devButtonText}>Give Resources</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isDevMode && (
                <Text style={styles.devStatusText}>
                    🚀 Resource generation is 10x faster!
                </Text>
            )}
        </View>
    );
};

const Dashboard = () => {
    const game = useGame();
    const [isGenerating, setIsGenerating] = useState(false);
    const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const borderAnimationRef = useRef(new Animated.Value(0)).current;

    if (!game) return null;

    const {
        resources,
        upgrades,
        updateResources,
        generateResource,
        isUpgradeUnlocked,
        purchaseUpgrade,
        achievements,
        updateShips,
        mainShip,
        setMainShip,
        isAchievementUnlocked,
        ships,
        weapons,
        showGeneralNotification,
        combatStats
    } = game;

    const handleGenerateEnergy = React.useCallback(() => {
        // Use setMainShip to get fresh values
        setMainShip((prev) => {
            const newCurrent = Math.min(prev.resources.energy.max, prev.resources.energy.current + 1);
            console.log(`Generating energy: ${prev.resources.energy.current} -> ${newCurrent}`);
            return {
                ...prev,
                resources: {
                    ...prev.resources,
                    energy: {
                        ...prev.resources.energy,
                        current: newCurrent
                    }
                }
            };
        });
    }, [setMainShip]);

    const startEnergyGeneration = React.useCallback(() => {
        console.log("startEnergyGeneration called, isGenerating:", isGenerating);
        if (isGenerating) return;

        console.log("Starting energy generation");
        setIsGenerating(true);

        // Start border animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(borderAnimationRef, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: false,
                }),
                Animated.timing(borderAnimationRef, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: false,
                }),
            ])
        ).start();

        // Generate immediately on press
        handleGenerateEnergy();

        // Then continue generating every 0.5 seconds
        generationIntervalRef.current = setInterval(() => {
            // Use setMainShip to get fresh values from the state
            setMainShip((prev) => {
                const newCurrent = Math.min(prev.resources.energy.max, prev.resources.energy.current + 1);
                return {
                    ...prev,
                    resources: {
                        ...prev.resources,
                        energy: {
                            ...prev.resources.energy,
                            current: newCurrent
                        }
                    }
                };
            });
        }, 200);
    }, [isGenerating, handleGenerateEnergy, setMainShip, borderAnimationRef]);

    const stopEnergyGeneration = React.useCallback(() => {
        console.log("stopEnergyGeneration called");
        setIsGenerating(false);

        // Stop border animation
        borderAnimationRef.stopAnimation();
        borderAnimationRef.setValue(0);

        if (generationIntervalRef.current) {
            console.log("Clearing energy generation interval");
            clearInterval(generationIntervalRef.current);
            generationIntervalRef.current = null;
        }
    }, [borderAnimationRef]);

    // Cleanup interval on unmount
    React.useEffect(() => {
        return () => {
            if (generationIntervalRef.current) {
                clearInterval(generationIntervalRef.current);
            }
        };
    }, []);

    const weaponCategories = weapons.reduce<Record<string, IWeapon[]>>((categories, weapon) => {
        const type = weapon.weaponDetails.type;

        if (!categories[type]) {
            categories[type] = [];
        }

        categories[type].push(weapon);

        return categories;
    }, {});

    const craftWeaponModule = (weaponId: string) => {
        const weapon = weapons.find((w) => w.id === weaponId);
        if (!weapon) return;

        // Check if the player has enough resources
        const canAfford = weapon.costs.every(
            (cost) => resources[cost.resourceType as keyof PlayerResources]?.current >= cost.amount
        );

        if (!canAfford) {
            showGeneralNotification({
                title: "Insufficient Resources",
                message: "Not enough resources to craft this weapon!",
                type: "error",
                icon: "⚔️"
            });
            return;
        }

        // Deduct resources
        weapon.costs.forEach((cost) => {
            const currentResource = resources[cost.resourceType as keyof PlayerResources];
            if (currentResource) {
                updateResources(cost.resourceType as keyof PlayerResources, {
                    current: currentResource.current - cost.amount,
                    max: currentResource.max,
                });
            }
        });

        // Add the crafted weapon to the player's inventory
        const existingWeapon = weapons.find((w) => w.id === weaponId);
        if (existingWeapon) {
            // Update the weapon count by adding 1 to the current amount
            game.updateWeapons(
                existingWeapon.id,
                existingWeapon.amount + 1 // Add 1 to the current amount
            );
        }
    };


    const anyUpgradeUnlocked = useMemo(() => upgrades.some((upgrade) => isUpgradeUnlocked(upgrade.id)), [achievements, upgrades]);

    // Progressive weapon unlocking system
    const getUnlockedWeapons = useMemo(() => {
        const unlockedWeapons = new Set<string>();

        // Always unlock light/small weapons when exploration is unlocked
        if (isAchievementUnlocked("build_scanning_drones")) {
            unlockedWeapons.add("light_plasma_blaster");
            unlockedWeapons.add("light_pulse_laser");
            unlockedWeapons.add("light_rocket_launcher");
            unlockedWeapons.add("light_railgun");
        }

        // Unlock medium weapons based on combat experience
        const totalKills = combatStats.totalKills || 0;
        if (totalKills >= 10) {
            unlockedWeapons.add("medium_plasma_blaster");
            unlockedWeapons.add("medium_beam_laser");
            unlockedWeapons.add("medium_missile_launcher");
            unlockedWeapons.add("medium_railgun");
        }

        // Unlock heavy weapons for experienced players
        if (totalKills >= 50) {
            unlockedWeapons.add("heavy_plasma_blaster");
            unlockedWeapons.add("heavy_beam_laser");
            unlockedWeapons.add("heavy_missile_launcher");
            unlockedWeapons.add("heavy_railgun");
        }

        return unlockedWeapons;
    }, [isAchievementUnlocked, combatStats]);

    // Default resource generation values for Core Operations
    const defaultResourceGenerationValue = {
        fuel: 25,
        solarPlasma: 15,
        darkMatter: 8,
        frozenHydrogen: 6,
        alloys: 4,
    };

    const purchaseWeaponSlot = () => {
        const currentTokens = mainShip.resources.tokens.current; // Access tokens from mainShip

        if (currentTokens < 100) {
            showGeneralNotification({
                title: "Insufficient Tokens",
                message: "Not enough tokens to purchase this upgrade!",
                type: "error",
                icon: "🪙"
            });
            return;
        }

        const newSlotCount = mainShip.maxWeaponSlots + 1;

        // Deduct tokens and apply the upgrade
        setMainShip((prev) => ({
            ...prev,
            maxWeaponSlots: newSlotCount,
            resources: {
                ...prev.resources,
                tokens: {
                    ...prev.resources.tokens,
                    current: currentTokens - 100, // Deduct the cost
                },
            },
        }));

        showGeneralNotification({
            title: "Upgrade Complete!",
            message: `Weapon Module Slots increased to ${newSlotCount}!`,
            type: "success",
            icon: "⚡"
        });
    };

    return (
        <>
            <LinearGradient
                colors={[colors.panelBackground, colors.disabledBackground]} // Very dark background with gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <DevPanel />

                    {/* Actions Section */}
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Actions</Text>
                        <Animated.View
                            style={[
                                styles.energyButton,
                                isGenerating && styles.energyButtonActive,
                                resources.energy.current >= resources.energy.max && styles.energyButtonDisabled,
                                styles.energyButtonTouch,
                                isGenerating && {
                                    borderWidth: 3,
                                    borderColor: borderAnimationRef.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['rgba(0, 150, 255, 0.3)', 'rgba(0, 150, 255, 1)']
                                    }),
                                    shadowColor: borderAnimationRef.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['rgba(0, 150, 255, 0)', 'rgba(0, 150, 255, 0.8)']
                                    }),
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowRadius: borderAnimationRef.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 15]
                                    }),
                                    elevation: borderAnimationRef.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 10]
                                    }),
                                }
                            ]}
                        >
                            <TouchableOpacity
                                onPressIn={() => {
                                    console.log("TouchableOpacity: onPressIn");
                                    startEnergyGeneration();
                                }}
                                onPressOut={() => {
                                    console.log("TouchableOpacity: onPressOut");
                                    stopEnergyGeneration();
                                }}
                                disabled={resources.energy.current >= resources.energy.max}
                                style={styles.energyButtonInner}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.energyButtonText,
                                    resources.energy.current >= resources.energy.max && styles.energyButtonTextDisabled
                                ]}>
                                    {isGenerating ? "Generating Energy..." : "Hold to Generate Energy"}
                                </Text>
                                <Text style={styles.energyButtonSubtext}>
                                    +1 Energy per 0.3s
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Core Operations Section */}
                    {!isGatherEnergyAchievementComplete(achievements) ? (
                        <LockedPanel title="Locked" unlockHint="Gather Energy" />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Core Operations</Text>
                            <View style={styles.cardContent}>
                                <CoreOperations
                                    defaultResourceGenerationValue={{
                                        fuel: 8,           // Increased from 3 to 8
                                        solarPlasma: 5,    // Increased from 2 to 5
                                        researchPoints: 2, // Increased from 1 to 2
                                        exoticMatter: 2,   // Increased from 1 to 2
                                        quantumCores: 1,   // Kept at 1 (end-game resource)
                                    }}
                                    generateResource={generateResource}
                                />
                            </View>
                        </View>
                    )}



                    {/* Module Upgrades Section */}
                    {!anyUpgradeUnlocked ? (
                        <LockedPanel title="Locked" unlockHint="Complete Goals" />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Module Upgrades</Text>
                            {upgrades
                                .filter((upgrade) => isUpgradeUnlocked(upgrade.id)) // Only show unlocked upgrades
                                .map((upgrade) => (
                                    <UpgradeModule
                                        key={upgrade.id}
                                        title={upgrade.title}
                                        costs={upgrade.costs}
                                        onUpgrade={() => purchaseUpgrade(upgrade.id)}
                                        description={upgrade.description(upgrade.level || 0)}
                                        resources={resources}
                                    />
                                ))}

                            {/* Show hint about locked upgrades */}
                            {upgrades.some(upgrade => !isUpgradeUnlocked(upgrade.id)) && (
                                <View style={styles.moreContentHint}>
                                    <Text style={styles.moreContentIcon}>🔮</Text>
                                    <Text style={styles.moreContentText}>
                                        More modules will unlock as you progress...
                                    </Text>
                                    <Text style={styles.moreContentSubtext}>
                                        Complete achievements to discover new upgrades!
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}


                    {/* Ship building Section */}
                    {!isAchievementUnlocked("upgrade_core_operations_storage") ? (
                        <LockedPanel
                            title="Locked"
                            unlockHint="Complete goals" />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Drone crafting</Text>
                            <View style={styles.cardContent}>
                                <Collapsible title="Worker drones">
                                    <BuildOperations
                                        game={game}
                                        resources={resources}
                                        ships={ships}
                                        updateResources={updateResources}
                                        updateShips={updateShips}
                                    />
                                </Collapsible>
                            </View>
                        </View>
                    )}

                    {/* Weapon Crafting Section */}
                    {!isAchievementUnlocked("build_scanning_drones") ? (
                        <LockedPanel
                            title="Weapon Modules - Locked"
                            unlockHint="Build 5 Scanning Drones to unlock basic weapon crafting"
                        />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Weapon Modules</Text>
                            <View style={styles.cardContent}>
                                {Object.entries(weaponCategories)
                                    .filter(([type, weapons]) =>
                                        weapons.some(weapon =>
                                            getUnlockedWeapons.has(weapon.id) || weapon.amount > 0
                                        )
                                    ) // Only show categories with unlocked or available weapons
                                    .map(([type, weapons]) => (
                                        <Collapsible key={type} title={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}>
                                            {weapons
                                                .filter(weapon => getUnlockedWeapons.has(weapon.id) || weapon.amount > 0)
                                                .map((weapon) => {
                                                    // Check if the player can afford the weapon
                                                    const canAfford = weapon.costs.every(
                                                        (cost) =>
                                                            resources[cost.resourceType as keyof PlayerResources]?.current >= cost.amount
                                                    );
                                                    return (
                                                        <View key={weapon.id} style={styles.weaponItem}>
                                                            <ImageBackground
                                                                source={weapon.icon} // Weapon icon as background
                                                                style={styles.weaponItemBackground} // Background styles
                                                                imageStyle={styles.weaponItemImageStyle} // Ensure image fits the card
                                                            >
                                                                <View style={styles.weaponItemContent}>
                                                                    <Text style={styles.weaponName}>{weapon.title}</Text>
                                                                    <Text style={styles.description}>
                                                                        {weapon.description(weapon.amount || 0)}
                                                                    </Text>
                                                                    <View style={styles.costContainer}>
                                                                        {weapon.costs.map((cost, index) => (
                                                                            <View key={index} style={styles.resourceContainer}>
                                                                                <ResourceIcon
                                                                                    type={cost.resourceType as keyof PlayerResources}
                                                                                    size={20}
                                                                                />
                                                                                <Text style={styles.costText}>{cost.amount}</Text>
                                                                            </View>
                                                                        ))}
                                                                    </View>
                                                                    <View style={styles.buttonsContainer}>
                                                                        <TouchableOpacity
                                                                            onPress={() => craftWeaponModule(weapon.id)}
                                                                            style={[
                                                                                styles.upgradeButton,
                                                                                !canAfford && styles.disabledButton,
                                                                            ]}
                                                                            disabled={!canAfford}
                                                                        >
                                                                            <Text style={styles.craftButtonText}>Manufacture</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            </ImageBackground>
                                                        </View>
                                                    );
                                                })}
                                        </Collapsible>
                                    ))}

                                {/* Weapon Progression Info */}
                                <View style={styles.progressionInfo}>
                                    <Text style={styles.progressionTitle}>🎯 Weapon Progression</Text>
                                    <Text style={styles.progressionText}>
                                        Combat Kills: {combatStats.totalKills || 0}
                                    </Text>
                                    {(combatStats.totalKills || 0) < 10 && (
                                        <Text style={styles.progressionHint}>
                                            🔓 Medium weapons unlock at 10 kills
                                        </Text>
                                    )}
                                    {(combatStats.totalKills || 0) >= 10 && (combatStats.totalKills || 0) < 50 && (
                                        <Text style={styles.progressionHint}>
                                            🔓 Heavy weapons unlock at 50 kills
                                        </Text>
                                    )}
                                    {(combatStats.totalKills || 0) >= 50 && (
                                        <Text style={styles.progressionComplete}>
                                            ✅ All weapon tiers unlocked!
                                        </Text>
                                    )}
                                </View>

                                {/* Show hint about more weapon categories */}
                                {Object.entries(weaponCategories).some(([type, weapons]) =>
                                    weapons.some(weapon => !getUnlockedWeapons.has(weapon.id) && weapon.amount === 0)
                                ) && (
                                        <View style={styles.moreContentHint}>
                                            <Text style={styles.moreContentIcon}>⚔️</Text>
                                            <Text style={styles.moreContentText}>
                                                More weapon tiers await unlocking...
                                            </Text>
                                            <Text style={styles.moreContentSubtext}>
                                                Gain combat experience to unlock advanced weapons!
                                            </Text>
                                        </View>
                                    )}
                            </View>
                        </View>
                    )}

                    {/* The Shop Section */}
                    {!isAchievementUnlocked("upgrade_core_operations_storage") ? (
                        <LockedPanel
                            title="Locked"
                            unlockHint="The Shop is locked until you complete goals"
                        />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>The Shop</Text>
                            <ShopItem
                                title="Extra Weapon Module Slot"
                                cost={100}
                                onPurchase={purchaseWeaponSlot}
                                description="Expand your ship's weapon capabilities by adding an additional module slot."
                                locked={false} // Future upgrades could have conditions to unlock
                                tokens={mainShip.resources.tokens.current}
                            />
                        </View>
                    )}


                </ScrollView>
            </LinearGradient>
            <ShipStatus />
        </>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        padding: 6,
        paddingTop: 16,
    },
    weaponItem: {
        marginBottom: 12,
        overflow: "hidden", // Ensures the background doesn't overflow the container
    },
    weaponItemBackground: {
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    shopItemContainer: {
        backgroundColor: colors.panelBackground,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    purchaseButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        marginTop: 10,
    },
    purchaseButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    tokensText: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 10,
    },
    weaponItemImageStyle: {
        resizeMode: "cover", // Ensures the image fills the card
        width: "100%", // Matches the card's width
        height: "100%", // Matches the card's height
        opacity: 0.3, // Adjust for readability
    },
    weaponItemContent: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
    },
    weaponName: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    cardContent: {
        paddingVertical: 8,

    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,

        marginBottom: 8,
    },
    craftButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    repairButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    craftButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
    highlight: {
        color: colors.secondary, // Bright gold color for highlights
        fontWeight: "bold",
    },
    panel: {
        backgroundColor: colors.background, // Very dark background for panels
        padding: 16,
        marginTop: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    panelTitle: {
        color: colors.textPrimary, // Bright orange-yellow for panel titles
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textTransform: "uppercase",
    },
    upgradeContainer: {
        backgroundColor: colors.panelBackground, // Slightly lighter dark gray for contrast
        padding: 16,
        margin: 6,
        borderColor: colors.border, // Yellow border for contrast
        borderWidth: 1,
    },
    costContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    resourceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    costText: {
        color: colors.textPrimary, // Bright gold color for resource costs
        fontSize: 14,
        marginLeft: 4,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    upgradeButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: "black",
    },
    lockedPanel: {
        backgroundColor: colors.lockedBackground,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 16,
        marginVertical: 10,
    },
    lockedText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 10,
        textAlign: "center",
    },
    upgradeButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    deleteButton: {
        backgroundColor: colors.error, // Bright red for delete buttons
        padding: 10,
    },
    disabledButton: {
        backgroundColor: colors.disabledBackground, // A muted gray color for disabled state
        borderColor: colors.disabledBorder, // Darker border for contrast
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    chevronButton: {
        marginLeft: 10,
        padding: 4,
    },
    expandedContainer: {
        marginTop: 6,
        padding: 6,
        backgroundColor: colors.panelBackground, // Slightly lighter dark background for expanded sections
        borderColor: colors.border, // Bright gold border for emphasis
        borderWidth: 1,
    },
    // Dev Panel Styles
    devPanel: {
        backgroundColor: colors.primary,
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.secondary,
    },
    devPanelTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    devControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 8,
    },
    devButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
    },
    devButtonActive: {
        backgroundColor: colors.secondary,
        borderColor: 'white',
    },
    devButtonInactive: {
        backgroundColor: colors.disabledBackground,
        borderColor: colors.disabledBorder,
    },
    devButtonResource: {
        backgroundColor: colors.error,
        borderColor: 'white',
    },
    devButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    devStatusText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 4,
    },
    // More content hint styles
    moreContentHint: {
        backgroundColor: colors.panelBackground,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        padding: 16,
        marginTop: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    moreContentIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    moreContentText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    moreContentSubtext: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    progressionInfo: {
        backgroundColor: colors.panelBackground,
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    progressionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 6,
    },
    progressionText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    progressionHint: {
        fontSize: 12,
        color: colors.warning,
        fontStyle: 'italic',
    },
    progressionComplete: {
        fontSize: 12,
        color: colors.successGradient[0],
        fontWeight: 'bold',
    },
    // Energy Button Styles
    energyButton: {
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.border,
        marginTop: 8,
        overflow: 'hidden',
    },
    energyButtonActive: {
        backgroundColor: colors.secondary,
        borderColor: colors.glowEffect,
        shadowColor: colors.glowEffect,
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 6,
    },
    energyButtonDisabled: {
        backgroundColor: colors.disabledBackground,
        borderColor: colors.disabledBorder,
    },
    energyButtonTouch: {
        // Removed padding and alignItems as they're now in energyButtonInner
    },
    energyButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    energyButtonTextDisabled: {
        color: colors.disabledText,
    },
    energyButtonSubtext: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
        fontStyle: 'italic',
    },
    energyButtonInner: {
        width: '100%',
        alignItems: 'center',
        padding: 16,
    },
});


export default Dashboard;
