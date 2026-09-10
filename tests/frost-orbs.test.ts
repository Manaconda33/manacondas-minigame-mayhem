import { requireValue } from './requireValue';
import { describe, it, expect, vi } from 'vitest';
import { Vector3 } from 'three';
import { FROST, FROST_ORB_CONFIG as config } from '../src/game/items/FrostOrbs';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { FrostVisual } from '../src/game/items/FrostVisual';

function setup() {
  const track = new CircuitAlpha();
  const projectiles = new ProjectileSystem(track);
  const position = requireValue(track.samples[24]).clone().setY(0.72);
  const forward = requireValue(track.tangents[24]).clone().setY(0).normalize();
  const launch = { position, forward, velocity: forward.clone().multiplyScalar(30) };
  const items = new ItemSystem();
  const effects = new RacerEffects();
  items.acquire('player', 'frost-orbs');
  items.advance(1);
  const fire = (direction: 'forward' | 'backward' = 'forward') =>
    executeItemUse(items, effects, 'player', direction, {
      projectileSystem: projectiles,
      projectileLaunch: launch,
    });
  const spawn = () =>
    projectiles.spawn({
      itemId: 'frost-orbs',
      ownerId: 'player',
      direction: 'forward',
      config,
      launch,
    });
  return { track, projectiles, position, forward, launch, items, effects, fire, spawn };
}

