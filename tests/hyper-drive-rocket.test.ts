import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { HyperDriveRocketAudio } from '../src/audio/HyperDriveRocketAudio';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import {
  HYPER_DRIVE_ROCKET_CONFIG,
  HyperDriveRocketSystem,
} from '../src/game/items/HyperDriveRocket';
import { HyperDriveRocketVisual } from '../src/game/items/HyperDriveRocketVisual';
import { RocketAutopilot } from '../src/game/items/RocketAutopilot';
import { ItemSystem, ITEM_ROULETTE_SECONDS } from '../src/game/items/ItemSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { FROST_ORB_CONFIG } from '../src/game/items/FrostOrbs';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import { LapTracker } from '../src/game/race/LapTracker';
import { rankRacers } from '../src/game/race/RaceDirector';
import { shockwavePushDelta } from '../src/game/items/ShockwaveSystem';
import type { RacerProgress } from '../src/game/race/RaceDirector';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { effectiveItemWeights } from '../src/game/items/ItemSelector';
import { arcRuntimeRig } from './arc-runtime-rig';

const rigs: ReturnType<typeof arcRuntimeRig>[] = [];

beforeAll(async () => {
  await RAPIER.init();
});

afterEach(() => {
  rigs.splice(0).forEach((rig) => {
    rig.dispose();
  });
  vi.restoreAllMocks();
});

function progress(id: string, finished = false): RacerProgress {
  return {
    id,
    lap: 1,
    trackProgress: 0.25,
    finished,
    finishTime: null,
    finishPlace: null,
  };
}

function activate(
  items: ItemSystem,
  effects: RacerEffects,
  rocket: HyperDriveRocketSystem,
  racers: readonly RacerProgress[] = [progress('player')],
): void {
  expect(items.acquire('player', 'hyper-drive-rocket')).toBe(true);
  items.advance(ITEM_ROULETTE_SECONDS);
  expect(
    executeItemUse(items, effects, 'player', 'forward', {
      racers,
      hyperDriveRocketSystem: rocket,
    }),
  ).toBe('activated');
}

function advanceRocket(
  rocket: HyperDriveRocketSystem,
  effects: RacerEffects,
  dt: number,
  paused = false,
): void {
  rocket.advance(dt, paused);
  effects.advance(dt, paused, false);
}

