import { saveGameState, loadGameState, clearGameState } from "@/data/asyncStorage";
import React from "react";
import { View, Button, StyleSheet } from "react-native";


const TestStorage = () => {
    const testState = {
        resources: {
            energy: { current: 50, max: 100 },
            fuel: { current: 20, max: 50 },
        },
    };

    return (
        <View style={styles.container}>
            <Button title="Save Game State" onPress={() => saveGameState(testState)} />
            <Button title="Load Game State" onPress={async () => console.log(await loadGameState())} />
            <Button title="Clear Game State" onPress={clearGameState} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default TestStorage;
