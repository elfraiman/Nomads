import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ImageBackground } from 'react-native';
import { IWeapon } from '@/data/weapons';
import colors from '@/utils/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface WeaponSlotProps {
  weapon?: IWeapon;
  onUnequip: (uniqueId: string) => void;
  onDestroy: (uniqueId: string) => void;
}

export const WeaponSlot = ({ weapon, onUnequip, onDestroy }: WeaponSlotProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const glow = Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      })
    ]);

    Animated.parallel([
      Animated.loop(glow)
    ]).start();
  }, []);

  const durabilityRatio = weapon ? weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability : 0;
  const durabilityColor = durabilityRatio > 0.7 ? colors.buttonGreen :
    durabilityRatio > 0.3 ? colors.warning :
      colors.error;

  return (
    <Animated.View style={[
      styles.slotContainer,
      { transform: [{ scale: weapon ? pulseAnim : 1 }] }
    ]}>
      <LinearGradient
        colors={[colors.panelBackground, colors.background]}
        style={styles.slot}
      >
        {weapon ? (
          <>
            <View style={styles.contentContainer}>
              <ImageBackground
                source={weapon.icon}
                style={styles.weaponImage}
                imageStyle={styles.weaponImageStyle}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.overlay}
                >
                  <Text style={styles.weaponTitle}>{weapon.title}</Text>
                </LinearGradient>
              </ImageBackground>

              <View style={styles.durabilityContainer}>
                <View style={styles.durabilityBarContainer}>
                  <Animated.View
                    style={[styles.durabilityBar, {
                      width: `${(durabilityRatio * 100)}%`,
                      backgroundColor: durabilityColor,
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }]}
                  />

                </View>
                <Text style={styles.durabilityText}>
                  {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => onUnequip(weapon.uniqueId ?? "")}
                style={styles.actionButton}
              >
                <LinearGradient
                  colors={[colors.primary, colors.glowEffect]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="remove-circle-outline" size={14} color="white" />
                  <Text style={styles.buttonText}>Unequip</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onDestroy(weapon.uniqueId ?? "")}
                style={styles.actionButton}
              >
                <LinearGradient
                  colors={[colors.error, colors.redButton]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="trash-outline" size={14} color="white" />
                  <Text style={styles.buttonText}>Destroy</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptySlotContent}>
            <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.emptySlot}>Empty Slot</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slotContainer: {
    width: "48%",
    minHeight: 120,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  slot: {
    flex: 1,
    padding: 6,
    justifyContent: 'space-between',
  },
  weaponImage: {
    width: '100%',
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  weaponImageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 2,
  },
  weaponTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  durabilityContainer: {
    marginBottom: 2
  },
  durabilityBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  durabilityBar: {
    height: '100%',
  },
  durabilityText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "bold",
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: -6.5,
    bottom: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  emptySlotContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  emptySlot: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
}); 