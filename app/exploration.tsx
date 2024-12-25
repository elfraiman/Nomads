import ShipStatus from "@/components/ShipStatus";
import { GameContext } from "@/context/GameContext";
import React, { useContext } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";

const starSystems = [
    { id: 1, name: "Alpha Centauri", resources: { fuel: 50, oxygen: 10 } },
    { id: 2, name: "Proxima B", resources: { oxygen: 30, energy: -10 } },
    { id: 3, name: "Habitable Zone", resources: {}, event: "win" },
];

const Exploration = () => {
    const game = useContext(GameContext);

    if (!game) return null;

    const { updateResources } = game;

    const handleExplore = (system: any) => {
        updateResources('fuel', { current: game.resources.fuel.current - 10 });

        if (system.event === "win") {
            alert("Congratulations! You've found a habitable planet!");
        }
    };

    return (<>
        <ShipStatus />

        <View style={styles.container}>

            <Text style={styles.title}>Explore the Galaxy</Text>
            <FlatList
                data={starSystems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.systemCard}>
                        <Text style={styles.systemName}>{item.name}</Text>
                        <Button title="Explore" onPress={() => handleExplore(item)} />
                    </View>
                )}
            />
        </View>
    </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    systemCard: {
        marginVertical: 10,
        padding: 15,
        borderRadius: 5,
        backgroundColor: "#f0f0f0",
    },
    systemName: { fontSize: 18, fontWeight: "bold" },
});

export default Exploration;
