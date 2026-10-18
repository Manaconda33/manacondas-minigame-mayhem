import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import {
  createNeonGridScene,
  createServiceTunnelMeshGroup,
} from '../src/game/track/createNeonGridScene';
import type { NeonGridVisualVariant } from '../src/game/track/NeonGridVisualVariant';
import { neonGridRibbon } from '../src/game/track/NeonGridGeometry';
import { serviceTunnelGeometry } from '../src/game/track/ServiceTunnelGeometry';
import {
  SERVICE_TUNNEL_CONCRETE_ASSET_REVISION,
  SERVICE_TUNNEL_CONCRETE_TILE_METERS,
  addServiceTunnelRoofUvs,
  createPendingServiceTunnelConcreteMaterial,
  createPendingServiceTunnelC2RoofMaterial,
  createPendingServiceTunnelC2WallMaterial,
  loadServiceTunnelConcreteWallMaterial,
  serviceTunnelMaterialVariantFromSearch,
} from '../src/game/track/ServiceTunnelConcreteMaterial';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

type MaterialVariantSceneFactory = (
  track: NeonGrid,
  quality: 'low' | 'medium' | 'high',
  visualVariant: NeonGridVisualVariant,
  materialVariant: 'blockout' | 'concrete-wall-007-c1' | 'concrete-coverage-c2-001',
) => THREE.Group;

