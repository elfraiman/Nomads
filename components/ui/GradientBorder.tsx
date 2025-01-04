import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/utils/colors';

const GradientBorder = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.glowEffect, colors.successGradient[1]]} // Yellow to Orange
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gradientBorder: {
    position: 'absolute',
    bottom: 0,
    height: 2, // Thickness of the border
    width: '100%',
    zIndex: 1000
  },
  content: {
  },
});

export default GradientBorder;
