import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { ITEM_ROULETTE_SECONDS, ItemSystem } from '../src/game/items/ItemSystem';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { CircuitAlpha, type TrackProjection } from '../src/game/track/CircuitAlpha';

function kineticConfig() {
  const config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
  if (config === undefined) throw new Error('Kinetic Disc projectile configuration is missing.');
  return config;
}

function launchAt(track: CircuitAlpha, index = 0) {
  const position = track.samples[index]?.clone();
  const forward = track.tangents[index]?.clone();
  if (position === undefined || forward === undefined) throw new Error('Missing track sample');
  position.y = 0.72;
  return { position, forward, velocity: new THREE.Vector3() };
}

describe('Ricochet Kinetic Disc projectile runtime', () => {
  it('pins the governed Kinetic Disc projectile values in configuration', () => {
    expect(kineticConfig()).toEqual({
      speedMetersPerSecond: 42,
      radiusMeters: 0.32,
      lifetimeSeconds: 9,
      maxWallBounces: 3,
      inheritedVelocityFactor: 0.35,
      maxInheritedSpeedMetersPerSecond: 8,
      ownerArmSeconds: 0.18,
      spinoutSeconds: 0.85,
    });
  });

  it('launches forward or backward and inherits only bounded racer velocity', () => {
    const track = new CircuitAlpha();
    const forwardSystem = new ProjectileSystem(track);
    const launch = launchAt(track, 10);
    launch.velocity.copy(launch.forward).multiplyScalar(50);
    expect(
      forwardSystem.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'player',
        direction: 'forward',
        config: kineticConfig(),
        launch,
      }),
    ).not.toBeNull();
    const forward = forwardSystem.snapshots()[0];
    expect(forward).toBeDefined();
    expect(forward?.velocity.dot(launch.forward)).toBeCloseTo(44.8);
    expect(forward?.velocity.dot(launch.forward)).toBeLessThanOrEqual(44.8 + 1e-9);

    const backwardSystem = new ProjectileSystem(track);
    expect(
      backwardSystem.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'player',
        direction: 'backward',
        config: kineticConfig(),
        launch: { ...launch, velocity: new THREE.Vector3() },
      }),
    ).not.toBeNull();
    const backward = backwardSystem.snapshots()[0];
    expect(backward?.velocity.dot(launch.forward)).toBeCloseTo(-42);
    forwardSystem.dispose();
    backwardSystem.dispose();
  });

  it('ricochets from shared guardrails no more than three times before destruction', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track, 100);
    const right = new THREE.Vector3(launch.forward.z, 0, -launch.forward.x).normalize();
    launch.forward.copy(right);
    system.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: kineticConfig(),
      launch,
    });

    let maximumBounces = 0;
    for (let frame = 0; frame < 360 && system.activeCount() > 0; frame += 1) {
      system.update(1 / 60, []);
      const snapshot = system.snapshots()[0];
      if (snapshot !== undefined) maximumBounces = Math.max(maximumBounces, snapshot.bounceCount);
    }

    expect(maximumBounces).toBe(3);
    expect(system.activeCount()).toBe(0);
  });

  it('protects the owner only during arming, then allows a later self-hit', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track, 150);
    system.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: kineticConfig(),
      launch,
    });

    let snapshot = system.snapshots()[0];
    if (snapshot === undefined) throw new Error('Projectile missing');
    expect(
      system.update(0.01, [
        {
          id: 'player',
          position: snapshot.position.clone(),
          forward: launch.forward.clone(),
          finished: false,
        },
      ]),
    ).toEqual([]);

    system.update(0.2, []);
    snapshot = system.snapshots()[0];
    if (snapshot === undefined) throw new Error('Projectile expired unexpectedly');
    const impacts = system.update(0.001, [
      {
        id: 'player',
        position: snapshot.position.clone(),
        forward: launch.forward.clone(),
        finished: false,
      },
    ]);
    expect(impacts).toHaveLength(1);
    expect(impacts[0]).toMatchObject({ targetId: 'player', spinoutSeconds: 0.85 });
    expect(system.activeCount()).toBe(0);
  });

  it('destroys on racer impact and cleans up on lifetime expiry', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track, 220);
    system.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: kineticConfig(),
      launch,
    });
    const snapshot = system.snapshots()[0];
    if (snapshot === undefined) throw new Error('Projectile missing');
    const impacts = system.update(0.001, [
      {
        id: 'ai-1',
        position: snapshot.position.clone(),
        forward: launch.forward.clone(),
        finished: false,
      },
    ]);
    expect(impacts).toHaveLength(1);
    expect(impacts[0]?.itemId).toBe('kinetic-disc');
    expect(system.activeCount()).toBe(0);

    system.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: kineticConfig(),
      launch,
    });
    system.update(9.1, []);
    expect(system.activeCount()).toBe(0);
    system.dispose();
  });

  it('consumes Kinetic Disc only after a projectile successfully spawns', () => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    items.acquire('player', 'kinetic-disc');
    items.advance(ITEM_ROULETTE_SECONDS);

    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: launchAt(track, 0),
      }),
    ).toBe('activated');
    expect(items.heldItem('player')).toBeNull();
    expect(projectiles.activeCount()).toBe(1);
    projectiles.dispose();
  });
});

