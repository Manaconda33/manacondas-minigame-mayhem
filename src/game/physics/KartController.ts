import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {
  driftBoostProfile,
  driftThresholds,
  surfaceAccelerationMultiplier,
  surfaceMinimumPlayableSpeed,
  surfaceSpeedMultiplier,
  type DriverStats,
  type KartTuning,
  type SurfaceType,
} from '../../config/kartTuning';

export interface DriveInput {
  throttle: number;
  steering: number;
  brake: boolean;
  drift: boolean;
  speedLimitMultiplier?: number;
  effectSpeedCapMultiplier?: number;
  effectAccelerationMultiplier?: number;
  ignoreOffRoadSpeedPenalty?: boolean;
  effectSpinoutYawRateRadiansPerSecond?: number;
  effectSpinoutPreserveMomentum?: boolean;
}

export type DriftTier = 'none' | 'blue' | 'orange' | 'purple';

export interface KartFeedback {
  drifting: boolean;
  driftTier: DriftTier;
  chargeRatio: number;
  boostActive: boolean;
  airborne: boolean;
}

export class KartController {
  public readonly body: RAPIER.RigidBody;
  private yaw: number;
  private currentSteer = 0;
  private boostRemaining = 0;
  private boostMultiplier = 1;
  private activeBoostTier: DriftTier = 'none';
  private drifting = false;
  private driftDirection = 0;
  private driftCharge = 0;
  private previousDriftPressed = false;
  private airborneSeconds = 0;
  private wasGrounded = true;
  private rampCooldown = 0;
  private stuntArmed = false;

