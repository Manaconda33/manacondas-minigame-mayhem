import { vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { KartTimeTrial } from '../src/game/KartTimeTrial';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { FrostFixture } from '../src/game/items/FrostFixture';
import { FrostVisual } from '../src/game/items/FrostVisual';
import { PrismaticSystem } from '../src/game/items/PrismaticSystem';
import { PrismaticCounterFixture } from '../src/game/items/PrismaticCounterFixture';
import { PrismaticVisual } from '../src/game/items/PrismaticVisual';
import { PrismaticMusic } from '../src/audio/PrismaticMusic';
import { ArcBladeCounterFixture } from '../src/game/items/ArcBladeCounterFixture';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { SpinoutCameraAnchor } from '../src/game/camera/SpinoutCameraAnchor';
import type { RacerProgress } from '../src/game/race/RaceDirector';
import type { ArcCounterEvidence } from '../src/game/items/ArcBladeCounterFixture';

/** Production runtime methods and real Rapier controllers; WebGL/asset startup omitted. */
export function arcRuntimeRig(index = 24, elevation = 0.35) {
  const track = new CircuitAlpha();
  const point = track.samples[index]?.clone().setY(elevation) ?? new Vector3();
  const forward = track.tangents[index]?.clone().setY(0).normalize() ?? new Vector3(0, 0, 1);
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
  const projectiles = new ProjectileSystem(track, undefined, (e) => {
    game.arcFixture.observe(e, game.arcEvidence());
  });
  const hazards = new HazardSystem(track, projectiles.capacity);
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
  const game = Object.assign(
    Object.create(KartTimeTrial.prototype) as object,
    fields,
  ) as unknown as typeof fields & {
    updateProjectiles(dt: number): void;
    requestPlayerItemUse(): void;
    respawn(): void;
    projectileTargets(): ProjectileTarget[];
    arcEvidence(): ArcCounterEvidence;
    setTouchControl(control: string, pressed: boolean): void;
  };
  return {
    ...fields,
    world,
    game,
    rival,
    forward,
    dispose: () => {
      game.arcFixture.cancel(projectiles);
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
      world.free();
    },
  };
}
