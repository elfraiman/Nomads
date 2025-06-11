import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useGame } from "@/context/GameContext";
import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/utils/colors";
import { formatLargeNumber } from "@/utils/numberFormatter";

const DroneManagement = () => {
  const game = useGame();
  if (!game) return null;

  const { ships, miningDroneAllocation, allocateMiningDrones, foundAsteroids } = game;

  const getAvailableDrones = (total: number, allocation: Record<string, number>) => {
    return total - Object.values(allocation).reduce((a, b) => a + b, 0);
  };

  return (
    <>
      <LinearGradient
        colors={[colors.panelBackground, colors.disabledBackground]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Mining Drones Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mining Drones</Text>
          <View style={styles.contentContainer}>
            <Text style={styles.info}>
              Available: {getAvailableDrones(ships.miningDrones, miningDroneAllocation) ?? 0}
            </Text>

            {/* Display Asteroids */}
            <Text style={styles.subHeader}>Asteroids:</Text>
            {foundAsteroids.length > 0 ? (
              <FlatList
                data={foundAsteroids}
                keyExtractor={(asteroid) => asteroid.id.toString()}
                renderItem={({ item: asteroid }) => (
                  <View style={styles.taskContainer}>
                    <Text style={styles.taskText}>
                      {asteroid.name} ({formatLargeNumber(asteroid.maxResources)}{" "}
                      <ResourceIcon type={asteroid.resource} size={14} />)
                    </Text>
                    <View style={styles.allocationControls}>
                      {/* Increment Drone Allocation */}
                      <TouchableOpacity
                        style={[
                          styles.controlButton,
                          getAvailableDrones(ships.miningDrones, miningDroneAllocation) > 0
                            ? null
                            : styles.disabledButton,
                        ]}
                        onPress={() => allocateMiningDrones(asteroid, 1)}
                        disabled={getAvailableDrones(ships.miningDrones, miningDroneAllocation) <= 0}
                      >
                        <Text style={styles.buttonText}>+1</Text>
                      </TouchableOpacity>

                      {/* Display Current Allocation */}
                      <Text style={styles.allocationText}>
                        {miningDroneAllocation[asteroid.id] || 0}
                      </Text>

                      {/* Decrement Drone Allocation */}
                      <TouchableOpacity
                        style={[
                          styles.controlButton,
                          (miningDroneAllocation[asteroid.id] || 0) > 0
                            ? null
                            : styles.disabledButton,
                        ]}
                        onPress={() => allocateMiningDrones(asteroid, -1)}
                        disabled={(miningDroneAllocation[asteroid.id] || 0) <= 0}
                      >
                        <Text style={styles.buttonText}>-1</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noAsteroidsText}>
                No asteroids found. Scan for asteroids in the exploration map.
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
      <ShipStatus />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.transparentBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  contentContainer: {
    backgroundColor: colors.panelBackground,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskText: {
    color: colors.textPrimary,
    fontSize: 16,
    flex: 1,
  },
  allocationControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: colors.disabledBackground,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  allocationText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginHorizontal: 8,
  },
  noAsteroidsText: {
    color: colors.warning,
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

export default DroneManagement;
