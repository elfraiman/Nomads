import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "@/context/GameContext";
import ResourceIcon from "./ResourceIcon";
import colors from "@/utils/colors";

const ActiveGoal = () => {
  const game = useGame();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!game) return null;

  const { resources, achievements, ships } = game;

  // Find the first incomplete goal
  const currentGoal = achievements.find((achievement) => !achievement.completed);

  if (!currentGoal) return null;

  // Helper to calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

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
          colors={[colors.border, colors.panelBackground]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.content}
        >
          <Text style={styles.description}>{currentGoal.description}</Text>

          {/* Resource Goals */}
          {Object.entries(currentGoal.resourceGoals || {}).map(([resource, goal]) => {
            const current = resources[resource as keyof typeof resources]?.current || 0;
            const progress = calculateProgress(current, goal);
            return (
              <View style={styles.goalItem} key={resource}>
                <View style={styles.progressContainer}>
                  <Text style={styles.goalText}>
                    <ResourceIcon type={resource as keyof typeof resources} size={20} />{" "}
                    {`${current}/${goal}`}
                  </Text>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[colors.successGradient[0], colors.successGradient[1]]}
                      start={[0, 0]}
                      end={[1, 0]}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
              </View>
            );
          })}

          {/* Upgrade Goals */}
          {Object.entries(currentGoal.upgradeGoals || {}).map(([upgrade, goal]) => {
            const current = currentGoal.progress?.upgrades?.[upgrade] || 0;
            const progress = calculateProgress(current, goal);

            return (
              <View style={styles.goalItem} key={upgrade}>
                <Text style={styles.goalText}>
                  {upgrade.replace(/_/g, " ").toUpperCase()}
                </Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.goalText}>{`${current}/${goal}`}</Text>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[colors.successGradient[0], colors.successGradient[1]]}
                      start={[0, 0]}
                      end={[1, 0]}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
              </View>
            );
          })}

          {/* Ship Goals */}
          {Object.entries(currentGoal.shipGoals || {}).map(([ship, goal]) => {
            const current = currentGoal?.progress?.ships?.[ship] || 0;
            const progress = calculateProgress(current, goal);

            return (
              <View style={styles.goalItem} key={ship}>
                <View style={styles.progressContainer}>
                  <Text style={styles.goalText}>
                    <ResourceIcon type={ship as keyof typeof ships} size={20} />{" "}
                    {`${current}/${goal}`}
                  </Text>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[colors.successGradient[0], colors.successGradient[1]]}
                      start={[0, 0]}
                      end={[1, 0]}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    padding: 10,
    alignItems: "center",
    backgroundColor: colors.panelBackground,
  },
  headerText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    padding: 10,
    alignItems: "center",
  },
  description: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  progressContainer: {
    flex: 1,
    marginLeft: 10,
  },
  goalText: {
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.disabled,
    borderRadius: 4,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  noProgressText: {
    color: colors.secondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});

export default ActiveGoal;
