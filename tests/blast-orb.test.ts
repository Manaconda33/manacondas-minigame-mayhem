import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { HazardSystem, type HazardTarget } from '../src/game/items/HazardSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { IncomingBlastOrbFixture } from '../src/game/items/IncomingBlastOrbFixture';
import { incomingBlastOrbFromSearch } from '../src/game/items/ItemTestMode';
import { CircuitAlpha, type TrackProjection } from '../src/game/track/CircuitAlpha';
import { guardrailContact } from '../src/game/track/GuardrailSystem';

class StraightTrack extends CircuitAlpha {
  public override project(position: THREE.Vector3): TrackProjection {
    return {
      index: 0,
      progress: 0,
      point: new THREE.Vector3(0, 0, position.z),
      tangent: new THREE.Vector3(0, 0, 1),
      lateralOffset: position.x,
      lateralDistance: Math.abs(position.x),
      surface: 'asphalt',
    };
  }
}
const required = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error('Missing fixture');
  return value;
};
const target = (id: string, z = 1, speed = 0, x = 0): HazardTarget => ({
  id,
  position: new THREE.Vector3(x, 0.72, z),
  velocity: new THREE.Vector3(0, 0, speed),
  forward: new THREE.Vector3(0, 0, 1),
  finished: false,
});
function fixture(track = new StraightTrack()) {
  const capacity = new ItemPhysicsCapacity();
  const projectiles = new ProjectileSystem(track, capacity);
  const hazards = new HazardSystem(track, capacity);
  const launch = {
    position: new THREE.Vector3(0, 0.72, 0),
    forward: new THREE.Vector3(0, 0, 1),
    velocity: new THREE.Vector3(0, 0, 100),
  };
  return { capacity, projectiles, hazards, launch, track };
}

describe('Blast Orb directional deployment and shared budget', () => {
  it.each(['forward', 'backward'] as const)(
    'consumes only successful %s use, inherits capped velocity and stops under drag',
    (direction) => {
      const f = fixture();
      const items = new ItemSystem();
      const effects = new RacerEffects();
      items.acquire('player', 'blast-orb');
      items.advance(0.85);
      expect(
        executeItemUse(items, effects, 'player', direction, {
          hazardSystem: f.hazards,
          projectileLaunch: f.launch,
        }),
      ).toBe('activated');
      expect(items.heldItem('player')).toBeNull();
      const initial = required(f.hazards.snapshots()[0]);
      expect(initial.position.z).toBe(direction === 'forward' ? 1.75 : -1.75);
      expect(initial.velocity.z).toBeCloseTo(direction === 'forward' ? 18.2 : 2.4);
      f.hazards.update(1, []);
      const after = required(f.hazards.snapshots()[0]);
      expect(after.velocity.z).toBeCloseTo(direction === 'forward' ? 12.2 : 0);
      expect(after.position.z).toBeCloseTo(direction === 'forward' ? 16.95 : -1.27);
      expect(after.position.y).toBe(0.4);
      f.hazards.dispose();
      f.projectiles.dispose();
      expect(f.capacity.count()).toBe(0);
    },
  );

  it('preserves charges for invalid/full-capacity spawns and rolls back a failed commit', () => {
    const f = fixture();
    const items = new ItemSystem();
    const effects = new RacerEffects();
    items.acquire('player', 'blast-orb');
    items.advance(0.85);
    const runtime = { hazardSystem: f.hazards, projectileLaunch: f.launch };
    expect(f.hazards.spawnBlastOrb('', 'forward', f.launch)).toBeNull();
    expect(
      f.hazards.spawnBlastOrb('player', 'forward', { ...f.launch, forward: new THREE.Vector3() }),
    ).toBeNull();
    expect(
      f.hazards.spawnBlastOrb('player', 'forward', {
        ...f.launch,
        position: new THREE.Vector3(NaN, 0, 0),
      }),
    ).toBeNull();
    const commit = vi.spyOn(items, 'commitUse').mockReturnValueOnce(false);
    expect(executeItemUse(items, effects, 'player', 'forward', runtime)).toBe('rejected');
    expect(commit).toHaveBeenCalledOnce();
    expect(f.capacity.count()).toBe(0);
    expect(f.hazards.group.children).toHaveLength(0);
    for (let i = 0; i < 40; i++)
      expect(f.hazards.placeBlastOrb('fixture', new THREE.Vector3())).not.toBeNull();
    expect(executeItemUse(items, effects, 'player', 'forward', runtime)).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(1);
    expect(executeItemUse(items, effects, 'player', 'forward')).toBe('unsupported');
    f.hazards.dispose();
    f.projectiles.dispose();
  });

  it('shares 40 slots across Kinetic, Seeker, Apex reservations and Blast, releasing only owned slots', () => {
    const f = fixture();
    const apex = new ApexMissileSystem(f.track, f.projectiles);
    for (let i = 0; i < 37; i++) {
      expect(
        f.projectiles.spawn({
          itemId: i % 2 ? 'seeker-drone' : 'kinetic-disc',
          ownerId: 'player',
          targetId: 'rival',
          direction: 'forward',
          config: required(ITEM_DEFINITIONS[i % 2 ? 'seeker-drone' : 'kinetic-disc'].projectile),
          launch: f.launch,
        }),
      ).not.toBeNull();
    }
    const racers = [
      {
        id: 'player',
        lap: 0,
        trackProgress: 0,
        finished: false,
        finishPlace: null,
        finishTime: null,
      },
      {
        id: 'rival',
        lap: 0,
        trackProgress: 0.1,
        finished: false,
        finishPlace: null,
        finishTime: null,
      },
    ];
    expect(apex.launch('player', f.launch.position, racers)).toBe(true);
    for (let i = 0; i < 2; i++)
      expect(f.hazards.placeBlastOrb('owner', new THREE.Vector3())).not.toBeNull();
    expect(f.capacity.count()).toBe(40);
    expect(f.hazards.placeBlastOrb('owner', new THREE.Vector3())).toBeNull();
    expect(f.projectiles.reserveSlot()).toBeNull();
    f.hazards.dispose();
    expect(f.capacity.count()).toBe(38);
    apex.dispose();
    expect(f.capacity.count()).toBe(37);
    f.projectiles.dispose();
    expect(f.capacity.count()).toBe(0);
  });
});

