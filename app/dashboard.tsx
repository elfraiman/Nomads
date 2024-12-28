import { Collapsible } from "@/components/Collapsible";
import ShipStatus from "@/components/ShipStatus";
import ResourceButton from "@/components/ui/ResourceButton";
import ResourceIcon, { ResourceType } from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext";
import defaultUpgradeList, { UpgradeCost } from "@/data/upgrades";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const UpgradeModule = ({
    title,
    costs,
    onUpgrade,
    onRemove,
    description,
    locked,
    resources,
}: {
    title: string;
    costs: UpgradeCost[];
    onUpgrade: () => void;
    onRemove: () => void;
    description: string;
    locked: boolean;
    resources: { [key in ResourceType]: { current: number } };
}) => (
    <>
        {!locked && (
            <Collapsible title={title}>
                <View style={locked ? styles.lockedContainer : styles.upgradeContainer}>
                    {locked ? (
                        <Text style={styles.lockedText}>Locked</Text>
                    ) : (
                        <>
                            <View style={styles.costContainer}>
                                <Text style={styles.costText}>Cost:</Text>
                                {costs.map((cost, index) => (
                                    <View key={index} style={styles.resourceContainer}>
                                        <ResourceIcon type={cost.resourceType} size={20} />
                                        <Text style={styles.costText}>{cost.amount}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.buttonsContainer}>
                                <Button
                                    title={`Upgrade ${title}`}
                                    onPress={onUpgrade}
                                    color="#3A506B"
                                    disabled={!costs.every(
                                        (cost) => resources[cost.resourceType]?.current >= cost.amount
                                    )}
                                />
                                <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
                                    <Ionicons name="trash" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.description}>{description}</Text>
                        </>
                    )}
                </View>
            </Collapsible>
        )}
    </>
);


const Dashboard = () => {
    const game = useGame();

    if (!game) return null;

    const { resources, upgrades, updateResources, generateResource, isUpgradeUnlocked, purchaseUpgrade, downgradeUpgrade, achievements } = game;

    // Memoized check for unlocked upgrades
    const anyUpgradeUnlocked = useMemo(() => {
        return upgrades.some((upgrade) => isUpgradeUnlocked(upgrade.id));
    }, [achievements]);

    const gatherEnergyAchievementComplete = useMemo(() => {
        const achievement = achievements.find((ach) => ach.id === "gather_100_energy");
        return achievement?.completed ?? false;
    }, [achievements]);


    // Handler for generating energy
    const handleGenerateEnergy = () => {
        const newEnergy = Math.round(resources.energy.current + 1.18);
        updateResources("energy", { current: newEnergy });
    };

    const defaultResourceGenerationValue = {
        fuel: 10,            // Critical for early operations.
        solarPlasma: 8,      // Slightly less useful early on.
        darkMatter: 6,       // Rare resource, mid-game use.
        frozenHydrogen: 5,   // Advanced or late-game resource.
        alloys: 7            // Early to mid-game use.
    };
    useEffect(() => {
        if (gatherEnergyAchievementComplete) {
            console.log("Gather 100 Energy achievement completed!");
        }
    }, [gatherEnergyAchievementComplete]);

    return (
        <>
            <ShipStatus />
            <ScrollView style={styles.container}>
                {/* Actions Section */}
                <Collapsible title="Actions">
                    <View style={styles.cardContent}>
                        <Button title="Generate Energy" color="#3A506B" onPress={handleGenerateEnergy} />
                    </View>
                </Collapsible>


                {/* Core operations Section */}
                {gatherEnergyAchievementComplete && (
                    <Collapsible title="Core Operations">
                        <View style={styles.cardContent}>
                            <ResourceButton
                                title={`Refine Fuel`}
                                resourceType="energy"
                                cost={10}
                                currentAmount={resources.energy.current}
                                onPress={() => generateResource("fuel", 10, defaultResourceGenerationValue.fuel, 0)}
                            />
                            <Text style={styles.description}>
                                Use energy to refine trace materials into Fuel, generating{" "}
                                <Text style={styles.highlight}>
                                    +{Math.round(defaultResourceGenerationValue.fuel * resources.fuel.efficiency)}{" "}
                                </Text>
                                <ResourceIcon type="fuel" size={14} />.
                            </Text>

                            <ResourceButton
                                title={`Condense Solar Plasma`}
                                resourceType="energy"
                                cost={10}
                                currentAmount={resources.energy.current}
                                onPress={() => generateResource("solarPlasma", 10, defaultResourceGenerationValue.solarPlasma, 0)}
                            />
                            <Text style={styles.description}>
                                Compress solar energy into plasma, generating{" "}
                                <Text style={styles.highlight}>
                                    +{Math.round(defaultResourceGenerationValue.solarPlasma * resources.solarPlasma.efficiency)}{" "}
                                </Text>
                                <ResourceIcon type="solarPlasma" size={14} />.
                            </Text>


                            <ResourceButton
                                title={`Harvest Dark Matter`}
                                resourceType="energy"
                                cost={10}
                                currentAmount={resources.energy.current}
                                onPress={() => generateResource("darkMatter", 10, defaultResourceGenerationValue.darkMatter, 0)}
                            />
                            <Text style={styles.description}>
                                Activate stabilizers to collect Dark Matter, generating{" "}
                                <Text style={styles.highlight}>
                                    +{Math.round(defaultResourceGenerationValue.darkMatter * resources.darkMatter.efficiency)}{" "}
                                </Text>
                                <ResourceIcon type="darkMatter" size={14} />.
                            </Text>


                            <ResourceButton
                                title={`Cryogenically Store Hydrogen`}
                                resourceType="energy"
                                cost={10}
                                currentAmount={resources.energy.current}
                                onPress={() => generateResource("frozenHydrogen", 10, defaultResourceGenerationValue.frozenHydrogen, 0)}
                            />
                            <Text style={styles.description}>
                                Use cryogenic systems to harvest Frozen Hydrogen, generating{" "}
                                <Text style={styles.highlight}>
                                    +{Math.round(defaultResourceGenerationValue.frozenHydrogen * resources.frozenHydrogen.efficiency)}{" "}
                                </Text>
                                <ResourceIcon type="frozenHydrogen" size={14} />.
                            </Text>
                        </View>
                    </Collapsible>
                )}


                {/* Upgrades Section */}
                {anyUpgradeUnlocked && (
                    <Collapsible title="Module Upgrades">
                        {upgrades?.map((upgrade) => (
                            <UpgradeModule
                                key={upgrade.id}
                                title={upgrade.title}
                                costs={upgrades.find((u) => u.id === upgrade.id)?.costs || upgrade.costs}
                                onUpgrade={() => purchaseUpgrade(upgrade.id)}
                                onRemove={() => downgradeUpgrade(upgrade.id)}
                                description={upgrade.description(upgrades.find((u) => u.id === upgrade.id)?.level || 0)}
                                locked={!isUpgradeUnlocked(upgrade.id)}
                                resources={resources}
                            />

                        ))}
                    </Collapsible>
                )}

            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        marginBottom: '15%',
    },
    upgradeContainer: {
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    lockedContainer: {
        padding: 16,
        backgroundColor: "#444",
        borderRadius: 10,
        marginBottom: 10,
    },
    lockedText: {
        color: "red",
        fontSize: 14,
        textAlign: "center",
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
        color: "white", // Gold color for the cost
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
        width: 36,
        height: 36,
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
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    highlight: {
        color: "white", // Gold color for emphasis
        fontWeight: "bold",
    },
    cardContent: {
        padding: 15,
    },
});

export default Dashboard;