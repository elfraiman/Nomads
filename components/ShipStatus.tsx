import { Animated, View, StyleSheet, Text } from "react-native";
import { useContext, useEffect, useRef } from "react";
import { useAchievements } from "@/context/AchievementsContext";
import { GameContext } from "@/context/GameContext";
import { LinearGradient } from "expo-linear-gradient";
import ResourceIcon from "./ui/ResourceIcon";

const ShipStatus = () => {
    const game = useContext(GameContext);
    const { achievements } = useAchievements();

    if (!game) return null;

    const { resources, autoEnergyGenerationRate } = game;

    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    // Find the first incomplete achievement with multiple resources
    const currentGoal = achievements.find((achievement) =>
        Object.entries(achievement.resourceGoals).some(
            ([resource, goal]) => (resources[resource as keyof typeof resources]?.current || 0) < goal && !achievement.completed
        )
    );

    // Animation for the goal container
    const goalOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (currentGoal) {
            Animated.timing(goalOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
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
                        {resources?.energy.current}/{resources?.energy.max} ({autoEnergyGenerationRate}/sec)
                    </Text>
                </View>
            </View>

            {/* Other Resources */}
            {Object.entries(resources).map(([key, resource]) => {
                if (key === "energy") return null;

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
                    {Object.entries(currentGoal.resourceGoals).map(([resource, goal]) => (
                        <View key={resource} style={styles.resourceGoal}>
                            <ResourceIcon type={resource as keyof typeof resources} />
                            <Text style={styles.goalText}>
                                {resources[resource as keyof typeof resources]?.current || 0}/{goal}
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
    goalText: {
        color: "#FFD93D", // Gold for emphasis
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
});

export default ShipStatus;
