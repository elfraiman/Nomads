import { Achievement } from "@/data/achievements";

/**
 * Checks if the "gather_100_energy" achievement is completed.
 * @param achievements - List of achievements
 * @returns True if the achievement is completed, otherwise false
 */
export const isGatherEnergyAchievementComplete = (achievements: Achievement[]): boolean => {
  const achievement = achievements.find((ach) => ach.id === "gather_100_energy");
  return achievement?.completed ?? false;
};

/**
 * Checks if the "upgrade_core_operations_efficiency" achievement is completed.
 * @param achievements - List of achievements
 * @returns True if the achievement is completed, otherwise false
 */
export const isUpgradeCoreOperationsEfficiencyCompleted = (achievements: Achievement[]): boolean => {
  const achievement = achievements.find((ach) => ach.id === "upgrade_core_operations_efficiency");
  return achievement?.completed ?? false;
};
