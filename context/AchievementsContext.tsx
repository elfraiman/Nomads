// src/contexts/AchievementsContext.tsx

import achievementsData, { Achievement } from "@/data/achievements";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface AchievementsContextType {
    achievements: Achievement[];
    updateProgressFromResources: (resources: Record<string, { current: number }>) => void;
    isUnlocked: (id: string) => boolean;
    isUpgradeUnlocked: (upgradeId: string) => boolean;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider = ({ children }: { children: ReactNode }) => {
    const [achievements, setAchievements] = useState<Achievement[]>(
        achievementsData.map((achievement) => ({ ...achievement, completed: false }))
    );

    const updateProgressFromResources = (resources: Record<string, { current: number }>) => {
        setAchievements((prev) =>
            prev.map((achievement) => {
                if (achievement.completed) return achievement;

                const updatedProgress = { ...achievement.progress };
                let isCompleted = true;

                for (const [resource, goal] of Object.entries(achievement.resourceGoals)) {
                    const currentResource = resources[resource]?.current || 0;
                    updatedProgress[resource] = Math.min(goal, currentResource);

                    if (updatedProgress[resource] < goal) {
                        isCompleted = false;
                    }
                }

                if (isCompleted) {
                    alert(
                        `Achievement Unlocked!, ${achievement.title}\n\n${achievement.story}`
                    );
                    return { ...achievement, progress: updatedProgress, completed: true };
                }

                return { ...achievement, progress: updatedProgress };
            })
        );
    };

    const isUnlocked = (id: string): boolean => {
        const achievement = achievements.find((ach) => ach.id === id);
        return achievement?.completed || false;
    };

    const isUpgradeUnlocked = (upgradeId: string): boolean => {
        return achievements.some(
            (achievement) =>
                achievement.unlocks.includes(upgradeId) && achievement.completed
        );
    };

    return (
        <AchievementsContext.Provider
            value={{ achievements, updateProgressFromResources, isUnlocked, isUpgradeUnlocked }}
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
