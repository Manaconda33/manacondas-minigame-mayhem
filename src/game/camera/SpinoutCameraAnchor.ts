import * as THREE from 'three';

export class SpinoutCameraAnchor {
  private heldForward: THREE.Vector3 | null = null;

  public resolve(actualForward: THREE.Vector3, spinoutActive: boolean): THREE.Vector3 {
    if (!spinoutActive) {
      this.heldForward = null;
      return actualForward;
    }

    if (this.heldForward === null) {
      const held = actualForward.clone().setY(0);
      if (held.lengthSq() < 0.0001) held.set(0, 0, 1);
      else held.normalize();
      this.heldForward = held;
    }

    return this.heldForward;
  }

  public clear(): void {
    this.heldForward = null;
  }
}
