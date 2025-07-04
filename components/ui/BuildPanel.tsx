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
}: {
  cost: { [key: string]: number };
  description: string;
  onBuild: () => void;
  cooldown: number; // Cooldown in seconds
  canAfford: boolean;
  name: string;
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

  useEffect(() => {
    const checkCooldown = async () => {
      const storedCooldown = await AsyncStorage.getItem("buildCooldown");
      if (storedCooldown) {
        const cooldownEndTime = parseInt(storedCooldown, 10);
        const remainingTime = Math.max(0, Math.floor((cooldownEndTime - Date.now()) / 1000));

        if (remainingTime > 0) {
          setIsOnCooldown(true);
          setCooldownTimeLeft(remainingTime);

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
        }
      }
    };

    checkCooldown();
  }, []);


  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            (isOnCooldown || !canAfford) && styles.buttonDisabled,
          ]}
          disabled={isOnCooldown || !canAfford}
          onPress={handleBuild}
        >
          <View>
            <Text style={styles.buttonText}>
              {isOnCooldown
                ? `Cooling Down... (${cooldownTimeLeft}s)`
                : name}
              <View style={styles.iconContainer}>
                <ResourceIcon type="miningDrones" size={20} />
              </View>
            </Text>
          </View>


        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chevronButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-forward"}
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContainer}>
          <Text style={styles.description}>
            Cost: {cost.fuel} <ResourceIcon type="fuel" size={14} />,{" "}
            {cost.solarPlasma} <ResourceIcon type="solarPlasma" size={14} />,{" "}
            {cost.energy} <ResourceIcon type="energy" size={14} />.
          </Text>
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
      alert("Not enough resources to build a Mining Drone.");
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
      alert("Not enough resources to build a Mining Drone.");
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
      />

      {game.isAchievementUnlocked("find_an_asteroid") && (
        <BuildPanel
          name="Build Mining Drone"
          canAfford={canAfford(miningDroneCost)}
          cost={miningDroneCost}
          description={`Refine Alloy and Solar Plasma and build a Mining Drone.`}
          onBuild={buildMiningDrone}
          cooldown={60} // 1-minute cooldown
        />
      )}

    </View>
  );
};


const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  chevronButton: {
    marginLeft: 10,
    padding: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground, // Muted gray for disabled state
    borderColor: colors.disabledBorder, // Subtle border for disabled buttons
  },
  expandedContainer: {
    marginTop: 6,
    padding: 10,
    backgroundColor: colors.panelBackground, // Mid-tone from the gradient theme
    borderWidth: 1,
    borderColor: colors.border, // Orange highlight border
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    color: colors.textPrimary, // Bright yellow for descriptive text
    fontSize: 12,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  cardContent: {
    padding: 6,
  },
  gained: {
    color: colors.secondary, // Orange for emphasis
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