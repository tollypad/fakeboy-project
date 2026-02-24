export const RARITIES = [
  {
    id: 'common',
    label: 'Common',
    weight: 55,
    statRange: [0, 1],
    valueMult: 1,
    color: 'text-crt-200'
  },
  {
    id: 'uncommon',
    label: 'Uncommon',
    weight: 25,
    statRange: [1, 2],
    valueMult: 1.4,
    color: 'text-crt-300'
  },
  {
    id: 'rare',
    label: 'Rare',
    weight: 12,
    statRange: [2, 3],
    valueMult: 2,
    color: 'text-crt-400'
  },
  {
    id: 'epic',
    label: 'Epic',
    weight: 6,
    statRange: [3, 4],
    valueMult: 2.8,
    color: 'text-crt-500'
  },
  {
    id: 'legendary',
    label: 'Legendary',
    weight: 2,
    statRange: [4, 6],
    valueMult: 4,
    color: 'text-crt-100'
  }
]

export const LEVEL_CAP = 50
export const getXpForLevel = (level) => {
  // Scaling curve: 100 at level 1, increasing by 50 each level
  return 100 + (level - 1) * 50
}

// Item prefixes (Borderlands-style)
export const ITEM_PREFIXES = [
  { id: 'heavy', name: 'Heavy', stats: { str: 2, agi: -1 }, weight: 10 },
  { id: 'precise', name: 'Precise', stats: { agi: 2, str: -1 }, weight: 10 },
  { id: 'lucky', name: 'Lucky', stats: { luk: 3 }, weight: 8 },
  { id: 'refined', name: 'Refined', stats: { all: 1 }, weight: 15 },
  { id: 'reinforced', name: 'Reinforced', stats: { str: 1, agi: 1 }, weight: 12 },
  { id: 'tactical', name: 'Tactical', stats: { agi: 2 }, weight: 10 },
  { id: 'hunting', name: 'Hunting', stats: { str: 2, luk: 1 }, weight: 8 },
  { id: 'scoped', name: 'Scoped', stats: { luk: 2, agi: 1 }, weight: 6 }
]

export const ITEM_SUFFIXES = [
  { id: 'ofDexterity', name: 'of Dexterity', stats: { agi: 2 }, weight: 12 },
  { id: 'ofStrength', name: 'of Strength', stats: { str: 2 }, weight: 12 },
  { id: 'ofFortune', name: 'of Fortune', stats: { luk: 3 }, weight: 10 },
  { id: 'ofVitality', name: 'of Vitality', stats: { str: 1, agi: 1 }, weight: 10 },
  { id: 'ofSharpness', name: 'of Sharpness', stats: { agi: 2, luk: 1 }, weight: 8 },
  { id: 'ofMight', name: 'of Might', stats: { str: 3 }, weight: 6 }
]

export const PERKS = [
  {
    id: 'scavenger',
    name: 'Scavenger Instincts',
    description: 'Recover +20% scrap when scavenging.',
    effects: { scrapBonus: 0.2 }
  },
  {
    id: 'circuitWhisperer',
    name: 'Circuit Whisperer',
    description: 'Find +20% electronics in the field.',
    effects: { electronicsBonus: 0.2 }
  },
  {
    id: 'rationer',
    name: 'Rationer',
    description: 'Hunger decays 10% slower, food scavenges +20%.',
    effects: { hungerDecayMult: 0.9, foodBonus: 0.2 }
  },
  {
    id: 'canteenMaster',
    name: 'Canteen Master',
    description: 'Thirst decays 10% slower, water scavenges +20%.',
    effects: { thirstDecayMult: 0.9, waterBonus: 0.2 }
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Deal +12% damage in combat.',
    effects: { damageMult: 1.12 }
  },
  {
    id: 'evasive',
    name: 'Evasive Protocols',
    description: '+12% chance to flee successfully.',
    effects: { fleeBonus: 0.12 }
  },
  {
    id: 'fortuneFinder',
    name: 'Fortune Finder',
    description: '+6% item drops and rare loot chances.',
    effects: { itemBonus: 0.06, rareLootBonus: 0.06 }
  },
  {
    id: 'scrapper',
    name: 'Master Scrapper',
    description: 'Salvage costs -30% materials.',
    effects: { salvageCostMult: 0.7 }
  },
  {
    id: 'fieldMedic',
    name: 'Field Medic',
    description: 'Recover +6 health after winning fights.',
    effects: { onKillHeal: 6 }
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'Reduce encounter rate by -8%, +3% item finds.',
    effects: { encounterMod: -0.08, itemBonus: 0.03 }
  },
  {
    id: 'demolitions',
    name: 'Demolitions Expert',
    description: '+15% damage vs machines and robots.',
    effects: { damageMult: 1.15 }
  },
  {
    id: 'tactician',
    name: 'Tactician',
    description: 'Gain +2 STR and +2 AGI permanently.',
    effects: { attrBonus: { str: 2, agi: 2 } }
  },
  {
    id: 'gunsmith',
    name: 'Gunsmith',
    description: 'Equip weapons in trinket slot. +5% weapon damage.',
    effects: { damageMult: 1.05, allowWeaponTrinket: true }
  },
  {
    id: 'shadowRunner',
    name: 'Shadow Runner',
    description: '-15% encounter chance, -8% resource gains.',
    effects: { encounterMod: -0.15, scrapBonus: -0.08 }
  },
  {
    id: 'armorsmith',
    name: 'Armorsmith',
    description: 'Armor grants +8% additional protection.',
    effects: { armorBonus: 0.08 }
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    description: 'Carry +25% more inventory capacity.',
    effects: { inventoryMult: 1.25 }
  }
]

