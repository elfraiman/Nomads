import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import colors from "@/utils/colors";
import ShipStatus from "@/components/ShipStatus";
import { useGame } from "@/context/GameContext";
import { initialPlayerStats, IPirate, PlayerResources } from "@/utils/defaults";
import ResourceIcon from "@/components/ui/ResourceIcon";

const CombatPage = ({ route, navigation }: { route: any; navigation: any }) => {
  const { planet } = route.params;
  const game = useGame();

  if (!game) return null;

  const generateArrayOfEnemies = () => {
    return [...Array(15).fill(planet.enemies[0]), planet.enemies[2], planet.enemies[3]]
  }


  const staticEnemies = generateArrayOfEnemies();
  const { resources, setResources } = game;
  const [player, setPlayer] = useState(initialPlayerStats);
  const [enemies, setEnemies] = useState(staticEnemies);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [pirate, setPirate] = useState(staticEnemies[currentEnemyIndex]);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);


  const attackOptions = [
    { name: "Energy Canon", cost: { type: "energy", amount: 80 }, power: 10, attackSpeed: 3 },
    { name: "Heat seeking missile", cost: { type: "fuel", amount: 100 }, power: 35, attackSpeed: 3 },
    { name: "Solar Plasma Beam", cost: { type: "solarPlasma", amount: 75 }, power: 25, attackSpeed: 2 },
    { name: "Dark Matter Blast", cost: { type: "darkMatter", amount: 40 }, power: 30, attackSpeed: 2 },
    { name: "Penetrating Alloy Bullet", cost: { type: "alloy", amount: 100 }, power: 50, attackSpeed: 1 },
    { name: "Cold Laser", cost: { type: "frozenHydrogen", amount: 80 }, power: 40, attackSpeed: 1.5 },
  ];

  const calculateHitChance = (attackerSpeed: number, defenderSpeed: number, baseHitChance: number = 0.8) => {
    const speedDifference = defenderSpeed - attackerSpeed;
    const adjustedHitChance = Math.max(baseHitChance - speedDifference * 0.05, 0.1); // Minimum hit chance of 10%
    return Math.random() <= adjustedHitChance;
  };

  const handleAttack = (option: typeof attackOptions[0]) => {
    const { type, amount } = option.cost;

    if ((resources[type as keyof PlayerResources]?.current || 0) < amount) {
      setCombatLog((prev) => [...prev, `Not enough ${type} to use ${option.name}!`]);
      return;
    }

    setResources((prev) => ({
      ...prev,
      [type]: {
        ...prev[type as keyof PlayerResources],
        current: Math.max((prev[type as keyof PlayerResources]?.current || 0) - amount, 0),
      },
    }));

    const hit = calculateHitChance(player.attackSpeed, pirate.attackSpeed);

    if (hit) {
      const randomMultiplier = Math.random() * 0.4 + 0.8;
      const baseDamage = option.power * (1 - pirate.defense / 100);
      const damage = Math.floor(Math.max(baseDamage * randomMultiplier, 1));

      setPirate((prev: IPirate) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
      setCombatLog((prev) => [...prev, `Player used ${option.name} and dealt ${damage} damage!`]);
    } else {
      setCombatLog((prev) => [...prev, `Player's ${option.name} missed!`]);
    }

    setIsPlayerTurn(false);
  };


  const handleEscape = () => {
    Alert.alert("Escape", "Are you sure you want to escape? the planets pirate forces might recover.", [
      { text: "Cancel", style: "cancel" },
      { text: "Escape", onPress: () => navigation.goBack() },
    ]);
  };

  const handleEnemyDefeat = () => {
    if (currentEnemyIndex < enemies.length - 1) {
      const nextIndex = currentEnemyIndex + 1;
      setEnemies((prev) => prev.filter((_, index) => index !== currentEnemyIndex));
      setCurrentEnemyIndex(nextIndex);
      setPirate(enemies[nextIndex]); // Update pirate immediately

      setCombatLog((prev) => [
        ...prev,
        `A ${enemies[nextIndex].name} emerges! Known as "${enemies[nextIndex].weaponOfChoice} specialists," these pirates are relentless in their tactics.`,
      ]);

      setIsPlayerTurn(true); // Ensure buttons are re-enabled for the player's turn
    } else {
      setCombatLog((prev) => [...prev, "All enemies defeated! Combat complete."]);
      setTimeout(() => navigation.goBack(), 2000);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && pirate.health > 0) {
      const timeout = setTimeout(() => {
        const hit = calculateHitChance(pirate.attackSpeed, player.attackSpeed);

        if (hit) {
          const randomMultiplier = Math.random() * 0.4 + 0.8;
          const baseDamage = pirate.attack * (1 - player.defense / 100);
          const damage = Math.floor(Math.max(baseDamage * randomMultiplier, 1));

          setPlayer((prev) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
          setCombatLog((prev) => [...prev, `${pirate.name} dealt ${damage.toFixed(1)} damage!`]);
        } else {
          setCombatLog((prev) => [...prev, `${pirate.name}'s attack missed!`]);
        }

        setIsPlayerTurn(true);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn]);



  useEffect(() => {
    if (pirate.health === 0) {
      handleEnemyDefeat();
    } else if (player.health === 0) {
      setCombatLog((prev) => [...prev, "You have been defeated!"]);
      setTimeout(() => navigation.goBack(), 2000);
    }
  }, [pirate.health, player.health]);


  // Whenever the combatLog changes, scroll to the end
  useEffect(() => {

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [combatLog]);


  const renderLogEntry = (log: string, index: number) => {
    let style = styles.logTextGeneral;

    if (log.includes("Player used")) {
      style = styles.logTextPlayer;
    } else if (log.includes("missed")) {
      style = styles.logTextMiss;
    } else if (log.includes("dealt")) {
      style = styles.logTextPirate;
    } else if (log.includes("defeated")) {
      style = styles.logTextVictory;
    } else if (log.includes("destroyed")) {
      style = styles.logTextVictory;
    }

    const enhancedLog = log
      .replace("Player used", "Captain, we deployed")
      .replace("and dealt", ". Direct hit!")
      .replace("dealt", "Warning! Enemy fire hit our ship,")
      .replace("missed", "dissipates into the void");


    return (
      <Text key={index} style={[styles.logText, style]}>
        {enhancedLog}
      </Text>
    );
  };


  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.header}>{planet.name} - {enemies.length} Enemies left</Text>

        {/* Pirate Image and Health Bar */}
        <View style={styles.pirateImageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.pirateImage}
          />
          <Text style={styles.pirateName}>
            {pirate.name}: {pirate.health}/{pirate.maxHealth} HP
          </Text>
          <View style={styles.healthBarContainer}>
            <Svg width="100%" height="20">
              <Rect x="0" y="0" width="100%" height="20" fill={colors.disabledBackground} rx="5" />
              <Rect
                x="0"
                y="0"
                width={`${(pirate.health / pirate.maxHealth) * 100}%`}
                height="20"
                fill={colors.error}
                rx="5"
              />
            </Svg>
          </View>
        </View>


        {/* Health Bars */}
        <View style={styles.healthContainer}>
          <Text style={styles.healthText}>Player Health: {player.health}/100</Text>
          <Svg width="100%" height="20">
            <Rect x="0" y="0" width="100%" height="20" fill={colors.disabledBackground} rx="5" />
            <Rect
              x="0"
              y="0"
              width={`${(player.health / 100) * 100}%`}
              height="20"
              fill={colors.successGradient[1]}
              rx="5"
            />
          </Svg>
        </View>

        {/* Combat Log */}
        <View style={styles.logContainer}>
          <Text style={styles.logHeader}>Combat Log</Text>
          <ScrollView
            style={styles.scrollableLog}
            ref={scrollViewRef}
          >
            {combatLog.map((log, index) => renderLogEntry(log, index))}
          </ScrollView>
        </View>

        {/* Combat Options */}
        <View style={styles.optionsGridContainer}>
          {attackOptions.map((option) => (
            <TouchableOpacity
              key={option.name}
              disabled={!isPlayerTurn}
              style={styles.gridButton}
              onPress={() => handleAttack(option)}
            >
              <Text style={styles.gridOptionText}>{option.name}</Text>
              <Text style={styles.gridCostText}>
                - {option.cost.amount} <ResourceIcon type={option.cost.type as keyof PlayerResources} size={14} />
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.gridButton, styles.escapeButton]} onPress={handleEscape}>
            <Text style={styles.gridOptionText}>Escape</Text>
          </TouchableOpacity>
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
  scrollableLog: {
    height: 100,
    backgroundColor: colors.transparentBackground,
    borderRadius: 8,
    padding: 8,
  },
  scrollableContent: {
    flexGrow: 1,
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
    marginBottom: 16,
  },
  pirateImageContainer: {
    alignItems: "center",
    marginBottom: 20,
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
  optionsGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 16,
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
    color: colors.secondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  logContainer: {
    marginTop: 16,
    backgroundColor: colors.transparentBackground,
    padding: 12,
    borderRadius: 8,
  },
  logText: {
    fontSize: 14,
    marginBottom: 4,
  },
  logTextPlayer: {
    color: colors.warning, // Use primary color for player's actions
  },
  logTextPirate: {
    color: colors.error, // Use error color for pirate's actions
  },
  logTextMiss: {
    color: colors.textSecondary, // Use secondary color for misses
    fontStyle: "italic",
  },
  logTextGeneral: {
    color: colors.textPrimary, // General log color
  },
  logTextVictory: {
    color: colors.successGradient[0], // Bright green to signify victory
    fontWeight: "bold", // Make it stand out
    fontSize: 14, // Keep it consistent with other log text
    textAlign: "center", // Center align to emphasize the message
    marginBottom: 4, // Add spacing between entries
  },
});

export default CombatPage;
