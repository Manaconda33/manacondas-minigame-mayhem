import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { ARC_BLADE_CONFIG, ARC_OUTBOUND_DISTANCE } from '../src/game/items/ArcBlade';
import {
  ArcBladeCounterFixture,
  arcCounterFromSearch,
} from '../src/game/items/ArcBladeCounterFixture';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { isItemUseKey } from '../src/game/items/ItemSystem';
import { forcedItemFromSearch, forcedItemForRacer } from '../src/game/items/ItemTestMode';
import { arcRuntimeRig } from './arc-runtime-rig';
import { requireValue } from './requireValue';

const rigs: ReturnType<typeof arcRuntimeRig>[] = [];
function rig(index = 24, elevation = 0.35) {
  const r = arcRuntimeRig(index, elevation);
  rigs.push(r);
  return r;
}
beforeAll(async () => {
  await RAPIER.init();
});
afterEach(() => {
  rigs.splice(0).forEach((r) => {
    r.dispose();
  });
  vi.restoreAllMocks();
});
function incoming(r: ReturnType<typeof rig>, offset = -2.07) {
  return requireValue(
    r.projectiles.spawn({
      itemId: 'arc-blade',
      ownerId: 'rival',
      direction: 'forward',
      config: ARC_BLADE_CONFIG,
      launch: {
        position: r.kart.position().addScaledVector(r.forward, offset),
        forward: r.forward,
        velocity: new Vector3(),
      },
    }),
  );
}

