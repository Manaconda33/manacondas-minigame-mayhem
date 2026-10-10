import { DiveState } from './NeonGridDive';
import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import { ShortcutTraversal } from './ShortcutTraversal';
import { billboardStateAt } from './NeonGridBillboard';
import { surfaceSpeedMultiplier } from '../../config/kartTuning';
import type { TrackDefinition, TrackProjection, TrackNavigation } from './TrackDefinition';

export const NEON_GRID_AI_SHORTCUT_RATES = {
  tunnel: 0.05,
  billboard: 0.45,
  dive: 0.12,
} as const;

/** A racer-local view; the shared track remains immutable and reusable. */
export class RacerTrack implements TrackDefinition {
  public readonly diveState: DiveState;
  private diveCommitted = false;
  private diveConsidered = false;
  private diveRandomState: number;
  private readonly traversal: ShortcutTraversal;
  private readonly billboardTraversal: ShortcutTraversal;
  private billboardOn = false;
  private billboardCrossing: boolean | null = null;
  private billboardCommitted = false;
  private billboardConsidered = false;
  private billboardRandomState: number;
  private committed = false;
  private considered = false;
  private randomState: number;
  public constructor(
    private readonly track: NeonGrid,
    seed = 1,
    private readonly attemptRate: number = NEON_GRID_AI_SHORTCUT_RATES.tunnel,
    private readonly billboardAttemptRate: number = NEON_GRID_AI_SHORTCUT_RATES.billboard,
    private readonly diveAttemptRate: number = NEON_GRID_AI_SHORTCUT_RATES.dive,
  ) {
    this.diveState = new DiveState(track.waterfallDive);
    this.diveRandomState = (seed ^ 0xc2b2ae35) >>> 0;
    this.traversal = new ShortcutTraversal(track.serviceTunnel, track);
    this.billboardTraversal = new ShortcutTraversal(track.billboardGap, track);
    this.randomState = seed >>> 0;
    this.billboardRandomState = (seed ^ 0x85ebca6b) >>> 0;
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
  public advance(
    previous: THREE.Vector3,
    current: THREE.Vector3,
    raceSeconds = 0,
  ): { pathId: 'billboard-gap'; speedRetention: number } | null {
    const billboardWasActive = this.billboardTraversal.project(previous) !== null;
    const billboardActive = this.billboardTraversal.update(previous, current);
    if (!billboardWasActive && billboardActive) {
      this.billboardOn = billboardStateAt(raceSeconds).on;
      this.billboardCrossing = this.billboardOn;
    }
    let exit = null;
    if (billboardWasActive && !billboardActive) {
      if (this.track.billboardGap.fraction(this.track.billboardGap.project(current)) > 0.9)
        exit = {
          pathId: 'billboard-gap' as const,
          speedRetention: this.billboardOn ? surfaceSpeedMultiplier('static', 1) : 1,
        };
      this.billboardOn = false;
      this.billboardCommitted = false;
    }
    const wasActive = this.traversal.project(previous) !== null;
    const active = this.traversal.update(previous, current);
    if (wasActive && active === null) this.committed = false;
    return exit;
  }
  public advanceDive(
    previous: THREE.Vector3,
    current: THREE.Vector3,
    velocity: THREE.Vector3,
    raceSeconds: number,
  ) {
    const recovery = this.diveState.advance(previous, current, velocity, raceSeconds);
    if (recovery) this.diveCommitted = false;
    if (!this.diveState.active) {
      const p = this.track.projectMain(current).progress;
      if (p < 0.75 || p > 0.87) {
        this.diveState.reset();
        this.diveCommitted = false;
        this.diveConsidered = false;
      }
    }
    return recovery;
  }
  public project(position: THREE.Vector3): TrackProjection {
    if (this.diveState.active) return this.track.waterfallDive.project(position, this.sampleCount);
    const billboard = this.billboardTraversal.project(position);
    if (billboard)
      return {
        ...billboard,
        surface:
          billboard.surface === 'boost' ? 'boost' : this.billboardOn ? 'static' : 'asphalt',
      };
    const tunnel = this.traversal.project(position);
    if (tunnel) return tunnel;
    const main = this.track.projectMain(position);
    // The joined plaza is supported asphalt before the physical ad crossing.
    // Keep main progress/path ownership until that crossing; do not apply a
    // grass penalty just because the supported side entrance leaves the ribbon.
    return main.surface === 'grass' &&
      (this.track.billboardGap.junctionContains(position) ||
        this.track.waterfallDive.junctionContains(position))
      ? { ...main, surface: 'asphalt' }
      : main;
  }
  public takeBillboardCrossing(): boolean | null {
    const crossing = this.billboardCrossing;
    this.billboardCrossing = null;
    return crossing;
  }

  public reset(): void {
    this.diveState.reset();
    this.diveCommitted = false;
    this.diveConsidered = false;
    this.billboardCrossing = null;
    this.traversal.reset();
    this.billboardTraversal.reset();
    this.billboardOn = false;
    this.billboardCommitted = false;
    this.billboardConsidered = false;
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
    const dive = this.track.waterfallDive;
    const diveRemaining = (dive.entryProgress - projection.progress) * this.curve.getLength();
    if (projection.progress < 0.75 || projection.progress > 0.87) {
      this.diveCommitted = false;
      this.diveConsidered = false;
    }
    if (!this.diveConsidered && allowChoice && diveRemaining >= 3 && diveRemaining <= 30) {
      this.diveConsidered = true;
      this.diveRandomState = (Math.imul(this.diveRandomState, 1664525) + 1013904223) >>> 0;
      this.diveCommitted =
        speed >= 8 &&
        projection.lateralDistance < 2.2 &&
        forward.dot(projection.tangent) > 0.7 &&
        this.diveRandomState / 4294967296 < THREE.MathUtils.clamp(this.diveAttemptRate, 0, 1);
    }
    const gap = this.track.billboardGap;
    if (this.billboardCommitted && projection.progress > gap.entry.progress[1]) {
      const approach = gap.project(position);
      if (
        gap.fraction(approach) * gap.curve.getLength() > gap.mouthDistance + 6 &&
        approach.lateralDistance > gap.roadHalfWidth
      )
        this.billboardCommitted = false;
    }
    if (
      projection.progress > gap.exitProgress + 0.03 ||
      projection.progress < gap.entry.progress[0] - 0.08
    ) {
      this.billboardConsidered = false;
      this.billboardCommitted = false;
    }
    if (projection.progress > gap.exitProgress) this.billboardCommitted = false;
    const gapRemaining = (gap.entry.progress[0] - projection.progress) * this.curve.getLength();
    if (!this.billboardConsidered && gapRemaining >= 5 && gapRemaining <= 35 && allowChoice) {
      this.billboardConsidered = true;
      this.billboardRandomState =
        (Math.imul(this.billboardRandomState, 1664525) + 1013904223) >>> 0;
      this.billboardCommitted =
        speed >= 5 &&
        speed <= 38 &&
        projection.lateralDistance < 2.2 &&
        forward.dot(projection.tangent) > 0.7 &&
        this.billboardRandomState / 4294967296 <
          THREE.MathUtils.clamp(this.billboardAttemptRate, 0, 1);
    }
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
    if (this.diveState.active || this.diveCommitted)
      return this.track.waterfallDive.navigationAt(position, distance);
    if (
      projection.pathId === 'billboard-gap' ||
      (this.billboardCommitted &&
        (this.track.billboardGap.entry.progress[0] - projection.progress) *
          this.curve.getLength() <=
          20)
    ) {
      const gap = this.track.billboardGap;
      const d =
        projection.pathId === 'billboard-gap'
          ? gap.fraction(projection) * gap.curve.getLength() + distance
          : gap.fraction(gap.project(position)) * gap.curve.getLength() + distance;
      if (d <= gap.curve.getLength())
        return {
          point: gap.curve.getPointAt(d / gap.curve.getLength()),
          tangent: gap.curve.getTangentAt(d / gap.curve.getLength()),
          halfWidth: gap.roadHalfWidth,
          pathId: gap.id,
        };
      const p = gap.exitProgress + (d - gap.curve.getLength()) / this.curve.getLength();
      return {
        point: this.curve.getPointAt(p),
        tangent: this.curve.getTangentAt(p),
        halfWidth: this.halfWidthAt(p),
      };
    }
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
