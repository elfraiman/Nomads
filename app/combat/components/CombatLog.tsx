import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import colors from '@/utils/colors';

export interface CombatLogEntry {
  text: string;
  color?: string;
  timestamp?: Date;
}

interface CombatLogProps {
  combatLog: CombatLogEntry[];
}

const CombatLog: React.FC<CombatLogProps> = ({ combatLog }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [combatLog]);

  return (
    <View style={styles.logContainer}>
      <Text style={styles.logHeader}>COMBAT LOG</Text>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {combatLog.map((entry, index) => {
          const timestamp = entry.timestamp || new Date();
          const timeStr = timestamp.toLocaleTimeString().slice(0, 5);

          return (
            <Text
              key={index}
              style={[
                styles.logText,
                entry.color ? { color: entry.color } : null
              ]}
            >
              <Text style={styles.timestamp}>[{timeStr}] </Text>
              {entry.text}
            </Text>
          );
        })}
        {combatLog.length === 0 && (
          <Text style={[styles.logText, { opacity: 0.6, fontStyle: 'italic' }]}>
            Awaiting battle data...
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  logContainer: {
    backgroundColor: 'rgba(26, 26, 61, 0.9)',
    borderWidth: 1,
    borderColor: colors.glowEffect,
    borderRadius: 8,
    padding: 8,
    maxHeight: 100,
    minHeight: 100,
    marginTop: 8,
    marginHorizontal: 4,
  },
  logHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.glowEffect,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  logText: {
    fontSize: 11,
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 14,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 10,
    color: colors.textSecondary,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
});

export default CombatLog; 