export const BASE_ITEMS = [
  // Weapons
  { name: 'Rusty Blade', slot: 'hand', type: 'weapon', modifiers: ['str'] },
  { name: 'Field Carbine', slot: 'hand', type: 'weapon', modifiers: ['str', 'agi'] },
  { name: 'Electro Baton', slot: 'hand', type: 'weapon', modifiers: ['str', 'luk'] },
  { name: 'Plasma Rifle', slot: 'hand', type: 'weapon', modifiers: ['str', 'luk'] },
  { name: 'Pulse Pistol', slot: 'hand', type: 'weapon', modifiers: ['agi'] },
  { name: 'Tesla Coil', slot: 'hand', type: 'weapon', modifiers: ['luk', 'str'] },
  { name: 'Sniper Scope Rifle', slot: 'hand', type: 'weapon', modifiers: ['agi', 'luk'] },
  { name: 'Flamethrower', slot: 'hand', type: 'weapon', modifiers: ['str'] },
  { name: 'Thermal Lance', slot: 'hand', type: 'weapon', modifiers: ['str', 'luk'] },
  
  // Armor
  { name: 'Reinforced Jacket', slot: 'body', type: 'armor', modifiers: ['str', 'agi'] },
  { name: 'Survival Harness', slot: 'body', type: 'armor', modifiers: ['str'] },
  { name: 'Patchwork Cloak', slot: 'body', type: 'armor', modifiers: ['agi'] },
  { name: 'Power Suit', slot: 'body', type: 'armor', modifiers: ['str', 'str'] },
  { name: 'Stealth Weave', slot: 'body', type: 'armor', modifiers: ['agi', 'agi'] },
  { name: 'Hazmat Suit', slot: 'body', type: 'armor', modifiers: ['str', 'luk'] },
  { name: 'Polymer Bodysuit', slot: 'body', type: 'armor', modifiers: ['agi', 'luk'] },
  { name: 'Enforcer Plate', slot: 'body', type: 'armor', modifiers: ['str', 'luk'] },
  
  // Head gear
  { name: 'Scanner Goggles', slot: 'head', type: 'gear', modifiers: ['agi', 'luk'] },
  { name: 'Recon Helmet', slot: 'head', type: 'gear', modifiers: ['str', 'luk'] },
  { name: 'Thermal Visor', slot: 'head', type: 'gear', modifiers: ['luk', 'luk'] },
  { name: 'Combat Helm', slot: 'head', type: 'gear', modifiers: ['str'] },
  { name: 'Hacker Cap', slot: 'head', type: 'gear', modifiers: ['luk', 'agi'] },
  { name: 'Night Vision Goggles', slot: 'head', type: 'gear', modifiers: ['agi', 'agi'] },
  { name: 'Rad-Shield Helmet', slot: 'head', type: 'gear', modifiers: ['str', 'luk'] },
  
  // Trinkets
  { name: 'Wrist Uplink', slot: 'trinket', type: 'device', modifiers: ['luk'] },
  { name: 'Lucky Charm', slot: 'trinket', type: 'gear', modifiers: ['luk'] },
  { name: 'Data Pad', slot: 'trinket', type: 'device', modifiers: ['luk', 'agi'] },
  { name: 'Homing Beacon', slot: 'trinket', type: 'device', modifiers: ['luk'] },
  { name: 'Power Cell', slot: 'trinket', type: 'device', modifiers: ['str'] },
  { name: 'Stimpak', slot: 'trinket', type: 'consumable', modifiers: ['str', 'luk'] },
  { name: 'Quantum Chip', slot: 'trinket', type: 'device', modifiers: ['luk', 'luk'] },
  { name: 'Luck Token', slot: 'trinket', type: 'gear', modifiers: ['luk'] }
]

