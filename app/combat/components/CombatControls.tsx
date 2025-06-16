import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '@/utils/colors';

interface CombatControlsProps {
  hasEscaped: boolean;
  pirate: any;
  canEscape: boolean;
  onEscape: () => void;
  onBack: () => void;
  getEscapeCooldownRemaining: () => number;
}

const CombatControls: React.FC<CombatControlsProps> = ({
  hasEscaped,
  pirate,
  canEscape,
  onEscape,
  onBack,
  getEscapeCooldownRemaining,
}) => {
  if (hasEscaped || !pirate) {
    return (
      <TouchableOpacity
        style={[styles.controlButton, styles.backButton]}
        onPress={onBack}
      >
        <Text style={styles.buttonText}>BACK</Text>
      </TouchableOpacity>
    );
  }

  const cooldownRemaining = getEscapeCooldownRemaining();

  return (
    <TouchableOpacity
      style={[
        styles.controlButton,
        styles.escapeButton,
        {
          backgroundColor: canEscape ? colors.redButton : colors.disabledBackground
        }
      ]}
      onPress={onEscape}
      disabled={!canEscape}
    >
      <Text style={styles.buttonText}>
        {canEscape ? "ESCAPE" : `ESCAPE (${cooldownRemaining}s)`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  controlButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderColor: colors.glowEffect,
  },
  escapeButton: {
    // backgroundColor will be set dynamically based on canEscape
    borderColor: colors.error,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default CombatControls; 