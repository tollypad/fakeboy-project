import {
  BASE_ITEMS,
  BUILDINGS,
  ENEMY_TEMPLATES,
  GEAR_SLOTS,
  INITIAL_STATE,
  ITEM_PREFIXES,
  ITEM_SUFFIXES,
  LEVEL_CAP,
  NARRATIVE_BARKS,
  NARRATIVE_DRIP_INTERVAL,
  PERKS,
  RARITIES,
  SALVAGE_COST,
  SCAVENGE_RESOURCES,
  STORY_ARCS,
  getXpForLevel,
  ZONES
} from './gameData'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const rollRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const appendLog = (state, entries) => {
  const nextEntries = entries.map((entry, index) => ({
    id: state.logId + index,
    ...entry
  }))

  return {
    ...state,
    terminalHistory: [...state.terminalHistory, ...nextEntries],
    logId: state.logId + nextEntries.length
  }
}

const getSettlementEffects = (buildings) => {
  return buildings.reduce(
    (effects, buildingId) => {
      const building = BUILDINGS[buildingId]
      if (!building) return effects

      if (building.effects.thirstDecayMult) {
        effects.thirstDecayMult *= building.effects.thirstDecayMult
      }
      if (building.effects.foodIntervalSec) {
        effects.foodIntervalSec = Math.min(
          effects.foodIntervalSec,
          building.effects.foodIntervalSec
        )
      }
      if (building.effects.rareLootBonus) {
        effects.rareLootBonus += building.effects.rareLootBonus
      }

      return effects
    },
    {
      thirstDecayMult: 1,
      foodIntervalSec: Number.POSITIVE_INFINITY,
      rareLootBonus: 0
    }
  )
}

const getMaxHealth = (state) => 120 + (state.player.level - 1) * 6

const getPerkEffects = (state) => {
  return state.player.perks.reduce(
    (effects, perkId) => {
      const perk = PERKS.find((entry) => entry.id === perkId)
      if (!perk) return effects
      const bonus = perk.effects || {}
      if (bonus.scrapBonus) effects.scrapBonus += bonus.scrapBonus
      if (bonus.electronicsBonus) effects.electronicsBonus += bonus.electronicsBonus
      if (bonus.foodBonus) effects.foodBonus += bonus.foodBonus
      if (bonus.waterBonus) effects.waterBonus += bonus.waterBonus
      if (bonus.encounterMod) effects.encounterMod += bonus.encounterMod
      if (bonus.itemBonus) effects.itemBonus += bonus.itemBonus
      if (bonus.rareLootBonus) effects.rareLootBonus += bonus.rareLootBonus
      if (bonus.hungerDecayMult) effects.hungerDecayMult *= bonus.hungerDecayMult
      if (bonus.thirstDecayMult) effects.thirstDecayMult *= bonus.thirstDecayMult
      if (bonus.damageMult) effects.damageMult *= bonus.damageMult
      if (bonus.fleeBonus) effects.fleeBonus += bonus.fleeBonus
      if (bonus.salvageCostMult) effects.salvageCostMult *= bonus.salvageCostMult
      if (bonus.onKillHeal) effects.onKillHeal += bonus.onKillHeal
      return effects
    },
    {
      scrapBonus: 0,
      electronicsBonus: 0,
      foodBonus: 0,
      waterBonus: 0,
      encounterMod: 0,
      itemBonus: 0,
      rareLootBonus: 0,
      hungerDecayMult: 1,
      thirstDecayMult: 1,
      damageMult: 1,
      fleeBonus: 0,
      salvageCostMult: 1,
      onKillHeal: 0
    }
  )
}

const getEquippedItems = (state) => {
  const equippedIds = new Set(
    Object.values(state.inventory.equipped).filter(Boolean)
  )
  return state.inventory.items.filter((item) => equippedIds.has(item.id))
}

const getTotalAttributes = (state) => {
  const base = state.player.attributes
  const mods = getEquippedItems(state).reduce(
    (totals, item) => {
      Object.entries(item.modifiers || {}).forEach(([key, value]) => {
        totals[key] += value
      })
      return totals
    },
    { str: 0, agi: 0, luk: 0 }
  )

  return {
    str: base.str + mods.str,
    agi: base.agi + mods.agi,
    luk: base.luk + mods.luk
  }
}

