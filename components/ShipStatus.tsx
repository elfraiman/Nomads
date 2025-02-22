import { useGame } from "@/context/GameContext";
import { Upgrade } from "@/data/upgrades";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ActiveGoal from "./ui/ActiveGoal";
import ResourceIcon from "./ui/ResourceIcon";
import colors from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";

const ShipStatus = () => {
    const game = useGame();
    const [isDronesExpanded, setIsDronesExpanded] = useState(false);

    if (!game) return null;

    const { resources, upgrades, ships } = game;

    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    const getGenerationRate = () => {

        let rate = upgrades.find((upgrade: Upgrade) => upgrade.id === "reactor_optimization")?.level;
        if (rate) rate = rate * resources.energy.efficiency;

        return rate ?? 0;
    };

    const shipCount = Object.keys(ships).length;
    const expandedHeight = shipCount * 40 + 60;

    return (
        <View style={styles.container}>
            {/* Resources Container */}
            <View style={styles.resourcesContainer}>
                {/* Energy Bar */}
                <View style={styles.energyBarContainer}>
                    <LinearGradient
                        colors={["#FFA93D", "#FF7726", "#ff3860",]}
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
                    {Object.entries(resources).map(([key, resource]) => {
                        if (key === "energy") return null;

                        const formatNumber = (num: number) =>
                            num >= 1000 ? `${Math.floor(num / 1000)}k` : Math.round(num);

                        return resource.locked ? (
                            <View key={key} style={styles.resource}>
                                <Ionicons name="lock-closed" size={21} color={colors.disabledIcon} />
                                <Text style={styles.lockedText}>Locked</Text>
                            </View>
                        ) : (
                            <View style={styles.resource} key={key}>
                                <ResourceIcon size={21} type={key as keyof typeof resources} />
                                <Text style={styles.resourceText}>
                                    {formatNumber(resource.current)}/{formatNumber(resource.max)}
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
                                {Object.entries(ships).map(([shipType, totalCount]) => (
                                    <View key={shipType} style={styles.shipItem}>
                                        <ResourceIcon
                                            type={shipType as keyof typeof ships}
                                            size={18}
                                        />
                                        <Text style={styles.shipText}>
                                            {totalCount}
                                        </Text>
                                        {shipType === "miningDrones" && (
                                            <Text style={styles.allocationText}>
                                                ({Object.values(game.miningDroneAllocation).reduce((a, b) => a + b, 0)} deployed)
                                            </Text>
                                        )}
                                    </View>
                                ))}
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
        borderTopWidth: 2,
        borderTopColor: colors.glowEffect,
        shadowColor: colors.glowEffect,
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 6,
    },
    resourcesContainer: {
        width: "100%",
        backgroundColor: colors.background,
        padding: 16,
    },
    energyBarContainer: {
        position: "relative",
        width: "100%",
        height: 16,
        backgroundColor: colors.disabledBackground,
        overflow: "hidden",
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
        color: '#E0F0FFFF',
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 5,
    },
    otherResources: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    resource: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    resourceText: {
        color: colors.textPrimary,
        fontSize: 12,
    },
    lockedText: {
        color: colors.textSecondary,
        marginTop: 4,
    },
    shipsContainer: {
        position: "absolute",
        top: -40,
        right: 0,
        backgroundColor: colors.transparentBackground,
        width: 120,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
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
        padding: 10,
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    toggleButtonText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: "bold",
    },
    shipsHeader: {
        color: colors.textPrimary,
        fontSize: 16,
        marginBottom: 10,
        textAlign: "center",
    },
    shipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    shipText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    allocationText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
});


export default ShipStatus;
