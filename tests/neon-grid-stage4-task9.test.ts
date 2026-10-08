import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
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

const FUTURE_OWNER_NAMES = ['falls-run-extension-visual'] as const;

const FUTURE_WET_ROAD_NAMES = ['falls-run-extension-wet-asphalt'] as const;

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

describe('Neon Grid Stage 4 Task 9 T9.3 Undercity', () => {
  it('mounts bounded Undercity presentation and approved utility-mask assets', () => {
    const expectedWindows: Record<GraphicsQuality, number> = { low: 80, medium: 160, high: 240 };
    for (const quality of ['low', 'medium', 'high'] as const) {
      const scene = createNeonGridScene(new NeonGrid(), quality);
      try {
        const owner = scene.getObjectByName('undercity-visual');
        expect(owner).toBeInstanceOf(THREE.Group);
        expect(owner?.userData.progressRange).toEqual([0.24654910452879084, 0.46154128347522666]);
        expect(owner?.userData.quality).toBe(quality);
        expect(requireInstanced(scene, 'undercity-city-buildings').count).toBe(16);
        expect(requireInstanced(scene, 'undercity-building-foundations').count).toBe(16);
        expect(requireInstanced(scene, 'undercity-roof-plants').count).toBe(32);
        expect(requireInstanced(scene, 'undercity-loading-bay-doors').count).toBe(16);
        expect(requireInstanced(scene, 'undercity-facade-ribs').count).toBe(32);
        expect(requireInstanced(scene, 'undercity-utility-pads').count).toBe(20);
        expect(requireInstanced(scene, 'undercity-service-bay-backs').count).toBe(10);
        expect(requireInstanced(scene, 'undercity-city-windows').count).toBe(expectedWindows[quality]);
        expect(requireInstanced(scene, 'undercity-utility-boxes').count).toBe(20);
        expect(requireInstanced(scene, 'undercity-pipes').count).toBe(26);
        expect(requireInstanced(scene, 'undercity-work-lights').count).toBe(24);
        expect(requireInstanced(scene, 'undercity-service-bays').count).toBe(10);
        expect(requireInstanced(scene, 'undercity-ad-nightshift-noodles').count).toBe(2);
        expect(requireInstanced(scene, 'undercity-ad-voltline-industrial').count).toBe(2);
        expect(Boolean(scene.getObjectByName('undercity-wet-asphalt'))).toBe(quality !== 'low');

        owner?.traverse((object) => {
          if (!(object instanceof THREE.InstancedMesh)) return;
          expect(object.count, object.name).toBeLessThanOrEqual(object.instanceMatrix.count);
          const matrix = new THREE.Matrix4();
          for (let i = 0; i < object.count; i++) {
            object.getMatrixAt(i, matrix);
            for (const value of matrix.elements) expect(Number.isFinite(value)).toBe(true);
          }
        });
      } finally {
        disposeTrackScene(scene);
      }
    }
  }, 20000);

  it('anchors industrial scenery and uses track-derived road-edge vertices', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const edge = scene.getObjectByName('undercity-magenta-edges') as THREE.Mesh;
      expect(edge).toBeInstanceOf(THREE.Mesh);
      expect(edge.geometry.getAttribute('position').count).toBeGreaterThan(120);
      expect((edge.material as THREE.Material).depthWrite).toBe(false);
      expect((edge.material as THREE.Material).polygonOffset).toBe(true);

      const buildings = requireInstanced(scene, 'undercity-city-buildings');
      const foundations = requireInstanced(scene, 'undercity-building-foundations');
      const roofs = requireInstanced(scene, 'undercity-roof-plants');
      const pipes = requireInstanced(scene, 'undercity-pipes');
      const frame = new THREE.Matrix4();
      const scale = new THREE.Vector3(), p = new THREE.Vector3(), q = new THREE.Quaternion();
      for (let i = 0; i < buildings.count; i++) {
        buildings.getMatrixAt(i, frame); frame.decompose(p, q, scale);
        const ground = p.y;
        foundations.getMatrixAt(i, frame); frame.decompose(p, q, scale);
        expect(p.y + scale.y * 0.5).toBeGreaterThanOrEqual(ground);
        for (const roof of [i * 2, i * 2 + 1]) {
          roofs.getMatrixAt(roof, frame); frame.decompose(p, q, scale);
          expect(p.y - scale.y * 0.5).toBeGreaterThan(ground);
        }
      }
      for (let i = 0; i < pipes.count; i++) {
        pipes.getMatrixAt(i, frame); frame.decompose(p, q, scale);
        expect(scale.y).toBeGreaterThan(5);
      }
      for (const name of ['undercity-ad-nightshift-noodles','undercity-ad-voltline-industrial']) {
        const ads = requireInstanced(scene, name);
        for (let i = 0; i < ads.count; i++) {
          ads.getMatrixAt(i, frame); frame.decompose(p, q, scale);
          expect(p.toArray().every(Number.isFinite)).toBe(true);
          expect((ads.geometry as THREE.PlaneGeometry).parameters.width).toBeGreaterThan(8);
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps the wet-road pass avatar-safe and freezes hidden Undercity animation', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const wet = scene.getObjectByName('undercity-wet-asphalt') as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.ShaderMaterial
      >;
      expect(wet).toBeInstanceOf(THREE.Mesh);
      expect(wet.renderOrder).toBe(-10);
      expect(wet.material.transparent).toBe(true);
      expect(wet.material.depthWrite).toBe(false);
      expect(wet.material.depthTest).toBe(true);

      scene.undercity.update(2);
      expect(wet.material.uniforms.time?.value).toBe(2);
      scene.undercity.group.visible = false;
      scene.undercity.update(4);
      expect(wet.material.uniforms.time?.value).toBe(2);
      scene.undercity.group.visible = true;
      scene.undercity.update(5);
      expect(wet.material.uniforms.time?.value).toBe(3);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('disposes Undercity-owned resources exactly once while preserving the shared race scene contract', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    const asphalt = scene.getObjectByName('undercity-asphalt-base');
    expect(asphalt).toBeInstanceOf(THREE.Mesh);
    if (!(asphalt instanceof THREE.Mesh)) throw new Error('Missing Undercity asphalt');
    const geometryDispose = vi.spyOn(asphalt.geometry, 'dispose');
    const material = asphalt.material as THREE.Material;
    const materialDispose = vi.spyOn(material, 'dispose');
    try {
      expect(scene.getObjectByName('service-tunnel')).toBeDefined();
      scene.undercity.dispose();
      scene.undercity.dispose();
      expect(scene.undercity.group.children).toHaveLength(0);
      expect(geometryDispose).toHaveBeenCalledTimes(1);
      expect(materialDispose).toHaveBeenCalledTimes(1);
      expect(scene.getObjectByName('service-tunnel')).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
  });
});

describe('Neon Grid Stage 4 Task 9 T9.0 RED contracts', () => {
  it('requires presentation owners to expose explicit owned-resource disposal', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    const asphalt = scene.getObjectByName('falls-run-asphalt-base');
    expect(asphalt).toBeInstanceOf(THREE.Mesh);
    if (!(asphalt instanceof THREE.Mesh)) throw new Error('Missing Falls Run asphalt');

    const material = asphalt.material as THREE.MeshStandardMaterial;
    const ownedTexture = new THREE.Texture();
    material.map = ownedTexture;
    const geometryDispose = vi.spyOn(asphalt.geometry, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');
    const textureDispose = vi.spyOn(ownedTexture, 'dispose');

    try {
      scene.fallsRun.dispose();
      scene.fallsRun.dispose();
      expect(scene.fallsRun.group.children).toHaveLength(0);
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

  it('freezes animated presentation when its visual owner is hidden', () => {
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
      scene.fallsRun.group.visible = true;
      scene.fallsRun.update(4);
      expect(wet.material.uniforms.time?.value).toBe(3);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('requires bounded finite Task 9 sector owners on every quality tier', () => {
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

  it('requires Low wet-road bypass and safe avatar compositing for every new sector pass', () => {
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


describe('Neon Grid Stage 4 Task 9 T9.4 Falls Run extension', () => {
  it('leaves the accepted Task 8 group and counts unchanged while owning two disjoint regions', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      expectAcceptedTask8Baseline(scene);
      const owner = scene.getObjectByName('falls-run-extension-visual');
      expect(owner).toBeInstanceOf(THREE.Group);
      expect(owner?.userData.progressRanges).toEqual([
        [0.46154128347522666, 0.7 - 1 / 1536],
        [0.85 + 1 / 1536, 1],
      ]);
      expect(owner?.userData.excludedRange).toEqual([0.7, 0.85]);
      const base = scene.getObjectByName('falls-run-extension-asphalt-base') as THREE.Mesh;
      expect(base.geometry.userData.conformsToMainRibbon).toBe(true);
      expect(base.geometry.userData.progressRanges).toEqual(owner?.userData.progressRanges);
      const edges = scene.getObjectByName('falls-run-extension-cyan-edges') as THREE.Mesh;
      expect(edges.geometry.userData.nativeRibbonEdges).toBe(true);
      expect((edges.material as THREE.Material).depthWrite).toBe(false);
      expect(scene.getObjectByName('falls-run-extension-supported-pylons')).toBeDefined();
      expect(scene.getObjectByName('falls-run-extension-pylon-footings')).toBeDefined();
      expect(scene.getObjectByName('falls-run-extension-city-foundations')).toBeDefined();
      expect(requireInstanced(scene, 'falls-run-extension-ambient-waterfalls').count).toBe(14);
      expect((scene.getObjectByName('falls-run-extension-ambient-waterfalls') as THREE.InstancedMesh).material).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('bounds new windows/mist and omits wet road and mist on Low', () => {
    for (const quality of ['low', 'medium', 'high'] as const) {
      const scene = createNeonGridScene(new NeonGrid(), quality);
      try {
        const counts = { low: [80, 0], medium: [160, 14], high: [240, 28] } as const;
        const [windows, mist] = counts[quality];
        expect(requireInstanced(scene, 'falls-run-extension-city-windows').count).toBe(windows);
        expect((scene.getObjectByName('falls-run-extension-ambient-mist') as THREE.InstancedMesh | undefined)?.count ?? 0).toBe(mist);
        expect(Boolean(scene.getObjectByName('falls-run-extension-wet-asphalt'))).toBe(quality !== 'low');
      } finally {
        disposeTrackScene(scene);
      }
    }
  }, 20000);

  it('freezes hidden extension animation and disposes its owned presentation idempotently', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    const material = (scene.getObjectByName('falls-run-extension-wet-asphalt') as THREE.Mesh)
      .material as THREE.ShaderMaterial;
    const spy = vi.spyOn(material, 'dispose');
    try {
      scene.fallsRunExtension.update(2);
      expect(material.uniforms.time?.value).toBe(2);
      scene.fallsRunExtension.group.visible = false;
      scene.fallsRunExtension.update(9);
      expect(material.uniforms.time?.value).toBe(2);
      scene.fallsRunExtension.group.visible = true;
      scene.fallsRunExtension.update(10);
      expect(material.uniforms.time?.value).toBe(3);
      scene.fallsRunExtension.dispose();
      scene.fallsRunExtension.dispose();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(scene.fallsRunExtension.group.children).toHaveLength(0);
      expect(scene.getObjectByName('falls-run-visual')).toBeDefined();
    } finally {
      disposeTrackScene(scene);
      spy.mockRestore();
    }
  });
});
