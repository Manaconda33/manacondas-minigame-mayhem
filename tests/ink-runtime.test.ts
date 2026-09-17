import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { ITEM_ROULETTE_SECONDS } from '../src/game/items/ItemSystem';
import { InkSplatSystem } from '../src/game/items/InkSplatSystem';
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

function rig() {
  const value = arcRuntimeRig();
  rigs.push(value);
  return value;
}

describe('Vision-Obscuring Ink Splat production runtime integration', () => {
  it('uses production ITEM dispatch and consumes once across the real progress targeting seam', () => {
    const r = rig();
    const rival = r.opponents[0]?.progress;
    if (rival === undefined) throw new Error('Missing rival progress');
    r.playerProgress.trackProgress = 0.2;
    rival.trackProgress = 0.5;

    expect(r.itemSystem.acquire('player', 'ink-splat')).toBe(true);
    r.itemSystem.advance(ITEM_ROULETTE_SECONDS);
    const beforePosition = r.kart.position();
    const beforeVelocity = r.kart.velocity();
    r.game.requestPlayerItemUse();

    expect(r.itemSystem.heldItem('player')).toBeNull();
    expect(r.inkSplat.activeRacerIds()).toEqual(['rival']);
    expect(r.inkSplat.viewSnapshot('rival').remainingSeconds).toBeCloseTo(2.5);
    expect(r.itemPhysicsCapacity.count()).toBe(0);
    expect(r.kart.position()).toEqual(beforePosition);
    expect(r.kart.velocity()).toEqual(beforeVelocity);
  });

  it('holds the charge when the validated target set is empty, including through reverse input', () => {
    const r = rig();
    const rival = r.opponents[0]?.progress;
    if (rival === undefined) throw new Error('Missing rival progress');
    r.playerProgress.trackProgress = 0.5;
    rival.trackProgress = 0.2;

    expect(r.itemSystem.acquire('player', 'ink-splat')).toBe(true);
    r.itemSystem.advance(ITEM_ROULETTE_SECONDS);
    r.game.pressed.add('KeyS');
    r.game.requestPlayerItemUse();

    expect(r.itemSystem.heldItem('player')).toEqual({ itemId: 'ink-splat', remainingCharges: 1 });
    expect(r.inkSplat.activeRacerIds()).toEqual([]);
    expect(r.itemPhysicsCapacity.count()).toBe(0);
  });

  it('keeps a protected target blocked while an unprotected target is impaired', () => {
    const r = rig();
    const rival = r.opponents[0]?.progress;
    if (rival === undefined) throw new Error('Missing rival progress');
    r.playerProgress.trackProgress = 0.1;
    rival.trackProgress = 0.4;
    r.racerEffects.setItemImmune('rival', true);
    const other = { ...rival, id: 'other', trackProgress: 0.6 };
    r.game.itemTargetingProgress = () => [r.playerProgress, rival, other];

    const result = r.inkSplat.apply(
      'player',
      r.game.itemTargetingProgress(),
      (racerId) => r.racerEffects.isItemImmune(racerId),
      () => true,
    );

    expect(result.blockedTargetIds).toEqual(['rival']);
    expect(result.appliedTargetIds).toEqual(['other']);
    expect(r.inkSplat.activeRacerIds()).toEqual(['other']);
  });

  it('survives ordinary recovery and clears on explicit finish/disposal paths', () => {
    const r = rig();
    const rival = r.opponents[0]?.progress;
    if (rival === undefined) throw new Error('Missing rival progress');
    r.playerProgress.trackProgress = 0.1;
    rival.trackProgress = 0.4;
    r.inkSplat.apply(
      'player',
      [r.playerProgress, rival],
      () => false,
      () => true,
    );
    r.game.respawn();
    expect(r.inkSplat.isActive('rival')).toBe(true);
    r.inkSplat.clear('rival');
    expect(r.inkSplat.isActive('rival')).toBe(false);
  });

  it('does not reserve shared physics capacity for the screen-space effect', () => {
    const r = rig();
    const rival = r.opponents[0]?.progress;
    if (rival === undefined) throw new Error('Missing rival progress');
    r.playerProgress.trackProgress = 0.1;
    rival.trackProgress = 0.4;
    const system = new InkSplatSystem();
    system.apply(
      'player',
      [r.playerProgress, rival],
      () => false,
      () => true,
    );
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.projectiles.capacity.count()).toBe(0);
    expect(system.activeRacerIds()).toEqual(['rival']);
  });
});
