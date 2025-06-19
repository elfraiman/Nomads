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

// Linear progression principles for achievements:
// Early game: 1-5 units (5-15 minutes)
// Mid game: 5-15 units (15-45 minutes)  
// Late game: 15-50 units (45-120 minutes)
// Balanced progression that doesn't create walls

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
        story: `The ship's systems spark to life as you gather the first units of Energy. The reactor's hum grows steady, and you feel a sense of accomplishment. This is just the beginning of your journey to rebuild the ship's power core.
        
        YOU CAN NOW REFINE ENERGY INTO FUEL`,
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
        story: `The ship's tanks begin to fill with fuel, a lifeblood that promises movement and exploration. As the reserves increase, the navigation systems flicker to life, urging you to venture further into the unknown.
        
        YOU CAN NOW INCREASE YOUR REACTOR STORAGE`,
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
        story: `With improved reactor storage, the ship feels alive. Power surges through the systems, and dormant modules begin to hum softly. The interface hints at greater upgrades awaiting your command.
        
        YOU CAN NOW OPTIMIZE YOUR REACTOR`,
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
            reactor_optimization: 3, // Reduced from 5 to 3 for linear progression
        },
        progress: {
            upgrades: {
                reactor_optimization: 0,
            },
        },
        story: `Your reactor now operates at increased efficiency, generating resources with precision, but you also notice there's room for many more types of resources yet to be discovered
       
        YOU CAN NOW UPGRADE CORE OPERATIONS EFFICIENCY`,
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
        story: `As core operations become streamlined, resource generation reaches unprecedented levels. The ships systems are rebooting and our scanning radar is picking up a nearby Sun, rich in solar plasma. Harvesting this resource could unlock new upgrades and technologies. 
        Luckily our ship is already equipped with a solar plasma collector that seems to function, though, not optimally.
        
        YOU CAN NOW HARVEST SOLAR PLASMA`,
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
        story: `Storage upgrades completed. The ship's capacity to hold vital resources now allows for extended missions. The AI suggests building scanning drones to chart nearby star systems for potential riches.`,
        unlocks: ["drones_crafting"],
        completed: false,
        onComplete: () => {
            console.log("Core Operations Storage upgrade achievement completed!");
        },
    },
    {
        id: "build_scanning_drones",
        title: "Exploration is Key to Survival",
        description: "Build 1 Scanning Drone to start exploring the galaxies.",
        shipGoals: {
            scanningDrones: 1,
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
        description: "Build a Mining Drone to start mining the asteroid you found.",
        shipGoals: {
            miningDrones: 1,
        },
        progress: {
            ships: {
                miningDrones: 0,
            },
        },
        story: `Mining drones deploy seamlessly onto the asteroid's surface, extracting vital resources. The ship's AI commends your ingenuity, hinting at the vast potential for automation.`,
        unlocks: ["light_plasma_blaster"],
        completed: false,
        onComplete: () => {
            console.log("Mining Operations achievement completed!");
        },
    },
    {
        id: "enter_a_planet",
        title: "Planetary Exploration",
        description: "Enter a planet's orbit.. but, be careful..",
        story: `You've encountered Pirates for the first time.`,
        unlocks: [""],
        completed: false,
        onComplete: () => {
            console.log("Asteroid Hunter achievement completed!");
        },
    },
    {
        id: "unlock_research_lab",
        title: "Scientific Pioneer",
        description: "Gather 1200 Energy, 800 Fuel, and 500 Solar Plasma to establish a Research Laboratory.", // Reduced from 2000/1500/1000
        resourceGoals: {
            energy: 1200,
            fuel: 800,
            solarPlasma: 500,
        },
        progress: {
            resources: {
                energy: 0,
                fuel: 0,
                solarPlasma: 0,
            },
        },
        story: `The ship's AI has identified patterns in the cosmic background radiation suggesting advanced technologies. A dedicated research laboratory could unlock the secrets of these ancient civilizations.
        
        RESEARCH LABORATORY UNLOCKED - Begin technological advancement`,
        unlocks: ["research_lab", "basic_research"],
        completed: false,
        onComplete: () => {
            console.log("Research Laboratory unlocked!");
        },
    },
    {
        id: "complete_first_research",
        title: "Technological Breakthrough",
        description: "Complete your first research project in the laboratory.",
        story: `First breakthrough achieved! Your research lab hums with activity as new technologies become available. The universe holds many more secrets to uncover.
        
        ADVANCED RESEARCH PROJECTS UNLOCKED`,
        unlocks: ["advanced_materials", "quantum_computing", "exotic_physics"],
        completed: false,
        onComplete: () => {
            console.log("First research completed!");
        },
    },
    {
        id: "drone_fleet_commander",
        title: "Fleet Commander",
        description: "Build 8 drones of any type combined.", // Reduced from 50 to 8 for balanced progression
        shipGoals: {
            totalDrones: 8,
        },
        progress: {
            ships: {
                totalDrones: 0,
            },
        },
        story: `Your drone fleet has grown substantial. The AI suggests implementing automated fleet coordination protocols for enhanced efficiency.
        
        AUTOMATED MINING NETWORKS & FLEET AI UNLOCKED`,
        unlocks: ["automated_mining", "fleet_ai", "drone_specialization"],
        completed: false,
        onComplete: () => {
            console.log("Fleet Commander achievement completed!");
        },
    },
    {
        id: "establish_mining_network",
        title: "Mining Magnate",
        description: "Have 3 asteroids being mined simultaneously.", // Reduced from 5 to 3
        story: `Multiple mining operations running in parallel. You're becoming a true space industrialist with operations spanning multiple star systems.
        
        ASTEROID PROCESSING FACILITY & DEEP SPACE SCANNING UNLOCKED`,
        unlocks: ["asteroid_processing", "deep_space_scanning", "resource_monopoly"],
        completed: false,
        onComplete: () => {
            console.log("Mining Magnate achievement completed!");
        },
    },
    {
        id: "first_diplomatic_contact",
        title: "Galactic Diplomat",
        description: "Establish peaceful contact with a neutral faction.",
        story: `You've made first contact with the Stellar Merchants Guild. They're impressed by your growing fleet and offer exclusive trading opportunities.
        
        TRADING POST & FACTION MISSIONS UNLOCKED`,
        unlocks: ["trading_post", "faction_missions", "diplomatic_immunity"],
        completed: false,
        onComplete: () => {
            console.log("First diplomatic contact achieved!");
        },
    },
    {
        id: "trade_empire",
        title: "Trade Baron",
        description: "Complete 12 successful trade transactions.", // Reduced from 25 to 12
        story: `Your reputation as a reliable trader spreads across known space. Exclusive contracts and rare resources are now within your reach.
        
        EXCLUSIVE TRADE ROUTES & MERCHANT ESCORTS UNLOCKED`,
        unlocks: ["exclusive_contracts", "trade_routes", "merchant_protection"],
        completed: false,
        onComplete: () => {
            console.log("Trade Baron achievement completed!");
        },
    },
    {
        id: "space_station_constructor",
        title: "Station Builder",
        description: "Build your first permanent Space Station.",
        story: `Your mobile base of operations is complete. This stationary platform will serve as a hub for advanced manufacturing and research operations.
        
        STATION MODULES & DEFENSIVE SYSTEMS UNLOCKED`,
        unlocks: ["station_modules", "defensive_platforms", "advanced_manufacturing"],
        completed: false,
        onComplete: () => {
            console.log("Space Station constructed!");
        },
    },
    {
        id: "stellar_engineer",
        title: "Stellar Engineer",
        description: "Construct a Dyson Sphere component around a star.",
        story: `You've begun harnessing the power of an entire star. This megastructure represents the pinnacle of technological achievement.
        
        STELLAR MANIPULATION & GALAXY RESHAPING UNLOCKED`,
        unlocks: ["stellar_manipulation", "galaxy_control", "cosmic_architect"],
        completed: false,
        onComplete: () => {
            console.log("Stellar Engineer achievement completed!");
        },
    },
    {
        id: "galactic_emperor",
        title: "Galactic Emperor",
        description: "Control 5 star systems and maintain diplomatic relations with 3 factions.", // Reduced from 10/5 to 5/3
        story: `Your influence spans multiple star systems. Lesser civilizations bow before your technological superiority and diplomatic prowess.
        
        PRESTIGE RESET SYSTEM UNLOCKED - Transcend to a higher plane of existence`,
        unlocks: ["prestige_reset", "cosmic_transcendence"],
        completed: false,
        onComplete: () => {
            console.log("Galactic Emperor achievement completed!");
        },
    },
    {
        id: "pirate_hunter",
        title: "Pirate Hunter",
        description: "Defeat 25 pirates in combat.", // Reduced from 100 to 25
        story: `Your reputation as a formidable combatant spreads through pirate networks. They now think twice before engaging your fleet.
        
        BOUNTY SYSTEM & PIRATE FACTION MISSIONS UNLOCKED`,
        unlocks: ["bounty_hunting", "pirate_faction_missions", "combat_mastery"],
        completed: false,
        onComplete: () => {
            console.log("Pirate Hunter achievement completed!");
        },
    },
    {
        id: "first_merchant_encounter",
        title: "Galactic Merchant",
        description: "Encounter your first merchant in space and make a trade.",
        story: `A mysterious merchant vessel has appeared in your vicinity! These wandering traders travel between galaxies, offering rare weapons and resources for trade. They don't stay in one place for long, so make your deals quickly.
        
        MERCHANT TRADING SYSTEM UNLOCKED - Keep an eye out for merchants in your exploration!`,
        unlocks: ["merchant_beacon"],
        completed: false,
        onComplete: () => {
            console.log("First merchant encounter achievement completed!");
        },
    },
    {
        id: "deep_space_explorer",
        title: "Deep Space Explorer",
        description: "Discover 8 unique astronomical phenomena.", // Reduced from 20 to 8
        story: `You've encountered wonders beyond imagination: neutron stars, black holes, and ancient alien artifacts. Each discovery adds to your cosmic understanding.
        
        EXOTIC PHENOMENA RESEARCH & ARTIFACT ANALYSIS UNLOCKED`,
        unlocks: ["phenomenon_research", "artifact_analysis", "cosmic_mysteries"],
        completed: false,
        onComplete: () => {
            console.log("Deep Space Explorer achievement completed!");
        },
    },

    // Additional balanced achievements for smooth progression
    {
        id: "resource_hoarder",
        title: "Resource Hoarder",
        description: "Accumulate 1000 Energy, 600 Fuel, and 400 Solar Plasma simultaneously.",
        resourceGoals: {
            energy: 1000,
            fuel: 600,
            solarPlasma: 400,
        },
        progress: {
            resources: {
                energy: 0,
                fuel: 0,
                solarPlasma: 0,
            },
        },
        story: `Your resource management skills have reached impressive levels. The ship's storage systems are operating at near capacity.
        
        ADVANCED STORAGE TECHNOLOGIES UNLOCKED`,
        unlocks: ["advanced_storage", "resource_optimization"],
        completed: false,
        onComplete: () => {
            console.log("Resource Hoarder achievement completed!");
        },
    },
    {
        id: "combat_veteran",
        title: "Combat Veteran",
        description: "Win 10 combat encounters without losing a weapon.",
        story: `Your tactical prowess in combat is becoming legendary. Enemy factions are beginning to fear your approach.
        
        ADVANCED COMBAT TACTICS & WEAPON MODIFICATIONS UNLOCKED`,
        unlocks: ["combat_tactics", "weapon_modifications", "tactical_analysis"],
        completed: false,
        onComplete: () => {
            console.log("Combat Veteran achievement completed!");
        },
    },
    {
        id: "technology_master",
        title: "Technology Master",
        description: "Complete 5 different research projects.",
        story: `Your technological advancement is accelerating rapidly. The universe's secrets are beginning to unfold before you.
        
        BREAKTHROUGH RESEARCH & EXOTIC TECHNOLOGIES UNLOCKED`,
        unlocks: ["breakthrough_research", "exotic_technologies", "advanced_automation"],
        completed: false,
        onComplete: () => {
            console.log("Technology Master achievement completed!");
        },
    },
];

export default achievements;
