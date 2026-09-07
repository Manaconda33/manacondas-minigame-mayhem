import type { RacerProgress } from '../race/RaceDirector';

/** Read-only targeting over the race's lap-validated progress snapshots. */
export function nearestRacerAhead(
  ownerId: string,
  racers: readonly RacerProgress[],
): RacerProgress | null {
  const valid = (racer: RacerProgress): boolean =>
    !racer.finished &&
    Number.isInteger(racer.lap) &&
    racer.lap >= 0 &&
    Number.isFinite(racer.trackProgress) &&
    racer.trackProgress >= 0 &&
    racer.trackProgress < 1;
  const owner = racers.find((racer) => racer.id === ownerId);
  if (owner === undefined || !valid(owner)) return null;
  const progress = owner.lap + owner.trackProgress;
  let nearest: RacerProgress | null = null;
  let gap = Infinity;
  for (const racer of racers) {
    if (racer.id === ownerId || !valid(racer)) continue;
    const distance = racer.lap + racer.trackProgress - progress;
    if (distance <= 0) continue;
    if (distance < gap || (distance === gap && nearest !== null && racer.id < nearest.id)) {
      nearest = racer;
      gap = distance;
    }
  }
  return nearest;
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
