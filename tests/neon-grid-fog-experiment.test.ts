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
  variant: 'fog-experiment' | 'fog-experiment-v2',
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
    expect(resolveVariant?.('?neonGridVisual=abyss-fog-002')).toBe('fog-experiment-v2');
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

  it('isolates v2 fog from both the approved baseline and the rejected v1 ruins', () => {
    const scene = createFogScene(new NeonGrid(), 'medium', 'fog-experiment-v2');
    try {
      expect(scene.userData.visualVariant).toBe('fog-experiment-v2');
      expect(scene.getObjectByName('neon-grid-fog-city')).toBeUndefined();
      expect(scene.getObjectByName('neon-grid-fog-backdrop')).toBeUndefined();
      expect(scene.getObjectByName('neon-grid-fog-silhouettes-skyline')).toBeUndefined();
      expect(scene.getObjectByName('neon-grid-fog-silhouettes-undercity')).toBeUndefined();
      expect(scene.getObjectByName('neon-grid-fog-silhouettes-falls-run')).toBeUndefined();
      expect(scene.getObjectByName('neon-grid-abyss-fog-v2')).toBeDefined();
      expect(scene.userData.abyssFogV2).toMatchObject({ enabled: true, lowerWorldOnly: true });
      const fogBackdrop = scene.getObjectByName('neon-grid-abyss-fog-v2-backdrop') as THREE.Mesh;
      const fogBackdropMaterial = Array.isArray(fogBackdrop.material)
        ? fogBackdrop.material[0]
        : fogBackdrop.material;
      expect(fogBackdropMaterial?.userData.abyssFogPreservesNightSky).toBe(true);
      const fogReport = scene.userData.abyssFogV2 as {
        readonly unsupportedObjects: readonly string[];
        readonly foggedObjects: readonly string[];
      };
      expect(fogReport.unsupportedObjects).toEqual([]);
      expect(fogReport.foggedObjects).toContain('undercity-wallside-sightline-screens');
      expect(fogReport.foggedObjects).toContain('skyline-deck-fascia');

      const road = scene.getObjectByName('track-road') as THREE.Mesh;
      const roadMaterials = Array.isArray(road.material) ? road.material : [road.material];
      expect(roadMaterials.every((material) => material.userData.abyssVerticalFog !== true)).toBe(true);

      const skylineTowers = scene.getObjectByName('skyline-city-towers') as THREE.InstancedMesh;
      const towerMaterials = Array.isArray(skylineTowers.material)
        ? skylineTowers.material
        : [skylineTowers.material];
      expect(towerMaterials.some((material) => material.userData.abyssVerticalFog === true)).toBe(true);
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('removes only decorative bases while preserving the road, screens and supported structures', () => {
    const scene = createFogScene(new NeonGrid(), 'medium', 'fog-experiment-v2');
    try {
      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const fasciaRanges = fascia.geometry.userData.geometryRanges as
        | Record<string, { triangleCount: number }>
        | undefined;
      expect(fasciaRanges?.cityGround?.triangleCount).toBe(0);
      expect(fasciaRanges?.cityFoundations?.triangleCount).toBe(0);
      expect(fasciaRanges?.roadsideScreens?.triangleCount).toBeGreaterThan(0);
      expect(fasciaRanges?.billboardGapWing?.triangleCount).toBeGreaterThan(0);

      const undercityScreens = scene.getObjectByName(
        'undercity-wallside-sightline-screens',
      ) as THREE.Mesh;
      expect(undercityScreens.geometry.userData.floorTriangleCount).toBe(0);
      expect(undercityScreens.userData.sightlinePanels).toBeGreaterThan(0);
      expect(undercityScreens.userData.abyssFogged).toBe(true);

      const industrial = scene.getObjectByName('undercity-industrial-architecture') as
        | THREE.InstancedMesh
        | undefined;
      const industrialPartRanges = industrial?.userData.partRanges as
        | { readonly foundations: { readonly start: number; readonly count: number } }
        | undefined;
      expect(industrialPartRanges?.foundations).toEqual({ start: 0, count: 0 });
      expect(industrial?.count).toBe(80);

      const utility = scene.getObjectByName('undercity-utility-clutter') as THREE.InstancedMesh;
      expect(utility.userData.padCount).toBe(0);
      expect(utility.count).toBe(20);

      for (const name of [
        'falls-run-city-terraced-ground',
        'falls-run-extension-city-terraced-ground',
      ]) {
        const mesh = scene.getObjectByName(name) as THREE.Mesh;
        const ranges = mesh.geometry.userData.geometryRanges as
          | Record<string, { triangleCount: number }>
          | undefined;
        expect(ranges?.cityGround?.triangleCount).toBe(0);
        expect(ranges?.cityFoundations?.triangleCount).toBe(0);
        expect(ranges?.cityTowers?.triangleCount).toBeGreaterThan(0);
      }

      const extensionFootings = scene.getObjectByName(
        'falls-run-extension-pylon-footings',
      ) as THREE.InstancedMesh;
      expect(extensionFootings.visible).toBe(false);
      expect(scene.getObjectByName('falls-run-extension-supported-pylons')).toBeDefined();
      expect(scene.getObjectByName('track-road')).toBeDefined();
      expect(scene.getObjectByName('neon-grid-walls')).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('buries existing city masses and removes high skyline spikes only in the v2 variant', () => {
    const scene = createFogScene(new NeonGrid(), 'medium', 'fog-experiment-v2');
    try {
      expect(
        (scene.getObjectByName('neon-grid-abyss-fog-v2') as THREE.Group).userData
          .ruinedSilhouetteCount,
      ).toBe(0);
      expect((scene.getObjectByName('skyline-city-spires') as THREE.InstancedMesh).count).toBe(0);
      for (const name of [
        'skyline-city-towers',
        'undercity-city-buildings',
        'falls-run-city-terraced-ground',
        'falls-run-extension-city-terraced-ground',
      ]) {
        const object = scene.getObjectByName(name) as THREE.Mesh | undefined;
        const offsets = (
          object?.userData.fogBuriedRoofOffsets ??
          object?.geometry.userData.fogBuriedRoofOffsets
        ) as number[] | undefined;
        expect(offsets, `${name} has buried roof measurements`).toBeDefined();
        expect(offsets?.length, `${name} has buried roof measurements`).toBeGreaterThan(0);
        expect(Math.max(...(offsets ?? [])), `${name} highest roof`).toBeLessThanOrEqual(-8);
        expect(Math.min(...(offsets ?? [])), `${name} lowest roof`).toBeGreaterThanOrEqual(-12);
      }

      expect(
        (scene.getObjectByName('skyline-pylons') as THREE.InstancedMesh).userData
          .abyssFogSupportDepthMeters,
      ).toBe(40);
      expect(
        (scene.getObjectByName('falls-run-pylons') as THREE.InstancedMesh).userData
          .abyssFogSupportDepthMeters,
      ).toBe(40);
      expect(
        (scene.getObjectByName('falls-run-extension-supported-pylons') as THREE.InstancedMesh)
          .userData.abyssFogSupportDepthMeters,
      ).toBe(45);
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('disposes v2 atmosphere geometry and cloned fog materials with the track scene', () => {
    const scene = createFogScene(new NeonGrid(), 'medium', 'fog-experiment-v2');
    const backdrop = scene.getObjectByName('neon-grid-abyss-fog-v2-backdrop') as THREE.Mesh;
    const city = scene.getObjectByName('skyline-city-towers') as THREE.InstancedMesh;
    const cityMaterial = Array.isArray(city.material) ? city.material[0] : city.material;
    const backdropMaterial = Array.isArray(backdrop.material) ? backdrop.material[0] : backdrop.material;
    let backdropGeometryDisposals = 0;
    let backdropMaterialDisposals = 0;
    let cityMaterialDisposals = 0;
    backdrop.geometry.addEventListener('dispose', () => backdropGeometryDisposals++);
    backdropMaterial?.addEventListener('dispose', () => backdropMaterialDisposals++);
    cityMaterial?.addEventListener('dispose', () => cityMaterialDisposals++);

    disposeTrackScene(scene);

    expect(backdropGeometryDisposals).toBe(1);
    expect(backdropMaterialDisposals).toBe(1);
    expect(cityMaterialDisposals).toBe(1);
    expect(scene.children).toHaveLength(0);
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
