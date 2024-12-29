import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Svg, Circle, G, Defs, RadialGradient, Stop, Text as SvgText } from "react-native-svg";

interface Position {
    x: number;
    y: number;
}

interface Planet {
    id: number;
    name: string;
    position: Position;
}

interface Galaxy {
    id: number;
    name: string;
    size: number;
    planets: Planet[];
}

const { width, height } = Dimensions.get("window");

const galaxies: Galaxy[] = [
    {
        id: 1,
        name: "Alpha Centauri",
        size: 70,
        planets: [
            { id: 1, name: "Planet A1", position: { x: 150, y: height / 4 } },
            { id: 2, name: "Planet A2", position: { x: 250, y: height / 2.2 } },
            { id: 3, name: "Planet A3", position: { x: 80, y: height / 1.8 } },
            { id: 4, name: "Planet A4", position: { x: 300, y: height / 1.5 } },
        ],
    },
    {
        id: 2,
        name: "Andromeda",
        size: 50,
        planets: [
            { id: 1, name: "Planet B1", position: { x: 70, y: height / 4.5 } },
            { id: 2, name: "Planet B2", position: { x: 180, y: height / 3.2 } },
            { id: 3, name: "Planet B3", position: { x: 300, y: height / 2.0 } },
            { id: 4, name: "Planet B4", position: { x: 95, y: height / 1.4 } },
        ],
    },
    {
        id: 3,
        size: 30,
        name: "Milky Way",
        planets: [
            { id: 1, name: "Planet C1", position: { x: 80, y: height / 5.0 } },
            { id: 2, name: "Planet C2", position: { x: 310, y: height / 4.2 } },
            { id: 3, name: "Planet C3", position: { x: 275, y: height / 2.4 } },
            { id: 4, name: "Planet C4", position: { x: 200, y: height / 1.2 } },
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

const gradientColors = [
    { start: "#6A0572", end: "#C33764" },
    { start: "#162447", end: "#1F4068" },
    { start: "#0F2027", end: "#203A43" },
    { start: "#FF7E5F", end: "#FEB47B" },
    { start: "#43C6AC", end: "#191654" },
    { start: "#1E3C72", end: "#2A5298" },
    { start: "#4568DC", end: "#B06AB3" },
];

const GalaxyView = ({ galaxy, onBack }: { galaxy: any; onBack: () => void }) => {
    const stars = generateRandomStars(100);

    const getGradientId = (index: number) => `planet-gradient-${index}`;

    return (
        <View style={styles.container}>
            <Svg height="100%" width="100%">
                {/* Define gradients for planets */}
                <Defs>
                    {galaxy.planets.map((planet: Planet, index: number) => {
                        const { start, end } = gradientColors[index % gradientColors.length];
                        return (
                            <>
                                <RadialGradient
                                    key={getGradientId(index)}
                                    id={getGradientId(index)}
                                    cx="50%"
                                    cy="50%"
                                    r="50%"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <Stop offset="0%" stopColor={start} />
                                    <Stop offset="100%" stopColor={end} />
                                </RadialGradient>

                            </>
                        );
                    })}
                </Defs>

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

                {/* Render planets with gradients */}
                {galaxy.planets.map((planet: Planet, index: number) => (
                    <>
                        <Circle
                            key={planet.id}
                            cx={planet.position.x}
                            cy={planet.position.y}
                            r={20} // Adjust size as needed
                            fill={`url(#${getGradientId(index)})`} // Apply gradient
                            stroke="purple"
                            strokeWidth={1} // Glow effect
                            onPress={() => alert(`Selected planet: ${planet.name}`)}
                        />
                        <SvgText
                            x={planet.position.x}
                            y={planet.position.y + 38}
                            fill="white"
                            fontSize={14}
                            fontFamily="monospace" // You can use a futuristic custom font here
                            textAnchor="middle"
                        >
                            {planet.name}
                        </SvgText>
                    </>
                ))}
            </Svg>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
};





const ExplorationMap = () => {
    const [selectedGalaxy, setSelectedGalaxy] = useState<Galaxy | null>(null);
    const stars = generateRandomStars(100);

    const galaxyPositions = [
        { cx: width / 2, cy: height / 4 },
        { cx: width / 4, cy: (3 * height) / 4 },
        { cx: (3 * width) / 4, cy: (2 * height) / 4 },
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
                {galaxies.map((galaxy, index) => (
                    <G key={galaxy.id}>
                        <Defs>
                            <RadialGradient
                                id={`galaxy-gradient-${galaxy.id}`}
                                cx="50%"
                                cy="50%"
                                rx="50%"
                                ry="50%"
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop offset="0%" stopColor="rgba(126, 20, 255, 0.8)" />
                                <Stop offset="100%" stopColor="rgba(0, 0, 255, 0.1)" />
                            </RadialGradient>
                        </Defs>

                        <Circle
                            cx={galaxyPositions[index].cx}
                            cy={galaxyPositions[index].cy}
                            r={galaxy.size}
                            fill={`url(#galaxy-gradient-${galaxy.id})`}
                            onPress={() => setSelectedGalaxy(galaxy)}
                        />
                        <SvgText
                            x={galaxyPositions[index].cx}
                            y={galaxyPositions[index].cy + galaxy.size + 20}
                            fill="white"
                            fontSize={18}
                            fontFamily="monospace" // You can use a futuristic custom font here
                            textAnchor="middle"
                        >
                            {galaxy.name}
                        </SvgText>
                    </G>
                ))}
            </Svg>
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
