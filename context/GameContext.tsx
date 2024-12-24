import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface Resource {
    current: number;
    max: number;
}

interface Resources {
    fuel: Resource;
    solarPlasma: Resource;
    darkMatter: Resource;
    frozenHydrogen: Resource;
    alloys: Resource;
    energy: Resource;
    tokens: Resource;
}

interface GameContextType {
    resources: Resources;
    autoEnergyGeneration: number;
    updateResources: (type: keyof Resources, changes: Partial<Resource>) => void;
    upgradeEnergyGenerator: () => void;
    downgradeEnergyGenerator: () => void;
    repairShip: () => void;
    energyGeneratorUpgradeCost: number;
}

const initialResources: Resources = {
    fuel: { current: 0, max: 100 },
    solarPlasma: { current: 0, max: 100 },
    darkMatter: { current: 0, max: 100 },
    frozenHydrogen: { current: 0, max: 100 },
    alloys: { current: 0, max: 100 },
    energy: { current: 10, max: 100 },
    tokens: { current: 0, max: 100 },
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [resources, setResources] = useState<Resources>(initialResources);
    const [autoEnergyGeneration, setAutoEnergyGeneration] = useState(0); // Base energy/sec
    const [energyGeneratorUpgradeCost, setEnergyGeneratorUpgradeCost] = useState(20); // Initial cost

    // Updates resources globally
    const updateResources = (type: keyof Resources, changes: Partial<Resource>) => {
        setResources((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                ...changes,
                current: Math.min(
                    prev[type].max,
                    Math.max(0, changes.current !== undefined ? changes.current : prev[type].current)
                ),
                max: changes.max !== undefined ? changes.max : prev[type].max,
            },
        }));
    };

    // Automatic energy generation every second
    useEffect(() => {
        const interval = setInterval(() => {
            if (autoEnergyGeneration > 0) {
                updateResources('energy', { current: resources.energy.current + autoEnergyGeneration });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [autoEnergyGeneration, resources.energy.current]);

    // Upgrade the energy generator
    const upgradeEnergyGenerator = () => {
        if (resources.energy.current >= energyGeneratorUpgradeCost) {
            updateResources('energy', { current: resources.energy.current - energyGeneratorUpgradeCost });
            setAutoEnergyGeneration((prev) => prev + 1); // Increase energy/sec
            setEnergyGeneratorUpgradeCost((prev) => Math.floor(prev * 1.5)); // Exponential cost
        } else {
            alert('Not enough energy to upgrade the generator!');
        }
    };

    // Downgrade the energy generator
    const downgradeEnergyGenerator = () => {
        if (autoEnergyGeneration > 0) {
            setAutoEnergyGeneration((prev) => prev - 1); // Reduce energy/sec
            setEnergyGeneratorUpgradeCost((prev) => Math.floor(prev / 1.5)); // Reduce the cost exponentially
            updateResources("energy", { current: resources.energy.current + Math.floor(energyGeneratorUpgradeCost / 2) }); // Refund half the cost
        }
    };


    // Repairs the ship, consuming energy
    const repairShip = () => {
        if (resources.energy.current >= 20) {
            updateResources('energy', { current: resources.energy.current - 20 });
            updateResources('fuel', { current: resources.fuel.current + 10 });
        } else {
            alert('Not enough Energy to perform repairs!');
        }
    };

    return (
        <GameContext.Provider
            value={{
                resources,
                autoEnergyGeneration,
                updateResources,
                upgradeEnergyGenerator,
                repairShip,
                energyGeneratorUpgradeCost,
                downgradeEnergyGenerator,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
