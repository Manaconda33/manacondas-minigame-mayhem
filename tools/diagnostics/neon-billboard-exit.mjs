import { createServer } from 'vite';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
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
  const { createKartTuning } = await server.ssrLoadModule('/src/config/kartTuning.ts');
  const { characterById } = await server.ssrLoadModule('/src/characters/manifest.ts');
  const { guardrailContact } = await server.ssrLoadModule('/src/game/track/GuardrailSystem.ts');
  const reports = [];
  for (const lane of [-2, 0, 2])
    for (const speed of [12, 24, 30]) {
      const track = new NeonGrid(),
        gap = track.billboardGap,
        route = new RacerTrack(track);
      const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
      world.timestep = 1 / 60;
      const cleanup = createNeonGridColliders(world, track);
      const isolation = process.argv.find((a) => a.startsWith('--isolate='))?.split('=')[1];
      if (isolation) {
        const cs = [];
        world.colliders.forEach((c) => cs.push(c));
        for (let j = 0; j < cs.length; j++)
          if ((isolation === 'plaza' && j !== 3) || (isolation === 'main' && j !== 0))
            world.removeCollider(cs[j], true);
      }
      const stats = characterById('aa-09').stats,
        tuning = createKartTuning(stats);
      const fraction = 0.82,
        t = gap.curve.getTangentAt(fraction).setY(0).normalize();
      const p = gap.curve
        .getPointAt(fraction)
        .addScaledVector(new THREE.Vector3(t.z, 0, -t.x), lane);
      const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
      for (let i = 0; i < 90; i++) world.step();
      // Establish racer ownership through the real directional mouth before measuring the exit.
      const mouth = gap.mouthDistance / gap.curve.getLength();
      route.advance(
        gap.curve.getPointAt(mouth - 0.001).add(new THREE.Vector3(0, 0.4, 0)),
        gap.curve.getPointAt(mouth + 0.001).add(new THREE.Vector3(0, 0.4, 0)),
        4,
      );
      kart.body.setLinvel({ x: t.x * speed, y: 0, z: t.z * speed }, true);
      const rows = [];
      for (let i = 0; i < 180; i++) {
        const before = kart.position(),
          pr = route.project(before);
        const d = gap.fraction(gap.project(before)) * gap.curve.getLength() + 6;
        let target, tangent;
        if (pr.pathId === 'billboard-gap' && d < gap.curve.getLength()) {
          target = gap.curve.getPointAt(d / gap.curve.getLength());
          tangent = gap.curve.getTangentAt(d / gap.curve.getLength());
        } else {
          const progress =
            pr.pathId === 'billboard-gap'
              ? gap.exitProgress + (d - gap.curve.getLength()) / track.curve.getLength()
              : track.projectMain(before).progress + 6 / track.curve.getLength();
          target = track.curve.getPointAt(progress);
          tangent = track.curve.getTangentAt(progress);
        }
        target.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(), lane);
        const desired = target.sub(before).setY(0).normalize(),
          forward = kart.forward();
        const angle = Math.atan2(
          forward.z * desired.x - forward.x * desired.z,
          forward.dot(desired),
        );
        kart.update(
          {
            throttle: 1,
            steering: THREE.MathUtils.clamp(angle * 2.5, -1, 1),
            brake: false,
            drift: false,
          },
          pr.surface,
          1 / 60,
        );
        const controller = {
          speed: kart.speedMetersPerSecond(),
          velocity: kart.velocity().toArray(),
        };
        world.step();
        const after = kart.position(),
          native = { speed: kart.speedMetersPerSecond(), velocity: kart.velocity().toArray() };
        const expected = Math.hypot(controller.velocity[0], controller.velocity[2]) / 60;
        const movement = Math.hypot(after.x - before.x, after.z - before.z);
        const contacts = [];
        const bodyCollider = kart.body.collider(0);
        world.contactPairsWith(bodyCollider, (other) =>
          world.contactPair(bodyCollider, other, (m, flipped) => {
            if (m.numContacts() || m.numSolverContacts())
              contacts.push({
                handle: other.handle,
                face: flipped ? m.subshape1() : m.subshape2(),
                normal: m.normal(),
                contacts: m.numContacts(),
                solver: m.numSolverContacts(),
              });
          }),
        );
        const event = route.advance(before, after, 4);
        if (event) kart.retainPlanarVelocity(event.speedRetention);
        const boundary = guardrailContact(route, after, 1.15);
        if (boundary)
          kart.resolveStaticBarrierCollision(
            boundary.inwardNormal,
            boundary.penetration,
            0.82,
            0.22,
          );
        rows.push({
          i,
          progress: track.projectMain(after).progress,
          fraction: gap.fraction(gap.project(after)),
          path: pr.pathId,
          before: before.toArray(),
          after: after.toArray(),
          controller,
          native,
          movement,
          expected,
          ratio: movement / expected,
          event,
          contacts,
          boundary: !!boundary,
          airborne: kart.feedback().airborne,
        });
      }
      const near = rows.filter((r) => r.fraction > 0.9 && r.progress < 0.235);
      const peak = near.reduce((a, b) =>
        a.controller.speed - a.native.speed > b.controller.speed - b.native.speed ? a : b,
      );
      reports.push({
        lane,
        speed,
        summary: {
          maxNativeLoss: Math.max(...near.map((r) => r.controller.speed - r.native.speed)),
          minMovementRatio: Math.min(...near.map((r) => r.ratio)),
          maxVy: Math.max(...near.map((r) => r.native.velocity[1])),
          airSteps: near.filter((r) => r.airborne).length,
          boundarySteps: near.filter((r) => r.boundary).length,
        },
        rows: process.argv.includes('--full')
          ? rows
          : rows.filter((r) => Math.abs(r.i - peak.i) < 10 || r.ratio < 0.5),
      });
      if (!isolation) cleanup();
      world.free();
    }
  writeFileSync(
    process.argv[2] ?? '/tmp/billboard-exit.json',
    JSON.stringify(
      {
        method:
          'Production native colliders/controller; real mouth ownership, held throttle curve/line follower, no drift/items/rivals. 90 settle and 180 drive steps at 1/60. OFF isolates physics from intended retention.',
        reports,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify(
      reports.map(({ lane, speed, summary }) => ({ lane, speed, summary })),
      null,
      2,
    ),
  );
} finally {
  await server.close();
}
