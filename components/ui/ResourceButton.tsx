import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import ResourceIcon, { ResourceType } from "./ResourceIcon";

const ResourceButton = ({
    title,
    resourceType,
    cost,
    currentAmount,
    onPress,
}: {
    title: string;
    resourceType: ResourceType;
    cost: number;
    currentAmount: number;
    onPress: () => void;
}) => {
    const isDisabled = currentAmount < cost;

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
                    <Text style={[styles.costText, isDisabled && styles.costTextDisabled]}>{cost}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#3A506B",
        borderRadius: 5,
        padding: 10,
        alignItems: "center",
        marginVertical: 5,
    },
    buttonDisabled: {
        backgroundColor: "#6B6B6B", // Gray color for disabled state
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    costText: {
        color: "#FFD700", // Gold color for the cost
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 5,
    },
    costTextDisabled: {
        color: "#AAAAAA", // Gray color for disabled text
    },
});

export default ResourceButton;
