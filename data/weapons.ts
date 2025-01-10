export interface IWeapon {
  id: string;
  title: string;
  uniqueId?: string;
  description: (level: number) => string;
  costs: { resourceType: string; amount: number }[];
  baseCostMultiplier: number;
  weaponDetails: {
    name: string;
    power: number;
    attackSpeed: number;
    cooldown: number;
    cost: { type: string; amount: number };
    type: "blaster" | "laser" | "missile" | "railgun";
    durability: number; // Current durability
    maxDurability: number; // Maximum durability
  };
  amount: number;
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
    description: (level: number) =>
      `A compact and efficient plasma weapon, the Light Plasma Blaster delivers rapid bursts of energized plasma at close range. Ideal for agile skirmish vessels, it balances speed and power.`,
    costs: [
      { resourceType: "energy", amount: 1000 },
      { resourceType: "solarPlasma", amount: 500 },
      { resourceType: "fuel", amount: 400 },
    ],
    weaponDetails: {
      name: "Light Plasma Blaster",
      power: 10,
      attackSpeed: 2,
      cooldown: 4,
      cost: { type: "solarPlasma", amount: 75 },
      type: "blaster" as "blaster",
    },
    baseCostMultiplier: 1.5,
    amount: 0,
  },
  {
    id: "medium_plasma_blaster",
    title: "Medium Plasma Blaster",
    description: (level: number) =>
      `The Medium Plasma Blaster is a mid-sized weapon optimized for frigates and cruisers. It delivers concentrated plasma bursts, providing a balance between range and damage output.`,
    costs: [
      { resourceType: "energy", amount: 1500 },
      { resourceType: "solarPlasma", amount: 750 },
      { resourceType: "fuel", amount: 650 },
    ],
    weaponDetails: {
      name: "Medium Plasma Blaster",
      power: 20,
      attackSpeed: 3,
      cooldown: 6,
      cost: { type: "solarPlasma", amount: 125 },
      type: "blaster" as "blaster",
    },
    baseCostMultiplier: 1.8,
    amount: 0,
  },
  {
    id: "heavy_plasma_blaster",
    title: "Heavy Plasma Blaster",
    description: (level: number) =>
      `A destructive plasma weapon designed for capital-class ships. The Heavy Plasma Blaster discharges massive plasma bursts capable of melting through reinforced hulls.`,
    costs: [
      { resourceType: "energy", amount: 2200 },
      { resourceType: "solarPlasma", amount: 1000 },
      { resourceType: "fuel", amount: 950 },
    ],
    weaponDetails: {
      name: "Heavy Plasma Blaster",
      power: 30,
      attackSpeed: 4,
      cooldown: 16,
      cost: { type: "solarPlasma", amount: 200 },
      type: "blaster" as "blaster",
    },
    baseCostMultiplier: 2.0,
    amount: 0,
  },
].map(withDurability);

const lasers: IWeapon[] = [
  {
    id: "light_pulse_laser",
    title: "Light Pulse Laser",
    description: (level: number) =>
      `Designed for precision strikes, the Light Pulse Laser emits rapid pulses of focused light energy, perfect for surgical hits on smaller targets.`,
    costs: [{ resourceType: "fuel", amount: 400 }],
    weaponDetails: {
      name: "Light Pulse Laser",
      power: 15,
      attackSpeed: 3,
      cooldown: 5,
      cost: { type: "fuel", amount: 40 },
      type: "laser" as "laser",
    },
    baseCostMultiplier: 1.7,
    amount: 0,
  },
  {
    id: "medium_beam_laser",
    title: "Medium Beam Laser",
    description: (level: number) =>
      `The Medium Beam Laser combines range with firepower, delivering sustained beams capable of cutting through advanced shielding systems.`,
    costs: [{ resourceType: "fuel", amount: 800 }],
    weaponDetails: {
      name: "Medium Beam Laser",
      power: 25,
      attackSpeed: 4,
      cooldown: 9,
      cost: { type: "fuel", amount: 80 },
      type: "laser" as "laser",
    },
    baseCostMultiplier: 2.3,
    amount: 0,
  },
  {
    id: "heavy_beam_laser",
    title: "Heavy Beam Laser",
    description: (level: number) =>
      `Unleashing unparalleled energy, the Heavy Beam Laser provides devastating beams capable of annihilating reinforced capital ships.`,
    costs: [{ resourceType: "fuel", amount: 1600 }],
    weaponDetails: {
      name: "Heavy Beam Laser",
      power: 40,
      attackSpeed: 6,
      cooldown: 15,
      cost: { type: "fuel", amount: 160 },
      type: "laser" as "laser",
    },
    baseCostMultiplier: 3.2,
    amount: 0,
  },
].map(withDurability);

