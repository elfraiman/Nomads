import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { IWeapon } from '@/data/weapons';
import colors from '@/utils/colors';
import ResourceIcon from '@/components/ui/ResourceIcon';
import { PlayerResources } from '@/utils/defaults';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface WeaponDetailsModalProps {
  weapon: IWeapon | null;
  isVisible: boolean;
  onClose: () => void;
  onEquip: (weaponId: string) => void;
  onDestroy: (weaponId: string) => void;
}

export const WeaponDetailsModal = ({ weapon, isVisible, onClose, onEquip, onDestroy }: WeaponDetailsModalProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Exit animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  if (!weapon) return null;

  const durabilityRatio = weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability;
  const durabilityColor = durabilityRatio > 0.7 ? colors.buttonGreen :
    durabilityRatio > 0.3 ? colors.warning :
      colors.error;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
          onStartShouldSetResponder={() => true}
        >
          <LinearGradient
            colors={[colors.panelBackground, colors.background]}
            style={styles.gradientContainer}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.weaponDetails}>
              <ImageBackground
                source={weapon.icon}
                style={styles.detailsIcon}
                imageStyle={styles.weaponCardImage}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.weaponCardOverlay}
                >
                  <Text style={styles.weaponTitle}>{weapon.title}</Text>
                </LinearGradient>
              </ImageBackground>

              <View style={styles.durabilityContainer}>
                <Text style={styles.durabilityText}>
                  Durability: {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
                </Text>
                <View style={styles.durabilityBarContainer}>
                  <Animated.View
                    style={[
                      styles.durabilityBar,
                      {
                        width: `${(durabilityRatio * 100)}%`,
                        backgroundColor: durabilityColor
                      }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="flash" size={20} color={colors.primary} />
                  <Text style={styles.statLabel}>Power</Text>
                  <Text style={styles.statValue}>{weapon.weaponDetails.power}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="timer-outline" size={20} color={colors.primary} />
                  <Text style={styles.statLabel}>Cooldown</Text>
                  <Text style={styles.statValue}>{weapon.weaponDetails.cooldown}s</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={20} color={colors.primary} />
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>{weapon.weaponDetails.accuracy}%</Text>
                </View>
                <View style={styles.statItem}>
                  <ResourceIcon size={20} type={weapon.weaponDetails.cost.type as keyof PlayerResources} />
                  <Text style={styles.statLabel}>Cost</Text>
                  <Text style={styles.statValue}>{weapon.weaponDetails.cost.amount}</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    onEquip(weapon.uniqueId!);
                    onClose();
                  }}
                  style={styles.equipButton}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.glowEffect]}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="rocket-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Equip</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    onDestroy(weapon.uniqueId!);
                    onClose();
                  }}
                  style={styles.destroyButton}
                >
                  <LinearGradient
                    colors={[colors.error, colors.redButton]}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Destroy</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradientContainer: {
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  weaponDetails: {
    flexDirection: 'column',
  },
  detailsIcon: {
    width: '100%',
    height: 160,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  weaponCardImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  weaponCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 8,
  },
  weaponTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  durabilityContainer: {
    marginBottom: 16,
  },
  durabilityText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  durabilityBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  durabilityBar: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  equipButton: {
    flex: 1,
  },
  destroyButton: {
    flex: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
}); 