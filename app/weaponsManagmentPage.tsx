import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { useGame } from "@/context/GameContext";
import colors from "@/utils/colors";
import { WeaponSlot } from "@/components/weapons/WeaponSlot";
import { WeaponDetails } from "@/components/weapons/WeaponDetails";
import { WeaponCard } from "@/components/weapons/WeaponCard";
import { IWeapon } from "@/data/weapons";
import { WeaponDetailsModal } from "@/components/weapons/WeaponDetailsModal";

const WeaponManagementPage = () => {
  const game = useGame();
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!game) return null;

  const { weapons, mainShip, setMainShip, updateWeapons } = game;

  const selectedWeaponDetails = weapons.find(w => w.uniqueId === selectedWeapon);

  // Helper function to get durability color
  const getDurabilityColor = (durability: number, maxDurability: number) => {
    const ratio = durability / maxDurability;
    if (ratio > 0.7) return colors.buttonGreen;
    if (ratio > 0.3) return colors.warning;
    return colors.error;
  };

  const equipWeapon = (weaponId: string) => {
    const weapon = weapons.find((w) => w.uniqueId === weaponId);
    if (!weapon || mainShip.equippedWeapons.length >= mainShip.maxWeaponSlots) {
      return;
    }

    // Remove from inventory
    updateWeapons(weaponId, 'remove');

    // Add to equipped weapons
    setMainShip((prev) => ({
      ...prev,
      equippedWeapons: [...prev.equippedWeapons, weapon],
    }));

    setSelectedWeapon(null);
  };

  const unequipWeapon = (uniqueId: string) => {
    const weaponIndex = mainShip.equippedWeapons.findIndex((w) => w.uniqueId === uniqueId);
    if (weaponIndex === -1) return;

    const unequippedWeapon = mainShip.equippedWeapons[weaponIndex];

    // Remove from equipped weapons
    setMainShip((prev) => ({
      ...prev,
      equippedWeapons: mainShip.equippedWeapons.filter((w) => w.uniqueId !== uniqueId),
    }));

    // Add back to inventory with current durability
    updateWeapons(unequippedWeapon.id, 'add', {
      durability: unequippedWeapon.weaponDetails.durability,
      maxDurability: unequippedWeapon.weaponDetails.maxDurability,
      uniqueId: `${unequippedWeapon.id}-${Date.now()}`
    });
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
            // First check if it's an equipped weapon
            const equippedWeapon = mainShip.equippedWeapons.find(w => w.uniqueId === uniqueId);

            if (equippedWeapon) {
              // Remove from equipped weapons
              setMainShip((prev) => ({
                ...prev,
                equippedWeapons: prev.equippedWeapons.filter((w) => w.uniqueId !== uniqueId),
              }));

              // Also reduce the amount in weapons inventory
              const baseWeaponId = equippedWeapon.id;
              updateWeapons(baseWeaponId, 'remove');
            } else {
              // If it's an inventory weapon, just remove it from inventory
              updateWeapons(uniqueId, 'remove');
            }
          },
        },
      ]
    );
  };

  // Group weapons by their base type and durability for display
  const groupedWeapons = weapons.reduce((acc, weapon) => {
    // Skip template weapons (ones without uniqueId)
    if (!weapon.uniqueId) return acc;

    // Group by base weapon type
    const groupKey = weapon.id;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(weapon);

    // Sort by durability within each group
    acc[groupKey].sort((a, b) =>
      b.weaponDetails.durability / b.weaponDetails.maxDurability -
      a.weaponDetails.durability / a.weaponDetails.maxDurability
    );

    return acc;
  }, {} as Record<string, IWeapon[]>);

  return (
    <ScrollView style={styles.container}>
      <WeaponDetailsModal
        weapon={selectedWeaponDetails || null}
        isVisible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedWeapon(null);
        }}
        onEquip={equipWeapon}
        onDestroy={destroyWeapon}
      />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Ship Weapon Slots</Text>
        <View style={styles.weaponSlots}>
          {Array.from({ length: mainShip.maxWeaponSlots }).map((_, index) => (
            <WeaponSlot
              key={index}
              weapon={mainShip.equippedWeapons[index]}
              onUnequip={unequipWeapon}
              onDestroy={destroyWeapon}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Available Weapons</Text>
        <View style={styles.availableWeapons}>
          {Object.entries(groupedWeapons).map(([id, weapons]) => (
            <View key={id} style={styles.weaponGroup}>
              <Text style={styles.weaponGroupTitle}>
                {weapons[0].title} ({weapons.length})
              </Text>
              <View style={styles.weaponInstances}>
                {weapons.map((weapon) => (
                  <WeaponCard
                    key={weapon.uniqueId}
                    weapon={weapon}
                    isSelected={selectedWeapon === weapon.uniqueId}
                    onSelect={(weaponId) => {
                      setSelectedWeapon(weaponId);
                      setModalVisible(true);
                    }}
                    getDurabilityColor={getDurabilityColor}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
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
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.transparentBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  weaponSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 6,
    bottom: 0,
    width: '100%',
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
  weaponGroup: {
    marginBottom: 16,
    width: '100%',
  },
  weaponGroupTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weaponInstances: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durabilityBar: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginTop: 4,
  },
});

export default WeaponManagementPage;
