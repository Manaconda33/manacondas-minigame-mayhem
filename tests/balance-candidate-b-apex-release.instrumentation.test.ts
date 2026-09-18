import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import {
  candidateBAccelerationRecoveryMultiplier,
  createKartTuning,
  type DriverStats,
} from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

const dt = 1 / 60;
const projectedWindowSeconds = 1.5;
const projectedOverspeedPercent = 0.12;
const minimumReleaseSpacingSeconds = 1.5;
const halfWindowSamples = [2, 4, 6] as const;
const minimumPeakDegrees = [2, 4, 6] as const;
const minimumProminenceDegrees = [0.5, 1, 2] as const;
const releaseRatios = [0.8, 0.65] as const;
const prominenceRadiusSamples = 6;
const maximumReleaseSearchSamples = 16;

interface RuntimeSample {
  seconds: number;
  trackIndex: number;
  speed: number;
  speedRatio: number;
  surface: string;
}

interface RaceTelemetry {
  seconds: number;
  samples: RuntimeSample[];
}

interface ReleaseCandidate extends RuntimeSample {
  peakCurvatureDegrees: number;
  releaseCurvatureDegrees: number;
  prominenceDegrees: number;
}

interface ReleaseConfig {
  halfWindow: number;
  minimumPeak: number;
  minimumProminence: number;
  releaseRatio: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function specialistOverspeedEligibility(stats: DriverStats): number {
  const lowSpeedTradeoff = clamp(6 - stats.speed, 0, 1);
  const specialistStrength = clamp(
    0.5 * Math.max(0, stats.acceleration - 7) +
      0.5 * Math.max(0, stats.handling - 6),
    0,
    1,
  );
  return lowSpeedTradeoff * specialistStrength;
}

function curvatureDegreesAt(
  track: CircuitAlpha,
  index: number,
  halfWindow: number,
): number {
  const count = track.sampleCount;
  const before = track.tangents[(index - halfWindow + count) % count];
  const after = track.tangents[(index + halfWindow) % count];
  if (before === undefined || after === undefined) return 0;
  return THREE.MathUtils.radToDeg(
    Math.acos(clamp(before.dot(after), -1, 1)),
  );
}

function projectedWindowGainSeconds(
  stats: DriverStats,
  exitSpeed: number,
): number {
  const eligibility = specialistOverspeedEligibility(stats);
  if (eligibility <= 0) return 0;

  const tuning = createKartTuning(stats);
  const baseCap = tuning.maxSpeed;
  const projectedCap =
    baseCap * (1 + projectedOverspeedPercent * eligibility);
  let baselineSpeed = Math.min(exitSpeed, baseCap);
  let projectedSpeed = Math.min(exitSpeed, projectedCap);
  let baselineDistance = 0;
  let projectedDistance = 0;
  const frames = Math.round(projectedWindowSeconds / dt);

  for (let frame = 0; frame < frames; frame += 1) {
    const baselineRatio = clamp(Math.abs(baselineSpeed) / baseCap, 0, 1);
    const projectedRatio = clamp(Math.abs(projectedSpeed) / baseCap, 0, 1);
    const baselineTaper = clamp(
      1 - 0.72 * baselineRatio * baselineRatio,
      0.22,
      1,
    );
    const projectedTaper = clamp(
      1 - 0.72 * projectedRatio * projectedRatio,
      0.22,
      1,
    );
    const baselineAcceleration =
      tuning.acceleration *
      baselineTaper *
      candidateBAccelerationRecoveryMultiplier(
        stats.acceleration,
        baselineRatio,
        stats.speed,
      );
    const projectedAcceleration =
      tuning.acceleration *
      projectedTaper *
      candidateBAccelerationRecoveryMultiplier(
        stats.acceleration,
        projectedRatio,
        stats.speed,
      );

    baselineSpeed = Math.min(
      baseCap,
      baselineSpeed + baselineAcceleration * dt,
    );
    projectedSpeed = Math.min(
      projectedCap,
      projectedSpeed + projectedAcceleration * dt,
    );
    baselineDistance += baselineSpeed * dt;
    projectedDistance += projectedSpeed * dt;
  }

  return Math.max(0, projectedDistance - baselineDistance) / baseCap;
}

function runCleanRace(
  track: CircuitAlpha,
  stats: DriverStats,
): RaceTelemetry {
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = dt;
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0),
  );

  const tangent = track.checkpointTangent(0);
  const tuning = createKartTuning(stats);
  const kart = new KartController(
    world,
    tuning,
    stats,
    track.checkpointPosition(0).addScaledVector(tangent, 8),
    Math.atan2(tangent.x, tangent.z),
  );
  const driver = new AiDriver(
    track,
    { laneOffset: 0, pace: 0.7, aggression: 0.6 },
    tuning.maxSpeed,
    stats.handling,
  );
  const laps = new LapTracker();
  const samples: RuntimeSample[] = [];
  let lastTrackIndex = -1;
  let finishSeconds = Number.NaN;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const before = kart.position();
    const projection = track.project(before);
    const speed = kart.speedMetersPerSecond();

    if (projection.index !== lastTrackIndex) {
      samples.push({
        seconds: step * dt,
        trackIndex: projection.index,
        speed,
        speedRatio: speed / tuning.maxSpeed,
        surface: projection.surface,
      });
      lastTrackIndex = projection.index;
    }

    kart.update(
      driver.input(before, kart.forward(), speed, 0, [], dt),
      projection.surface,
      dt,
    );
    world.step();

    const checkpoint = laps.snapshot().nextCheckpoint;
    if (
      crossesForwardCheckpointGate(
        before,
        kart.position(),
        track.lapCheckpointPosition(checkpoint),
        track.lapCheckpointTangent(checkpoint),
      )
    ) {
      const seconds = (step + 1) * dt;
      laps.enterCheckpoint(checkpoint, 1, seconds);
      if (laps.snapshot().finished) finishSeconds = seconds;
    }
  }

  expect(laps.snapshot().finished).toBe(true);
  expect(Number.isFinite(finishSeconds)).toBe(true);
  return { seconds: finishSeconds, samples };
}