const weightedPick = (items, weightKey = 'weight') => {
  const total = items.reduce((sum, item) => sum + item[weightKey], 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item[weightKey]
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

const pickRarity = (rareLootBonus) => {
  const base = weightedPick(RARITIES)
  if (rareLootBonus > 0 && Math.random() < rareLootBonus) {
    return weightedPick(RARITIES.slice(1))
  }
  return base
}

const formatModifiers = (modifiers) => {
  return Object.entries(modifiers)
    .map(([stat, value]) => `+${value} ${stat.toUpperCase()}`)
    .join(', ')
}

const generateLootItem = (rareLootBonus) => {
  const baseItem = BASE_ITEMS[rollRange(0, BASE_ITEMS.length - 1)]
  const rarity = pickRarity(rareLootBonus)
  const [minStat, maxStat] = rarity.statRange
  
  // Roll for prefix and suffix
  const prefix = Math.random() < 0.6 ? ITEM_PREFIXES[rollRange(0, ITEM_PREFIXES.length - 1)] : null
  const suffix = Math.random() < 0.5 ? ITEM_SUFFIXES[rollRange(0, ITEM_SUFFIXES.length - 1)] : null
  
  // Build item name
  const nameParts = [prefix?.name, baseItem.name, suffix?.name].filter(Boolean)
  const formattedName = nameParts.join(' ')
  
  // Calculate modifiers from base item, prefix, and suffix
  const modifierCount = clamp(rollRange(1, baseItem.modifiers.length), 1, 3)
  const shuffled = [...baseItem.modifiers].sort(() => Math.random() - 0.5)
  const baseModifiers = shuffled.slice(0, modifierCount).reduce((acc, stat) => {
    acc[stat] = rollRange(minStat, maxStat)
    return acc
  }, {})
  
  // Apply prefix stats
  const withPrefix = { ...baseModifiers }
  if (prefix?.stats) {
    Object.entries(prefix.stats).forEach(([stat, value]) => {
      if (stat === 'all') {
        withPrefix.str = (withPrefix.str || 0) + value
        withPrefix.agi = (withPrefix.agi || 0) + value
        withPrefix.luk = (withPrefix.luk || 0) + value
      } else {
        withPrefix[stat] = (withPrefix[stat] || 0) + value
      }
    })
  }
  
  // Apply suffix stats
  if (suffix?.stats) {
    Object.entries(suffix.stats).forEach(([stat, value]) => {
      withPrefix[stat] = (withPrefix[stat] || 0) + value
    })
  }
  
  // Ensure stats don't go negative and cap them reasonably
  const modifiers = {}
  Object.entries(withPrefix).forEach(([stat, value]) => {
    modifiers[stat] = Math.max(0, Math.min(value, 6))
  })

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: formattedName,
    slot: baseItem.slot,
    type: baseItem.type,
    rarity: rarity.id,
    rarityLabel: rarity.label,
    color: rarity.color,
    modifiers,
    value: Math.round((minStat + maxStat + 2) * 12 * rarity.valueMult)
  }
}

const getZone = (state) => ZONES[state.world.currentZone] || ZONES.ruinedOutskirts

const getArc = (state) => STORY_ARCS[state.story.arcIndex]

const getStage = (state) => getArc(state)?.stages[state.story.stageIndex]

const createObjective = (objective) => ({ ...objective, progress: 0 })

const describeObjective = (objective) => {
  if (!objective) return 'No active directive.'
  switch (objective.type) {
    case 'scavengeCount':
      return `Scavenge ${objective.progress}/${objective.required} sites.`
    case 'zoneScavenge': {
      const zone = ZONES[objective.zoneId]
      return `Scavenge ${zone?.name || 'target zone'} (${objective.progress}/${objective.required}).`
    }
    case 'travelZone': {
      const zone = ZONES[objective.zoneId]
      return `Travel to ${zone?.name || 'target zone'}.`
    }
    case 'defeatTier':
      return `Defeat tier ${objective.tier}+ threats (${objective.progress}/${objective.required}).`
    case 'buildStructure': {
      const building = BUILDINGS[objective.buildingId]
      return `Construct ${building?.name || 'required structure'}.`
    }
    case 'salvageCount':
      return `Salvage gear (${objective.progress}/${objective.required}).`
    case 'equipSlot': {
      const slotLabel = GEAR_SLOTS.find((slot) => slot.id === objective.slot)?.label
      return `Equip a ${slotLabel || objective.slot} item (${objective.progress}/${objective.required}).`
    }
    default:
      return 'Awaiting directive.'
  }
}

const grantReward = (state, reward) => {
  if (!reward) return { state, rewardText: '' }

  let nextState = state
  const rewardParts = []

  if (reward.xp) {
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        xp: nextState.player.xp + reward.xp
      }
    }
    rewardParts.push(`+${reward.xp} XP`)
  }

  const nextInventory = { ...nextState.inventory }
  if (reward.scrap) {
    nextInventory.scrap += reward.scrap
    rewardParts.push(`+${reward.scrap} scrap`)
  }
  if (reward.electronics) {
    nextInventory.electronics += reward.electronics
    rewardParts.push(`+${reward.electronics} electronics`)
  }
  if (reward.food) {
    nextInventory.food += reward.food
    rewardParts.push(`+${reward.food} food`)
  }
  if (reward.water) {
    nextInventory.water += reward.water
    rewardParts.push(`+${reward.water} water`)
  }

  let rewardItem = null
  if (reward.item) {
    rewardItem = generateLootItem(reward.rareLootBonus || 0)
    nextInventory.items = [...nextInventory.items, rewardItem]
    rewardParts.push(
      `${rewardItem.rarityLabel} ${rewardItem.name} (${formatModifiers(rewardItem.modifiers)})`
    )
  }

  nextState = {
    ...nextState,
    inventory: nextInventory
  }

  return {
    state: nextState,
    rewardText: rewardParts.join(', ')
  }
}

const createSideOpObjective = () => {
  const zoneIds = Object.keys(ZONES)
  const randomZone = zoneIds[rollRange(0, zoneIds.length - 1)]
  const sideOps = [
    {
      title: 'Side Op: Supply Sweep',
      objective: { type: 'scavengeCount', required: rollRange(2, 4) }
    },
    {
      title: 'Side Op: Zone Sweep',
      objective: {
        type: 'zoneScavenge',
        zoneId: randomZone,
        required: rollRange(2, 3)
      }
    },
    {
      title: 'Side Op: Threat Reduction',
      objective: { type: 'defeatTier', tier: rollRange(1, 3), required: rollRange(1, 2) }
    },
    {
      title: 'Side Op: Salvage Run',
      objective: { type: 'salvageCount', required: 1 }
    },
    {
      title: 'Side Op: Route Shift',
      objective: { type: 'travelZone', zoneId: randomZone, required: 1 }
    }
  ]

  const pick = sideOps[rollRange(0, sideOps.length - 1)]
  return {
    title: pick.title,
    objective: createObjective(pick.objective)
  }
}

