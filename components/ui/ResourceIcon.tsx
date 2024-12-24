import React from 'react';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export type ResourceType = 'energy' | 'fuel' | 'solarPlasma' | 'tokens' | 'alloys' | 'darkMatter' | 'frozenHydrogen';

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
        defaultColor: '#8B8B8B',
    },
    darkMatter: {
        icon: <MaterialCommunityIcons name="alien-outline" />,
        defaultColor: '#6A0DAD',
    },
    frozenHydrogen: {
        icon: <FontAwesome5 name="snowflake" />,
        defaultColor: '#77C0D8',
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