describe('projectile lifecycle and contact regressions', () => {
  it('reflects an oblique incidence once, preserves speed and separates from the rail', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track, 100);
    const tangent = launch.forward.clone();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    launch.position.addScaledVector(right, 6);
    launch.forward.copy(right).addScaledVector(tangent, 0.5).normalize();
    system.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: kineticConfig(),
      launch,
    });
    let reflected = false;
    for (let frame = 0; frame < 30; frame += 1) {
      const before = system.snapshots()[0];
      if (before === undefined) throw new Error('Missing disc before reflection');
      system.update(1 / 60, []);
      const after = system.snapshots()[0];
      if (after === undefined) throw new Error('Disc destroyed before first bounce');
      if (after.bounceCount === 1) {
        expect(after.velocity.length()).toBeCloseTo(42);
        expect(after.velocity.dot(right)).toBeLessThan(0);
        const projection = track.project(after.position);
        const normal = new THREE.Vector3(-projection.tangent.z, 0, projection.tangent.x);
        const expected = before.velocity.clone().reflect(normal);
        expect(after.velocity.distanceTo(expected)).toBeLessThan(0.15);
        for (let index = 0; index < 5; index += 1) system.update(1 / 60, []);
        expect(system.snapshots()[0]?.bounceCount).toBe(1);
        reflected = true;
        break;
      }
    }
    expect(reflected).toBe(true);
    system.dispose();
  });

  it('freezes at zero simulation time, expires at nine seconds, and disposes live objects', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const spawn = () =>
      system.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'player',
        direction: 'forward',
        config: kineticConfig(),
        launch: launchAt(track),
      });
    spawn();
    const before = system.snapshots();
    for (let frame = 0; frame < 600; frame += 1) system.update(0, []);
    expect(system.snapshots()).toEqual(before);
    expect(system.update(Number.NaN, [])).toEqual([]);
    system.update(9, []);
    expect(system.activeCount()).toBe(0);
    spawn();
    spawn();
    expect(system.group.children).toHaveLength(2);
    system.dispose();
    expect(system.activeCount()).toBe(0);
    expect(system.group.children).toHaveLength(0);
  });

  it('rejects failed launches and full capacity without consuming the inventory', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    items.acquire('player', 'kinetic-disc');
    items.advance(ITEM_ROULETTE_SECONDS);
    const launch = launchAt(track);
    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: system,
        projectileLaunch: { ...launch, forward: new THREE.Vector3() },
      }),
    ).toBe('rejected');
    expect(items.canCollect('player')).toBe(false);
    for (let index = 0; index < 40; index += 1) {
      expect(
        system.spawn({
          itemId: 'kinetic-disc',
          ownerId: 'player',
          direction: 'forward',
          config: kineticConfig(),
          launch,
        }),
      ).not.toBeNull();
    }
    expect(
      executeItemUse(items, effects, 'player', 'backward', {
        projectileSystem: system,
        projectileLaunch: launch,
      }),
    ).toBe('rejected');
    expect(system.activeCount()).toBe(40);
    expect(items.heldItem('player')).toEqual({ itemId: 'kinetic-disc', remainingCharges: 1 });
    system.dispose();
  });
});

