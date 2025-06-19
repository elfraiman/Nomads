import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "@/context/GameContext";
import ResourceIcon from "./ResourceIcon";
import colors from "@/utils/colors";
import { formatLargeNumber } from "@/utils/numberFormatter";

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
          {isExpanded ? "▲ Goal" : "▼ Goal"}
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
                <View style={styles.goalHeader}>
                  <ResourceIcon type={resource as keyof typeof resources} size={16} />
                  <Text style={styles.goalText}>{`${formatLargeNumber(current)}/${formatLargeNumber(goal)}`}</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[colors.successGradient[0], colors.successGradient[1]]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
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
                <View style={styles.goalHeader}>
                  <Text style={styles.upgradeIcon}>⚙️</Text>
                  <Text style={styles.upgradeText}>
                    {upgrade.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.goalText}>{`${formatLargeNumber(current)}/${formatLargeNumber(goal)}`}</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[colors.successGradient[0], colors.successGradient[1]]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
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
                <View style={styles.goalHeader}>
                  <ResourceIcon type={ship as keyof typeof ships} size={16} />
                  <Text style={styles.goalText}>{`${formatLargeNumber(current)}/${formatLargeNumber(goal)}`}</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[colors.successGradient[0], colors.successGradient[1]]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
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
    marginVertical: 6,
    borderRadius: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: colors.panelBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  goalItem: {
    marginBottom: 6,
    width: "100%",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  goalText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },
  upgradeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  upgradeText: {
    color: colors.textPrimary,
    fontSize: 10,
    flex: 1,
    marginLeft: 4,
    fontWeight: "500",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.disabled,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});

export default ActiveGoal;
