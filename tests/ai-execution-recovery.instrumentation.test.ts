import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning } from '../src/config/kartTuning';
import {
  AiExecutionAssist,
  executionAssistGapSeconds,
  executionAssistRaceCompletion,
} from '../src/game/ai/AiExecutionAssist';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

interface Result {
  seconds: number;
  assistedFrameRatio: number;
  meanEffectivePace: number;
  maxEffectivePace: number;
}

function run(
  track: CircuitAlpha,
  name: string,
  basePace: number,
  enabled: boolean,
): Result {
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
    { laneOffset: 0, pace: basePace, aggression: 0.6 },
    tuning.maxSpeed,
    character.stats.handling,
  );
  const assist = new AiExecutionAssist();
  const laps = new LapTracker();
  let finishSeconds = Number.NaN;
  let assistedFrames = 0;
  let effectivePaceTotal = 0;
  let maxEffectivePace = basePace;
  let simulatedFrames = 0;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const seconds = step / 60;
    const before = kart.position();
    const projection = track.project(before);
    const snapshot = laps.snapshot();
    const aiTotal = snapshot.lap + projection.progress;
    const playerTotal = Math.min(3, (seconds / 90) * 3);
    if (enabled) {
      assist.advance(
        basePace,
        executionAssistGapSeconds(
          playerTotal,
          aiTotal,
          track.curve.getLength(),
          tuning.maxSpeed,
        ),
        executionAssistRaceCompletion(playerTotal),
        1 / 60,
      );
    }
    const adjustment = enabled ? assist.adjustment() : 0;
    const effectivePace = Math.min(1, basePace + adjustment);
    simulatedFrames += 1;
    effectivePaceTotal += effectivePace;
    maxEffectivePace = Math.max(maxEffectivePace, effectivePace);
    if (adjustment > 0.0005) assistedFrames += 1;

    kart.update(
      driver.input(
        before,
        kart.forward(),
        kart.speedMetersPerSecond(),
        0,
        [],
        1 / 60,
        [],
        character.id,
        null,
        adjustment,
      ),
      projection.surface,
      1 / 60,
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
      const crossedAt = (step + 1) / 60;
      laps.enterCheckpoint(checkpoint, 1, crossedAt);
      if (laps.snapshot().finished) finishSeconds = crossedAt;
    }
  }

  expect(laps.snapshot().finished, `${name} pace ${String(basePace)}`).toBe(true);
  return {
    seconds: finishSeconds,
    assistedFrameRatio: assistedFrames / Math.max(1, simulatedFrames),
    meanEffectivePace: effectivePaceTotal / Math.max(1, simulatedFrames),
    maxEffectivePace,
  };
}

describe('Candidate B trailing execution recovery', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures production pace slots against a 90-second player reference', () => {
    const track = new CircuitAlpha();
    const names = ['Lula', 'Manaconda', 'Krios', 'Accu'] as const;
    const paces = [0.28, 0.55, 0.82] as const;
    const results = names.map((name) => ({
      name,
      slots: paces.map((basePace) => {
        const baseline = run(track, name, basePace, false);
        const assisted = run(track, name, basePace, true);
        return {
          basePace,
          baselineSeconds: baseline.seconds,
          assistedSeconds: assisted.seconds,
          timeGainSeconds: baseline.seconds - assisted.seconds,
          assistedFrameRatio: assisted.assistedFrameRatio,
          meanEffectivePace: assisted.meanEffectivePace,
          maxEffectivePace: assisted.maxEffectivePace,
        };
      }),
    }));

    console.log(
      `Candidate B trailing execution recovery telemetry: ${JSON.stringify(results)}`,
    );

    expect(results).toHaveLength(4);
    expect(
      results.every((result) =>
        result.slots.every((slot) => slot.maxEffectivePace <= 1.000001),
      ),
    ).toBe(true);
  }, 120_000);
});
