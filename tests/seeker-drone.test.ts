import { IncomingSeekerFixture } from '../src/game/items/IncomingSeekerFixture';
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CircuitAlpha, type TrackProjection } from '../src/game/track/CircuitAlpha';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { nearestRacerAhead, targetingProgressSnapshot } from '../src/game/items/ItemTargeting';
import { effectiveItemWeights } from '../src/game/items/ItemSelector';
import { steerSeeker } from '../src/game/items/SeekerGuidance';
import { incomingSeekerFromSearch } from '../src/game/items/ItemTestMode';
import { seekerThreats, SeekerWarningVisual } from '../src/game/items/SeekerWarnings';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing test fixture value');
  return value;
}
const config = required(ITEM_DEFINITIONS['seeker-drone'].projectile);
const progress = (id: string, lap: number, trackProgress: number, finished = false) => ({
  id,
  lap,
  trackProgress,
  finished,
  finishPlace: null,
  finishTime: null,
});

class StraightTrack extends CircuitAlpha {
  public constructor() {
    super();
    const length = this.sampleSpacing * this.sampleCount;
    this.curve.getPointAt = (u: number) => new THREE.Vector3(0, 0, u * length);
  }
  public override project(position: THREE.Vector3): TrackProjection {
    return {
      index: 0,
      progress: position.z / (this.sampleSpacing * this.sampleCount),
      point: new THREE.Vector3(0, 0, position.z),
      tangent: new THREE.Vector3(0, 0, 1),
      lateralDistance: Math.abs(position.x),
      lateralOffset: position.x,
      surface: 'asphalt',
    };
  }
}
function launch(track: CircuitAlpha, u = 0.1) {
  return {
    position: track.curve.getPointAt(u).setY(0.72),
    forward:
      track instanceof StraightTrack ? new THREE.Vector3(0, 0, 1) : track.curve.getTangentAt(u),
    velocity: new THREE.Vector3(0, 0, 100),
  };
}
function spawn(system: ProjectileSystem, track: CircuitAlpha, u = 0.1) {
  return system.spawn({
    itemId: 'seeker-drone',
    ownerId: 'player',
    targetId: 'target',
    direction: 'backward',
    config,
    launch: launch(track, u),
  });
}
function target(position: THREE.Vector3, speed = 0): ProjectileTarget {
  return {
    id: 'target',
    position,
    forward: new THREE.Vector3(0, 0, 1),
    velocity: new THREE.Vector3(0, 0, speed),
    finished: false,
  };
}

describe('Seeker progress targeting and dispatch', () => {
  it('uses lap progress across the finish wrap, excludes invalid/finished/self and resolves ties by ID', () => {
    const racers = [
      progress('player', 0, 0.98),
      progress('behind', 0, 0.97),
      progress('far', 1, 0.3),
      progress('b', 1, 0.01),
      progress('a', 1, 0.01),
      progress('finished', 1, 0, true),
      progress('invalid', 2, NaN),
    ];
    const before = structuredClone(racers);
    expect(nearestRacerAhead('player', racers)?.id).toBe('a');
    expect(racers).toEqual(before);
    expect(nearestRacerAhead('missing', racers)).toBeNull();
    expect(nearestRacerAhead('finished', racers)).toBeNull();
    expect(nearestRacerAhead('player', [required(racers[0])])).toBeNull();
  });
  it('filters Seeker through the selector runtime prerequisite without changing base weights', () => {
    const racers = [progress('player', 1, 0.5), progress('behind', 1, 0.4)];
    const filtered = effectiveItemWeights({
      rank: 2,
      distanceBehindLeaderMeters: 0,
      isRuntimeEligible: (id) =>
        id !== 'seeker-drone' || nearestRacerAhead('player', racers) !== null,
    });
    expect(filtered.find((x) => x.itemId === 'seeker-drone')?.weight).toBe(0);
    expect(
      effectiveItemWeights({ rank: 2, distanceBehindLeaderMeters: 0 }).find(
        (x) => x.itemId === 'seeker-drone',
      )?.weight,
    ).toBe(8);
  });
  it('preserves a held charge on no target and consumes only a valid forward launch', () => {
    const track = new StraightTrack();
    const system = new ProjectileSystem(track);
    const items = new ItemSystem();
    const effects = new RacerEffects();
    items.acquire('player', 'seeker-drone');
    items.advance(0.85);
    const runtime = {
      projectileSystem: system,
      projectileLaunch: launch(track),
      racers: [progress('player', 0, 0.1)],
    };
    expect(executeItemUse(items, effects, 'player', 'backward', runtime)).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(1);
    runtime.racers.push(progress('target', 0, 0.2));
    expect(executeItemUse(items, effects, 'player', 'backward', runtime)).toBe('activated');
    expect(items.canCollect('player')).toBe(true);
    expect(system.snapshots()[0]?.targetId).toBe('target');
    expect(system.snapshots()[0]?.velocity.z).toBe(42);
    system.dispose();
  });
  it('requires an explicit incoming test parameter, independent of item forcing', () => {
    for (const search of [
      '',
      '?testItem=seeker-drone',
      '?testSeekerIncoming=true',
      '?testSeekerIncoming=0',
    ])
      expect(incomingSeekerFromSearch(search)).toBe(false);
    expect(incomingSeekerFromSearch('?testSeekerIncoming=1')).toBe(true);
  });
});

