import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import ResourceButton from "@/components/ui/ResourceButton";
import ResourceIcon from "@/components/ui/ResourceIcon";
import CoreOperations from "@/components/ui/ResourcePanel";
import { useGame } from "@/context/GameContext";
import achievements from "@/data/achievements";
import { Resource } from "@/utils/defaults";
import { isGatherEnergyAchievementComplete, isUpgradeCoreOperationsEfficiencyCompleted } from "@/utils/gameUtils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
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
    );
};


const Dashboard = () => {
    const game = useGame();

    if (!game) return null;
    const [isExpanded, setIsExpanded] = useState(false);


    const {
        resources,
        upgrades,
        updateResources,
        generateResource,
        isUpgradeUnlocked,
        purchaseUpgrade,
        downgradeUpgrade,
        achievements,
    } = game;

    const handleGenerateEnergy = () => {
        const newEnergy = Math.round(resources.energy.current + 1.18);
        updateResources("energy", { current: newEnergy });
    };


    const anyUpgradeUnlocked = useMemo(() => upgrades.some((upgrade) => isUpgradeUnlocked(upgrade.id)), [upgrades]);

    // Default resource generation values for Core Operations
    const defaultResourceGenerationValue = {
        fuel: 10,
        solarPlasma: 8,
        darkMatter: 6,
        frozenHydrogen: 5,
        alloys: 7,
    };

    return (
        <>
            <ShipStatus />

            <LinearGradient
                colors={["#0F2027", "#203A43", "#2C5364"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {/* Actions Section */}
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Actions</Text>
                        <Button title="Generate Energy" color="#3A506B" onPress={handleGenerateEnergy} />
                    </View>

                    {/* Core Operations Section */}
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Core Operations</Text>
                        <View style={styles.cardContent}>
                            {/* Core operations Section */}
                            {isGatherEnergyAchievementComplete(achievements) && (
                                <Collapsible title="Generate">
                                    <CoreOperations
                                        resources={resources}
                                        defaultResourceGenerationValue={defaultResourceGenerationValue}
                                        generateResource={generateResource}
                                    />
                                </Collapsible>
                            )}


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
        color: "#DDD",
        fontSize: 12,
    },
    highlight: {
        color: "#FFF",
        fontWeight: "bold",
    },
    panel: {
        backgroundColor: "#1E1E2E",
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    panelTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textTransform: "uppercase",
    },
    upgradeContainer: {
        backgroundColor: "#282A36",
        padding: 16,
        margin: 6,
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
        color: "#FFFA",
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
        backgroundColor: "#1B3B6F", // Space Sapphire
        borderWidth: 2,
        borderColor: "#87CEEB", // Complementary Sky Blue for accents
    },
    upgradeButtonText: {
        color: "#FFFFFF", // White text for contrast
        fontWeight: "bold",
        textAlign: "center",
    },
    deleteButton: {
        backgroundColor: "#FF3E4D",
        padding: 10,
        borderRadius: 5,
    },
    disabledButton: {
        backgroundColor: "#555", // A muted gray color for disabled state
        borderColor: "#333", // Darker border for contrast
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
        backgroundColor: "#282A36", // Background for the expanded section
        borderRadius: 8,
    },

});

export default Dashboard;
