import type * as THREE from 'three';
import type { TrackDefinition, TrackProjection } from './TrackDefinition';

/** Surface sampling is stateless; it cannot select a racer path or earn a gate. */
export function projectTrackSurface(
  track: TrackDefinition,
  position: THREE.Vector3,
): TrackProjection {
  return track.projectSurface?.(position) ?? track.project(position);
}

/** Preserve legacy planar contacts; the covered tunnel and street are separate layers. */
export function sameTrackLayer(
  track: TrackDefinition,
  a: THREE.Vector3,
  b: THREE.Vector3,
): boolean {
  if (track.id !== 'neon-grid' || Math.abs(a.y - b.y) <= 1.5) return true;
  return (
    projectTrackSurface(track, a).pathId !== 'service-tunnel' &&
    projectTrackSurface(track, b).pathId !== 'service-tunnel'
  );
}
