import type { RacerProgress } from '../race/RaceDirector';

/**
 * Return every unfinished, progress-valid racer strictly ahead of the owner.
 * The caller supplies the lap-validated snapshots used by race authority; no
 * world-space distance or presentation state participates in targeting.
 */
export function racersAheadByProgress(
  ownerId: string,
  racers: readonly RacerProgress[],
): RacerProgress[] {
  const owner = racers.find((racer) => racer.id === ownerId);
  if (owner === undefined || !validTargetingProgress(owner)) return [];

  const ownerTotal = owner.lap + owner.trackProgress;
  return racers
    .filter((racer) => racer.id !== ownerId && validTargetingProgress(racer))
    .map((racer) => ({
      racer,
      gap: racer.lap + racer.trackProgress - ownerTotal,
    }))
    .filter(({ gap }) => gap > 0)
    .sort((a, b) => {
      if (a.gap !== b.gap) return a.gap - b.gap;
      return a.racer.id === b.racer.id ? 0 : a.racer.id < b.racer.id ? -1 : 1;
    })
    .map(({ racer }) => racer);
}

/** Read-only targeting over the race's lap-validated progress snapshots. */
export function nearestRacerAhead(
  ownerId: string,
  racers: readonly RacerProgress[],
): RacerProgress | null {
  return racersAheadByProgress(ownerId, racers)[0] ?? null;
}

/** Circuit Alpha's finish gate is after spline zero. CP11 authorizes the short
 * wrapped segment before that gate, without awarding an actual lap early. */
export function targetingProgressSnapshot(
  progress: RacerProgress,
  nextCheckpoint: number,
  finishProgress: number,
): RacerProgress {
  return {
    ...progress,
    lap: progress.lap + (nextCheckpoint === 0 && progress.trackProgress < finishProgress ? 1 : 0),
  };
}

export function validTargetingProgress(racer: RacerProgress): boolean {
  return (
    !racer.finished &&
    Number.isInteger(racer.lap) &&
    racer.lap >= 0 &&
    Number.isFinite(racer.trackProgress) &&
    racer.trackProgress >= 0 &&
    racer.trackProgress < 1
  );
}

/** Includes the owner; no world-space proximity participates in leader choice. */
export function currentRaceLeader(racers: readonly RacerProgress[]): RacerProgress | null {
  let leader: RacerProgress | null = null;
  for (const racer of racers) {
    if (!validTargetingProgress(racer)) continue;
    const total = racer.lap + racer.trackProgress;
    const previous = leader === null ? -Infinity : leader.lap + leader.trackProgress;
    if (total > previous || (total === previous && leader !== null && racer.id < leader.id))
      leader = racer;
  }
  return leader;
}