describe('Blast fuse, contacts, immunity and containment', () => {
  it('detonates at exactly three seconds, pauses all hazard/VFX state, and resolves one heavy blast', () => {
    const f = fixture();
    f.hazards.placeBlastOrb('owner', new THREE.Vector3());
    const victims = [
      target('owner'),
      target('edge', 0, 0, 4),
      target('outside', 0, 0, 4.001),
      { ...target('finished'), finished: true },
      { ...target('immune'), itemImmune: true },
    ];
    expect(f.hazards.update(2.999, victims)).toEqual([]);
    const before = f.hazards.snapshots();
    f.hazards.update(0, victims);
    f.hazards.update(-1, victims);
    f.hazards.update(NaN, victims);
    expect(f.hazards.snapshots()).toEqual(before);
    const impacts = f.hazards.update(0.001, [...victims, required(victims[0])]);
    expect(impacts.map((x) => x.targetId).sort()).toEqual(['edge', 'owner']);
    expect(impacts.every((x) => x.spinoutSeconds === 1.2)).toBe(true);
    expect(f.hazards.activeCount()).toBe(0);
    expect(f.capacity.count()).toBe(0);
    const visible = f.hazards.group.children.length;
    f.hazards.update(0, []);
    expect(f.hazards.group.children).toHaveLength(visible);
    expect(f.hazards.update(5, victims)).toEqual([]);
    expect(f.hazards.group.children).toHaveLength(0);
    f.hazards.dispose();
  });

  it.each([7.999, 8, 8.001])('uses the direct closing-speed threshold at %s m/s', (speed) => {
    const f = fixture();
    f.hazards.placeBlastOrb('owner', new THREE.Vector3());
    const impacts = f.hazards.update(0.001, [target('rival', 1, -speed)]);
    expect(impacts.length).toBe(speed >= 8 ? 1 : 0);
    expect(f.hazards.activeCount()).toBe(speed >= 8 ? 0 : 1);
    f.hazards.dispose();
  });

  it('does not treat separating or tangential high-speed overlap as strong impact', () => {
    const f = fixture();
    f.hazards.placeBlastOrb('owner', new THREE.Vector3());
    expect(
      f.hazards.update(0.1, [
        target('separating', 1, 30),
        { ...target('tangent', 1), velocity: new THREE.Vector3(30, 0, 0) },
      ]),
    ).toEqual([]);
    expect(f.hazards.activeCount()).toBe(1);
    f.hazards.dispose();
  });

  it('excludes owner from an early rival-triggered blast but allows collateral', () => {
    const f = fixture();
    f.hazards.placeBlastOrb('owner', new THREE.Vector3());
    const impacts = f.hazards.update(0.1, [
      target('owner', 0, 40),
      target('rival', 1, -8),
      target('collateral', 3),
    ]);
    expect(impacts.map((x) => x.targetId).sort()).toEqual(['collateral', 'rival']);
    f.hazards.dispose();
  });

  it('allows later self-hit at the 0.35-second boundary', () => {
    const f = fixture();
    f.hazards.placeBlastOrb('owner', new THREE.Vector3());
    const owner = target('owner', 1, -8);
    expect(f.hazards.update(0.349, [owner])).toEqual([]);
    expect(f.hazards.update(0.001, [owner]).map((x) => x.targetId)).toEqual(['owner']);
    expect(f.hazards.activeCount()).toBe(0);
    f.hazards.dispose();
  });

  it('contains orbs at rails, removes outward speed and keeps the fuse running', () => {
    const f = fixture();
    f.launch.position.x = 8;
    f.launch.forward.set(1, 0, 0);
    f.launch.velocity.set(30, 0, 0);
    f.hazards.spawnBlastOrb('owner', 'forward', f.launch);
    expect(f.hazards.update(1, [])).toEqual([]);
    const orb = required(f.hazards.snapshots()[0]);
    expect(orb.position.x).toBeLessThanOrEqual(9.25 - 0.4);
    expect(orb.velocity.x).toBe(0);
    expect(orb.remainingSeconds).toBeCloseTo(2);
    f.hazards.dispose();
  });

  it.each([0.01, 0.24, 0.45, 0.81, 0.98])(
    'contains moving orbs on actual Circuit Alpha at %s',
    (u) => {
      const f = fixture(new CircuitAlpha());
      f.launch.position.copy(f.track.curve.getPointAt(u));
      f.launch.forward.copy(f.track.curve.getTangentAt(u));
      f.launch.velocity.copy(f.launch.forward).multiplyScalar(34.32);
      f.hazards.spawnBlastOrb('owner', 'forward', f.launch);
      for (let i = 0; i < 180; i++) {
        f.hazards.update(1 / 60, []);
        for (const orb of f.hazards.snapshots()) {
          expect([orb.position.x, orb.position.y, orb.position.z].every(Number.isFinite)).toBe(
            true,
          );
          expect(guardrailContact(f.track, orb.position, 0.4)?.penetration ?? 0).toBeLessThan(0.01);
        }
      }
      expect(f.capacity.count()).toBe(0);
      f.hazards.dispose();
    },
  );
});

