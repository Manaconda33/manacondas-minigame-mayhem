import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { KartTimeTrial } from '../src/game/KartTimeTrial';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import { KartController } from '../src/game/physics/KartController';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { PrismaticSystem } from '../src/game/items/PrismaticSystem';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { ItemSystem, ITEM_ROULETTE_SECONDS } from '../src/game/items/ItemSystem';
import { FrostFixture } from '../src/game/items/FrostFixture';
import { FrostVisual } from '../src/game/items/FrostVisual';
import { ArcBladeCounterFixture, type ArcCounterEvidence } from '../src/game/items/ArcBladeCounterFixture';
import { ArcHammerCounterFixture } from '../src/game/items/ArcHammerCounterFixture';
import { PrismaticCounterFixture } from '../src/game/items/PrismaticCounterFixture';
import { PrismaticVisual } from '../src/game/items/PrismaticVisual';
import { PrismaticMusic } from '../src/audio/PrismaticMusic';
import { SpinoutCameraAnchor } from '../src/game/camera/SpinoutCameraAnchor';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { createTrackScene } from '../src/game/track/createTrackScene';
import { SlickGroundSurface } from '../src/game/items/SlickGroundSurface';
import { ARC_HAMMER_CONFIG, ARC_HAMMER_PROJECTILE_CONFIG } from '../src/game/items/ArcHammers';
import type { RacerProgress } from '../src/game/race/RaceDirector';
import { requireValue } from './requireValue';

const rigs: ReturnType<typeof hammerRuntimeRig>[] = [];

beforeAll(async () => {
  await RAPIER.init();
});

afterEach(() => {
  rigs.splice(0).forEach((rig) => rig.dispose());
  vi.restoreAllMocks();
});

function hammerRuntimeRig(index = 24, elevation = 0.72) {
  const track = new CircuitAlpha();
  const trackScene = createTrackScene(track);
  const slickGround = new SlickGroundSurface(trackScene);
  let surfaceQueries = 0;
  const surfaceQuery = (position: THREE.Vector3) => {
    surfaceQueries += 1;
    return slickGround.at(position);
  };
  const point = track.samples[index]?.clone().setY(elevation) ?? new THREE.Vector3();
  const forward = track.tangents[index]?.clone().setY(0).normalize() ?? new THREE.Vector3(0, 0, 1);
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
  world.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.1, 500).setTranslation(0, -0.12, 0));
  const kart = new KartController(
    world,
    createKartTuning(sliceOneDriver),
    sliceOneDriver,
    point,
    Math.atan2(forward.x, forward.z),
  );
  const rival = new KartController(
    world,
    createKartTuning(sliceOneDriver),
    sliceOneDriver,
    point.clone().addScaledVector(forward, -50),
    0,
  );
  kart.respawn(point, Math.atan2(forward.x, forward.z));
  const progress = (id: string): RacerProgress => ({
    id,
    lap: 1,
    trackProgress: index / track.sampleCount,
    finished: false,
    finishTime: null,
    finishPlace: null,
  });
  const playerProgress = progress('player');
  const rivalProgress = progress('rival');
  const racerEffects = new RacerEffects();
  const prismatic = new PrismaticSystem(racerEffects);
  let game: ReturnType<typeof buildGame>;
  const projectiles = new ProjectileSystem(
    track,
    undefined,
    (event) => game.arcFixture.observe(event, game.arcEvidence()),
    surfaceQuery,
  );
  const hazards = new HazardSystem(track, projectiles.capacity, surfaceQuery);
  const apex = new ApexMissileSystem(track, projectiles);
  const fields = {
    track,
    kart,
    opponents: [{ id: 'rival', controller: rival, progress: rivalProgress, driverHitSeconds: 0 }],
    playerProgress,
    racerEffects,
    prismatic,
    projectiles,
    hazards,
    apex,
    itemSystem: new ItemSystem(),
    itemPhysicsCapacity: projectiles.capacity,
    shockwave: new ShockwaveSystem(),
    prismaticVisual: new PrismaticVisual(),
    frostVisual: new FrostVisual(),
    frostFixture: new FrostFixture(null),
    arcFixture: new ArcBladeCounterFixture(null),
    arcHammerFixture: new ArcHammerCounterFixture(null),
    prismaticMusic: new PrismaticMusic(),
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
    seekerWarningAudio: { unlock: vi.fn() },
    apexWarningAudio: { unlock: vi.fn() },
    itemTargetingProgress: () => [playerProgress, rivalProgress],
    elapsed: 0,
    paused: false,
    raceDirector: { phase: () => 'racing' },
    pressed: new Set<string>(),
    touchPressed: new Set<string>(),
    spinoutCameraAnchor: new SpinoutCameraAnchor(),
    lastRecoveryIndex: index,
    itemUseMessage: null as string | null,
    itemUseMessageSeconds: 0,
  };

  function buildGame() {
    return Object.assign(Object.create(KartTimeTrial.prototype) as object, fields) as unknown as typeof fields & {
      updateProjectiles(dt: number): void;
      requestPlayerItemUse(): void;
      respawn(): void;
      projectileTargets(): ProjectileTarget[];
      arcEvidence(): ArcCounterEvidence;
    };
  }
  game = buildGame();

  return {
    ...fields,
    game,
    world,
    rival,
    forward,
    surfaceQueryCount: () => surfaceQueries,
    dispose: () => {
      game.arcFixture.cancel(projectiles);
      game.arcHammerFixture.cancel(projectiles);
      game.prismaticFixture.dispose();
      game.frostFixture.dispose();
      game.frostVisual.dispose();
      prismatic.dispose();
      racerEffects.dispose();
      fields.prismaticVisual.dispose();
      fields.prismaticMusic.dispose();
      apex.dispose();
      hazards.dispose();
      fields.shockwave.dispose();
      projectiles.dispose();
      slickGround.dispose();
      trackScene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      world.free();
    },
  };
}

