# Nomads - Balanced Linear Progression System Analysis

## Executive Summary
After analyzing all game data files and researching RPG progression best practices, I've designed a balanced linear progression system that creates enjoyable, predictable growth while maintaining challenge and engagement throughout the game.

## Key Principles Applied

### 1. **Linear vs Exponential Trade-offs**
- **Linear Cost**: Consistent time investment per level/upgrade
- **Moderate Growth**: Balanced power increases that don't obsolete content
- **Predictable Scaling**: Players can plan their progression path
- **Content Longevity**: Earlier areas remain somewhat relevant

### 2. **Mathematical Foundation**
Based on research, the optimal progression uses:
- **Triangle Numbers** for milestone costs (XP, major upgrades)
- **Linear + Polynomial** for weapon/stat scaling
- **Sigmoid Curves** for diminishing returns on high-end content
- **Fractional Powers** for resource efficiency upgrades

## Current System Analysis

### Resources (Base Generation Rates)
```
Energy: 1.0/sec (base)
Fuel: 0.5/sec (base) 
Solar Plasma: 0.3/sec (base)
Frozen Hydrogen: 0.2/sec (base)
Alloys: 0.1/sec (base)
```

### Weapon Power Progression Issues
Current weapons show inconsistent scaling:
- Light weapons: 10-15 power
- Medium weapons: 22-25 power  
- Heavy weapons: 35-45 power

### Upgrade Cost Issues
Current upgrades use exponential multipliers (1.25x - 2.2x) which create:
- Early game rushes (too easy)
- Late game walls (too expensive)
- Unpredictable progression timing

## Recommended Linear Progression System

### 1. **Resource Generation Formula**
```typescript
// Base formula: Linear growth with efficiency bonuses
baseGeneration = baseRate * (1 + (level * 0.15))
efficiencyBonus = 1 + (upgradeLevel * 0.2)  // From core operations efficiency
finalGeneration = baseGeneration * efficiencyBonus
```

**New Base Rates:**
- Energy: 1.2/sec → 5.8/sec (level 20)
- Fuel: 0.6/sec → 2.4/sec (level 20)
- Solar Plasma: 0.4/sec → 1.6/sec (level 20)
- Frozen Hydrogen: 0.3/sec → 1.2/sec (level 20)
- Alloys: 0.2/sec → 0.8/sec (level 20)

### 2. **Weapon Power Scaling**
```typescript
// Balanced linear scaling by category
weaponPower = basePower + (level * powerGrowth) + categoryBonus

Small Weapons:  basePower: 15, growth: 2.5/level
Medium Weapons: basePower: 25, growth: 4.0/level  
Large Weapons:  basePower: 35, growth: 6.0/level
```

**Level 20 Power Ranges:**
- Small: 15 → 65 power (4.3x growth)
- Medium: 25 → 105 power (4.2x growth)
- Large: 35 → 155 power (4.4x growth)

### 3. **Upgrade Cost Formula (Triangle Numbers)**
```typescript
// Triangle number progression for major upgrades
upgradeCost = baseResourceCost * (level * (level + 1)) / 2

// Example: Reactor Optimization
Level 1: 35 energy
Level 2: 105 energy (35 * 3)
Level 3: 210 energy (35 * 6) 
Level 4: 350 energy (35 * 10)
Level 5: 525 energy (35 * 15)
```

### 4. **Experience/Progression Curves**
```typescript
// Enemy XP scaling
enemyXP = baseXP * (1 + (enemyLevel * 0.3))

// Player level requirements (modified triangle numbers)
levelXP = 100 * level * (level + 1) / 2

// Mission reward scaling
missionReward = baseReward * (1 + (missionTier * 0.5))
```

### 5. **Research Time Scaling**
```typescript
// Linear time scaling with complexity factors
researchTime = baseDuration * (1 + (tier * 0.4))

Tier 1: 300s (5 min)
Tier 2: 420s (7 min)
Tier 3: 540s (9 min)
Tier 4: 660s (11 min)
```

## Implementation Strategy

### Phase 1: Resource Rebalancing
1. Update base generation rates in `defaults.ts`
2. Implement linear growth formulas in resource generation
3. Adjust storage capacities using square root scaling

### Phase 2: Weapon System Overhaul
1. Rebalance all weapon power values in `weapons.ts`
2. Implement consistent scaling formulas
3. Update weapon costs to follow triangle number progression

### Phase 3: Upgrade System Reform
1. Replace exponential multipliers with triangle number costs
2. Rebalance upgrade effects for linear progression
3. Update achievement thresholds accordingly

### Phase 4: Mission & Research Balance
1. Implement linear reward scaling in `missions.ts`
2. Update research duration formulas in `research.ts`
3. Balance achievement requirements with new progression

## Expected Player Experience

### Early Game (Levels 1-5)
- **Progression Feel**: Steady, predictable growth
- **Time Investment**: 15-30 minutes per major milestone
- **Power Growth**: 2-3x starting power
- **Resource Availability**: Sufficient for exploration

### Mid Game (Levels 6-15)  
- **Progression Feel**: Meaningful choices between upgrades
- **Time Investment**: 30-60 minutes per major milestone
- **Power Growth**: 5-8x starting power
- **Resource Availability**: Strategic resource management required

### Late Game (Levels 16-25)
- **Progression Feel**: Significant achievements, epic scale
- **Time Investment**: 1-2 hours per major milestone  
- **Power Growth**: 10-15x starting power
- **Resource Availability**: Complex multi-resource optimization

## Balance Validation Metrics

### Power Scaling Validation
```
Level 1 vs Level 10 enemy: 40% damage reduction (challenging but doable)
Level 10 vs Level 15 enemy: 35% damage reduction (consistent challenge)
Level 15 vs Level 20 enemy: 30% damage reduction (skill can overcome)
```

### Resource Economy Health
```
Early game resource bottleneck: Energy (intended)
Mid game resource bottleneck: Alloys + Exotic materials (intended)
Late game resource bottleneck: Time + Strategic choices (intended)
```

### Progression Pacing
```
Tutorial to first upgrade: 5-10 minutes
First to second major upgrade: 15-20 minutes  
Each subsequent major upgrade: +10-15 minutes
```

## Conclusion

This linear progression system provides:
- **Predictable Growth**: Players can plan their advancement
- **Consistent Challenge**: Content remains relevant longer
- **Strategic Depth**: Multiple viable progression paths
- **Balanced Economy**: No resource becomes trivial or impossible
- **Sustainable Engagement**: Steady dopamine rewards without addiction mechanics

The system avoids common pitfalls of exponential progression while maintaining the satisfying feeling of character growth that makes RPGs compelling. 