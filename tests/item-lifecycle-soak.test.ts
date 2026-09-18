import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ARC_BLADE_CONFIG } from '../src/game/items/ArcBlade';
import { ARC_HAMMER_PROJECTILE_CONFIG } from '../src/game/items/ArcHammers';
import { BLAZE_ORB_CONFIG } from '../src/game/items/BlazeOrbs';
import { FROST_ORB_CONFIG } from '../src/game/items/FrostOrbs';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { HyperDriveRocketSystem } from '../src/game/items/HyperDriveRocket';
import { InkSplatSystem } from '../src/game/items/InkSplatSystem';
import { ItemPhysicsCapacity, MAX_ITEM_PHYSICS_OBJECTS } from '../src/game/items/ItemPhysicsCapacity';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { NitroOverdriveSystem } from '../src/game/items/NitroOverdrive';
import { PrismaticSystem } from '../src/game/items/PrismaticSystem';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { RacerItemVisuals } from '../src/game/items/RacerItemVisuals';
import { ShockwaveSystem } from '../src/game/items/ShockwaveSystem';
import { ITEM_DEFINITIONS, ITEM_IDS, type ItemProjectileConfig } from '../src/game/items/itemDefinitions';
import type { RacerProgress } from '../src/game/race/RaceDirector';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('Missing lifecycle soak fixture value');
  return value;
}

function progress(id: string, trackProgress: number): RacerProgress {
  return {
    id,
    lap: 1,
    trackProgress,
    finished: false,
    finishTime: null,
    finishPlace: null,
  };
}

function finiteProjectileState(system: ProjectileSystem): boolean {
  return system.snapshots().every((snapshot) =>
    [
      ...snapshot.position.toArray(),
      ...snapshot.velocity.toArray(),
      snapshot.remainingSeconds,
      snapshot.ownerArmSeconds,
      snapshot.bounceCount,
    ].every(Number.isFinite),
  );
}

function finiteHazardState(system: HazardSystem): boolean {
  return system.activeSnapshots().every((snapshot) =>
    [
      ...snapshot.position.toArray(),
      ...snapshot.velocity.toArray(),
      snapshot.remainingSeconds,
      snapshot.ownerImmuneSeconds,
    ].every(Number.isFinite),
  );
}

