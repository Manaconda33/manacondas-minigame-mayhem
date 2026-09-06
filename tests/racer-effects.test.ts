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
      durationSeconds: 1.2,
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.35,
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
      accelerationMultiplier: 1.35,
      ignoreOffRoadSpeedPenalty: true,
      activeBoostLabel: 'Nitro Surge',
    });

    effects.advance(0.4);
    const beforePause = effects.remainingSeconds('player', 'nitro-surge');
    effects.advance(5, true);
    expect(effects.remainingSeconds('player', 'nitro-surge')).toBeCloseTo(beforePause);

    effects.advance(1);
    expect(effects.remainingSeconds('player', 'nitro-surge')).toBe(0);
    expect(effects.driveModifiers('player').activeBoostLabel).toBeNull();
  });

  it('refreshes a repeated temporary boost instead of stacking its multipliers', () => {
    const effects = new RacerEffects();
    const spec = { id: 'nitro-surge', label: 'Nitro Surge', ...nitroBoost() };

    expect(effects.activateTemporaryBoost('player', spec)).toBe(true);
    effects.advance(0.9);
    expect(effects.remainingSeconds('player')).toBeLessThan(0.4);
    expect(effects.activateTemporaryBoost('player', spec)).toBe(true);
    expect(effects.remainingSeconds('player')).toBeCloseTo(1.2);
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
      accelerationMultiplier: 1.35,
      ignoreOffRoadSpeedPenalty: true,
      activeBoostLabel: 'Nitro Surge',
    });
  });

  it('leaves not-yet-implemented items held and unconsumed', () => {
    const items = new ItemSystem();
    const effects = new RacerEffects();

    items.acquire('player', 'kinetic-disc');
    items.advance(ITEM_ROULETTE_SECONDS);
    expect(executeItemUse(items, effects, 'player', 'backward')).toBe('unsupported');
    expect(items.heldItem('player')).toEqual({ itemId: 'kinetic-disc', remainingCharges: 1 });
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
