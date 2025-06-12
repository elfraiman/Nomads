import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import colors from "@/utils/colors";
import { IMainShip, IPirate, PlayerResources, resourceColors } from "@/utils/defaults";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

const CombatPage = ({ route, navigation }: { route: any; navigation: any }) => {
  const { planet } = route.params;
  const game = useGame();

  if (!game) return null;

  const { mainShip, setMainShip, recordEnemyKill, combatStats } = game;


  const generateEnemies = () => {
    if (planet.pirateCount <= 0) {
      return [];
    }

    // Linear difficulty progression based on planet and player progress
    const getEnemyDifficultyRange = () => {
      const totalKills = combatStats.totalKills || 0;
      
      // Planet A1: Beginner-friendly progression
      if (planet.id === 1) {
        if (totalKills < 5) {
          return { minIndex: 0, maxIndex: 0 }; // Only Corvettes for first 5 kills
        } else if (totalKills < 15) {
          return { minIndex: 0, maxIndex: 1 }; // Corvettes to Cruisers
        } else {
          return { minIndex: 0, maxIndex: 1 }; // Stay at Corvette-Cruiser level
        }
      }
      // Planet A2: Intermediate progression
      else if (planet.id === 2) {
        if (totalKills < 10) {
          return { minIndex: 0, maxIndex: 1 }; // Start easier even on A2
        } else if (totalKills < 25) {
          return { minIndex: 0, maxIndex: 2 }; // Corvettes to Dreadnoughts
        } else {
          return { minIndex: 1, maxIndex: 2 }; // Cruisers to Dreadnoughts
        }
      }
      // Planet A3: Advanced progression
      else if (planet.id === 3) {
        if (totalKills < 20) {
          return { minIndex: 0, maxIndex: 2 }; // Still allow easier enemies
        } else if (totalKills < 40) {
          return { minIndex: 1, maxIndex: 3 }; // Cruisers to Battleships
        } else {
          return { minIndex: 2, maxIndex: 3 }; // Dreadnoughts to Battleships
        }
      }
      // Planet A4: Expert progression
      else if (planet.id === 4) {
        if (totalKills < 30) {
          return { minIndex: 1, maxIndex: 3 }; // Don't throw Titans immediately
        } else if (totalKills < 60) {
          return { minIndex: 2, maxIndex: 4 }; // Dreadnoughts to Titans
        } else {
          return { minIndex: 3, maxIndex: 4 }; // Battleships to Titans
        }
      }
      // Default fallback for any other planets
      else {
        return { minIndex: 0, maxIndex: planet.enemies.length - 1 };
      }
    };

    const { minIndex, maxIndex } = getEnemyDifficultyRange();
    const availableEnemies = planet.enemies.slice(minIndex, maxIndex + 1);

    // Generate enemies with progressive difficulty within the allowed range
    const enemies = [];
    const totalEnemies = Math.min(planet.pirateCount, 15); // Cap at 15 enemies for performance

    for (let i = 0; i < totalEnemies; i++) {
      // Progressive difficulty: start with easier enemies, gradually introduce harder ones
      const progressRatio = i / (totalEnemies - 1); // 0 to 1
      
      // Early enemies (first 30%) are from the easier half of available enemies
      // Later enemies (last 30%) can be from the harder half
      // Middle enemies (40%) are mixed
      let enemyIndex;
      
      if (progressRatio < 0.3) {
        // Early enemies: easier half
        const easyRange = Math.ceil(availableEnemies.length / 2);
        enemyIndex = Math.floor(Math.random() * easyRange);
      } else if (progressRatio > 0.7) {
        // Later enemies: harder half (but still within planet's range)
        const hardStart = Math.floor(availableEnemies.length / 2);
        enemyIndex = hardStart + Math.floor(Math.random() * (availableEnemies.length - hardStart));
      } else {
        // Middle enemies: full range with slight bias toward easier
        const biasedRandom = Math.random() * Math.random(); // Bias toward 0
        enemyIndex = Math.floor(biasedRandom * availableEnemies.length);
      }

      enemies.push({ ...availableEnemies[enemyIndex] });
    }

    return enemies;
  };



  const [enemies, setEnemies] = useState(generateEnemies());
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [combatLog, setCombatLog] = useState<{ text: string; color?: string }[]>([]);
  const [weaponGroups, setWeaponGroups] = useState<{ [key: string]: IWeapon[] }>({});
  const [canEscape, setCanEscape] = useState(true);
  const [lastEscapeAttempt, setLastEscapeAttempt] = useState(0);
  const [hasEscaped, setHasEscaped] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [pirate, setPirate] = useState(enemies[0]);
  const [weaponCooldowns, setWeaponCooldowns] = useState(
    mainShip.equippedWeapons.map((weapon) => ({
      id: weapon.id,
      cooldown: 0,
      maxCooldown: weapon.weaponDetails.cooldown,
      animation: new Animated.Value(0),
      weaponDetails: weapon.weaponDetails, // Include weapon details
    }))
  );

  // Floating damage numbers state
  const [floatingDamage, setFloatingDamage] = useState<{
    id: string;
    damage: number;
    animation: Animated.Value;
    opacity: Animated.Value;
    isCritical?: boolean;
    weaponType?: string;
    startOffset?: number;
    verticalOffset?: number;
  }[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Function to create floating damage numbers
  const createFloatingDamage = (damage: number, isCritical: boolean = false, weaponType?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const animation = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    
    // Calculate horizontal offset based on existing floating damage to prevent stacking
    const currentTime = Date.now();
    const recentDamage = floatingDamage.filter(item => 
      currentTime - parseInt(item.id.split('.')[0]) < 200 // Within 200ms
    );
    
    // Spread out simultaneous hits horizontally from center
    const totalWidth = Math.max(recentDamage.length, 1) * 80; // Total width needed
    const startPosition = -totalWidth / 2; // Start from left of center
    const baseOffset = startPosition + (recentDamage.length * 80); // Position for this hit
    const randomOffset = (Math.random() - 0.5) * 20; // Small random variation
    const horizontalOffset = baseOffset + randomOffset;
    
    // Stagger vertical start positions slightly for simultaneous hits
    const verticalOffset = recentDamage.length * 10; // 10px vertical stagger

    const newFloatingDamage = {
      id,
      damage,
      animation,
      opacity,
      isCritical,
      weaponType,
      startOffset: horizontalOffset,
      verticalOffset,
    };

    setFloatingDamage(prev => [...prev, newFloatingDamage]);

    // Animate the floating effect with slight delay for simultaneous hits
    const duration = isCritical ? 2000 : 1500; // Critical hits last longer
    const animationDelay = recentDamage.length * 50; // 50ms delay between simultaneous hits
    
    Animated.sequence([
      Animated.delay(animationDelay), // Stagger the start of animations
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(isCritical ? 800 : 500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: isCritical ? 1200 : 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Remove the floating damage after animation completes
      setFloatingDamage(prev => prev.filter(item => item.id !== id));
    });
  };

  const calculateHitChance = (
    weaponAccuracy: number,
    defenderAttackSpeed: number,
    weaponCategory: "Small" | "Medium" | "Large",
    pirateCategory: "Corvette" | "Cruiser" | "Battleship" | "Dreadnought"
  ) => {
    const categoryModifiers: Record<string, Record<string, number>> = {
      Small: { Corvette: 0, Cruiser: 0, Battleship: 0, Dreadnought: 0 }, // Small weapons are equally effective
      Medium: { Corvette: -10, Cruiser: 0, Battleship: 5, Dreadnought: 10 },
      Large: { Corvette: -20, Cruiser: -10, Battleship: 0, Dreadnought: 5 },
    };

    const sizePenalty = categoryModifiers[weaponCategory][pirateCategory] || 0;

    const defenderEvasion = Math.min(defenderAttackSpeed * 5, 90);
    const effectiveAccuracy = Math.min(Math.max(weaponAccuracy - sizePenalty, 10), 100);

    const adjustedHitChance = effectiveAccuracy - defenderEvasion;
    const finalHitChance = Math.max(adjustedHitChance / 100, 0.1);

    console.log(`Weapon Accuracy: ${weaponAccuracy}, Pirate Category: ${pirateCategory}, Final Hit Chance: ${finalHitChance * 100}%`);
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
    if (isFiring) return; // Prevent spamming
    setIsFiring(true);

    // Check if any weapon in the group can fire
    const weapons = weaponGroups[weaponsType];
    if (!weapons || weapons.length === 0) {
      setCombatLog((prev) => [...prev, { text: `No weapons of type ${weaponsType} equipped!`, color: colors.warning }]);
      setIsFiring(false);
      return;
    }

    const fireableWeapons = weapons.filter((weapon) => {
      const cooldown = weaponCooldowns.find((w) => w.id === weapon.id)?.cooldown || 0;
      return cooldown === 0;
    });

    if (fireableWeapons.length === 0) {
      setIsFiring(false);
      return;
    }

    // Fire logic as before
    let newMainShip = mainShip;
    let totalDamage = 0;

    const updatedWeaponCooldowns = weaponCooldowns.map((weaponCooldown) => {
      if (weaponCooldown.weaponDetails.type === weaponsType && weaponCooldown.cooldown === 0) {
        const { cost, durability } = weaponCooldown.weaponDetails;
        const currentResource = mainShip.resources[cost.type as keyof PlayerResources]?.current || 0;

        if (currentResource < cost.amount) {
          setCombatLog((prev) => [
            ...prev,
            { text: `Not enough ${cost.type} to fire ${weaponCooldown.weaponDetails.name}!`, color: colors.secondary },
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
        const hit = calculateHitChance(weaponCooldown.weaponDetails.accuracy, pirate?.attackSpeed ?? 0, weaponCooldown.weaponDetails.category, pirate.category);

        if (hit) {
          const randomMultiplier = Math.random() * 0.4 + 0.8; // Random between 0.8 and 1.2
          const isCritical = randomMultiplier > 1.1; // Critical hit if multiplier is high
          const damage = Math.floor(
            weaponCooldown.weaponDetails.power * randomMultiplier * (1 - pirate.defense / 100)
          );
          totalDamage += damage;
          
          // Create floating damage number with critical hit detection
          createFloatingDamage(damage, isCritical, weaponCooldown.weaponDetails.cost.type);
          
          const hitText = isCritical 
            ? `${weaponCooldown.weaponDetails.name} CRITICAL HIT for ${damage} damage!`
            : `${weaponCooldown.weaponDetails.name} hit for ${damage} damage!`;
          
          setCombatLog((prev) => [
            ...prev,
            { text: hitText, color: resourceColors[weaponCooldown.weaponDetails.cost.type] },
          ]);
        } else {
          setCombatLog((prev) => [
            ...prev,
            { text: `${weaponCooldown.weaponDetails.name} missed!`, color: colors.textSecondary },
          ]);
        }

        // Handle durability reduction
        //
        const newDurability = durability - 1;
        if (newDurability <= 0) {
          setCombatLog((prev) => [
            ...prev,
            { text: `${weaponCooldown.weaponDetails.name} has broken!`, color: colors.secondary },
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
        ? { ...weaponCooldown, cooldown: Math.round(weaponCooldown.cooldown - 1) }
        : weaponCooldown;
    });

    setWeaponCooldowns(updatedWeaponCooldowns.filter((w): w is NonNullable<typeof w> => w !== null));
    setMainShip(newMainShip);
    setPirate((prev: IPirate) => ({
      ...prev,
      health: Math.max(prev.health - totalDamage, 0),
    }));
    setIsFiring(false);
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
    pirateAccuracy: number, // Base accuracy of the pirate
    pirateCategory: "Corvette" | "Cruiser" | "Battleship" | "Titan" // Ship category
  ): boolean => {
    // Category-based accuracy modifiers for pirates
    const categoryModifiers: Record<string, number> = {
      Corvette: -6,  // Smaller ships have reduced accuracy
      Cruiser: -3,     // Balanced accuracy for medium ships
      Battleship: 10,  // Large ships are slightly more accurate
      Titan: 12,      // Massive ships are very accurate
    };

    // Apply the modifier based on the category
    const categoryModifier = categoryModifiers[pirateCategory] || 0;

    // Effective accuracy after applying category modifier
    const randomMultiplier = Math.random() * (1.1 - 0.7) + 0.7; // some randomness
    const effectiveAccuracy = Math.min(Math.max((pirateAccuracy + categoryModifier), 10), 80); // Clamp between 10% and 95%

    // Convert effectiveAccuracy into a decimal (0.0 to 1.0)
    const hitChance = (effectiveAccuracy / 100);

    console.log(`Pirate Accuracy: ${pirateAccuracy}, Category: ${pirateCategory}, Final Hit Chance: ${hitChance * 100}%`);

    // Determine hit or miss
    return Math.random() <= hitChance;
  };



  // Pirate attack
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pirate || hasEscaped) {
        clearInterval(interval); // Stop the interval if no pirate or the player has escaped
        return;
      }

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
          //
          const randomMultiplier = Math.random() * (1.2 - 0.8) + 0.8;
          const damage = Math.max(Math.floor((pirateAttack * randomMultiplier) - playerDefense), 1);

          setMainShip((prev: IMainShip) => ({
            ...prev,
            baseStats: { ...prev.baseStats, health: Math.max(prev.baseStats.health - damage, 0) },
          }));

          // Create floating damage number for player taking damage (different style)
          createFloatingDamage(damage, false, 'incoming');

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

        // Record the enemy kill for mission tracking
        recordEnemyKill(pirate.name);

        setEnemies((prev) => prev.filter((_, index) => index !== currentEnemyIndex));
        spawnNextPirate();
        clearInterval(interval);
      }
    }, 1000);

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

  // Display difficulty progression info when combat starts
  useEffect(() => {
    const totalKills = combatStats.totalKills || 0;
    const enemyTypes = enemies.map((enemy: any) => enemy.category).join(', ');
    
    // Add informational message to combat log
    if (totalKills < 5) {
      setCombatLog(prev => [...prev, { 
        text: `🎯 Beginner Mode: Facing ${enemyTypes} (${totalKills} total kills)`, 
        color: colors.primary 
      }]);
    } else if (totalKills < 30) {
      setCombatLog(prev => [...prev, { 
        text: `⚔️ Difficulty scaling with experience: ${enemyTypes} (${totalKills} total kills)`, 
        color: colors.warning 
      }]);
    } else {
      setCombatLog(prev => [...prev, { 
        text: `💀 Veteran Mode: Facing ${enemyTypes} (${totalKills} total kills)`, 
        color: colors.error 
      }]);
    }
  }, []); // Run only once when component mounts


  return (
    <>
      <ImageBackground
        source={require("@/assets/images/space-bg.png")} // Replace with your image path
        style={styles.backgroundImage}
      >
        {/* Fixed Health Bars */}
        <View style={styles.fixedHealthBars}>
          {/* Main Ship Health Bar */}
          <View style={styles.fixedBar}>
            <Text style={styles.fixedBarText}>
              Main Ship Health: {mainShip.baseStats.health}/{mainShip.baseStats.maxHealth}
            </Text>
            <Svg width="100%" height="20">
              <Rect x="0" y="0" width="100%" height="20" fill={colors.disabledBackground} />
              <Rect
                x="0"
                y="0"
                width={`${(mainShip.baseStats.health / mainShip.baseStats.maxHealth) * 100}%`}
                height="20"
                fill={colors.successGradient[0]}
              />
            </Svg>
          </View>

          {/* Pirate Health Bar */}
          {pirate && (
            <View style={styles.fixedBar}>
              <Text style={styles.fixedBarText}>
                {pirate.name} ({pirate.category}) - {pirate.health}/{pirate.maxHealth} HP
              </Text>
              <Svg width="100%" height="20">
                <Rect x="0" y="0" width="100%" height="20" fill={colors.disabledBackground} />
                <Rect
                  x="0"
                  y="0"
                  width={`${(pirate.health / pirate.maxHealth) * 100}%`}
                  height="20"
                  fill={colors.error}
                />
              </Svg>
            </View>
          )}
        </View>

        <ScrollView style={[styles.container, { backgroundColor: "transparent" }]}>

          {/* Main Content */}
          {hasEscaped ? (
            <Text style={styles.header}>ESCAPED</Text>
          ) : pirate ? (
            <>
              <Text style={styles.header}>
                {planet.name} - Enemies Left: {enemies.length - currentEnemyIndex}
              </Text>
              <View style={styles.pirateImageContainer}>
                <Text style={styles.pirateName}>
                  {pirate.name} ({pirate.category}): {pirate.health}/{pirate.maxHealth} HP
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.header}>All enemies defeated! Planet cleared.</Text>
          )}

          {/* Combat Log */}
          <View style={styles.logContainer}>
            <Text style={styles.logHeader}>Combat Log</Text>
            <ScrollView ref={scrollViewRef}>
              {combatLog.map((entry, index) => (
                <Text key={index} style={[styles.logText, entry.color ? { color: entry.color } : null]}>
                  {entry.text}
                </Text>
              ))}
            </ScrollView>
          </View>

          {/* Weapon Groups */}
          <View style={styles.optionsGridContainer}>
            {Object.entries(weaponGroups).map(([type, weapons], index) => {
              const fireableWeapons = weapons.filter((weapon) => {
                const { type: resourceType, amount } = weapon.weaponDetails.cost;
                return (mainShip.resources[resourceType as keyof PlayerResources]?.current || 0) >= amount;
              });

              const totalCost = fireableWeapons.reduce((acc, weapon) => {
                const { type: resourceType, amount } = weapon.weaponDetails.cost;
                acc[resourceType] = (acc[resourceType] || 0) + amount;
                return acc;
              }, {} as { [key: string]: number });

              return (
                <View key={index} style={styles.weaponGroup}>
                  <Text style={styles.groupTitle}>{type.toUpperCase()}</Text>
                  {/* Render Weapons */}
                  {weapons.map((weapon, weaponIndex) => {
                    const weaponCooldown = weaponCooldowns.find((w) => w.id === weapon.id);
                    const cooldown = weaponCooldown?.cooldown || 0;
                    const animation = weaponCooldown?.animation;
                    const durabilityPercentage =
                      (weapon.weaponDetails.durability / weapon.weaponDetails.maxDurability) * 100;
                    const canFire =
                      (mainShip.resources[weapon.weaponDetails.cost.type as keyof PlayerResources]?.current ||
                        0) >= weapon.weaponDetails.cost.amount;

                    return (
                      <View key={weaponIndex} style={styles.weaponItem}>
                        <View style={styles.weaponHeader}>
                          <Text style={styles.weaponName}>{weapon.weaponDetails.name}</Text>
                          <Text
                            style={[
                              styles.durabilityText,
                              durabilityPercentage < 25 ? styles.durabilityLow : null,
                            ]}
                          >
                            {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
                          </Text>
                        </View>
                        {/* Durability Bar */}
                        <View style={styles.durabilityBar}>
                          <View
                            style={[
                              styles.durabilityFill,
                              { width: `${durabilityPercentage}%` },
                              durabilityPercentage < 25 ? styles.durabilityLowFill : null,
                            ]}
                          />
                        </View>
                        {/* Cooldown Bar */}
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
                                    backgroundColor:
                                      resourceColors[weapon.weaponDetails.cost.type] || colors.warning,
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
                          <ResourceIcon
                            type={weapon.weaponDetails.cost.type as keyof PlayerResources}
                            size={16}
                          />
                          <Text style={styles.resourceAmountText}>
                            {weapon.weaponDetails.cost.amount}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  {/* Fire Button */}
                  <TouchableOpacity
                    disabled={fireableWeapons.length === 0 || isFiring}
                    style={[
                      styles.attackButton,
                      (fireableWeapons.length === 0 || isFiring) && styles.disabledButton,
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

        {/* Floating Damage Numbers - Positioned at top level to float above everything */}
        {floatingDamage.map((item) => {
          const isIncoming = item.weaponType === 'incoming';
          const weaponColor = isIncoming ? colors.error : 
            (item.weaponType ? resourceColors[item.weaponType] : colors.error);
          
          return (
                         <Animated.View
               key={item.id}
               style={[
                 styles.floatingDamageOverlay,
                 isIncoming && styles.floatingDamageIncoming,
                 {
                   opacity: item.opacity,
                   top: 200 + (item.verticalOffset || 0), // Apply vertical offset
                   left: '50%', // Center horizontally
                   transform: [
                     {
                       translateX: (item.startOffset || 0), // Apply horizontal offset from center
                     },
                     {
                       translateY: item.animation.interpolate({
                         inputRange: [0, 1],
                         outputRange: isIncoming ? [0, 50] : [0, -60],
                       }),
                     },
                     {
                       scale: item.animation.interpolate({
                         inputRange: [0, 0.2, 1],
                         outputRange: [1, 1.3, 1],
                       }),
                     },
                   ],
                 },
               ]}
            >
              <Text style={[
                styles.floatingDamageText,
                item.isCritical && styles.floatingDamageCritical,
                isIncoming && styles.floatingDamageIncomingText,
                { color: weaponColor }
              ]}>
                {isIncoming ? '+' : (item.isCritical ? 'CRIT! -' : '-')}{item.damage}
              </Text>
            </Animated.View>
          );
        })}

      </ImageBackground>


      {hasEscaped || !pirate ? (

        <TouchableOpacity
          style={[
            styles.escapeButton,
            , {
              position: 'relative',
              bottom: 0,
              left: 0,
              width: 145,
              padding: 10,
              backgroundColor: colors.primary
            }
          ]}
          onPressIn={() => {
            navigation.pop(2); // Pop 2 screens from the navigation stack
          }}
        >
          <Text style={styles.escapeButtonText}>Back</Text>
        </TouchableOpacity>
      ) : (<TouchableOpacity
        style={[
          styles.escapeButton,
          , {
            position: 'relative',
            bottom: 0,
            left: 0,
            width: 145,
            padding: 10,
            backgroundColor: canEscape ? colors.redButton : colors.disabledBackground
          }
        ]}
        onPressIn={() => {
          if (!canEscape) return;

          const escapeChance = Math.random();
          setLastEscapeAttempt(Date.now());

          if (escapeChance <= 0.90) {
            setCombatLog(prev => [...prev, { text: "Escape successful!", color: colors.successGradient[0] }]);
            setEnemies([]);
            setHasEscaped(true);

            // navigation.goBack();
          } else {
            setCombatLog(prev => [...prev, { text: "Failed to escape! ", color: colors.warning }]);
            setCanEscape(false);
            setTimeout(() => setCanEscape(true), 6000);
          }
        }}
        disabled={!canEscape}
      >
        <Text style={styles.escapeButtonText}>
          {canEscape ? "Attempt Escape" : "Failed to escape! "}
          {!canEscape && (
            <Text style={styles.escapeButtonText}>
              {Math.ceil((6000 - (Date.now() - lastEscapeAttempt)) / 1000)}s
            </Text>
          )}
        </Text>
      </TouchableOpacity>)}

      <ShipStatus />
    </>
  );
};




const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // To cover the entire screen
  },
  container: {
    flex: 1,
    padding: 16,
  },
  escapeButtonText: {
    color: colors.textPrimary,
  },
  spawnButton: {
    backgroundColor: colors.primary,
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
    height: 2,
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
  fixedHealthBars: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.background, // Ensure readability
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  fixedBar: {
    marginBottom: 10,
  },
  fixedBarText: {
    color: colors.textPrimary,
    fontWeight: "bold",
    marginBottom: 4,
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
    padding: 10,
    alignItems: "center",
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
    backgroundColor: colors.panelBackground,
    padding: 10,
    maxHeight: 140,
    minHeight: 140,
    marginTop: 44,
  },
  logText: {
    fontSize: 14,
    color: colors.textPrimary, // Default color
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
    fontSize: 9,
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
    height: 10,
    backgroundColor: colors.disabledBackground,
    overflow: "hidden",
    marginVertical: 4,
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
    fontSize: 10,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  noResourceText: {
    color: colors.error,
    fontSize: 10,
  },
  resourceCostItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceAmountText: {
    marginLeft: 4,
    fontSize: 10,
    color: colors.textPrimary,
  },
  attackButton: {
    padding: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  floatingDamage: {
    position: "absolute",
    top: 10,
    left: 50,
    right: 50,
    zIndex: 9999,
    elevation: 9999, // For Android
    pointerEvents: "none",
    alignItems: "center",
  },
  floatingDamageText: {
    fontSize: 26,
    fontWeight: "900", // Extra bold for futuristic look
    color: colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Monospace for tech feel
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8, // Glow effect
    letterSpacing: 1.5, // Spaced out letters
    textTransform: 'uppercase',
  },
  floatingDamageCritical: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.warning,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: colors.warning,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12, // Stronger glow for critical hits
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  floatingDamageIncoming: {
    top: 60, // Position lower for incoming damage
  },
  floatingDamageIncomingText: {
    color: colors.error,
    fontSize: 22,
    fontWeight: "800",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: colors.error,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  floatingDamageOverlay: {
    position: "absolute",
    zIndex: 9999,
    elevation: 9999, // For Android
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80, // Ensure enough space for the text
    marginLeft: -40, // Half of minWidth to center properly
  },

});

export default CombatPage;
