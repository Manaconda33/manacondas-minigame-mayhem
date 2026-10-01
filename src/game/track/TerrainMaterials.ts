import * as THREE from 'three';

const TERRAIN_ROOT = 'assets/track/materials/terrain-v1';
const TERRAIN_REVISION = 'slice6-terrain-20261001-1';
export const GRASS_TILE_METERS = 2;
export const DIRT_TILE_METERS = 1.3;

type MapRole = 'map' | 'normalMap' | 'roughnessMap' | 'aoMap';

/** Optional decoration: a failed map restores the governed color-only surface. */
function attachMap(
  material: THREE.MeshStandardMaterial,
  file: string,
  roles: readonly MapRole[],
  fallbackColor: number,
): void {
  let retired = false;
  let released = false;
  material.addEventListener('dispose', () => {
    retired = true;
  });
  const texture = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}${TERRAIN_ROOT}/${file}?v=${TERRAIN_REVISION}`,
    undefined,
    undefined,
    () => {
      if (retired || released) return;
      for (const role of roles) material[role] = null;
      if (roles.includes('map')) material.color.setHex(fallbackColor);
      material.needsUpdate = true;
      texture.dispose();
    },
  );
  texture.addEventListener('dispose', () => {
    released = true;
  });
  texture.name = `circuit-alpha-${file}`;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  // r185 supports all material maps on UV channel 0; ARM uses R=AO, G=roughness.
  texture.channel = 0;
  if (roles.includes('map')) texture.colorSpace = THREE.SRGBColorSpace;
  for (const role of roles) material[role] = texture;
}

function terrainMaterial(
  sourceId: string,
  color: number,
  fallbackColor: number,
  normalStrength: number,
  aoStrength: number,
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0,
    normalScale: new THREE.Vector2(normalStrength, normalStrength),
    aoMapIntensity: aoStrength,
  });
  material.name = `circuit-alpha-${sourceId}-pbr`;
  attachMap(material, `${sourceId}_diff_1k.jpg`, ['map'], fallbackColor);
  attachMap(material, `${sourceId}_nor_gl_1k.jpg`, ['normalMap'], fallbackColor);
  attachMap(material, `${sourceId}_arm_1k.jpg`, ['aoMap', 'roughnessMap'], fallbackColor);
  return material;
}

export function createCircuitAlphaTerrainMaterials(): {
  readonly grass: THREE.MeshStandardMaterial;
  readonly dirt: THREE.MeshStandardMaterial;
  readonly shoulder: THREE.MeshStandardMaterial;
} {
  return {
    grass: terrainMaterial('leafy_grass', 0x78aa80, 0x284b35, 0.38, 0.3),
    dirt: terrainMaterial('brown_mud', 0xdab293, 0x865536, 0.45, 0.35),
    shoulder: terrainMaterial('gravel_floor_02', 0x9a82b0, 0x6e587f, 0.28, 0.25),
  };
}
