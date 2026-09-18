import * as THREE from 'three';

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
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) textures.add(value);
  }

  if (material instanceof THREE.ShaderMaterial) {
    for (const uniform of Object.values(material.uniforms)) {
      if (uniform.value instanceof THREE.Texture) textures.add(uniform.value);
    }
  }
}

export function disposeTrackScene(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    addMaterial(object.material, materials);
  });

  for (const material of materials) collectMaterialTextures(material, textures);
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();

  root.clear();
}
