import { useGame } from "@/context/GameContext";
import { Upgrade } from "@/data/upgrades";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ActiveGoal from "./ui/ActiveGoal";
import ResourceIcon from "./ui/ResourceIcon";

const ShipStatus = () => {
    const game = useGame();
    const [isDronesExpanded, setIsDronesExpanded] = useState(false);

    if (!game) return null;

    const { resources, achievements, upgrades, ships } = game;

    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    const getGenerationRate = () => {
        const rate = upgrades.find((upgrade: Upgrade) => upgrade.id === "reactor_optimization")?.level;
        return rate ?? 0;
    };

    const shipCount = Object.keys(ships).length;
    const expandedHeight = shipCount * 40 + 60; // Adjust height based on number of ships

    return (
        <View style={styles.container}>
            {/* Resources Container */}
            <View style={styles.resourcesContainer}>
                {/* Energy Bar */}
                <View style={styles.energyBarContainer}>
                    <LinearGradient
                        colors={["#FFD93D", "#FFA726", "#FF5722"]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.energyBarFill, { width: `${energyPercentage}%` }]}
                    />
                    <View style={styles.energyBarTextContainer}>
                        <ResourceIcon type="energy" size={20} />
                        <Text style={styles.energyBarText}>
                            {Math.round(resources?.energy.current)}/{resources?.energy.max} ({getGenerationRate()}/sec)
                        </Text>
                    </View>
                </View>

                <View style={styles.otherResources}>
                    {/* Other Resources */}
                    {Object.entries(resources).map(([key, resource]) => {
                        if (key === "energy" || resource.locked) return null;
                        return (
                            <View style={styles.resource} key={key}>
                                <ResourceIcon type={key as keyof typeof resources} />
                                <Text style={styles.resourceText}>
                                    {Math.round(resource.current)}/{resource.max}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <ActiveGoal />
            </View>

            {/* Drones Container */}
            {ships.scanningDrones > 0 && (
                <View style={[
                    styles.shipsContainer,
                    isDronesExpanded
                        ? { height: expandedHeight, top: -expandedHeight }
                        : styles.collapsed,
                ]}
                >
                    <View style={styles.dronesContent}>
                        {isDronesExpanded && (
                            <View>
                                <Text style={styles.shipsHeader}>Drones</Text>
                                {Object.entries(ships).map(([shipType, count]) => {
                                    let allocatedDrones = 0;

                                    // Determine allocated drones based on the ship type
                                    if (shipType === "miningDrones") {
                                        allocatedDrones = Object.values(game.miningDroneAllocation).reduce((a, b) => a + b, 0);
                                    } else if (shipType === "scanningDrones") {
                                        allocatedDrones = 0; // Scanning drones are not allocated in the same way
                                    }

                                    const availableDrones = count - allocatedDrones;

                                    return (
                                        <View key={shipType} style={styles.shipItem}>
                                            <ResourceIcon
                                                type={shipType as keyof typeof ships}
                                                size={18}
                                            />
                                            <Text style={styles.shipText}>
                                                {availableDrones}/{count}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsDronesExpanded(!isDronesExpanded)}
                        style={styles.toggleButton}
                    >
                        <Text style={styles.toggleButtonText}>
                            {isDronesExpanded ? "Hide" : "Show"} Drones
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
        width: "100%",
    },
    resourcesContainer: {
        width: "100%",
        backgroundColor: "#1E1E1E",
        padding: 16,
    },
    energyBarContainer: {
        position: "relative",
        width: "100%",
        height: 20,
        backgroundColor: "#444",
        overflow: "hidden",
        borderRadius: 5,
        marginBottom: 12,
    },
    energyBarFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
    },
    energyBarTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    energyBarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
    otherResources: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    resource: {
        flexDirection: "column",
        alignItems: "center",
    },
    resourceText: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 6,
    },
    goalContainer: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: "#333",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#555",
    },
    goalText: {
        color: "#FFD93D",
        fontSize: 14,
        fontWeight: "bold",
    },
    shipsContainer: {
        position: "absolute",
        top: -40,
        right: 0,
        backgroundColor: "rgba(30, 30, 30, 0.9)",
        borderRadius: 8,
        width: 120,
        borderWidth: 1,
        borderColor: "#444",
        overflow: "hidden",
    },
    expanded: {
        height: "auto",
        paddingBottom: 40, // Ensure room for toggle butto
        top: -125,
    },
    collapsed: {
        height: 38,
    },
    dronesContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    toggleButton: {
        backgroundColor: "#444",
        padding: 10,
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    toggleButtonText: {
        color: "#FFD93D",
        fontSize: 12,
        fontWeight: "bold",
    },
    shipsHeader: {
        color: "#FFD93D",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    shipItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    shipText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default ShipStatus;