describe('Arc production input, effects and counter fixtures', () => {
  it('uses three fixed pickups freely through runtime keyboard/mobile entry, including reverse intent', () => {
    const r = rig();
    const item = requireValue(forcedItemFromSearch('?testItem=arc-blade'));
    expect(forcedItemForRacer(item, 'rival')).toBeNull();
    expect(isItemUseKey('KeyE')).toBe(true);
    expect(isItemUseKey('ShiftLeft')).toBe(true);
    r.itemSystem.acquire('player', item);
    r.itemSystem.advance(1);
    r.kart.body.setLinvel({ x: r.forward.x * 20, y: 0, z: r.forward.z * 20 }, true);
    r.game.pressed.add('KeyS');
    r.game.requestPlayerItemUse();
    expect(r.projectiles.snapshots()).toHaveLength(1);
    expect(requireValue(r.projectiles.snapshots()[0]).velocity.dot(r.forward)).toBeGreaterThan(40);
    r.itemSystem.advance(0.55);
    r.game.setTouchControl('brake', true);
    r.game.setTouchControl('item', true);
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(1);
    r.game.setTouchControl('item', false);
    r.itemSystem.advance(0.55);
    r.game.requestPlayerItemUse();
    expect(r.itemSystem.canCollect('player')).toBe(true);
    expect(r.projectiles.snapshots()).toHaveLength(3);
    expect(r.game.arcFixture.badge()).toBeNull();
    expect(r.itemSystem.heldItem('rival')).toBeNull();
  });

  it('rejects roulette/paused/countdown/finished use without consuming a charge', () => {
    const r = rig();
    r.itemSystem.acquire('player', 'arc-blade');
    r.game.requestPlayerItemUse();
    r.itemSystem.advance(1);
    r.game.paused = true;
    r.game.requestPlayerItemUse();
    r.game.paused = false;
    r.game.raceDirector.phase = () => 'countdown';
    r.game.requestPlayerItemUse();
    r.game.raceDirector.phase = () => 'racing';
    r.playerProgress.finished = true;
    r.game.requestPlayerItemUse();
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(3);
    expect(r.projectiles.activeCount()).toBe(0);
  });

  it.each([24, 90, 192])(
    'applies accepted spin, sprite and camera state at Circuit section %s, without extra transform/progress/velocity edits',
    (index) => {
      const r = rig(index, 3);
      r.kart.body.setLinvel({ x: 10, y: 2, z: -4 }, true);
      r.racerEffects.activateFrost('player');
      r.racerEffects.activateTemporaryBoost('player', {
        id: 'nitro-surge',
        label: 'Nitro',
        ...requireValue(ITEM_DEFINITIONS['nitro-surge'].boost),
      });
      const velocity = r.kart.velocity();
      const position = r.kart.position();
      const heading = r.kart.forward();
      const progress = JSON.stringify(r.playerProgress);
      incoming(r);
      r.game.updateProjectiles(1 / 60);
      const spin = requireValue(r.racerEffects.spinoutState('player'));
      expect(spin).toMatchObject({
        id: 'arc-blade-spinout',
        durationSeconds: 0.85,
        remainingSeconds: 0.85,
        preserveMomentum: false,
      });
      expect(Math.abs(spin.yawRateRadiansPerSecond)).toBeCloseTo((Math.PI * 2) / 0.85);
      expect(r.game.driverHitSeconds).toBe(0.85);
      expect(r.game.spinoutCameraAnchor.resolve(heading.clone().negate(), true)).toEqual(
        velocity.clone().setY(0).normalize(),
      );
      expect(r.kart.position()).toEqual(position);
      expect(r.kart.forward()).toEqual(heading);
      expect(r.kart.velocity()).toEqual(velocity);
      expect(JSON.stringify(r.playerProgress)).toBe(progress);
      expect(r.racerEffects.frostState('player')?.stacks).toBe(1);
      expect(r.racerEffects.driveModifiers('player').speedCapMultiplier).toBe(1.18);
      r.racerEffects.advance(0.4, false, false);
      incoming(r);
      r.game.updateProjectiles(1 / 60);
      expect(r.racerEffects.spinoutRemainingSeconds('player')).toBe(0.85);
      // Real controller performs the ordinary spin on its next simulation update.
      const applied = requireValue(r.racerEffects.spinoutState('player'));
      r.kart.update(
        {
          throttle: 1,
          steering: 1,
          drift: false,
          brake: false,
          effectSpinoutYawRateRadiansPerSecond: applied.yawRateRadiansPerSecond,
          effectSpinoutPreserveMomentum: applied.preserveMomentum,
        },
        'asphalt',
        1 / 60,
      );
      expect(r.kart.velocity().clone().setY(0).length()).toBeLessThan(
        velocity.clone().setY(0).length(),
      );
    },
  );

  it.each([false, true])('respects real Prismatic protection/expiry, expired=%s', (expired) => {
    const r = rig();
    r.prismatic.activate('player', () => true);
    if (expired) r.racerEffects.advanceProtection(6);
    const before = r.kart.velocity();
    incoming(r);
    r.game.updateProjectiles(1 / 60);
    expect(r.racerEffects.spinoutState('player') !== null).toBe(expired);
    expect(r.projectiles.activeCount()).toBe(expired ? 1 : 0);
    expect(r.kart.velocity()).toEqual(before);
  });

  it.each(['outbound', 'return'] as const)(
    'resolves actual Shockwave before same-frame Arc %s contact/catch',
    (phase) => {
      const r = rig();
      const id = incoming(r, 2);
      if (phase === 'return') {
        // Use the real trajectory to turn, then position the real player at its current
        // location to make same-frame contact certain without a clear.
        r.projectiles.update(ARC_OUTBOUND_DISTANCE / 42, r.game.projectileTargets());
        const blade = requireValue(r.projectiles.snapshots().find((p) => p.id === id));
        r.kart.respawn(blade.position, Math.atan2(r.forward.x, r.forward.z));
      }
      r.itemSystem.acquire('player', 'shockwave');
      r.itemSystem.advance(1);
      r.game.requestPlayerItemUse();
      r.game.updateProjectiles(1 / 60);
      expect(r.projectiles.snapshots().some((p) => p.id === id)).toBe(false);
      expect(r.racerEffects.spinoutState('player')).toBeNull();
      expect(r.itemSystem.heldItem('player')).toBeNull();
    },
  );

  it('recovery cancels owned returning blades while preserving charges and unrelated launched projectiles', () => {
    const r = rig();
    r.itemSystem.acquire('player', 'arc-blade');
    r.itemSystem.advance(1);
    r.game.requestPlayerItemUse();
    r.game.updateProjectiles(ARC_OUTBOUND_DISTANCE / 42);
    expect(r.projectiles.snapshots()[0]?.arcPhase).toBe('return');
    r.projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'player',
      direction: 'forward',
      config: requireValue(ITEM_DEFINITIONS['kinetic-disc'].projectile),
      launch: { position: r.kart.position(), forward: r.forward, velocity: new Vector3() },
    });
    r.game.respawn();
    expect(r.projectiles.snapshots().map((p) => p.itemId)).toEqual(['kinetic-disc']);
    expect(r.itemSystem.heldItem('player')?.remainingCharges).toBe(2);
  });

  it.each(['shockwave', 'protected', 'expired'] as const)(
    'verifies the %s diagnostic with real moving-controller contacts and unrestricted ITEM',
    (test) => {
      const r = rig();
      r.game.arcFixture = new ArcBladeCounterFixture(test);
      r.itemSystem.acquire(
        'player',
        test === 'shockwave' ? 'shockwave' : 'prismatic-invincibility',
      );
      r.itemSystem.advance(1);
      if (test !== 'shockwave') {
        // Activation works immediately, before any fixture setup or countdown.
        r.game.requestPlayerItemUse();
        expect(r.prismatic.remaining('player')).toBe(6);
        r.game.updateProjectiles(1 / 60);
        if (test === 'expired') r.racerEffects.advanceProtection(6);
      }
      for (let i = 0; i < 200 && !r.game.arcFixture.badge()?.includes('PASS'); i++) {
        const dt = 1 / 60;
        r.itemSystem.advance(dt);
        r.racerEffects.advanceProtection(dt);
        const modifiers = r.racerEffects.driveModifiers('player');
        r.kart.update(
          {
            throttle: 1,
            steering: 0,
            drift: false,
            brake: false,
            effectSpeedCapMultiplier: modifiers.speedCapMultiplier,
            effectAccelerationMultiplier: modifiers.accelerationMultiplier,
            ignoreOffRoadSpeedPenalty: modifiers.ignoreOffRoadSpeedPenalty,
            ignoreOffRoadAccelerationPenalty: modifiers.ignoreOffRoadAccelerationPenalty,
          },
          'asphalt',
          dt,
        );
        r.world.step();
        const blade = r.projectiles.snapshots().find((p) => p.itemId === 'arc-blade');
        if (
          test === 'shockwave' &&
          blade &&
          blade.position.clone().sub(r.kart.position()).setY(0).length() <= 5
        )
          r.game.requestPlayerItemUse();
        r.game.updateProjectiles(dt);
        if (
          r.game.arcFixture.badge()?.includes('FAIL') ||
          r.game.arcFixture.badge()?.includes('INCONCLUSIVE')
        )
          break;
      }
      expect(r.game.arcFixture.badge()).toContain('PASS');
      expect(r.kart.speedMetersPerSecond()).toBeGreaterThan(1);
      expect(r.racerEffects.spinoutState('player') !== null).toBe(test === 'expired');
      expect(r.itemSystem.heldItem('rival')).toBeNull();
    },
  );

  it('does not report a counter/contact pass when an incoming blade misses or hits a wall', () => {
    const r = rig();
    r.game.arcFixture = new ArcBladeCounterFixture('protected');
    r.prismatic.activate('player', () => true);
    for (let i = 0; i < 46; i++) r.game.updateProjectiles(1 / 60);
    expect(r.projectiles.snapshots()).toHaveLength(1);
    r.kart.respawn(r.kart.position().add(new Vector3(100, 0, 100)), 0);
    for (let i = 0; i < 260; i++) r.game.updateProjectiles(1 / 60);
    expect(r.game.arcFixture.badge()).toContain('INCONCLUSIVE');
    expect(r.game.arcFixture.badge()).not.toContain('PASS');
  });

  it.each([
    ['', null],
    ['?testItem=arc-blade', null],
    ['?testArcBladeCounter=shockwave', null],
    ['?testItem=shockwave&testArcBladeCounter=shockwave', 'shockwave'],
    [
      '?testItem=prismatic-invincibility&testArcBladeCounter=prismatic&testArcBladePhase=protected',
      'protected',
    ],
    [
      '?testItem=prismatic-invincibility&testArcBladeCounter=prismatic&testArcBladePhase=expired',
      'expired',
    ],
    ['?testItem=prismatic-invincibility&testArcBladeCounter=prismatic&testArcBladePhase=bad', null],
  ])('isolates diagnostic parsing: %s', (search, expected) => {
    expect(arcCounterFromSearch(search)).toBe(expected);
  });
});
