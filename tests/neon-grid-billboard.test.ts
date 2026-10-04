import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import * as billboard from '../src/game/track/NeonGridBillboard';
import {
  surfaceSpeedMultiplier,
  surfaceAccelerationMultiplier,
  surfaceMinimumPlayableSpeed,
} from '../src/config/kartTuning';

describe('authoritative billboard timing and crossing', () => {
  it.each([
    [0, true, 0],
    [3.2, true, 0],
    [3.6, true, 0.5],
    [4, false, 0],
    [5.2, false, 0],
    [5.6, false, 0.5],
    [6, true, 0],
    [10, false, 0],
  ])('resolves phase %s without wall-clock state', (time, on, tell) => {
    const state = billboard.billboardStateAt(time);
    expect(state.on).toBe(on);
    expect(state.tellIntensity).toBeCloseTo(tell, 6);
  });
  it('defines static as 0.82 retention with asphalt acceleration and no floor', () => {
    expect(surfaceSpeedMultiplier('static', 5)).toBe(0.82);
    expect(surfaceAccelerationMultiplier('static', 5)).toBe(1);
    expect(surfaceMinimumPlayableSpeed('static')).toBe(0);
  });
  it.each([0, 4])(
    'owns physical entry until rejoin and emits a once-only exit at phase %s',
    (time) => {
      const track = new NeonGrid(),
        route = new RacerTrack(track),
        gap = track.billboardGap;
      const at = (d: number) =>
        gap.curve.getPointAt(d / gap.curve.getLength()).add(new THREE.Vector3(0, 0.5, 0));
      const mouth = gap.mouthDistance;
      expect(route.project(at(40)).pathId).toBeUndefined();
      expect(route.advance(at(mouth - 1), at(mouth + 1), time)).toBeNull();
      expect(route.project(at(40)).pathId).toBe('billboard-gap');
      expect(route.project(at(40)).surface).toBe(time === 0 ? 'static' : 'asphalt');
      expect(route.advance(at(30), at(31), time + 1)).toBeNull();
      const end = at(gap.curve.getLength()),
        after = end.clone().addScaledVector(gap.curve.getTangentAt(1), 1);
      const event = route.advance(at(gap.curve.getLength() - 1), after, time + 3);
      expect(event).toMatchObject({
        pathId: 'billboard-gap',
        speedRetention: time === 0 ? 0.82 : 1,
      });
      expect(route.project(after).pathId).toBeUndefined();
      expect(
        route.advance(after, after.clone().addScaledVector(gap.curve.getTangentAt(1), 1), time + 4),
      ).toBeNull();
      route.reset();
      route.advance(at(mouth - 1), at(mouth + 1), 4);
      expect(route.project(at(40)).surface).toBe('asphalt');
      expect(route.advance(at(gap.curve.getLength() - 1), after, 5)?.speedRetention).toBe(1);
    },
  );
  it('rejects sideways, reverse and elevated entries and resets a reversed traversal', () => {
    const track = new NeonGrid(),
      gap = track.billboardGap,
      route = new RacerTrack(track);
    const p = gap.curve.getPointAt(gap.mouthDistance / gap.curve.getLength()),
      t = gap.curve.getTangentAt(gap.mouthDistance / gap.curve.getLength()),
      r = new THREE.Vector3(t.z, 0, -t.x);
    const before = p.clone().addScaledVector(t, -1),
      after = p.clone().addScaledVector(t, 1);
    route.advance(after, before, 0);
    expect(route.project(after).pathId).toBeUndefined();
    route.advance(before.clone().addScaledVector(r, 8), after.clone().addScaledVector(r, 8), 0);
    expect(route.project(after).pathId).toBeUndefined();
    route.advance(
      before.clone().add(new THREE.Vector3(0, 4, 0)),
      after.clone().add(new THREE.Vector3(0, 4, 0)),
      0,
    );
    expect(route.project(after).pathId).toBeUndefined();
    route.advance(before, after, 0);
    route.advance(after, before, 0);
    expect(route.project(before).pathId).toBeUndefined();
    route.advance(before, after, 4);
    expect(route.project(after).surface).toBe('asphalt');
    route.reset();
    expect(route.project(after).pathId).toBeUndefined();
  });
});

it.each([-3, 0, 3])(
  'accepts a forward chord choice across the legal mouth at offset %s',
  (lane) => {
    const track = new NeonGrid(),
      gap = track.billboardGap,
      route = new RacerTrack(track);
    const p = gap.curve.getPointAt(gap.mouthDistance / gap.curve.getLength()),
      t = gap.curve.getTangentAt(gap.mouthDistance / gap.curve.getLength()),
      r = new THREE.Vector3(t.z, 0, -t.x).normalize();
    const before = p.clone().addScaledVector(t, -1).addScaledVector(r, lane),
      after = p.clone().addScaledVector(t, 1).addScaledVector(r, lane);
    route.advance(before, after, 4);
    expect(route.project(after).pathId).toBe('billboard-gap');
  },
);

it('lets shared surface/navigation queries follow the plaza without selecting a racer path', () => {
  const track = new NeonGrid(),
    gap = track.billboardGap,
    p = gap.curve.getPointAt(0.5);
  const surface = track.projectSurface(p);
  expect(surface.pathId).toBe('billboard-gap');
  expect(surface.surface).toBe('asphalt');
  expect(track.project(p).pathId).toBeUndefined();
  expect(
    track
      .surfaceNavigationAt(surface, 10)
      .point.distanceTo(gap.curve.getPointAt(0.5 + 10 / gap.curve.getLength())),
  ).toBeLessThan(0.02);
  const street = track.curve.getPointAt(0.145).add(new THREE.Vector3(0, 0.5, 0));
  expect(track.projectSurface(street).pathId).toBeUndefined();
});

it.each([-4.8, -4, -3, 0, 3])(
  'keeps a racer following the main sweeper on main at lane %s',
  (lane) => {
    const track = new NeonGrid(),
      route = new RacerTrack(track);
    const at = (progress: number) => {
      const p = track.curve.getPointAt(progress),
        t = track.curve.getTangentAt(progress);
      return p
        .addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), lane)
        .add(new THREE.Vector3(0, 0.5, 0));
    };
    for (let i = 0; i < 100; i++) {
      const previous = at(0.105 + i * 0.00025),
        current = at(0.105 + (i + 1) * 0.00025);
      route.advance(previous, current, 0);
      expect(route.project(current).pathId).toBeUndefined();
    }
  },
);
