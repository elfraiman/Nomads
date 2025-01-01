import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "@/context/GameContext";
import ResourceIcon from "./ResourceIcon";

const ActiveGoal = () => {
  const game = useGame();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!game) return null;

  const { resources, achievements } = game;

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

  if (!currentGoal) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <Text style={styles.headerText}>
          {isExpanded ? "Hide Active Goal" : "Show Active Goal"}
        </Text>
      </TouchableOpacity>
      {isExpanded && (
        <LinearGradient
          colors={["#333", "#222"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.content}
        >
          <Text style={styles.description}>{currentGoal.description}</Text>
          {/* Resource Goals */}
          {Object.entries(currentGoal.resourceGoals || {}).map(([resource, goal]) => (
            <View style={styles.goalItem} key={resource}>
              <ResourceIcon type={resource as keyof typeof resources} size={20} />
              <Text style={styles.goalTextCentered}>
                {resources[resource as keyof typeof resources]?.current || 0}/{goal}
              </Text>
            </View>
          ))}

          {/* Upgrade Goals */}
          {Object.entries(currentGoal.upgradeGoals || {}).map(([upgrade, goal]) => (
            <View style={styles.goalItem} key={upgrade}>
              <Text style={styles.goalTextCentered}>
                {upgrade.replace(/_/g, " ").toLocaleUpperCase()}:{" "}
                {currentGoal.progress.upgrades?.[upgrade] || 0}/{goal}
              </Text>
            </View>
          ))}
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#444",
  },
  header: {
    padding: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#FFD93D",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    padding: 10,
    alignItems: "center", // Centers all child elements
  },
  description: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    width: "100%", // Prevent overflow
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",

    width: "50%", // Constrain the width
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  goalTextCentered: {
    color: "#FFD93D",
    fontSize: 14,
    textAlign: "center",
    flex: 1, // Ensures proper alignment
  },
});

export default ActiveGoal;
