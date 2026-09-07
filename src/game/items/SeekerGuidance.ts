import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { SEEKER_GUIDANCE } from './itemDefinitions';

export function steerSeeker(
  track: CircuitAlpha,
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  targetPosition: THREE.Vector3,
  targetVelocity: THREE.Vector3,
  dt: number,
): void {
  const speed = velocity.length();
  const desiredSpeed = THREE.MathUtils.clamp(
    Math.hypot(targetVelocity.x, targetVelocity.z) + SEEKER_GUIDANCE.closingMargin,
    SEEKER_GUIDANCE.minSpeed,
    SEEKER_GUIDANCE.maxSpeed,
  );
  const nextSpeed =
    speed +
    THREE.MathUtils.clamp(
      desiredSpeed - speed,
      -SEEKER_GUIDANCE.acceleration * dt,
      SEEKER_GUIDANCE.acceleration * dt,
    );
  const projection = track.project(position);
  const targetProjection = track.project(targetPosition);
  const length = track.sampleSpacing * track.sampleCount;
  const forwardGap = ((targetProjection.progress - projection.progress + 1) % 1) * length;
  const lookahead = Math.max(8, nextSpeed * 0.3);
  // A nearby target on the same forward route may be pursued directly. Farther
  // targets use the legal centerline so adjacent sections cannot shortcut rails.
  const direct = forwardGap < lookahead && position.distanceTo(targetPosition) < lookahead + 4;
  const aim = direct
    ? targetPosition
    : track.curve.getPointAt((projection.progress + lookahead / length) % 1);
  const desiredYaw = Math.atan2(aim.x - position.x, aim.z - position.z);
  const yaw = Math.atan2(velocity.x, velocity.z);
  const delta = Math.atan2(Math.sin(desiredYaw - yaw), Math.cos(desiredYaw - yaw));
  const turn = THREE.MathUtils.clamp(
    delta,
    -SEEKER_GUIDANCE.turnRate * dt,
    SEEKER_GUIDANCE.turnRate * dt,
  );
  velocity.set(Math.sin(yaw + turn) * nextSpeed, 0, Math.cos(yaw + turn) * nextSpeed);
}
