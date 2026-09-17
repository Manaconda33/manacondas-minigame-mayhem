import type { RacerProgress } from './RaceDirector';

export const VALIDATED_PROGRESS_EPSILON = 0.000001;

/**
 * Produces the progress snapshot shared by standings and item targeting. Raw
 * spline projection may not claim progress beyond the next required gate.
 * CP11-to-finish is the only wrapped segment on Circuit Alpha, so it receives
 * an effective lap only after CP11 has been validated.
 */
export function validatedRaceProgressSnapshot(
  progress: RacerProgress,
  nextCheckpoint: number,
  finishProgress: number,
  nextCheckpointProgress?: number,
): RacerProgress {
  if (progress.finished) return { ...progress };

  const trackProgress = Math.min(
    Math.max(progress.trackProgress, 0),
    1 - VALIDATED_PROGRESS_EPSILON,
  );
  if (nextCheckpoint === 0) {
    return {
      ...progress,
      trackProgress,
      lap: progress.lap + (trackProgress < finishProgress ? 1 : 0),
    };
  }

  if (nextCheckpointProgress === undefined) return { ...progress, trackProgress };
  const ceiling = Math.max(
    0,
    Math.min(1 - VALIDATED_PROGRESS_EPSILON, nextCheckpointProgress - VALIDATED_PROGRESS_EPSILON),
  );
  return { ...progress, trackProgress: Math.min(trackProgress, ceiling) };
}
