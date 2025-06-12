import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useGame } from "@/context/GameContext";
import { IMerchant } from "@/utils/defaults";
import ResourceIcon from "./ui/ResourceIcon";
import colors from "@/utils/colors";

interface MerchantTradingModalProps {
  visible: boolean;
  merchant: IMerchant | null;
  onClose: () => void;
}

const MerchantTradingModal: React.FC<MerchantTradingModalProps> = ({
  visible,
  merchant,
  onClose
}) => {
  const gameContext = useGame();
  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // Update current time every second for timer display
  React.useEffect(() => {
    if (!visible) return;
    
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  // Guard clauses for safety - AFTER all hooks are called
  if (!visible || !merchant || !gameContext) {
    return null;
  }

  const { tradeMerchant, resources = {}, weapons = [] } = gameContext;

  // Helper function to format time remaining
  const formatTimeRemaining = (endTime?: number): string => {
    try {
      if (!endTime || typeof endTime !== 'number' || isNaN(endTime)) {
        return "0:00";
      }
      const remaining = Math.max(0, endTime - currentTime);
      const minutes = Math.floor(remaining / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "0:00";
    }
  };

  const handleTrade = (itemType: "weapon" | "resource" | "special", itemId: string) => {
    try {
      if (!merchant?.id || !tradeMerchant) return;
      
      const success = tradeMerchant(merchant.id, itemType, itemId);
      if (success) {
        // Close modal after successful trade if merchant has no more items
        const hasWeapons = merchant?.inventory?.weapons && merchant.inventory.weapons.length > 0;
        const hasResources = merchant?.inventory?.resources && merchant.inventory.resources.length > 0;
        
        if (!hasWeapons && !hasResources) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error handling trade:", error);
    }
  };

  const canAffordItem = (price: Record<string, number>): boolean => {
    try {
      if (!price || typeof price !== 'object') return false;
      if (!resources || typeof resources !== 'object') return false;
      
      return Object.entries(price).every(([resource, amount]) => {
        const resourceData = resources[resource as keyof typeof resources] as any;
        const current = resourceData?.current || 0;
        return current >= amount;
      });
    } catch (error) {
      console.error("Error checking affordability:", error);
      return false;
    }
  };

  const merchantName = merchant?.name || "Unknown Merchant";
  const merchantInventory = merchant?.inventory || { weapons: [], resources: [] };
  const weaponItems = merchantInventory.weapons || [];
  const resourceItems = merchantInventory.resources || [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{merchantName}</Text>
              <Text style={styles.countdown}>
                Leaves in: {formatTimeRemaining(merchant?.nextMoveTime)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Weapons Section */}
            {weaponItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔫 Weapons</Text>
                {weaponItems.map((item, index) => {
                  try {
                    const weapon = weapons.find(w => w.id === item.weaponId);
                    if (!weapon) return null;
                    
                    const canAfford = canAffordItem(item.price || {});
                    
                    return (
                      <View key={`weapon-${index}`} style={styles.itemCard}>
                        <Text style={styles.itemName}>{weapon.title || "Unknown Weapon"}</Text>
                        <Text style={styles.itemQuantity}>Quantity: {item.quantity || 1}</Text>
                        
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>Price:</Text>
                          {Object.entries(item.price || {}).map(([resource, amount]) => (
                            <View key={resource} style={styles.priceItem}>
                              <ResourceIcon type={resource as any} size={16} />
                              <Text style={styles.priceAmount}>{amount}</Text>
                            </View>
                          ))}
                        </View>
                        
                        <TouchableOpacity
                          style={[styles.tradeButton, !canAfford && styles.tradeButtonDisabled]}
                          onPress={() => handleTrade("weapon", item.weaponId)}
                          disabled={!canAfford}
                        >
                          <Text style={styles.tradeButtonText}>
                            {canAfford ? "Buy" : "Can't Afford"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  } catch (error) {
                    console.error("Error rendering weapon item:", error);
                    return null;
                  }
                })}
              </View>
            )}

            {/* Resources Section */}
            {resourceItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Resources</Text>
                {resourceItems.map((item, index) => {
                  try {
                    const canAfford = canAffordItem(item.price || {});
                    const resourceType = item.resourceType || "unknown";
                    const resourceName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
                    
                    return (
                      <View key={`resource-${index}`} style={styles.itemCard}>
                        <View style={styles.resourceHeader}>
                          <ResourceIcon type={item.resourceType} size={24} />
                          <Text style={styles.itemName}>{resourceName}</Text>
                        </View>
                        <Text style={styles.itemQuantity}>Amount: {item.amount || 1}</Text>
                        
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>Price:</Text>
                          {Object.entries(item.price || {}).map(([resource, amount]) => (
                            <View key={resource} style={styles.priceItem}>
                              <ResourceIcon type={resource as any} size={16} />
                              <Text style={styles.priceAmount}>{amount}</Text>
                            </View>
                          ))}
                        </View>
                        
                        <TouchableOpacity
                          style={[styles.tradeButton, !canAfford && styles.tradeButtonDisabled]}
                          onPress={() => handleTrade("resource", item.resourceType)}
                          disabled={!canAfford}
                        >
                          <Text style={styles.tradeButtonText}>
                            {canAfford ? "Buy" : "Can't Afford"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  } catch (error) {
                    console.error("Error rendering resource item:", error);
                    return null;
                  }
                })}
              </View>
            )}

            {weaponItems.length === 0 && resourceItems.length === 0 && (
              <Text style={styles.emptyInventory}>This merchant has no items for sale.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: colors.panelBackground,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  countdown: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: colors.panelBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  resourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 10,
  },
  priceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },
  priceAmount: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 5,
  },
  tradeButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  tradeButtonDisabled: {
    backgroundColor: colors.disabledBackground,
    opacity: 0.6,
  },
  tradeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyInventory: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 20,
  },
});

export default MerchantTradingModal; 