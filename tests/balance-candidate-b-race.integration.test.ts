import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning } from '../src/config/kartTuning';
import { AiDriver, aiLookaheadMeters } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

describe('Balance Candidate B Circuit Alpha telemetry', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('records same-profile three-lap telemetry for all twelve character builds', () => {
    const track = new CircuitAlpha();
    const results: {
      name: string;
      seconds: number;
      maximumSpeed: number;
      observedMaximumSpeed: number;
      grassRatio: number;
      averageDriverCornerFactor: number;
      maximumDriverCornerFactor: number;
      averageTrackCurvatureFactor: number;
      maximumTrackCurvatureFactor: number;
      minimumSpeedRatio: number;
      below90Ratio: number;
      below80Ratio: number;
      below70Ratio: number;
    }[] = [];

    for (const character of characterManifest) {
      const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
      world.timestep = 1 / 60;
      world.createCollider(RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0));
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
      let grassFrames = 0;
      let simulatedFrames = 0;
      let observedMaximumSpeed = 0;
      let driverCornerFactorTotal = 0;
      let maximumDriverCornerFactor = 0;
      let trackCurvatureFactorTotal = 0;
      let maximumTrackCurvatureFactor = 0;
      let minimumSpeedRatio = 1;
      let below90Frames = 0;
      let below80Frames = 0;
      let below70Frames = 0;
      let finishSeconds = Number.NaN;

      for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
        const positionBeforeStep = kart.position();
        const projection = track.project(positionBeforeStep);
        const forward = kart.forward();
        const speed = kart.speedMetersPerSecond();
        const speedRatio = tuning.maxSpeed <= 0 ? 0 : speed / tuning.maxSpeed;
        if (step > 180) {
          minimumSpeedRatio = Math.min(minimumSpeedRatio, speedRatio);
          if (speedRatio < 0.9) below90Frames += 1;
          if (speedRatio < 0.8) below80Frames += 1;
          if (speedRatio < 0.7) below70Frames += 1;
        }
        const lookahead = Math.max(1, Math.round(aiLookaheadMeters(speed) / track.sampleSpacing));
        const targetIndex = (projection.index + lookahead) % track.sampleCount;
        const targetTangent = track.tangents[targetIndex]?.clone() ?? projection.tangent.clone();
        const driverCornerFactor = 1 - Math.max(0, forward.dot(targetTangent));
        const trackCurvatureFactor = 1 - Math.max(0, projection.tangent.dot(targetTangent));
        driverCornerFactorTotal += driverCornerFactor;
        maximumDriverCornerFactor = Math.max(maximumDriverCornerFactor, driverCornerFactor);
        trackCurvatureFactorTotal += trackCurvatureFactor;
        maximumTrackCurvatureFactor = Math.max(maximumTrackCurvatureFactor, trackCurvatureFactor);
        simulatedFrames += 1;
        if (projection.surface === 'grass') grassFrames += 1;
        observedMaximumSpeed = Math.max(observedMaximumSpeed, speed);
        kart.update(
          driver.input(positionBeforeStep, forward, speed, 0, [], 1 / 60),
          projection.surface,
          1 / 60,
        );
        world.step();
        const checkpoint = laps.snapshot().nextCheckpoint;
        if (
          crossesForwardCheckpointGate(
            positionBeforeStep,
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

      expect(laps.snapshot().finished, character.displayName).toBe(true);
      expect(kart.isFinite(), character.displayName).toBe(true);
      expect(observedMaximumSpeed, character.displayName).toBeGreaterThanOrEqual(
        tuning.maxSpeed * 0.97,
      );
      results.push({
        name: character.displayName,
        seconds: finishSeconds,
        maximumSpeed: tuning.maxSpeed,
        observedMaximumSpeed,
        grassRatio: grassFrames / simulatedFrames,
        averageDriverCornerFactor: driverCornerFactorTotal / simulatedFrames,
        maximumDriverCornerFactor,
        averageTrackCurvatureFactor: trackCurvatureFactorTotal / simulatedFrames,
        maximumTrackCurvatureFactor,
        minimumSpeedRatio,
        below90Ratio: below90Frames / Math.max(1, simulatedFrames - 180),
        below80Ratio: below80Frames / Math.max(1, simulatedFrames - 180),
        below70Ratio: below70Frames / Math.max(1, simulatedFrames - 180),
      });
    }

    results.sort((first, second) => first.seconds - second.seconds);
    console.log(`Candidate B Circuit Alpha telemetry: ${JSON.stringify(results)}`);
  }, 45_000);
});