const advanceStory = (state) => {
  const arc = getArc(state)
  const stage = getStage(state)
  if (!stage && !state.story.isSideOps) return state

  let nextState = state
  const completedTitle = state.story.isSideOps
    ? state.story.sideOpTitle || 'Side Op'
    : stage.title
  const completedSummary = state.story.isSideOps
    ? describeObjective(state.story.objective)
    : stage.message
  const journalEntry = {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    time: state.time,
    arc: state.story.isSideOps ? 'Side Ops' : arc?.title || 'Unknown',
    stage: completedTitle,
    summary: completedSummary
  }
  const logs = [{ type: 'system', text: `Objective complete: ${completedTitle}.` }]

  const rewardResult = grantReward(nextState, stage.reward)
  nextState = rewardResult.state
  if (rewardResult.rewardText) {
    logs.push({ type: 'loot', text: `Reward: ${rewardResult.rewardText}.` })
  }
  const leveledState = applyLevelUps(nextState)
  if (leveledState.player.level !== nextState.player.level) {
    logs.push({ type: 'system', text: 'Level up. Attributes increased.' })
    if (leveledState.player.perkPoints > nextState.player.perkPoints) {
      logs.push({ type: 'system', text: 'Perk point available. Use perk [id].' })
    }
  }
  nextState = leveledState

  if (nextState.story.isSideOps) {
    const sideOp = createSideOpObjective(nextState)
    nextState = {
      ...nextState,
      story: {
        ...nextState.story,
        objective: sideOp.objective,
        sideOpsCount: nextState.story.sideOpsCount + 1,
        sideOpTitle: sideOp.title,
        journal: [journalEntry, ...nextState.story.journal]
      }
    }
    logs.push({ type: 'system', text: `${sideOp.title}.` })
    logs.push({ type: 'system', text: `Directive: ${describeObjective(sideOp.objective)}` })
    return appendLog(nextState, logs)
  }

  const nextStageIndex = nextState.story.stageIndex + 1
  if (arc && nextStageIndex < arc.stages.length) {
    const nextStage = arc.stages[nextStageIndex]
    nextState = {
      ...nextState,
      story: {
        ...nextState.story,
        stageIndex: nextStageIndex,
        objective: createObjective(nextStage.objective),
        journal: [journalEntry, ...nextState.story.journal]
      }
    }
    logs.push({ type: 'system', text: `Transmission: ${nextStage.message}` })
    logs.push({
      type: 'system',
      text: `Directive: ${describeObjective(nextState.story.objective)}`
    })
    return appendLog(nextState, logs)
  }

  logs.push({ type: 'system', text: `Arc complete: ${arc.title}.` })
  const nextArc = STORY_ARCS[nextState.story.arcIndex + 1]
  if (nextArc) {
    const firstStage = nextArc.stages[0]
    nextState = {
      ...nextState,
      story: {
        ...nextState.story,
        arcIndex: nextState.story.arcIndex + 1,
        stageIndex: 0,
        objective: createObjective(firstStage.objective),
        journal: [journalEntry, ...nextState.story.journal]
      }
    }
    logs.push({ type: 'system', text: `New arc unlocked: ${nextArc.title}.` })
    logs.push({ type: 'system', text: `Transmission: ${firstStage.message}` })
    logs.push({
      type: 'system',
      text: `Directive: ${describeObjective(nextState.story.objective)}`
    })
    return appendLog(nextState, logs)
  }

  const sideOp = createSideOpObjective(nextState)
  nextState = {
    ...nextState,
    story: {
      ...nextState.story,
      isSideOps: true,
      objective: sideOp.objective,
      sideOpTitle: sideOp.title,
      journal: [journalEntry, ...nextState.story.journal]
    }
  }
  logs.push({ type: 'system', text: 'Main arcs complete. Side ops now active.' })
  logs.push({ type: 'system', text: `Directive: ${describeObjective(sideOp.objective)}` })
  const loggedState = appendLog(nextState, logs)
  return applyObjectiveProgress(loggedState, { type: 'scavenge', zoneId: getZone(nextState).id })
}

const applyObjectiveProgress = (state, event) => {
  const objective = state.story.objective
  if (!objective) return state

  let progress = objective.progress
  switch (objective.type) {
    case 'scavengeCount':
      if (event.type === 'scavenge') progress += 1
      break
    case 'zoneScavenge':
      if (event.type === 'scavenge' && event.zoneId === objective.zoneId) {
        progress += 1
      }
      break
    case 'travelZone':
      if (event.type === 'travel' && event.zoneId === objective.zoneId) {
        progress = objective.required
      }
      break
    case 'defeatTier':
      if (event.type === 'defeat' && event.tier >= objective.tier) {
        progress += 1
      }
      break
    case 'buildStructure':
      if (event.type === 'build' && event.buildingId === objective.buildingId) {
        progress = objective.required
      }
      break
    case 'salvageCount':
      if (event.type === 'salvage') progress += 1
      break
    case 'equipSlot':
      if (event.type === 'equip' && event.slot === objective.slot) {
        progress = objective.required
      }
      break
    default:
      break
  }

  if (progress === objective.progress) return state

  const nextObjective = {
    ...objective,
    progress: Math.min(progress, objective.required)
  }

  const nextState = {
    ...state,
    story: {
      ...state.story,
      objective: nextObjective
    }
  }

  if (nextObjective.progress >= nextObjective.required) {
    return advanceStory(nextState)
  }

  return nextState
}

const generateEnemy = (state, zone) => {
  const tierBonus = zone?.enemyTierBonus || 0
  const tierCap = clamp(1 + Math.floor(state.player.level / 2) + tierBonus, 1, 5)
  const candidates = ENEMY_TEMPLATES.filter((template) => template.tier <= tierCap + 1)
  const template = candidates[rollRange(0, candidates.length - 1)]
  const hp = rollRange(template.hp[0], template.hp[1])
  const damage = [template.damage[0], template.damage[1]]
  const lootBonus = template.tier >= 3 ? 0.08 : 0.02

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: template.name,
    tier: template.tier,
    hp,
    maxHp: hp,
    damage,
    lootBonus,
    loot: {
      scrap: rollRange(4 * template.tier, 9 * template.tier),
      electronics: rollRange(1 * template.tier, 3 * template.tier),
      itemChance: clamp(0.3 + template.tier * 0.1, 0.3, 0.8)
    }
  }
}

