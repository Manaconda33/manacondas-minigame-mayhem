from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected exactly one guarded match, found {count}")
    file_path.write_text(text.replace(old, new, 1))


def create_text(path: str, content: str) -> None:
    file_path = Path(path)
    if file_path.exists():
        raise RuntimeError(f"{path}: target already exists")
    file_path.write_text(content)


replace_once(
    "src/game/items/itemDefinitions.ts",
    """export interface ItemDefinition {\n  id: ItemId;\n  displayName: string;\n  icon: string;\n  charges: number;\n}\n""",
    """export interface ItemBoostConfig {\n  durationSeconds: number;\n  speedCapMultiplier: number;\n  accelerationMultiplier: number;\n  ignoreOffRoadSpeedPenalty: boolean;\n}\n\nexport interface ItemDefinition {\n  id: ItemId;\n  displayName: string;\n  icon: string;\n  charges: number;\n  boost?: Readonly<ItemBoostConfig>;\n}\n""",
)

replace_once(
    "src/game/items/itemDefinitions.ts",
    """  'nitro-surge': { id: 'nitro-surge', displayName: 'Nitro Surge', icon: '↟', charges: 1 },\n""",
    """  'nitro-surge': {\n    id: 'nitro-surge',\n    displayName: 'Nitro Surge',\n    icon: '↟',\n    charges: 1,\n    boost: {\n      durationSeconds: 1.2,\n      speedCapMultiplier: 1.18,\n      accelerationMultiplier: 1.35,\n      ignoreOffRoadSpeedPenalty: true,\n    },\n  },\n""",
)

create_text(
    "src/game/items/RacerEffects.ts",
    """export interface TemporaryBoostSpec {\n  readonly id: string;\n  readonly label: string;\n  readonly durationSeconds: number;\n  readonly speedCapMultiplier: number;\n  readonly accelerationMultiplier: number;\n  readonly ignoreOffRoadSpeedPenalty: boolean;\n}\n\nexport interface RacerDriveModifiers {\n  speedCapMultiplier: number;\n  accelerationMultiplier: number;\n  ignoreOffRoadSpeedPenalty: boolean;\n  activeBoostLabel: string | null;\n}\n\ninterface ActiveTemporaryBoost extends TemporaryBoostSpec {\n  remainingSeconds: number;\n}\n\nconst NEUTRAL_DRIVE_MODIFIERS: Readonly<RacerDriveModifiers> = {\n  speedCapMultiplier: 1,\n  accelerationMultiplier: 1,\n  ignoreOffRoadSpeedPenalty: false,\n  activeBoostLabel: null,\n};\n\nfunction validBoostSpec(spec: TemporaryBoostSpec): boolean {\n  return (\n    spec.id.trim().length > 0 &&\n    spec.label.trim().length > 0 &&\n    Number.isFinite(spec.durationSeconds) &&\n    spec.durationSeconds > 0 &&\n    Number.isFinite(spec.speedCapMultiplier) &&\n    spec.speedCapMultiplier >= 1 &&\n    Number.isFinite(spec.accelerationMultiplier) &&\n    spec.accelerationMultiplier >= 1\n  );\n}\n\nexport class RacerEffects {\n  private readonly temporaryBoosts = new Map<string, ActiveTemporaryBoost>();\n\n  public activateTemporaryBoost(racerId: string, spec: TemporaryBoostSpec): boolean {\n    if (racerId.trim().length === 0 || !validBoostSpec(spec)) return false;\n\n    this.temporaryBoosts.set(racerId, {\n      ...spec,\n      remainingSeconds: spec.durationSeconds,\n    });\n    return true;\n  }\n\n  public advance(dt: number, paused = false): void {\n    if (paused || dt <= 0) return;\n\n    for (const [racerId, boost] of this.temporaryBoosts) {\n      boost.remainingSeconds -= dt;\n      if (boost.remainingSeconds <= 0) this.temporaryBoosts.delete(racerId);\n    }\n  }\n\n  public driveModifiers(racerId: string): RacerDriveModifiers {\n    const boost = this.temporaryBoosts.get(racerId);\n    if (boost === undefined) return { ...NEUTRAL_DRIVE_MODIFIERS };\n\n    return {\n      speedCapMultiplier: boost.speedCapMultiplier,\n      accelerationMultiplier: boost.accelerationMultiplier,\n      ignoreOffRoadSpeedPenalty: boost.ignoreOffRoadSpeedPenalty,\n      activeBoostLabel: boost.label,\n    };\n  }\n\n  public remainingSeconds(racerId: string, effectId?: string): number {\n    const boost = this.temporaryBoosts.get(racerId);\n    if (boost === undefined || (effectId !== undefined && boost.id !== effectId)) return 0;\n    return boost.remainingSeconds;\n  }\n\n  public clearTemporaryBoost(racerId: string, effectId?: string): boolean {\n    const boost = this.temporaryBoosts.get(racerId);\n    if (boost === undefined || (effectId !== undefined && boost.id !== effectId)) return false;\n    return this.temporaryBoosts.delete(racerId);\n  }\n\n  public clear(racerId: string): void {\n    this.temporaryBoosts.delete(racerId);\n  }\n\n  public dispose(): void {\n    this.temporaryBoosts.clear();\n  }\n}\n""",
)

