import * as THREE from 'three';

const INTRO_DURATION_SECONDS = 2.85;
const CHASE_DISTANCE = 5.6;
const CHASE_HEIGHT = 3.15;
const MOBILE_CHASE_DISTANCE = 5.2;
const MOBILE_CHASE_HEIGHT = 2.65;
const MOBILE_FORWARD_LOOK_DISTANCE = 4.5;
const MOBILE_FORWARD_LOOK_HEIGHT = 0.65;
const REAR_DISTANCE = 5.3;
const REAR_HEIGHT = 3.05;
const INTRO_DISTANCE = 2.2;
const INTRO_HEIGHT = 16;

function smoothstep(value: number): number {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export class ChaseCamera {
  private readonly desired = new THREE.Vector3();
  private readonly lookAt = new THREE.Vector3();
  private readonly introStart = new THREE.Vector3();
  private introElapsed = 0;

  public constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly mobileForward = false,
  ) {}

  public update(
    kartPosition: THREE.Vector3,
    kartForward: THREE.Vector3,
    rearView: boolean,
    dt: number,
  ): void {
    this.introElapsed = Math.min(INTRO_DURATION_SECONDS, this.introElapsed + Math.max(0, dt));
    const introProgress = this.introElapsed / INTRO_DURATION_SECONDS;

    if (introProgress < 1) {
      const behind = kartForward.clone().multiplyScalar(-1);
      this.introStart
        .copy(kartPosition)
        .addScaledVector(behind, INTRO_DISTANCE)
        .add(new THREE.Vector3(0, INTRO_HEIGHT, 0));
      this.desired
        .copy(kartPosition)
        .addScaledVector(behind, this.mobileForward ? MOBILE_CHASE_DISTANCE : CHASE_DISTANCE)
        .add(new THREE.Vector3(0, this.mobileForward ? MOBILE_CHASE_HEIGHT : CHASE_HEIGHT, 0));
      const eased = smoothstep(introProgress);
      this.camera.position.copy(this.introStart).lerp(this.desired, eased);
      this.lookAt
        .copy(kartPosition)
        .addScaledVector(
          kartForward,
          THREE.MathUtils.lerp(2.2, this.mobileForward ? MOBILE_FORWARD_LOOK_DISTANCE : 5.4, eased),
        )
        .setY(
          THREE.MathUtils.lerp(0.9, this.mobileForward ? MOBILE_FORWARD_LOOK_HEIGHT : 1.15, eased),
        );
      this.camera.lookAt(this.lookAt);
      return;
    }

    const direction = kartForward.clone().multiplyScalar(rearView ? 1 : -1);
    this.desired
      .copy(kartPosition)
      .addScaledVector(
        direction,
        rearView ? REAR_DISTANCE : this.mobileForward ? MOBILE_CHASE_DISTANCE : CHASE_DISTANCE,
      )
      .add(
        new THREE.Vector3(
          0,
          rearView ? REAR_HEIGHT : this.mobileForward ? MOBILE_CHASE_HEIGHT : CHASE_HEIGHT,
          0,
        ),
      );
    this.camera.position.lerp(this.desired, 1 - Math.exp(-7 * dt));
    this.lookAt
      .copy(kartPosition)
      .addScaledVector(
        kartForward,
        rearView ? -5.25 : this.mobileForward ? MOBILE_FORWARD_LOOK_DISTANCE : 5.4,
      )
      .setY(rearView ? 1.15 : this.mobileForward ? MOBILE_FORWARD_LOOK_HEIGHT : 1.15);
    this.camera.lookAt(this.lookAt);
  }
}
