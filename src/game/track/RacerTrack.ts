import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import { ShortcutTraversal } from './ShortcutTraversal';
import type { TrackDefinition, TrackProjection, TrackNavigation } from './TrackDefinition';

/** A racer-local view; the shared track remains immutable and reusable. */
export class RacerTrack implements TrackDefinition {
  private readonly traversal: ShortcutTraversal;
  private committed = false;
  private considered = false;
  private randomState: number;
  public constructor(
    private readonly track: NeonGrid,
    seed = 1,
    private readonly attemptRate = 0.35,
  ) {
    this.traversal = new ShortcutTraversal(track.serviceTunnel, track);
    this.randomState = seed >>> 0;
  }
  public get id() {
    return this.track.id;
  }
  public get roadHalfWidth() {
    return this.track.roadHalfWidth;
  }
  public get sampleCount() {
    return this.track.sampleCount;
  }
  public get startFinishDistance() {
    return this.track.startFinishDistance;
  }
  public get curve() {
    return this.track.curve;
  }
  public get samples() {
    return this.track.samples;
  }
  public get tangents() {
    return this.track.tangents;
  }
  public get sampleSpacing() {
    return this.track.sampleSpacing;
  }
  public get checkpointIndices() {
    return this.track.checkpointIndices;
  }
  public get checkpointHeightTolerance() {
    return this.track.checkpointHeightTolerance;
  }
  public halfWidthAt(p: number) {
    return this.track.halfWidthAt(p);
  }
  public boundaryHalfWidthAt(p: TrackProjection) {
    return this.track.boundaryHalfWidthAt(p);
  }
  public checkpointPosition(i: number) {
    return this.track.checkpointPosition(i);
  }
  public checkpointTangent(i: number) {
    return this.track.checkpointTangent(i);
  }
  public lapCheckpointPosition(i: number) {
    return this.track.lapCheckpointPosition(i);
  }
  public lapCheckpointProgress(i: number) {
    return this.track.lapCheckpointProgress(i);
  }
  public lapCheckpointTangent(i: number) {
    return this.track.lapCheckpointTangent(i);
  }
  public advance(previous: THREE.Vector3, current: THREE.Vector3): void {
    const wasActive = this.traversal.project(previous) !== null;
    const active = this.traversal.update(previous, current);
    if (wasActive && active === null) this.committed = false;
  }
  public project(position: THREE.Vector3): TrackProjection {
    return this.traversal.project(position) ?? this.track.projectMain(position);
  }
  public reset(): void {
    this.traversal.reset();
    this.committed = false;
    this.considered = false;
  }
  public prepareAiRoute(
    position: THREE.Vector3,
    forward: THREE.Vector3,
    speed: number,
    allowChoice = true,
  ): void {
    const tunnel = this.track.serviceTunnel;
    const projection = this.project(position);
    if (projection.pathId) return;
    if (this.committed && projection.progress > tunnel.entry.progress[1]) this.committed = false;
    if (
      projection.progress > tunnel.exitProgress + 0.03 ||
      projection.progress < tunnel.entry.progress[0] - 0.08
    ) {
      this.considered = false;
      this.committed = false;
    }
    const remaining = (tunnel.entry.progress[0] - projection.progress) * this.curve.getLength();
    if (this.considered || remaining < 5 || remaining > 35 || !allowChoice) return;
    this.considered = true;
    this.randomState = (Math.imul(this.randomState, 1664525) + 1013904223) >>> 0;
    this.committed =
      speed >= 5 &&
      speed <= 32 &&
      projection.lateralDistance < 2.2 &&
      forward.dot(projection.tangent) > 0.7 &&
      this.randomState / 4294967296 < THREE.MathUtils.clamp(this.attemptRate, 0, 1);
  }
  public navigationAt(position: THREE.Vector3, distance: number): TrackNavigation {
    const projection = this.project(position);
    const tunnel = this.track.serviceTunnel;
    if (projection.pathId || this.committed) {
      let d = projection.pathId
        ? tunnel.fraction(projection) * tunnel.curve.getLength() + distance
        : Math.max(tunnel.mouthDistance + 1, distance);
      if (d <= tunnel.curve.getLength()) {
        d = Math.max(0, d);
        return {
          point: tunnel.curve.getPointAt(d / tunnel.curve.getLength()),
          tangent: tunnel.curve.getTangentAt(d / tunnel.curve.getLength()).normalize(),
          halfWidth: tunnel.roadHalfWidth,
          pathId: tunnel.id,
        };
      }
      const p = tunnel.exitProgress + (d - tunnel.curve.getLength()) / this.curve.getLength();
      return {
        point: this.curve.getPointAt(p),
        tangent: this.curve.getTangentAt(p).normalize(),
        halfWidth: this.halfWidthAt(p),
        pathId: tunnel.id,
      };
    }
    const index =
      (projection.index + Math.max(1, Math.round(distance / this.sampleSpacing))) %
      this.sampleCount;
    return {
      point: this.samples[index]?.clone() ?? projection.point.clone(),
      tangent: this.tangents[index]?.clone() ?? projection.tangent.clone(),
      halfWidth: this.halfWidthAt(index / this.sampleCount),
    };
  }
}