create_text(
    "src/game/items/ItemEffectDispatcher.ts",
    """import { ITEM_DEFINITIONS } from './itemDefinitions';\nimport { ItemSystem, type ItemUseDirection } from './ItemSystem';\nimport { RacerEffects } from './RacerEffects';\n\nexport type ItemUseResolution = 'rejected' | 'unsupported' | 'activated';\n\nexport function executeItemUse(\n  itemSystem: ItemSystem,\n  racerEffects: RacerEffects,\n  racerId: string,\n  direction: ItemUseDirection,\n): ItemUseResolution {\n  const request = itemSystem.requestUse(racerId, direction);\n  if (request === null) return 'rejected';\n\n  const definition = ITEM_DEFINITIONS[request.itemId];\n  const boost = definition.boost;\n  if (boost === undefined) return 'unsupported';\n\n  const activated = racerEffects.activateTemporaryBoost(racerId, {\n    id: request.itemId,\n    label: definition.displayName,\n    ...boost,\n  });\n  if (!activated) return 'rejected';\n\n  if (itemSystem.commitUse(racerId)) return 'activated';\n\n  racerEffects.clearTemporaryBoost(racerId, request.itemId);\n  return 'rejected';\n}\n""",
)

replace_once(
    "src/game/physics/KartController.ts",
    """export interface DriveInput {\n  throttle: number;\n  steering: number;\n  brake: boolean;\n  drift: boolean;\n  speedLimitMultiplier?: number;\n}\n""",
    """export interface DriveInput {\n  throttle: number;\n  steering: number;\n  brake: boolean;\n  drift: boolean;\n  speedLimitMultiplier?: number;\n  effectSpeedCapMultiplier?: number;\n  effectAccelerationMultiplier?: number;\n  ignoreOffRoadSpeedPenalty?: boolean;\n}\n""",
)

replace_once(
    "src/game/physics/KartController.ts",
    """    const speedMultiplier = surfaceSpeedMultiplier(surface, this.stats.traction);\n    const accelerationMultiplier = surfaceAccelerationMultiplier(surface, this.stats.traction);\n    const speedLimitMultiplier = THREE.MathUtils.clamp(input.speedLimitMultiplier ?? 1, 1, 1.04);\n    const maxForward = this.tuning.maxSpeed * speedMultiplier * speedLimitMultiplier;\n""",
    """    const surfaceSpeedFactor = surfaceSpeedMultiplier(surface, this.stats.traction);\n    const surfaceAccelerationFactor = surfaceAccelerationMultiplier(surface, this.stats.traction);\n    const ignoresOffRoadSpeedPenalty =\n      input.ignoreOffRoadSpeedPenalty === true && (surface === 'dirt' || surface === 'grass');\n    const effectiveSurfaceSpeedFactor = ignoresOffRoadSpeedPenalty ? 1 : surfaceSpeedFactor;\n    const speedLimitMultiplier = THREE.MathUtils.clamp(input.speedLimitMultiplier ?? 1, 1, 1.04);\n    const effectSpeedCapMultiplier = Math.max(1, input.effectSpeedCapMultiplier ?? 1);\n    const effectAccelerationMultiplier = Math.max(1, input.effectAccelerationMultiplier ?? 1);\n    const maxForward = this.tuning.maxSpeed * effectiveSurfaceSpeedFactor * speedLimitMultiplier;\n""",
)

replace_once(
    "src/game/physics/KartController.ts",
    """    const boostedMax = maxForward * this.boostMultiplier;\n""",
    """    const boostedMax = maxForward * Math.max(this.boostMultiplier, effectSpeedCapMultiplier);\n""",
)

