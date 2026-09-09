import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Vector3 } from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { PrismaticSystem, PRISMATIC } from '../src/game/items/PrismaticSystem';
import { PrismaticVisual } from '../src/game/items/PrismaticVisual';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ITEM_DEFINITIONS, type ItemId } from '../src/game/items/itemDefinitions';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import {
  PrismaticCounterFixture,
  prismaticTestFromSearch,
} from '../src/game/items/PrismaticCounterFixture';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import type { RacerProgress } from '../src/game/race/RaceDirector';

function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) throw new Error('Missing test fixture value');
  return value;
}
const racer = (id: string, x: number, finished = false) => ({
  id,
  position: new Vector3(x, 0, 0),
  finished,
});
const nitro = {
  id: 'nitro-surge',
  label: 'Nitro',
  ...required(ITEM_DEFINITIONS['nitro-surge'].boost),
};

describe('Prismatic committed effect and independent ownership', () => {
  it.each(['forward', 'backward'] as const)(
    'commits exactly one charge in %s, with no target required',
    (direction) => {
      const effects = new RacerEffects();
      const p = new PrismaticSystem(effects);
      const items = new ItemSystem();
      items.acquire('player', PRISMATIC.id);
      expect(executeItemUse(items, effects, 'player', direction, { prismaticSystem: p })).toBe(
        'rejected',
      );
      items.advance(0.85);
      expect(executeItemUse(items, effects, 'player', direction, { prismaticSystem: p })).toBe(
        'activated',
      );
      expect(items.canCollect('player')).toBe(true);
      expect(p.remaining('player')).toBe(6);
      expect(executeItemUse(items, effects, 'player', direction, { prismaticSystem: p })).toBe(
        'rejected',
      );
    },
  );

  it('preserves an existing effect on failed refresh, rejects invalid/finished owners, and never cleanses spin', () => {
    const effects = new RacerEffects();
    const p = new PrismaticSystem(effects);
    const commit = vi.fn(() => true);
    expect(p.activate(' ', commit)).toBe(false);
    expect(commit).not.toHaveBeenCalled();
    p.activate('player', commit);
    effects.advance(1);
    effects.activateSpinout('player', {
      id: 'old',
      label: 'Old',
      durationSeconds: 1.2,
      direction: 1,
      turns: 1,
    });
    expect(p.activate('player', () => false)).toBe(false);
    expect(p.remaining('player')).toBe(5);
    p.activate('player', commit);
    expect(p.remaining('player')).toBe(6);
    expect(effects.spinoutRemainingSeconds('player')).toBe(1.2);
    const items = new ItemSystem();
    items.acquire('player', PRISMATIC.id);
    items.advance(1);
    expect(
      executeItemUse(items, effects, 'player', 'forward', { prismaticSystem: p, racers: [] }),
    ).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(1);
  });

  it('expires precisely after 360 fixed steps, pauses, and preserves external immunity', () => {
    const effects = new RacerEffects();
    const p = new PrismaticSystem(effects);
    p.activate('player', () => true);
    effects.advance(9, true);
    effects.advance(NaN);
    effects.advance(Infinity);
    effects.advance(-1);
    expect(p.remaining('player')).toBe(6);
    for (let i = 0; i < 360; i++) {
      expect(effects.isItemImmune('player')).toBe(true);
      effects.advance(1 / 60, false, false);
      expect(effects.isItemImmune('player')).toBe(true);
      effects.advanceProtection(1 / 60);
    }
    expect(effects.isItemImmune('player')).toBe(false);
    p.activate('player', () => true);
    effects.setItemImmune('player', true);
    p.clear('player');
    expect(effects.isItemImmune('player')).toBe(true);
    expect(effects.driveModifiers('player').speedCapMultiplier).toBe(1);
    effects.clear('player');
    expect(effects.isItemImmune('player')).toBe(false);
    p.activate('player', () => true);
    p.dispose();
    expect(effects.isItemImmune('player')).toBe(false);
  });

  it('keeps a contact encounter latched through expiry and reacquisition until separation', () => {
    const effects = new RacerEffects();
    const p = new PrismaticSystem(effects);
    const a = racer('a', 0);
    const b = racer('b', 2);
    p.activate('a', () => true);
    expect(p.contacts([a, b])).toEqual(['b']);
    effects.advanceProtection(6);
    expect(p.contacts([a, b])).toEqual([]);
    p.activate('a', () => true);
    expect(p.contacts([a, b])).toEqual([]);
    b.position.x = 2.35;
    p.contacts([a, b]);
    b.position.x = 2;
    expect(p.contacts([a, b])).toEqual(['b']);
    p.dispose();
  });

  it.each([false, true])(
    'composes Nitro without stacking, with Prismatic expiring first=%s',
    (prismFirst) => {
      const effects = new RacerEffects();
      const p = new PrismaticSystem(effects);
      p.activate('player', () => true);
      if (prismFirst) effects.advance(5);
      effects.activateTemporaryBoost('player', nitro);
      expect(effects.driveModifiers('player')).toMatchObject({
        speedCapMultiplier: 1.18,
        accelerationMultiplier: 1.5,
        ignoreOffRoadAccelerationPenalty: true,
      });
      effects.advance(prismFirst ? 1 : 2.4);
      expect(effects.driveModifiers('player').speedCapMultiplier).toBe(prismFirst ? 1.18 : 1.12);
      expect(effects.driveModifiers('player').accelerationMultiplier).toBe(prismFirst ? 1.5 : 1);
      expect(effects.isItemImmune('player')).toBe(!prismFirst);
      const old = effects.remainingSeconds('player');
      effects.activateTemporaryBoost('player', nitro, () => false);
      expect(effects.remainingSeconds('player')).toBe(old);
      effects.advance(10);
      expect(effects.driveModifiers('player').speedCapMultiplier).toBe(1);
    },
  );
});

