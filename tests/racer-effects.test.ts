import { describe, expect, it } from 'vitest';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { ITEM_ROULETTE_SECONDS, ItemSystem } from '../src/game/items/ItemSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';

function nitroBoost() {
  const boost = ITEM_DEFINITIONS['nitro-surge'].boost;
  if (boost === undefined) throw new Error('Nitro Surge boost configuration is missing.');
  return boost;
}

describe('Slice 5 RacerEffects temporary boost foundation', () => {
  it('keeps Nitro Surge tuning in item configuration at the approved values', () => {
    expect(nitroBoost()).toEqual({
      durationSeconds: 2.4,
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
    });
  });

  it('applies a pause-safe temporary boost and restores neutral modifiers on expiry', () => {
    const effects = new RacerEffects();
    const boost = nitroBoost();

    expect(effects.driveModifiers('player')).toEqual({
      speedCapMultiplier: 1,
      accelerationMultiplier: 1,
      ignoreOffRoadSpeedPenalty: false,
      activeBoostLabel: null,
    });
    expect(
      effects.activateTemporaryBoost('player', {
        id: 'nitro-surge',
        label: 'Nitro Surge',
        ...boost,
      }),
    ).toBe(true);
    expect(effects.driveModifiers('player')).toEqual({
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
      activeBoostLabel: 'Nitro Surge',
    });

    effects.advance(0.4);
    const beforePause = effects.remainingSeconds('player', 'nitro-surge');
    effects.advance(5, true);
    expect(effects.remainingSeconds('player', 'nitro-surge')).toBeCloseTo(beforePause);

    effects.advance(2);
    expect(effects.remainingSeconds('player', 'nitro-surge')).toBe(0);
    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();
  });

  it('refreshes a repeated temporary boost instead of stacking its multipliers', () => {
    const effects = new RacerEffects();
    const spec = { id: 'nitro-surge', label: 'Nitro Surge', ...nitroBoost() };

    expect(effects.activateTemporaryBoost('player', spec)).toBe(true);
    effects.advance(2.1);
    expect(effects.remainingSeconds('player')).toBeLessThan(0.4);
    expect(effects.activateTemporaryBoost('player', spec)).toBe(true);
    expect(effects.remainingSeconds('player')).toBeCloseTo(2.4);
    expect(effects.driveModifiers('player').speedCapMultiplier).toBe(1.18);
  });

  it('rejects invalid boost specs and supports explicit cleanup', () => {
    const effects = new RacerEffects();
    expect(
      effects.activateTemporaryBoost('player', {
        id: '',
        label: 'Bad',
        durationSeconds: 1,
        speedCapMultiplier: 1.1,
        accelerationMultiplier: 1.1,
        ignoreOffRoadSpeedPenalty: false,
      }),
    ).toBe(false);

    effects.activateTemporaryBoost('player', {
      id: 'nitro-surge',
      label: 'Nitro Surge',
      ...nitroBoost(),
    });
    expect(effects.clearTemporaryBoost('player', 'wrong-effect')).toBe(false);
    expect(effects.clearTemporaryBoost('player', 'nitro-surge')).toBe(true);
    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();

    effects.activateTemporaryBoost('player', {
      id: 'nitro-surge',
      label: 'Nitro Surge',
      ...nitroBoost(),
    });
    effects.clear('player');
    expect(effects.remainingSeconds('player')).toBe(0);
    effects.activateTemporaryBoost('ai-1', {
      id: 'nitro-surge',
      label: 'Nitro Surge',
      ...nitroBoost(),
    });
    effects.dispose();
    expect(effects.remainingSeconds('ai-1')).toBe(0);
  });
});

