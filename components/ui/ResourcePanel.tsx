import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { ResourceType } from "@/components/ui/ResourceIcon";
import ResourceButton from "@/components/ui/ResourceButton";
import { PlayerResources, Resource } from "@/utils/defaults";
import colors from "@/utils/colors";

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
    resources: {
        fuel: Resource;
        solarPlasma: Resource & { locked: boolean };
        energy: Resource;
    };
    defaultResourceGenerationValue: {
        fuel: number;
        solarPlasma: number;
    };
    generateResource: (type: keyof PlayerResources, energyCost: number, output: number, cooldown: number) => void;
}

const CoreOperations = ({
    resources,
    defaultResourceGenerationValue,
    generateResource,
}: CoreOperationsProps) => {
    const returnPriceForResource = (resource: Resource, defaultPrice: number) => {
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
                        defaultResourceGenerationValue.fuel * resources.fuel.efficiency,
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
                            defaultResourceGenerationValue.solarPlasma * resources.solarPlasma.efficiency,
                            0
                        )
                    }
                    description={`Compress solar energy into Solar Plasma, generating +${Math.round(
                        defaultResourceGenerationValue.solarPlasma * resources.solarPlasma.efficiency
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
