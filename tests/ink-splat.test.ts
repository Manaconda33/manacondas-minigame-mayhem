import { describe, expect, it } from 'vitest';
import { AiDriver } from '../src/game/ai/AiDriver';
import { ITEM_PROBABILITY_BY_RANK, type RaceRank } from '../src/game/items/itemDefinitions';
import {
  InkSplatSystem,
  INK_SPLAT_CONFIG,
  type InkAiImpairmentSnapshot,
} from '../src/game/items/InkSplatSystem';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ITEM_ROULETTE_SECONDS, ItemSystem } from '../src/game/items/ItemSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import {
  InkSplatCounterFixture,
  inkSplatCounterFromSearch,
} from '../src/game/items/InkSplatCounterFixture';
import { racersAheadByProgress, targetingProgressSnapshot } from '../src/game/items/ItemTargeting';
import type { RacerProgress } from '../src/game/race/RaceDirector';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

function racer(
  id: string,
  lap: number,
  trackProgress: number,
  overrides: Partial<RacerProgress> = {},
): RacerProgress {
  return {
    id,
    lap,
    trackProgress,
    finished: false,
    finishTime: null,
    finishPlace: null,
    ...overrides,
  };
}

describe('Vision-Obscuring Ink Splat targeting and state', () => {
  it('resolves every strictly-ahead racer from validated total progress, including wrapped laps', () => {
    const racers = [
      racer('owner', 1, 0.85),
      racer('same-lap', 1, 0.92),
      racer('wrapped', 2, 0.05),
      racer('behind', 1, 0.8),
      racer('tied', 1, 0.85),
      racer('finished', 4, 0.2, { finished: true }),
      racer('invalid', 1, Number.NaN),
    ];

    expect(racersAheadByProgress('owner', racers).map(({ id }) => id)).toEqual([
      'same-lap',
      'wrapped',
    ]);

    const wrappedOwner = targetingProgressSnapshot(racer('owner', 0, 0.9), 0, 0.92);
    const wrappedTarget = targetingProgressSnapshot(racer('target', 0, 0.95), 0, 0.92);
    expect(wrappedOwner.lap).toBe(1);
    expect(wrappedTarget.lap).toBe(0);
  });

  it('keeps Ink when there is no valid target and commits once for an all-immune set', () => {
    const system = new InkSplatSystem();
    let commits = 0;
    const owner = racer('owner', 1, 0.8);
    const behind = racer('behind', 1, 0.7);
    expect(
      system.apply(
        'owner',
        [owner, behind],
        () => false,
        () => {
          commits += 1;
          return true;
        },
      ),
    ).toMatchObject({ accepted: false, candidateTargetIds: [] });
    expect(commits).toBe(0);
    expect(system.activeRacerIds()).toEqual([]);

    const targets = [racer('ahead-a', 1, 0.82), racer('ahead-b', 1, 0.9)];
    const result = system.apply(
      'owner',
      [owner, ...targets],
      () => true,
      () => {
        commits += 1;
        return true;
      },
    );
    expect(result).toMatchObject({
      accepted: true,
      candidateTargetIds: ['ahead-a', 'ahead-b'],
      appliedTargetIds: [],
      blockedTargetIds: ['ahead-a', 'ahead-b'],
    });
    expect(commits).toBe(1);
    expect(system.activeRacerIds()).toEqual([]);
  });

  it('treats forward and reverse ITEM input as the same valid Ink resolution', () => {
    const resolve = (direction: 'forward' | 'backward') => {
      const items = new ItemSystem();
      const effects = new RacerEffects();
      const ink = new InkSplatSystem();
      items.acquire('owner', 'ink-splat');
      items.advance(ITEM_ROULETTE_SECONDS);
      const result = executeItemUse(items, effects, 'owner', direction, {
        racers: [racer('owner', 0, 0.1), racer('target', 0, 0.2)],
        inkSplatSystem: ink,
      });
      return { result, active: ink.activeRacerIds(), held: items.heldItem('owner') };
    };

    expect(resolve('forward')).toEqual(resolve('backward'));
  });

  it('refreshes one per-racer state without stacking and preserves later immunity state', () => {
    const system = new InkSplatSystem();
    const owner = racer('owner', 1, 0.2);
    const protectedTarget = racer('protected', 1, 0.3);
    const openTarget = racer('open', 1, 0.4);
    const immune = new Set(['protected']);

    const first = system.apply(
      'owner',
      [owner, protectedTarget, openTarget],
      (id) => immune.has(id),
      () => true,
    );
    expect(first.appliedTargetIds).toEqual(['open']);
    system.advance(0.8);
    const beforeRefresh = system.aiSnapshot('open');
    const refreshed = system.apply(
      'owner',
      [owner, protectedTarget, openTarget],
      (id) => immune.has(id),
      () => true,
    );

    expect(refreshed.accepted).toBe(true);
    expect(refreshed.blockedTargetIds).toEqual(['protected']);
    expect(system.activeRacerIds()).toEqual(['open']);
    expect(system.viewSnapshot('open').remainingSeconds).toBeCloseTo(
      INK_SPLAT_CONFIG.durationSeconds,
    );
    expect(system.aiSnapshot('open')?.noisePhaseRadians).toBe(beforeRefresh?.noisePhaseRadians);

    immune.add('open');
    system.advance(0.2);
    const blockedRefresh = system.apply(
      'owner',
      [owner, protectedTarget, openTarget],
      (id) => immune.has(id),
      () => true,
    );
    expect(blockedRefresh.blockedTargetIds).toEqual(['protected', 'open']);
    expect(system.viewSnapshot('open').remainingSeconds).toBeCloseTo(2.3);
  });

  it('freezes on pause, fades monotonically, and clears on expiry or lifecycle teardown', () => {
    const system = new InkSplatSystem();
    system.apply(
      'owner',
      [racer('owner', 0, 0.1), racer('target', 0, 0.2)],
      () => false,
      () => true,
    );

    const initial = system.viewSnapshot('target');
    system.advance(0.4);
    const beforePause = system.viewSnapshot('target');
    system.advance(5, true);
    expect(system.viewSnapshot('target')).toEqual(beforePause);
    expect(initial.coverage).toBeGreaterThan(beforePause.coverage);
    expect(beforePause.coverage).toBeLessThanOrEqual(INK_SPLAT_CONFIG.humanCoverage);
    expect(beforePause.coverage).toBeGreaterThan(0);

    system.advance(INK_SPLAT_CONFIG.durationSeconds);
    expect(system.viewSnapshot('target').active).toBe(false);
    system.apply(
      'owner',
      [racer('owner', 0, 0.1), racer('target', 0, 0.2)],
      () => false,
      () => true,
    );
    system.clear('target');
    expect(system.activeRacerIds()).toEqual([]);
    system.dispose();
  });
});

