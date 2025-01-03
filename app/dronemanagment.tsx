import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Button,
} from "react-native";
import { useGame } from "@/context/GameContext";
import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { LinearGradient } from "expo-linear-gradient";

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
        colors={["#1A1C20", "#2B3035", "#3D444C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.container}>

          {/* Mining Drones Section */}
          <View style={styles.section}>
            <Text style={styles.subHeader}>Mining Drones</Text>
            <Text style={styles.info}>
              Available: {getAvailableDrones(ships.miningDrones, miningDroneAllocation) ?? 0}
            </Text>

            {/* Display Asteroids */}
            <Text style={styles.subHeader}>Asteroids:</Text>
            {foundAsteroids.length > 0 ? (
              <FlatList
                data={foundAsteroids}
                keyExtractor={(asteroid) => asteroid.id.toString()}
                renderItem={({ item: asteroid }) => {
                  return (
                    <View style={styles.taskContainer}>
                      <Text style={styles.taskText}>
                        {asteroid.name} ({asteroid.maxResources} {<ResourceIcon type={asteroid.resource} size={14} />})
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
                  );
                }}
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
  section: {
    marginBottom: 24,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFA726",
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 12,
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskText: {
    color: "#FFF",
    fontSize: 16,
    flex: 1,
  },
  allocationControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "#253947",
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
  },
  allocationText: {
    color: "#FFA726",
    fontSize: 16,
    marginHorizontal: 8,
  },
  noAsteroidsText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

export default DroneManagement;