const applyLevelUps = (state) => {
  let nextState = state
  const xpNeeded = getXpForLevel(nextState.player.level)
  
  while (nextState.player.xp >= xpNeeded && nextState.player.level < LEVEL_CAP) {
    const nextLevel = nextState.player.level + 1
    const perkPointGain = nextLevel % 3 === 0 ? 1 : 0
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        level: nextLevel,
        xp: nextState.player.xp - xpNeeded,
        perkPoints: nextState.player.perkPoints + perkPointGain,
        attributes: {
          str: nextState.player.attributes.str + 1,
          agi: nextState.player.attributes.agi + 1,
          luk: nextState.player.attributes.luk + 1
        },
        vitals: {
          ...nextState.player.vitals,
          health: clamp(nextState.player.vitals.health + 10, 0, getMaxHealth(nextState))
        }
      }
    }
    // Update xpNeeded for next level check
    const newXpNeeded = nextState.player.level < LEVEL_CAP ? getXpForLevel(nextState.player.level) : Infinity
    if (newXpNeeded !== xpNeeded) {
      // Continue with the loop using the new xp needed
      return applyLevelUps(nextState)
    }
  }

  if (nextState.player.level >= LEVEL_CAP) {
    const maxXpNeeded = getXpForLevel(LEVEL_CAP)
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        level: LEVEL_CAP,
        xp: Math.min(nextState.player.xp, maxXpNeeded - 1)
      }
    }
  }

  return nextState
}

const handleScavenge = (state) => {
  if (state.mode === 'combat') {
    return appendLog(state, [
      { type: 'error', text: 'Cannot scavenge while in combat.' }
    ])
  }

  const totalAttributes = getTotalAttributes(state)
  const perkEffects = getPerkEffects(state)
  const zone = getZone(state)
  const encounterChance = clamp(
    0.6 - totalAttributes.luk * 0.02 + (zone.encounterMod || 0) + perkEffects.encounterMod,
    0.2,
    0.85
  )
  if (Math.random() < encounterChance) {
    const enemy = generateEnemy(state, zone)
    return appendLog(
      {
        ...state,
        mode: 'combat',
        activeEncounter: enemy
      },
      [
        { type: 'combat', text: `Encountered ${enemy.name}. Combat initiated.` }
      ]
    )
  }

  const effects = getSettlementEffects(state.settlement.buildings)
  const resourceProfile = zone.resources || SCAVENGE_RESOURCES
  const scrap = rollRange(resourceProfile.scrap[0], resourceProfile.scrap[1])
  const electronics = rollRange(
    resourceProfile.electronics[0],
    resourceProfile.electronics[1]
  )
  const food = rollRange(resourceProfile.food[0], resourceProfile.food[1])
  const water = rollRange(resourceProfile.water[0], resourceProfile.water[1])
  const applyBonus = (value, bonus) => Math.max(0, Math.round(value * (1 + bonus)))
  const finalScrap = applyBonus(scrap, perkEffects.scrapBonus)
  const finalElectronics = applyBonus(electronics, perkEffects.electronicsBonus)
  const finalFood = applyBonus(food, perkEffects.foodBonus)
  const finalWater = applyBonus(water, perkEffects.waterBonus)
  const itemRoll = Math.random()
  const itemChance = clamp(
    0.35 + effects.rareLootBonus + (zone.itemBonus || 0) + perkEffects.itemBonus,
    0.35,
    0.85
  )
  const item = itemRoll < itemChance
    ? generateLootItem(
        effects.rareLootBonus + (zone.rareLootBonus || 0) + perkEffects.rareLootBonus
      )
    : null

  const nextState = {
    ...state,
    inventory: {
      ...state.inventory,
      scrap: state.inventory.scrap + finalScrap,
      electronics: state.inventory.electronics + finalElectronics,
      food: state.inventory.food + finalFood,
      water: state.inventory.water + finalWater,
      items: item ? [...state.inventory.items, item] : state.inventory.items
    }
  }

  const logs = [
    {
      type: 'loot',
      text: `Scavenge complete in ${zone.name}. Recovered ${finalScrap} scrap, ${finalElectronics} electronics, ${finalFood} food, ${finalWater} water.`
    }
  ]

  if (item) {
    logs.push({
      type: 'loot',
      text: `Found ${item.rarityLabel} ${item.name} (${formatModifiers(item.modifiers)}).`
    })
  } else {
    logs.push({ type: 'system', text: 'No notable equipment recovered.' })
  }

  const loggedState = appendLog(nextState, logs)
  return applyObjectiveProgress(loggedState, { type: 'scavenge', zoneId: zone.id })
}

