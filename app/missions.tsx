import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext";
import colors from "@/utils/colors";
import { IMission, Ships } from "@/utils/defaults";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

const MissionCard = ({ mission, onStart, onCancel, timer, cooldown, canStart }: {
    mission: IMission;
    onStart: () => void;
    onCancel: () => void;
    timer?: number;
    cooldown?: number;
    canStart: boolean;
}) => {
    const { formatTime } = useGame()!;
    
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy": return "#4CAF50";
            case "Medium": return "#FF9800";
            case "Hard": return "#F44336";
            case "Extreme": return "#9C27B0";
            default: return colors.textSecondary;
        }
    };

    const getStatusText = () => {
        if (mission.active && timer) {
            return `Active - ${formatTime(timer)} remaining`;
        }
        if (cooldown && cooldown > 0) {
            return `Cooldown - ${formatTime(cooldown)}`;
        }
        if (mission.completed && !mission.repeatable) {
            return "Completed";
        }
        return "Available";
    };

    const getStatusColor = () => {
        if (mission.active) return "#4CAF50";
        if (cooldown && cooldown > 0) return "#FF9800";
        if (mission.completed && !mission.repeatable) return "#9E9E9E";
        return colors.primary;
    };

    return (
        <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
                <View>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    <Text style={[styles.missionDifficulty, { color: getDifficultyColor(mission.difficulty) }]}>
                        {mission.difficulty}
                    </Text>
                </View>
                <Text style={[styles.missionStatus, { color: getStatusColor() }]}>
                    {getStatusText()}
                </Text>
            </View>

            <Text style={styles.missionDescription}>{mission.description}</Text>

            {/* Requirements */}
            <Collapsible title="Requirements">
                <View style={styles.requirementsContainer}>
                    {Object.entries(mission.requirements).map(([key, value]) => {
                        if (key === 'ships') {
                            const shipReqs = value as Partial<Ships>;
                            return Object.entries(shipReqs).map(([shipType, count]) => (
                                <View key={`${key}-${shipType}`} style={styles.resourceContainer}>
                                    <ResourceIcon type={shipType as any} size={20} />
                                    <Text style={styles.requirementText}>{count || 0} {shipType}</Text>
                                </View>
                            ));
                        }
                        if (typeof value === 'number') {
                            return (
                                <View key={key} style={styles.resourceContainer}>
                                    <ResourceIcon type={key as any} size={20} />
                                    <Text style={styles.requirementText}>{value}</Text>
                                </View>
                            );
                        }
                        return null;
                    })}
                </View>
            </Collapsible>

            {/* Rewards */}
            <Collapsible title="Rewards">
                <View style={styles.rewardsContainer}>
                    {Object.entries(mission.rewards).map(([key, value]) => {
                        if (key === 'experience' && typeof value === 'number') {
                            return (
                                <View key={key} style={styles.resourceContainer}>
                                    <Text style={styles.rewardText}>⭐ {value} XP</Text>
                                </View>
                            );
                        }
                        if (key === 'unlocks' && Array.isArray(value)) {
                            return value.map((unlock, index) => (
                                <View key={`${key}-${index}`} style={styles.resourceContainer}>
                                    <Text style={styles.rewardText}>🔓 {unlock}</Text>
                                </View>
                            ));
                        }
                        if (typeof value === 'number') {
                            return (
                                <View key={key} style={styles.resourceContainer}>
                                    <ResourceIcon type={key as any} size={20} />
                                    <Text style={styles.rewardText}>+{value}</Text>
                                </View>
                            );
                        }
                        return null;
                    })}
                </View>
            </Collapsible>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {mission.active ? (
                    <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel Mission</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        onPress={onStart} 
                        style={[styles.startButton, !canStart && styles.disabledButton]}
                        disabled={!canStart}
                    >
                        <Text style={styles.buttonText}>
                            {mission.completed && !mission.repeatable ? "Completed" : "Start Mission"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Mission Progress (for multi-step missions) */}
            {mission.steps && (
                <Collapsible title="Progress">
                    <View style={styles.progressContainer}>
                        {mission.steps.map((step, index) => (
                            <View key={index} style={styles.stepContainer}>
                                <Text style={[
                                    styles.stepText,
                                    index < (mission.progress || 0) ? styles.completedStep : styles.pendingStep
                                ]}>
                                    {index < (mission.progress || 0) ? "✓" : "○"} {step}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Collapsible>
            )}
        </View>
    );
};

const MissionsPage = () => {
    const game = useGame();
    
    if (!game) return null;

    const { 
        missions, 
        activeMissions, 
        missionTimers, 
        missionCooldowns, 
        startMission, 
        cancelMission, 
        canStartMission 
    } = game;

    const availableMissions = missions.filter(m => !m.active && (!m.completed || m.repeatable));
    const completedMissions = missions.filter(m => m.completed && !m.repeatable);

    return (
        <>
            <LinearGradient
                colors={[colors.background, '#000814']}
                style={styles.container}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                    
                    {/* Active Missions */}
                    {activeMissions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Active Missions ({activeMissions.length})</Text>
                            {activeMissions.map(mission => (
                                <MissionCard
                                    key={mission.id}
                                    mission={mission}
                                    onStart={() => {}}
                                    onCancel={() => cancelMission(mission.id)}
                                    timer={missionTimers[mission.id]}
                                    canStart={false}
                                />
                            ))}
                        </View>
                    )}

                    {/* Available Missions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Missions ({availableMissions.length})</Text>
                        {availableMissions.map(mission => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                onStart={() => startMission(mission.id)}
                                onCancel={() => {}}
                                cooldown={missionCooldowns[mission.id]}
                                canStart={canStartMission(mission.id)}
                            />
                        ))}
                    </View>

                    {/* Completed Missions */}
                    {completedMissions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Completed Missions ({completedMissions.length})</Text>
                            {completedMissions.map(mission => (
                                <MissionCard
                                    key={mission.id}
                                    mission={mission}
                                    onStart={() => {}}
                                    onCancel={() => {}}
                                    canStart={false}
                                />
                            ))}
                        </View>
                    )}

                </ScrollView>
            </LinearGradient>
            <ShipStatus />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textShadowColor: colors.glowEffect,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    missionCard: {
        backgroundColor: colors.panelBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    missionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    missionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    missionDifficulty: {
        fontSize: 14,
        fontWeight: '600',
    },
    missionStatus: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    missionDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    requirementsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 8,
    },
    rewardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 8,
    },
    resourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    requirementText: {
        color: colors.textPrimary,
        marginLeft: 8,
        fontSize: 12,
    },
    rewardText: {
        color: colors.primary,
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    actionContainer: {
        marginTop: 16,
    },
    startButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F44336',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#424242',
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    progressContainer: {
        padding: 8,
    },
    stepContainer: {
        marginBottom: 8,
    },
    stepText: {
        fontSize: 14,
        marginLeft: 8,
    },
    completedStep: {
        color: colors.primary,
        textDecorationLine: 'line-through',
    },
    pendingStep: {
        color: colors.textSecondary,
    },
});

export default MissionsPage; 