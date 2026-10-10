import * as THREE from 'three';
import type { BillboardGap } from './NeonGridBillboard';
import type { ServiceTunnel } from './ServiceTunnel';
import type { NeonGrid } from './NeonGrid';
import type { TrackProjection } from './TrackDefinition';

/** State belongs to one racer. Projection never earns a gate or changes a body. */
export class ShortcutTraversal {
  private activeDirection: 1 | -1 | null = null;
  public constructor(
    private readonly shortcut: ServiceTunnel | BillboardGap,
    private readonly track: NeonGrid,
  ) {}

  public update(previous: THREE.Vector3, current: THREE.Vector3): TrackProjection | null {
    const mouth = this.shortcut.mouthDistance / this.shortcut.curve.getLength();
    const reverseMouth = 1 - mouth;
    if (this.activeDirection === null) {
      if (this.crosses(previous, current, mouth, 1, true)) this.activeDirection = 1;
      else if (this.crosses(previous, current, reverseMouth, -1, true))
        this.activeDirection = -1;
    } else if (this.activeDirection === 1) {
      if (this.crosses(previous, current, 1, 1) || this.crosses(previous, current, mouth, -1))
        this.activeDirection = null;
    } else if (
      this.crosses(previous, current, mouth, -1) ||
      this.crosses(previous, current, reverseMouth, 1)
    ) {
      this.activeDirection = null;
    }
    return this.project(current);
  }

  public project(current: THREE.Vector3): TrackProjection | null {
    return this.activeDirection === null
      ? null
      : this.shortcut.project(current, this.track.sampleCount);
  }

  public reset(): void {
    this.activeDirection = null;
  }

  private crosses(
    previous: THREE.Vector3,
    current: THREE.Vector3,
    fraction: number,
    direction: 1 | -1,
    requireShortcutChoice = false,
  ): boolean {
    const point = this.shortcut.curve.getPointAt(fraction);
    const tangent = this.shortcut.curve.getTangentAt(fraction).setY(0).normalize();
    const before = previous.clone().sub(point).dot(tangent);
    const after = current.clone().sub(point).dot(tangent);
    if (direction === 1 ? !(before < 0 && after >= 0) : !(before >= 0 && after < 0)) return false;
    const crossing = previous.clone().lerp(current, before / (before - after));

    if (requireShortcutChoice && this.shortcut.id === 'billboard-gap') {
      const main = this.track.projectMain(crossing);
      const travel = current.clone().sub(previous).setY(0).normalize();
      // Both ends overlap the main surface. Route ownership follows the branch
      // the racer physically chooses, in either direction, rather than treating
      // wrong-way access as a collision/anti-cheat barrier.
      if (
        direction === 1
          ? travel.dot(tangent) <= travel.dot(main.tangent)
          : travel.dot(tangent) >= travel.dot(main.tangent)
      )
        return false;
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
