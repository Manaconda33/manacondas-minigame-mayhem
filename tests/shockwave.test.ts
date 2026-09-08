import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import {
  ShockwaveSystem,
  shockwavePushDelta,
  type ShockwavePulse,
  type ShockwaveTarget,
} from '../src/game/items/ShockwaveSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { shockwaveCounterFromSearch } from '../src/game/items/ItemTestMode';
import { ShockwaveCounterFixture } from '../src/game/items/ShockwaveCounterFixture';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';

function launch(track: CircuitAlpha, progress = 0.2) {
  return {
    position: track.curve.getPointAt(progress).setY(0.72),
    forward: track.curve.getTangentAt(progress),
    velocity: new THREE.Vector3(),
  };
}

function target(
  id: string,
  position: THREE.Vector3,
  overrides: Partial<ShockwaveTarget> = {},
): ShockwaveTarget {
  return { id, position, finished: false, ...overrides };
}

describe('Acoustic Shockwave Pulse', () => {
  it.each(['forward', 'backward'] as const)(
    'commits one charge for %s intent even with no target and queues one centered pulse',
    (direction) => {
      const track = new CircuitAlpha();
      const items = new ItemSystem();
      const effects = new RacerEffects();
      const shockwave = new ShockwaveSystem();
      expect(items.acquire('player', 'shockwave')).toBe(true);
      items.advance(1);
      const origin = launch(track).position;
      expect(
        executeItemUse(items, effects, 'player', direction, {
          shockwaveSystem: shockwave,
          projectileLaunch: {
            position: origin,
            forward: new THREE.Vector3(0, 0, 1),
            velocity: new THREE.Vector3(),
          },
        }),
      ).toBe('activated');
      expect(items.heldItem('player')).toBeNull();
      const pulses = shockwave.drainPulses();
      expect(pulses).toHaveLength(1);
      expect(pulses[0]?.center).toEqual(origin);
      expect(shockwave.visualCount()).toBe(1);
      shockwave.dispose();
    },
  );

  it('retains the charge and creates no pulse or visual when activation cannot commit', () => {
    const items = new ItemSystem();
    const shockwave = new ShockwaveSystem();
    expect(items.acquire('player', 'shockwave')).toBe(true);
    items.advance(1);
    expect(shockwave.activate('player', new THREE.Vector3(), () => false)).toBe(false);
    expect(items.heldItem('player')?.remainingCharges).toBe(1);
    expect(shockwave.pendingCount()).toBe(0);
    expect(shockwave.visualCount()).toBe(0);
    shockwave.dispose();
  });

  it('uses exact governed horizontal push falloff and deterministic finite coincident fallback', () => {
    const pulse: ShockwavePulse = { ownerId: 'owner', center: new THREE.Vector3() };
    const center = shockwavePushDelta(pulse, target('center', new THREE.Vector3()));
    const mid = shockwavePushDelta(pulse, target('mid', new THREE.Vector3(2.5, 100, 0)));
    const edge = shockwavePushDelta(pulse, target('edge', new THREE.Vector3(5, -100, 0)));
    expect(center?.length()).toBeCloseTo(6, 8);
    expect(mid?.length()).toBeCloseTo(4, 8);
    expect(edge?.length()).toBeCloseTo(2, 8);
    expect(center?.toArray().every(Number.isFinite)).toBe(true);
    expect(shockwavePushDelta(pulse, target('center', new THREE.Vector3()))).toEqual(center);
    expect(
      shockwavePushDelta(pulse, target('outside', new THREE.Vector3(5.0001, 0, 0))),
    ).toBeNull();
    expect(shockwavePushDelta(pulse, target('owner', new THREE.Vector3(1, 0, 0)))).toBeNull();
    expect(
      shockwavePushDelta(pulse, target('finished', new THREE.Vector3(1, 0, 0), { finished: true })),
    ).toBeNull();
    expect(
      shockwavePushDelta(pulse, target('immune', new THREE.Vector3(1, 0, 0), { itemImmune: true })),
    ).toBeNull();
  });

  it('queues all three counter boundaries at 5m and returns only eligible racer pushes', () => {
    const calls: string[] = [];
    const shockwave = new ShockwaveSystem();
    const pulse: ShockwavePulse = { ownerId: 'owner', center: new THREE.Vector3(1, 2, 3) };
    const pushes = shockwave.dispatch(pulse, {
      projectileSystem: {
        queueClearWithinRadius: (center, radius) =>
          calls.push(['p', String(center.x), String(radius)].join(':')),
      },
      hazardSystem: {
        queueClearWithinRadius: (center, radius) =>
          calls.push(['h', String(center.x), String(radius)].join(':')),
      },
      apexSystem: { queueCounterPulse: (center) => calls.push(['a', String(center.x)].join(':')) },
      targets: [
        target('inside', new THREE.Vector3(4, 500, 3)),
        target('owner', new THREE.Vector3(2, 2, 3)),
        target('outside', new THREE.Vector3(6.001, 2, 3)),
      ],
    });
    expect(calls).toEqual(['p:1:5', 'h:1:5', 'a:1']);
    expect(pushes.map(({ targetId }) => targetId)).toEqual(['inside']);
    expect(pushes[0]?.velocityDelta.y).toBe(0);
  });

  it('clears Kinetic and Seeker before movement while preserving outside ordinary projectiles and capacity', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const projectiles = new ProjectileSystem(track, capacity);
    const kinetic = ITEM_DEFINITIONS['kinetic-disc'].projectile;
    const seeker = ITEM_DEFINITIONS['seeker-drone'].projectile;
    expect(kinetic).toBeDefined();
    expect(seeker).toBeDefined();
    if (kinetic === undefined || seeker === undefined) return;

    const insideId = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner-a',
      direction: 'forward',
      config: kinetic,
      launch: launch(track, 0.2),
    });
    const outsideId = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner-b',
      direction: 'forward',
      config: kinetic,
      launch: launch(track, 0.45),
    });
    expect(insideId).not.toBeNull();
    expect(outsideId).not.toBeNull();
    const inside = projectiles.snapshots().find(({ id }) => id === insideId);
    expect(inside).toBeDefined();
    if (inside === undefined) return;
    projectiles.queueClearWithinRadius(
      inside.position.clone().add(new THREE.Vector3(0, 100, 0)),
      5,
    );
    expect(projectiles.update(1 / 60, [])).toEqual([]);
    expect(projectiles.snapshots().some(({ id }) => id === insideId)).toBe(false);
    expect(projectiles.snapshots().some(({ id }) => id === outsideId)).toBe(true);

    const seekerId = projectiles.spawn({
      itemId: 'seeker-drone',
      ownerId: 'owner-c',
      targetId: 'target',
      direction: 'forward',
      config: seeker,
      launch: launch(track, 0.6),
    });
    expect(seekerId).not.toBeNull();
    const seekerSnapshot = projectiles.snapshots().find(({ id }) => id === seekerId);
    expect(seekerSnapshot).toBeDefined();
    if (seekerSnapshot === undefined) return;
    const targetSnapshot: ProjectileTarget = {
      id: 'target',
      position: seekerSnapshot.position.clone().add(new THREE.Vector3(25, 0, 0)),
      velocity: new THREE.Vector3(),
      forward: new THREE.Vector3(0, 0, 1),
      finished: false,
    };
    projectiles.queueClearWithinRadius(
      seekerSnapshot.position.clone().add(new THREE.Vector3(0, -100, 0)),
      5,
    );
    expect(projectiles.update(1 / 60, [targetSnapshot])).toEqual([]);
    expect(projectiles.snapshots().some(({ id }) => id === seekerId)).toBe(false);
    expect(capacity.count()).toBe(1);
    projectiles.dispose();
    expect(capacity.count()).toBe(0);
  });

  it.each([
    { offset: 4.9999, cleared: true },
    { offset: 5, cleared: true },
    { offset: 5.0001, cleared: false },
  ])('uses the exact horizontal projectile-clear boundary at $offset m', ({ offset, cleared }) => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
    expect(config).toBeDefined();
    if (config === undefined) return;
    const id = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner',
      direction: 'forward',
      config,
      launch: launch(track),
    });
    expect(id).not.toBeNull();
    const position = projectiles.snapshots().find((snapshot) => snapshot.id === id)?.position;
    expect(position).toBeDefined();
    if (id === null || position === undefined) return;
    projectiles.queueClearWithinRadius(position.clone().add(new THREE.Vector3(offset, 100, 0)), 5);
    projectiles.update(1e-6, []);
    expect(projectiles.snapshots().some((snapshot) => snapshot.id === id)).toBe(!cleared);
    projectiles.dispose();
  });

  it('lets a queued hazard clear win the same frame over Slick trigger and preserves outside hazard', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const hazards = new HazardSystem(track, capacity);
    const center = track.curve.getPointAt(0.3);
    const inside = hazards.placeSlick('owner', center.clone());
    const outside = hazards.placeSlick('other', center.clone().add(new THREE.Vector3(0, 0, 5.001)));
    expect(inside).not.toBeNull();
    expect(outside).not.toBeNull();
    const actual = hazards.slickSnapshots().find(({ id }) => id === inside)?.position;
    expect(actual).toBeDefined();
    if (actual === undefined) return;
    hazards.queueClearWithinRadius(actual, 5);
    const overlapping: ProjectileTarget = {
      id: 'rival',
      position: actual.clone(),
      velocity: new THREE.Vector3(),
      forward: new THREE.Vector3(0, 0, 1),
      finished: false,
    };
    expect(hazards.update(0.01, [overlapping])).toEqual([]);
    expect(hazards.slickSnapshots().some(({ id }) => id === inside)).toBe(false);
    expect(hazards.slickSnapshots().some(({ id }) => id === outside)).toBe(true);
  });

  it('parses only approved explicit counter fixture values and fixture placement is one-shot', () => {
    expect(shockwaveCounterFromSearch('?testShockwaveCounter=kinetic')).toBe('kinetic');
    expect(shockwaveCounterFromSearch('?testShockwaveCounter=bogus')).toBeNull();
    expect(shockwaveCounterFromSearch('')).toBeNull();

    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const projectiles = new ProjectileSystem(track, capacity);
    const hazards = new HazardSystem(track, capacity);
    const apex = new ApexMissileSystem(track, projectiles);
    const fixture = new ShockwaveCounterFixture('slick');
    const player = track.curve.getPointAt(0.4).setY(0.72);
    const racers = [
      {
        id: 'player',
        lap: 0,
        trackProgress: 0.4,
        finished: false,
        finishTime: null,
        finishPlace: null,
      },
      {
        id: 'rival',
        lap: 0,
        trackProgress: 0.5,
        finished: false,
        finishTime: null,
        finishPlace: null,
      },
    ];
    const targets: ProjectileTarget[] = [
      {
        id: 'player',
        position: player,
        velocity: new THREE.Vector3(),
        forward: track.curve.getTangentAt(0.4),
        finished: false,
      },
    ];
    fixture.update(4.99, false, player, track, projectiles, hazards, apex, racers, targets);
    expect(hazards.activeCount()).toBe(0);
    fixture.update(5, false, player, track, projectiles, hazards, apex, racers, targets);
    fixture.update(10, false, player, track, projectiles, hazards, apex, racers, targets);
    expect(hazards.activeCount()).toBe(1);
    expect(fixture.badge()).toContain('ONE SLICK');
  });

  it('keeps pulse VFX finite and reset/disposal clears pending and presentation state', () => {
    const system = new ShockwaveSystem();
    expect(system.activate('player', new THREE.Vector3(0, 1, 0))).toBe(true);
    expect(system.pendingCount()).toBe(1);
    expect(system.visualCount()).toBe(1);
    system.advance(0.2);
    expect(system.visualCount()).toBe(1);
    system.advance(1);
    expect(system.visualCount()).toBe(0);
    expect(system.pendingCount()).toBe(1);
    system.reset();
    expect(system.pendingCount()).toBe(0);
    expect(system.visualCount()).toBe(0);
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });
});
