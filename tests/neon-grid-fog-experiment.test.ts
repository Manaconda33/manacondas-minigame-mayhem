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
  variant: 'fog-experiment' | 'fog-experiment-v2' | 'fog-experiment-v3' | 'fog-experiment-v3-2',
) => THREE.Group;

const createFogScene = createNeonGridScene as unknown as FogSceneFactory;
const catalogExports = trackCatalog as unknown as Record<string, unknown>;

describe('Neon Grid fog-city experiment isolation', () => {
  it('selects the experiment only from its explicit review query', () => {
    const resolveVariant = catalogExports.neonGridVisualVariantFromSearch as
      ((search: string) => string) | undefined;

    expect(typeof resolveVariant).toBe('function');
    expect(resolveVariant?.('?neonGridVisual=abyss-fog-001')).toBe('fog-experiment');
    expect(resolveVariant?.('?neonGridVisual=abyss-fog-002')).toBe('fog-experiment-v2');
    expect(resolveVariant?.('?neonGridVisual=abyss-fog-003')).toBe('fog-experiment-v3');
    expect(resolveVariant?.('?neonGridVisual=abyss-fog-004')).toBe('fog-experiment-v3-2');
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
      expect(Number((fascia as THREE.Mesh).geometry.userData.floorIndexCount ?? 0)).toBeGreaterThan(
        0,
      );
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('keeps the Stage 1 v3 fog district-specific, grounded, and free of added scenery', () => {
    const track = new NeonGrid();
    const scene = createFogScene(track, 'medium', 'fog-experiment-v3');
    try {
      expect(scene.userData.visualVariant).toBe('fog-experiment-v3');
      expect(scene.getObjectByName('neon-grid-abyss-fog-v2')).toBeUndefined();
      const fogGroup = scene.getObjectByName('neon-grid-abyss-fog-v3') as THREE.Group;
      expect(fogGroup).toBeDefined();
      expect(scene.getObjectByName('neon-grid-abyss-fog-v3-volume')).toBeUndefined();
      expect(fogGroup.children).toHaveLength(1);
      const backdrop = scene.getObjectByName('neon-grid-abyss-fog-v3-backdrop') as THREE.Mesh;
      const backdropMaterial = backdrop.material as THREE.ShaderMaterial;
      expect(backdropMaterial.userData.abyssFogBackdrop).toBe(true);
      expect(backdrop.userData.abyssFogAtmosphere).toBe('soft-procedural-cloud-bank');
      expect(backdropMaterial.fragmentShader).toContain('fogValueNoise');
      expect(backdropMaterial.transparent).toBe(false);
      expect(
        (scene.userData.abyssFogV3 as { readonly addedDecorativeStructures: number })
          .addedDecorativeStructures,
      ).toBe(0);
      expect(scene.getObjectByName('neon-grid-fog-city')).toBeUndefined();
      for (const district of ['skyline', 'undercity', 'falls-run']) {
        expect(scene.getObjectByName(`neon-grid-fog-silhouettes-${district}`)).toBeUndefined();
      }

      const fogReport = scene.userData.abyssFogV3 as {
        readonly enabled: boolean;
        readonly unsupportedObjects: readonly string[];
        readonly foggedObjects: readonly string[];
        readonly depthProfile: {
          readonly clearUntilMeters: number;
          readonly denseByMeters: number;
        };
        readonly districts: Record<string, { readonly treatment: string }>;
      };
      expect(fogReport).toMatchObject({
        enabled: true,
        unsupportedObjects: [],
        transparentFogVolumeCount: 0,
        depthProfile: { clearUntilMeters: 4, denseByMeters: 40 },
        districts: {
          skyline: { treatment: 'open-bridge-fog' },
          undercity: {
            treatment: 'street-level-enclosure',
            clearStart: -2,
            visibleBy: 0,
            strongBy: 9,
            denseBy: 20,
          },
          'falls-run': { treatment: 'vertical-drop-fog' },
        },
      });
      expect(fogReport.foggedObjects).toEqual(
        expect.arrayContaining([
          'undercity-city-windows',
          'falls-run-deck-fascia',
          'falls-run-extension-supported-pylons',
        ]),
      );

      const road = scene.getObjectByName('track-road') as THREE.Mesh;
      const roadMaterials = Array.isArray(road.material) ? road.material : [road.material];
      expect(roadMaterials.every((material) => material.userData.abyssVerticalFog !== true)).toBe(
        true,
      );

      const undercity = scene.getObjectByName('undercity-city-buildings') as THREE.InstancedMesh;
      const roofOffsets = undercity.userData.fogRoofAboveRoadOffsets as readonly number[];
      expect(roofOffsets).toHaveLength(undercity.count);
      expect(Math.min(...roofOffsets)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...roofOffsets)).toBeLessThanOrEqual(5);
      expect(undercity.userData.abyssVerticalFog).toBe(true);
      const undercityArchitecture = scene.getObjectByName(
        'undercity-industrial-architecture',
      ) as THREE.InstancedMesh;
      const undercityParts = undercityArchitecture.userData.partRanges as {
        readonly foundations: { readonly start: number; readonly count: number };
      };
      expect(undercityParts.foundations.count).toBe(undercity.count);
      expect(undercityArchitecture.userData.suppressedRanges).toBeUndefined();
      const undercityScreens = scene.getObjectByName(
        'undercity-wallside-sightline-screens',
      ) as THREE.Mesh;
      expect(undercityScreens.userData.wallTop).toBe(1.8);
      expect(undercityScreens.userData.pilasterTop).toBe(2.5);

      for (const name of [
        'skyline-city-towers',
        'skyline-pylons',
        'undercity-industrial-architecture',
        'undercity-facade-vent-banks',
        'falls-run-pylons',
        'falls-run-city-terraced-ground',
        'falls-run-extension-supported-pylons',
      ]) {
        const object = scene.getObjectByName(name) as THREE.Mesh;
        expect(object.userData.abyssVerticalFog, `${name} receives world-space fog`).toBe(true);
      }

      const skylineFascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const geometryRanges = skylineFascia.geometry.userData.geometryRanges as
        Record<string, { triangleCount: number }> | undefined;
      expect(geometryRanges?.cityGround?.triangleCount).toBe(0);
      expect(geometryRanges?.cityFoundations?.triangleCount).toBe(0);
      expect(scene.getObjectByName('track-road')).toBeDefined();
      expect(scene.getObjectByName('waterfall-dive')).toBeDefined();
      expect(
        (scene.getObjectByName('skyline-pylons') as THREE.InstancedMesh).userData
          .abyssFogSupportDepthMeters,
      ).toBe(58);
      expect(
        (scene.getObjectByName('falls-run-pylons') as THREE.InstancedMesh).userData
          .abyssFogSupportDepthMeters,
      ).toBe(60);
      expect(
        (scene.getObjectByName('falls-run-extension-supported-pylons') as THREE.InstancedMesh)
          .userData.abyssFogSupportDepthMeters,
      ).toBe(60);
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('integrates existing architecture into the V3.1 fog without changing gameplay meshes', () => {
    const track = new NeonGrid();
    const scene = createFogScene(track, 'medium', 'fog-experiment-v3');
    try {
      const report = scene.userData.abyssFogV3 as {
        readonly foggedObjects: readonly string[];
        readonly unsupportedObjects: readonly string[];
      };
      expect(report.unsupportedObjects).toEqual([]);
      expect(
        (scene.userData.abyssFogV3 as { readonly palette: { readonly fogColor: string } }).palette
          .fogColor,
      ).toBe('3e5266');
      const backdrop = scene.getObjectByName('neon-grid-abyss-fog-v3-backdrop') as THREE.Mesh;
      const routeCamera = new THREE.PerspectiveCamera();
      routeCamera.position.copy(track.curve.getPointAt(0.355)).add(new THREE.Vector3(0, 4.25, 0));
      routeCamera.updateMatrixWorld(true);
      backdrop.onBeforeRender(
        undefined as unknown as THREE.WebGLRenderer,
        new THREE.Scene(),
        routeCamera,
        backdrop.geometry,
        backdrop.material as THREE.Material,
        new THREE.Group(),
      );
      expect(backdrop.userData.abyssFogRouteReference).toMatchObject({
        route: 'main-road',
        district: 'undercity',
        roadY: track.curve.getPointAt(0.355).y,
      });
      expect(report.foggedObjects).toEqual(
        expect.arrayContaining([
          'service-tunnel-left-wall',
          'service-tunnel-right-wall',
          'undercity-wallside-sightline-screens',
          'undercity-industrial-architecture',
        ]),
      );
      expect(report.foggedObjects).not.toEqual(
        expect.arrayContaining(['service-tunnel-floor', 'service-tunnel-roof']),
      );

      const leftTunnelWall = scene.getObjectByName('service-tunnel-left-wall') as THREE.Mesh;
      const rightTunnelWall = scene.getObjectByName('service-tunnel-right-wall') as THREE.Mesh;
      expect(leftTunnelWall.visible).toBe(true);
      expect(rightTunnelWall.visible).toBe(true);
      expect((leftTunnelWall.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0x353a4a);
      expect((rightTunnelWall.material as THREE.MeshStandardMaterial).color.getHex()).toBe(
        0x353a4a,
      );
      expect(leftTunnelWall.userData.abyssFogProfile).toMatchObject({
        clearStart: -2,
        denseBy: 18,
        distanceStart: 0,
        distanceEnd: 40,
      });
      const tunnelFloor = scene.getObjectByName('service-tunnel-floor') as THREE.Mesh;
      expect((tunnelFloor.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0x27384b);
      expect(tunnelFloor.geometry.getIndex()?.count).toBeGreaterThan(0);
      expect(tunnelFloor.userData.abyssTunnelSurfaceTint).toBe('27384b');
      const sightlineScreens = scene.getObjectByName(
        'undercity-wallside-sightline-screens',
      ) as THREE.Mesh;
      expect(sightlineScreens.userData.abyssFogProfile).toMatchObject({
        clearStart: -2,
        denseBy: 16,
        distanceStart: 8,
        distanceEnd: 70,
      });
      expect(
        (scene.getObjectByName('service-tunnel-floor') as THREE.Mesh).userData.abyssVerticalFog,
      ).not.toBe(true);
      expect(
        (scene.getObjectByName('service-tunnel-roof') as THREE.Mesh).userData.abyssVerticalFog,
      ).not.toBe(true);

      const skyline = scene.getObjectByName('skyline-city-towers') as THREE.InstancedMesh;
      const roofOffsets = skyline.userData.fogRoofAboveRoadOffsets as readonly number[];
      expect(roofOffsets.filter((offset) => offset >= 12).length).toBeGreaterThanOrEqual(6);
      expect(Math.min(...roofOffsets)).toBeGreaterThanOrEqual(-8);
      expect(Math.max(...roofOffsets)).toBeGreaterThanOrEqual(24);
      expect(Math.max(...roofOffsets)).toBeLessThanOrEqual(34);
      const towerHeights = skyline.userData.fogTowerHeights as readonly number[];
      expect(towerHeights).toHaveLength(skyline.count);
      expect(Math.max(...towerHeights)).toBeGreaterThanOrEqual(58);
      expect(Math.min(...towerHeights)).toBeGreaterThanOrEqual(32);
      const skylineFogColor = (skyline.material as THREE.MeshBasicMaterial).userData
        .abyssFogColor as unknown as string;
      const undercityFogColor = (
        (scene.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh)
          .material as THREE.MeshStandardMaterial
      ).userData.abyssFogColor as unknown as string;
      expect(skylineFogColor).toBe(undercityFogColor);

      const approved = createNeonGridScene(track, 'medium');
      try {
        expect(
          (
            (approved.getObjectByName('service-tunnel-left-wall') as THREE.Mesh)
              .material as THREE.MeshStandardMaterial
          ).color.getHex(),
        ).toBe(0x733059);
        expect(
          (
            (approved.getObjectByName('service-tunnel-floor') as THREE.Mesh)
              .material as THREE.MeshStandardMaterial
          ).color.getHex(),
        ).toBe(0x733059);
        expect(approved.userData.visualVariant).toBe('approved');
      } finally {
        disposeTrackScene(approved);
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('buries only V3.2 building, fascia, screen, and support endings into local fog', () => {
    const track = new NeonGrid();
    const v31 = createFogScene(track, 'medium', 'fog-experiment-v3');
    const v32 = createFogScene(track, 'medium', 'fog-experiment-v3-2');
    try {
      expect(v32.userData.visualVariant).toBe('fog-experiment-v3-2');
      expect(v31.userData.visualVariant).toBe('fog-experiment-v3');
      expect(v32.getObjectByName('neon-grid-abyss-fog-v3')).toBeDefined();

      const v32Report = v32.userData.abyssFogV3_2 as {
        readonly fullyBlendedObjects: readonly string[];
        readonly localizedProfileObjects: readonly string[];
        readonly addedDecorativeStructures: number;
      };
      expect(v32Report.addedDecorativeStructures).toBe(0);
      expect(v32Report.fullyBlendedObjects).toEqual(
        expect.arrayContaining([
          'skyline-deck-fascia',
          'skyline-pylons',
          'skyline-city-towers',
          'skyline-cross-braces',
          'undercity-city-buildings',
          'undercity-industrial-architecture',
          'undercity-wallside-sightline-screens',
        ]),
      );

      const maximumBlend = (name: string): number => {
        const mesh = v32.getObjectByName(name) as THREE.Mesh;
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (!material) throw new Error(`Missing fog material for ${name}`);
        return Number(material.userData.abyssFogMaximumBlend);
      };
      const terminalColor = (scene: THREE.Group, name: string): string => {
        const mesh = scene.getObjectByName(name) as THREE.Mesh;
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (!material) throw new Error(`Missing fog material for ${name}`);
        return String(material.userData.abyssFogTerminalColor);
      };
      for (const name of [
        'skyline-deck-fascia',
        'skyline-pylons',
        'skyline-city-towers',
        'skyline-cross-braces',
        'undercity-city-buildings',
        'undercity-industrial-architecture',
        'undercity-wallside-sightline-screens',
      ]) {
        expect(maximumBlend(name), `${name} reaches the matching fog color`).toBe(1);
        expect(terminalColor(v32, name), `${name} blends into lower haze`).toBe('243543');
        expect(terminalColor(v31, name), `${name} keeps V3.1 fog`).toBe('3e5266');
      }

      const v31Screens = v31.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh;
      const v32Screens = v32.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh;
      expect(v31Screens.userData.sightlinePanels).toBe(v32Screens.userData.sightlinePanels);
      expect(v31Screens.userData.mouthCuts).toBe(v32Screens.userData.mouthCuts);
      expect(v32Screens.userData.collision).toBe(false);
      expect(v32Screens.geometry.getAttribute('position').array).toEqual(
        v31Screens.geometry.getAttribute('position').array,
      );
      expect(v32Screens.geometry.getIndex()?.array).toEqual(v31Screens.geometry.getIndex()?.array);
      expect(v32Screens.userData.abyssFogProfile).toMatchObject({
        clearStart: -0.5,
        visibleBy: 0.1,
        strongBy: 0.5,
        denseBy: 0.95,
        maximumBlend: 1,
      });

      const v31Fascia = v31.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const v32Fascia = v32.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      expect(v32Fascia.geometry.getAttribute('position').array).toEqual(
        v31Fascia.geometry.getAttribute('position').array,
      );
      expect(v31Fascia.geometry.getIndex()?.count).toBe(v32Fascia.geometry.getIndex()?.count);
      expect(v32Fascia.userData.abyssFogProfile).toMatchObject({
        clearStart: 1,
        visibleBy: 2.5,
        strongBy: 5,
        denseBy: 7.25,
      });

      const v32Buildings = v32.getObjectByName('undercity-city-buildings') as THREE.InstancedMesh;
      expect(v32Buildings.count).toBe(
        (v31.getObjectByName('undercity-city-buildings') as THREE.InstancedMesh).count,
      );
      expect(v32Buildings.userData.abyssFogProfile).toMatchObject({ denseBy: 20, maximumBlend: 1 });
      const v31Buildings = v31.getObjectByName('undercity-city-buildings') as THREE.InstancedMesh;
      expect(v32Buildings.instanceMatrix.array).toEqual(v31Buildings.instanceMatrix.array);
      expect(v32Buildings.geometry.getAttribute('position').array).toEqual(
        v31Buildings.geometry.getAttribute('position').array,
      );
      const v32Pylons = v32.getObjectByName('skyline-pylons') as THREE.InstancedMesh;
      expect(v32Pylons.count).toBe(14);
      expect(v32Pylons.userData.abyssFogSupportDepthMeters).toBe(58);
      expect(v32Pylons.instanceMatrix.array).toEqual(
        (v31.getObjectByName('skyline-pylons') as THREE.InstancedMesh).instanceMatrix.array,
      );
      for (const name of [
        'skyline-city-towers',
        'skyline-cross-braces',
        'undercity-industrial-architecture',
      ]) {
        const original = v31.getObjectByName(name) as THREE.Mesh;
        const corrected = v32.getObjectByName(name) as THREE.Mesh;
        expect(corrected.geometry.getAttribute('position').array).toEqual(
          original.geometry.getAttribute('position').array,
        );
        expect(corrected.geometry.getIndex()?.array).toEqual(original.geometry.getIndex()?.array);
        if (original instanceof THREE.InstancedMesh && corrected instanceof THREE.InstancedMesh) {
          expect(corrected.count).toBe(original.count);
          expect(corrected.instanceMatrix.array).toEqual(original.instanceMatrix.array);
        }
      }
      expect(v32Report.localizedProfileObjects).toEqual([
        'skyline-deck-fascia',
        'undercity-wallside-sightline-screens',
      ]);
      expect(v32.getObjectByName('skyline-city-towers')?.userData.abyssFogProfile).toMatchObject({
        denseBy: 38,
        maximumBlend: 1,
      });

      const v32RoadMaterials = (v32.getObjectByName('track-road') as THREE.Mesh).material;
      expect(
        (Array.isArray(v32RoadMaterials) ? v32RoadMaterials : [v32RoadMaterials]).every(
          (material) => material.userData.abyssVerticalFog !== true,
        ),
      ).toBe(true);
      expect(v32.getObjectByName('waterfall-dive')).toBeDefined();
      expect(v31.children.length).toBe(v32.children.length);
    } finally {
      disposeTrackScene(v31);
      disposeTrackScene(v32);
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
      expect(roadMaterials.every((material) => material.userData.abyssVerticalFog !== true)).toBe(
        true,
      );

      const skylineTowers = scene.getObjectByName('skyline-city-towers') as THREE.InstancedMesh;
      const towerMaterials = Array.isArray(skylineTowers.material)
        ? skylineTowers.material
        : [skylineTowers.material];
      expect(towerMaterials.some((material) => material.userData.abyssVerticalFog === true)).toBe(
        true,
      );
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('removes only decorative bases while preserving the road, screens and supported structures', () => {
    const scene = createFogScene(new NeonGrid(), 'medium', 'fog-experiment-v2');
    try {
      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const fasciaRanges = fascia.geometry.userData.geometryRanges as
        Record<string, { triangleCount: number }> | undefined;
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
        THREE.InstancedMesh | undefined;
      const industrialPartRanges = industrial?.userData.partRanges as
        { readonly foundations: { readonly start: number; readonly count: number } } | undefined;
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
          Record<string, { triangleCount: number }> | undefined;
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
        const offsets = (object?.userData.fogBuriedRoofOffsets ??
          object?.geometry.userData.fogBuriedRoofOffsets) as number[] | undefined;
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
    const backdropMaterial = Array.isArray(backdrop.material)
      ? backdrop.material[0]
      : backdrop.material;
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
    const scene = trackCatalog.createSelectedTrackScene(
      new CircuitAlpha(),
      'medium',
      'fog-experiment',
    );
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
          Record<string, { triangleCount: number }> | undefined
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
        expect(materials.every((material) => material.userData.heightFoggedRuins === true)).toBe(
          true,
        );
        expect(
          materials.every((material) => Number(material.userData.lowerFogHideOffset) < 0),
        ).toBe(true);
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
          const minimumRouteClearance = Math.min(
            ...routeSamples.map((routePoint) =>
              Math.hypot(position.x - routePoint.x, position.z - routePoint.z),
            ),
          );
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
