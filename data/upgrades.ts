// src/data/upgrades.ts

import { PlayerResources } from "@/utils/defaults";

export interface UpgradeCost {
    resourceType: keyof PlayerResources; // Only valid keys of PlayerResources
    amount: number;
}

export interface Upgrade {
    id: string;
    title: string;
    description: (level: number) => string; // Function to generate a description
    costs: UpgradeCost[]; // Array of resource costs
    baseCostMultiplier: number; // Cost multiplier for all resources
    level: number;
}

const defaultUpgradeList: Upgrade[] = [
    {
        id: "reactor_optimization",
        title: "Reactor Optimization",
        description: (level) =>
            `Optimize your reactor's energy conversion efficiency. Each level enhances energy output by +${level + 1} unit(s) per second, reducing wastage and maximizing core performance.`,
        costs: [
            { resourceType: "energy", amount: 35 }
        ],
        baseCostMultiplier: 1.25,
        level: 0,
    },
    {
        id: "reactor_storage",
        title: "Reactor Storage",
        description: () =>
            "Enhance reactor containment systems to safely store an additional +100 units of energy. Improved insulation and reinforced capacitors ensure stability under increased loads.",
        costs: [
            { resourceType: "energy", amount: 50 },
            { resourceType: "fuel", amount: 50 }
        ],
        baseCostMultiplier: 1.20,
        level: 1,
    },
    {
        id: "core_operations_storage",
        title: "Core Operations Storage",
        description: (level: number) =>
            `Upgrade core operations storage to safely store an additional +200 units. Enhanced containment systems and improved diagnostics ensure stability under increased loads.`,
        costs: [
            { resourceType: "energy", amount: 200 },
            { resourceType: "fuel", amount: 100 },
            { resourceType: "solarPlasma", amount: 50 }
        ],
        baseCostMultiplier: 1.25,
        level: 0,
    },
    {
        id: "core_operations_efficiency",
        title: "Core Operations Efficiency",
        description: (level: number) =>
            `Refine and streamline the ship's core operational subsystems, increasing their output efficiency by ${5}% to a total of ${(level + 1) * 5} Precision fuel allocation and advanced diagnostics minimize energy waste.`,
        costs: [
            { resourceType: "energy", amount: 50 },
            { resourceType: "fuel", amount: 100 },
        ],
        baseCostMultiplier: 1.5,
        level: 0,
    },
    // Add more upgrades here
];

export default defaultUpgradeList;
