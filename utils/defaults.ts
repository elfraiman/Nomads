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

export interface Resource {
  current: number;
  max: number;
  efficiency: number;
  locked: boolean;
}

export interface PlayerResources {
  energy: Resource;
  fuel: Resource;
  solarPlasma: Resource;
  darkMatter: Resource;
  frozenHydrogen: Resource;
  alloys: Resource;
  tokens: Resource;
}

// Initial values for resources
export const initialResources: PlayerResources = {
  energy: { current: 85, max: 100, efficiency: 1, locked: false },
  fuel: { current: 0, max: 100, efficiency: 1.8, locked: false },
  solarPlasma: { current: 0, max: 100, efficiency: 1.6, locked: true },
  darkMatter: { current: 0, max: 100, efficiency: 1.2, locked: true },
  frozenHydrogen: { current: 0, max: 100, efficiency: 0.9, locked: true },
  alloys: { current: 0, max: 100, efficiency: 0.3, locked: true },
  tokens: { current: 0, max: 100, efficiency: 1, locked: true },
};

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


export const initialGalaxies: IGalaxy[] = [
  {
    id: 1,
    name: "Alpha Centauri",
    size: 90,
    image: require("../assets/images/galaxy.webp"),
    found: true,
    planets: [
      { id: 1, name: "Planet A1", position: { x: 150, y: height / 6 }, image: require("../assets/images/planet1.png") },
      { id: 2, name: "Planet A2", position: { x: 350, y: height / 4.8 }, image: require("../assets/images/planet2.png") },
      { id: 3, name: "Planet A3", position: { x: 80, y: height / 2.9 }, image: require("../assets/images/planet3.png") },
      { id: 4, name: "Planet A4", position: { x: 300, y: height / 2 }, image: require("../assets/images/planet4.png") },
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
  {
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
  },
];


interface IPlayerStats {
  health: number;
  attackPower: number;
  defense: number;
  attackSpeed: number;
}

export const initialPlayerStats: IPlayerStats = {
  health: 100,
  attackPower: 15,
  defense: 10,
  attackSpeed: 2,
};


export interface IPirate {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  weaponOfChoice: string;
  attackSpeed: number;
}

export const initialPirates: IPirate[] = [
  {
    name: "Missile Corvet Pirate",
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 5,
    weaponOfChoice: "Missile Launcher",
    attackSpeed: 2,
  },
  {
    name: "Laser Drone Pirate",
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 3,
    weaponOfChoice: "Laser Beam",
    attackSpeed: 3,
  },
  {
    name: "Plasma Marauder Pirate",
    health: 120,
    maxHealth: 120,
    attack: 20,
    defense: 7,
    weaponOfChoice: "Plasma Cannon",
    attackSpeed: 1,
  },
  {
    name: "Titan Pirate",
    health: 1000,
    maxHealth: 1000,
    attack: 25,
    defense: 10,
    weaponOfChoice: "Titan's Fist",
    attackSpeed: 1,
  },
];