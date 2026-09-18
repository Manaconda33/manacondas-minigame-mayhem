import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import {
  AiSoftPackCompression,
  softPackGapSeconds,
} from '../src/game/ai/AiSoftPackCompression';
import { KartController, type DriveInput } from '../src/game/physics/KartController';

describe('AI Soft Pack physics telemetry', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  function run(startGapMeters: number, seconds = 40): {
    initialGapMeters: number;
    finalGapMeters: number;
    finalMultiplier: number;
  } {
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(500, 0.1, 4000).setTranslation(0, -0.12, 0),
    );

    const tuning = createKartTuning(sliceOneDriver);
    const player = new KartController(
      world,
      tuning,
      sliceOneDriver,
      new Vector3(-2, 1.1, 0),
      0,
    );
    const ai = new KartController(
      world,
      tuning,
      sliceOneDriver,
      new Vector3(2, 1.1, -startGapMeters),
      0,
    );
    const softPack = new AiSoftPackCompression();
    const playerInput: DriveInput = {
      throttle: 1,
      steering: 0,
      brake: false,
      drift: false,
    };

    const initialGapMeters = player.position().z - ai.position().z;
    const frames = Math.round(seconds * 60);
    for (let frame = 0; frame < frames; frame += 1) {
      const gapMeters = player.position().z - ai.position().z;
      softPack.advance(
        softPackGapSeconds(
          gapMeters / tuning.maxSpeed,
          0,
          tuning.maxSpeed,
          tuning.maxSpeed,
        ),
        0.5,
        1 / 60,
      );
      const aiInput: DriveInput = {
        ...playerInput,
        competitiveSpeedCapMultiplier: softPack.speedCapMultiplier(),
      };
      player.update(playerInput, 'asphalt', 1 / 60);
      ai.update(aiInput, 'asphalt', 1 / 60);
      world.step();
    }

    return {
      initialGapMeters,
      finalGapMeters: player.position().z - ai.position().z,
      finalMultiplier: softPack.speedCapMultiplier(),
    };
  }

  it('closes a meaningful trailing gap without snapping the AI onto the player', () => {
    const result = run(90);
    console.log(`Soft Pack trailing physics telemetry: ${JSON.stringify(result)}`);
    expect(result.finalGapMeters).toBeLessThan(result.initialGapMeters - 8);
    expect(result.finalGapMeters).toBeGreaterThan(25);
    expect(result.finalMultiplier).toBeGreaterThan(1);
    expect(result.finalMultiplier).toBeLessThanOrEqual(1.03);
  });

  it('lets the player recover against a far-ahead AI without forcing parity', () => {
    const result = run(-90);
    console.log(`Soft Pack leading physics telemetry: ${JSON.stringify(result)}`);
    expect(result.finalGapMeters).toBeGreaterThan(result.initialGapMeters + 4);
    expect(result.finalGapMeters).toBeLessThan(-25);
    expect(result.finalMultiplier).toBeGreaterThanOrEqual(0.985);
    expect(result.finalMultiplier).toBeLessThan(1);
  });
});
