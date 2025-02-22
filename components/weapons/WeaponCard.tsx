import React from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet } from 'react-native';
import { IWeapon } from '@/data/weapons';
import colors from '@/utils/colors';

interface WeaponCardProps {
  weapon: IWeapon;
  isSelected: boolean;
  onSelect: (weaponId: string) => void;
  getDurabilityColor: (durability: number, maxDurability: number) => string;
}

export const WeaponCard = ({ weapon, isSelected, onSelect, getDurabilityColor }: WeaponCardProps) => {
  return (
    <TouchableOpacity
      key={weapon.id}
      style={[styles.weaponCard, isSelected && styles.selectedWeaponCard]}
      onPress={() => onSelect(weapon.uniqueId!)}
    >
      <ImageBackground
        source={weapon.icon}
        style={styles.weaponCardBackground}
        imageStyle={styles.weaponCardImage}
      >
        <View style={styles.weaponCardOverlay}>
          <Text style={styles.weaponTitle}>{weapon.title}</Text>
          <View style={[
            styles.durabilityBar,
            {
              backgroundColor: getDurabilityColor(
                weapon.weaponDetails.durability,
                weapon.weaponDetails.maxDurability
              )
            }
          ]}>
            <Text style={styles.durabilityText}>
              {weapon.weaponDetails.durability}/{weapon.weaponDetails.maxDurability}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  weaponCard: {
    width: "31%", // Three cards per row with small gap
    height: 75,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  weaponCardBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  weaponCardImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  weaponCardOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 4,
    width: '100%',
  },
  selectedWeaponCard: {
    borderColor: colors.glowEffect,
    borderWidth: 2,
  },
  weaponTitle: {
    fontSize: 10,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "bold",
  },
  durabilityBar: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    marginTop: 2,
    marginBottom: 10,
  },
  durabilityText: {
    fontSize: 9,
    marginTop: 2,
    color: colors.textSecondary,
    textAlign: "center",
  },
}); 