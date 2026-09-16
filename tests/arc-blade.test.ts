import { afterEach, describe, expect, it, vi } from 'vitest';
import { Vector3 } from 'three';
import {
  ARC,
  ARC_BLADE_CONFIG,
  ARC_OUTBOUND_DISTANCE,
  arcCoordinates,
  type ArcEvent,
} from '../src/game/items/ArcBlade';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ArcBladeAudio } from '../src/audio/ArcBladeAudio';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { requireValue } from './requireValue';

/** Straight test corridor isolates exact contact boundaries from Circuit Alpha curvature. */
class StraightTrack extends CircuitAlpha {
  public override project(position: Vector3) {
    return {
      index: 0,
      progress: 0,
      point: new Vector3(0, 0, position.z),
      tangent: new Vector3(0, 0, 1),
      lateralOffset: position.x,
      lateralDistance: Math.abs(position.x),
      surface: 'asphalt' as const,
    };
  }
}
const systems: ProjectileSystem[] = [];
afterEach(() => {
  systems.splice(0).forEach((s) => {
    s.dispose();
  });
  vi.restoreAllMocks();
});
function rig(track: CircuitAlpha = new StraightTrack(), index = 24) {
  const events: ArcEvent[] = [];
  const projectiles = new ProjectileSystem(track, undefined, (e) => events.push(e));
  systems.push(projectiles);
  const position =
    track instanceof StraightTrack
      ? new Vector3(0, 0.72, 0)
      : requireValue(track.samples[index]).clone().setY(0.72);
  const forward =
    track instanceof StraightTrack
      ? new Vector3(0, 0, 1)
      : requireValue(track.tangents[index]).clone().setY(0).normalize();
  const launch = { position, forward, velocity: forward.clone().multiplyScalar(30) };
  const owner: ProjectileTarget = {
    id: 'player',
    position: position.clone(),
    forward: forward.clone(),
    finished: false,
  };
  const items = new ItemSystem();
  const effects = new RacerEffects();
  items.acquire('player', 'arc-blade');
  items.advance(1);
  const fire = (direction: 'forward' | 'backward' = 'forward') =>
    executeItemUse(items, effects, 'player', direction, {
      projectileSystem: projectiles,
      projectileLaunch: launch,
    });
  const spawn = (id = 'player') =>
    requireValue(
      projectiles.spawn({
        itemId: 'arc-blade',
        ownerId: id,
        direction: 'forward',
        config: ARC_BLADE_CONFIG,
        launch,
      }),
    );
  return { track, events, projectiles, position, forward, launch, owner, items, fire, spawn };
}
const rival = (id: string, x: number, z: number, immune = false): ProjectileTarget => ({
  id,
  position: new Vector3(x, 0.72, z),
  forward: new Vector3(0, 0, 1),
  finished: false,
  itemImmune: immune,
});
const turnTime = ARC_OUTBOUND_DISTANCE / 42;

