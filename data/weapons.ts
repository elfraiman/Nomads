import { ImageSourcePropType } from "react-native";

export interface IWeapon {
  id: string;
  title: string;
  uniqueId?: string;
  icon?: ImageSourcePropType;
  description: (level: number) => string;
  costs: { resourceType: string; amount: number }[];
  weaponDetails: {
    name: string;
    power: number;
    accuracy: number;
    cooldown: number;
    cost: { type: string; amount: number };
    type: "blaster" | "laser" | "missile" | "railgun";
    durability: number; // Current durability
    maxDurability: number; // Maximum durability
    category: "Small" | "Medium" | "Large";
  };
  amount: number;
}

// Utility function to calculate durability based on total cost using square root scaling
const calculateDurability = (costs: { resourceType: string; amount: number }[]): number => {
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
  return Math.floor(Math.sqrt(totalCost * 2)); // Square root scaling for durability
};

// Utility function to add durability to weapons
const withDurability = (weapon: Omit<IWeapon, "weaponDetails"> & { weaponDetails: Omit<IWeapon["weaponDetails"], "durability" | "maxDurability"> }): IWeapon => ({
  ...weapon,
  weaponDetails: {
    ...weapon.weaponDetails,
    durability: calculateDurability(weapon.costs),
    maxDurability: calculateDurability(weapon.costs),
  },
});

// Rebalanced progression formulas:
// Small Weapons: 200-400 total cost (early game accessible)
// Medium Weapons: 500-800 total cost (mid game)  
// Large Weapons: 1000-1500 total cost (late game)
// Costs follow geometric progression for balanced scaling

const blasters: IWeapon[] = [
  {
    id: "light_plasma_blaster",
    title: "Light Plasma Blaster",
    icon: require("@/assets/images/blasters/light-blaster.webp"),
    description: (level: number) =>
      `A compact and efficient plasma weapon, the Light Plasma Blaster delivers rapid bursts of energized plasma at close range. Ideal for agile skirmish vessels, it balances speed and power.`,
    costs: [
      { resourceType: "energy", amount: 200 },
      { resourceType: "solarPlasma", amount: 100 },
      { resourceType: "fuel", amount: 75 },
    ],
    weaponDetails: {
      name: "Light Plasma Blaster",
      power: 18, // Small weapon base power
      accuracy: 95,
      cooldown: 3,
      cost: { type: "solarPlasma", amount: 25 },
      type: "blaster" as "blaster",
      category: "Small" as "Small",
    },
    amount: 0,
  },
  {
    id: "medium_plasma_blaster",
    title: "Medium Plasma Blaster",
    icon: require("@/assets/images/blasters/medium-blaster.webp"),
    description: (level: number) =>
      `The Medium Plasma Blaster is a mid-sized weapon optimized for frigates and cruisers. It delivers concentrated plasma bursts, providing a balance between range and damage output.`,
    costs: [
      { resourceType: "energy", amount: 400 },
      { resourceType: "solarPlasma", amount: 200 },
      { resourceType: "fuel", amount: 150 },
    ],
    weaponDetails: {
      name: "Medium Plasma Blaster",
      power: 28, // Medium weapon base power
      accuracy: 90,
      cooldown: 5,
      cost: { type: "solarPlasma", amount: 45 },
      type: "blaster" as "blaster",
      category: "Medium" as "Medium",
    },
    amount: 0,
  },
  {
    id: "heavy_plasma_blaster",
    title: "Heavy Plasma Blaster",
    icon: require("@/assets/images/blasters/heavy-blaster.webp"),
    description: (level: number) =>
      `A destructive plasma weapon designed for capital-class ships. The Heavy Plasma Blaster discharges massive plasma bursts capable of melting through reinforced hulls.`,
    costs: [
      { resourceType: "energy", amount: 800 },
      { resourceType: "solarPlasma", amount: 400 },
      { resourceType: "fuel", amount: 300 },
    ],
    weaponDetails: {
      name: "Heavy Plasma Blaster",
      power: 42, // Large weapon base power
      accuracy: 85,
      cooldown: 8,
      cost: { type: "solarPlasma", amount: 75 },
      type: "blaster" as "blaster",
      category: "Large" as "Large",
    },
    amount: 0,
  },
].map(withDurability);

const lasers: IWeapon[] = [
  {
    id: "light_pulse_laser",
    title: "Light Pulse Laser",
    icon: require("@/assets/images/lasers/light-pulse-laser.png"),
    description: (level: number) =>
      `Designed for precision strikes, the Light Pulse Laser emits rapid pulses of focused light energy, perfect for surgical hits on smaller targets.`,
    costs: [
      { resourceType: "energy", amount: 250 },
      { resourceType: "fuel", amount: 100 }],
    weaponDetails: {
      name: "Light Pulse Laser",
      power: 20, // Small weapon base power (slightly higher for precision)
      accuracy: 98,
      cooldown: 2.4,
      cost: { type: "fuel", amount: 15 },
      type: "laser" as "laser",
      category: "Small" as "Small"
    },
    amount: 0,
  },
  {
    id: "medium_beam_laser",
    title: "Medium Beam Laser",
    icon: require("@/assets/images/lasers/medium-pulse-laser.png"),
    description: (level: number) =>
      `The Medium Beam Laser combines range with firepower, delivering sustained beams capable of cutting through advanced shielding systems.`,
    costs: [
      { resourceType: "energy", amount: 500 },
      { resourceType: "fuel", amount: 200 }],
    weaponDetails: {
      name: "Medium Beam Laser",
      power: 32, // Medium weapon base power
      accuracy: 95,
      cooldown: 4.4,
      cost: { type: "fuel", amount: 35 },
      type: "laser" as "laser",
      category: "Medium" as "Medium",
    },
    amount: 0,
  },
  {
    id: "heavy_beam_laser",
    title: "Heavy Beam Laser",
    icon: require("@/assets/images/lasers/heavy-pulse-laser.png"),
    description: (level: number) =>
      `Unleashing unparalleled energy, the Heavy Beam Laser provides devastating beams capable of annihilating reinforced capital ships.`,
    costs: [
      { resourceType: "energy", amount: 1000 },
      { resourceType: "fuel", amount: 400 }],
    weaponDetails: {
      name: "Heavy Beam Laser",
      power: 48, // Large weapon base power
      accuracy: 90,
      cooldown: 7,
      cost: { type: "fuel", amount: 65 },
      type: "laser" as "laser",
      category: "Large" as "Large",
    },
    amount: 0,
  },
].map(withDurability);

