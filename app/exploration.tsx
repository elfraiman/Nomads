import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Svg, Circle } from "react-native-svg";


const { width, height } = Dimensions.get("window");

const galaxies = [
    {
        id: 1,
        name: "Alpha Centauri",
        planets: [
            { id: 1, name: "Planet A1", position: { x: 150, y: 200 } },
            { id: 2, name: "Planet A2", position: { x: 250, y: 250 } },
            { id: 3, name: "Planet A3", position: { x: 200, y: 300 } },
            { id: 4, name: "Planet A4", position: { x: 300, y: 200 } },
        ],
    },
    {
        id: 2,
        name: "Andromeda",
        planets: [
            { id: 1, name: "Planet B1", position: { x: 175, y: 150 } },
            { id: 2, name: "Planet B2", position: { x: 225, y: 120 } },
            { id: 3, name: "Planet B3", position: { x: 200, y: 310 } },
            { id: 4, name: "Planet B4", position: { x: 300, y: 120 } },
        ],
    },
    {
        id: 3,
        name: "Milky Way",
        planets: [
            { id: 1, name: "Planet C1", position: { x: 145, y: 120 } },
            { id: 2, name: "Planet C2", position: { x: 310, y: 200 } },
            { id: 3, name: "Planet C3", position: { x: 240, y: 300 } },
            { id: 4, name: "Planet C4", position: { x: 150, y: 150 } },
        ],
    },
];

const generateRandomStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            id: i,
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
        });
    }
    return stars;
};


const GalaxyView = ({ galaxy, onBack }: { galaxy: any; onBack: () => void }) => {
    const stars = generateRandomStars(100); // Stars can remain dynamic for ambiance

    return (
        <View style={styles.container}>
            <Svg height="100%" width="100%">
                {/* Render stars */}
                {stars.map((star) => (
                    <Circle
                        key={star.id}
                        cx={star.x}
                        cy={star.y}
                        r={star.radius}
                        fill="white"
                        opacity={0.8}
                    />
                ))}

                {/* Render planets with static positions */}
                {galaxy.planets.map((planet) => (
                    <Circle
                        key={planet.id}
                        cx={planet.position.x}
                        cy={planet.position.y}
                        r={10}
                        fill="green"
                        onPress={() => alert(`Selected planet: ${planet.name}`)}
                    />
                ))}
            </Svg>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const ExplorationMap = () => {
    const [selectedGalaxy, setSelectedGalaxy] = useState(null);
    const stars = generateRandomStars(100); // Stars can remain dynamic for ambiance

    // Calculate galaxy positions for a triangle layout
    const galaxyPositions = [
        { cx: width / 2, cy: height / 4 }, // Top center
        { cx: width / 4, cy: (3 * height) / 4 }, // Bottom left
        { cx: (3 * width) / 4, cy: (3 * height) / 4 }, // Bottom right
    ];

    if (selectedGalaxy) {
        return (
            <GalaxyView
                galaxy={selectedGalaxy}
                onBack={() => setSelectedGalaxy(null)}
            />
        );
    }

    return (
        <View style={styles.container}>
            <Svg height="100%" width="100%">
                {/* Render stars */}
                {stars.map((star) => (
                    <Circle
                        key={star.id}
                        cx={star.x}
                        cy={star.y}
                        r={star.radius}
                        fill="white"
                        opacity={0.8}
                    />
                ))}

                {/* Render galaxies */}
                {galaxies.map((galaxy, index) => (
                    <Circle
                        key={galaxy.id}
                        cx={galaxyPositions[index].cx}
                        cy={galaxyPositions[index].cy}
                        r={50}
                        fill="blue"
                        onPress={() => setSelectedGalaxy(galaxy)}
                    />
                ))}
            </Svg>
            <Text style={styles.title}>Select a Galaxy</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        position: "absolute",
        bottom: 50,
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    backButton: {
        position: "absolute",
        bottom: 50,
        left: 20,
        backgroundColor: "blue",
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default ExplorationMap;
