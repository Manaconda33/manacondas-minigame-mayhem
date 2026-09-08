import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { AiDriver } from '../src/game/ai/AiDriver';
import {
  observeAiHazards,
  relevantAiHazards,
  hazardRoutePosition,
  hazardLaneClearance,
  type AiHazardSnapshot,
} from '../src/game/ai/AiHazardAwareness';
import { AiHazardFixture, aiHazardTestFromSearch } from '../src/game/ai/AiHazardFixture';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { CircuitAlpha, type TrackProjection } from '../src/game/track/CircuitAlpha';

class StraightTrack extends CircuitAlpha {
  public override project(position: THREE.Vector3): TrackProjection {
    return {
      index: 0,
      progress: position.z / this.curve.getLength(),
      point: new THREE.Vector3(0, 0, position.z),
      tangent: new THREE.Vector3(0, 0, 1),
      lateralOffset: position.x,
      lateralDistance: Math.abs(position.x),
      surface: 'asphalt',
    };
  }
}
const required = <T>(value: T | undefined | null): T => {
  if (value == null) throw new Error('Missing fixture');
  return value;
};
const hazard = (kind: 'slick' | 'blast' = 'slick', x = 0, z = 12): AiHazardSnapshot => ({
  kind,
  id: 1,
  ownerId: 'other',
  position: new THREE.Vector3(x, 0, z),
  velocity: new THREE.Vector3(),
  remainingSeconds: kind === 'slick' ? 12 : 3,
  ownerImmuneSeconds: 0,
});
function makeDriver(track = new StraightTrack(), preferred = 0) {
  return new AiDriver(track, { laneOffset: preferred, pace: 0.7, aggression: 0.6 }, 30);
}
function steer(driver: AiDriver, track: CircuitAlpha, hazards: AiHazardSnapshot[], dt = 1 / 60) {
  return driver.input(
    new THREE.Vector3(),
    new THREE.Vector3(0, 0, 1),
    20,
    0,
    [],
    dt,
    observeAiHazards(track, hazards),
    'ai',
  );
}

