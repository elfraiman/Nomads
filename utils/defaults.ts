import { IWeapon } from "@/data/weapons";
import { Dimensions } from "react-native";

export interface IPosition {
  x: number;
  y: number;
}

export interface IPlanet {
  id: number;
  name: string;
  position: IPosition;
  image?: any;
  enemies: IPirate[];
  pirateCount: number;
  locked: boolean;
  galaxyId: number;
}
export interface IPirate {
  name: string;
  health: number;
  maxHealth: number;
  faction: string;
  attack: number;
  defense: number;
  weaponOfChoice: string;
  attackSpeed: number;
  lore: string;
  category: "Corvette" | "Cruiser" | "Battleship" | "Dreadnought" | "Titan"; // New field
}


export interface IGalaxy {
  id: number;
  name: string;
  size: number;
  planets: IPlanet[];
  image: any;
  asteroids: IAsteroid[];
  found: boolean;
}

export interface IAsteroid {
  id: number;
  name: string;
  resource: keyof PlayerResources;
  findChance: number;
  maxResources: number;
  galaxyId: number;
  x?: number;
  y?: number;
}
export interface Ships {
  miningDrones: number;
  scanningDrones: number;
  // attackDrones: number;
  // corvettes: number;
  // marauders: number;
  // titans: number;
}

export interface IResource {
  current: number;
  max: number;
  efficiency: number;
  locked: boolean;
}

export interface PlayerResources {
  energy: IResource;
  fuel: IResource;
  solarPlasma: IResource;
  darkMatter: IResource;
  frozenHydrogen: IResource;
  alloys: IResource;
  tokens: IResource;
  researchPoints: IResource;
  exoticMatter: IResource;
  quantumCores: IResource;
  ancientArtifacts: IResource;
  diplomaticInfluence: IResource;
}


// Initial values for ships
export const initialShips: Ships = {
  miningDrones: 0,
  scanningDrones: 0,
  // attackDrones: 0,
  // corvettes: 0,
  // marauders: 0,
  // titans: 0,
};

const { width: fullWidth, height: fullHeight } = Dimensions.get("window");

const height = fullHeight - 16; // 16px padding on each side

export const nebulaMarauderPirates: IPirate[] = [
  {
    name: "Missile Corvette",
    faction: "Nebula Marauders",
    health: 100,
    maxHealth: 100,
    attack: 13,
    defense: 5,
    weaponOfChoice: "Missile Launcher",
    attackSpeed: 2,
    lore: "Swift and aggressive, these corvettes fire devastating volleys of missiles to overwhelm their prey.",
    category: "Corvette",
  },
  {
    name: "Laser Interceptor",
    faction: "Nebula Marauders",
    health: 125,
    maxHealth: 125,
    attack: 18,
    defense: 7,
    weaponOfChoice: "Laser Arrays",
    attackSpeed: 2,
    lore: "Specialized in hit-and-run tactics, their laser arrays slice through unshielded hulls.",
    category: "Cruiser",
  },
  {
    name: "Nebula Ravager",
    faction: "Nebula Marauders",
    health: 300,
    maxHealth: 300,
    attack: 35,
    defense: 10,
    weaponOfChoice: "Plasma Torpedoes",
    attackSpeed: 4,
    lore: "A heavily modified cruiser armed with plasma torpedoes for high damage against larger ships.",
    category: "Dreadnought"
  },
  {
    name: "Titan Breaker",
    faction: "Nebula Marauders",
    health: 650,
    maxHealth: 650,
    attack: 50,
    defense: 25,
    weaponOfChoice: "Heavy Plasma Cannon",
    attackSpeed: 6,
    lore: "A massive battleship designed to take on even the largest enemy vessels.",
    category: "Battleship"
  },
  {
    name: "Nebula Titan",
    faction: "Nebula Marauders",
    health: 1200,
    maxHealth: 1200,
    attack: 70,
    defense: 35,
    weaponOfChoice: "Graviton Beam",
    attackSpeed: 12,
    lore: "The pride of the Nebula Marauders, this titan-class vessel can tear apart space-time itself.",
    category: "Titan"
  }
];