describe('Blast counter ordering, fixture and cleanup', () => {
  it('clears inclusively within 5 m in 3D before expiry or qualifying impact, without a blast', () => {
    const f = fixture();
    f.hazards.placeBlastOrb('owner', new THREE.Vector3());
    f.hazards.update(2.999, []);
    const p = required(f.hazards.snapshots()[0]).position;
    f.hazards.queueClearWithinRadius(p.clone().add(new THREE.Vector3(0, 5.001, 0)), 5);
    f.hazards.update(0.0001, []);
    expect(f.hazards.activeCount()).toBe(1);
    f.hazards.queueClearWithinRadius(p.clone().add(new THREE.Vector3(0, 5, 0)), 5);
    expect(f.hazards.update(1, [target('rival', 1, -40)])).toEqual([]);
    expect(f.hazards.group.children).toHaveLength(0);
    expect(f.capacity.count()).toBe(0);
    f.hazards.dispose();
  });

  it('keeps the incoming fixture opt-in, one-shot, capacity-aware and absent after player finish', () => {
    expect(incomingBlastOrbFromSearch('')).toBe(false);
    expect(incomingBlastOrbFromSearch('?testItem=blast-orb')).toBe(false);
    expect(incomingBlastOrbFromSearch('?testBlastOrbIncoming=true')).toBe(false);
    expect(incomingBlastOrbFromSearch('?testBlastOrbIncoming=1')).toBe(true);
    const f = fixture(new CircuitAlpha());
    const p = f.track.curve.getPointAt(0.1);
    new IncomingBlastOrbFixture(false).update(100, false, p, f.track, f.hazards);
    const incoming = new IncomingBlastOrbFixture(true);
    incoming.update(4.999, false, p, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(0);
    incoming.update(5, true, p, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(0);
    const slots = Array.from({ length: 40 }, () => required(f.capacity.acquire()));
    incoming.update(5, false, p, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(0);
    slots.forEach((id) => {
      f.capacity.release(id);
    });
    incoming.update(5.1, false, p, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(1);
    const orb = required(f.hazards.snapshots()[0]);
    expect(orb.ownerId).toBe('incoming-blast-fixture');
    expect(orb.position.distanceTo(p)).toBeGreaterThan(5);
    f.hazards.update(3, []);
    incoming.update(30, false, p, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(0);
    f.hazards.dispose();
  });

  it('returns meshes/materials/capacity to baseline over 100 restarts and explicit removals', () => {
    const f = fixture();
    for (let i = 0; i < 100; i++) {
      const id = required(f.hazards.placeBlastOrb('owner', new THREE.Vector3()));
      const orb = required(f.hazards.group.children[0]) as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.Material
      >;
      const geometry = vi.spyOn(orb.geometry, 'dispose');
      const material = vi.spyOn(orb.material, 'dispose');
      if (i % 2) {
        expect(f.hazards.remove(id)).toBe(true);
        expect(f.hazards.remove(id)).toBe(false);
      } else f.hazards.update(3, []);
      f.hazards.dispose();
      expect(geometry).toHaveBeenCalledOnce();
      expect(material).toHaveBeenCalledOnce();
      expect(f.hazards.group.children).toHaveLength(0);
      expect(f.capacity.count()).toBe(0);
    }
  });
});