function detectApexReleases(
  track: CircuitAlpha,
  telemetry: RaceTelemetry,
  config: ReleaseConfig,
): ReleaseCandidate[] {
  const curvatures = telemetry.samples.map((sample) =>
    curvatureDegreesAt(track, sample.trackIndex, config.halfWindow),
  );
  const raw: ReleaseCandidate[] = [];

  for (
    let index = prominenceRadiusSamples;
    index < telemetry.samples.length - prominenceRadiusSamples;
    index += 1
  ) {
    const peak = curvatures[index] ?? 0;
    const previous = curvatures[index - 1] ?? peak;
    const next = curvatures[index + 1] ?? peak;
    if (
      peak < config.minimumPeak ||
      peak <= previous ||
      peak < next
    ) {
      continue;
    }

    const left = curvatures.slice(
      index - prominenceRadiusSamples,
      index,
    );
    const right = curvatures.slice(
      index + 1,
      index + prominenceRadiusSamples + 1,
    );
    const leftMinimum = Math.min(...left);
    const rightMinimum = Math.min(...right);
    const prominence = peak - Math.max(leftMinimum, rightMinimum);
    if (prominence < config.minimumProminence) continue;

    const releaseThreshold = peak * config.releaseRatio;
    let releaseIndex = -1;
    const searchEnd = Math.min(
      telemetry.samples.length - 1,
      index + maximumReleaseSearchSamples,
    );
    for (let candidate = index + 1; candidate <= searchEnd; candidate += 1) {
      if ((curvatures[candidate] ?? peak) <= releaseThreshold) {
        releaseIndex = candidate;
        break;
      }
    }
    if (releaseIndex < 0) continue;

    const release = telemetry.samples[releaseIndex];
    if (
      release === undefined ||
      release.surface !== 'asphalt' ||
      release.speedRatio > 1.01 ||
      !Number.isFinite(release.speedRatio)
    ) {
      continue;
    }

    raw.push({
      ...release,
      peakCurvatureDegrees: peak,
      releaseCurvatureDegrees: curvatures[releaseIndex] ?? 0,
      prominenceDegrees: prominence,
    });
  }

  const spaced: ReleaseCandidate[] = [];
  for (const candidate of raw) {
    const previous = spaced.at(-1);
    if (
      previous === undefined ||
      candidate.seconds - previous.seconds >= minimumReleaseSpacingSeconds
    ) {
      spaced.push(candidate);
    }
  }
  return spaced;
}