describe('route-relative hazard awareness', () => {
  it.each([19.999, 20, 20.001, -0.01])('detects the governed forward range at %s m', (gap) => {
    const track = new StraightTrack();
    const observed = observeAiHazards(track, [hazard('slick', 0, gap)]);
    expect(relevantAiHazards(observed, 0, track.curve.getLength(), 20, 'ai')).toHaveLength(
      gap >= 0 && gap <= 20 ? 1 : 0,
    );
  });
  it('wraps both the route seam and the actual start/finish gate without changing projection authority', () => {
    const track = new CircuitAlpha();
    const length = track.curve.getLength();
    for (const distance of [length - 6, track.startFinishDistance - 6]) {
      const p = track.curve.getPointAt(distance / length);
      const h = { ...hazard(), position: track.curve.getPointAt(((distance + 12) / length) % 1) };
      const before = track.project(p);
      const route = hazardRoutePosition(track, p);
      expect(
        relevantAiHazards(observeAiHazards(track, [h]), route.distance, length, 20, 'ai'),
      ).toHaveLength(1);
      expect(track.project(p)).toEqual(before);
    }
  });
  it('ignores physically adjacent hazards on a route-distant section', () => {
    class FoldedTrack extends StraightTrack {
      public override project(position: THREE.Vector3): TrackProjection {
        const projection = super.project(position);
        return { ...projection, progress: position.x > 0.5 ? 0.5 : 0 };
      }
    }
    const track = new FoldedTrack();
    const h = hazard('slick', 1, 0);
    expect(h.position.length()).toBe(1);
    expect(
      relevantAiHazards(observeAiHazards(track, [h]), 0, track.curve.getLength(), 20, 'ai'),
    ).toEqual([]);
  });
  it.each([
    ['slick', 2.5],
    ['blast', 4.5],
  ] as const)(
    'keeps %s planning footprint inclusive without modifying physical radius',
    (kind, radius) => {
      const track = new StraightTrack();
      for (const delta of [-0.0001, 0, 0.0001]) {
        const threats = relevantAiHazards(
          observeAiHazards(track, [hazard(kind, radius + delta)]),
          0,
          track.curve.getLength(),
          20,
          'ai',
        );
        expect(hazardLaneClearance(0, threats) <= 0).toBe(delta <= 0);
      }
    },
  );
  it('predicts Blast with accepted drag, caps prediction by fuse, and stops without reversal', () => {
    const track = new StraightTrack();
    const h = { ...hazard('blast'), velocity: new THREE.Vector3(10, 99, 0) };
    const observed = required(observeAiHazards(track, [h])[0]);
    expect(observed.samples[0]?.lateralOffset).toBe(0);
    expect(observed.samples[1]?.lateralOffset).toBeCloseTo(4.25);
    const short = required(observeAiHazards(track, [{ ...h, remainingSeconds: 0.1 }])[0]);
    expect(short.samples[1]?.lateralOffset).toBeCloseTo(0.97);
    const slow = required(
      observeAiHazards(track, [{ ...h, velocity: new THREE.Vector3(1, 0, 0) }])[0],
    );
    expect(slow.samples[1]?.lateralOffset).toBeCloseTo(1 / 12);
    expect(h.position.x).toBe(0);
    expect(h.velocity.toArray()).toEqual([10, 99, 0]);
    expect(observeAiHazards(track, [{ ...h, remainingSeconds: 0 }])).toEqual([]);
  });
  it('ignores an owned hazard only when all closest-approach estimates are within immunity', () => {
    const track = new StraightTrack();
    const length = track.curve.getLength();
    const h = { ...hazard('slick', 0, 3), ownerId: 'ai', ownerImmuneSeconds: 0.35 };
    expect(relevantAiHazards(observeAiHazards(track, [h]), 0, length, 20, 'ai')).toEqual([]);
    expect(relevantAiHazards(observeAiHazards(track, [h]), 0, length, 0, 'ai')).toHaveLength(1);
    expect(
      relevantAiHazards(
        observeAiHazards(track, [{ ...h, ownerImmuneSeconds: 0.15 }]),
        0,
        length,
        20,
        'ai',
      ),
    ).toHaveLength(1);
    const receding = { ...h, kind: 'blast' as const, velocity: new THREE.Vector3(0, 0, 20) };
    expect(
      relevantAiHazards(observeAiHazards(track, [receding]), 0, length, 20, 'ai'),
    ).toHaveLength(2);
    expect(
      relevantAiHazards(observeAiHazards(track, [h]), 0, length, 20, 'someone-else'),
    ).toHaveLength(1);
  });
});