describe('Frost governed behavior', () => {
  it('pins approved values and consumes precisely three valid shots at the pause-safe cadence', () => {
    expect(config).toEqual({
      speedMetersPerSecond: 42,
      radiusMeters: 0.28,
      lifetimeSeconds: 3,
      maxWallBounces: 0,
      inheritedVelocityFactor: 0,
      maxInheritedSpeedMetersPerSecond: 0,
      ownerArmSeconds: 0.18,
      spinoutSeconds: 0,
      impactEffect: 'frost',
    });
    const r = setup();
    for (let left = 2; left >= 0; left--) {
      expect(r.fire()).toBe('activated');
      expect(r.items.heldItem('player')?.remainingCharges ?? 0).toBe(left);
      expect(r.fire()).toBe('rejected');
      r.items.advance(5, true);
      expect(r.items.useCooldownRemaining('player')).toBe(FROST.cadence);
      r.items.advance(0.549);
      expect(r.fire()).toBe('rejected');
      r.items.advance(0.001);
    }
    expect(r.items.canCollect('player')).toBe(true);
    r.projectiles.dispose();
  });
  it('preserves charge and capacity for invalid use, saturation, and failed inventory commit', () => {
    const r = setup();
    r.launch.forward.set(0, 0, 0);
    expect(r.fire()).toBe('rejected');
    r.launch.forward.copy(requireValue(r.track.tangents[24]));
    const slots = [];
    for (let i = 0; i < 40; i++) slots.push(requireValue(r.projectiles.reserveSlot()));
    expect(r.fire()).toBe('rejected');
    slots.forEach((id) => {
      r.projectiles.releaseSlot(id);
    });
    vi.spyOn(r.items, 'commitUse').mockReturnValue(false);
    expect(r.fire()).toBe('rejected');
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.items.useCooldownRemaining('player')).toBe(0);
    expect(r.items.heldItem('player')?.remainingCharges).toBe(3);
    r.projectiles.dispose();
  });
  it.each(['forward', 'backward'] as const)(
    'flies %s at 42m/s with no moving-owner inheritance',
    (direction) => {
      const r = setup();
      expect(r.fire(direction)).toBe('activated');
      const p = requireValue(r.projectiles.snapshots()[0]);
      expect(p.velocity.length()).toBeCloseTo(42);
      expect(p.velocity.dot(r.forward)).toBeCloseTo(direction === 'forward' ? 42 : -42);
      expect(p.ownerArmSeconds).toBe(0.18);
      expect(p.remainingSeconds).toBe(3);
      expect(r.projectiles.group.getObjectByName('frost-faceted-orb')).toBeDefined();
      expect(r.projectiles.group.getObjectByName('frost-crystal-trail')).toBeDefined();
      r.projectiles.dispose();
    },
  );
  it.each([4.9999, 5, 5.0001])(
    'counters horizontal radius %s before contact even at different elevations',
    (distance) => {
      const r = setup();
      r.spawn();
      const p = requireValue(r.projectiles.snapshots()[0]);
      const center = p.position.clone().add(new Vector3(distance, 30, 0));
      r.projectiles.queueClearWithinRadius(center, 5);
      const contact = vi.fn();
      const hits = r.projectiles.update(0.001, [
        {
          id: 'rival',
          position: p.position,
          forward: r.forward,
          finished: false,
          onItemContact: contact,
        },
      ]);
      expect(hits.length).toBe(distance <= 5 ? 0 : 1);
      expect(contact).toHaveBeenCalledTimes(distance <= 5 ? 0 : 1);
      expect(r.projectiles.activeCount()).toBe(0);
      r.projectiles.dispose();
    },
  );
  it.each([false, true])(
    'excludes finished racers and absorbs immune racers without Frost, immune=%s',
    (immune) => {
      const r = setup();
      r.spawn();
      const p = requireValue(r.projectiles.snapshots()[0]);
      expect(
        r.projectiles.update(0.001, [
          { id: 'rival', position: p.position, forward: r.forward, finished: true },
        ]),
      ).toEqual([]);
      const apply = vi.fn();
      const hits = r.projectiles.update(
        0.001,
        [
          {
            id: 'rival',
            position: p.position,
            forward: r.forward,
            finished: false,
            itemImmune: immune,
          },
        ],
        apply,
      );
      expect(hits.length).toBe(immune ? 0 : 1);
      expect(apply).toHaveBeenCalledTimes(immune ? 0 : 1);
      if (!immune) expect(hits[0]).toMatchObject({ effect: 'frost', spinoutSeconds: 0 });
      r.projectiles.dispose();
    },
  );
  it('refreshes cumulative handling independently of boosts, immunity and spin; expiry never restores velocity', () => {
    const e = new RacerEffects();
    e.activateFrost('r');
    e.advanceFrost(0.7);
    e.activateFrost('r');
    expect(e.frostState('r')).toEqual({ stacks: 2, remainingSeconds: 1.2 });
    e.advanceFrost(10, true);
    expect(e.driveModifiers('r').steeringMultiplier).toBeCloseTo(0.64);
    e.activateTemporaryBoost('r', {
      id: 'nitro',
      label: 'Nitro',
      durationSeconds: 2.4,
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
    });
    e.activateSpinout('r', {
      id: 'spin',
      label: 'Spin',
      durationSeconds: 0.85,
      direction: 1,
      turns: 1,
    });
    e.setItemImmune('r', true);
    expect(e.activateFrost('r')).toBe(false);
    expect(e.frostState('r')?.stacks).toBe(2);
    e.advanceFrost(1.199);
    expect(e.frostState('r')).not.toBeNull();
    e.advanceFrost(0.001);
    expect(e.frostState('r')).toBeNull();
    expect(e.driveModifiers('r').speedCapMultiplier).toBe(1.18);
    expect(e.spinoutState('r')).not.toBeNull();
    e.setItemImmune('r', false);
    e.activateFrost('r');
    expect(e.frostState('r')?.stacks).toBe(1);
    e.clear('r');
    expect(e.frostState('r')).toBeNull();
    e.activateFrost('r');
    e.dispose();
    expect(e.frostState('r')).toBeNull();
  });
  it('exposes changed target velocity to a subsequently processed real Seeker in the same update', () => {
    const r = setup();
    r.spawn();
    const target = {
      id: 'rival',
      position: requireValue(r.projectiles.snapshots()[0]).position,
      forward: r.forward,
      velocity: r.forward.clone().multiplyScalar(60),
      finished: false,
    };
    r.projectiles.spawn({
      itemId: 'seeker-drone',
      ownerId: 'player',
      targetId: 'rival',
      direction: 'forward',
      config: {
        ...requireValue(ITEM_DEFINITIONS['seeker-drone'].projectile),
        speedMetersPerSecond: 56,
      },
      launch: r.launch,
    });
    r.projectiles.update(0.01, [target], (impact) => {
      if (impact.effect === 'frost') target.velocity.multiplyScalar(0.55);
    });
    expect(target.velocity.length()).toBeCloseTo(33);
    expect(
      requireValue(
        r.projectiles.snapshots().find((p) => p.itemId === 'seeker-drone'),
      ).velocity.length(),
    ).toBeCloseTo(55.8);
    r.projectiles.dispose();
  });
  it('honors owner arming and exact expiry without movement during pause', () => {
    const r = setup();
    r.spawn();
    const original = requireValue(r.projectiles.snapshots()[0]);
    const owner = {
      id: 'player',
      position: original.position.clone(),
      forward: r.forward,
      finished: false,
    };
    expect(r.projectiles.update(0, [owner])).toEqual([]);
    expect(r.projectiles.snapshots()[0]).toEqual(original);
    expect(r.projectiles.update(0.179, [owner])).toEqual([]);
    owner.position.copy(requireValue(r.projectiles.snapshots()[0]).position);
    expect(r.projectiles.update(0.001, [owner])[0]?.effect).toBe('frost');
    r.spawn();
    expect(r.projectiles.update(3, [])).toEqual([]);
    expect(r.projectiles.activeCount()).toBe(0);
    r.projectiles.dispose();
  });
  it('destroys on a first guardrail and releases repeated impact resources', () => {
    const r = setup();
    r.launch.forward.set(r.forward.z, 0, -r.forward.x);
    r.spawn();
    for (let i = 0; i < 90; i++) r.projectiles.update(1 / 60, []);
    expect(r.projectiles.snapshots()).toHaveLength(0);
    r.launch.forward.copy(r.forward);
    for (let i = 0; i < 200; i++) {
      const id = requireValue(r.spawn());
      r.projectiles.remove(id, true);
    }
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.projectiles.group.children.length).toBeLessThanOrEqual(40);
    r.projectiles.update(0.2, []);
    expect(r.projectiles.group.children).toHaveLength(0);
    r.projectiles.dispose();
  });
  it('bounds following visuals, freezes animation at pause, follows elevated racers, fades and releases at expiry', () => {
    const v = new FrostVisual();
    const position = new Vector3(3, 8, 9);
    v.update([{ id: 'r', position, remaining: 1.2 }], 0.1);
    const cluster = requireValue(v.group.children[0]);
    expect(cluster.position).toEqual(position);
    expect(cluster.children).toHaveLength(8);
    const rotation = cluster.rotation.y;
    position.x += 10;
    v.update([{ id: 'r', position, remaining: 1.2 }], 0);
    expect(cluster.rotation.y).toBe(rotation);
    expect(cluster.position).toEqual(position);
    v.update([], 0.1);
    expect(v.group.children).toHaveLength(0);
    v.dispose();
  });
});