const handleAttack = (state) => {
  if (state.mode !== 'combat' || !state.activeEncounter) {
    return appendLog(state, [{ type: 'error', text: 'No active encounter to attack.' }])
  }

  const totalAttributes = getTotalAttributes(state)
  const perkEffects = getPerkEffects(state)
  const zone = getZone(state)
  const playerDamage = clamp(
    Math.floor(
      (totalAttributes.str * 2 + totalAttributes.agi * 1.2 + rollRange(0, 4)) *
        perkEffects.damageMult
    ),
    3,
    40
  )
  const enemyHp = state.activeEncounter.hp - playerDamage
  const logs = [
    {
      type: 'combat',
      text: `You strike ${state.activeEncounter.name} for ${playerDamage} damage.`
    }
  ]

  if (enemyHp <= 0) {
    const loot = state.activeEncounter.loot
    const effects = getSettlementEffects(state.settlement.buildings)
    const foundItem = Math.random() < loot.itemChance
    const item = foundItem
      ? generateLootItem(
          effects.rareLootBonus +
            (zone.rareLootBonus || 0) +
            state.activeEncounter.lootBonus
        )
      : null

    const gainedXp = 10 + state.activeEncounter.tier * 12
    let nextState = {
      ...state,
      mode: 'explore',
      activeEncounter: null,
      player: {
        ...state.player,
        xp: state.player.xp + gainedXp
      },
      inventory: {
        ...state.inventory,
        scrap: state.inventory.scrap + loot.scrap,
        electronics: state.inventory.electronics + loot.electronics,
        items: item ? [...state.inventory.items, item] : state.inventory.items
      }
    }

    logs.push({
      type: 'combat',
      text: `${state.activeEncounter.name} neutralized. +${gainedXp} XP.`
    })
    logs.push({
      type: 'loot',
      text: `Loot acquired: ${loot.scrap} scrap, ${loot.electronics} electronics.`
    })

    if (item) {
      logs.push({
        type: 'loot',
        text: `Recovered ${item.rarityLabel} ${item.name} (${formatModifiers(item.modifiers)}).`
      })
    }

    if (perkEffects.onKillHeal > 0) {
      nextState = {
        ...nextState,
        player: {
          ...nextState.player,
          vitals: {
            ...nextState.player.vitals,
            health: clamp(
              nextState.player.vitals.health + perkEffects.onKillHeal,
              0,
              getMaxHealth(nextState)
            )
          }
        }
      }
      logs.push({ type: 'system', text: `Field Medic restores ${perkEffects.onKillHeal} HP.` })
    }

    const leveledState = applyLevelUps(nextState)
    if (leveledState.player.level !== nextState.player.level) {
      logs.push({ type: 'system', text: 'Level up. Attributes increased.' })
      if (leveledState.player.perkPoints > nextState.player.perkPoints) {
        logs.push({ type: 'system', text: 'Perk point available. Use perk [id].' })
      }
    }
    nextState = leveledState

    const loggedState = appendLog(nextState, logs)
    return applyObjectiveProgress(loggedState, {
      type: 'defeat',
      tier: state.activeEncounter.tier
    })
  }

  const enemyDamage = rollRange(
    state.activeEncounter.damage[0],
    state.activeEncounter.damage[1]
  )
  const nextHealth = clamp(state.player.vitals.health - enemyDamage, 0, getMaxHealth(state))

  const nextState = {
    ...state,
    activeEncounter: { ...state.activeEncounter, hp: enemyHp },
    player: {
      ...state.player,
      vitals: { ...state.player.vitals, health: nextHealth }
    }
  }

  logs.push({
    type: 'combat',
    text: `${state.activeEncounter.name} retaliates for ${enemyDamage} damage.`
  })

  if (nextHealth <= 0) {
    logs.push({ type: 'error', text: 'Vitals critical. Retreat immediately.' })
  }

  return appendLog(nextState, logs)
}

const handleFlee = (state) => {
  if (state.mode !== 'combat' || !state.activeEncounter) {
    return appendLog(state, [{ type: 'error', text: 'No encounter to flee from.' }])
  }

  const totalAttributes = getTotalAttributes(state)
  const perkEffects = getPerkEffects(state)
  const successChance = clamp(
    0.3 + totalAttributes.luk * 0.04 + perkEffects.fleeBonus,
    0.3,
    0.9
  )
  if (Math.random() < successChance) {
    return appendLog(
      {
        ...state,
        mode: 'explore',
        activeEncounter: null
      },
      [{ type: 'system', text: 'Escape successful. You return to the wasteland.' }]
    )
  }

  const enemyDamage = rollRange(
    state.activeEncounter.damage[0],
    state.activeEncounter.damage[1]
  )

  const nextHealth = clamp(state.player.vitals.health - enemyDamage, 0, getMaxHealth(state))
  const nextState = {
    ...state,
    player: {
      ...state.player,
      vitals: { ...state.player.vitals, health: nextHealth }
    }
  }

  return appendLog(nextState, [
    {
      type: 'combat',
      text: `Escape failed. ${state.activeEncounter.name} hits for ${enemyDamage}.`
    }
  ])
}

const BUILDING_ALIASES = {
  waterpurifier: 'waterPurifier',
  garden: 'garden',
  radiotower: 'radioTower'
}

const SLOT_ALIASES = GEAR_SLOTS.reduce((acc, slot) => {
  acc[slot.id] = slot.id
  return acc
}, {})

const findItemByName = (items, name) => {
  const normalized = name.toLowerCase()
  return items.filter((item) => item.name.toLowerCase().includes(normalized))
}

const handleEquip = (state, arg) => {
  if (!arg) {
    return appendLog(state, [{ type: 'error', text: 'Equip which item?' }])
  }

  const parts = arg.split(' ').filter(Boolean)
  const firstPart = parts[0]
  
  // Check if first argument is an item ID
  let item = state.inventory.items.find((entry) => entry.id === firstPart)
  let slotCandidate = null
  
  if (item) {
    // If second part is a slot, validate it
    if (parts.length > 1) {
      slotCandidate = SLOT_ALIASES[parts[1]]
      if (slotCandidate && item.slot !== slotCandidate) {
        return appendLog(state, [{
          type: 'error',
          text: `${item.name} is a ${item.slot} item, not ${slotCandidate}.`
        }])
      }
    }
  } else {
    // Fall back to name-based lookup
    slotCandidate = SLOT_ALIASES[firstPart]
    const itemName = slotCandidate ? parts.slice(1).join(' ') : arg

    if (!itemName) {
      return appendLog(state, [{ type: 'error', text: 'Equip which item?' }])
    }

    const matches = findItemByName(state.inventory.items, itemName)
    if (matches.length === 0) {
      return appendLog(state, [{ type: 'error', text: 'Item not found in inventory.' }])
    }
    if (matches.length > 1) {
      return appendLog(state, [{
        type: 'error',
        text: `Multiple items match. Be specific: ${matches.map((m) => m.name).join(', ')}.`
      }])
    }

    item = matches[0]
    if (slotCandidate && item.slot !== slotCandidate) {
      return appendLog(state, [{
        type: 'error',
        text: `${item.name} is a ${item.slot} item, not ${slotCandidate}.`
      }])
    }
  }

  const slot = item.slot
  const currentlyEquippedId = state.inventory.equipped[slot]
  const nextState = {
    ...state,
    inventory: {
      ...state.inventory,
      equipped: {
        ...state.inventory.equipped,
        [slot]: item.id
      }
    }
  }

  if (currentlyEquippedId && currentlyEquippedId !== item.id) {
    const previous = state.inventory.items.find((entry) => entry.id === currentlyEquippedId)
    const loggedState = appendLog(nextState, [{
      type: 'system',
      text: `Equipped ${item.name}. Replaced ${previous ? previous.name : 'previous gear'}.`
    }])
    return applyObjectiveProgress(loggedState, { type: 'equip', slot })
  }

  const loggedState = appendLog(nextState, [{ type: 'system', text: `Equipped ${item.name}.` }])
  return applyObjectiveProgress(loggedState, { type: 'equip', slot })
}

