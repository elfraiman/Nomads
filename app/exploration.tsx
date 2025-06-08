import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext"; // Assuming a game context
import achievements from "@/data/achievements";
import colors from "@/utils/colors";
import { IAsteroid, IGalaxy, IPlanet, PlayerResources } from "@/utils/defaults";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Circle, Defs, G, Polygon, RadialGradient, Stop, Svg, Image as SvgImage, Text as SvgText } from "react-native-svg";


const { width: fullWidth, height: fullHeight } = Dimensions.get("window");

const padding = 0; // 16px padding on each side
const width = fullWidth - padding;
const height = fullHeight - padding;

const starColors = [
    "white",
    "#9db4ff",
    "#ffc690",
    "#e4e8ff",
    "#ffbb7b",
    "#fff1df",
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
            opacity: Math.random() * 0.8 + 0.2
        });
    }
    return stars;
};


export type RootStackParamList = {
    Exploration: undefined;
    CombatPage: { planet: IPlanet };
};


const AnimatedPirates = ({ planet }: { planet: IPlanet }) => {
    // Generate pirates' attributes only once
    const pirates = useMemo(
        () =>
            Array.from({ length: planet.pirateCount }).map(() => {
                const angle = Math.random() * 360; // Random starting angle
                const radius = 30 + Math.random() * 20; // Base radius with some variation
                const speed = 20 + Math.random() * 10; // Duration between 20-30 seconds
                const clockwise = Math.random() > 0.5 ? 1 : -1; // Random rotation direction
                return { angle, radius, speed, clockwise };
            }),
        [planet.pirateCount] // Recalculate only if pirate count changes
    );

    return (
        <G>
            {pirates.map((pirate, index) => {
                // Calculate initial position
                const startAngle = pirate.angle * pirate.clockwise;
                const x = planet.position.x + pirate.radius * Math.cos((startAngle * Math.PI) / 180);
                const y = planet.position.y + pirate.radius * Math.sin((startAngle * Math.PI) / 180);

                return (
                    <G key={`${planet.id}-pirate-${index}`}>
                        {/* Pirate Arrow Icon */}
                        <G
                            transform={`translate(${x}, ${y}) rotate(${startAngle})`} // Position and orient the arrow
                        >
                            <Polygon
                                points="0, 2, 0, -9 6, 0" // Triangle shape for the arrow
                                fill="red"
                                opacity={0.8}
                            />
                        </G>

                        {/* Animation */}
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`${startAngle} ${planet.position.x} ${planet.position.y}`}
                            to={`${startAngle + 360 * pirate.clockwise} ${planet.position.x} ${planet.position.y}`}
                            dur={`${pirate.speed}s`}
                            repeatCount="indefinite"
                            additive="sum"
                        />
                    </G>
                );
            })}
        </G>
    );
};


const GalaxyView = ({ galaxy, onBack }: { galaxy: any; onBack: () => void }) => {
    const game = useGame();
    const navigator = useNavigation<NavigationProp<RootStackParamList>>();


    if (!game) return null;
    const { updateResources, resources, setFoundAsteroids, foundAsteroids, ships, updateShips, updateAchievToCompleted, isAchievementUnlocked } = game;
    const [isScanning, setIsScanning] = useState(false);
    const [scanCooldown, setScanCooldown] = useState(0);
    const scanCost = { fuel: 100, solarPlasma: 100, energy: 100 };
    const stars = useMemo(() => generateRandomStars(300), []);

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
                                onPress={() => alert(`${asteroid.maxResources} of ${asteroid.resource}`)}
                                onPressIn={() => alert(`${asteroid.maxResources} of ${asteroid.resource}`)}
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
                    {galaxy.planets.filter((p: IPlanet) => !p.locked).map((planet: IPlanet) => (
                        <React.Fragment key={planet.id}>
                            {/* Planet Image */}
                            <SvgImage
                                href={planet.image}
                                x={planet.position.x - 30}
                                y={planet.position.y - 40}
                                width={60}
                                height={60}
                                onPress={() => {
                                    if (planet.pirateCount > 0) {
                                        navigator.navigate("CombatPage", { planet });
                                    }

                                }}
                            />

                            {/* Animated Pirates */}
                            <AnimatedPirates planet={planet} />

                            {/* Planet Name */}
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
                {isAchievementUnlocked("build_scanning_drones") && (
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
    const game = useGame();
    if (!game) return null;
    const galaxies = useMemo(() => game.galaxies, [game.galaxies]);
    const [selectedGalaxy, setSelectedGalaxy] = useState<IGalaxy | null>(null);
    const stars = useMemo(() => generateRandomStars(1000), []);

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
                    galaxy.found && (
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
                                onPressIn={() => setSelectedGalaxy(galaxy)}
                                onPress={() => setSelectedGalaxy(galaxy)}
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
                    )
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
        backgroundColor: colors.panelBackground, // Futuristic HUD dark blue
        padding: 6,
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: colors.glowEffect, // Futuristic glow
        shadowOpacity: 0.9,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    disabledButton: {
        backgroundColor: colors.disabledBackground,
        opacity: 0.5,
        borderColor: colors.disabledBorder,
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
        color: colors.textPrimary, // Gold for resource amounts
        fontSize: 14,
        marginLeft: 5,
        fontWeight: 700,
    },
    scanButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        textAlign: "center",
    },
    backButton: {
        position: "absolute",
        bottom: 16,
        left: 16,
        backgroundColor: colors.hudBlue,
        padding: 10,
    },
    backButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default ExplorationMap;
