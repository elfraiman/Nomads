import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import ResourceIcon from '@/components/ui/ResourceIcon';
import colors from '@/utils/colors';
import { resourceColors, PlayerResources, IMainShip } from '@/utils/defaults';
import { IWeapon } from '@/data/weapons';
import { WeaponCooldown } from '../hooks/useWeaponCooldowns';

interface WeaponGroupsProps {
  weaponGroups: { [key: string]: IWeapon[] };
  weaponCooldowns: WeaponCooldown[];
  mainShip: IMainShip;
  isFiring: boolean;
  onFireWeaponGroup: (weaponType: string) => void;
}

const WeaponGroups: React.FC<WeaponGroupsProps> = ({
  weaponGroups,
  weaponCooldowns,
  mainShip,
  isFiring,
  onFireWeaponGroup,
}) => {
  const [selectedWeaponType, setSelectedWeaponType] = React.useState<string>(
    Object.keys(weaponGroups)[0] || ''
  );
  const [firingAnimation] = React.useState(new Animated.Value(0));
  const [weaponSwitchAnimation] = React.useState(new Animated.Value(1));
  const [chargingWeapons, setChargingWeapons] = React.useState<Set<string>>(new Set());

  // Update selected type if it doesn't exist anymore
  React.useEffect(() => {
    if (!weaponGroups[selectedWeaponType] && Object.keys(weaponGroups).length > 0) {
      setSelectedWeaponType(Object.keys(weaponGroups)[0]);
    }
  }, [weaponGroups, selectedWeaponType]);

  // Weapon switching animation
  const switchWeaponType = (newType: string) => {
    if (newType === selectedWeaponType) return;

    Animated.sequence([
      Animated.timing(weaponSwitchAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(weaponSwitchAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setSelectedWeaponType(newType), 150);
  };

  // Firing animation effect
  const triggerFiringEffect = () => {
    // Screen shake effect
    Animated.sequence([
      Animated.timing(firingAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(firingAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate weapon charging sequence
    const weapons = selectedWeapons;
    weapons.forEach((weapon, index) => {
      setTimeout(() => {
        setChargingWeapons(prev => new Set([...prev, weapon.id]));
        setTimeout(() => {
          setChargingWeapons(prev => {
            const newSet = new Set(prev);
            newSet.delete(weapon.id);
            return newSet;
          });
        }, 300);
      }, index * 100);
    });
  };

  const weaponTypes = Object.keys(weaponGroups);
  const selectedWeapons = weaponGroups[selectedWeaponType] || [];

  if (weaponTypes.length === 0) return null;

  const fireableWeapons = selectedWeapons.filter((weapon) => {
    const { type: resourceType, amount } = weapon.weaponDetails.cost;
    return (mainShip.resources[resourceType as keyof PlayerResources]?.current || 0) >= amount;
  });

  const totalCost = fireableWeapons.reduce((acc, weapon) => {
    const { type: resourceType, amount } = weapon.weaponDetails.cost;
    acc[resourceType] = (acc[resourceType] || 0) + amount;
    return acc;
  }, {} as { [key: string]: number });

  // Get weapon type styling
  const getWeaponTypeStyle = (type: string) => {
    const styles = {
      'Laser': { color: '#FF3366', glow: '#FF5577', background: 'rgba(255, 51, 102, 0.15)' },
      'Missile': { color: '#00FF88', glow: '#33FFAA', background: 'rgba(0, 255, 136, 0.15)' },
      'Blaster': { color: '#3366FF', glow: '#5577FF', background: 'rgba(51, 102, 255, 0.15)' },
      'Cannon': { color: '#FF8800', glow: '#FFAA33', background: 'rgba(255, 136, 0, 0.15)' },
    };
    return styles[type as keyof typeof styles] || {
      color: colors.primary,
      glow: colors.glowEffect,
      background: 'rgba(255, 255, 255, 0.1)'
    };
  };

  const currentTypeStyle = getWeaponTypeStyle(selectedWeaponType);

  return (
    <Animated.View style={[
      styles.weaponSystemContainer,
      {
        transform: [{
          translateX: firingAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2]
          })
        }]
      }
    ]}>
      {/* Weapon Type Tabs */}
      {weaponTypes.length > 1 && (
        <View style={styles.weaponTypeTabs}>
          {weaponTypes.map((type) => {
            const typeStyle = getWeaponTypeStyle(type);
            const isActive = selectedWeaponType === type;
            const totalWeapons = weaponGroups[type].length;
            const readyWeapons = weaponGroups[type].filter(weapon => {
              const cooldown = weaponCooldowns.find(w => w.id === weapon.id)?.cooldown || 0;
              return cooldown === 0;
            }).length;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.weaponTypeTab,
                  isActive && [
                    styles.activeWeaponTypeTab,
                    {
                      borderColor: typeStyle.color,
                      backgroundColor: typeStyle.background,
                      shadowColor: typeStyle.color,
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 }
                    }
                  ]
                ]}
                onPress={() => switchWeaponType(type)}
              >
                <Text style={[
                  styles.weaponTypeTabText,
                  isActive && [styles.activeWeaponTypeTabText, { color: typeStyle.color }]
                ]}>
                  {type}
                </Text>
                <View style={[
                  styles.weaponReadyIndicator,
                  {
                    backgroundColor: readyWeapons === totalWeapons ? typeStyle.color :
                      readyWeapons > 0 ? '#FFAA00' : '#666666'
                  }
                ]}>
                  <Text style={[
                    styles.weaponReadyText,
                    { color: readyWeapons > 0 ? '#000000' : '#CCCCCC' }
                  ]}>
                    {readyWeapons}/{totalWeapons}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Selected Weapon Group */}
      <Animated.View style={[
        styles.selectedWeaponGroup,
        {
          borderColor: currentTypeStyle.color,
          transform: [{ scale: weaponSwitchAnimation }],
          opacity: weaponSwitchAnimation
        }
      ]}>
        <View style={styles.weaponGroupHeader}>
          <Text style={[styles.weaponGroupTitle, { color: currentTypeStyle.color }]}>
            {selectedWeaponType.toUpperCase()} SYSTEMS ONLINE
          </Text>
        </View>

        {/* Weapon List */}
        <View style={styles.weaponList}>
          {selectedWeapons.map((weapon, weaponIndex) => {
            const weaponCooldown = weaponCooldowns.find((w) => w.id === weapon.id);
            const cooldown = weaponCooldown?.cooldown || 0;
            const animation = weaponCooldown?.animation;
            const isCharging = chargingWeapons.has(weapon.id);
            const durabilityPercentage =
              (weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability) * 100;
            const canFire =
              (mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources]?.current ||
                0) >= weapon.weaponDetails.cost.amount;

            return (
              <Animated.View
                key={weaponIndex}
                style={[
                  styles.weaponItem,
                  isCharging && { backgroundColor: currentTypeStyle.background },
                  {
                    borderColor: currentTypeStyle.color,
                    backgroundColor: isCharging ? currentTypeStyle.background : 'rgba(13, 13, 43, 0.7)'
                  }
                ]}
              >
                <View style={styles.weaponHeader}>
                  <Text style={[styles.weaponName, { color: currentTypeStyle.color }]}>
                    {weapon.weaponDetails.name}
                  </Text>
                  <Text
                    style={[
                      styles.durabilityText,
                      durabilityPercentage < 25 ? styles.durabilityLow : null,
                    ]}
                  >
                    {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
                  </Text>
                </View>

                {/* Enhanced Status Bar */}
                <View style={styles.statusContainer}>
                  {cooldown > 0 ? (
                    <>
                      <Animated.View
                        style={[
                          styles.cooldownBar,
                          {
                            width: animation?.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            }),
                            backgroundColor: currentTypeStyle.color,
                          },
                        ]}
                      />
                      <Text style={styles.statusText}>CYCLING {cooldown}s</Text>
                    </>
                  ) : canFire ? (
                    <Text style={[styles.readyText, { color: currentTypeStyle.color }]}>
                      {isCharging ? 'FIRING' : 'READY'}
                    </Text>
                  ) : (
                    <Text style={styles.noResourceText}>NO AMMO</Text>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Enhanced Fire Button */}
        <Animated.View style={{
          transform: [{
            scale: firingAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.95]
            })
          }]
        }}>
          <TouchableOpacity
            disabled={fireableWeapons.length === 0 || isFiring}
            style={[
              styles.fireButton,
              {
                borderColor: currentTypeStyle.color,
                backgroundColor: fireableWeapons.length > 0 && !isFiring ? currentTypeStyle.color : colors.disabledBackground,
                shadowColor: currentTypeStyle.color,
                shadowOpacity: fireableWeapons.length > 0 && !isFiring ? 0.4 : 0,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 }
              },
              (fireableWeapons.length === 0 || isFiring) && styles.disabledButton,
            ]}
            onPress={() => {
              triggerFiringEffect();
              onFireWeaponGroup(selectedWeaponType);
            }}
          >
            <View style={styles.fireButtonContent}>
              <Text style={[
                styles.fireButtonText,
                { color: fireableWeapons.length > 0 && !isFiring ? colors.textPrimary : colors.disabledText }
              ]}>
                {isFiring ? 'FIRING' : `FIRE ${selectedWeaponType.toUpperCase()}S`}
                {Object.entries(totalCost).map(([resourceType, amount]) => (
                  <View key={resourceType} style={styles.resourceCostItem}>
                    <ResourceIcon type={resourceType as keyof PlayerResources} size={16} />
                    <Text style={styles.resourceAmountText}>{amount}</Text>
                  </View>
                ))}
              </Text>

            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  weaponSystemContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  weaponTypeTabs: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'center',
  },
  weaponTypeTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(26, 26, 61, 0.6)',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    position: 'relative',
  },
  activeWeaponTypeTab: {
    backgroundColor: 'rgba(26, 26, 61, 0.9)',
    borderWidth: 2,
  },
  weaponTypeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  activeWeaponTypeTabText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  weaponReadyIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.successGradient[0],
    borderRadius: 12,
    minWidth: 24,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  weaponReadyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background,
  },
  weaponGroupHeader: {
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  weaponGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  selectedWeaponGroup: {
    backgroundColor: 'rgba(26, 26, 61, 0.8)',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 8,
  },
  weaponList: {
    marginBottom: 8,
  },
  weaponItem: {
    marginBottom: 6,
    backgroundColor: 'rgba(13, 13, 43, 0.7)',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weaponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  weaponName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  durabilityText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  durabilityLow: {
    color: colors.error,
  },
  statusContainer: {
    height: 16,
    backgroundColor: colors.disabledBackground,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cooldownBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  readyText: {
    fontSize: 9,
    color: colors.successGradient[0],
    fontWeight: 'bold',
  },
  noResourceText: {
    color: colors.error,
    fontSize: 9,
  },
  fireButton: {
    padding: 6,
    backgroundColor: colors.primary,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.glowEffect,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBorder,
    shadowOpacity: 0,
  },
  fireButtonContent: {
    alignItems: 'center',
  },
  fireButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  resourceCosts: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resourceCostItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },
  resourceAmountText: {
    marginLeft: 2,
    fontSize: 10,
    color: colors.textPrimary,
  },
});

export default WeaponGroups; 