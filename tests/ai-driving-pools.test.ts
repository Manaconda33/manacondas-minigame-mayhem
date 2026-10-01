import { expect, it } from 'vitest';
import * as THREE from 'three';
import { DriftVisual } from '../src/game/vfx/DriftVisual';
import { WheelDustVisual } from '../src/game/vfx/WheelDustVisual';

const feedback = {
  drifting: true,
  driftTier: 'purple' as const,
  chargeRatio: 1,
  airborne: false,
  boostActive: false,
};
const camera = new THREE.Quaternion();
function drift(id: string, x: number, active = true) {
  return {
    id,
    feedback: { ...feedback },
    kartWorld: new THREE.Matrix4().makeTranslation(x, 0.5, 0),
    active,
  };
}
function dust(id: string, x: number, active = true) {
  return {
    id,
    wheels: [-1, 1, -1, 1].map((dx) => ({
      position: new THREE.Vector3(x + dx, 0, 0),
      surface: 'dirt' as const,
      grounded: true,
    })),
    velocity: new THREE.Vector3(0, 0, 20),
    forward: new THREE.Vector3(0, 0, 1),
    active,
  };
}
function mesh(v: DriftVisual | WheelDustVisual) {
  return v.group.children[0] as THREE.InstancedMesh;
}
function xs(v: DriftVisual | WheelDustVisual) {
  const m = mesh(v),
    matrix = new THREE.Matrix4();
  return Array.from({ length: m.count }, (_, i) => {
    m.getMatrixAt(i, matrix);
    return matrix.elements[12];
  });
}

it('keeps purple transitions independent between opponents and avoids culled catch-up bursts', () => {
  const v = new DriftVisual('medium');
  expect(typeof v.updateEmitters).toBe('function');
  const a = drift('a', 0),
    b = drift('b', 20);
  v.updateEmitters([a, b], 0.001);
  expect(xs(v).some((x) => x < 2)).toBe(true);
  expect(xs(v).some((x) => x > 18)).toBe(true);
  const count = mesh(v).count;
  v.updateEmitters([a, b], 0.001);
  expect(mesh(v).count).toBe(count);
  b.active = false;
  b.feedback.drifting = false;
  b.feedback.boostActive = true;
  v.updateEmitters([a, b], 0.001);
  b.active = true;
  v.updateEmitters([a, b], 0.001);
  expect(mesh(v).count).toBe(count);
  v.clearEmitter('a');
  v.updateEmitters([], 0.001);
  expect(xs(v).every((x) => x > 18)).toBe(true);
  v.dispose();
});

it.each([
  ['low', 48, 32],
  ['medium', 96, 64],
  ['high', 144, 96],
] as const)(
  'shares %s drift and dust budgets across seven racers, freezing and releasing instance buffers',
  (quality, driftCap, dustCap) => {
    const v = new DriftVisual(quality),
      d = new WheelDustVisual(quality);
    expect(typeof d.updateEmitters).toBe('function');
    const racers = Array.from({ length: 7 }, (_, i) => drift(String(i), i * 10));
    const wheels = Array.from({ length: 7 }, (_, i) => dust(String(i), i * 10));
    for (let i = 0; i < 30; i++) {
      v.updateEmitters(racers, 0.1);
      d.updateEmitters(wheels, camera, 0.1);
    }
    expect(mesh(v).count).toBeGreaterThan(0);
    expect(mesh(d).count).toBeGreaterThan(0);
    expect(mesh(v).count).toBeLessThanOrEqual(driftCap);
    expect(mesh(d).count).toBeLessThanOrEqual(dustCap);
    expect(v.group.children).toHaveLength(1);
    expect(d.group.children).toHaveLength(1);
    const before = mesh(d).instanceMatrix.array.slice();
    d.updateEmitters(wheels, camera, 0);
    expect(mesh(d).instanceMatrix.array).toEqual(before);
    let disposed = 0;
    mesh(v).addEventListener('dispose', () => disposed++);
    mesh(d).addEventListener('dispose', () => disposed++);
    v.dispose();
    d.dispose();
    v.dispose();
    d.dispose();
    expect(disposed).toBe(2);
  },
);

it('dust selects each racer’s own supported wheel and clears only a recovered owner', () => {
  const v = new WheelDustVisual('medium');
  expect(typeof v.updateEmitters).toBe('function');
  const a = dust('a', 0),
    b = dust('b', 20),
    hidden = dust('hidden', 40, false);
  a.wheels.forEach((w) => (w.grounded = false));
  for (let i = 0; i < 4; i++) v.updateEmitters([a, b, hidden], camera, 0.1);
  expect(mesh(v).count).toBeGreaterThan(0);
  expect(xs(v).every((x) => x > 18 && x < 22)).toBe(true);
  a.wheels.forEach((w) => (w.grounded = true));
  for (let i = 0; i < 4; i++) v.updateEmitters([a, b], camera, 0.1);
  v.clearEmitter('b');
  v.updateEmitters([], camera, 0.001);
  expect(xs(v).every((x) => x < 3)).toBe(true);
  for (let i = 0; i < 10; i++) v.updateEmitters([], camera, 0.1);
  expect(mesh(v).count).toBe(0);
  v.dispose();
});
