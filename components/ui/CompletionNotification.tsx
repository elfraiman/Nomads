import React, { useEffect, useRef, useState } from 'react';
import { 
    Animated, 
    Dimensions, 
    Modal, 
    StyleSheet, 
    Text, 
    View, 
    Easing 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ResourceIcon from './ResourceIcon';
import colors from '@/utils/colors';
import { formatLargeNumber } from '@/utils/numberFormatter';

const { width, height } = Dimensions.get('window');

export interface CompletionReward {
    type: string;
    amount: number;
    label?: string;
}

export interface CompletionNotificationProps {
    visible: boolean;
    title: string;
    description: string;
    rewards: CompletionReward[];
    onClose: () => void;
    type?: 'mission' | 'achievement';
}

const CompletionNotification: React.FC<CompletionNotificationProps> = ({
    visible,
    title,
    description,
    rewards,
    onClose,
    type = 'mission'
}) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rewardAnims = useRef(rewards.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (visible) {
            // Update reward animations array if rewards length changed
            if (rewardAnims.length !== rewards.length) {
                rewardAnims.splice(0, rewardAnims.length, ...rewards.map(() => new Animated.Value(0)));
            }
            
            // Reset all animations
            slideAnim.setValue(height);
            scaleAnim.setValue(0);
            glowAnim.setValue(0);
            rewardAnims.forEach(anim => anim.setValue(0));

            // Start entrance animations
            Animated.sequence([
                // Slide in from bottom
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                // Scale in the main content
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.back(1.1)),
                    useNativeDriver: true,
                }),
            ]).start();

            // Start glow animation (continuous)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Animate rewards in sequence
            const rewardAnimations = rewardAnims.map((anim, index) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300,
                    delay: 800 + (index * 150), // Start after main animation, stagger each reward
                    easing: Easing.out(Easing.back(1.1)),
                    useNativeDriver: true,
                })
            );

            Animated.stagger(100, rewardAnimations).start();

            // Auto close after 4 seconds
            const timer = setTimeout(() => {
                closeNotification();
            }, 4500);

            return () => clearTimeout(timer);
        }
    }, [visible, rewards.length]);

    const closeNotification = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 400,
                easing: Easing.in(Easing.back(1.1)),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    const getTypeIcon = () => {
        switch (type) {
            case 'mission':
                return '🚀';
            case 'achievement':
                return '🏆';
            default:
                return '✨';
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'mission':
                return ['#4CAF50', '#66BB6A'];
            case 'achievement':
                return ['#FF9800', '#FFB74D'];
            default:
                return [colors.primary, colors.glowEffect];
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={closeNotification}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim }
                            ],
                        },
                    ]}
                >
                    {/* Animated glow effect */}
                    <Animated.View
                        style={[
                            styles.glowEffect,
                            {
                                opacity: glowOpacity,
                            },
                        ]}
                    />

                    <LinearGradient
                        colors={getTypeColor() as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
                                <View style={styles.headerText}>
                                    <Text style={styles.typeLabel}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)} Complete!
                                    </Text>
                                    <Text style={styles.title}>{title}</Text>
                                </View>
                            </View>

                            {/* Description */}
                            <Text style={styles.description}>{description}</Text>

                            {/* Rewards */}
                            <View style={styles.rewardsContainer}>
                                <Text style={styles.rewardsTitle}>Rewards Received:</Text>
                                <View style={styles.rewardsList}>
                                    {rewards.map((reward, index) => (
                                        <Animated.View
                                            key={`${reward.type}-${index}`}
                                            style={[
                                                styles.rewardItem,
                                                {
                                                    transform: [
                                                        {
                                                            scale: rewardAnims[index] || new Animated.Value(1)
                                                        }
                                                    ],
                                                    opacity: rewardAnims[index] || new Animated.Value(1),
                                                },
                                            ]}
                                        >
                                            <ResourceIcon 
                                                type={reward.type as any} 
                                                size={24} 
                                            />
                                            <Text style={styles.rewardAmount}>
                                                +{formatLargeNumber(reward.amount)}
                                            </Text>
                                            {reward.label && (
                                                <Text style={styles.rewardLabel}>
                                                    {reward.label}
                                                </Text>
                                            )}
                                        </Animated.View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: width * 0.9,
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: colors.glowEffect,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    glowEffect: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        backgroundColor: colors.glowEffect,
        borderRadius: 26,
        zIndex: -1,
    },
    gradient: {
        padding: 2,
        borderRadius: 16,
    },
    content: {
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    typeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 2,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 20,
    },
    rewardsContainer: {
        marginTop: 8,
    },
    rewardsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    rewardsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.panelBackground,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 80,
        justifyContent: 'center',
    },
    rewardAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: 6,
    },
    rewardLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 4,
    },
});

export default CompletionNotification; 