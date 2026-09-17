import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  AI_ITEM_POLICY,
  AiItemPolicy,
  aiItemTargets,
  driveInputWithItemModifiers,
  type AiItemPolicyContext,
} from '../src/game/ai/AiItemPolicy';
import type { RacerProgress } from '../src/game/race/RaceDirector';

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

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing AI policy test fixture value');
  return value;
}

function context(itemId: AiItemPolicyContext['currentItem']): AiItemPolicyContext {
  const racers = [progress('ai-1', 0.2), progress('ahead', 0.5), progress('behind', 0.1)];
  return {
    racerId: 'ai-1',
    currentItem: itemId,
    rank: 4,
    distanceBehindLeaderMeters: 30,
    racers,
    awareness: [
      {
        id: 'ai-1',
        position: new THREE.Vector3(0, 0, 0),
        speed: 24,
        lateralOffset: 0,
      },
      {
        id: 'ahead',
        position: new THREE.Vector3(0, 0, 18),
        speed: 20,
        lateralOffset: 0,
      },
      {
        id: 'behind',
        position: new THREE.Vector3(0, 0, -8),
        speed: 25,
        lateralOffset: 0,
      },
    ],
    position: new THREE.Vector3(0, 0, 0),
    forward: new THREE.Vector3(0, 0, 1),
    speed: 24,
    characterMaxSpeed: 30,
    trackLength: 100,
    surface: 'asphalt',
    cornerFactor: 0.1,
    canPlaceSlick: true,
    itemPhysicsCapacityAvailable: true,
    apexAvailable: true,
    overdriveActive: false,
    overdriveNextPulseRemaining: 0,
    rocketActive: false,
    projectiles: [],
    hazards: [],
  };
}

describe('AI item tactics', () => {
  const policy = new AiItemPolicy();

  it('uses progress-authoritative targets and chooses forward/rear intent', () => {
    expect(aiItemTargets(context('kinetic-disc'))).toMatchObject({
      aheadCount: 1,
      rearThreat: true,
    });
    expect(aiItemTargets(context('kinetic-disc')).nearestAheadDistanceMeters).toBeCloseTo(30);
    expect(policy.decide(context('kinetic-disc'))).toMatchObject({
      action: 'use',
      direction: 'forward',
    });
    expect(policy.decide(context('slick-trap'))).toMatchObject({
      action: 'use',
      direction: 'backward',
    });
  });

  it('covers the offensive item family without bypassing target legality', () => {
    for (const itemId of [
      'seeker-drone',
      'apex-missile',
      'blast-orb',
      'blaze-orbs',
      'frost-orbs',
      'arc-blade',
      'arc-hammers',
      'ink-splat',
    ] as const) {
      expect(policy.decide(context(itemId)).action, itemId).toBe('use');
    }

    const noTarget = {
      ...context('seeker-drone'),
      racers: [progress('ai-1', 0.2), progress('behind', 0.1)],
    };
    expect(policy.decide(noTarget)).toMatchObject({ action: 'wait' });
  });

  it('holds defensive items until a threat is observable', () => {
    expect(policy.decide(context('shockwave'))).toMatchObject({ action: 'wait' });

    const clear = {
      ...context('shockwave'),
      awareness: [required(context('shockwave').awareness[0])],
    };
    expect(policy.decide(clear)).toMatchObject({
      action: 'wait',
      reason: 'Shockwave held for a defensive threat',
    });

    const closeRacer = {
      ...context('shockwave'),
      awareness: [
        required(context('shockwave').awareness[0]),
        {
          ...required(context('shockwave').awareness[2]),
          position: new THREE.Vector3(0, 0, -4),
        },
      ],
    };
    expect(policy.decide(closeRacer)).toMatchObject({ action: 'use' });

    const incoming = {
      ...context('shockwave'),
      awareness: [required(context('shockwave').awareness[0])],
      projectiles: [
        {
          id: 1,
          ownerId: 'player',
          targetId: 'ai-1',
          itemId: 'kinetic-disc' as const,
          position: new THREE.Vector3(0, 0, 8),
          velocity: new THREE.Vector3(0, 0, -20),
          bounceCount: 0,
          remainingSeconds: 3,
          ownerArmSeconds: 0,
        },
      ],
    };
    expect(policy.decide(incoming)).toMatchObject({ action: 'use' });
  });

  it('uses boost lines tactically and pulses Overdrive only at its cadence', () => {
    expect(policy.decide(context('nitro-surge'))).toMatchObject({ action: 'use' });
    const corner = {
      ...context('nitro-surge'),
      cornerFactor: AI_ITEM_POLICY.straightCornerFactor + 0.2,
      speed: 29,
    };
    expect(policy.decide(corner)).toMatchObject({ action: 'wait' });

    expect(policy.decide(context('nitro-overdrive'))).toMatchObject({ action: 'use' });
    const active = {
      ...context(null),
      overdriveActive: true,
      overdriveNextPulseRemaining: 0.2,
    };
    expect(policy.decide(active)).toMatchObject({ action: 'wait' });
    expect(policy.decide({ ...active, overdriveNextPulseRemaining: 0 })).toMatchObject({
      action: 'pulse',
    });
  });

  it('activates Rocket promptly and protects a leading racer when a threat is present', () => {
    expect(policy.decide(context('hyper-drive-rocket'))).toMatchObject({
      action: 'use',
      direction: 'forward',
    });
    expect(
      policy.decide({ ...context('prismatic-invincibility'), rank: 3 as const }),
    ).toMatchObject({ action: 'use' });

    const noThreat = {
      ...context('prismatic-invincibility'),
      rank: 6 as const,
      awareness: [required(context('prismatic-invincibility').awareness[0])],
      cornerFactor: AI_ITEM_POLICY.straightCornerFactor + 0.2,
      speed: context('prismatic-invincibility').characterMaxSpeed,
    };
    expect(policy.decide(noThreat)).toMatchObject({ action: 'wait' });
  });

  it('passes the complete effect authority into the existing AI controller input', () => {
    const input = driveInputWithItemModifiers(
      { throttle: 1, steering: 0.4, brake: false, drift: false },
      {
        speedCapMultiplier: 1.25,
        accelerationMultiplier: 1.5,
        steeringMultiplier: 0.74,
        ignoreOffRoadSpeedPenalty: true,
        ignoreOffRoadAccelerationPenalty: true,
        activeBoostLabel: 'AI boost',
      },
    );
    expect(input).toMatchObject({
      effectSpeedCapMultiplier: 1.25,
      effectAccelerationMultiplier: 1.5,
      effectSteeringMultiplier: 0.74,
      ignoreOffRoadSpeedPenalty: true,
      ignoreOffRoadAccelerationPenalty: true,
    });
  });
});
