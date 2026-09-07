import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { SlickGroundSurface } from '../src/game/items/SlickGroundSurface';
import { createTrackScene } from '../src/game/track/createTrackScene';
import { HazardSystem, type HazardTarget } from '../src/game/items/HazardSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { IncomingSlickFixture } from '../src/game/items/IncomingSlickFixture';
import {
  incomingSlickFromSearch,
  forcedItemFromSearch,
  forcedItemForRacer,
} from '../src/game/items/ItemTestMode';
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
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('Missing fixture');
  return value;
}
function target(id = 'rival', distance = 0): HazardTarget {
  return {
    id,
    position: new THREE.Vector3(0, 0.72, distance),
    forward: new THREE.Vector3(0, 0, 1),
    velocity: new THREE.Vector3(),
    finished: false,
  };
}
function fixture(track = new StraightTrack()) {
  const capacity = new ItemPhysicsCapacity();
  const hazards = new HazardSystem(track, capacity);
  const items = new ItemSystem();
  const effects = new RacerEffects();
  const launch = {
    position: new THREE.Vector3(2, 0.72, 0),
    forward: new THREE.Vector3(0, 0, 1),
    velocity: new THREE.Vector3(3, 2, 100),
  };
  const runtime = { hazardSystem: hazards, projectileLaunch: launch };
  const give = () => {
    expect(items.acquire('player', 'slick-trap')).toBe(true);
    items.advance(0.85);
  };
  return { capacity, hazards, items, effects, launch, runtime, give, track };
}

