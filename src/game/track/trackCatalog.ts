import RAPIER from '@dimforge/rapier3d-compat';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import type * as THREE from 'three';
import { CircuitAlpha } from './CircuitAlpha';
import { NeonGrid } from './NeonGrid';
import { createTrackScene } from './createTrackScene';
import { createNeonGridScene } from './createNeonGridScene';
import { createNeonGridColliders } from './NeonGridCollision';
import {
  neonGridVisualVariantFromSearch,
  type NeonGridVisualVariant,
} from './NeonGridVisualVariant';
import {
  serviceTunnelMaterialVariantFromSearch,
  type ServiceTunnelMaterialVariant,
} from './ServiceTunnelConcreteMaterial';
import type { TrackDefinition, TrackId } from './TrackDefinition';

export { neonGridVisualVariantFromSearch } from './NeonGridVisualVariant';
export { resolveNeonGridOwnerLayoutSourceMap } from './NeonGridOwnerLayoutSourceMap';
export { applyNeonGridOwnerLayout } from './NeonGridOwnerLayout';

export type NeonGridOwnerLayoutScreen = 'retained' | 'removed';

export interface NeonGridReviewSceneSelection {
  ownerLayoutScreen: NeonGridOwnerLayoutScreen | null;
  visualVariant: NeonGridVisualVariant;
  materialVariant: ServiceTunnelMaterialVariant;
}

export function neonGridReviewSceneSelectionFromSearch(search: string): NeonGridReviewSceneSelection {
  const params = new URLSearchParams(search);
  const layoutSelection = params.get('neonGridLayout');
  const useOwnerLayout = layoutSelection === 'owner-2026-10-19' ||
    (layoutSelection === null && !params.has('neonGridVisual') && !params.has('neonGridMaterial'));
  if (useOwnerLayout) {
    return {
      ownerLayoutScreen: params.get('neonGridGapScreen') === 'removed' ? 'removed' : 'retained',
      visualVariant: 'fog-experiment-c2-background',
      materialVariant: 'concrete-coverage-c2-001',
    };
  }
  return {
    ownerLayoutScreen: null,
    visualVariant: neonGridVisualVariantFromSearch(search),
    materialVariant: serviceTunnelMaterialVariantFromSearch(search),
  };
}

export function createTrack(id: TrackId): TrackDefinition {
  return id === 'neon-grid' ? new NeonGrid() : new CircuitAlpha();
}

export function createSelectedTrackScene(
  track: TrackDefinition,
  quality: GraphicsQuality = 'medium',
  variant: NeonGridVisualVariant = 'approved',
  materialVariant: ServiceTunnelMaterialVariant = 'blockout',
): THREE.Group {
  return track instanceof NeonGrid
    ? createNeonGridScene(track, quality, variant, materialVariant)
    : createTrackScene(track);
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