describe('Slice 5 Nitro Surge item-use dispatch', () => {
  it('consumes Nitro Surge only after the configured real effect activates', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();

    items.acquire('player', 'nitro-surge');
    items.advance(ITEM_ROULETTE_SECONDS);
    expect(executeItemUse(items, effects, 'player', 'forward')).toBe('activated');
    expect(items.heldItem('player')).toBeNull();
    expect(items.canCollect('player')).toBe(true);
    expect(effects.driveModifiers('player')).toMatchObject({
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
      activeBoostLabel: 'Nitro Surge',
    });
  });

  it('leaves not-yet-implemented items held and unconsumed', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();

    items.acquire('player', 'blast-orb');
    items.advance(ITEM_ROULETTE_SECONDS);
    expect(executeItemUse(items, effects, 'player', 'backward')).toBe('unsupported');
    expect(items.heldItem('player')).toEqual({ itemId: 'blast-orb', remainingCharges: 1 });
    expect(items.canCollect('player')).toBe(false);
    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();
  });

  it('rejects use while roulette is active without changing inventory or effects', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();

    items.acquire('player', 'nitro-surge');
    expect(executeItemUse(items, effects, 'player', 'forward')).toBe('rejected');
    expect(items.heldItem('player')).toEqual({ itemId: 'nitro-surge', remainingCharges: 1 });
    expect(effects.remainingSeconds('player')).toBe(0);
  });
});

describe('Slice 5 standard spinout effects', () => {
  it('runs a pause-safe full-turn spinout and expires cleanly', () => {
    const effects = new RacerEffects();
    expect(
      effects.activateSpinout('player', {
        id: 'kinetic-disc-spinout',
        label: 'Ricochet Kinetic Disc',
        durationSeconds: 0.85,
        direction: 1,
        turns: 1,
      }),
    ).toBe(true);
    const active = effects.spinoutState('player');
    expect(active?.yawRateRadiansPerSecond).toBeCloseTo((Math.PI * 2) / 0.85);
    effects.advance(0.3);
    const beforePause = effects.spinoutRemainingSeconds('player');
    effects.advance(5, true);
    expect(effects.spinoutRemainingSeconds('player')).toBeCloseTo(beforePause);
    effects.advance(0.56);
    expect(effects.spinoutState('player')).toBeNull();
  });

  it('rejects invalid spinout specs and clears spinouts independently', () => {
    const effects = new RacerEffects();
    expect(
      effects.activateSpinout('player', {
        id: '',
        label: 'Bad',
        durationSeconds: 0.85,
        direction: 1,
        turns: 1,
      }),
    ).toBe(false);
    effects.activateSpinout('player', {
      id: 'kinetic-disc-spinout',
      label: 'Ricochet Kinetic Disc',
      durationSeconds: 0.85,
      direction: -1,
      turns: 1,
    });
    expect(effects.clearSpinout('player', 'wrong')).toBe(false);
    expect(effects.clearSpinout('player', 'kinetic-disc-spinout')).toBe(true);
    expect(effects.spinoutState('player')).toBeNull();
  });
});

describe('spinout refresh and teardown', () => {
  it('refreshes deterministically without stacking and clears every racer on disposal', () => {
    const effects = new RacerEffects();
    const spec = {
      id: 'impact',
      label: 'Impact',
      durationSeconds: 0.85,
      direction: 1 as const,
      turns: 1,
    };
    effects.activateSpinout('player', spec);
    effects.activateSpinout('ai-1', spec);
    effects.advance(0.4);
    effects.activateSpinout('player', { ...spec, direction: -1 });
    expect(effects.spinoutState('player')).toMatchObject({
      remainingSeconds: 0.85,
      yawRateRadiansPerSecond: (-2 * Math.PI) / 0.85,
    });
    effects.advance(0.46);
    expect(effects.spinoutState('ai-1')).toBeNull();
    expect(effects.spinoutRemainingSeconds('player')).toBeCloseTo(0.39);
    effects.dispose();
    expect(effects.spinoutState('player')).toBeNull();
    expect(effects.spinoutState('ai-1')).toBeNull();
    expect(effects.driveModifiers('player').accelerationMultiplier).toBe(1);
  });
});
