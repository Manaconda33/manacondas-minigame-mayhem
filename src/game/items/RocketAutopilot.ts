import * as THREE from 'three';
import type { DriveInput } from '../physics/KartController';
import type { CircuitAlpha, TrackProjection } from '../track/CircuitAlpha';

export const ROCKET_AUTOPILOT_TUNING = {
  lookaheadMeters: 13,
  lateralCorrection: 0.38,
  maxLaneOffset: 2.8,
  steeringGain: 2.6,
  hardCornerAlignment: 0.35,
  hardCornerSpeed: 31,
} as const;

export interface RocketRouteTarget {
  readonly projection: TrackProjection;
  readonly targetPosition: THREE.Vector3;
  readonly targetTangent: THREE.Vector3;
  readonly laneOffset: number;
}

/**
 * Produces legal controller input from Circuit Alpha geometry. This class never
 * owns a kart body, transform, checkpoint, rank, or race-progress state.
 */
export class RocketAutopilot {
  public constructor(private readonly track: CircuitAlpha) {}

  public routeTarget(position: THREE.Vector3): RocketRouteTarget {
    const projection = this.track.project(position);
    const lookaheadSamples = Math.max(
      2,
      Math.round(ROCKET_AUTOPILOT_TUNING.lookaheadMeters / this.track.sampleSpacing),
    );
    const targetIndex = (projection.index + lookaheadSamples) % this.track.sampleCount;
    const targetPosition = this.track.samples[targetIndex]?.clone() ?? projection.point.clone();
    const targetTangent =
      this.track.tangents[targetIndex]?.clone() ?? projection.tangent.clone().normalize();
    const right = new THREE.Vector3(targetTangent.z, 0, -targetTangent.x).normalize();
    const laneOffset = THREE.MathUtils.clamp(
      projection.lateralOffset * ROCKET_AUTOPILOT_TUNING.lateralCorrection,
      -ROCKET_AUTOPILOT_TUNING.maxLaneOffset,
      ROCKET_AUTOPILOT_TUNING.maxLaneOffset,
    );
    targetPosition.addScaledVector(right, laneOffset);

    return { projection, targetPosition, targetTangent, laneOffset };
  }

  public input(
    position: THREE.Vector3,
    forward: THREE.Vector3,
    speed: number,
    normalInput: DriveInput,
    autopilotWeight: number,
  ): DriveInput {
    const weight = THREE.MathUtils.clamp(autopilotWeight, 0, 1);
    if (weight <= 1e-9) return { ...normalInput };

    const route = this.routeTarget(position);
    const heading = forward.clone().setY(0);
    const desired = route.targetPosition.clone().sub(position).setY(0);
    if (heading.lengthSq() < 1e-9 || desired.lengthSq() < 1e-9) {
      const fullControl = weight >= 1 - 1e-9;
      return {
        ...normalInput,
        throttle: THREE.MathUtils.lerp(normalInput.throttle, 1, weight),
        steering: THREE.MathUtils.lerp(normalInput.steering, 0, weight),
        brake: fullControl ? false : weight > 0.5 ? false : normalInput.brake,
        drift: fullControl || weight > 0.5 ? false : normalInput.drift,
      };
    }
    heading.normalize();
    desired.normalize();

    const cross = heading.z * desired.x - heading.x * desired.z;
    const autopilotSteering = THREE.MathUtils.clamp(
      cross * ROCKET_AUTOPILOT_TUNING.steeringGain,
      -1,
      1,
    );
    const alignment = heading.dot(route.targetTangent);
    const autopilotBrake =
      Number.isFinite(speed) &&
      speed > ROCKET_AUTOPILOT_TUNING.hardCornerSpeed &&
      alignment < ROCKET_AUTOPILOT_TUNING.hardCornerAlignment;
    const fullControl = weight >= 1 - 1e-9;

    return {
      ...normalInput,
      throttle: THREE.MathUtils.lerp(normalInput.throttle, autopilotBrake ? 0 : 1, weight),
      steering: THREE.MathUtils.lerp(normalInput.steering, autopilotSteering, weight),
      brake: fullControl ? autopilotBrake : weight > 0.5 ? autopilotBrake : normalInput.brake,
      drift: fullControl || weight > 0.5 ? false : normalInput.drift,
    };
  }
}
