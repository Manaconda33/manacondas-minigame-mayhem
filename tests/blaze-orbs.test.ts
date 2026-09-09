import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { BLAZE_ORB_CONFIG } from '../src/game/items/BlazeOrbs';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import {
  BLAZE_ORB_CADENCE_SECONDS,
  ITEM_ROULETTE_SECONDS,
  ItemSystem,
} from '../src/game/items/ItemSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

function launchAt(track: CircuitAlpha, index = 0) {
  const position = track.samples[index]?.clone();
  const forward = track.tangents[index]?.clone();
  if (position === undefined || forward === undefined) throw new Error('Missing track sample');
  position.y = 0.72;
  return { position, forward, velocity: new THREE.Vector3() };
}

function giveBlaze(items: ItemSystem): void {
  expect(items.acquire('player', 'blaze-orbs')).toBe(true);
  items.advance(ITEM_ROULETTE_SECONDS);
}

function fire(
  items: ItemSystem,
  effects: RacerEffects,
  projectiles: ProjectileSystem,
  launch: ReturnType<typeof launchAt>,
  direction: 'forward' | 'backward' = 'forward',
) {
  return executeItemUse(items, effects, 'player', direction, {
    projectileSystem: projectiles,
    projectileLaunch: launch,
  });
}

describe('Blaze Orbs amendment 2.13 gameplay', () => {
  it('pins the approved projectile values', () => {
    expect(BLAZE_ORB_CONFIG).toEqual({
      speedMetersPerSecond: 42,
      radiusMeters: 0.28,
      lifetimeSeconds: 3,
      maxWallBounces: 0,
      inheritedVelocityFactor: 0,
      maxInheritedSpeedMetersPerSecond: 0,
      ownerArmSeconds: 0.18,
      spinoutSeconds: 0.55,
    });
  });

  it('uses five charges with a pause-safe 0.55 second successful-shot cadence', () => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    const launch = launchAt(track, 24);
    giveBlaze(items);

    expect(fire(items, effects, projectiles, launch)).toBe('activated');
    expect(items.heldItem('player')).toEqual({ itemId: 'blaze-orbs', remainingCharges: 4 });
    expect(items.useCooldownRemaining('player')).toBeCloseTo(BLAZE_ORB_CADENCE_SECONDS);
    expect(fire(items, effects, projectiles, launch)).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(4);

    items.advance(0.3, true);
    expect(items.useCooldownRemaining('player')).toBeCloseTo(BLAZE_ORB_CADENCE_SECONDS);
    items.advance(BLAZE_ORB_CADENCE_SECONDS - 0.001);
    expect(fire(items, effects, projectiles, launch)).toBe('rejected');
    items.advance(0.001);
    expect(fire(items, effects, projectiles, launch)).toBe('activated');
    expect(items.heldItem('player')?.remainingCharges).toBe(3);

    for (let expected = 2; expected >= 0; expected -= 1) {
      items.advance(BLAZE_ORB_CADENCE_SECONDS);
      expect(fire(items, effects, projectiles, launch)).toBe('activated');
      expect(items.heldItem('player')?.remainingCharges ?? 0).toBe(expected);
    }
    expect(items.canCollect('player')).toBe(true);
    projectiles.dispose();
    effects.dispose();
  });

  it('starts no cadence and spends no charge when projectile commit fails', () => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    giveBlaze(items);
    const invalid = launchAt(track);
    invalid.forward.set(0, 0, 0);

    expect(fire(items, effects, projectiles, invalid)).toBe('rejected');
    expect(items.heldItem('player')).toEqual({ itemId: 'blaze-orbs', remainingCharges: 5 });
    expect(items.useCooldownRemaining('player')).toBe(0);
    expect(projectiles.activeCount()).toBe(0);
    projectiles.dispose();
    effects.dispose();
  });

  it('fires straight forward or backward at 42 m/s with no inherited kart velocity', () => {
    const track = new CircuitAlpha();
    const forwardSystem = new ProjectileSystem(track);
    const forwardLaunch = launchAt(track, 40);
    forwardLaunch.velocity.copy(forwardLaunch.forward).multiplyScalar(80);
    expect(
      forwardSystem.spawn({
        itemId: 'blaze-orbs',
        ownerId: 'player',
        direction: 'forward',
        config: BLAZE_ORB_CONFIG,
        launch: forwardLaunch,
      }),
    ).not.toBeNull();
    expect(forwardSystem.snapshots()[0]?.velocity.dot(forwardLaunch.forward)).toBeCloseTo(42);

    const backwardSystem = new ProjectileSystem(track);
    const backwardLaunch = launchAt(track, 40);
    backwardLaunch.velocity.copy(backwardLaunch.forward).multiplyScalar(80);
    expect(
      backwardSystem.spawn({
        itemId: 'blaze-orbs',
        ownerId: 'player',
        direction: 'backward',
        config: BLAZE_ORB_CONFIG,
        launch: backwardLaunch,
      }),
    ).not.toBeNull();
    expect(backwardSystem.snapshots()[0]?.velocity.dot(backwardLaunch.forward)).toBeCloseTo(-42);
    forwardSystem.dispose();
    backwardSystem.dispose();
  });

  it('uses the approved hot amber presentation with an ember trail and finite launch sparks', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    system.spawn({
      itemId: 'blaze-orbs',
      ownerId: 'player',
      direction: 'forward',
      config: BLAZE_ORB_CONFIG,
      launch: launchAt(track, 60),
    });

    const names: string[] = [];
    system.group.traverse((object) => names.push(object.name));
    expect(names).toContain('blaze-orb-hot-core');
    expect(names).toContain('blaze-orb-glow');
    expect(names).toContain('blaze-ember-trail');
    expect(names).toContain('blaze-spark-burst');
    system.update(0.2, []);
    const after: string[] = [];
    system.group.traverse((object) => after.push(object.name));
    expect(after).not.toContain('blaze-spark-burst');
    system.dispose();
  });

  it('protects the owner only during arming and Prismatic absorbs without an impact', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track, 80);
    system.spawn({
      itemId: 'blaze-orbs',
      ownerId: 'player',
      direction: 'forward',
      config: BLAZE_ORB_CONFIG,
      launch,
    });
    let shot = system.snapshots()[0];
    if (!shot) throw new Error('Missing Blaze shot');
    expect(
      system.update(0.01, [
        {
          id: 'player',
          position: shot.position.clone(),
          forward: launch.forward.clone(),
          finished: false,
        },
      ]),
    ).toEqual([]);

    system.update(0.2, []);
    shot = system.snapshots()[0];
    if (!shot) throw new Error('Blaze shot expired unexpectedly');
    let blocked: boolean | null = null;
    expect(
      system.update(0.001, [
        {
          id: 'rival',
          position: shot.position.clone(),
          forward: launch.forward.clone(),
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

  it('applies one 0.55 second hit and a later valid hit refreshes rather than stacks the spin', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const effects = new RacerEffects();
    const launch = launchAt(track, 100);
    const hitOnce = () => {
      system.spawn({
        itemId: 'blaze-orbs',
        ownerId: 'player',
        direction: 'forward',
        config: BLAZE_ORB_CONFIG,
        launch,
      });
      const shot = system.snapshots().at(-1);
      if (!shot) throw new Error('Missing Blaze shot');
      const impact = system.update(0.001, [
        {
          id: 'rival',
          position: shot.position.clone(),
          forward: launch.forward.clone(),
          finished: false,
        },
      ])[0];
      if (!impact) throw new Error('Expected Blaze impact');
      expect(impact.spinoutSeconds).toBe(0.55);
      effects.activateSpinout('rival', {
        id: 'blaze-orbs-spinout',
        label: 'Blaze Orbs',
        durationSeconds: impact.spinoutSeconds,
        direction: impact.spinDirection,
        turns: 1,
      });
    };

    hitOnce();
    effects.advance(0.3);
    expect(effects.spinoutRemainingSeconds('rival')).toBeCloseTo(0.25);
    hitOnce();
    expect(effects.spinoutRemainingSeconds('rival')).toBeCloseTo(0.55);
    system.dispose();
    effects.dispose();
  });

  it('is destroyed by Shockwave at the exact 5 m boundary before same-step movement', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const launch = launchAt(track, 130);
    system.spawn({
      itemId: 'blaze-orbs',
      ownerId: 'fixture',
      direction: 'forward',
      config: BLAZE_ORB_CONFIG,
      launch,
    });
    const shot = system.snapshots()[0];
    if (!shot) throw new Error('Missing Blaze shot');
    const center = shot.position.clone().add(new THREE.Vector3(5, 3, 0));
    system.queueClearWithinRadius(center, 5);
    expect(system.update(1 / 60, [])).toEqual([]);
    expect(system.activeCount()).toBe(0);

    system.spawn({
      itemId: 'blaze-orbs',
      ownerId: 'fixture',
      direction: 'forward',
      config: BLAZE_ORB_CONFIG,
      launch,
    });
    const outside = system.snapshots()[0];
    if (!outside) throw new Error('Missing outside-boundary Blaze shot');
    system.queueClearWithinRadius(outside.position.clone().add(new THREE.Vector3(5.001, 0, 0)), 5);
    system.update(1 / 600, []);
    expect(system.activeCount()).toBe(1);
    system.dispose();
  });

  it('destroys on its first guardrail contact and full shared capacity retains the shot', () => {
    const track = new CircuitAlpha();
    const wallSystem = new ProjectileSystem(track);
    const launch = launchAt(track, 100);
    const right = new THREE.Vector3(launch.forward.z, 0, -launch.forward.x).normalize();
    launch.position.addScaledVector(right, 6);
    launch.forward.copy(right);
    wallSystem.spawn({
      itemId: 'blaze-orbs',
      ownerId: 'player',
      direction: 'forward',
      config: BLAZE_ORB_CONFIG,
      launch,
    });
    for (let frame = 0; frame < 120 && wallSystem.activeCount() > 0; frame += 1)
      wallSystem.update(1 / 60, []);
    expect(wallSystem.activeCount()).toBe(0);
    wallSystem.dispose();

    const capacitySystem = new ProjectileSystem(track);
    const kinetic = ITEM_DEFINITIONS['kinetic-disc'].projectile;
    if (!kinetic) throw new Error('Missing Kinetic config');
    const capacityLaunch = launchAt(track, 0);
    for (let index = 0; index < 40; index += 1) {
      expect(
        capacitySystem.spawn({
          itemId: 'kinetic-disc',
          ownerId: `owner-${String(index)}`,
          direction: 'forward',
          config: kinetic,
          launch: capacityLaunch,
        }),
      ).not.toBeNull();
    }
    const items = new ItemSystem();
    const effects = new RacerEffects();
    giveBlaze(items);
    expect(fire(items, effects, capacitySystem, capacityLaunch)).toBe('rejected');
    expect(items.heldItem('player')).toEqual({ itemId: 'blaze-orbs', remainingCharges: 5 });
    expect(items.useCooldownRemaining('player')).toBe(0);
    capacitySystem.dispose();
    effects.dispose();
  });
});