replace_once(
    "src/game/physics/KartController.ts",
    """      launchTaper *\n      accelerationMultiplier *\n      (this.boostRemaining > 0 ? 1.35 : 1);\n""",
    """      launchTaper *\n      surfaceAccelerationFactor *\n      Math.max(this.boostRemaining > 0 ? 1.35 : 1, effectAccelerationMultiplier);\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """import { ItemBoxSystem } from './items/ItemBoxSystem';\nimport { selectItem } from './items/ItemSelector';\n""",
    """import { ItemBoxSystem } from './items/ItemBoxSystem';\nimport { executeItemUse } from './items/ItemEffectDispatcher';\nimport { selectItem } from './items/ItemSelector';\nimport { RacerEffects } from './items/RacerEffects';\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """  driftCharge: number;\n  boostActive: boolean;\n  airborne: boolean;\n""",
    """  driftCharge: number;\n  boostActive: boolean;\n  activeBoostLabel: string | null;\n  airborne: boolean;\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """  private readonly itemBoxes: ItemBoxSystem;\n  private readonly itemSystem = new ItemSystem();\n  private lastApexSelectionTime = Number.NEGATIVE_INFINITY;\n""",
    """  private readonly itemBoxes: ItemBoxSystem;\n  private readonly itemSystem = new ItemSystem();\n  private readonly racerEffects = new RacerEffects();\n  private lastApexSelectionTime = Number.NEGATIVE_INFINITY;\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """    this.itemBoxes.dispose();\n    this.itemSystem.dispose();\n    this.renderer.dispose();\n""",
    """    this.itemBoxes.dispose();\n    this.itemSystem.dispose();\n    this.racerEffects.dispose();\n    this.renderer.dispose();\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """    const position = this.kart.position(this.position);\n    const projection = this.track.project(position);\n    const input: DriveInput = {\n""",
    """    const position = this.kart.position(this.position);\n    const projection = this.track.project(position);\n    const driveModifiers = this.racerEffects.driveModifiers('player');\n    const input: DriveInput = {\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """      brake: false,\n      drift: this.isPressed('Space') || this.touchPressed.has('drift'),\n    };\n""",
    """      brake: false,\n      drift: this.isPressed('Space') || this.touchPressed.has('drift'),\n      effectSpeedCapMultiplier: driveModifiers.speedCapMultiplier,\n      effectAccelerationMultiplier: driveModifiers.accelerationMultiplier,\n      ignoreOffRoadSpeedPenalty: driveModifiers.ignoreOffRoadSpeedPenalty,\n    };\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """    this.itemSystem.advance(dt);\n    this.updateItemBoxes(dt);\n""",
    """    this.itemSystem.advance(dt);\n    this.racerEffects.advance(dt);\n    this.updateItemBoxes(dt);\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """    void this.itemSystem.requestUse('player', itemUseDirection(reverseHeld));\n""",
    """    executeItemUse(\n      this.itemSystem,\n      this.racerEffects,\n      'player',\n      itemUseDirection(reverseHeld),\n    );\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """    const snapshot = this.lapTracker.snapshot();\n    const feedback = this.kart.feedback();\n    this.options.onHud({\n""",
    """    const snapshot = this.lapTracker.snapshot();\n    const feedback = this.kart.feedback();\n    const driveModifiers = this.racerEffects.driveModifiers('player');\n    this.options.onHud({\n""",
)

replace_once(
    "src/game/KartTimeTrial.ts",
    """      driftCharge: feedback.chargeRatio,\n      boostActive: feedback.boostActive,\n      airborne: feedback.airborne,\n""",
    """      driftCharge: feedback.chargeRatio,\n      boostActive: feedback.boostActive,\n      activeBoostLabel: driveModifiers.activeBoostLabel,\n      airborne: feedback.airborne,\n""",
)

replace_once(
    "src/app/mountAppShell.ts",
    """      getElement('#drift-label').textContent = state.airborne\n        ? 'AIRBORNE'\n        : state.boostActive\n          ? `${state.driftTier.toUpperCase()} BOOST`\n          : state.driftTier === 'none'\n            ? 'Hold Space + steer to drift'\n            : `${state.driftTier.toUpperCase()} CHARGE`;\n""",
    """      getElement('#drift-label').textContent = state.airborne\n        ? 'AIRBORNE'\n        : state.activeBoostLabel !== null\n          ? `${state.activeBoostLabel.toUpperCase()} ACTIVE`\n          : state.boostActive\n            ? `${state.driftTier.toUpperCase()} BOOST`\n            : state.driftTier === 'none'\n              ? 'Hold Space + steer to drift'\n              : `${state.driftTier.toUpperCase()} CHARGE`;\n""",
)

replace_once(
    "tests/kart-controller.test.ts",
    """import { KartController, type DriveInput } from '../src/game/physics/KartController';\n""",
    """import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';\nimport { KartController, type DriveInput } from '../src/game/physics/KartController';\n""",
)

replace_once(
    "tests/kart-controller.test.ts",
    """  it('uses Acceleration for time-to-speed without changing sustained top speed', () => {\n""",
    """  it('honors the Nitro Surge external cap, acceleration, and off-road speed override', () => {\n    const boost = ITEM_DEFINITIONS['nitro-surge'].boost;\n    if (boost === undefined) throw new Error('Nitro Surge boost configuration is missing.');\n\n    const normal = makeKart();\n    const surged = makeKart();\n    const normalInput: DriveInput = { throttle: 1, steering: 0, brake: false, drift: false };\n    const surgeInput: DriveInput = {\n      ...normalInput,\n      effectSpeedCapMultiplier: boost.speedCapMultiplier,\n      effectAccelerationMultiplier: boost.accelerationMultiplier,\n      ignoreOffRoadSpeedPenalty: boost.ignoreOffRoadSpeedPenalty,\n    };\n\n    step(normal.world, normal.kart, normalInput, 60);\n    step(surged.world, surged.kart, surgeInput, 60);\n    expect(surged.kart.speedMetersPerSecond() - normal.kart.speedMetersPerSecond()).toBeGreaterThan(1);\n\n    const capKart = makeKart();\n    step(capKart.world, capKart.kart, surgeInput, 900);\n    const normalMaximum = createKartTuning(sliceOneDriver).maxSpeed;\n    expect(capKart.kart.speedMetersPerSecond()).toBeCloseTo(\n      normalMaximum * boost.speedCapMultiplier,\n      1,\n    );\n\n    const grassKart = makeKart();\n    step(grassKart.world, grassKart.kart, surgeInput, 900, 'grass');\n    expect(grassKart.kart.speedMetersPerSecond()).toBeCloseTo(\n      normalMaximum * boost.speedCapMultiplier,\n      1,\n    );\n\n    step(grassKart.world, grassKart.kart, normalInput, 240, 'grass');\n    expect(grassKart.kart.speedMetersPerSecond()).toBeCloseTo(\n      normalMaximum * surfaceSpeedMultiplier('grass', sliceOneDriver.traction),\n      1,\n    );\n  });\n\n  it('uses Acceleration for time-to-speed without changing sustained top speed', () => {\n""",
)

create_text(
    "tests/racer-effects.test.ts",
    """import { describe, expect, it } from 'vitest';\nimport { executeItemUse } from '../src/game/items/ItemEffectDispatcher';\nimport { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';\nimport { ITEM_ROULETTE_SECONDS, ItemSystem } from '../src/game/items/ItemSystem';\nimport { RacerEffects } from '../src/game/items/RacerEffects';\n\nfunction nitroBoost() {\n  const boost = ITEM_DEFINITIONS['nitro-surge'].boost;\n  if (boost === undefined) throw new Error('Nitro Surge boost configuration is missing.');\n  return boost;\n}\n\ndescribe('Slice 5 RacerEffects temporary boost foundation', () => {\n  it('keeps Nitro Surge tuning in item configuration at the approved values', () => {\n    expect(nitroBoost()).toEqual({\n      durationSeconds: 1.2,\n      speedCapMultiplier: 1.18,\n      accelerationMultiplier: 1.35,\n      ignoreOffRoadSpeedPenalty: true,\n    });\n  });\n\n  it('applies a pause-safe temporary boost and restores neutral modifiers on expiry', () => {\n    const effects = new RacerEffects();\n    const boost = nitroBoost();\n\n    expect(effects.driveModifiers('player')).toEqual({\n      speedCapMultiplier: 1,\n      accelerationMultiplier: 1,\n      ignoreOffRoadSpeedPenalty: false,\n      activeBoostLabel: null,\n    });\n    expect(\n      effects.activateTemporaryBoost('player', {\n        id: 'nitro-surge',\n        label: 'Nitro Surge',\n        ...boost,\n      }),\n    ).toBe(true);\n    expect(effects.driveModifiers('player')).toEqual({\n      speedCapMultiplier: 1.18,\n      accelerationMultiplier: 1.35,\n      ignoreOffRoadSpeedPenalty: true,\n      activeBoostLabel: 'Nitro Surge',\n    });\n\n    effects.advance(0.4);\n    const beforePause = effects.remainingSeconds('player', 'nitro-surge');\n    effects.advance(5, true);\n    expect(effects.remainingSeconds('player', 'nitro-surge')).toBeCloseTo(beforePause);\n\n    effects.advance(1);\n    expect(effects.remainingSeconds('player', 'nitro-surge')).toBe(0);\n    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();\n  });\n\n  it('refreshes a repeated temporary boost instead of stacking its multipliers', () => {\n    const effects = new RacerEffects();\n    const spec = { id: 'nitro-surge', label: 'Nitro Surge', ...nitroBoost() };\n\n    expect(effects.activateTemporaryBoost('player', spec)).toBe(true);\n    effects.advance(0.9);\n    expect(effects.remainingSeconds('player')).toBeLessThan(0.4);\n    expect(effects.activateTemporaryBoost('player', spec)).toBe(true);\n    expect(effects.remainingSeconds('player')).toBeCloseTo(1.2);\n    expect(effects.driveModifiers('player').speedCapMultiplier).toBe(1.18);\n  });\n\n  it('rejects invalid boost specs and supports explicit cleanup', () => {\n    const effects = new RacerEffects();\n    expect(\n      effects.activateTemporaryBoost('player', {\n        id: '',\n        label: 'Bad',\n        durationSeconds: 1,\n        speedCapMultiplier: 1.1,\n        accelerationMultiplier: 1.1,\n        ignoreOffRoadSpeedPenalty: false,\n      }),\n    ).toBe(false);\n\n    effects.activateTemporaryBoost('player', {\n      id: 'nitro-surge',\n      label: 'Nitro Surge',\n      ...nitroBoost(),\n    });\n    expect(effects.clearTemporaryBoost('player', 'wrong-effect')).toBe(false);\n    expect(effects.clearTemporaryBoost('player', 'nitro-surge')).toBe(true);\n    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();\n\n    effects.activateTemporaryBoost('player', {\n      id: 'nitro-surge',\n      label: 'Nitro Surge',\n      ...nitroBoost(),\n    });\n    effects.clear('player');\n    expect(effects.remainingSeconds('player')).toBe(0);\n    effects.activateTemporaryBoost('ai-1', {\n      id: 'nitro-surge',\n      label: 'Nitro Surge',\n      ...nitroBoost(),\n    });\n    effects.dispose();\n    expect(effects.remainingSeconds('ai-1')).toBe(0);\n  });\n});\n\ndescribe('Slice 5 Nitro Surge item-use dispatch', () => {\n  it('consumes Nitro Surge only after the configured real effect activates', () => {\n    const items = new ItemSystem();\n    const effects = new RacerEffects();\n\n    items.acquire('player', 'nitro-surge');\n    items.advance(ITEM_ROULETTE_SECONDS);\n    expect(executeItemUse(items, effects, 'player', 'forward')).toBe('activated');\n    expect(items.heldItem('player')).toBeNull();\n    expect(items.canCollect('player')).toBe(true);\n    expect(effects.driveModifiers('player')).toMatchObject({\n      speedCapMultiplier: 1.18,\n      accelerationMultiplier: 1.35,\n      ignoreOffRoadSpeedPenalty: true,\n      activeBoostLabel: 'Nitro Surge',\n    });\n  });\n\n  it('leaves not-yet-implemented items held and unconsumed', () => {\n    const items = new ItemSystem();\n    const effects = new RacerEffects();\n\n    items.acquire('player', 'kinetic-disc');\n    items.advance(ITEM_ROULETTE_SECONDS);\n    expect(executeItemUse(items, effects, 'player', 'backward')).toBe('unsupported');\n    expect(items.heldItem('player')).toEqual({ itemId: 'kinetic-disc', remainingCharges: 1 });\n    expect(items.canCollect('player')).toBe(false);\n    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();\n  });\n\n  it('rejects use while roulette is active without changing inventory or effects', () => {\n    const items = new ItemSystem();\n    const effects = new RacerEffects();\n\n    items.acquire('player', 'nitro-surge');\n    expect(executeItemUse(items, effects, 'player', 'forward')).toBe('rejected');\n    expect(items.heldItem('player')).toEqual({ itemId: 'nitro-surge', remainingCharges: 1 });\n    expect(effects.remainingSeconds('player')).toBe(0);\n  });\n});\n""",
)

print("Guarded Slice 5 RacerEffects + Nitro Surge patch applied.")
