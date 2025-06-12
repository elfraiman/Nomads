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
    top: 16,
    right: 12,
    left: 12,
    zIndex: 1000,
    elevation: 1000,
    opacity: 0.95,
  },
  notificationCard: {
    backgroundColor: 'rgba(26, 35, 44, 0.95)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.glowEffect,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 240,
    maxWidth: '90%',
  },
  completedCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(27, 94, 32, 0.95)',
  },
  killIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  enemyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 3,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  remainingText: {
    color: colors.textSecondary,
  },
  counterText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default KillTrackingNotification; 