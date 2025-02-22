import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import BuildOperations from "@/components/ui/BuildPanel";
import ResourceIcon from "@/components/ui/ResourceIcon";
import CoreOperations from "@/components/ui/ResourcePanel";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import { panelStyles } from '@/styles/dashboard/panels';
import { weaponStyles } from '@/styles/dashboard/weapons';
import colors from "@/utils/colors";
import { defaultResourceGenerationValue, PlayerResources } from "@/utils/defaults";
import { isGatherEnergyAchievementComplete } from "@/utils/gameUtils";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    // onRemove,
    description,
    locked,
    resources,
}: {
    title: string;
    costs: any[];
    onUpgrade: () => void;
    onRemove: () => void;
    description: string;
    locked: boolean;
    resources: any;
}) => {
    // Check if the player can afford the upgrade
    const canAfford = costs.every(
        (cost) => resources[cost.resourceType]?.current >= cost.amount
    );

    return (
        <Collapsible title={title}>
            <View style={styles.upgradeContainer}>
                {locked ? (
                    <LockedPanel
                        title="Locked"
                        unlockHint="Complete goals" />
                ) : (
                    <>
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
                            {/*        <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
                                <Ionicons name="trash" size={20} color={colors.textPrimary} />
                            </TouchableOpacity> */}
                        </View>
                    </>
                )}
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

const Dashboard = () => {
    const game = useGame();

    if (!game) return null;

    const {
        resources,
        upgrades,
        updateResources,
        generateResource,
        isUpgradeUnlocked,
        purchaseUpgrade,
        downgradeUpgrade,
        achievements,
        updateShips,
        mainShip,
        setMainShip,
        isAchievementUnlocked,
        ships,
        weapons
    } = game;

    const handleGenerateEnergy = () => {
        const newEnergy = Math.round(resources.energy.current + 1.18);
        updateResources("energy", { current: newEnergy });
    };


    const weaponCategories = weapons.reduce<Record<string, IWeapon[]>>((categories, weapon) => {
        // Skip weapons that have a uniqueId (they are instances)
        if (weapon.uniqueId) {
            return categories;
        }

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
            alert("Not enough resources to craft this weapon!");
            return;
        }

        // Deduct resources
        weapon.costs.forEach((cost) => {
            const currentResource = resources[cost.resourceType as keyof PlayerResources];
            if (currentResource) {
                updateResources(cost.resourceType as keyof PlayerResources, {
                    current: currentResource.current - cost.amount,
                });
            }
        });

        // Craft a new weapon with uniqueId
        game.updateWeapons(weaponId, "craft");
    };


    const anyUpgradeUnlocked = useMemo(() => upgrades.some((upgrade) => isUpgradeUnlocked(upgrade.id)), [achievements, upgrades]);



    const purchaseWeaponSlot = () => {
        const currentTokens = mainShip.resources.tokens.current; // Access tokens from mainShip

        if (currentTokens < 100) {
            alert("Not enough tokens to purchase this upgrade!");
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

        alert(`Weapon Module Slots increased to ${newSlotCount}!`);
    };

    return (
        <LinearGradient colors={[colors.panelBackground, '#000B14']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Quick Actions Panel */}
                <View style={panelStyles.quickActionsPanel}>
                    <Text style={styles.sectionTitle}>Command Center</Text>
                    <TouchableOpacity
                        style={styles.energyButton}
                        onPress={handleGenerateEnergy}
                    >
                        <LinearGradient
                            colors={['#1E90FF', '#00BFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.energyButtonGradient}
                        >
                            <Text style={styles.energyButtonText}>Generate Energy</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Core Systems */}
                {!isGatherEnergyAchievementComplete(achievements) ? (
                    <View style={styles.lockedContainer}>
                        <Text style={styles.lockedTitle}>Systems Offline</Text>
                        <Text style={styles.lockedSubtitle}>Complete initial objectives to unlock</Text>
                    </View>
                ) : (
                    <View style={panelStyles.modulePanel}>
                        <Text style={styles.sectionTitle}>Core Systems</Text>

                        <Collapsible title="Resource Generation Matrix">
                            <CoreOperations
                                defaultResourceGenerationValue={defaultResourceGenerationValue}
                                generateResource={generateResource}
                            />
                        </Collapsible>

                    </View>
                )}

                {/* Module Upgrades Section */}
                {!anyUpgradeUnlocked ? (
                    <View style={styles.lockedContainer}>
                        <Text style={styles.lockedTitle}>Systems Offline</Text>
                        <Text style={styles.lockedSubtitle}>Complete initial objectives to unlock</Text>
                    </View>
                ) : (
                    <View style={panelStyles.modulePanel}>
                        <Text style={styles.sectionTitle}>Module Upgrades</Text>
                        {upgrades.map((upgrade) => (
                            <UpgradeModule
                                key={upgrade.id}
                                title={upgrade.title}
                                costs={upgrade.costs}
                                onUpgrade={() => purchaseUpgrade(upgrade.id)}
                                onRemove={() => downgradeUpgrade(upgrade.id)}
                                description={upgrade.description(upgrade.level || 0)}
                                locked={!isUpgradeUnlocked(upgrade.id)}
                                resources={resources}
                            />
                        ))}
                    </View>
                )}

                {/* Ship building Section */}
                {!isAchievementUnlocked("upgrade_core_operations_storage") ? (
                    <View style={styles.lockedContainer}>
                        <Text style={styles.lockedTitle}>Systems Offline</Text>
                        <Text style={styles.lockedSubtitle}>Complete initial objectives to unlock</Text>
                    </View>
                ) : (
                    <View style={panelStyles.modulePanel}>
                        <Text style={styles.sectionTitle}>Drone crafting</Text>

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
                )}

                {/* Weapon Crafting Section */}
                {!isAchievementUnlocked("upgrade_core_operations_storage") ? (
                    <View style={styles.lockedContainer}>
                        <Text style={styles.lockedTitle}>Systems Offline</Text>
                        <Text style={styles.lockedSubtitle}>Complete initial objectives to unlock</Text>
                    </View>
                ) : (
                    <View style={panelStyles.modulePanel}>
                        <Text style={styles.sectionTitle}>Weapon Modules</Text>

                        {Object.entries(weaponCategories).map(([type, weapons]) => (
                            <Collapsible key={type} title={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}>
                                {weapons.map((weapon) => {
                                    if (weapon.uniqueId) {
                                        return null;
                                    }
                                    // Check if the player can afford the weapon
                                    const canAfford = weapon.costs.every(
                                        (cost) =>
                                            resources[cost.resourceType as keyof PlayerResources]?.current >= cost.amount
                                    );
                                    return (
                                        <View key={weapon.id} style={weaponStyles.weaponItem}>
                                            <View style={weaponStyles.weaponItemContent}>
                                                <Text style={weaponStyles.weaponName}>{weapon.title}</Text>
                                                <Text style={weaponStyles.description}>
                                                    {weapon.description(0)}
                                                </Text>
                                                <View style={weaponStyles.costContainer}>
                                                    {weapon.costs.map((cost, index) => (
                                                        <View key={index} style={weaponStyles.resourceContainer}>
                                                            <ResourceIcon
                                                                type={cost.resourceType as keyof PlayerResources}
                                                                size={20}
                                                            />
                                                            <Text style={weaponStyles.costText}>{cost.amount}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                                <View style={weaponStyles.buttonsContainer}>
                                                    <TouchableOpacity
                                                        onPress={() => craftWeaponModule(weapon.id)}
                                                        style={[
                                                            weaponStyles.upgradeButton,
                                                            !canAfford && weaponStyles.disabledButton,
                                                        ]}
                                                        disabled={!canAfford}
                                                    >
                                                        <Text style={weaponStyles.craftButtonText}>Manufacture</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </Collapsible>
                        ))}
                    </View>
                )}

                {/* The Shop Section */}
                {!isAchievementUnlocked("upgrade_core_operations_storage") ? (
                    <View style={styles.lockedContainer}>
                        <Text style={styles.lockedTitle}>Systems Offline</Text>
                        <Text style={styles.lockedSubtitle}>Complete initial objectives to unlock</Text>
                    </View>
                ) : (
                    <View style={panelStyles.modulePanel}>
                        <Text style={styles.sectionTitle}>The Shop</Text>
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
            <ShipStatus />
        </LinearGradient>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
    },
    scrollViewContent: {
        paddingBottom: 28,
        padding: 16,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        textTransform: 'uppercase',
        textShadowColor: '#4A90E2',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    energyButton: {
        borderRadius: 4,
        overflow: 'hidden',
        elevation: 5,
    },
    energyButtonGradient: {
        padding: 6,
        alignItems: 'center',
    },
    energyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    lockedContainer: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        borderRadius: 4,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF4444',
    },
    lockedTitle: {
        color: '#FF4444',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    lockedSubtitle: {
        color: '#888',
        fontSize: 16,
    },
    panel: {
        backgroundColor: colors.background,
        padding: 16,
        marginTop: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    panelTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textTransform: "uppercase",
    },
    upgradeContainer: {
        backgroundColor: colors.panelBackground,
        padding: 12,
        borderColor: colors.border,
        borderWidth: 1,
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
    lockedPanel: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        borderColor: '#FF4444',
    },
    lockedText: {
        color: '#888',
        fontSize: 14,
    },
    description: {
        color: colors.textPrimary,
        fontSize: 14,
        marginBottom: 10,
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
        color: colors.textPrimary,
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
        backgroundColor: '#4A90E2',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#2A3A4A',
        opacity: 0.7,
    },
    upgradeButtonText: {
        color: colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});


export default Dashboard;