describe('hazard-priority lane intent and return', () => {
  it.each([-1, 1])('chooses deterministic opposite clearance for hazard side %s', (side) => {
    const track = new StraightTrack();
    const driver = makeDriver(track);
    steer(driver, track, [hazard('slick', side)]);
    expect(Math.sign(driver.desiredLaneOffset())).toBe(-side);
    expect(Math.abs(driver.desiredLaneOffset())).toBeLessThanOrEqual(3.3);
  });
  it('selects an alternate lane for same-lane Slick and ignores a Slick behind', () => {
    const track = new StraightTrack();
    const driver = makeDriver(track);
    steer(driver, track, [hazard()]);
    expect(Math.abs(driver.desiredLaneOffset())).toBe(3.3);
    driver.reset();
    steer(driver, track, [hazard('slick', 0, -3)]);
    expect(driver.desiredLaneOffset()).toBe(0);
  });
  it('moving Blast prediction changes a previously attractive lane', () => {
    const track = new StraightTrack();
    const driver = makeDriver(track);
    const moving = { ...hazard('blast', -6), velocity: new THREE.Vector3(20, 0, 0) };
    steer(driver, track, [{ ...moving, velocity: new THREE.Vector3() }]);
    expect(driver.desiredLaneOffset()).toBe(0);
    driver.reset();
    steer(driver, track, [moving]);
    expect(driver.desiredLaneOffset()).toBe(-1.65);
  });
  it('uses greatest minimum clearance when every lane is conflicted', () => {
    const track = new StraightTrack();
    const driver = makeDriver(track);
    const hazards = [hazard('blast', -2), { ...hazard('slick', 3), id: 2 }];
    const threats = relevantAiHazards(
      observeAiHazards(track, hazards),
      0,
      track.curve.getLength(),
      20,
      'ai',
    );
    const candidates = [-3.3, -1.65, 0, 1.65, 3.3];
    expect(candidates.every((lane) => hazardLaneClearance(lane, threats) <= 0)).toBe(true);
    steer(driver, track, hazards);
    expect(hazardLaneClearance(driver.desiredLaneOffset(), threats)).toBe(
      Math.max(...candidates.map((lane) => hazardLaneClearance(lane, threats))),
    );
  });
  it('retains racer-body scoring among hazard-safe lanes and lets hazards override a previous lane hold', () => {
    const track = new StraightTrack();
    const driver = makeDriver(track);
    const position = new THREE.Vector3(),
      forward = new THREE.Vector3(0, 0, 1);
    const racer = { position: new THREE.Vector3(0, 0, 8), speed: 10, lateralOffset: 0 };
    driver.input(position, forward, 20, 0, [racer]);
    const initialLane = driver.desiredLaneOffset();
    expect(initialLane).not.toBe(0);
    const h = hazard('slick', initialLane);
    driver.input(position, forward, 20, 0, [racer], 1 / 60, observeAiHazards(track, [h]), 'ai');
    expect(Math.abs(driver.desiredLaneOffset() - initialLane)).toBeGreaterThan(2.5);
    driver.reset();
    driver.input(
      position,
      forward,
      20,
      0,
      [{ ...racer, lateralOffset: -3.3 }],
      1 / 60,
      observeAiHazards(track, [hazard()]),
      'ai',
    );
    expect(driver.desiredLaneOffset()).toBe(3.3);
  });
  it('holds for 0.6 race seconds, freezes under pause, and reset clears temporary state', () => {
    const track = new StraightTrack();
    const driver = makeDriver(track, 0.35);
    steer(driver, track, [hazard()]);
    const lane = driver.desiredLaneOffset();
    steer(driver, track, [], 0.5999);
    expect(driver.desiredLaneOffset()).toBe(lane);
    for (const dt of [0, -1, NaN, Infinity]) {
      steer(driver, track, [], dt);
      expect(driver.desiredLaneOffset()).toBe(lane);
    }
    steer(driver, track, [], 0.0001);
    expect(driver.desiredLaneOffset()).toBe(0.35);
    steer(driver, track, [hazard()]);
    driver.reset();
    expect(driver.desiredLaneOffset()).toBe(0.35);
    steer(driver, track, []);
    expect(driver.desiredLaneOffset()).toBe(0.35);
  });
  it('changes no input vectors, speed-cap, throttle or braking rules', () => {
    const track = new CircuitAlpha();
    const p = track.curve.getPointAt(0.1),
      forward = track.curve.getTangentAt(0.1);
    const beforeP = p.clone(),
      beforeF = forward.clone();
    const h = { ...hazard(), position: track.curve.getPointAt(0.1 + 12 / track.curve.getLength()) };
    for (const speed of [0, 20, 35])
      for (const gap of [-10, 0, 10]) {
        const normal = makeDriver(track).input(p, forward, speed, gap);
        const avoiding = makeDriver(track).input(
          p,
          forward,
          speed,
          gap,
          [],
          1 / 60,
          observeAiHazards(track, [h]),
          'ai',
        );
        expect(avoiding.throttle).toBe(normal.throttle);
        expect(avoiding.brake).toBe(normal.brake);
        expect(avoiding.speedLimitMultiplier).toBe(normal.speedLimitMultiplier);
        expect(Math.abs(avoiding.steering)).toBeLessThanOrEqual(1);
      }
    expect(p).toEqual(beforeP);
    expect(forward).toEqual(beforeF);
  });
});

