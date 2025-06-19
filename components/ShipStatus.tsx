import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useGame } from "@/context/GameContext";
import { Upgrade } from "@/data/upgrades";
import ResourceIcon from "./ui/ResourceIcon";
import GoalIndicator from "./ui/GoalIndicator";
import colors from "@/utils/colors";
import { formatResourceDisplaySmart, formatLargeNumber } from "@/utils/numberFormatter";

const ShipStatus = () => {
    const game = useGame();
    const [isDronesExpanded, setIsDronesExpanded] = useState(false);

    if (!game) return null;

    const { resources, upgrades, ships } = game;

    // Calculate energy percentage
    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    // Get energy generation rate
    const getGenerationRate = () => {
        const reactorUpgrade = upgrades.find((upgrade: Upgrade) => upgrade.id === "reactor_optimization");
        if (reactorUpgrade?.level && reactorUpgrade.level > 0) {
            const baseEnergyRate = 1.85;
            return Math.round((reactorUpgrade.level * baseEnergyRate) * 10) / 10;
        }
        return 0;
    };

    // Get all unlocked and relevant resources
    const getDisplayableResources = () => {
        const resourceKeys = [
            'fuel', 'solarPlasma', 'alloys', 'frozenHydrogen', 'darkMatter',
            'researchPoints', 'exoticMatter', 'quantumCores', 'tokens',
            'diplomaticInfluence', 'ancientArtifacts'
        ];

        return resourceKeys
            .map(key => ({ key, resource: resources[key as keyof typeof resources] }))
            .filter(({ resource }) =>
                resource &&
                !resource.locked &&
                (resource.current > 0 || resource.max > 100)
            );
    };

    // Get friendly resource names
    const getResourceDisplayName = (key: string) => {
        const nameMap: { [key: string]: string } = {
            solarPlasma: 'Plasma',
            frozenHydrogen: 'Hydrogen',
            researchPoints: 'Research',
            exoticMatter: 'Exotic',
            quantumCores: 'Quantum',
            diplomaticInfluence: 'Diplo',
            ancientArtifacts: 'Artifacts'
        };
        return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    const displayableResources = getDisplayableResources();
    const generationRate = getGenerationRate();

    return (
        <View style={styles.container}>
            {/* Main Resources Container */}
            <View style={styles.resourcesContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Resources</Text>
                    <View style={styles.headerActions}>
                        <GoalIndicator />
                        <TouchableOpacity
                            style={styles.dronesToggle}
                            onPress={() => setIsDronesExpanded(!isDronesExpanded)}
                        >
                            <Ionicons name="construct-outline" size={12} color={colors.textSecondary} />
                            <Text style={styles.toggleText}>Drones</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Energy Section */}
                <View style={styles.energySection}>
                    <View style={styles.energyHeader}>
                        <View style={styles.energyInfo}>
                            <ResourceIcon type="energy" size={12} />
                            <Text style={styles.energyTitle}>
                                {formatResourceDisplaySmart(resources?.energy.current, resources?.energy.max)}
                            </Text>
                        </View>
                        {generationRate > 0 && (
                            <Text style={styles.generationRate}>
                                +{generationRate}/sec
                            </Text>
                        )}
                    </View>

                    <View style={styles.energyBarContainer}>
                        <LinearGradient
                            colors={["#FFA93D", "#FF7726", "#ff3860"]}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={[styles.energyBarFill, { width: `${Math.min(energyPercentage, 100)}%` }]}
                        />
                        <View style={styles.energyBarOverlay}>
                            <Text style={styles.energyPercentage}>
                                {Math.round(energyPercentage)}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Resources Scroll */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.resourcesScroll}
                    contentContainerStyle={styles.resourcesScrollContent}
                >
                    {displayableResources.map(({ key, resource }) => (
                        <View key={key} style={styles.resourceTag}>
                            <ResourceIcon type={key as keyof typeof resources} size={10} />
                            <View style={styles.resourceTagContent}>
                                <Text style={styles.resourceTagName}>
                                    {getResourceDisplayName(key)}
                                </Text>
                                <Text style={styles.resourceTagAmount}>
                                    {formatLargeNumber(resource.current)}/{formatLargeNumber(resource.max)}
                                </Text>
                                <View style={styles.resourceTagBar}>
                                    <View
                                        style={[
                                            styles.resourceTagBarFill,
                                            { width: `${Math.min((resource.current / resource.max) * 100, 100)}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Drones Panel */}
            {isDronesExpanded && (
                <View style={styles.dronesPanel}>
                    <Text style={styles.dronesPanelTitle}>Drone Fleet</Text>
                    <View style={styles.dronesGrid}>
                        {Object.entries(ships).map(([shipType, count]) => {
                            let allocatedDrones = 0;
                            if (shipType === "miningDrones") {
                                allocatedDrones = Object.values(game.miningDroneAllocation).reduce((a, b) => a + b, 0);
                            }
                            const availableDrones = count - allocatedDrones;

                            return (
                                <View key={shipType} style={styles.droneCard}>
                                    <View style={styles.droneCardHeader}>
                                        <ResourceIcon
                                            type={shipType as keyof typeof ships}
                                            size={16}
                                        />
                                        <Text style={styles.droneCardTitle}>
                                            {shipType === "miningDrones" ? "Mining" : "Scanning"}
                                        </Text>
                                    </View>
                                    <View style={styles.droneCardStats}>
                                        <Text style={styles.droneStatText}>Total: {count}</Text>
                                        <Text style={styles.droneStatText}>Available: {availableDrones}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: colors.border,
        overflow: "visible",
    },
    resourcesContainer: {
        backgroundColor: colors.background,
        padding: 8,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "bold",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    dronesToggle: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.panelBackground,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    toggleText: {
        color: colors.textSecondary,
        fontSize: 11,
        marginLeft: 3,
        fontWeight: "500",
    },

    // Energy Section
    energySection: {
        backgroundColor: colors.panelBackground,
        borderRadius: 8,
        padding: 4,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    energyHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    energyInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    energyTitle: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 6,
    },
    generationRate: {
        color: colors.successGradient[0],
        fontSize: 12,
        fontWeight: "600",
        backgroundColor: colors.background,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    energyBarContainer: {
        position: "relative",
        width: "100%",
        height: 10,
        backgroundColor: colors.disabledBackground,
        borderRadius: 4,
        overflow: "hidden",
    },
    energyBarFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 4,
    },
    energyBarOverlay: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    energyPercentage: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },

    // Resources Scroll
    resourcesScroll: {
        marginBottom: 8,
    },
    resourcesScrollContent: {
        paddingHorizontal: 4,
    },
    resourceTag: {
        backgroundColor: colors.panelBackground,
        borderRadius: 6,
        padding: 6,
        marginRight: 6,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 70,
        alignItems: "center",
    },
    resourceTagContent: {
        alignItems: "center",
    },
    resourceTagName: {
        color: colors.textPrimary,
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 2,
    },
    resourceTagAmount: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 1,
    },
    resourceTagBar: {
        width: 40,
        height: 4,
        backgroundColor: colors.disabledBackground,
        borderRadius: 1,
        overflow: "hidden",
        marginTop: 2,
    },
    resourceTagBarFill: {
        height: "100%",
        backgroundColor: colors.glowEffect,
        borderRadius: 1,
    },

    // Drones Panel
    dronesPanel: {
        backgroundColor: colors.panelBackground,
        borderRadius: 8,
        padding: 6,
        marginBottom: 8,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dronesPanelTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    dronesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    droneCard: {
        backgroundColor: colors.panelBackground,
        borderRadius: 8,
        padding: 6,
        margin: 5,
        width: "45%",
        alignItems: "center",
    },
    droneCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    droneCardTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 6,
    },
    droneCardStats: {
        alignItems: "center",
    },
    droneStatText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
    },
});

export default ShipStatus;