describe('Hyper-Drive Rocket bounded system', () => {
  it('preserves the exact rank and leader-gap selector prerequisite', () => {
    for (const rank of [1, 5] as const) {
      expect(
        effectiveItemWeights({ rank, distanceBehindLeaderMeters: 200 }).find(
          (entry) => entry.itemId === 'hyper-drive-rocket',
        )?.weight,
      ).toBe(0);
    }
    expect(
      effectiveItemWeights({ rank: 6, distanceBehindLeaderMeters: 44.99 }).find(
        (entry) => entry.itemId === 'hyper-drive-rocket',
      )?.weight,
    ).toBe(0);
    expect(
      effectiveItemWeights({ rank: 6, distanceBehindLeaderMeters: 45 }).find(
        (entry) => entry.itemId === 'hyper-drive-rocket',
      )?.weight,
    ).toBeGreaterThan(0);
  });

  it('keeps the approved tuning and supports atomic AI activation', () => {
    expect(HYPER_DRIVE_ROCKET_CONFIG).toMatchObject({
      windowSeconds: 6,
      controlReturnSeconds: 0.3,
      speedCapMultiplier: 1.25,
      accelerationMultiplier: 1,
      ignoreOffRoadSpeedPenalty: false,
    });

    const items = new ItemSystem();
    const effects = new RacerEffects();
    const rocket = new HyperDriveRocketSystem(new CircuitAlpha(), effects);

    activate(items, effects, rocket);
    expect(items.heldItem('player')).toBeNull();
    expect(items.canCollect('player')).toBe(true);
    expect(rocket.snapshot('player')).toMatchObject({
      active: true,
      phase: 'autopilot',
      windowRemainingSeconds: 6,
    });
    expect(effects.driveModifiers('player')).toMatchObject({
      speedCapMultiplier: 1.25,
      accelerationMultiplier: 1,
      ignoreOffRoadSpeedPenalty: false,
      activeBoostLabel: 'Hyper-Drive Rocket',
    });

    const aiItems = new ItemSystem();
    aiItems.acquire('ai-1', 'hyper-drive-rocket');
    aiItems.advance(ITEM_ROULETTE_SECONDS);
    expect(
      executeItemUse(aiItems, effects, 'ai-1', 'forward', {
        racers: [progress('ai-1')],
        hyperDriveRocketSystem: rocket,
      }),
    ).toBe('activated');
    expect(aiItems.heldItem('ai-1')).toBeNull();
    expect(rocket.isActive('ai-1')).toBe(true);

    rocket.dispose();
  });

  it('retains the held charge on invalid or failed activation', () => {
    const track = new CircuitAlpha();
    const effects = new RacerEffects();
    const rocket = new HyperDriveRocketSystem(track, effects);
    const items = new ItemSystem();
    items.acquire('player', 'hyper-drive-rocket');
    items.advance(ITEM_ROULETTE_SECONDS);

    expect(
      executeItemUse(items, effects, 'player', 'forward', {
        racers: [progress('player', true)],
        hyperDriveRocketSystem: rocket,
      }),
    ).toBe('rejected');
    expect(items.heldItem('player')).toEqual({
      itemId: 'hyper-drive-rocket',
      remainingCharges: 1,
    });
    expect(rocket.isActive('player')).toBe(false);

    expect(rocket.activate('player', () => false)).toBe(false);
    expect(items.heldItem('player')).toEqual({
      itemId: 'hyper-drive-rocket',
      remainingCharges: 1,
    });
    expect(effects.remainingSeconds('player', HYPER_DRIVE_ROCKET_CONFIG.id)).toBe(0);
    rocket.dispose();
  });

  it('freezes, blends, and expires at exactly six race seconds', () => {
    const track = new CircuitAlpha();
    const effects = new RacerEffects();
    const rocket = new HyperDriveRocketSystem(track, effects);
    const items = new ItemSystem();
    activate(items, effects, rocket);

    const beforePause = rocket.snapshot('player');
    advanceRocket(rocket, effects, 2, true);
    expect(rocket.snapshot('player')).toEqual(beforePause);

    advanceRocket(rocket, effects, 5.7);
    expect(rocket.snapshot('player')).toMatchObject({ active: true, phase: 'returning' });
    expect(rocket.snapshot('player').windowRemainingSeconds).toBeCloseTo(0.3);
    expect(rocket.snapshot('player').returnBlendRemainingSeconds).toBeCloseTo(0.3);
    expect(rocket.snapshot('player').autopilotWeight).toBeCloseTo(1);
    advanceRocket(rocket, effects, 0.15);
    expect(rocket.snapshot('player')).toMatchObject({ active: true });
    expect(rocket.snapshot('player').windowRemainingSeconds).toBeCloseTo(0.15);
    expect(rocket.snapshot('player').returnBlendRemainingSeconds).toBeCloseTo(0.15);
    expect(rocket.snapshot('player').autopilotWeight).toBeCloseTo(0.5);
    advanceRocket(rocket, effects, 0.15);
    expect(rocket.snapshot('player')).toEqual({
      active: false,
      phase: 'inactive',
      windowRemainingSeconds: 0,
      returnBlendRemainingSeconds: 0,
      autopilotWeight: 0,
    });
    expect(effects.remainingSeconds('player', HYPER_DRIVE_ROCKET_CONFIG.id)).toBe(0);
    expect(effects.isRacerContactImmune('player')).toBe(false);
    expect(effects.isGroundHazardImmune('player')).toBe(false);
    rocket.dispose();
  });
});

