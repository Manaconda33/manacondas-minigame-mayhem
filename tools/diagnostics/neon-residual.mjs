// Opt-in native diagnostic. No runtime file, physics parameter or mesh is modified.
import { createServer } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { NeonGrid } = await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
  const { createNeonGridColliders } = await server.ssrLoadModule('/src/game/track/NeonGridCollision.ts');
  const { KartController } = await server.ssrLoadModule('/src/game/physics/KartController.ts');
  const { AiDriver } = await server.ssrLoadModule('/src/game/ai/AiDriver.ts');
  const { characterById } = await server.ssrLoadModule('/src/characters/manifest.ts');
  const { createKartTuning } = await server.ssrLoadModule('/src/config/kartTuning.ts');
  const { guardrailContact } = await server.ssrLoadModule('/src/game/track/GuardrailSystem.ts');
  await RAPIER.init();
  const track = new NeonGrid(), stats = characterById('aa-09').stats, tuning = createKartTuning(stats);
  const reports = [];
  for (const start of [0.78, 0.80, 0.81]) {
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    const cleanup = createNeonGridColliders(world, track);
    const p = track.curve.getPointAt(start), t = track.curve.getTangentAt(start).setY(0).normalize();
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    for (let i = 0; i < 90; i++) world.step();
    const spawn = { position: kart.position().toArray(), yaw: Math.atan2(t.x, t.z), velocity: t.clone().multiplyScalar(29.7).toArray() };
    kart.body.setLinvel({ x: spawn.velocity[0], y: 0, z: spawn.velocity[2] }, true);
    const driver = new AiDriver(track, { laneOffset: 0, pace: 0.55, aggression: 0.3 }, tuning.maxSpeed);
    let cooldown = 0;
    const rows = [];
    for (let i = 0; i < 240; i++) {
      const pr = track.project(kart.position());
      const input = driver.input(kart.position(), kart.forward(), kart.speedMetersPerSecond());
      input.throttle = 1; input.brake = false; input.drift = false;
      const before = { position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() };
      kart.update(input, pr.surface, 1 / 60);
      const controller = { position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() };
      world.step();
      const native = { position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() };
      cooldown = Math.max(0, cooldown - 1 / 60);
      const contact = guardrailContact(track, kart.position(), 1.15);
      const boundary = contact ? { penetration: contact.penetration, normal: contact.inwardNormal.toArray(), cooldown } : null;
      if (contact) {
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration + 0.02, cooldown > 0 ? 1 : 0.82, 0.22);
        if (cooldown === 0) cooldown = 0.24;
      }
      rows.push({ i, time: i / 60, progress: pr.progress, offset: pr.lateralOffset, roadY: pr.point.y, input, before, controller, native, boundary, after: { position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() }, feedback: kart.feedback() });
    }
    reports.push({ start, profile: 'aa-09', spawn, timestep: 1 / 60, settleSteps: 90, inputPolicy: 'existing AiDriver steering, held throttle=1, brake=false, drift=false; not original player input', rivals: 0, items: 0, rows,
      summary: { minSpeed: Math.min(...rows.map(r => r.after.speed)), maxVy: Math.max(...rows.map(r => r.native.velocity[1])), airSteps: rows.filter(r => r.feedback.airborne).length, boundarySteps: rows.filter(r => r.boundary).length, maxNativeLoss: Math.max(...rows.map(r => r.controller.speed-r.native.speed)) } });
    cleanup(); world.free();
  }
  const out = process.argv[2] ?? '/tmp/neon-residual-reproduction.json';
  mkdirSync(out.slice(0, out.lastIndexOf('/')), { recursive: true });
  writeFileSync(out, JSON.stringify({ source: 'e441ab7 runtime bytes, d0269e0 planning baseline', reports }, null, 2));
  process.stdout.write(JSON.stringify(reports.map(({ start, spawn, summary }) => ({ start, spawn, summary })), null, 2) + '\n');
} finally { await server.close(); }