export const voidCorsairsPirates: IPirate[] = [
  {
    name: "Stealth Raider",
    faction: "Void Corsairs",
    health: 120,
    maxHealth: 120,
    attack: 20,
    defense: 6,
    weaponOfChoice: "Cloaking Disruptor",
    attackSpeed: 2.5,
    lore: "Equipped with cloaking devices, these raiders strike from the shadows and vanish before retaliation.",
    category: "Corvette",
  },
  {
    name: "Ion Saboteur",
    faction: "Void Corsairs",
    health: 150,
    maxHealth: 150,
    attack: 25,
    defense: 8,
    weaponOfChoice: "Ion Cannons",
    attackSpeed: 2.5,
    lore: "Saboteurs who disable ships with precision ion cannon strikes, leaving them vulnerable.",
    category: "Cruiser",
  },
  {
    name: "Corsair Warlord",
    faction: "Void Corsairs",
    health: 400,
    maxHealth: 400,
    attack: 50,
    defense: 15,
    weaponOfChoice: "Void Lance",
    attackSpeed: 3,
    lore: "A feared commander, the Warlord's Void Lance unleashes devastating energy beams.",
    category: "Dreadnought",
  },
  {
    name: "Void Destroyer",
    faction: "Void Corsairs",
    health: 800,
    maxHealth: 800,
    attack: 70,
    defense: 30,
    weaponOfChoice: "Quantum Disruptor",
    attackSpeed: 4,
    lore: "A formidable battleship equipped with advanced quantum disruptors to annihilate enemies.",
    category: "Battleship",
  },
  {
    name: "Corsair Titan",
    faction: "Void Corsairs",
    health: 1500,
    maxHealth: 1500,
    attack: 100,
    defense: 50,
    weaponOfChoice: "Singularity Cannon",
    attackSpeed: 5,
    lore: "The ultimate weapon of the Void Corsairs, capable of creating singularities to consume entire fleets.",
    category: "Titan",
  }
]

export const starScavengersPirates: IPirate[] = [
  {
    name: "Salvage Fighter",
    faction: "Star Scavengers",
    health: 140,
    maxHealth: 140,
    attack: 18,
    defense: 8,
    weaponOfChoice: "Scrap Cannons",
    attackSpeed: 3.5,
    lore: "Light fighters armed with improvised weapons, salvaged from abandoned stations.",
    category: "Corvette",
  },
  {
    name: "Repurposed Frigate",
    faction: "Star Scavengers",
    health: 200,
    maxHealth: 200,
    attack: 30,
    defense: 12,
    weaponOfChoice: "Railgun",
    attackSpeed: 2.5,
    lore: "A once-derelict frigate outfitted with a powerful railgun salvaged from an orbital station.",
    category: "Cruiser",
  },
  {
    name: "Scavenger Overseer",
    faction: "Star Scavengers",
    health: 500,
    maxHealth: 500,
    attack: 60,
    defense: 20,
    weaponOfChoice: "Overcharged Plasma Array",
    attackSpeed: 2,
    lore: "Leading the scavenger fleet, the Overseer wields experimental plasma arrays for heavy destruction.",
    category: "Dreadnought",
  },
  {
    name: "Junkyard Marauder",
    faction: "Star Scavengers",
    health: 700,
    maxHealth: 700,
    attack: 80,
    defense: 25,
    weaponOfChoice: "Salvaged Beam Cannon",
    attackSpeed: 4.5,
    lore: "A powerful battleship cobbled together from the wreckage of countless battles, armed with a devastating beam cannon.",
    category: "Battleship",
  },
  {
    name: "Scavenger Colossus",
    faction: "Star Scavengers",
    health: 1600,
    maxHealth: 1600,
    attack: 120,
    defense: 60,
    weaponOfChoice: "Repurposed Graviton Projector",
    attackSpeed: 9.5,
    lore: "The ultimate creation of the Star Scavengers, this titan-class ship uses a graviton projector to crush its enemies.",
    category: "Titan",
  }
]