describe('Slice 5 whole-item lifecycle soak', () => {
  it('holds the shared 40-object ceiling and returns mixed projectile/hazard/Apex state to baseline over 20 race cycles', () => {
    expect(ITEM_IDS).toHaveLength(15);
    expect(MAX_ITEM_PHYSICS_OBJECTS).toBe(40);

    const projectileFamilies: readonly {
      itemId:
        | 'kinetic-disc'
        | 'seeker-drone'
        | 'blaze-orbs'
        | 'frost-orbs'
        | 'arc-blade'
        | 'arc-hammers';
      config: Readonly<ItemProjectileConfig>;
    }[] = [
      {
        itemId: 'kinetic-disc',
        config: required(ITEM_DEFINITIONS['kinetic-disc'].projectile),
      },
      {
        itemId: 'seeker-drone',
        config: required(ITEM_DEFINITIONS['seeker-drone'].projectile),
      },
      { itemId: 'blaze-orbs', config: BLAZE_ORB_CONFIG },
      { itemId: 'frost-orbs', config: FROST_ORB_CONFIG },
      { itemId: 'arc-blade', config: ARC_BLADE_CONFIG },
      { itemId: 'arc-hammers', config: ARC_HAMMER_PROJECTILE_CONFIG },
    ];

    for (let cycle = 0; cycle < 20; cycle += 1) {
      const track = new CircuitAlpha();
      const capacity = new ItemPhysicsCapacity();
      const projectiles = new ProjectileSystem(track, capacity);
      const hazards = new HazardSystem(track, capacity);
      const apex = new ApexMissileSystem(track, projectiles);
      const base = required(track.samples[48]).clone().setY(0.72);
      const forward = required(track.tangents[48]).clone().setY(0).normalize();
      const launch = { position: base, forward, velocity: new THREE.Vector3() };

      for (let index = 0; index < 30; index += 1) {
        const family = required(projectileFamilies[index % projectileFamilies.length]);
        expect(
          projectiles.spawn({
            itemId: family.itemId,
            ownerId: `projectile-owner-${String(cycle)}-${String(index)}`,
            ...(family.itemId === 'seeker-drone' ? { targetId: 'target' } : {}),
            direction: index % 2 === 0 ? 'forward' : 'backward',
            config: family.config,
            launch,
          }),
        ).not.toBeNull();
      }

      for (let index = 0; index < 4; index += 1) {
        expect(
          hazards.placeBlastOrb(
            `blast-owner-${String(cycle)}-${String(index)}`,
            base.clone().addScaledVector(forward, 4 + index * 2),
          ),
        ).not.toBeNull();
      }
      for (let index = 0; index < 5; index += 1) {
        expect(
          hazards.placeSlick(
            `slick-owner-${String(cycle)}-${String(index)}`,
            base.clone().addScaledVector(forward, -4 - index * 2),
          ),
        ).not.toBeNull();
      }

      expect(capacity.count()).toBe(39);
      const racers = [progress('apex-owner', 0.4), progress('leader', 0.55)];
      expect(apex.launch('apex-owner', base, racers)).toBe(true);
      expect(capacity.count()).toBe(MAX_ITEM_PHYSICS_OBJECTS);
      // ProjectileSystem.activeCount() is the shared capacity count, including hazards/reservations.\n      expect(projectiles.activeCount()).toBe(MAX_ITEM_PHYSICS_OBJECTS);\n      expect(hazards.activeCount()).toBe(9);
      expect(finiteProjectileState(projectiles)).toBe(true);
      expect(finiteHazardState(hazards)).toBe(true);

      expect(
        projectiles.spawn({
          itemId: 'kinetic-disc',
          ownerId: 'overflow',
          direction: 'forward',
          config: required(ITEM_DEFINITIONS['kinetic-disc'].projectile),
          launch,
        }),
      ).toBeNull();
      expect(hazards.placeBlastOrb('overflow', base)).toBeNull();

      apex.cancel();
      expect(capacity.count()).toBe(MAX_ITEM_PHYSICS_OBJECTS - 1);

      projectiles.update(20, []);
      hazards.update(20, []);
      hazards.update(1, []);

      expect(projectiles.activeCount()).toBe(0);
      expect(hazards.activeCount()).toBe(0);
      expect(capacity.count()).toBe(0);
      expect(finiteProjectileState(projectiles)).toBe(true);
      expect(finiteHazardState(hazards)).toBe(true);

      apex.dispose();
      projectiles.dispose();
      hazards.dispose();
      expect(projectiles.group.children).toHaveLength(0);
      expect(hazards.group.children).toHaveLength(0);
      expect(capacity.count()).toBe(0);
    }
  }, 30000);

  it('returns timed effects, inventory, Shockwave, Ink and racer-owned VFX to baseline over 100 lifecycle cycles', () => {
    const track = new CircuitAlpha();
    const position = required(track.samples[72]).clone().setY(0.72);
    const racers = [progress('ink-owner', 0.2), progress('player', 0.4)];
    const nitro = required(ITEM_DEFINITIONS['nitro-surge'].boost);

    for (let cycle = 0; cycle < 100; cycle += 1) {
      const effects = new RacerEffects();
      const items = new ItemSystem();
      const overdrive = new NitroOverdriveSystem(effects);
      const rocket = new HyperDriveRocketSystem(track, effects);
      const prismatic = new PrismaticSystem(effects);
      const ink = new InkSplatSystem();
      const shockwave = new ShockwaveSystem();
      const visuals = new RacerItemVisuals();

      expect(
        effects.activateTemporaryBoost('player', {
          id: 'nitro-surge',
          label: 'Nitro Surge',
          ...nitro,
        }),
      ).toBe(true);
      expect(overdrive.activate('player', () => true)).toBe(true);
      expect(rocket.activate('player', () => true)).toBe(true);
      expect(prismatic.activate('player', () => true)).toBe(true);
      expect(ink.apply('ink-owner', racers, () => false, () => true).accepted).toBe(true);
      expect(shockwave.activate('player', position)).toBe(true);
      expect(items.acquire('player', 'kinetic-disc')).toBe(true);

      visuals.update(
        {
          nitroSurgeActive: true,
          nitroOverdrive: overdrive.snapshot('player'),
          hyperDriveRocket: rocket.snapshot('player'),
          prismaticRemainingSeconds: prismatic.remaining('player'),
          position,
        },
        cycle / 60,
        1 / 60,
      );

      expect(effects.driveModifiers('player').speedCapMultiplier).toBe(1.25);
      expect(effects.isItemImmune('player')).toBe(true);
      expect(ink.isActive('player')).toBe(true);
      expect(shockwave.pendingCount()).toBe(1);
      expect(shockwave.visualCount()).toBe(1);

      overdrive.advance(10);
      rocket.advance(10);
      effects.advance(10);
      ink.advance(10);
      shockwave.advance(10);
      items.advance(10);

      expect(overdrive.isActive('player')).toBe(false);
      expect(rocket.isActive('player')).toBe(false);
      expect(prismatic.remaining('player')).toBe(0);
      expect(ink.activeRacerIds()).toEqual([]);
      expect(shockwave.visualCount()).toBe(0);

      prismatic.dispose();
      overdrive.dispose();
      rocket.dispose();
      ink.dispose();
      shockwave.dispose();
      items.dispose();
      visuals.dispose();
      effects.dispose();

      expect(overdrive.snapshot('player').active).toBe(false);
      expect(rocket.snapshot('player').active).toBe(false);
      expect(prismatic.remaining('player')).toBe(0);
      expect(ink.activeRacerIds()).toEqual([]);
      expect(shockwave.pendingCount()).toBe(0);
      expect(shockwave.visualCount()).toBe(0);
      expect(shockwave.group.children).toHaveLength(0);
      expect(visuals.localGroup.children).toHaveLength(0);
      expect(visuals.worldGroup.children).toHaveLength(0);
      expect(items.canCollect('player')).toBe(true);
      expect(effects.driveModifiers('player')).toEqual({
        speedCapMultiplier: 1,
        accelerationMultiplier: 1,
        ignoreOffRoadSpeedPenalty: false,
        activeBoostLabel: null,
      });
      expect(effects.isItemImmune('player')).toBe(false);
      expect(effects.isRacerContactImmune('player')).toBe(false);
      expect(effects.isGroundHazardImmune('player')).toBe(false);
    }
  }, 30000);
});
