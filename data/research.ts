export interface IResearchEffect {
  type: 'passive_efficiency' | 'unlock_weapon' | 'unlock_upgrade' | 'increase_capacity' | 'unlock_slot' | 'weapon_damage' | 'weapon_speed' | 'weapon_energy' | 'automation' | 'unlock_feature';
  target?: string;
  value?: number;
  description: string;
}

import { PlayerResources } from '../utils/defaults';

export interface IResearchCost {
  resourceType: keyof PlayerResources;
  amount: number;
}

export interface IResearchNode {
  id: string;
  title: string;
  description: string;
  tier: number;
  duration: number; // in seconds
  costs: IResearchCost[];
  effects: IResearchEffect[];
  prerequisites: string[];
  completed: boolean;
  inProgress: boolean;
  progress: number;
  treeId: string; // Which tree this node belongs to
  position: { row: number; col: number }; // Position within the tree
}

export interface IResearchTree {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: IResearchNode[];
}

export interface IResearchCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  trees: IResearchTree[];
}

// Linear progression formulas for research:
// Duration: baseDuration * (1 + (tier * 0.4)) - linear scaling
// Costs: baseCost * (1 + (tier * 0.5)) - moderate scaling
// Effects: balanced improvements that don't obsolete earlier research

const researchData: IResearchCategory[] = [
  {
    id: 'materials',
    name: 'Materials Science',
    icon: '🔬',
    color: '#4CAF50',
    description: 'Research into advanced materials and resource processing techniques.',
    trees: [
      {
        id: 'metallurgy_tree',
        name: 'Metallurgy',
        description: 'Advanced alloy processing and metal enhancement',
        icon: '⚒️',
        nodes: [
          {
            id: 'basic_metallurgy',
            title: 'Basic Metallurgy',
            description: 'Improve understanding of metal processing and alloy creation.',
            tier: 1,
            duration: 420, // 7 minutes (300 * 1.4)
            costs: [
              { resourceType: 'energy', amount: 75 }, // 50 * 1.5
              { resourceType: 'alloys', amount: 38 }, // 25 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'alloys',
                value: 1.15,
                description: 'Increases alloy production efficiency by 15%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'metallurgy_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'advanced_alloys',
            title: 'Advanced Alloys',
            description: 'Create superior alloy compositions for enhanced performance.',
            tier: 2,
            duration: 840, // 14 minutes (300 * 2.8)
            costs: [
              { resourceType: 'energy', amount: 150 }, // 100 * 1.5
              { resourceType: 'alloys', amount: 75 }, // 50 * 1.5
              { resourceType: 'quantumCores', amount: 8 }, // 5 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'alloys',
                value: 1.3,
                description: 'Further increases alloy production efficiency by 30%'
              },
              {
                type: 'increase_capacity',
                target: 'alloys',
                value: 300,
                description: 'Increases alloy storage capacity by 300'
              }
            ],
            prerequisites: ['basic_metallurgy'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'metallurgy_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'composite_materials',
            title: 'Composite Materials',
            description: 'Revolutionary material combinations with superior properties.',
            tier: 3,
            duration: 1260, // 21 minutes (300 * 4.2)
            costs: [
              { resourceType: 'energy', amount: 300 }, // 200 * 1.5
              { resourceType: 'alloys', amount: 150 }, // 100 * 1.5
              { resourceType: 'quantumCores', amount: 15 }, // 10 * 1.5
              { resourceType: 'exoticMatter', amount: 8 } // 5 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'all_materials',
                value: 1.2,
                description: 'Increases all material production by 20%'
              },
              {
                type: 'increase_capacity',
                target: 'all_resources',
                value: 400,
                description: 'Increases all resource capacity by 400'
              }
            ],
            prerequisites: ['advanced_alloys'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'metallurgy_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'metamaterials',
            title: 'Metamaterials',
            description: 'Artificially structured materials with impossible natural properties.',
            tier: 4,
            duration: 1680, // 28 minutes (300 * 5.6)
            costs: [
              { resourceType: 'energy', amount: 750 }, // 500 * 1.5
              { resourceType: 'alloys', amount: 450 }, // 300 * 1.5
              { resourceType: 'quantumCores', amount: 38 }, // 25 * 1.5
              { resourceType: 'exoticMatter', amount: 30 } // 20 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'all_materials',
                value: 1.5,
                description: 'Increases all material production efficiency by 50%'
              },
              {
                type: 'unlock_feature',
                target: 'metamaterial_crafting',
                description: 'Unlocks metamaterial crafting station'
              }
            ],
            prerequisites: ['composite_materials'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'metallurgy_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
      {
        id: 'fuel_tree',
        name: 'Fuel Technology',
        description: 'Fuel processing and efficiency improvements',
        icon: '⛽',
        nodes: [
          {
            id: 'fuel_optimization',
            title: 'Fuel Optimization',
            description: 'Develop more efficient fuel processing and storage methods.',
            tier: 1,
            duration: 336, // 5.6 minutes (240 * 1.4)
            costs: [
              { resourceType: 'energy', amount: 60 }, // 40 * 1.5
              { resourceType: 'fuel', amount: 45 }, // 30 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'fuel',
                value: 1.2,
                description: 'Increases fuel production efficiency by 20%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'fuel_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'advanced_fuel_systems',
            title: 'Advanced Fuel Systems',
            description: 'Revolutionary fuel processing techniques for maximum efficiency.',
            tier: 2,
            duration: 672, // 11.2 minutes (240 * 2.8)
            costs: [
              { resourceType: 'energy', amount: 120 }, // 80 * 1.5
              { resourceType: 'fuel', amount: 90 }, // 60 * 1.5
              { resourceType: 'alloys', amount: 75 }, // 50 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'fuel',
                value: 1.4,
                description: 'Further increases fuel production efficiency by 40%'
              },
              {
                type: 'increase_capacity',
                target: 'fuel',
                value: 500,
                description: 'Increases fuel storage capacity by 500'
              }
            ],
            prerequisites: ['fuel_optimization'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'fuel_tree',
            position: { row: 1, col: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'energy',
    name: 'Energy Systems',
    icon: '⚡',
    color: '#FFD700',
    description: 'Advanced energy generation and management technologies.',
    trees: [
      {
        id: 'power_generation_tree',
        name: 'Power Generation',
        description: 'Advanced reactor and energy production systems',
        icon: '🔋',
        nodes: [
          {
            id: 'reactor_efficiency',
            title: 'Reactor Efficiency',
            description: 'Optimize reactor core performance and energy output.',
            tier: 1,
            duration: 360, // 6 minutes (300 * 1.2)
            costs: [
              { resourceType: 'energy', amount: 90 }, // 60 * 1.5
              { resourceType: 'solarPlasma', amount: 60 }, // 40 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'energy',
                value: 1.25,
                description: 'Increases energy production efficiency by 25%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'power_generation_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'fusion_technology',
            title: 'Fusion Technology',
            description: 'Harness the power of nuclear fusion for massive energy generation.',
            tier: 2,
            duration: 720, // 12 minutes (300 * 2.4)
            costs: [
              { resourceType: 'energy', amount: 180 }, // 120 * 1.5
              { resourceType: 'solarPlasma', amount: 120 }, // 80 * 1.5
              { resourceType: 'frozenHydrogen', amount: 90 }, // 60 * 1.5
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'energy',
                value: 1.5,
                description: 'Dramatically increases energy production by 50%'
              },
              {
                type: 'unlock_feature',
                target: 'fusion_reactor',
                description: 'Unlocks fusion reactor construction'
              }
            ],
            prerequisites: ['reactor_efficiency'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'power_generation_tree',
            position: { row: 1, col: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'weapons',
    name: 'Weapons Technology',
    icon: '⚔️',
    color: '#FF4757',
    description: 'Advanced weaponry and combat systems research.',
    trees: [
      {
        id: 'plasma_weapons_tree',
        name: 'Plasma Weapons',
        description: 'High-energy plasma weapon systems',
        icon: '🔥',
        nodes: [
          {
            id: 'plasma_efficiency',
            title: 'Plasma Efficiency',
            description: 'Improve plasma weapon energy efficiency and damage output.',
            tier: 1,
            duration: 480, // 8 minutes (400 * 1.2)
            costs: [
              { resourceType: 'energy', amount: 150 }, // 100 * 1.5
              { resourceType: 'solarPlasma', amount: 90 }, // 60 * 1.5
              { resourceType: 'alloys', amount: 45 }, // 30 * 1.5
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'blaster',
                value: 1.15,
                description: 'Increases plasma weapon damage by 15%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'plasma_weapons_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'advanced_plasma_systems',
            title: 'Advanced Plasma Systems',
            description: 'Next-generation plasma weapon technology with superior performance.',
            tier: 2,
            duration: 960, // 16 minutes (400 * 2.4)
            costs: [
              { resourceType: 'energy', amount: 300 }, // 200 * 1.5
              { resourceType: 'solarPlasma', amount: 180 }, // 120 * 1.5
              { resourceType: 'alloys', amount: 90 }, // 60 * 1.5
              { resourceType: 'quantumCores', amount: 15 }, // 10 * 1.5
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'blaster',
                value: 1.3,
                description: 'Further increases plasma weapon damage by 30%'
              },
              {
                type: 'weapon_speed',
                target: 'blaster',
                value: 1.2,
                description: 'Increases plasma weapon firing rate by 20%'
              }
            ],
            prerequisites: ['plasma_efficiency'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'plasma_weapons_tree',
            position: { row: 1, col: 0 }
          }
        ]
      }
    ]
  }
];

// Helper function to calculate research duration based on tier
export const calculateResearchDuration = (baseDuration: number, tier: number): number => {
  return Math.floor(baseDuration * (1 + (tier * 0.4)));
};

// Helper function to calculate research costs based on tier
export const calculateResearchCosts = (baseCosts: IResearchCost[], tier: number): IResearchCost[] => {
  const scalingFactor = 1 + (tier * 0.5);
  return baseCosts.map(cost => ({
    resourceType: cost.resourceType,
    amount: Math.floor(cost.amount * scalingFactor)
  }));
};

// Helper function to get research efficiency bonus
export const getResearchEfficiencyBonus = (researchLabLevel: number): number => {
  return 1 + (researchLabLevel * 0.08); // 8% reduction per level
};

export default researchData; 