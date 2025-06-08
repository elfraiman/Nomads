import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { ResourceType } from "@/components/ui/ResourceIcon";
import ResourceButton from "@/components/ui/ResourceButton";
import { PlayerResources, IResource } from "@/utils/defaults";
import colors from "@/utils/colors";
import { useGame } from "@/context/GameContext";

interface ResourcePanelProps {
    resourceType: ResourceType;
    title: string;
    cost: number;
    currentAmount: number;
    maxAmount: number;
    efficiency: number;
    playerEnergy: number;
    onGenerate: () => void;
    description: string;
}

const ResourcePanel = ({
    resourceType,
    title,
    cost,
    currentAmount,
    maxAmount,
    playerEnergy,
    onGenerate,
    description,
}: ResourcePanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View>
            <View style={styles.row}>
                <ResourceButton
                    title={title}
                    resourceType={resourceType}
                    cost={cost}
                    playerEnergy={playerEnergy}
                    currentAmount={currentAmount}
                    maxAmount={maxAmount}
                    onPress={onGenerate}
                />

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
                        Cost: {cost} <ResourceIcon type="energy" size={14} />
                    </Text>
                    <Text style={styles.description}>{description}<ResourceIcon type={resourceType} size={14} /></Text>
                </View>
            )}
        </View>
    );
};

interface CoreOperationsProps {
    defaultResourceGenerationValue: {
        fuel: number;
        solarPlasma: number;
        researchPoints: number;
        exoticMatter: number;
        quantumCores: number;
    };
    generateResource: (type: keyof PlayerResources, energyCost: number, output: number, cooldown: number) => void;
}

const CoreOperations = ({
    defaultResourceGenerationValue,
    generateResource,
}: CoreOperationsProps) => {

    const { resources, isAchievementUnlocked } = useGame();

    const returnPriceForResource = (resource: IResource, defaultPrice: number) => {
        return Math.round(resource.efficiency * defaultPrice);
    }


    return (
        <View style={styles.cardContent}>
            <ResourcePanel
                resourceType="fuel"
                title="Refine Fuel"
                cost={returnPriceForResource(resources.fuel, 10)}
                currentAmount={resources.fuel.current}
                maxAmount={resources.fuel.max}
                efficiency={resources.fuel.efficiency}
                playerEnergy={resources.energy.current}
                onGenerate={() =>
                    generateResource(
                        "fuel",
                        returnPriceForResource(resources.fuel, 10),
                        defaultResourceGenerationValue.fuel,
                        0
                    )
                }
                description={`Use energy to refine trace materials into Fuel, generating +${Math.round(
                    defaultResourceGenerationValue.fuel * resources.fuel.efficiency
                )} `}
            />


            {!resources.solarPlasma.locked && (
                <ResourcePanel
                    resourceType="solarPlasma"
                    title="Condense Solar Plasma"
                    cost={returnPriceForResource(resources.solarPlasma, 16)}
                    currentAmount={resources.solarPlasma.current}
                    maxAmount={resources.solarPlasma.max}
                    efficiency={resources.solarPlasma.efficiency}
                    playerEnergy={resources.energy.current}
                    onGenerate={() =>
                        generateResource(
                            "solarPlasma",
                            returnPriceForResource(resources.solarPlasma, 16),
                            defaultResourceGenerationValue.solarPlasma,
                            0
                        )
                    }
                    description={`Compress solar energy into Solar Plasma, generating +${Math.round(
                        defaultResourceGenerationValue.solarPlasma * resources.solarPlasma.efficiency
                    )}`}
                />
            )}

            {/* NEW ADVANCED RESOURCES */}
            {isAchievementUnlocked("unlock_research_lab") && !resources.researchPoints.locked && (
                <ResourcePanel
                    resourceType="researchPoints"
                    title="Generate Research Points"
                    cost={returnPriceForResource(resources.researchPoints, 25)}
                    currentAmount={resources.researchPoints.current}
                    maxAmount={resources.researchPoints.max}
                    efficiency={resources.researchPoints.efficiency}
                    playerEnergy={resources.energy.current}
                    onGenerate={() =>
                        generateResource(
                            "researchPoints",
                            returnPriceForResource(resources.researchPoints, 25),
                            defaultResourceGenerationValue.researchPoints,
                            0
                        )
                    }
                    description={`Convert energy and time into Research Points for technological advancement, generating +${Math.round(
                        defaultResourceGenerationValue.researchPoints * resources.researchPoints.efficiency
                    )}`}
                />
            )}

            {isAchievementUnlocked("deep_space_explorer") && !resources.exoticMatter.locked && (
                <ResourcePanel
                    resourceType="exoticMatter"
                    title="Extract Exotic Matter"
                    cost={returnPriceForResource(resources.exoticMatter, 40)}
                    currentAmount={resources.exoticMatter.current}
                    maxAmount={resources.exoticMatter.max}
                    efficiency={resources.exoticMatter.efficiency}
                    playerEnergy={resources.energy.current}
                    onGenerate={() =>
                        generateResource(
                            "exoticMatter",
                            returnPriceForResource(resources.exoticMatter, 40),
                            defaultResourceGenerationValue.exoticMatter,
                            0
                        )
                    }
                    description={`Extract rare matter from cosmic phenomena, generating +${Math.round(
                        defaultResourceGenerationValue.exoticMatter * resources.exoticMatter.efficiency
                    )}`}
                />
            )}

            {isAchievementUnlocked("complete_first_research") && !resources.quantumCores.locked && (
                <ResourcePanel
                    resourceType="quantumCores"
                    title="Manufacture Quantum Cores"
                    cost={returnPriceForResource(resources.quantumCores, 60)}
                    currentAmount={resources.quantumCores.current}
                    maxAmount={resources.quantumCores.max}
                    efficiency={resources.quantumCores.efficiency}
                    playerEnergy={resources.energy.current}
                    onGenerate={() =>
                        generateResource(
                            "quantumCores",
                            returnPriceForResource(resources.quantumCores, 60),
                            defaultResourceGenerationValue.quantumCores,
                            0
                        )
                    }
                    description={`Construct advanced computing cores, generating +${Math.round(
                        defaultResourceGenerationValue.quantumCores * resources.quantumCores.efficiency
                    )}`}
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
    expandedContainer: {
        marginTop: 6,
        padding: 10,
        backgroundColor: colors.panelBackground, // Mid-tone from the gradient theme
        borderWidth: 1,
        borderColor: colors.border, // Orange highlight border
    },
    description: {
        color: colors.textPrimary, // Bright yellow for descriptive text
        fontSize: 12,
    },
    cardContent: {
        padding: 6,
    },
    gained: {
        color: colors.warning, // Orange for emphasis
        textDecorationLine: "underline",
    },
});


export default CoreOperations;
