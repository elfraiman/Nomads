

export interface IWeapon {
  id: string;
  title: string;
  description: (level: number) => string;
  costs: { resourceType: string; amount: number }[];
  baseCostMultiplier: number;
  weaponDetails: {
    name: string;
    power: number;
    attackSpeed: number;
    cost: { type: string, amount: number };
  };
  level: number;
}


const initialWeapons: IWeapon[] = [
  {
    id: "light_plasma_blaster",
    title: "Light Plasma Blaster",
    description: (level: number) =>
      `Build and equip your ship with a Light Plasma Blaster (+10 damage, 2 Attack speed), A fast and resource efficient weapon.`,
    costs: [
      { resourceType: "energy", amount: 1000 },
      { resourceType: "solarPlasma", amount: 500 },
      { resourceType: "fuel", amount: 400 },
    ],
    weaponDetails: {
      name: "Light Plasma Blaster",
      power: 10,
      attackSpeed: 2,
      cost: { type: "solarPlasma", amount: 75 },

    },
    baseCostMultiplier: 1.5,
    level: 0,
  },
]


export default initialWeapons;