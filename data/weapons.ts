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
}

// Utility function to calculate durability based on total cost
const calculateDurability = (costs: { resourceType: string; amount: number }[]): number => {
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
  return Math.floor(totalCost / 100); // Example: 1 durability per 100 total cost
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


const blasters: IWeapon[] = [
  {
    id: "light_plasma_blaster",
    title: "Light Plasma Blaster",
    icon: require("@/assets/images/blasters/light-blaster.webp"), // Icon reference
    description: (level: number) =>
      `A compact and efficient plasma weapon, the Light Plasma Blaster delivers rapid bursts of energized plasma at close range. Ideal for agile skirmish vessels, it balances speed and power.`,
    costs: [
      { resourceType: "energy", amount: 800 },
      { resourceType: "solarPlasma", amount: 400 },
      { resourceType: "fuel", amount: 300 },
    ],
    weaponDetails: {
      name: "Light Plasma Blaster",
      power: 10,
      accuracy: 95,
      cooldown: 1.5,
      cost: { type: "solarPlasma", amount: 50 },
      type: "blaster" as "blaster",
      category: "Small" as "Small",
    },
  },
  {
    id: "medium_plasma_blaster",
    title: "Medium Plasma Blaster",
    icon: require("@/assets/images/blasters/medium-blaster.webp"),
    description: (level: number) =>
      `The Medium Plasma Blaster is a mid-sized weapon optimized for frigates and cruisers. It delivers concentrated plasma bursts, providing a balance between range and damage output.`,
    costs: [
      { resourceType: "energy", amount: 1200 },
      { resourceType: "solarPlasma", amount: 600 },
      { resourceType: "fuel", amount: 500 },
    ],
    weaponDetails: {
      name: "Medium Plasma Blaster",
      power: 22,
      accuracy: 90,
      cooldown: 2.5,
      cost: { type: "solarPlasma", amount: 90 },
      type: "blaster" as "blaster",
      category: "Medium" as "Medium",
    },
  },
  {
    id: "heavy_plasma_blaster",
    title: "Heavy Plasma Blaster",
    icon: require("@/assets/images/blasters/heavy-blaster.webp"),
    description: (level: number) =>
      `A destructive plasma weapon designed for capital-class ships. The Heavy Plasma Blaster discharges massive plasma bursts capable of melting through reinforced hulls.`,
    costs: [
      { resourceType: "energy", amount: 2000 },
      { resourceType: "solarPlasma", amount: 1000 },
      { resourceType: "fuel", amount: 900 },
    ],
    weaponDetails: {
      name: "Heavy Plasma Blaster",
      power: 35,
      accuracy: 85,
      cooldown: 4,
      cost: { type: "solarPlasma", amount: 150 },
      type: "blaster" as "blaster",
      category: "Large" as "Large",
    },
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
      { resourceType: "energy", amount: 1000 },
      { resourceType: "fuel", amount: 350 }],
    weaponDetails: {
      name: "Light Pulse Laser",
      power: 12,
      accuracy: 98,
      cooldown: 1.2,
      cost: { type: "fuel", amount: 35 },
      type: "laser" as "laser",
      category: "Small" as "Small"
    },
  },
  {
    id: "medium_beam_laser",
    title: "Medium Beam Laser",
    icon: require("@/assets/images/lasers/medium-pulse-laser.png"),
    description: (level: number) =>
      `The Medium Beam Laser combines range with firepower, delivering sustained beams capable of cutting through advanced shielding systems.`,
    costs: [
      { resourceType: "energy", amount: 1500 },
      { resourceType: "fuel", amount: 650 }],
    weaponDetails: {
      name: "Medium Beam Laser",
      power: 25,
      accuracy: 95,
      cooldown: 2.2,
      cost: { type: "fuel", amount: 75 },
      type: "laser" as "laser",
      category: "Medium" as "Medium",
    },
  },
  {
    id: "heavy_beam_laser",
    title: "Heavy Beam Laser",
    icon: require("@/assets/images/lasers/heavy-pulse-laser.png"),
    description: (level: number) =>
      `Unleashing unparalleled energy, the Heavy Beam Laser provides devastating beams capable of annihilating reinforced capital ships.`,
    costs: [
      { resourceType: "energy", amount: 2500 },
      { resourceType: "fuel", amount: 1200 }],
    weaponDetails: {
      name: "Heavy Beam Laser",
      power: 45,
      accuracy: 90,
      cooldown: 3.5,
      cost: { type: "fuel", amount: 120 },
      type: "laser" as "laser",
      category: "Large" as "Large",
    },
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
      { resourceType: "energy", amount: 1200 },
      { resourceType: "frozenHydrogen", amount: 250 }],
    weaponDetails: {
      name: "Light Rocket Launcher",
      power: 15,
      accuracy: 75,
      cooldown: 4,
      cost: { type: "frozenHydrogen", amount: 40 },
      type: "missile" as "missile",
      category: "Small" as "Small",
    },
  },
  {
    id: "medium_missile_launcher",
    title: "Medium Missile Launcher",
    icon: require("@/assets/images/missiles/medium-missile-launcher.png"),
    description: (level: number) =>
      `Designed for cruisers, the Medium Missile Launcher delivers precision-guided warheads with enhanced damage and speed.`,
    costs: [
      { resourceType: "energy", amount: 2000 },
      { resourceType: "frozenHydrogen", amount: 700 }],
    weaponDetails: {
      name: "Medium Missile Launcher",
      power: 35,
      accuracy: 65,
      cooldown: 8,
      cost: { type: "frozenHydrogen", amount: 80 },
      type: "missile" as "missile",
      category: "Medium" as "Medium",
    },
  },
  {
    id: "heavy_torpedo_launcher",
    title: "Heavy Torpedo Launcher",
    icon: require("@/assets/images/missiles/large-missile-launcher.png"),
    description: (level: number) =>
      `The Heavy Torpedo Launcher is engineered to deliver massive explosive force, ideal for devastating capital-class ships.`,
    costs: [
      { resourceType: "energy", amount: 3000 },
      { resourceType: "frozenHydrogen", amount: 1200 }],
    weaponDetails: {
      name: "Heavy Torpedo Launcher",
      power: 60,
      accuracy: 50,
      cooldown: 12,
      cost: { type: "frozenHydrogen", amount: 150 },
      type: "missile" as "missile",
      category: "Large" as "Large",
    },
  },
].map(withDurability);

