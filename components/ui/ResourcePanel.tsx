import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import ResourceIcon, { ResourceType } from "./ResourceIcon";


const ResourcePanel = ({
    resourceType,
    resourceName,
    current,
    max,
    efficiency,
    onGenerate,
    progress,
}: {
    resourceType: ResourceType;
    resourceName: string;
    current: number;
    max: number;
    efficiency: number;
    onGenerate: () => void;
    progress: number; // Progress percentage
}) => {
    return (
        <View style={styles.panel}>
            <View style={styles.header}>
                <ResourceIcon type={resourceType} size={30} />
                <Text style={styles.title}>{resourceName}</Text>
            </View>
            <View style={styles.stats}>
                <Text style={styles.statText}>
                    Current: {current} / {max}
                </Text>
                <Text style={styles.statText}>Efficiency: +{Math.round(efficiency * 100)}%</Text>
            </View>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Refining... {progress}%</Text>
            <Button title={`Generate ${resourceName}`} onPress={onGenerate} color="#3A506B" />
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        backgroundColor: "#2E2E2E",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        color: "#FFD700",
        marginLeft: 10,
    },
    stats: {
        marginBottom: 10,
    },
    statText: {
        color: "#FFF",
        fontSize: 14,
    },
    progressContainer: {
        height: 10,
        backgroundColor: "#444",
        borderRadius: 5,
        overflow: "hidden",
        marginVertical: 10,
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#3A506B",
    },
    progressText: {
        color: "#FFF",
        fontSize: 12,
        marginBottom: 10,
    },
});

export default ResourcePanel;
