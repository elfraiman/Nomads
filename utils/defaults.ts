export interface Ships {
  miningDrones: number;
  // Future additions:
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
  // attackDrones: 0,
  // corvettes: 0,
  // marauders: 0,
  // titans: 0,
};
