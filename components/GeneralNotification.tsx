import React, { useEffect, useState, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import colors from '@/utils/colors';

interface GeneralNotificationProps {
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    icon?: string;
    onAnimationComplete: () => void;
}

const GeneralNotification: React.FC<GeneralNotificationProps> = ({
    visible,
    title,
    message,
    type,
    icon,
    onAnimationComplete,
}) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-150));
    const [isShowing, setIsShowing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const onAnimationCompleteRef = useRef(onAnimationComplete);

    // Update the ref when the callback changes
    useEffect(() => {
        onAnimationCompleteRef.current = onAnimationComplete;
    }, [onAnimationComplete]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // Handle visibility changes
    useEffect(() => {
        if (visible && !isShowing) {
            setIsShowing(true);
            
            // Clear any existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            
            // Slide in and fade in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-dismiss after 4 seconds
            timerRef.current = setTimeout(() => {
                // Slide out and fade out
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: -150,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setIsShowing(false);
                    onAnimationCompleteRef.current();
                });
            }, 4000);
        } else if (!visible && isShowing) {
            // Force hide if visibility changes to false
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -150,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setIsShowing(false);
                onAnimationCompleteRef.current();
            });
        }
    }, [visible, isShowing, fadeAnim, slideAnim]);

    // Don't render if not visible and not showing
    if (!visible && !isShowing) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: 'rgba(0, 255, 150, 0.15)', // Cosmic cyan glow
                    borderColor: '#00FF96', // Bright cyan border
                    shadowColor: '#00FF96',
                    icon: icon || '🎉'
                };
            case 'warning':
                return {
                    backgroundColor: 'rgba(255, 140, 0, 0.15)', // Stellar orange glow
                    borderColor: '#FF8C00', // Space amber border
                    shadowColor: '#FF8C00',
                    icon: icon || '⚠️'
                };
            case 'info':
                return {
                    backgroundColor: 'rgba(64, 224, 255, 0.15)', // Deep space blue glow
                    borderColor: '#40E0FF', // Electric blue border
                    shadowColor: '#40E0FF',
                    icon: icon || 'ℹ️'
                };
            case 'error':
                return {
                    backgroundColor: 'rgba(255, 69, 120, 0.15)', // Danger signal red glow
                    borderColor: '#FF4578', // Alert red border
                    shadowColor: '#FF4578',
                    icon: icon || '❌'
                };
            default:
                return {
                    backgroundColor: 'rgba(138, 43, 226, 0.15)', // Nebula purple glow
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                    icon: icon || '📢'
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={[
                styles.notificationCard, 
                { 
                    backgroundColor: typeStyles.backgroundColor,
                    borderColor: typeStyles.borderColor,
                    shadowColor: typeStyles.shadowColor,
                }
            ]}>
                <Text style={styles.notificationIcon}>{typeStyles.icon}</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 70,
        right: 12,
        left: 12,
        zIndex: 1000,
        elevation: 1000,
        opacity: 0.95,
    },
    notificationCard: {
        borderRadius: 10,
        padding: 12,
        borderWidth: 1.5,
        backgroundColor: 'rgba(12, 20, 30, 0.95)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 12,
        elevation: 12,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 240,
        maxWidth: '100%',
        borderStyle: 'solid',
    },
    notificationIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    titleText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E0E6ED',
        marginBottom: 3,
        textShadowColor: 'rgba(255, 255, 255, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    messageText: {
        fontSize: 12,
        color: '#B0BEC5',
        lineHeight: 16,
        textShadowColor: 'rgba(255, 255, 255, 0.2)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
    },
});

export default GeneralNotification; 