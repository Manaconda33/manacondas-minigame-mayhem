import * as THREE from 'three';

type MaterialTextureKey =
  | 'alphaMap'
  | 'aoMap'
  | 'bumpMap'
  | 'displacementMap'
  | 'emissiveMap'
  | 'envMap'
  | 'lightMap'
  | 'map'
  | 'metalnessMap'
  | 'normalMap'
  | 'roughnessMap';

const MATERIAL_TEXTURE_KEYS: readonly MaterialTextureKey[] = [
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'lightMap',
  'map',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
];

type TexturedMaterial = THREE.Material &
  Partial<Record<MaterialTextureKey, THREE.Texture | null>>;

type DisposableMesh = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material | THREE.Material[]
>;

function addMaterial(
  material: THREE.Material | THREE.Material[],
  materials: Set<THREE.Material>,
): void {
  if (Array.isArray(material)) {
    for (const entry of material) materials.add(entry);
    return;
  }
  materials.add(material);
}

function collectMaterialTextures(material: THREE.Material, textures: Set<THREE.Texture>): void {
  const textured = material as TexturedMaterial;
  for (const key of MATERIAL_TEXTURE_KEYS) {
    const texture = textured[key];
    if (texture instanceof THREE.Texture) textures.add(texture as THREE.Texture);
  }

  if (material instanceof THREE.ShaderMaterial) {
    for (const uniform of Object.values(material.uniforms)) {
      const value: unknown = uniform.value;
      if (value instanceof THREE.Texture) textures.add(value as THREE.Texture);
    }
  }
}

function isDisposableMesh(object: THREE.Object3D): object is DisposableMesh {
  return object instanceof THREE.Mesh;
}

export function disposeTrackScene(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (!isDisposableMesh(object)) return;
    geometries.add(object.geometry);
    addMaterial(object.material, materials);
  });

  for (const material of materials) collectMaterialTextures(material, textures);
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();

  root.clear();
}