export const GEAR_SLOTS = [
  { id: 'head', label: 'Head' },
  { id: 'body', label: 'Body' },
  { id: 'hand', label: 'Hand' },
  { id: 'trinket', label: 'Trinket' }
]

export const ENEMY_TEMPLATES = [
  // Tier 1
  { name: 'Rabid Mole Rat', tier: 1, hp: [18, 28], damage: [3, 6], lootBias: 'common' },
  { name: 'Feral Scavenger', tier: 1, hp: [22, 32], damage: [4, 7], lootBias: 'uncommon' },
  { name: 'Bloatfly', tier: 1, hp: [16, 24], damage: [2, 5], lootBias: 'common' },
  { name: 'Mirelurk Hatchling', tier: 1, hp: [20, 30], damage: [3, 6], lootBias: 'common' },
  { name: 'Radroach Swarm', tier: 1, hp: [14, 22], damage: [2, 4], lootBias: 'common' },
  
  // Tier 2
  { name: 'Scrap Drone', tier: 2, hp: [30, 44], damage: [6, 10], lootBias: 'rare' },
  { name: 'Ashland Stalker', tier: 2, hp: [34, 50], damage: [7, 12], lootBias: 'rare' },
  { name: 'Mirelurk Queen', tier: 2, hp: [40, 56], damage: [8, 13], lootBias: 'rare' },
  { name: 'Feral Ghoul', tier: 2, hp: [32, 48], damage: [6, 11], lootBias: 'uncommon' },
  { name: 'Rust Devil', tier: 2, hp: [36, 52], damage: [7, 12], lootBias: 'rare' },
  
  // Tier 3
  { name: 'Elite Raider', tier: 3, hp: [50, 70], damage: [10, 16], lootBias: 'epic' },
  { name: 'Synth Soldier', tier: 3, hp: [55, 75], damage: [11, 18], lootBias: 'epic' },
  { name: 'Deathclaw', tier: 3, hp: [60, 80], damage: [12, 19], lootBias: 'epic' },
  { name: 'Behemoth', tier: 3, hp: [65, 85], damage: [13, 20], lootBias: 'epic' },
  
  // Tier 4
  { name: 'Chrome Warlord', tier: 4, hp: [72, 95], damage: [14, 20], lootBias: 'legendary' },
  { name: 'Assaultron Commander', tier: 4, hp: [75, 98], damage: [15, 22], lootBias: 'legendary' },
  { name: 'Alpha Deathclaw', tier: 4, hp: [80, 102], damage: [16, 24], lootBias: 'legendary' },
  { name: 'Vault Overseer', tier: 4, hp: [78, 100], damage: [15, 23], lootBias: 'legendary' }
]

