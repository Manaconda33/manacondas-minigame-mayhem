import { createServer } from 'vite';
import RAPIER from '@dimforge/rapier3d-compat';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
  const { LapTracker } = await server.ssrLoadModule('/src/game/race/LapTracker.ts');
  const { crossesForwardCheckpointGate } = await server.ssrLoadModule(
    '/src/game/race/CheckpointGate.ts',
  );
  const { guardrailContact } = await server.ssrLoadModule('/src/game/track/GuardrailSystem.ts');
  const reports = [];
  for (const index of [0, 1, 2, 3, 4, 5, 6, 7])
    for (const attemptRate of index === 0 ? [0, 1, 2] : [0, 1]) {
      const track = new NeonGrid(),
        seed = Math.imul(index + 2, 0x9e3779b9) >>> 0,
        route = new RacerTrack(track, seed, attemptRate);
      const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
      world.timestep = 1 / 60;
      const cleanup = createNeonGridColliders(world, track);
      const stats = characterById(`aa-${String(index + 1).padStart(2, '0')}`).stats,
        tuning = createKartTuning(stats);
      const p = track.curve.getPointAt(0.001),
        t = track.curve.getTangentAt(0.001);
      const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
      const row = Math.floor(index / 2) + 1,
        side = index % 2 === 0 ? -1 : 1;
      const profile = {
        laneOffset: side * (0.7 + row * 0.35),
        pace: 0.28 + index * 0.09,
        aggression: 0.2 + (index % 4) * 0.2,
      };
      const driver = new AiDriver(route, profile, tuning.maxSpeed),
        laps = new LapTracker();
      const gates = [],
        inputs = [],
        events = [];
      let gate4 = null,
        gate5 = null,
        tunnelSteps = 0,
        boundarySteps = 0,
        cooldown = 0,
        recoveryNeeded = false,
        lastPath = false;
      for (let i = 0; i < 60 * 180; i++) {
        const before = kart.position(),
          projection = route.project(before);
        const input = driver.input(before, kart.forward(), kart.speedMetersPerSecond());
        if (attemptRate === 2 && projection.pathId === 'service-tunnel') {
          input.steering = 1;
          input.throttle = 1;
          input.brake = false;
          input.drift = false;
        }
        inputs.push([i, input.throttle, input.steering, input.brake, input.drift]);
        kart.update(input, projection.surface, 1 / 60);
        world.step();
        route.advance(before, kart.position());
        cooldown = Math.max(0, cooldown - 1 / 60);
        const contact = guardrailContact(route, kart.position(), 1.15);
        if (contact) {
          boundarySteps++;
          kart.resolveStaticBarrierCollision(
            contact.inwardNormal,
            contact.penetration + 0.02,
            cooldown > 0 ? 1 : 0.82,
            0.22,
          );
          if (cooldown === 0) cooldown = 0.24;
        }
        const after = kart.position(),
          now = route.project(after),
          path = now.pathId === 'service-tunnel';
        if (path) tunnelSteps++;
        if (path !== lastPath)
          events.push({
            step: i,
            path: now.pathId ?? 'main',
            position: after.toArray(),
            speed: kart.speedMetersPerSecond(),
          });
        lastPath = path;
        if (!kart.isFinite() || after.y < now.point.y - 4 || now.lateralDistance > 20)
          recoveryNeeded = true;
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
          gates.push({ gate, time: i / 60 });
          if (gate === 4) gate4 = i / 60;
          if (gate === 5) gate5 = i / 60;
          if (gate === 0) break;
        }
      }
      reports.push({
        index,
        character: `aa-${String(index + 1).padStart(2, '0')}`,
        seed,
        profile,
        attemptRate,
        wallScrub: attemptRate === 2,
        gates,
        gate4To5Seconds: gate4 !== null && gate5 !== null ? gate5 - gate4 : null,
        lapSeconds: gates.at(-1)?.gate === 0 ? gates.at(-1).time : null,
        tunnelSteps,
        boundarySteps,
        recoveryNeeded,
        events,
        inputCount: inputs.length,
        inputSha256: createHash('sha256').update(JSON.stringify(inputs)).digest('hex'),
        sampledInputs: inputs.filter((_, i) => i % 30 === 0),
      });
      cleanup();
      world.free();
    }
  const pairs = Array.from({ length: 8 }, (_, index) => {
    const main = reports.find((r) => r.index === index && r.attemptRate === 0),
      tunnel = reports.find((r) => r.index === index && r.attemptRate === 1);
    return {
      index,
      character: main.character,
      mainLap: main.lapSeconds,
      tunnelLap: tunnel.lapSeconds,
      mainGate4To5: main.gate4To5Seconds,
      tunnelGate4To5: tunnel.gate4To5Seconds,
      savings:
        main.lapSeconds !== null && tunnel.lapSeconds !== null
          ? main.lapSeconds - tunnel.lapSeconds
          : null,
      tunnelSteps: tunnel.tunnelSteps,
      recoveryNeeded: main.recoveryNeeded || tunnel.recoveryNeeded,
    };
  });
  const track = new NeonGrid();
  const out = {
    source: 'current working geometry; archive exact source checkpoint with this evidence',
    method:
      'real Rapier, fixed 1/60, same per-profile character/settings/spawn/seed; only seeded eligible attempt rate 0 vs 1; held AI controller input; no rivals or items; physical gates, no recovery; inputs sampled every30 steps with complete-input SHA256; additional profile0 wall-scrub run holds throttle1 and steering1 once physically inside; not owner footage or device performance',
    mainLength: track.curve.getLength(),
    tunnelLength: track.serviceTunnel.curve.getLength(),
    pairs,
    wallScrub: reports.find((r) => r.wallScrub),
    reports,
  };
  writeFileSync(process.argv[2] ?? '/tmp/neon-tunnel-measurements.json', JSON.stringify(out));
  console.log(
    JSON.stringify({ mainLength: out.mainLength, tunnelLength: out.tunnelLength, pairs }, null, 2),
  );
} finally {
  await server.close();
}
