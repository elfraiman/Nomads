export const calculateHitChance = (
  weaponAccuracy: number,
  defenderAttackSpeed: number,
  weaponCategory: "Small" | "Medium" | "Large",
  pirateCategory: "Corvette" | "Cruiser" | "Battleship" | "Dreadnought" | "Titan"
): boolean => {
  const categoryModifiers: Record<string, Record<string, number>> = {
    Small: { Corvette: 0, Cruiser: 0, Battleship: 0, Dreadnought: 0, Titan: 0 }, // Small weapons are equally effective
    Medium: { Corvette: -10, Cruiser: 0, Battleship: 5, Dreadnought: 10, Titan: 15 },
    Large: { Corvette: -20, Cruiser: -10, Battleship: 0, Dreadnought: 5, Titan: 10 },
  };

  const sizePenalty = categoryModifiers[weaponCategory][pirateCategory] || 0;
  const defenderEvasion = Math.min(defenderAttackSpeed * 5, 90);
  const effectiveAccuracy = Math.min(Math.max(weaponAccuracy - sizePenalty, 10), 100);
  const adjustedHitChance = effectiveAccuracy - defenderEvasion;
  const finalHitChance = Math.max(adjustedHitChance / 100, 0.1);

  console.log(`Weapon Accuracy: ${weaponAccuracy}, Pirate Category: ${pirateCategory}, Final Hit Chance: ${finalHitChance * 100}%`);
  return Math.random() <= finalHitChance;
};

export const calculatePirateHitChance = (
  pirateAccuracy: number,
  pirateCategory: "Corvette" | "Cruiser" | "Battleship" | "Dreadnought" | "Titan"
): boolean => {
  // Category-based accuracy modifiers for pirates
  const categoryModifiers: Record<string, number> = {
    Corvette: -6,  // Smaller ships have reduced accuracy
    Cruiser: -3,   // Balanced accuracy for medium ships
    Battleship: 10, // Large ships are slightly more accurate
    Dreadnought: 12, // Large ships are very accurate
    Titan: 15,     // Massive ships are extremely accurate
  };

  // Apply the modifier based on the category
  const categoryModifier = categoryModifiers[pirateCategory] || 0;

  // Effective accuracy after applying category modifier
  const randomMultiplier = Math.random() * (1.1 - 0.7) + 0.7; // some randomness
  const effectiveAccuracy = Math.min(Math.max((pirateAccuracy + categoryModifier), 10), 80); // Clamp between 10% and 80%

  // Convert effectiveAccuracy into a decimal (0.0 to 1.0)
  const hitChance = (effectiveAccuracy / 100);

  console.log(`Pirate Accuracy: ${pirateAccuracy}, Category: ${pirateCategory}, Final Hit Chance: ${hitChance * 100}%`);

  // Determine hit or miss
  return Math.random() <= hitChance;
};

export const calculateDamage = (
  basePower: number,
  defense: number,
  randomMultiplierRange: { min: number; max: number } = { min: 0.8, max: 1.2 }
): { damage: number; isCritical: boolean } => {
  const randomMultiplier = Math.random() * (randomMultiplierRange.max - randomMultiplierRange.min) + randomMultiplierRange.min;
  const isCritical = randomMultiplier > 1.1; // Critical hit if multiplier is high
  const damage = Math.max(Math.floor(basePower * randomMultiplier * (1 - defense / 100)), 1);

  return { damage, isCritical };
}; 