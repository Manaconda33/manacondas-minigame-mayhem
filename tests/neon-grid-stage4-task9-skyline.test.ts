import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { GraphicsQuality } from '../src/config/graphicsQuality';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

function requireInstanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = scene.getObjectByName(name);
  expect(object, name).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

function planarDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function expectFiniteInstances(mesh: THREE.InstancedMesh): void {
  expect(mesh.count, mesh.name).toBeLessThanOrEqual(mesh.instanceMatrix.count);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, matrix);
    for (const value of matrix.elements) expect(Number.isFinite(value), mesh.name).toBe(true);
  }
}

describe('Neon Grid Stage 4 Task 9 T9.2 Skyline Straight', () => {
  it('owns only the approved Skyline range with bounded finite presentation batches', () => {
    const expectedWindows: Record<GraphicsQuality, number> = {
      low: 120,
      medium: 240,
      high: 360,
    };
    for (const quality of ['low', 'medium', 'high'] as const) {
      const scene = createNeonGridScene(new NeonGrid(), quality);
      try {
        expect(scene.skyline.group.name).toBe('skyline-visual');
        expect(scene.skyline.group.userData.progressRange).toEqual([0, 0.24654910452879084]);
        expect(scene.skyline.group.userData.quality).toBe(quality);
        const batches = [
          requireInstanced(scene, 'skyline-pylons'),
          requireInstanced(scene, 'skyline-cross-braces'),
          requireInstanced(scene, 'skyline-city-towers'),
          requireInstanced(scene, 'skyline-city-foundations'),
          requireInstanced(scene, 'skyline-city-roof-caps'),
          requireInstanced(scene, 'skyline-city-windows'),
          requireInstanced(scene, 'skyline-procedural-signage'),
          requireInstanced(scene, 'skyline-ad-manaconda-racing'),
          requireInstanced(scene, 'skyline-ad-taco-bell-live-mas'),
        ];
        expect(requireInstanced(scene, 'skyline-pylons').count).toBe(14);
        expect(requireInstanced(scene, 'skyline-cross-braces').count).toBe(24);
        expect(requireInstanced(scene, 'skyline-city-towers').count).toBe(22);
        expect(requireInstanced(scene, 'skyline-city-foundations').count).toBe(22);
        expect(requireInstanced(scene, 'skyline-city-roof-caps').count).toBe(22);
        expect(requireInstanced(scene, 'skyline-city-windows').count).toBe(expectedWindows[quality]);
        expect(requireInstanced(scene, 'skyline-procedural-signage').count).toBe(18);
        expect(requireInstanced(scene, 'skyline-ad-manaconda-racing').count).toBe(7);
        expect(requireInstanced(scene, 'skyline-ad-taco-bell-live-mas').count).toBe(7);
        for (const batch of batches) expectFiniteInstances(batch);
      } finally {
        disposeTrackScene(scene);
      }
    }
  }, 20000);

  it('grounds one presentation-only foundation beneath each unchanged tower footprint', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const towers = requireInstanced(scene, 'skyline-city-towers');
      const foundations = requireInstanced(scene, 'skyline-city-foundations');
      const track = new NeonGrid();
      expect(foundations.userData.presentationOnly).toBe(true);
      expect(foundations.userData.collision).toBe(false);

      const towerMatrix = new THREE.Matrix4();
      const foundationMatrix = new THREE.Matrix4();
      const towerPosition = new THREE.Vector3();
      const foundationPosition = new THREE.Vector3();
      const towerScale = new THREE.Vector3();
      const foundationScale = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      for (let i = 0; i < towers.count; i++) {
        towers.getMatrixAt(i, towerMatrix);
        foundations.getMatrixAt(i, foundationMatrix);
        towerMatrix.decompose(towerPosition, rotation, towerScale);
        foundationMatrix.decompose(foundationPosition, rotation, foundationScale);

        expect(foundationPosition.x).toBeCloseTo(towerPosition.x, 3);
        expect(foundationPosition.z).toBeCloseTo(towerPosition.z, 3);
        expect(foundationPosition.y + foundationScale.y).toBeCloseTo(towerPosition.y, 3);
        expect(foundationScale.x).toBeGreaterThan(towerScale.x);
        expect(foundationScale.z).toBeGreaterThan(towerScale.z);

        const radius = Math.hypot(foundationScale.x, foundationScale.z) * 0.5;
        const main = track.projectMain(foundationPosition);
        const gap = track.billboardGap.project(foundationPosition);
        expect(
          main.lateralDistance - track.halfWidthAt(main.progress) - radius,
        ).toBeGreaterThanOrEqual(3.5);
        expect(
          planarDistance(foundationPosition, gap.point) - track.billboardGap.roadHalfWidth - radius,
        ).toBeGreaterThanOrEqual(4.5);
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('batches varied stepped roof caps without reducing the 22 tower silhouettes', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const towers = requireInstanced(scene, 'skyline-city-towers');
      const caps = requireInstanced(scene, 'skyline-city-roof-caps');
      expect(towers.count).toBe(22);
      expect(caps.userData.presentationOnly).toBe(true);
      expectFiniteInstances(caps);

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const capHeights = new Set<number>();
      for (let i = 0; i < caps.count; i++) {
        caps.getMatrixAt(i, matrix);
        matrix.decompose(position, quaternion, scale);
        capHeights.add(Number(scale.y.toFixed(2)));
      }
      expect(capHeights.size).toBeGreaterThanOrEqual(3);
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('uses instance tint on Neon Grid city batches without requiring absent vertex colors', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      for (const name of [
        'skyline-city-towers',
        'skyline-city-foundations',
        'skyline-city-roof-caps',
        'skyline-city-corner-lights',
        'skyline-city-windows',
        'skyline-procedural-signage',
        'undercity-city-buildings',
        'undercity-city-windows',
        'undercity-work-lights',
        'falls-run-extension-city-towers',
        'falls-run-extension-city-windows',
      ]) {
        const mesh = requireInstanced(scene, name);
        expect(mesh.geometry.getAttribute('color'), name).toBeUndefined();
        expect(mesh.instanceColor, name).toBeDefined();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          expect(material.vertexColors, name).toBe(false);
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('keeps every visible Neon Grid shader compatible with the selective bloom mask', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const unsupported: string[] = [];
      scene.traverseVisible((object) => {
        if (!('material' in object)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (
            material instanceof THREE.ShaderMaterial &&
            material.userData.bloomBlackAdapter !== true
          ) {
            unsupported.push(object.name || material.name || material.type);
          }
        }
      });
      expect(unsupported).toEqual([]);
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('preserves the accepted Task 8 Falls Run look when course bloom is active', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      for (const name of [
        'falls-run-luminous-edges',
        'falls-run-luminous-top-rails',
        'falls-run-waterfall-lips',
        'falls-run-neon-signage',
      ]) {
        const object = scene.getObjectByName(name);
        expect(object, name).toBeDefined();
        if (!(object instanceof THREE.Mesh)) throw new Error(`Missing mesh: ${name}`);
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          const metadata: unknown = Reflect.get(material as object, 'userData');
          if (typeof metadata !== 'object' || metadata === null) {
            throw new Error(`Missing material metadata: ${name}`);
          }
          const bloomEmission: unknown = Reflect.get(metadata, 'bloomEmission');
          expect(bloomEmission, name).toBeUndefined();
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it(
    'bypasses Skyline wet asphalt on Low and keeps Medium/High avatar-safe',
    () => {
      for (const quality of ['low', 'medium', 'high'] as const) {
        const scene = createNeonGridScene(new NeonGrid(), quality);
        try {
          const wet = scene.getObjectByName('skyline-wet-asphalt');
          if (quality === 'low') {
            expect(wet).toBeUndefined();
            continue;
          }
          expect(wet).toBeInstanceOf(THREE.Mesh);
          const mesh = wet as THREE.Mesh;
          const material = mesh.material as THREE.Material;
          expect(mesh.renderOrder).toBeLessThan(0);
          expect(material.transparent).toBe(true);
          expect(material.depthWrite).toBe(false);
          expect(material.depthTest).toBe(true);
        } finally {
          disposeTrackScene(scene);
        }
      }
    },
    20000,
  );

  it('freezes Skyline animation while hidden and resumes without catch-up', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const wet = scene.getObjectByName('skyline-wet-asphalt') as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.ShaderMaterial
      >;
      scene.skyline.update(2);
      expect(wet.material.uniforms.time?.value).toBe(2);
      scene.skyline.group.visible = false;
      scene.skyline.update(3);
      expect(wet.material.uniforms.time?.value).toBe(2);
      scene.skyline.group.visible = true;
      scene.skyline.update(4);
      expect(wet.material.uniforms.time?.value).toBe(3);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('disposes Skyline-owned resources exactly once before whole-scene cleanup', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    const asphalt = scene.getObjectByName('skyline-asphalt-base');
    expect(asphalt).toBeInstanceOf(THREE.Mesh);
    if (!(asphalt instanceof THREE.Mesh)) throw new Error('Missing Skyline asphalt');
    const material = asphalt.material as THREE.MeshStandardMaterial;
    const ownedTexture = new THREE.Texture();
    material.map = ownedTexture;
    const geometryDispose = vi.spyOn(asphalt.geometry, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');
    const textureDispose = vi.spyOn(ownedTexture, 'dispose');
    try {
      scene.skyline.dispose();
      scene.skyline.dispose();
      expect(scene.skyline.group.children).toHaveLength(0);
      expect(geometryDispose).toHaveBeenCalledTimes(1);
      expect(materialDispose).toHaveBeenCalledTimes(1);
      expect(textureDispose).toHaveBeenCalledTimes(1);
    } finally {
      disposeTrackScene(scene);
    }
    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
  });

  it('keeps approved static mask ads separate from the Billboard tell', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      expect(requireInstanced(scene, 'skyline-ad-manaconda-racing').count).toBe(7);
      expect(requireInstanced(scene, 'skyline-ad-taco-bell-live-mas').count).toBe(7);
      expect(scene.getObjectByName('billboard-hologram')).toBeDefined();
      expect(scene.getObjectByName('billboard-ad-paprika')).toBeDefined();
      expect(scene.getObjectByName('billboard-ad-arin')).toBeDefined();
      expect(scene.getObjectByName('billboard-ad-raven')).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
  });
});
