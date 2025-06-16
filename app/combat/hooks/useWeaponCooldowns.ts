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
      animation: new Animated.Value(0),
      weaponDetails: weapon.weaponDetails,
    }))
  );

  // Update weapon cooldowns when equipped weapons change
  useEffect(() => {
    setWeaponCooldowns(
      equippedWeapons.map((weapon) => {
        const existingCooldown = weaponCooldowns.find(wc => wc.id === weapon.id);
        return existingCooldown || {
          id: weapon.id,
          cooldown: 0,
          maxCooldown: weapon.weaponDetails.cooldown,
          animation: new Animated.Value(0),
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
            return { ...weapon, cooldown: Math.round((weapon.cooldown - 0.1) * 10) / 10 };
          }
          return weapon;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const startCooldownAnimation = (weaponId: string, duration: number) => {
    const weaponCooldown = weaponCooldowns.find((w) => w.id === weaponId);
    if (weaponCooldown) {
      weaponCooldown.animation.setValue(1);
      Animated.timing(weaponCooldown.animation, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start(() => {
        setWeaponCooldowns((prev) =>
          prev.map((w) => (w.id === weaponId ? { ...w, cooldown: 0 } : w))
        );
      });
    }
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