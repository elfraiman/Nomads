import colors from "@/utils/colors";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ResourceIcon, { ResourceType } from "./ResourceIcon";

const ResourceButton = ({
    title,
    resourceType,
    cost,
    playerEnergy,
    onPress,
    currentAmount,
    maxAmount,
    generationAmount,
}: {
    title: string;
    resourceType: ResourceType;
    cost: number;
    playerEnergy: number;
    currentAmount: number;
    maxAmount: number;
    onPress: () => void;
    generationAmount: number;
}) => {
    const isDisabled = playerEnergy < cost || currentAmount >= maxAmount;
    const progress = (currentAmount / maxAmount) * 100;

    return (
        <View style={styles.buttonContainer}>
            <LinearGradient
                colors={
                    isDisabled
                        ? ['#1A1D2E', '#141824', '#141824']
                        : [
                            'rgba(25, 35, 55, 0.9)',
                            colors.primary,
                            'rgba(25, 35, 55, 0.9)'
                        ]
                }
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
            >
                <View style={[styles.glowContainer, { pointerEvents: 'none' }]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(73, 143, 225, 0.15)', 'transparent']}
                        locations={[0, 0.5, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.glowEffect}
                    />
                </View>
                <TouchableOpacity
                    style={styles.mainButton}
                    onPress={onPress}
                    disabled={isDisabled}
                >
                    <View style={styles.buttonContent}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.buttonText, isDisabled && styles.textDisabled]}>
                                {title}
                            </Text>
                            <View style={styles.statsContainer}>
                                <View style={styles.statRow}>
                                    <ResourceIcon type={resourceType} size={16} />
                                    <Text style={[styles.costText, isDisabled && styles.textDisabled]}>
                                        Current: {currentAmount}/{maxAmount}
                                    </Text>
                                    <Text style={[styles.gainText, isDisabled && styles.textDisabled]}>
                                        (+{generationAmount})
                                    </Text>
                                </View>
                                <View style={styles.statRow}>
                                    <ResourceIcon type="energy" size={16} />
                                    <Text style={[styles.costText, isDisabled && styles.textDisabled]}>
                                        Cost: {cost}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={isDisabled ? colors.textSecondary : colors.textPrimary}
                        />
                    </View>
                </TouchableOpacity>

                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${progress}%` },
                            isDisabled && styles.progressBarDisabled
                        ]}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 2,
        overflow: 'hidden',
    },
    button: {
        padding: 8,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(73, 143, 225, 0.3)',
    },
    glowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    glowEffect: {
        position: 'absolute',
        top: 0,
        left: '-50%',
        right: '-50%',
        bottom: 0,
        transform: [{ rotate: '15deg' }],
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleContainer: {
        flex: 1,
    },
    buttonText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    statsContainer: {
        marginTop: 4,
        gap: 4,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    costText: {
        color: colors.textPrimary,
        fontSize: 12,
        marginLeft: 6,
    },
    textDisabled: {
        color: colors.textSecondary,
    },
    progressBarContainer: {
        height: 2,
        backgroundColor: colors.border,
        marginTop: 6,
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.glowEffect,
    },
    progressBarDisabled: {
        backgroundColor: colors.textSecondary,
    },
    mainButton: {
        width: '100%',
    },
    gainText: {
        color: colors.textPrimary,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
});

export default ResourceButton;
