# Survival Terminal RPG

A retro CRT-inspired survival RPG built with React, Vite, and Tailwind CSS. Navigate a procedurally-generated wasteland through a terminal interface. Scavenge for Borderlands-style loot, build settlement structures, progress through multi-stage story arcs, and survive the elements.

## Features

### Gameplay
- **Terminal interface** with command parsing and live command history
- **Procedural loot generation** with prefix/suffix combinations (Borderlands-style)
- **Survival mechanics**: Hunger, thirst, health, and stamina decay
- **Combat encounters**: Turn-based battles with 18+ enemy types across 4 tiers
- **Tiered enemy system** (Tier 1-4) with scaling rewards
- **Leveling system**: 50 level cap with exponential XP curve (100 → 5400 XP needed)
- **Perk acquisition**: 16 unique perks with gameplay effects (gained every 3 levels)
- **Persistent settlement**: 10 unique buildings with passive effects and resource generation

### Content
- **7 scavenging zones** with unique difficulty modifiers and resource distributions
- **3 narrative story arcs** with multi-stage progressions and objective tracking
- **38+ unique base items** across multiple equipment slots
- **8 item prefixes + 6 suffixes** for hundreds of loot variations
- **5 rarity tiers** (Common → Legendary) with different stat ranges
- **Dynamic transmissions**: 15+ radio barks for flavor and world building

### Buildings
- Water Purifier (water generation)
- Garden + Hydroponics (food production)
- Weapons Workshop (damage boost + salvage discount)
- Medical Bay (enhanced healing)
- Power Plant (stamina recovery)
- Radio Tower (rare loot bonus)
- Scrap Smelter (electronics generation)
- Defense Turret (encounter reduction)
- Armory (gear management framework)

## Getting Started

### Installation
```bash
git clone <repository-url>
cd pipboy-project
npm install
```

### Development
```bash
npm run dev
# Game will be accessible at http://localhost:5175
```

### Production Build
```bash
npm run build
npx http-server dist -p 8080
# Game will be at http://localhost:8080
```

## Terminal Commands

### Exploration & Combat
- `scavenge` - Explore current zone, encounter enemies or find loot
- `attack` - Strike during combat
- `flee` - Attempt escape from combat
- `zone list` - View all available zones
- `zone [zone-id]` or `travel [zone-id]` - Move to a different zone

### Survival
- `eat` - Consume food (restores hunger)
- `drink` - Consume water (restores thirst)
- `rest` - Sleep and recover health
- `status` - Display character vitals, attributes, and narrative progress

### Equipment
- `inv` or `inventory` - List equipped gear and inventory
- `equip [item-name]` - Equip an item by name
- `equip [slot] [item-name]` - Equip to specific slot (head, body, hand, trinket)
- `unequip [slot]` - Remove gear from slot
- `unequip all` - Remove all equipped items
- `salvage` - Convert scrap + electronics into random equipment

### Settlement & Progression
- `build water purifier` - Construct water generation (20 scrap, 8 electronics)
- `build garden` - Build food farm (15 scrap, 3 electronics)
- `build radio tower` - Boost signal for rare loot (30 scrap, 12 electronics)
- `build workshop` - Weapons workshop for crafting (40 scrap, 20 electronics)
- `build power plant` - Power generation (50 scrap, 35 electronics)
- `build medical bay` - Enhanced healing station (45 scrap, 18 electronics)
- `build defense turret` - Reduce encounters (25 scrap, 25 electronics)
- `build armory` - Gear management (35 scrap, 15 electronics)
- `build hydroponics` - Advanced food lab (55 scrap, 25 electronics)
- `build scrap smelter` - Electronics generation (60 scrap, 40 electronics)

### Progression
- `intel` or `mission` - Review current story objective
- `perks` - List available and acquired perks
- `perk [perk-id]` - Acquire a perk (costs 1 perk point)

## Game Systems

### Survival Decay
- Hunger decays 0.08/sec, damage health if depleted
- Thirst decays 0.12/sec, damage health if depleted
- Stamina regenerates slowly (5% per tick)
- Building effects & perks modify decay rates

### Loot Generation
- Base items are randomly modified with prefixes/suffixes
- Item rarity determines stat ranges (0-6 max per stat)
- Each item gets 1-3 random stat modifiers
- Rare loot bonus increases legendary drop chance

### Leveling
- Level 1: 100 XP required
- Each subsequent level: +50 XP (Level 2 = 150, Level 3 = 200, etc.)
- Level cap: 50 (5400 total XP needed)
- Every 3 levels grants +1 perk point
- All level-ups restore +10 health

### Perks
Each perk provides unique gameplay bonuses:
- Resource bonuses (scrap, electronics, food, water)
- Combat modifications (damage, flee chance, enemy tier reduction)
- Survival improvements (decay reduction, health recovery)
- Special effects (damage boost vs machines, permanent stat gains, secondary item slots)

## Project Structure

```
src/
├── main.jsx           # React entry point
├── App.jsx            # Main game component with UI layout
├── index.css          # Global styles (CRT effects, theme)
├── gameReducer.js     # Game state & action handlers (1500+ lines)
├── gameData.js        # Game content (items, enemies, zones, stories)
```

## Technology Stack
- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **Tailwind CSS 3** - Utility-first styling
- **JavaScript (ES6+)** - Game logic & state management
- **useReducer hook** - Centralized game state

## Browser Compatibility
Tested and working in:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Notes for Cloners
- Game saves are not persistent (stored in browser memory only)
- No backend required - fully client-side
- Terminal commands are case-insensitive
- All colors follow the CRT green phosphor aesthetic (#c9ffe0 on #040806)
