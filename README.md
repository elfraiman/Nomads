# Nomads - Space Combat & Resource Management Game

## Overview
Nomads is a strategic space combat and resource management game where players navigate through hostile galaxies, manage resources, upgrade their ships, and engage in tactical combat with various pirate factions.

## Game Mechanics

### Combat System

#### Weapon Mechanics
- **Categories**: Weapons are divided into three categories:
  - Small: Excels against corvettes (+15%), poor vs larger ships
  - Medium: Balanced performance, best against cruisers (+15%)
  - Large: Powerful against capital ships (+15-20%), struggles with small targets

#### Hit Chance Calculation
1. **Base Accuracy**
   - Weapon's base accuracy stat
   - Category modifiers (-20% to +20%)
   - Size scaling bonus (0% to +20%)

2. **Target Evasion**
   - Based on target's attack speed
   - Maximum evasion capped at 40%
   - Formula: min(attackSpeed * 4, 40)

3. **Final Hit Chance**
   - Range: 15% (minimum) to 90% (maximum)
   - Includes ±5% random variance
   - Formula: (effectiveAccuracy - baseEvasion + randomVariance) / 100

#### Damage System
- Base weapon damage × Random multiplier (0.8 to 1.2)
- Reduced by target's defense percentage
- Weapon durability decreases with each shot
- Resource cost per shot

### Ship Classes & Balance

#### Pirates
1. **Corvettes**
   - Health: 130-200
   - Attack: 14-20
   - Defense: 6-12
   - Fast attack speed (3.2-3.8s)
   - Accuracy penalty: -6%

2. **Cruisers**
   - Health: 220-350
   - Attack: 20-30
   - Defense: 10-18
   - Medium attack speed (3.8-4.2s)
   - Accuracy penalty: -3%

3. **Battleships**
   - Health: 750-1000
   - Attack: 60-75
   - Defense: 32-40
   - Slow attack speed (5.2-5.8s)
   - Accuracy bonus: +10%

4. **Dreadnoughts**
   - Health: 450-650
   - Attack: 40-55
   - Defense: 18-28
   - Very slow attack speed (4.3-4.8s)
   - Specialized roles

5. **Titans**
   - Health: 1400-2000
   - Attack: 85-100
   - Defense: 42-55
   - Extremely slow attack speed (6.0-7.0s)
   - Accuracy bonus: +12%

### Pirate Factions

#### Nebula Marauders
- Specialization: Missile and energy weapons
- Balanced stats with focus on raw damage
- Signature ship: Nebula Titan with Graviton Beam

#### Void Corsairs
- Specialization: Stealth and ion weapons
- Higher attack, lower defense
- Signature ship: Corsair Titan with Singularity Cannon

#### Star Scavengers
- Specialization: Salvaged and hybrid weapons
- Higher health, lower attack speed
- Signature ship: Scavenger Colossus with Graviton Projector

#### Titan Vanguard
- Specialization: Heavy weapons and defense
- Highest health and defense
- Signature ship: Titan Colossus with Graviton Annihilator

### Resource Management

#### Resource Types
1. **Energy**
   - Primary weapon power source
   - High efficiency (2.0)
   - Essential for all operations

2. **Fuel**
   - Required for mobility
   - Good efficiency (1.8)
   - Used in missile weapons

3. **Solar Plasma**
   - Advanced energy weapon source
   - Medium efficiency (1.6)
   - High damage potential

4. **Dark Matter**
   - Exotic weapon power
   - Moderate efficiency (1.2)
   - Special weapon effects

5. **Frozen Hydrogen**
   - Specialized cooling
   - Low efficiency (0.9)
   - Used in advanced systems

6. **Alloys**
   - Ship construction/repair
   - Very low efficiency (0.3)
   - Durability improvements

7. **Tokens**
   - Special currency
   - Base efficiency (1.0)
   - Used for upgrades

### Combat Interface

#### Weapon Control
- Individual weapon activation
- Auto-fire system
- Cooldown management
- Resource consumption tracking
- Durability monitoring

#### Combat Display
- Target overview with detailed stats
- Ship status and resource bars
- Weapon grouping by type
- Combat log with color-coded entries
- Escape system with cooldown

### Progression System

#### Planet Unlocking
- Clear pirates to unlock next planet
- Increasing difficulty per planet
- Special rewards and resources
- Faction-specific challenges

#### Ship Upgrades
- Weapon slot expansion
- Resource capacity increases
- Defense improvements
- New weapon unlocks

## Technical Details

### Combat Calculations

#### Weapon Hit Formula
```typescript
finalHitChance = min(
  max(
    (weaponAccuracy + categoryModifier + sizeScaling - baseEvasion + randomVariance) / 100,
    0.15  // Minimum 15% hit chance
  ),
  0.90   // Maximum 90% hit chance
)
```

#### Damage Formula
```typescript
damage = floor(
  weaponPower * 
  randomMultiplier(0.8 to 1.2) * 
  (1 - targetDefense/100)
)
```

### Resource Generation
```typescript
resourceGain = baseGeneration * efficiency * modifiers
```

## Development

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm start`

### Contributing
1. Fork the repository
2. Create feature branch
3. Submit pull request

## License
[Add License Information]

## Credits
[Add Credits Information]
