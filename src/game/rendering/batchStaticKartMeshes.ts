import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Load-time only: combine opaque static kart parts; retain dynamic named controls and anchors. */
export function batchStaticKartMeshes(root: THREE.Object3D): () => void {
  root.updateMatrixWorld(true);
  const inverseRoot = root.matrixWorld.clone().invert();
  const batches = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.Material>[]>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const mesh = object as THREE.Mesh;
    if (
      object instanceof THREE.SkinnedMesh ||
      object instanceof THREE.InstancedMesh ||
      Array.isArray(mesh.material) ||
      mesh.material.transparent ||
      !mesh.material.depthWrite ||
      object.children.length > 0 ||
      Object.keys(mesh.geometry.morphAttributes).length > 0 ||
      mesh.geometry.drawRange.start !== 0 ||
      mesh.geometry.drawRange.count !== Infinity ||
      object.matrixWorld.determinant() <= 0
    )
      return;
    for (
      let ancestor: THREE.Object3D | null = object;
      ancestor !== null;
      ancestor = ancestor.parent
    ) {
      if (!ancestor.visible || ancestor.name === 'SteeringWheel') return;
      if (ancestor === root) break;
    }
    // Attribute layout and render policies must agree; merge failure leaves original parts intact.
    const attributes = Object.entries(mesh.geometry.attributes).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    if (attributes.some(([, a]) => a instanceof THREE.InterleavedBufferAttribute)) return;
    const layout = attributes
      .map(
        ([name, a]) =>
          `${name}:${String(a.itemSize)}:${String(a.normalized)}:${(a as THREE.BufferAttribute).array.constructor.name}`,
      )
      .join(',');
    const key = [
      mesh.material.uuid,
      object.castShadow,
      object.receiveShadow,
      object.layers.mask,
      object.renderOrder,
      object.frustumCulled,
      mesh.geometry.index !== null,
      layout,
    ].join('|');
    const meshes = batches.get(key) ?? [];
    meshes.push(object as THREE.Mesh<THREE.BufferGeometry, THREE.Material>);
    batches.set(key, meshes);
  });

  const owned = new Set<THREE.BufferGeometry>();
  const retired = new Set<THREE.BufferGeometry>();
  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue;
    const first = meshes[0];
    if (first === undefined) continue;
    const copies = meshes.map((mesh) =>
      mesh.geometry
        .clone()
        .applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverseRoot, mesh.matrixWorld)),
    );
    const geometry = mergeGeometries(copies, false) as THREE.BufferGeometry | null;
    for (const copy of copies) copy.dispose();
    if (geometry === null) continue;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const merged = new THREE.Mesh(geometry, first.material);
    merged.name = 'batched-static-kart-parts';
    merged.castShadow = first.castShadow;
    merged.receiveShadow = first.receiveShadow;
    merged.layers.mask = first.layers.mask;
    merged.renderOrder = first.renderOrder;
    merged.frustumCulled = first.frustumCulled;
    root.add(merged);
    owned.add(geometry);
    for (const mesh of meshes) {
      mesh.removeFromParent();
      retired.add(mesh.geometry);
    }
  }
  // Original geometry may also be used by a retained control. Leave its ownership untouched.
  root.traverse((object) => {
    if (object instanceof THREE.Mesh && object.name !== 'batched-static-kart-parts')
      retired.delete((object as THREE.Mesh).geometry);
  });
  for (const geometry of retired) geometry.dispose();
  retired.clear();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const geometry of owned) geometry.dispose();
    owned.clear();
  };
}