const handleUnequip = (state, arg) => {
  if (!arg) {
    return appendLog(state, [{ type: 'error', text: 'Unequip which slot?' }])
  }

  if (arg === 'all') {
    return appendLog(
      {
        ...state,
        inventory: {
          ...state.inventory,
          equipped: {
            head: null,
            body: null,
            hand: null,
            trinket: null
          }
        }
      },
      [{ type: 'system', text: 'All gear unequipped.' }]
    )
  }

  const slot = SLOT_ALIASES[arg]
  if (!slot) {
    return appendLog(state, [{ type: 'error', text: 'Unknown slot.' }])
  }

  if (!state.inventory.equipped[slot]) {
    return appendLog(state, [{ type: 'system', text: `${slot} slot already empty.` }])
  }

  const loggedState = appendLog(
    {
      ...state,
      inventory: {
        ...state.inventory,
        equipped: {
          ...state.inventory.equipped,
          [slot]: null
        }
      }
    },
    [{ type: 'system', text: `${slot} slot unequipped.` }]
  )
  return applyObjectiveProgress(loggedState, { type: 'unequip', slot })
}

const handleSalvage = (state) => {
  if (state.mode === 'combat') {
    return appendLog(state, [{ type: 'error', text: 'Cannot salvage during combat.' }])
  }

  const perkEffects = getPerkEffects(state)
  const costScrap = Math.ceil(SALVAGE_COST.scrap * perkEffects.salvageCostMult)
  const costElectronics = Math.ceil(
    SALVAGE_COST.electronics * perkEffects.salvageCostMult
  )

  if (
    state.inventory.scrap < costScrap ||
    state.inventory.electronics < costElectronics
  ) {
    return appendLog(state, [{
      type: 'error',
      text: `Need ${costScrap} scrap and ${costElectronics} electronics to salvage.`
    }])
  }

  const zone = getZone(state)
  const effects = getSettlementEffects(state.settlement.buildings)
  const item = generateLootItem(effects.rareLootBonus + (zone.rareLootBonus || 0))

  const loggedState = appendLog(
    {
      ...state,
      inventory: {
        ...state.inventory,
        scrap: state.inventory.scrap - costScrap,
        electronics: state.inventory.electronics - costElectronics,
        items: [...state.inventory.items, item]
      }
    },
    [{
      type: 'loot',
      text: `Salvage complete. Assembled ${item.rarityLabel} ${item.name} (${formatModifiers(item.modifiers)}).`
    }]
  )
  return applyObjectiveProgress(loggedState, { type: 'salvage' })
}

const ZONE_ALIASES = Object.values(ZONES).reduce((acc, zone) => {
  acc[zone.id.toLowerCase()] = zone.id
  acc[zone.name.toLowerCase().replace(/\s+/g, '')] = zone.id
  return acc
}, {})

const handleZone = (state, arg) => {
  if (!arg || arg === 'list') {
    const lines = Object.values(ZONES).map(
      (zone) => `${zone.name}: ${zone.description}`
    )
    return appendLog(state, [
      { type: 'system', text: `Current zone: ${getZone(state).name}.` },
      { type: 'system', text: `Zones: ${lines.join(' | ')}` }
    ])
  }

  const normalized = arg.replace(/\s+/g, '').toLowerCase()
  const resolved = ZONE_ALIASES[normalized]
  if (!resolved) {
    return appendLog(state, [{ type: 'error', text: 'Zone not recognized.' }])
  }

  const zone = ZONES[resolved]
  const loggedState = appendLog(
    {
      ...state,
      world: {
        ...state.world,
        currentZone: zone.id
      }
    },
    [{ type: 'system', text: `Travel route set to ${zone.name}.` }]
  )
  return applyObjectiveProgress(loggedState, { type: 'travel', zoneId: zone.id })
}

const handlePerks = (state) => {
  const available = PERKS.filter((perk) => !state.player.perks.includes(perk.id))
  const owned = PERKS.filter((perk) => state.player.perks.includes(perk.id))
  const ownedText = owned.length
    ? owned.map((perk) => perk.name).join(' | ')
    : 'None'
  const logs = [
    { type: 'system', text: `Perk points: ${state.player.perkPoints}.` },
    { type: 'system', text: `Owned perks: ${ownedText}.` }
  ]
  if (available.length > 0) {
    logs.push({ type: 'system', text: `Available perks:` })
    available.forEach((perk) => {
      logs.push({ type: 'system', text: `  [${perk.id}] ${perk.name} - ${perk.description}` })
    })
  } else {
    logs.push({ type: 'system', text: 'All perks acquired!' })
  }
  return appendLog(state, logs)
}

const handleChoosePerk = (state, arg) => {
  if (!arg) {
    return appendLog(state, [{ type: 'error', text: 'Pick a perk id.' }])
  }
  if (state.player.perkPoints <= 0) {
    return appendLog(state, [{ type: 'error', text: 'No perk points available.' }])
  }
  
  // Normalize input: convert spaces to camel case or search by name
  const normalizedArg = arg.toLowerCase()
  let perk = PERKS.find((entry) => entry.id === arg)
  
  if (!perk) {
    // Try camelCase conversion (e.g., "field medic" -> "fieldMediac")
    const camelCased = normalizedArg
      .split(' ')
      .reduce((acc, word, idx) => idx === 0 ? word : acc + word.charAt(0).toUpperCase() + word.slice(1), '')
    perk = PERKS.find((entry) => entry.id === camelCased)
  }
  
  if (!perk) {
    // Try searching by name (case-insensitive)
    perk = PERKS.find((entry) => entry.name.toLowerCase().includes(normalizedArg))
  }
  
  if (!perk) {
    return appendLog(state, [{ type: 'error', text: 'Perk id not recognized. Try: scavenger, circuitWhisperer, rationer, canteenMaster, sharpshooter, evasive, fortuneFinder, scrapper, fieldMedic, pathfinder.' }])
  }
  if (state.player.perks.includes(perk.id)) {
    return appendLog(state, [{ type: 'error', text: 'Perk already acquired.' }])
  }

  return appendLog(
    {
      ...state,
      player: {
        ...state.player,
        perkPoints: state.player.perkPoints - 1,
        perks: [...state.player.perks, perk.id]
      }
    },
    [{ type: 'system', text: `Perk acquired: ${perk.name}.` }]
  )
}

