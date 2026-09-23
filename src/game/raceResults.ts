export interface RaceStanding {
  racerId: string;
  characterId: string;
  displayName: string;
  /** Legacy display field retained for existing result consumers. */
  name: string;
  portrait: string;
  place: number | null;
  time: number | null;
}

export interface RaceRacerIdentity {
  racerId: string;
  characterId: string;
  displayName: string;
  portrait: string;
}

export interface RaceProgressResult {
  id: string;
  finishPlace: number | null;
  finishTime: number | null;
}

export function buildRaceStandings(
  orderedProgress: readonly RaceProgressResult[],
  identities: readonly RaceRacerIdentity[],
): RaceStanding[] {
  const identityByRacerId = new Map(identities.map((identity) => [identity.racerId, identity]));

  return orderedProgress.map((progress) => {
    const identity = identityByRacerId.get(progress.id);
    const displayName = identity?.displayName ?? progress.id;

    return {
      racerId: progress.id,
      characterId: identity?.characterId ?? '',
      displayName,
      name: progress.id === 'player' ? 'YOU' : displayName,
      portrait: identity?.portrait ?? '',
      place: progress.finishPlace,
      time: progress.finishTime,
    };
  });
}
