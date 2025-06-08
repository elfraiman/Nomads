import { IMission } from "@/utils/defaults";

export const initialMissions: IMission[] = [
  // EXPLORATION MISSIONS
  {
    id: "deep_space_survey",
    title: "Deep Space Survey",
    description: "Explore uncharted sectors to discover new resources and phenomena",
    type: "exploration",
    requirements: { 
      energy: 1000,
      fuel: 800,
      ships: { scanningDrones: 5 }
    },
    duration: 3600, // 1 hour
    rewards: {
      researchPoints: 150,
      exoticMatter: 50,
      experience: 200,
      unlocks: ["new_galaxy_sector"]
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 7200, // 2 hours
    completed: false,
    active: false,
  },
  
  // COMBAT MISSIONS
  {
    id: "pirate_patrol",
    title: "Pirate Patrol",
    description: "Hunt down pirate fleets terrorizing trade routes",
    type: "combat",
    requirements: {
      energy: 500,
      ships: { scanningDrones: 2 }
    },
    rewards: {
      tokens: 300,
      alloys: 200,
      diplomaticInfluence: 50,
      experience: 150
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 3600,
    completed: false,
    active: false,
  },
  
  // RESEARCH MISSIONS
  {
    id: "artifact_analysis",
    title: "Ancient Artifact Analysis", 
    description: "Study mysterious artifacts discovered in deep space",
    type: "research",
    requirements: {
      ancientArtifacts: 1,
      researchPoints: 100
    },
    duration: 1800, // 30 minutes
    rewards: {
      researchPoints: 500,
      quantumCores: 25,
      unlocks: ["ancient_technology"],
      experience: 300
    },
    difficulty: "Hard",
    repeatable: false,
    completed: false,
    active: false,
  },
  
  // TIMED CHALLENGES
  {
    id: "asteroid_rush",
    title: "Asteroid Gold Rush",
    description: "Mine valuable resources before competing prospectors arrive",
    type: "timed",
    requirements: {
      ships: { miningDrones: 3 }
    },
    timeLimit: 600, // 10 minutes
    rewards: {
      alloys: 1000,
      frozenHydrogen: 500,
      tokens: 200,
      experience: 250
    },
    difficulty: "Medium",
    repeatable: true,
    cooldown: 21600, // 6 hours
    completed: false,
    active: false,
  },
  
  // TRADING MISSIONS
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
      exoticMatter: 75,
      experience: 180
    },
    difficulty: "Easy",
    faction: "stellar_merchants",
    repeatable: true,
    cooldown: 5400,
    completed: false,
    active: false,
  },
  
  // RESOURCE CHAIN MISSIONS
  {
    id: "industrial_complex",
    title: "Industrial Complex",
    description: "Establish a complete resource processing chain",
    type: "resource_chain",
    requirements: {
      alloys: 2000,
      energy: 5000
    },
    steps: [
      "Build Raw Material Extractor",
      "Construct Processing Facility",
      "Establish Advanced Manufacturer",
      "Produce 100 Advanced Components"
    ],
    rewards: {
      tokens: 2000,
      researchPoints: 800,
      unlocks: ["mass_production", "automation_protocols"],
      experience: 500
    },
    difficulty: "Hard",
    repeatable: false,
    completed: false,
    active: false,
    progress: 0,
  }
];

export default initialMissions; 