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

const initialUpgradeList: Upgrade[] = [
    {
        id: "reactor_optimization",
        title: "Reactor Optimization",
        description: (level) =>
            `Optimize your reactor's energy conversion efficiency. Next level enhances energy output by ${1 * 1.85} unit(s) per second, reducing wastage and maximizing core performance.`,
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
        baseCostMultiplier: 1.10,
        level: 1,
    },
    {
        id: "core_operations_storage",
        title: "Core Operations Storage",
        description: (level: number) =>
            `Upgrade core operations storage to safely store an additional +200 units. Enhanced containment systems and improved diagnostics ensure stability under increased loads.`,
        costs: [
            { resourceType: "energy", amount: 150 },
            { resourceType: "fuel", amount: 100 },
            { resourceType: "solarPlasma", amount: 40 }
        ],
        baseCostMultiplier: 1.15,
        level: 0,
    },
    {
        id: "core_operations_efficiency",
        title: "Core Operations Efficiency",
        description: (level: number) =>
            `Refine and streamline the ship's core operational subsystems. Each level increases ALL resource generation efficiency by 20% (multiplicative). Current level: ${level}, total efficiency boost: ${level === 0 ? 0 : ((Math.pow(1.05, level) - 1) * 100).toFixed(1)}%`,
        costs: [
            { resourceType: "energy", amount: 50 },
            { resourceType: "fuel", amount: 100 },
        ],
        baseCostMultiplier: 1.5,
        level: 0,
    },
    // Add more upgrades here

    // RESEARCH LABORATORY UPGRADES
    {
        id: "research_lab",
        title: "Research Laboratory",
        description: (level) =>
            `Establish a dedicated research facility. Level ${level + 1} allows ${(level + 1)} concurrent research projects and reduces research time by ${level * 10}%.`,
        costs: [
            { resourceType: "energy", amount: 2000 },
            { resourceType: "fuel", amount: 1500 },
            { resourceType: "solarPlasma", amount: 1000 },
            { resourceType: "alloys", amount: 300 }
        ],
        baseCostMultiplier: 2.0,
        level: 0,
    },
    {
        id: "advanced_materials",
        title: "Advanced Materials Research",
        description: (level) =>
            `Research exotic materials and composites. Level ${level + 1} unlocks new weapon and ship components, increasing efficiency by ${level * 15}%.`,
        costs: [
            { resourceType: "energy", amount: 3000 },
            { resourceType: "alloys", amount: 800 },
            { resourceType: "darkMatter", amount: 200 }
        ],
        baseCostMultiplier: 1.8,
        level: 0,
    },
    {
        id: "quantum_computing",
        title: "Quantum Computing",
        description: (level) =>
            `Develop quantum processors for advanced calculations. Level ${level + 1} increases all resource generation by ${level * 5}% and unlocks AI automation.`,
        costs: [
            { resourceType: "energy", amount: 4000 },
            { resourceType: "solarPlasma", amount: 2000 },
            { resourceType: "frozenHydrogen", amount: 500 }
        ],
        baseCostMultiplier: 2.2,
        level: 0,
    },

    // FLEET AUTOMATION UPGRADES
    {
        id: "automated_mining",
        title: "Automated Mining Networks",
        description: (level) =>
            `Deploy AI-controlled mining operations. Level ${level + 1} allows mining drones to operate ${level * 20}% more efficiently without direct oversight.`,
        costs: [
            { resourceType: "energy", amount: 5000 },
            { resourceType: "alloys", amount: 1200 },
            { resourceType: "tokens", amount: 100 }
        ],
        baseCostMultiplier: 1.6,
        level: 0,
    },
    {
        id: "fleet_ai",
        title: "Fleet AI Coordination",
        description: (level) =>
            `Implement advanced fleet coordination protocols. Level ${level + 1} increases all drone effectiveness by ${level * 10}% and reduces operational costs.`,
        costs: [
            { resourceType: "energy", amount: 6000 },
            { resourceType: "darkMatter", amount: 400 },
            { resourceType: "tokens", amount: 200 }
        ],
        baseCostMultiplier: 1.9,
        level: 0,
    },

    // DIPLOMATIC & TRADING UPGRADES
    {
        id: "trading_post",
        title: "Trading Post",
        description: (level) =>
            `Establish trading relationships with alien factions. Level ${level + 1} unlocks ${(level + 1) * 2} new trade routes and increases profit margins by ${level * 15}%.`,
        costs: [
            { resourceType: "tokens", amount: 500 },
            { resourceType: "alloys", amount: 800 },
            { resourceType: "fuel", amount: 2000 }
        ],
        baseCostMultiplier: 1.4,
        level: 0,
    },
    {
        id: "diplomatic_immunity",
        title: "Diplomatic Immunity",
        description: (level) =>
            `Establish formal diplomatic relations. Level ${level + 1} reduces pirate encounters by ${level * 25}% and unlocks peaceful faction missions.`,
        costs: [
            { resourceType: "tokens", amount: 1000 },
            { resourceType: "energy", amount: 3000 }
        ],
        baseCostMultiplier: 1.3,
        level: 0,
    },

    // BASE BUILDING UPGRADES
    {
        id: "station_modules",
        title: "Space Station Modules",
        description: (level) =>
            `Expand your space station capabilities. Level ${level + 1} adds ${(level + 1)} module slots for specialized facilities like refineries and shipyards.`,
        costs: [
            { resourceType: "alloys", amount: 2000 },
            { resourceType: "energy", amount: 8000 },
            { resourceType: "solarPlasma", amount: 1500 }
        ],
        baseCostMultiplier: 2.1,
        level: 0,
    },
    {
        id: "defensive_platforms",
        title: "Defensive Platforms",
        description: (level) =>
            `Deploy automated defense systems. Level ${level + 1} provides ${level * 50} defense rating and deters pirate attacks on your installations.`,
        costs: [
            { resourceType: "alloys", amount: 1500 },
            { resourceType: "frozenHydrogen", amount: 800 },
            { resourceType: "tokens", amount: 300 }
        ],
        baseCostMultiplier: 1.7,
        level: 0,
    },

    // MEGA-STRUCTURE UPGRADES
    {
        id: "stellar_manipulation",
        title: "Stellar Engineering",
        description: (level) =>
            `Harness the power of entire stars. Level ${level + 1} allows construction of ${(level + 1)} Dyson sphere components, multiplying energy generation by ${(level + 1) * 10}x.`,
        costs: [
            { resourceType: "energy", amount: 50000 },
            { resourceType: "alloys", amount: 10000 },
            { resourceType: "darkMatter", amount: 2000 },
            { resourceType: "tokens", amount: 5000 }
        ],
        baseCostMultiplier: 3.0,
        level: 0,
    }
];

export default initialUpgradeList;
