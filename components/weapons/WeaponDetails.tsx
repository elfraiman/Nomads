import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { IWeapon } from '@/data/weapons';
import colors from '@/utils/colors';
import ResourceIcon from '@/components/ui/ResourceIcon';
import { PlayerResources } from '@/utils/defaults';

interface WeaponDetailsProps {
  weapon: IWeapon;
  onEquip: (weaponId: string) => void;
}

export const WeaponDetails = ({ weapon, onEquip }: WeaponDetailsProps) => {
  return (
    <>
      <View style={styles.weaponDetails}>
        <ImageBackground source={weapon.icon} style={styles.detailsIcon} imageStyle={styles.weaponCardImage}>
          <View style={styles.weaponCardOverlay}>
            <Text style={styles.weaponTitle}>{weapon.title}</Text>
          </View>
        </ImageBackground>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Power: {weapon.weaponDetails.power}</Text>
          <Text style={styles.statText}>Cooldown: {weapon.weaponDetails.cooldown}s</Text>
          <Text style={styles.statText}>Accuracy: {weapon.weaponDetails.accuracy}% </Text>
          <Text style={styles.statText}>Max Durability: {weapon.weaponDetails.maxDurability}</Text>
          <Text style={styles.statText}>Durability: {weapon.weaponDetails.durability}</Text>
          <Text style={styles.statText}>
            Resource cost: <ResourceIcon size={14} type={weapon.weaponDetails.cost.type as keyof PlayerResources} /> {weapon.weaponDetails.cost.amount}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onEquip(weapon.uniqueId!)}
        style={styles.equipButton}
      >
        <Text style={styles.buttonText}>Equip Selected Weapon</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  weaponDetails: {
    flexDirection: 'column',
    backgroundColor: colors.panelBackground,
  },
  detailsIcon: {
    width: '100%',
    height: 120,
    marginBottom: 12,
    overflow: 'hidden',
  },
  weaponCardImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  weaponCardOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 2,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  weaponTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "bold",
  },
  statsContainer: {
    width: '100%',
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  statText: {
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipButton: {
    backgroundColor: colors.primary,
    padding: 6,
    alignItems: "center",
    borderRadius: 4,
    marginTop: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});