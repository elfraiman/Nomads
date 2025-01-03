import { PlayerResources } from "@/utils/defaults";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Svg, Circle, G, Defs, RadialGradient, Stop, Text as SvgText, Image as SvgImage } from "react-native-svg";
import { useGame } from "@/context/GameContext"; // Assuming a game context
import ResourceIcon from "@/components/ui/ResourceIcon";
import ShipStatus from "@/components/ShipStatus";
import achievements from "@/data/achievements";


interface IPosition {
    x: number;
    y: number;
}

interface IPlanet {
    id: number;
    name: string;
    position: IPosition;
}

interface IGalaxy {
    id: number;
    name: string;
    size: number;
    planets: IPlanet[];
    image: any;
    asteroids: IAsteroid[];
}

export interface IAsteroid {
    id: number;
    name: string;
    resource: keyof PlayerResources;
    findChance: number;
    maxResources: number;
    galaxyId: number;
    x?: number;
    y?: number;
}
const { width: fullWidth, height: fullHeight } = Dimensions.get("window");

const width = fullWidth - 16; // 16px padding on each side
const height = fullHeight - 16; // 16px padding on each side

const galaxies: IGalaxy[] = [
    {
        id: 1,
        name: "Alpha Centauri",
        size: 90,
        image: require("../assets/images/galaxy.webp"),
        planets: [
            { id: 1, name: "Planet A1", position: { x: 150, y: height / 5.4 } },
            { id: 2, name: "Planet A2", position: { x: 250, y: height / 4.2 } },
            { id: 3, name: "Planet A3", position: { x: 80, y: height / 3.2 } },
            { id: 4, name: "Planet A4", position: { x: 300, y: height / 2.1 } },
        ],
        asteroids: [
            { galaxyId: 1, id: 1, name: "Asteroid Ignis", resource: "fuel" as keyof PlayerResources, findChance: 0.5, maxResources: 1000 },
            { galaxyId: 1, id: 2, name: "Asteroid Solara", resource: "solarPlasma" as keyof PlayerResources, findChance: 0.3, maxResources: 1000 },
            { galaxyId: 1, id: 3, name: "Asteroid Umbra", resource: "darkMatter" as keyof PlayerResources, findChance: 0.2, maxResources: 1000 },
            { galaxyId: 1, id: 4, name: "Asteroid Ferra", resource: "alloys" as keyof PlayerResources, findChance: 0.1, maxResources: 1000 },
            { galaxyId: 1, id: 5, name: "Asteroid Cryon", resource: "frozenHydrogen" as keyof PlayerResources, findChance: 0.1, maxResources: 1000 },
            { galaxyId: 1, id: 6, name: "Asteroid Volta", resource: "energy" as keyof PlayerResources, findChance: 0.1, maxResources: 1000 },
        ]

    },
    {
        id: 2,
        name: "Andromeda",
        size: 70,
        image: require("../assets/images/galaxy1.webp"),
        planets: [
            { id: 1, name: "Planet B1", position: { x: 70, y: height / 5.2 } },
            { id: 2, name: "Planet B2", position: { x: 180, y: height / 3.5 } },
            { id: 3, name: "Planet B3", position: { x: 300, y: height / 2.5 } },
            { id: 4, name: "Planet B4", position: { x: 95, y: height / 2 } },
        ],
        asteroids: [
            { galaxyId: 2, id: 1, name: "Asteroid Pyros", resource: "fuel" as keyof PlayerResources, findChance: 0.45, maxResources: 1000 },
            { galaxyId: 2, id: 2, name: "Asteroid Helion", resource: "solarPlasma" as keyof PlayerResources, findChance: 0.25, maxResources: 1000 },
            { galaxyId: 2, id: 3, name: "Asteroid Obscura", resource: "darkMatter" as keyof PlayerResources, findChance: 0.15, maxResources: 1000 },
            { galaxyId: 2, id: 4, name: "Asteroid Ferris", resource: "alloys" as keyof PlayerResources, findChance: 0.08, maxResources: 1000 },
            { galaxyId: 2, id: 5, name: "Asteroid Glacius", resource: "frozenHydrogen" as keyof PlayerResources, findChance: 0.05, maxResources: 1000 },
            { galaxyId: 2, id: 6, name: "Asteroid Aether", resource: "energy" as keyof PlayerResources, findChance: 0.02, maxResources: 1000 },
        ]

    },
    {
        id: 3,
        size: 120,
        name: "Milky Way",
        image: require("../assets/images/galaxy2.webp"),
        planets: [
            { id: 1, name: "Planet C1", position: { x: 80, y: height / 5.5 } },
            { id: 2, name: "Planet C2", position: { x: 310, y: height / 4.2 } },
            { id: 3, name: "Planet C3", position: { x: 275, y: height / 3 } },
            { id: 4, name: "Planet C4", position: { x: 200, y: height / 2 } },
        ],
        asteroids: [
            { galaxyId: 3, id: 1, name: "Asteroid Ignatius", resource: "fuel" as keyof PlayerResources, findChance: 0.5, maxResources: 1000 },
            { galaxyId: 3, id: 2, name: "Asteroid Solaris", resource: "solarPlasma" as keyof PlayerResources, findChance: 0.3, maxResources: 1000 },
            { galaxyId: 3, id: 4, name: "Asteroid Ferrox", resource: "alloys" as keyof PlayerResources, findChance: 0.15, maxResources: 1000 },
            { galaxyId: 3, id: 3, name: "Asteroid Umbriel", resource: "darkMatter" as keyof PlayerResources, findChance: 0.2, maxResources: 1000 },
            { galaxyId: 3, id: 5, name: "Asteroid Cryonos", resource: "frozenHydrogen" as keyof PlayerResources, findChance: 0.1, maxResources: 1000 },
            { galaxyId: 3, id: 6, name: "Asteroid Electra", resource: "energy" as keyof PlayerResources, findChance: 0.05, maxResources: 1000 },
            { galaxyId: 3, id: 7, name: "Asteroid Cinderon", resource: "fuel" as keyof PlayerResources, findChance: 0.4, maxResources: 1000 },
        ]
    },
];

const generateRandomStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            id: i,
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * (0.2 + 2),
            fill: starColors[Math.floor(Math.random() * starColors.length)],
            opacity: Math.random() * 0.6 + 0.2
        });
    }
    return stars;
};


const starColors = [
    "white",
    "#9db4ff",
    "#ffc690",
    "#e4e8ff",
    "#ffbb7b",
    "#fff1df",
];

const stars = generateRandomStars(400);



const GalaxyView = ({ galaxy, onBack }: { galaxy: any; onBack: () => void }) => {
    const game = useGame();
    if (!game) return null;
    const { updateResources, resources, setFoundAsteroids, foundAsteroids, ships, updateShips, updateAchievToCompleted, isAchievementUnlocked } = game;
    const [isScanning, setIsScanning] = useState(false);
    const [scanCooldown, setScanCooldown] = useState(0);

    const scanCost = { fuel: 100, solarPlasma: 100, energy: 100 };


    // Helper function to check if the player can afford the scan cost
    const canAffordScan = () => {
        if (ships.scanningDrones <= 0) return false;

        return Object.entries(scanCost).every(([resource, amount]) => {
            return resources[resource as keyof PlayerResources]?.current >= amount;
        });
    };

    // Deduct the cost from player resources
    const deductScanCost = () => {
        // Add one mining drone
        updateShips("scanningDrones", ships.scanningDrones - 1);
        Object.entries(scanCost).forEach(([resource, amount]) => {
            updateResources(resource as keyof PlayerResources, {
                current: resources[resource as keyof PlayerResources].current - amount,
            });
        });
    };


    // Cooldown Timer
    useEffect(() => {
        if (scanCooldown > 0) {
            const timer = setTimeout(() => setScanCooldown(scanCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [scanCooldown]);

    const handleScan = () => {
        if (isScanning || scanCooldown > 0) {
            alert("Scanning is on cooldown!");
            return;
        }

        if (!canAffordScan()) {
            alert("Not enough resources to scan!");
            return;
        }

        deductScanCost();
        setIsScanning(true);

        setTimeout(() => {
            const foundAsteroid = galaxy.asteroids.find(
                (asteroid: IAsteroid) =>
                    !foundAsteroids.some((fa) => fa.id === asteroid.id) &&
                    Math.random() < asteroid.findChance
            );

            if (foundAsteroid) {
                if (!isAchievementUnlocked("find_an_asteroid")) {
                    updateAchievToCompleted("find_an_asteroid");
                    const story = achievements.find((ach) => ach.id === "find_an_asteroid")?.story;
                    alert(story);
                }


                setFoundAsteroids([
                    ...foundAsteroids,
                    {
                        ...foundAsteroid,
                        galaxyId: galaxy.id,
                        maxResources: Math.floor(Math.random() * 1000 + 500),
                        x: Math.random() * (width - 16), // Assign random x-coordinate with padding
                        y: Math.random() * (height - 16), // Assign random y-coordinate with padding
                    },
                ]);

                alert(`Found ${foundAsteroid.name}! It has ${foundAsteroid.maxResources} ${foundAsteroid.resource}.`);
            } else {
                alert("No asteroids found. Try scanning again.");
            }

            setIsScanning(false);
            setScanCooldown(5);
        }, 3000);
    };

    // Memoize the asteroids for this galaxy
    const visibleAsteroids = useMemo(
        () => foundAsteroids.filter((asteroid) => asteroid.galaxyId === galaxy.id),
        [foundAsteroids, galaxy.id]
    );

    return (
        <>
            <View style={styles.container}>
                <Svg height="100%" width="100%">
                    {/* Render stars */}
                    {stars.map((star) => (
                        <Circle
                            key={star.id}
                            cx={star.x}
                            cy={star.y}
                            r={star.radius}
                            fill={star.fill} // Random color
                            opacity={star.opacity} // Random opacity between 0.2 and 1 
                        />
                    ))}

                    {/* Render visible asteroids */}
                    {visibleAsteroids.map((asteroid) => (
                        <React.Fragment key={asteroid.id}>
                            <Circle
                                cx={asteroid.x} // Use the static x-coordinate
                                cy={asteroid.y ?? 0} // Use the static y-coordinate
                                r={5 + (asteroid.maxResources / 1000) * 5} // Size based on resources

                                fill={
                                    asteroid.resource === "fuel"
                                        ? "red"
                                        : asteroid.resource === "solarPlasma"
                                            ? "orange"
                                            : asteroid.resource === "darkMatter"
                                                ? "purple"
                                                : asteroid.resource === "alloys"
                                                    ? "gray"
                                                    : asteroid.resource === "frozenHydrogen"
                                                        ? "lightblue"
                                                        : asteroid.resource === "energy"
                                                            ? "yellow"
                                                            : "white"
                                }
                            />
                            <SvgText
                                x={asteroid.x}
                                y={(asteroid.y ?? 0) + 25}
                                fill="white"
                                fontSize={10}
                                textAnchor="middle"
                            >
                                {asteroid.name}
                            </SvgText>
                            <SvgText
                                x={asteroid.x}
                                y={(asteroid.y ?? 0) + 40}
                                fill="white"
                                fontSize={10}
                                textAnchor="middle"
                            >
                                {asteroid.maxResources}
                            </SvgText>
                        </React.Fragment>
                    ))}

                    {/* Render planets */}
                    {galaxy.planets.map((planet: IPlanet) => (
                        <React.Fragment key={planet.id}>
                            <Circle
                                cx={planet.position.x}
                                cy={planet.position.y}
                                r={20}
                                fill="blue"
                            />
                            <SvgText
                                x={planet.position.x}
                                y={planet.position.y + 35}
                                fill="white"
                                fontSize={14}
                                textAnchor="middle"
                            >
                                {planet.name}
                            </SvgText>
                        </React.Fragment>
                    ))}
                </Svg>

                {/* Scan Button */}
                {ships.scanningDrones > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.scanButtonContainer,
                            (isScanning || scanCooldown > 0 || !canAffordScan()) ? styles.disabledButton : null,
                        ]}
                        onPress={handleScan}
                        disabled={isScanning || scanCooldown > 0 || !canAffordScan()}
                    >
                        {/* Scan Cost */}
                        <View style={styles.scanCostContainer}>
                            {Object.entries(scanCost).map(([resource, amount]) => (
                                <View key={resource} style={styles.scanCostItem}>
                                    <ResourceIcon type={resource as keyof PlayerResources} size={18} />
                                    <Text style={styles.scanCostText}>{amount}</Text>
                                </View>
                            ))}
                            <View style={styles.scanCostItem}>
                                <ResourceIcon type="scanningDrones" size={18} />
                                <Text style={styles.scanCostText}>1</Text>
                            </View>
                        </View>

                        {/* Scan Button Text */}
                        <Text style={styles.scanButtonText}>
                            {isScanning
                                ? "Scanning..."
                                : scanCooldown > 0
                                    ? `Cooldown: ${scanCooldown}s`
                                    : "Scan for Asteroids"}
                        </Text>
                    </TouchableOpacity>


                )}

                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

            <ShipStatus />
        </>
    );
};


const ExplorationMap = () => {
    const [selectedGalaxy, setSelectedGalaxy] = useState<IGalaxy | null>(null);
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


                        <SvgImage
                            key={galaxy.id + 100}
                            href={galaxy.image}
                            x={galaxyPositions[index].cx - galaxy.size / 2}
                            y={galaxyPositions[index].cy - galaxy.size / 2}
                            width={galaxy.size}
                            height={galaxy.size}
                            onPress={() => setSelectedGalaxy(galaxy)} // Works for both mobile and web
                        />


                        <SvgText
                            key={galaxy.id + 200}
                            x={galaxyPositions[index].cx}
                            y={(galaxyPositions[index].cy + galaxy.size / 2) + 20}
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
    scanButtonContainer: {
        position: "absolute",
        bottom: 16,
        left: 'auto',
        backgroundColor: "#1F4068", // Futuristic HUD dark blue
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#00FFF5", // Futuristic glow
        shadowOpacity: 0.9,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
        borderWidth: 2,
        borderColor: "#00FFF5",
    },
    disabledButton: {
        backgroundColor: "#444",
        opacity: 0.5,
        borderColor: "#777",
        shadowColor: "transparent",
    },
    scanCostContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    scanCostItem: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 6,
    },
    scanCostText: {
        color: "#FFD700", // Gold for resource amounts
        fontSize: 14,
        marginLeft: 5,
    },
    scanButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
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