describe('Prismatic hostile contact encounters', () => {
  it('handles strict boundaries, continuous overlap, refresh, separation/re-entry, immunity and finish', () => {
    const effects = new RacerEffects();
    const p = new PrismaticSystem(effects);
    p.activate('a', () => true);
    const a = racer('a', 0);
    const b = racer('b', 2.35);
    expect(p.contacts([a, b])).toEqual([]);
    b.position.x = 2.3499;
    expect(p.contacts([a, b])).toEqual(['b']);
    p.activate('a', () => true);
    expect(p.contacts([b, a])).toEqual([]);
    b.position.x = 2.35;
    p.contacts([a, b]);
    b.position.x = 0;
    expect(p.contacts([a, b])).toEqual(['b']);
    p.clear('a');
    p.activate('a', () => true);
    p.activate('b', () => true);
    expect(p.contacts([a, b])).toEqual([]);
    p.clear('b');
    expect(p.contacts([a, { ...b, finished: true }])).toEqual([]);
    b.position.x = NaN;
    expect(p.contacts([a, b])).toEqual([]);
    p.dispose();
    expect(p.contacts([a, racer('b', 0)])).toEqual([]);
  });
});

function runtime(progress = 0.1) {
  const track = new CircuitAlpha();
  const capacity = new ItemPhysicsCapacity();
  const projectiles = new ProjectileSystem(track, capacity);
  const hazards = new HazardSystem(track, capacity);
  const apex = new ApexMissileSystem(track, projectiles);
  const shockwave = new ShockwaveSystem();
  const position = track.curve.getPointAt(progress);
  position.y = 0.55;
  const forward = track.curve.getTangentAt(progress);
  const racers: RacerProgress[] = [
    {
      id: 'player',
      lap: 1,
      trackProgress: progress,
      finished: false,
      finishTime: null,
      finishPlace: null,
    },
  ];
  return {
    track,
    capacity,
    projectiles,
    hazards,
    apex,
    shockwave,
    position,
    forward,
    racers,
    dispose: () => {
      apex.dispose();
      projectiles.dispose();
      hazards.dispose();
      shockwave.dispose();
    },
  };
}

