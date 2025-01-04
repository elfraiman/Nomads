import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, ScrollView } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import colors from "@/utils/colors";
import ShipStatus from "@/components/ShipStatus";
import { useGame } from "@/context/GameContext";

const CombatPage = ({ route, navigation }: { route: any; navigation: any }) => {
  const { planet } = route.params;
  const game = useGame();

  if (!game) return null;

  const { resources, setResources } = game;

  const initialPlayerStats = {
    health: 100,
    attackPower: 15,
    defense: 10,
  };

  const initialPirateStats = {
    health: Math.floor(Math.random() * 50) + 50,
    attack: Math.floor(Math.random() * 10) + 10,
    defense: Math.floor(Math.random() * 5),
  };

  const generatePirateStats = () => ({
    health: Math.floor(Math.random() * 50) + 50,
    attack: Math.floor(Math.random() * 10) + 10,
    defense: Math.floor(Math.random() * 5),
  });

  const bossStats = {
    health: 200,
    attack: 25,
    defense: 15,
  };

  const [player, setPlayer] = useState(initialPlayerStats);
  const [pirate, setPirate] = useState(generatePirateStats());
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [piratesLeft, setPiratesLeft] = useState(5); // Number of pirates to defeat before the boss
  const [isBossFight, setIsBossFight] = useState(false);

  const attackOptions = [
    { name: "Energy Canon", cost: { type: "energy", amount: 10 }, power: 20 },
    { name: "Solar Plasma Beam", cost: { type: "solarPlasma", amount: 15 }, power: 30 },
    { name: "Dark Matter Missile", cost: { type: "darkMatter", amount: 20 }, power: 40 },
    { name: "Penetrating Alloy Bullet", cost: { type: "alloy", amount: 5 }, power: 10 },
    { name: "Cold Laser", cost: { type: "frozenHydrogen", amount: 10 }, power: 25 },
  ];

  const handleAttack = (option: typeof attackOptions[0]) => {
    const { type, amount } = option.cost;

    // Check if player has enough resources
    if ((resources[type]?.current || 0) < amount) {
      setCombatLog((prev) => [...prev, `Not enough ${type} to use ${option.name}!`]);
      return;
    }

    // Deduct resources and deal damage
    setResources((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        current: Math.max((prev[type]?.current || 0) - amount, 0),
      },
    }));

    const damage = Math.max(option.power - pirate.defense, 0);
    setPirate((prev) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
    setCombatLog((prev) => [...prev, `Player used ${option.name} and dealt ${damage} damage!`]);
    setIsPlayerTurn(false);
  };

  const handleEscape = () => {
    Alert.alert("Escape", "Are you sure you want to escape?", [
      { text: "Cancel", style: "cancel" },
      { text: "Escape", onPress: () => navigation.goBack() },
    ]);
  };

  const handlePirateDefeat = () => {
    if (piratesLeft > 1) {
      setPiratesLeft((prev) => prev - 1);
      setPirate(generatePirateStats());
      setCombatLog((prev) => [...prev, "A new pirate has appeared!"]);
    } else {
      setIsBossFight(true);
      setPirate(bossStats);
      setCombatLog((prev) => [...prev, "The Boss has arrived!"]);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && pirate.health > 0) {
      const timeout = setTimeout(() => {
        const damage = Math.max(pirate.attack - player.defense, 0);
        setPlayer((prev) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
        setCombatLog((prev) => [...prev, `Pirate dealt ${damage} damage!`]);
        setIsPlayerTurn(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn]);

  useEffect(() => {
    if (pirate.health === 0) {
      if (isBossFight) {
        setCombatLog((prev) => [...prev, "Boss defeated!"]);
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        handlePirateDefeat();
      }
    } else if (player.health === 0) {
      setCombatLog((prev) => [...prev, "You have been defeated!"]);
      setTimeout(() => navigation.goBack(), 2000);
    }
  }, [pirate.health, player.health]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.header}>
          {planet.name} - {isBossFight ? "Boss Fight" : `Combat (${piratesLeft} Left)`}
        </Text>

        {/* Pirate Image */}
        <View style={styles.pirateImageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.pirateImage}
          />
          <Text style={styles.pirateName}>
            {isBossFight ? "Boss" : "Pirate"}: {pirate.health}/{isBossFight ? bossStats.health : initialPirateStats.health} HP
          </Text>
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
              fill={colors.primary}
              rx="5"
            />
          </Svg>
        </View>

        {/* Combat Log */}
        <View style={styles.logContainer}>
          <Text style={styles.logHeader}>Combat Log</Text>
          <ScrollView
            style={styles.scrollableLog}
            contentContainerStyle={styles.scrollableContent}
            ref={(ref) => {
              if (ref) {
                ref.scrollToEnd({ animated: true });
              }
            }}
          >
            {combatLog.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
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
                - {option.cost.amount} {option.cost.type}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.gridButton, styles.escapeButton]} onPress={handleEscape}>
            <Text style={styles.gridOptionText}>Escape</Text>
          </TouchableOpacity>
        </View>

      </View>
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
    maxHeight: 100,
    backgroundColor: colors.transparentBackground,
    borderRadius: 8,
    padding: 8,
  },
  scrollableContent: {
    flexGrow: 1,
  },
  logHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  logText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
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
    width: 120,
    height: 120,
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
    padding: 12,
    margin: 6,
    alignItems: "center",
    width: "40%",
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
});

export default CombatPage;