describe('Hyper-Drive Rocket composition and legal input', () => {
  it('uses maximum drive authority without granting projectile immunity or clearing other sources', () => {
    const track = new CircuitAlpha();
    const effects = new RacerEffects();
    const rocket = new HyperDriveRocketSystem(track, effects);
    activate(new ItemSystem(), effects, rocket);

    effects.activateTemporaryBoost('player', {
      id: 'nitro-surge',
      label: 'Nitro Surge',
      durationSeconds: 2,
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
    });
    expect(effects.driveModifiers('player')).toMatchObject({
      speedCapMultiplier: 1.25,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
    });
    expect(effects.isItemImmune('player')).toBe(false);
    expect(effects.isRacerContactImmune('player')).toBe(true);
    expect(effects.isGroundHazardImmune('player')).toBe(true);

    rocket.clear('player');
    expect(effects.remainingSeconds('player', 'nitro-surge')).toBeCloseTo(2);
    expect(effects.isItemImmune('player')).toBe(false);
    expect(effects.isRacerContactImmune('player')).toBe(false);
    expect(effects.isGroundHazardImmune('player')).toBe(false);
    rocket.dispose();
  });

  it('projects a bounded line target and returns only normal controller input', () => {
    const track = new CircuitAlpha();
    const autopilot = new RocketAutopilot(track);
    const point = track.samples[24]?.clone() ?? new THREE.Vector3();
    const forward = track.tangents[24]?.clone() ?? new THREE.Vector3(0, 0, 1);
    const route = autopilot.routeTarget(point);
    expect(route.targetPosition.distanceTo(track.project(route.targetPosition).point)).toBeLessThan(
      track.roadHalfWidth,
    );
    expect(Math.abs(route.laneOffset)).toBeLessThanOrEqual(2.8);

    const normalInput = {
      throttle: 0,
      steering: -1,
      brake: true,
      drift: true,
      effectSpeedCapMultiplier: 1.25,
      effectAccelerationMultiplier: 1,
      ignoreOffRoadSpeedPenalty: false,
    } as const;
    const autopilotInput = autopilot.input(point, forward, 12, normalInput, 1);
    expect(autopilotInput.throttle).toBe(1);
    expect(autopilotInput.brake).toBe(false);
    expect(autopilotInput.drift).toBe(false);
    expect(autopilotInput.effectSpeedCapMultiplier).toBe(1.25);
    expect(autopilotInput.ignoreOffRoadSpeedPenalty).toBe(false);

    const returnedInput = autopilot.input(point, forward, 12, normalInput, 0.5);
    expect(returnedInput.steering).toBeGreaterThan(-1);
    expect(returnedInput.steering).toBeLessThanOrEqual(1);
  });
});

