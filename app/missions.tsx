import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext";
import colors from "@/utils/colors";
import { IMission, Ships } from "@/utils/defaults";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatLargeNumber } from "@/utils/numberFormatter";

const { width, height } = Dimensions.get("window");

const MissionCard = ({ mission, onStart, onCancel, onComplete, timer, cooldown, canStart, canComplete }: {
    mission: IMission;
    onStart: () => void;
    onCancel: () => void;
    onComplete?: () => void;
    timer?: number;
    cooldown?: number;
    canStart: boolean;
    canComplete?: boolean;
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

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'combat': return '⚔️';
            case 'exploration': return '🚀';
            case 'trading': return '💰';
            case 'research': return '🔬';
            case 'timed': return '⏱️';
            case 'resource_chain': return '🏭';
            default: return '📋';
        }
    };

    return (
        <View style={styles.missionCard}>
            {/* Header */}
            <View style={styles.missionHeader}>
                <View style={styles.missionTitleRow}>
                    <Text style={styles.missionTypeIcon}>{getCategoryIcon(mission.type)}</Text>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                </View>
                <View style={styles.missionMeta}>
                    <Text style={[styles.missionDifficulty, { color: getDifficultyColor(mission.difficulty) }]}>
                        {mission.difficulty}
                    </Text>
                    <Text style={[styles.missionStatus, { color: getStatusColor() }]}>
                        {getStatusText()}
                    </Text>
                </View>
            </View>

            {/* Description */}
            <Text style={styles.missionDescription}>
                {mission.description}
            </Text>

            {/* Combat Mission Progress - Only show when mission is active */}
            {mission.active && mission.objective && mission.objective.type === 'kill' && (
                <View style={styles.combatProgressContainer}>
                    <Text style={styles.combatProgressText}>
                        Progress: {mission.objective.currentAmount || 0} / {mission.objective.targetAmount} {mission.objective.target}
                    </Text>
                    <View style={styles.progressBar}>
                        <View style={[
                            styles.progressFill, 
                            { width: `${Math.min(100, ((mission.objective.currentAmount || 0) / (mission.objective.targetAmount || 1)) * 100)}%` }
                        ]} />
                    </View>
                </View>
            )}

            {/* Multi-step Mission Progress - Only show when mission is active */}
            {mission.active && mission.steps && (
                <View style={styles.combatProgressContainer}>
                    <Text style={styles.combatProgressText}>
                        Mission Progress: Step {(mission.progress || 0) + 1} of {mission.steps.length}
                    </Text>
                    <View style={styles.progressBar}>
                        <View style={[
                            styles.progressFill, 
                            { width: `${Math.min(100, ((mission.progress || 0) / mission.steps.length) * 100)}%` }
                        ]} />
                    </View>
                    <Text style={styles.currentStepText}>
                        Current: {mission.steps[mission.progress || 0]}
                    </Text>
                </View>
            )}

            {/* Action Button */}
            <View style={styles.actionContainer}>
                {mission.active ? (
                    <View style={styles.activeButtonsContainer}>
                        {onComplete && canComplete && (
                            <TouchableOpacity onPress={onComplete} style={styles.completeButton}>
                                <Text style={styles.buttonText}>Complete</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
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

            {/* Expandable Details */}
            <View style={styles.expandableSection}>
                {/* Requirements */}
                {Object.keys(mission.requirements).length > 0 && (
                    <Collapsible title="Requirements" condensed={true}>
                        <View style={styles.detailsContent}>
                            {Object.entries(mission.requirements).map(([key, value]) => {
                                if (key === 'ships') {
                                    const shipReqs = value as Partial<Ships>;
                                    return Object.entries(shipReqs).map(([shipType, count]) => (
                                        <View key={`${key}-${shipType}`} style={styles.detailItem}>
                                            <ResourceIcon type={shipType as any} size={16} />
                                            <Text style={styles.detailText}>{formatLargeNumber(count || 0)} {shipType}</Text>
                                        </View>
                                    ));
                                }
                                if (key === 'weapons') {
                                    const weaponReqs = value as Record<string, number>;
                                    return Object.entries(weaponReqs).map(([weaponId, count]) => (
                                        <View key={`${key}-${weaponId}`} style={styles.detailItem}>
                                            <Text style={styles.weaponIcon}>⚔️</Text>
                                            <Text style={styles.detailText}>{count} {weaponId.replace(/_/g, ' ')}</Text>
                                        </View>
                                    ));
                                }
                                if (key === 'enemyKills') {
                                    const killReqs = value as Record<string, number>;
                                    return Object.entries(killReqs).map(([enemyType, count]) => (
                                        <View key={`${key}-${enemyType}`} style={styles.detailItem}>
                                            <Text style={styles.weaponIcon}>💀</Text>
                                            <Text style={styles.detailText}>{count} {enemyType} kills required</Text>
                                        </View>
                                    ));
                                }
                                if (typeof value === 'number') {
                                    return (
                                        <View key={key} style={styles.detailItem}>
                                            <ResourceIcon type={key as any} size={16} />
                                            <Text style={styles.detailText}>{formatLargeNumber(value)} {key}</Text>
                                        </View>
                                    );
                                }
                                return null;
                            })}
                        </View>
                    </Collapsible>
                )}

                {/* Rewards */}
                <Collapsible title="Rewards" condensed={true}>
                    <View style={styles.detailsContent}>
                        {Object.entries(mission.rewards).map(([key, value]) => {
                            if (key === 'experience' && typeof value === 'number') {
                                return (
                                    <View key={key} style={styles.detailItem}>
                                        <Text style={styles.rewardIcon}>⭐</Text>
                                        <Text style={styles.rewardText}>{formatLargeNumber(value)} XP</Text>
                                    </View>
                                );
                            }
                            if (key === 'unlocks' && Array.isArray(value)) {
                                return value.map((unlock, index) => (
                                    <View key={`${key}-${index}`} style={styles.detailItem}>
                                        <Text style={styles.rewardIcon}>🔓</Text>
                                        <Text style={styles.rewardText}>Unlocks: {unlock}</Text>
                                    </View>
                                ));
                            }
                            if (key === 'weapons' && typeof value === 'object') {
                                const weaponRewards = value as Record<string, number>;
                                return Object.entries(weaponRewards).map(([weaponId, amount]) => (
                                    <View key={`${key}-${weaponId}`} style={styles.detailItem}>
                                        <Text style={styles.rewardIcon}>⚔️</Text>
                                        <Text style={styles.rewardText}>+{amount} {weaponId.replace(/_/g, ' ')}</Text>
                                    </View>
                                ));
                            }
                            if (typeof value === 'number') {
                                return (
                                    <View key={key} style={styles.detailItem}>
                                        <ResourceIcon type={key as any} size={16} />
                                        <Text style={styles.rewardText}>+{formatLargeNumber(value)} {key}</Text>
                                    </View>
                                );
                            }
                            return null;
                        })}
                    </View>
                </Collapsible>

                {/* Mission Location (for combat missions) */}
                {mission.location && (
                    <Collapsible title="Mission Location" condensed={true}>
                        <View style={styles.detailsContent}>
                            <View style={styles.detailItem}>
                                <Text style={styles.rewardIcon}>📍</Text>
                                <Text style={styles.detailText}>{mission.location}</Text>
                            </View>
                        </View>
                    </Collapsible>
                )}

                {/* Objective Details (for combat missions when not active) */}
                {!mission.active && mission.objective && mission.objective.type === 'kill' && (
                    <Collapsible title="Mission Objective" condensed={true}>
                        <View style={styles.detailsContent}>
                            <View style={styles.detailItem}>
                                <Text style={styles.weaponIcon}>🎯</Text>
                                <Text style={styles.detailText}>
                                    Eliminate {mission.objective.targetAmount} {mission.objective.target}
                                    {mission.objective.targetAmount && mission.objective.targetAmount > 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                    </Collapsible>
                )}

                {/* Multi-step Details (when not active) */}
                {!mission.active && mission.steps && (
                    <Collapsible title="Mission Steps" condensed={true}>
                        <View style={styles.detailsContent}>
                            {mission.steps.map((step, index) => (
                                <View key={index} style={styles.stepItem}>
                                    <Text style={styles.stepText}>
                                        {index + 1}. {step}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Collapsible>
                )}
            </View>
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
        completeMission,
        canStartMission,
        canCompleteMission,
        isDevMode,
        simulateEnemyKill,
        combatStats 
    } = game;

    const availableMissions = missions.filter(m => 
        !m.active && 
        !m.locked && 
        (!m.completed || (m.repeatable && m.type !== 'combat'))
    );
    const completedMissions = missions.filter(m => m.completed && (!m.repeatable || m.type === 'combat'));

    // Group missions by category
    const groupMissionsByCategory = (missionList: typeof missions) => {
        const categories = {
            combat: missionList.filter(m => m.type === 'combat'),
            exploration: missionList.filter(m => m.type === 'exploration'),
            trading: missionList.filter(m => m.type === 'trading'),
            research: missionList.filter(m => m.type === 'research'),
            timed: missionList.filter(m => m.type === 'timed'),
            resource_chain: missionList.filter(m => m.type === 'resource_chain'),
        };
        return categories;
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'combat': return '⚔️';
            case 'exploration': return '🚀';
            case 'trading': return '💰';
            case 'research': return '🔬';
            case 'timed': return '⏱️';
            case 'resource_chain': return '🏭';
            default: return '📋';
        }
    };

    const getCategoryColor = (type: string) => {
        switch (type) {
            case 'combat': return '#FF4444';
            case 'exploration': return '#4488FF';
            case 'trading': return '#FFB347';
            case 'research': return '#9966FF';
            case 'timed': return '#FF8866';
            case 'resource_chain': return '#66FF88';
            default: return colors.textSecondary;
        }
    };

    const getCategoryTitle = (type: string) => {
        switch (type) {
            case 'combat': return 'Combat Missions';
            case 'exploration': return 'Exploration Missions';
            case 'trading': return 'Trading Missions';
            case 'research': return 'Research Missions';
            case 'timed': return 'Timed Challenges';
            case 'resource_chain': return 'Industrial Missions';
            default: return 'Other Missions';
        }
    };

    const availableCategories = groupMissionsByCategory(availableMissions);
    const completedCategories = groupMissionsByCategory(completedMissions);

    return (
        <>
            <LinearGradient
                colors={[colors.background, '#000814']}
                style={styles.container}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                    
                    {/* Dev Panel for Testing Combat */}
                    {isDevMode && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🛠️ DEV: Combat Testing</Text>
                            <View style={styles.devPanel}>
                                <Text style={styles.devText}>Total Kills: {combatStats.totalKills}</Text>
                                <View style={styles.devButtonRow}>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Missile Corvette')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Missile Corvette</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Laser Interceptor')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Laser Interceptor</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.devButtonRow}>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Stealth Raider')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Stealth Raider</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Salvage Fighter')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Salvage Fighter</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.devButtonRow}>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Titan Enforcer')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Titan Enforcer</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Ion Saboteur')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Ion Saboteur</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.devButtonRow}>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Corsair Warlord')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Corsair Warlord</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Repurposed Frigate')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Repurposed Frigate</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.devButtonRow}>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Vanguard Battleship')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Vanguard Battleship</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => simulateEnemyKill('Titan Dreadnought')} style={styles.devButton}>
                                        <Text style={styles.devButtonText}>Titan Dreadnought</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

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
                                    onComplete={() => completeMission(mission.id)}
                                    timer={missionTimers[mission.id]}
                                    canStart={false}
                                    canComplete={canCompleteMission(mission.id)}
                                />
                            ))}
                        </View>
                    )}

                    {/* Available Missions by Category */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Missions ({availableMissions.length})</Text>
                        
                        {Object.entries(availableCategories).map(([categoryType, categoryMissions]) => {
                            if (categoryMissions.length === 0) return null;
                            
                            return (
                                <Collapsible
                                    key={categoryType}
                                    title={`${getCategoryIcon(categoryType)} ${getCategoryTitle(categoryType)} (${categoryMissions.length})`}
                                >
                                    <View style={[styles.categoryBorder, { borderColor: getCategoryColor(categoryType) }]}>
                                        {categoryMissions.map(mission => (
                                            <MissionCard
                                                key={mission.id}
                                                mission={mission}
                                                onStart={() => startMission(mission.id)}
                                                onCancel={() => {}}
                                                cooldown={missionCooldowns[mission.id]}
                                                canStart={canStartMission(mission.id)}
                                                canComplete={false}
                                            />
                                        ))}
                                    </View>
                                </Collapsible>
                            );
                        })}
                    </View>

                    {/* Completed Missions by Category */}
                    {completedMissions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Completed Missions ({completedMissions.length})</Text>
                            
                            {Object.entries(completedCategories).map(([categoryType, categoryMissions]) => {
                                if (categoryMissions.length === 0) return null;
                                
                                return (
                                    <Collapsible
                                        key={`completed-${categoryType}`}
                                        title={`${getCategoryIcon(categoryType)} ${getCategoryTitle(categoryType)} (${categoryMissions.length})`}
                                    >
                                        <View style={[styles.categoryBorder, { borderColor: getCategoryColor(categoryType) }]}>
                                            {categoryMissions.map(mission => (
                                                <MissionCard
                                                    key={mission.id}
                                                    mission={mission}
                                                    onStart={() => {}}
                                                    onCancel={() => {}}
                                                    canStart={false}
                                                    canComplete={false}
                                                />
                                            ))}
                                        </View>
                                    </Collapsible>
                                );
                            })}
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
        padding: 12,
        marginBottom: 12,
        borderRadius: 6,
    },
    missionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    missionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    missionTypeIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    missionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1,
    },
    missionDifficulty: {
        fontSize: 12,
        fontWeight: '600',
    },
    missionStatus: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
    },
    missionDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 10,
        lineHeight: 18,
    },
    requirementsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        padding: 4,
    },
    rewardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        padding: 4,
    },
    resourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 6,
        borderRadius: 3,
        marginRight: 6,
        marginBottom: 3,
    },
    requirementText: {
        color: colors.textPrimary,
        marginLeft: 6,
        fontSize: 11,
    },
    rewardText: {
        color: colors.primary,
        marginLeft: 6,
        fontSize: 11,
        fontWeight: '600',
    },
    actionContainer: {
        marginTop: 10,
    },
    activeButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    startButton: {
        backgroundColor: colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        flex: 1,
    },
    cancelButton: {
        backgroundColor: '#F44336',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        flex: 1,
    },
    disabledButton: {
        backgroundColor: '#424242',
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    progressContainer: {
        padding: 4,
    },
    stepContainer: {
        marginBottom: 4,
    },
    stepText: {
        fontSize: 12,
        marginLeft: 6,
    },
    completedStep: {
        color: colors.primary,
        textDecorationLine: 'line-through',
    },
    pendingStep: {
        color: colors.textSecondary,
    },
    combatProgressContainer: {
        marginTop: 8,
        padding: 6,
        backgroundColor: colors.background,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    combatProgressText: {
        color: colors.textPrimary,
        fontSize: 12,
        marginBottom: 6,
        textAlign: 'center',
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    devPanel: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    devText: {
        color: colors.textPrimary,
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    devButtonRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    devButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        flex: 1,
    },
    devButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    categoryBorder: {
        borderLeftWidth: 3,
        paddingLeft: 16,
        marginLeft: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: colors.panelBackground,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    locationIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    locationText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    missionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    expandableSection: {
        marginTop: 10,
    },
    detailsContent: {
        padding: 4,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        color: colors.textPrimary,
        marginLeft: 6,
        fontSize: 11,
    },
    weaponIcon: {
        color: colors.textPrimary,
        marginRight: 6,
        fontSize: 12,
    },
    rewardIcon: {
        color: colors.primary,
        marginRight: 6,
        fontSize: 12,
    },
    stepItem: {
        marginBottom: 4,
    },
    currentStepText: {
        color: colors.textPrimary,
        fontSize: 12,
        marginLeft: 6,
    },
});

export default MissionsPage; 