const missiles: IWeapon[] = [
  {
    id: "light_rocket_launcher",
    title: "Light Rocket Launcher",
    description: (level: number) =>
      `A versatile rocket launcher for high-speed crafts, the Light Rocket Launcher excels in delivering quick and accurate explosive payloads.`,
    costs: [{ resourceType: "frozenHydrogen", amount: 300 }],
    weaponDetails: {
      name: "Light Rocket Launcher",
      power: 12,
      attackSpeed: 4,
      cooldown: 6,
      cost: { type: "frozenHydrogen", amount: 30 },
      type: "missile" as "missile",
    },
    baseCostMultiplier: 1.8,
    amount: 0,
  },
  {
    id: "medium_missile_launcher",
    title: "Medium Missile Launcher",
    description: (level: number) =>
      `Designed for cruisers, the Medium Missile Launcher delivers precision-guided warheads with enhanced damage and speed.`,
    costs: [{ resourceType: "frozenHydrogen", amount: 700 }],
    weaponDetails: {
      name: "Medium Missile Launcher",
      power: 30,
      attackSpeed: 6,
      cooldown: 10,
      cost: { type: "frozenHydrogen", amount: 70 },
      type: "missile" as "missile",
    },
    baseCostMultiplier: 2.5,
    amount: 0,
  },
  {
    id: "heavy_torpedo_launcher",
    title: "Heavy Torpedo Launcher",
    description: (level: number) =>
      `The Heavy Torpedo Launcher is engineered to deliver massive explosive force, ideal for devastating capital-class ships.`,
    costs: [{ resourceType: "frozenHydrogen", amount: 1500 }],
    weaponDetails: {
      name: "Heavy Torpedo Launcher",
      power: 50,
      attackSpeed: 8,
      cooldown: 20,
      cost: { type: "frozenHydrogen", amount: 150 },
      type: "missile" as "missile",
    },
    baseCostMultiplier: 3.5,
    amount: 0,
  },
].map(withDurability);

const railguns: IWeapon[] = [
  {
    id: "light_railgun",
    title: "Light Railgun",
    description: (level: number) =>
      `Employing electromagnetic force, the Light Railgun launches projectiles with pinpoint accuracy over long distances.`,
    costs: [{ resourceType: "alloys", amount: 600 }],
    weaponDetails: {
      name: "Light Railgun",
      power: 20,
      attackSpeed: 5,
      cooldown: 8,
      cost: { type: "alloys", amount: 60 },
      type: "railgun" as "railgun",
    },
    baseCostMultiplier: 2.0,
    amount: 0,
  },
  {
    id: "medium_railgun",
    title: "Medium Railgun",
    description: (level: number) =>
      `The Medium Railgun combines precision with destructive power, perfect for anti-frigate and anti-cruiser operations.`,
    costs: [{ resourceType: "alloys", amount: 1200 }],
    weaponDetails: {
      name: "Medium Railgun",
      power: 40,
      attackSpeed: 7,
      cooldown: 14,
      cost: { type: "alloys", amount: 120 },
      type: "railgun" as "railgun",
    },
    baseCostMultiplier: 2.8,
    amount: 0,
  },
  {
    id: "heavy_railgun",
    title: "Heavy Railgun",
    description: (level: number) =>
      `A pinnacle of kinetic weaponry, the Heavy Railgun is engineered to destroy even the most heavily armored targets.`,
    costs: [{ resourceType: "alloys", amount: 2500 }],
    weaponDetails: {
      name: "Heavy Railgun",
      power: 60,
      attackSpeed: 10,
      cooldown: 25,
      cost: { type: "alloys", amount: 250 },
      type: "railgun" as "railgun",
    },
    baseCostMultiplier: 4.0,
    amount: 0,
  },
].map(withDurability);

const initialWeapons: IWeapon[] = [...blasters, ...lasers, ...missiles, ...railguns];

export default initialWeapons;
