import { useGame } from "@/context/GameContext";
import { Upgrade } from "@/data/upgrades";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ActiveGoal from "./ui/ActiveGoal";
import ResourceIcon from "./ui/ResourceIcon";
import colors from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { formatResourceDisplaySmart, formatLargeNumber } from "@/utils/numberFormatter";

const ShipStatus = () => {
    const game = useGame();
    const [isDronesExpanded, setIsDronesExpanded] = useState(false);
    const [isAdvancedResourcesExpanded, setIsAdvancedResourcesExpanded] = useState(false);
    const [isPremiumResourcesExpanded, setIsPremiumResourcesExpanded] = useState(false);
    const [isResourcePanelExpanded, setIsResourcePanelExpanded] = useState(false);

    if (!game) return null;

    const { resources, upgrades, ships } = game;

    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    const getGenerationRate = () => {
        let level = upgrades.find((upgrade: Upgrade) => upgrade.id === "reactor_optimization")?.level;
        if (level && level > 0) {
            // Match the energy generation calculation from GameContext
            const baseEnergyRate = 1.85;
            return Math.round((level * baseEnergyRate) * 10) / 10; // Round to 1 decimal place
        }
        return 0;
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
                            {formatResourceDisplaySmart(resources?.energy.current, resources?.energy.max)} ({getGenerationRate()}/sec)
                        </Text>
                    </View>
                </View>

                {/* Compact Resource Summary - Always Visible */}
                <View style={styles.compactResourceBar}>
                    {['fuel', 'solarPlasma', 'alloys', 'frozenHydrogen', 'darkMatter'].map(key => {
                        const resource = resources[key as keyof typeof resources];
                        if (!resource || resource.locked || (resource.current === 0 && resource.max <= 100)) return null;
                        
                        return (
                            <View style={styles.compactResource} key={key}>
                                <ResourceIcon type={key as keyof typeof resources} size={12} />
                                <Text style={styles.compactResourceText}>
                                    {formatLargeNumber(resource.current)}
                                </Text>
                            </View>
                        );
                    })}
                    
                    <TouchableOpacity 
                        style={styles.expandToggle}
                        onPress={() => setIsResourcePanelExpanded(!isResourcePanelExpanded)}
                    >
                        <Ionicons 
                            name={isResourcePanelExpanded ? "chevron-up" : "chevron-down"} 
                            size={16} 
                            color={colors.textSecondary} 
                        />
                        <Text style={styles.expandToggleText}>
                            {isResourcePanelExpanded ? "Less" : "More"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Expanded Resource Panel */}
                {isResourcePanelExpanded && (
                    <View style={styles.expandedResourcePanel}>

                        {/* Advanced Resources - Collapsible */}
                        {(() => {
                            const advancedKeys = ['darkMatter', 'researchPoints', 'diplomaticInfluence'];
                            const hasAdvancedResources = advancedKeys.some(key => {
                                const resource = resources[key as keyof typeof resources];
                                return resource && !resource.locked && (resource.current > 0 || resource.max > 100);
                            });

                            if (!hasAdvancedResources) return null;

                            return (
                                <View style={styles.categoryContainer}>
                                    <TouchableOpacity 
                                        style={styles.categoryHeader}
                                        onPress={() => setIsAdvancedResourcesExpanded(!isAdvancedResourcesExpanded)}
                                    >
                                        <Text style={styles.categoryTitle}>🔬 Advanced</Text>
                                        <Ionicons 
                                            name={isAdvancedResourcesExpanded ? "chevron-up" : "chevron-down"} 
                                            size={14} 
                                            color={colors.textSecondary} 
                                        />
                                    </TouchableOpacity>
                                    {isAdvancedResourcesExpanded && (
                                        <View style={styles.categoryResources}>
                                            {advancedKeys.map(key => {
                                                const resource = resources[key as keyof typeof resources];
                                                if (!resource) return null;
                                                
                                                if (resource.locked) {
                                                    return (
                                                        <View key={key} style={styles.secondaryResource}>
                                                            <Ionicons name="lock-closed" size={10} color={colors.disabledIcon} />
                                                            <Text style={styles.lockedText}>Locked</Text>
                                                        </View>
                                                    );
                                                }
                                                
                                                if (resource.current > 0 || resource.max > 100) {
                                                    return (
                                                        <View style={styles.secondaryResource} key={key}>
                                                            <ResourceIcon type={key as keyof typeof resources} size={10} />
                                                            <Text style={styles.secondaryResourceText}>
                                                                {formatResourceDisplaySmart(resource.current, resource.max)}
                                                            </Text>
                                                        </View>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </View>
                                    )}
                                </View>
                            );
                        })()}

                        {/* Premium Resources - Collapsible */}
                        {(() => {
                            const premiumKeys = ['exoticMatter', 'quantumCores', 'ancientArtifacts'];
                            const hasPremiumResources = premiumKeys.some(key => {
                                const resource = resources[key as keyof typeof resources];
                                return resource && !resource.locked && (resource.current > 0 || resource.max > 100);
                            });

                            if (!hasPremiumResources) return null;

                            return (
                                <View style={styles.categoryContainer}>
                                    <TouchableOpacity 
                                        style={styles.categoryHeader}
                                        onPress={() => setIsPremiumResourcesExpanded(!isPremiumResourcesExpanded)}
                                    >
                                        <Text style={styles.categoryTitle}>💎 Premium</Text>
                                        <Ionicons 
                                            name={isPremiumResourcesExpanded ? "chevron-up" : "chevron-down"} 
                                            size={14} 
                                            color={colors.textSecondary} 
                                        />
                                    </TouchableOpacity>
                                    {isPremiumResourcesExpanded && (
                                        <View style={styles.categoryResources}>
                                            {premiumKeys.map(key => {
                                                const resource = resources[key as keyof typeof resources];
                                                if (!resource) return null;
                                                
                                                if (resource.locked) {
                                                    return (
                                                        <View key={key} style={styles.secondaryResource}>
                                                            <Ionicons name="lock-closed" size={10} color={colors.disabledIcon} />
                                                            <Text style={styles.lockedText}>Locked</Text>
                                                        </View>
                                                    );
                                                }
                                                
                                                if (resource.current > 0 || resource.max > 100) {
                                                    return (
                                                        <View style={styles.secondaryResource} key={key}>
                                                            <ResourceIcon type={key as keyof typeof resources} size={10} />
                                                            <Text style={styles.secondaryResourceText}>
                                                                {formatResourceDisplaySmart(resource.current, resource.max)}
                                                            </Text>
                                                        </View>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </View>
                                    )}
                                </View>
                            );
                        })()}
                    </View>
                )}

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
                                                {availableDrones}
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
        height: 20,
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
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
    primaryResources: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginBottom: 8,
    },
    primaryResource: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.panelBackground,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 80,
    },
    primaryResourceText: {
        color: colors.textPrimary,
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '600',
    },
    categoryContainer: {
        marginBottom: 6,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginBottom: 4,
    },
    categoryTitle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    categoryResources: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 8,
    },
    secondaryResource: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 65,
    },
    secondaryResourceText: {
        color: colors.textPrimary,
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '500',
    },
    compactResourceBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    compactResource: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        marginRight: 4,
    },
    compactResourceText: {
        color: colors.textPrimary,
        fontSize: 12,
        marginLeft: 3,
        fontWeight: '600',
    },
    expandToggle: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    expandToggleText: {
        color: colors.textSecondary,
        fontSize: 10,
        marginLeft: 4,
        fontWeight: '500',
    },
    expandedResourcePanel: {
        paddingTop: 4,
    },
    lockedText: {
        color: colors.textSecondary,
        fontSize: 10,
        marginLeft: 4,
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    shipText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "bold",
    },
});


export default ShipStatus;
