import ShipStatus from "@/components/ShipStatus";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import colors from "@/utils/colors";
import { PlayerResources, resourceColors } from "@/utils/defaults";
import React, { useEffect, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CombatLog from "./combat/components/CombatLog";
import FloatingDamageNumbers from "./combat/components/FloatingDamageNumbers";
import HealthBars from "./combat/components/HealthBars";
import WeaponGroups from "./combat/components/WeaponGroups";
import { useCombatLogic } from "./combat/hooks/useCombatLogic";
import { useEscapeLogic } from "./combat/hooks/useEscapeLogic";
import { useFloatingDamage } from "./combat/hooks/useFloatingDamage";
import { useWeaponCooldowns } from "./combat/hooks/useWeaponCooldowns";
import { calculateDamage, calculateHitChance } from "./combat/utils/combatCalculations";



const CombatPage = ({ route, navigation }: { route: any; navigation: any }) => {
  const { planet } = route.params;
  const game = useGame();

  if (!game) return null;

  const { mainShip, setMainShip, recordEnemyKill, combatStats } = game;

  // Initialize hooks
  const { floatingDamage, createFloatingDamage } = useFloatingDamage();
  const { weaponCooldowns, setWeaponCooldowns, startCooldownAnimation } = useWeaponCooldowns(mainShip.equippedWeapons);
  const { canEscape, hasEscaped, attemptEscape, getEscapeCooldownRemaining } = useEscapeLogic();

  // State for firing and weapon groups
  const [isFiring, setIsFiring] = useState(false);
  const [weaponGroups, setWeaponGroups] = useState<{ [key: string]: IWeapon[] }>({});

  // Screen shake animation for combat feedback
  const [screenShake] = useState(new Animated.Value(0));

  const triggerScreenShake = () => {
    Animated.sequence([
      Animated.timing(screenShake, {
        toValue: 3,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: -3,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: 2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Unlock next planet function
  const unlockNextPlanet = () => {
    const galaxyIndex = game.galaxies.findIndex((g) => g.id === planet.galaxyId);
    if (galaxyIndex === -1) return;

    const updatedGalaxies = game.galaxies.map((galaxy) => {
      if (galaxy.id !== planet.galaxyId) return galaxy;

      const updatedPlanets = galaxy.planets.map((p) => {
        if (p.id === planet.id) {
          return { ...p, pirateCount: 0 };
        }
        if (p.id === planet.id + 1) {
          return { ...p, locked: false };
        }
        return p;
      });

      return { ...galaxy, planets: updatedPlanets };
    });

    game.setUnlockedGalaxies(updatedGalaxies);
  };

  // Initialize combat logic
  const {
    enemies,
    combatLog,
    addLogEntry,
    pirate,
    damagePirate
  } = useCombatLogic({
    planet,
    combatStats,
    mainShip,
    setMainShip,
    recordEnemyKill,
    hasEscaped,
    createFloatingDamage,
    unlockNextPlanet,
  });

  // Group weapons by type
  useEffect(() => {
    const groupedWeapons = mainShip.equippedWeapons.reduce((groups: { [key: string]: IWeapon[] }, weapon) => {
      const type = weapon.weaponDetails.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(weapon);
      return groups;
    }, {});

    setWeaponGroups(groupedWeapons);
  }, [mainShip.equippedWeapons]);

  // Handle weapon group firing
  const handleAttackByType = (weaponsType: string) => {
    if (isFiring || !pirate) return;
    setIsFiring(true);

    const weapons = weaponGroups[weaponsType];
    if (!weapons || weapons.length === 0) {
      addLogEntry({
        text: `No weapons of type ${weaponsType} equipped!`,
        color: colors.warning
      });
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

    let newMainShip = mainShip;
    let totalDamage = 0;

    const updatedWeaponCooldowns = weaponCooldowns.map((weaponCooldown) => {
      if (weaponCooldown.weaponDetails.type === weaponsType && weaponCooldown.cooldown === 0) {
        const { cost, durability } = weaponCooldown.weaponDetails;
        const currentResource = mainShip.resources[cost.type as keyof PlayerResources]?.current || 0;

        if (currentResource < cost.amount) {
          addLogEntry({
            text: `Not enough ${cost.type} to fire ${weaponCooldown.weaponDetails.name}!`,
            color: colors.secondary,
          });
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

        // Calculate hit chance and damage
        const hit = calculateHitChance(
          weaponCooldown.weaponDetails.accuracy,
          pirate?.attackSpeed ?? 0,
          weaponCooldown.weaponDetails.category,
          pirate.category
        );

        if (hit) {
          const { damage, isCritical } = calculateDamage(
            weaponCooldown.weaponDetails.power,
            pirate.defense
          );
          totalDamage += damage;

          createFloatingDamage(damage, isCritical, weaponCooldown.weaponDetails.cost.type);

          const weaponName = weaponCooldown.weaponDetails.name;
          const target = pirate.name;
          const hitText = isCritical
            ? `${weaponName} → ${target}: CRITICAL HIT! ${damage} damage`
            : `${weaponName} → ${target}: ${damage} damage`;

          addLogEntry({
            text: hitText,
            color: resourceColors[weaponCooldown.weaponDetails.cost.type],
          });
        } else {
          addLogEntry({
            text: `${weaponCooldown.weaponDetails.name} → ${pirate.name}: MISS`,
            color: colors.textSecondary,
          });
        }

        // Handle durability
        const newDurability = durability - 1;
        if (newDurability <= 0) {
          addLogEntry({
            text: `${weaponCooldown.weaponDetails.name} has broken!`,
            color: colors.secondary,
          });
          newMainShip.equippedWeapons = newMainShip.equippedWeapons.filter(
            (w) => w.id !== weaponCooldown.id
          );
          return null;
        }

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

    // Trigger screen shake if weapons fired
    if (totalDamage > 0) {
      triggerScreenShake();
    }

    damagePirate(totalDamage);
    setIsFiring(false);
  };

  // Handle escape attempts
  const handleEscape = () => {
    attemptEscape(
      () => {
        addLogEntry({
          text: "Escape successful!",
          color: colors.successGradient[0]
        });
      },
      () => {
        addLogEntry({
          text: "Failed to escape!",
          color: colors.warning
        });
      }
    );
  };

  // Handle back navigation
  const handleBack = () => {
    navigation.pop(2);
  };

  return (
    <>
      <Animated.View style={[
        styles.backgroundImage,
        {
          transform: [{ translateX: screenShake }]
        }
      ]}>

        <HealthBars mainShip={mainShip} pirate={pirate} />

        <ScrollView style={[styles.container, { backgroundColor: "transparent" }]}>
          {/* Combat Header */}
          {hasEscaped ? (
            <Text style={styles.combatStatus}>ESCAPED!</Text>
          ) : pirate ? (
            <>
              <Text style={styles.header}>
                {planet.name.toUpperCase()} COMBAT ZONE
              </Text>
              <Text style={[styles.header, { fontSize: 16, color: colors.warning, marginBottom: 16 }]}>
                [{enemies.length} HOSTILES REMAINING]
              </Text>
              <View style={styles.pirateContainer}>
                <Text style={styles.pirateTitle}>ENEMY CONTACT</Text>
                <Text style={styles.pirateName}>
                  {pirate.name.toUpperCase()}
                </Text>
                <Text style={[styles.pirateName, { fontSize: 16, color: colors.warning, marginTop: 4 }]}>
                  [{pirate.category}] • {pirate.health}/{pirate.maxHealth} HP
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.combatStatus}>VICTORY ACHIEVED!</Text>
          )}

          <CombatLog combatLog={combatLog} />

          <WeaponGroups
            weaponGroups={weaponGroups}
            weaponCooldowns={weaponCooldowns}
            mainShip={mainShip}
            isFiring={isFiring}
            onFireWeaponGroup={handleAttackByType}
          />
        </ScrollView>

        <FloatingDamageNumbers floatingDamage={floatingDamage} />

        {/* Fixed Escape Button */}
        {!hasEscaped && pirate ? (
          <TouchableOpacity
            style={[
              styles.fixedEscapeButton,
              {
                backgroundColor: canEscape ? colors.redButton : colors.disabledBackground,
                borderColor: canEscape ? colors.error : colors.disabledBorder,
              }
            ]}
            onPress={handleEscape}
            disabled={!canEscape}
          >
            <Text style={[
              styles.escapeButtonText,
              { color: canEscape ? colors.textPrimary : colors.disabledText }
            ]}>
              {canEscape ? "ESC" : `${getEscapeCooldownRemaining()}s`}
            </Text>
          </TouchableOpacity>
        ) : hasEscaped || !pirate ? (
          <TouchableOpacity
            style={styles.fixedBackButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
      <ShipStatus />
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.glowEffect,
    textAlign: "center",
    textShadowColor: colors.glowEffect,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
    letterSpacing: 1,
  },
  pirateContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.transparentBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
    padding: 16,
    marginHorizontal: 8,
  },
  pirateName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: colors.error,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  pirateTitle: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  combatStatus: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.successGradient[0],
    textAlign: "center",
    textShadowColor: colors.successGradient[0],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginVertical: 20,
    letterSpacing: 2,
  },
  fixedEscapeButton: {
    position: 'absolute',
    top: 16,
    right: 12,
    width: 32,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  escapeButtonText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  fixedBackButton: {
    position: 'absolute',
    top: 16,
    right: 12,
    width: 36,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.glowEffect,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backButtonText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default CombatPage; 