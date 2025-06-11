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
        top: 80, // Below the header
        right: 16,
        left: 16,
        zIndex: 1000,
        elevation: 1000,
    },
    notificationCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        backgroundColor: 'rgba(12, 20, 30, 0.95)', // Dark space background
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 15, // Increased for better glow
        elevation: 12,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 280,
        maxWidth: '100%',
        // Additional glow effect
        borderStyle: 'solid',
    },
    notificationIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E0E6ED', // Bright space white
        marginBottom: 4,
        textShadowColor: 'rgba(255, 255, 255, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    messageText: {
        fontSize: 14,
        color: '#B0BEC5', // Soft space gray
        lineHeight: 20,
        textShadowColor: 'rgba(255, 255, 255, 0.2)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
    },
});

export default GeneralNotification; 