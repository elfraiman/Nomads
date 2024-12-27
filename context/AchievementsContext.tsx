// src/contexts/AchievementsContext.tsx

import achievementsData, { Achievement } from "@/data/achievements";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface AchievementsContextType {
    achievementsState: Achievement[];
    updateProgressFromResources: (resources: Record<string, { current: number }>) => void;
    isUnlocked: (id: string) => boolean;
    isUpgradeUnlocked: (upgradeId: string) => boolean;
    updateProgressForUpgrade: (upgradeId: string, level: number) => void;
    setAchievementsState: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider = ({ children }: { children: ReactNode }) => {
    const [achievementsState, setAchievementsState] = useState<Achievement[]>(achievementsData.map((achievement) => ({ ...achievement, completed: false })));


    const updateProgressFromResources = (resources: Record<string, { current: number }>) => {
        setAchievementsState((prevAchievements) =>
            prevAchievements.map((achievement) => {
                // Skip completed achievements or those without resource goals
                if (achievement.completed || !achievement.resourceGoals) return achievement;

                // Initialize progress and completion status
                const updatedResourceProgress = { ...achievement.progress.resources };
                let isAchievementComplete = true;

                // Check each resource goal
                for (const [resourceName, goalAmount] of Object.entries(achievement.resourceGoals)) {
                    const currentResourceAmount = resources[resourceName]?.current || 0;

                    // Update the progress for this resource
                    updatedResourceProgress[resourceName] = Math.min(goalAmount, currentResourceAmount);

                    // If any resource goal is not met, the achievement is not complete
                    if (updatedResourceProgress[resourceName] < goalAmount) {
                        isAchievementComplete = false;
                    }
                }

                // If all resource goals are met, mark the achievement as completed
                if (isAchievementComplete) {
                    alert(`Achievement Unlocked: ${achievement.title}\n\n${achievement.story}`);
                    return {
                        ...achievement,
                        progress: {
                            ...achievement.progress,
                            resources: updatedResourceProgress,
                        },
                        completed: true,
                    };
                }

                // Update the achievement's progress without marking it as completed
                return {
                    ...achievement,
                    progress: {
                        ...achievement.progress,
                        resources: updatedResourceProgress,
                    },
                };
            })
        );
    };

    const updateProgressForUpgrade = (upgradeId: string, level: number) => {
        setAchievementsState((prevAchievements) =>
            prevAchievements.map((achievement) => {
                // Skip completed achievements or those without upgrade goals
                if (achievement.completed || !achievement.upgradeGoals) return achievement;

                // Initialize progress and completion status
                const updatedUpgradeProgress = { ...achievement.progress.upgrades };
                let isAchievementComplete = true;

                // Check each upgrade goal
                for (const [requiredUpgradeId, requiredLevel] of Object.entries(achievement.upgradeGoals)) {
                    // Determine the current level of the upgrade
                    const currentUpgradeLevel =
                        requiredUpgradeId === upgradeId
                            ? level
                            : updatedUpgradeProgress[requiredUpgradeId] || 0;

                    // Update the progress for this upgrade
                    updatedUpgradeProgress[requiredUpgradeId] = Math.min(
                        requiredLevel,
                        currentUpgradeLevel
                    );

                    // If any upgrade goal is not met, the achievement is not complete
                    if (updatedUpgradeProgress[requiredUpgradeId] < requiredLevel) {
                        isAchievementComplete = false;
                    }
                }

                // If all upgrade goals are met, mark the achievement as completed
                if (isAchievementComplete) {
                    alert(`Achievement Unlocked: ${achievement.title}\n\n${achievement.story}`);
                    return {
                        ...achievement,
                        progress: {
                            ...achievement.progress,
                            upgrades: updatedUpgradeProgress,
                        },
                        completed: true,
                    };
                }

                // Update the achievement's progress without marking it as completed
                return {
                    ...achievement,
                    progress: {
                        ...achievement.progress,
                        upgrades: updatedUpgradeProgress,
                    },
                };
            })
        );
    };

    const isUnlocked = (id: string): boolean => {
        const achievement = achievementsState.find((ach) => ach.id === id);
        return achievement?.completed || false;
    };

    const isUpgradeUnlocked = (upgradeId: string): boolean => {
        return achievementsState.some(
            (achievement) => achievement.unlocks.includes(upgradeId) && achievement.completed
        );
    };

    return (
        <AchievementsContext.Provider
            value={{
                achievementsState,
                updateProgressFromResources,
                updateProgressForUpgrade,
                isUnlocked,
                isUpgradeUnlocked,
                setAchievementsState, // Pass setAchievements
            }}
        >
            {children}
        </AchievementsContext.Provider>
    );
};


export const useAchievements = () => {
    const context = useContext(AchievementsContext);
    if (!context) throw new Error("useAchievements must be used within an AchievementsProvider");
    return context;
};