const missiles: IWeapon[] = [
  {
    id: "light_rocket_launcher",
    title: "Light Rocket Launcher",
    icon: require("@/assets/images/missiles/light-rocket-launcher.png"),
    description: (level: number) =>
      `A versatile rocket launcher for high-speed crafts, the Light Rocket Launcher excels in delivering quick and accurate explosive payloads.`,
    costs: [
      { resourceType: "energy", amount: 300 },
      { resourceType: "frozenHydrogen", amount: 100 }],
    weaponDetails: {
      name: "Light Rocket Launcher",
      power: 22, // Small weapon with explosive bonus
      accuracy: 75,
      cooldown: 8,
      cost: { type: "frozenHydrogen", amount: 20 },
      type: "missile" as "missile",
      category: "Small" as "Small",
    },
    amount: 0,
  },
  {
    id: "medium_missile_launcher",
    title: "Medium Missile Launcher",
    icon: require("@/assets/images/missiles/medium-missile-launcher.png"),
    description: (level: number) =>
      `Designed for cruisers, the Medium Missile Launcher delivers precision-guided warheads with enhanced damage and speed.`,
    costs: [
      { resourceType: "energy", amount: 600 },
      { resourceType: "frozenHydrogen", amount: 200 }],
    weaponDetails: {
      name: "Medium Missile Launcher",
      power: 35, // Medium weapon with explosive bonus
      accuracy: 80,
      cooldown: 12,
      cost: { type: "frozenHydrogen", amount: 45 },
      type: "missile" as "missile",
      category: "Medium" as "Medium",
    },
    amount: 0,
  },
  {
    id: "heavy_missile_launcher",
    title: "Heavy Missile Launcher",
    icon: require("@/assets/images/missiles/heavy-missile-launcher.png"),
    description: (level: number) =>
      `The ultimate in missile technology, the Heavy Missile Launcher fires devastating warheads capable of obliterating entire formations.`,
    costs: [
      { resourceType: "energy", amount: 1200 },
      { resourceType: "frozenHydrogen", amount: 400 }],
    weaponDetails: {
      name: "Heavy Missile Launcher",
      power: 52, // Large weapon with explosive bonus
      accuracy: 75,
      cooldown: 16,
      cost: { type: "frozenHydrogen", amount: 80 },
      type: "missile" as "missile",
      category: "Large" as "Large",
    },
    amount: 0,
  },
].map(withDurability);

const railguns: IWeapon[] = [
  {
    id: "light_railgun",
    title: "Light Railgun",
    icon: require("@/assets/images/railguns/light-railgun.png"),
    description: (level: number) =>
      `Using electromagnetic fields to accelerate projectiles, the Light Railgun delivers kinetic strikes with incredible velocity and precision.`,
    costs: [
      { resourceType: "energy", amount: 400 },
      { resourceType: "alloys", amount: 75 }],
    weaponDetails: {
      name: "Light Railgun",
      power: 25, // Small weapon with armor penetration bonus
      accuracy: 92,
      cooldown: 6,
      cost: { type: "alloys", amount: 10 },
      type: "railgun" as "railgun",
      category: "Small" as "Small",
    },
    amount: 0,
  },
  {
    id: "medium_railgun",
    title: "Medium Railgun",
    icon: require("@/assets/images/railguns/medium-railgun.png"),
    description: (level: number) =>
      `The Medium Railgun combines devastating kinetic energy with tactical versatility, perfect for engaging armored targets at range.`,
    costs: [
      { resourceType: "energy", amount: 800 },
      { resourceType: "alloys", amount: 150 }],
    weaponDetails: {
      name: "Medium Railgun",
      power: 38, // Medium weapon with armor penetration bonus
      accuracy: 88,
      cooldown: 10,
      cost: { type: "alloys", amount: 25 },
      type: "railgun" as "railgun",
      category: "Medium" as "Medium",
    },
    amount: 0,
  },
  {
    id: "heavy_railgun",
    title: "Heavy Railgun",
    icon: require("@/assets/images/railguns/heavy-railgun.png"),
    description: (level: number) =>
      `The pinnacle of kinetic warfare, the Heavy Railgun launches projectiles at near-light speed, capable of piercing any known armor.`,
    costs: [
      { resourceType: "energy", amount: 1600 },
      { resourceType: "alloys", amount: 300 }],
    weaponDetails: {
      name: "Heavy Railgun",
      power: 55, // Large weapon with armor penetration bonus
      accuracy: 85,
      cooldown: 14,
      cost: { type: "alloys", amount: 45 },
      type: "railgun" as "railgun",
      category: "Large" as "Large",
    },
    amount: 0,
  },
].map(withDurability);

export const allWeapons: IWeapon[] = [
  ...blasters,
  ...lasers,
  ...missiles,
  ...railguns,
];

export { blasters, lasers, missiles, railguns };
