// src/data/achievements.ts

export interface Achievement {
    id: string;
    title: string;
    description: string;
    resourceGoals: Record<string, number>; // Maps resource names to required amounts
    progress: Record<string, number>; // Tracks current progress for each resource
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
            energy: 0
        },
        story: "As you gather the first 100 units of energy, the ship's reactor begins to hum steadily. New possibilities emerge as the ship's systems stabilize.",
        unlocks: ["reactor_optimization"],
        completed: false,
        onComplete: () => { },
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
            darkMatter: 0,
            fuel: 0,
        },
        story: "You've successfully collected critical resources to stabilize your operations.",
        completed: false,
        unlocks: ["reactor_storage"], // Example upgrade
        onComplete: () => { },
    },
    {
        id: "gather_100_energy",
        title: "Energy Pioneer",
        description: "Gather 100 Energy to unlock Reactor Optimization upgrades.",
        resourceGoals: {
            energy: 100
        },
        progress: {
            energy: 0
        },
        story: "As you gather the first 100 units of energy, the ship's reactor begins to hum steadily. New possibilities emerge as the ship's systems stabilize.",
        unlocks: ["reactor_optimization", "reactor_storage", "core_operations_efficiency"],
        completed: false,
        onComplete: () => { },
    },
    // Additional achievements
];

export default achievements;
