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
import React, { useMemo } from "react";
import { Button, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

    // Default resource generation values for Core Operations
    const defaultResourceGenerationValue = {
        fuel: 15,
        solarPlasma: 9,
        darkMatter: 4,
        frozenHydrogen: 3,
        alloys: 2,
    };

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
        <>
            <LinearGradient
                colors={[colors.panelBackground, colors.disabledBackground]} // Very dark background with gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {/* Actions Section */}
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Actions</Text>
                        <Button title="Generate Energy" color={colors.primary} onPress={handleGenerateEnergy} />
                    </View>

                    {/* Core Operations Section */}
                    {!isGatherEnergyAchievementComplete(achievements) ? (
                        <LockedPanel title="Locked" unlockHint="Gather Energy" />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Core Operations</Text>
                            <View style={styles.cardContent}>
                                {/* Core operations Section */}
                                <Collapsible title="Generate Core Resources">
                                    <CoreOperations

                                        defaultResourceGenerationValue={defaultResourceGenerationValue}
                                        generateResource={generateResource}
                                    />
                                </Collapsible>
                            </View>
                        </View>
                    )}



                    {/* Module Upgrades Section */}
                    {!anyUpgradeUnlocked ? (
                        <LockedPanel title="Locked" unlockHint="Complete Goals" />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Module Upgrades</Text>
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
                    {!isAchievementUnlocked("upgrade_core_operations_storage") ? (
                        <LockedPanel
                            title="Locked"
                            unlockHint="Complete goals to unlock Weapon Crafting"
                        />
                    ) : (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Weapon Modules</Text>
                            <View style={styles.cardContent}>
                                {Object.entries(weaponCategories).map(([type, weapons]) => (
                                    <Collapsible key={type} title={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}>
                                        {weapons.map((weapon) => {
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
});


export default Dashboard;
