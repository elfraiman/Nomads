import { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { IWeapon } from '@/data/weapons';

export interface WeaponCooldown {
  id: string;
  cooldown: number;
  maxCooldown: number;
  animation: Animated.Value;
  weaponDetails: IWeapon['weaponDetails'];
}

export const useWeaponCooldowns = (equippedWeapons: IWeapon[]) => {
  const [weaponCooldowns, setWeaponCooldowns] = useState<WeaponCooldown[]>(
    equippedWeapons.map((weapon) => ({
      id: weapon.id,
      cooldown: 0,
      maxCooldown: weapon.weaponDetails.cooldown,
      animation: new Animated.Value(1), // 1 = empty (ready state)
      weaponDetails: weapon.weaponDetails,
    }))
  );

  // Update weapon cooldowns when equipped weapons change
  useEffect(() => {
    setWeaponCooldowns(prevCooldowns =>
      equippedWeapons.map((weapon) => {
        const existingCooldown = prevCooldowns.find(wc => wc.id === weapon.id);
        if (existingCooldown) {
          // Sync animation value with current cooldown progress
          // For right-to-left animation: 0 = full bar, 1 = empty bar
          const progress = existingCooldown.cooldown > 0
            ? (existingCooldown.cooldown / existingCooldown.maxCooldown)
            : 1; // 1 = empty (ready state)
          existingCooldown.animation.setValue(progress);
          return existingCooldown;
        }
        return {
          id: weapon.id,
          cooldown: 0,
          maxCooldown: weapon.weaponDetails.cooldown,
          animation: new Animated.Value(1), // 1 = empty (ready state)
          weaponDetails: weapon.weaponDetails,
        };
      })
    );
  }, [equippedWeapons]);

  // Cooldown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setWeaponCooldowns((prev) =>
        prev.map((weapon) => {
          if (weapon.cooldown > 0) {
            const newCooldown = Math.max(0, Math.round((weapon.cooldown - 0.1) * 10) / 10);
            // Sync animation with cooldown progress
            // For right-to-left animation: 0 = full bar, 1 = empty bar
            const progress = newCooldown > 0
              ? (newCooldown / weapon.maxCooldown)
              : 1; // 1 = empty (ready state)
            weapon.animation.setValue(progress);
            return { ...weapon, cooldown: newCooldown };
          }
          return weapon;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const startCooldownAnimation = (weaponId: string, duration: number) => {
    setWeaponCooldowns(prev =>
      prev.map(w => {
        if (w.id === weaponId) {
          // Set initial animation value to 0 (full bar for countdown)
          w.animation.setValue(0);
          return { ...w, cooldown: duration, maxCooldown: duration };
        }
        return w;
      })
    );
  };

  const updateWeaponCooldown = (weaponId: string, cooldown: number) => {
    setWeaponCooldowns(prev =>
      prev.map(w => w.id === weaponId ? { ...w, cooldown } : w)
    );
  };

  const removeWeapon = (weaponId: string) => {
    setWeaponCooldowns(prev => prev.filter(w => w.id !== weaponId));
  };

  return {
    weaponCooldowns,
    setWeaponCooldowns,
    startCooldownAnimation,
    updateWeaponCooldown,
    removeWeapon,
  };
}; 