export const BUILDINGS = {
  waterPurifier: {
    id: 'waterPurifier',
    name: 'Water Purifier',
    description: 'Generate water periodically. Thirst decays 40% slower.',
    cost: { scrap: 20, electronics: 8 },
    effects: { thirstDecayMult: 0.6, waterPerTick: 0.008 }
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Grow food over time. Harvest every 5 minutes.',
    cost: { scrap: 15, electronics: 3 },
    effects: { foodIntervalSec: 300, foodPerHarvest: 2, foodDecayMult: 0.95 }
  },
  radioTower: {
    id: 'radioTower',
    name: 'Radio Tower',
    description: 'Broadcast your location for better salvage. +12% rare loot.',
    cost: { scrap: 30, electronics: 12 },
    effects: { rareLootBonus: 0.12 }
  },
  workshop: {
    id: 'workshop',
    name: 'Weapons Workshop',
    description: 'Craft weapon enhancements and repair gear. +15% damage.',
    cost: { scrap: 40, electronics: 20 },
    effects: { damageMult: 1.15, salvageCostMult: 0.8 }
  },
  powerPlant: {
    id: 'powerPlant',
    name: 'Power Plant',
    description: 'Generate electrical power. Unlock new crafting recipes.',
    cost: { scrap: 50, electronics: 35 },
    effects: { stromRecoveryMult: 1.2 }
  },
  armory: {
    id: 'armory',
    name: 'Armory',
    description: 'Store and swap gear loadouts instantly.',
    cost: { scrap: 35, electronics: 15 },
    effects: { gearSlots: 2 }
  },
  medicalBay: {
    id: 'medicalBay',
    name: 'Medical Bay',
    description: 'Accelerate health recovery. Rest restores +20 health.',
    cost: { scrap: 45, electronics: 18 },
    effects: { restHealthBonus: 20 }
  },
  defenseTurret: {
    id: 'defenseTurret',
    name: 'Defense Turret',
    description: 'Reduce encounter chance while at settlement.',
    cost: { scrap: 25, electronics: 25 },
    effects: { encounterMod: -0.1 }
  },
  scrapSmelter: {
    id: 'scrapSmelter',
    name: 'Scrap Smelter',
    description: 'Convert scrap into electronics. Passive income: 1 electronics per minute.',
    cost: { scrap: 60, electronics: 40 },
    effects: { electronicsPerTick: 0.0167 }
  },
  hydroponics: {
    id: 'hydroponics',
    name: 'Hydroponics Lab',
    description: 'Grow food and medicine. Food harvest +50% yield.',
    cost: { scrap: 55, electronics: 25 },
    effects: { foodMultiplier: 1.5 }
  }
}

export const SCAVENGE_RESOURCES = {
  scrap: [4, 12],
  electronics: [1, 4],
  food: [0, 2],
  water: [0, 2]
}

export const SALVAGE_COST = {
  scrap: 14,
  electronics: 5
}

export const ZONES = {
  ruinedOutskirts: {
    id: 'ruinedOutskirts',
    name: 'Ruined Outskirts',
    description: 'Collapsed suburbs with light resistance. Best for early scavenging.',
    encounterMod: -0.05,
    enemyTierBonus: 0,
    itemBonus: 0.04,
    rareLootBonus: 0.02,
    resources: {
      scrap: [5, 12],
      electronics: [1, 3],
      food: [0, 2],
      water: [0, 2]
    }
  },
  metroUndercity: {
    id: 'metroUndercity',
    name: 'Metro Undercity',
    description: 'Echoing tunnels filled with drones and raiders. Dangerous but rewarding.',
    encounterMod: 0.12,
    enemyTierBonus: 1,
    itemBonus: 0.08,
    rareLootBonus: 0.05,
    resources: {
      scrap: [7, 16],
      electronics: [2, 5],
      food: [0, 1],
      water: [0, 1]
    }
  },
  sunkenInterchange: {
    id: 'sunkenInterchange',
    name: 'Sunken Interchange',
    description: 'Flooded freeway hub with water and salvage caches.',
    encounterMod: 0.02,
    enemyTierBonus: 0,
    itemBonus: 0.06,
    rareLootBonus: 0.04,
    resources: {
      scrap: [6, 14],
      electronics: [1, 4],
      food: [0, 2],
      water: [1, 3]
    }
  },
  raiderStronghold: {
    id: 'raiderStronghold',
    name: 'Raider Stronghold',
    description: 'High risk zone packed with elite raider patrols. Legendary gear awaits.',
    encounterMod: 0.2,
    enemyTierBonus: 2,
    itemBonus: 0.12,
    rareLootBonus: 0.1,
    resources: {
      scrap: [8, 18],
      electronics: [2, 6],
      food: [0, 1],
      water: [0, 1]
    }
  },
  vaultTwentyTwo: {
    id: 'vaultTwentyTwo',
    name: 'Vault 22',
    description: 'Pre-war vault complex. Synth patrols. High-tech loot.',
    encounterMod: 0.15,
    enemyTierBonus: 2,
    itemBonus: 0.14,
    rareLootBonus: 0.15,
    resources: {
      scrap: [10, 20],
      electronics: [4, 8],
      food: [0, 1],
      water: [0, 1]
    }
  },
  radiationZone: {
    id: 'radiationZone',
    name: 'Radiation Zone',
    description: 'Glowing marshlands. Mutant creatures. Extremely rare loot.',
    encounterMod: 0.25,
    enemyTierBonus: 2,
    itemBonus: 0.08,
    rareLootBonus: 0.25,
    resources: {
      scrap: [8, 16],
      electronics: [2, 5],
      food: [1, 3],
      water: [2, 4]
    }
  },
  industrialComplex: {
    id: 'industrialComplex',
    name: 'Industrial Complex',
    description: 'Automated factory. Mostly machines and very little resistance.',
    encounterMod: -0.1,
    enemyTierBonus: 1,
    itemBonus: 0.1,
    rareLootBonus: 0.08,
    resources: {
      scrap: [12, 24],
      electronics: [4, 9],
      food: [0, 0],
      water: [0, 0]
    }
  }
}

