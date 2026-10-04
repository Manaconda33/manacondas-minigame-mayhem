import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';

function exhaustive(track: NeonGrid, position: THREE.Vector3) {
  let distance = Infinity,
    index = 0,
    fraction = 0;
  const nearest = new THREE.Vector3();
  for (let i = 0; i < track.samples.length; i++) {
    const a = track.samples[i] ?? new THREE.Vector3();
    const edge = (track.samples[(i + 1) % track.samples.length] ?? new THREE.Vector3())
      .clone()
      .sub(a);
    const f = THREE.MathUtils.clamp(position.clone().sub(a).dot(edge) / edge.lengthSq(), 0, 1);
    const point = a.clone().addScaledVector(edge, f);
    const d = position.distanceToSquared(point);
    if (d < distance) {
      distance = d;
      index = i;
      fraction = f;
      nearest.copy(point);
    }
  }
  return { index, progress: ((index + fraction) / track.sampleCount) % 1, point: nearest };
}

describe('Neon exact projection cost and lifetime', () => {
  it('prunes distant segments without changing the 3D nearest result', () => {
    const track = new NeonGrid();
    const position = track.curve.getPointAt(0.8154).add(new THREE.Vector3(1, 0.8, 2));
    const reference = exhaustive(track, position);
    const checks = vi.spyOn(THREE.Vector3.prototype, 'distanceToSquared');
    const actual = track.project(position);
    const count = checks.mock.calls.length;
    checks.mockRestore();
    expect(actual.index).toBe(reference.index);
    expect(actual.point.distanceTo(reference.point)).toBeLessThan(1e-9);
    expect(count).toBeLessThan(40);
  });
  it('reuses identical coordinates but recomputes after movement, height change or recovery', () => {
    const track = new NeonGrid();
    const p = track.curve.getPointAt(0.3);
    const tangent = vi.spyOn(track.curve, 'getTangentAt');
    const original = track.project(p);
    original.point.set(999, 999, 999);
    original.tangent.set(0, 0, 0);
    const repeated = track.project(p.clone());
    expect(tangent).toHaveBeenCalledTimes(1);
    expect(repeated.point.distanceTo(p)).toBeLessThan(0.1);
    expect(repeated.tangent.length()).toBeCloseTo(1);
    for (const next of [
      p.clone().add(new THREE.Vector3(1, 0, 0)),
      p.clone().setY(14),
      track.curve.getPointAt(0.9),
    ]) {
      const reference = exhaustive(track, next);
      const actual = track.project(next);
      expect(actual.index).toBe(reference.index);
      expect(actual.progress).toBeCloseTo(reference.progress, 12);
    }
    expect(tangent).toHaveBeenCalledTimes(4);
    tangent.mockRestore();
  });
  it('matches exhaustive queries around every road segment and far outside the road', () => {
    const track = new NeonGrid();
    for (let i = 0; i < 768; i++) {
      const p = track.curve
        .getPointAt(i / 768)
        .add(new THREE.Vector3(Math.sin(i) * 12, (i % 5) * 7 - 9, Math.cos(i) * 12));
      const reference = exhaustive(track, p);
      const actual = track.project(p);
      expect(actual.index).toBe(reference.index);
      expect(actual.progress).toBeCloseTo(reference.progress, 12);
      expect(actual.point.distanceTo(reference.point)).toBeLessThan(1e-9);
    }
    for (const p of [
      new THREE.Vector3(1000, 1000, -1000),
      new THREE.Vector3(0, -1000, 0),
      new THREE.Vector3(-999, 0, 999),
    ]) {
      expect(track.project(p).index).toBe(exhaustive(track, p).index);
    }
  });
});