const createSceneWithMaterialVariant = createNeonGridScene as MaterialVariantSceneFactory;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Neon Grid Service Tunnel material prototype', () => {
  it('keeps the approved material and geometry on the default blockout path', () => {
    const track = new NeonGrid();
    const baseline = createServiceTunnelMeshGroup(track, 'blockout');
    const baselineLeft = baseline.getObjectByName('service-tunnel-left-wall') as THREE.Mesh;
    const baselineRight = baseline.getObjectByName('service-tunnel-right-wall') as THREE.Mesh;
    const baselineFloor = baseline.getObjectByName('service-tunnel-floor') as THREE.Mesh;
    const baselineRoof = baseline.getObjectByName('service-tunnel-roof') as THREE.Mesh;

    expect(baseline.userData.serviceTunnelMaterialVariant).toBe('blockout');
    expect(baselineLeft.geometry.getAttribute('uv')).toBeUndefined();
    expect(baselineRight.geometry.getAttribute('uv')).toBeUndefined();
    expect(baselineLeft.material).toBe(baselineRight.material);
    expect(baselineLeft.material).toBe(baselineFloor.material);
    expect(baselineLeft.material).toBe(baselineRoof.material);
    expect(
      serviceTunnelGeometry(track.serviceTunnel, 'left-wall').getAttribute('uv'),
    ).toBeUndefined();
    disposeTrackScene(baseline);

    for (const variant of ['blockout', 'concrete-wall-007-c1'] as const) {
      const scene = createSceneWithMaterialVariant(track, 'medium', 'approved', variant);
      const left = scene.getObjectByName('neon-grid-wall--1') as THREE.Mesh;
      const right = scene.getObjectByName('neon-grid-wall-1') as THREE.Mesh;
      expect(left.material).toBe(right.material);
      expect(left.geometry.getAttribute('uv')).toBeUndefined();
      expect(right.geometry.getAttribute('uv')).toBeUndefined();
      expect((left.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0x93b4c9);
      expect((left.material as THREE.MeshStandardMaterial).roughness).toBe(0.55);
      disposeTrackScene(scene);
    }
  });

  it('adds physical wall UVs without changing the existing safety-wall vertices or indices', () => {
    const track = new NeonGrid();
    const original = neonGridRibbon(track, -1, true);
    const concrete = neonGridRibbon(track, -1, true, SERVICE_TUNNEL_CONCRETE_TILE_METERS);
    const positions = concrete.getAttribute('position');
    const originalPositions = original.getAttribute('position');
    const uv = concrete.getAttribute('uv');
    const originalIndex = original.getIndex();
    const concreteIndex = concrete.getIndex();

    expect(uv).toBeDefined();
    expect(uv.count).toBe(positions.count);
    expect(Array.from(positions.array)).toEqual(Array.from(originalPositions.array));
    expect(Array.from(concreteIndex?.array ?? [])).toEqual(Array.from(originalIndex?.array ?? []));
    expect(Array.from(uv.array).every(Number.isFinite)).toBe(true);
    expect(uv.getY(1)).toBeCloseTo(1.55 / SERVICE_TUNNEL_CONCRETE_TILE_METERS);
    expect(uv.getX(2)).toBeCloseTo(
      track.curve.getLength() / (1536 * SERVICE_TUNNEL_CONCRETE_TILE_METERS),
    );
    disposeTrackScene(new THREE.Mesh(original, new THREE.MeshBasicMaterial()));
    disposeTrackScene(new THREE.Mesh(concrete, new THREE.MeshBasicMaterial()));
  });

  it('adds distance-scaled UVs only to the two shared-material prototype walls', () => {
    const track = new NeonGrid();
    const prototype = createServiceTunnelMeshGroup(track, 'concrete-wall-007-c1');
    const prototypeLeft = prototype.getObjectByName('service-tunnel-left-wall') as THREE.Mesh;
    const prototypeRight = prototype.getObjectByName('service-tunnel-right-wall') as THREE.Mesh;
    const prototypeFloor = prototype.getObjectByName('service-tunnel-floor') as THREE.Mesh;
    const prototypeRoof = prototype.getObjectByName('service-tunnel-roof') as THREE.Mesh;
    const originalGeometry = serviceTunnelGeometry(track.serviceTunnel, 'left-wall');
    const prototypeTunnel = prototype.getObjectByName('service-tunnel') as THREE.Group;

    expect(prototype.userData.serviceTunnelMaterialVariant).toBe('concrete-wall-007-c1');
    expect(prototypeLeft.geometry.getAttribute('uv')).toBeDefined();
    expect(prototypeRight.geometry.getAttribute('uv')).toBeDefined();
    expect(prototypeLeft.material).toBe(prototypeRight.material);
    expect(prototypeFloor.material).not.toBe(prototypeLeft.material);
    expect(prototypeRoof.material).not.toBe(prototypeLeft.material);
    expect(prototypeTunnel.children).toHaveLength(4);
    expect(prototypeLeft.geometry.getAttribute('position').array).toEqual(
      originalGeometry.getAttribute('position').array,
    );
    expect(prototypeLeft.geometry.index?.array).toEqual(originalGeometry.index?.array);
    expect(originalGeometry.getAttribute('uv')).toBeUndefined();

    const uv = prototypeLeft.geometry.getAttribute('uv');
    const coordinates = prototypeLeft.geometry.userData.materialCoordinates as {
      tileMeters: number;
      longitudinalMeters: number;
    };
    const [start, end] = track.serviceTunnel.wallRange(-1);
    expect(uv.count).toBe(prototypeLeft.geometry.getAttribute('position').count);
    expect(coordinates.tileMeters).toBe(SERVICE_TUNNEL_CONCRETE_TILE_METERS);
    expect(coordinates.longitudinalMeters).toBeCloseTo(
      (end - start) * track.serviceTunnel.curve.getLength(),
      6,
    );
    expect(uv.getX(uv.count - 2) - uv.getX(0)).toBeCloseTo(
      coordinates.longitudinalMeters / SERVICE_TUNNEL_CONCRETE_TILE_METERS,
      5,
    );

    disposeTrackScene(prototype);
    originalGeometry.dispose();
  });

  it('keeps Task A fogged sidewalls on one shared prototype material', () => {
    const prototype = createSceneWithMaterialVariant(
      new NeonGrid(),
      'medium',
      'fog-experiment-task-a',
      'concrete-wall-007-c1',
    );
    const left = prototype.getObjectByName('service-tunnel-left-wall') as THREE.Mesh;
    const right = prototype.getObjectByName('service-tunnel-right-wall') as THREE.Mesh;
    const material = left.material as THREE.MeshStandardMaterial;

    expect(left.material).toBe(right.material);
    expect(left.userData.abyssVerticalFog).toBe(true);
    expect(right.userData.abyssVerticalFog).toBe(true);
    expect(left.userData.abyssFogProfile).toEqual(right.userData.abyssFogProfile);
    expect(material.userData.abyssFogVersion).toBe(3);
    expect(material.color.getHex()).toBe(0x353a4a);

    disposeTrackScene(prototype);
  });

  it('maps the existing tunnel roof by arc length and width without changing geometry', () => {
    const track = new NeonGrid();
    const originalRoof = serviceTunnelGeometry(track.serviceTunnel, 'roof');
    const positions = originalRoof.getAttribute('position');
    const originalIndices = originalRoof.index?.array.slice();
    addServiceTunnelRoofUvs(originalRoof, track.serviceTunnel);
    expect(originalRoof.getAttribute('position').array).toEqual(positions.array);
    expect(originalRoof.index?.array).toEqual(originalIndices);

    const roofUvs = originalRoof.getAttribute('uv');
    const coordinates = originalRoof.userData.materialCoordinates as {
      tileMeters: number;
      longitudinalMeters: number;
      transverseMeters: number;
      mapping: string;
      anchorFraction: number;
    };
    expect(coordinates.mapping).toBe('service-tunnel-arc-length-and-roof-width');
    expect(coordinates.tileMeters).toBe(SERVICE_TUNNEL_CONCRETE_TILE_METERS);
    expect(coordinates.longitudinalMeters).toBeCloseTo(track.serviceTunnel.curve.getLength(), 6);
    expect(coordinates.transverseMeters).toBeCloseTo(track.serviceTunnel.roadHalfWidth * 2, 6);
    expect(coordinates.anchorFraction).toBeCloseTo(
      (track.serviceTunnel.wallRange(-1)[0] + track.serviceTunnel.wallRange(1)[0]) / 2,
      6,
    );
    expect(roofUvs.getX(roofUvs.count - 1) - roofUvs.getX(0)).toBeCloseTo(
      coordinates.longitudinalMeters / SERVICE_TUNNEL_CONCRETE_TILE_METERS,
      5,
    );
    expect(roofUvs.getY(0)).toBe(0);
    expect(roofUvs.getY(1)).toBeCloseTo(
      coordinates.transverseMeters / SERVICE_TUNNEL_CONCRETE_TILE_METERS,
      5,
    );
    for (let i = 0; i < roofUvs.count; i++) {
      expect(Number.isFinite(roofUvs.getX(i))).toBe(true);
      expect(Number.isFinite(roofUvs.getY(i))).toBe(true);
    }

    originalRoof.dispose();
  });

  it('uses only the exact opt-in query and loads the shared 1K maps with correct color spaces', async () => {
    expect(serviceTunnelMaterialVariantFromSearch('')).toBe('blockout');
    expect(serviceTunnelMaterialVariantFromSearch('?neonGridMaterial=off')).toBe('blockout');
    expect(
      serviceTunnelMaterialVariantFromSearch(
        '?neonGridMaterial=service-tunnel-concrete-001&neonGridVisual=neon-grid-task-a-001',
      ),
    ).toBe('concrete-wall-007-c1');
    expect(
      serviceTunnelMaterialVariantFromSearch('?neonGridMaterial=concrete-coverage-c2-001'),
    ).toBe('concrete-coverage-c2-001');

    const scene = new THREE.Group();
    scene.userData.serviceTunnelMaterialVariant = 'concrete-wall-007-c1';
    const sidewallMaterial = createPendingServiceTunnelConcreteMaterial();
    const wallGeometry = new THREE.BufferGeometry()
      .setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))
      .setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0], 2));
    for (const name of ['service-tunnel-left-wall', 'service-tunnel-right-wall']) {
      const wall = new THREE.Mesh(wallGeometry, sidewallMaterial);
      wall.name = name;
      scene.add(wall);
    }
    const floor = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
    floor.name = 'service-tunnel-floor';
    scene.add(floor);
    const textures = [
      new THREE.Texture<HTMLImageElement>(),
      new THREE.Texture<HTMLImageElement>(),
      new THREE.Texture<HTMLImageElement>(),
    ];
    const textureDisposals = textures.map((texture) => vi.spyOn(texture, 'dispose'));
    const loadedUrls: string[] = [];
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation((url: string) => {
      loadedUrls.push(url);
      const index = loadedUrls.length - 1;
      const texture = textures[index];
      if (texture === undefined) return Promise.reject(new Error('unexpected texture request'));
      return Promise.resolve(texture);
    });

    await loadServiceTunnelConcreteWallMaterial(scene);

    const left = scene.getObjectByName('service-tunnel-left-wall') as THREE.Mesh;
    const right = scene.getObjectByName('service-tunnel-right-wall') as THREE.Mesh;
    const material = left.material as THREE.MeshStandardMaterial;
    expect(loadedUrls).toHaveLength(3);
    expect(loadedUrls[0]).toContain(
      'assets/track/materials/concrete-wall-007/concrete_wall_007_diff_1k.png',
    );
    expect(loadedUrls[1]).toContain(
      'assets/track/materials/concrete-wall-007/concrete_wall_007_nor_gl_1k.png',
    );
    expect(loadedUrls[2]).toContain(
      'assets/track/materials/concrete-wall-007/concrete_wall_007_rough_1k.png',
    );
    expect(
      loadedUrls.every((url) => url.includes(`?v=${SERVICE_TUNNEL_CONCRETE_ASSET_REVISION}`)),
    ).toBe(true);
    expect(left.material).toBe(right.material);
    expect(material.name).toBe('service-tunnel-concrete-wall-007-c1');
    expect(material.map).toBe(textures[0]);
    expect(material.normalMap).toBe(textures[1]);
    expect(material.roughnessMap).toBe(textures[2]);
    expect(floor.material).not.toBe(material);
    expect(textures[0]?.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(textures[1]?.colorSpace).toBe(THREE.NoColorSpace);
    expect(textures[2]?.colorSpace).toBe(THREE.NoColorSpace);
    expect(
      textures.every(
        (texture) =>
          texture.wrapS === THREE.RepeatWrapping && texture.wrapT === THREE.RepeatWrapping,
      ),
    ).toBe(true);

    disposeTrackScene(scene);
    expect(textureDisposals.every((dispose) => dispose.mock.calls.length === 1)).toBe(true);
  });

  it('reuses the approved maps for C2 walls and roof without adding a render batch', async () => {
    const track = new NeonGrid();
    const scene = createSceneWithMaterialVariant(
      track,
      'medium',
      'approved',
      'concrete-coverage-c2-001',
    );
    const textures = [
      new THREE.Texture<HTMLImageElement>(),
      new THREE.Texture<HTMLImageElement>(),
      new THREE.Texture<HTMLImageElement>(),
    ];
    const textureDisposals = textures.map((texture) => vi.spyOn(texture, 'dispose'));
    let loadCount = 0;
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(() => {
      const texture = textures[loadCount++];
      return texture === undefined
        ? Promise.reject(new Error('unexpected texture request'))
        : Promise.resolve(texture);
    });
    const roof = scene.getObjectByName('service-tunnel-roof') as THREE.Mesh;
    const left = scene.getObjectByName('service-tunnel-left-wall') as THREE.Mesh;
    const right = scene.getObjectByName('service-tunnel-right-wall') as THREE.Mesh;
    const courseWalls = [
      scene.getObjectByName('neon-grid-wall--1') as THREE.Mesh,
      scene.getObjectByName('neon-grid-wall-1') as THREE.Mesh,
    ];
    const tunnel = scene.getObjectByName('service-tunnel') as THREE.Group;
    const childCount = tunnel.children.length;
    const unaffectedNames = [
      'undercity-industrial-architecture',
      'skyline-deck-fascia',
      'skyline-pylons',
      'falls-run-deck-fascia',
      'falls-run-pylons',
      'falls-run-wall-cladding',
    ];
    const unaffectedMaterials: (THREE.Material | THREE.Material[] | null)[] = unaffectedNames.map(
      (name) => {
        const mesh = scene.getObjectByName(name);
        return mesh instanceof THREE.Mesh
          ? (mesh.material as THREE.Material | THREE.Material[])
          : null;
      },
    );

    await loadServiceTunnelConcreteWallMaterial(scene);

    const wallMaterial = left.material as THREE.MeshStandardMaterial;
    const roofMaterial = roof.material as THREE.MeshStandardMaterial;
    expect(loadCount).toBe(3);
    expect(scene.userData.serviceTunnelMaterialVariant).toBe('concrete-coverage-c2-001');
    expect(roof.geometry.getAttribute('uv')).toBeDefined();
    expect(left.geometry.getAttribute('uv')).toBeDefined();
    expect(right.geometry.getAttribute('uv')).toBeDefined();
    expect(courseWalls.every((wall) => wall.geometry.hasAttribute('uv'))).toBe(true);
    expect(
      (scene.getObjectByName('service-tunnel-floor') as THREE.Mesh).geometry.getAttribute('uv'),
    ).toBeUndefined();
    expect(left.material).toBe(right.material);
    expect(courseWalls[0]?.material).toBe(courseWalls[1]?.material);
    expect(courseWalls[0]?.material).not.toBe(wallMaterial);
    expect(roof.material).not.toBe(wallMaterial);
    const floor = scene.getObjectByName('service-tunnel-floor') as THREE.Mesh;
    expect(roof.material).not.toBe(floor.material);
    for (const material of [wallMaterial, roofMaterial]) {
      expect(material.map).toBe(textures[0]);
      expect(material.normalMap).toBe(textures[1]);
      expect(material.roughnessMap).toBe(textures[2]);
      expect(material.roughness).toBe(1);
      expect(material.metalness).toBe(0);
      expect(material.normalScale.toArray()).toEqual([0.45, 0.45]);
      expect(material.side).toBe(THREE.DoubleSide);
    }
    for (const wall of courseWalls) {
      const material = wall.material as THREE.MeshStandardMaterial;
      expect(material.map).toBe(textures[0]);
      expect(material.normalMap).toBe(textures[1]);
      expect(material.roughnessMap).toBe(textures[2]);
      expect(material.roughness).toBe(1);
      expect(material.metalness).toBe(0);
    }
    expect(tunnel.children).toHaveLength(childCount);
    expect(floor.material).not.toBe(roofMaterial);
    unaffectedNames.forEach((name, index) => {
      const mesh = scene.getObjectByName(name);
      const previousMaterial = unaffectedMaterials[index];
      if (
        mesh instanceof THREE.Mesh &&
        previousMaterial !== null &&
        previousMaterial !== undefined
      ) {
        expect(mesh.material).toBe(previousMaterial);
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        expect(
          materials.every(
            (candidate) =>
              !(candidate instanceof THREE.MeshStandardMaterial) || candidate.map === null,
          ),
        ).toBe(true);
      }
    });

    disposeTrackScene(scene);
    expect(textureDisposals.every((dispose) => dispose.mock.calls.length === 1)).toBe(true);
  });

  it('disposes fulfilled map loads when any required texture fails', async () => {
    const track = new NeonGrid();
    const scene = createSceneWithMaterialVariant(
      track,
      'medium',
      'approved',
      'concrete-wall-007-c1',
    );
    const loaded = [new THREE.Texture<HTMLImageElement>(), new THREE.Texture<HTMLImageElement>()];
    const disposed = loaded.map((texture) => vi.spyOn(texture, 'dispose'));
    let index = 0;
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(() => {
      if (index < loaded.length) {
        const texture = loaded[index++];
        if (texture !== undefined) return Promise.resolve(texture);
      }
      return Promise.reject(new Error('fixture load error'));
    });

    await expect(loadServiceTunnelConcreteWallMaterial(scene)).rejects.toThrow(
      'Unable to load the complete Concrete Wall 007 map set',
    );
    expect(disposed[0]).toHaveBeenCalledOnce();
    expect(disposed[1]).toHaveBeenCalledOnce();
    disposeTrackScene(scene);
  });

  it('releases the shared C2 maps on scene disposal and reloads cleanly after a scene rebuild', async () => {
    const makeTextures = () => [
      new THREE.Texture<HTMLImageElement>(),
      new THREE.Texture<HTMLImageElement>(),
      new THREE.Texture<HTMLImageElement>(),
    ];
    const firstTextures = makeTextures();
    const secondTextures = makeTextures();
    const allTextures = [...firstTextures, ...secondTextures];
    const disposals = allTextures.map((texture) => vi.spyOn(texture, 'dispose'));
    let loadIndex = 0;
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(() => {
      const texture = allTextures[loadIndex++];
      return texture === undefined
        ? Promise.reject(new Error('unexpected texture request'))
        : Promise.resolve(texture);
    });

    const firstScene = createServiceTunnelMeshGroup(new NeonGrid(), 'concrete-coverage-c2-001');
    await loadServiceTunnelConcreteWallMaterial(firstScene);
    const firstRoof = firstScene.getObjectByName('service-tunnel-roof') as THREE.Mesh;
    expect(firstRoof.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect((firstRoof.material as THREE.MeshStandardMaterial).map).toBe(firstTextures[0]);
    disposeTrackScene(firstScene);
    expect(disposals.slice(0, 3).every((dispose) => dispose.mock.calls.length === 1)).toBe(true);

    const secondScene = createServiceTunnelMeshGroup(new NeonGrid(), 'concrete-coverage-c2-001');
    await loadServiceTunnelConcreteWallMaterial(secondScene);
    const secondRoof = secondScene.getObjectByName('service-tunnel-roof') as THREE.Mesh;
    expect((secondRoof.material as THREE.MeshStandardMaterial).map).toBe(secondTextures[0]);
    expect((secondRoof.material as THREE.MeshStandardMaterial).map).not.toBe(
      (firstRoof.material as THREE.MeshStandardMaterial).map,
    );
    expect(loadIndex).toBe(6);
    disposeTrackScene(secondScene);
    expect(disposals.every((dispose) => dispose.mock.calls.length === 1)).toBe(true);
  });

  it('leaves C2 pending materials untouched and disposes partial map loads on failure', async () => {
    const scene = new THREE.Group();
    scene.userData.serviceTunnelMaterialVariant = 'concrete-coverage-c2-001';
    const makeGeometry = () =>
      new THREE.BufferGeometry()
        .setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))
        .setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0], 2));
    const wallsMaterial = createPendingServiceTunnelC2WallMaterial();
    for (const name of ['service-tunnel-left-wall', 'service-tunnel-right-wall']) {
      const mesh = new THREE.Mesh(makeGeometry(), wallsMaterial);
      mesh.name = name;
      scene.add(mesh);
    }
    const roof = new THREE.Mesh(makeGeometry(), createPendingServiceTunnelC2RoofMaterial());
    roof.name = 'service-tunnel-roof';
    scene.add(roof);
    const loaded = [new THREE.Texture<HTMLImageElement>(), new THREE.Texture<HTMLImageElement>()];
    const disposed = loaded.map((texture) => vi.spyOn(texture, 'dispose'));
    let index = 0;
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(() => {
      const texture = loaded[index++];
      return texture === undefined
        ? Promise.reject(new Error('fixture load error'))
        : Promise.resolve(texture);
    });

    await expect(loadServiceTunnelConcreteWallMaterial(scene)).rejects.toThrow(
      'Unable to load the complete Concrete Wall 007 map set',
    );
    expect(wallsMaterial.map).toBeNull();
    expect(roof.material.map).toBeNull();
    expect(disposed.every((dispose) => dispose.mock.calls.length === 1)).toBe(true);
    disposeTrackScene(scene);
  });
});
