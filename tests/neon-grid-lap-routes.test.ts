import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { KartController } from '../src/game/physics/KartController';
import { AiDriver } from '../src/game/ai/AiDriver';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { guardrailContact } from '../src/game/track/GuardrailSystem';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
beforeAll(async () => {
  await RAPIER.init();
});
const combinations = [0, 1].flatMap((tunnel) =>
  [0, 1].flatMap((billboard) =>
    [0, 1].flatMap((dive) => ['player', 'ai'].map((owner) => ({ tunnel, billboard, dive, owner }))),
  ),
);
it.each(combinations)(
  'earns three physical laps: $owner tunnel=$tunnel billboard=$billboard dive=$dive',
  ({ tunnel, billboard, dive, owner }) => {
    const track = new NeonGrid(),
      route = new RacerTrack(track, 1, tunnel, billboard, dive),
      world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById(owner === 'player' ? 'aa-09' : 'aa-02').stats,
      tuning = createKartTuning(stats),
      p = track.curve.getPointAt(0.001),
      t = track.curve.getTangentAt(0.001);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z)),
      driver = new AiDriver(route, { laneOffset: 0, pace: 0.6, aggression: 0.6 }, tuning.maxSpeed),
      laps = new LapTracker();
    const crossed: number[] = [];
    let diveSteps = 0,
      landings = 0,
      recoveries = 0,
      wasLanded = false;
    for (let i = 0; i < 60 * 360 && !laps.snapshot().finished; i++) {
      const previous = kart.position(),
        projection = route.project(previous);
      const input = driver.input(previous, kart.forward(), kart.speedMetersPerSecond());
      if (route.diveState.splashing) kart.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      else kart.update(input, projection.surface, 1 / 60);
      world.step();
      const exit = route.advance(previous, kart.position(), i / 60);
      if (exit) kart.retainPlanarVelocity(exit.speedRetention);
      const recovery = route.advanceDive(previous, kart.position(), kart.velocity(), i / 60);
      if (route.diveState.active) diveSteps++;
      if (route.diveState.landed && !wasLanded) landings++;
      wasLanded = route.diveState.landed;
      if (recovery) {
        kart.respawn(recovery.position, recovery.yaw);
        recoveries++;
        continue;
      }
      const contact = guardrailContact(route, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
      if (route.diveState.splashing) continue;
      const gate = laps.snapshot().nextCheckpoint;
      if (
        crossesForwardCheckpointGate(
          previous,
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
      diveSteps,
      landings,
      recoveries,
      position: kart.position().toArray(),
    }).toMatchObject({
      crossed: Array.from({ length: 3 }, () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]).flat(),
      recoveries: 0,
      landings: dive ? 3 : 0,
    });
    if (dive) expect(diveSteps).toBeGreaterThan(10);
    else expect(diveSteps).toBe(0);
    cleanup();
    world.free();
  },
  60000,
);
