import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import colors from "@/utils/colors";
import { IMainShip, IPirate, PlayerResources, resourceColors } from "@/utils/defaults";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { LinearGradient } from 'expo-linear-gradient';

const CombatPage = ({ route, navigation }: { route: any; navigation: any }) => {
  const { planet } = route.params;
  const game = useGame();

  if (!game) return null;


  const { mainShip, setMainShip } = game;

  const generateEnemies = () => {
    if (planet.pirateCount <= 0) {
      return [];
    }

    const randomEnemies = Array.from({ length: planet.pirateCount }, () => ({
      ...planet.enemies[Math.floor(Math.random() * planet.enemies.length)],
    }));
    return [...randomEnemies, planet.enemies[1], planet.enemies[2]];
  };


  const [enemies, setEnemies] = useState(generateEnemies());
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [combatLog, setCombatLog] = useState<{ text: string; color?: string }[]>([]);
  const [weaponGroups, setWeaponGroups] = useState<{ [key: string]: IWeapon[] }>({});
  const [canEscape, setCanEscape] = useState(true);
  const [lastEscapeAttempt, setLastEscapeAttempt] = useState(0);
  const [hasEscaped, setHasEscaped] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [activeWeapons, setActiveWeapons] = useState<Set<string>>(new Set());
  const [pirate, setPirate] = useState(enemies[0]);
  const [weaponCooldowns, setWeaponCooldowns] = useState(
    mainShip.equippedWeapons.map((weapon) => ({
      uniqueId: weapon.uniqueId,
      cooldown: 0,
      maxCooldown: weapon.weaponDetails.cooldown,
      animation: new Animated.Value(0),
      weaponDetails: weapon.weaponDetails,
    }))
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const calculateHitChance = (
    weaponAccuracy: number,
    defenderAttackSpeed: number,
    weaponCategory: "Small" | "Medium" | "Large",
    pirateCategory: "Corvette" | "Cruiser" | "Battleship" | "Dreadnought" | "Titan"
  ) => {
    // Base category effectiveness modifiers
    const categoryModifiers: Record<string, Record<string, number>> = {
      Small: {
        Corvette: 15,      // Small weapons excel against corvettes
        Cruiser: 5,        // Still effective against cruisers
        Battleship: -10,   // Less effective against battleships
        Dreadnought: -15,  // Poor against dreadnoughts
        Titan: -20,        // Very poor against titans
      },
      Medium: {
        Corvette: 5,       // Good against corvettes
        Cruiser: 15,       // Excel against cruisers
        Battleship: 10,    // Good against battleships
        Dreadnought: 0,    // Neutral against dreadnoughts
        Titan: -10,        // Poor against titans
      },
      Large: {
        Corvette: -15,     // Poor against small targets
        Cruiser: -5,       // Slightly poor against cruisers
        Battleship: 15,    // Excel against battleships
        Dreadnought: 20,   // Best against dreadnoughts
        Titan: 10,         // Very effective against titans
      },
    };

    // Get the base modifier for this weapon/target combination
    const categoryModifier = categoryModifiers[weaponCategory][pirateCategory] || 0;

    // Calculate evasion based on target's attack speed (faster ships are harder to hit)
    // Cap maximum evasion at 40% to keep combat engaging
    const baseEvasion = Math.min(defenderAttackSpeed * 4, 40);

    // Calculate effective accuracy
    let effectiveAccuracy = weaponAccuracy + categoryModifier;

    // Apply size-based scaling (larger targets are easier to hit)
    const sizeScaling = {
      Corvette: 0,
      Cruiser: 5,
      Battleship: 10,
      Dreadnought: 15,
      Titan: 20,
    };
    effectiveAccuracy += sizeScaling[pirateCategory];

    // Add slight randomness to make combat more dynamic (-5% to +5%)
    const randomVariance = (Math.random() * 10) - 5;

    // Calculate final hit chance
    const finalHitChance = Math.min(
      Math.max(
        (effectiveAccuracy - baseEvasion + randomVariance) / 100,
        0.15  // Minimum 15% hit chance
      ),
      0.90   // Maximum 90% hit chance
    );

    // Log detailed calculation for debugging
    console.log(
      `Weapon Attack Roll:`,
      `\nBase Accuracy: ${weaponAccuracy}%`,
      `\nTarget Category: ${pirateCategory}`,
      `\nCategory Modifier: ${categoryModifier}%`,
      `\nSize Scaling: +${sizeScaling[pirateCategory]}%`,
      `\nTarget Evasion: ${baseEvasion.toFixed(1)}%`,
      `\nRandom Variance: ${randomVariance.toFixed(1)}%`,
      `\nFinal Hit Chance: ${(finalHitChance * 100).toFixed(1)}%`
    );

    return Math.random() <= finalHitChance;
  };

  const unlockNextPlanet = () => {
    const galaxyIndex = game.galaxies.findIndex((g) => g.id === planet.galaxyId);
    if (galaxyIndex === -1) return;

    const updatedGalaxies = game.galaxies.map((galaxy) => {
      if (galaxy.id !== planet.galaxyId) return galaxy;

      // Update the planets for the correct galaxy
      const updatedPlanets = galaxy.planets.map((p) => {
        if (p.id === planet.id) {
          // Clear pirateCount for the defeated planet
          return { ...p, pirateCount: 0 };
        }
        if (p.id === planet.id + 1) {
          // Unlock the next planet
          return { ...p, locked: false };
        }
        return p;
      });

      return { ...galaxy, planets: updatedPlanets };
    });

    // Update the game state
    game.setUnlockedGalaxies(updatedGalaxies);

    // Add messages to the combat log
    setCombatLog((prev) => [
      ...prev,
      { text: `Planet ${planet.name} cleared of all pirates!`, color: colors.successGradient[0] },
      { text: `Next planet unlocked!`, color: colors.primary },
    ]);
  };

  const spawnNextPirate = () => {
    if (currentEnemyIndex < enemies.length - 1) {
      const nextIndex = currentEnemyIndex + 1;
      setCurrentEnemyIndex(nextIndex);
      setPirate(enemies[nextIndex]);
      setCombatLog((prev) => [
        ...prev,
        { text: `New enemy: ${enemies[nextIndex].name} appeared!`, color: colors.warning },
      ]);
    } else {
      setPirate(null); // No more pirates
      setCombatLog((prev) => [
        ...prev,
        { text: "All enemies defeated! Unlocking next planet.", color: colors.successGradient[0] },
      ]);

      unlockNextPlanet();
    }
  };
  const startCooldownAnimation = (uniqueId: string, duration: number) => {
    const weaponCooldown = weaponCooldowns.find((w) => w.uniqueId === uniqueId);
    if (weaponCooldown) {
      weaponCooldown.animation.setValue(1);
      Animated.timing(weaponCooldown.animation, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start(() => {
        setWeaponCooldowns((prev) =>
          prev.map((w) => (w.uniqueId === uniqueId ? { ...w, cooldown: 0 } : w))
        );
      });
    }
  };

  const handleWeaponFire = (weapon: IWeapon) => {
    const uniqueId = weapon.uniqueId as string;

    // Only proceed if the weapon is active
    if (!activeWeapons.has(uniqueId)) return;

    const cooldown = weaponCooldowns.find((w) => w.uniqueId === uniqueId)?.cooldown || 0;
    const currentResource = mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources]?.current || 0;
    const canFire = currentResource >= weapon.weaponDetails.cost.amount && cooldown === 0;

    if (!canFire) return;

    let newMainShip = mainShip;

    // Deduct resources
    const updatedResources = {
      ...mainShip.resources,
      [weapon.weaponDetails.cost.type]: {
        ...mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources],
        current: currentResource - weapon.weaponDetails.cost.amount,
      },
    };

    newMainShip = { ...mainShip, resources: updatedResources };

    // Calculate hit chance and apply damage
    const hit = calculateHitChance(
      weapon.weaponDetails.accuracy,
      pirate?.attackSpeed ?? 0,
      weapon.weaponDetails.category,
      pirate.category
    );

    if (hit) {
      const randomMultiplier = Math.random() * 0.4 + 0.8;
      const damage = Math.floor(
        weapon.weaponDetails.power * randomMultiplier * (1 - pirate.defense / 100)
      );

      setCombatLog((prev) => [
        ...prev,
        { text: `${weapon.weaponDetails.name} hit for ${damage} damage!`, color: resourceColors[weapon.weaponDetails.cost.type] },
      ]);

      setPirate((prev: IPirate) => ({
        ...prev,
        health: Math.max(prev.health - damage, 0),
      }));
    } else {
      setCombatLog((prev) => [
        ...prev,
        { text: `${weapon.weaponDetails.name} missed!`, color: colors.textSecondary },
      ]);
    }

    // Handle durability reduction
    const newDurability = weapon.weaponDetails.durability - 1;
    if (newDurability <= 0) {
      setCombatLog((prev) => [
        ...prev,
        { text: `${weapon.weaponDetails.name} has broken!`, color: colors.secondary },
      ]);
      newMainShip.equippedWeapons = newMainShip.equippedWeapons.filter(
        (w) => w.id !== weapon.id
      );
      setActiveWeapons(prev => {
        const next = new Set(prev);
        next.delete(uniqueId);
        return next;
      });
    } else {
      weapon.weaponDetails.durability = newDurability;
    }

    // Start cooldown only for the specific weapon instance
    startCooldownAnimation(uniqueId, weapon.weaponDetails.cooldown);
    setWeaponCooldowns(prev =>
      prev.map(w => w.uniqueId === uniqueId ? { ...w, cooldown: weapon.weaponDetails.cooldown } : w)
    );

    setMainShip(newMainShip);
  };

  // Auto-fire system for active weapons
  useEffect(() => {
    if (activeWeapons.size === 0 || !pirate || hasEscaped) return;

    const interval = setInterval(() => {
      mainShip.equippedWeapons.forEach(weapon => {
        if (activeWeapons.has(weapon.uniqueId as string)) {
          handleWeaponFire(weapon);
        }
      });
    }, 100); // Check every 100ms for weapons that can fire

    return () => clearInterval(interval);
  }, [activeWeapons, pirate, hasEscaped, mainShip.equippedWeapons, weaponCooldowns]);

  const toggleWeapon = (weapon: IWeapon) => {
    const uniqueId = weapon.uniqueId as string;

    setActiveWeapons(prev => {
      const next = new Set(prev);
      if (next.has(uniqueId)) {
        next.delete(uniqueId);
      } else {
        next.add(uniqueId);
        // Fire immediately when activated
        handleWeaponFire(weapon);
      }
      return next;
    });
  };

  // Makes sure we update the weapons when the player changes them
  // in the management 
  ///
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


  const calculatePirateHitChance = (
    pirateAccuracy: number,
    pirateCategory: "Corvette" | "Cruiser" | "Battleship" | "Titan"
  ): boolean => {
    // Category-based accuracy modifiers for pirates
    const categoryModifiers: Record<string, number> = {
      Corvette: -6,  // Smaller ships have reduced accuracy
      Cruiser: -3,   // Balanced accuracy for medium ships
      Battleship: 10, // Large ships are slightly more accurate
      Titan: 12,     // Massive ships are very accurate
    };

    // Apply the modifier based on the category
    const categoryModifier = categoryModifiers[pirateCategory] || 0;

    // Calculate base accuracy based on attack speed
    // Slower ships (higher attackSpeed) are more accurate
    const speedAccuracyBonus = Math.min((pirateAccuracy / 20), 15); // Max 15% bonus from speed

    // Effective accuracy after applying all modifiers
    const effectiveAccuracy = Math.min(
      Math.max(
        (pirateAccuracy + categoryModifier + speedAccuracyBonus),
        10  // Minimum accuracy
      ),
      85  // Maximum accuracy
    );

    // Add slight randomness to make combat more dynamic
    const randomVariance = (Math.random() * 10) - 5; // ±5% random variance

    // Final hit chance calculation
    const finalHitChance = (effectiveAccuracy + randomVariance) / 100;

    console.log(
      `Pirate Attack Roll:`,
      `\nBase Accuracy: ${pirateAccuracy}%`,
      `\nCategory Modifier: ${categoryModifier}%`,
      `\nSpeed Bonus: ${speedAccuracyBonus.toFixed(1)}%`,
      `\nRandom Variance: ${randomVariance.toFixed(1)}%`,
      `\nFinal Hit Chance: ${(finalHitChance * 100).toFixed(1)}%`
    );

    // Determine hit or miss
    return Math.random() <= finalHitChance;
  };

  // Pirate attack
  useEffect(() => {
    if (!pirate || hasEscaped) return;

    // Convert attackSpeed to milliseconds (attackSpeed is in seconds)
    const attackInterval = pirate.attackSpeed * 1000;

    const interval = setInterval(() => {
      if (pirate.health > 0) {
        const pirateAccuracy = Math.min(pirate.attackSpeed * 10, 100);

        // Calculate hit chance using refactored function
        const isHit = calculatePirateHitChance(
          pirateAccuracy,
          pirate.category // Use pirate's category
        );

        if (isHit) {
          // Calculate pirate Damage.
          const pirateAttack = pirate.attack ?? 0; // Default to 0 if undefined
          const playerDefense = mainShip.baseStats.defense ?? 0; // Default to 0 if undefined

          // Add randomness to the damage calculation
          const randomMultiplier = Math.random() * (1.2 - 0.8) + 0.8;
          const damage = Math.max(Math.floor((pirateAttack * randomMultiplier) - playerDefense), 1);

          setMainShip((prev: IMainShip) => ({
            ...prev,
            baseStats: { ...prev.baseStats, health: Math.max(prev.baseStats.health - damage, 0) },
          }));

          setCombatLog((prev) => [
            ...prev,
            { text: `${pirate.name} hit for ${damage} damage!`, color: colors.error },
          ]);
        } else {
          setCombatLog((prev) => [
            ...prev,
            { text: `${pirate.name}'s attack missed!`, color: colors.textSecondary },
          ]);
        }

      } else {
        setCombatLog((prev) => [
          ...prev,
          { text: `${pirate.name} has been defeated!`, color: colors.successGradient[0] },
        ]);

        setEnemies((prev) => prev.filter((_, index) => index !== currentEnemyIndex));
        spawnNextPirate();
        clearInterval(interval);
      }
    }, attackInterval); // Use the calculated attack interval

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [pirate, mainShip.baseStats.defense, hasEscaped, currentEnemyIndex, enemies.length]);


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
    <ImageBackground
      source={require("@/assets/images/space-bg.png")}
      style={styles.backgroundImage}
    >
      {/* Target Overview Panel - EVE Style */}
      <View style={styles.targetOverview}>
        <LinearGradient
          colors={[colors.panelBackground, colors.background]}
          style={styles.targetHeader}
        >
          <Text style={styles.targetTitle}>Target Overview</Text>
        </LinearGradient>
        {pirate && (
          <View style={styles.targetInfo}>
            <View style={styles.targetBasicInfo}>
              <Text style={styles.targetName}>{pirate.name}</Text>
              <Text style={styles.targetClass}>{pirate.category}</Text>
            </View>
            <View style={styles.targetStats}>
              <View style={styles.healthBarContainer}>
                <Text style={styles.healthLabel}>Structure</Text>
                <View style={styles.healthBar}>
                  <LinearGradient
                    colors={[colors.error, colors.redButton]}
                    style={[
                      styles.healthFill,
                      { width: `${(pirate.health / pirate.maxHealth) * 100}%` }
                    ]}
                  />
                  <Text style={styles.healthText}>
                    {pirate.health}/{pirate.maxHealth}
                  </Text>
                </View>
              </View>
              <View style={styles.targetAttributes}>
                <Text style={styles.attributeText}>Defense: {pirate.defense}</Text>
                <Text style={styles.attributeText}>Speed: {pirate.attackSpeed}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Player Ship Status - EVE Style */}
      <View style={styles.shipStatus}>
        <LinearGradient
          colors={[colors.panelBackground, colors.background]}
          style={styles.shipHeader}
        >
          <Text style={styles.shipTitle}>Ship Status</Text>
        </LinearGradient>
        <View style={styles.shipInfo}>
          <View style={styles.healthBarContainer}>
            <Text style={styles.healthLabel}>Structure</Text>
            <View style={styles.healthBar}>
              <LinearGradient
                colors={[colors.successGradient[0], colors.successGradient[1]]}
                style={[
                  styles.healthFill,
                  { width: `${(mainShip.baseStats.health / mainShip.baseStats.maxHealth) * 100}%` }
                ]}
              />
              <Text style={styles.healthText}>
                {mainShip.baseStats.health}/{mainShip.baseStats.maxHealth}
              </Text>
            </View>
          </View>
          <View style={styles.resourceBars}>
            {Object.entries(mainShip.resources).map(([type, resource], index) => (
              <View key={index} style={styles.resourceBar}>
                <ResourceIcon type={type as keyof PlayerResources} size={16} />
                <View style={styles.resourceBarInner}>
                  <LinearGradient
                    colors={[resourceColors[type], colors.background]}
                    style={[
                      styles.resourceFill,
                      { width: `${(resource.current / resource.max) * 100}%` }
                    ]}
                  />
                  <Text style={styles.resourceText}>
                    {resource.current}/{resource.max}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Weapon Groups - EVE Style */}
      <View style={styles.weaponGroups}>
        <View style={styles.weaponHeader}>
          <Text style={styles.weaponTitle}>Weapon Systems</Text>
        </View>
        <ScrollView
          style={styles.weaponList}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
        >
          {Object.entries(weaponGroups).map(([type, weapons], index) => (
            <View key={index} style={styles.weaponTypeGroup}>
              <Text style={styles.weaponTypeTitle}>{type.toUpperCase()}</Text>
              {weapons.map((weapon) => {
                const cooldown = weaponCooldowns.find((w) => w.uniqueId === weapon.uniqueId)?.cooldown || 0;
                const canFire = (mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources]?.current || 0) >= weapon.weaponDetails.cost.amount;

                return (
                  <TouchableOpacity
                    key={weapon.uniqueId}
                    style={[
                      styles.weaponButton,
                      !canFire && styles.weaponButtonDisabled,
                      activeWeapons.has(weapon.uniqueId || '') && styles.weaponButtonActive
                    ]}
                    onPress={() => toggleWeapon(weapon)}
                    disabled={false}
                  >
                    <View style={styles.weaponInfo}>
                      <View style={styles.weaponMainInfo}>
                        <View style={styles.weaponNameContainer}>
                          <Text style={styles.weaponName}>{weapon.weaponDetails.name}</Text>
                        </View>
                        <View style={styles.weaponStats}>
                          <Text style={styles.weaponStat}>
                            DMG: {weapon.weaponDetails.power}
                          </Text>
                          <Text style={styles.weaponStat}>
                            ACC: {weapon.weaponDetails.accuracy}%
                          </Text>
                          <View style={styles.weaponCost}>
                            <ResourceIcon
                              type={weapon.weaponDetails.cost.type as keyof PlayerResources}
                              size={12}
                            />
                            <Text style={styles.costText}>
                              {weapon.weaponDetails.cost.amount}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.durabilityContainer}>
                        <Text style={[
                          styles.durabilityText,
                          weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability < 0.25 && styles.durabilityLow
                        ]}>
                          {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
                        </Text>
                        <View style={styles.durabilityBar}>
                          <LinearGradient
                            colors={weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability < 0.25
                              ? [colors.error, colors.redButton]
                              : [colors.successGradient[0], colors.successGradient[1]]}
                            style={[
                              styles.durabilityFill,
                              { width: `${(weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability) * 100}%` }
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                    {cooldown > 0 && (
                      <View style={[styles.cooldownBar, { width: `${(cooldown / weapon.weaponDetails.cooldown) * 100}%` }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced Combat Log - EVE Style */}
      <View style={styles.combatLog}>
        <LinearGradient
          colors={[colors.panelBackground, colors.background]}
          style={styles.logHeader}
        >
          <Text style={styles.logTitle}>Combat Feed</Text>
        </LinearGradient>
        <ScrollView
          ref={scrollViewRef}
          style={styles.logContent}
          showsVerticalScrollIndicator={false}
        >
          {combatLog.map((entry, index) => (
            <View
              key={index}
              style={[
                styles.logEntryContainer,
                {
                  opacity: Math.max(0.3, 1 - (combatLog.length - 1 - index) * 0.15),
                  transform: [{ scale: Math.max(0.85, 1 - (combatLog.length - 1 - index) * 0.05) }]
                }
              ]}
            >
              <LinearGradient
                colors={[entry.color || colors.textPrimary, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.logEntryGradient}
              >
                <Text style={styles.logEntry}>
                  {entry.text}
                </Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Escape Button - EVE Style */}
      {!hasEscaped && pirate ? (
        <TouchableOpacity
          style={[
            styles.escapeButton,
            !canEscape && styles.escapeButtonDisabled
          ]}
          onPress={() => {
            if (!canEscape) return;
            const escapeChance = Math.random();
            setLastEscapeAttempt(Date.now());

            if (escapeChance <= 0.90) {
              setCombatLog(prev => [...prev, { text: "Warp drive active - Escaping!", color: colors.successGradient[0] }]);
              setHasEscaped(true);
            } else {
              setCombatLog(prev => [...prev, { text: "Warp drive failed - Scrambled!", color: colors.warning }]);
              setCanEscape(false);
              setTimeout(() => setCanEscape(true), 6000);
            }
          }}
          disabled={!canEscape}
        >
          <LinearGradient
            colors={canEscape ? [colors.error, colors.redButton] : [colors.disabledBackground, colors.disabledBackground]}
            style={styles.escapeGradient}
          >
            <Text style={styles.escapeText}>
              {canEscape ? "Initiate Warp" : `Warp Scrambled (${Math.ceil((6000 - (Date.now() - lastEscapeAttempt)) / 1000)}s)`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.pop(2)}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.returnGradient}
          >
            <Text style={styles.returnText}>Return to Station</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  targetOverview: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: '45%',
    height: '29%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  targetHeader: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  targetTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  targetInfo: {
    padding: 8,
  },
  targetBasicInfo: {
    marginBottom: 8,
  },
  targetName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  targetClass: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  targetStats: {
    gap: 8,
  },
  shipStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: '45%',
    height: '29%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  shipHeader: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shipTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shipInfo: {
    padding: 8,
    gap: 8,
  },
  healthBarContainer: {
    gap: 4,
  },
  healthLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  healthBar: {
    height: 20,
    backgroundColor: colors.disabledBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  healthText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 20,
  },
  targetAttributes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attributeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  resourceBars: {
    gap: 4,
  },
  resourceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resourceBarInner: {
    flex: 1,
    height: 16,
    backgroundColor: colors.disabledBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  resourceFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  resourceText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 10,
    lineHeight: 16,
  },
  weaponGroups: {
    position: 'absolute',
    top: '31%',
    left: 10,
    right: 10,
    bottom: '33%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  weaponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.panelBackground,
  },
  weaponTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  weaponList: {
    flex: 1,
    padding: 8,
  },
  weaponTypeGroup: {
    marginBottom: 12,
  },
  weaponTypeTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  weaponButton: {
    backgroundColor: 'rgba(32, 34, 37, 0.9)',
    borderRadius: 3,
    padding: 6,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weaponButtonDisabled: {
    opacity: 0.5,
  },
  weaponButtonCooldown: {
    backgroundColor: 'rgba(32, 34, 37, 0.9)',
  },
  weaponButtonActive: {
    borderColor: colors.error,
    backgroundColor: 'rgba(40, 42, 45, 0.9)',
  },
  cooldownBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.error,
  },
  weaponInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  weaponMainInfo: {
    flex: 1,
  },
  weaponNameContainer: {
    marginBottom: 2,
  },
  weaponName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  weaponStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weaponStat: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  weaponCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  combatLog: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    right: 10,
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  logHeader: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(32, 34, 37, 0.9)',
  },
  logTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  logContent: {
    padding: 6,
  },
  logEntryContainer: {
    marginBottom: 4,
  },
  logEntryGradient: {
    padding: 4,
    borderRadius: 2,
  },
  logEntry: {
    fontSize: 12,
    color: colors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  escapeButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    height: 40,
    borderRadius: 5,
    overflow: 'hidden',
  },
  escapeButtonDisabled: {
    opacity: 0.5,
  },
  escapeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  escapeText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  returnButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    height: 40,
    borderRadius: 5,
    overflow: 'hidden',
  },
  returnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  durabilityContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  durabilityText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  durabilityLow: {
    color: colors.error,
  },
  durabilityBar: {
    width: 50,
    height: 3,
    backgroundColor: colors.disabledBackground,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  durabilityFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
});

export default CombatPage;
