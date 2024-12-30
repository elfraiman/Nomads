

export interface Resource {
  current: number;
  max: number;
  efficiency: number;
  locked: boolean;
}

export interface Resources {
  energy: Resource;
  fuel: Resource;
  solarPlasma: Resource;
  darkMatter: Resource;
  frozenHydrogen: Resource;
  alloys: Resource;
  tokens: Resource;
}

export const initialResources: Resources = {
  energy: { current: 85, max: 100, efficiency: 1, locked: false },
  fuel: { current: 0, max: 100, efficiency: 1.8, locked: false },
  solarPlasma: { current: 0, max: 100, efficiency: 1.6, locked: true },
  darkMatter: { current: 0, max: 100, efficiency: 1.2, locked: true },
  frozenHydrogen: { current: 0, max: 100, efficiency: 0.9, locked: true },
  alloys: { current: 0, max: 100, efficiency: 0.3, locked: true },
  tokens: { current: 0, max: 100, efficiency: 1, locked: true },
};
