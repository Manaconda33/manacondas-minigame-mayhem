import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import {
  ApexMissileSystem,
  type ApexPhase,
  type ApexTarget,
} from '../src/game/items/ApexMissileSystem';
import { ApexPresentation } from '../src/game/items/ApexPresentation';
import { IncomingApexFixture } from '../src/game/items/IncomingApexFixture';
import { incomingApexFromSearch } from '../src/game/items/ItemTestMode';
import { ProjectileSystem, type ProjectileImpact } from '../src/game/items/ProjectileSystem';
import { currentRaceLeader, targetingProgressSnapshot } from '../src/game/items/ItemTargeting';
import { areaEffectVictims } from '../src/game/items/AreaEffects';
import { APEX_CONFIG as C, ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { effectiveItemWeights } from '../src/game/items/ItemSelector';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import type { RacerProgress } from '../src/game/race/RaceDirector';

const progress = (id: string, lap = 0, trackProgress = 0.5): RacerProgress => ({
  id,
  lap,
  trackProgress,
  finished: false,
  finishPlace: null,
  finishTime: null,
});
const target = (id: string, position = new THREE.Vector3(0, 0.72, -100)): ApexTarget => ({
  id,
  position,
  finished: false,
  forward: new THREE.Vector3(0, 0, 1),
});
const required = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error('Missing fixture');
  return value;
};
function fixture() {
  const track = new CircuitAlpha();
  const projectiles = new ProjectileSystem(track);
  const apex = new ApexMissileSystem(track, projectiles);
  const racers = [progress('player', 0, 0.4), progress('leader')];
  const targets = [target('player', new THREE.Vector3(0, 0.72, -130)), target('leader')];
  const launch = required(targets[0]).position.clone();
  const tick = (dt: number) => apex.update(dt, racers, targets);
  const toPhase = (phase: ApexPhase) => {
    for (let i = 0; i < 900 && apex.snapshot()?.phase !== phase; i++) tick(1 / 60);
    expect(apex.snapshot()?.phase).toBe(phase);
  };
  return { track, projectiles, apex, racers, targets, launch, tick, toPhase };
}

