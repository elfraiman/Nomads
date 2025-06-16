import { IPirate } from "@/utils/defaults";

export interface CombatStats {
  totalKills?: number;
}

export interface Planet {
  id: number;
  name: string;
  pirateCount: number;
  enemies: IPirate[];
}

export const generateEnemies = (planet: Planet, combatStats: CombatStats): IPirate[] => {
  if (planet.pirateCount <= 0) {
    return [];
  }

  // Linear difficulty progression based on planet and player progress
  const getEnemyDifficultyRange = () => {
    const totalKills = combatStats.totalKills || 0;

    // Planet A1: Beginner-friendly progression
    if (planet.id === 1) {
      if (totalKills < 5) {
        return { minIndex: 0, maxIndex: 0 }; // Only Corvettes for first 5 kills
      } else if (totalKills < 15) {
        return { minIndex: 0, maxIndex: 1 }; // Corvettes to Cruisers
      } else {
        return { minIndex: 0, maxIndex: 1 }; // Stay at Corvette-Cruiser level
      }
    }
    // Planet A2: Intermediate progression
    else if (planet.id === 2) {
      if (totalKills < 10) {
        return { minIndex: 0, maxIndex: 1 }; // Start easier even on A2
      } else if (totalKills < 25) {
        return { minIndex: 0, maxIndex: 2 }; // Corvettes to Dreadnoughts
      } else {
        return { minIndex: 1, maxIndex: 2 }; // Cruisers to Dreadnoughts
      }
    }
    // Planet A3: Advanced progression
    else if (planet.id === 3) {
      if (totalKills < 20) {
        return { minIndex: 0, maxIndex: 2 }; // Still allow easier enemies
      } else if (totalKills < 40) {
        return { minIndex: 1, maxIndex: 3 }; // Cruisers to Battleships
      } else {
        return { minIndex: 2, maxIndex: 3 }; // Dreadnoughts to Battleships
      }
    }
    // Planet A4: Expert progression
    else if (planet.id === 4) {
      if (totalKills < 30) {
        return { minIndex: 1, maxIndex: 3 }; // Don't throw Titans immediately
      } else if (totalKills < 60) {
        return { minIndex: 2, maxIndex: 4 }; // Dreadnoughts to Titans
      } else {
        return { minIndex: 3, maxIndex: 4 }; // Battleships to Titans
      }
    }
    // Default fallback for any other planets
    else {
      return { minIndex: 0, maxIndex: planet.enemies.length - 1 };
    }
  };

  const { minIndex, maxIndex } = getEnemyDifficultyRange();
  const availableEnemies = planet.enemies.slice(minIndex, maxIndex + 1);

  // Generate enemies with progressive difficulty within the allowed range
  const enemies = [];
  const totalEnemies = Math.min(planet.pirateCount, 15); // Cap at 15 enemies for performance

  for (let i = 0; i < totalEnemies; i++) {
    // Progressive difficulty: start with easier enemies, gradually introduce harder ones
    const progressRatio = i / (totalEnemies - 1); // 0 to 1

    // Early enemies (first 30%) are from the easier half of available enemies
    // Later enemies (last 30%) can be from the harder half
    // Middle enemies (40%) are mixed
    let enemyIndex;

    if (progressRatio < 0.3) {
      // Early enemies: easier half
      const easyRange = Math.ceil(availableEnemies.length / 2);
      enemyIndex = Math.floor(Math.random() * easyRange);
    } else if (progressRatio > 0.7) {
      // Later enemies: harder half (but still within planet's range)
      const hardStart = Math.floor(availableEnemies.length / 2);
      enemyIndex = hardStart + Math.floor(Math.random() * (availableEnemies.length - hardStart));
    } else {
      // Middle enemies: full range with slight bias toward easier
      const biasedRandom = Math.random() * Math.random(); // Bias toward 0
      enemyIndex = Math.floor(biasedRandom * availableEnemies.length);
    }

    enemies.push({ ...availableEnemies[enemyIndex] });
  }

  return enemies;
};

export const getDifficultyMessage = (combatStats: CombatStats, enemies: IPirate[]): { text: string; color: string } => {
  const totalKills = combatStats.totalKills || 0;
  const enemyTypes = enemies.map((enemy: any) => enemy.category).join(', ');

  if (totalKills < 5) {
    return {
      text: `🎯 Beginner Mode: Facing ${enemyTypes} (${totalKills} total kills)`,
      color: '#4CAF50' // colors.primary equivalent
    };
  } else if (totalKills < 30) {
    return {
      text: `⚔️ Difficulty scaling with experience: ${enemyTypes} (${totalKills} total kills)`,
      color: '#FF9800' // colors.warning equivalent
    };
  } else {
    return {
      text: `💀 Veteran Mode: Facing ${enemyTypes} (${totalKills} total kills)`,
      color: '#F44336' // colors.error equivalent
    };
  }
}; 