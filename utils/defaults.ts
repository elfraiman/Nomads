

export interface Resource {
  current: number;
  max: number;
  efficiency: number;
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
  energy: { current: 85, max: 100, efficiency: 1 },
  fuel: { current: 0, max: 100, efficiency: 1.8 },
  solarPlasma: { current: 0, max: 100, efficiency: 1.6 },
  darkMatter: { current: 0, max: 100, efficiency: 1.2 },
  frozenHydrogen: { current: 0, max: 100, efficiency: 0.9 },
  alloys: { current: 0, max: 100, efficiency: 0.3 },
  tokens: { current: 0, max: 100, efficiency: 1 },
};
