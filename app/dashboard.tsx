import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import ResourceIcon, { ResourceType } from "@/components/ui/ResourceIcon";
import { GameContext } from "@/context/GameContext";
import React, { useContext } from "react";
import { Button, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const UpgradeModule = ({
    title,
    cost,
    resourceType,
    onUpgrade,
    onRemove,
    description,
}: {
    title: string;
    cost: number;
    resourceType: ResourceType;
    onUpgrade: () => void;
    onRemove: () => void;
    description: string;
}) => (
    <Collapsible title={`${title}`}>
        <View style={styles.upgradeContainer}>
            <View style={styles.costContainer}>
                <Text style={styles.costText}>Cost:</Text>
                <View style={styles.resourceContainer}>
                    <ResourceIcon type={resourceType} size={20} />
                    <Text style={styles.costText}>{cost}</Text>
                </View>
            </View>
            <View style={styles.buttonsContainer}>
                <Button title={`Upgrade ${title}`} onPress={onUpgrade} color="#3A506B" />
                <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
                    <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <Text style={styles.description}>{description}</Text>
        </View>
    </Collapsible>
);

const Dashboard = () => {
    const game = useContext(GameContext);

    if (!game) return null;

    const {
        resources,
        updateResources,
        autoEnergyGeneration,
        energyGeneratorUpgradeCost,
        upgradeEnergyGenerator,
        downgradeEnergyGenerator, // New function to reverse the upgrade
    } = game;

    // Handler for generating energy
    const handleGenerateEnergy = () => {
        updateResources("energy", { current: resources.energy.current + 1 });
    };

    return (
        <View style={styles.container}>
            <ShipStatus />

            {/* Actions Section */}
            <Collapsible title="Actions">
                <View style={styles.cardContent}>
                    <Button title="Generate Energy" color="#3A506B" onPress={handleGenerateEnergy} />
                </View>
            </Collapsible>

            {/* Upgrades Section */}
            <Collapsible title="Module Upgrades">
                <UpgradeModule
                    title="Reactor Optimization"
                    cost={energyGeneratorUpgradeCost}
                    resourceType="energy"
                    onUpgrade={upgradeEnergyGenerator}
                    onRemove={downgradeEnergyGenerator}
                    description={`Automatically generates ${autoEnergyGeneration} energy/sec.`}
                />

                {/* Additional modules can be added here */}
            </Collapsible>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
    },
    upgradeContainer: {
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    costContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#444",
    },
    resourceContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    costText: {
        fontSize: 14,
        color: "#FFD700", // Gold color for the cost
        fontWeight: "bold",
        marginLeft: 5,
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
    },
    deleteButton: {
        width: 36, // Fixed width for the button
        height: 36, // Fixed height for the button
        backgroundColor: "#3A506B",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
        marginLeft: 10,
    },
    description: {
        fontSize: 12,
        color: "gray",
        marginTop: 10,
    },
    cardContent: {
        padding: 15,
    },
});

export default Dashboard;
