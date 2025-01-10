import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import colors from "@/utils/colors";
import ShipStatus from "@/components/ShipStatus";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import { IMainShip, IPirate, PlayerResources } from "@/utils/defaults";
import ResourceIcon from "@/components/ui/ResourceIcon";

const CombatPage = ({ route, navigation }: { route: any; navigation: any }) => {
  const { planet } = route.params;
  const game = useGame();

  if (!game) return null;

  const { mainShip, setMainShip } = game;

  const generateEnemies = () => [
    ...Array(15).fill(planet.enemies[0]),
    planet.enemies[2],
    planet.enemies[3],
  ];

  const resourceColors: { [key: string]: string } = {
    energy: "#FFD93D", // Example: Yellow for energy
    solarPlasma: "#FF5722", // Example: Orange/Yellow for solar plasma
    darkMatter: "#6A0DAD", // Purple for dark matter
    fuel: "#FF6B6B", // Orange-Red for fuel
    frozenHydrogen: "#77C0D8", // Light Blue for frozen hydrogen
    alloys: "#C0C0C0", // Silver for alloys
  };

  const [enemies, setEnemies] = useState(generateEnemies());
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [pirate, setPirate] = useState(enemies[0]);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [weaponGroups, setWeaponGroups] = useState<{ [key: string]: IWeapon[] }>({});
  const [weaponCooldowns, setWeaponCooldowns] = useState(
    mainShip.equippedWeapons.map((weapon) => ({
      id: weapon.id,
      cooldown: 0,
      maxCooldown: weapon.weaponDetails.cooldown,
      animation: new Animated.Value(0),
      weaponDetails: weapon.weaponDetails, // Include weapon details
    }))
  );

  const scrollViewRef = useRef<ScrollView>(null);



  const calculateHitChance = (attackerSpeed: number, defenderSpeed: number) => {
    const speedDifference = defenderSpeed - attackerSpeed;
    const adjustedHitChance = Math.max(0.8 - speedDifference * 0.05, 0.1); // Minimum hit chance 10%
    return Math.random() <= adjustedHitChance;
  };


  const spawnNextPirate = () => {
    if (currentEnemyIndex < enemies.length - 1) {
      const nextIndex = currentEnemyIndex + 1;
      setCurrentEnemyIndex(nextIndex);
      setPirate(enemies[nextIndex]);
      setCombatLog((prev) => [...prev, `New enemy: ${enemies[nextIndex].name} appeared!`]);
    } else {
      setCombatLog((prev) => [...prev, "All enemies defeated!"]);
    }
  };

  const startCooldownAnimation = (weaponId: string, duration: number) => {
    const weaponCooldown = weaponCooldowns.find((w) => w.id === weaponId);
    if (weaponCooldown) {
      weaponCooldown.animation.setValue(1);
      Animated.timing(weaponCooldown.animation, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start(() => {
        setWeaponCooldowns((prev) =>
          prev.map((w) => (w.id === weaponId ? { ...w, cooldown: 0 } : w))
        );
      });
    }
  };

  const handleAttackByType = (weaponsType: string) => {
    const weapons = weaponGroups[weaponsType];
    if (!weapons || weapons.length === 0) {
      setCombatLog((prev) => [...prev, `No weapons of type ${weaponsType} equipped!`]);
      return;
    }

    let newMainShip = mainShip;
    let totalDamage = 0;

    const updatedWeaponCooldowns = weaponCooldowns.map((weaponCooldown) => {
      if (weaponCooldown.weaponDetails.type === weaponsType && weaponCooldown.cooldown === 0) {
        const { cost, durability } = weaponCooldown.weaponDetails;
        const currentResource = mainShip.resources[cost.type as keyof PlayerResources]?.current || 0;

        if (currentResource < cost.amount) {
          setCombatLog((prev) => [
            ...prev,
            `Not enough ${cost.type} to fire ${weaponCooldown.weaponDetails.name}!`,
          ]);
          return weaponCooldown;
        }

        // Deduct resources
        const updatedResources = {
          ...mainShip.resources,
          [cost.type]: {
            ...mainShip.resources[cost.type as keyof PlayerResources],
            current: currentResource - cost.amount,
          },
        };
        newMainShip = { ...mainShip, resources: updatedResources };

        // Calculate hit chance and apply damage
        if (Math.random() <= 0.8) {
          const damage = Math.floor(weaponCooldown.weaponDetails.power * (1 - pirate.defense / 100));
          totalDamage += damage;
          setCombatLog((prev) => [
            ...prev,
            `${weaponCooldown.weaponDetails.name} hit for ${damage} damage!`,
          ]);
        } else {
          setCombatLog((prev) => [...prev, `${weaponCooldown.weaponDetails.name} missed!`]);
        }

        // Handle durability reduction
        const newDurability = durability - 1;
        if (newDurability <= 0) {
          setCombatLog((prev) => [
            ...prev,
            `${weaponCooldown.weaponDetails.name} has broken!`,
          ]);
          newMainShip.equippedWeapons = newMainShip.equippedWeapons.filter(
            (w) => w.id !== weaponCooldown.id
          );
          return null;
        }

        // Start cooldown
        weaponCooldown.weaponDetails.durability = newDurability;
        startCooldownAnimation(weaponCooldown.id, weaponCooldown.weaponDetails.cooldown);
        return { ...weaponCooldown, cooldown: weaponCooldown.weaponDetails.cooldown };
      }
      return weaponCooldown.cooldown > 0
        ? { ...weaponCooldown, cooldown: weaponCooldown.cooldown - 1 }
        : weaponCooldown;
    });

    setWeaponCooldowns(updatedWeaponCooldowns.filter((w): w is NonNullable<typeof w> => w !== null));

    setMainShip(newMainShip);
    setPirate((prev: IPirate) => ({
      ...prev,
      health: Math.max(prev.health - totalDamage, 0),
    }));
  };


  useEffect(() => {
    // Group weapons by type
    const groupedWeapons = mainShip.equippedWeapons.reduce((groups: { [key: string]: IWeapon[] }, weapon) => {
      const type = weapon.weaponDetails.type;
      if (!groups[type]) groups[type] = [];

      groups[type].push(weapon);

      return groups;
    }, {});

    setWeaponGroups(groupedWeapons);
  }, [mainShip.equippedWeapons, game.weapons]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pirate.health > 0) {
        const damage = Math.max(pirate.attack - mainShip.baseStats.defense, 1);
        setMainShip((prev: IMainShip) => ({
          ...prev,
          baseStats: { ...prev.baseStats, health: Math.max(prev.baseStats.health - damage, 0) },
        }));
        setCombatLog((prev) => [...prev, `${pirate.name} hit for ${damage} damage!`]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pirate.health, mainShip.baseStats.defense]);


  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [combatLog]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeaponCooldowns((prev) =>
        prev.map((weapon) => {
          if (weapon.cooldown > 0) {
            return { ...weapon, cooldown: Math.round((weapon.cooldown - 0.1) * 10) / 10 } // Decrease by 0.1s and round to 1 decimal place
          }
          return weapon;
        })
      );
    }, 100);

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [weaponCooldowns]);


  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.header}>{planet.name} - Enemies Left: {enemies.length - currentEnemyIndex}</Text>
        <View style={styles.pirateImageContainer}>
          <Text style={styles.pirateName}>{pirate.name}: {pirate.health}/{pirate.maxHealth} HP</Text>
          <View style={styles.healthBarContainer}>
            <Svg width="100%" height="20">
              <Rect x="0" y="0" width="100%" height="20" fill={colors.disabledBackground} />
              <Rect x="0" y="0" width={`${(pirate.health / pirate.maxHealth) * 100}%`} height="20" fill={colors.error} />
            </Svg>
          </View>
        </View>
        {/* Button to spawn next pirate */}
        {pirate.health === 0 && currentEnemyIndex < enemies.length - 1 && (
          <TouchableOpacity style={styles.spawnButton} onPress={spawnNextPirate}>
            <Text style={styles.spawnButtonText}>Spawn Next Pirate</Text>
          </TouchableOpacity>
        )}

        <View style={styles.healthContainer}>
          <Text style={styles.healthText}>Main Ship Health: {mainShip.baseStats.health}</Text>
          <Svg width="100%" height="20">
            <Rect x="0" y="0" width="100%" height="20" fill={colors.disabledBackground} />
            <Rect x="0" y="0" width={`${(mainShip.baseStats.health / mainShip.baseStats.maxHealth) * 100}%`} height="20" fill={colors.successGradient[0]} />
          </Svg>
        </View>

        <View style={styles.logContainer}>
          <Text style={styles.logHeader}>Combat Log</Text>
          <ScrollView ref={scrollViewRef}>
            {combatLog.map((log, index) => {
              let style = styles.logTextGeneral;

              if (log.includes("hit for")) {
                // Extract weapon type from the log and map it to a resource
                const matchedWeapon = mainShip.equippedWeapons.find((weapon) =>
                  log.includes(weapon.weaponDetails.name)
                );

                if (matchedWeapon) {
                  const resourceType = matchedWeapon.weaponDetails.cost.type;
                  style = {
                    ...styles.logText,
                    color: resourceColors[resourceType] || colors.textPrimary, // Default to primary if no match
                  };
                }
              } else if (log.includes("missed")) {
                style = styles.logTextMiss; // Misses
              } else if (log.includes("New enemy") || log.includes("defeated")) {
                style = styles.logTextVictory; // Victory messages
              } else if (log.includes("Not enough") || log.includes("was defeated")) {
                style = styles.logTextWarning; // Warnings or negative events
              } else if (log.includes("hit for")) {
                style = styles.logTextPirate; // Pirate's attacks
              }

              return (
                <Text key={index} style={[styles.logText, style]}>
                  {log}
                </Text>
              );
            })}
          </ScrollView>
        </View>


        <View style={styles.optionsGridContainer}>
          {/* ... (keep existing code until weaponItem section) ... */}
          {Object.entries(weaponGroups).map(([type, weapons]) => {
            const fireableWeapons = weapons.filter((weapon) => {
              const { type: resourceType, amount } = weapon.weaponDetails.cost;
              return (
                (mainShip.resources[resourceType as keyof PlayerResources]?.current || 0) >= amount
              );
            });

            const totalCost = fireableWeapons.reduce((acc, weapon) => {
              const { type: resourceType, amount } = weapon.weaponDetails.cost;
              acc[resourceType] = (acc[resourceType] || 0) + amount;
              return acc;
            }, {} as { [key: string]: number });

            return (
              <View key={type} style={styles.weaponGroup}>
                <Text style={styles.groupTitle}>{type.toUpperCase()}</Text>
                <View style={styles.weaponList}>
                  {weapons.map((weapon) => {
                    const weaponCooldown = weaponCooldowns.find((w) => w.id === weapon.id);
                    const cooldown = weaponCooldown?.cooldown || 0;
                    const animation = weaponCooldown?.animation;
                    const durabilityPercentage = (weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability) * 100;

                    const canFire =
                      (mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources]?.current || 0) >=
                      weapon.weaponDetails.cost.amount;

                    return (
                      <View key={weapon.id} style={styles.weaponItem}>
                        <View style={styles.weaponHeader}>
                          <Text style={styles.weaponName}>{weapon.weaponDetails.name}</Text>
                          <Text style={[
                            styles.durabilityText,
                            durabilityPercentage < 25 ? styles.durabilityLow : null
                          ]}>
                            {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
                          </Text>
                        </View>
                        <View style={styles.durabilityBar}>
                          <View style={[
                            styles.durabilityFill,
                            { width: `${durabilityPercentage}%` },
                            durabilityPercentage < 25 ? styles.durabilityLowFill : null
                          ]} />
                        </View>
                        <View style={styles.cooldownContainer}>
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
                                    backgroundColor: resourceColors[weapon.weaponDetails.cost.type] || colors.warning,
                                  },
                                ]}
                              />
                              <Text style={styles.cooldownText}>{cooldown}s</Text>
                            </>
                          ) : canFire ? (
                            <Text style={styles.readyText}>Ready</Text>
                          ) : (
                            <Text style={styles.noResourceText}>No Resources</Text>
                          )}
                        </View>
                        <View style={styles.resourceCostItem}>
                          <ResourceIcon type={weapon.weaponDetails.cost.type as keyof PlayerResources} size={16} />
                          <Text style={styles.resourceAmountText}>{weapon.weaponDetails.cost.amount}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <TouchableOpacity
                  disabled={!isPlayerTurn || fireableWeapons.length === 0}
                  style={[
                    styles.attackButton,
                    fireableWeapons.length === 0 && styles.disabledButton,
                  ]}
                  onPress={() => handleAttackByType(type)}
                >
                  <View style={styles.resourceCosts}>
                    <Text style={styles.attackButtonText}>Fire</Text>
                    {Object.entries(totalCost).map(([resourceType, amount]) => (
                      <View key={resourceType} style={styles.resourceCostItem}>
                        <ResourceIcon type={resourceType as keyof PlayerResources} size={16} />
                        <Text style={styles.resourceAmountText}>{amount}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>
      <ShipStatus />
    </>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  spawnButton: {
    backgroundColor: colors.buttonGreen,
    padding: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  spawnButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  weaponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durabilityBar: {
    height: 4,
    backgroundColor: colors.disabledBackground,
    marginTop: 4,
  },
  durabilityFill: {
    height: '100%',
    backgroundColor: colors.successGradient[0],
  },
  durabilityLowFill: {
    backgroundColor: colors.error,
  },
  durabilityText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  durabilityLow: {
    color: colors.error,
  },
  scrollableLog: {
    height: 100,
    backgroundColor: colors.transparentBackground,
    padding: 8,
    maxHeight: 160,
  },
  scrollableContent: {
    flexGrow: 1,
    maxHeight: 160,
  },
  resourceCosts: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logHeader: {
    fontSize: 14,
    color: colors.glowEffect,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  pirateImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  pirateImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    borderColor: colors.glowEffect,
    borderWidth: 2,
  },
  pirateName: {
    color: colors.textPrimary,
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  healthBarContainer: {
    width: "80%", // Adjust width to fit nicely under the image
    marginTop: 10,
  },
  healthContainer: {
    marginBottom: 16,
  },
  healthText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
  },
  gridButton: {
    backgroundColor: colors.panelBackground,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
    margin: 6,
    alignItems: "center",
    width: "45%",
  },
  escapeButton: {
    backgroundColor: colors.error,
  },
  gridOptionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  gridCostText: {
    color: colors.warning,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  logContainer: {
    backgroundColor: colors.transparentBackground,
    padding: 10,
    maxHeight: 160,
  },
  logText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  logTextPlayer: {
    color: colors.primary, // Player's attacks
    fontWeight: "bold",
  },
  logTextPirate: {
    color: colors.error, // Pirate's attacks
  },
  logTextMiss: {
    color: colors.textSecondary, // Misses
    fontStyle: "italic",
  },
  logTextVictory: {
    color: colors.successGradient[0], // Bright green to signify victory
    fontWeight: "bold", // Make it stand out
    fontSize: 14, // Keep it consistent with other log text
    textAlign: "center", // Center align to emphasize the message
    marginBottom: 4, // Add spacing between entries
  },
  logTextWarning: {
    color: colors.warning, // Warnings or negative events
    fontWeight: "bold",
    textAlign: "center",
  },
  logTextGeneral: {
    color: colors.textPrimary, // Default log color
  },
  weaponName: {
    fontSize: 11,
    marginRight: 3,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.error,
    opacity: 0.8,
  },
  readyText: {
    fontSize: 12,
    color: colors.successGradient[0],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  attackButtonText: {
    fontSize: 14,
    marginRight: 6,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: colors.disabledBackground,
  },
  optionsGridContainer: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap", // Allow items to wrap to the next row
    justifyContent: "space-between", // Space evenly in the row
  },
  weaponGroup: {
    width: "48%", // Adjust width to fit two columns
    marginVertical: 6,
    padding: 8,
    backgroundColor: colors.panelBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  weaponList: {
    marginBottom: 12,
  },
  weaponItem: {
    marginBottom: 6,
  },
  cooldownContainer: {
    position: "relative",
    height: 20,
    backgroundColor: colors.disabledBackground,
    overflow: "hidden",
    marginVertical: 6,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
  },
  cooldownBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.secondary,
  },
  cooldownText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  noResourceText: {
    color: colors.error,
    fontSize: 12,
  },
  resourceCostItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceAmountText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textPrimary,
  },
  attackButton: {
    padding: 8,
    backgroundColor: colors.buttonGreen,
    alignItems: "center",
  },

});

export default CombatPage;
