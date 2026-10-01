import { describe, expect, it, vi } from 'vitest';
import { requireValue } from './requireValue';
import * as THREE from 'three';
import { WheelDustVisual, type DustWheelContact } from '../src/game/vfx/WheelDustVisual';

const forward = new THREE.Vector3(0, 0, 1);
const camera = new THREE.Quaternion();
function contacts(surface: DustWheelContact['surface'] = 'dirt', grounded = true) {
  return [-1, 1, -1, 1].map((x, i) => ({
    position: new THREE.Vector3(x, 0, i < 2 ? 1 : -1),
    surface,
    grounded,
  }));
}
function mesh(visual: WheelDustVisual) {
  return visual.group.children[0] as THREE.InstancedMesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial
  >;
}
function run(
  visual: WheelDustVisual,
  wheels = contacts(),
  velocity = new THREE.Vector3(0, 0, 16),
  dt = 0.1,
) {
  visual.update(wheels, velocity, forward, camera, dt);
}

describe('player wheel dust', () => {
  it('emits only from supported off-road wheels and preserves world-space trails', () => {
    const dust = new WheelDustVisual('medium');
    const wheels = contacts();
    requireValue(wheels[0]).surface = 'asphalt';
    requireValue(wheels[2]).surface = 'asphalt';
    run(dust, wheels);
    const pool = mesh(dust);
    expect(pool.count).toBeGreaterThan(0);
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < pool.count; i++) {
      pool.getMatrixAt(i, matrix);
      expect(matrix.elements[12]).toBeGreaterThan(0.8);
    }
    const count = pool.count;
    wheels.forEach((w) => {
      w.surface = 'asphalt';
      w.position.x += 100;
    });
    run(dust, wheels);
    expect(pool.count).toBe(count);
    pool.getMatrixAt(0, matrix);
    expect(matrix.elements[12]).toBeLessThan(3);
    dust.dispose();
  });
  it.each(['asphalt', 'boost', 'ramp'] as const)('never emits on %s', (surface) => {
    const dust = new WheelDustVisual('medium');
    for (let i = 0; i < 20; i++) run(dust, contacts(surface));
    expect(mesh(dust).count).toBe(0);
    dust.dispose();
  });
  it('suppresses idle and airborne wheels, increases with speed/slip and distinguishes grass', () => {
    const count = (
      surface: DustWheelContact['surface'],
      velocity: THREE.Vector3,
      grounded = true,
    ) => {
      const dust = new WheelDustVisual('medium');
      run(dust, contacts(surface, grounded), velocity);
      const result = mesh(dust).count;
      dust.dispose();
      return result;
    };
    expect(count('dirt', new THREE.Vector3())).toBe(0);
    expect(count('dirt', new THREE.Vector3(0, 0, 16), false)).toBe(0);
    expect(count('dirt', new THREE.Vector3(0, 0, 16))).toBeGreaterThan(
      count('dirt', new THREE.Vector3(0, 0, 4)),
    );
    expect(count('dirt', new THREE.Vector3(12, 0, 12))).toBeGreaterThan(
      count('dirt', new THREE.Vector3(0, 0, 17)),
    );
    const dirt = new WheelDustVisual('medium');
    const grass = new WheelDustVisual('medium');
    run(dirt);
    run(dirt);
    run(grass, contacts('grass'));
    run(grass, contacts('grass'));
    const a = new THREE.Color();
    const b = new THREE.Color();
    mesh(dirt).getColorAt(0, a);
    mesh(grass).getColorAt(0, b);
    expect(a.r).toBeGreaterThan(b.r);
    expect(b.g / b.r).toBeGreaterThan(a.g / a.r);
    dirt.dispose();
    grass.dispose();
  });
  it.each([
    ['low', 32],
    ['medium', 64],
    ['high', 96],
  ] as const)('caps %s dust without reallocating or casting shadows', (quality, limit) => {
    const dust = new WheelDustVisual(quality);
    const pool = mesh(dust);
    const geometry = pool.geometry;
    const material = pool.material;
    for (let i = 0; i < 500; i++) {
      run(dust, contacts(), new THREE.Vector3(20, 0, 20));
      expect(pool.count).toBeLessThanOrEqual(limit);
    }
    expect(pool.count).toBeGreaterThan(0);
    expect(pool.instanceMatrix.count).toBe(limit);
    expect(pool.geometry).toBe(geometry);
    expect(pool.material).toBe(material);
    expect(dust.group.children).toHaveLength(1);
    expect(pool.castShadow).toBe(false);
    expect(pool.receiveShadow).toBe(false);
    expect(pool.material.blending).toBe(THREE.NormalBlending);
    expect(pool.material.depthWrite).toBe(false);
    dust.dispose();
  });
  it('freezes pause/invalid time, fades without new emission, and clears/disposes once', () => {
    const dust = new WheelDustVisual('medium');
    run(dust);
    const pool = mesh(dust);
    const count = pool.count;
    const matrices = pool.instanceMatrix.array.slice();
    const random = vi.spyOn(Math, 'random');
    for (const dt of [0, -1, NaN]) run(dust, contacts(), new THREE.Vector3(0, 0, 16), dt);
    expect(pool.count).toBe(count);
    expect(pool.instanceMatrix.array).toEqual(matrices);
    for (let i = 0; i < 15; i++) run(dust, contacts('asphalt'));
    expect(pool.count).toBe(0);
    expect(dust.group.visible).toBe(false);
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
    run(dust);
    dust.update(contacts(), new THREE.Vector3(0, 0, 16), forward, camera, 0, false);
    expect(pool.count).toBe(0);
    let released = 0;
    let instancesReleased = 0;
    pool.addEventListener('dispose', () => {
      instancesReleased++;
    });
    for (const resource of [pool.geometry, pool.material, requireValue(pool.material.map)])
      resource.addEventListener('dispose', () => {
        released++;
      });
    dust.dispose();
    dust.dispose();
    run(dust);
    expect(released).toBe(3);
    expect(instancesReleased).toBe(1);
    expect(dust.group.children).toHaveLength(0);
  });
});
