import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning, type DriverStats } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { CandidateBCornerExitOverspeed } from '../src/game/physics/CandidateBCornerExitOverspeed';
import { KartController, type DriveInput } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

interface RunResult {
  seconds: number;
  activations: number;
}

function runThreeLap(
  track: CircuitAlpha,
  stats: DriverStats,
  overspeedEnabled: boolean,
): RunResult {
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
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
  const cornerExit = new CandidateBCornerExitOverspeed(track, stats);
  const laps = new LapTracker();
  let finishSeconds = Number.NaN;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const before = kart.position();
    const projection = track.project(before);
    const speed = kart.speedMetersPerSecond();

    if (overspeedEnabled) {
      cornerExit.advance(
        projection,
        speed / tuning.maxSpeed,
        1 / 60,
        laps.snapshot().finished,
      );
    }

    const baseInput = driver.input(
      before,
      kart.forward(),
      speed,
      0,
      [],
      1 / 60,
    );
    const input: DriveInput = overspeedEnabled
      ? {
          ...baseInput,
          effectSpeedCapMultiplier: Math.max(
            baseInput.effectSpeedCapMultiplier ?? 1,
            cornerExit.speedCapMultiplier(),
          ),
        }
      : baseInput;

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
      const seconds = (step + 1) / 60;
      laps.enterCheckpoint(checkpoint, 1, seconds);
      if (laps.snapshot().finished) finishSeconds = seconds;
    }
  }

  expect(laps.snapshot().finished).toBe(true);
  expect(kart.isFinite()).toBe(true);
  expect(Number.isFinite(finishSeconds)).toBe(true);
  return {
    seconds: finishSeconds,
    activations: cornerExit.activationCount(),
  };
}

describe('Candidate B apex-release overspeed runtime prototype', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures the real three-lap physics delta for Lavi, Lula and Alex', () => {
    const track = new CircuitAlpha();
    const names = ['Lavi', 'Lula', 'Alex'] as const;
    const results = names.map((name) => {
      const character = characterManifest.find(
        (candidate) => candidate.displayName === name,
      );
      if (character === undefined) throw new Error(`Missing racer ${name}`);
      const baseline = runThreeLap(track, character.stats, false);
      const prototype = runThreeLap(track, character.stats, true);
      return {
        name,
        baselineSeconds: baseline.seconds,
        prototypeSeconds: prototype.seconds,
        gainSeconds: baseline.seconds - prototype.seconds,
        activations: prototype.activations,
      };
    });

    console.log(
      `Candidate B apex-release runtime telemetry: ${JSON.stringify(results)}`,
    );

    const lavi = results.find((result) => result.name === 'Lavi');
    const lula = results.find((result) => result.name === 'Lula');
    const alex = results.find((result) => result.name === 'Alex');
    if (lavi === undefined || lula === undefined || alex === undefined) {
      throw new Error('Missing runtime telemetry result');
    }

    expect(lavi.activations).toBeGreaterThanOrEqual(20);
    expect(lavi.activations).toBeLessThanOrEqual(30);
    expect(lula.activations).toBeGreaterThanOrEqual(20);
    expect(lula.activations).toBeLessThanOrEqual(30);
    expect(alex.activations).toBe(0);

    expect(lavi.gainSeconds).toBeGreaterThan(1.5);
    expect(lavi.gainSeconds).toBeLessThan(3.5);
    expect(lula.gainSeconds).toBeGreaterThan(1.5);
    expect(lula.gainSeconds).toBeLessThan(3.5);
    expect(Math.abs(alex.gainSeconds)).toBeLessThanOrEqual(1 / 60);
  }, 45_000);
});
