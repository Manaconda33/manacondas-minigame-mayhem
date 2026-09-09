import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { shockwaveCounterFromSearch } from '../src/game/items/ItemTestMode';
import {
  PrismaticCounterFixture,
  prismaticTestFromSearch,
} from '../src/game/items/PrismaticCounterFixture';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { ShockwaveCounterFixture } from '../src/game/items/ShockwaveCounterFixture';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

function runtimeAt(track: CircuitAlpha, progress = 0.1) {
  const capacity = new ItemPhysicsCapacity();
  const projectiles = new ProjectileSystem(track, capacity);
  const hazards = new HazardSystem(track, capacity, () => null);
  const apex = new ApexMissileSystem(track, projectiles);
  const shockwave = new ShockwaveSystem();
  return { capacity, projectiles, hazards, apex, shockwave, position: track.curve.getPointAt(progress) };
}

describe('Blaze deterministic acceptance fixtures', () => {
  it('accepts only the approved Blaze query combinations', () => {
    expect(
      prismaticTestFromSearch('?testItem=blaze-orbs&testBlaze=hit'),
    ).toEqual({ mode: 'blaze-hit', expired: false });
    expect(
      prismaticTestFromSearch(
        '?testItem=prismatic-invincibility&testBlaze=prismatic&testBlazePhase=protected',
      ),
    ).toEqual({ mode: 'blaze', expired: false });
    expect(
      prismaticTestFromSearch(
        '?testItem=prismatic-invincibility&testBlaze=prismatic&testBlazePhase=expired',
      ),
    ).toEqual({ mode: 'blaze', expired: true });
    expect(
      prismaticTestFromSearch(
        '?testItem=prismatic-invincibility&testBlaze=prismatic&testBlazePhase=wrong',
      ),
    ).toBeNull();
    expect(
      prismaticTestFromSearch('?testItem=blaze-orbs&testBlaze=prismatic'),
    ).toBeNull();
    expect(shockwaveCounterFromSearch('?testItem=shockwave&testBlaze=shockwave')).toBe('blaze');
    expect(shockwaveCounterFromSearch('?testBlaze=shockwave')).toBeNull();
  });

  it('places a marked stationary rival for the forced Blaze hit playtest', () => {
    const track = new CircuitAlpha();
    const runtime = runtimeAt(track);
    const fixture = new PrismaticCounterFixture(
      prismaticTestFromSearch('?testItem=blaze-orbs&testBlaze=hit'),
    );
    let placedPosition: THREE.Vector3 | null = null;
    let placedForward: THREE.Vector3 | null = null;
    fixture.update(1 / 60, {
      position: runtime.position,
      speed: 0,
      finished: false,
      held: false,
      remaining: 0,
      track,
      racers: [],
      projectiles: runtime.projectiles,
      hazards: runtime.hazards,
      apex: runtime.apex,
      shockwave: runtime.shockwave,
      placeRacer: (position, forward) => {
        placedPosition = position.clone();
        placedForward = forward.clone();
        return 'rival';
      },
    });
    expect(fixture.controlledRacer()).toBe('rival');
    expect(placedPosition).not.toBeNull();
    expect(placedForward?.length()).toBe(0);
    fixture.updateMarker(placedPosition ?? undefined);
    expect(fixture.group.visible).toBe(true);
    expect(fixture.badge()).toContain('BLAZE HIT');
    expect(fixture.badge()).toContain('STATIONARY RIVAL');
    fixture.dispose();
    runtime.apex.dispose();
    runtime.hazards.dispose();
    runtime.projectiles.dispose();
    runtime.shockwave.dispose();
  });

  it.each([
    ['protected', 6],
    ['expired', 6],
  ] as const)('spawns a production Blaze orb for the Prismatic %s encounter', (phase, initialRemaining) => {
    const track = new CircuitAlpha();
    const runtime = runtimeAt(track);
    const fixture = new PrismaticCounterFixture(
      prismaticTestFromSearch(
        `?testItem=prismatic-invincibility&testBlaze=prismatic&testBlazePhase=${phase}`,
      ),
    );
    const base = {
      position: runtime.position,
      speed: 0,
      finished: false,
      held: true,
      track,
      racers: [],
      projectiles: runtime.projectiles,
      hazards: runtime.hazards,
      apex: runtime.apex,
      shockwave: runtime.shockwave,
      placeRacer: () => null,
    };
    fixture.update(1 / 60, { ...base, remaining: initialRemaining });
    if (phase === 'expired') {
      expect(runtime.projectiles.snapshots()).toHaveLength(0);
      fixture.update(1 / 60, { ...base, held: false, remaining: 0 });
    }
    expect(runtime.projectiles.snapshots()).toHaveLength(1);
    expect(runtime.projectiles.snapshots()[0]?.itemId).toBe('blaze-orbs');
    fixture.dispose();
    runtime.apex.dispose();
    runtime.hazards.dispose();
    runtime.projectiles.dispose();
    runtime.shockwave.dispose();
  });

  it('spawns a production incoming Blaze orb for the Shockwave playtest', () => {
    const track = new CircuitAlpha();
    const runtime = runtimeAt(track);
    const fixture = new ShockwaveCounterFixture(
      shockwaveCounterFromSearch('?testItem=shockwave&testBlaze=shockwave'),
    );
    fixture.update(
      false,
      true,
      runtime.position,
      track,
      runtime.projectiles,
      runtime.hazards,
      runtime.apex,
      [],
      [],
    );
    expect(runtime.projectiles.snapshots()).toHaveLength(1);
    expect(runtime.projectiles.snapshots()[0]?.itemId).toBe('blaze-orbs');
    expect(fixture.badge()).toContain('INCOMING BLAZE');
    fixture.reset();
    runtime.apex.dispose();
    runtime.hazards.dispose();
    runtime.projectiles.dispose();
    runtime.shockwave.dispose();
  });
});
