import React from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import colors from '@/utils/colors';
import { resourceColors } from '@/utils/defaults';
import { FloatingDamageItem } from '../hooks/useFloatingDamage';

interface FloatingDamageNumbersProps {
  floatingDamage: FloatingDamageItem[];
}

const FloatingDamageNumbers: React.FC<FloatingDamageNumbersProps> = ({ floatingDamage }) => {
  return (
    <>
      {floatingDamage.map((item) => {
        const isIncoming = item.weaponType === 'incoming';
        const weaponColor = isIncoming ? colors.error :
          (item.weaponType ? resourceColors[item.weaponType] : colors.error);

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.floatingDamageOverlay,
              isIncoming && styles.floatingDamageIncoming,
              {
                opacity: item.opacity,
                top: 200 + (item.verticalOffset || 0),
                left: '50%',
                transform: [
                  {
                    translateX: (item.startOffset || 0),
                  },
                  {
                    translateY: item.animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: isIncoming ? [0, 50] : [0, -60],
                    }),
                  },
                  {
                    scale: item.animation.interpolate({
                      inputRange: [0, 0.2, 1],
                      outputRange: [1, 1.3, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[
              styles.floatingDamageText,
              item.isCritical && styles.floatingDamageCritical,
              isIncoming && styles.floatingDamageIncomingText,
              {
                color: item.isCritical ? '#FFD700' : weaponColor,
                textShadowColor: item.isCritical ? '#FFD700' : weaponColor,
              }
            ]}>
              {isIncoming
                ? `+${item.damage}`
                : item.isCritical
                  ? `CRIT! ${item.damage}`
                  : `${item.damage}`
              }
            </Text>
          </Animated.View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  floatingDamageOverlay: {
    position: "absolute",
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    marginLeft: -40,
  },
  floatingDamageIncoming: {
    top: 60,
  },
  floatingDamageText: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  floatingDamageCritical: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.warning,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: colors.warning,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  floatingDamageIncomingText: {
    color: colors.error,
    fontSize: 22,
    fontWeight: "800",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: colors.error,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default FloatingDamageNumbers; 