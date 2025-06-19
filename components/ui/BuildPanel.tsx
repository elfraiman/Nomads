import { miningDroneCost, PlayerResources, IResource, scanningDroneCost, Ships } from "@/utils/defaults";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ResourceIcon from "./ResourceIcon";
import { GameContextType, GameProvider } from '../../context/GameContext';
import colors from "@/utils/colors";




const BuildPanel = ({
  cost,
  description,
  onBuild,
  cooldown,
  canAfford,
  name,
  ships,
}: {
  cost: { [key: string]: number };
  description: string;
  onBuild: () => void;
  cooldown: number; // Cooldown in seconds
  canAfford: boolean;
  name: string;
  ships: any; // Add ships prop to access current drone counts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  const handleBuild = async () => {
    if (isOnCooldown) return;

    onBuild();

    const cooldownEndTime = Date.now() + cooldown * 1000;
    await AsyncStorage.setItem("buildCooldown", cooldownEndTime.toString());

    setIsOnCooldown(true);
    setCooldownTimeLeft(cooldown);

    const interval = setInterval(() => {
      setCooldownTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsOnCooldown(false);
          AsyncStorage.removeItem("buildCooldown");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkCooldown = async () => {
    const cooldownEndTime = await AsyncStorage.getItem("buildCooldown");
    if (cooldownEndTime) {
      const now = Date.now();
      const endTime = parseInt(cooldownEndTime);
      if (now < endTime) {
        const timeLeft = Math.ceil((endTime - now) / 1000);
        setIsOnCooldown(true);
        setCooldownTimeLeft(timeLeft);

        const interval = setInterval(() => {
          setCooldownTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsOnCooldown(false);
              AsyncStorage.removeItem("buildCooldown");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        await AsyncStorage.removeItem("buildCooldown");
      }
    }
  };

  useEffect(() => {
    checkCooldown();
  }, []);

  const isDisabled = isOnCooldown || !canAfford;
  const droneType = name.includes("Mining") ? "miningDrones" : "scanningDrones";
  const currentDroneCount = ships[droneType] || 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        disabled={isDisabled}
        onPress={handleBuild}
      >
        <View style={styles.buttonContent}>
          <View style={styles.leftContent}>
            <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
              {isOnCooldown
                ? `Cooling Down...`
                : name}
            </Text>
            {isOnCooldown ? (
              <Text style={styles.cooldownText}>
                {cooldownTimeLeft}s remaining
              </Text>
            ) : (
              <Text style={[styles.droneCountText, isDisabled && styles.droneCountTextDisabled]}>
                Current: {currentDroneCount}
              </Text>
            )}
          </View>
          <View style={styles.rightContent}>
            <ResourceIcon type={droneType as any} size={24} />
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContainer}>
          <View style={styles.costSection}>
            <Text style={styles.costTitle}>Cost:</Text>
            <View style={styles.costContainer}>
              {Object.entries(cost).map(([resource, amount], index) => (
                <View key={resource} style={styles.costItem}>
                  <ResourceIcon type={resource as any} size={14} />
                  <Text style={styles.costText}>{amount}</Text>
                  {index < Object.entries(cost).length - 1 && (
                    <Text style={styles.costSeparator}>{" • "}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
      )}
    </View>
  );
};


const BuildOperations = ({
  resources,
  ships,
  updateResources,
  updateShips,
  game,
}: {
  resources: PlayerResources;
  ships: Ships;
  updateResources: (type: keyof PlayerResources, changes: Partial<IResource>) => void;
  updateShips: (shipType: keyof Ships, amount: number) => void;
  game: GameContextType;
}) => {


  const buildMiningDrone = () => {
    const cost = miningDroneCost;

    const canAfford = resources.fuel.current >= cost.fuel &&
      resources.solarPlasma.current >= cost.solarPlasma &&
      resources.energy.current >= cost.energy;

    // Check if the player can afford the cost
    if (canAfford) {
      // Deduct resources
      updateResources("fuel", { current: resources.fuel.current - cost.fuel });
      updateResources("solarPlasma", {
        current: resources.solarPlasma.current - cost.solarPlasma,
      });
      updateResources("energy", {
        current: resources.energy.current - cost.energy,
      });

      // Add one mining drone
      updateShips("miningDrones", ships.miningDrones + 1);
    } else {
      game.showGeneralNotification({
        title: "Insufficient Resources",
        message: "Not enough resources to build a Mining Drone.",
        type: "error",
        icon: "🤖"
      });
    }
  };

  const buildScanningDrone = () => {
    const cost = scanningDroneCost;

    const canAfford = resources.fuel.current >= cost.fuel &&
      resources.solarPlasma.current >= cost.solarPlasma &&
      resources.energy.current >= cost.energy;

    // Check if the player can afford the cost
    if (canAfford) {
      // Deduct resources
      updateResources("fuel", { current: resources.fuel.current - cost.fuel });
      updateResources("solarPlasma", {
        current: resources.solarPlasma.current - cost.solarPlasma,
      });
      updateResources("energy", {
        current: resources.energy.current - cost.energy,
      });

      // Add one mining drone
      updateShips("scanningDrones", ships.scanningDrones + 1);
    } else {
      game.showGeneralNotification({
        title: "Insufficient Resources",
        message: "Not enough resources to build a Scanning Drone.",
        type: "error",
        icon: "🛸"
      });
    }
  };

  const canAfford = (costs: { [key: string]: number }) => {
    return Object.entries(costs).every(([resource, amount]) => {
      const typedResource = resource as keyof PlayerResources;
      return resources[typedResource]?.current >= amount;
    });
  };


  return (
    <View style={styles.cardContent}>
      <BuildPanel
        name="Build Scanning Drone"
        canAfford={canAfford(scanningDroneCost)}
        cost={scanningDroneCost}
        description={`Manufacture a Scanning Drone to explore the galaxy.`}
        onBuild={buildScanningDrone}
        cooldown={1} // 1-minute cooldown
        ships={ships}
      />

      {game.isAchievementUnlocked("find_an_asteroid") && (
        <BuildPanel
          name="Build Mining Drone"
          canAfford={canAfford(miningDroneCost)}
          cost={miningDroneCost}
          description={`Refine Alloy and Solar Plasma and build a Mining Drone.`}
          onBuild={buildMiningDrone}
          cooldown={60} // 1-minute cooldown
          ships={ships}
        />
      )}

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    padding: 10,
    backgroundColor: colors.panelBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "column",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBorder,
  },
  buttonTextDisabled: {
    color: colors.disabledText,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  cooldownText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  droneCountText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  droneCountTextDisabled: {
    color: colors.disabledText,
  },
  costSection: {
    marginBottom: 10,
  },
  costTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  costItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  costText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  costSeparator: {
    color: colors.textSecondary,
    fontSize: 12,
    marginHorizontal: 4,
  },
  expandButton: {
    padding: 4,
  },
  expandedContainer: {
    marginTop: 6,
    padding: 10,
    backgroundColor: colors.panelBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  cardContent: {
    padding: 6,
  },
  gained: {
    color: colors.secondary,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    alignItems: "center",
    marginTop: 8,
    width: '90%',
  },
});


export default BuildOperations;