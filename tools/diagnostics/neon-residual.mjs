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
  const matrix = process.argv.includes('--matrix');
  const trace = process.argv.includes('--trace');
  const scenarios = matrix
    ? [0.80, 0.805, 0.81].flatMap(start => [-3, 0, 3].flatMap(lane => [false, true].map(boosted => ({ start, lane, boosted }))))
    : (trace ? [0.81] : [0.78, 0.80, 0.81]).map(start => ({ start, lane: 0, boosted: false }));
  for (const { start, lane, boosted } of scenarios) {
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    const cleanup = createNeonGridColliders(world, track);
    const p = track.curve.getPointAt(start), t = track.curve.getTangentAt(start).setY(0).normalize();
    p.addScaledVector(new THREE.Vector3(t.z, 0, -t.x), lane);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    for (let i = 0; i < 90; i++) world.step();
    const spawn = { position: kart.position().toArray(), yaw: Math.atan2(t.x, t.z), velocity: t.clone().multiplyScalar(boosted ? tuning.maxSpeed * 1.12 : 29.7).toArray() };
    kart.body.setLinvel({ x: spawn.velocity[0], y: 0, z: spawn.velocity[2] }, true);
    const driver = new AiDriver(track, { laneOffset: 0, pace: 0.55, aggression: 0.3 }, tuning.maxSpeed);
    let cooldown = 0;
    const support = () => {
      const position = kart.position(), forward = kart.forward(), yaw = Math.atan2(forward.x,forward.z), cos = Math.cos(yaw), sin = Math.sin(yaw);
      const wheels = [[-0.55,0.72],[0.55,0.72],[-0.55,-0.72],[0.55,-0.72]].map(([localX,localZ])=>{
        const origin = {x:position.x+localX*cos+localZ*sin,y:position.y,z:position.z-localX*sin+localZ*cos};
        const hit = world.castRayAndGetNormal(new RAPIER.Ray(origin,{x:0,y:-1,z:0}),1.35,true,undefined,undefined,undefined,kart.body);
        return {local:[localX,localZ],origin,hit:hit?{distance:hit.timeOfImpact,collider:hit.collider.handle,featureId:hit.featureId,normal:[hit.normal.x,hit.normal.y,hit.normal.z]}:null};
      });
      const centerHit = world.castRayAndGetNormal(new RAPIER.Ray(position,{x:0,y:-1,z:0}),0.85,true,undefined,undefined,undefined,kart.body);
      const grounded = wheels.filter(w=>w.hit).length>=2, centerGrounded = Math.abs(kart.velocity().y)<0.35 && centerHit!==null;
      return {wheels,center:centerHit?{distance:centerHit.timeOfImpact,collider:centerHit.collider.handle,featureId:centerHit.featureId,normal:[centerHit.normal.x,centerHit.normal.y,centerHit.normal.z]}:null,grounded,centerGrounded,driveSupported:grounded||centerGrounded};
    };
    const boostState=()=>({remaining:kart.boostRemaining,multiplier:kart.boostMultiplier,tier:kart.activeBoostTier});
    const contacts=()=>{
      const result=[],bodyCollider=kart.body.collider(0);
      world.contactPairsWith(bodyCollider,other=>world.contactPair(bodyCollider,other,(m,flipped)=>{
        result.push({other:other.handle,flipped,normal:m.normal(),subshape1:m.subshape1(),subshape2:m.subshape2(),friction:m.friction(),restitution:m.restitution(),contacts:Array.from({length:m.numContacts()},(_,i)=>({distance:m.contactDist(i),point1:m.localContactPoint1(i),point2:m.localContactPoint2(i),feature1:m.contactFid1(i),feature2:m.contactFid2(i),impulse:m.contactImpulse(i),tangentImpulse:[m.contactTangentImpulseX(i),m.contactTangentImpulseY(i)]})),solver:Array.from({length:m.numSolverContacts()},(_,i)=>({point:m.solverContactPoint(i),distance:m.solverContactDist(i)}))});
      }));return result.filter(m=>m.contacts.length>0||m.solver.length>0);
    };
    const rows = [];
    for (let i = 0; i < 240; i++) {
      const pr = track.project(kart.position());
      const input = driver.input(kart.position(), kart.forward(), kart.speedMetersPerSecond());
      if (matrix) {
        const targetProgress = (pr.progress + 7 / track.curve.getLength()) % 1;
        const target = track.curve.getPointAt(targetProgress);
        const tangent = track.curve.getTangentAt(targetProgress).setY(0).normalize();
        target.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x), lane);
        const desired = target.sub(kart.position()).setY(0).normalize(), forward = kart.forward();
        const angle = Math.atan2(forward.z * desired.x - forward.x * desired.z, forward.dot(desired));
        input.steering = THREE.MathUtils.clamp(angle * 2.5, -1, 1);
      }
      input.throttle = 1; input.brake = false; input.drift = false;
      const contactsBefore=trace?contacts():null;
      const supportBefore=trace?support():null, boostBefore=trace?boostState():null;
      const before = { rotation:trace?kart.body.rotation():undefined, position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() };
      kart.update(input, boosted && i === 0 ? 'boost' : pr.surface, 1 / 60);
      const supportController=trace?support():null;
      const controller = { rotation:trace?kart.body.rotation():undefined, position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() };
      world.step();
      const contactsNative=trace?contacts():null;
      const supportNative=trace?support():null;
      const native = { rotation:trace?kart.body.rotation():undefined, position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() };
      cooldown = Math.max(0, cooldown - 1 / 60);
      const contact = guardrailContact(track, kart.position(), 1.15);
      const boundary = contact ? { penetration: contact.penetration, normal: contact.inwardNormal.toArray(), cooldown } : null;
      if (contact) {
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration + 0.02, cooldown > 0 ? 1 : 0.82, 0.22);
        if (cooldown === 0) cooldown = 0.24;
      }
      rows.push({ contactsBefore:trace?contactsBefore:undefined,contactsNative:trace?contactsNative:undefined,mass:trace?kart.mass():undefined, supportBefore:trace?supportBefore:undefined,supportController:trace?supportController:undefined,supportNative:trace?supportNative:undefined,boostBefore:trace?boostBefore:undefined,boostAfter:trace?boostState():undefined,surface:pr.surface, i, time: i / 60, progress: pr.progress, offset: pr.lateralOffset, roadY: pr.point.y, input, before, controller, native, boundary, after: { position: kart.position().toArray(), velocity: kart.velocity().toArray(), speed: kart.speedMetersPerSecond() }, feedback: kart.feedback() });
    }
    reports.push({ start, lane, boosted, profile: 'aa-09', spawn, timestep: 1 / 60, settleSteps: 90, inputPolicy: matrix ? '7m lookahead lane follower; clamp(2.5*yawError,-1,1); held throttle/no brake/no drift; optional first-step boost surface activates existing 0.8s/1.12 pad state' : 'existing AiDriver steering, held throttle=1, brake=false, drift=false; not original player input', rivals: 0, items: 0, rows,
      summary: { minSpeed: Math.min(...rows.map(r => r.after.speed)), maxVy: Math.max(...rows.map(r => r.native.velocity[1])), airSteps: rows.filter(r => r.feedback.airborne).length, boundarySteps: rows.filter(r => r.boundary).length, maxNativeLoss: Math.max(...rows.map(r => r.controller.speed-r.native.speed)) } });
    cleanup(); world.free();
  }
  if (matrix) for (const run of reports) {
    run.inputs = run.rows.map(r => [r.i, r.input.throttle, r.input.steering, r.input.brake, r.input.drift]);
    const peak = run.rows.reduce((a,b) => a.controller.speed-a.native.speed > b.controller.speed-b.native.speed ? a : b).i;
    run.peakNativeLossStep = peak;
    run.rows = run.rows.filter(r => r.i % 10 === 0 || Math.abs(r.i-peak) <= 8 || r.boundary);
  }
  function rounded(x) {
    if (typeof x === 'number') return Math.round(x * 1e6) / 1e6;
    if (Array.isArray(x)) return x.map(rounded);
    if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k,v]) => [k,rounded(v)]));
    return x;
  }
  const out = process.argv[2] ?? '/tmp/neon-residual-reproduction.json';
  mkdirSync(out.slice(0, out.lastIndexOf('/')), { recursive: true });
  writeFileSync(out, JSON.stringify(rounded({ source: 'e441ab7 runtime bytes, d0269e0 planning baseline', reports })));
  process.stdout.write(JSON.stringify(reports.map(({ start, lane, boosted, summary }) => ({ start, lane, boosted, summary })), null, 2) + '\n');
} finally { await server.close(); }
