import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { createItemBoxPlacements } from '../src/game/items/ItemBoxSystem';
import { SlickGroundSurface } from '../src/game/items/SlickGroundSurface';
import { guardrailContact } from '../src/game/track/GuardrailSystem';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

beforeAll(async () => {
  await RAPIER.init();
});
describe('selected elevated route runtime', () => {
  it('spawns and recovers at the authored road elevation with real support', () => {
    const track = new NeonGrid();
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById('aa-02').stats;
    const point = track.curve.getPointAt(0.1);
    const kart = new KartController(world, createKartTuning(stats), stats, point, Math.PI / 2);
    expect(kart.position().y).toBeCloseTo(point.y + 1.1);
    for (let i = 0; i < 45; i++) world.step();
    expect(kart.position().y).toBeGreaterThan(13);
    const climb = track.curve.getPointAt(0.9);
    kart.respawn(climb, 0);
    expect(kart.position().y).toBeCloseTo(climb.y + 1.2);
    cleanup();
    world.free();
  });
  it('places boxes above local road and inside its legal width', () => {
    const track = new NeonGrid();
    const placements = createItemBoxPlacements(track);
    expect(placements.length).toBeGreaterThan(0);
    for (const box of placements) {
      expect(box.position.y).toBeCloseTo(track.curve.getPointAt(box.progress).y + 1.55);
      expect(Math.abs(box.lateralOffset)).toBeLessThanOrEqual(
        track.halfWidthAt(box.progress) - 0.5,
      );
    }
  });
  it('bounds a kart to the local alley wall rather than the wider Alpha rails', () => {
    const track = new NeonGrid();
    const p = track.curve.getPointAt(0.35);
    const t = track.curve.getTangentAt(0.35);
    const pos = p.clone().addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), 4.2);
    expect(guardrailContact(track, pos, 1.15)?.penetration).toBeGreaterThan(0.7);
  });
  it('samples the supporting mesh at local elevation for hazards and terrain projectiles', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track);
    const ground = new SlickGroundSurface(scene, true);
    const road = track.curve.getPointAt(0.9);
    expect(ground.at(road.clone().add(new THREE.Vector3(0, 0.4, 0)))?.point.y).toBeCloseTo(
      road.y,
      1,
    );
    ground.dispose();
    disposeTrackScene(scene);
  });
});
