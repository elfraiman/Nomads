import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Image, ImageBackground } from "react-native";
import { useGame } from "@/context/GameContext";
import colors from "@/utils/colors";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { PlayerResources } from "@/utils/defaults";

const WeaponManagementPage = () => {
  const game = useGame();
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);

  if (!game) return null;

  const { weapons, mainShip, setMainShip, updateWeapons } = game;

  const equipWeapon = (weaponId: string) => {
    const weapon = weapons.find((w) => w.id === weaponId);

    if (!weapon || mainShip.equippedWeapons.length >= mainShip.maxWeaponSlots || weapon.amount <= 0) return;

    // Create a unique weapon object with durability
    const uniqueEquippedWeapon = {
      ...weapon,
      uniqueId: `${weapon.id}-${Date.now()}`, // Generate a unique identifier
      weaponDetails: {
        ...weapon.weaponDetails,
        durability: weapon.weaponDetails.maxDurability, // Reset durability when equipped
      },
    };

    // Deduct 1 from the weapon's inventory count
    updateWeapons(weaponId, weapon.amount - 1);

    setMainShip((prev) => ({
      ...prev,
      equippedWeapons: [...prev.equippedWeapons, uniqueEquippedWeapon],
    }));
    setSelectedWeapon(null); // Clear selected weapon after equipping
  };

  const unequipWeapon = (uniqueId: string) => {
    const weaponIndex = mainShip.equippedWeapons.findIndex((w) => w.uniqueId === uniqueId);
    if (weaponIndex === -1) return;

    const unequippedWeapon = mainShip.equippedWeapons[weaponIndex];

    setMainShip((prev) => ({
      ...prev,
      equippedWeapons: mainShip.equippedWeapons.filter((w) => w.uniqueId !== uniqueId),
    }));

    // Return the weapon to the inventory
    updateWeapons(unequippedWeapon.id, unequippedWeapon.amount + 1);
  };

  const destroyWeapon = (uniqueId: string) => {
    Alert.alert(
      "Destroy Weapon",
      "Are you sure you want to destroy this weapon? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Destroy",
          style: "destructive",
          onPress: () => {
            setMainShip((prev) => ({
              ...prev,
              equippedWeapons: prev.equippedWeapons.filter((w) => w.uniqueId !== uniqueId),
            }));
          },
        },
      ]
    );
  };

  const availableWeapons = weapons.filter((weapon) => weapon.amount > 0);

  return (
    <ScrollView style={styles.container}>
      {/* Weapon Slots */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Ship Weapon Slots</Text>
        <View style={styles.weaponSlots}>
          {Array.from({ length: mainShip.maxWeaponSlots }).map((_, index) => {
            const equippedWeapon = mainShip.equippedWeapons[index];
            return (
              <View key={index} style={styles.slot}>
                {equippedWeapon ? (
                  <>
                    <Text style={styles.weaponTitle}>{equippedWeapon.title}</Text>
                    <Text style={styles.durabilityText}>
                      Durability: {equippedWeapon.weaponDetails.durability}/
                      {equippedWeapon.weaponDetails.maxDurability}
                    </Text>
                    <TouchableOpacity
                      onPress={() => unequipWeapon(equippedWeapon.uniqueId ?? "")}
                      style={styles.unequipButton}
                    >
                      <Text style={styles.buttonText}>Unequip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => destroyWeapon(equippedWeapon.uniqueId ?? "")}
                      style={styles.destroyButton}
                    >
                      <Text style={styles.buttonText}>Destroy</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.emptySlot}>Empty Slot</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
      {/* Selected Weapon Details */}
      {selectedWeapon && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Selected Weapon Details</Text>
          {weapons.filter(w => w.id === selectedWeapon).map(weapon => (
            <View key={weapon.uniqueId ?? weapon.id + 1} style={styles.weaponDetails}>
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

                <Text style={styles.statText}>Resource cost: <ResourceIcon size={14} type={weapon.weaponDetails.cost.type as keyof PlayerResources} /> {weapon.weaponDetails.cost.amount}</Text>

              </View>

            </View>

          ))}
          {/* Equip Weapon */}
          {selectedWeapon && (
            <TouchableOpacity
              onPress={() => equipWeapon(selectedWeapon)}
              style={styles.equipButton}
            >
              <Text style={styles.buttonText}>Equip Selected Weapon</Text>
            </TouchableOpacity>
          )}

        </View>
      )}

      {/* Available Weapons */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Available Weapons</Text>
        <View style={styles.availableWeapons}>
          {availableWeapons.map((weapon) => (
            <TouchableOpacity
              key={weapon.id}
              style={[
                styles.weaponCard,
                selectedWeapon === weapon.id && styles.selectedWeaponCard,
              ]}
              onPress={() => setSelectedWeapon(weapon.id === selectedWeapon ? null : weapon.id)}
            >
              <ImageBackground source={weapon.icon} style={styles.weaponCardBackground} imageStyle={styles.weaponCardImage}>
                <View style={styles.weaponCardOverlay}>
                  <Text style={styles.weaponTitle}>
                    {weapon.title} ({weapon.amount})
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  weaponDetails: {
    flexDirection: 'row',
    backgroundColor: colors.panelBackground,
    borderRadius: 4,
  },
  detailsIcon: {
    width: 130,
    height: "auto",
    marginRight: 16,
    flex: 1,
    justifyContent: "flex-end", // Align text at the bottom

  },
  statsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.transparentBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  weaponSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  slot: {
    width: "48%",
    padding: 10,
    backgroundColor: colors.panelBackground,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 80,
    borderColor: colors.border,
  },
  emptySlot: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  weaponCard: {
    width: "32%",
    height: 80,
    marginVertical: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  availableWeapons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weaponCardBackground: {
    flex: 1,
    justifyContent: "flex-end", // Align text at the bottom
    height: "auto",
  },
  weaponCardImage: {
    resizeMode: "cover", // Ensure the image covers the entire background
    width: "100%",
    height: "100%"
  },
  weaponCardOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent overlay for better text readability
    padding: 6,
    bottom: 0,
  },
  selectedWeaponCard: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  weaponTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: "center",
  },
  durabilityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  unequipButton: {
    backgroundColor: colors.primary,
    padding: 8,
    marginTop: 8,
    width: '100%',
    alignItems: "center",
  },
  destroyButton: {
    backgroundColor: colors.error,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
    width: '100%'
  },
  equipButton: {
    backgroundColor: colors.primary,
    padding: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  weaponIcon: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },

});

export default WeaponManagementPage;
