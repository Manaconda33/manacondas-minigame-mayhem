import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { createTrackScene } from '../src/game/track/createTrackScene';
import { SlickGroundSurface } from '../src/game/items/SlickGroundSurface';
import { ChaseCamera } from '../src/game/camera/ChaseCamera';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import {
  ShockwaveSystem,
  shockwavePushDelta,
  type ShockwavePulse,
  type ShockwaveTarget,
} from '../src/game/items/ShockwaveSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { forcedItemFromSearch, shockwaveCounterFromSearch } from '../src/game/items/ItemTestMode';
import { ShockwaveCounterFixture } from '../src/game/items/ShockwaveCounterFixture';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';

function launch(track: CircuitAlpha, progress = 0.2) {
  return {
    position: track.curve.getPointAt(progress).setY(0.72),
    forward: track.curve.getTangentAt(progress),
    velocity: new THREE.Vector3(),
  };
}

function target(
  id: string,
  position: THREE.Vector3,
  overrides: Partial<ShockwaveTarget> = {},
): ShockwaveTarget {
  return { id, position, finished: false, ...overrides };
}

describe('Acoustic Shockwave Pulse', () => {
  it('anchors the visible ring above real road, dirt, boost and ramp surfaces without moving the pulse', () => {
    const track = new CircuitAlpha();
    const scene = createTrackScene(track);
    const ground = new SlickGroundSurface(scene);
    const system = new ShockwaveSystem((position) => ground.at(position));
    for (const progress of [0.1, 0.27, 0.45, 0.5, 0.815]) {
      const center = track.curve.getPointAt(progress);
      if (progress === 0.27) {
        const tangent = track.curve.getTangentAt(progress);
        center.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x), 3.75);
      }
      const surface = ground.at(center);
      if (surface === null) throw new Error('Missing track surface');
      center.y = surface.point.y + 0.34;
      expect(center.y - 0.52).toBeLessThan(surface.point.y);
      const original = center.clone();
      expect(system.activate('player', center)).toBe(true);
      const mesh = system.group.children[0] as THREE.Mesh<
        THREE.RingGeometry,
        THREE.MeshBasicMaterial
      >;
      expect(mesh.position.clone().sub(surface.point).dot(surface.normal)).toBeCloseTo(0.08, 7);
      expect(
        new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion).dot(surface.normal),
      ).toBeCloseTo(1, 7);
      expect(mesh.material.blending).toBe(THREE.NormalBlending);
      expect(mesh.material.depthTest).toBe(true);
      expect(system.drainPulses()[0]?.center).toEqual(original);
      expect(center).toEqual(original);
      system.advance(0.2);
      mesh.updateMatrixWorld(true);
      // Exercise the production camera geometry in landscape and portrait.
      // This is a geometric check, not a substitute for rendered live acceptance.
      for (const rearView of [false, true]) {
        for (const aspect of [16 / 9, 9 / 16]) {
          const camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 900);
          new ChaseCamera(camera).update(center, track.curve.getTangentAt(progress), rearView, 10);
          camera.updateMatrixWorld(true);
          const vertices = mesh.geometry.getAttribute('position');
          let visibleVertices = 0;
          for (let index = 0; index < vertices.count; index += 1) {
            const vertex = new THREE.Vector3()
              .fromBufferAttribute(vertices, index)
              .applyMatrix4(mesh.matrixWorld);
            const supporting = ground.at(vertex);
            const aboveGround = supporting !== null && vertex.y > supporting.point.y;
            vertex.project(camera);
            if (
              aboveGround &&
              Math.abs(vertex.x) < 1 &&
              Math.abs(vertex.y) < 1 &&
              Math.abs(vertex.z) < 1
            )
              visibleVertices += 1;
          }
          expect(visibleVertices).toBeGreaterThan(0);
        }
      }
      const pausedPosition = mesh.position.clone();
      const pausedScale = mesh.scale.clone();
      const pausedOpacity = mesh.material.opacity;
      expect(pausedOpacity).toBeGreaterThan(0);
      system.advance(0);
      expect(mesh.position).toEqual(pausedPosition);
      expect(mesh.scale).toEqual(pausedScale);
      expect(mesh.material.opacity).toBe(pausedOpacity);
      system.advance(0.25);
      expect(system.visualCount()).toBe(0);
      expect(system.group.children).toHaveLength(0);
    }
    system.dispose();
    ground.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = object as THREE.Mesh;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.dispose();
        });
      }
    });
  });

  it('keeps the fallback ring at activation height when no surface is available', () => {
    const system = new ShockwaveSystem(() => null);
    const center = new THREE.Vector3(0, 0.34, 0);
    system.activate('player', center);
    expect(system.group.children[0]?.position).toEqual(center);
    system.dispose();
  });
  it.each(['forward', 'backward'] as const)(
    'commits one charge for %s intent even with no target and queues one centered pulse',
    (direction) => {
      const track = new CircuitAlpha();
      const items = new ItemSystem();
      const effects = new RacerEffects();
      const shockwave = new ShockwaveSystem();
      expect(items.acquire('player', 'shockwave')).toBe(true);
      items.advance(1);
      const origin = launch(track).position;
      expect(
        executeItemUse(items, effects, 'player', direction, {
          shockwaveSystem: shockwave,
          projectileLaunch: {
            position: origin,
            forward: new THREE.Vector3(0, 0, 1),
            velocity: new THREE.Vector3(),
          },
        }),
      ).toBe('activated');
      expect(items.heldItem('player')).toBeNull();
      const pulses = shockwave.drainPulses();
      expect(pulses).toHaveLength(1);
      expect(pulses[0]?.center).toEqual(origin);
      expect(shockwave.visualCount()).toBe(1);
      shockwave.dispose();
    },
  );

  it('retains the charge and creates no pulse or visual when activation cannot commit', () => {
    const items = new ItemSystem();
    const shockwave = new ShockwaveSystem();
    expect(items.acquire('player', 'shockwave')).toBe(true);
    items.advance(1);
    expect(shockwave.activate('player', new THREE.Vector3(), () => false)).toBe(false);
    expect(items.heldItem('player')?.remainingCharges).toBe(1);
    expect(shockwave.pendingCount()).toBe(0);
    expect(shockwave.visualCount()).toBe(0);
    shockwave.dispose();
  });

  it('uses exact governed horizontal push falloff and deterministic finite coincident fallback', () => {
    const pulse: ShockwavePulse = { ownerId: 'owner', center: new THREE.Vector3() };
    const center = shockwavePushDelta(pulse, target('center', new THREE.Vector3()));
    const mid = shockwavePushDelta(pulse, target('mid', new THREE.Vector3(2.5, 100, 0)));
    const edge = shockwavePushDelta(pulse, target('edge', new THREE.Vector3(5, -100, 0)));
    expect(center?.length()).toBeCloseTo(6, 8);
    expect(mid?.length()).toBeCloseTo(4, 8);
    expect(edge?.length()).toBeCloseTo(2, 8);
    expect(center?.toArray().every(Number.isFinite)).toBe(true);
    expect(shockwavePushDelta(pulse, target('center', new THREE.Vector3()))).toEqual(center);
    expect(
      shockwavePushDelta(pulse, target('outside', new THREE.Vector3(5.0001, 0, 0))),
    ).toBeNull();
    expect(shockwavePushDelta(pulse, target('owner', new THREE.Vector3(1, 0, 0)))).toBeNull();
    expect(
      shockwavePushDelta(pulse, target('finished', new THREE.Vector3(1, 0, 0), { finished: true })),
    ).toBeNull();
    expect(
      shockwavePushDelta(pulse, target('immune', new THREE.Vector3(1, 0, 0), { itemImmune: true })),
    ).toBeNull();
  });

  it('queues all three counter boundaries at 5m and returns only eligible racer pushes', () => {
    const calls: string[] = [];
    const shockwave = new ShockwaveSystem();
    const pulse: ShockwavePulse = { ownerId: 'owner', center: new THREE.Vector3(1, 2, 3) };
    const pushes = shockwave.dispatch(pulse, {
      projectileSystem: {
        queueClearWithinRadius: (center, radius) =>
          calls.push(['p', String(center.x), String(radius)].join(':')),
      },
      hazardSystem: {
        queueClearWithinRadius: (center, radius) =>
          calls.push(['h', String(center.x), String(radius)].join(':')),
      },
      apexSystem: { queueCounterPulse: (center) => calls.push(['a', String(center.x)].join(':')) },
      targets: [
        target('inside', new THREE.Vector3(4, 500, 3)),
        target('owner', new THREE.Vector3(2, 2, 3)),
        target('outside', new THREE.Vector3(6.001, 2, 3)),
      ],
    });
    expect(calls).toEqual(['p:1:5', 'h:1:5', 'a:1']);
    expect(pushes.map(({ targetId }) => targetId)).toEqual(['inside']);
    expect(pushes[0]?.velocityDelta.y).toBe(0);
  });

  it('clears Kinetic and Seeker before movement while preserving outside ordinary projectiles and capacity', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const projectiles = new ProjectileSystem(track, capacity);
    const kinetic = ITEM_DEFINITIONS['kinetic-disc'].projectile;
    const seeker = ITEM_DEFINITIONS['seeker-drone'].projectile;
    expect(kinetic).toBeDefined();
    expect(seeker).toBeDefined();
    if (kinetic === undefined || seeker === undefined) return;

    const insideId = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner-a',
      direction: 'forward',
      config: kinetic,
      launch: launch(track, 0.2),
    });
    const outsideId = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner-b',
      direction: 'forward',
      config: kinetic,
      launch: launch(track, 0.45),
    });
    expect(insideId).not.toBeNull();
    expect(outsideId).not.toBeNull();
    const inside = projectiles.snapshots().find(({ id }) => id === insideId);
    expect(inside).toBeDefined();
    if (inside === undefined) return;
    projectiles.queueClearWithinRadius(
      inside.position.clone().add(new THREE.Vector3(0, 100, 0)),
      5,
    );
    expect(projectiles.update(1 / 60, [])).toEqual([]);
    expect(projectiles.snapshots().some(({ id }) => id === insideId)).toBe(false);
    expect(projectiles.snapshots().some(({ id }) => id === outsideId)).toBe(true);

    const seekerId = projectiles.spawn({
      itemId: 'seeker-drone',
      ownerId: 'owner-c',
      targetId: 'target',
      direction: 'forward',
      config: seeker,
      launch: launch(track, 0.6),
    });
    expect(seekerId).not.toBeNull();
    const seekerSnapshot = projectiles.snapshots().find(({ id }) => id === seekerId);
    expect(seekerSnapshot).toBeDefined();
    if (seekerSnapshot === undefined) return;
    const targetSnapshot: ProjectileTarget = {
      id: 'target',
      position: seekerSnapshot.position.clone().add(new THREE.Vector3(25, 0, 0)),
      velocity: new THREE.Vector3(),
      forward: new THREE.Vector3(0, 0, 1),
      finished: false,
    };
    projectiles.queueClearWithinRadius(
      seekerSnapshot.position.clone().add(new THREE.Vector3(0, -100, 0)),
      5,
    );
    expect(projectiles.update(1 / 60, [targetSnapshot])).toEqual([]);
    expect(projectiles.snapshots().some(({ id }) => id === seekerId)).toBe(false);
    expect(capacity.count()).toBe(1);
    projectiles.dispose();
    expect(capacity.count()).toBe(0);
  });

  it.each([
    { offset: 4.9999, cleared: true },
    { offset: 5, cleared: true },
    { offset: 5.0001, cleared: false },
  ])('uses the exact horizontal projectile-clear boundary at $offset m', ({ offset, cleared }) => {
    const track = new CircuitAlpha();
    const projectiles = new ProjectileSystem(track);
    const config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
    expect(config).toBeDefined();
    if (config === undefined) return;
    const id = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner',
      direction: 'forward',
      config,
      launch: launch(track),
    });
    expect(id).not.toBeNull();
    const position = projectiles.snapshots().find((snapshot) => snapshot.id === id)?.position;
    expect(position).toBeDefined();
    if (id === null || position === undefined) return;
    projectiles.queueClearWithinRadius(position.clone().add(new THREE.Vector3(offset, 100, 0)), 5);
    projectiles.update(1e-6, []);
    expect(projectiles.snapshots().some((snapshot) => snapshot.id === id)).toBe(!cleared);
    projectiles.dispose();
  });

  it('lets a queued hazard clear win the same frame over Slick trigger and preserves outside hazard', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const hazards = new HazardSystem(track, capacity);
    const center = track.curve.getPointAt(0.3);
    const inside = hazards.placeSlick('owner', center.clone());
    const outside = hazards.placeSlick('other', center.clone().add(new THREE.Vector3(0, 0, 5.001)));
    expect(inside).not.toBeNull();
    expect(outside).not.toBeNull();
    const actual = hazards.slickSnapshots().find(({ id }) => id === inside)?.position;
    expect(actual).toBeDefined();
    if (actual === undefined) return;
    hazards.queueClearWithinRadius(actual, 5);
    const overlapping: ProjectileTarget = {
      id: 'rival',
      position: actual.clone(),
      velocity: new THREE.Vector3(),
      forward: new THREE.Vector3(0, 0, 1),
      finished: false,
    };
    expect(hazards.update(0.01, [overlapping])).toEqual([]);
    expect(hazards.slickSnapshots().some(({ id }) => id === inside)).toBe(false);
    expect(hazards.slickSnapshots().some(({ id }) => id === outside)).toBe(true);
  });

  it('parses a forced Shockwave and counter fixture together', () => {
    const search = '?testItem=shockwave&testShockwaveCounter=kinetic';
    expect(forcedItemFromSearch(search)).toBe('shockwave');
    expect(shockwaveCounterFromSearch(search)).toBe('kinetic');
    expect(shockwaveCounterFromSearch('?testShockwaveCounter=kinetic')).toBe('kinetic');
    expect(shockwaveCounterFromSearch('?testShockwaveCounter=bogus')).toBeNull();
    expect(shockwaveCounterFromSearch('')).toBeNull();
  });

  it('waits for a revealed held Shockwave before placing one inward Slick fixture', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const projectiles = new ProjectileSystem(track, capacity);
    const hazards = new HazardSystem(track, capacity);
    const apex = new ApexMissileSystem(track, projectiles);
    const fixture = new ShockwaveCounterFixture('slick');
    const player = track.curve.getPointAt(0.4).setY(0.72);
    const racers = [
      {
        id: 'player',
        lap: 0,
        trackProgress: 0.4,
        finished: false,
        finishTime: null,
        finishPlace: null,
      },
      {
        id: 'rival',
        lap: 0,
        trackProgress: 0.5,
        finished: false,
        finishTime: null,
        finishPlace: null,
      },
    ];
    const targets: ProjectileTarget[] = [
      {
        id: 'player',
        position: player,
        velocity: new THREE.Vector3(),
        forward: track.curve.getTangentAt(0.4),
        finished: false,
      },
    ];
    fixture.update(false, false, player, track, projectiles, hazards, apex, racers, targets);
    expect(hazards.activeCount()).toBe(0);
    expect(fixture.badge()).toContain('COLLECT THE FORCED SHOCKWAVE');
    fixture.update(false, true, player, track, projectiles, hazards, apex, racers, targets);
    fixture.update(false, true, player, track, projectiles, hazards, apex, racers, targets);
    expect(hazards.activeCount()).toBe(1);
    const slick = hazards.slickSnapshots()[0];
    expect(slick).toBeDefined();
    expect(
      new THREE.Vector2(slick?.position.x, slick?.position.z).distanceTo(
        new THREE.Vector2(player.x, player.z),
      ),
    ).toBeCloseTo(3.5, 5);
    expect(fixture.badge()).toContain('SLICK 3.5m INWARD');
  });

  it('places production Kinetic, Seeker, Blast, and Apex scenarios only when actionable', () => {
    const track = new CircuitAlpha();
    const player = track.curve.getPointAt(0.4).setY(0.72);
    const racers = [
      {
        id: 'player',
        lap: 0,
        trackProgress: 0.4,
        finished: false,
        finishTime: null,
        finishPlace: null,
      },
      {
        id: 'rival',
        lap: 0,
        trackProgress: 0.5,
        finished: false,
        finishTime: null,
        finishPlace: null,
      },
    ];
    const targets: ProjectileTarget[] = [
      {
        id: 'player',
        position: player,
        velocity: new THREE.Vector3(),
        forward: track.curve.getTangentAt(0.4),
        finished: false,
      },
      {
        id: 'rival',
        position: track.curve.getPointAt(0.5).setY(0.72),
        velocity: new THREE.Vector3(),
        forward: track.curve.getTangentAt(0.5),
        finished: false,
      },
    ];
    const makeSystems = () => {
      const capacity = new ItemPhysicsCapacity();
      const projectiles = new ProjectileSystem(track, capacity);
      return {
        projectiles,
        hazards: new HazardSystem(track, capacity),
        apex: new ApexMissileSystem(track, projectiles),
      };
    };

    for (const [mode, itemId, ownerId] of [
      ['kinetic', 'kinetic-disc', 'shockwave-counter-kinetic-fixture'],
      ['seeker', 'seeker-drone', 'shockwave-counter-seeker-fixture'],
    ] as const) {
      const systems = makeSystems();
      const fixture = new ShockwaveCounterFixture(mode);
      fixture.update(
        false,
        true,
        player,
        track,
        systems.projectiles,
        systems.hazards,
        systems.apex,
        racers,
        targets,
      );
      expect(systems.projectiles.snapshots()).toEqual([
        expect.objectContaining({ itemId, ownerId, targetId: mode === 'seeker' ? 'player' : null }),
      ]);
    }

    const blastSystems = makeSystems();
    new ShockwaveCounterFixture('blast').update(
      false,
      true,
      player,
      track,
      blastSystems.projectiles,
      blastSystems.hazards,
      blastSystems.apex,
      racers,
      targets,
    );
    const blast = blastSystems.hazards.snapshots()[0];
    expect(blast?.ownerId).toBe('shockwave-counter-blast-fixture');
    expect(
      new THREE.Vector2(blast?.position.x, blast?.position.z).distanceTo(
        new THREE.Vector2(player.x, player.z),
      ),
    ).toBeCloseTo(3.5, 5);

    const apexSystems = makeSystems();
    const apexFixture = new ShockwaveCounterFixture('apex');
    apexFixture.update(
      false,
      true,
      player,
      track,
      apexSystems.projectiles,
      apexSystems.hazards,
      apexSystems.apex,
      racers,
      targets,
    );
    expect(apexSystems.apex.snapshot()).toBeNull();
    expect(apexFixture.badge()).toContain('DRIVE INTO FIRST');
    const playerRacer = racers.find(({ id }) => id === 'player');
    if (playerRacer === undefined) throw new Error('Missing player fixture');
    playerRacer.trackProgress = 0.6;
    apexFixture.update(
      false,
      true,
      player,
      track,
      apexSystems.projectiles,
      apexSystems.hazards,
      apexSystems.apex,
      racers,
      targets,
    );
    expect(apexSystems.apex.snapshot()).toMatchObject({
      ownerId: 'shockwave-counter-apex-fixture',
      phase: 'rise',
    });
  });

  it('keeps pulse VFX finite and reset/disposal clears pending and presentation state', () => {
    const system = new ShockwaveSystem();
    expect(system.activate('player', new THREE.Vector3(0, 1, 0))).toBe(true);
    expect(system.pendingCount()).toBe(1);
    expect(system.visualCount()).toBe(1);
    system.advance(0.2);
    expect(system.visualCount()).toBe(1);
    system.advance(1);
    expect(system.visualCount()).toBe(0);
    expect(system.pendingCount()).toBe(1);
    system.reset();
    expect(system.pendingCount()).toBe(0);
    expect(system.visualCount()).toBe(0);
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });
});
