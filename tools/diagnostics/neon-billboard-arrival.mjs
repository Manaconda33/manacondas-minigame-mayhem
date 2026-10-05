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
  const { AiDriver } = await server.ssrLoadModule('/src/game/ai/AiDriver.ts');
  const { KartController } = await server.ssrLoadModule('/src/game/physics/KartController.ts');
  const { createKartTuning } = await server.ssrLoadModule('/src/config/kartTuning.ts');
  const { characterById } = await server.ssrLoadModule('/src/characters/manifest.ts');
  const { billboardStateAt } = await server.ssrLoadModule('/src/game/track/NeonGridBillboard.ts');
  const { guardrailContact } = await server.ssrLoadModule('/src/game/track/GuardrailSystem.ts');
  const reports = [];
  for (const index of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const track = new NeonGrid(),
      route = new RacerTrack(track, index + 1, 0, 1);
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
      cleanup = createNeonGridColliders(world, track);
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
    let report = { index, entered: false };
    for (let i = 0; i < 60 * 40; i++) {
      const before = kart.position(),
        projection = route.project(before);
      kart.update(
        driver.input(before, kart.forward(), kart.speedMetersPerSecond()),
        projection.surface,
        1 / 60,
      );
      world.step();
      route.advance(before, kart.position(), i / 60);
      const contact = guardrailContact(route, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
      if (route.project(kart.position()).pathId === 'billboard-gap') {
        report = {
          index,
          entered: true,
          seconds: i / 60,
          state: billboardStateAt(i / 60),
          speed: kart.speedMetersPerSecond(),
        };
        break;
      }
    }
    reports.push(report);
    cleanup();
    world.free();
  }
  const result = {
    method:
      'Eight independent real Rapier reference approaches at 1/60; same center lane/pace0.6/aggression0.6/grid-progress0.001; profile aa01..08; billboard choice1/tunnel0; no pack, items, player input or wall clock; first physical mouth entry only, not balance or manual acceptance.',
    reports,
  };
  writeFileSync(
    process.argv[2] ?? '/tmp/neon-billboard-arrival.json',
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
} finally {
  await server.close();
}
