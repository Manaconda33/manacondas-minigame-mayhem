import * as THREE from 'three';
import type { BillboardGap } from './NeonGridBillboard';
import type { ServiceTunnel } from './ServiceTunnel';
import type { NeonGrid } from './NeonGrid';
import type { TrackProjection } from './TrackDefinition';

/** State belongs to one racer. Projection never earns a gate or changes a body. */
export class ShortcutTraversal {
  private active = false;
  public constructor(
    private readonly shortcut: ServiceTunnel | BillboardGap,
    private readonly track: NeonGrid,
  ) {}

  public update(previous: THREE.Vector3, current: THREE.Vector3): TrackProjection | null {
    const mouth = this.shortcut.mouthDistance / this.shortcut.curve.getLength();
    if (!this.active) {
      if (this.crosses(previous, current, mouth, 1)) this.active = true;
    } else if (
      this.crosses(previous, current, 1, 1) ||
      this.crosses(previous, current, mouth, -1)
    ) {
      this.active = false;
    }
    return this.project(current);
  }
  public project(current: THREE.Vector3): TrackProjection | null {
    return this.active ? this.shortcut.project(current, this.track.sampleCount) : null;
  }
  public reset(): void {
    this.active = false;
  }

  private crosses(
    previous: THREE.Vector3,
    current: THREE.Vector3,
    fraction: number,
    direction: 1 | -1,
  ): boolean {
    const point = this.shortcut.curve.getPointAt(fraction);
    const tangent = this.shortcut.curve.getTangentAt(fraction).setY(0).normalize();
    const before = previous.clone().sub(point).dot(tangent);
    const after = current.clone().sub(point).dot(tangent);
    if (direction === 1 ? !(before < 0 && after >= 0) : !(before >= 0 && after < 0)) return false;
    const crossing = previous.clone().lerp(current, before / (before - after));
    if (this.shortcut.id === 'billboard-gap' && fraction !== 1 && direction === 1) {
      const main = this.track.projectMain(crossing);
      const travel = current.clone().sub(previous).setY(0).normalize();
      // The two surfaces overlap at the plaza mouth. Staying on the main
      // sweeper is not a shortcut entry; the crossing must choose the chord.
      if (travel.dot(tangent) <= travel.dot(main.tangent)) return false;
    }
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    return (
      Math.abs(crossing.clone().sub(point).dot(right)) <=
        (fraction === 1
          ? this.track.halfWidthAt(this.shortcut.exitProgress)
          : this.shortcut.roadHalfWidth) &&
      (fraction !== 1 ||
        this.track.projectMain(crossing).lateralDistance <=
          this.track.halfWidthAt(this.shortcut.exitProgress)) &&
      Math.abs(crossing.y - point.y) <= this.track.checkpointHeightTolerance
    );
  }
}