describe('production encounters and deterministic fixtures', () => {
  it.each(['kinetic', 'seeker', 'slick', 'blast', 'apex', 'shockwave'] as const)(
    'verifies %s in protected and expired scenarios, including real contact evidence',
    (mode) => {
      for (const expired of [false, true]) {
        const r = runtime();
        const effects = new RacerEffects();
        const p = new PrismaticSystem(effects);
        const fixture = new PrismaticCounterFixture({ mode, expired });
        const onItemContact = (item: ItemId, blocked: boolean, id?: number) => {
          fixture.observe(item, blocked, 'player', id);
        };
        const victim = {
          id: 'player',
          position: r.position,
          forward: r.forward,
          velocity: new Vector3(),
          finished: false,
          onItemContact,
          itemImmune: false,
        };
        const options = {
          ...r,
          speed: 0,
          finished: false,
          held: true,
          remaining: 0,
          placeRacer: () => null,
        };
        fixture.update(1 / 60, options);
        expect(fixture.badge()).toContain('READY');
        expect(r.capacity.count()).toBe(0);
        p.activate('player', () => true);
        let impactCount = 0;
        let pushCount = 0;
        for (let i = 0; i < 720 && !fixture.badge().includes('PASS'); i++) {
          victim.itemImmune = effects.isItemImmune('player');
          fixture.update(1 / 60, { ...options, held: false, remaining: p.remaining('player') });
          for (const pulse of r.shockwave.drainPulses())
            pushCount += r.shockwave.dispatch(pulse, {
              projectileSystem: r.projectiles,
              hazardSystem: r.hazards,
              apexSystem: r.apex,
              targets: [victim],
            }).length;
          impactCount += r.projectiles.update(1 / 60, [victim]).length;
          impactCount += r.apex.update(1 / 60, r.racers, [victim]).length;
          impactCount += r.hazards.update(1 / 60, [victim]).length;
          effects.advance(1 / 60);
        }
        expect(fixture.badge()).toContain('PASS · VERIFIED CONTACT');
        expect(mode === 'shockwave' ? pushCount : impactCount).toBe(expired ? 1 : 0);
        expect(r.capacity.count()).toBe(mode === 'slick' && !expired ? 1 : 0);
        r.dispose();
        expect(r.capacity.count()).toBe(0);
      }
    },
  );

  it('uses per-victim Blast/Apex immunity and preserves actual Slick for an unprotected follower', () => {
    const r = runtime();
    const protectedRacer = {
      id: 'player',
      position: r.position,
      forward: r.forward,
      finished: false,
      itemImmune: true,
    };
    const rival = { ...protectedRacer, id: 'rival', itemImmune: false };
    r.hazards.placeSlick('fixture', r.position);
    expect(r.hazards.update(0.01, [protectedRacer])).toEqual([]);
    expect(r.hazards.update(0.01, [protectedRacer, rival]).map((x) => x.targetId)).toEqual([
      'rival',
    ]);
    r.hazards.placeBlastOrb('fixture', r.position);
    expect(r.hazards.update(3, [protectedRacer, rival]).map((x) => x.targetId)).toEqual(['rival']);
    r.apex.launch('fixture', r.position, r.racers);
    const hits = [];
    for (let i = 0; i < 300; i++)
      hits.push(...r.apex.update(1 / 60, r.racers, [protectedRacer, rival]));
    expect(hits.map((x) => x.targetId)).toEqual(['rival']);
    r.dispose();
  });

  it('does not convert an intercepted projectile or a moved/missing encounter into a pass', () => {
    const f = new PrismaticCounterFixture({ mode: 'kinetic', expired: false });
    const r = runtime();
    const options = {
      ...r,
      speed: 0,
      finished: false,
      held: true,
      remaining: 0,
      placeRacer: () => null,
    };
    f.update(0.01, options);
    f.update(0.01, { ...options, remaining: 6 });
    f.observe('kinetic-disc', true, 'someone-else', r.projectiles.snapshots()[0]?.id);
    expect(f.badge()).not.toContain('PASS');
    f.update(6, { ...options, remaining: 1 });
    expect(f.badge()).toContain('INCONCLUSIVE');
    r.dispose();
    expect(prismaticTestFromSearch('?testPrismaticCounter=kinetic')).toBeNull();
    expect(
      prismaticTestFromSearch(
        '?testItem=prismatic-invincibility&testPrismaticCounter=kinetic&testPrismaticPhase=wrong',
      ),
    ).toBeNull();
    expect(
      prismaticTestFromSearch('?testItem=prismatic-invincibility&testPrismaticCounter=kinetic'),
    ).toEqual({ mode: 'kinetic', expired: false });
  });

  it('does not bypass Seeker arming or later protected owner contact', () => {
    const r = runtime();
    const id = r.projectiles.spawn({
      itemId: 'seeker-drone',
      ownerId: 'owner',
      targetId: 'player',
      direction: 'forward',
      config: required(ITEM_DEFINITIONS['seeker-drone'].projectile),
      launch: { position: r.position, forward: r.forward, velocity: new Vector3() },
    });
    const target = {
      id: 'player',
      position: r.position.clone().addScaledVector(r.forward, 30),
      forward: r.forward,
      finished: false,
    };
    r.projectiles.update(0.1, [
      target,
      {
        ...target,
        id: 'owner',
        position: required(r.projectiles.snapshots()[0]).position,
        itemImmune: true,
      },
    ]);
    expect(r.projectiles.snapshots().some((p) => p.id === id)).toBe(true);
    r.projectiles.update(0.41, [target]);
    const projectile = required(r.projectiles.snapshots()[0]);
    const owner = {
      ...target,
      id: 'owner',
      position: projectile.position.clone().addScaledVector(projectile.velocity, 0.005),
      itemImmune: true,
    };
    expect(r.projectiles.update(0.01, [target, owner])).toEqual([]);
    expect(r.projectiles.activeCount()).toBe(0);
    r.dispose();
  });
});

