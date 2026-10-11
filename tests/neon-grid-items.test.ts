import * as THREE from 'three';
import { afterAll, describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';
import { SlickGroundSurface } from '../src/game/items/SlickGroundSurface';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { PrismaticSystem } from '../src/game/items/PrismaticSystem';
import { InkSplatSystem } from '../src/game/items/InkSplatSystem';
import { NitroOverdriveSystem } from '../src/game/items/NitroOverdrive';
import { HyperDriveRocketSystem } from '../src/game/items/HyperDriveRocket';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { BLAZE_ORB_CONFIG } from '../src/game/items/BlazeOrbs';
import { FROST_ORB_CONFIG } from '../src/game/items/FrostOrbs';
import type { RacerProgress } from '../src/game/race/RaceDirector';

const track = new NeonGrid();
const scene = createNeonGridScene(track);
const ground = new SlickGroundSurface(scene, true);
afterAll(() => {
  ground.dispose();
  disposeTrackScene(scene);
});
describe('all accepted items on Neon Grid elevated road', () => {
  it.each(Object.values(ITEM_DEFINITIONS).map((def) => def.id))(
    'activates %s through the real dispatcher and disposes route resources',
    (item) => {
      const items = new ItemSystem();
      const effects = new RacerEffects();
      const projectiles = new ProjectileSystem(track, undefined, undefined, (p) => ground.at(p));
      const hazards = new HazardSystem(track, projectiles.capacity, (p) => ground.at(p));
      const apex = new ApexMissileSystem(track, projectiles);
      const shockwave = new ShockwaveSystem((p) => ground.at(p));
      const prismatic = new PrismaticSystem(effects);
      const ink = new InkSplatSystem();
      const nitro = new NitroOverdriveSystem(effects);
      const rocket = new HyperDriveRocketSystem(track, effects);
      const racers: RacerProgress[] = ['player', 'target'].map((id, i) => ({
        id,
        lap: 0,
        trackProgress: 0.1 + i * 0.04,
        finished: false,
        finishTime: null,
        finishPlace: null,
      }));
      const position = track.curve.getPointAt(0.1).add(new THREE.Vector3(0, 0.5, 0));
      const forward = track.curve.getTangentAt(0.1);
      expect(items.acquire('player', item)).toBe(true);
      items.advance(2);
      expect(
        executeItemUse(items, effects, 'player', 'forward', {
          racers,
          projectileSystem: projectiles,
          hazardSystem: hazards,
          apexSystem: apex,
          shockwaveSystem: shockwave,
          prismaticSystem: prismatic,
          inkSplatSystem: ink,
          nitroOverdriveSystem: nitro,
          hyperDriveRocketSystem: rocket,
          projectileLaunch: { position, forward, velocity: forward.clone().multiplyScalar(18) },
        }),
      ).toBe('activated');
      const targets = racers.map((r) => ({
        id: r.id,
        position: track.curve.getPointAt(r.trackProgress).add(new THREE.Vector3(0, 0.5, 0)),
        forward: track.curve.getTangentAt(r.trackProgress),
        finished: false,
      }));
      for (let i = 0; i < 60; i++) projectiles.update(1 / 60, targets);
      expect(
        projectiles.snapshots().every((p) => p.position.toArray().every(Number.isFinite)),
      ).toBe(true);
      expect(racers.map((r) => r.lap)).toEqual([0, 0]);
      apex.dispose();
      hazards.dispose();
      shockwave.dispose();
      prismatic.dispose();
      ink.dispose();
      nitro.dispose();
      rocket.dispose();
      projectiles.dispose();
      effects.dispose();
      items.dispose();
      expect(projectiles.group.children).toHaveLength(0);
      expect(hazards.group.children).toHaveLength(0);
    },
  );
});

describe('ordinary shots follow the selected elevated road', () => {
  it.each(
    [0.2, 0.86, 0.89].flatMap((progress) =>
      (['kinetic-disc', 'blaze-orbs', 'frost-orbs'] as const).map((itemId) => ({
        progress,
        itemId,
      })),
    ),
  )('keeps $itemId clear of the descent/climb at $progress', ({ progress, itemId }) => {
    const projectiles = new ProjectileSystem(track, undefined, undefined, (p) => ground.at(p));
    const position = track.curve.getPointAt(progress).add(new THREE.Vector3(0, 0.6, 0));
    const forward = track.curve.getTangentAt(progress).setY(0).normalize();
    const config =
      itemId === 'frost-orbs'
        ? FROST_ORB_CONFIG
        : itemId === 'blaze-orbs'
          ? BLAZE_ORB_CONFIG
          : ITEM_DEFINITIONS['kinetic-disc'].projectile;
    if (!config) throw new Error('Missing kinetic config');
    expect(
      projectiles.spawn({
        itemId,
        ownerId: 'player',
        direction: 'forward',
        config,
        launch: { position, forward, velocity: new THREE.Vector3() },
      }),
    ).not.toBeNull();
    let samples = 0;
    for (let i = 0; i < 60; i++) {
      projectiles.update(1 / 60, []);
      for (const shot of projectiles.snapshots()) {
        const support = ground.at(shot.position);
        expect(support).not.toBeNull();
        expect(shot.position.y - (support?.point.y ?? Infinity)).toBeCloseTo(0.55, 2);
        samples++;
      }
    }
    expect(samples).toBeGreaterThan(5);
    projectiles.dispose();
  });
});
