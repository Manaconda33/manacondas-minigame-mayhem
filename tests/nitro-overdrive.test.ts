import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { NitroOverdriveSystem, NITRO_OVERDRIVE_CONFIG } from '../src/game/items/NitroOverdrive';
import { NitroOverdriveAudio } from '../src/audio/NitroOverdriveAudio';
import { NitroOverdriveVisual } from '../src/game/items/NitroOverdriveVisual';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { ItemSystem, ITEM_ROULETTE_SECONDS } from '../src/game/items/ItemSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { PrismaticSystem } from '../src/game/items/PrismaticSystem';
import { arcRuntimeRig } from './arc-runtime-rig';

const rigs: ReturnType<typeof arcRuntimeRig>[] = [];

beforeAll(async () => {
  await RAPIER.init();
});

afterEach(() => {
  rigs.splice(0).forEach((rig) => {
    rig.dispose();
  });
  vi.restoreAllMocks();
});

function advanceBoth(
  overdrive: NitroOverdriveSystem,
  effects: RacerEffects,
  dt: number,
  paused = false,
): void {
  overdrive.advance(dt, paused);
  effects.advance(dt, paused, false);
}

function activateThroughDispatcher(
  items: ItemSystem,
  effects: RacerEffects,
  overdrive: NitroOverdriveSystem,
  direction: 'forward' | 'backward' = 'forward',
): void {
  items.acquire('player', 'nitro-overdrive');
  items.advance(ITEM_ROULETTE_SECONDS);
  expect(
    executeItemUse(items, effects, 'player', direction, { nitroOverdriveSystem: overdrive }),
  ).toBe('activated');
}

describe('Nitro Overdrive production item path', () => {
  it('keeps the approved tuning and atomically frees the inventory slot', () => {
    expect(NITRO_OVERDRIVE_CONFIG).toMatchObject({
      windowSeconds: 6,
      pulseCadenceSeconds: 0.75,
      pulseDurationSeconds: 0.9,
      speedCapMultiplier: 1.15,
      accelerationMultiplier: 1,
      ignoreOffRoadSpeedPenalty: false,
    });

    const items = new ItemSystem();
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    activateThroughDispatcher(items, effects, overdrive, 'backward');

    expect(items.heldItem('player')).toBeNull();
    expect(items.canCollect('player')).toBe(true);
    expect(overdrive.snapshot('player')).toEqual({
      active: true,
      windowRemainingSeconds: 6,
      pulseRemainingSeconds: 0.9,
      nextPulseRemainingSeconds: 0.75,
    });
    expect(effects.driveModifiers('player')).toEqual({
      speedCapMultiplier: 1.15,
      accelerationMultiplier: 1,
      ignoreOffRoadSpeedPenalty: false,
      activeBoostLabel: 'Continuous Nitro Overdrive',
    });
  });

  it('does not consume or activate when the transactional commit is rejected', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    items.acquire('player', 'nitro-overdrive');
    items.advance(ITEM_ROULETTE_SECONDS);

    expect(overdrive.activate('player', () => false)).toBe(false);
    expect(overdrive.snapshot('player').active).toBe(false);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBe(0);
    expect(items.heldItem('player')).toEqual({ itemId: 'nitro-overdrive', remainingCharges: 1 });
  });

  it('supports atomic activation for an AI racer', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    items.acquire('ai-1', 'nitro-overdrive');
    items.advance(ITEM_ROULETTE_SECONDS);

    expect(
      executeItemUse(items, effects, 'ai-1', 'forward', { nitroOverdriveSystem: overdrive }),
    ).toBe('activated');
    expect(items.heldItem('ai-1')).toBeNull();
    expect(overdrive.snapshot('ai-1')).toMatchObject({ active: true, windowRemainingSeconds: 6 });

    overdrive.advance(NITRO_OVERDRIVE_CONFIG.pulseCadenceSeconds);
    expect(overdrive.pulse('ai-1')).toBe(true);
  });

  it('accepts pulses only at the cadence boundary and refreshes one source', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    activateThroughDispatcher(items, effects, overdrive);

    expect(overdrive.pulse('player')).toBe(false);
    expect(overdrive.snapshot('player').nextPulseRemainingSeconds).toBe(0.75);
    advanceBoth(overdrive, effects, 0.75);
    expect(overdrive.pulse('player')).toBe(true);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBeCloseTo(0.9);
    expect(effects.driveModifiers('player').speedCapMultiplier).toBe(1.15);
    expect(overdrive.pulse('player')).toBe(false);
  });

  it('clips the final pulse to the six-second window and freezes while paused', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    activateThroughDispatcher(items, effects, overdrive);
    const beforePause = overdrive.snapshot('player');
    advanceBoth(overdrive, effects, 4, true);
    expect(overdrive.snapshot('player')).toEqual(beforePause);

    advanceBoth(overdrive, effects, 5.25);
    expect(overdrive.snapshot('player')).toMatchObject({
      active: true,
      windowRemainingSeconds: 0.75,
      pulseRemainingSeconds: 0,
      nextPulseRemainingSeconds: 0,
    });
    expect(overdrive.pulse('player')).toBe(true);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBeCloseTo(0.75);

    advanceBoth(overdrive, effects, 0.75);
    expect(overdrive.snapshot('player').active).toBe(false);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBe(0);
  });
});

