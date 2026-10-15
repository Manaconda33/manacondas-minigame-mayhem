import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import type { NeonGridVisualVariant } from '../src/game/track/NeonGridVisualVariant';
import { serviceTunnelGeometry } from '../src/game/track/ServiceTunnelGeometry';
import {
  SERVICE_TUNNEL_CONCRETE_ASSET_REVISION,
  SERVICE_TUNNEL_CONCRETE_TILE_METERS,
  loadServiceTunnelConcreteWallMaterial,
  serviceTunnelMaterialVariantFromSearch,
} from '../src/game/track/ServiceTunnelConcreteMaterial';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

type MaterialVariantSceneFactory = (
  track: NeonGrid,
  quality: 'low' | 'medium' | 'high',
  visualVariant: NeonGridVisualVariant,
  materialVariant: 'blockout' | 'concrete-wall-007-c1',
) => THREE.Group;

const createSceneWithMaterialVariant = createNeonGridScene as MaterialVariantSceneFactory;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Neon Grid Service Tunnel material prototype', () => {
  it('keeps the approved material and geometry on the default blockout path', () => {
    const track = new NeonGrid();
    const baseline = createSceneWithMaterialVariant(track, 'medium', 'approved', 'blockout');
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
  });

  it('adds distance-scaled UVs only to the two shared-material prototype walls', () => {
    const track = new NeonGrid();
    const prototype = createSceneWithMaterialVariant(
      track,
      'medium',
      'approved',
      'concrete-wall-007-c1',
    );
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

  it('uses only the exact opt-in query and loads the shared 1K maps with correct color spaces', async () => {
    expect(serviceTunnelMaterialVariantFromSearch('')).toBe('blockout');
    expect(serviceTunnelMaterialVariantFromSearch('?neonGridMaterial=off')).toBe('blockout');
    expect(
      serviceTunnelMaterialVariantFromSearch(
        '?neonGridMaterial=service-tunnel-concrete-001&neonGridVisual=neon-grid-task-a-001',
      ),
    ).toBe('concrete-wall-007-c1');

    const track = new NeonGrid();
    const scene = createSceneWithMaterialVariant(
      track,
      'medium',
      'approved',
      'concrete-wall-007-c1',
    );
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
    const floor = scene.getObjectByName('service-tunnel-floor') as THREE.Mesh;
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
});
