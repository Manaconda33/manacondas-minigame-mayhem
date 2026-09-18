import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

const dt = 1 / 60;
const playerReferenceSeconds = 90;
const maxPaceAdjustments = [0.08, 0.12, 0.16] as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number): number {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function raceEnvelope(completion: number): number {
  const c = clamp(completion, 0, 1);
  if (c <= 0.1) return 0;
  if (c < 0.15) return smoothstep((c - 0.1) / 0.05);
  if (c <= 0.8) return 1;
  if (c >= 0.925) return 0;
  return 1 - smoothstep((c - 0.8) / 0.125);
}

function targetPaceAdjustment(
  gapSeconds: number,
  completion: number,
  maximum: number,
): number {
  if (gapSeconds <= 1.5) return 0;
  const gapFactor = smoothstep((gapSeconds - 1.5) / 2.5);
  return maximum * gapFactor * raceEnvelope(completion);
}

interface RunResult {
  seconds: number;
  assistedFrameRatio: number;
  meanAdjustmentWhileAssisted: number;
  maximumAdjustment: number;
}

function run(
  track: CircuitAlpha,
  name: string,
  maxAdjustment: number,
): RunResult {
  const character = characterManifest.find((candidate) => candidate.displayName === name);
  if (character === undefined) throw new Error(`Missing racer ${name}`);

  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = dt;
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0),
  );

  const tangent = track.checkpointTangent(0);
  const tuning = createKartTuning(character.stats);
  const kart = new KartController(
    world,
    tuning,
    character.stats,
    track.checkpointPosition(0).addScaledVector(tangent, 8),
    Math.atan2(tangent.x, tangent.z),
  );
  const driver = new AiDriver(
    track,
    { laneOffset: 0, pace: 0.7, aggression: 0.6 },
    tuning.maxSpeed,
    character.stats.handling,
  );
  const laps = new LapTracker();
  let finishSeconds = Number.NaN;
  let assistedFrames = 0;
  let adjustmentTotal = 0;
  let maximumAdjustment = 0;
  let simulatedFrames = 0;
  let smoothedAdjustment = 0;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const seconds = step * dt;
    const before = kart.position();
    const projection = track.project(before);
    const snapshot = laps.snapshot();
    const aiTotal = snapshot.lap + projection.progress;
    const playerTotal = Math.min(3, (seconds / playerReferenceSeconds) * 3);
    const playerCompletion = clamp(playerTotal / 3, 0, 1);
    const gapSeconds =
      ((playerTotal - aiTotal) * track.curve.getLength()) / tuning.maxSpeed;
    const target = targetPaceAdjustment(
      gapSeconds,
      playerCompletion,
      maxAdjustment,
    );
    const alpha = 1 - Math.exp(-(3 / 1.25) * dt);
    smoothedAdjustment += (target - smoothedAdjustment) * alpha;

    simulatedFrames += 1;
    if (smoothedAdjustment > 0.0005) {
      assistedFrames += 1;
      adjustmentTotal += smoothedAdjustment;
    }
    maximumAdjustment = Math.max(maximumAdjustment, smoothedAdjustment);

    kart.update(
      driver.input(
        before,
        kart.forward(),
        kart.speedMetersPerSecond(),
        0,
        [],
        dt,
        [],
        character.id,
        null,
        smoothedAdjustment,
      ),
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
      const crossedAt = (step + 1) * dt;
      laps.enterCheckpoint(checkpoint, 1, crossedAt);
      if (laps.snapshot().finished) finishSeconds = crossedAt;
    }
  }

  expect(laps.snapshot().finished, name).toBe(true);
  expect(kart.isFinite(), name).toBe(true);
  expect(Number.isFinite(finishSeconds), name).toBe(true);

  return {
    seconds: finishSeconds,
    assistedFrameRatio: assistedFrames / Math.max(1, simulatedFrames),
    meanAdjustmentWhileAssisted:
      assistedFrames === 0 ? 0 : adjustmentTotal / assistedFrames,
    maximumAdjustment,
  };
}

describe('Candidate B AI execution-assist instrumentation', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('sweeps bounded pace authority against a strong player reference', () => {
    const track = new CircuitAlpha();
    const names = ['Manaconda', 'Lula', 'Krios', 'Accu', 'Lavi'] as const;
    const results = names.map((name) => {
      const baseline = run(track, name, 0);
      return {
        name,
        baselineSeconds: baseline.seconds,
        candidates: maxPaceAdjustments.map((maximum) => {
          const assisted = run(track, name, maximum);
          return {
            maximum,
            assistedSeconds: assisted.seconds,
            timeGainSeconds: baseline.seconds - assisted.seconds,
            assistedFrameRatio: assisted.assistedFrameRatio,
            meanAdjustmentWhileAssisted:
              assisted.meanAdjustmentWhileAssisted,
            maximumAdjustment: assisted.maximumAdjustment,
          };
        }),
      };
    });

    console.log(
      `Candidate B AI execution-assist sweep: ${JSON.stringify(results)}`,
    );

    expect(results).toHaveLength(5);
    for (const result of results) {
      expect(result.candidates.every((candidate) => candidate.maximumAdjustment <= 0.160001)).toBe(
        true,
      );
    }
  }, 120_000);
});
