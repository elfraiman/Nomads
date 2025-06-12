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
            duration: 300, // 5 minutes
            costs: [
              { resourceType: 'energy', amount: 50 },
              { resourceType: 'alloys', amount: 25 },
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'alloys',
                value: 1.2,
                description: 'Increases alloy production efficiency by 20%'
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
            duration: 600, // 10 minutes
            costs: [
              { resourceType: 'energy', amount: 100 },
              { resourceType: 'alloys', amount: 50 },
              { resourceType: 'quantumCores', amount: 5 },
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'alloys',
                value: 1.5,
                description: 'Further increases alloy production efficiency by 50%'
              },
              {
                type: 'increase_capacity',
                target: 'alloys',
                value: 200,
                description: 'Increases alloy storage capacity by 200'
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
            duration: 900, // 15 minutes
            costs: [
              { resourceType: 'energy', amount: 200 },
              { resourceType: 'alloys', amount: 100 },
              { resourceType: 'quantumCores', amount: 10 },
              { resourceType: 'exoticMatter', amount: 5 }
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'all_materials',
                value: 1.3,
                description: 'Increases all material production by 30%'
              },
              {
                type: 'increase_capacity',
                target: 'all_resources',
                value: 300,
                description: 'Increases all resource capacity by 300'
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
            duration: 1800, // 30 minutes
            costs: [
              { resourceType: 'energy', amount: 500 },
              { resourceType: 'alloys', amount: 300 },
              { resourceType: 'quantumCores', amount: 25 },
              { resourceType: 'exoticMatter', amount: 20 }
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'all_materials',
                value: 2.0,
                description: 'Doubles all material production efficiency'
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
              duration: 240, // 4 minutes
              costs: [
                { resourceType: 'energy', amount: 40 },
                { resourceType: 'fuel', amount: 30 },
              ],
              effects: [
                {
                  type: 'passive_efficiency',
                  target: 'fuel',
                  value: 1.25,
                  description: 'Increases fuel production efficiency by 25%'
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
              description: 'High-efficiency fuel processing and storage systems.',
              tier: 2,
              duration: 480, // 8 minutes
              costs: [
                { resourceType: 'energy', amount: 80 },
                { resourceType: 'fuel', amount: 60 },
                { resourceType: 'alloys', amount: 25 }
              ],
              effects: [
                {
                  type: 'passive_efficiency',
                  target: 'fuel',
                  value: 1.5,
                  description: 'Further increases fuel production efficiency by 50%'
                },
                {
                  type: 'increase_capacity',
                  target: 'fuel',
                  value: 250,
                  description: 'Increases fuel storage capacity by 250'
                }
              ],
              prerequisites: ['fuel_optimization'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'fuel_tree',
              position: { row: 1, col: 0 }
            },
            {
              id: 'synthetic_fuel',
              title: 'Synthetic Fuel',
              description: 'Create high-energy synthetic fuel from basic materials.',
              tier: 3,
              duration: 720, // 12 minutes
              costs: [
                { resourceType: 'energy', amount: 150 },
                { resourceType: 'fuel', amount: 100 },
                { resourceType: 'quantumCores', amount: 8 },
                { resourceType: 'solarPlasma', amount: 15 }
              ],
              effects: [
                {
                  type: 'passive_efficiency',
                  target: 'fuel',
                  value: 2.0,
                  description: 'Doubles fuel production efficiency'
                },
                {
                  type: 'unlock_feature',
                  target: 'synthetic_fuel_production',
                  description: 'Unlocks synthetic fuel production facility'
                }
              ],
              prerequisites: ['advanced_fuel_systems'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'fuel_tree',
              position: { row: 2, col: 0 }
            },
            {
              id: 'antimatter_fuel',
              title: 'Antimatter Fuel',
              description: 'Harness antimatter for ultimate fuel efficiency.',
              tier: 4,
              duration: 1500, // 25 minutes
              costs: [
                { resourceType: 'energy', amount: 400 },
                { resourceType: 'fuel', amount: 200 },
                { resourceType: 'quantumCores', amount: 20 },
                { resourceType: 'exoticMatter', amount: 15 }
              ],
              effects: [
                {
                  type: 'passive_efficiency',
                  target: 'fuel',
                  value: 5.0,
                  description: 'Increases fuel efficiency by 500%'
                },
                {
                  type: 'unlock_weapon',
                  target: 'antimatter_torpedo',
                  description: 'Unlocks Antimatter Torpedo weapon'
                }
              ],
              prerequisites: ['synthetic_fuel'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'fuel_tree',
              position: { row: 3, col: 0 }
            }
          ]
        },
      {
        id: 'plasma_tree',
        name: 'Plasma Science',
        description: 'Solar plasma and exotic matter research',
        icon: '🌟',
        nodes: [
          {
            id: 'plasma_refinement',
            title: 'Plasma Refinement',
            description: 'Advanced techniques for solar plasma collection and purification.',
            tier: 1,
            duration: 360, // 6 minutes
            costs: [
              { resourceType: 'energy', amount: 60 },
              { resourceType: 'solarPlasma', amount: 20 },
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'solarPlasma',
                value: 1.3,
                description: 'Increases solar plasma production efficiency by 30%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'plasma_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'exotic_matter',
            title: 'Exotic Matter Processing',
            description: 'Unlock the ability to process and utilize exotic matter.',
            tier: 2,
            duration: 900, // 15 minutes
            costs: [
              { resourceType: 'energy', amount: 150 },
              { resourceType: 'darkMatter', amount: 10 },
              { resourceType: 'quantumCores', amount: 8 },
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'exotic_processing',
                description: 'Unlocks exotic matter processing facilities'
              }
            ],
            prerequisites: ['plasma_refinement'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'plasma_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'quantum_materials',
            title: 'Quantum Materials',
            description: 'Develop materials with quantum-enhanced properties.',
            tier: 3,
            duration: 1800, // 30 minutes
            costs: [
              { resourceType: 'energy', amount: 300 },
              { resourceType: 'darkMatter', amount: 25 },
              { resourceType: 'quantumCores', amount: 15 },
              { resourceType: 'exoticMatter', amount: 10 },
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'all_materials',
                value: 1.25,
                description: 'Increases all material production by 25%'
              }
            ],
            prerequisites: ['exotic_matter'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'plasma_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'dimensional_plasma',
            title: 'Dimensional Plasma',
            description: 'Harness plasma from parallel dimensions for unlimited energy.',
            tier: 4,
            duration: 2400, // 40 minutes
            costs: [
              { resourceType: 'energy', amount: 600 },
              { resourceType: 'solarPlasma', amount: 100 },
              { resourceType: 'darkMatter', amount: 50 },
              { resourceType: 'quantumCores', amount: 30 },
              { resourceType: 'exoticMatter', amount: 25 }
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'solarPlasma',
                value: 10.0,
                description: 'Increases solar plasma efficiency by 1000%'
              },
              {
                type: 'unlock_feature',
                target: 'dimensional_harvester',
                description: 'Unlocks dimensional plasma harvester'
              }
            ],
            prerequisites: ['quantum_materials'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'plasma_tree',
            position: { row: 3, col: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'weapons',
    name: 'Weapons Technology',
    icon: '⚔️',
    color: '#F44336',
    description: 'Advanced weapon systems and combat technologies.',
    trees: [
      {
        id: 'laser_tree',
        name: 'Laser Weapons',
        description: 'Energy-based laser weapon systems',
        icon: '🔴',
        nodes: [
          {
            id: 'laser_basics',
            title: 'Laser Technology',
            description: 'Fundamental laser weapon research and development.',
            tier: 1,
            duration: 300,
            costs: [
              { resourceType: 'energy', amount: 60 },
              { resourceType: 'quantumCores', amount: 3 },
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'laser',
                value: 1.2,
                description: 'Increases laser weapon damage by 20%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'laser_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'laser_efficiency',
            title: 'Laser Efficiency',
            description: 'Reduce energy consumption of laser weapons.',
            tier: 2,
            duration: 480,
            costs: [
              { resourceType: 'energy', amount: 100 },
              { resourceType: 'quantumCores', amount: 8 },
              { resourceType: 'alloys', amount: 15 },
            ],
            effects: [
              {
                type: 'weapon_energy',
                target: 'laser',
                value: 0.8,
                description: 'Reduces laser weapon energy consumption by 20%'
              }
            ],
            prerequisites: ['laser_basics'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'laser_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'plasma_laser',
            title: 'Plasma Laser Systems',
            description: 'Advanced plasma-enhanced laser weapons.',
            tier: 3,
            duration: 1200,
            costs: [
              { resourceType: 'energy', amount: 200 },
              { resourceType: 'solarPlasma', amount: 50 },
              { resourceType: 'quantumCores', amount: 12 },
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'laser',
                value: 1.5,
                description: 'Further increases laser weapon damage by 50%'
              },
              {
                type: 'unlock_weapon',
                target: 'plasma_laser',
                description: 'Unlocks Plasma Laser weapon type'
              }
            ],
            prerequisites: ['laser_efficiency'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'laser_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'quantum_laser',
            title: 'Quantum Laser Array',
            description: 'Quantum-entangled laser systems with instantaneous targeting.',
            tier: 4,
            duration: 2100, // 35 minutes
            costs: [
              { resourceType: 'energy', amount: 500 },
              { resourceType: 'solarPlasma', amount: 100 },
              { resourceType: 'quantumCores', amount: 25 },
              { resourceType: 'exoticMatter', amount: 15 }
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'laser',
                value: 3.0,
                description: 'Triples laser weapon damage'
              },
              {
                type: 'unlock_weapon',
                target: 'quantum_laser_array',
                description: 'Unlocks Quantum Laser Array weapon'
              },
              {
                type: 'weapon_speed',
                target: 'laser',
                value: 2.0,
                description: 'Doubles laser weapon firing rate'
              }
            ],
            prerequisites: ['plasma_laser'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'laser_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
      {
        id: 'missile_tree',
        name: 'Missile Systems',
        description: 'Guided projectile weapon systems',
        icon: '🚀',
        nodes: [
          {
            id: 'missile_basics',
            title: 'Missile Systems',
            description: 'Basic missile guidance and warhead technology.',
            tier: 1,
            duration: 360,
            costs: [
              { resourceType: 'energy', amount: 50 },
              { resourceType: 'alloys', amount: 30 },
              { resourceType: 'fuel', amount: 20 },
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'missile',
                value: 1.25,
                description: 'Increases missile weapon damage by 25%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'missile_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'smart_missiles',
            title: 'Smart Missiles',
            description: 'Advanced targeting and guidance systems.',
            tier: 2,
            duration: 600,
            costs: [
              { resourceType: 'energy', amount: 120 },
              { resourceType: 'alloys', amount: 40 },
              { resourceType: 'researchPoints', amount: 15 },
            ],
            effects: [
              {
                type: 'weapon_speed',
                target: 'missile',
                value: 1.3,
                description: 'Increases missile speed and accuracy by 30%'
              }
            ],
            prerequisites: ['missile_basics'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'missile_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'quantum_missiles',
            title: 'Quantum Missiles',
            description: 'Quantum-guided missile systems with phase capabilities.',
            tier: 3,
            duration: 1500,
            costs: [
              { resourceType: 'energy', amount: 250 },
              { resourceType: 'darkMatter', amount: 20 },
              { resourceType: 'quantumCores', amount: 10 },
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'missile',
                value: 1.4,
                description: 'Further increases missile damage by 40%'
              },
              {
                type: 'unlock_weapon',
                target: 'quantum_missile',
                description: 'Unlocks Quantum Missile weapon type'
              }
            ],
            prerequisites: ['smart_missiles'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'missile_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'singularity_missiles',
            title: 'Singularity Missiles',
            description: 'Missiles that create micro black holes on impact.',
            tier: 4,
            duration: 2700, // 45 minutes
            costs: [
              { resourceType: 'energy', amount: 800 },
              { resourceType: 'darkMatter', amount: 100 },
              { resourceType: 'quantumCores', amount: 30 },
              { resourceType: 'exoticMatter', amount: 25 }
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'missile',
                value: 5.0,
                description: 'Increases missile damage by 500%'
              },
              {
                type: 'unlock_weapon',
                target: 'singularity_missile',
                description: 'Unlocks Singularity Missile weapon'
              },
              {
                type: 'weapon_speed',
                target: 'missile',
                value: 1.5,
                description: 'Increases missile speed by 50%'
              }
            ],
            prerequisites: ['quantum_missiles'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'missile_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
      {
        id: 'railgun_tree',
        name: 'Railgun Systems',
        description: 'Electromagnetic projectile weapons',
        icon: '⚡',
        nodes: [
          {
            id: 'railgun_basics',
            title: 'Railgun Technology',
            description: 'Electromagnetic projectile acceleration systems.',
            tier: 1,
            duration: 420,
            costs: [
              { resourceType: 'energy', amount: 80 },
              { resourceType: 'alloys', amount: 35 },
              { resourceType: 'researchPoints', amount: 10 },
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'railgun',
                value: 1.15,
                description: 'Increases railgun weapon damage by 15%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'railgun_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'magnetic_acceleration',
            title: 'Magnetic Acceleration',
            description: 'Enhanced electromagnetic field generators.',
            tier: 2,
            duration: 720,
            costs: [
              { resourceType: 'energy', amount: 150 },
              { resourceType: 'alloys', amount: 50 },
              { resourceType: 'quantumCores', amount: 8 },
            ],
            effects: [
              {
                type: 'weapon_speed',
                target: 'railgun',
                value: 1.4,
                description: 'Increases railgun projectile velocity by 40%'
              }
            ],
            prerequisites: ['railgun_basics'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'railgun_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'plasma_railgun',
            title: 'Plasma Railgun',
            description: 'Plasma-enhanced electromagnetic projectile systems.',
            tier: 3,
            duration: 1800,
            costs: [
              { resourceType: 'energy', amount: 300 },
              { resourceType: 'solarPlasma', amount: 40 },
              { resourceType: 'alloys', amount: 60 },
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'railgun',
                value: 1.6,
                description: 'Further increases railgun damage by 60%'
              },
              {
                type: 'unlock_weapon',
                target: 'plasma_railgun',
                description: 'Unlocks Plasma Railgun weapon type'
              }
            ],
            prerequisites: ['magnetic_acceleration'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'railgun_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'graviton_railgun',
            title: 'Graviton Railgun',
            description: 'Railgun that fires graviton-infused projectiles that warp spacetime.',
            tier: 4,
            duration: 3000, // 50 minutes
            costs: [
              { resourceType: 'energy', amount: 1000 },
              { resourceType: 'solarPlasma', amount: 150 },
              { resourceType: 'alloys', amount: 200 },
              { resourceType: 'darkMatter', amount: 75 },
              { resourceType: 'exoticMatter', amount: 30 }
            ],
            effects: [
              {
                type: 'weapon_damage',
                target: 'railgun',
                value: 4.0,
                description: 'Increases railgun damage by 400%'
              },
              {
                type: 'unlock_weapon',
                target: 'graviton_railgun',
                description: 'Unlocks Graviton Railgun weapon'
              },
              {
                type: 'weapon_speed',
                target: 'railgun',
                value: 3.0,
                description: 'Triples railgun projectile velocity'
              }
            ],
            prerequisites: ['plasma_railgun'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'railgun_tree',
            position: { row: 3, col: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'automation',
    name: 'Automation Systems',
    icon: '🤖',
    color: '#FF9800',
    description: 'Automated systems to improve efficiency and reduce manual labor.',
    trees: [
      {
        id: 'basic_automation_tree',
        name: 'Core Automation',
        description: 'Fundamental automated systems',
        icon: '⚙️',
        nodes: [
          {
            id: 'basic_automation',
            title: 'Basic Automation',
            description: 'Implement basic automated systems for resource processing.',
            tier: 1,
            duration: 240,
            costs: [
              { resourceType: 'energy', amount: 40 },
              { resourceType: 'researchPoints', amount: 10 },
            ],
            effects: [
              {
                type: 'automation',
                target: 'basic_mining',
                value: 1.1,
                description: 'Reduces manual mining time by 10% and adds small passive income'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'basic_automation_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'smart_logistics',
            title: 'Smart Logistics',
            description: 'AI-driven resource management and distribution systems.',
            tier: 2,
            duration: 600,
            costs: [
              { resourceType: 'energy', amount: 100 },
              { resourceType: 'quantumCores', amount: 5 },
            ],
            effects: [
              {
                type: 'increase_capacity',
                target: 'all_resources',
                value: 150,
                description: 'Increases all resource storage capacity by 150'
              },
              {
                type: 'automation',
                target: 'logistics',
                value: 1.2,
                description: 'Improves resource transfer efficiency by 20%'
              }
            ],
            prerequisites: ['basic_automation'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'basic_automation_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'ai_overseer',
            title: 'AI Overseer',
            description: 'Advanced AI system to manage all ship operations.',
            tier: 3,
            duration: 1200,
            costs: [
              { resourceType: 'energy', amount: 200 },
              { resourceType: 'quantumCores', amount: 10 },
              { resourceType: 'darkMatter', amount: 10 },
            ],
            effects: [
              {
                type: 'automation',
                target: 'all_systems',
                value: 1.3,
                description: 'AI optimizes all ship systems for 30% better overall efficiency'
              }
            ],
            prerequisites: ['smart_logistics'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'basic_automation_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'quantum_ai',
            title: 'Quantum AI Core',
            description: 'Quantum-enhanced AI with predictive capabilities.',
            tier: 4,
            duration: 2400, // 40 minutes
            costs: [
              { resourceType: 'energy', amount: 500 },
              { resourceType: 'quantumCores', amount: 25 },
              { resourceType: 'darkMatter', amount: 30 },
              { resourceType: 'exoticMatter', amount: 20 }
            ],
            effects: [
              {
                type: 'automation',
                target: 'quantum_prediction',
                value: 2.0,
                description: 'Quantum AI predicts optimal strategies, doubling all automation efficiency'
              },
              {
                type: 'unlock_feature',
                target: 'quantum_ai_core',
                description: 'Unlocks Quantum AI Core facility'
              }
            ],
            prerequisites: ['ai_overseer'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'basic_automation_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
              {
          id: 'processing_tree',
          name: 'Processing Automation',
          description: 'Automated resource processing systems',
          icon: '🏭',
          nodes: [
            {
              id: 'auto_refinement',
              title: 'Automated Refinement',
              description: 'Automatic material processing and refinement systems.',
              tier: 1,
              duration: 300,
              costs: [
                { resourceType: 'energy', amount: 60 },
                { resourceType: 'alloys', amount: 10 },
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'processing',
                  value: 1.15,
                  description: 'Adds 15% bonus to all resource processing efficiency'
                }
              ],
              prerequisites: [],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'processing_tree',
              position: { row: 0, col: 0 }
            },
            {
              id: 'advanced_processing',
              title: 'Advanced Processing',
              description: 'High-efficiency automated processing systems.',
              tier: 2,
              duration: 540,
              costs: [
                { resourceType: 'energy', amount: 120 },
                { resourceType: 'alloys', amount: 30 },
                { resourceType: 'quantumCores', amount: 6 }
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'processing',
                  value: 1.4,
                  description: 'Increases processing efficiency by 40%'
                },
                {
                  type: 'passive_efficiency',
                  target: 'all_materials',
                  value: 1.15,
                  description: 'Increases all material production by 15%'
                }
              ],
              prerequisites: ['auto_refinement'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'processing_tree',
              position: { row: 1, col: 0 }
            },
            {
              id: 'molecular_assembly',
              title: 'Molecular Assembly',
              description: 'Atom-level precision manufacturing systems.',
              tier: 3,
              duration: 1080,
              costs: [
                { resourceType: 'energy', amount: 250 },
                { resourceType: 'alloys', amount: 80 },
                { resourceType: 'quantumCores', amount: 15 },
                { resourceType: 'darkMatter', amount: 20 }
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'molecular_processing',
                  value: 2.0,
                  description: 'Doubles processing efficiency through molecular precision'
                },
                {
                  type: 'unlock_feature',
                  target: 'molecular_fabricator',
                  description: 'Unlocks molecular fabrication facility'
                }
              ],
              prerequisites: ['advanced_processing'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'processing_tree',
              position: { row: 2, col: 0 }
            },
            {
              id: 'quantum_fabrication',
              title: 'Quantum Fabrication',
              description: 'Quantum-level matter manipulation and creation.',
              tier: 4,
              duration: 2160, // 36 minutes
              costs: [
                { resourceType: 'energy', amount: 600 },
                { resourceType: 'alloys', amount: 200 },
                { resourceType: 'quantumCores', amount: 30 },
                { resourceType: 'darkMatter', amount: 50 },
                { resourceType: 'exoticMatter', amount: 25 }
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'quantum_fabrication',
                  value: 5.0,
                  description: 'Increases fabrication efficiency by 500%'
                },
                {
                  type: 'unlock_feature',
                  target: 'matter_compiler',
                  description: 'Unlocks quantum matter compiler'
                }
              ],
              prerequisites: ['molecular_assembly'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'processing_tree',
              position: { row: 3, col: 0 }
            }
          ]
        },
              {
          id: 'drone_tree',
          name: 'Drone Systems',
          description: 'Autonomous drone fleets',
          icon: '🛸',
          nodes: [
            {
              id: 'basic_drones',
              title: 'Basic Drones',
              description: 'Simple autonomous drones for basic tasks.',
              tier: 1,
              duration: 360,
              costs: [
                { resourceType: 'energy', amount: 50 },
                { resourceType: 'alloys', amount: 20 },
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'basic_tasks',
                  value: 1.1,
                  description: 'Drones assist with basic tasks, improving efficiency by 10%'
                }
              ],
              prerequisites: [],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'drone_tree',
              position: { row: 0, col: 0 }
            },
            {
              id: 'drone_swarms',
              title: 'Drone Swarms',
              description: 'Coordinated autonomous drone fleets for various tasks.',
              tier: 2,
              duration: 480,
              costs: [
                { resourceType: 'energy', amount: 80 },
                { resourceType: 'alloys', amount: 30 },
                { resourceType: 'quantumCores', amount: 4 }
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'exploration',
                  value: 1.25,
                  description: 'Drones automatically scout nearby areas, finding 25% more resources'
                }
              ],
              prerequisites: ['basic_drones'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'drone_tree',
              position: { row: 1, col: 0 }
            },
            {
              id: 'combat_drones',
              title: 'Combat Drones',
              description: 'Armed drones for defense and combat support.',
              tier: 3,
              duration: 900,
              costs: [
                { resourceType: 'energy', amount: 180 },
                { resourceType: 'alloys', amount: 60 },
                { resourceType: 'quantumCores', amount: 12 },
                { resourceType: 'solarPlasma', amount: 25 }
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'combat_support',
                  value: 1.5,
                  description: 'Combat drones provide 50% combat effectiveness boost'
                },
                {
                  type: 'unlock_feature',
                  target: 'drone_bay',
                  description: 'Unlocks combat drone bay'
                }
              ],
              prerequisites: ['drone_swarms'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'drone_tree',
              position: { row: 2, col: 0 }
            },
            {
              id: 'nanodrone_swarm',
              title: 'Nanodrone Swarm',
              description: 'Microscopic self-replicating drone swarms.',
              tier: 4,
              duration: 1800, // 30 minutes
              costs: [
                { resourceType: 'energy', amount: 400 },
                { resourceType: 'alloys', amount: 150 },
                { resourceType: 'quantumCores', amount: 25 },
                { resourceType: 'darkMatter', amount: 40 },
                { resourceType: 'exoticMatter', amount: 15 }
              ],
              effects: [
                {
                  type: 'automation',
                  target: 'nanoscale_operations',
                  value: 3.0,
                  description: 'Nanodrones perform molecular-level tasks, tripling automation efficiency'
                },
                {
                  type: 'unlock_feature',
                  target: 'nanodrone_hive',
                  description: 'Unlocks self-replicating nanodrone hive'
                }
              ],
              prerequisites: ['combat_drones'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'drone_tree',
              position: { row: 3, col: 0 }
            }
          ]
        }
    ]
  },
  {
    id: 'engineering',
    name: 'Ship Engineering',
    icon: '🔧',
    color: '#2196F3',
    description: 'Advanced ship systems and engineering improvements.',
    trees: [
      {
        id: 'hull_tree',
        name: 'Hull Systems',
        description: 'Ship hull and structural improvements',
        icon: '🛡️',
        nodes: [
          {
            id: 'hull_reinforcement',
            title: 'Hull Reinforcement',
            description: 'Strengthen ship hull for better protection and capacity.',
            tier: 1,
            duration: 360,
            costs: [
              { resourceType: 'energy', amount: 50 },
              { resourceType: 'alloys', amount: 40 },
            ],
            effects: [
              {
                type: 'increase_capacity',
                target: 'hull_integrity',
                value: 100,
                description: 'Increases ship hull integrity and general durability'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'hull_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'advanced_hull',
            title: 'Advanced Hull Materials',
            description: 'Next-generation hull materials for superior protection.',
            tier: 2,
            duration: 600,
            costs: [
              { resourceType: 'energy', amount: 100 },
              { resourceType: 'alloys', amount: 80 },
              { resourceType: 'quantumCores', amount: 5 }
            ],
            effects: [
              {
                type: 'increase_capacity',
                target: 'hull_integrity',
                value: 250,
                description: 'Further increases hull integrity and damage resistance'
              },
              {
                type: 'increase_capacity',
                target: 'all_resources',
                value: 100,
                description: 'Increases all resource capacity by 100'
              }
            ],
            prerequisites: ['hull_reinforcement'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'hull_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'modular_design',
            title: 'Modular Ship Design',
            description: 'Redesign ship systems for better modularity and upgrades.',
            tier: 3,
            duration: 1200,
            costs: [
              { resourceType: 'energy', amount: 200 },
              { resourceType: 'alloys', amount: 120 },
              { resourceType: 'quantumCores', amount: 12 }
            ],
            effects: [
              {
                type: 'unlock_slot',
                target: 'upgrade_slots',
                value: 2,
                description: 'Adds 2 additional upgrade module slots'
              }
            ],
            prerequisites: ['advanced_hull'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'hull_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'adaptive_hull',
            title: 'Adaptive Hull System',
            description: 'Self-repairing hull that adapts to different environments.',
            tier: 4,
            duration: 2400, // 40 minutes
            costs: [
              { resourceType: 'energy', amount: 500 },
              { resourceType: 'alloys', amount: 300 },
              { resourceType: 'quantumCores', amount: 25 },
              { resourceType: 'exoticMatter', amount: 20 }
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'self_repair',
                description: 'Hull automatically repairs damage over time'
              },
              {
                type: 'increase_capacity',
                target: 'hull_integrity',
                value: 500,
                description: 'Massively increases hull integrity'
              }
            ],
            prerequisites: ['modular_design'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'hull_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
      {
        id: 'power_tree',
        name: 'Power Systems',
        description: 'Energy generation and distribution',
        icon: '⚡',
        nodes: [
          {
            id: 'power_systems',
            title: 'Advanced Power Systems',
            description: 'More efficient energy generation and distribution.',
            tier: 1,
            duration: 300,
            costs: [
              { resourceType: 'energy', amount: 70 },
              { resourceType: 'quantumCores', amount: 5 },
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'energy',
                value: 1.25,
                description: 'Increases energy generation efficiency by 25%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'power_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'shield_systems',
            title: 'Shield Technology',
            description: 'Develop energy shield systems for ship protection.',
            tier: 2,
            duration: 600,
            costs: [
              { resourceType: 'energy', amount: 150 },
              { resourceType: 'quantumCores', amount: 10 }
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'energy_shields',
                description: 'Unlocks energy shield systems for your ship'
              }
            ],
            prerequisites: ['power_systems'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'power_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'quantum_core',
            title: 'Quantum Core',
            description: 'Ultra-advanced quantum power core for massive energy output.',
            tier: 3,
            duration: 1800,
            costs: [
              { resourceType: 'energy', amount: 300 },
              { resourceType: 'darkMatter', amount: 30 },
              { resourceType: 'quantumCores', amount: 25 },
              { resourceType: 'exoticMatter', amount: 15 },
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'energy',
                value: 2.0,
                description: 'Doubles energy generation capacity'
              },
              {
                type: 'unlock_slot',
                target: 'weapon_slots',
                value: 2,
                description: 'Quantum power enables 2 additional weapon slots'
              }
            ],
            prerequisites: ['shield_systems'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'power_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'zero_point_reactor',
            title: 'Zero Point Reactor',
            description: 'Harness vacuum energy for unlimited power generation.',
            tier: 4,
            duration: 3600, // 60 minutes
            costs: [
              { resourceType: 'energy', amount: 1000 },
              { resourceType: 'darkMatter', amount: 100 },
              { resourceType: 'quantumCores', amount: 50 },
              { resourceType: 'exoticMatter', amount: 50 }
            ],
            effects: [
              {
                type: 'passive_efficiency',
                target: 'energy',
                value: 10.0,
                description: 'Increases energy generation by 1000%'
              },
              {
                type: 'unlock_feature',
                target: 'unlimited_power',
                description: 'Unlocks near-unlimited energy generation'
              }
            ],
            prerequisites: ['quantum_core'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'power_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
              {
          id: 'weapons_mount_tree',
          name: 'Weapon Mounts',
          description: 'Weapon installation and mounting systems',
          icon: '🔫',
          nodes: [
            {
              id: 'weapon_mounts',
              title: 'Additional Weapon Mounts',
              description: 'Install additional hardpoints for weapon systems.',
              tier: 1,
              duration: 480,
              costs: [
                { resourceType: 'energy', amount: 80 },
                { resourceType: 'alloys', amount: 50 }
              ],
              effects: [
                {
                  type: 'unlock_slot',
                  target: 'weapon_slots',
                  value: 1,
                  description: 'Adds 1 additional weapon slot to your ship'
                }
              ],
              prerequisites: [],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'weapons_mount_tree',
              position: { row: 0, col: 0 }
            },
            {
              id: 'heavy_weapon_mounts',
              title: 'Heavy Weapon Mounts',
              description: 'Reinforced mounts for larger weapon systems.',
              tier: 2,
              duration: 720,
              costs: [
                { resourceType: 'energy', amount: 150 },
                { resourceType: 'alloys', amount: 100 },
                { resourceType: 'quantumCores', amount: 8 }
              ],
              effects: [
                {
                  type: 'unlock_slot',
                  target: 'weapon_slots',
                  value: 1,
                  description: 'Adds 1 additional heavy weapon slot'
                },
                {
                  type: 'weapon_damage',
                  target: 'all_weapons',
                  value: 1.15,
                  description: 'Increases all weapon damage by 15%'
                }
              ],
              prerequisites: ['weapon_mounts'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'weapons_mount_tree',
              position: { row: 1, col: 0 }
            },
            {
              id: 'adaptive_weapon_systems',
              title: 'Adaptive Weapon Systems',
              description: 'Modular weapon mounts that can adapt to any weapon type.',
              tier: 3,
              duration: 1440,
              costs: [
                { resourceType: 'energy', amount: 300 },
                { resourceType: 'alloys', amount: 200 },
                { resourceType: 'quantumCores', amount: 15 },
                { resourceType: 'darkMatter', amount: 25 }
              ],
              effects: [
                {
                  type: 'unlock_slot',
                  target: 'weapon_slots',
                  value: 2,
                  description: 'Adds 2 additional adaptive weapon slots'
                },
                {
                  type: 'unlock_feature',
                  target: 'weapon_swapping',
                  description: 'Allows instant weapon type changes in combat'
                }
              ],
              prerequisites: ['heavy_weapon_mounts'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'weapons_mount_tree',
              position: { row: 2, col: 0 }
            },
            {
              id: 'omnidirectional_arrays',
              title: 'Omnidirectional Weapon Arrays',
              description: 'Weapon systems that can fire in all directions simultaneously.',
              tier: 4,
              duration: 2700, // 45 minutes
              costs: [
                { resourceType: 'energy', amount: 600 },
                { resourceType: 'alloys', amount: 400 },
                { resourceType: 'quantumCores', amount: 30 },
                { resourceType: 'darkMatter', amount: 50 },
                { resourceType: 'exoticMatter', amount: 25 }
              ],
              effects: [
                {
                  type: 'unlock_slot',
                  target: 'weapon_slots',
                  value: 3,
                  description: 'Adds 3 additional omnidirectional weapon slots'
                },
                {
                  type: 'weapon_speed',
                  target: 'all_weapons',
                  value: 2.0,
                  description: 'Doubles all weapon firing rates'
                }
              ],
              prerequisites: ['adaptive_weapon_systems'],
              completed: false,
              inProgress: false,
              progress: 0,
              treeId: 'weapons_mount_tree',
              position: { row: 3, col: 0 }
            }
          ]
        }
    ]
  },
  {
    id: 'exploration',
    name: 'Exploration Tech',
    icon: '🚀',
    color: '#9C27B0',
    description: 'Advanced exploration and navigation technologies.',
    trees: [
      {
        id: 'sensors_tree',
        name: 'Sensor Systems',
        description: 'Advanced detection and scanning technology',
        icon: '📡',
        nodes: [
          {
            id: 'long_range_sensors',
            title: 'Long Range Sensors',
            description: 'Extended sensor range for better exploration.',
            tier: 1,
            duration: 240,
            costs: [
              { resourceType: 'energy', amount: 45 },
              { resourceType: 'researchPoints', amount: 12 },
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'extended_sensors',
                description: 'Reveals more information about distant objects and increases exploration range'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'sensors_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'deep_space_scanners',
            title: 'Deep Space Scanners',
            description: 'Advanced scanners for detecting distant phenomena.',
            tier: 2,
            duration: 480,
            costs: [
              { resourceType: 'energy', amount: 80 },
              { resourceType: 'quantumCores', amount: 6 }
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'deep_scanning',
                description: 'Reveals hidden objects and rare resources in distant systems'
              }
            ],
            prerequisites: ['long_range_sensors'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'sensors_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'quantum_navigation',
            title: 'Quantum Navigation',
            description: 'Quantum-enhanced navigation for precise jumps.',
            tier: 3,
            duration: 900,
            costs: [
              { resourceType: 'energy', amount: 200 },
              { resourceType: 'darkMatter', amount: 25 },
              { resourceType: 'quantumCores', amount: 12 }
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'precise_jumps',
                description: 'Unlocks ability to target specific coordinates for exploration'
              }
            ],
            prerequisites: ['deep_space_scanners'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'sensors_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'omniscient_sensors',
            title: 'Omniscient Sensor Array',
            description: 'Sensors that can detect anything across multiple dimensions.',
            tier: 4,
            duration: 1800, // 30 minutes
            costs: [
              { resourceType: 'energy', amount: 500 },
              { resourceType: 'darkMatter', amount: 60 },
              { resourceType: 'quantumCores', amount: 25 },
              { resourceType: 'exoticMatter', amount: 20 }
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'omniscient_detection',
                description: 'Reveals all hidden content in explored and unexplored systems'
              }
            ],
            prerequisites: ['quantum_navigation'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'sensors_tree',
            position: { row: 3, col: 0 }
          }
        ]
      },
      {
        id: 'propulsion_tree',
        name: 'Propulsion Systems',
        description: 'Advanced movement and travel technology',
        icon: '🔥',
        nodes: [
          {
            id: 'efficient_thrusters',
            title: 'Efficient Thrusters',
            description: 'More fuel-efficient propulsion systems.',
            tier: 1,
            duration: 300,
            costs: [
              { resourceType: 'energy', amount: 50 },
              { resourceType: 'fuel', amount: 30 },
              { resourceType: 'alloys', amount: 15 },
            ],
            effects: [
              {
                type: 'automation',
                target: 'movement',
                value: 0.8,
                description: 'Reduces fuel consumption for travel by 20%'
              }
            ],
            prerequisites: [],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'propulsion_tree',
            position: { row: 0, col: 0 }
          },
          {
            id: 'warp_drive',
            title: 'Warp Drive Technology',
            description: 'Faster-than-light travel capabilities.',
            tier: 2,
            duration: 900,
            costs: [
              { resourceType: 'energy', amount: 150 },
              { resourceType: 'fuel', amount: 80 },
              { resourceType: 'darkMatter', amount: 20 },
            ],
            effects: [
              {
                type: 'automation',
                target: 'exploration_speed',
                value: 2.0,
                description: 'Doubles exploration travel speed'
              }
            ],
            prerequisites: ['efficient_thrusters'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'propulsion_tree',
            position: { row: 1, col: 0 }
          },
          {
            id: 'dimensional_phase',
            title: 'Dimensional Phase Drive',
            description: 'Phase through dimensions for instant travel.',
            tier: 3,
            duration: 2100,
            costs: [
              { resourceType: 'energy', amount: 400 },
              { resourceType: 'darkMatter', amount: 50 },
              { resourceType: 'exoticMatter', amount: 25 },
              { resourceType: 'quantumCores', amount: 15 },
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'instant_travel',
                description: 'Unlocks instant travel to any explored location'
              }
            ],
            prerequisites: ['warp_drive'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'propulsion_tree',
            position: { row: 2, col: 0 }
          },
          {
            id: 'reality_engine',
            title: 'Reality Engine',
            description: 'Manipulate spacetime itself to travel anywhere instantly.',
            tier: 4,
            duration: 3000, // 50 minutes
            costs: [
              { resourceType: 'energy', amount: 1000 },
              { resourceType: 'darkMatter', amount: 150 },
              { resourceType: 'exoticMatter', amount: 75 },
              { resourceType: 'quantumCores', amount: 40 }
            ],
            effects: [
              {
                type: 'unlock_feature',
                target: 'reality_manipulation',
                description: 'Unlocks reality manipulation for ultimate exploration'
              },
              {
                type: 'automation',
                target: 'exploration_speed',
                value: 10.0,
                description: 'Increases exploration speed by 1000%'
              }
            ],
            prerequisites: ['dimensional_phase'],
            completed: false,
            inProgress: false,
            progress: 0,
            treeId: 'propulsion_tree',
            position: { row: 3, col: 0 }
          }
        ]
      }
    ]
  },
];

export default researchData; 