// src/data/achievements.ts
export interface Achievement {
    id: string;
    title: string;
    description: string;
    resourceGoals?: Record<string, number>; // Maps resource names to required amounts (optional)
    upgradeGoals?: Record<string, number>; // Maps upgrade IDs to required levels (optional)
    progress: {
        resources?: Record<string, number>; // Tracks current progress for each resource
        upgrades?: Record<string, number>; // Tracks current progress for each upgrade
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
        id: "gather_dark_matter_and_fuel",
        title: "Resource Collector",
        description: "Gather 10 Dark Matter and 10 Fuel.",
        resourceGoals: {
            darkMatter: 10,
            fuel: 10,
        },
        progress: {
            resources: {
                darkMatter: 0,
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
    // Additional achievements
];

export default achievements;