describe('Prismatic drive and presentation', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });
  it.each(['dirt', 'grass'] as const)(
    'matches road acceleration/cap on %s only while protected',
    (surface) => {
      const run = (terrain: 'asphalt' | 'dirt' | 'grass', protectedState: boolean) => {
        const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
        world.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.1, 500).setTranslation(0, -0.12, 0));
        const kart = new KartController(
          world,
          createKartTuning(sliceOneDriver),
          sliceOneDriver,
          new Vector3(),
          0,
        );
        const effects = new RacerEffects();
        const p = new PrismaticSystem(effects);
        if (protectedState) p.activate('player', () => true);
        const speeds: number[] = [];
        for (let i = 0; i < 360; i++) {
          const m = effects.driveModifiers('player');
          kart.update(
            {
              throttle: 1,
              steering: 0,
              brake: false,
              drift: false,
              effectSpeedCapMultiplier: m.speedCapMultiplier,
              effectAccelerationMultiplier: m.accelerationMultiplier,
              ignoreOffRoadSpeedPenalty: m.ignoreOffRoadSpeedPenalty,
              ignoreOffRoadAccelerationPenalty: m.ignoreOffRoadAccelerationPenalty,
            },
            terrain,
            1 / 60,
          );
          world.step();
          if (i % 60 === 59) speeds.push(kart.speedMetersPerSecond());
        }
        p.clear('player');
        for (let i = 0; i < 240; i++) {
          kart.update({ throttle: 1, steering: 0, brake: false, drift: false }, terrain, 1 / 60);
          world.step();
        }
        const expiredSpeed = kart.speedMetersPerSecond();
        world.free();
        return { speeds, expiredSpeed };
      };
      const road = run('asphalt', true);
      const protectedRun = run(surface, true);
      const unprotectedRun = run(surface, false);
      protectedRun.speeds.forEach((speed, i) => {
        expect(speed).toBeCloseTo(required(road.speeds[i]), 4);
      });
      expect(protectedRun.speeds[5]).toBeGreaterThan(required(unprotectedRun.speeds[5]));
      expect(protectedRun.expiredSpeed).toBeLessThan(required(protectedRun.speeds[5]));
    },
  );

  it('follows turns/jumps, freezes on pause, fades, and disposes a fixed resource pool', () => {
    const visual = new PrismaticVisual();
    const position = new Vector3(2, 0.34, 4);
    visual.update(6, position, 0.2);
    expect(visual.group.visible).toBe(true);
    const count = visual.group.children.length;
    position.set(10, 4, 8);
    visual.update(5, position, 0);
    expect(visual.shell.position.x).toBe(2);
    visual.update(5, position, 0.1);
    expect(visual.shell.position.toArray()).toEqual([10, 5.35, 8]);
    visual.blocked();
    visual.update(4, position, 0.01);
    const bright = visual.shell.material.opacity;
    visual.update(0.01, position, 0.1);
    expect(visual.shell.material.opacity).toBeLessThan(bright);
    for (let i = 0; i < 100; i++) {
      visual.update(0, position, 0.1);
      visual.update(6, position, 0.1);
    }
    expect(visual.group.children.length).toBe(count);
    const dispose = vi.spyOn(visual.shell.geometry, 'dispose');
    visual.dispose();
    expect(dispose).toHaveBeenCalledOnce();
    expect(visual.group.children).toHaveLength(0);
  });
});
