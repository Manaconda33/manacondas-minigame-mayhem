import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import * as trackCatalog from '../src/game/track/trackCatalog';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

type FogSceneFactory = (
  track: NeonGrid,
  quality: 'low' | 'medium' | 'high',
  variant: 'fog-experiment',
) => THREE.Group;

const createFogScene = createNeonGridScene as unknown as FogSceneFactory;
const catalogExports = trackCatalog as unknown as Record<string, unknown>;

describe('Neon Grid fog-city experiment isolation', () => {
  it('selects the experiment only from its explicit review query', () => {
    const resolveVariant = catalogExports.neonGridVisualVariantFromSearch as
      | ((search: string) => string)
      | undefined;

    expect(typeof resolveVariant).toBe('function');
    expect(resolveVariant?.('?neonGridVisual=abyss-fog-001')).toBe('fog-experiment');
    expect(resolveVariant?.('?neonGridVisual=unknown')).toBe('approved');
    expect(resolveVariant?.('')).toBe('approved');
  });

  it('keeps the approved city-ground scene as the default', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      expect(scene.getObjectByName('neon-grid-fog-backdrop')).toBeUndefined();
      expect(scene.userData.visualVariant ?? 'approved').toBe('approved');
      const fascia = scene.getObjectByName('skyline-deck-fascia');
      expect(fascia).toBeInstanceOf(THREE.Mesh);
      expect((fascia as THREE.Mesh).geometry.userData.cityGroundSuppressed).not.toBe(true);
      expect(Number((fascia as THREE.Mesh).geometry.userData.floorIndexCount ?? 0)).toBeGreaterThan(0);
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('does not add the experimental atmosphere to Circuit Alpha', () => {
    const scene = trackCatalog.createSelectedTrackScene(new CircuitAlpha(), 'medium', 'fog-experiment');
    try {
      expect(scene.getObjectByName('neon-grid-fog-backdrop')).toBeUndefined();
      expect(scene.getObjectByName('neon-grid-fog-city')).toBeUndefined();
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('removes only decorative floor triangles and adds opaque fog-city silhouettes', () => {
    const track = new NeonGrid();
    const routeBefore = track.curve.getPoints(64).map((point) => point.toArray());
    const scene = createFogScene(track, 'medium', 'fog-experiment');
    try {
      expect(scene.userData.visualVariant).toBe('fog-experiment');
      expect(scene.getObjectByName('neon-grid-fog-backdrop')).toBeDefined();
      expect(scene.getObjectByName('track-road')).toBeDefined();
      expect(scene.getObjectByName('neon-grid-walls')).toBeDefined();

      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const fasciaIndexCount = fascia.geometry.getIndex()?.count ?? 0;
      expect(fascia.geometry.userData.cityGroundSuppressed).toBe(true);
      expect(fascia.geometry.userData.suppressedGroundTriangleCount).toBeGreaterThan(0);
      const foundationRange = (
        fascia.geometry.userData.geometryRanges as
          | Record<string, { triangleCount: number }>
          | undefined
      )?.cityFoundations;
      expect(foundationRange?.triangleCount ?? 0).toBeGreaterThan(0);
      expect(fasciaIndexCount).toBeGreaterThan(0);

      const screens = scene.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh;
      expect(screens.userData.sightlinePanels).toBeGreaterThan(0);
      expect(screens.geometry.userData.cityGroundSuppressed).toBe(true);
      expect(screens.geometry.userData.suppressedGroundTriangleCount).toBeGreaterThan(0);

      const fallsGround = scene.getObjectByName('falls-run-city-terraced-ground') as THREE.Mesh;
      expect(fallsGround.visible).toBe(true);
      expect(fallsGround.geometry.userData.cityGroundSuppressed).toBe(true);
      expect(fallsGround.geometry.userData.suppressedGroundTriangleCount).toBeGreaterThan(0);
      expect(fallsGround.geometry.userData.bakedCityMeshes).toEqual([
        'falls-run-city-foundations',
        'falls-run-city-towers',
      ]);
      expect(fallsGround.geometry.getIndex()?.count).toBe(
        Number(fallsGround.geometry.userData.bakedCityTriangleCount ?? 0) * 3,
      );
      expect(scene.getObjectByName('falls-run-city-towers')).toBeInstanceOf(THREE.InstancedMesh);

      const extensionGround = scene.getObjectByName(
        'falls-run-extension-city-terraced-ground',
      ) as THREE.Mesh;
      expect(extensionGround.geometry.userData.cityGroundSuppressed).toBe(true);
      expect(extensionGround.geometry.userData.bakedCityMeshes).toContain(
        'falls-run-extension-city-foundations',
      );

      for (const district of ['skyline', 'undercity', 'falls-run']) {
        const ruins = scene.getObjectByName(`neon-grid-fog-silhouettes-${district}`);
        expect(ruins, district).toBeInstanceOf(THREE.InstancedMesh);
        const ruinMesh = ruins as THREE.InstancedMesh;
        expect(ruinMesh.count).toBeGreaterThan(0);
        const materialValue = ruinMesh.material;
        const materials: readonly THREE.Material[] = Array.isArray(materialValue)
          ? materialValue
          : [materialValue];
        expect(materials.every((material) => !material.transparent)).toBe(true);
        expect(materials.every((material) => material.userData.heightFoggedRuins === true)).toBe(true);
        expect(materials.every((material) => Number(material.userData.lowerFogHideOffset) < 0)).toBe(true);
      }
      expect(track.curve.getPoints(64).map((point) => point.toArray())).toEqual(routeBefore);
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('raises broken roofs through the low skyline fog band without entering the road corridor', () => {
    const track = new NeonGrid();
    const routeSamples = track.curve.getPoints(512);
    const scene = createFogScene(track, 'medium', 'fog-experiment');
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    try {
      for (const district of ['skyline', 'undercity', 'falls-run']) {
        const ruins = scene.getObjectByName(
          `neon-grid-fog-silhouettes-${district}`,
        ) as THREE.InstancedMesh;
        const range = ruins.userData.progressRange as readonly [number, number];
        for (let i = 0; i < ruins.count; i++) {
          const fraction = (i + 0.34 + ((i * 17) % 7) * 0.07) / ruins.count;
          const progress = THREE.MathUtils.lerp(range[0], range[1], fraction);
          const roadCenter = track.curve.getPointAt(progress);
          const roadY = roadCenter.y;
          ruins.getMatrixAt(i, matrix);
          matrix.decompose(position, rotation, scale);
          const roofY = position.y + scale.y * 1.08;
          expect(roofY - roadY, `${district} roof ${String(i)} height`).toBeLessThan(70);
          expect(roofY - roadY, `${district} roof ${String(i)} height`).toBeGreaterThan(45);
          const minimumRouteClearance = Math.min(...routeSamples.map((routePoint) =>
            Math.hypot(position.x - routePoint.x, position.z - routePoint.z),
          ));
          expect(
            minimumRouteClearance,
            `${district} roof ${String(i)} full-course clearance`,
          ).toBeGreaterThan(180);
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('disposes the shared ruin geometry and fog resources once with the track scene', () => {
    const scene = createFogScene(new NeonGrid(), 'medium', 'fog-experiment');
    const ruins = scene.getObjectByName('neon-grid-fog-silhouettes-skyline') as THREE.InstancedMesh;
    const backdrop = scene.getObjectByName('neon-grid-fog-backdrop') as THREE.Mesh;
    const backdropMaterial = Array.isArray(backdrop.material)
      ? backdrop.material[0]
      : backdrop.material;
    let ruinGeometryDisposals = 0;
    let backdropGeometryDisposals = 0;
    let backdropMaterialDisposals = 0;
    ruins.geometry.addEventListener('dispose', () => ruinGeometryDisposals++);
    backdrop.geometry.addEventListener('dispose', () => backdropGeometryDisposals++);
    backdropMaterial?.addEventListener('dispose', () => backdropMaterialDisposals++);

    disposeTrackScene(scene);

    expect(ruinGeometryDisposals).toBe(1);
    expect(backdropGeometryDisposals).toBe(1);
    expect(backdropMaterialDisposals).toBe(1);
    expect(scene.children).toHaveLength(0);
  }, 30000);
});