describe('Arc Blade governed flight and transactions', () => {
  it('pins approved values and three charges, exact cadence and pause', () => {
    expect(ARC_BLADE_CONFIG).toEqual({
      speedMetersPerSecond: 42,
      radiusMeters: 0.32,
      lifetimeSeconds: 4,
      maxWallBounces: 0,
      inheritedVelocityFactor: 0,
      maxInheritedSpeedMetersPerSecond: 0,
      ownerArmSeconds: 0.18,
      spinoutSeconds: 0.85,
    });
    expect(ARC).toEqual({ cadence: 0.55, range: 30, bow: 2, returnSpeed: 56, hitRadius: 1.37 });
    const r = rig();
    for (let left = 2; left >= 0; left--) {
      expect(r.fire()).toBe('activated');
      expect(r.items.heldItem('player')?.remainingCharges ?? 0).toBe(left);
      expect(r.fire()).toBe('rejected');
      r.items.advance(8, true);
      expect(r.items.useCooldownRemaining('player')).toBe(0.55);
      r.items.advance(0.549999);
      expect(r.fire()).toBe('rejected');
      r.items.advance(0.000001);
    }
    expect(r.projectiles.activeCount()).toBe(3);
    expect(r.items.canCollect('player')).toBe(true);
  });

  it('rejects invalid vectors, wall-overlap launch, saturation and failed commit without cues or charges', () => {
    const r = rig();
    const audio = vi.spyOn(ArcBladeAudio.prototype, 'play');
    r.launch.forward.set(0, 0, 0);
    expect(r.fire()).toBe('rejected');
    r.launch.forward.set(0, 0, 1);
    r.launch.position.x = 9;
    expect(r.fire()).toBe('rejected');
    r.launch.position.x = 0;
    r.launch.velocity.x = NaN;
    expect(r.fire()).toBe('rejected');
    r.launch.velocity.x = 0;
    const slots = Array.from({ length: 40 }, () => requireValue(r.projectiles.reserveSlot()));
    expect(r.fire()).toBe('rejected');
    slots.forEach((id) => {
      r.projectiles.releaseSlot(id);
    });
    vi.spyOn(r.items, 'commitUse').mockReturnValue(false);
    expect(r.fire()).toBe('rejected');
    expect(r.items.heldItem('player')?.remainingCharges).toBe(3);
    expect(r.items.useCooldownRemaining('player')).toBe(0);
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.projectiles.group.children).toHaveLength(0);
    expect(audio).not.toHaveBeenCalled();
    expect(r.events.some((e) => e.kind === 'launch')).toBe(false);
  });

  it('uses the same forward launch under reverse intent and ignores owner speed', () => {
    const a = rig();
    const b = rig();
    b.launch.velocity.set(-300, 80, -500);
    expect(a.fire('forward')).toBe('activated');
    expect(b.fire('backward')).toBe('activated');
    expect(a.projectiles.snapshots()[0]).toEqual(b.projectiles.snapshots()[0]);
    expect(requireValue(a.projectiles.snapshots()[0]).velocity.length()).toBeCloseTo(42, 8);
  });

  it('advances by 42m/s of arc length, reaches a 2m bow and exact launch-fixed 30m turn', () => {
    const r = rig();
    r.spawn();
    const initial = requireValue(r.projectiles.snapshots()[0]);
    let measured = 0;
    let previous = initial.position;
    for (let i = 0; i < 100; i++) {
      r.projectiles.update(turnTime / 100, [r.owner]);
      const snapshot = requireValue(r.projectiles.snapshots()[0]);
      measured += snapshot.position.distanceTo(previous);
      previous = snapshot.position;
      if (i === 49) {
        expect(snapshot.position.x).toBeCloseTo(2, 7);
        expect(snapshot.position.z - initial.position.z).toBeCloseTo(15, 7);
      }
    }
    const p = requireValue(r.projectiles.snapshots()[0]);
    expect(measured).toBeCloseTo(42 * turnTime, 3);
    expect(p.position.x).toBeCloseTo(0, 8);
    expect(p.position.z - initial.position.z).toBeCloseTo(30, 8);
    expect(p.arcPhase).toBe('return');
    expect(r.events.filter((e) => e.kind === 'return')).toHaveLength(1);
    const coordinates = arcCoordinates(42 * 0.25);
    expect(coordinates.forward).toBeLessThan(42 * 0.25);
  });

  it('returns toward moving owners at 56m/s with bounded displacement; catch never refunds', () => {
    const r = rig();
    r.fire();
    r.projectiles.update(turnTime, [r.owner]);
    for (let i = 0; i < 4; i++) {
      const before = requireValue(r.projectiles.snapshots()[0]);
      r.owner.position.x = i % 2 ? 4 : -4;
      r.projectiles.update(0.02, [r.owner]);
      const after = requireValue(r.projectiles.snapshots()[0]);
      expect(after.position.distanceTo(before.position)).toBeLessThanOrEqual(56 * 0.02 + 1e-8);
      expect(after.velocity.length()).toBeCloseTo(56, 7);
    }
    r.projectiles.update(1, [r.owner]);
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.events.at(-1)?.kind).toBe('catch');
    expect(r.items.heldItem('player')?.remainingCharges).toBe(2);
    expect(r.projectiles.group.getObjectByName('arc-catch-flash')).toBeDefined();
  });

  it.each([false, true])(
    'safely catches an owner at the 1.37m boundary even immune=%s',
    (immune) => {
      const r = rig();
      r.spawn();
      r.projectiles.update(turnTime, [r.owner]);
      const p = requireValue(r.projectiles.snapshots()[0]);
      const owner = {
        ...r.owner,
        itemImmune: immune,
        position: p.position.clone().add(new Vector3(0, 100, -1.37)),
      };
      const contact = vi.fn();
      expect(r.projectiles.update(1e-6, [{ ...owner, onItemContact: contact }])).toEqual([]);
      expect(contact).not.toHaveBeenCalled();
      expect(r.events.at(-1)?.kind).toBe('catch');
    },
  );

  it.each([1.36999, 1.37, 1.37001])('checks the exact return catch distance %s', (distance) => {
    const r = rig();
    r.spawn();
    r.projectiles.update(turnTime, [r.owner]);
    const p = requireValue(r.projectiles.snapshots()[0]);
    r.owner.position.copy(p.position).z -= distance;
    r.projectiles.update(1e-8, [r.owner]);
    expect(r.projectiles.activeCount()).toBe(distance <= 1.37 ? 0 : 1);
  });

  it('honors owner arming below/at 0.18 seconds without granting earlier segment contact', () => {
    const r = rig();
    r.spawn();
    r.projectiles.update(0.179, [r.owner]);
    r.owner.position.copy(requireValue(r.projectiles.snapshots()[0]).position);
    expect(r.projectiles.update(0.000999, [r.owner])).toEqual([]);
    expect(r.projectiles.update(0.000001, [r.owner])).toHaveLength(1);
    expect(r.projectiles.update(0.02, [r.owner])).toEqual([]);
  });

  it('hits multiple rivals once per leg, independently for simultaneous throws', () => {
    const r = rig();
    r.spawn();
    r.spawn();
    const targets = [r.owner, rival('farther', 1, 18), rival('nearer', 1, 12)];
    const hits = r.projectiles.update(1.4, targets);
    for (const id of ['nearer', 'farther'])
      expect(hits.filter((h) => h.targetId === id)).toHaveLength(4);
    expect(
      hits.every(
        (h) =>
          h.spinoutSeconds === 0.85 &&
          h.effect === undefined &&
          h.planarSpeedRetention === undefined,
      ),
    ).toBe(true);
    expect(hits.slice(0, 2).map((h) => h.targetId)).toEqual(['nearer', 'farther']);
    expect(r.projectiles.activeCount()).toBe(0);
  });

  it('requires separation after turnaround and never rearms a hit within the return leg', () => {
    const r = rig();
    r.spawn();
    const target = rival('turnaround', 0, 32.07);
    expect(r.projectiles.update(turnTime, [r.owner, target])).toHaveLength(1);
    expect(r.projectiles.update(0.01, [r.owner, target])).toEqual([]);
    expect(r.projectiles.update(0.04, [r.owner, target])).toEqual([]);
    r.owner.position.z = 80;
    expect(r.projectiles.update(0.12, [r.owner, target])).toHaveLength(1);
    r.owner.position.z = 0;
    expect(r.projectiles.update(0.2, [r.owner, target])).toEqual([]);
  });

  it('a nearer immune interception destroys the blade before farther targets regardless of array order', () => {
    const r = rig();
    r.spawn();
    const hit = vi.fn();
    expect(
      r.projectiles.update(0.6, [
        r.owner,
        { ...rival('far', 1, 18), onItemContact: hit },
        rival('immune', 1, 12, true),
      ]),
    ).toEqual([]);
    expect(hit).not.toHaveBeenCalled();
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.events.at(-1)).toMatchObject({ kind: 'absorbed', targetId: 'immune' });
  });

  it('ignores finished rivals and finite-invalid targets, preserving flight', () => {
    const r = rig();
    r.spawn();
    const hits = r.projectiles.update(0.6, [
      r.owner,
      { ...rival('finished', 1, 12, true), finished: true },
      rival('invalid', NaN, 18),
    ]);
    expect(hits).toEqual([]);
    expect(r.projectiles.activeCount()).toBe(1);
  });

  it.each(['rival', 'owner'] as const)(
    'wall wins a coincident return %s contact and prevents contact beyond it',
    (who) => {
      const r = rig();
      r.spawn();
      r.projectiles.update(turnTime, [r.owner]);
      const p = requireValue(r.projectiles.snapshots()[0]);
      r.owner.position.copy(p.position).x = who === 'owner' ? 10.3 : 50;
      const target = rival('beyond-wall', 10.3, p.position.z);
      const contact = vi.fn();
      expect(
        r.projectiles.update(0.2, [
          { ...r.owner, onItemContact: contact },
          { ...target, onItemContact: contact },
        ]),
      ).toEqual([]);
      expect(contact).not.toHaveBeenCalled();
      expect(r.events.at(-1)?.kind).toBe('wall');
    },
  );

  it('valid owner catch precedes a coincident immune-rival interception', () => {
    const r = rig();
    r.spawn();
    r.projectiles.update(turnTime, [r.owner]);
    r.owner.position.copy(requireValue(r.projectiles.snapshots()[0]).position).z -= 2;
    const target = { ...rival('a-first', 0, r.owner.position.z, true), onItemContact: vi.fn() };
    expect(r.projectiles.update(0.03, [target, r.owner])).toEqual([]);
    expect(target.onItemContact).not.toHaveBeenCalled();
    expect(r.events.at(-1)?.kind).toBe('catch');
  });

  it.each(['outbound', 'return'] as const)(
    'clears %s at horizontal inside/edge before movement, but leaves outside active',
    (phase) => {
      for (const d of [4.9999, 5, 5.0001]) {
        const r = rig();
        r.spawn();
        if (phase === 'return') r.projectiles.update(turnTime, [r.owner]);
        const p = requireValue(r.projectiles.snapshots()[0]);
        r.projectiles.queueClearWithinRadius(p.position.clone().add(new Vector3(d, 50, 0)), 5);
        const contact = vi.fn();
        const hits = r.projectiles.update(0.001, [
          r.owner,
          { ...rival('contact', p.position.x, p.position.z), onItemContact: contact },
        ]);
        expect(hits.length).toBe(d <= 5 ? 0 : 1);
        expect(contact).toHaveBeenCalledTimes(d <= 5 ? 0 : 1);
        expect(r.events.some((e) => e.kind === 'cleared')).toBe(d <= 5);
      }
    },
  );

  it('expires at 4 race seconds before boundary contact, even with a fleeing owner', () => {
    const r = rig();
    r.spawn();
    r.owner.position.z = 1000;
    r.projectiles.update(3.99, [r.owner]);
    const p = requireValue(r.projectiles.snapshots()[0]);
    expect(p.remainingSeconds).toBeCloseTo(0.01, 8);
    const atExpiry = rival('boundary', p.position.x, p.position.z + 56 * 0.01 + 1.37);
    expect(r.projectiles.update(0.01, [r.owner, atExpiry])).toEqual([]);
    expect(r.events.at(-1)?.kind).toBe('expired');
    expect(r.projectiles.activeCount()).toBe(0);
  });

  it.each(['missing', 'finished', 'recovering'] as const)(
    'cancels when the owner is %s and freezes at dt=0',
    (reason) => {
      const r = rig();
      r.spawn();
      const before = r.projectiles.snapshots();
      r.projectiles.update(0, [r.owner]);
      expect(r.projectiles.snapshots()).toEqual(before);
      r.projectiles.update(
        0.01,
        reason === 'missing'
          ? []
          : [{ ...r.owner, finished: reason === 'finished', recovering: reason === 'recovering' }],
      );
      expect(r.events.at(-1)?.kind).toBe('cancelled');
      expect(r.projectiles.activeCount()).toBe(0);
    },
  );

  it('uses one mixed capacity slot, cancels only owned Arcs and releases all resources once', () => {
    const r = rig();
    const hazards = new HazardSystem(r.track, r.projectiles.capacity);
    r.spawn();
    r.spawn('other');
    const kinetic = requireValue(
      r.projectiles.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'player',
        direction: 'forward',
        config: requireValue(ITEM_DEFINITIONS['kinetic-disc'].projectile),
        launch: r.launch,
      }),
    );
    expect(hazards.spawnBlastOrb('player', 'forward', r.launch, () => true)).not.toBeNull();
    const slots = Array.from({ length: 36 }, () => requireValue(r.projectiles.reserveSlot()));
    expect(r.fire()).toBe('rejected');
    r.projectiles.cancelOwnerArcs('player');
    expect(r.projectiles.activeCount()).toBe(39);
    expect(r.projectiles.snapshots().some((p) => p.id === kinetic)).toBe(true);
    expect(r.projectiles.snapshots().some((p) => p.ownerId === 'other')).toBe(true);
    slots.forEach((id) => {
      r.projectiles.releaseSlot(id);
    });
    hazards.dispose();
    r.projectiles.dispose();
    r.projectiles.dispose();
    expect(r.projectiles.activeCount()).toBe(0);
    expect(r.projectiles.group.children).toHaveLength(0);
  });

  it.each([24, 90, 192, 310])(
    'stays finite on real Circuit Alpha section %s with elevated launch and bounded lifecycle',
    (index) => {
      const r = rig(new CircuitAlpha(), index);
      r.launch.position.y = 4;
      r.spawn();
      let previous = requireValue(r.projectiles.snapshots()[0]).position;
      for (let i = 0; i < 250; i++) {
        r.projectiles.update(1 / 60, [r.owner]);
        const p = r.projectiles.snapshots()[0];
        if (!p) break;
        expect(p.position.distanceTo(previous)).toBeLessThanOrEqual(56 / 60 + 1e-6);
        expect(p.position.y).toBe(4);
        expect(p.position.toArray().every(Number.isFinite)).toBe(true);
        previous = p.position;
      }
      expect(r.projectiles.activeCount()).toBe(0);
    },
  );
});