describe('Nitro Overdrive effect composition and lifecycle', () => {
  it('uses maximum authority across Overdrive, Nitro Surge, and Prismatic', () => {
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    overdrive.activate('player', () => true);
    const nitroSurge = ITEM_DEFINITIONS['nitro-surge'].boost;
    if (nitroSurge === undefined) throw new Error('Nitro Surge tuning is missing.');
    effects.activateTemporaryBoost('player', {
      id: 'nitro-surge',
      label: 'Nitro Surge',
      ...nitroSurge,
    });
    const prismatic = new PrismaticSystem(effects);
    expect(prismatic.activate('player', () => true)).toBe(true);

    expect(effects.driveModifiers('player')).toMatchObject({
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
      activeBoostLabel: 'Nitro Surge',
    });
    expect(effects.isItemImmune('player')).toBe(true);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBeCloseTo(0.9);
  });

  it('clears only its source on recovery-style cleanup and fully disposes', () => {
    const effects = new RacerEffects();
    const overdrive = new NitroOverdriveSystem(effects);
    overdrive.activate('player', () => true);
    effects.activateTemporaryBoost('player', {
      id: 'other-boost',
      label: 'Other Boost',
      durationSeconds: 2,
      speedCapMultiplier: 1.2,
      accelerationMultiplier: 1.1,
      ignoreOffRoadSpeedPenalty: true,
    });

    overdrive.clear('player');
    expect(overdrive.snapshot('player').active).toBe(false);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBe(0);
    expect(effects.remainingSeconds('player', 'other-boost')).toBeCloseTo(2);

    overdrive.activate('player', () => true);
    overdrive.dispose();
    expect(overdrive.snapshot('player').active).toBe(false);
    expect(effects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBe(0);
  });
});

describe('Nitro Overdrive production presentation and input seams', () => {
  it('routes desktop and mobile ITEM through the real KartTimeTrial method', () => {
    const rig = arcRuntimeRig();
    rigs.push(rig);
    rig.itemSystem.acquire('player', 'nitro-overdrive');
    rig.itemSystem.advance(ITEM_ROULETTE_SECONDS);
    rig.game.requestPlayerItemUse();

    expect(rig.itemSystem.heldItem('player')).toBeNull();
    expect(rig.nitroOverdrive.snapshot('player').active).toBe(true);
    expect(rig.itemSystem.heldItem('rival')).toBeNull();

    const beforeEarlyMobilePress = rig.nitroOverdrive.snapshot('player');
    rig.game.setTouchControl('item', true);
    rig.game.setTouchControl('item', false);
    expect(rig.nitroOverdrive.snapshot('player')).toEqual(beforeEarlyMobilePress);

    rig.nitroOverdrive.advance(NITRO_OVERDRIVE_CONFIG.pulseCadenceSeconds);
    rig.racerEffects.advance(NITRO_OVERDRIVE_CONFIG.pulseCadenceSeconds, false, false);
    rig.game.setTouchControl('brake', true);
    rig.game.setTouchControl('item', true);
    rig.game.setTouchControl('item', false);
    rig.game.setTouchControl('brake', false);
    expect(rig.nitroOverdrive.snapshot('player').nextPulseRemainingSeconds).toBeCloseTo(0.75);
    expect(rig.racerEffects.remainingSeconds('player', NITRO_OVERDRIVE_CONFIG.id)).toBeCloseTo(0.9);

    const beforeRecovery = rig.nitroOverdrive.snapshot('player');
    rig.game.respawn();
    expect(rig.nitroOverdrive.snapshot('player')).toEqual(beforeRecovery);
  });

  it('shows a finite rear treatment with a distinct accepted-pulse burst', () => {
    const visual = new NitroOverdriveVisual();
    expect(visual.group.visible).toBe(false);
    visual.update(true, false, 0.1);
    expect(visual.group.visible).toBe(true);
    const pulseRing = visual.group.children[5];
    expect(pulseRing?.visible).toBe(false);
    visual.update(true, true, 0.2);
    expect(pulseRing?.visible).toBe(true);
    visual.update(false, false, 0.3);
    expect(visual.group.visible).toBe(false);
    expect(pulseRing?.visible).toBe(false);
    visual.dispose();
    expect(visual.group.children).toHaveLength(0);
  });

  it('keeps activation and pulse audio gesture-gated, bounded, and disposable', async () => {
    const oscillators: { disconnect: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] =
      [];
    const context = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockImplementation(() => {
        context.state = 'running';
        return Promise.resolve();
      }),
      createOscillator: vi.fn(() => {
        const oscillator = {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn((destination: unknown) => destination),
          start: vi.fn(),
          stop: vi.fn(),
          disconnect: vi.fn(),
          onended: null as (() => void) | null,
        };
        oscillators.push(oscillator);
        return oscillator;
      }),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn((destination: unknown) => destination),
        disconnect: vi.fn(),
      })),
    };
    const audio = new NitroOverdriveAudio(() => context as unknown as AudioContext);
    audio.play('activate', 1);
    expect(context.createOscillator).not.toHaveBeenCalled();
    await audio.unlock();
    audio.play('activate', 1);
    audio.play('pulse', 0.5);
    expect(context.createOscillator).toHaveBeenCalledTimes(2);
    audio.stop();
    expect(oscillators.every((oscillator) => oscillator.disconnect.mock.calls.length > 0)).toBe(
      true,
    );
    audio.dispose();
    expect(() => {
      audio.play('pulse', 1);
    }).not.toThrow();
  });
});
