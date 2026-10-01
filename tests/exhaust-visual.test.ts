import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ExhaustVisual, type ExhaustEmitter } from '../src/game/vfx/ExhaustVisual';

function emitter(id = 'player', x = 0): ExhaustEmitter {
  const mesh = new THREE.Group();
  mesh.position.set(x, 0, -5);
  mesh.updateMatrixWorld();
  return {
    id,
    mesh,
    speedRatio: 1,
    boostActive: false,
    purpleBoost: false,
    itemExhaustActive: false,
    active: true,
    player: id === 'player',
  };
}
function pool(v: ExhaustVisual) {
  return v.group.children[0] as THREE.InstancedMesh;
}
function positions(v: ExhaustVisual) {
  const mesh = pool(v),
    matrix = new THREE.Matrix4();
  return Array.from({ length: mesh.count }, (_, i) => {
    mesh.getMatrixAt(i, matrix);
    return new THREE.Vector3().setFromMatrixPosition(matrix);
  });
}
const camera = new THREE.PerspectiveCamera(62, 1.5, 0.1, 100);
camera.updateMatrixWorld();

describe('shared restrained exhaust and ordinary boost flares', () => {
  it('suppresses slow/reverse/invalid speeds and grows ordinary boosts without changing kart transforms', () => {
    const v = new ExhaustVisual('medium'),
      e = emitter();
    for (const speed of [0, 0.5, -1, NaN, Infinity]) {
      e.speedRatio = speed;
      v.update([e], camera, 0.1);
      expect(pool(v).count).toBe(0);
    }
    e.speedRatio = 1;
    v.update([e], camera, 0.1);
    const normalCount = pool(v).count,
      normalMatrix = new THREE.Matrix4();
    pool(v).getMatrixAt(0, normalMatrix);
    const kartBefore = e.mesh.matrixWorld.clone();
    e.boostActive = true;
    v.update([e], camera, 0.1);
    const boostMatrix = new THREE.Matrix4();
    pool(v).getMatrixAt(0, boostMatrix);
    expect(normalCount).toBe(2);
    expect(pool(v).count).toBeGreaterThan(normalCount);
    expect(new THREE.Vector3().setFromMatrixScale(boostMatrix).z).toBeGreaterThan(
      new THREE.Vector3().setFromMatrixScale(normalMatrix).z,
    );
    expect(e.mesh.matrixWorld.equals(kartBefore)).toBe(true);
    e.purpleBoost = true;
    v.update([e], camera, 0.1);
    expect(pool(v).count).toBe(0);
    e.purpleBoost = false;
    e.itemExhaustActive = true;
    v.update([e], camera, 0.1);
    expect(pool(v).count).toBe(0);
    v.dispose();
  });
  it.each([
    ['low', 24],
    ['medium', 48],
    ['high', 72],
  ] as const)('shares the %s cap across eight racers, culling far/hidden AI', (quality, cap) => {
    const v = new ExhaustVisual(quality);
    const racers = Array.from({ length: 8 }, (_, i) =>
      emitter(i === 0 ? 'player' : String(i), i * 0.3),
    );
    racers.forEach((e) => (e.boostActive = true));
    for (let i = 0; i < 60; i++) v.update(racers, camera, 1 / 60);
    expect(pool(v).count).toBeGreaterThan(16);
    expect(pool(v).count).toBeLessThanOrEqual(cap);
    expect(v.group.children).toHaveLength(1);
    expect(pool(v).castShadow).toBe(false);
    racers.slice(1).forEach((e) => {
      e.mesh.position.z = 70;
      e.mesh.updateMatrixWorld();
    });
    v.update(racers, camera, 0.1);
    expect(positions(v).every((p) => p.z < 0)).toBe(true);
    expect(pool(v).count).toBeLessThanOrEqual(cap / 8);
    v.dispose();
  });
  it('uses modeled outlet ends before batching, keeps owner cleanup independent and freezes pause', () => {
    const v = new ExhaustVisual('medium'),
      a = emitter(),
      b = emitter('ai', 2);
    const model = new THREE.Group();
    model.rotation.y = Math.PI;
    model.scale.setScalar(2);
    const outlet = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.6),
      new THREE.MeshBasicMaterial(),
    );
    outlet.name = 'Exhaust_L';
    outlet.position.set(0.5, 0.7, 1.5);
    model.add(outlet);
    v.captureModel(a.mesh, model);
    model.clear();
    v.update([a, b], camera, 0.1);
    expect(
      positions(v).some(
        (p) => Math.abs(p.x + 1) < 0.01 && Math.abs(p.y - 1.4) < 0.01 && p.z < -8.6,
      ),
    ).toBe(true);
    const before = pool(v).instanceMatrix.array.slice();
    for (const dt of [0, -1, NaN, Infinity]) v.update([], camera, dt);
    expect(pool(v).instanceMatrix.array).toEqual(before);
    v.clearRacer('player');
    expect(positions(v).every((p) => p.x > 1)).toBe(true);
    b.active = false;
    v.update([b], camera, 0.1);
    expect(pool(v).count).toBe(0);
    a.boostActive = true;
    v.update([a], camera, 0.1);
    v.update([a], camera, 0, false);
    expect(pool(v).count).toBe(0);
    let releases = 0;
    pool(v).addEventListener('dispose', () => releases++);
    pool(v).geometry.addEventListener('dispose', () => releases++);
    (pool(v).material as THREE.Material).addEventListener('dispose', () => releases++);
    v.dispose();
    v.dispose();
    v.update([a], camera, 0.1);
    expect(releases).toBe(3);
    expect(v.group.children).toHaveLength(0);
  });
});
