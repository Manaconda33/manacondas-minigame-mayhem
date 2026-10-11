import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { KartController } from '../src/game/physics/KartController';
import { AiDriver } from '../src/game/ai/AiDriver';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { guardrailContact } from '../src/game/track/GuardrailSystem';

beforeAll(async () => {
  await RAPIER.init();
});
it.each([0, 4, 7])(
  'physically traverses tunnel and earns three ordered laps for profile %s',
  (index) => {
    const track = new NeonGrid(),
      route = new RacerTrack(track, index + 1, 1);
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById(`aa-${String(index + 1).padStart(2, '0')}`).stats,
      tuning = createKartTuning(stats);
    const p = track.curve.getPointAt(0.001),
      t = track.curve.getTangentAt(0.001);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    const driver = new AiDriver(
      route,
      { laneOffset: 0, pace: 0.6, aggression: 0.6 },
      tuning.maxSpeed,
    );
    const laps = new LapTracker(),
      crossed: number[] = [];
    let tunnelSteps = 0,
      minimumHeight = 99,
      unsupported = 0;
    for (let i = 0; i < 60 * 300 && !laps.snapshot().finished; i++) {
      const before = kart.position(),
        projection = route.project(before);
      kart.update(
        driver.input(before, kart.forward(), kart.speedMetersPerSecond()),
        projection.surface,
        1 / 60,
      );
      world.step();
      route.advance(before, kart.position());
      const contact = guardrailContact(route, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
      const after = kart.position(),
        current = route.project(after);
      if (current.pathId) {
        tunnelSteps++;
        minimumHeight = Math.min(minimumHeight, after.y);
        if (after.y < current.point.y - 1) unsupported++;
      }
      const gate = laps.snapshot().nextCheckpoint;
      if (
        crossesForwardCheckpointGate(
          before,
          after,
          track.lapCheckpointPosition(gate),
          track.lapCheckpointTangent(gate),
          13,
          1.5,
        )
      ) {
        laps.enterCheckpoint(gate, 1, i / 60);
        crossed.push(gate);
      }
    }
    expect({
      crossed,
      position: kart.position().toArray(),
      progress: route.project(kart.position()).progress,
      tunnelSteps,
      minimumHeight,
      unsupported,
    }).toMatchObject({
      crossed: Array.from({ length: 3 }, () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]).flat(),
      unsupported: 0,
    });
    expect(tunnelSteps).toBeGreaterThan(300);
    expect(minimumHeight).toBeLessThan(-3);
    cleanup();
    world.free();
  },
  30000,
);
