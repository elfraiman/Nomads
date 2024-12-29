import { useGame } from "@/context/GameContext";
import { Upgrade } from "@/data/upgrades";
import { isUpgradeCoreOperationsEfficiencyCompleted } from "@/utils/gameUtils";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import ResourceIcon from "./ui/ResourceIcon";

const ShipStatus = () => {
    const game = useGame();
    if (!game) return null;

    const { resources, achievements, upgrades } = game;

    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    // Find the first incomplete achievement with either resource or upgrade goals
    const currentGoal = achievements.find((achievement) => {
        if (achievement.completed) return false;

        const hasIncompleteResourceGoals = Object.entries(achievement.resourceGoals || {}).some(
            ([resource, goal]) => (resources[resource as keyof typeof resources]?.current || 0) < goal
        );

        const hasIncompleteUpgradeGoals = Object.entries(achievement.upgradeGoals || {}).some(
            ([upgrade, goal]) => (achievement.progress.upgrades?.[upgrade] || 0) < goal
        );

        return hasIncompleteResourceGoals || hasIncompleteUpgradeGoals;
    });

    // Animation for the goal container
    const goalOpacity = useRef(new Animated.Value(0)).current;

    const getGenerationRate = () => {
        const rate = upgrades.find((upgrade: Upgrade) => upgrade.id === "reactor_optimization")?.level;
        return rate ?? 0;
    }

    useEffect(() => {
        if (currentGoal) {
            Animated.timing(goalOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }

        console.log("Current Goal: ", currentGoal, achievements);
    }, [currentGoal]);

    return (
        <View style={styles.container}>
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
                        {resources?.energy.current}/{resources?.energy.max} ({getGenerationRate()}/sec)
                    </Text>
                </View>
            </View>

            {/* Other Resources */}
            {Object.entries(resources).map(([key, resource]) => {
                if (key === "energy") return null;
                if (!isUpgradeCoreOperationsEfficiencyCompleted(achievements) && key === "solarPlasma") return null;

                return (
                    <View style={styles.resource} key={key}>
                        <ResourceIcon type={key as keyof typeof resources} />
                        <Text style={styles.text}>
                            {Math.round(resource.current)}/{resource.max}
                        </Text>
                    </View>
                );
            })}

            {/* Current Goal */}
            {currentGoal && (
                <Animated.View style={[styles.goalContainer, { opacity: goalOpacity }]}>
                    <Text style={styles.goalText}>{currentGoal.description}</Text>
                    {/* Display Resource Goals */}
                    {Object.entries(currentGoal.resourceGoals || {}).map(([resource, goal]) => (
                        <View key={resource} style={styles.resourceGoal}>
                            <ResourceIcon type={resource as keyof typeof resources} />
                            <Text style={styles.goalText}>
                                {resources[resource as keyof typeof resources]?.current || 0}/{goal}
                            </Text>
                        </View>
                    ))}

                    {/* Display Upgrade Goals */}
                    {Object.entries(currentGoal.upgradeGoals || {}).map(([upgrade, goal]) => (
                        <View key={upgrade} style={styles.upgradeGoal}>
                            <Text style={styles.goalText}>
                                {upgrade}: {currentGoal.progress.upgrades?.[upgrade] || 0}/{goal}
                            </Text>
                        </View>
                    ))}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#222",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: "#444",
        zIndex: 1000,
    },
    energyBarContainer: {
        position: "absolute",
        top: -20,
        left: 0,
        right: 0,
        height: 25,
        backgroundColor: "#444",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
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
        zIndex: 1,
    },
    energyBarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    resource: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
    },
    text: {
        color: "#fff",
        marginLeft: 5,
        fontSize: 16,
        fontWeight: "bold",
    },
    goalContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        width: "100%",
        backgroundColor: "#333",
        padding: 10,
        borderRadius: 5,
    },
    resourceGoal: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    upgradeGoal: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    goalText: {
        color: "#FFD93D", // Gold for emphasis
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
});

export default ShipStatus;
