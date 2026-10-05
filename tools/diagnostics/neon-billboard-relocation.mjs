import { createServer } from 'vite';
import RAPIER from '@dimforge/rapier3d-compat';
import { writeFileSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  await RAPIER.init();
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
  const reports = [];
  for (const character of ['aa-01', 'aa-09'])
    for (const speed of [12, 22, 30])
      for (const mode of ['main', 'off', 'on']) {
        const track = new NeonGrid(),
          route = new RacerTrack(track, 1, 0, mode === 'main' ? 0 : 1);
        const world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
          cleanup = createNeonGridColliders(world, track);
        const stats = characterById(character).stats,
          tuning = createKartTuning(stats);
        const p = track.curve.getPointAt(0.07),
          t = track.curve.getTangentAt(0.07);
        const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
        const driver = new AiDriver(
          route,
          { laneOffset: 0, pace: 0.6, aggression: 0.6 },
          tuning.maxSpeed,
        );
        for (let i = 0; i < 60; i++) world.step();
        kart.body.setLinvel({ x: t.x * speed, y: 0, z: t.z * speed }, true);
        let seconds = null,
          entered = false,
          exits = 0,
          contacts = 0,
          minimumHeightAbovePlaza = Infinity;
        const crossed = [];
        for (let i = 0; i < 60 * 30; i++) {
          const before = kart.position();
          kart.update(
            driver.input(before, kart.forward(), kart.speedMetersPerSecond()),
            route.project(before).surface,
            1 / 60,
          );
          world.step();
          // Isolate fixed ON/OFF outcomes. This does not establish first-lap cycle timing.
          const event = route.advance(before, kart.position(), mode === 'on' ? 0 : 1);
          if (event) {
            exits++;
            kart.retainPlanarVelocity(event.speedRetention);
          }
          const projection = route.project(kart.position());
          if (projection.pathId === 'billboard-gap') {
            entered = true;
            minimumHeightAbovePlaza = Math.min(
              minimumHeightAbovePlaza,
              kart.position().y - projection.point.y,
            );
          }
          const contact = guardrailContact(route, kart.position(), 1.15);
          if (contact) {
            contacts++;
            kart.resolveStaticBarrierCollision(
              contact.inwardNormal,
              contact.penetration,
              0.82,
              0.22,
            );
          }
          for (let gate = 0; gate < 12; gate++)
            if (
              crossesForwardCheckpointGate(
                before,
                kart.position(),
                track.lapCheckpointPosition(gate),
                track.lapCheckpointTangent(gate),
                13,
                1.5,
              )
            )
              crossed.push(gate);
          if (
            crossesForwardCheckpointGate(
              before,
              kart.position(),
              track.curve.getPointAt(0.236),
              track.curve.getTangentAt(0.236),
              6,
              1.5,
            )
          ) {
            seconds = (i + 1) / 60;
            break;
          }
        }
        reports.push({
          character,
          speed,
          mode,
          seconds,
          entered,
          exits,
          contacts,
          crossed,
          minimumHeightAbovePlaza: Number.isFinite(minimumHeightAbovePlaza)
            ? minimumHeightAbovePlaza
            : null,
        });
        cleanup();
        world.free();
      }
  const pairs = reports
    .filter((r) => r.mode === 'main')
    .map((main) => {
      const off = reports.find(
        (r) => r.character === main.character && r.speed === main.speed && r.mode === 'off',
      );
      const on = reports.find(
        (r) => r.character === main.character && r.speed === main.speed && r.mode === 'on',
      );
      if (main.seconds == null || off?.seconds == null || on?.seconds == null)
        throw new Error(`Incomplete paired run: ${main.character} at ${main.speed} m/s`);
      return {
        character: main.character,
        speed: main.speed,
        offSaving: main.seconds - off.seconds,
        onSaving: main.seconds - on.seconds,
        onOffDelta: on.seconds - off.seconds,
      };
    });
  const track = new NeonGrid();
  const result = {
    method:
      'Real production NeonGrid/RacerTrack/AiDriver/KartController/native colliders. Two profiles, three initial speeds at .07, 1/60, same settings and common downstream plane .236. Fixed ON/OFF entry states; no route adapter, items, pack, player input, hidden speed/progress writes or full-lap savings claim. Initial velocity is identical within each paired scenario.',
    geometry: {
      entry: track.billboardGap.entry.progress[0],
      rejoin: track.billboardGap.exitProgress,
      length: track.billboardGap.curve.getLength(),
      bypassedMain:
        (track.billboardGap.exitProgress - track.billboardGap.entry.progress[0]) *
        track.curve.getLength(),
      mouthDistance: track.billboardGap.mouthDistance,
    },
    pairs,
    reports,
  };
  writeFileSync(
    process.argv[2] ?? '/tmp/neon-billboard-relocation-native.json',
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await server.close();
}
