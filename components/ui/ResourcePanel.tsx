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


interface CoreOperationsProps {
    defaultResourceGenerationValue: {
        fuel: number;
        solarPlasma: number;
    };
    generateResource: (type: keyof PlayerResources, energyCost: number, output: number, cooldown: number) => void;
}

const CoreOperations = ({
    defaultResourceGenerationValue,
    generateResource,
}: CoreOperationsProps) => {

    const { resources } = useGame();

    const returnPriceForResource = (resource: IResource, defaultPrice: number) => {
        return Math.round(resource.efficiency * defaultPrice);
    }


    return (
        <View style={styles.container}>
            <ResourceButton
                title="Generate Fuel"
                resourceType="fuel"
                cost={returnPriceForResource(resources.fuel, 10)}
                playerEnergy={resources.energy.current}
                currentAmount={resources.fuel.current}
                maxAmount={resources.fuel.max}
                generationAmount={Math.round(defaultResourceGenerationValue.fuel * resources.fuel.efficiency)}
                onPress={() => generateResource(
                    "fuel",
                    returnPriceForResource(resources.fuel, 10),
                    defaultResourceGenerationValue.fuel,
                    0
                )}
            />

            {!resources.solarPlasma.locked && (
                <ResourceButton
                    title="Condense Solar Plasma"
                    resourceType="solarPlasma"
                    cost={returnPriceForResource(resources.solarPlasma, 16)}
                    playerEnergy={defaultResourceGenerationValue.solarPlasma}
                    currentAmount={resources.solarPlasma.current}
                    maxAmount={resources.solarPlasma.max}
                    generationAmount={Math.round(defaultResourceGenerationValue.solarPlasma * resources.solarPlasma.efficiency)}
                    onPress={() => generateResource(
                        "solarPlasma",
                        returnPriceForResource(resources.solarPlasma, 16),
                        defaultResourceGenerationValue.solarPlasma,
                        0
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 6,
        color: colors.textSecondary,
    },
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
    gained: {
        color: colors.warning, // Orange for emphasis
        textDecorationLine: "underline",
    },
});


export default CoreOperations;