const handleBuild = (state, buildingId) => {
  const resolvedId = BUILDING_ALIASES[buildingId]
  const building = BUILDINGS[resolvedId]
  if (!building) {
    return appendLog(state, [{ type: 'error', text: 'Unknown structure.' }])
  }
  if (state.settlement.buildings.includes(resolvedId)) {
    return appendLog(state, [{ type: 'system', text: 'Structure already built.' }])
  }

  const { scrap, electronics } = building.cost
  if (state.inventory.scrap < scrap || state.inventory.electronics < electronics) {
    return appendLog(state, [{
      type: 'error',
      text: `Insufficient materials. Need ${scrap} scrap and ${electronics} electronics.`
    }])
  }

  const loggedState = appendLog(
    {
      ...state,
      inventory: {
        ...state.inventory,
        scrap: state.inventory.scrap - scrap,
        electronics: state.inventory.electronics - electronics
      },
      settlement: {
        ...state.settlement,
        buildings: [...state.settlement.buildings, resolvedId]
      }
    },
    [{ type: 'system', text: `${building.name} constructed.` }]
  )
  return applyObjectiveProgress(loggedState, { type: 'build', buildingId: resolvedId })
}

const handleStatus = (state) => {
  const vitals = state.player.vitals
  const attrs = getTotalAttributes(state)
  return appendLog(state, [
    {
      type: 'system',
      text: `Vitals - HP ${Math.round(vitals.health)}, Hunger ${Math.round(vitals.hunger)}, Thirst ${Math.round(vitals.thirst)}.`
    },
    {
      type: 'system',
      text: `Attributes - STR ${attrs.str}, AGI ${attrs.agi}, LUK ${attrs.luk}.`
    }
  ])
}

const handleIntel = (state) => {
  const arc = getArc(state)
  const stage = getStage(state)
  const arcLabel = state.story.isSideOps ? 'Side Ops' : arc?.title
  const stageLabel = state.story.isSideOps ? 'Ongoing' : stage?.title
  const objective = describeObjective(state.story.objective)
  return appendLog(state, [
    { type: 'system', text: `Arc: ${arcLabel || 'Unknown'}.` },
    { type: 'system', text: `Stage: ${stageLabel || 'Unknown'}.` },
    { type: 'system', text: `Directive: ${objective}` }
  ])
}

const handleEat = (state) => {
  if (state.inventory.food === 0) {
    return appendLog(state, [{ type: 'error', text: 'No food in inventory.' }])
  }

  const hungerGain = Math.min(100 - state.player.vitals.hunger, 35)
  const nextState = {
    ...state,
    inventory: {
      ...state.inventory,
      food: state.inventory.food - 1
    },
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        hunger: clamp(state.player.vitals.hunger + hungerGain, 0, 100)
      }
    }
  }

  return appendLog(nextState, [
    { type: 'system', text: `Consumed food (+${Math.round(hungerGain)} satiation). ${state.inventory.food - 1} food remaining.` }
  ])
}

const handleDrink = (state) => {
  if (state.inventory.water === 0) {
    return appendLog(state, [{ type: 'error', text: 'No water in inventory.' }])
  }

  const thirstGain = Math.min(100 - state.player.vitals.thirst, 40)
  const nextState = {
    ...state,
    inventory: {
      ...state.inventory,
      water: state.inventory.water - 1
    },
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        thirst: clamp(state.player.vitals.thirst + thirstGain, 0, 100)
      }
    }
  }

  return appendLog(nextState, [
    { type: 'system', text: `Consumed water (+${Math.round(thirstGain)} hydration). ${state.inventory.water - 1} water remaining.` }
  ])
}

const handleRest = (state) => {
  if (state.mode === 'combat') {
    return appendLog(state, [{ type: 'error', text: 'Cannot rest during combat.' }])
  }

  const healthGain = 15
  const stamGain = 25
  const nextState = {
    ...state,
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        health: clamp(state.player.vitals.health + healthGain, 0, getMaxHealth(state)),
        stamina: clamp(state.player.vitals.stamina + stamGain, 0, 100),
        hunger: clamp(state.player.vitals.hunger + 8, 0, 100),
        thirst: clamp(state.player.vitals.thirst + 6, 0, 100)
      }
    }
  }

  return appendLog(nextState, [
    { type: 'system', text: `Rested. Recovered +${healthGain} health, +${stamGain} stamina. (Hunger and thirst increased slightly.)` }
  ])
}

const handleInventory = (state) => {
  const equippedItems = getEquippedItems(state)
  const equippedLines = GEAR_SLOTS.map((slot) => {
    const itemId = state.inventory.equipped[slot.id]
    const item = state.inventory.items.find((entry) => entry.id === itemId)
    return `${slot.label}: ${item ? item.name : 'Empty'}`
  })

  if (state.inventory.items.length === 0) {
    return appendLog(state, [
      { type: 'system', text: `Equipped: ${equippedLines.join(' | ')}` },
      { type: 'system', text: 'Inventory empty.' }
    ])
  }

  const itemLines = state.inventory.items.map((item) => {
    const equippedTag = equippedItems.some((entry) => entry.id === item.id)
      ? ' [EQUIPPED]'
      : ''
    return `${item.rarityLabel} ${item.name} (${formatModifiers(item.modifiers)})${equippedTag}`
  })

  return appendLog(state, [
    { type: 'system', text: `Equipped: ${equippedLines.join(' | ')}` },
    { type: 'system', text: `Inventory: ${itemLines.join(' | ')}` }
  ])
}

