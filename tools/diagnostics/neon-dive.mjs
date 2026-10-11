// Real native section comparison; not full-lap balance or a human/device result.
import { createServer } from 'vite';
import RAPIER from '@dimforge/rapier3d-compat';
import { writeFileSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { NeonGrid } = await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
  const { RacerTrack } = await server.ssrLoadModule('/src/game/track/RacerTrack.ts');
  const { createNeonGridColliders } = await server.ssrLoadModule(
    '/src/game/track/NeonGridCollision.ts',
  );
  const { KartController } = await server.ssrLoadModule('/src/game/physics/KartController.ts');
  const { AiDriver } = await server.ssrLoadModule('/src/game/ai/AiDriver.ts');
  const { createKartTuning } = await server.ssrLoadModule('/src/config/kartTuning.ts');
  const { characterById } = await server.ssrLoadModule('/src/characters/manifest.ts');
  const { guardrailContact } = await server.ssrLoadModule('/src/game/track/GuardrailSystem.ts');
  const { crossesForwardCheckpointGate } = await server.ssrLoadModule(
    '/src/game/race/CheckpointGate.ts',
  );
  await RAPIER.init();
  const track = new NeonGrid(),
    runs = [];
  for (const profile of ['aa-02', 'aa-09'])
    for (const speed of [12, 20, 28])
      for (const diveRate of [0, 1]) {
        const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
        world.timestep = 1 / 60;
        const cleanup = createNeonGridColliders(world, track);
        const stats = characterById(profile).stats,
          tuning = createKartTuning(stats),
          route = new RacerTrack(track, 1, 0, 0, diveRate);
        const progress = track.lapCheckpointProgress(8) - 5 / track.curve.getLength(),
          p = track.curve.getPointAt(progress),
          t = track.curve.getTangentAt(progress).setY(0).normalize();
        const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
        for (let i = 0; i < 90; i++) world.step();
        kart.body.setLinvel({ x: t.x * speed, y: 0, z: t.z * speed }, true);
        const driver = new AiDriver(
          route,
          { laneOffset: 0, pace: 0.6, aggression: 0.6 },
          tuning.maxSpeed,
        );
        const rows = [];
        let first = null,
          last = null,
          landing = null,
          air = 0,
          contacts = 0,
          recoveries = 0;
        for (let i = 0; i < 1200; i++) {
          const before = kart.position(),
            pr = route.project(before),
            input = driver.input(before, kart.forward(), kart.speedMetersPerSecond());
          if (route.diveState.splashing) kart.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
          else kart.update(input, pr.surface, 1 / 60);
          world.step();
          route.advance(before, kart.position(), i / 60);
          const recovery = route.advanceDive(before, kart.position(), kart.velocity(), i / 60);
          if (recovery) {
            kart.respawn(recovery.position, recovery.yaw);
            recoveries++;
            continue;
          }
          const barrier = guardrailContact(route, kart.position(), 1.15);
          if (barrier) {
            contacts++;
            kart.resolveStaticBarrierCollision(
              barrier.inwardNormal,
              barrier.penetration,
              0.82,
              0.22,
            );
          }
          if (route.diveState.active && kart.feedback().airborne) air++;
          if (route.diveState.landed && !landing)
            landing = {
              time: i / 60,
              position: kart.position().toArray(),
              velocity: kart.velocity().toArray(),
              speed: kart.speedMetersPerSecond(),
              alignment: kart.forward().dot(track.waterfallDive.direction),
            };
          if (route.diveState.active || route.diveState.landed)
            rows.push({
              step: i,
              position: kart.position().toArray(),
              velocity: kart.velocity().toArray(),
              airborne: kart.feedback().airborne,
              surface: pr.surface,
              landing: route.diveState.landed,
            });
          if (
            first === null &&
            crossesForwardCheckpointGate(
              before,
              kart.position(),
              track.lapCheckpointPosition(8),
              track.lapCheckpointTangent(8),
              13,
              1.5,
            )
          )
            first = i / 60;
          if (
            first !== null &&
            crossesForwardCheckpointGate(
              before,
              kart.position(),
              track.lapCheckpointPosition(9),
              track.lapCheckpointTangent(9),
              13,
              1.5,
            )
          ) {
            last = i / 60;
            break;
          }
        }
        runs.push({
          profile,
          speed,
          diveRate,
          gate8: first,
          gate9: last,
          seconds: last === null || first === null ? null : last - first,
          landing,
          airSteps: air,
          wallContacts: contacts,
          recoveries,
          rows,
        });
        cleanup();
        world.free();
      }
  const pairs = [];
  for (let i = 0; i < runs.length; i += 2) {
    const main = runs[i],
      dive = runs[i + 1];
    pairs.push({
      profile: main.profile,
      speed: main.speed,
      main: main.seconds,
      dive: dive.seconds,
      saving: main.seconds === null || dive.seconds === null ? null : main.seconds - dive.seconds,
      landing: dive.landing,
      airSteps: dive.airSteps,
      recoveries: dive.recoveries,
    });
  }
  const report = {
    fixture:
      'real KartController + AiDriver + native colliders; same driver/start/heading/speed; gates 8 to 9; configured rate=1 for test only; no rate/balance tuning',
    pairs,
    runs,
  };
  writeFileSync(process.argv[2] ?? '/tmp/neon-dive.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(pairs, null, 2));
} finally {
  await server.close();
}