  public constructor(
    private readonly world: RAPIER.World,
    private readonly tuning: KartTuning,
    private readonly stats: DriverStats,
    spawn: THREE.Vector3,
    yaw: number,
  ) {
    this.yaw = yaw;
    this.body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(spawn.x, 1.1, spawn.z)
        // Forward deceleration and lateral grip are owned by this controller.
        // Passive Rapier damping would make Acceleration determine terminal speed.
        .setLinearDamping(0)
        .setAngularDamping(5)
        .enabledRotations(false, true, false),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.72, 0.34, 1.18)
        .setMass(this.tuning.mass)
        // The kart is a raycast-driven arcade body, not a sliding tire model.
        // Surface grip is applied explicitly below so collider friction must not
        // consume engine acceleration or reduce the Speed-defined road maximum.
        .setFriction(0)
        .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
        .setRestitution(0.05),
      this.body,
    );
    this.setYaw(yaw);
  }

  public update(input: DriveInput, surface: SurfaceType, dt: number): void {
    if (
      this.updateForcedSpin(
        input.effectSpinoutYawRateRadiansPerSecond,
        dt,
        input.effectSpinoutPreserveMomentum,
      )
    )
      return;

    const velocity = this.body.linvel();
    const grounded = this.groundContactCount() >= 2;
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const planar = new THREE.Vector3(velocity.x, 0, velocity.z);
    let forwardSpeed = planar.dot(forward);
    const lateralSpeed = planar.dot(right);
    const speedRatio = Math.min(Math.abs(forwardSpeed) / this.tuning.maxSpeed, 1);
    const steeringScale = THREE.MathUtils.lerp(1, 0.48, speedRatio);
    const steeringTarget =
      input.steering * this.tuning.steeringRate * steeringScale * (this.drifting ? 1.45 : 1);
    this.currentSteer = THREE.MathUtils.damp(this.currentSteer, steeringTarget, 10, dt);

    const driftStarted = input.drift && !this.previousDriftPressed;
    if (
      driftStarted &&
      grounded &&
      Math.abs(forwardSpeed) >= 6.5 &&
      Math.abs(input.steering) >= 0.25
    ) {
      this.drifting = true;
      this.driftDirection = Math.sign(input.steering);
      this.driftCharge = 0;
      this.body.applyImpulse({ x: 0, y: this.tuning.mass * 1.25, z: 0 }, true);
    }

    if (this.drifting) {
      if (!input.drift || Math.abs(forwardSpeed) < 3 || this.airborneSeconds > 0.6) {
        this.releaseDrift();
      } else if (grounded) {
        const steerQuality = THREE.MathUtils.clamp(Math.abs(input.steering), 0.65, 1.35);
        this.driftCharge += dt * steerQuality;
      }
    }
    this.previousDriftPressed = input.drift;

    if (Math.abs(forwardSpeed) > 0.35) {
      const direction = forwardSpeed >= 0 ? 1 : -0.65;
      const driftYaw = this.drifting ? 1.18 + Math.abs(this.driftDirection) * 0.22 : 1;
      this.yaw += this.currentSteer * dt * direction * driftYaw;
    }

    const surfaceSpeedFactor = surfaceSpeedMultiplier(surface, this.stats.traction);
    const surfaceAccelerationFactor = surfaceAccelerationMultiplier(surface, this.stats.traction);
    const ignoresOffRoadSpeedPenalty =
      input.ignoreOffRoadSpeedPenalty === true && (surface === 'dirt' || surface === 'grass');
    const effectiveSurfaceSpeedFactor = ignoresOffRoadSpeedPenalty ? 1 : surfaceSpeedFactor;
    const speedLimitMultiplier = THREE.MathUtils.clamp(input.speedLimitMultiplier ?? 1, 1, 1.04);
    const effectSpeedCapMultiplier = Math.max(1, input.effectSpeedCapMultiplier ?? 1);
    const effectAccelerationMultiplier = Math.max(1, input.effectAccelerationMultiplier ?? 1);
    const maxForward = this.tuning.maxSpeed * effectiveSurfaceSpeedFactor * speedLimitMultiplier;

    if (surface === 'boost' && this.boostRemaining <= 0) {
      this.boostRemaining = 0.8;
      this.boostMultiplier = 1.12;
      this.activeBoostTier = 'blue';
    }
    this.boostRemaining = Math.max(0, this.boostRemaining - dt);
    if (this.boostRemaining === 0) {
      this.boostMultiplier = 1;
      this.activeBoostTier = 'none';
    }
    const boostedMax = maxForward * Math.max(this.boostMultiplier, effectSpeedCapMultiplier);
    const launchSpeedRatio = THREE.MathUtils.clamp(
      Math.abs(forwardSpeed) / this.tuning.maxSpeed,
      0,
      1,
    );
    const launchTaper = THREE.MathUtils.clamp(
      1 - 0.72 * launchSpeedRatio * launchSpeedRatio,
      0.22,
      1,
    );
    const acceleration =
      this.tuning.acceleration *
      launchTaper *
      surfaceAccelerationFactor *
      Math.max(this.boostRemaining > 0 ? 1.35 : 1, effectAccelerationMultiplier);
    const centerGrounded = Math.abs(velocity.y) < 0.35 && this.hasCenterGroundSupport();
    const driveSupported = grounded || centerGrounded;

    if (input.throttle > 0 && driveSupported) {
      if ((surface === 'dirt' || surface === 'grass') && forwardSpeed > boostedMax) {
        const tractionN = (this.stats.traction - 1) / 9;
        const surfaceLoss =
          (surface === 'grass' ? 8 : 5.5) * THREE.MathUtils.lerp(1.08, 0.92, tractionN);
        forwardSpeed = Math.max(boostedMax, forwardSpeed - surfaceLoss * dt);
      } else {
        forwardSpeed = Math.min(boostedMax, forwardSpeed + acceleration * dt);
      }
      const playableFloor = surfaceMinimumPlayableSpeed(surface);
      if (playableFloor > 0 && forwardSpeed > 3) {
        forwardSpeed = Math.max(forwardSpeed, Math.min(playableFloor, boostedMax));
      }
    } else if (input.throttle < 0 && driveSupported) {
      forwardSpeed = Math.max(-this.tuning.reverseSpeed, forwardSpeed - acceleration * 0.72 * dt);
    } else {
      forwardSpeed = THREE.MathUtils.damp(forwardSpeed, 0, 0.65, dt);
    }

    if (input.brake) forwardSpeed = THREE.MathUtils.damp(forwardSpeed, 0, 5.5, dt);

    const retainedLateral = THREE.MathUtils.damp(
      lateralSpeed,
      0,
      this.tuning.lateralGrip *
        (surface === 'grass' ? 0.55 : surface === 'dirt' ? 0.72 : 1) *
        (this.drifting ? 0.48 : 1),
      dt,
    );
    const nextForward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const nextRight = new THREE.Vector3(nextForward.z, 0, -nextForward.x);
    const nextVelocity = nextForward
      .multiplyScalar(forwardSpeed)
      .add(nextRight.multiplyScalar(retainedLateral));

    this.body.setLinvel({ x: nextVelocity.x, y: velocity.y, z: nextVelocity.z }, true);
    this.setYaw(this.yaw);

    this.rampCooldown = Math.max(0, this.rampCooldown - dt);
    if (surface === 'ramp' && grounded && this.rampCooldown === 0 && Math.abs(forwardSpeed) > 8) {
      this.body.applyImpulse({ x: 0, y: this.tuning.mass * 4.8, z: 0 }, true);
      this.rampCooldown = 1.25;
      this.stuntArmed = true;
    }
    this.airborneSeconds = grounded ? 0 : this.airborneSeconds + dt;
    if (grounded && !this.wasGrounded && this.stuntArmed) {
      this.activateBoost('blue', 0.6, 1.08);
      this.stuntArmed = false;
    }
    this.wasGrounded = grounded;
  }

  public retainPlanarVelocity(factor: number): void {
    if (!Number.isFinite(factor) || factor < 0 || factor > 1) return;
    const velocity = this.body.linvel();
    this.body.setLinvel({ x: velocity.x * factor, y: velocity.y, z: velocity.z * factor }, true);
  }

  private updateForcedSpin(
    yawRateRadiansPerSecond: number | undefined,
    dt: number,
    preserveMomentum = false,
  ): boolean {
    if (
      yawRateRadiansPerSecond === undefined ||
      !Number.isFinite(yawRateRadiansPerSecond) ||
      Math.abs(yawRateRadiansPerSecond) < 0.001 ||
      dt <= 0
    ) {
      return false;
    }

    this.currentSteer = 0;
    this.drifting = false;
    this.driftDirection = 0;
    this.driftCharge = 0;
    this.previousDriftPressed = false;
    this.yaw += yawRateRadiansPerSecond * dt;

    const velocity = this.body.linvel();
    const planarRetention = preserveMomentum ? 1 : Math.exp(-0.55 * dt);
    this.body.setLinvel(
      {
        x: velocity.x * planarRetention,
        y: velocity.y,
        z: velocity.z * planarRetention,
      },
      true,
    );
    this.setYaw(this.yaw);

    this.boostRemaining = Math.max(0, this.boostRemaining - dt);
    if (this.boostRemaining === 0) {
      this.boostMultiplier = 1;
      this.activeBoostTier = 'none';
    }
    this.rampCooldown = Math.max(0, this.rampCooldown - dt);
    return true;
  }

  public respawn(position: THREE.Vector3, yaw: number): void {
    this.yaw = yaw;
    this.currentSteer = 0;
    this.boostRemaining = 0;
    this.boostMultiplier = 1;
    this.activeBoostTier = 'none';
    this.drifting = false;
    this.driftCharge = 0;
    this.airborneSeconds = 0;
    this.stuntArmed = false;
    this.body.setTranslation({ x: position.x, y: 1.2, z: position.z }, true);
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    this.setYaw(yaw);
  }

  public position(target = new THREE.Vector3()): THREE.Vector3 {
    const translation = this.body.translation();
    return target.set(translation.x, translation.y, translation.z);
  }

  public speedMetersPerSecond(): number {
    const velocity = this.body.linvel();
    return Math.hypot(velocity.x, velocity.z);
  }

  public velocity(target = new THREE.Vector3()): THREE.Vector3 {
    const velocity = this.body.linvel();
    return target.set(velocity.x, velocity.y, velocity.z);
  }

  public mass(): number {
    return this.tuning.mass;
  }

  public weight(): number {
    return this.stats.weight;
  }

  public applyArcadeCollisionImpulse(direction: THREE.Vector3, strength: number): void {
    this.body.applyImpulse(
      {
        x: direction.x * strength,
        y: 0,
        z: direction.z * strength,
      },
      true,
    );
  }

  /** Adds an exact planar velocity delta without moving or rotating the kart. */
  public addPlanarVelocityDelta(delta: THREE.Vector3): boolean {
    if (![delta.x, delta.z].every(Number.isFinite)) return false;
    const velocity = this.body.linvel();
    this.body.setLinvel({ x: velocity.x + delta.x, y: velocity.y, z: velocity.z + delta.z }, true);
    return true;
  }

  public resolveStaticBarrierCollision(
    inwardNormal: THREE.Vector3,
    penetration: number,
    tangentialRetention: number,
    restitution: number,
  ): void {
    const normal = inwardNormal.clone().setY(0);
    if (normal.lengthSq() < 0.0001) return;
    normal.normalize();

    if (Number.isFinite(penetration) && penetration > 0) {
      const position = this.body.translation();
      this.body.setTranslation(
        {
          x: position.x + normal.x * penetration,
          y: position.y,
          z: position.z + normal.z * penetration,
        },
        true,
      );
    }

    const velocity = this.body.linvel();
    const planar = new THREE.Vector3(velocity.x, 0, velocity.z);
    const normalSpeed = planar.dot(normal);
    const tangentVelocity = planar.addScaledVector(normal, -normalSpeed);
    const retainedTangent = tangentVelocity.multiplyScalar(
      THREE.MathUtils.clamp(tangentialRetention, 0, 1),
    );
    const reflectedNormalSpeed =
      normalSpeed < 0 ? -normalSpeed * THREE.MathUtils.clamp(restitution, 0, 1) : normalSpeed;
    retainedTangent.addScaledVector(normal, reflectedNormalSpeed);
    this.body.setLinvel({ x: retainedTangent.x, y: velocity.y, z: retainedTangent.z }, true);
  }

  public applyCollisionSpeedRetention(retention: number): void {
    const velocity = this.body.linvel();
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const planar = new THREE.Vector3(velocity.x, 0, velocity.z);
    const forwardSpeed = planar.dot(forward);
    if (forwardSpeed <= 0) return;

    const lateralSpeed = planar.dot(right);
    const retainedForwardSpeed = forwardSpeed * THREE.MathUtils.clamp(retention, 0, 1);
    const retainedVelocity = forward
      .multiplyScalar(retainedForwardSpeed)
      .addScaledVector(right, lateralSpeed);
    this.body.setLinvel({ x: retainedVelocity.x, y: velocity.y, z: retainedVelocity.z }, true);
  }

  public forward(target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  public isFinite(): boolean {
    const p = this.body.translation();
    const v = this.body.linvel();
    return [p.x, p.y, p.z, v.x, v.y, v.z, this.yaw].every(Number.isFinite);
  }

  public feedback(): KartFeedback {
    const thresholds = this.driftThresholds();
    return {
      drifting: this.drifting,
      driftTier: this.drifting ? this.tierForCharge(this.driftCharge) : this.activeBoostTier,
      chargeRatio: THREE.MathUtils.clamp(this.driftCharge / thresholds.purple, 0, 1),
      boostActive: this.boostRemaining > 0,
      airborne: this.airborneSeconds > 0.08,
    };
  }

  private setYaw(yaw: number): void {
    const half = yaw / 2;
    this.body.setRotation({ x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) }, true);
  }

  private driftThresholds(): { blue: number; orange: number; purple: number } {
    return driftThresholds(this.stats.miniTurbo);
  }

  private tierForCharge(charge: number): DriftTier {
    const thresholds = this.driftThresholds();
    if (charge >= thresholds.purple) return 'purple';
    if (charge >= thresholds.orange) return 'orange';
    if (charge >= thresholds.blue) return 'blue';
    return 'none';
  }

  private releaseDrift(): void {
    const tier = this.tierForCharge(this.driftCharge);
    if (tier !== 'none') {
      const profile = driftBoostProfile(tier, this.stats.miniTurbo);
      this.activateBoost(tier, profile.duration, profile.speedMultiplier);
    }
    this.drifting = false;
    this.driftDirection = 0;
    this.driftCharge = 0;
  }

  private activateBoost(tier: DriftTier, duration: number, multiplier: number): void {
    this.activeBoostTier = tier;
    this.boostRemaining = Math.max(this.boostRemaining, duration);
    this.boostMultiplier = Math.max(this.boostMultiplier, multiplier);
  }

  private groundContactCount(): number {
    const position = this.body.translation();
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const offsets = [
      [-0.55, 0.72],
      [0.55, 0.72],
      [-0.55, -0.72],
      [0.55, -0.72],
    ] as const;

    return offsets.reduce((contacts, [localX, localZ]) => {
      const worldX = position.x + localX * cos + localZ * sin;
      const worldZ = position.z - localX * sin + localZ * cos;
      const ray = new RAPIER.Ray({ x: worldX, y: position.y, z: worldZ }, { x: 0, y: -1, z: 0 });
      const hit = this.world.castRay(ray, 1.35, true, undefined, undefined, undefined, this.body);
      return contacts + (hit === null ? 0 : 1);
    }, 0);
  }

  private hasCenterGroundSupport(): boolean {
    const position = this.body.translation();
    const ray = new RAPIER.Ray(position, { x: 0, y: -1, z: 0 });
    return this.world.castRay(ray, 0.85, true, undefined, undefined, undefined, this.body) !== null;
  }
}
