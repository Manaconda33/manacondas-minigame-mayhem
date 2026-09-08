import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { observeAiHazards } from '../src/game/ai/AiHazardAwareness';
import { AiHazardFixture } from '../src/game/ai/AiHazardFixture';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { KartController } from '../src/game/physics/KartController';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

// Existing three-lap/stat-authority tests remain the normal-race regression gate.
describe('AI steering around real accepted hazards', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });
  it.each(['slick', 'blast'] as const)(
    '%s fixture changes lane through finite, road-bounded controller motion and recovers',
    (kind) => {
      for (const preferred of [-0.6, 0.6]) {
        const track = new CircuitAlpha(),
          capacity = new ItemPhysicsCapacity();
        const hazards = new HazardSystem(track, capacity);
        const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
        world.timestep = 1 / 60;
        world.createCollider(RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0));
        const tangent = track.curve.getTangentAt(0.1),
          spawn = track.curve.getPointAt(0.1);
        const tuning = createKartTuning(sliceOneDriver);
        const kart = new KartController(
          world,
          tuning,
          sliceOneDriver,
          spawn,
          Math.atan2(tangent.x, tangent.z),
        );
        const driver = new AiDriver(
          track,
          { laneOffset: preferred, pace: 0.7, aggression: 0.6 },
          tuning.maxSpeed,
        );
        const fixture = new AiHazardFixture(kind);
        let deviated = false,
          recovered = false,
          largestStep = 0,
          greatestLateralChange = 0;
        let fixtureLateral = 0;
        for (let frame = 0; frame < 660; frame++) {
          const elapsed = frame / 60;
          const position = kart.position(),
            projection = track.project(position);
          fixture.update(
            elapsed,
            [{ id: 'ai', name: 'AI', position, finished: false }],
            track,
            hazards,
          );
          if (frame === 300) fixtureLateral = projection.lateralOffset;
          const before = kart.position();
          const input = driver.input(
            position,
            kart.forward(),
            kart.speedMetersPerSecond(),
            0,
            [],
            1 / 60,
            observeAiHazards(track, hazards.activeSnapshots()),
            'ai',
          );
          expect(kart.position()).toEqual(before);
          if (frame >= 300 && Math.abs(driver.desiredLaneOffset() - preferred) > 1) deviated = true;
          if (frame > 400 && driver.desiredLaneOffset() === preferred) recovered = true;
          kart.update(input, projection.surface, 1 / 60);
          world.step();
          largestStep = Math.max(largestStep, kart.position().distanceTo(before));
          if (frame >= 300 && frame < 360)
            greatestLateralChange = Math.max(
              greatestLateralChange,
              Math.abs(track.project(kart.position()).lateralOffset - fixtureLateral),
            );
          expect(kart.isFinite()).toBe(true);
          expect(track.project(kart.position()).lateralDistance).toBeLessThan(
            track.roadHalfWidth + 0.5,
          );
          hazards.update(1 / 60, []);
        }
        expect(deviated).toBe(true);
        expect(recovered).toBe(true);
        expect(greatestLateralChange).toBeGreaterThan(0.25);
        expect(largestStep).toBeLessThan(1);
        driver.reset();
        expect(driver.desiredLaneOffset()).toBe(preferred);
        hazards.dispose();
        expect(capacity.count()).toBe(0);
        world.free();
      }
    },
  );
});
