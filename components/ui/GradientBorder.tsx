import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/utils/colors';

const GradientBorder = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <View style={[styles.gradientContainer, { pointerEvents: 'none' }]}>
        <LinearGradient
          colors={[
            'transparent',
            colors.glowEffect,
            colors.primary,
            colors.glowEffect,
            'transparent'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.gradientBorder}
        >
          <View style={styles.glowEffect} />
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 1,
  },
  gradientBorder: {
    position: 'absolute',
    bottom: 0,
    height: 1,
    width: '100%',
    zIndex: 1000,
  },
  content: {
    marginBottom: 1,
  },
  glowEffect: {
    position: 'absolute',
    bottom: 0,
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: colors.glowEffect,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientContainer: {
    position: 'absolute',
    bottom: 0,
    height: 1,
    width: '100%',
  },
});

export default GradientBorder;
