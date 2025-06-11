import { IMission } from "@/utils/defaults";

export const initialMissions: IMission[] = [
  // ==================== TIER 1: BEGINNER MISSIONS ====================
  
  // Basic Exploration
  {
    id: "first_steps",
    title: "First Steps",
    description: "Explore your immediate surroundings and gather basic resources",
    type: "exploration",
    requirements: { 
      energy: 50,
      fuel: 30
    },
    duration: 300, // 5 minutes
    rewards: {
      energy: 100,
      fuel: 80,
      weapons: { "light_pulse_laser": 1 }, // Basic weapon reward
      experience: 50
    },
    difficulty: "Easy",
    repeatable: false,
    completed: false,
    active: false,
    locked: false,
    unlocks: ["basic_combat", "resource_gathering"],
  },
  
  // Basic Combat
  {
    id: "basic_combat",
    title: "First Contact",
    description: "Clear Planet A1 of hostile Nebula Marauders - eliminate 3 pirate ships threatening the mining outpost.\n\n📍 Enemy Location: Planet A1 contains Missile Corvettes and Laser Interceptors from the Nebula Marauders faction.",
    type: "combat",
    requirements: {
      // No requirements - first combat mission
    },
    rewards: {
      energy: 150,
      alloys: 100,
      weapons: { "light_plasma_blaster": 1 },
      experience: 75
    },
    difficulty: "Easy",
    repeatable: true,
    cooldown: 1800, // 30 minutes
    completed: false,
    active: false,
    locked: true,
    unlocks: ["pirate_hunter_1", "space_cleansing"],
    objective: {
      type: "kill",
      target: "Missile Corvette",
      targetAmount: 3,
      currentAmount: 0
    }
  },

  // Basic Resource Gathering
  {
    id: "resource_gathering",
    title: "Resource Gathering",
    description: "Mine asteroids to collect basic materials",
    type: "exploration",
    requirements: {
      energy: 80,
      ships: { miningDrones: 1 }
    },
    duration: 600, // 10 minutes
    rewards: {
      fuel: 200,
      solarPlasma: 100,
      weapons: { "light_railgun": 1 },
      experience: 60
    },
    difficulty: "Easy",
    repeatable: true,
    cooldown: 3600, // 1 hour
    completed: false,
    active: false,
    locked: true,
    unlocks: ["deep_space_survey"],
  },

  // ==================== TIER 2: INTERMEDIATE MISSIONS ====================
  
  // Pirate Hunter Chain
  {
    id: "pirate_hunter_1",
    title: "Pirate Hunter I", 
    description: "Clear the Alpha Centauri sector of Nebula Marauder presence - eliminate 10 pirate ships terrorizing trade routes.\n\n📍 Enemy Location: Planet A1 - Fight Missile Corvettes, Laser Interceptors, and Nebula Ravagers.",
    type: "combat",
    requirements: {
      enemyKills: { "Missile Corvette": 3 }
    },
    rewards: {
      tokens: 200,
      alloys: 300,
      weapons: { "medium_beam_laser": 1, "light_rocket_launcher": 1 },
      experience: 150
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 3600,
    completed: false,
    active: false,
    locked: true,
    unlocks: ["pirate_hunter_2", "bounty_hunter"],
    objective: {
      type: "kill",
      target: "Laser Interceptor",
      targetAmount: 10,
      currentAmount: 0
    }
  },

  {
    id: "pirate_hunter_2",
    title: "Pirate Hunter II",
    description: "Liberate Planet A2 from Void Corsair occupation - eliminate 5 heavily armed pirate vessels.\n\n📍 Enemy Location: Planet A2 (Alpha Centauri) - Fight Stealth Raiders, Ion Saboteurs, and Corsair Warlords from the Void Corsairs faction.",
    type: "combat",
    requirements: {
      enemyKills: { "Laser Interceptor": 10 },
      weapons: { "medium_beam_laser": 1 }
    },
    rewards: {
      tokens: 500,
      alloys: 600,
      weapons: { "medium_plasma_blaster": 1, "medium_missile_launcher": 1 },
      experience: 250
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 5400, // 1.5 hours
    completed: false,
    active: false,
    locked: true,
    unlocks: ["pirate_hunter_3", "assassination_contract"],
    objective: {
      type: "kill",
      target: "Stealth Raider",
      targetAmount: 5,
      currentAmount: 0
    },
    location: "Planet A2 (Alpha Centauri)"
  },

  // Enhanced Exploration
  {
    id: "deep_space_survey",
    title: "Deep Space Survey",
    description: "Explore uncharted sectors with advanced scanning equipment",
    type: "exploration",
    requirements: { 
      energy: 800,
      fuel: 600,
      ships: { scanningDrones: 3 }
    },
    duration: 1800, // 30 minutes
    rewards: {
      researchPoints: 300,
      exoticMatter: 100,
      weapons: { "light_rocket_launcher": 1 },
      experience: 200,
      unlocks: ["advanced_exploration"]
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 7200, // 2 hours
    completed: false,
    active: false,
    locked: true,
  },

  // ==================== TIER 3: ADVANCED MISSIONS ====================
  {
    id: "pirate_hunter_3",
    title: "Pirate Hunter III",
    description: "Retake Planet A3 from Star Scavenger control - destroy 3 elite pirate warships blocking system access.\n\n📍 Enemy Location: Planet A3 (Alpha Centauri) - Fight Salvage Fighters, Repurposed Frigates, and Scavenger Overseers from the Star Scavengers faction.",
    type: "combat",
    requirements: {
      enemyKills: { "Stealth Raider": 5 },
      weapons: { "medium_plasma_blaster": 1 }
    },
    rewards: {
      tokens: 1000,
      alloys: 1200,
      weapons: { "heavy_beam_laser": 1, "medium_railgun": 1 },
      experience: 400
    },
    difficulty: "Hard",
    repeatable: true,
    cooldown: 7200, // 2 hours
    completed: false,
    active: false,
    locked: true,
    unlocks: ["elite_hunter", "last_stand"],
    objective: {
      type: "kill",
      target: "Salvage Fighter",
      targetAmount: 3,
      currentAmount: 0
    },
    location: "Planet A3 (Alpha Centauri)"
  },

  {
    id: "advanced_exploration",
    title: "Quantum Anomaly Investigation",
    description: "Investigate dangerous quantum anomalies in deep space",
    type: "exploration",
    requirements: {
      energy: 1500,
      fuel: 1000,
      ships: { scanningDrones: 5 }
    },
    duration: 3600, // 1 hour
    rewards: {
      quantumCores: 50,
      exoticMatter: 200,
      weapons: { "heavy_plasma_blaster": 1 },
      experience: 350,
      unlocks: ["artifact_hunt"]
    },
    difficulty: "Hard",
    repeatable: true,
    cooldown: 10800, // 3 hours
    completed: false,
    active: false,
    locked: true,
  },

  {
    id: "artifact_hunt",
    title: "Ancient Artifact Hunt",
    description: "Search for powerful ancient artifacts in forgotten ruins",
    type: "exploration",
    requirements: {
      energy: 2000,
      fuel: 1500,
      ships: { scanningDrones: 8 }
    },
    duration: 5400, // 1.5 hours
    rewards: {
      ancientArtifacts: 3,
      researchPoints: 800,
      weapons: { "heavy_torpedo_launcher": 1, "heavy_railgun": 1 },
      experience: 500
    },
    difficulty: "Hard",
    repeatable: true,
    cooldown: 14400, // 4 hours
    completed: false,
    active: false,
    locked: true,
    unlocks: ["legendary_hunt"],
  },

  // ==================== TIER 4: ELITE MISSIONS ====================

  {
    id: "elite_hunter", 
    title: "Elite Hunter",
    description: "Assault Planet A4 and eliminate 2 Titan Vanguard dreadnoughts - the most dangerous enemy ships in the system.\n\n📍 Enemy Location: Planet A4 (Alpha Centauri) - Fight Titan Enforcers, Shieldbreaker Cruisers, and Titan Dreadnoughts from the Titan Vanguard faction.",
    type: "combat",
    requirements: {
      enemyKills: { "Salvage Fighter": 3 },
      weapons: { "heavy_beam_laser": 1, "medium_railgun": 1 }
    },
    rewards: {
      tokens: 2500,
      alloys: 2000,
      weapons: { "heavy_railgun": 2, "heavy_torpedo_launcher": 1 },
      experience: 800
    },
    difficulty: "Extreme",
    repeatable: true,
    cooldown: 14400, // 4 hours
    completed: false,
    active: false,
    locked: true,
    unlocks: ["legendary_hunt"],
    objective: {
      type: "kill",
      target: "Titan Enforcer",
      targetAmount: 2,
      currentAmount: 0
    },
    location: "Planet A4 (Alpha Centauri)"
  },

  {
    id: "legendary_hunt",
    title: "Legendary Hunt",
    description: "Track down and eliminate the legendary Void Admiral in his hidden fortress - destroy the most feared pirate in the galaxy.\n\n📍 Enemy Location: Planet A4 (Alpha Centauri) - Face the ultimate Titan Vanguard commander.",
    type: "combat",
    requirements: {
      enemyKills: { "Titan Enforcer": 2 },
      weapons: { "heavy_railgun": 1, "heavy_torpedo_launcher": 1 }
    },
    rewards: {
      tokens: 5000,
      alloys: 3000,
      quantumCores: 100,
      weapons: { "heavy_railgun": 3, "heavy_torpedo_launcher": 2 },
      experience: 1500
    },
    difficulty: "Extreme",
    repeatable: false, // Unique legendary mission
    completed: false,
    active: false,
    locked: true,
    objective: {
      type: "kill",
      target: "Vanguard Battleship",
      targetAmount: 1,
      currentAmount: 0
    },
    location: "Planet A4 (Alpha Centauri)"
  },

  // ==================== ADDITIONAL COMBAT MISSIONS ====================

  {
    id: "space_cleansing",
    title: "Space Cleansing Operation", 
    description: "Systematically clear the Alpha Centauri system of all pirate presence - eliminate 15 mixed enemy ships hiding among the planets.\n\n📍 Enemy Location: Planets A1, A2, and A3 (Alpha Centauri) - Fight pirates from multiple factions across the system.",
    type: "combat",
    requirements: {
      enemyKills: { "Missile Corvette": 3 },
      weapons: { "light_plasma_blaster": 1 }
    },
    rewards: {
      tokens: 600,
      alloys: 400,
      weapons: { "medium_missile_launcher": 1, "light_railgun": 1 },
      experience: 200
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 4800, // 1.33 hours
    completed: false,
    active: false,
    locked: true,
    unlocks: ["pirate_stronghold"],
    objective: {
      type: "kill",
      target: "Laser Interceptor", // Kill Laser Interceptors from Planet A1
      targetAmount: 15,
      currentAmount: 0
    },
    location: "Planets A1, A2, and A3 (Alpha Centauri)"
  },

  {
    id: "pirate_stronghold",
    title: "Pirate Stronghold Assault",
    description: "Storm the heavily fortified pirate base on Planet A3 - eliminate 8 Star Scavenger defenders to capture the stronghold.\n\n📍 Enemy Location: Planet A3 (Alpha Centauri) - Fight Salvage Fighters, Repurposed Frigates, and Scavenger Overseers.",
    type: "combat",
    requirements: {
      enemyKills: { "Laser Interceptor": 15 },
      weapons: { "medium_missile_launcher": 1, "medium_beam_laser": 1 }
    },
    rewards: {
      tokens: 1200,
      alloys: 800,
      exoticMatter: 50,
      weapons: { "heavy_beam_laser": 1, "medium_railgun": 1 },
      experience: 400
    },
    difficulty: "Hard",
    repeatable: true,
    cooldown: 7200, // 2 hours
    completed: false,
    active: false,
    locked: true,
    unlocks: ["fleet_commander"],
    objective: {
      type: "kill",
      target: "Repurposed Frigate",
      targetAmount: 8,
      currentAmount: 0
    },
    location: "Planet A3 (Alpha Centauri)"
  },

  {
    id: "convoy_ambush",
    title: "Convoy Ambush", 
    description: "Intercept the pirate supply convoy near Planet A1 - destroy 5 Missile Corvettes before they reach the enemy base.\n\n📍 Enemy Location: Planet A1 (Alpha Centauri) - Target lightly defended Nebula Marauder cargo ships.",
    type: "combat",
    requirements: {
      // Available from start - basic ambush mission
    },
    rewards: {
      tokens: 400,
      fuel: 600,
      weapons: { "light_rocket_launcher": 2 },
      experience: 150
    },
    difficulty: "Easy",
    repeatable: true,
    cooldown: 3600, // 1 hour
    completed: false,
    active: false,
    locked: false,
    objective: {
      type: "kill",
      target: "Missile Corvette",
      targetAmount: 5,
      currentAmount: 0
    },
    location: "Planet A1 (Alpha Centauri)"
  },

  {
    id: "emergency_response",
    title: "Emergency Response",
    description: "Answer civilian distress call near Planet A1 - eliminate 4 Nebula Marauder raiders attacking defenseless miners.\n\n📍 Enemy Location: Planet A1 (Alpha Centauri) - Fight Missile Corvettes and Laser Interceptors from the Nebula Marauders faction.",
    type: "combat",
    requirements: {
      // Available from start - emergency rescue mission
    },
    rewards: {
      tokens: 300,
      diplomaticInfluence: 100,
      weapons: { "light_pulse_laser": 1 },
      experience: 120
    },
    difficulty: "Easy",
    repeatable: true,
    cooldown: 2700, // 45 minutes
    completed: false,
    active: false,
    locked: false,
    objective: {
      type: "kill",
      target: "Missile Corvette",
      targetAmount: 4,
      currentAmount: 0
    },
    location: "Planet A1 (Alpha Centauri)"
  },

  {
    id: "sector_patrol",
    title: "Sector Patrol",
    description: "Patrol the Alpha Centauri system between planets - eliminate 6 enemy ships disrupting commercial traffic.\n\n📍 Enemy Location: Alpha Centauri system - Encounter Nebula Marauders and Void Corsairs disrupting commerce.",
    type: "combat",
    requirements: {
      // Available from start - patrol mission
    },
    rewards: {
      tokens: 350,
      fuel: 200,
      weapons: { "light_plasma_blaster": 1 },
      experience: 140
    },
    difficulty: "Easy",
    repeatable: true,
    cooldown: 3000, // 50 minutes
    completed: false,
    active: false,
    locked: false,
    objective: {
      type: "kill",
      target: "Stealth Raider",
      targetAmount: 6,
      currentAmount: 0
    },
    location: "Alpha Centauri system (Planets A1-A2)"
  },

  {
    id: "fleet_commander",
    title: "Fleet Commander Duel",
    description: "Hunt down the notorious Vanguard Battleship commander near Planet A4 - eliminate this legendary pirate in single combat.\n\n📍 Enemy Location: Planet A4 (Alpha Centauri) - Face the most dangerous Titan Vanguard commander.",
    type: "combat",
    requirements: {
      enemyKills: { "Repurposed Frigate": 8 },
      weapons: { "heavy_beam_laser": 1, "heavy_plasma_blaster": 1 }
    },
    rewards: {
      tokens: 2000,
      alloys: 1500,
      quantumCores: 25,
      weapons: { "heavy_railgun": 1, "heavy_torpedo_launcher": 1 },
      experience: 600
    },
    difficulty: "Extreme",
    repeatable: true,
    cooldown: 10800, // 3 hours
    completed: false,
    active: false,
    locked: true,
    objective: {
      type: "kill",
      target: "Vanguard Battleship",
      targetAmount: 1,
      currentAmount: 0
    },
    location: "Planet A4 (Alpha Centauri)"
  },

  {
    id: "bounty_hunter",
    title: "Bounty Hunter",
    description: "Hunt down 3 high-value bounty targets hiding in deep space - eliminate these wanted criminals for substantial rewards.\n\n📍 Enemy Location: Planets A2 and A3 (Alpha Centauri) - Track down elite Void Corsair and Star Scavenger criminals.",
    type: "combat",
    requirements: {
      enemyKills: { "Laser Interceptor": 10 },
      weapons: { "medium_railgun": 1 }
    },
    rewards: {
      tokens: 1500,
      alloys: 1000,
      weapons: { "heavy_plasma_blaster": 1, "medium_missile_launcher": 1 },
      experience: 450
    },
    difficulty: "Hard",
    repeatable: true,
    cooldown: 6000, // 1.67 hours
    completed: false,
    active: false,
    locked: true,
    objective: {
      type: "kill",
      target: "Ion Saboteur",
      targetAmount: 3,
      currentAmount: 0
    },
    location: "Planets A2 and A3 (Alpha Centauri)"
  },

  {
    id: "defense_contract",
    title: "Station Defense Contract",
    description: "Defend Planet A1 mining operations from incoming pirate assault - eliminate 12 Nebula Marauder ships before they destroy the facilities.\n\n📍 Enemy Location: Planet A1 (Alpha Centauri) - Fight Missile Corvettes and Laser Interceptors attacking mining facilities.",
    type: "combat",
    requirements: {
      weapons: { "light_rocket_launcher": 1 }
    },
    rewards: {
      tokens: 800,
      alloys: 600,
      diplomaticInfluence: 75,
      weapons: { "medium_beam_laser": 1, "light_railgun": 1 },
      experience: 250
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 4500, // 1.25 hours
    completed: false,
    active: false,
    locked: false,
    objective: {
      type: "kill",
      target: "Laser Interceptor",
      targetAmount: 12,
      currentAmount: 0
    },
    location: "Planet A1 (Alpha Centauri)"
  },

  {
    id: "assassination_contract",
    title: "Assassination Contract",
    description: "Infiltrate Planet A2 and eliminate a Corsair Warlord - take out this high-ranking pirate officer before he escapes.\n\n📍 Enemy Location: Planet A2 (Alpha Centauri) - Target a dangerous Void Corsair commander.",
    type: "combat",
    requirements: {
      enemyKills: { "Stealth Raider": 5 },
      weapons: { "medium_plasma_blaster": 1, "light_rocket_launcher": 1 }
    },
    rewards: {
      tokens: 1000,
      alloys: 800,
      weapons: { "heavy_beam_laser": 1, "medium_missile_launcher": 1 },
      experience: 350
    },
    difficulty: "Hard",
    repeatable: true,
    cooldown: 5400, // 1.5 hours
    completed: false,
    active: false,
    locked: true,
    objective: {
      type: "kill",
      target: "Corsair Warlord",
      targetAmount: 1,
      currentAmount: 0
    },
    location: "Planet A2 (Alpha Centauri)"
  },

  {
    id: "last_stand",
    title: "Last Stand",
    description: "Defend Planet A4 against the massive pirate armada - eliminate 25 elite enemy ships in this epic final battle.\n\n📍 Enemy Location: Planet A4 (Alpha Centauri) - Face the combined might of Star Scavengers and Titan Vanguard fleets.",
    type: "combat",
    requirements: {
      enemyKills: { "Salvage Fighter": 3 },
      weapons: { "heavy_railgun": 1, "heavy_torpedo_launcher": 1 }
    },
    rewards: {
      tokens: 3000,
      alloys: 2500,
      quantumCores: 75,
      ancientArtifacts: 2,
      weapons: { "heavy_railgun": 2, "heavy_torpedo_launcher": 2 },
      experience: 1000
    },
    difficulty: "Extreme",
    repeatable: false, // Epic one-time mission
    completed: false,
    active: false,
    locked: true,
    objective: {
      type: "kill",
      target: "Titan Dreadnought",
      targetAmount: 25,
      currentAmount: 0
    },
    location: "Planet A4 (Alpha Centauri)"
  },

  // ==================== SPECIAL MISSIONS ====================

  {
    id: "merchant_convoy",
    title: "Merchant Convoy Escort",
    description: "Protect valuable trade shipments through dangerous sectors",
    type: "trading",
    requirements: {
      diplomaticInfluence: 100,
      energy: 800
    },
    duration: 2400, // 40 minutes
    rewards: {
      tokens: 800,
      diplomaticInfluence: 150,
      weapons: { "light_pulse_laser": 2 },
      experience: 180
    },
    difficulty: "Easy",
    faction: "stellar_merchants",
    repeatable: true,
    cooldown: 5400,
    completed: false,
    active: false,
    locked: false,
  },

  {
    id: "asteroid_rush",
    title: "Asteroid Gold Rush",
    description: "Mine valuable resources before competing prospectors arrive",
    type: "timed",
    requirements: {
      ships: { miningDrones: 5 }
    },
    timeLimit: 900, // 15 minutes
    rewards: {
      alloys: 1500,
      frozenHydrogen: 800,
      weapons: { "medium_beam_laser": 1 },
      experience: 250
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 21600, // 6 hours
    completed: false,
    active: false,
    locked: false,
  },

  {
    id: "industrial_complex",
    title: "Industrial Complex",
    description: "Establish a complete resource processing chain",
    type: "resource_chain",
    requirements: {
      alloys: 3000,
      energy: 8000
    },
    steps: [
      "Build Raw Material Extractor",
      "Construct Processing Facility", 
      "Establish Advanced Manufacturer",
      "Produce 100 Advanced Components"
    ],
    rewards: {
      tokens: 3000,
      researchPoints: 1200,
      weapons: { "heavy_beam_laser": 2, "heavy_plasma_blaster": 1 },
      unlocks: ["mass_production", "automation_protocols"],
      experience: 800
    },
    difficulty: "Hard",
    repeatable: false,
    completed: false,
    active: false,
    locked: false,
    progress: 0,
  },
];

export default initialMissions; 