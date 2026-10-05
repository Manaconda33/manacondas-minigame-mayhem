import RAPIER from '@dimforge/rapier3d-compat';
import type { NeonGrid } from './NeonGrid';
import { serviceTunnelGeometry } from './ServiceTunnelGeometry';
import { neonGridRibbon } from './NeonGridGeometry';
import { billboardFloorGeometry } from './NeonGridBillboard';

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
        // The ribbon has upward-wound top faces and no solid underside. Mark it
        // oriented so adjacent-edge contact repair uses those outward normals;
        // otherwise triangle contacts can cancel movement without changing speed.
        RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES | RAPIER.TriMeshFlags.ORIENTED,
      ).setFriction(1),
    );
    handles.push(collider.handle);
    geometry.dispose();
  }
  for (const kind of ['floor', 'roof'] as const) {
    const geometry = serviceTunnelGeometry(track.serviceTunnel, kind);
    const collider = world.createCollider(
      RAPIER.ColliderDesc.trimesh(
        new Float32Array(geometry.getAttribute('position').array),
        new Uint32Array(geometry.index?.array ?? []),
        RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES | RAPIER.TriMeshFlags.ORIENTED,
      ).setFriction(1),
    );
    handles.push(collider.handle);
    geometry.dispose();
  }
  for (const geometry of [track.waterfallDive.rampGeometry, track.waterfallDive.landingGeometry]) {
    const collider = world.createCollider(
      RAPIER.ColliderDesc.trimesh(
        new Float32Array(geometry.getAttribute('position').array),
        new Uint32Array(geometry.index?.array ?? []),
        RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES | RAPIER.TriMeshFlags.ORIENTED,
      ).setFriction(1),
    );
    handles.push(collider.handle);
  }
  let disposed = false;
  const plaza = billboardFloorGeometry(track.billboardGap);
  const plazaCollider = world.createCollider(
    RAPIER.ColliderDesc.trimesh(
      new Float32Array(plaza.getAttribute('position').array),
      new Uint32Array(plaza.index?.array ?? []),
      RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES | RAPIER.TriMeshFlags.ORIENTED,
    ).setFriction(1),
  );
  handles.push(plazaCollider.handle);
  plaza.dispose();
  return () => {
    if (disposed) return;
    disposed = true;
    for (const handle of handles) {
      const collider = world.getCollider(handle);
      world.removeCollider(collider, true);
    }
  };
}