describe('Seeker physical travel', () => {
  it.each(['aa-09', 'aa-10', 'ai-max'])(
    'catches %s normal full speed from 30m in a straight corridor',
    (id) => {
      const track = new StraightTrack();
      const system = new ProjectileSystem(track);
      const speed =
        createKartTuning(characterById(id === 'ai-max' ? 'aa-10' : id).stats).maxSpeed *
        (id === 'ai-max' ? 1.04 : 1);
      spawn(system, track);
      const racer = target(launch(track).position.add(new THREE.Vector3(0, 0, 30)), speed);
      let hit = false;
      for (let frame = 0; frame < 240 && !hit; frame++) {
        racer.position.z += speed / 60;
        hit = system.update(1 / 60, [racer]).some((x) => x.targetId === 'target');
      }
      expect(hit).toBe(true);
      expect(system.activeCount()).toBe(0);
      system.dispose();
    },
  );
  it.each([0, 0.2, 0.4, 0.6, 0.8])(
    'pursues around actual Circuit Alpha from progress %s',
    (start) => {
      const track = new CircuitAlpha();
      const system = new ProjectileSystem(track);
      spawn(system, track, start);
      const length = track.curve.getLength();
      let hit = false;
      for (let frame = 0; frame < 360 && !hit; frame++) {
        const u = (start + (30 + ((frame + 1) * 33) / 60) / length) % 1;
        const racer = target(track.curve.getPointAt(u).setY(0.72));
        required(racer.velocity).copy(track.curve.getTangentAt(u)).multiplyScalar(33);
        hit = system.update(1 / 60, [racer]).length > 0;
      }
      expect(hit).toBe(true);
      expect(system.activeCount()).toBe(0);
      system.dispose();
    },
  );
  it('limits speed, acceleration, and turning on every guidance step', () => {
    const track = new StraightTrack();
    const position = launch(track).position;
    const velocity = new THREE.Vector3(0, 0, 42);
    for (let frame = 0; frame < 240; frame++) {
      const previous = velocity.clone();
      steerSeeker(
        track,
        position,
        velocity,
        position.clone().add(new THREE.Vector3(8, 0, 4)),
        new THREE.Vector3(0, 0, frame < 120 ? 100 : 0),
        1 / 60,
      );
      expect(Math.abs(velocity.length() - previous.length())).toBeLessThanOrEqual(20 / 60 + 1e-8);
      expect(velocity.angleTo(previous)).toBeLessThanOrEqual((120 * Math.PI) / 180 / 60 + 1e-8);
      expect(velocity.length()).toBeGreaterThanOrEqual(42 - 1e-8);
      expect(velocity.length()).toBeLessThanOrEqual(56 + 1e-8);
    }
  });
  it('does not damage any racer before arming, then permits owner interception', () => {
    const track = new StraightTrack();
    const system = new ProjectileSystem(track);
    spawn(system, track);
    const ahead = target(launch(track).position.add(new THREE.Vector3(0, 0, 100)));
    for (let frame = 0; frame < 29; frame++) {
      const owner = {
        ...target(
          required(system.snapshots()[0])
            .position.clone()
            .add(new THREE.Vector3(0, 0, 0.7)),
        ),
        id: 'player',
      };
      expect(system.update(1 / 60, [ahead, owner])).toEqual([]);
    }
    let impacts = 0;
    for (let frame = 0; frame < 3 && system.activeCount(); frame++) {
      const owner = {
        ...target(
          required(system.snapshots()[0])
            .position.clone()
            .add(new THREE.Vector3(0, 0, 0.7)),
        ),
        id: 'player',
      };
      const result = system.update(1 / 60, [ahead, owner]);
      if (result.length) {
        expect(result[0]?.targetId).toBe('player');
        expect(result[0]?.spinoutSeconds).toBe(0.85);
      }
      impacts += result.length;
    }
    expect(impacts).toBe(1);
    system.dispose();
  });
  it('expires on target finish/removal, does not switch to an alternative', () => {
    for (const finished of [false, true]) {
      const track = new StraightTrack();
      const system = new ProjectileSystem(track);
      spawn(system, track);
      const other = { ...target(launch(track).position), id: 'other' };
      system.update(0.1, finished ? [{ ...other, id: 'target', finished: true }, other] : [other]);
      expect(system.activeCount()).toBe(0);
      expect(system.drainSeekerResolutions()[0]?.reason).toBe(
        finished ? 'target-finished' : 'target-lost',
      );
      system.dispose();
    }
  });
  it('destroys at rails with no bounce and rejects invalid launches', () => {
    const track = new StraightTrack();
    const system = new ProjectileSystem(track);
    const side = launch(track);
    side.position.x = 8;
    side.forward.set(1, 0, 0);
    expect(
      system.spawn({
        itemId: 'seeker-drone',
        ownerId: 'player',
        direction: 'forward',
        config,
        launch: side,
      }),
    ).toBeNull();
    system.spawn({
      itemId: 'seeker-drone',
      ownerId: 'player',
      targetId: 'target',
      direction: 'forward',
      config,
      launch: side,
    });
    expect(
      system.update(1 / 60, [target(launch(track).position.add(new THREE.Vector3(0, 0, 100)))]),
    ).toEqual([]);
    expect(system.activeCount()).toBe(0);
    expect(system.drainSeekerResolutions()[0]?.reason).toBe('guardrail');
    system.dispose();
  });
  it('expires at 12s, freezes at zero dt and clears every object on disposal', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    spawn(system, track);
    const before = system.snapshots();
    system.update(0, []);
    system.update(NaN, []);
    expect(system.snapshots()).toEqual(before);
    for (let frame = 0; frame < 719; frame++) {
      const u =
        (0.1 + 250 / track.curve.getLength() + (frame * 56) / 60 / track.curve.getLength()) % 1;
      const racer = target(track.curve.getPointAt(u).setY(0.72), 56);
      system.update(1 / 60, [racer]);
    }
    expect(system.activeCount()).toBe(1);
    const racer = target(track.curve.getPointAt(0.2));
    system.update(1 / 60, [racer]);
    expect(system.activeCount()).toBe(0);
    expect(system.drainSeekerResolutions()[0]?.reason).toBe('expired');
    spawn(system, track);
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });
  it('shares the 40-object cap with Kinetic and preserves rejected inventory', () => {
    const track = new StraightTrack();
    const system = new ProjectileSystem(track);
    for (let index = 0; index < 39; index++)
      system.spawn({
        itemId: 'kinetic-disc',
        ownerId: 'p',
        direction: 'forward',
        config: required(ITEM_DEFINITIONS['kinetic-disc'].projectile),
        launch: launch(track),
      });
    expect(spawn(system, track)).not.toBeNull();
    expect(spawn(system, track)).toBeNull();
    const items = new ItemSystem();
    items.acquire('player', 'seeker-drone');
    items.advance(0.85);
    expect(
      executeItemUse(items, new RacerEffects(), 'player', 'forward', {
        projectileSystem: system,
        projectileLaunch: launch(track),
        racers: [progress('player', 0, 0.1), progress('target', 0, 0.2)],
      }),
    ).toBe('rejected');
    expect(items.heldItem('player')?.remainingCharges).toBe(1);
    system.dispose();
  });
});