export const NARRATIVE_DRIP_INTERVAL = 35

export const NARRATIVE_BARKS = [
  'Static resolves into a faint distress ping before fading out.',
  'A broken broadcast repeats: "Stay low. Stay quiet."',
  'Someone is tracking scavenger routes. Keep moving.',
  'A scav crew reports unusual drone movement in the metro.',
  'The tower crackles: "We can hear you. Keep the signal alive."',
  'Encrypted chatter mentions a raider convoy reroute.',
  'A settlement channel requests a systems check on your relay.',
  'Signal degrading. Atmospheric interference increasing.',
  'Automated message: "Vault protocols active. Seeking survivors."',
  'Old world broadcast cycling: "This is RobCo Industries. Stay tuned."',
  'Unknown voice: "The vaults were never meant to be opened."',
  'Your radio crackles with a pattern. Maybe coordinates?',
  'A distant explosion rumbles. Secondary transmitter down?',
  'Settlement breach warning. Defensive systems failing.',
  'Vault-Tec safety reminder loops endlessly in the static.'
]

export const STORY_ARCS = [
  {
    id: 'signalInTheNoise',
    title: 'Signal in the Noise',
    intro: 'A faint carrier wave cuts through the static. Someone is out there.',
    stages: [
      {
        title: 'Trace the Static',
        message: 'Lock onto the source. Scavenge to triangulate the signal.',
        objective: { type: 'scavengeCount', required: 3 },
        reward: { xp: 20, scrap: 10 }
      },
      {
        title: 'Metro Ping',
        message: 'The signal is strongest underground. Travel to Metro Undercity.',
        objective: { type: 'travelZone', zoneId: 'metroUndercity', required: 1 },
        reward: { xp: 15, electronics: 8 }
      },
      {
        title: 'Tunnel Sweep',
        message: 'Scavenge the metro. Recover relay parts and clear interference.',
        objective: { type: 'zoneScavenge', zoneId: 'metroUndercity', required: 3 },
        reward: { item: true, rareLootBonus: 0.04, xp: 25 }
      },
      {
        title: 'Clear the Interference',
        message: 'Hostiles are jamming the channel. Neutralize their scouts.',
        objective: { type: 'defeatTier', tier: 2, required: 3 },
        reward: { xp: 35, scrap: 15 }
      },
      {
        title: 'Broadcast Relay',
        message: 'Build a radio tower to stabilize and amplify the signal.',
        objective: { type: 'buildStructure', buildingId: 'radioTower', required: 1 },
        reward: { item: true, rareLootBonus: 0.08, xp: 40, scrap: 20 }
      },
      {
        title: 'First Contact',
        message: 'The signal resolves into a voice: "Can you hear me? We thought we were alone."',
        objective: { type: 'scavengeCount', required: 5 },
        reward: { xp: 50, scrap: 25, electronics: 12 }
      }
    ]
  },
  {
    id: 'echoesOfTheVault',
    title: 'Echoes of the Vault',
    intro: 'A second channel opens with a vault designation and a warning: "They followed us down."',
    stages: [
      {
        title: 'Weaponize Salvage',
        message: 'Assemble a prototype weapon from spare parts.',
        objective: { type: 'salvageCount', required: 2 },
        reward: { xp: 25, scrap: 12, item: true }
      },
      {
        title: 'Calibrate Optics',
        message: 'Equip head gear to filter signal interference and see thermal signatures.',
        objective: { type: 'equipSlot', slot: 'head', required: 1 },
        reward: { xp: 20, electronics: 10 }
      },
      {
        title: 'Stronghold Reconnaissance',
        message: 'Push into the Raider Stronghold and scout their defenses.',
        objective: { type: 'travelZone', zoneId: 'raiderStronghold', required: 1 },
        reward: { xp: 30, scrap: 15 }
      },
      {
        title: 'Break Their Line',
        message: 'Neutralize high-tier raider assets blocking the vault entrance.',
        objective: { type: 'defeatTier', tier: 3, required: 2 },
        reward: { item: true, rareLootBonus: 0.12, xp: 45, scrap: 20 }
      },
      {
        title: 'Vault Access',
        message: 'Travel to Vault 22. The vault door is still sealed.',
        objective: { type: 'travelZone', zoneId: 'vaultTwentyTwo', required: 1 },
        reward: { xp: 35, scrap: 18 }
      },
      {
        title: 'Vault Descent',
        message: 'Descend into the vault. Something triggered the lockdown.',
        objective: { type: 'zoneScavenge', zoneId: 'vaultTwentyTwo', required: 4 },
        reward: { item: true, rareLootBonus: 0.15, xp: 60, scrap: 30 }
      }
    ]
  },
  {
    id: 'settlementStories',
    title: 'Settlement Expansion',
    intro: 'Your settlement is being recognized. Time to expand and establish infrastructure.',
    stages: [
      {
        title: 'Establish Gardens',
        message: 'Build a garden to guarantee food supplies.',
        objective: { type: 'buildStructure', buildingId: 'garden', required: 1 },
        reward: { xp: 20, scrap: 15 }
      },
      {
        title: 'Power Generation',
        message: 'Construct a power plant to enable advanced systems.',
        objective: { type: 'buildStructure', buildingId: 'powerPlant', required: 1 },
        reward: { xp: 40, scrap: 25, electronics: 15 }
      },
      {
        title: 'Military Grade',
        message: 'Set up a weapons workshop to craft better equipment.',
        objective: { type: 'buildStructure', buildingId: 'workshop', required: 1 },
        reward: { xp: 35, scrap: 20, item: true }
      },
      {
        title: 'Medical Protocols',
        message: 'Build a medical bay for faster recovery.',
        objective: { type: 'buildStructure', buildingId: 'medicalBay', required: 1 },
        reward: { xp: 30, scrap: 18, electronics: 10 }
      },
      {
        title: 'Secure Perimeter',
        message: 'Install defense turrets to protect your settlement.',
        objective: { type: 'buildStructure', buildingId: 'defenseTurret', required: 1 },
        reward: { xp: 25, scrap: 20 }
      }
    ]
  }
]

