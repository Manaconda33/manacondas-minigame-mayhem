import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { GraphicsQuality } from '../src/config/graphicsQuality';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene, type NeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

const TASK8_MEDIUM_INSTANCES = {
  'falls-run-pylons': 12,
  'falls-run-cross-braces': 22,
  'falls-run-city-towers': 24,
  'falls-run-city-windows': 320,
  'falls-run-city-roof-lights': 24,
  'falls-run-ambient-waterfalls': 12,
  'falls-run-waterfall-lips': 12,
  'falls-run-ambient-mist': 32,
  'falls-run-plunge-spray': 12,
  'falls-run-neon-signage': 18,
  'falls-run-dive-rail-debris': 10,
} as const;

const FUTURE_OWNER_NAMES = [
  'skyline-visual',
  'undercity-visual',
  'falls-run-extension-visual',
] as const;

const FUTURE_WET_ROAD_NAMES = [
  'skyline-wet-asphalt',
  'undercity-wet-asphalt',
  'falls-run-extension-wet-asphalt',
] as const;

function requireInstanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = scene.getObjectByName(name);
  expect(object, name).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

function expectAcceptedTask8Baseline(scene: NeonGridScene): void {
  const falls = scene.getObjectByName('falls-run-visual');
  expect(falls).toBeInstanceOf(THREE.Group);
  expect(falls?.userData.progressRange).toEqual([0.7, 0.85]);
  expect(falls?.userData.quality).toBe('medium');

  for (const [name, count] of Object.entries(TASK8_MEDIUM_INSTANCES)) {
    expect(requireInstanced(scene, name).count, name).toBe(count);
  }

  const wet = scene.getObjectByName('falls-run-wet-asphalt') as THREE.Mesh;
  expect(wet).toBeDefined();
  expect(wet.renderOrder).toBe(-10);
  const material = wet.material as THREE.Material;
  expect(material.transparent).toBe(true);
  expect(material.depthWrite).toBe(false);
  expect(material.depthTest).toBe(true);

  expect(scene.getObjectByName('billboard-hologram')).toBeDefined();
  expect(scene.getObjectByName('service-tunnel')).toBeDefined();
  expect(scene.getObjectByName('waterfall-dive')).toBeDefined();
  expect(scene.getObjectByName('billboard-boost-pad')).toBeDefined();
  expect(scene.children.filter((child) => child.name.startsWith('boost-pad-'))).toHaveLength(4);
}

describe('Neon Grid Stage 4 Task 9 T9.0 frozen baseline', () => {
  it('freezes the accepted Task 8 group, instance, compositing, and shortcut baseline', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      expectAcceptedTask8Baseline(scene);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('freezes the accepted Task 8 quality-scaled counts before course-wide dressing', () => {
    const expectations: Record<GraphicsQuality, { windows: number; mist: number; wet: boolean }> = {
      low: { windows: 160, mist: 16, wet: false },
      medium: { windows: 320, mist: 32, wet: true },
      high: { windows: 480, mist: 48, wet: true },
    };

    for (const quality of ['low', 'medium', 'high'] as const) {
      const scene = createNeonGridScene(new NeonGrid(), quality);
      try {
        expect(requireInstanced(scene, 'falls-run-city-windows').count).toBe(
          expectations[quality].windows,
        );
        expect(requireInstanced(scene, 'falls-run-ambient-mist').count).toBe(
          expectations[quality].mist,
        );
        expect(Boolean(scene.getObjectByName('falls-run-wet-asphalt'))).toBe(
          expectations[quality].wet,
        );
      } finally {
        disposeTrackScene(scene);
      }
    }
  }, 20000);
});

describe('Neon Grid Stage 4 Task 9 T9.0 RED contracts', () => {
  it.fails('requires presentation owners to expose explicit owned-resource disposal', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const visual = scene.fallsRun as unknown as { dispose?: () => void };
      expect(visual.dispose).toBeTypeOf('function');
    } finally {
      disposeTrackScene(scene);
    }
  });

  it.fails('freezes animated presentation when its visual owner is hidden', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const wet = scene.getObjectByName('falls-run-wet-asphalt') as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.ShaderMaterial
      >;
      scene.fallsRun.update(2);
      expect(wet.material.uniforms.time?.value).toBe(2);
      scene.fallsRun.group.visible = false;
      scene.fallsRun.update(3);
      expect(wet.material.uniforms.time?.value).toBe(2);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it.fails('requires bounded finite Task 9 sector owners on every quality tier', () => {
    for (const quality of ['low', 'medium', 'high'] as const) {
      const scene = createNeonGridScene(new NeonGrid(), quality);
      try {
        for (const name of FUTURE_OWNER_NAMES) {
          const owner = scene.getObjectByName(name);
          expect(owner, `${name} must exist on ${quality}`).toBeInstanceOf(THREE.Group);
          expect(owner?.userData.quality, name).toBe(quality);
          owner?.traverse((object) => {
            if (!(object instanceof THREE.InstancedMesh)) return;
            expect(object.count, object.name).toBeLessThanOrEqual(object.instanceMatrix.count);
            const matrix = new THREE.Matrix4();
            for (let i = 0; i < object.count; i++) {
              object.getMatrixAt(i, matrix);
              for (const value of matrix.elements) expect(Number.isFinite(value)).toBe(true);
            }
          });
        }
      } finally {
        disposeTrackScene(scene);
      }
    }
  }, 20000);

  it.fails('requires Low wet-road bypass and safe avatar compositing for every new sector pass', () => {
    const low = createNeonGridScene(new NeonGrid(), 'low');
    const medium = createNeonGridScene(new NeonGrid(), 'medium');
    const high = createNeonGridScene(new NeonGrid(), 'high');
    try {
      for (const name of FUTURE_WET_ROAD_NAMES) {
        expect(low.getObjectByName(name), `${name} must be omitted on Low`).toBeUndefined();
        for (const scene of [medium, high]) {
          const wet = scene.getObjectByName(name);
          expect(wet, `${name} must exist on Medium/High`).toBeInstanceOf(THREE.Mesh);
          const mesh = wet as THREE.Mesh;
          const material = mesh.material as THREE.Material;
          expect(mesh.renderOrder, name).toBeLessThan(0);
          expect(material.transparent, name).toBe(true);
          expect(material.depthWrite, name).toBe(false);
          expect(material.depthTest, name).toBe(true);
        }
      }
    } finally {
      disposeTrackScene(low);
      disposeTrackScene(medium);
      disposeTrackScene(high);
    }
  }, 20000);
});
