import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning } from '../src/config/kartTuning';
import {
  AiSoftPackCompression,
  softPackGapSeconds,
  softPackRaceCompletion,
} from '../src/game/ai/AiSoftPackCompression';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController, type DriveInput } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

interface TrialResult {
  name: string;
  playerReferenceSeconds: number;
  baselineSeconds: number;
  assistedSeconds: number;
  timeGainSeconds: number;
  assistedFrameRatio: number;
  meanMultiplierWhileAssisted: number;
  maximumMultiplier: number;
  fullAssistFrameRatio: number;
}

function runTrial(
  track: CircuitAlpha,
  name: string,
  playerReferenceSeconds: number,
  enabled: boolean,
): Omit<TrialResult, 'name' | 'playerReferenceSeconds' | 'baselineSeconds'> {
  const character = characterManifest.find((candidate) => candidate.displayName === name);
  if (character === undefined) throw new Error(`Missing racer ${name}`);

  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
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
  const softPack = new AiSoftPackCompression();
  let finishSeconds = Number.NaN;
  let assistedFrames = 0;
  let fullAssistFrames = 0;
  let multiplierTotal = 0;
  let maximumMultiplier = 1;
  let simulatedFrames = 0;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const seconds = step / 60;
    const before = kart.position();
    const projection = track.project(before);
    const snapshot = laps.snapshot();
    const aiTotal = snapshot.lap + projection.progress;
    const playerTotal = Math.min(3, (seconds / playerReferenceSeconds) * 3);
    const playerCompletion = softPackRaceCompletion(playerTotal);

    if (enabled) {
      softPack.advance(
        softPackGapSeconds(
          playerTotal,
          aiTotal,
          track.curve.getLength(),
          tuning.maxSpeed,
        ),
        playerCompletion,
        1 / 60,
        playerTotal < 3 && !snapshot.finished,
      );
    }

    const multiplier = enabled ? softPack.speedCapMultiplier() : 1;
    simulatedFrames += 1;
    if (multiplier > 1.0005) {
      assistedFrames += 1;
      multiplierTotal += multiplier;
    }
    if (multiplier >= 1.029) fullAssistFrames += 1;
    maximumMultiplier = Math.max(maximumMultiplier, multiplier);

    const baseInput = driver.input(
      before,
      kart.forward(),
      kart.speedMetersPerSecond(),
      0,
      [],
      1 / 60,
    );
    const input: DriveInput = {
      ...baseInput,
      competitiveSpeedCapMultiplier: multiplier,
    };
    kart.update(input, projection.surface, 1 / 60);
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
      const crossedAt = (step + 1) / 60;
      laps.enterCheckpoint(checkpoint, 1, crossedAt);
      if (laps.snapshot().finished) finishSeconds = crossedAt;
    }
  }

  expect(laps.snapshot().finished, name).toBe(true);
  expect(kart.isFinite(), name).toBe(true);
  expect(Number.isFinite(finishSeconds), name).toBe(true);

  return {
    assistedSeconds: finishSeconds,
    timeGainSeconds: 0,
    assistedFrameRatio: assistedFrames / Math.max(1, simulatedFrames),
    meanMultiplierWhileAssisted:
      assistedFrames === 0 ? 1 : multiplierTotal / assistedFrames,
    maximumMultiplier,
    fullAssistFrameRatio: fullAssistFrames / Math.max(1, simulatedFrames),
  };
}

describe('Soft Pack strong-player race telemetry', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures activation and real three-lap impact against strong player reference paces', () => {
    const track = new CircuitAlpha();
    const names = ['Manaconda', 'Lula', 'Krios', 'Accu', 'Lavi'] as const;
    const playerReferenceTimes = [94, 90, 86] as const;
    const results: TrialResult[] = [];

    for (const name of names) {
      const baseline = runTrial(track, name, 999, false).assistedSeconds;
      for (const playerReferenceSeconds of playerReferenceTimes) {
        const assisted = runTrial(track, name, playerReferenceSeconds, true);
        results.push({
          name,
          playerReferenceSeconds,
          baselineSeconds: baseline,
          assistedSeconds: assisted.assistedSeconds,
          timeGainSeconds: baseline - assisted.assistedSeconds,
          assistedFrameRatio: assisted.assistedFrameRatio,
          meanMultiplierWhileAssisted: assisted.meanMultiplierWhileAssisted,
          maximumMultiplier: assisted.maximumMultiplier,
          fullAssistFrameRatio: assisted.fullAssistFrameRatio,
        });
      }
    }

    console.log(
      `Soft Pack strong-player race telemetry: ${JSON.stringify(results)}`,
    );

    for (const result of results) {
      expect(result.maximumMultiplier).toBeGreaterThan(1);
      expect(result.maximumMultiplier).toBeLessThanOrEqual(1.03 + 1e-6);
      expect(result.assistedFrameRatio).toBeGreaterThan(0.1);
    }
  }, 90_000);
});