describe('Seeker warning lifecycle', () => {
  it('escalates, chooses the most urgent overlapping threat and removes expired markers', () => {
    const track = new StraightTrack();
    const system = new ProjectileSystem(track);
    spawn(system, track);
    const shot = required(system.snapshots()[0]);
    const atDistance = (d: number) =>
      target(shot.position.clone().add(new THREE.Vector3(0, 0, d)), 32);
    expect(seekerThreats([shot], [atDistance(40)])[0]?.level).toBe(1);
    expect(seekerThreats([shot], [atDistance(20)])[0]?.level).toBe(2);
    expect(seekerThreats([shot], [atDistance(5)])[0]?.level).toBe(3);
    const farther = {
      ...shot,
      id: 999,
      position: shot.position.clone().add(new THREE.Vector3(0, 0, -100)),
    };
    const threats = seekerThreats([farther, shot], [atDistance(5)]);
    expect(threats).toHaveLength(1);
    expect(threats[0]?.level).toBe(3);
    const visual = new SeekerWarningVisual();
    visual.update(threats, [atDistance(5)], 1);
    expect(visual.group.children).toHaveLength(1);
    const scale = required(visual.group.children[0]).scale.clone();
    visual.update(threats, [atDistance(5)], 1);
    expect(required(visual.group.children[0]).scale).toEqual(scale);
    visual.update([], [], 2);
    expect(visual.group.children).toHaveLength(0);
    expect(seekerThreats([shot], [{ ...atDistance(5), finished: true }])).toEqual([]);
    visual.dispose();
    system.dispose();
  });
});

