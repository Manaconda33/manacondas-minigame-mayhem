import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import {
  ARC_HAMMER_CONFIG,
  ARC_HAMMER_PROJECTILE_CONFIG,
  hammerBounceVelocity,
  hammerLaunchVelocity,
} from '../src/game/items/ArcHammers';
import {
  ArcHammerCounterFixture,
  arcHammerCounterFromSearch,
} from '../src/game/items/ArcHammerCounterFixture';
import { ITEM_ROULETTE_SECONDS, ItemSystem } from '../src/game/items/ItemSystem';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

function launchAt(track: CircuitAlpha, index = 24, y = 0.72) {
  const position = track.samples[index]?.clone();
  const forward = track.tangents[index]?.clone();
  if (position === undefined || forward === undefined) throw new Error('Missing track sample');
  position.y = y;
  return { position, forward, velocity: new THREE.Vector3() };
}

function flatSurface(position: THREE.Vector3) {
  return {
    point: new THREE.Vector3(position.x, 0, position.z),
    normal: new THREE.Vector3(0, 1, 0),
  };
}

function giveHammers(items: ItemSystem): void {
  expect(items.acquire('player', 'arc-hammers')).toBe(true);
  items.advance(ITEM_ROULETTE_SECONDS);
}

describe('Kinetic Arc Hammers amendment 2.16 gameplay', () => {
  it('exposes only the governed counter routes', () => {
    expect(arcHammerCounterFromSearch('?testItem=shockwave&testArcHammerCounter=shockwave')).toBe(
      'shockwave',
    );
    expect(
      arcHammerCounterFromSearch(
        '?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected',
      ),
    ).toBe('protected');
    expect(
      arcHammerCounterFromSearch(
        '?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=expired',
      ),
    ).toBe('expired');
    expect(arcHammerCounterFromSearch('?testItem=arc-hammers')).toBeNull();
  });

  it('pins the approved configuration and launch math', () => {
    expect(ARC_HAMMER_PROJECTILE_CONFIG).toEqual({
      speedMetersPerSecond: 36,
      radiusMeters: 0.36,
      lifetimeSeconds: 2.25,
      maxWallBounces: 0,
      inheritedVelocityFactor: 0.2,
      maxInheritedSpeedMetersPerSecond: 10,
      ownerArmSeconds: 0.18,
      spinoutSeconds: 0.85,
    });

    const forward = new THREE.Vector3(0, 0, 1);
    const inherited = new THREE.Vector3(0, 0, 50);
    expect(hammerLaunchVelocity(forward, inherited, 'forward')).toEqual(
      new THREE.Vector3(0, 11, 38),
    );
    expect(hammerLaunchVelocity(forward, inherited, 'backward')).toEqual(
      new THREE.Vector3(0, 11, -34),
    );
    expect(hammerBounceVelocity(new THREE.Vector3(3, -8, 4), new THREE.Vector3(0, 1, 0))).toEqual(
      new THREE.Vector3(2.34, 4.4, 3.12),
    );
  });

  it('uses five charges, commits only successful throws, and enforces the 0.35-second cadence', () => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    const launch = launchAt(track);
    giveHammers(items);

    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: launch,
      }),
    ).toBe('activated');
    expect(items.heldItem('player')).toEqual({ itemId: 'arc-hammers', remainingCharges: 4 });
    expect(items.useCooldownRemaining('player')).toBeCloseTo(ARC_HAMMER_CONFIG.cadenceSeconds);
    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: launch,
      }),
    ).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(4);

    items.advance(ARC_HAMMER_CONFIG.cadenceSeconds - 0.001);
    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: launch,
      }),
    ).toBe('rejected');
    items.advance(0.001);
    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: launch,
      }),
    ).toBe('activated');

    for (let expected = 2; expected >= 0; expected -= 1) {
      items.advance(ARC_HAMMER_CONFIG.cadenceSeconds);
      expect(
        executeItemUse(items, effects, 'player', 'forward', {
          projectileSystem: projectiles,
          projectileLaunch: launch,
        }),
      ).toBe('activated');
      expect(items.heldItem('player')?.remainingCharges ?? 0).toBe(expected);
    }
    expect(items.canCollect('player')).toBe(true);
    expect(projectiles.activeCount()).toBe(5);
    projectiles.dispose();
    effects.dispose();
  });

  it('keeps failed launch and full-capacity attempts atomic', () => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    giveHammers(items);
    const invalid = launchAt(track);
    invalid.forward.set(0, 0, 0);
    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: invalid,
      }),
    ).toBe('rejected');
    expect(items.heldItem('player')).toEqual({ itemId: 'arc-hammers', remainingCharges: 5 });
    expect(items.useCooldownRemaining('player')).toBe(0);

    const launch = launchAt(track);
    for (let index = 0; index < 40; index += 1) {
      expect(
        projectiles.spawn({
          itemId: 'kinetic-disc',
          ownerId: `fixture-${String(index)}`,
          direction: 'forward',
          config: {
            speedMetersPerSecond: 42,
            radiusMeters: 0.32,
            lifetimeSeconds: 9,
            maxWallBounces: 3,
            inheritedVelocityFactor: 0.35,
            maxInheritedSpeedMetersPerSecond: 8,
            ownerArmSeconds: 0.18,
            spinoutSeconds: 0.85,
          },
          launch,
        }),
      ).not.toBeNull();
    }
    expect(projectiles.activeCount()).toBe(40);
    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        projectileSystem: projectiles,
        projectileLaunch: launch,
      }),
    ).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(5);
    projectiles.dispose();
    effects.dispose();
  });

  it('integrates ballistic y motion independently of boost or surface type', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track, undefined, undefined, flatSurface);
    const launch = launchAt(track, 24, 8);
    launch.velocity.copy(launch.forward).multiplyScalar(80);
    system.spawn({
      itemId: 'arc-hammers',
      ownerId: 'player',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch,
    });
    const before = system.snapshots()[0];
    if (!before) throw new Error('Missing Hammer');
    system.update(0.25, []);
    const after = system.snapshots()[0];
    if (!after) throw new Error('Hammer expired unexpectedly');
    expect(after.position.y).toBeCloseTo(before.position.y + 2, 5);
    expect(after.velocity.y).toBeCloseTo(5, 5);
    expect(after.velocity.dot(launch.forward)).toBeCloseTo(38, 5);
    expect(after.bounceCount).toBe(0);
    system.dispose();
  });

  it('uses the supporting surface for one rebound, emits original cues, and cleans up', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track, undefined, undefined, flatSurface);
    system.spawn({
      itemId: 'arc-hammers',
      ownerId: 'player',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: launchAt(track),
    });

    let bounced = false;
    for (let frame = 0; frame < 120; frame += 1) {
      system.update(1 / 60, []);
      const snapshot = system.snapshots()[0];
      if (snapshot?.bounceCount === 1) {
        bounced = true;
        expect(snapshot.position.y).toBeGreaterThan(0.35);
        expect(snapshot.velocity.y).toBeGreaterThan(0);
        expect(Math.hypot(snapshot.velocity.x, snapshot.velocity.z)).toBeCloseTo(36 * 0.78, 1);
        const names: string[] = [];
        system.group.traverse((object) => names.push(object.name));
        expect(names).toContain('arc-hammer-bounce-ring');
        break;
      }
    }
    expect(bounced).toBe(true);
    for (let frame = 0; frame < 120 && system.activeCount() > 0; frame += 1)
      system.update(1 / 60, []);
    expect(system.activeCount()).toBe(0);
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });

  it('applies the standard spin on a valid hit and absorbs on immunity', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    system.spawn({
      itemId: 'arc-hammers',
      ownerId: 'player',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: launchAt(track, 80, 6),
    });
    let shot = system.snapshots()[0];
    if (!shot) throw new Error('Missing Hammer');
    system.update(0.2, []);
    shot = system.snapshots()[0];
    if (!shot) throw new Error('Hammer expired unexpectedly');
    const impacts = system.update(0.001, [
      {
        id: 'rival',
        position: shot.position.clone(),
        forward: new THREE.Vector3(0, 0, 1),
        finished: false,
      },
    ]);
    expect(impacts).toHaveLength(1);
    expect(impacts[0]).toMatchObject({ itemId: 'arc-hammers', spinoutSeconds: 0.85 });
    expect(system.activeCount()).toBe(0);

    system.spawn({
      itemId: 'arc-hammers',
      ownerId: 'player',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: launchAt(track, 100, 6),
    });
    shot = system.snapshots()[0];
    if (!shot) throw new Error('Missing immune-test Hammer');
    system.update(0.2, []);
    shot = system.snapshots()[0];
    if (!shot) throw new Error('Immune-test Hammer expired unexpectedly');
    let blocked = false;
    expect(
      system.update(0.001, [
        {
          id: 'immune',
          position: shot.position.clone(),
          forward: new THREE.Vector3(0, 0, 1),
          finished: false,
          itemImmune: true,
          onItemContact: (_item, wasBlocked) => {
            blocked = wasBlocked;
          },
        },
      ]),
    ).toEqual([]);
    expect(blocked).toBe(true);
    expect(system.activeCount()).toBe(0);
    system.dispose();
  });

  it('protects the owner during arming, then permits a later self-hit', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    system.spawn({
      itemId: 'arc-hammers',
      ownerId: 'player',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: launchAt(track, 120, 6),
    });
    let shot = system.snapshots()[0];
    if (!shot) throw new Error('Missing Hammer');
    expect(
      system.update(0.01, [
        {
          id: 'player',
          position: shot.position.clone(),
          forward: new THREE.Vector3(0, 0, 1),
          finished: false,
        },
      ]),
    ).toEqual([]);
    system.update(0.2, []);
    shot = system.snapshots()[0];
    if (!shot) throw new Error('Hammer expired unexpectedly');
    const impacts = system.update(0.001, [
      {
        id: 'player',
        position: shot.position.clone(),
        forward: new THREE.Vector3(0, 0, 1),
        finished: false,
      },
    ]);
    expect(impacts[0]?.targetId).toBe('player');
    system.dispose();
  });

  it('clears at the Shockwave boundary before movement and has a finite model/trail lifecycle', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    system.spawn({
      itemId: 'arc-hammers',
      ownerId: 'player',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: launchAt(track, 140, 6),
    });
    const shot = system.snapshots()[0];
    if (!shot) throw new Error('Missing Hammer');
    const names: string[] = [];
    system.group.traverse((object) => names.push(object.name));
    expect(names).toContain('arc-hammer-double-headed');
    expect(names).toContain('arc-hammer-graphite-core');
    expect(names).toContain('arc-hammer-cyan-edge');
    expect(names).toContain('arc-hammer-amber-edge');
    expect(names).toContain('arc-hammer-finite-trail');

    system.queueClearWithinRadius(shot.position, ARC_HAMMER_CONFIG.shockwaveClearRadiusMeters);
    expect(system.update(1 / 60, [])).toEqual([]);
    expect(system.activeCount()).toBe(0);
    system.update(0.2, []);
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });

  it('verifies the governed protected and expired counter encounters', () => {
    for (const phase of ['protected', 'expired'] as const) {
      const track = new CircuitAlpha();
      const system = new ProjectileSystem(track);
      const fixture = new ArcHammerCounterFixture(phase);
      const launch = launchAt(track, 160, 0.72);
      const before = {
        velocity: new THREE.Vector3(),
        protection: phase === 'protected' ? 6 : 0,
        immune: phase === 'protected',
        spinId: null,
        spinSeconds: 0,
      };
      const player: ProjectileTarget = {
        id: 'player',
        position: launch.position,
        forward: launch.forward,
        finished: false,
        itemImmune: phase === 'protected',
        onItemContact: (_item, blocked, objectId) => {
          fixture.observeContact(objectId, blocked, before);
        },
      };
      let protection = 6;
      for (let frame = 0; frame < 50 && system.activeCount() === 0; frame += 1) {
        fixture.update(1 / 60, {
          track,
          projectiles: system,
          targets: [player],
          held: 'prismatic-invincibility',
          protection,
        });
        if (phase === 'expired') protection = 0;
      }
      const shot = system.snapshots()[0];
      if (!shot) throw new Error(`Missing ${phase} counter Hammer`);
      player.position.copy(shot.position);
      system.update(1 / 60, [player]);
      fixture.afterProjectiles(system, {
        ...before,
        spinId: phase === 'expired' ? 'arc-hammers-spinout' : null,
        spinSeconds: phase === 'expired' ? ARC_HAMMER_CONFIG.spinoutSeconds : 0,
      });
      expect(fixture.badge()).toContain('PASS');
      fixture.cancel(system);
      system.dispose();
    }
  });
});
