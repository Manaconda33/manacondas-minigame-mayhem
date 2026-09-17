import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { createKartTuning, sliceOneDriver, type DriverStats } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

describe('Rapier spline AI integration', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('qualifies all seven AI profiles over three validated laps without player input', () => {
    const track = new CircuitAlpha();
    const profiles = Array.from({ length: 7 }, (_, index) => ({
      laneOffset: (index % 2 === 0 ? -1 : 1) * (0.35 + Math.floor(index / 2) * 0.25),
      pace: 0.28 + index * 0.09,
      aggression: 0.2 + (index % 4) * 0.2,
    }));

    for (const profile of profiles) {
      const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
      world.timestep = 1 / 60;
      world.createCollider(RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0));
      const tangent = track.checkpointTangent(0);
      const kart = new KartController(
        world,
        createKartTuning(sliceOneDriver),
        sliceOneDriver,
        track.checkpointPosition(0).addScaledVector(tangent, 8),
        Math.atan2(tangent.x, tangent.z),
      );
      const maximumSpeed = createKartTuning(sliceOneDriver).maxSpeed;
      const driver = new AiDriver(track, profile, maximumSpeed);
      const laps = new LapTracker();
      let grassFrames = 0;
      let simulatedFrames = 0;
      let maximumLateralDistance = 0;
      let observedMaximumSpeed = 0;

      for (let step = 0; step < 21_600 && !laps.snapshot().finished; step += 1) {
        const positionBeforeStep = kart.position();
        const projection = track.project(positionBeforeStep);
        simulatedFrames += 1;
        if (projection.surface === 'grass') grassFrames += 1;
        maximumLateralDistance = Math.max(maximumLateralDistance, projection.lateralDistance);
        observedMaximumSpeed = Math.max(observedMaximumSpeed, kart.speedMetersPerSecond());
        kart.update(
          driver.input(positionBeforeStep, kart.forward(), kart.speedMetersPerSecond()),
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
        )
          laps.enterCheckpoint(checkpoint, 1, step / 60);
      }

      expect(laps.snapshot().finished).toBe(true);
      expect(kart.isFinite()).toBe(true);
      expect(grassFrames / simulatedFrames).toBeLessThan(0.02);
      expect(maximumLateralDistance).toBeLessThan(track.roadHalfWidth + 0.5);
      expect(observedMaximumSpeed).toBeGreaterThanOrEqual(maximumSpeed * 0.98);
    }
  }, 30_000);

  it('moves off a blocked line and passes a slower racer without leaving the road', () => {
    const track = new CircuitAlpha();
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    world.createCollider(RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0));

    const createKartAt = (index: number, stats: DriverStats): KartController => {
      const tangent = track.tangents[index];
      const position = track.samples[index];
      if (tangent === undefined || position === undefined)
        throw new Error('Missing AI test sample');
      return new KartController(
        world,
        createKartTuning(stats),
        stats,
        position.clone(),
        Math.atan2(tangent.x, tangent.z),
      );
    };

    const slowerStats = { ...sliceOneDriver, speed: 5 };
    const fasterStats = { ...sliceOneDriver, speed: 10 };
    const frontKart = createKartAt(32, slowerStats);
    const rearKart = createKartAt(28, fasterStats);
    const frontMaximum = createKartTuning(slowerStats).maxSpeed;
    const rearMaximum = createKartTuning(fasterStats).maxSpeed;
    const frontDriver = new AiDriver(
      track,
      { laneOffset: 0, pace: 0.1, aggression: 0.2 },
      frontMaximum,
    );
    const rearDriver = new AiDriver(
      track,
      { laneOffset: 0, pace: 1, aggression: 0.8 },
      rearMaximum,
    );
    let changedLane = false;
    let completedPass = false;
    let maximumLateralDistance = 0;

    for (let step = 0; step < 1_800 && !completedPass; step += 1) {
      const frontPosition = frontKart.position();
      const rearPosition = rearKart.position();
      const frontProjection = track.project(frontPosition);
      const rearProjection = track.project(rearPosition);
      maximumLateralDistance = Math.max(
        maximumLateralDistance,
        frontProjection.lateralDistance,
        rearProjection.lateralDistance,
      );

      frontKart.update(
        frontDriver.input(frontPosition, frontKart.forward(), frontKart.speedMetersPerSecond(), 0, [
          {
            position: rearPosition,
            speed: rearKart.speedMetersPerSecond(),
            lateralOffset: rearProjection.lateralOffset,
          },
        ]),
        frontProjection.surface,
        1 / 60,
      );
      rearKart.update(
        rearDriver.input(rearPosition, rearKart.forward(), rearKart.speedMetersPerSecond(), 0, [
          {
            position: frontPosition,
            speed: frontKart.speedMetersPerSecond(),
            lateralOffset: frontProjection.lateralOffset,
          },
        ]),
        rearProjection.surface,
        1 / 60,
      );
      world.step();

      changedLane ||= Math.abs(rearDriver.desiredLaneOffset()) > 1;
      const progressDifference =
        ((track.project(rearKart.position()).progress -
          track.project(frontKart.position()).progress +
          1.5) %
          1) -
        0.5;
      completedPass = progressDifference > 0.003;
    }

    expect(changedLane).toBe(true);
    expect(completedPass).toBe(true);
    expect(maximumLateralDistance).toBeLessThan(track.roadHalfWidth + 0.5);
  });
});
