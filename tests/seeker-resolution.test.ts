import * as THREE from 'three';
import { expect, it } from 'vitest';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { ProjectileSystem, type SeekerResolution } from '../src/game/items/ProjectileSystem';
import {
  IncomingSeekerFixture,
  incomingSeekerResolutionMessage,
} from '../src/game/items/IncomingSeekerFixture';
import { seekerThreats } from '../src/game/items/SeekerWarnings';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';

it('reports an AI interception near the lap gate without a player impact or finish', () => {
  const track = new CircuitAlpha();
  const length = track.curve.getLength();
  const system = new ProjectileSystem(track);
  const start = track.startFinishDistance - 60;
  const atDistance = (distance: number, id: string) => {
    const u = (distance / length + 1) % 1;
    return {
      id,
      position: track.curve.getPointAt(u).setY(0.72),
      forward: track.curve.getTangentAt(u),
      velocity: track.curve.getTangentAt(u).multiplyScalar(33),
      finished: false,
    };
  };
  new IncomingSeekerFixture(true).update(
    5,
    false,
    atDistance(start, 'player').position,
    track,
    system,
  );
  expect(seekerThreats(system.snapshots(), [atDistance(start, 'player')])).toHaveLength(1);
  let playerDistance = start;
  let impactId: string | null = null;
  for (let frame = 1; frame <= 360 && system.activeCount() > 0; frame++) {
    playerDistance = start + (frame * 33) / 60;
    const impacts = system.update(1 / 60, [
      atDistance(playerDistance, 'player'),
      atDistance(playerDistance - 26, 'ai-1'),
    ]);
    impactId = impacts[0]?.targetId ?? impactId;
  }
  expect(impactId).toBe('ai-1');
  expect(Math.abs(playerDistance - track.startFinishDistance)).toBeLessThan(15);
  expect(seekerThreats(system.snapshots(), [atDistance(playerDistance, 'player')])).toEqual([]);
  const resolutions = system.drainSeekerResolutions();
  expect(resolutions).toMatchObject([
    { reason: 'racer-hit', hitRacerId: 'ai-1', targetId: 'player' },
  ]);
  expect(incomingSeekerResolutionMessage(true, resolutions, () => 'Manaconda')).toContain(
    'INTERCEPTED BY MANACONDA',
  );
  expect(system.drainSeekerResolutions()).toEqual([]);
  system.dispose();
});

it('shows only incoming-fixture resolutions in explicit incoming test mode', () => {
  const base: SeekerResolution = {
    projectileId: 1,
    ownerId: 'incoming-seeker-fixture',
    targetId: 'player',
    reason: 'guardrail',
    hitRacerId: null,
  };
  expect(incomingSeekerResolutionMessage(false, [base], () => 'AI')).toBeNull();
  expect(
    incomingSeekerResolutionMessage(true, [{ ...base, ownerId: 'ai-1' }], () => 'AI'),
  ).toBeNull();
  expect(
    incomingSeekerResolutionMessage(true, [{ ...base, targetId: 'ai-1' }], () => 'AI'),
  ).toBeNull();
  expect(incomingSeekerResolutionMessage(true, [base], () => 'AI')).toContain('GUARDRAIL');
  expect(
    incomingSeekerResolutionMessage(true, [base, { ...base, reason: 'expired' }], () => 'AI'),
  ).toContain('LIFETIME EXPIRED');
  expect(
    incomingSeekerResolutionMessage(true, [{ ...base, reason: 'target-finished' }], () => 'AI'),
  ).toContain('RACE FINISH');
  expect(
    incomingSeekerResolutionMessage(true, [{ ...base, reason: 'target-lost' }], () => 'AI'),
  ).toContain('TARGET LOST');
  expect(
    incomingSeekerResolutionMessage(
      true,
      [{ ...base, reason: 'racer-hit', hitRacerId: 'player' }],
      () => 'AI',
    ),
  ).toContain('HIT YOU');
});

it('bounds undrained diagnostic history and clears it on race disposal', () => {
  const track = new CircuitAlpha();
  const system = new ProjectileSystem(track);
  const config = ITEM_DEFINITIONS['seeker-drone'].projectile;
  if (config === undefined) throw new Error('Seeker config missing');
  for (let index = 0; index < 100; index++) {
    const id = system.spawn({
      itemId: 'seeker-drone',
      ownerId: 'fixture',
      targetId: 'player',
      direction: 'forward',
      config,
      launch: {
        position: track.curve.getPointAt(0.1).setY(0.72),
        forward: track.curve.getTangentAt(0.1),
        velocity: new THREE.Vector3(),
      },
    });
    if (id === null) throw new Error('Unexpected capacity failure');
    system.remove(id);
  }
  expect(system.drainSeekerResolutions()).toHaveLength(40);
  expect(system.activeCount()).toBe(0);
  system.spawn({
    itemId: 'seeker-drone',
    ownerId: 'fixture',
    targetId: 'player',
    direction: 'forward',
    config,
    launch: {
      position: track.curve.getPointAt(0.1).setY(0.72),
      forward: track.curve.getTangentAt(0.1),
      velocity: new THREE.Vector3(),
    },
  });
  system.dispose();
  expect(system.drainSeekerResolutions()).toEqual([]);
});
