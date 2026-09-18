import * as THREE from 'three';

const ASPHALT_ASSET_REVISION = 'slice6-asphalt-20260918-1';
const ASPHALT_ROOT = 'assets/track/materials/asphalt-track';

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}?v=${ASPHALT_ASSET_REVISION}`;
}

function loadRepeatingTexture(
  loader: THREE.TextureLoader,
  fileName: string,
  name: string,
  srgb = false,
): THREE.Texture {
  const texture = loader.load(assetUrl(`${ASPHALT_ROOT}/${fileName}`));
  texture.name = name;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface CircuitAlphaAsphaltMaterials {
  readonly road: THREE.MeshStandardMaterial;
  readonly racingWear: THREE.MeshStandardMaterial;
}

export function createCircuitAlphaAsphaltMaterials(): CircuitAlphaAsphaltMaterials {
  const loader = new THREE.TextureLoader();
  const diffuse = loadRepeatingTexture(
    loader,
    'asphalt_track_diff_1k.jpg',
    'circuit-alpha-asphalt-diffuse-1k',
    true,
  );
  const normal = loadRepeatingTexture(
    loader,
    'asphalt_track_nor_gl_1k.jpg',
    'circuit-alpha-asphalt-normal-gl-1k',
  );
  const roughness = loadRepeatingTexture(
    loader,
    'asphalt_track_rough_1k.jpg',
    'circuit-alpha-asphalt-roughness-1k',
  );

  const road = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: diffuse,
    normalMap: normal,
    normalScale: new THREE.Vector2(0.42, 0.42),
    roughness: 0.96,
    roughnessMap: roughness,
    metalness: 0.015,
  });
  road.name = 'circuit-alpha-asphalt-pbr';

  const racingWear = new THREE.MeshStandardMaterial({
    color: 0xc5c7ce,
    map: diffuse,
    normalMap: normal,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughness: 0.78,
    roughnessMap: roughness,
    metalness: 0.01,
  });
  racingWear.name = 'circuit-alpha-asphalt-wear-pbr';

  return { road, racingWear };
}
