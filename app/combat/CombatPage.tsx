import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import ShipStatus from "@/components/ShipStatus";
import { useGame } from "@/context/GameContext";
import { IWeapon } from "@/data/weapons";
import colors from "@/utils/colors";
import { IMainShip, PlayerResources, resourceColors } from "@/utils/defaults";

// Combat components
import HealthBars from "./components/HealthBars";
import CombatLog from "./components/CombatLog";
import WeaponGroups from "./components/WeaponGroups";
import FloatingDamageNumbers from "./components/FloatingDamageNumbers";
import CombatControls from "./components/CombatControls";

// Combat hooks
import { useFloatingDamage } from "./hooks/useFloatingDamage";
import { useWeaponCooldowns } from "./hooks/useWeaponCooldowns";
import { useEscapeLogic } from "./hooks/useEscapeLogic";
import { useCombatLogic } from "./hooks/useCombatLogic";

// Combat utilities
import { calculateHitChance, calculateDamage } from "./utils/combatCalculations";

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

          const hitText = isCritical
            ? `${weaponCooldown.weaponDetails.name} CRITICAL HIT for ${damage} damage!`
            : `${weaponCooldown.weaponDetails.name} hit for ${damage} damage!`;

          addLogEntry({
            text: hitText,
            color: resourceColors[weaponCooldown.weaponDetails.cost.type],
          });
        } else {
          addLogEntry({
            text: `${weaponCooldown.weaponDetails.name} missed!`,
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
      <ImageBackground
        source={require("@/assets/images/space-bg.png")}
        style={styles.backgroundImage}
      >
        <HealthBars mainShip={mainShip} pirate={pirate} />

        <ScrollView style={[styles.container, { backgroundColor: "transparent" }]} showsVerticalScrollIndicator={false}>
          {/* Combat Status */}
          <View style={styles.combatHeader}>
            <Text style={styles.planetInfo}>
              {planet.name} • {enemies.length} ENEMIES LEFT
            </Text>

            {hasEscaped ? (
              <View style={styles.statusContainer}>
                <Text style={styles.escapeStatus}>🚀 ESCAPED! 🚀</Text>
              </View>
            ) : pirate ? (
              <View style={styles.enemyInfo}>
                <Text style={styles.enemyLabel}>CURRENT TARGET</Text>
                <Text style={styles.enemyName}>{pirate.name}</Text>
                <Text style={styles.enemyCategory}>{pirate.category} • {pirate.health}/{pirate.maxHealth} HP</Text>
              </View>
            ) : (
              <View style={styles.statusContainer}>
                <Text style={styles.victoryStatus}>🏆 VICTORY! 🏆</Text>
              </View>
            )}
          </View>

          <CombatLog combatLog={combatLog} />

          <WeaponGroups
            weaponGroups={weaponGroups}
            weaponCooldowns={weaponCooldowns}
            mainShip={mainShip}
            isFiring={isFiring}
            onFireWeaponGroup={handleAttackByType}
          />

          <View style={styles.controlsContainer}>
            <CombatControls
              hasEscaped={hasEscaped}
              pirate={pirate}
              canEscape={canEscape}
              onEscape={handleEscape}
              onBack={handleBack}
              getEscapeCooldownRemaining={getEscapeCooldownRemaining}
            />
          </View>
        </ScrollView>

        <FloatingDamageNumbers floatingDamage={floatingDamage} />
      </ImageBackground>

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
    padding: 8,
  },
  combatHeader: {
    marginBottom: 12,
  },
  planetInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.glowEffect,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statusContainer: {
    alignItems: "center",
    backgroundColor: 'rgba(26, 26, 61, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glowEffect,
    padding: 12,
    marginHorizontal: 4,
    marginTop: 8,
  },
  enemyInfo: {
    alignItems: "center",
    backgroundColor: 'rgba(26, 26, 61, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.error,
    padding: 12,
    marginHorizontal: 4,
    marginTop: 68,
  },
  enemyLabel: {
    color: colors.error,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  enemyName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  enemyCategory: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  escapeStatus: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.successGradient[0],
    textAlign: "center",
    letterSpacing: 1,
  },
  victoryStatus: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.successGradient[0],
    textAlign: "center",
    letterSpacing: 1,
  },
  controlsContainer: {
    padding: 8,
    marginTop: 8,
  },
});

export default CombatPage; 