describe('Ink Splat contract values and diagnostic routing', () => {
  it('keeps the approved probability column and parses only explicit fixtures', () => {
    const ranks: readonly RaceRank[] = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(ranks.map((rank) => ITEM_PROBABILITY_BY_RANK[rank]['ink-splat'])).toEqual([
      0, 0, 2, 4, 6, 7, 8, 8,
    ]);
    expect(inkSplatCounterFromSearch('?testItem=ink-splat&testInkCounter=incoming')).toBe(
      'incoming',
    );
    expect(
      inkSplatCounterFromSearch(
        '?testItem=prismatic-invincibility&testInkCounter=prismatic&testInkPhase=protected',
      ),
    ).toBe('protected');
    expect(
      inkSplatCounterFromSearch(
        '?testItem=prismatic-invincibility&testInkCounter=prismatic&testInkPhase=expired',
      ),
    ).toBe('expired');
    expect(inkSplatCounterFromSearch('?testItem=ink-splat')).toBeNull();
  });

  it('publishes deterministic AI impairment values with bounded smooth noise', () => {
    const system = new InkSplatSystem();
    system.apply(
      'owner',
      [racer('owner', 0, 0.1), racer('ai-1', 0, 0.2)],
      () => false,
      () => true,
    );
    const first = system.aiSnapshot('ai-1');
    expect(first).toMatchObject({
      noiseAmplitudeMeters: 0.55,
      reactionLatencySeconds: 0.08,
      steeringPrecisionMultiplier: 0.88,
    });
    system.advance(1 / 60);
    const second = system.aiSnapshot('ai-1');
    expect(
      Math.abs((second?.noisePhaseRadians ?? 0) - (first?.noisePhaseRadians ?? 0)),
    ).toBeLessThan(0.1);
    expect(
      Math.abs(Math.sin(first?.noisePhaseRadians ?? 0) * INK_SPLAT_CONFIG.aiNoiseAmplitudeMeters),
    ).toBeLessThanOrEqual(0.55);
  });

  it('runs incoming and Prismatic counter fixtures through the real Ink resolver', () => {
    const racers = [racer('ai-1', 0, 0.1), racer('player', 0, 0.4)];
    const incoming = new InkSplatCounterFixture('incoming');
    const incomingSystem = new InkSplatSystem();
    incoming.update(1 / 60, {
      racers,
      playerFinished: false,
      protectionRemaining: 0,
      ink: incomingSystem,
      isImmune: () => false,
    });
    expect(incoming.badge()).toContain('PASS');
    expect(incomingSystem.isActive('player')).toBe(true);

    const protectedFixture = new InkSplatCounterFixture('protected');
    const protectedSystem = new InkSplatSystem();
    protectedFixture.update(1 / 60, {
      racers,
      playerFinished: false,
      protectionRemaining: 2,
      ink: protectedSystem,
      isImmune: (id) => id === 'player',
    });
    expect(protectedFixture.badge()).toContain('PASS');
    expect(protectedSystem.isActive('player')).toBe(false);

    const expiredFixture = new InkSplatCounterFixture('expired');
    const expiredSystem = new InkSplatSystem();
    const context = {
      racers,
      playerFinished: false,
      protectionRemaining: 2,
      ink: expiredSystem,
      isImmune: () => false,
    };
    expiredFixture.update(1 / 60, context);
    expiredFixture.update(1 / 60, { ...context, protectionRemaining: 0 });
    expect(expiredFixture.badge()).toContain('PASS');
    expect(expiredSystem.isActive('player')).toBe(true);
  });

  it('keeps the AI driver deterministic while Ink is active', () => {
    const track = new CircuitAlpha();
    const position = track.samples[80]?.clone();
    const tangent = track.tangents[80]?.clone();
    if (position === undefined || tangent === undefined) throw new Error('Missing test sample');
    const impairment: InkAiImpairmentSnapshot = {
      remainingSeconds: 2.5,
      noiseAmplitudeMeters: 0.55,
      noisePhaseRadians: 1.2,
      reactionLatencySeconds: 0.08,
      steeringPrecisionMultiplier: 0.88,
    };
    const firstDriver = new AiDriver(track, { laneOffset: 0.7, pace: 0.6, aggression: 0.5 }, 30);
    const secondDriver = new AiDriver(track, { laneOffset: 0.7, pace: 0.6, aggression: 0.5 }, 30);
    const first = [];
    const second = [];
    for (let index = 0; index < 8; index += 1) {
      const snapshot = {
        ...impairment,
        noisePhaseRadians: impairment.noisePhaseRadians + index * 0.08,
      };
      first.push(firstDriver.input(position, tangent, 15, 0, [], 1 / 60, [], 'ai-1', snapshot));
      second.push(secondDriver.input(position, tangent, 15, 0, [], 1 / 60, [], 'ai-1', snapshot));
    }
    expect(first).toEqual(second);
    expect(first[0]?.steering).toBe(0);
  });
});
