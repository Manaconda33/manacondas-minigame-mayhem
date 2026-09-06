import * as THREE from 'three';

export class SpinoutCameraAnchor {
  private heldForward: THREE.Vector3 | null = null;

  public capture(forward: THREE.Vector3, velocity?: THREE.Vector3): void {
    if (this.heldForward !== null) return;
    const held = velocity?.clone().setY(0) ?? forward.clone().setY(0);
    if (held.lengthSq() < 0.0001) held.copy(forward).setY(0);
    if (held.lengthSq() < 0.0001) held.set(0, 0, 1);
    else held.normalize();
    this.heldForward = held;
  }

  public resolve(actualForward: THREE.Vector3, spinoutActive: boolean): THREE.Vector3 {
    if (!spinoutActive) {
      this.heldForward = null;
      return actualForward;
    }

    if (this.heldForward === null) this.capture(actualForward);
    return this.heldForward ?? actualForward;
  }

  public clear(): void {
    this.heldForward = null;
  }
}
