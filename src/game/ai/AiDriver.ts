import {
  AI_HAZARD_RESPONSE,
  hazardRoutePosition,
  relevantAiHazards,
  hazardLaneClearance,
  type AiHazardAwareness,
  type RelevantHazard,
} from './AiHazardAwareness';
import * as THREE from 'three';
import { candidateBAiCornerPenaltyScale } from '../../config/kartTuning';
import type { DriveInput } from '../physics/KartController';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { InkAiImpairmentSnapshot } from '../items/InkSplatSystem';

export interface AiDriverProfile {
  laneOffset: number;
  pace: number;
  aggression: number;
}

export interface AiRacerAwareness {
  id?: string;
  position: THREE.Vector3;
  speed: number;
  lateralOffset: number;
}

interface NearbyRacer {
  forwardGap: number;
  lateralOffset: number;
  speed: number;
}

interface SteeringSample {
  time: number;
  steering: number;
}

const candidateLaneOffsets = [-3.3, -1.65, 0, 1.65, 3.3] as const;
const AI_REFERENCE_CORNER_RADIANS = Math.PI / 6;

export function aiLookaheadMeters(speed: number): number {
  return THREE.MathUtils.lerp(5, 14, THREE.MathUtils.clamp(speed / 30, 0, 1));
}

export function aiCornerSeverity(
  forward: THREE.Vector3,
  currentTrackTangent: THREE.Vector3,
  targetTrackTangent: THREE.Vector3,
): number {
  const headingRadians = Math.acos(
    THREE.MathUtils.clamp(forward.dot(targetTrackTangent), -1, 1),
  );
  const trackRadians = Math.acos(
    THREE.MathUtils.clamp(currentTrackTangent.dot(targetTrackTangent), -1, 1),
  );
  return THREE.MathUtils.clamp(
    Math.max(headingRadians, trackRadians) / AI_REFERENCE_CORNER_RADIANS,
    0,
    1,
  );
}

export function aiTargetSpeed(
  characterMaxSpeed: number,
  pace: number,
  corner: number,
  handling = 6,
): number {
  const cornerPenalty =
    THREE.MathUtils.lerp(0.48, 0.34, THREE.MathUtils.clamp(pace, 0, 1)) *
    candidateBAiCornerPenaltyScale(handling, characterMaxSpeed);
  const cornerSpeedFactor = THREE.MathUtils.clamp(
    1 - THREE.MathUtils.clamp(corner, 0, 1) * cornerPenalty,
    0.35,
    1,
  );
  return characterMaxSpeed * cornerSpeedFactor;
}

function latestSteeringAtOrBefore(
  history: readonly SteeringSample[],
  cutoffSeconds: number,
): number | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const sample = history[index];
    if (sample !== undefined && sample.time <= cutoffSeconds) return sample.steering;
  }
  return null;
}

export class AiDriver {
  private laneOffset: number;
  private laneHoldSeconds = 0;
  private hazardClearHoldSeconds = 0;
  private steeringClockSeconds = 0;
  private readonly steeringHistory: SteeringSample[] = [];

  public constructor(
    private readonly track: CircuitAlpha,
    private readonly profile: AiDriverProfile,
    private readonly characterMaxSpeed: number,
    private readonly handling = 6,
  ) {
    this.laneOffset = this.roadBoundedLane(profile.laneOffset);
  }

  public input(
    position: THREE.Vector3,
    forward: THREE.Vector3,
    speed: number,
    _playerProgressDelta = 0,
    nearbyRacers: readonly AiRacerAwareness[] = [],
    dt = 1 / 60,
    hazards: readonly AiHazardAwareness[] = [],
    racerId = '',
    ink: InkAiImpairmentSnapshot | null = null,
    competitivePaceAdjustment = 0,
  ): DriveInput {
    void _playerProgressDelta;
    const now = this.steeringClockSeconds;
    const projection = this.track.project(position);
    const racersAhead = this.racersAhead(position, projection.tangent, nearbyRacers);
    const threats =
      hazards.length === 0
        ? []
        : relevantAiHazards(
            hazards,
            hazardRoutePosition(this.track, position).distance,
            this.track.curve.getLength(),
            speed,
            racerId,
          );
    if (Number.isFinite(dt) && dt > 0) this.updateLane(racersAhead, speed, dt, threats);

    const lookahead = Math.max(1, Math.round(aiLookaheadMeters(speed) / this.track.sampleSpacing));
    const targetIndex = (projection.index + lookahead) % this.track.sampleCount;
    const target = this.track.samples[targetIndex]?.clone() ?? projection.point.clone();
    const tangent = this.track.tangents[targetIndex]?.clone() ?? projection.tangent.clone();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const laneWave =
      Math.sin(projection.progress * Math.PI * 8 + this.profile.aggression * 4) * 0.16;
    const inkNoise = ink === null ? 0 : Math.sin(ink.noisePhaseRadians) * ink.noiseAmplitudeMeters;
    target.addScaledVector(right, this.roadBoundedLane(this.laneOffset + laneWave + inkNoise));

    const desired = target.sub(position).setY(0).normalize();
    const cross = forward.z * desired.x - forward.x * desired.z;
    const candidateSteering = THREE.MathUtils.clamp(
      cross * 2.6 * (ink?.steeringPrecisionMultiplier ?? 1),
      -1,
      1,
    );
    this.steeringHistory.push({ time: now, steering: candidateSteering });
    while (this.steeringHistory.length > 0) {
      const oldest = this.steeringHistory[0];
      if (oldest === undefined || now - oldest.time <= 0.3) break;
      this.steeringHistory.shift();
    }
    const steering =
      ink === null
        ? candidateSteering
        : (latestSteeringAtOrBefore(
            this.steeringHistory,
            now - ink.reactionLatencySeconds,
          ) ?? 0);
    if (Number.isFinite(dt) && dt > 0) this.steeringClockSeconds += dt;
    const corner = aiCornerSeverity(forward, projection.tangent, tangent);
    const effectivePace = THREE.MathUtils.clamp(
      this.profile.pace + competitivePaceAdjustment,
      0,
      1,
    );
    let targetSpeed = aiTargetSpeed(
      this.characterMaxSpeed,
      effectivePace,
      corner,
      this.handling,
    );
    const blocker = racersAhead.find(
      (racer) => racer.forwardGap < 5.5 && Math.abs(racer.lateralOffset - this.laneOffset) < 1.5,
    );
    if (blocker !== undefined) targetSpeed = Math.min(targetSpeed, blocker.speed + 0.4);

    return {
      throttle: speed < targetSpeed ? 1 : 0.2,
      steering,
      brake: speed > targetSpeed + 2,
      drift: Math.abs(steering) > 0.62 && speed > 11 && this.profile.aggression > 0.35,
    };
  }