const handleTick = (state) => {
  const effects = getSettlementEffects(state.settlement.buildings)
  const perkEffects = getPerkEffects(state)
  const hungerDecay = 0.08 * perkEffects.hungerDecayMult
  const thirstDecay = 0.12 * effects.thirstDecayMult * perkEffects.thirstDecayMult

  let { hunger, thirst, health, stamina } = state.player.vitals
  hunger = clamp(hunger - hungerDecay, 0, 100)
  thirst = clamp(thirst - thirstDecay, 0, 100)
  stamina = clamp(stamina + 0.05, 0, 100)

  if (hunger <= 0) {
    health = clamp(health - 0.15, 0, getMaxHealth(state))
  }
  if (thirst <= 0) {
    health = clamp(health - 0.2, 0, getMaxHealth(state))
  }

  let nextState = {
    ...state,
    time: state.time + 1,
    player: {
      ...state.player,
      vitals: { health, hunger, thirst, stamina }
    }
  }

  // Process passive resource generation from buildings
  let inventory = { ...nextState.inventory }
  
  // Water Purifier generates water (1 water every ~2 minutes with base generation)
  if (nextState.settlement.buildings.includes('waterPurifier')) {
    const purifierProgress = (nextState.settlement.purifierProgress || 0) + 1
    const purifierInterval = 120 // Generate 1 water every 120 seconds
    
    if (purifierProgress >= purifierInterval) {
      inventory.water = clamp(inventory.water + 1, 0, 999)
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, purifierProgress: 0 }
      }
    } else {
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, purifierProgress: purifierProgress }
      }
    }
  }
  
  // Scrap Smelter generates electronics from scrap (only when accumulation hits 1)
  if (nextState.settlement.buildings.includes('scrapSmelter')) {
    const smelterProgress = (nextState.settlement.smelterProgress || 0) + 1
    const smelterInterval = 60 // Generate 1 electronics every 60 seconds (1 per minute)
    
    if (inventory.scrap >= 1 && smelterProgress >= smelterInterval) {
      inventory.scrap = clamp(inventory.scrap - 1, 0, 999)
      inventory.electronics = clamp(inventory.electronics + 1, 0, 999)
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, smelterProgress: 0 }
      }
    } else if (inventory.scrap < 1) {
      // No scrap to smelt, keep progress
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, smelterProgress }
      }
    } else {
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, smelterProgress }
      }
    }
  }

  // Garden/Hydroponics generates food
  if (effects.foodIntervalSec !== Number.POSITIVE_INFINITY) {
    const nextProgress = nextState.settlement.gardenProgress + 1
    const harvestAmount = nextState.settlement.buildings.includes('hydroponics') ? 2 : 1
    const foodMultiplier = effects.foodMultiplier || 1
    
    if (nextProgress >= effects.foodIntervalSec) {
      inventory.food = clamp(inventory.food + (harvestAmount * foodMultiplier), 0, 999)
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, gardenProgress: 0 },
        inventory
      }
      nextState = appendLog(nextState, [
        { type: 'system', text: `Garden harvest ready. +${Math.floor(harvestAmount * foodMultiplier)} food.` }
      ])
      return nextState
    } else {
      nextState = {
        ...nextState,
        settlement: { ...nextState.settlement, gardenProgress: nextProgress },
        inventory
      }
    }
  } else {
    nextState = { ...nextState, inventory }
  }

  const dripReady =
    nextState.time - nextState.story.lastTransmissionAt >= NARRATIVE_DRIP_INTERVAL
  if (dripReady && Math.random() < 0.35) {
    const bark = NARRATIVE_BARKS[rollRange(0, NARRATIVE_BARKS.length - 1)]
    const tag = nextState.story.isSideOps ? 'SIDE OPS' : getArc(nextState)?.title
    const loggedState = {
      ...nextState,
      story: {
        ...nextState.story,
        lastTransmissionAt: nextState.time
      }
    }
    return appendLog(loggedState, [{ type: 'system', text: `[${tag || 'TRANSMISSION'}] ${bark}` }])
  }

  return nextState
}

const normalizeCommand = (command) => command.trim().toLowerCase()

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, currentTab: action.payload }
    case 'PROCESS_COMMAND': {
      const raw = action.payload || ''
      const command = normalizeCommand(raw)
      if (!command) return state

      let nextState = appendLog(state, [{ type: 'input', text: `> ${raw}` }])
      const [verb, ...rest] = command.split(' ')
      const arg = rest.join(' ').trim()

      if (verb === 'scavenge') {
        return handleScavenge(nextState)
      }
      if (verb === 'attack') {
        return handleAttack(nextState)
      }
      if (verb === 'flee') {
        return handleFlee(nextState)
      }
      if (verb === 'build') {
        const normalized = arg.replace(/\s+/g, '')
        return handleBuild(nextState, normalized)
      }
      if (verb === 'equip') {
        return handleEquip(nextState, arg)
      }
      if (verb === 'unequip') {
        return handleUnequip(nextState, arg)
      }
      if (verb === 'zone' || verb === 'travel') {
        return handleZone(nextState, arg)
      }
      if (verb === 'salvage') {
        return handleSalvage(nextState)
      }
      if (verb === 'eat') {
        return handleEat(nextState)
      }
      if (verb === 'drink') {
        return handleDrink(nextState)
      }
      if (verb === 'rest') {
        return handleRest(nextState)
      }
      if (verb === 'intel' || verb === 'mission') {
        return handleIntel(nextState)
      }
      if (verb === 'perks') {
        return handlePerks(nextState)
      }
      if (verb === 'perk') {
        if (!arg) return handlePerks(nextState)
        return handleChoosePerk(nextState, arg)
      }
      if (verb === 'status') {
        return handleStatus(nextState)
      }
      if (verb === 'inv' || verb === 'inventory') {
        return handleInventory(nextState)
      }

      return appendLog(nextState, [
        { type: 'error', text: 'Command not recognized.' }
      ])
    }
    case 'TICK':
      return handleTick(state)
    default:
      return state
  }
}

export { INITIAL_STATE }
