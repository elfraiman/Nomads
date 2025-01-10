import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/context/GameContext";
import colors from "@/utils/colors";

const WeaponManagementPage = () => {
  const game = useGame();
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);

  if (!game) return null;

  const { weapons, mainShip, updateMainShip, updateWeapons } = game;
  const equipWeapon = (weaponId: string) => {
    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon || mainShip.equippedWeapons.length >= mainShip.maxWeaponSlots || weapon.amount <= 0) return;

    // Create a unique weapon object with a uniqueId
    const uniqueEquippedWeapon = {
      ...weapon,
      uniqueId: `${weapon.id}-${Date.now()}` // Generate a unique identifier
    };

    // Update the main ship's equipped weapons
    updateMainShip({
      ...mainShip,
      equippedWeapons: [...mainShip.equippedWeapons, uniqueEquippedWeapon],
    });

    // Deduct 1 from the weapon's inventory count
    updateWeapons(weaponId, weapon.amount - 1);
  };


  const unequipWeapon = (uniqueId: string, weaponId: string) => {
    const weaponIndex = mainShip.equippedWeapons.findIndex((w) => w.uniqueId === uniqueId);
    if (weaponIndex === -1) return;

    const unequippedWeapon = mainShip.equippedWeapons[weaponIndex];

    updateMainShip({
      ...mainShip,
      equippedWeapons: mainShip.equippedWeapons.filter((w) => w.uniqueId !== uniqueId),
    });

    updateWeapons(weaponId, unequippedWeapon.amount + 1); // Return to inventory
  };

  const availableWeapons = () => {
    return weapons.filter((weapon) => weapon.amount > 0);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Weapon Management</Text>

      {/* Available Weapons */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Available Weapons</Text>
        {availableWeapons().map((weapon) => (
          <TouchableOpacity
            key={weapon.id}
            style={styles.weaponCard}
            onPress={() => setSelectedWeapon(weapon.id)}
          >
            <Text style={styles.weaponTitle}>
              {weapon.title} ({weapon.amount})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Equipped Weapons */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Equipped Weapons</Text>
        {mainShip.equippedWeapons.map((weapon) => (
          <View key={weapon.uniqueId} style={styles.equippedWeapon}>
            <Text style={styles.weaponTitle}>{weapon.title}</Text>
            <TouchableOpacity
              onPress={() => unequipWeapon(weapon?.uniqueId ?? "", weapon.id)}
              style={styles.unequipButton}
            >
              <Text style={styles.buttonText}>Unequip</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Equip Button */}
      {selectedWeapon && (
        <TouchableOpacity
          onPress={() => equipWeapon(selectedWeapon)}
          style={styles.equipButton}
        >
          <Text style={styles.buttonText}>Equip Selected Weapon</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  weaponCard: {
    padding: 10,
    backgroundColor: colors.panelBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  weaponTitle: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  equippedWeapon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  unequipButton: {
    backgroundColor: colors.error,
    padding: 8,
    borderRadius: 4,
  },
  equipButton: {
    backgroundColor: colors.buttonGreen,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default WeaponManagementPage;