const INITIAL_OBJECTIVE = {
  ...STORY_ARCS[0].stages[0].objective,
  progress: 0
}

export const INITIAL_STATE = {
  mode: 'explore',
  currentTab: 'Vitals',
  terminalHistory: [
    {
      id: 1,
      type: 'system',
      text: 'Survival Terminal boot sequence complete. Awaiting commands.'
    },
    {
      id: 2,
      type: 'system',
      text: `Transmission: ${STORY_ARCS[0].intro}`
    },
    {
      id: 3,
      type: 'system',
      text: `Directive: ${STORY_ARCS[0].stages[0].message}`
    }
  ],
  logId: 4,
  time: 0,
  player: {
    level: 1,
    xp: 0,
    perks: [],
    perkPoints: 0,
    attributes: { str: 5, agi: 5, luk: 4 },
    vitals: { health: 100, hunger: 100, thirst: 100, stamina: 100 }
  },
  inventory: {
    items: [],
    equipped: {
      head: null,
      body: null,
      hand: null,
      trinket: null
    },
    scrap: 25,
    electronics: 8,
    food: 3,
    water: 2
  },
  settlement: {
    buildings: [],
    gardenProgress: 0,
    purifierProgress: 0,
    smelterProgress: 0
  },
  world: {
    currentZone: 'ruinedOutskirts'
  },
  story: {
    arcIndex: 0,
    stageIndex: 0,
    objective: INITIAL_OBJECTIVE,
    lastTransmissionAt: 0,
    sideOpsCount: 0,
    isSideOps: false,
    sideOpTitle: null,
    journal: []
  },
  activeEncounter: null
}
