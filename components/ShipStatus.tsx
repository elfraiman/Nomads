import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameContext } from '../context/GameContext';
import ResourceIcon from './ui/ResourceIcon';

const ShipStatus = () => {
    const game = useContext(GameContext);

    if (!game) return null;

    const { resources, autoEnergyGeneration } = game;

    const energyPercentage = resources?.energy
        ? (resources.energy.current / resources.energy.max) * 100
        : 0;

    return (
        <View style={styles.container}>
            {/* Energy Bar */}
            <View style={styles.energyBarContainer}>
                <LinearGradient
                    colors={['#FFD93D', '#FFA726', '#FF5722']} // Gradient colors
                    start={[0, 0]}
                    end={[1, 0]}
                    style={[styles.energyBarFill, { width: `${energyPercentage}%` }]}
                />
                <View style={styles.energyBarTextContainer}>
                    <ResourceIcon type="energy" size={20} />
                    <Text style={styles.energyBarText}>
                        {resources?.energy.current}/{resources?.energy.max} ({autoEnergyGeneration}/sec)
                    </Text>
                </View>
            </View>

            {/* Other Resources */}
            {Object.entries(resources).map(([key, resource]) => {
                if (key === 'energy') return null;

                return (
                    <View style={styles.resource} key={key}>
                        <ResourceIcon type={key as keyof typeof resources} />
                        <Text style={styles.text}>
                            {resource.current}/{resource.max}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#222',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#444',
    },
    energyBarContainer: {
        position: 'absolute',
        top: -20,
        left: 0,
        right: 0,
        height: 25,
        backgroundColor: '#444',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    energyBarFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    energyBarTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    energyBarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    resource: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    text: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ShipStatus;
