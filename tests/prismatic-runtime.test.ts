import { requireValue } from './requireValue';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3, PerspectiveCamera, Frustum, Matrix4 } from 'three';
import { KartTimeTrial } from '../src/game/KartTimeTrial';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { FrostFixture } from '../src/game/items/FrostFixture';
import { FrostVisual } from '../src/game/items/FrostVisual';
import { FROST_ORB_CONFIG } from '../src/game/items/FrostOrbs';
import { PrismaticSystem, PRISMATIC } from '../src/game/items/PrismaticSystem';
import { PrismaticCounterFixture } from '../src/game/items/PrismaticCounterFixture';
import { PrismaticVisual } from '../src/game/items/PrismaticVisual';
import { PrismaticMusic } from '../src/audio/PrismaticMusic';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { SpinoutCameraAnchor } from '../src/game/camera/SpinoutCameraAnchor';
import { ChaseCamera } from '../src/game/camera/ChaseCamera';
import type { RacerProgress } from '../src/game/race/RaceDirector';

/** Invoke actual runtime methods with real physics/effect owners, omitting WebGL/asset startup. */
function rig() {
  const track = new CircuitAlpha();
  const position = track.curve.getPointAt(0.1);
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  const makeKart = () =>
    new KartController(world, createKartTuning(sliceOneDriver), sliceOneDriver, position, 0);
  const kart = makeKart();
  const rival = makeKart();
  const progress = (id: string): RacerProgress => ({
    id,
    lap: 1,
    trackProgress: 0.1,
    finished: false,
    finishTime: null,
    finishPlace: null,
  });
  const playerProgress = progress('player');
  const rivalProgress = progress('rival');
  const racerEffects = new RacerEffects();
  const prismatic = new PrismaticSystem(racerEffects);
  const itemSystem = new ItemSystem();
  const projectiles = new ProjectileSystem(track);
  const hazards = new HazardSystem(track, projectiles.capacity);
  const apex = new ApexMissileSystem(track, projectiles);
  const shockwave = new ShockwaveSystem();
  const prismaticVisual = new PrismaticVisual();
  const prismaticMusic = new PrismaticMusic();
  const fields = {
    track,
    kart,
    opponents: [{ id: 'rival', controller: rival, progress: rivalProgress, driverHitSeconds: 0 }],
    playerProgress,
    racerEffects,
    prismatic,
    itemSystem,
    projectiles,
    hazards,
    apex,
    shockwave,
    prismaticVisual,
    frostVisual: new FrostVisual(),
    frostFixture: new FrostFixture(null),
    prismaticMusic,
    prismaticFixture: new PrismaticCounterFixture(null),
    prismaticContactVictims: [],
    prismaticFixtureContact: null as string | null,
    contactCooldowns: new Map(),
    driverHitSeconds: 0,
    shockwaveCounterFixture: { update: vi.fn() },
    incomingApexFixture: { update: vi.fn() },
    incomingBlastFixture: { update: vi.fn() },
    incomingSlickFixture: { update: vi.fn() },
    aiHazardFixture: { update: vi.fn() },
    itemTargetingProgress: () => [playerProgress, rivalProgress],
    elapsed: 0,
    paused: false,
    raceDirector: { phase: () => 'racing' },
    pressed: new Set(),
    touchPressed: new Set(),
    spinoutCameraAnchor: new SpinoutCameraAnchor(),
    lastRecoveryIndex: 0,
  };
  const game = Object.assign(
    Object.create(KartTimeTrial.prototype) as object,
    fields,
  ) as unknown as typeof fields & {
    resolveKartContacts(dt: number): void;
    updateProjectiles(dt: number): void;
    requestPlayerItemUse(): void;
    respawn(): void;
  };
  return {
    ...fields,
    world,
    game,
    rival,
    dispose: () => {
      game.prismaticFixture.dispose();
      game.frostFixture.dispose();
      game.frostVisual.dispose();
      prismatic.dispose();
      racerEffects.dispose();
      prismaticVisual.dispose();
      prismaticMusic.dispose();
      apex.dispose();
      hazards.dispose();
      shockwave.dispose();
      projectiles.dispose();
      world.free();
    },
  };
}

