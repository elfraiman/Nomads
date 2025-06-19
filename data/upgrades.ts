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
    baseCostMultiplier: number; // Triangle number progression factor
    level: number;
}

// Triangle number progression: cost = baseCost * (level * (level + 1)) / 2
// This provides balanced linear progression with predictable scaling

const initialUpgradeList: Upgrade[] = [
    {
        id: "reactor_optimization",
        title: "Reactor Optimization",
        description: (level) =>
            `Optimize your reactor's energy conversion efficiency. Level ${level + 1} enhances energy output by ${((level + 1) * 0.3).toFixed(2)} unit(s) per second, reducing wastage and maximizing core performance.`,
        costs: [
            { resourceType: "energy", amount: 50 }
        ],
        baseCostMultiplier: 1.15, // Triangle number scaling
        level: 0,
    },
    {
        id: "reactor_storage",
        title: "Reactor Storage",
        description: (level) =>
            `Enhance reactor containment systems to safely store an additional +150 units of energy. Improved insulation and reinforced capacitors ensure stability under increased loads.`,
        costs: [
            { resourceType: "energy", amount: 75 },
            { resourceType: "fuel", amount: 50 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "core_operations_storage",
        title: "Core Operations Storage",
        description: (level: number) =>
            `Upgrade core operations storage to safely store an additional +250 units. Enhanced containment systems and improved diagnostics ensure stability under increased loads.`,
        costs: [
            { resourceType: "energy", amount: 120 },
            { resourceType: "fuel", amount: 80 },
            { resourceType: "solarPlasma", amount: 40 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "core_operations_efficiency",
        title: "Core Operations Efficiency",
        description: (level: number) =>
            `Refine and streamline the ship's core operational subsystems. Level ${level + 1} increases ALL resource generation efficiency by ${(level + 1) * 15}%. Current efficiency boost: ${level * 15}%`,
        costs: [
            { resourceType: "energy", amount: 100 },
            { resourceType: "fuel", amount: 75 },
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },

    // RESEARCH LABORATORY UPGRADES
    {
        id: "research_lab",
        title: "Research Laboratory",
        description: (level) =>
            `Establish a dedicated research facility. Level ${level + 1} allows ${(level + 1)} concurrent research projects and reduces research time by ${level * 8}%.`,
        costs: [
            { resourceType: "energy", amount: 800 },
            { resourceType: "fuel", amount: 500 },
            { resourceType: "solarPlasma", amount: 300 },
            { resourceType: "alloys", amount: 100 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "advanced_materials",
        title: "Advanced Materials Research",
        description: (level) =>
            `Research exotic materials and composites. Level ${level + 1} unlocks new weapon and ship components, increasing efficiency by ${level * 12}%.`,
        costs: [
            { resourceType: "energy", amount: 1200 },
            { resourceType: "alloys", amount: 250 },
            { resourceType: "darkMatter", amount: 50 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "quantum_computing",
        title: "Quantum Computing",
        description: (level) =>
            `Develop quantum processors for advanced calculations. Level ${level + 1} increases all resource generation by ${level * 4}% and unlocks AI automation.`,
        costs: [
            { resourceType: "energy", amount: 1500 },
            { resourceType: "solarPlasma", amount: 600 },
            { resourceType: "frozenHydrogen", amount: 150 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },

    // FLEET AUTOMATION UPGRADES
    {
        id: "automated_mining",
        title: "Automated Mining Networks",
        description: (level) =>
            `Deploy AI-controlled mining operations. Level ${level + 1} allows mining drones to operate ${level * 15}% more efficiently without direct oversight.`,
        costs: [
            { resourceType: "energy", amount: 2000 },
            { resourceType: "alloys", amount: 400 },
            { resourceType: "tokens", amount: 25 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "fleet_ai",
        title: "Fleet AI Coordination",
        description: (level) =>
            `Implement advanced fleet coordination protocols. Level ${level + 1} increases all drone effectiveness by ${level * 8}% and reduces operational costs.`,
        costs: [
            { resourceType: "energy", amount: 2500 },
            { resourceType: "darkMatter", amount: 100 },
            { resourceType: "tokens", amount: 50 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },

    // DIPLOMATIC & TRADING UPGRADES
    {
        id: "trading_post",
        title: "Trading Post",
        description: (level) =>
            `Establish trading relationships with alien factions. Level ${level + 1} unlocks ${(level + 1) * 2} new trade routes and increases profit margins by ${level * 12}%.`,
        costs: [
            { resourceType: "tokens", amount: 300 },
            { resourceType: "alloys", amount: 500 },
            { resourceType: "fuel", amount: 1200 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "diplomatic_immunity",
        title: "Diplomatic Immunity",
        description: (level) =>
            `Establish formal diplomatic relations. Level ${level + 1} reduces pirate encounters by ${level * 20}% and unlocks peaceful faction missions.`,
        costs: [
            { resourceType: "tokens", amount: 600 },
            { resourceType: "energy", amount: 2000 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },

    // BASE BUILDING UPGRADES
    {
        id: "station_modules",
        title: "Space Station Modules",
        description: (level) =>
            `Expand your space station capabilities. Level ${level + 1} adds ${(level + 1)} module slots for specialized facilities like refineries and shipyards.`,
        costs: [
            { resourceType: "alloys", amount: 1200 },
            { resourceType: "energy", amount: 5000 },
            { resourceType: "solarPlasma", amount: 800 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "defensive_platforms",
        title: "Defensive Platforms",
        description: (level) =>
            `Deploy automated defense systems. Level ${level + 1} provides ${level * 35} defense rating and deters pirate attacks on your installations.`,
        costs: [
            { resourceType: "alloys", amount: 900 },
            { resourceType: "frozenHydrogen", amount: 500 },
            { resourceType: "tokens", amount: 150 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },

    // MEGA-STRUCTURE UPGRADES
    {
        id: "stellar_manipulation",
        title: "Stellar Engineering",
        description: (level) =>
            `Harness the power of entire stars. Level ${level + 1} allows construction of ${(level + 1)} Dyson sphere components, multiplying energy generation by ${(level + 1) * 8}x.`,
        costs: [
            { resourceType: "energy", amount: 50000 },
            { resourceType: "alloys", amount: 10000 },
            { resourceType: "darkMatter", amount: 2000 },
            { resourceType: "exoticMatter", amount: 500 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "galactic_network",
        title: "Galactic Communication Network",
        description: (level) =>
            `Establish instantaneous communication across the galaxy. Level ${level + 1} unlocks ${(level + 1) * 3} new sectors and reduces travel time by ${level * 10}%.`,
        costs: [
            { resourceType: "energy", amount: 75000 },
            { resourceType: "quantumCores", amount: 1000 },
            { resourceType: "exoticMatter", amount: 800 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },

    // TRANSCENDENCE UPGRADES
    {
        id: "consciousness_transfer",
        title: "Digital Consciousness",
        description: (level) =>
            `Upload consciousness to quantum substrates. Level ${level + 1} allows ${(level + 1)} backup consciousness instances and grants immortality protocols.`,
        costs: [
            { resourceType: "quantumCores", amount: 5000 },
            { resourceType: "exoticMatter", amount: 2000 },
            { resourceType: "darkMatter", amount: 3000 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    },
    {
        id: "reality_manipulation",
        title: "Reality Engineering",
        description: (level) =>
            `Manipulate the fundamental laws of physics. Level ${level + 1} allows creation of ${(level + 1)} pocket universes with custom physical laws.`,
        costs: [
            { resourceType: "exoticMatter", amount: 10000 },
            { resourceType: "darkMatter", amount: 15000 },
            { resourceType: "quantumCores", amount: 8000 }
        ],
        baseCostMultiplier: 1.0,
        level: 0,
    }
];

// Helper function to calculate actual upgrade cost using triangle numbers
export const calculateUpgradeCost = (upgrade: Upgrade, targetLevel: number): UpgradeCost[] => {
    const triangleNumber = (targetLevel * (targetLevel + 1)) / 2;
    return upgrade.costs.map(cost => ({
        resourceType: cost.resourceType,
        amount: Math.floor(cost.amount * triangleNumber * upgrade.baseCostMultiplier)
    }));
};

// Helper function to get total cost from level 0 to target level
export const getTotalUpgradeCost = (upgrade: Upgrade, targetLevel: number): UpgradeCost[] => {
    let totalCosts: { [key: string]: number } = {};

    for (let level = 1; level <= targetLevel; level++) {
        const levelCosts = calculateUpgradeCost(upgrade, level);
        levelCosts.forEach(cost => {
            totalCosts[cost.resourceType] = (totalCosts[cost.resourceType] || 0) + cost.amount;
        });
    }

    return Object.entries(totalCosts).map(([resourceType, amount]) => ({
        resourceType: resourceType as keyof PlayerResources,
        amount
    }));
};

export default initialUpgradeList;