export const titanVanguardPirates: IPirate[] = [
  {
    name: "Titan Enforcer",
    faction: "Titan Vanguard",
    health: 350,
    maxHealth: 350,
    attack: 40,
    defense: 15,
    weaponOfChoice: "Magnetic Pulse Cannon",
    attackSpeed: 2.5,
    lore: "A massive enforcer vessel that uses magnetic pulses to disrupt enemy systems before obliteration.",
    category: "Corvette",
  },
  {
    name: "Shieldbreaker Cruiser",
    faction: "Titan Vanguard",
    health: 500,
    maxHealth: 500,
    attack: 60,
    defense: 25,
    weaponOfChoice: "EMP Missiles",
    attackSpeed: 2,
    lore: "This cruiser specializes in disabling shields and systems before delivering the final blow.",
    category: "Cruiser",
  },
  {
    name: "Titan Dreadnought",
    faction: "Titan Vanguard",
    health: 1500,
    maxHealth: 1500,
    attack: 90,
    defense: 30,
    weaponOfChoice: "Dreadnought Cannon",
    attackSpeed: 3.5,
    lore: "A behemoth of unmatched power, the Titan Dreadnought strikes fear into anyone who dares to challenge it.",
    category: "Dreadnought",
  },
  {
    name: "Vanguard Battleship",
    faction: "Titan Vanguard",
    health: 2000,
    maxHealth: 2000,
    attack: 120,
    defense: 50,
    weaponOfChoice: "Heavy Ion Cannon",
    attackSpeed: 6,
    lore: "A colossal battleship that dominates the battlefield with its heavy ion cannons.",
    category: "Battleship",
  },
  {
    name: "Titan Colossus",
    faction: "Titan Vanguard",
    health: 3000,
    maxHealth: 3000,
    attack: 150,
    defense: 70,
    weaponOfChoice: "Graviton Annihilator",
    attackSpeed: 10,
    lore: "The ultimate titan-class ship of the Titan Vanguard, equipped with a graviton annihilator to crush any opposition.",
    category: "Titan",
  }
]


