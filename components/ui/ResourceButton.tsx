import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import ResourceIcon, { ResourceType } from "./ResourceIcon";
import colors from "@/utils/colors";

const ResourceButton = ({
    title,
    resourceType,
    cost,
    playerEnergy,
    onPress,
    currentAmount,
    maxAmount,
}: {
    title: string;
    resourceType: ResourceType;
    cost: number;
    playerEnergy: number;
    currentAmount: number;
    maxAmount: number;
    onPress: () => void;
}) => {
    const isDisabled = playerEnergy < cost || currentAmount >= maxAmount;

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={isDisabled}
        >
            <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{title}</Text>
                <View style={styles.iconContainer}>
                    <ResourceIcon type={resourceType} size={20} />
                </View>
            </View>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        padding: 10,
        alignItems: "center",
        marginTop: 8,
        width: '90%',
    },
    buttonDisabled: {
        backgroundColor: colors.disabledBackground, // Muted gray for disabled state
        borderColor: colors.disabledBorder, // Subtle border for disabled buttons
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "bold",
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    costText: {
        color: colors.textPrimary, // Warm orange for cost text
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 5,
    },
    costTextDisabled: {
        color: "#777777", // Muted gray for disabled text
    },
});

export default ResourceButton;
