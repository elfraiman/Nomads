import React from 'react';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5, Entypo, Fontisto } from '@expo/vector-icons';

export type ResourceType =
    | 'energy'
    | 'fuel'
    | 'solarPlasma'
    | 'tokens'
    | 'alloys'
    | 'darkMatter'
    | 'frozenHydrogen'
    | 'miningDrones'
    | 'resourceDrones'
    | 'corvettes'
    | 'marauders'
    | 'titans'
    | 'scanningDrones'
    | 'researchPoints'
    | 'exoticMatter'
    | 'quantumCores'
    | 'ancientArtifacts'
    | 'diplomaticInfluence';

interface ResourceIconProps {
    type: ResourceType;
    size?: number;
    color?: string;
}

const resourceIcons: Record<ResourceType, { icon: React.ReactNode; defaultColor: string }> = {
    energy: {
        icon: <Ionicons name="battery-charging-outline" />,
        defaultColor: '#FFD93D',
    },
    fuel: {
        icon: <Ionicons name="flame-outline" />,
        defaultColor: '#FF6B6B',
    },
    solarPlasma: {
        icon: <MaterialIcons name="flare" />,
        defaultColor: '#FF5722',
    },
    tokens: {
        icon: <Ionicons name="card-outline" />,
        defaultColor: '#6FCF97',
    },
    alloys: {
        icon: <MaterialCommunityIcons name="cube-outline" />,
        defaultColor: '#C0C0C0',
    },
    darkMatter: {
        icon: <MaterialCommunityIcons name="alien-outline" />,
        defaultColor: '#6A0DAD',
    },
    frozenHydrogen: {
        icon: <FontAwesome5 name="snowflake" />,
        defaultColor: '#77C0D8',
    },
    miningDrones: {
        icon: <MaterialCommunityIcons name="drone" />,
        defaultColor: '#00BFFF', // Light blue for mining drones
    },
    resourceDrones: {
        icon: <Entypo name="aircraft" />,
        defaultColor: '#00BFFF', // Light blue for mining drones
    },
    scanningDrones: {
        icon: <Fontisto name="helicopter" />,
        defaultColor: '#FF4500', // Red-orange for attack drones
    },
    corvettes: {
        icon: <MaterialCommunityIcons name="rocket-outline" />,
        defaultColor: '#5F9EA0', // Cadet blue for corvettes
    },
    marauders: {
        icon: <Ionicons name="skull-outline" />,
        defaultColor: '#8B0000', // Dark red for marauders
    },
    titans: {
        icon: <FontAwesome5 name="mountain" />,
        defaultColor: '#FFD700', // Gold for titans
    },
    researchPoints: {
        icon: <MaterialCommunityIcons name="flask-outline" />,
        defaultColor: '#00CED1', // Dark turquoise for research
    },
    exoticMatter: {
        icon: <MaterialCommunityIcons name="atom" />,
        defaultColor: '#8A2BE2', // Blue violet for exotic matter
    },
    quantumCores: {
        icon: <MaterialCommunityIcons name="chip" />,
        defaultColor: '#32CD32', // Lime green for quantum cores
    },
    ancientArtifacts: {
        icon: <MaterialCommunityIcons name="treasure-chest" />,
        defaultColor: '#DAA520', // Golden rod for artifacts
    },
    diplomaticInfluence: {
        icon: <Ionicons name="people-outline" />,
        defaultColor: '#4169E1', // Royal blue for diplomacy
    },
};

const ResourceIcon: React.FC<ResourceIconProps> = ({ type, size = 24, color }) => {
    const resource = resourceIcons[type];
    if (!resource) return null;

    return React.cloneElement(resource.icon as React.ReactElement, {
        size,
        color: color || resource.defaultColor,
    });
};

export default ResourceIcon;
