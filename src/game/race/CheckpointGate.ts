import * as THREE from 'three';

/** Matches the previous checkpoint trigger's generous legal-corridor reach. */
export const CHECKPOINT_GATE_HALF_WIDTH_METERS = 13;

/**
 * Detect a forward crossing over one simulation step rather than sampling one
 * stale point before physics moves the kart. The caller selects the next
 * required checkpoint, so a valid gate can be counted once without relying on
 * overlap bookkeeping.
 */
export function crossesForwardCheckpointGate(
  previousPosition: THREE.Vector3,
  currentPosition: THREE.Vector3,
  gatePosition: THREE.Vector3,
  gateTangent: THREE.Vector3,
  halfWidthMeters = CHECKPOINT_GATE_HALF_WIDTH_METERS,
): boolean {
  const tangent = gateTangent.clone().setY(0);
  if (tangent.lengthSq() < Number.EPSILON) return false;
  tangent.normalize();

  const before = previousPosition.clone().sub(gatePosition).setY(0);
  const after = currentPosition.clone().sub(gatePosition).setY(0);
  const beforeAlong = before.dot(tangent);
  const afterAlong = after.dot(tangent);

  // Crossing in the forward track direction is the direction validation.
  if (beforeAlong > 0 || afterAlong <= 0) return false;

  const advance = afterAlong - beforeAlong;
  if (advance <= Number.EPSILON) return false;
  const crossingFraction = THREE.MathUtils.clamp(-beforeAlong / advance, 0, 1);
  const crossing = before.lerp(after, crossingFraction);
  const lateral = crossing.addScaledVector(tangent, -crossing.dot(tangent));
  return lateral.lengthSq() <= halfWidthMeters * halfWidthMeters;
}