// Isolate closing speed from corner interception; real Circuit Alpha reflection
// is exercised separately below. The same guardrail contact math still runs.
class StraightProjectileTestTrack extends CircuitAlpha {
  public override project(position: THREE.Vector3): TrackProjection {
    return {
      index: 0,
      progress: 0,
      point: new THREE.Vector3(0, 0, position.z),
      tangent: new THREE.Vector3(0, 0, 1),
      lateralDistance: Math.abs(position.x),
      lateralOffset: position.x,
      surface: 'asphalt',
    };
  }
}

describe('approved Kinetic Disc catch-up tuning', () => {
  it.each([
    ['Manaconda', 'aa-09', 1],
    ['Krios', 'aa-10', 1],
    ['Krios with maximum AI allowance', 'aa-10', 1.04],
  ] as const)(
    'catches %s from 30 meters behind on a clear straight within three seconds',
    (_name, id, allowance) => {
      const track = new StraightProjectileTestTrack();
      const system = new ProjectileSystem(track);
      const launch = {
        position: new THREE.Vector3(0, 0.72, 0),
        forward: new THREE.Vector3(0, 0, 1),
        velocity: new THREE.Vector3(),
      };
      launch.velocity
        .copy(launch.forward)
        .multiplyScalar(createKartTuning(characterById('aa-09').stats).maxSpeed);
      const targetSpeed = createKartTuning(characterById(id).stats).maxSpeed * allowance;
      const target = {
        id: 'ai-target',
        position: launch.position.clone().addScaledVector(launch.forward, 30),
        forward: launch.forward.clone(),
        finished: false,
      };
      system.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'player',
        direction: 'forward',
        config: kineticConfig(),
        launch,
      });
      let hit = false;
      for (let frame = 0; frame < 180; frame += 1) {
        target.position.addScaledVector(target.forward, targetSpeed / 60);
        const impacts = system.update(1 / 60, [target]);
        if (impacts.length > 0) {
          expect(impacts[0]?.targetId).toBe('ai-target');
          hit = true;
          break;
        }
      }
      expect(hit).toBe(true);
      expect(system.activeCount()).toBe(0);
      system.dispose();
    },
  );

  it('preserves shallow-angle curved-track reflection and speed without forcing opposite rails', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track);
    const tangent = launch.forward.clone();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    launch.forward
      .multiplyScalar(Math.cos(Math.PI / 12))
      .addScaledVector(right, Math.sin(Math.PI / 12));
    launch.velocity
      .copy(launch.forward)
      .multiplyScalar(createKartTuning(characterById('aa-09').stats).maxSpeed);
    system.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: kineticConfig(),
      launch,
    });
    const sides: number[] = [];
    let previousBounce = 0;
    for (let frame = 0; frame < 540; frame += 1) {
      system.update(1 / 60, []);
      const shot = system.snapshots()[0];
      if (shot === undefined) break;
      expect(shot.velocity.length()).toBeCloseTo(44.8);
      if (shot.bounceCount > previousBounce) {
        expect(shot.bounceCount - previousBounce).toBe(1);
        sides.push(Math.sign(track.project(shot.position).lateralOffset));
        previousBounce = shot.bounceCount;
      }
    }
    expect(sides.length).toBe(3);
    expect(sides[1]).toBe(sides[0]);
    expect(system.activeCount()).toBe(0);
    system.dispose();
  });
});
