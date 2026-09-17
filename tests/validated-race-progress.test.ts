import { describe, expect, it } from 'vitest';
import { rankRacers, type RacerProgress } from '../src/game/race/RaceDirector';
import { validatedRaceProgressSnapshot } from '../src/game/race/ValidatedRaceProgress';

function racer(id: string, lap: number, trackProgress: number): RacerProgress {
  return { id, lap, trackProgress, finished: false, finishTime: null, finishPlace: null };
}

describe('validated race-progress snapshots', () => {
  it('does not let an unvalidated spline projection overtake the next required gate', () => {
    const skippedGate = validatedRaceProgressSnapshot(racer('skipped', 1, 0.84), 3, 0.025, 0.25);
    const validatedRival = validatedRaceProgressSnapshot(racer('rival', 1, 0.42), 6, 0.025, 0.5);

    expect(skippedGate.trackProgress).toBeLessThan(0.25);
    expect(rankRacers([skippedGate, validatedRival]).map(({ id }) => id)).toEqual([
      'rival',
      'skipped',
    ]);
  });

  it('keeps the CP11-to-finish wrapped segment ahead without awarding a lap early', () => {
    const beforeFinish = validatedRaceProgressSnapshot(racer('racer', 1, 0.01), 0, 0.025, 0.025);
    const afterFinish = validatedRaceProgressSnapshot(racer('racer', 2, 0.026), 1, 0.025, 1 / 12);

    expect(beforeFinish).toMatchObject({ lap: 2, trackProgress: 0.01 });
    expect(afterFinish).toMatchObject({ lap: 2, trackProgress: 0.026 });
  });

  it('preserves finish ordering snapshots without rewriting locked race state', () => {
    const finished: RacerProgress = {
      ...racer('finished', 3, 0.01),
      finished: true,
      finishTime: 70,
      finishPlace: 1,
    };

    expect(validatedRaceProgressSnapshot(finished, 0, 0.025, 0.025)).toEqual(finished);
  });
});
