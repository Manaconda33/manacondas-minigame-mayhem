import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { neonGridRibbon } from '../src/game/track/NeonGridGeometry';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

function planarDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function requireMesh(scene: THREE.Object3D, name: string): THREE.Mesh {
  const object = scene.getObjectByName(name);
  expect(object, name).toBeInstanceOf(THREE.Mesh);
  return object as THREE.Mesh;
}

describe('Neon Grid T9.2 owner-review corrections', () => {
  it('keeps all Skyline tower footprints outside the main road and Billboard shortcut', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const towers = scene.getObjectByName('skyline-city-towers');
      expect(towers).toBeInstanceOf(THREE.InstancedMesh);
      const mesh = towers as THREE.InstancedMesh;
      expect(mesh.count).toBe(22);
      expect(scene.skyline.group.userData.skylineLogicalTowerCount).toBe(22);

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, matrix);
        matrix.decompose(position, quaternion, scale);
        const radius = Math.hypot(scale.x, scale.z) * 0.52;
        const main = track.projectMain(position);
        const gap = track.billboardGap.project(position);
        expect(
          main.lateralDistance - track.halfWidthAt(main.progress) - radius,
          `tower ${String(i)} main clearance`,
        ).toBeGreaterThanOrEqual(5);
        expect(
          planarDistance(position, gap.point) - track.billboardGap.roadHalfWidth - radius,
          `tower ${String(i)} Billboard clearance`,
        ).toBeGreaterThanOrEqual(6);
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('mounts approved and procedural signage on architecture instead of free-floating route space', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const towers = scene.getObjectByName('skyline-city-towers') as THREE.InstancedMesh;
      const supports = scene.getObjectByName('skyline-ad-supports') as THREE.InstancedMesh;
      expect(supports).toBeInstanceOf(THREE.InstancedMesh);
      expect(supports.count).toBe(6);

      const towerPositions: THREE.Vector3[] = [];
      const matrix = new THREE.Matrix4();
      for (let i = 0; i < towers.count; i++) {
        towers.getMatrixAt(i, matrix);
        towerPositions.push(new THREE.Vector3().setFromMatrixPosition(matrix));
      }

      for (const name of [
        'skyline-ad-manaconda-racing',
        'skyline-ad-taco-bell-live-mas',
        'skyline-procedural-signage',
      ]) {
        const signs = scene.getObjectByName(name) as THREE.InstancedMesh;
        expect(signs, name).toBeInstanceOf(THREE.InstancedMesh);
        for (let i = 0; i < signs.count; i++) {
          signs.getMatrixAt(i, matrix);
          const position = new THREE.Vector3().setFromMatrixPosition(matrix);
          expect(
            Math.min(...towerPositions.map((tower) => planarDistance(position, tower))),
            `${name} ${String(i)} facade proximity`,
          ).toBeLessThan(12);
          const gap = track.billboardGap.project(position);
          expect(
            planarDistance(position, gap.point) - track.billboardGap.roadHalfWidth,
            `${name} ${String(i)} shortcut clearance`,
          ).toBeGreaterThan(3);
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('cuts Skyline and Falls presentation roads from the accepted dense road ribbon', () => {
    const track = new NeonGrid();
    const native = neonGridRibbon(track);
    const scene = createNeonGridScene(track, 'medium');
    try {
      const nativePosition = native.getAttribute('position');
      for (const name of ['skyline-asphalt-base', 'skyline-wet-asphalt', 'falls-run-asphalt-base', 'falls-run-wet-asphalt']) {
        const mesh = requireMesh(scene, name);
        const geometry = mesh.geometry;
        expect(geometry.userData.conformsToMainRibbon, name).toBe(true);
        expect(geometry.getAttribute('position').count, name).toBe(nativePosition.count);
        const indices = geometry.index?.array;
        expect(indices?.length ?? 0, name).toBeGreaterThan(0);
        for (const index of Array.from(indices ?? []).slice(0, 18)) {
          const p = new THREE.Vector3().fromBufferAttribute(geometry.getAttribute('position'), index);
          const expected = new THREE.Vector3().fromBufferAttribute(nativePosition, index);
          expect(p.distanceTo(expected), name).toBeLessThan(1e-7);
        }
      }
    } finally {
      native.dispose();
      disposeTrackScene(scene);
    }
  }, 20000);

  it('renders the night sky without camera-translation boundaries', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const sky = requireMesh(scene, 'falls-run-night-sky');
      expect(sky.userData.cameraRelative).toBe(true);
      expect(sky.frustumCulled).toBe(false);
      const material = sky.material as THREE.ShaderMaterial;
      expect(material.vertexShader).toContain('mat4(mat3(viewMatrix))');
      expect(material.vertexShader).not.toContain('modelViewMatrix * vec4(position');
    } finally {
      disposeTrackScene(scene);
    }
  });
});