describe('Prismatic real runtime wiring', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('rejects paused/countdown/finished input, consumes a valid use, and clears on recovery', () => {
    const r = rig();
    r.itemSystem.acquire('player', PRISMATIC.id);
    r.itemSystem.advance(1);
    r.game.paused = true;
    r.game.requestPlayerItemUse();
    expect(r.prismatic.remaining('player')).toBe(0);
    r.game.paused = false;
    r.game.raceDirector.phase = () => 'countdown';
    r.game.requestPlayerItemUse();
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(1);
    r.game.raceDirector.phase = () => 'racing';
    r.playerProgress.finished = true;
    r.game.requestPlayerItemUse();
    expect(r.prismatic.remaining('player')).toBe(0);
    r.playerProgress.finished = false;
    r.game.requestPlayerItemUse();
    expect(r.prismatic.remaining('player')).toBe(6);
    expect(r.itemSystem.canCollect('player')).toBe(true);
    r.game.respawn();
    expect(r.racerEffects.isItemImmune('player')).toBe(false);
    expect(r.prismaticVisual.group.visible).toBe(false);
    r.dispose();
  });

  it('routes hostile contact into the real spinout/camera contract without changing progress or snapping transforms', () => {
    const r = rig();
    r.prismatic.activate('player', () => true);
    r.rival.respawn(r.kart.position().add(new Vector3(2, 0, 0)), 0);
    const position = r.rival.position();
    const progress = JSON.stringify([r.playerProgress, r.opponents[0]?.progress]);
    r.game.resolveKartContacts(1 / 60);
    r.racerEffects.advance(1 / 60, false, false);
    r.game.updateProjectiles(1 / 60);
    expect(r.racerEffects.spinoutState('rival')).toMatchObject({
      durationSeconds: 0.85,
      remainingSeconds: 0.85,
      yawRateRadiansPerSecond: (Math.PI * 2) / 0.85,
    });
    expect(r.rival.position().toArray()).toEqual(position.toArray());
    expect(JSON.stringify([r.playerProgress, r.opponents[0]?.progress])).toBe(progress);
    r.racerEffects.advance(0.4, false, false);
    r.game.resolveKartContacts(1 / 60);
    r.game.updateProjectiles(1 / 60);
    expect(r.racerEffects.spinoutRemainingSeconds('rival')).toBeCloseTo(0.45);
    r.prismatic.clear('player');
    r.prismatic.activate('rival', () => true);
    r.game.resolveKartContacts(1 / 60);
    r.game.updateProjectiles(1 / 60);
    expect(r.racerEffects.spinoutState('player')?.durationSeconds).toBe(0.85);
    r.dispose();
  });

  it.each([false, true])(
    'verifies the marked racer fixture through real runtime contacts, expired=%s',
    (expired) => {
      const r = rig();
      r.game.prismaticFixture = new PrismaticCounterFixture({ mode: 'racer', expired });
      r.prismatic.activate('player', () => true);
      r.game.updateProjectiles(1 / 60);
      if (expired) {
        r.racerEffects.advanceProtection(6);
        r.game.updateProjectiles(1 / 60);
      }
      expect(r.game.prismaticFixture.controlledRacer()).toBe('rival');
      r.game.prismaticFixture.updateMarker(r.rival.position());
      expect(r.game.prismaticFixture.group.visible).toBe(true);
      expect(r.game.prismaticFixture.group.position.y).toBeCloseTo(r.rival.position().y + 4.5);
      // Advance the spawned participant along its actual incoming velocity to the contact boundary.
      r.rival.body.setTranslation(
        r.rival.position().addScaledVector(r.rival.velocity(), 0.3),
        true,
      );
      r.game.resolveKartContacts(1 / 60);
      r.game.updateProjectiles(1 / 60);
      expect(r.game.prismaticFixture.badge()).toContain('PASS · VERIFIED CONTACT');
      expect(r.game.prismaticFixture.group.visible).toBe(false);
      expect(r.racerEffects.spinoutState('rival') !== null).toBe(!expired);
      r.dispose();
    },
  );

  it('does not report racer PASS when the planned spin is rejected before application', () => {
    const r = rig();
    r.game.prismaticFixture = new PrismaticCounterFixture({ mode: 'racer', expired: false });
    r.prismatic.activate('player', () => true);
    r.game.updateProjectiles(1 / 60);
    r.rival.respawn(r.kart.position().add(new Vector3(2, 0, 0)), 0);
    r.game.resolveKartContacts(1 / 60);
    expect(r.game.prismaticFixture.badge()).not.toContain('PASS');
    r.racerEffects.setItemImmune('rival', true);
    r.game.updateProjectiles(1 / 60);
    expect(r.game.prismaticFixture.badge()).toContain('FAIL');
    expect(r.racerEffects.spinoutState('rival')).toBeNull();
    r.dispose();
  });

  it('applies simultaneous Frost hits through runtime without spin, refreshes hazard snapshots, and clears recovery', () => {
    const r = rig();
    const forward = r.track.project(r.kart.position()).tangent.clone().setY(0).normalize();
    r.rival.respawn(r.kart.position().addScaledVector(forward, 20), 0);
    r.kart.body.setLinvel({ x: 12, y: 3, z: -8 }, true);
    const before = r.kart.velocity();
    const position = r.kart.position();
    const heading = r.kart.forward();
    const progress = JSON.stringify(r.playerProgress);
    for (let i = 0; i < 2; i++)
      r.projectiles.spawn({
        itemId: 'frost-orbs',
        ownerId: 'attacker',
        direction: 'forward',
        config: FROST_ORB_CONFIG,
        launch: {
          position: position.clone().addScaledVector(forward, -2.1),
          forward,
          velocity: new Vector3(),
        },
      });
    const hazardUpdate = vi.spyOn(r.hazards, 'update');
    r.game.updateProjectiles(1 / 60);
    expect(r.kart.velocity().x).toBeCloseTo(before.x * 0.55 ** 2);
    expect(r.kart.velocity().z).toBeCloseTo(before.z * 0.55 ** 2);
    expect(r.kart.velocity().y).toBe(before.y);
    expect(r.racerEffects.frostState('player')).toEqual({ stacks: 2, remainingSeconds: 1.2 });
    expect(r.racerEffects.driveModifiers('player').steeringMultiplier).toBeCloseTo(0.64);
    expect(r.racerEffects.spinoutState('player')).toBeNull();
    expect(r.game.driverHitSeconds).toBe(0);
    expect(r.kart.position()).toEqual(position);
    expect(r.kart.forward()).toEqual(heading);
    expect(JSON.stringify(r.playerProgress)).toBe(progress);
    expect(hazardUpdate.mock.calls[0]?.[1][0]?.velocity?.x).toBeCloseTo(before.x * 0.55 ** 2);
    r.game.respawn();
    expect(r.racerEffects.frostState('player')).toBeNull();
    r.dispose();
  });

  it('Frost input obeys runtime pause/countdown/finish gates and successful-use cadence', () => {
    const r = rig();
    r.itemSystem.acquire('player', 'frost-orbs');
    r.itemSystem.advance(1);
    r.game.paused = true;
    r.game.requestPlayerItemUse();
    r.game.paused = false;
    r.game.raceDirector.phase = () => 'countdown';
    r.game.requestPlayerItemUse();
    r.game.raceDirector.phase = () => 'racing';
    r.playerProgress.finished = true;
    r.game.requestPlayerItemUse();
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(3);
    r.playerProgress.finished = false;
    r.game.requestPlayerItemUse();
    r.game.requestPlayerItemUse();
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(2);
    expect(r.projectiles.snapshots()).toHaveLength(1);
    r.dispose();
  });

  it.each(['hit', 'refresh', 'protected', 'expired', 'shockwave'] as const)(
    'Frost %s fixture reaches its measured production encounter',
    (test) => {
      const r = rig();
      r.game.frostFixture = new FrostFixture(test);
      const item =
        test === 'hit' || test === 'refresh'
          ? 'frost-orbs'
          : test === 'shockwave'
            ? 'shockwave'
            : PRISMATIC.id;
      r.itemSystem.acquire('player', item);
      r.itemSystem.advance(1);
      r.world.timestep = 1 / 60;
      r.world.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.1, 500).setTranslation(0, -0.12, 0));
      // Find the same road conditions that the live fixture requires, without changing the track.
      let point: Vector3 | null = null;
      let tangent = new Vector3();
      for (let i = 0; i < r.track.sampleCount; i++) {
        const p = requireValue(r.track.samples[i]).clone();
        const f = requireValue(r.track.tangents[i]).clone().setY(0).normalize();
        if (r.track.project(p).surface !== 'asphalt') continue;
        let clear = true;
        for (let d = 5; d <= 45; d += 5) {
          const q = r.track.project(p.clone().addScaledVector(f, d));
          if (Math.abs(q.lateralOffset) > 2 || q.surface !== 'asphalt') clear = false;
        }
        if (clear) {
          point = p;
          tangent = f;
          break;
        }
      }
      expect(point).not.toBeNull();
      r.kart.respawn(requireValue(point), Math.atan2(tangent.x, tangent.z));
      r.rival.respawn(requireValue(point).clone().addScaledVector(tangent, 70), 0);
      r.game.updateProjectiles(1 / 60);
      if (test === 'protected' || test === 'expired') {
        r.game.requestPlayerItemUse();
        if (test === 'expired') {
          r.game.updateProjectiles(1 / 60);
          r.racerEffects.advanceProtection(6);
        }
        r.game.updateProjectiles(1 / 60);
      }
      if (test === 'hit' || test === 'refresh' || test === 'shockwave') {
        for (let i = 0; i < 180; i++) r.game.updateProjectiles(1 / 60);
      }
      if (test === 'hit' || test === 'refresh') r.game.requestPlayerItemUse();
      for (let i = 0; i < 180 && !r.game.frostFixture.badge()?.includes('PASS'); i++) {
        const dt = 1 / 60;
        r.racerEffects.advanceFrost(dt);
        r.itemSystem.advance(dt);
        for (const [id, kart] of [
          ['player', r.kart],
          ['rival', r.rival],
        ] as const)
          kart.update(
            {
              throttle: 0,
              steering: 0,
              drift: false,
              brake: false,
              effectSteeringMultiplier: r.racerEffects.driveModifiers(id).steeringMultiplier,
            },
            'asphalt',
            dt,
          );
        r.world.step();
        r.game.resolveKartContacts(dt);
        if (test === 'refresh' && i === 34) r.game.requestPlayerItemUse();
        if (test === 'shockwave') {
          const p = r.projectiles.snapshots()[0];
          if (p && p.position.clone().sub(r.kart.position()).setY(0).length() <= 5)
            r.game.requestPlayerItemUse();
        }
        r.game.updateProjectiles(dt);
      }
      expect(r.game.frostFixture.badge()).toContain('PASS');
      expect(r.racerEffects.spinoutState('player')).toBeNull();
      expect(r.racerEffects.spinoutState('rival')).toBeNull();
      r.dispose();
    },
  );

  it('renders an above-ground following shell within both production cameras and mobile/desktop aspects', () => {
    for (const aspect of [9 / 16, 16 / 9])
      for (const rear of [false, true]) {
        const visual = new PrismaticVisual();
        const position = new Vector3(10, 0.34, 5);
        visual.update(6, position, 0.2);
        visual.group.updateMatrixWorld(true);
        const camera = new PerspectiveCamera(62, aspect, 0.1, 900);
        const chase = new ChaseCamera(camera);
        for (let i = 0; i < 120; i++) chase.update(position, new Vector3(0, 0, 1), rear, 1 / 60);
        camera.updateMatrixWorld(true);
        const frustum = new Frustum().setFromProjectionMatrix(
          new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
        );
        const vertices = visual.shell.geometry.getAttribute('position');
        let visible = 0;
        for (let i = 0; i < vertices.count; i++) {
          const v = new Vector3()
            .fromBufferAttribute(vertices, i)
            .applyMatrix4(visual.shell.matrixWorld);
          if (v.y > 0.08 && frustum.containsPoint(v)) visible++;
        }
        expect(visible).toBeGreaterThan(12);
        visual.dispose();
      }
  });
});