const railguns: IWeapon[] = [
  {
    id: "light_railgun",
    title: "Light Railgun",
    icon: require("@/assets/images/railguns/light-railgun.png"),
    description: (level: number) =>
      `Employing electromagnetic force, the Light Railgun launches projectiles with pinpoint accuracy over long distances.`,
    costs: [
      { resourceType: "energy", amount: 1800 },
      { resourceType: "alloys", amount: 400 }],
    weaponDetails: {
      name: "Light Railgun",
      power: 18,
      accuracy: 85,
      cooldown: 3,
      cost: { type: "alloys", amount: 60 },
      type: "railgun" as "railgun",
      category: "Small" as "Small",
    },
  },
  {
    id: "medium_railgun",
    title: "Medium Railgun",
    icon: require("@/assets/images/railguns/medium-railgun.png"),
    description: (level: number) =>
      `The Medium Railgun combines precision with destructive power, perfect for anti-frigate and anti-cruiser operations.`,
    costs: [
      { resourceType: "energy", amount: 3000 },
      { resourceType: "alloys", amount: 900 }],
    weaponDetails: {
      name: "Medium Railgun",
      power: 45,
      accuracy: 70,
      cooldown: 6,
      cost: { type: "alloys", amount: 120 },
      type: "railgun" as "railgun",
      category: "Medium" as "Medium",
    },
  },
  {
    id: "heavy_railgun",
    title: "Heavy Railgun",
    icon: require("@/assets/images/railguns/large-railgun.png"),
    description: (level: number) =>
      `A pinnacle of kinetic weaponry, the Heavy Railgun is engineered to destroy even the most heavily armored targets.`,
    costs: [
      { resourceType: "energy", amount: 5000 },
      { resourceType: "alloys", amount: 2000 }],
    weaponDetails: {
      name: "Heavy Railgun",
      power: 85,
      accuracy: 60,
      cooldown: 10,
      cost: { type: "alloys", amount: 250 },
      type: "railgun" as "railgun",
      category: "Large" as "Large",
    },
  },
].map(withDurability);

const initialWeapons: IWeapon[] = [...blasters, ...lasers, ...missiles, ...railguns];

export default initialWeapons;
