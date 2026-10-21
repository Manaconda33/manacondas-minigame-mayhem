import { ArcBladeFlight, arcCoordinates } from '../src/game/items/ArcBlade';
import { guardrailContact } from '../src/game/track/GuardrailSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import * as THREE from 'three';
import { expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { projectTrackSurface } from '../src/game/track/TrackSurface';
import { steerSeeker } from '../src/game/items/SeekerGuidance';

it('samples tunnel support without changing exact main-route projection', () => {
  const track = new NeonGrid(),
    tunnel = track.serviceTunnel;
  const p = tunnel.curve.getPointAt(0.5).add(new THREE.Vector3(0, 0.5, 0));
  expect(projectTrackSurface(track, p).pathId).toBe('service-tunnel');
  expect(projectTrackSurface(track, p).point.y).toBeCloseTo(-4);
  expect(track.project(p).pathId).toBeUndefined();
  const street = track.curve.getPointAt(0.35).add(new THREE.Vector3(0, 0.5, 0));
  expect(projectTrackSurface(track, street).pathId).toBeUndefined();
});
it('keeps a distant tunnel seeker on its physical corridor instead of the crossed street', () => {
  const track = new NeonGrid(),
    tunnel = track.serviceTunnel;
  const p = tunnel.curve.getPointAt(0.4).add(new THREE.Vector3(0, 0.5, 0));
  const target = tunnel.curve.getPointAt(0.8).add(new THREE.Vector3(0, 0.5, 0));
  const heading = tunnel.curve.getTangentAt(0.4).setY(0).normalize();
  const velocity = heading.clone().multiplyScalar(30);
  for (let i = 0; i < 30; i++) steerSeeker(track, p, velocity, target, new THREE.Vector3(), 1 / 60);
  expect(velocity.clone().normalize().dot(heading)).toBeGreaterThan(0.98);
});

it('keeps shared item boundaries on the tunnel and launches below its roof', () => {
  const track = new NeonGrid(),
    tunnel = track.serviceTunnel;
  const position = tunnel.curve.getPointAt(0.5).add(new THREE.Vector3(0, 0.72, 0));
  expect(guardrailContact(track, position, 0.5)).toBeNull();
  const hazards = new HazardSystem(track, new ItemPhysicsCapacity());
  expect(hazards.placeSlick('player', position)).not.toBeNull();
  const slick = hazards.activeSnapshots()[0];
  expect(slick?.position.distanceTo(position)).toBeLessThan(1);
  expect(slick?.position.y).toBeLessThan(-3);
  const projectiles = new ProjectileSystem(track);
  const config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
  if (!config) throw new Error('Missing projectile config');
  expect(
    projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config,
      launch: { position, forward: tunnel.curve.getTangentAt(0.5), velocity: new THREE.Vector3() },
    }),
  ).not.toBeNull();
  expect(projectiles.snapshots()[0]?.position.y).toBeLessThan(-3);
  projectiles.update(1 / 60, []);
  expect(projectiles.snapshots()).toHaveLength(1);
  expect(projectiles.snapshots()[0]?.position.y).toBeLessThan(-3);
  hazards.dispose();
  projectiles.dispose();
});

it('does not award Slick or ordinary projectile contact through the crossing street', () => {
  const track = new NeonGrid(),
    tunnel = track.serviceTunnel,
    p = tunnel.curve.getPointAt(0.3),
    heading = tunnel.curve.getTangentAt(0.3);
  const hazards = new HazardSystem(track, new ItemPhysicsCapacity());
  hazards.placeSlick('player', p);
  const street = {
    id: 'street',
    position: p.clone().setY(0.5),
    forward: heading,
    velocity: new THREE.Vector3(),
    finished: false,
  };
  expect(hazards.update(1, [street])).toHaveLength(0);
  expect(hazards.activeSnapshots()).toHaveLength(1);
  const underground = {
    ...street,
    id: 'underground',
    position: p.clone().add(new THREE.Vector3(0, 0.5, 0)),
  };
  expect(hazards.update(1 / 60, [underground])).toHaveLength(1);
  const shots = new ProjectileSystem(track),
    config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
  if (!config) throw new Error('Missing config');
  shots.spawn({
    itemId: 'kinetic-disc',
    ownerId: 'player',
    direction: 'forward',
    config,
    launch: {
      position: p.clone().add(new THREE.Vector3(0, 0.72, 0)),
      forward: heading,
      velocity: new THREE.Vector3(),
    },
  });
  const shot = shots.snapshots()[0];
  if (!shot) throw new Error('Missing shot');
  expect(
    shots.update(0.2, [
      { ...street, position: shot.position.clone().addScaledVector(heading, 8).setY(0.5) },
    ]),
  ).toHaveLength(0);
  hazards.dispose();
  shots.dispose();
});

it('keeps blast victims, clears and Arc contacts on their physical layer', () => {
  const track = new NeonGrid(),
    tunnel = track.serviceTunnel,
    p = tunnel.curve.getPointAt(0.4),
    heading = tunnel.curve.getTangentAt(0.4).setY(0).normalize();
  const hazards = new HazardSystem(track, new ItemPhysicsCapacity());
  const underground = {
    id: 'under',
    position: p.clone().add(new THREE.Vector3(0, 0.5, 0)),
    forward: heading,
    velocity: new THREE.Vector3(),
    finished: false,
  };
  const street = { ...underground, id: 'street', position: underground.position.clone().setY(0.5) };
  hazards.placeBlastOrb('owner', p);
  const impacts = hazards.update(4, [street, underground]);
  expect(impacts.map((hit) => hit.targetId)).toEqual(['under']);
  hazards.placeSlick('owner', p);
  hazards.queueClearWithinRadius(street.position, 5);
  hazards.update(1 / 60, []);
  expect(hazards.activeSnapshots()).toHaveLength(1);
  hazards.queueClearWithinRadius(underground.position, 5);
  hazards.update(1 / 60, []);
  expect(hazards.activeSnapshots()).toHaveLength(0);
  const origin = p.clone().add(new THREE.Vector3(0, 0.72, 0));
  const arc = new ArcBladeFlight(origin, heading);
  const coordinates = arcCoordinates(8),
    right = new THREE.Vector3(heading.z, 0, -heading.x);
  const victim = origin
    .clone()
    .addScaledVector(heading, coordinates.forward)
    .addScaledVector(right, coordinates.right)
    .setY(0.5);
  const contacts: string[] = [];
  const owner = { ...underground, id: 'owner', position: origin };
  arc.update(
    0.4,
    'owner',
    [owner, { ...street, position: victim }],
    track,
    (target) => contacts.push(target.id),
    () => {
      /* No presentation callback is needed for this contact regression. */
    },
    () => {
      /* No presentation callback is needed for this contact regression. */
    },
  );
  expect(contacts).toHaveLength(0);
  hazards.dispose();
});
