import React, { useEffect, useState, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import colors from '@/utils/colors';

interface KillTrackingNotificationProps {
  visible: boolean;
  enemyName: string;
  currentKills: number;
  targetKills: number;
  missionTitle: string;
  onAnimationComplete: () => void;
}

const KillTrackingNotification: React.FC<KillTrackingNotificationProps> = ({
  visible,
  enemyName,
  currentKills,
  targetKills,
  missionTitle,
  onAnimationComplete,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
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
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds (increased for better UX)
      timerRef.current = setTimeout(() => {
        // Slide out and fade out
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsShowing(false);
          onAnimationCompleteRef.current();
        });
      }, 3000); // Increased from 2500ms to 3000ms
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
          toValue: -100,
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

  const isComplete = currentKills >= targetKills;
  const remainingKills = Math.max(0, targetKills - currentKills);

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
      <View style={[styles.notificationCard, isComplete && styles.completedCard]}>
        <Text style={styles.killIcon}>💀</Text>
        <View style={styles.textContainer}>
          <Text style={styles.enemyText}>{enemyName} eliminated!</Text>
          <Text style={styles.progressText}>
            {isComplete ? (
              <Text style={styles.completedText}>✅ Mission Complete!</Text>
            ) : (
              <Text style={styles.remainingText}>
                {remainingKills} more needed for "{missionTitle}"
              </Text>
            )}
          </Text>
          <Text style={styles.counterText}>
            {currentKills}/{targetKills}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 16,
    left: 16,
    zIndex: 1000,
    elevation: 1000,
  },
  notificationCard: {
    backgroundColor: 'rgba(26, 35, 44, 0.95)', // Slightly more opaque for better readability
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.glowEffect,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '90%', // Ensure it doesn't overflow on smaller screens
  },
  completedCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(27, 94, 32, 0.95)', // More opaque for completed state
  },
  killIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  enemyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  remainingText: {
    color: colors.textSecondary,
  },
  counterText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default KillTrackingNotification; 