import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { DriftVisual } from '../src/game/vfx/DriftVisual';
import { graphicsQualityProfile } from '../src/config/graphicsQuality';
import type { KartFeedback } from '../src/game/physics/KartController';

const transform = new THREE.Matrix4().makeTranslation(10, 0.5, 20);
function state(tier: KartFeedback['driftTier'], extra: Partial<KartFeedback> = {}): KartFeedback {
  return {
    drifting: true,
    driftTier: tier,
    chargeRatio: 0.8,
    boostActive: false,
    airborne: false,
    ...extra,
  };
}
function particles(
  visual: DriftVisual,
): THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> {
  const object = visual.group.children[0];
  expect(object).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
}

describe('drift visual particle pool', () => {
  it('prepares the instance color layout before the first drift shader is compiled', () => {
    const visual = new DriftVisual('medium');
    const mesh = particles(visual);
    expect(mesh.instanceColor).not.toBeNull();
    expect(mesh.count).toBe(0);
    visual.dispose();
  });
  it.each(['low', 'medium', 'high'] as const)(
    'bounds %s emissions, reuses geometry and never creates shadow work',
    (quality) => {
      const visual = new DriftVisual(quality);
      const mesh = particles(visual);
      const geometry = mesh.geometry;
      const material = mesh.material;
      for (let i = 0; i < 200; i += 1) visual.update(state('purple'), transform, 0.1);
      expect(mesh.count).toBeGreaterThan(0);
      expect(mesh.count).toBeLessThanOrEqual(graphicsQualityProfile(quality).driftParticleCapacity);
      expect(mesh.geometry).toBe(geometry);
      expect(mesh.material).toBe(material);
      expect(visual.group.children).toHaveLength(1);
      expect(mesh.castShadow).toBe(false);
      expect(mesh.receiveShadow).toBe(false);
      visual.dispose();
    },
  );
  it('emits blue sparks at both rear wheels and retains world-space trails when the kart moves', () => {
    const visual = new DriftVisual('medium');
    const random = vi.spyOn(Math, 'random');
    const before = random.mock.calls.length;
    visual.update(state('blue'), transform, 0.1);
    const mesh = particles(visual);
    expect(mesh.count).toBeGreaterThanOrEqual(2);
    const left = new THREE.Matrix4();
    const right = new THREE.Matrix4();
    mesh.getMatrixAt(0, left);
    mesh.getMatrixAt(1, right);
    expect(left.elements[12]).toBeLessThan(10);
    expect(right.elements[12]).toBeGreaterThan(10);
    const color = new THREE.Color();
    mesh.getColorAt(0, color);
    expect(color.b).toBeGreaterThan(color.r);
    visual.update(
      state('none', { drifting: false }),
      new THREE.Matrix4().makeTranslation(100, 0.5, 200),
      0.016,
    );
    mesh.getMatrixAt(0, left);
    expect(left.elements[12]).toBeLessThan(12);
    expect(random.mock.calls.length).toBe(before);
    random.mockRestore();
    visual.dispose();
  });
  it('makes orange a denser warm flame/spark mix than blue', () => {
    const blue = new DriftVisual('medium');
    const orange = new DriftVisual('medium');
    blue.update(state('blue'), transform, 0.1);
    orange.update(state('orange'), transform, 0.1);
    const mesh = particles(orange);
    expect(mesh.count).toBeGreaterThan(particles(blue).count);
    const color = new THREE.Color();
    mesh.getColorAt(0, color);
    expect(color.r).toBeGreaterThan(color.b);
    blue.dispose();
    orange.dispose();
  });
  it('bursts once when purple charges and pulses once when a purple boost releases', () => {
    const visual = new DriftVisual('medium');
    const mesh = particles(visual);
    visual.update(state('purple'), transform, 0.001);
    const charged = mesh.count;
    expect(charged).toBeGreaterThan(6);
    visual.update(state('purple'), transform, 0.001);
    expect(mesh.count).toBe(charged);
    visual.update(state('purple', { drifting: false, boostActive: true }), transform, 0.001);
    const released = mesh.count;
    expect(released).toBeGreaterThan(charged);
    visual.update(state('purple', { drifting: false, boostActive: true }), transform, 0.001);
    expect(mesh.count).toBe(released);
    visual.update(state('purple', { drifting: false, boostActive: true }), transform, 0.02);
    const spread: number[] = [];
    for (let i = charged; i < released; i += 1) {
      const matrix = new THREE.Matrix4();
      mesh.getMatrixAt(i, matrix);
      spread.push(matrix.elements[12]);
    }
    expect(Math.min(...spread)).toBeLessThan(10);
    expect(Math.max(...spread)).toBeGreaterThan(10);
    visual.dispose();
  });
  it('freezes on pause/hidden time, suppresses airborne emission and clears on finish/reset', () => {
    const visual = new DriftVisual('medium');
    const mesh = particles(visual);
    visual.update(state('purple'), transform, 0.1);
    const count = mesh.count;
    const before = mesh.instanceMatrix.array.slice();
    visual.update(state('orange'), transform, 0);
    expect(mesh.count).toBe(count);
    expect(mesh.instanceMatrix.array).toEqual(before);
    visual.clear();
    visual.update(state('purple', { airborne: true }), transform, 0.1);
    expect(mesh.count).toBe(0);
    visual.update(state('orange'), transform, 0.1, false);
    expect(mesh.count).toBe(0);
    expect(visual.group.visible).toBe(false);
    visual.dispose();
  });
  it('expires particles, rejects invalid intervals and disposes its resources exactly once', () => {
    const visual = new DriftVisual('medium');
    const mesh = particles(visual);
    visual.update(state('orange'), transform, 0.1);
    const count = mesh.count;
    visual.update(state('orange'), transform, NaN);
    expect(mesh.count).toBe(count);
    visual.update(state('orange'), transform, -1);
    expect(mesh.count).toBe(count);
    for (let i = 0; i < 15; i += 1)
      visual.update(state('none', { drifting: false }), transform, 0.1);
    expect(mesh.count).toBe(0);
    expect(visual.group.visible).toBe(false);
    let disposed = 0;
    mesh.geometry.addEventListener('dispose', () => {
      disposed += 1;
    });
    mesh.material.addEventListener('dispose', () => {
      disposed += 1;
    });
    visual.dispose();
    visual.dispose();
    visual.update(state('purple'), transform, 0.1);
    expect(disposed).toBe(2);
    expect(visual.group.children).toHaveLength(0);
  });
});
