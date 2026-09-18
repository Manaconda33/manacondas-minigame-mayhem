import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import {
  CIRCUIT_ALPHA_MATERIAL_TILE_METERS,
  createLoopStripGeometry,
  createSegmentStripGeometry,
} from '../src/game/track/TrackMaterialCoordinates';
import { createCircuitAlphaAsphaltMaterials } from '../src/game/track/TrackMaterials';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Circuit Alpha material coordinates', () => {
  it('creates seam-safe loop UVs with an approximately 2 m longitudinal material scale', () => {
    const track = new CircuitAlpha();
    const geometry = createLoopStripGeometry(track, track.roadHalfWidth, 0);
    const positions = geometry.getAttribute('position');
    const uvs = geometry.getAttribute('uv');
    const metadata = geometry.userData.materialCoordinates as {
      tileMeters: number;
      longitudinalRepeats: number;
      closed: boolean;
    };

    expect(uvs.count).toBe(positions.count);
    expect(metadata.tileMeters).toBe(CIRCUIT_ALPHA_MATERIAL_TILE_METERS);
    expect(metadata.closed).toBe(true);
    expect(Number.isInteger(metadata.longitudinalRepeats)).toBe(true);
    expect(metadata.longitudinalRepeats).toBeGreaterThan(400);

    const lastLeft = positions.count - 2;
    const lastRight = positions.count - 1;
    expect(positions.getX(lastLeft)).toBeCloseTo(positions.getX(0), 5);
    expect(positions.getZ(lastLeft)).toBeCloseTo(positions.getZ(0), 5);
    expect(positions.getX(lastRight)).toBeCloseTo(positions.getX(1), 5);
    expect(positions.getZ(lastRight)).toBeCloseTo(positions.getZ(1), 5);

    expect(uvs.getY(0)).toBe(0);
    expect(uvs.getY(lastLeft)).toBeCloseTo(metadata.longitudinalRepeats, 6);
    expect(uvs.getY(lastRight)).toBeCloseTo(metadata.longitudinalRepeats, 6);
    expect(uvs.getX(1) - uvs.getX(0)).toBeCloseTo(
      (track.roadHalfWidth * 2) / CIRCUIT_ALPHA_MATERIAL_TILE_METERS,
      6,
    );
  });

  it('creates finite monotonic UVs for bounded procedural segments without changing track samples', () => {
    const track = new CircuitAlpha();
    const before = track.samples.map((point) => point.toArray());
    const geometry = createSegmentStripGeometry(track, 0.235, 0.315, 3.75, 2.25, 0.026);
    const positions = geometry.getAttribute('position');
    const uvs = geometry.getAttribute('uv');
    const metadata = geometry.userData.materialCoordinates as {
      tileMeters: number;
      longitudinalRepeats: number;
      closed: boolean;
    };

    expect(uvs.count).toBe(positions.count);
    expect(metadata.tileMeters).toBe(CIRCUIT_ALPHA_MATERIAL_TILE_METERS);
    expect(metadata.closed).toBe(false);
    expect(metadata.longitudinalRepeats).toBeGreaterThan(20);
    expect(uvs.getX(1) - uvs.getX(0)).toBeCloseTo(2.25, 6);

    let previousV = -Infinity;
    for (let index = 0; index < uvs.count; index += 2) {
      const leftV = uvs.getY(index);
      const rightV = uvs.getY(index + 1);
      expect(Number.isFinite(uvs.getX(index))).toBe(true);
      expect(Number.isFinite(leftV)).toBe(true);
      expect(leftV).toBeCloseTo(rightV, 8);
      expect(leftV).toBeGreaterThanOrEqual(previousV);
      previousV = leftV;
    }
    expect(track.samples.map((point) => point.toArray())).toEqual(before);
  });
});

describe('Circuit Alpha asphalt PBR material pass', () => {
  it('loads one shared 1K diffuse/normal/roughness set with repeat wrapping and base-aware URLs', () => {
    const loadedUrls: string[] = [];
    vi.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation((url: string) => {
      loadedUrls.push(url);
      return new THREE.Texture();
    });

    const materials = createCircuitAlphaAsphaltMaterials();
    const diffuse = materials.road.map;
    const normal = materials.road.normalMap;
    const roughness = materials.road.roughnessMap;

    expect(loadedUrls).toHaveLength(3);
    expect(loadedUrls.every((url) => url.includes('assets/track/materials/asphalt-track/'))).toBe(
      true,
    );
    expect(loadedUrls.every((url) => url.includes('?v=slice6-asphalt-20260918-1'))).toBe(true);
    expect(diffuse).toBe(materials.racingWear.map);
    expect(normal).toBe(materials.racingWear.normalMap);
    expect(roughness).toBe(materials.racingWear.roughnessMap);

    for (const texture of [diffuse, normal, roughness]) {
      expect(texture).not.toBeNull();
      expect(texture?.wrapS).toBe(THREE.RepeatWrapping);
      expect(texture?.wrapT).toBe(THREE.RepeatWrapping);
      expect(texture?.generateMipmaps).toBe(true);
    }
    expect(diffuse?.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(normal?.colorSpace).not.toBe(THREE.SRGBColorSpace);
    expect(materials.road.name).toBe('circuit-alpha-asphalt-pbr');
    expect(materials.racingWear.name).toBe('circuit-alpha-asphalt-wear-pbr');
    expect(materials.road.normalScale.x).toBeCloseTo(0.42);
    expect(materials.racingWear.normalScale.x).toBeCloseTo(0.3);
  });
});

describe('Circuit Alpha track resource cleanup', () => {
  it('disposes shared textures, materials and geometries once before clearing the scene root', () => {
    const texture = new THREE.Texture();
    const material = new THREE.MeshStandardMaterial({ map: texture, roughnessMap: texture });
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, material));

    const textureDispose = vi.spyOn(texture, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');
    const geometryDispose = vi.spyOn(geometry, 'dispose');

    disposeTrackScene(group);

    expect(textureDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(group.children).toHaveLength(0);
  });
});