function rig(index = 24, elevation = 0.72) {
  const value = hammerRuntimeRig(index, elevation);
  rigs.push(value);
  return value;
}

function incomingHammer(r: ReturnType<typeof rig>) {
  return requireValue(
    r.projectiles.spawn({
      itemId: 'arc-hammers',
      ownerId: 'rival',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: {
        position: r.kart.position().addScaledVector(
          r.forward,
          -(ARC_HAMMER_CONFIG.spawnOffsetMeters + ARC_HAMMER_CONFIG.radiusMeters),
        ),
        forward: r.forward,
        velocity: new THREE.Vector3(),
      },
    }),
  );
}

describe('Kinetic Arc Hammers production runtime integration', () => {
  it('uses production ITEM input, inventory/capacity, and the actual Circuit Alpha supporting-surface query', () => {
    const r = rig();
    expect(r.itemSystem.acquire('player', 'arc-hammers')).toBe(true);
    r.itemSystem.advance(ITEM_ROULETTE_SECONDS);
    r.game.pressed.add('KeyS');
    r.game.requestPlayerItemUse();

    const shot = requireValue(r.projectiles.snapshots()[0]);
    expect(shot.itemId).toBe('arc-hammers');
    expect(shot.velocity.dot(r.forward)).toBeLessThan(-30);
    expect(shot.velocity.y).toBeCloseTo(ARC_HAMMER_CONFIG.upwardSpeedMetersPerSecond);
    expect(r.itemSystem.heldItem('player')).toEqual({ itemId: 'arc-hammers', remainingCharges: 4 });
    expect(r.itemPhysicsCapacity.count()).toBe(1);

    r.game.updateProjectiles(1 / 60);
    expect(r.surfaceQueryCount()).toBeGreaterThan(0);
    expect(r.itemSystem.heldItem('rival')).toBeNull();
  });

  it.each([24, 90, 192])(
    'applies the governed spin, hit state, camera anchor, and race-authority preservation at Circuit section %s',
    (index) => {
      const r = rig(index, 0.72);
      r.kart.body.setLinvel({ x: r.forward.x * 10, y: 0, z: r.forward.z * 10 }, true);
      const beforeVelocity = r.kart.velocity();
      const beforePosition = r.kart.position();
      const beforeHeading = r.kart.forward();
      const beforeProgress = JSON.stringify(r.playerProgress);

      incomingHammer(r);
      r.game.updateProjectiles(1 / 60);

      const spin = requireValue(r.racerEffects.spinoutState('player'));
      expect(spin).toMatchObject({
        id: 'arc-hammers-spinout',
        durationSeconds: ARC_HAMMER_CONFIG.spinoutSeconds,
        remainingSeconds: ARC_HAMMER_CONFIG.spinoutSeconds,
        preserveMomentum: false,
      });
      expect(r.game.driverHitSeconds).toBe(ARC_HAMMER_CONFIG.spinoutSeconds);
      expect(r.game.spinoutCameraAnchor.resolve(beforeHeading.clone().negate(), true)).toEqual(
        beforeVelocity.clone().setY(0).normalize(),
      );
      expect(r.kart.position()).toEqual(beforePosition);
      expect(r.kart.forward()).toEqual(beforeHeading);
      expect(r.kart.velocity()).toEqual(beforeVelocity);
      expect(JSON.stringify(r.playerProgress)).toBe(beforeProgress);
      expect(r.projectiles.activeCount()).toBe(0);
    },
  );

  it('preserves a fired Hammer through ordinary player recovery as governed', () => {
    const r = rig();
    expect(r.itemSystem.acquire('player', 'arc-hammers')).toBe(true);
    r.itemSystem.advance(ITEM_ROULETTE_SECONDS);
    r.game.requestPlayerItemUse();
    const id = requireValue(r.projectiles.snapshots()[0]).id;
    r.game.respawn();
    expect(r.projectiles.snapshots().some((projectile) => projectile.id === id)).toBe(true);
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(4);
  });
});