describe('Slick deployment transactions', () => {
  it.each(['forward', 'backward'] as const)(
    'places %s ITEM behind, stationary, and consumes one charge',
    (direction) => {
      const f = fixture();
      f.give();
      expect(executeItemUse(f.items, f.effects, 'player', direction, f.runtime)).toBe('activated');
      expect(f.items.heldItem('player')).toBeNull();
      expect(f.items.canCollect('player')).toBe(true);
      const initial = required(f.hazards.slickSnapshots()[0]);
      expect(initial.position.toArray()).toEqual([2, 0.04, -1.75]);
      expect(initial.velocity.length()).toBe(0);
      f.hazards.update(5, []);
      expect(required(f.hazards.slickSnapshots()[0]).position).toEqual(initial.position);
      f.hazards.dispose();
      expect(f.capacity.count()).toBe(0);
    },
  );

  it('rejects invalid geometry, unavailable runtime and failed inventory commits without residue', () => {
    const f = fixture();
    f.give();
    expect(executeItemUse(f.items, f.effects, 'player', 'forward')).toBe('unsupported');
    for (const key of ['position', 'forward', 'velocity'] as const) {
      expect(
        f.hazards.spawnSlick('player', { ...f.launch, [key]: new THREE.Vector3(NaN, 0, 0) }),
      ).toBeNull();
    }
    expect(
      f.hazards.spawnSlick('player', { ...f.launch, forward: new THREE.Vector3() }),
    ).toBeNull();
    expect(f.hazards.spawnSlick('', f.launch)).toBeNull();
    const commit = vi.spyOn(f.items, 'commitUse').mockReturnValueOnce(false);
    expect(executeItemUse(f.items, f.effects, 'player', 'backward', f.runtime)).toBe('rejected');
    expect(commit).toHaveBeenCalledOnce();
    expect(f.items.heldItem('player')?.remainingCharges).toBe(1);
    expect(f.hazards.activeCount()).toBe(0);
    expect(f.hazards.group.children).toHaveLength(0);
    expect(f.capacity.count()).toBe(0);
    expect(() =>
      f.hazards.spawnSlick('player', f.launch, () => {
        throw new Error('commit');
      }),
    ).toThrow('commit');
    expect(f.capacity.count()).toBe(0);
  });

  it('shares all 40 projectile/reservation/Blast/Slick slots and preserves inventory on failure', () => {
    const f = fixture();
    const projectiles = new ProjectileSystem(f.track, f.capacity);
    for (let i = 0; i < 36; i++) {
      const itemId = i % 2 ? 'kinetic-disc' : 'seeker-drone';
      expect(
        projectiles.spawn({
          itemId,
          config: required(ITEM_DEFINITIONS[itemId].projectile),
          ownerId: 'other',
          targetId: 'rival',
          direction: 'forward',
          launch: f.launch,
        }),
      ).not.toBeNull();
    }
    expect(projectiles.reserveSlot()).not.toBeNull();
    f.hazards.placeBlastOrb('orb', new THREE.Vector3());
    f.hazards.placeSlick('other', new THREE.Vector3());
    f.hazards.placeSlick('other', new THREE.Vector3(0, 0, 10));
    expect(f.capacity.count()).toBe(40);
    f.give();
    expect(f.hazards.canPlaceSlick('player')).toBe(false);
    expect(executeItemUse(f.items, f.effects, 'player', 'forward', f.runtime)).toBe('rejected');
    expect(f.items.heldItem('player')?.remainingCharges).toBe(1);
    f.hazards.dispose();
    expect(f.capacity.count()).toBe(37);
    projectiles.dispose();
    expect(f.capacity.count()).toBe(0);
  });

  it.each([false, true])(
    'atomically replaces oldest at full capacity=%s; failed third preserves the pair',
    (full) => {
      const f = fixture();
      const first = required(f.hazards.placeSlick('player', new THREE.Vector3()));
      f.hazards.update(1, []);
      const second = required(f.hazards.placeSlick('player', new THREE.Vector3(0, 0, 5)));
      if (full) for (let i = 0; i < 38; i++) f.hazards.placeBlastOrb('other', new THREE.Vector3());
      const count = f.capacity.count(),
        before = f.hazards.slickSnapshots();
      f.give();
      expect(f.hazards.canPlaceSlick('player')).toBe(true);
      const commit = vi.spyOn(f.items, 'commitUse').mockImplementationOnce(() => {
        expect(f.hazards.slickSnapshots()).toEqual(before);
        expect(f.capacity.count()).toBe(count);
        return false;
      });
      expect(executeItemUse(f.items, f.effects, 'player', 'forward', f.runtime)).toBe('rejected');
      expect(f.hazards.slickSnapshots()).toEqual(before);
      expect(f.items.heldItem('player')?.remainingCharges).toBe(1);
      commit.mockRestore();
      expect(executeItemUse(f.items, f.effects, 'player', 'forward', f.runtime)).toBe('activated');
      const after = f.hazards.slickSnapshots();
      expect(after).toHaveLength(2);
      expect(after.map((s) => s.id)).not.toContain(first);
      expect(after[0]?.id).toBe(second);
      expect(after[1]?.remainingSeconds).toBe(12);
      expect(f.capacity.count()).toBe(count);
      expect(f.items.heldItem('player')).toBeNull();
      expect(f.hazards.remove(first)).toBe(false);
      f.hazards.dispose();
      expect(f.capacity.count()).toBe(0);
    },
  );

  it('keeps different owner caps independent and preserves the oldest through invalid/throwing replacement', () => {
    const f = fixture();
    for (const owner of ['player', 'other'])
      for (let i = 0; i < 2; i++) f.hazards.placeSlick(owner, new THREE.Vector3(0, 0, i * 5));
    const before = f.hazards.slickSnapshots();
    expect(f.hazards.placeSlick('player', new THREE.Vector3(Infinity, 0, 0))).toBeNull();
    expect(() =>
      f.hazards.spawnSlick('player', f.launch, () => {
        throw new Error('commit');
      }),
    ).toThrow('commit');
    expect(f.hazards.slickSnapshots()).toEqual(before);
    f.hazards.spawnSlick('player', f.launch);
    expect(f.hazards.slickSnapshots().filter((s) => s.ownerId === 'other')).toEqual(
      before.filter((s) => s.ownerId === 'other'),
    );
    expect(f.capacity.count()).toBe(4);
    f.hazards.dispose();
  });

  it('uses minimum inward correction at rails and preserves legal lateral placement', () => {
    const f = fixture();
    const outside = new THREE.Vector3(20, 3, 12);
    const contact = required(guardrailContact(f.track, outside, 1.1));
    f.hazards.placeSlick('player', outside);
    const p = required(f.hazards.slickSnapshots()[0]).position;
    expect(p.x).toBeCloseTo(outside.x + contact.inwardNormal.x * contact.penetration, 10);
    expect(p.z).toBe(12);
    expect(p.y).toBe(0.04);
    f.hazards.update(1, []);
    expect(f.hazards.activeCount()).toBe(1);
    f.hazards.dispose();
  });
});

