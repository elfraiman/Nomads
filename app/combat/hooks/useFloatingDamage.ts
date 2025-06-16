import { useState } from 'react';
import { Animated } from 'react-native';

export interface FloatingDamageItem {
  id: string;
  damage: number;
  animation: Animated.Value;
  opacity: Animated.Value;
  isCritical?: boolean;
  weaponType?: string;
  startOffset?: number;
  verticalOffset?: number;
}

export const useFloatingDamage = () => {
  const [floatingDamage, setFloatingDamage] = useState<FloatingDamageItem[]>([]);

  const createFloatingDamage = (damage: number, isCritical: boolean = false, weaponType?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const animation = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    // Calculate horizontal offset based on existing floating damage to prevent stacking
    const currentTime = Date.now();
    const recentDamage = floatingDamage.filter(item =>
      currentTime - parseInt(item.id.split('.')[0]) < 200 // Within 200ms
    );

    // Spread out simultaneous hits horizontally from center
    const totalWidth = Math.max(recentDamage.length, 1) * 80; // Total width needed
    const startPosition = -totalWidth / 2; // Start from left of center
    const baseOffset = startPosition + (recentDamage.length * 80); // Position for this hit
    const randomOffset = (Math.random() - 0.5) * 20; // Small random variation
    const horizontalOffset = baseOffset + randomOffset;

    // Stagger vertical start positions slightly for simultaneous hits
    const verticalOffset = recentDamage.length * 10; // 10px vertical stagger

    const newFloatingDamage: FloatingDamageItem = {
      id,
      damage,
      animation,
      opacity,
      isCritical,
      weaponType,
      startOffset: horizontalOffset,
      verticalOffset,
    };

    setFloatingDamage(prev => [...prev, newFloatingDamage]);

    // Animate the floating effect with slight delay for simultaneous hits
    const duration = isCritical ? 2000 : 1500; // Critical hits last longer
    const animationDelay = recentDamage.length * 50; // 50ms delay between simultaneous hits

    Animated.sequence([
      Animated.delay(animationDelay), // Stagger the start of animations
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(isCritical ? 800 : 500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: isCritical ? 1200 : 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Remove the floating damage after animation completes
      setFloatingDamage(prev => prev.filter(item => item.id !== id));
    });
  };

  return {
    floatingDamage,
    createFloatingDamage,
  };
}; 