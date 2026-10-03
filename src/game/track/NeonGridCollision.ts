import RAPIER from '@dimforge/rapier3d-compat';
import type { NeonGrid } from './NeonGrid';
import { neonGridRibbon } from './NeonGridGeometry';

export function createNeonGridColliders(world: RAPIER.World, track: NeonGrid): () => void {
  const handles: number[] = [];
  // Road support is native; the shared guardrail system owns kart wall response,
  // as on Circuit Alpha. A second native rectangular-footprint wall impulse
  // conflicts with that radius-based correction on tight corners.
  {
    const geometry = neonGridRibbon(track);
    const vertices = new Float32Array(geometry.getAttribute('position').array);
    const triangles = new Uint32Array(geometry.index?.array ?? []);
    const collider = world.createCollider(
      RAPIER.ColliderDesc.trimesh(
        vertices,
        triangles,
        RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES,
      ).setFriction(1),
    );
    handles.push(collider.handle);
    geometry.dispose();
  }
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    for (const handle of handles) {
      const collider = world.getCollider(handle);
      world.removeCollider(collider, true);
    }
  };
}