describe('Slick lifetime, trigger and clear boundaries', () => {
  it.each([1.0999, 1.1, 1.1001])(
    'uses planar center distance %s without racer-radius expansion or speed threshold',
    (distance) => {
      const f = fixture();
      f.hazards.placeSlick('owner', new THREE.Vector3());
      const impacts = f.hazards.update(1 / 60, [target('rival', distance)]);
      expect(impacts).toHaveLength(distance <= 1.1 ? 1 : 0);
      if (distance <= 1.1) {
        expect(impacts[0]).toMatchObject({
          itemId: 'slick-trap',
          spinoutSeconds: 0.85,
          planarSpeedRetention: 0.6,
          preserveSpinMomentum: true,
        });
        expect(f.capacity.count()).toBe(0);
        expect(f.hazards.update(1, [target(), target('second')])).toEqual([]);
      }
      f.hazards.dispose();
    },
  );
  it('protects owner before 0.35 seconds and allows exact-boundary self-trigger', () => {
    const f = fixture();
    f.hazards.placeSlick('owner', new THREE.Vector3());
    expect(f.hazards.update(0.3499, [target('owner')])).toEqual([]);
    expect(f.hazards.update(0.0001, [target('owner')])).toHaveLength(1);
    expect(f.capacity.count()).toBe(0);
  });
  it('allows an immediate rival trigger, skipping finished and immune overlaps without consuming the patch', () => {
    const f = fixture();
    f.hazards.placeSlick('owner', new THREE.Vector3());
    const immune = { ...target('immune'), itemImmune: true };
    const finished = { ...target('finished'), finished: true };
    expect(f.hazards.update(0.01, [immune, finished, target('owner')])).toEqual([]);
    expect(f.hazards.activeCount()).toBe(1);
    const impacts = f.hazards.update(0.01, [
      immune,
      finished,
      target('owner'),
      target('first'),
      target('second'),
    ]);
    expect(impacts.map((i) => i.targetId)).toEqual(['first']);
    expect(f.hazards.group.children).toHaveLength(0);
  });
  it('expires at exactly 12 race seconds, freezes on zero/invalid dt, and creates no residue', () => {
    const f = fixture();
    f.hazards.placeSlick('owner', new THREE.Vector3());
    f.hazards.update(11.999, []);
    const before = f.hazards.slickSnapshots();
    for (const dt of [0, -1, NaN, Infinity]) expect(f.hazards.update(dt, [target()])).toEqual([]);
    expect(f.hazards.slickSnapshots()).toEqual(before);
    expect(f.hazards.update(0.001, [target()])).toEqual([]);
    expect(f.hazards.activeCount()).toBe(0);
    expect(f.capacity.count()).toBe(0);
    expect(f.hazards.group.children).toHaveLength(0);
  });
  it('clears both types in 3D at 5m before same-step contact/fuse, preserving outside hazards', () => {
    const f = fixture();
    const slick = required(f.hazards.placeSlick('owner', new THREE.Vector3()));
    const orb = required(f.hazards.placeBlastOrb('owner', new THREE.Vector3()));
    f.hazards.update(2.999, []);
    // Each center is 5m above the respective ground-bound hazard.
    f.hazards.queueClearWithinRadius(new THREE.Vector3(0, 5.04, 0), 5);
    f.hazards.queueClearWithinRadius(new THREE.Vector3(0, 5.4, 0), 5);
    f.hazards.placeSlick('outside', new THREE.Vector3(0, 0, 5.001));
    expect(f.hazards.update(0.01, [target()])).toEqual([]);
    expect(f.hazards.remove(slick)).toBe(false);
    expect(f.hazards.remove(orb)).toBe(false);
    expect(f.hazards.activeCount()).toBe(1);
    f.hazards.dispose();
    expect(f.capacity.count()).toBe(0);
  });
  it('disposes each patch and ring once through repeated remove, replacement, expiry and hub/restart cleanup', () => {
    const f = fixture();
    for (let i = 0; i < 50; i++) {
      const id = required(f.hazards.placeSlick('owner', new THREE.Vector3()));
      const mesh = f.hazards.group.children[0] as THREE.Mesh;
      const ring = mesh.children[0] as THREE.Mesh;
      const spies = [
        vi.spyOn(mesh.geometry, 'dispose'),
        vi.spyOn(mesh.material as THREE.Material, 'dispose'),
        vi.spyOn(ring.geometry, 'dispose'),
        vi.spyOn(ring.material as THREE.Material, 'dispose'),
      ];
      if (i % 3 === 0) f.hazards.update(12, []);
      else if (i % 3 === 1) f.hazards.remove(id);
      else f.hazards.dispose();
      f.hazards.remove(id);
      f.hazards.dispose();
      for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
      expect(f.capacity.count()).toBe(0);
      expect(f.hazards.group.children).toHaveLength(0);
    }
  });
});