it('incoming fixture is disabled normally, targets only the player, and freezes with race time', () => {
  const track = new CircuitAlpha();
  const system = new ProjectileSystem(track);
  const position = track.curve.getPointAt(0.4);
  const disabled = new IncomingSeekerFixture(false);
  disabled.update(100, false, position, track, system);
  expect(system.activeCount()).toBe(0);
  const fixture = new IncomingSeekerFixture(true);
  fixture.update(4, false, position, track, system);
  expect(system.activeCount()).toBe(0);
  fixture.update(5, false, position, track, system);
  expect(system.snapshots().map((shot) => [shot.ownerId, shot.targetId])).toEqual([
    ['incoming-seeker-fixture', 'player'],
  ]);
  fixture.update(5, false, position, track, system);
  expect(system.activeCount()).toBe(1);
  fixture.update(21, true, position, track, system);
  expect(system.activeCount()).toBe(1);
  fixture.update(21, false, position, track, system);
  expect(system.activeCount()).toBe(2);
  system.dispose();
  expect(system.group.children).toHaveLength(0);
});

it('preserves targeting order through the wrapped segment before Circuit Alpha finish gate', () => {
  const beforeGate = progress('target', 0, 0.01);
  const owner = progress('player', 0, 0.99);
  const normalized = targetingProgressSnapshot(beforeGate, 0, 0.025);
  expect(nearestRacerAhead('player', [owner, normalized])?.id).toBe('target');
  expect(beforeGate.lap).toBe(0);
  expect(targetingProgressSnapshot(progress('target', 1, 0.026), 1, 0.025).lap).toBe(1);
  expect(targetingProgressSnapshot(beforeGate, 1, 0.025).lap).toBe(0);
});
