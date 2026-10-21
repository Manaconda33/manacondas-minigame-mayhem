import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { neonGridVisualVariantFromSearch } from '../src/game/track/NeonGridVisualVariant';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

it('isolates Task A while retaining every previous visual selector', () => {
  expect(neonGridVisualVariantFromSearch('?neonGridVisual=neon-grid-task-a-001')).toBe(
    'fog-experiment-task-a',
  );
  expect(neonGridVisualVariantFromSearch('?neonGridVisual=abyss-fog-004')).toBe(
    'fog-experiment-v3-2',
  );
  expect(neonGridVisualVariantFromSearch('')).toBe('approved');
});

describe('Task A structurally supported sponsor visibility', () => {
  it('keeps V3.2 lifted composition and moves only sponsor matrices in the new variant', () => {
    const track = new NeonGrid();
    const base = createNeonGridScene(track, 'medium', 'fog-experiment-v3-2');
    const next = createNeonGridScene(
      track,
      'medium',
      neonGridVisualVariantFromSearch('?neonGridVisual=neon-grid-task-a-001'),
    );
    try {
      const allowed = new Set([
        'skyline-ad-manaconda-racing',
        'skyline-ad-taco-bell-live-mas',
        'skyline-ad-supports',
        'undercity-ad-nightshift-noodles',
        'undercity-ad-voltline-industrial',
        'undercity-ad-supports',
      ]);
      const ad = base.getObjectByName('undercity-ad-nightshift-noodles') as THREE.InstancedMesh;
      const matrix = new THREE.Matrix4();
      ad.getMatrixAt(0, matrix);
      const p = new THREE.Vector3().setFromMatrixPosition(matrix);
      // The scene normalizes V3.2 to V3 for the district builders: it already lifts ads.
      expect(p.y - track.projectMain(p).point.y).toBeGreaterThan(-7);
      expect(next.userData.abyssFogV3).toEqual(base.userData.abyssFogV3);
      base.traverse((o) => {
        if (!(o instanceof THREE.Mesh) || !o.name) return;
        const n = next.getObjectByName(o.name);
        expect(n, o.name).toBeInstanceOf(THREE.Mesh);
        if (!(n instanceof THREE.Mesh)) throw new Error(`Missing presentation mesh: ${o.name}`);
        if (!o.name) return;
        expect(
          Array.from((n.geometry as THREE.BufferGeometry).getAttribute('position').array),
          o.name,
        ).toEqual(Array.from((o.geometry as THREE.BufferGeometry).getAttribute('position').array));
        if (o instanceof THREE.InstancedMesh && !allowed.has(o.name))
          expect(Array.from((n as THREE.InstancedMesh).instanceMatrix.array), o.name).toEqual(
            Array.from(o.instanceMatrix.array),
          );
      });
      for (const name of ['skyline-ad-manaconda-racing', 'skyline-ad-taco-bell-live-mas']) {
        const a = base.getObjectByName(name) as THREE.InstancedMesh,
          b = next.getObjectByName(name) as THREE.InstancedMesh;
        expect(b.count).toBe(7);
        const towers = next.getObjectByName('skyline-city-towers') as THREE.InstancedMesh;
        next.updateMatrixWorld(true);
        for (let i = 0; i < 3; i++) {
          const m = new THREE.Matrix4();
          b.getMatrixAt(i, m);
          const normal = new THREE.Vector3(0, 0, 1).transformDirection(m);
          for (const [x, y] of [
            [0, 0],
            [-4, -1.9],
            [4, -1.9],
            [-4, 1.9],
            [4, 1.9],
          ]) {
            const point = new THREE.Vector3(x, y, 0).applyMatrix4(m);
            const ray = new THREE.Raycaster(point, normal.clone().negate(), 0, 0.3);
            expect(
              ray.intersectObject(towers, false).length,
              `${name} upper facade`,
            ).toBeGreaterThan(0);
          }
        }
        for (let i = 3; i < 7; i++) {
          const x = new THREE.Matrix4(),
            y = new THREE.Matrix4();
          a.getMatrixAt(i, x);
          b.getMatrixAt(i, y);
          expect(y.elements).toEqual(x.elements);
        }
      }
      for (const name of ['undercity-ad-nightshift-noodles', 'undercity-ad-voltline-industrial']) {
        const signs = next.getObjectByName(name) as THREE.InstancedMesh;
        const wall = next.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh;
        expect(signs.count).toBe(2);
        next.updateMatrixWorld(true);
        for (let i = 0; i < signs.count; i++) {
          const m = new THREE.Matrix4();
          signs.getMatrixAt(i, m);
          const normal = new THREE.Vector3(0, 0, 1).transformDirection(m);
          for (const [x, y] of [
            [0, -1.9],
            [-4, -1.9],
            [4, -1.9],
          ]) {
            const point = new THREE.Vector3(x, y, 0).applyMatrix4(m);
            const ray = new THREE.Raycaster(point, normal.clone().negate(), 0, 0.9);
            expect(
              ray.intersectObject(wall, false).length,
              `${name} ${String(i)} backing`,
            ).toBeGreaterThan(0);
          }
          const backing = next.getObjectByName('undercity-ad-supports') as THREE.InstancedMesh;
          for (const [x, y] of [
            [0, 0],
            [-4, -1.9],
            [4, -1.9],
            [-4, 1.9],
            [4, 1.9],
          ]) {
            const point = new THREE.Vector3(x, y, 0).applyMatrix4(m);
            const ray = new THREE.Raycaster(point, normal.clone().negate(), 0, 0.3);
            expect(ray.intersectObject(backing, false).length, 'full ad backing').toBeGreaterThan(
              0,
            );
          }
          const center = new THREE.Vector3().setFromMatrixPosition(m);
          expect(center.y - track.projectMain(center).point.y).toBeGreaterThan(2.1);
        }
      }
    } finally {
      disposeTrackScene(base);
      disposeTrackScene(next);
    }
  }, 30000);
});

it.each(['low', 'high'] as const)(
  'retains supported sponsor groups on %s quality',
  (quality) => {
    const scene = createNeonGridScene(
      new NeonGrid(),
      quality,
      neonGridVisualVariantFromSearch('?neonGridVisual=neon-grid-task-a-001'),
    );
    try {
      for (const name of [
        'skyline-ad-manaconda-racing',
        'skyline-ad-taco-bell-live-mas',
        'undercity-ad-nightshift-noodles',
        'undercity-ad-voltline-industrial',
      ]) {
        expect(scene.getObjectByName(name)).toBeInstanceOf(THREE.InstancedMesh);
      }
      expect(scene.userData.abyssFogV3).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
  },
  30000,
);
