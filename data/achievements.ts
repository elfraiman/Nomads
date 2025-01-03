// src/data/achievements.ts
export interface Achievement {
    id: string;
    title: string;
    description: string;
    resourceGoals?: Record<string, number>; // Maps resource names to required amounts (optional)
    upgradeGoals?: Record<string, number>; // Maps upgrade IDs to required levels (optional)
    shipGoals?: Record<string, number>; // Maps ship types to required counts (optional)
    progress: {
        resources?: Record<string, number>; // Tracks current progress for each resource
        upgrades?: Record<string, number>; // Tracks current progress for each upgrade
        ships?: Record<string, number>; // Tracks current progress for each ship type
    };
    story: string;
    unlocks: string[]; // List of upgrades this achievement unlocks
    completed?: boolean; // Indicates whether the achievement is completed
    onComplete: () => void;
}



const achievements: Achievement[] = [
    {
        id: "gather_100_energy",
        title: "Energy Pioneer",
        description: "Gather 100 Energy to unlock Reactor Optimization upgrades.",
        resourceGoals: {
            energy: 100
        },
        progress: {
            resources: {
                energy: 0
            }
        },
        story: "As you gather the first 100 units of energy, the ship's reactor begins to hum steadily. New possibilities emerge as the ship's systems stabilize.",
        unlocks: [""],
        completed: false,
        onComplete: () => { console.log("Energy Pioneer achievement completed!"); },
    },
    {
        id: "gather_fuel",
        title: "Resource Collector",
        description: "Gather 100 Fuel.",
        resourceGoals: {
            fuel: 100,
        },
        progress: {
            resources: {
                fuel: 0,
            },
        },
        story: "You've successfully collected critical resources to stabilize your operations.",
        completed: false,
        unlocks: ["reactor_storage"],
        onComplete: () => {
            console.log("Reactor Storage upgrade unlocked!");
        },
    },
    {
        id: "upgrade_reactor_storage",
        title: "Energy Baron",
        description: "Upgrade your reactor storage to unlock Reactor Optimization upgrades.",
        upgradeGoals: {
            reactor_storage: 1, // Requires at least 1 level of reactor storage upgrade
        },
        progress: {
            upgrades: {
                reactor_storage: 0,
            },
        },
        story: "Your reactor's increased capacity allows you to sustain more complex operations, paving the way for further optimizations.",
        unlocks: ["reactor_optimization"],
        completed: false,
        onComplete: () => {
            console.log("Reactor storage upgrade achievement completed!");
        },
    },
    {
        id: "upgrade_reactor_optimization",
        title: "Automated systems",
        description: "Optimize your reactor to generate more Energy.",
        upgradeGoals: {
            reactor_optimization: 5,
        },
        progress: {
            upgrades: {
                reactor_optimization: 0,
            },
        },
        story: `Your reactor's increased automation allows you to generate more energy with less waste, improving overall efficiency and allowing you to focus on becoming more efficient.
        You have now unlocked the Core Operations Efficiency upgrade.`,
        unlocks: ["core_operations_efficiency"],
        completed: false,
        onComplete: () => {
            console.log("Reactor optimization upgrade achievement completed!");
        },
    },
    {
        id: "upgrade_core_operations_efficiency",
        title: "Increase Core Operations Efficiency",
        description: "Upgrade your core operations to increase resource generation.",
        upgradeGoals: {
            core_operations_efficiency: 1, // Requires at least 3 level of reactor storage upgrade
        },
        progress: {
            upgrades: {
                core_operations_efficiency: 0,
            },
        },
        story: `Your core operations have been optimized to increase resource generation. You are now able to generate more resources.
        You ship has detected a Sun and you decide to explore it, detecting a new star system and the ability to harvest Solar Plasma`,
        unlocks: ["core_operations_storage"],
        completed: false,
        onComplete: () => {
            console.log("Core Operations Efficiency upgrade achievement completed!");
        },
    },
    {
        id: "upgrade_core_operations_storage",
        title: "Increase Core Operations Storage",
        description: "Upgrade your core operations storage to core resources storage.",
        upgradeGoals: {
            core_operations_storage: 2, // Requires at least 3 level of reactor storage upgrade
        },
        progress: {
            upgrades: {
                core_operations_storage: 0,
            },
        },
        story: `Since our ship can now safely generate more resources and store them, we can now build drones to help us explore the universe. 
        You have now unlocked the Drone Crafting & Asteroid scanning.`,
        unlocks: ["drones_crafting"],
        completed: false,
        onComplete: () => {
            console.log("Core Operations Storage upgrade achievement completed!");
        },
    },
    {
        id: "upgrade_core_operations_storage",
        title: "Increase Core Operations Storage",
        description: "Upgrade your core operations storage to core resources storage.",
        upgradeGoals: {
            core_operations_storage: 2,
        },
        progress: {
            upgrades: {
                core_operations_storage: 0,
            },
        },
        story: `Since our ship can now safely generate more resources and store them, we can now build Scanning Drones to help us explore the universe. 
        You have now unlocked the Drone Crafting & Asteroid scanning.`,
        unlocks: ["drones_crafting"],
        completed: false,
        onComplete: () => {
            console.log("Core Operations Storage upgrade achievement completed!");
        },
    },
    {
        id: "build_scanning_drones",
        title: "Exploration is key to survival",
        description: "Build 5 Exploration Drones to start exploring the galaxies.",
        shipGoals: {
            scanningDrones: 5,
        },
        progress: {
            ships: {
                scanningDrones: 0,
            },
        },
        story: "With a fleet of Scanning drones, you can efficiently explore the galaxies for asteroids.",
        unlocks: ["asteroid_scanning"],
        completed: false,
        onComplete: () => {
            console.log("Exploration is key to survival achievement completed!");
        },
    },
    // Additional achievements
];

export default achievements;
