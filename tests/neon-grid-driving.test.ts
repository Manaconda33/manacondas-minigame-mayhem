import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
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
it.each(Array.from({ length: 8 }, (_, i) => i))(
  'physically drives three laps in gate order for roster driver %s without recovery',
  (index) => {
    const track = new NeonGrid();
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById(`aa-${String(index + 1).padStart(2, '0')}`).stats;
    const tuning = createKartTuning(stats);
    const p = track.curve.getPointAt(0.001);
    const t = track.curve.getTangentAt(0.001);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    const driver = new AiDriver(
      track,
      {
        laneOffset: (index % 2 === 0 ? 1 : -1) * (0.7 + Math.floor(index / 2) * 0.35),
        pace: 0.28 + index * 0.09,
        aggression: 0.2 + (index % 4) * 0.2,
      },
      tuning.maxSpeed,
    );
    const laps = new LapTracker();
    const crossed: number[] = [];
    for (let i = 0; i < 60 * 450 && !laps.snapshot().finished; i++) {
      const before = kart.position();
      const projection = track.project(before);
      kart.update(
        driver.input(before, kart.forward(), kart.velocity().length()),
        projection.surface,
        1 / 60,
      );
      world.step();
      const contact = guardrailContact(track, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
      const gate = laps.snapshot().nextCheckpoint;
      if (
        crossesForwardCheckpointGate(
          before,
          kart.position(),
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
      progress: track.project(kart.position()).progress,
    }).toMatchObject({
      crossed: Array.from({ length: 3 }, () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]).flat(),
    });
    cleanup();
    world.free();
  },
  30000,
);
