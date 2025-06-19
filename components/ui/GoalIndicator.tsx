import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "@/context/GameContext";
import ResourceIcon from "./ResourceIcon";
import colors from "@/utils/colors";
import { formatLargeNumber } from "@/utils/numberFormatter";
import { Ionicons } from "@expo/vector-icons";

const GoalIndicator = () => {
  const game = useGame();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!game) return null;

  const { resources, achievements, ships } = game;

  // Find the first incomplete goal
  const currentGoal = achievements.find((achievement) => !achievement.completed);

  if (!currentGoal) return null;

  // Helper to calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Calculate overall progress for the indicator
  const calculateOverallProgress = () => {
    let totalProgress = 0;
    let goalCount = 0;

    // Resource goals
    Object.entries(currentGoal.resourceGoals || {}).forEach(([resource, goal]) => {
      const current = resources[resource as keyof typeof resources]?.current || 0;
      totalProgress += calculateProgress(current, goal);
      goalCount++;
    });

    // Upgrade goals
    Object.entries(currentGoal.upgradeGoals || {}).forEach(([upgrade, goal]) => {
      const current = currentGoal.progress?.upgrades?.[upgrade] || 0;
      totalProgress += calculateProgress(current, goal);
      goalCount++;
    });

    // Ship goals
    Object.entries(currentGoal.shipGoals || {}).forEach(([ship, goal]) => {
      const current = currentGoal?.progress?.ships?.[ship] || 0;
      totalProgress += calculateProgress(current, goal);
      goalCount++;
    });

    return goalCount > 0 ? totalProgress / goalCount : 0;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <>
      <TouchableOpacity
        style={styles.indicator}
        onPress={() => setIsModalOpen(true)}
      >
        <View style={styles.indicatorContent}>
          <Ionicons name="flag-outline" size={10} color={colors.textSecondary} />
          <View style={styles.progressRing}>
            <LinearGradient
              colors={[colors.successGradient[0], colors.successGradient[1]]}
              start={[0, 0]}
              end={[1, 0]}
              style={[styles.progressFill, { width: `${overallProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(overallProgress)}%</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.goalTitle}>{currentGoal.title}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>{currentGoal.description}</Text>

            <View style={styles.overallProgress}>
              <Text style={styles.overallProgressText}>
                Overall Progress: {Math.round(overallProgress)}%
              </Text>
              <View style={styles.overallProgressBar}>
                <LinearGradient
                  colors={[colors.successGradient[0], colors.successGradient[1]]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[styles.overallProgressFill, { width: `${overallProgress}%` }]}
                />
              </View>
            </View>

            <View style={styles.goalsList}>
              {/* Resource Goals */}
              {Object.entries(currentGoal.resourceGoals || {}).map(([resource, goal]) => {
                const current = resources[resource as keyof typeof resources]?.current || 0;
                const progress = calculateProgress(current, goal);
                const isComplete = progress >= 100;

                return (
                  <View style={[styles.goalItem, isComplete && styles.goalItemComplete]} key={resource}>
                    <View style={styles.goalItemHeader}>
                      <ResourceIcon type={resource as keyof typeof resources} size={16} />
                      <Text style={[styles.goalItemText, isComplete && styles.goalItemTextComplete]}>
                        {formatLargeNumber(current)}/{formatLargeNumber(goal)}
                      </Text>
                      {isComplete && <Ionicons name="checkmark-circle" size={16} color={colors.successGradient[0]} />}
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={isComplete ? [colors.successGradient[0], colors.successGradient[1]] : [colors.primary, colors.primary]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>
                );
              })}

              {/* Upgrade Goals */}
              {Object.entries(currentGoal.upgradeGoals || {}).map(([upgrade, goal]) => {
                const current = currentGoal.progress?.upgrades?.[upgrade] || 0;
                const progress = calculateProgress(current, goal);
                const isComplete = progress >= 100;

                return (
                  <View style={[styles.goalItem, isComplete && styles.goalItemComplete]} key={upgrade}>
                    <View style={styles.goalItemHeader}>
                      <Text style={styles.upgradeIcon}>⚙️</Text>
                      <Text style={[styles.goalItemText, isComplete && styles.goalItemTextComplete]}>
                        {upgrade.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}: {current}/{goal}
                      </Text>
                      {isComplete && <Ionicons name="checkmark-circle" size={16} color={colors.successGradient[0]} />}
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={isComplete ? [colors.successGradient[0], colors.successGradient[1]] : [colors.primary, colors.primary]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>
                );
              })}

              {/* Ship Goals */}
              {Object.entries(currentGoal.shipGoals || {}).map(([ship, goal]) => {
                const current = currentGoal?.progress?.ships?.[ship] || 0;
                const progress = calculateProgress(current, goal);
                const isComplete = progress >= 100;

                return (
                  <View style={[styles.goalItem, isComplete && styles.goalItemComplete]} key={ship}>
                    <View style={styles.goalItemHeader}>
                      <ResourceIcon type={ship as keyof typeof ships} size={16} />
                      <Text style={[styles.goalItemText, isComplete && styles.goalItemTextComplete]}>
                        {formatLargeNumber(current)}/{formatLargeNumber(goal)}
                      </Text>
                      {isComplete && <Ionicons name="checkmark-circle" size={16} color={colors.successGradient[0]} />}
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={isComplete ? [colors.successGradient[0], colors.successGradient[1]] : [colors.primary, colors.primary]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: colors.panelBackground,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  indicatorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressRing: {
    width: 20,
    height: 8,
    backgroundColor: colors.disabledBackground,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,

    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,

    padding: 20,
    maxHeight: '80%',
    borderTopWidth: 2,
    borderTopColor: colors.glowEffect,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 18,
  },
  overallProgress: {
    marginBottom: 20,
    backgroundColor: colors.panelBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overallProgressText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  overallProgressBar: {
    height: 12,
    backgroundColor: colors.disabledBackground,
    borderRadius: 6,
    overflow: "hidden",
  },
  overallProgressFill: {
    height: "100%",
    borderRadius: 6,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    backgroundColor: colors.panelBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalItemComplete: {
    backgroundColor: colors.successGradient[0] + "20",
    borderColor: colors.successGradient[0],
  },
  goalItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalItemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  goalItemTextComplete: {
    color: colors.successGradient[0],
  },
  upgradeIcon: {
    fontSize: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.disabledBackground,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});

export default GoalIndicator; 