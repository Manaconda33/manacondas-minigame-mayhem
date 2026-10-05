import RAPIER from '@dimforge/rapier3d-compat';
import type * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { CircuitAlpha } from './CircuitAlpha';
import { NeonGrid } from './NeonGrid';
import { createTrackScene } from './createTrackScene';
import { createNeonGridScene } from './createNeonGridScene';
import { createNeonGridColliders } from './NeonGridCollision';
import type { TrackDefinition, TrackId } from './TrackDefinition';

export function createTrack(id: TrackId): TrackDefinition {
  return id === 'neon-grid' ? new NeonGrid() : new CircuitAlpha();
}

export function createSelectedTrackScene(
  track: TrackDefinition,
  quality: GraphicsQuality = 'medium',
): THREE.Group {
  return track instanceof NeonGrid ? createNeonGridScene(track, quality) : createTrackScene(track);
}

export function createSelectedTrackColliders(
  world: RAPIER.World,
  track: TrackDefinition,
): () => void {
  if (track instanceof NeonGrid) return createNeonGridColliders(world, track);
  const collider = world.createCollider(
    RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0).setFriction(1),
  );
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    const owned = world.getCollider(collider.handle);
    world.removeCollider(owned, true);
  };
}
