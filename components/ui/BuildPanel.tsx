import colors from "@/utils/colors";
import { IResource, miningDroneCost, PlayerResources, scanningDroneCost, Ships } from "@/utils/defaults";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GameContextType } from '../../context/GameContext';
import ResourceIcon, { ResourceType } from "./ResourceIcon";
import { LinearGradient } from "expo-linear-gradient";

const BuildPanel = ({
  cost,
  description,
  onBuild,
  cooldown,
  canAfford,
  name,
  currentCount,
  iconName,
}: {
  cost: { [key: string]: number };
  description: string;
  onBuild: () => void;
  cooldown: number;
  canAfford: boolean;
  name: string;
  currentCount: number;
  iconName: ResourceType;
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
        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={
              (!canAfford || isOnCooldown)
                ? ['#1A1D2E', '#141824', '#141824']
                : [
                  'rgba(25, 35, 55, 0.9)',
                  colors.primary,
                  'rgba(25, 35, 55, 0.9)'
                ]
            }
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <View style={[styles.glowContainer, { pointerEvents: 'none' }]}>
              <LinearGradient
                colors={['transparent', 'rgba(73, 143, 225, 0.15)', 'transparent']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glowEffect}
              />
            </View>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleBuild}
              disabled={isOnCooldown || !canAfford}
            >
              <View style={styles.buttonContent}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.buttonText, (!canAfford || isOnCooldown) && styles.textDisabled]}>
                    {name}
                  </Text>
                  <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                      <Text style={[styles.costText, (!canAfford || isOnCooldown) && styles.textDisabled]}>
                        Current: {currentCount}
                      </Text>
                      <ResourceIcon type={iconName} size={16} />
                    </View>
                    <View style={styles.costContainer}>
                      <Text style={styles.costText}> Cost: </Text>
                      {Object.entries(cost).map(([resource, amount]) => (
                        <View key={resource} style={styles.costRow}>
                          <ResourceIcon type={resource as any} size={16} />
                          <Text style={[styles.costText, (!canAfford || isOnCooldown) && styles.textDisabled]}>
                            {amount}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                {isOnCooldown ? (
                  <Text style={styles.cooldownText}>{cooldownTimeLeft}s</Text>
                ) : (
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={!canAfford ? colors.textSecondary : colors.textPrimary}
                  />
                )}
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: isOnCooldown ? `${(cooldownTimeLeft / cooldown) * 100}%` : '0%' },
                    (!canAfford || isOnCooldown) && styles.progressBarDisabled
                  ]}
                />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
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
        cooldown={1}
        iconName="scanningDrones"
        currentCount={ships.scanningDrones}
      />

      {game.isAchievementUnlocked("find_an_asteroid") && (
        <BuildPanel
          name="Build Mining Drone"
          canAfford={canAfford(miningDroneCost)}
          cost={miningDroneCost}
          description={`Refine Alloy and Solar Plasma and build a Mining Drone.`}
          onBuild={buildMiningDrone}
          cooldown={60}
          iconName="miningDrones"
          currentCount={ships.miningDrones}
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
  buttonContainer: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  button: {
    padding: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(73, 143, 225, 0.3)',
  },
  mainButton: {
    width: '100%',
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginTop: 4,
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  textDisabled: {
    color: colors.textSecondary,
  },
  cooldownText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: colors.border,
    marginTop: 6,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.glowEffect,
  },
  progressBarDisabled: {
    backgroundColor: colors.textSecondary,
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
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: '-50%',
    right: '-50%',
    bottom: 0,
    transform: [{ rotate: '15deg' }],
  },
});

export default BuildOperations;