import ShipStatus from "@/components/ShipStatus";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { useGame } from "@/context/GameContext"; // Assuming a game context
import achievements from "@/data/achievements";
import colors from "@/utils/colors";
import { IAsteroid, IGalaxy, IPlanet, PlayerResources, IMerchant } from "@/utils/defaults";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import { Circle, Defs, G, Polygon, RadialGradient, Stop, Svg, Image as SvgImage, Text as SvgText, Line, Path } from "react-native-svg";
import MerchantTradingModal from "@/components/MerchantTradingModal";


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
    return null;
};

const ScanningAnimation = ({ isScanning, width, height }: { isScanning: boolean, width: number, height: number }) => {
    const [animationPhase, setAnimationPhase] = useState(0);
    const gridOpacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isScanning) {
            Animated.timing(gridOpacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Simple timer-based animation
            const interval = setInterval(() => {
                setAnimationPhase(prev => (prev + 0.05) % 1);
            }, 50);

            return () => clearInterval(interval);
        } else {
            Animated.timing(gridOpacityAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
            setAnimationPhase(0);
        }
    }, [isScanning]);

    if (!isScanning) return null;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height) * 0.7;

    // Calculate animation values based on phase
    const rotationAngle = animationPhase * 360;
    const pulseScale = 0.8 + 0.4 * Math.sin(animationPhase * Math.PI * 4);
    const ringScale = Math.max(0.1, Math.sin(animationPhase * Math.PI * 2) * 1.5 + 0.5);
    const ringOpacity = Math.max(0.2, 1 - Math.abs(animationPhase - 0.5) * 2);

    return (
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: gridOpacityAnim }]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                <Defs>
                    <RadialGradient id="scanBeam" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="rgba(64, 224, 255, 0.8)" />
                        <Stop offset="70%" stopColor="rgba(64, 224, 255, 0.4)" />
                        <Stop offset="100%" stopColor="rgba(64, 224, 255, 0)" />
                    </RadialGradient>
                    <RadialGradient id="scanPulse" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="rgba(0, 255, 127, 0.3)" />
                        <Stop offset="100%" stopColor="rgba(0, 255, 127, 0)" />
                    </RadialGradient>
                </Defs>

                {/* Scanning grid overlay */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <G key={`grid-${i}`}>
                        <Line
                            x1={0}
                            y1={(height / 10) * i}
                            x2={width}
                            y2={(height / 10) * i}
                            stroke="rgba(64, 224, 255, 0.2)"
                            strokeWidth="1"
                        />
                        <Line
                            x1={(width / 10) * i}
                            y1={0}
                            x2={(width / 10) * i}
                            y2={height}
                            stroke="rgba(64, 224, 255, 0.2)"
                            strokeWidth="1"
                        />
                    </G>
                ))}

                {/* Central scanning pulse */}
                <G>
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={30 * pulseScale}
                        fill="url(#scanPulse)"
                    />
                </G>

                {/* Expanding rings */}
                {[1, 2, 3].map((ring) => (
                    <Circle
                        key={`ring-${ring}`}
                        cx={centerX}
                        cy={centerY}
                        r={50 * ring * ringScale}
                        fill="none"
                        stroke="rgba(0, 255, 127, 0.6)"
                        strokeWidth="2"
                        opacity={ringOpacity}
                    />
                ))}

                {/* Rotating scanning beam */}
                <G>
                    <Path
                        d={`M ${centerX} ${centerY} L ${centerX + maxRadius * Math.cos(rotationAngle * Math.PI / 180)} ${centerY + maxRadius * Math.sin(rotationAngle * Math.PI / 180)} L ${centerX + (maxRadius - 100) * Math.cos((rotationAngle + 30) * Math.PI / 180)} ${centerY + (maxRadius - 100) * Math.sin((rotationAngle + 30) * Math.PI / 180)} Z`}
                        fill="url(#scanBeam)"
                    />
                </G>

                {/* Corner scanning indicators */}
                {[
                    { x: 20, y: 20 },
                    { x: width - 20, y: 20 },
                    { x: 20, y: height - 20 },
                    { x: width - 20, y: height - 20 }
                ].map((corner, index) => (
                    <G key={`corner-${index}`}>
                        <Circle
                            cx={corner.x}
                            cy={corner.y}
                            r={8}
                            fill="rgba(64, 224, 255, 0.8)"
                            opacity={0.8}
                        />
                        <Circle
                            cx={corner.x}
                            cy={corner.y}
                            r={12 * pulseScale}
                            fill="none"
                            stroke="rgba(64, 224, 255, 0.6)"
                            strokeWidth="2"
                            opacity={0.6}
                        />
                    </G>
                ))}
            </Svg>
        </Animated.View>
    );
};