describe('Hyper-Drive Rocket production runtime path', () => {
  it('uses the real dispatcher seam, controller input, and recovery-preserved state', () => {
    const rig = arcRuntimeRig();
    rigs.push(rig);
    rig.itemSystem.acquire('player', 'hyper-drive-rocket');
    rig.itemSystem.advance(ITEM_ROULETTE_SECONDS);
    rig.game.requestPlayerItemUse();

    expect(rig.itemSystem.heldItem('player')).toBeNull();
    expect(rig.hyperDriveRocket.isActive('player')).toBe(true);
    const before = rig.kart.position();
    for (let index = 0; index < 30; index += 1) {
      const input = rig.hyperDriveRocket.inputFor(
        'player',
        rig.kart.position(),
        rig.kart.forward(),
        rig.kart.speedMetersPerSecond(),
        { throttle: 0, steering: 0, brake: false, drift: false },
      );
      rig.kart.update(input, 'asphalt', 1 / 60);
      rig.world.step();
      rig.hyperDriveRocket.advance(1 / 60);
      rig.racerEffects.advance(1 / 60, false, false);
    }
    expect(rig.kart.position().distanceTo(before)).toBeGreaterThan(0.5);
    expect(rig.racerEffects.driveModifiers('player').speedCapMultiplier).toBe(1.25);

    const remaining = rig.hyperDriveRocket.snapshot('player').windowRemainingSeconds;
    rig.game.respawn();
    expect(rig.hyperDriveRocket.snapshot('player').windowRemainingSeconds).toBeCloseTo(remaining);
    expect(rig.racerEffects.isRacerContactImmune('player')).toBe(true);
    expect(rig.racerEffects.isGroundHazardImmune('player')).toBe(true);
  });

  it('earns a staged overtake through controller movement and checkpoint authority', () => {
    const track = new CircuitAlpha();
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    world.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.1, 500).setTranslation(0, -0.12, 0));
    const startIndex = 24;
    const rivalIndex = 31;
    const start = track.samples[startIndex]?.clone().setY(0.35) ?? new THREE.Vector3();
    const startTangent = track.tangents[startIndex]?.clone() ?? new THREE.Vector3(0, 0, 1);
    const player = new KartController(
      world,
      createKartTuning(sliceOneDriver),
      sliceOneDriver,
      start,
      Math.atan2(startTangent.x, startTangent.z),
    );
    const rival = new KartController(
      world,
      createKartTuning(sliceOneDriver),
      sliceOneDriver,
      track.samples[rivalIndex]?.clone().setY(0.35) ?? start,
      Math.atan2(
        track.tangents[rivalIndex]?.x ?? startTangent.x,
        track.tangents[rivalIndex]?.z ?? startTangent.z,
      ),
    );
    player.respawn(start, Math.atan2(startTangent.x, startTangent.z));
    const effects = new RacerEffects();
    const rocket = new HyperDriveRocketSystem(track, effects);
    activate(new ItemSystem(), effects, rocket);
    const lapTracker = new LapTracker();
    lapTracker.reset(0);
    let lastCheckpoint = -1;
    const playerProgress = progress('player');
    const rivalProgress = progress('rival');
    playerProgress.lap = 0;
    rivalProgress.lap = 0;
    rivalProgress.trackProgress = rivalIndex / track.sampleCount;
    const initialPlayerProgress = track.project(player.position()).progress;

    for (let frame = 0; frame < 360; frame += 1) {
      const projection = track.project(player.position());
      const modifiers = effects.driveModifiers('player');
      const input = rocket.inputFor(
        'player',
        player.position(),
        player.forward(),
        player.speedMetersPerSecond(),
        {
          throttle: 0,
          steering: 0,
          brake: false,
          drift: false,
          effectSpeedCapMultiplier: modifiers.speedCapMultiplier,
          effectAccelerationMultiplier: modifiers.accelerationMultiplier,
          ignoreOffRoadSpeedPenalty: modifiers.ignoreOffRoadSpeedPenalty,
        },
      );
      player.update(input, projection.surface, 1 / 60);
      world.step();
      rocket.advance(1 / 60);
      effects.advance(1 / 60, false, false);
      const after = track.project(player.position());
      playerProgress.trackProgress = after.progress;
      for (let checkpoint = 0; checkpoint < track.checkpointIndices.length; checkpoint += 1) {
        if (
          checkpoint !== lastCheckpoint &&
          player.position().distanceToSquared(track.lapCheckpointPosition(checkpoint)) < 13 ** 2
        ) {
          if (
            lapTracker.enterCheckpoint(checkpoint, player.forward().dot(after.tangent), frame / 60)
          )
            lastCheckpoint = checkpoint;
        }
      }
      const elapsedProgress = (after.progress - initialPlayerProgress + 1) % 1;
      if (elapsedProgress > 0.01) playerProgress.lap = lapTracker.snapshot().lap;
    }

    expect(track.project(player.position()).lateralDistance).toBeLessThan(34);
    expect(playerProgress.trackProgress).toBeGreaterThan(rivalProgress.trackProgress);
    expect(rankRacers([playerProgress, rivalProgress])[0]?.id).toBe('player');
    expect(lapTracker.snapshot().nextCheckpoint).not.toBe(1);
    expect(rival.isFinite()).toBe(true);
    expect(player.position().distanceTo(start)).toBeGreaterThan(20);
    rocket.dispose();
    effects.dispose();
    world.free();
  });

  it('removes Rocket collision penalties while retaining normal contact for the other racer', () => {
    const rig = arcRuntimeRig();
    rigs.push(rig);
    activate(rig.itemSystem, rig.racerEffects, rig.hyperDriveRocket, [
      rig.playerProgress,
      rig.opponents[0]?.progress ?? progress('rival'),
    ]);
    rig.rival.respawn(rig.kart.position().add(new THREE.Vector3(1.8, 0, 0)), 0);
    rig.kart.body.setLinvel({ x: 3, y: 0, z: 12 }, true);
    rig.rival.body.setLinvel({ x: -2, y: 0, z: 4 }, true);
    const playerVelocity = rig.kart.velocity();
    const rivalVelocity = rig.rival.velocity();
    rig.game.resolveKartContacts(1 / 60);
    expect(rig.kart.velocity()).toEqual(playerVelocity);
    expect(rig.rival.velocity()).not.toEqual(rivalVelocity);

    rig.rival.respawn(rig.kart.position().add(new THREE.Vector3(8, 0, 0)), 0);
    rig.game.resolveKartContacts(0.2);
    rig.hyperDriveRocket.clear('player');
    rig.rival.respawn(rig.kart.position().add(new THREE.Vector3(1.8, 0, 0)), 0);
    rig.kart.body.setLinvel({ x: 3, y: 0, z: 12 }, true);
    const ordinaryVelocity = rig.kart.velocity();
    rig.game.resolveKartContacts(1 / 60);
    expect(rig.kart.velocity()).not.toEqual(ordinaryVelocity);
  });

  it('blocks Slick, Blast, and Shockwave effects without blocking a projectile', () => {
    const rig = arcRuntimeRig();
    rigs.push(rig);
    activate(rig.itemSystem, rig.racerEffects, rig.hyperDriveRocket, [
      rig.playerProgress,
      rig.opponents[0]?.progress ?? progress('rival'),
    ]);
    const playerPosition = rig.kart.position();
    const slick = rig.hazards.placeSlick('rival', playerPosition);
    expect(slick).not.toBeNull();
    expect(rig.hazards.update(0.1, rig.game.projectileTargets())).toEqual([]);
    expect(rig.hazards.activeCount()).toBe(1);

    const rivalPosition = playerPosition.clone().add(new THREE.Vector3(2, 0, 0));
    rig.rival.respawn(rivalPosition, 0);
    const blast = rig.hazards.placeBlastOrb('rival', playerPosition);
    expect(blast).not.toBeNull();
    const blastImpacts = rig.hazards.update(3.01, rig.game.projectileTargets());
    expect(blastImpacts.some((impact) => impact.targetId === 'player')).toBe(false);
    expect(blastImpacts.some((impact) => impact.targetId === 'rival')).toBe(true);

    const push = shockwavePushDelta(
      { ownerId: 'rival', center: playerPosition },
      {
        id: 'player',
        position: playerPosition,
        finished: false,
        itemImmune: false,
        groundHazardImmune: true,
      },
    );
    expect(push).toBeNull();

    const projectileId = rig.projectiles.spawn({
      itemId: 'frost-orbs',
      ownerId: 'rival',
      direction: 'forward',
      config: FROST_ORB_CONFIG,
      launch: {
        position: playerPosition.clone().addScaledVector(rig.forward, -2.07),
        forward: rig.forward,
        velocity: new THREE.Vector3(),
      },
    });
    expect(projectileId).not.toBeNull();
    rig.game.updateProjectiles(1 / 60);
    expect(rig.racerEffects.frostState('player')).not.toBeNull();
  });
});

