import { useEffect, useReducer, useRef, useState } from 'react'
import { gameReducer, INITIAL_STATE } from './gameReducer'
import { BUILDINGS, GEAR_SLOTS, PERKS, STORY_ARCS, ZONES } from './gameData'

const ActionButtons = ({ state, dispatch }) => {
  const buttons = []
  const inCombat = state.activeEncounter && state.mode === 'combat'

  if (inCombat) {
    buttons.push(
      { label: 'Attack', cmd: 'attack', priority: 1 },
      { label: 'Flee', cmd: 'flee', priority: 2 }
    )
  } else {
    buttons.push(
      { label: 'Scavenge', cmd: 'scavenge', priority: 1 },
      { label: 'Intel', cmd: 'intel', priority: 2 },
      { label: 'Status', cmd: 'status', priority: 3 },
      { label: 'Perks', cmd: 'perks', priority: 4 }
    )

    if (state.inventory.food > 0 && state.player.vitals.hunger > 20)
      buttons.push({ label: 'Eat', cmd: 'eat', priority: 2.5 })
    if (state.inventory.water > 0 && state.player.vitals.thirst > 20)
      buttons.push({ label: 'Drink', cmd: 'drink', priority: 2.7 })
    if (state.player.vitals.health < 80)
      buttons.push({ label: 'Rest', cmd: 'rest', priority: 2.9 })
  }

  buttons.push(
    { label: 'Zones', cmd: 'zone list', priority: 5 },
    { label: 'Equip', cmd: 'equip', priority: 6 },
    { label: 'Salvage', cmd: 'salvage', priority: 7 }
  )

  const sorted = buttons.sort((a, b) => a.priority - b.priority)
  const handleAction = (cmd) => dispatch({ type: 'PROCESS_COMMAND', payload: cmd })

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {sorted.slice(0, 6).map((btn) => (
        <button
          key={btn.cmd}
          onClick={() => handleAction(btn.cmd)}
          className="rounded border border-crt-500/60 bg-panel-900/60 px-2 py-1 text-crt-300 uppercase tracking-[0.2em] transition hover:border-crt-200 hover:text-crt-100"
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}

const tabs = ['Vitals', 'Inventory', 'Settlement', 'Perks', 'Journal']

const logColor = {
  system: 'text-crt-300',
  combat: 'text-crt-100',
  loot: 'text-crt-200',
  error: 'text-red-300',
  input: 'text-crt-500'
}

const StatBar = ({ label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-crt-400">
      <span>{label}</span>
      <span>{Math.round(value)}</span>
    </div>
    <div className="h-2 w-full rounded-full border border-crt-700/60 bg-panel-900">
      <div
        className="h-full rounded-full bg-crt-400/90"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
)

const getTotalAttributes = (state) => {
  const totals = { ...state.player.attributes }
  const equippedIds = new Set(Object.values(state.inventory.equipped).filter(Boolean))
  state.inventory.items.forEach((item) => {
    if (!equippedIds.has(item.id)) return
    Object.entries(item.modifiers || {}).forEach(([stat, value]) => {
      totals[stat] += value
    })
  })
  return totals
}

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

const getSuggestedAction = (state) => {
  if (!state.story.objective) return null
  const objective = state.story.objective
  switch (objective.type) {
    case 'scavengeCount':
    case 'zoneScavenge':
      return { label: 'Scavenge', cmd: 'scavenge' }
    case 'travelZone': {
      const zone = ZONES[objective.zoneId]
      return { label: `Travel to ${zone?.name}`, cmd: `zone ${objective.zoneId}` }
    }
    case 'defeatTier':
      return { label: 'Scavenge (find enemies)', cmd: 'scavenge' }
    case 'buildStructure': {
      const building = BUILDINGS[objective.buildingId]
      return { label: `Build ${building?.name}`, cmd: `build ${objective.buildingId}` }
    }
    case 'salvageCount':
      return { label: 'Salvage', cmd: 'salvage' }
    case 'equipSlot':
      return { label: 'Equip Gear', cmd: 'equip' }
    default:
      return null
  }
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const [command, setCommand] = useState('')
  const logEndRef = useRef(null)

  useEffect(() => {
    const loop = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(loop)
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.terminalHistory.length])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!command.trim()) return
    dispatch({ type: 'PROCESS_COMMAND', payload: command })
    setCommand('')
  }

  const vitals = state.player.vitals
  const activeEnemy = state.activeEncounter
  const currentZone = ZONES[state.world.currentZone]
  const totalAttributes = getTotalAttributes(state)
  const currentArc = STORY_ARCS[state.story.arcIndex]
  const currentStage = currentArc?.stages[state.story.stageIndex]
  const suggestedAction = getSuggestedAction(state)

  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col text-crt-200">
      <header className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 p-4 border-b border-crt-700/50">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-crt-500">Survival Terminal</p>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-crt-100">Wasteland Operations Console</h1>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.2em] text-crt-400">
          <div>Status: {state.mode === 'combat' ? 'Combat Mode' : 'Exploration'}</div>
          <div>Zone: {currentZone?.name || 'Unknown'}</div>
          <div>Uptime: {state.time}s</div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <section className="flex-1 min-h-0 flex flex-col rounded border border-crt-700/60 bg-panel-800/80 p-4 shadow-lg">
          <div className="flex-shrink-0 mb-3 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-crt-400">
            <span>Command Log</span>
            <span className="crt-flicker text-crt-300">READY</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 text-sm leading-relaxed space-y-1">
            {state.terminalHistory.map((entry) => (
              <div key={entry.id} className={`${logColor[entry.type] || 'text-crt-200'}`}>
                {entry.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex-shrink-0 mt-4 flex items-center gap-2 border-t border-crt-700/40 pt-4">
            <span className="text-crt-400">&gt;</span>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-transparent text-crt-100 outline-none placeholder:text-crt-600"
              placeholder="Type a command..."
            />
            <button type="submit" className="rounded-full border border-crt-500/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-crt-200 transition hover:border-crt-200">
              Enter
            </button>
          </form>
          <div className="flex-shrink-0 mt-4 space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Quick Actions</div>
            <ActionButtons state={state} dispatch={dispatch} />
          </div>
        </section>

        <section className="flex-1 min-h-0 flex flex-col rounded border border-crt-700/60 bg-panel-800/80 p-4 shadow-lg overflow-hidden">
          <div className="flex-shrink-0 pb-3 space-y-2 border-b border-crt-700/40">
            <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Info Panels</div>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => dispatch({ type: 'SET_TAB', payload: tab })}
                  className={`rounded border px-2 py-1 text-xs uppercase tracking-[0.15em] transition ${
                    state.currentTab === tab
                      ? 'border-crt-200 bg-crt-500/20 text-crt-100'
                      : 'border-crt-700/60 text-crt-400 hover:text-crt-200 hover:border-crt-500/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            <div className="border-b border-crt-700/40 pb-3">
              <div className="text-xs uppercase tracking-[0.2em] text-crt-500 mb-2">Resources</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-crt-700/50 bg-panel-900/30 p-2 text-center">
                  <div className="text-crt-400 text-[0.7rem]">Scrap</div>
                  <div className="text-crt-200 font-bold">{state.inventory.scrap}</div>
                </div>
                <div className="rounded border border-crt-700/50 bg-panel-900/30 p-2 text-center">
                  <div className="text-crt-400 text-[0.7rem]">Electronics</div>
                  <div className="text-crt-200 font-bold">{state.inventory.electronics}</div>
                </div>
                <div className="rounded border border-crt-700/50 bg-panel-900/30 p-2 text-center">
                  <div className="text-crt-400 text-[0.7rem]">Food ({Math.floor(state.inventory.food)})</div>
                  <button
                    onClick={() => dispatch({ type: 'PROCESS_COMMAND', payload: 'eat' })}
                    disabled={state.inventory.food === 0}
                    className="mt-1 w-full text-[0.65rem] rounded border border-crt-600/40 px-1 py-0.5 text-crt-500 uppercase tracking-[0.1em] disabled:opacity-40 hover:enabled:text-crt-300"
                  >
                    Eat
                  </button>
                </div>
                <div className="rounded border border-crt-700/50 bg-panel-900/30 p-2 text-center">
                  <div className="text-crt-400 text-[0.7rem]">Water ({Math.floor(state.inventory.water)})</div>
                  <button
                    onClick={() => dispatch({ type: 'PROCESS_COMMAND', payload: 'drink' })}
                    disabled={state.inventory.water === 0}
                    className="mt-1 w-full text-[0.65rem] rounded border border-crt-600/40 px-1 py-0.5 text-crt-500 uppercase tracking-[0.1em] disabled:opacity-40 hover:enabled:text-crt-300"
                  >
                    Drink
                  </button>
                </div>
              </div>
            </div>

            {suggestedAction && (
              <div className="rounded border border-crt-400/60 bg-panel-900/70 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-crt-400">Suggested Action</div>
                <button
                  onClick={() => dispatch({ type: 'PROCESS_COMMAND', payload: suggestedAction.cmd })}
                  className="mt-2 w-full rounded border border-crt-300/60 bg-crt-500/20 px-3 py-2 text-xs uppercase tracking-[0.15em] text-crt-200 transition hover:bg-crt-500/40 hover:text-crt-100"
                >
                  {suggestedAction.label}
                </button>
              </div>
            )}

            {activeEnemy && (
              <div className="rounded border border-crt-500/60 bg-panel-900/60 p-3 text-sm">
                <div className="text-xs uppercase tracking-[0.3em] text-crt-400">Active Encounter</div>
                <div className="mt-2 text-crt-100">{activeEnemy.name} (Tier {activeEnemy.tier})</div>
                <div className="mt-2">
                  <StatBar label="Enemy HP" value={(activeEnemy.hp / activeEnemy.maxHp) * 100} />
                </div>
              </div>
            )}

            {state.currentTab === 'Vitals' && (
              <div className="space-y-3">
                <StatBar label="Health" value={vitals.health} />
                <StatBar label="Hunger" value={vitals.hunger} />
                <StatBar label="Thirst" value={vitals.thirst} />
                <StatBar label="Stamina" value={vitals.stamina} />
                <button
                  onClick={() => dispatch({ type: 'PROCESS_COMMAND', payload: 'rest' })}
                  className="w-full rounded border border-crt-400/60 bg-crt-500/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-crt-200 transition hover:bg-crt-500/40 hover:text-crt-100"
                >
                  Rest (Recover Health)
                </button>
                <div className="grid grid-cols-3 gap-2 text-xs uppercase tracking-[0.25em] text-crt-400">
                  <div className="rounded border border-crt-700/50 p-3">STR {totalAttributes.str}</div>
                  <div className="rounded border border-crt-700/50 p-3">AGI {totalAttributes.agi}</div>
                  <div className="rounded border border-crt-700/50 p-3">LUK {totalAttributes.luk}</div>
                </div>
                <div className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm">
                  <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Narrative</div>
                  <div className="mt-2 text-crt-100">{state.story.isSideOps ? 'Side Ops' : currentArc?.title}</div>
                  <div className="text-xs text-crt-400">{state.story.isSideOps ? 'Ongoing' : currentStage?.title}</div>
                  <div className="mt-2 text-xs text-crt-300">{describeObjective(state.story.objective)}</div>
                </div>
                <div className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm">
                  <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Perks</div>
                  <div className="mt-2 text-crt-100">Points: {state.player.perkPoints}</div>
                  <div className="text-xs text-crt-400">
                    {state.player.perks.length
                      ? state.player.perks
                          .map((id) => PERKS.find((p) => p.id === id)?.name)
                          .filter(Boolean)
                          .join(' | ')
                      : 'No perks acquired.'}
                  </div>
                </div>
              </div>
            )}

            {state.currentTab === 'Inventory' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Equipped</div>
                  <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.2em] text-crt-400">
                    {GEAR_SLOTS.map((slot) => {
                      const itemId = state.inventory.equipped[slot.id]
                      const item = state.inventory.items.find((e) => e.id === itemId)
                      return (
                        <div key={slot.id} className="rounded border border-crt-700/50 p-3">
                          {slot.label} {item ? item.name : 'Empty'}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.2em] text-crt-400">
                  <div className="rounded border border-crt-700/50 p-3">Scrap {state.inventory.scrap}</div>
                  <div className="rounded border border-crt-700/50 p-3">Electronics {state.inventory.electronics}</div>
                  <div className="rounded border border-crt-700/50 p-3">Food {Math.floor(state.inventory.food)}</div>
                  <div className="rounded border border-crt-700/50 p-3">Water {Math.floor(state.inventory.water)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Equipment</div>
                  {state.inventory.items.length === 0 ? (
                    <div className="text-sm text-crt-400">No equipment acquired.</div>
                  ) : (
                    state.inventory.items.map((item) => {
                      const isEquipped = Object.values(state.inventory.equipped).includes(item.id)
                      const eSlot = Object.keys(state.inventory.equipped).find(key => state.inventory.equipped[key] === item.id)
                      return (
                        <div key={item.id} className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm space-y-2">
                          <div>
                            {isEquipped && (
                              <div className="text-xs uppercase tracking-[0.3em] text-crt-300 mb-2">
                                ✓ Equipped in {GEAR_SLOTS.find((s) => s.id === eSlot)?.label}
                              </div>
                            )}
                            <div className={`${item.color} text-xs uppercase tracking-[0.3em]`}>{item.rarityLabel}</div>
                            <div className="text-crt-100">{item.name}</div>
                            <div className="text-xs text-crt-400">
                              {Object.entries(item.modifiers).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(' | ')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isEquipped ? (
                              <button
                                onClick={() => dispatch({ type: 'PROCESS_COMMAND', payload: `unequip ${eSlot}` })}
                                className="flex-1 text-xs rounded border border-crt-500/60 bg-crt-500/20 px-2 py-1 text-crt-300 uppercase tracking-[0.1em] transition hover:border-crt-300 hover:bg-crt-500/40 hover:text-crt-200"
                              >
                                Unequip
                              </button>
                            ) : (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    dispatch({ type: 'PROCESS_COMMAND', payload: `equip ${item.id} ${e.target.value}` })
                                    e.target.value = ''
                                  }
                                }}
                                className="flex-1 text-xs rounded border border-crt-400/60 bg-panel-900 px-2 py-1 text-crt-300 uppercase tracking-[0.1em] transition hover:border-crt-300"
                              >
                                <option value="">Equip...</option>
                                {GEAR_SLOTS.map((s) => (
                                  <option key={s.id} value={s.id} disabled={!!state.inventory.equipped[s.id]}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {state.currentTab === 'Settlement' && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Structures</div>
                {Object.values(BUILDINGS).map((b) => (
                  <div key={b.id} className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-crt-100">{b.name}</div>
                      <div className="text-xs uppercase tracking-[0.3em] text-crt-400">
                        {state.settlement.buildings.includes(b.id) ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-crt-400">Cost: {b.cost.scrap} scrap, {b.cost.electronics} electronics</div>
                  </div>
                ))}
                <div className="text-xs uppercase tracking-[0.3em] text-crt-600">Build via: build water purifier, build garden, build radio tower</div>
                <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Scavenging Map</div>
                <div className="space-y-2 text-sm">
                  {Object.values(ZONES).map((z) => (
                    <div
                      key={z.id}
                      className={`rounded border p-3 ${
                        z.id === state.world.currentZone
                          ? 'border-crt-300 bg-panel-900/70 text-crt-100'
                          : 'border-crt-700/50 bg-panel-900/40 text-crt-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.3em]">{z.name}</div>
                        <div className="text-xs uppercase tracking-[0.3em]">
                          {z.id === state.world.currentZone ? 'Active' : 'Available'}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-crt-400">{z.description}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.3em] text-crt-500">
                        Danger +{Math.round((z.encounterMod || 0) * 100)} | Loot +{Math.round((z.itemBonus || 0) * 100)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.currentTab === 'Journal' && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Field Journal</div>
                {state.story.journal.length === 0 ? (
                  <div className="text-sm text-crt-400">No entries yet.</div>
                ) : (
                  state.story.journal.map((e) => (
                    <div key={e.id} className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm">
                      <div className="text-xs uppercase tracking-[0.3em] text-crt-500">
                        {e.arc} | T+{e.time}s
                      </div>
                      <div className="text-crt-100 mt-1">{e.stage}</div>
                      <div className="text-xs text-crt-400 mt-1">{e.summary}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {state.currentTab === 'Perks' && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.3em] text-crt-500">Perk System</div>
                <div className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm">
                  <div className="text-crt-100">
                    Points Available: <span className="text-crt-400">{state.player.perkPoints}</span>
                  </div>
                </div>

                {state.player.perks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.3em] text-crt-400">Acquired</div>
                    {state.player.perks.map((id) => {
                      const p = PERKS.find((pk) => pk.id === id)
                      return p ? (
                        <div key={id} className="rounded border border-crt-600/50 bg-crt-500/10 p-3 text-sm">
                          <div className="text-crt-100 font-semibold">{p.name}</div>
                          <div className="text-crt-400 mt-1 text-xs">{p.description}</div>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {PERKS.filter((p) => !state.player.perks.includes(p.id)).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.3em] text-crt-400">Available</div>
                    {PERKS.filter((p) => !state.player.perks.includes(p.id)).map((p) => (
                      <div key={p.id} className="rounded border border-crt-700/50 bg-panel-900/50 p-3 text-sm">
                        <div className="text-crt-300 text-xs">[{p.id}]</div>
                        <div className="text-crt-100 font-semibold mt-1">{p.name}</div>
                        <div className="text-crt-400 mt-1 text-xs">{p.description}</div>
                        <button
                          onClick={() => dispatch({ type: 'PROCESS_COMMAND', payload: `perk ${p.id}` })}
                          disabled={state.player.perkPoints === 0}
                          className="mt-2 w-full rounded border border-crt-400/60 bg-crt-500/20 px-2 py-1 text-xs uppercase tracking-[0.1em] text-crt-300 transition disabled:opacity-40 hover:enabled:border-crt-300 hover:enabled:bg-crt-500/40"
                        >
                          Acquire
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
