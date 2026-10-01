import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { createTrackScene } from '../src/game/track/createTrackScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

afterEach(() => vi.restoreAllMocks());

function surface(
  scene: THREE.Group,
  name: string,
): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
  const object = scene.getObjectByName(name);
  if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshStandardMaterial))
    throw new Error(`Missing terrain surface: ${name}`);
  return object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
}

function fakeTextureTransport() {
  const requests: { url: string; texture: THREE.Texture; fail: () => void }[] = [];
  vi.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation(
    (url, _loaded, _progress, failed) => {
      const texture = new THREE.Texture<HTMLImageElement>();
      requests.push({ url, texture, fail: () => failed?.(new Error('Missing optional map')) });
      return texture;
    },
  );
  return requests;
}

describe('Circuit Alpha terrain completion', () => {
  it('renders grass, dirt and shoulder with separate color, normal and shared packed roughness/AO maps', () => {
    const requests = fakeTextureTransport();
    const scene = createTrackScene(new CircuitAlpha());
    for (const name of ['track-ground', 'split-bend-dirt-line', 'track-shoulder']) {
      const material = surface(scene, name).material;
      expect(material.map, name).toBeInstanceOf(THREE.Texture);
      expect(material.normalMap, name).toBeInstanceOf(THREE.Texture);
      expect(material.aoMap, name).toBeInstanceOf(THREE.Texture);
      expect(material.roughnessMap).toBe(material.aoMap);
      expect(material.map?.colorSpace).toBe(THREE.SRGBColorSpace);
      expect(material.aoMap?.colorSpace).not.toBe(THREE.SRGBColorSpace);
      expect(material.aoMap?.channel).toBe(0);
      expect(material.displacementMap).toBeNull();
      for (const texture of [material.map, material.normalMap, material.aoMap]) {
        expect(texture?.wrapS).toBe(THREE.RepeatWrapping);
        expect(texture?.wrapT).toBe(THREE.RepeatWrapping);
        expect(texture?.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      }
    }
    expect(requests.filter(({ url }) => url.includes('/terrain-v1/'))).toHaveLength(9);
    expect(
      requests
        .filter(({ url }) => url.includes('/terrain-v1/'))
        .every(
          ({ url }) =>
            url.startsWith(`${import.meta.env.BASE_URL}assets/track/materials/terrain-v1/`) &&
            url.includes('?v='),
        ),
    ).toBe(true);
    disposeTrackScene(scene);
  });

  it('uses meter-scaled ground UVs and a seam-safe shoulder without changing race topology', () => {
    fakeTextureTransport();
    const track = new CircuitAlpha();
    const before = track.samples.map((point) => point.toArray());
    const scene = createTrackScene(track);
    const ground = surface(scene, 'track-ground').geometry;
    const uv = ground.getAttribute('uv');
    const position = ground.getAttribute('position');
    // A 900m plane at 2m per grass tile needs 450 repetitions.
    expect(Math.abs(uv.getX(1) - uv.getX(0))).toBeCloseTo(450);
    expect(Math.abs(position.getX(1) - position.getX(0))).toBeCloseTo(900);
    const shoulder = surface(scene, 'track-shoulder').geometry.getAttribute('uv');
    expect(shoulder.getY(shoulder.count - 1) - shoulder.getY(1)).toBeCloseTo(
      Math.round(shoulder.getY(shoulder.count - 1) - shoulder.getY(1)),
      5,
    );
    expect(track.samples.map((point) => point.toArray())).toEqual(before);
    disposeTrackScene(scene);
  });

  it('restores the accepted flat grass palette when albedo fails and retains surviving maps', () => {
    const requests = fakeTextureTransport();
    const scene = createTrackScene(new CircuitAlpha());
    const material = surface(scene, 'track-ground').material;
    const map = material.map;
    expect(map).toBeInstanceOf(THREE.Texture);
    const request = requests.find(({ texture }) => texture === map);
    if (!request) throw new Error('Missing grass albedo request');
    const disposal = vi.spyOn(request.texture, 'dispose');
    const normal = material.normalMap;
    request.fail();
    expect(material.map).toBeNull();
    expect(material.color.getHex()).toBe(0x284b35);
    expect(material.normalMap).toBe(normal);
    expect(disposal).toHaveBeenCalledTimes(1);
    disposeTrackScene(scene);
    expect(disposal).toHaveBeenCalledTimes(1);
  });

  it('detaches both packed-map roles on failure and frees every new texture exactly once', () => {
    const requests = fakeTextureTransport();
    const scene = createTrackScene(new CircuitAlpha());
    const material = surface(scene, 'split-bend-dirt-line').material;
    expect(material.aoMap).toBeInstanceOf(THREE.Texture);
    const packed = requests.find(({ texture }) => texture === material.aoMap);
    if (!packed) throw new Error('Missing dirt packed-map request');
    const disposals = requests
      .filter(({ url }) => url.includes('/terrain-v1/'))
      .map(({ texture }) => vi.spyOn(texture, 'dispose'));
    packed.fail();
    expect(material.aoMap).toBeNull();
    expect(material.roughnessMap).toBeNull();
    disposeTrackScene(scene);
    expect(disposals).toHaveLength(9);
    for (const disposal of disposals) expect(disposal).toHaveBeenCalledTimes(1);
    // Late failure after race teardown must not mutate retired materials or double-free.
    const version = material.version;
    for (const request of requests.filter(({ url }) => url.includes('/terrain-v1/')))
      request.fail();
    expect(material.version).toBe(version);
    for (const disposal of disposals) expect(disposal).toHaveBeenCalledTimes(1);
  });
});