describe('real hazard lifecycle and AI fixture boundary', () => {
  it('reads detached active snapshots and sees removal/expiry on the next observation', () => {
    const track = new StraightTrack(),
      capacity = new ItemPhysicsCapacity();
    const hazards = new HazardSystem(track, capacity);
    const id = required(hazards.placeSlick('player', new THREE.Vector3(0, 0, 12)));
    hazards.placeBlastOrb('player', new THREE.Vector3(0, 0, 15));
    const snapshots = hazards.activeSnapshots();
    snapshots[0]?.position.set(99, 99, 99);
    expect(hazards.activeSnapshots()[0]?.position.x).toBe(0);
    expect(observeAiHazards(track, hazards.activeSnapshots())).toHaveLength(2);
    hazards.remove(id);
    expect(observeAiHazards(track, hazards.activeSnapshots())).toHaveLength(1);
    hazards.update(3, []);
    expect(observeAiHazards(track, hazards.activeSnapshots())).toEqual([]);
    hazards.dispose();
    expect(capacity.count()).toBe(0);
  });
  it.each(['slick', 'blast'] as const)(
    'places one real %s at the first unfinished AI route/lane; capacity retry and restart are isolated',
    (kind) => {
      const track = new CircuitAlpha(),
        capacity = new ItemPhysicsCapacity();
      const hazards = new HazardSystem(track, capacity),
        fixture = new AiHazardFixture(kind);
      const tangent = track.curve.getTangentAt(0.1);
      const p = track.curve
        .getPointAt(0.1)
        .addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x), 1.65);
      const target = { id: 'ai-1', name: 'Manaconda', position: p, finished: false };
      const racers = [
        { ...target, id: 'finished', finished: true },
        target,
        { ...target, id: 'ai-2', name: 'Alex' },
      ];
      expect(fixture.badge()).toContain('AI HAZARD TEST');
      fixture.update(4.999, racers, track, hazards);
      expect(capacity.count()).toBe(0);
      for (let i = 0; i < 40; i++) hazards.placeBlastOrb('full', p);
      fixture.update(5, racers, track, hazards);
      expect(fixture.badge()).not.toContain('Manaconda');
      hazards.dispose();
      fixture.update(5.1, racers, track, hazards);
      const placed = required(hazards.activeSnapshots()[0]);
      expect(placed.kind).toBe(kind);
      expect(placed.velocity.length()).toBe(0);
      expect(placed.remainingSeconds).toBe(kind === 'slick' ? 12 : 3);
      const gap =
        hazardRoutePosition(track, placed.position).distance -
        hazardRoutePosition(track, p).distance;
      expect(gap).toBeCloseTo(12, 1);
      expect(hazardRoutePosition(track, placed.position).lateralOffset).toBeCloseTo(1.65, 1);
      expect(fixture.badge()).toContain('Manaconda');
      fixture.update(7, racers, track, hazards);
      expect(capacity.count()).toBe(1);
      hazards.dispose();
      fixture.reset();
      fixture.update(5, racers, track, hazards);
      expect(capacity.count()).toBe(1);
      hazards.dispose();
      expect(capacity.count()).toBe(0);
    },
  );
  it('requires an exact explicit URL value and does nothing for normal URLs or finished grids', () => {
    for (const search of [
      '',
      '?testAiHazardAvoidance=1',
      '?testAiHazardAvoidance=SLICK',
      '?testItem=slick-trap',
    ])
      expect(aiHazardTestFromSearch(search)).toBeNull();
    expect(aiHazardTestFromSearch('?testAiHazardAvoidance=slick')).toBe('slick');
    expect(aiHazardTestFromSearch('?testAiHazardAvoidance=blast')).toBe('blast');
    const track = new CircuitAlpha(),
      hazards = new HazardSystem(track, new ItemPhysicsCapacity());
    const target = { id: 'ai', name: 'AI', position: track.curve.getPointAt(0.1), finished: false };
    const off = new AiHazardFixture(null);
    off.update(10, [target], track, hazards);
    expect(off.badge()).toBe('');
    const on = new AiHazardFixture('slick');
    on.update(10, [{ ...target, finished: true }], track, hazards);
    expect(hazards.activeCount()).toBe(0);
    hazards.dispose();
  });
});