describe('Apex progress and atomic global launch', () => {
  it('chooses validated progress and deterministic ties without mutating input', () => {
    const racers = [
      progress('z', 1, 0.01),
      progress('a', 1, 0.01),
      progress('near', 0, 0.99),
      { ...progress('finished', 4), finished: true },
      progress('invalid', 3, NaN),
      progress('bad-lap', -1),
    ];
    const before = structuredClone(racers);
    expect(currentRaceLeader(racers)?.id).toBe('a');
    expect(racers).toEqual(before);
    expect(currentRaceLeader([progress('bad', 2, 1)])).toBeNull();
    const wrapped = targetingProgressSnapshot(progress('wrapped', 0, 0.001), 0, 0.025);
    expect(currentRaceLeader([wrapped, progress('near', 0, 0.999)])?.id).toBe('wrapped');
  });

  it('uses successful launch time, keeps a competing held charge, and ignores reverse input', () => {
    const f = fixture();
    const inventory = new ItemSystem();
    const effects = new RacerEffects();
    inventory.acquire('player', 'apex-missile');
    inventory.acquire('leader', 'apex-missile');
    inventory.advance(0.85);
    expect(f.apex.available('player', f.racers)).toBe(true);
    const runtime = {
      apexSystem: f.apex,
      racers: f.racers,
      projectileLaunch: {
        position: f.launch,
        forward: new THREE.Vector3(0, 0, 1),
        velocity: new THREE.Vector3(),
      },
    };
    expect(executeItemUse(inventory, effects, 'player', 'backward', runtime)).toBe('activated');
    expect(inventory.heldItem('player')).toBeNull();
    expect(f.apex.snapshot()?.position).toEqual(f.launch);
    f.tick(0.3);
    expect(f.apex.snapshot()?.position.x).toBe(f.launch.x);
    expect(f.apex.snapshot()?.position.z).toBe(f.launch.z);
    expect(f.apex.snapshot()?.position.y).toBeCloseTo((24 + f.launch.y) / 2);
    expect(executeItemUse(inventory, effects, 'leader', 'forward', runtime)).toBe('rejected');
    expect(inventory.heldItem('leader')?.remainingCharges).toBe(1);
    f.apex.cancel();
    f.tick(17.69);
    expect(f.apex.available('leader', f.racers)).toBe(false);
    f.tick(0.01);
    expect(f.apex.available('leader', f.racers)).toBe(true);
    expect(executeItemUse(inventory, effects, 'leader', 'forward', runtime)).toBe('activated');
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('rolls back failed charge commits, reentrant launches and invalid/no-rival activation', () => {
    const f = fixture();
    expect(f.apex.launch('player', f.launch, [required(f.racers[0])])).toBe(false);
    expect(f.apex.launch('player', new THREE.Vector3(NaN, 0, 0), f.racers)).toBe(false);
    expect(f.apex.launch('', f.launch, f.racers)).toBe(false);
    expect(
      f.apex.launch('player', f.launch, f.racers, () => {
        expect(f.apex.launch('leader', f.launch, f.racers)).toBe(false);
        return false;
      }),
    ).toBe(false);
    expect(f.projectiles.activeCount()).toBe(0);
    expect(f.apex.cooldownRemaining()).toBe(0);
    expect(() =>
      f.apex.launch('player', f.launch, f.racers, () => {
        throw new Error('commit');
      }),
    ).toThrow('commit');
    expect(f.projectiles.activeCount()).toBe(0);
    expect(f.apex.available('player', f.racers)).toBe(true);
    required(f.racers[0]).finished = true;
    expect(f.apex.available('player', f.racers)).toBe(false);
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('shares all 40 slots with Kinetic/Seeker throughout sky phases and filters selection', () => {
    const f = fixture();
    const config = required(ITEM_DEFINITIONS['kinetic-disc'].projectile);
    const spawn = () =>
      f.projectiles.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'player',
        direction: 'forward',
        config,
        launch: {
          position: f.launch,
          forward: new THREE.Vector3(0, 0, 1),
          velocity: new THREE.Vector3(),
        },
      });
    for (let i = 0; i < 39; i++) expect(spawn()).not.toBeNull();
    expect(f.apex.launch('player', f.launch, f.racers)).toBe(true);
    expect(f.projectiles.activeCount()).toBe(40);
    expect(spawn()).toBeNull();
    const weights = effectiveItemWeights({
      rank: 8,
      distanceBehindLeaderMeters: 0,
      apexAvailable: f.apex.available('leader', f.racers),
    });
    expect(weights.find((entry) => entry.itemId === 'apex-missile')?.weight).toBe(0);
    expect(
      effectiveItemWeights({ rank: 8, distanceBehindLeaderMeters: 0, apexAvailable: true }).find(
        (entry) => entry.itemId === 'apex-missile',
      )?.weight,
    ).toBe(13);
    f.apex.cancel();
    f.apex.cancel();
    expect(f.projectiles.activeCount()).toBe(39);
    expect(spawn()).not.toBeNull();
    f.tick(18);
    expect(f.apex.launch('player', f.launch, f.racers)).toBe(false);
    f.apex.dispose();
    f.projectiles.dispose();
    expect(f.projectiles.activeCount()).toBe(0);
  });
});

describe('Apex leader lock, movement and blast', () => {
  it('tracks leader changes until lock, then keeps identity including an owner who takes first', () => {
    const f = fixture();
    expect(f.apex.launch('player', f.launch, f.racers)).toBe(true);
    f.tick(0.6);
    required(f.racers[0]).trackProgress = 0.6;
    f.toPhase('warning');
    expect(f.apex.snapshot()?.targetId).toBe('player');
    expect(f.apex.warningFor('player')).toBe('locked');
    required(f.racers[1]).lap = 1;
    f.tick(1);
    expect(f.apex.snapshot()?.targetId).toBe('player');
    const impacts = f.tick(2);
    expect(impacts.some((impact) => impact.targetId === 'player')).toBe(true);
    expect(f.apex.warningFor('player')).toBeNull();
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('changes target before lock after a leader finishes, and cancels target loss after lock', () => {
    const f = fixture();
    f.apex.launch('player', f.launch, f.racers);
    f.tick(0.6);
    required(f.racers[1]).finished = true;
    f.toPhase('warning');
    expect(f.apex.snapshot()?.targetId).toBe('player');
    f.targets.splice(0, 1);
    expect(f.tick(1)).toEqual([]);
    expect(f.apex.snapshot()).toBeNull();
    expect(f.apex.cooldownRemaining()).toBeGreaterThan(0);
    expect(f.projectiles.activeCount()).toBe(0);
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('cancels a locked finished target but an owner finishing does not cancel another target', () => {
    const f = fixture();
    f.apex.launch('player', f.launch, f.racers);
    f.toPhase('warning');
    required(f.racers[0]).finished = true;
    f.tick(0.1);
    expect(f.apex.snapshot()?.targetId).toBe('leader');
    required(f.racers[1]).finished = true;
    expect(f.tick(0.1)).toEqual([]);
    expect(f.apex.snapshot()).toBeNull();
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('warns for 1.9 s then dives for 0.6 s; ignores rails/interceptors and resolves one heavy AoE', () => {
    const f = fixture();
    f.apex.launch('player', f.launch, f.racers);
    f.toPhase('warning');
    const warningAge = required(f.apex.snapshot()).phaseAge;
    f.tick(C.overheadSeconds - warningAge - 0.001);
    expect(f.apex.warningFor('leader')).toBe('locked');
    f.tick(0.001);
    expect(f.apex.warningFor('leader')).toBe('diving');
    const center = required(f.targets[1]).position;
    f.targets.push(
      target('edge', center.clone().add(new THREE.Vector3(5.5, 0, 0))),
      target('outside', center.clone().add(new THREE.Vector3(5.501, 0, 0))),
      { ...target('immune', center.clone()), itemImmune: true },
      { ...target('done', center.clone()), finished: true },
    );
    expect(f.tick(0.599)).toEqual([]);
    const impacts = f.tick(0.001);
    expect(impacts.map((impact) => impact.targetId).sort()).toEqual(['edge', 'leader']);
    expect(impacts.every((impact) => impact.spinoutSeconds === 1.2)).toBe(true);
    expect(f.apex.drainBlasts()).toHaveLength(1);
    expect(f.apex.drainBlasts()).toEqual([]);
    expect(f.tick(20)).toEqual([]);
    expect(f.projectiles.activeCount()).toBe(0);
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('bounds sky movement, expires unreachable attacks and handles invalid target coordinates', () => {
    const f = fixture();
    required(f.targets[1]).position.set(10000, 0.72, -100);
    f.apex.launch('player', f.launch, f.racers);
    f.tick(0.6);
    const before = required(f.apex.snapshot()).position;
    f.tick(0.5);
    expect(required(f.apex.snapshot()).position.distanceTo(before)).toBeCloseTo(48);
    f.tick(20);
    expect(f.apex.snapshot()).toBeNull();
    expect(f.projectiles.activeCount()).toBe(0);
    f.apex.launch('player', f.launch, f.racers);
    required(f.targets[1]).position.x = NaN;
    f.tick(0.1);
    expect(f.apex.snapshot()).toBeNull();
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('bounds dive tracking and can miss a displaced target without teleporting', () => {
    const f = fixture();
    f.apex.launch('player', f.launch, f.racers);
    f.toPhase('dive');
    const before = required(f.apex.snapshot()).position;
    required(f.targets[1]).position.x += 100;
    f.tick(0.2);
    const after = required(f.apex.snapshot()).position;
    expect(new THREE.Vector2(after.x - before.x, after.z - before.z).length()).toBeCloseTo(12);
    expect(after.y).toBeLessThan(before.y);
    expect(f.tick(0.5).some((impact) => impact.targetId === 'leader')).toBe(false);
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it.each([0.01, 0.24, 0.45, 0.8, 0.98])(
    'hits a full-speed moving leader on actual Circuit Alpha at %s',
    (start) => {
      const f = fixture();
      const length = f.track.curve.getLength();
      const leader = required(f.targets[1]);
      const launchU = (start - 45 / length + 1) % 1;
      f.launch.copy(f.track.curve.getPointAt(launchU)).y = 0.72;
      f.apex.launch('player', f.launch, f.racers);
      const impacts: ProjectileImpact[] = [];
      let previous = f.apex.snapshot();
      for (let step = 0; step < 900 && f.apex.snapshot() !== null; step++) {
        const total = start + ((step / 60) * 34.32) / length;
        leader.position.copy(f.track.curve.getPointAt(total % 1)).y = 0.72;
        const p = required(f.racers[1]);
        p.lap = 1 + Math.floor(total);
        p.trackProgress = total % 1;
        impacts.push(...f.tick(1 / 60));
        const next = f.apex.snapshot();
        if (next !== null && previous !== null) {
          expect([next.position.x, next.position.y, next.position.z].every(Number.isFinite)).toBe(
            true,
          );
          if (previous.phase === 'sky' && next.phase === 'sky')
            expect(next.position.distanceTo(previous.position)).toBeLessThanOrEqual(96 / 60 + 1e-8);
        }
        previous = next;
      }
      expect(impacts.some((impact) => impact.targetId === 'leader')).toBe(true);
      expect(f.projectiles.activeCount()).toBe(0);
      f.apex.dispose();
      f.projectiles.dispose();
    },
  );
});

describe('Apex counters, fixtures, pause and cleanup', () => {
  it('allows only terminal pulses within 5 m in 3D, before same-step detonation', () => {
    const f = fixture();
    f.apex.launch('player', f.launch, f.racers);
    for (const phase of ['rise', 'sky', 'warning'] as const) {
      f.toPhase(phase);
      f.apex.queueCounterPulse(required(f.apex.snapshot()).position);
      f.tick(0.001);
      expect(f.apex.snapshot()).not.toBeNull();
    }
    f.toPhase('dive');
    f.apex.queueCounterPulse(required(f.targets[1]).position);
    f.tick(0.01); // Too high above a ground-level pulse.
    expect(f.apex.snapshot()).not.toBeNull();
    f.apex.queueCounterPulse(
      required(f.apex.snapshot())
        .position.clone()
        .add(new THREE.Vector3(5.001, 0, 0)),
    );
    f.tick(0.01);
    expect(f.apex.snapshot()).not.toBeNull();
    f.tick(0.57 - required(f.apex.snapshot()).phaseAge);
    f.apex.queueCounterPulse(required(f.targets[1]).position);
    expect(f.tick(0.1)).toEqual([]);
    expect(f.apex.snapshot()).toBeNull();
    expect(f.apex.drainBlasts()).toEqual([]);
    expect(f.apex.cooldownRemaining()).toBeGreaterThan(0);
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('has inclusive blast boundaries, duplicate suppression and per-racer immunity', () => {
    const center = new THREE.Vector3();
    const inside = target('inside', new THREE.Vector3(3, 20, 4));
    expect(
      areaEffectVictims(center, 5, [
        inside,
        inside,
        { ...inside, id: 'immune', itemImmune: true },
        target('outside', new THREE.Vector3(5.001, 0, 0)),
      ]).map((racer) => racer.id),
    ).toEqual(['inside']);
    expect(areaEffectVictims(center, NaN, [inside])).toEqual([]);
    expect(areaEffectVictims(new THREE.Vector3(Infinity, 0, 0), 5, [inside])).toEqual([]);
  });

  it('freezes phases, warnings and cooldown at zero delta and resets on new race', () => {
    const f = fixture();
    f.apex.launch('player', f.launch, f.racers);
    f.toPhase('warning');
    const snapshot = f.apex.snapshot();
    const cooldown = f.apex.cooldownRemaining();
    f.tick(0);
    f.tick(NaN);
    f.tick(-1);
    expect(f.apex.snapshot()).toEqual(snapshot);
    expect(f.apex.cooldownRemaining()).toBe(cooldown);
    f.apex.dispose();
    expect(f.apex.snapshot()).toBeNull();
    expect(f.apex.warningFor('leader')).toBeNull();
    expect(f.apex.available('player', f.racers)).toBe(true);
    f.projectiles.dispose();
  });

  it('keeps incoming mode explicit, starts at five seconds and targets the actual leader', () => {
    expect(incomingApexFromSearch('')).toBe(false);
    expect(incomingApexFromSearch('?testItem=apex-missile')).toBe(false);
    expect(incomingApexFromSearch('?testApexIncoming=true')).toBe(false);
    expect(incomingApexFromSearch('?testApexIncoming=1')).toBe(true);
    const f = fixture();
    new IncomingApexFixture(false).update(100, f.track, f.apex, f.racers, f.targets);
    expect(f.apex.snapshot()).toBeNull();
    const incoming = new IncomingApexFixture(true);
    incoming.update(4.99, f.track, f.apex, f.racers, f.targets);
    expect(f.apex.snapshot()).toBeNull();
    f.tick(5);
    incoming.update(5, f.track, f.apex, f.racers, f.targets);
    expect(f.apex.snapshot()?.ownerId).toBe('incoming-apex-fixture');
    f.toPhase('warning');
    expect(f.apex.snapshot()?.targetId).toBe('leader');
    expect(f.apex.warningFor('player')).toBeNull();
    f.apex.cancel();
    incoming.update(23, f.track, f.apex, f.racers, f.targets);
    expect(f.apex.snapshot()).toBeNull(); // Fixture time cannot bypass production cooldown.
    f.tick(18);
    incoming.update(30, f.track, f.apex, f.racers, f.targets);
    expect(f.apex.snapshot()).not.toBeNull();
    f.apex.dispose();
    f.projectiles.dispose();
  });

  it('bounds repeated lifecycle/VFX resources and disposes all procedural meshes', () => {
    const f = fixture();
    const visual = new ApexPresentation();
    const disposeSpies: { mock: { calls: unknown[][] } }[] = [];
    visual.group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = object as THREE.Mesh;
        disposeSpies.push(vi.spyOn(mesh.geometry, 'dispose'));
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) disposeSpies.push(vi.spyOn(material, 'dispose'));
      }
    });
    const meshCount = disposeSpies.length;
    for (let launch = 0; launch < 100; launch++) {
      expect(f.apex.launch('player', f.launch, f.racers)).toBe(true);
      f.toPhase('warning');
      visual.update(f.apex.snapshot(), f.targets, [], 1 / 60);
      const before = visual.group.children.map((child) => child.position.clone());
      visual.update(f.apex.snapshot(), f.targets, [], 0);
      expect(visual.group.children.map((child) => child.position)).toEqual(before);
      f.tick(15);
      visual.update(null, f.targets, f.apex.drainBlasts(), 0.1);
      visual.update(null, f.targets, [], 1);
      expect(visual.group.children.every((child) => !child.visible)).toBe(true);
      expect(f.projectiles.activeCount()).toBe(0);
      f.tick(18);
    }
    expect(disposeSpies).toHaveLength(meshCount);
    visual.dispose();
    expect(disposeSpies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
    expect(visual.group.children).toHaveLength(0);
    f.apex.dispose();
    f.projectiles.dispose();
  });
});
