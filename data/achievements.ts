
export interface IAchievement {
    id: string;
    title: string;
    description: string;
    resourceGoals?: Record<string, number>;
    upgradeGoals?: Record<string, number>;
    shipGoals?: Record<string, number>;
    progress?: {
        resources?: Record<string, number>;
        upgrades?: Record<string, number>;
        ships?: Record<string, number>;
    };
    story: string;
    unlocks: string[];
    completed: boolean;
    onComplete: () => void;
}

const achievements: IAchievement[] = [
    {
        id: "gather_100_energy",
        title: "Energy Pioneer",
        description: "Gather 100 Energy to unlock Reactor Optimization upgrades.",
        resourceGoals: {
            energy: 100,
        },
        progress: {
            resources: {
                energy: 0,
            },
        },
        story: `Your ship's systems spark to life as you gather the first units of energy. The reactor's hum grows steady, and you feel a sense of accomplishment. This is just the beginning of your journey to rebuild the ship's power core.`,
        unlocks: [""],
        completed: false,
        onComplete: () => {
            console.log("Energy Pioneer achievement completed!");
        },
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
        story: `The ship's tanks begin to fill with fuel, a lifeblood that promises movement and exploration. As the reserves increase, the navigation systems flicker to life, urging you to venture further into the unknown.`,
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
            reactor_storage: 1,
        },
        progress: {
            upgrades: {
                reactor_storage: 0,
            },
        },
        story: `With improved reactor storage, the ship feels alive. Power surges through the systems, and dormant modules begin to hum softly. The AI interface hints at greater upgrades awaiting your command.`,
        unlocks: ["reactor_optimization"],
        completed: false,
        onComplete: () => {
            console.log("Reactor storage upgrade achievement completed!");
        },
    },
    {
        id: "upgrade_reactor_optimization",
        title: "Automated Systems",
        description: "Optimize your reactor to generate more Energy.",
        upgradeGoals: {
            reactor_optimization: 5,
        },
        progress: {
            upgrades: {
                reactor_optimization: 0,
            },
        },
        story: `Your reactor now operates at peak efficiency, generating energy with precision. The ship's AI acknowledges your success, suggesting new pathways to explore and new resources to uncover.`,
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
            core_operations_efficiency: 1,
        },
        progress: {
            upgrades: {
                core_operations_efficiency: 0,
            },
        },
        story: `As core operations become streamlined, resource generation reaches unprecedented levels. The AI announces the detection of a nearby star, sparking a new era of exploration and discovery.`,
        unlocks: ["core_operations_storage"],
        completed: false,
        onComplete: () => {
            console.log("Core Operations Efficiency upgrade achievement completed!");
        },
    },
    {
        id: "upgrade_core_operations_storage",
        title: "Increase Core Operations Storage",
        description: "Upgrade your core operations storage to store more resources.",
        upgradeGoals: {
            core_operations_storage: 2,
        },
        progress: {
            upgrades: {
                core_operations_storage: 0,
            },
        },
        story: `Storage upgrades completed. The ship’s capacity to hold vital resources now allows for extended missions. The AI suggests building scanning drones to chart nearby star systems for potential riches.`,
        unlocks: ["drones_crafting"],
        completed: false,
        onComplete: () => {
            console.log("Core Operations Storage upgrade achievement completed!");
        },
    },
    {
        id: "build_scanning_drones",
        title: "Exploration is Key to Survival",
        description: "Build 5 Scanning Drones to start exploring the galaxies.",
        shipGoals: {
            scanningDrones: 5,
        },
        progress: {
            ships: {
                scanningDrones: 0,
            },
        },
        story: `With scanning drones assembled, your ship detects faint energy signals in distant galaxies. The onboard AI suggests deploying these drones to uncover nearby asteroid fields rich in untapped resources.`,
        unlocks: ["asteroid_scanning"],
        completed: false,
        onComplete: () => {
            console.log("Exploration is key to survival achievement completed!");
        },
    },
    {
        id: "find_an_asteroid",
        title: "Asteroid Hunter",
        description: "Find a resourceful asteroid using Scanning Drones.",
        story: `An asteroid has been detected, pulsating with precious resources. Your scanners indicate this will be a key turning point in your survival. Deploy mining drones to harvest its bounty.`,
        unlocks: ["mining_drones"],
        completed: false,
        onComplete: () => {
            console.log("Asteroid Hunter achievement completed!");
        },
    },
    {
        id: "build_mining_drones",
        title: "Mining Operations",
        description: "Build 2 Mining Drones to start mining the asteroid you found.",
        shipGoals: {
            miningDrones: 2,
        },
        progress: {
            ships: {
                miningDrones: 0,
            },
        },
        story: `Mining drones deploy seamlessly onto the asteroid’s surface, extracting vital resources. The ship's AI commends your ingenuity, hinting at the vast potential for automation.`,
        unlocks: [""],
        completed: false,
        onComplete: () => {
            console.log("Mining Operations achievement completed!");
        },
    },
];

export default achievements;
