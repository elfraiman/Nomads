import { useState, useEffect, useCallback } from 'react';
import { IMainShip, IPirate } from '@/utils/defaults';
import { CombatLogEntry } from '../components/CombatLog';
import { generateEnemies, getDifficultyMessage, Planet, CombatStats } from '../utils/enemyGeneration';
import { calculatePirateHitChance, calculateDamage } from '../utils/combatCalculations';
import colors from '@/utils/colors';

interface UseCombatLogicProps {
  planet: Planet;
  combatStats: CombatStats;
  mainShip: IMainShip;
  setMainShip: (ship: IMainShip | ((prev: IMainShip) => IMainShip)) => void;
  recordEnemyKill: (enemyName: string) => void;
  hasEscaped: boolean;
  createFloatingDamage: (damage: number, isCritical?: boolean, weaponType?: string) => void;
  unlockNextPlanet: () => void;
}

export const useCombatLogic = ({
  planet,
  combatStats,
  mainShip,
  setMainShip,
  recordEnemyKill,
  hasEscaped,
  createFloatingDamage,
  unlockNextPlanet,
}: UseCombatLogicProps) => {
  const [enemies, setEnemies] = useState<IPirate[]>(() => generateEnemies(planet, combatStats));
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [pirate, setPirate] = useState<IPirate | null>(enemies[0] || null);

  // Initialize combat log with difficulty message
  useEffect(() => {
    const difficultyMessage = getDifficultyMessage(combatStats, enemies);
    setCombatLog([difficultyMessage]);
  }, []);

  const addLogEntry = useCallback((entry: CombatLogEntry) => {
    const entryWithTimestamp = {
      ...entry,
      timestamp: new Date()
    };
    setCombatLog(prev => [...prev, entryWithTimestamp]);
  }, []);

  const spawnNextPirate = useCallback(() => {
    if (currentEnemyIndex < enemies.length - 1) {
      const nextIndex = currentEnemyIndex + 1;
      setCurrentEnemyIndex(nextIndex);
      setPirate(enemies[nextIndex]);
      addLogEntry({
        text: `New enemy: ${enemies[nextIndex].name} appeared!`,
        color: colors.warning,
      });
    } else {
      setPirate(null);
      addLogEntry({
        text: "All enemies defeated! Unlocking next planet.",
        color: colors.successGradient[0],
      });
      unlockNextPlanet();
    }
  }, [currentEnemyIndex, enemies, addLogEntry, unlockNextPlanet]);

  const damagePirate = useCallback((damage: number) => {
    if (!pirate) return;

    setPirate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        health: Math.max(prev.health - damage, 0),
      };
    });
  }, [pirate]);

  // Handle pirate defeat - separated from the attack logic to avoid setState during render
  useEffect(() => {
    if (pirate && pirate.health <= 0) {
      addLogEntry({
        text: `${pirate.name} has been defeated!`,
        color: colors.successGradient[0],
      });

      recordEnemyKill(pirate.name);

      // Remove the defeated enemy from the list
      setEnemies(prev => prev.filter((_, index) => index !== currentEnemyIndex));

      // Use setTimeout to ensure state updates happen after render
      setTimeout(() => {
        spawnNextPirate();
      }, 100);
    }
  }, [pirate?.health, pirate?.name, currentEnemyIndex, recordEnemyKill, addLogEntry, spawnNextPirate]);

  // Pirate attack logic - separated from defeat handling
  useEffect(() => {
    if (!pirate || hasEscaped || pirate.health <= 0) {
      return;
    }

    const interval = setInterval(() => {
      if (!pirate || hasEscaped || pirate.health <= 0) {
        clearInterval(interval);
        return;
      }

      const pirateAccuracy = Math.min(pirate.attackSpeed * 10, 100);
      const isHit = calculatePirateHitChance(pirateAccuracy, pirate.category);

      if (isHit) {
        const pirateAttack = pirate.attack ?? 0;
        const playerDefense = mainShip.baseStats.defense ?? 0;
        const { damage } = calculateDamage(pirateAttack, playerDefense, { min: 0.8, max: 1.2 });

        setMainShip((prev: IMainShip) => ({
          ...prev,
          baseStats: {
            ...prev.baseStats,
            health: Math.max(prev.baseStats.health - damage, 0)
          },
        }));

        createFloatingDamage(damage, false, 'incoming');
        addLogEntry({
          text: `${pirate.name} hit for ${damage} damage!`,
          color: colors.error,
        });
      } else {
        addLogEntry({
          text: `${pirate.name}'s attack missed!`,
          color: colors.textSecondary,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pirate, mainShip.baseStats.defense, hasEscaped, setMainShip, createFloatingDamage, addLogEntry]);

  return {
    enemies,
    setEnemies,
    currentEnemyIndex,
    combatLog,
    setCombatLog,
    addLogEntry,
    pirate,
    setPirate,
    damagePirate,
    spawnNextPirate,
  };
}; 