  public desiredLaneOffset(): number {
    return this.laneOffset;
  }

  public reset(): void {
    this.laneOffset = this.roadBoundedLane(this.profile.laneOffset);
    this.laneHoldSeconds = 0;
    this.hazardClearHoldSeconds = 0;
    this.steeringClockSeconds = 0;
    this.steeringHistory.length = 0;
  }

  private racersAhead(
    position: THREE.Vector3,
    tangent: THREE.Vector3,
    racers: readonly AiRacerAwareness[],
  ): NearbyRacer[] {
    return racers
      .map((racer) => {
        const relative = racer.position.clone().sub(position).setY(0);
        return {
          forwardGap: relative.dot(tangent),
          lateralOffset: racer.lateralOffset,
          speed: racer.speed,
        };
      })
      .filter((racer) => racer.forwardGap > 0.5 && racer.forwardGap < 18)
      .sort((a, b) => a.forwardGap - b.forwardGap);
  }

  private updateLane(
    racersAhead: readonly NearbyRacer[],
    speed: number,
    dt: number,
    hazards: readonly RelevantHazard[],
  ): void {
    if (hazards.length > 0) {
      const preferred = this.roadBoundedLane(this.profile.laneOffset);
      const candidates = candidateLaneOffsets.map((lane) => this.roadBoundedLane(lane));
      const clear = candidates.filter((lane) => hazardLaneClearance(lane, hazards) > 0);
      const choices = clear.length > 0 ? clear : candidates;
      let bestLane = choices[0] ?? preferred;
      for (const lane of choices) {
        const clearance = hazardLaneClearance(lane, hazards);
        const bestClearance = hazardLaneClearance(bestLane, hazards);
        const betterClearance = clear.length === 0 && clearance > bestClearance + 1e-9;
        const comparable = clear.length > 0 || Math.abs(clearance - bestClearance) <= 1e-9;
        if (
          betterClearance ||
          (comparable &&
            this.laneScore(lane, preferred, racersAhead) <
              this.laneScore(bestLane, preferred, racersAhead))
        )
          bestLane = lane;
      }
      this.laneOffset = bestLane;
      this.hazardClearHoldSeconds = AI_HAZARD_RESPONSE.clearHoldSeconds;
      this.laneHoldSeconds = 0;
      return;
    }
    if (this.hazardClearHoldSeconds > 0) {
      this.hazardClearHoldSeconds = Math.max(0, this.hazardClearHoldSeconds - dt);
      if (this.hazardClearHoldSeconds > 1e-9) return;
    }
    this.laneHoldSeconds = Math.max(0, this.laneHoldSeconds - dt);
    if (this.laneHoldSeconds > 0) return;

    const preferredLane = this.roadBoundedLane(this.profile.laneOffset);
    const blocker = racersAhead.find(
      (racer) =>
        racer.forwardGap < 14 &&
        Math.abs(racer.lateralOffset - this.laneOffset) < 1.65 &&
        speed > 8 &&
        (speed > racer.speed + 0.35 || racer.forwardGap < 4),
    );

    if (blocker === undefined) {
      if (Math.abs(this.laneOffset - preferredLane) > 0.1) {
        this.laneOffset = preferredLane;
        this.laneHoldSeconds = 0.8;
      }
      return;
    }

    const currentScore = this.laneScore(this.laneOffset, preferredLane, racersAhead);
    let bestLane = this.laneOffset;
    let bestScore = currentScore;
    for (const candidate of candidateLaneOffsets) {
      const score = this.laneScore(candidate, preferredLane, racersAhead);
      if (score < bestScore) {
        bestLane = candidate;
        bestScore = score;
      }
    }

    if (currentScore - bestScore > 0.8) {
      this.laneOffset = this.roadBoundedLane(bestLane);
      this.laneHoldSeconds = THREE.MathUtils.lerp(2.1, 1.35, this.profile.aggression);
    }
  }

  private laneScore(
    candidate: number,
    preferredLane: number,
    racersAhead: readonly NearbyRacer[],
  ): number {
    let score = Math.abs(candidate - preferredLane) * 0.3;
    for (const racer of racersAhead) {
      const clearance = Math.abs(candidate - racer.lateralOffset);
      if (clearance >= 2.1) continue;
      score += (2.1 - clearance) * (18 - racer.forwardGap) * 0.85;
    }
    return score;
  }

  private roadBoundedLane(offset: number): number {
    const kartMargin = 1.4;
    return THREE.MathUtils.clamp(
      offset,
      -this.track.roadHalfWidth + kartMargin,
      this.track.roadHalfWidth - kartMargin,
    );
  }
}