describe('Hyper-Drive Rocket presentation lifecycle', () => {
  it('shows a finite return-fading procedural model and disposes it', () => {
    const visual = new HyperDriveRocketVisual();
    const active = {
      active: true,
      phase: 'autopilot' as const,
      windowRemainingSeconds: 6,
      returnBlendRemainingSeconds: 0,
      autopilotWeight: 1,
    };
    visual.update(active, 0.2);
    expect(visual.group.visible).toBe(true);
    expect(visual.group.children.length).toBeGreaterThan(5);
    const returning = { ...active, phase: 'returning' as const, autopilotWeight: 0.5 };
    visual.update(returning, 0.4);
    expect((visual.group.children[0] as THREE.Mesh).material).toBeDefined();
    visual.update({ ...returning, active: false, phase: 'inactive', autopilotWeight: 0 }, 0.5);
    expect(visual.group.visible).toBe(false);
    visual.dispose();
    expect(visual.group.children).toHaveLength(0);
  });

  it('keeps audio gesture-gated, bounded, pause-safe, and disposable', async () => {
    const oscillators: { disconnect: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] =
      [];
    const context = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockImplementation(() => {
        context.state = 'running';
        return Promise.resolve();
      }),
      createOscillator: vi.fn(() => {
        const oscillator = {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn((destination: unknown) => destination),
          start: vi.fn(),
          stop: vi.fn(),
          disconnect: vi.fn(),
          onended: null as (() => void) | null,
        };
        oscillators.push(oscillator);
        return oscillator;
      }),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn((destination: unknown) => destination),
        disconnect: vi.fn(),
      })),
    };
    const audio = new HyperDriveRocketAudio(() => {
      return context as unknown as AudioContext;
    });
    audio.play('activate', 1);
    expect(context.createOscillator).not.toHaveBeenCalled();
    await audio.unlock();
    audio.play('activate', 1);
    audio.update(true, 1, 1, false);
    expect(context.createOscillator).toHaveBeenCalledTimes(2);
    audio.update(true, 1, 1, true);
    audio.play('return', 1);
    audio.stop();
    expect(oscillators.every((oscillator) => oscillator.disconnect.mock.calls.length > 0)).toBe(
      true,
    );
    audio.dispose();
    expect(() => {
      audio.update(true, 1, 1, false);
    }).not.toThrow();
  });
});
