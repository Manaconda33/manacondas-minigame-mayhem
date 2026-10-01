import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { PlayerSpeedVisual } from '../src/game/vfx/PlayerSpeedVisual';

function strokes(
  visual: PlayerSpeedVisual,
): THREE.InstancedMesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
  return visual.group.getObjectByName('speed-line-pool') as THREE.InstancedMesh<
    THREE.PlaneGeometry,
    THREE.ShaderMaterial
  >;
}

describe('restrained player speed presentation', () => {
  it('smooths into a bounded projection without moving the camera or changing its aspect', () => {
    const camera = new THREE.PerspectiveCamera(62, 1.8);
    camera.position.set(2, 3, -5);
    const visual = new PlayerSpeedVisual(camera, 'medium');
    const initialProjection = camera.projectionMatrix.clone();
    visual.update(1, 1 / 60);
    expect(camera.fov).toBeGreaterThan(62);
    expect(camera.fov).toBeLessThan(63);
    for (let i = 0; i < 90; i++) visual.update(10, 1 / 60);
    expect(camera.fov).toBeGreaterThan(67.9);
    expect(camera.fov).toBeLessThanOrEqual(68);
    expect(camera.projectionMatrix.equals(initialProjection)).toBe(false);
    expect(camera.position.toArray()).toEqual([2, 3, -5]);
    expect(camera.aspect).toBe(1.8);
    visual.dispose();
  });

  it('keeps slow and reverse travel clear and fades back after high-speed travel', () => {
    const camera = new THREE.PerspectiveCamera(62);
    const visual = new PlayerSpeedVisual(camera, 'low');
    for (const speed of [0, 0.5, -1, Number.NaN, Infinity]) {
      visual.update(speed, 0.1);
      expect(strokes(visual).count).toBe(0);
      expect(camera.fov).toBe(62);
    }
    for (let i = 0; i < 20; i++) visual.update(1, 0.1);
    for (let i = 0; i < 30; i++) visual.update(0, 0.1);
    expect(strokes(visual).count).toBe(0);
    expect(camera.fov).toBeCloseTo(62, 3);
    visual.dispose();
  });

  it.each([
    ['low', 6],
    ['medium', 10],
    ['high', 14],
  ] as const)(
    'bounds %s strokes away from the central road and upper/lower HUD regions',
    (quality, cap) => {
      const camera = new THREE.PerspectiveCamera(62);
      const visual = new PlayerSpeedVisual(camera, quality);
      const mesh = strokes(visual);
      expect(mesh.instanceMatrix.count).toBe(cap);
      const matrix = new THREE.Matrix4();
      const point = new THREE.Vector3();
      const vertices = mesh.geometry.getAttribute('position');
      for (let frame = 0; frame < 120; frame++) {
        visual.update(2, 1 / 60);
        expect(mesh.count).toBeLessThanOrEqual(cap);
        for (let i = 0; i < mesh.count; i++) {
          mesh.getMatrixAt(i, matrix);
          for (let v = 0; v < vertices.count; v++) {
            point.fromBufferAttribute(vertices, v).applyMatrix4(matrix);
            expect(Math.abs(point.x)).toBeGreaterThan(0.77);
            expect(Math.abs(point.y)).toBeLessThan(0.78);
          }
        }
      }
      expect(mesh.material.uniforms.strength?.value).toBeLessThanOrEqual(0.16);
      expect(mesh.castShadow).toBe(false);
      expect(mesh.material.depthTest).toBe(false);
      expect(mesh.material.depthWrite).toBe(false);
      visual.dispose();
    },
  );

  it('freezes zero/invalid time and clears even while paused when disabled', () => {
    const camera = new THREE.PerspectiveCamera(62);
    const visual = new PlayerSpeedVisual(camera, 'medium');
    visual.update(1, 0.1);
    const mesh = strokes(visual);
    const matrix = mesh.instanceMatrix.array.slice();
    const fov = camera.fov;
    for (const dt of [0, -1, Number.NaN, Infinity]) visual.update(0, dt);
    expect(mesh.instanceMatrix.array).toEqual(matrix);
    expect(camera.fov).toBe(fov);
    visual.update(1, 0, false);
    expect(mesh.count).toBe(0);
    expect(visual.group.visible).toBe(false);
    expect(camera.fov).toBe(62);
    visual.dispose();
  });

  it('releases its own buffers, geometry and material once and cannot revive after disposal', () => {
    const camera = new THREE.PerspectiveCamera(62);
    const visual = new PlayerSpeedVisual(camera, 'high');
    const mesh = strokes(visual);
    let released = 0;
    mesh.addEventListener('dispose', () => released++);
    mesh.geometry.addEventListener('dispose', () => released++);
    mesh.material.addEventListener('dispose', () => released++);
    visual.update(1, 0.1);
    visual.dispose();
    visual.dispose();
    visual.update(1, 0.1);
    expect(released).toBe(3);
    expect(camera.fov).toBe(62);
    expect(visual.group.children).toHaveLength(0);
  });
});
