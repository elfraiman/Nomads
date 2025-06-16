import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import colors from '@/utils/colors';
import { IMainShip, IPirate } from '@/utils/defaults';

interface HealthBarsProps {
  mainShip: IMainShip;
  pirate: IPirate | null;
}

const HealthBars: React.FC<HealthBarsProps> = ({ mainShip, pirate }) => {
  return (
    <View style={styles.fixedHealthBars}>
      {/* Main Ship Health Bar */}
      <View style={styles.healthRow}>
        <View style={styles.healthInfo}>
          <Text style={styles.fixedBarText}>
            🚀 {mainShip.baseStats.health}/{mainShip.baseStats.maxHealth}
          </Text>
        </View>
        <View style={styles.healthBar}>
          <Svg width="100%" height="16">
            <Rect x="0" y="0" width="100%" height="16" fill={colors.disabledBackground} rx="8" />
            <Rect
              x="1"
              y="1"
              width={`${Math.max(((mainShip.baseStats.health / mainShip.baseStats.maxHealth) * 100) - 2, 0)}%`}
              height="14"
              fill={colors.successGradient[0]}
              rx="7"
            />
          </Svg>
        </View>
      </View>

      {/* Pirate Health Bar */}
      {pirate && (
        <View style={styles.healthRow}>
          <View style={styles.healthInfo}>
            <Text style={styles.fixedBarText}>
              💀 {pirate.name} {pirate.health}/{pirate.maxHealth}
            </Text>
          </View>
          <View style={styles.healthBar}>
            <Svg width="100%" height="16">
              <Rect x="0" y="0" width="100%" height="16" fill={colors.disabledBackground} rx="8" />
              <Rect
                x="1"
                y="1"
                width={`${Math.max(((pirate.health / pirate.maxHealth) * 100) - 2, 0)}%`}
                height="14"
                fill={colors.error}
                rx="7"
              />
            </Svg>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fixedHealthBars: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(13, 13, 43, 0.95)',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.glowEffect,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  healthInfo: {
    flex: 1,
    paddingRight: 8,
  },
  healthBar: {
    flex: 2,
    height: 16,
    position: 'relative',
  },
  fixedBarText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HealthBars; 