describe('Slick acceptance fixture isolation', () => {
  it('opts in exactly, forces only player pickups, retries capacity, and resets with a new race', () => {
    for (const search of ['', '?testSlickAhead=0', '?testSlickAhead=true', '?testItem=slick-trap'])
      expect(incomingSlickFromSearch(search)).toBe(false);
    expect(incomingSlickFromSearch('?testSlickAhead=1')).toBe(true);
    expect(forcedItemFromSearch('?testItem=slick-trap')).toBe('slick-trap');
    expect(forcedItemForRacer('slick-trap', 'ai-1')).toBeNull();
    const f = fixture(new CircuitAlpha());
    const position = f.track.curve.getPointAt(0.3);
    const incoming = new IncomingSlickFixture(true);
    incoming.update(4.999, false, position, f.track, f.hazards);
    incoming.update(5, true, position, f.track, f.hazards);
    new IncomingSlickFixture(false).update(6, false, position, f.track, f.hazards);
    expect(f.capacity.count()).toBe(0);
    for (let i = 0; i < 40; i++) f.hazards.placeBlastOrb('full', position);
    incoming.update(5, false, position, f.track, f.hazards);
    expect(f.hazards.slickSnapshots()).toHaveLength(0);
    f.hazards.dispose();
    incoming.update(5.1, false, position, f.track, f.hazards);
    const p = required(f.hazards.slickSnapshots()[0]);
    const expected = f.track.curve.getPointAt(
      (f.track.project(position).progress + 8 / f.track.curve.getLength()) % 1,
    );
    expect(p.position.x).toBeCloseTo(expected.x);
    expect(p.position.z).toBeCloseTo(expected.z);
    incoming.update(6, false, position, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(1);
    f.hazards.dispose();
    new IncomingSlickFixture(true).update(5, false, position, f.track, f.hazards);
    expect(f.hazards.activeCount()).toBe(1);
    f.hazards.dispose();
  });
});

describe('Slick ground presentation on the existing Circuit Alpha', () => {
  it('rests above road, dirt, boost pads and ramp with the supporting surface normal', () => {
    const track = new CircuitAlpha();
    const scene = createTrackScene(track);
    const ground = new SlickGroundSurface(scene);
    const capacity = new ItemPhysicsCapacity();
    const hazards = new HazardSystem(track, capacity, (position) => ground.at(position));
    for (const progress of [0.1, 0.27, 0.45, 0.5, 0.815]) {
      const position = track.curve.getPointAt(progress);
      if (progress === 0.27) {
        const tangent = track.curve.getTangentAt(progress);
        position.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x), 3.75);
      }
      const surface = required(ground.at(position));
      hazards.placeSlick('owner', position);
      const patch = required(hazards.slickSnapshots().at(-1));
      expect(patch.position.distanceTo(surface.point)).toBeCloseTo(0.04, 7);
      if (progress === 0.5) {
        expect(patch.position.y).toBeGreaterThan(0.5);
        expect(surface.normal.y).toBeLessThan(1);
      }
      if (progress === 0.45 || progress === 0.815) expect(patch.position.y).toBeGreaterThan(0.14);
      const mesh = required(hazards.group.children.at(-1));
      expect(
        new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion).dot(surface.normal),
      ).toBeCloseTo(1, 7);
    }
    hazards.dispose();
    expect(capacity.count()).toBe(0);
    ground.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = object as THREE.Mesh;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) material.dispose();
      }
    });
    expect(new SlickGroundSurface(new THREE.Group()).at(new THREE.Vector3())).toBeNull();
  });
});