export const initialGalaxies: IGalaxy[] = [
  {
    id: 1,
    name: "Alpha Centauri",
    size: 90,
    image: require("../assets/images/galaxy.webp"),
    found: true,
    planets: [
      { galaxyId: 1, id: 1, name: "Planet A1", position: { x: 150, y: height / 6 }, image: require("../assets/images/planet1.png"), enemies: nebulaMarauderPirates, pirateCount: 6, locked: false },
      { galaxyId: 1, id: 2, name: "Planet A2", position: { x: 350, y: height / 4.8 }, image: require("../assets/images/planet2.png"), enemies: voidCorsairsPirates, pirateCount: 8, locked: true },
      { galaxyId: 1, id: 3, name: "Planet A3", position: { x: 80, y: height / 2.9 }, image: require("../assets/images/planet3.png"), enemies: starScavengersPirates, pirateCount: 13, locked: true },
      { galaxyId: 1, id: 4, name: "Planet A4", position: { x: 300, y: height / 2 }, image: require("../assets/images/planet4.png"), enemies: titanVanguardPirates, pirateCount: 25, locked: true },
    ],
    asteroids: [
      { galaxyId: 1, id: 1, name: "Asteroid Ignis", resource: "fuel" as keyof PlayerResources, findChance: 0.2, maxResources: 1000 },
      { galaxyId: 1, id: 2, name: "Asteroid Solara", resource: "solarPlasma" as keyof PlayerResources, findChance: 0.1, maxResources: 1000 },
      { galaxyId: 1, id: 3, name: "Asteroid Umbra", resource: "darkMatter" as keyof PlayerResources, findChance: 0.02, maxResources: 400 },
      { galaxyId: 1, id: 4, name: "Asteroid Ferra", resource: "alloys" as keyof PlayerResources, findChance: 0.07, maxResources: 600 },
      { galaxyId: 1, id: 5, name: "Asteroid Cryon", resource: "frozenHydrogen" as keyof PlayerResources, findChance: 0.6, maxResources: 600 },
      { galaxyId: 1, id: 6, name: "Asteroid Volta", resource: "energy" as keyof PlayerResources, findChance: 0.4, maxResources: 3500 },
    ]
  },
  /*   {
      id: 2,
      name: "Andromeda",
      size: 70,
      image: require("../assets/images/galaxy1.webp"),
      found: false,
      planets: [
        { id: 1, name: "Planet B1", position: { x: 70, y: height / 5.2 } },
        { id: 2, name: "Planet B2", position: { x: 180, y: height / 3.5 } },
        { id: 3, name: "Planet B3", position: { x: 300, y: height / 2.5 } },
        { id: 4, name: "Planet B4", position: { x: 95, y: height / 2 } },
      ],
      asteroids: [
        { galaxyId: 2, id: 1, name: "Asteroid Pyros", resource: "fuel" as keyof PlayerResources, findChance: 0.45, maxResources: 1000 },
        { galaxyId: 2, id: 2, name: "Asteroid Helion", resource: "solarPlasma" as keyof PlayerResources, findChance: 0.25, maxResources: 1000 },
        { galaxyId: 2, id: 3, name: "Asteroid Obscura", resource: "darkMatter" as keyof PlayerResources, findChance: 0.15, maxResources: 1000 },
        { galaxyId: 2, id: 4, name: "Asteroid Ferris", resource: "alloys" as keyof PlayerResources, findChance: 0.08, maxResources: 1000 },
        { galaxyId: 2, id: 5, name: "Asteroid Glacius", resource: "frozenHydrogen" as keyof PlayerResources, findChance: 0.05, maxResources: 1000 },
        { galaxyId: 2, id: 6, name: "Asteroid Aether", resource: "energy" as keyof PlayerResources, findChance: 0.02, maxResources: 1000 },
      ]
  
    },
    {
      id: 3,
      size: 120,
      name: "Milky Way",
      image: require("../assets/images/galaxy2.webp"),
      found: false,
      planets: [
        { id: 1, name: "Planet C1", position: { x: 80, y: height / 5.5 } },
        { id: 2, name: "Planet C2", position: { x: 310, y: height / 4.2 } },
        { id: 3, name: "Planet C3", position: { x: 275, y: height / 3 } },
        { id: 4, name: "Planet C4", position: { x: 200, y: height / 2 } },
      ],
      asteroids: [
        { galaxyId: 3, id: 1, name: "Asteroid Ignatius", resource: "fuel" as keyof PlayerResources, findChance: 0.5, maxResources: 1000 },
        { galaxyId: 3, id: 2, name: "Asteroid Solaris", resource: "solarPlasma" as keyof PlayerResources, findChance: 0.3, maxResources: 1000 },
        { galaxyId: 3, id: 4, name: "Asteroid Ferrox", resource: "alloys" as keyof PlayerResources, findChance: 0.15, maxResources: 1000 },
        { galaxyId: 3, id: 3, name: "Asteroid Umbriel", resource: "darkMatter" as keyof PlayerResources, findChance: 0.2, maxResources: 1000 },
        { galaxyId: 3, id: 5, name: "Asteroid Cryonos", resource: "frozenHydrogen" as keyof PlayerResources, findChance: 0.1, maxResources: 1000 },
        { galaxyId: 3, id: 6, name: "Asteroid Electra", resource: "energy" as keyof PlayerResources, findChance: 0.05, maxResources: 1000 },
        { galaxyId: 3, id: 7, name: "Asteroid Cinderon", resource: "fuel" as keyof PlayerResources, findChance: 0.4, maxResources: 1000 },
      ]
    }, */
];

export const miningDroneCost = { fuel: 500, solarPlasma: 800, energy: 850 };
export const scanningDroneCost = { fuel: 100, solarPlasma: 100, energy: 200 };

export interface IMainShip {
  id: string;
  name: string;
  baseStats: {
    health: number;
    maxHealth: number;
    defense: number;
  };
  equippedWeapons: IWeapon[]; // Array of equipped weapons
  maxWeaponSlots: number; // Total weapon slots available
  resources: PlayerResources;
}