// Helper functions for collision detection
interface MapObject {
    x: number;
    y: number;
    radius: number;
}

const checkCollision = (obj1: MapObject, obj2: MapObject, minDistance: number = 10): boolean => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius + minDistance);
};

const findNonOverlappingPosition = (
    proposedObject: MapObject,
    existingObjects: MapObject[],
    safeArea: { x: number; y: number; width: number; height: number },
    maxAttempts: number = 50,
    minDistance: number = 10
): { x: number; y: number } | null => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.random() * safeArea.width + safeArea.x;
        const y = Math.random() * safeArea.height + safeArea.y;
        
        const testObject = { ...proposedObject, x, y };
        
        // Check if this position collides with any existing objects
        const hasCollision = existingObjects.some(existing => 
            checkCollision(testObject, existing, minDistance)
        );
        
        if (!hasCollision) {
            return { x, y };
        }
    }
    
    // If we couldn't find a non-overlapping position, return null
    return null;
};

const GalaxyView = ({ galaxy, onBack }: { galaxy: any; onBack: () => void }) => {
    const game = useGame();
    const navigator = useNavigation<NavigationProp<RootStackParamList>>();


    if (!game) return null;
    const { updateResources, resources, setFoundAsteroids, foundAsteroids, ships, updateShips, updateAchievToCompleted, isAchievementUnlocked, showGeneralNotification, showNotification, merchants, spawnMerchant, isDevMode, devSpawnMerchantAt, achievements } = game;
    const [isScanning, setIsScanning] = useState(false);
    const [scanCooldown, setScanCooldown] = useState(0);
    const [selectedMerchant, setSelectedMerchant] = useState<IMerchant | null>(null);
    const [tradingModalVisible, setTradingModalVisible] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const scanCost = { fuel: 100, solarPlasma: 100, energy: 100 };
    const stars = useMemo(() => generateRandomStars(300), []);

    // Update current time every second for merchant timers
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Helper function to format time remaining
    const formatTimeRemaining = (endTime: number) => {
        const remaining = Math.max(0, endTime - currentTime);
        const minutes = Math.floor(remaining / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

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
            showGeneralNotification({
                title: "Scanning Unavailable",
                message: "Scanning is on cooldown! Please wait.",
                type: "warning",
                icon: "⏰"
            });
            return;
        }

        if (!canAffordScan()) {
            showGeneralNotification({
                title: "Insufficient Resources",
                message: "Not enough resources to scan! You need fuel, solar plasma, and energy.",
                type: "error",
                icon: "⚡"
            });
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
                    const achievement = achievements.find((ach) => ach.id === "find_an_asteroid");
                    if (achievement) {
                        showNotification({
                            title: achievement.title,
                            description: achievement.story,
                            rewards: [],
                            type: 'achievement',
                        });
                    }
                }

                // Randomize max resources based on size we want
                const size = Math.random(); // 0-1 random value
                const maxResources = Math.floor(
                    // Larger size = more resources
                    // Small asteroids: 100-500
                    // Medium asteroids: 500-2000 
                    // Large asteroids: 2000-5000
                    size < 0.6 ? (Math.random() * 400 + 100) :
                    size < 0.9 ? (Math.random() * 1500 + 500) :
                    (Math.random() * 3000 + 2000)
                );

                // Calculate safe area bounds for asteroid placement
                const topMenuHeight = 80; // Space for exploration header/menu
                const bottomMenuHeight = 120; // Space for scan button and ship status
                const sideMargin = 80; // Space for back button and margins
                const asteroidRadius = Math.max(8, 8 + (maxResources / 1000) * 8);
                const textHeight = 50; // Space for asteroid name and resource text
                
                // Calculate safe positioning area
                const safeX = sideMargin + asteroidRadius;
                const safeY = topMenuHeight + asteroidRadius;
                const safeWidth = width - (sideMargin * 2) - (asteroidRadius * 2);
                const safeHeight = height - topMenuHeight - bottomMenuHeight - (asteroidRadius * 2) - textHeight;

                // Get existing objects to avoid collisions
                const existingObjects: MapObject[] = [
                    // Existing asteroids in this galaxy
                    ...foundAsteroids
                        .filter(a => a.galaxyId === galaxy.id && a.x !== undefined && a.y !== undefined)
                        .map(a => ({
                            x: a.x!,
                            y: a.y!,
                            radius: Math.max(8, 8 + (a.maxResources / 1000) * 8) + 20 // Extra space for text
                        })),
                    // Planets in this galaxy
                    ...galaxy.planets
                        .filter((p: IPlanet) => !p.locked)
                        .map((p: IPlanet) => ({
                            x: p.position.x,
                            y: p.position.y,
                            radius: 40 // Planet size + margin
                        })),
                    // Merchants in this galaxy
                    ...merchants
                        .filter(m => m.galaxyId === galaxy.id)
                        .map(m => ({
                            x: m.x,
                            y: m.y,
                            radius: 35 // Merchant size + margin
                        }))
                ];

                const safeArea = {
                    x: safeX,
                    y: safeY,
                    width: safeWidth,
                    height: safeHeight
                };

                const proposedAsteroid = {
                    x: 0, // Will be set by findNonOverlappingPosition
                    y: 0, // Will be set by findNonOverlappingPosition
                    radius: asteroidRadius + 20 // Extra space for text
                };

                const newPosition = findNonOverlappingPosition(proposedAsteroid, existingObjects, safeArea, 50, 15);

                const newAsteroid = {
                    ...foundAsteroid,
                    galaxyId: galaxy.id,
                    maxResources,
                    x: newPosition?.x || (Math.random() * safeWidth + safeX), // Fallback to random if no position found
                    y: newPosition?.y || (Math.random() * safeHeight + safeY), // Fallback to random if no position found
                };

                setFoundAsteroids([
                    ...foundAsteroids,
                    newAsteroid,
                ]);

                showGeneralNotification({
                    title: "Asteroid Discovered! 🌌",
                    message: `Found ${foundAsteroid.name}! It contains ${newAsteroid.maxResources} ${foundAsteroid.resource}.`,
                    type: "success",
                    icon: "🪨"
                });
            } else {
                showGeneralNotification({
                    title: "Scan Complete",
                    message: "No asteroids found in this sector. Try scanning again.",
                    type: "info",
                    icon: "🔍"
                });
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

    // Memoize the merchants for this galaxy
    const visibleMerchants = useMemo(
        () => merchants.filter((merchant) => merchant.galaxyId === galaxy.id),
        [merchants, galaxy.id]
    );

    // Merchant spawn timer - try to spawn merchants periodically
    useEffect(() => {
        const interval = setInterval(() => {
            spawnMerchant();
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, [spawnMerchant]);

    // Check for merchants leaving soon and warn player
    useEffect(() => {
        visibleMerchants.forEach(merchant => {
            const timeUntilLeaving = merchant.nextMoveTime - currentTime;
            
            // Warn when merchant has 2 minutes left and hasn't been warned recently
            if (timeUntilLeaving > 0 && timeUntilLeaving <= (2 * 60 * 1000) && timeUntilLeaving > (119 * 1000)) {
                showGeneralNotification({
                    title: "Merchant Leaving Soon! ⏰",
                    message: `${merchant.name} will depart in 2 minutes!`,
                    type: "warning",
                    icon: "⚠️"
                });
            }
        });
    }, [currentTime, visibleMerchants, showGeneralNotification]);

    // Handle merchant click
    const handleMerchantPress = (merchant: IMerchant) => {
        setSelectedMerchant(merchant);
        setTradingModalVisible(true);
    };

    // Handle dev mode background click for spawning merchants
    const handleBackgroundPress = (event: any) => {
        if (isDevMode && event.nativeEvent) {
            // For web, use different event properties
            const locationX = event.nativeEvent.locationX || event.nativeEvent.offsetX || event.nativeEvent.clientX;
            const locationY = event.nativeEvent.locationY || event.nativeEvent.offsetY || event.nativeEvent.clientY;
            
            // Check if the click position would overlap with existing objects
            let x = (locationX && !isNaN(locationX)) ? locationX : Math.random() * (width - 100) + 50;
            let y = (locationY && !isNaN(locationY)) ? locationY : Math.random() * (height - 100) + 50;
            
            // Get existing objects to avoid collisions
            const existingObjects: MapObject[] = [
                // Existing asteroids in this galaxy
                ...foundAsteroids
                    .filter(a => a.galaxyId === galaxy.id && a.x !== undefined && a.y !== undefined)
                    .map(a => ({
                        x: a.x!,
                        y: a.y!,
                        radius: Math.max(8, 8 + (a.maxResources / 1000) * 8) + 20
                    })),
                // Planets in this galaxy
                ...galaxy.planets
                    .filter((p: IPlanet) => !p.locked)
                    .map((p: IPlanet) => ({
                        x: p.position.x,
                        y: p.position.y,
                        radius: 40
                    })),
                // Other merchants in this galaxy
                ...merchants
                    .filter(m => m.galaxyId === galaxy.id)
                    .map(m => ({
                        x: m.x,
                        y: m.y,
                        radius: 35
                    }))
            ];

            const proposedMerchant = { x, y, radius: 35 };
            
            // Check if click position would cause overlap
            const hasCollision = existingObjects.some(existing => 
                checkCollision(proposedMerchant, existing, 15)
            );
            
            if (hasCollision) {
                // Find a safe position instead
                const safeArea = {
                    x: 80,
                    y: 80,
                    width: width - 160,
                    height: height - 200
                };
                
                const newPosition = findNonOverlappingPosition(proposedMerchant, existingObjects, safeArea, 30, 15);
                if (newPosition) {
                    x = newPosition.x;
                    y = newPosition.y;
                }
            }
            
            devSpawnMerchantAt(x, y, galaxy.id);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <Svg height="100%" width="100%" onPress={handleBackgroundPress}>
                    <Defs>
                        <RadialGradient id="stargradient" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
                            <Stop offset="10%" stopColor="rgba(255, 255, 255, 0.8)" />
                            <Stop offset="20%" stopColor="rgba(255, 255, 255, 0.6)" />
                            <Stop offset="30%" stopColor="rgba(255, 255, 255, 0.4)" />
                            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                        </RadialGradient>
                    </Defs>

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
                    {visibleAsteroids.filter(asteroid => asteroid.x !== undefined && asteroid.y !== undefined).map((asteroid) => (
                        <React.Fragment key={asteroid.id}>
                            <Circle
                                cx={asteroid.x!} // Use the static x-coordinate
                                cy={asteroid.y!} // Use the static y-coordinate
                                r={Math.max(8, 8 + (asteroid.maxResources / 1000) * 8)} // Larger minimum size for visibility
                                onPress={() => showGeneralNotification({
                                    title: asteroid.name,
                                    message: `This asteroid contains ${asteroid.maxResources} ${asteroid.resource}. Deploy mining drones to extract resources.`,
                                    type: "info",
                                    icon: "🪨"
                                })}
                                stroke="white" // Add stroke for better visibility
                                strokeWidth="2"
                                fill={
                                    asteroid.resource === "fuel"
                                        ? "#FF6B6B"
                                        : asteroid.resource === "solarPlasma"
                                            ? "#FFB347"
                                            : asteroid.resource === "darkMatter"
                                                ? "#9B59B6"
                                                : asteroid.resource === "alloys"
                                                    ? "#95A5A6"
                                                    : asteroid.resource === "frozenHydrogen"
                                                        ? "#5DADE2"
                                                        : asteroid.resource === "energy"
                                                            ? "#F1C40F"
                                                            : "#ECF0F1"
                                }
                            />
                            <SvgText
                                x={asteroid.x!}
                                y={asteroid.y! + Math.max(8, 8 + (asteroid.maxResources / 1000) * 8) + 18}
                                fill="white"
                                fontSize={12}
                                fontWeight="bold"
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="0.5"
                            >
                                {asteroid.name}
                            </SvgText>
                            <SvgText
                                x={asteroid.x!}
                                y={asteroid.y! + Math.max(8, 8 + (asteroid.maxResources / 1000) * 8) + 32}
                                fill="#F1C40F"
                                fontSize={10}
                                fontWeight="bold"
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="0.5"
                            >
                                {asteroid.maxResources} {asteroid.resource}
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
                                    // Check if this is the first time entering a planet's orbit
                                    if (!isAchievementUnlocked("enter_a_planet")) {
                                        updateAchievToCompleted("enter_a_planet");
                                        const achievement = achievements.find((ach) => ach.id === "enter_a_planet");
                                        if (achievement) {
                                            showNotification({
                                                title: achievement.title,
                                                description: achievement.story,
                                                rewards: [],
                                                type: 'achievement',
                                            });
                                        }
                                    }

                                    if (planet.pirateCount > 0) {
                                        navigator.navigate("CombatPage", { planet });
                                    } else {
                                        // Show info for planets with no pirates
                                        showGeneralNotification({
                                            title: `${planet.name} - Peaceful`,
                                            message: "This planet is peaceful and has no hostile activity detected. Continue exploring to find planets with pirates to fight!",
                                            type: "info",
                                            icon: "🌍"
                                        });
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

                    {/* Render merchants */}
                    {visibleMerchants.map((merchant) => {
                        const timeRemaining = formatTimeRemaining(merchant.nextMoveTime);
                        const isLeavingSoon = (merchant.nextMoveTime - currentTime) < (5 * 60 * 1000); // Less than 5 minutes
                        
                        return (
                            <G key={merchant.id} onPress={() => handleMerchantPress(merchant)}>
                                {/* Merchant Ship */}
                                <Circle
                                    cx={merchant.x}
                                    cy={merchant.y}
                                    r={20}
                                    fill={isLeavingSoon ? "#FF6B6B" : "#FFD700"}
                                    stroke={isLeavingSoon ? "#FF4444" : "#FFA500"}
                                    strokeWidth="2"
                                />
                                {/* Merchant Icon */}
                                <SvgText
                                    x={merchant.x}
                                    y={merchant.y + 6}
                                    fill="black"
                                    fontSize={16}
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    🛸
                                </SvgText>
                                {/* Merchant Name */}
                                <SvgText
                                    x={merchant.x}
                                    y={merchant.y + 35}
                                    fill={isLeavingSoon ? "#FF6B6B" : "#FFD700"}
                                    fontSize={12}
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    stroke="black"
                                    strokeWidth="0.5"
                                >
                                    {merchant.name}
                                </SvgText>
                                {/* Merchant Type */}
                                <SvgText
                                    x={merchant.x}
                                    y={merchant.y + 48}
                                    fill={isLeavingSoon ? "#FF8888" : "#FFA500"}
                                    fontSize={10}
                                    textAnchor="middle"
                                    stroke="black"
                                    strokeWidth="0.5"
                                >
                                    {merchant.type.charAt(0).toUpperCase() + merchant.type.slice(1)} Trader
                                </SvgText>
                                {/* Countdown Timer */}
                                <SvgText
                                    x={merchant.x}
                                    y={merchant.y + 61}
                                    fill={isLeavingSoon ? "#FF4444" : "#FFFFFF"}
                                    fontSize={9}
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    stroke="black"
                                    strokeWidth="0.5"
                                >
                                    Leaves in: {timeRemaining}
                                </SvgText>
                                {/* Pulsing effect for merchants leaving soon */}
                                {isLeavingSoon && (
                                    <Circle
                                        cx={merchant.x}
                                        cy={merchant.y}
                                        r={25}
                                        fill="none"
                                        stroke="#FF4444"
                                        strokeWidth="1"
                                        opacity="0.6"
                                    />
                                )}
                            </G>
                        );
                    })}

                </Svg>

                {/* Scanning Animation Overlay */}
                {isScanning && <ScanningAnimation isScanning={isScanning} width={width} height={height} />}

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
                                ? "Scanning" + ".".repeat(Math.floor(Date.now() / 500) % 4)
                                : scanCooldown > 0
                                    ? `Cooldown: ${scanCooldown}s`
                                    : "Scan for Asteroids"}
                        </Text>
                    </TouchableOpacity>
                                    )}

                {/* Dev Mode Indicator */}
                {isDevMode && (
                    <View style={styles.devModeIndicator}>
                        <Text style={styles.devModeText}>🛠️ DEV MODE</Text>
                        <Text style={styles.devModeSubtext}>Tap anywhere to spawn merchant</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                {/* Merchant Trading Modal */}
                <MerchantTradingModal
                    visible={tradingModalVisible}
                    merchant={selectedMerchant}
                    onClose={() => {
                        setTradingModalVisible(false);
                        setSelectedMerchant(null);
                    }}
                />
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
    devModeIndicator: {
        position: "absolute",
        top: 16,
        left: 16,
        backgroundColor: "rgba(255, 165, 0, 0.9)",
        padding: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#FF8C00",
    },
    devModeText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
        textAlign: "center",
    },
    devModeSubtext: {
        color: "white",
        fontSize: 10,
        textAlign: "center",
        marginTop: 2,
    },
});

export default ExplorationMap;
