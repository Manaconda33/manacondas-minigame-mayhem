import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { HazardSnapshot } from '../items/HazardSystem';
import { BLAST_ORB_CONFIG } from '../items/itemDefinitions';

export const AI_HAZARD_RESPONSE = {
  lookaheadMeters: 20,
  slickRadius: 2.5,
  blastRadius: 4.5,
  predictionSeconds: 0.5,
  clearHoldSeconds: 0.6,
} as const;

export interface AiHazardSnapshot extends HazardSnapshot {
  readonly kind: 'slick' | 'blast';
}
interface RouteSample {
  readonly distance: number;
  readonly lateralOffset: number;
  readonly forwardSpeed: number;
}
export interface AiHazardAwareness {
  readonly id: number;
  readonly ownerId: string;
  readonly ownerImmuneSeconds: number;
  readonly radius: number;
  readonly samples: readonly RouteSample[];
}
export interface RelevantHazard {
  readonly radius: number;
  readonly lateralOffset: number;
}

/** Continuous local refinement for planning only; checkpoint authority is untouched. */
export function hazardRoutePosition(track: CircuitAlpha, position: THREE.Vector3) {
  const projection = track.project(position);
  const length = track.curve.getLength();
  const along = position.clone().sub(projection.point).dot(projection.tangent);
  return {
    distance: (((projection.progress * length + along) % length) + length) % length,
    lateralOffset: projection.lateralOffset,
    tangent: projection.tangent,
  };
}

/** Copy and project once per simulation step, shared by all AI drivers. */
export function observeAiHazards(
  track: CircuitAlpha,
  snapshots: readonly AiHazardSnapshot[],
): AiHazardAwareness[] {
  return snapshots
    .filter((h) => h.remainingSeconds > 0)
    .map((hazard) => {
      const sample = (position: THREE.Vector3, velocity: THREE.Vector3): RouteSample => {
        const route = hazardRoutePosition(track, position);
        return {
          distance: route.distance,
          lateralOffset: route.lateralOffset,
          forwardSpeed: velocity.dot(route.tangent),
        };
      };
      const velocity = hazard.velocity.clone().setY(0);
      const samples = [sample(hazard.position, velocity)];
      if (hazard.kind === 'blast') {
        const speed = velocity.length();
        const horizon = Math.min(AI_HAZARD_RESPONSE.predictionSeconds, hazard.remainingSeconds);
        const movingTime = Math.min(horizon, speed / BLAST_ORB_CONFIG.drag);
        const predicted = hazard.position.clone();
        if (speed > 0)
          predicted.addScaledVector(
            velocity,
            (speed * movingTime - 0.5 * BLAST_ORB_CONFIG.drag * movingTime ** 2) / speed,
          );
        const predictedVelocity = velocity
          .clone()
          .multiplyScalar(
            speed > 0 ? Math.max(0, speed - BLAST_ORB_CONFIG.drag * horizon) / speed : 0,
          );
        samples.push(sample(predicted, predictedVelocity));
      }
      return {
        id: hazard.id,
        ownerId: hazard.ownerId,
        ownerImmuneSeconds: hazard.ownerImmuneSeconds,
        radius:
          hazard.kind === 'slick' ? AI_HAZARD_RESPONSE.slickRadius : AI_HAZARD_RESPONSE.blastRadius,
        samples,
      };
    });
}

export function relevantAiHazards(
  hazards: readonly AiHazardAwareness[],
  distance: number,
  trackLength: number,
  speed: number,
  racerId: string,
): RelevantHazard[] {
  const result: RelevantHazard[] = [];
  for (const hazard of hazards) {
    const ahead = hazard.samples
      .map((sample) => ({
        sample,
        gap: (((sample.distance - distance) % trackLength) + trackLength) % trackLength,
      }))
      .filter(({ gap }) => gap <= AI_HAZARD_RESPONSE.lookaheadMeters);
    if (ahead.length === 0) continue;
    // Ignore owned hazards only if every estimated closest approach is strictly
    // inside immunity. A stationary/receding racer gets no optimistic exemption.
    if (
      hazard.ownerId === racerId &&
      ahead.every(({ sample, gap }) => {
        const closingSpeed = speed - sample.forwardSpeed;
        return closingSpeed > 0 && gap / closingSpeed < hazard.ownerImmuneSeconds;
      })
    )
      continue;
    for (const { sample } of ahead)
      result.push({ radius: hazard.radius, lateralOffset: sample.lateralOffset });
  }
  return result;
}

/** Signed clearance from each planning footprint, not the physical trigger radius. */
export function hazardLaneClearance(candidate: number, hazards: readonly RelevantHazard[]): number {
  return Math.min(
    ...hazards.map((hazard) => Math.abs(candidate - hazard.lateralOffset) - hazard.radius),
  );
}
