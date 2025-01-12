import { TouchableOpacity, View } from "react-native";
import Collapsible from "../Collapsible";

const ShopItem = ({
  title,
  cost,
  onPurchase,
  description,
  locked,
  tokens,
}: {
  title: string;
  cost: number;
  onPurchase: () => void;
  description: string;
  locked: boolean;
  tokens: number;
}) => {
  const canAfford = tokens >= cost;

  return (
    <Collapsible title={title}>
      <View style={styles.shopItemContainer}>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.costContainer}>
          <Text style={styles.costText}>Cost: {cost} Tokens</Text>
        </View>
        <TouchableOpacity
          onPress={onPurchase}
          style={[styles.purchaseButton, !canAfford && styles.disabledButton]}
          disabled={!canAfford}
        >
          <Text style={styles.purchaseButtonText}>Purchase</Text>
        </TouchableOpacity>
      </View>
    </Collapsible>
  );
};