function summarizeConfig(
  track: CircuitAlpha,
  telemetry: RaceTelemetry,
  stats: DriverStats,
  config: ReleaseConfig,
) {
  const releases = detectApexReleases(track, telemetry, config);
  const projectedGain = releases.reduce(
    (sum, release) =>
      sum + projectedWindowGainSeconds(stats, release.speed),
    0,
  );
  const mean = (values: number[]): number =>
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;
  const spacings = releases
    .slice(1)
    .map(
      (release, index) =>
        release.seconds - (releases[index]?.seconds ?? release.seconds),
    );

  return {
    config,
    releaseCount: releases.length,
    meanSpacingSeconds: mean(spacings),
    meanPeakCurvatureDegrees: mean(
      releases.map((release) => release.peakCurvatureDegrees),
    ),
    meanProminenceDegrees: mean(
      releases.map((release) => release.prominenceDegrees),
    ),
    meanExitSpeedRatio: mean(
      releases.map((release) => release.speedRatio),
    ),
    projectedGainSeconds: projectedGain,
    projectedRaceSeconds: telemetry.seconds - projectedGain,
  };
}

describe('Candidate B apex-release opportunity instrumentation', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures internal curvature-release opportunities without changing gameplay', () => {
    const track = new CircuitAlpha();
    const names = ['Lavi', 'Lula', 'Alex'] as const;
    const racers = names.map((name) => {
      const character = characterManifest.find(
        (candidate) => candidate.displayName === name,
      );
      if (character === undefined) {
        throw new Error(`Missing racer ${name}`);
      }
      return character;
    });

    const configs: ReleaseConfig[] = [];
    for (const halfWindow of halfWindowSamples) {
      for (const minimumPeak of minimumPeakDegrees) {
        for (const minimumProminence of minimumProminenceDegrees) {
          for (const releaseRatio of releaseRatios) {
            configs.push({
              halfWindow,
              minimumPeak,
              minimumProminence,
              releaseRatio,
            });
          }
        }
      }
    }

    const results = racers.map((character) => {
      const telemetry = runCleanRace(track, character.stats);
      const summaries = configs.map((config) =>
        summarizeConfig(track, telemetry, character.stats, config),
      );
      return {
        name: character.displayName,
        baselineSeconds: telemetry.seconds,
        specialistEligibility: specialistOverspeedEligibility(character.stats),
        minimumReleaseCount: Math.min(
          ...summaries.map((summary) => summary.releaseCount),
        ),
        maximumReleaseCount: Math.max(
          ...summaries.map((summary) => summary.releaseCount),
        ),
        targetRangeConfigs: summaries.filter(
          (summary) =>
            summary.releaseCount >= 20 && summary.releaseCount <= 30,
        ),
        summaries,
      };
    });

    console.log(
      `Candidate B apex-release opportunity instrumentation: ${JSON.stringify(
        results,
      )}`,
    );

    expect(results).toHaveLength(3);
    const alex = results.find((result) => result.name === 'Alex');
    const lavi = results.find((result) => result.name === 'Lavi');
    const lula = results.find((result) => result.name === 'Lula');
    expect(alex?.specialistEligibility).toBe(0);
    expect(lavi?.specialistEligibility).toBe(1);
    expect(lula?.specialistEligibility).toBe(1);
    expect(
      results.every(
        (result) =>
          result.minimumReleaseCount >= 0 &&
          result.maximumReleaseCount >= result.minimumReleaseCount &&
          result.summaries.every(
            (summary) =>
              Number.isFinite(summary.projectedGainSeconds) &&
              Number.isFinite(summary.projectedRaceSeconds),
          ),
      ),
    ).toBe(true);
  }, 90_000);
});
