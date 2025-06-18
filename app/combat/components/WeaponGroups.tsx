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
  const weaponTypes = Object.keys(weaponGroups);
  const [selectedWeaponType, setSelectedWeaponType] = React.useState<string>(
    weaponTypes[0] || ''
  );
  const [firingWeaponType, setFiringWeaponType] = React.useState<string | null>(null);
  const [firingAnimation] = React.useState(new Animated.Value(0));
  const [tabAnimation] = React.useState(new Animated.Value(1));

  // Update selected type if it doesn't exist anymore
  React.useEffect(() => {
    if (!weaponGroups[selectedWeaponType] && weaponTypes.length > 0) {
      setSelectedWeaponType(weaponTypes[0]);
    }
  }, [weaponGroups, selectedWeaponType, weaponTypes]);

  // Tab switching animation
  const switchWeaponType = (newType: string) => {
    if (newType === selectedWeaponType) return;

    Animated.sequence([
      Animated.timing(tabAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tabAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setSelectedWeaponType(newType), 150);
  };

  // Firing animation effect
  const triggerFiringEffect = (weaponType: string) => {
    setFiringWeaponType(weaponType);

    Animated.sequence([
      Animated.timing(firingAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(firingAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFiringWeaponType(null);
    });
  };

  if (weaponTypes.length === 0) return null;

  // Get weapon type styling
  const getWeaponTypeStyle = (type: string) => {
    const styles = {
      'Laser': {
        color: '#00F5FF', // Bright cyan for lasers
        accent: '#40E0D0', // Turquoise accent
        bg: 'linear-gradient(135deg, rgba(0, 245, 255, 0.08) 0%, rgba(0, 100, 150, 0.12) 100%)',
        bgSolid: 'rgba(0, 50, 80, 0.3)'
      },
      'Missile': {
        color: '#FF6B35', // Bright orange for missiles
        accent: '#FF8C42', // Lighter orange accent
        bg: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(150, 50, 0, 0.12) 100%)',
        bgSolid: 'rgba(80, 30, 0, 0.3)'
      },
      'Blaster': {
        color: '#00FF88', // Bright green for blasters
        accent: '#33FF99', // Lighter green accent
        bg: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 150, 80, 0.12) 100%)',
        bgSolid: 'rgba(0, 50, 30, 0.3)'
      },
      'Cannon': {
        color: '#FFD700', // Gold for cannons
        accent: '#FFED4E', // Bright yellow accent
        bg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(180, 150, 0, 0.12) 100%)',
        bgSolid: 'rgba(80, 60, 0, 0.3)'
      },
    };
    return styles[type as keyof typeof styles] || {
      color: colors.primary,
      accent: colors.glowEffect,
      bg: '#1A1A3D',
      bgSolid: '#1A1A3D'
    };
  };

  const renderWeaponGroup = (weaponType: string) => {
    const weapons = weaponGroups[weaponType] || [];
    const typeStyle = getWeaponTypeStyle(weaponType);
    const isFiringThis = firingWeaponType === weaponType;

    const fireableWeapons = weapons.filter((weapon) => {
      const { type: resourceType, amount } = weapon.weaponDetails.cost;
      return (mainShip.resources[resourceType as keyof PlayerResources]?.current || 0) >= amount;
    });

    const readyWeapons = weapons.filter(weapon => {
      const cooldown = weaponCooldowns.find(w => w.id === weapon.id)?.cooldown || 0;
      return cooldown === 0;
    }).length;

    const totalCost = fireableWeapons.reduce((acc, weapon) => {
      const { type: resourceType, amount } = weapon.weaponDetails.cost;
      acc[resourceType] = (acc[resourceType] || 0) + amount;
      return acc;
    }, {} as { [key: string]: number });

    const canFire = fireableWeapons.length > 0 && !isFiring;

    return (
      <Animated.View
        style={[
          styles.weaponGroup,
          {
            backgroundColor: typeStyle.bgSolid,
            borderColor: typeStyle.color,
            borderWidth: 2,
            shadowColor: typeStyle.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: tabAnimation,
            transform: [
              {
                scale: tabAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              },
              {
                scale: isFiringThis ? firingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02]
                }) : 1
              }
            ]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.groupHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.weaponTypeName, { color: typeStyle.color }]}>
              {weaponType.toUpperCase()} SYSTEMS
            </Text>
            <View style={[styles.statusIndicator, { backgroundColor: typeStyle.color }]}>
              <Text style={styles.statusText}>{readyWeapons}/{weapons.length}</Text>
            </View>
          </View>

          {/* Resource Cost */}
          {Object.entries(totalCost).length > 0 && (
            <View style={styles.costDisplay}>
              {Object.entries(totalCost).map(([resourceType, amount]) => (
                <View key={resourceType} style={styles.costItem}>
                  <ResourceIcon type={resourceType as keyof PlayerResources} size={14} />
                  <Text style={[styles.costText, { color: typeStyle.accent }]}>{amount}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Weapons List */}
        <View style={styles.weaponsList}>
          {weapons.map((weapon, index) => {
            const weaponCooldown = weaponCooldowns.find((w) => w.id === weapon.id);
            const cooldown = weaponCooldown?.cooldown || 0;
            const animation = weaponCooldown?.animation;
            const canFireWeapon = (mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources]?.current || 0) >= weapon.weaponDetails.cost.amount;
            const durabilityPercentage = (weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability) * 100;

            return (
              <View key={index} style={styles.weaponItem}>
                <View style={styles.weaponInfo}>
                  <Text style={[styles.weaponName, { color: typeStyle.accent }]}>
                    {weapon.weaponDetails.name}
                  </Text>

                  {/* Status Bar */}
                  <View style={styles.weaponStatusBar}>
                    {cooldown > 0 ? (
                      <>
                        {/* Cooldown background */}
                        <View style={[styles.cooldownBackground, { backgroundColor: 'rgba(255,0,0,0.2)' }]} />
                        {/* Cooldown progress - empties from right to left as time passes */}
                        <Animated.View style={[
                          styles.cooldownProgress,
                          {
                            width: animation?.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["100%", "0%"], // Start full, empty as cooldown progresses
                            }),
                            backgroundColor: '#FF4757', // Red for cooldown
                            alignSelf: 'flex-end', // Align to right side
                          }
                        ]} />
                        {/* Cooldown text overlay */}
                        <View style={styles.cooldownTextOverlay}>
                          <Text style={styles.cooldownText}>
                            {cooldown.toFixed(1)}s
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={[
                          styles.readyBar,
                          { backgroundColor: canFireWeapon ? typeStyle.color : '#666' }
                        ]} />
                        <View style={styles.cooldownTextOverlay}>
                          <Text style={[styles.readyText, { color: canFireWeapon ? '#000' : '#999' }]}>
                            READY
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* Durability */}
                <View style={styles.durabilitySection}>
                  <View style={[
                    styles.durabilityBar,
                    { backgroundColor: 'rgba(255,255,255,0.1)' }
                  ]}>
                    <View style={[
                      styles.durabilityFill,
                      {
                        width: `${durabilityPercentage}%`,
                        backgroundColor: durabilityPercentage > 30 ? typeStyle.color : '#FF4757'
                      }
                    ]} />
                  </View>
                  <Text style={styles.durabilityText}>
                    {Math.round(durabilityPercentage)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Fire Button */}
        <TouchableOpacity
          disabled={!canFire}
          style={[
            styles.fireButton,
            {
              backgroundColor: canFire ? typeStyle.color : '#2A2A2A',
              borderColor: canFire ? typeStyle.color : '#555',
              shadowColor: canFire ? typeStyle.color : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: canFire ? 0.5 : 0,
              shadowRadius: canFire ? 10 : 0,
              elevation: canFire ? 8 : 0,
            },
            !canFire && styles.disabledFireButton,
          ]}
          onPress={() => {
            triggerFiringEffect(weaponType);
            onFireWeaponGroup(weaponType);
          }}
        >
          <Text style={[
            styles.fireButtonText,
            {
              color: canFire ? '#000' : '#666',
              textShadowColor: canFire ? 'rgba(0,0,0,0.5)' : 'transparent',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }
          ]}>
            {isFiringThis ? 'FIRING...' : 'ENGAGE'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.weaponSystemContainer}>
      <View style={styles.hudHeader}>
        <Text style={styles.hudTitle}>WEAPON SYSTEMS</Text>
        <View style={styles.systemStatus}>
          <View style={[styles.statusDot, { backgroundColor: '#2ED573' }]} />
          <Text style={styles.systemStatusText}>ONLINE</Text>
        </View>
      </View>

      {/* Weapon Type Tabs */}
      <View style={styles.tabContainer}>
        {weaponTypes.map((weaponType) => {
          const typeStyle = getWeaponTypeStyle(weaponType);
          const isActive = selectedWeaponType === weaponType;
          const weapons = weaponGroups[weaponType] || [];
          const readyWeapons = weapons.filter(weapon => {
            const cooldown = weaponCooldowns.find(w => w.id === weapon.id)?.cooldown || 0;
            return cooldown === 0;
          }).length;

          return (
            <TouchableOpacity
              key={weaponType}
              style={[
                styles.tab,
                {
                  borderColor: typeStyle.color,
                  backgroundColor: isActive ? typeStyle.bgSolid : 'rgba(0,0,0,0.2)',
                  shadowColor: isActive ? typeStyle.color : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isActive ? 0.4 : 0,
                  shadowRadius: isActive ? 6 : 0,
                  elevation: isActive ? 6 : 0,
                },
                isActive && styles.activeTab,
              ]}
              onPress={() => switchWeaponType(weaponType)}
            >
              <Text style={[
                styles.tabText,
                { color: isActive ? typeStyle.color : colors.textSecondary }
              ]}>
                {weaponType.toUpperCase()}
              </Text>

              {/* Ready indicator */}
              <View style={[
                styles.tabIndicator,
                {
                  backgroundColor: readyWeapons === weapons.length ? typeStyle.color :
                    readyWeapons > 0 ? '#FFA502' : '#666'
                }
              ]}>
                <Text style={[
                  styles.tabIndicatorText,
                  { color: readyWeapons > 0 ? '#000' : '#CCC' }
                ]}>
                  {readyWeapons}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Weapon Group */}
      <View style={styles.weaponGroupContainer}>
        {renderWeaponGroup(selectedWeaponType)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weaponSystemContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    marginHorizontal: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  hudTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  systemStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  activeTab: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tabIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A3D',
  },
  tabIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  weaponGroupContainer: {
    minHeight: 200,
  },
  weaponGroup: {
    backgroundColor: 'rgba(26, 26, 61, 0.8)',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weaponTypeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  costDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  costText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  weaponsList: {
    marginBottom: 12,
  },
  weaponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  weaponInfo: {
    flex: 1,
    marginRight: 12,
  },
  weaponName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  weaponStatusBar: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  cooldownBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 2,
  },
  cooldownProgress: {
    height: '100%',
    borderRadius: 2,
  },
  readyBar: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
  cooldownTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  readyText: {
    fontSize: 9,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  durabilitySection: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  durabilityBar: {
    width: 50,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  durabilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  durabilityText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fireButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  disabledFireButton: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  fireButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default WeaponGroups; 