// Add `mainShip` to GameContext
export const initialMainShip: IMainShip = {
  id: "main_ship",
  name: "Players Ship",
  baseStats: {
    health: 500,
    maxHealth: 500,
    defense: 15,
  },
  equippedWeapons: [],
  maxWeaponSlots: 5, // Example: 5 slots available initially
  resources: {
    energy: { current: 85, max: 100, efficiency: 2, locked: false },
    fuel: { current: 0, max: 100, efficiency: 1.8, locked: false },
    solarPlasma: { current: 0, max: 100, efficiency: 1.6, locked: true },
    darkMatter: { current: 0, max: 100, efficiency: 1.2, locked: false },
    frozenHydrogen: { current: 0, max: 100, efficiency: 0.9, locked: false },
    alloys: { current: 0, max: 100, efficiency: 0.3, locked: false },
    tokens: { current: 0, max: 100, efficiency: 1, locked: false },
    researchPoints: { current: 0, max: 100, efficiency: 0.5, locked: false },
    exoticMatter: { current: 0, max: 100, efficiency: 0.2, locked: false },
    quantumCores: { current: 0, max: 100, efficiency: 0.3, locked: false },
    ancientArtifacts: { current: 0, max: 100, efficiency: 0.1, locked: false },
    diplomaticInfluence: { current: 0, max: 100, efficiency: 0.4, locked: false },
  }
};


export const resourceColors: { [key: string]: string } = {
  energy: "#FFD93D", // Example: Yellow for energy
  solarPlasma: "#FF5722", // Example: Orange/Yellow for solar plasma
  darkMatter: "#6A0DAD", // Purple for dark matter
  fuel: "#FF6B6B", // Orange-Red for fuel
  frozenHydrogen: "#77C0D8", // Light Blue for frozen hydrogen
  alloys: "#C0C0C0", // Silver for alloys
};


export const shipWeaponModules = [
  { name: "Energy Canon", cost: { type: "energy", amount: 80 }, power: 10, attackSpeed: 3 },
  { name: "Heat seeking missile", cost: { type: "fuel", amount: 100 }, power: 35, attackSpeed: 3 },
  { name: "Light Solar Blaster", cost: { type: "solarPlasma", amount: 75 }, power: 10, attackSpeed: 1 },
  { name: "Dark Matter Blast", cost: { type: "darkMatter", amount: 40 }, power: 30, attackSpeed: 2 },
  { name: "Penetrating Alloy Bullet", cost: { type: "alloy", amount: 100 }, power: 50, attackSpeed: 1 },
  { name: "Cold Laser", cost: { type: "frozenHydrogen", amount: 80 }, power: 40, attackSpeed: 1.5 },
];

export interface IMission {
  id: string;
  title: string;
  description: string;
  type: "exploration" | "combat" | "trading" | "research" | "timed" | "resource_chain";
  requirements: { [key: string]: number } & { ships?: Partial<Ships> };
  duration?: number; // in seconds for timed missions
  timeLimit?: number; // for challenges
  rewards: { [key: string]: number } & { 
    ships?: Partial<Ships>;
    unlocks?: string[];
    experience?: number;
  };
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  faction?: string;
  repeatable: boolean;
  cooldown?: number;
  steps?: string[]; // for multi-step missions
  completed: boolean;
  active: boolean;
  progress?: number;
}

export interface IFaction {
  id: string;
  name: string;
  relationship: "hostile" | "neutral" | "friendly" | "allied";
  reputation: number;
  maxReputation: number;
  description: string;
  tradeRoutes?: string[];
  missions?: IMission[];
  diplomacyUnlocked: boolean;
}

export interface IResearchProject {
  id: string;
  title: string;
  description: string;
  category: "materials" | "quantum" | "energy" | "weapons" | "automation";
  costs: { resourceType: keyof PlayerResources; amount: number }[];
  duration: number; // in seconds
  unlocks: string[];
  prerequisites?: string[];
  completed: boolean;
  inProgress: boolean;
  progress: number;
}