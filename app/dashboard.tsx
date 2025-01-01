import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import BuildOperations from "@/components/ui/BuildPanel";
import ResourceIcon from "@/components/ui/ResourceIcon";
import CoreOperations from "@/components/ui/ResourcePanel";
import { useGame } from "@/context/GameContext";
import { isGatherEnergyAchievementComplete } from "@/utils/gameUtils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Button, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const UpgradeModule = ({
    title,
    costs,
    onUpgrade,
    onRemove,
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
        !locked && (
            <Collapsible title={title}>
                <View style={styles.upgradeContainer}>
                    {locked ? (
                        <Text>Locked</Text>
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
                                <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
                                    <Ionicons name="trash" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.description}>{description}</Text>
                        </>
                    )}
                </View>
            </Collapsible>
        )
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
        ships,
    } = game;

    const handleGenerateEnergy = () => {
        const newEnergy = Math.round(resources.energy.current + 1.18);
        updateResources("energy", { current: newEnergy });
    };


    const anyUpgradeUnlocked = useMemo(() => upgrades.some((upgrade) => isUpgradeUnlocked(upgrade.id)), [achievements, upgrades]);

    // Default resource generation values for Core Operations
    const defaultResourceGenerationValue = {
        fuel: 8,
        solarPlasma: 6,
        darkMatter: 4,
        frozenHydrogen: 3,
        alloys: 2,
    };


    return (
        <>

            <LinearGradient
                colors={["#1A1C20", "#2B3035", "#3D444C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {/* Actions Section */}
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Actions</Text>
                        <Button title="Generate Energy" color="#253947" onPress={handleGenerateEnergy} />
                    </View>

                    {/* Core Operations Section */}
                    {isGatherEnergyAchievementComplete(achievements) && (
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Core Operations</Text>
                            <View style={styles.cardContent}>
                                {/* Core operations Section */}
                                <Collapsible title="Generate Core Resources">
                                    <CoreOperations
                                        resources={resources}
                                        defaultResourceGenerationValue={defaultResourceGenerationValue}
                                        generateResource={generateResource}
                                    />
                                </Collapsible>
                            </View>
                        </View>
                    )}


                    {/* Ship building Section */}
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Drone crafting</Text>
                        <View style={styles.cardContent}>
                            <Collapsible title="Worker drones">
                                <BuildOperations
                                    resources={resources}
                                    ships={ships}
                                    updateResources={updateResources}
                                    updateShips={updateShips}
                                />
                            </Collapsible>
                        </View>
                    </View>




                    {/* Module Upgrades Section */}
                    {anyUpgradeUnlocked && (
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
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    cardContent: {
        padding: 6,
    },
    description: {
        color: "#FFC857", // Light orange text for descriptions
        fontSize: 13,
        marginTop: 6,
    },
    highlight: {
        color: "#FFD700", // Bright gold color for highlights
        fontWeight: "bold",
    },
    panel: {
        backgroundColor: "#1B1B1D", // Very dark background for panels
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    panelTitle: {
        color: "#FFBF00", // Bright orange-yellow for panel titles
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textTransform: "uppercase",
    },
    upgradeContainer: {
        backgroundColor: "#222222", // Slightly lighter dark gray for contrast
        padding: 16,
        margin: 6,
        borderRadius: 8,
        borderColor: "#FFBF00", // Yellow border for contrast
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
        color: "#FFD700", // Bright gold color for resource costs
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
        borderRadius: 5,
        backgroundColor: "#253947",
        borderWidth: 2,
        borderColor: "black",
    },
    upgradeButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    deleteButton: {
        backgroundColor: "#FF3E4D", // Bright red for delete buttons
        padding: 10,
        borderRadius: 5,
    },
    disabledButton: {
        backgroundColor: "#555555", // A muted gray color for disabled state
        borderColor: "#333333", // Darker border for contrast
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
        backgroundColor: "#292B2E", // Slightly lighter dark background for expanded sections
        borderRadius: 8,
        borderColor: "#FFD700", // Bright gold border for emphasis
        borderWidth: 1,
    },
});


export default Dashboard;
