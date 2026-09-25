import { describe, expect, it } from 'vitest';
import {
  bindResultsArtFallbacks,
  formatResultTime,
  renderResultsPodium,
  updateResultsPodium,
} from '../src/ui/resultsPodium';
import type { RaceStanding } from '../src/game/raceResults';
import { raceResultsReactionUrl } from '../src/ui/raceAssets';

const racers: Omit<RaceStanding, 'place' | 'time'>[] = [
  {
    racerId: 'player',
    characterId: 'aa-09',
    displayName: 'Manaconda',
    name: 'YOU',
    portrait: '/assets/characters/aa-09/portrait.png',
  },
  {
    racerId: 'ai-1',
    characterId: 'aa-01',
    displayName: 'Alex',
    name: 'Alex',
    portrait: '/assets/characters/aa-01/portrait.png',
  },
  {
    racerId: 'ai-2',
    characterId: 'aa-02',
    displayName: 'Lavi',
    name: 'Lavi',
    portrait: '/assets/characters/aa-02/portrait.png',
  },
  {
    racerId: 'ai-3',
    characterId: 'aa-03',
    displayName: 'Lula',
    name: 'Lula',
    portrait: '/assets/characters/aa-03/portrait.png',
  },
  {
    racerId: 'ai-4',
    characterId: 'aa-04',
    displayName: 'Keeg',
    name: 'Keeg',
    portrait: '/assets/characters/aa-04/portrait.png',
  },
  {
    racerId: 'ai-5',
    characterId: 'aa-05',
    displayName: 'Kraken',
    name: 'Kraken',
    portrait: '/assets/characters/aa-05/portrait.png',
  },
  {
    racerId: 'ai-6',
    characterId: 'aa-06',
    displayName: 'Dragon Queen',
    name: 'Dragon Queen',
    portrait: '/assets/characters/aa-06/portrait.png',
  },
  {
    racerId: 'ai-7',
    characterId: 'aa-07',
    displayName: 'McFleurdel',
    name: 'McFleurdel',
    portrait: '/assets/characters/aa-07/portrait.png',
  },
];

function standingsWithPlayerPlace(playerPlace: number): RaceStanding[] {
  const order = racers.filter(({ racerId }) => racerId !== 'player');
  const player = racers.find(({ racerId }) => racerId === 'player');
  if (player === undefined) throw new Error('Player fixture is missing.');
  order.splice(playerPlace - 1, 0, player);

  return order.map((racer, index) => ({ ...racer, place: index + 1, time: 62.125 + index }));
}

describe('Results/Podium presentation', () => {
  it.each(Array.from({ length: 12 }, (_, index) => `aa-${String(index + 1).padStart(2, '0')}`))(
    'maps approved reaction art for %s only to lower-finish places',
    (characterId) => {
      expect(raceResultsReactionUrl(characterId, 4)).toContain(
        `/assets/characters/${characterId}/results/reaction.png?v=`,
      );
      expect(raceResultsReactionUrl(characterId, 8)).toContain(
        `/assets/characters/${characterId}/results/reaction.png?v=`,
      );
      expect(raceResultsReactionUrl(characterId, 3)).toBeNull();
      expect(raceResultsReactionUrl(characterId, 9)).toBeNull();
    },
  );

  it('carries millisecond rounding across a minute boundary', () => {
    expect(formatResultTime(59.9997)).toBe('01:00.000');
  });

  it('orders podium and lower finishers by authoritative place, not callback array order', () => {
    const standings = standingsWithPlayerPlace(2);
    const shuffled = [4, 2, 7, 0, 1, 3, 5, 6]
      .map((index) => standings[index])
      .filter((standing): standing is RaceStanding => standing !== undefined);
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(shuffled);

    expect(
      Array.from(host.querySelectorAll<HTMLElement>('[data-results-podium] [data-racer-id]')).map(
        ({ dataset }) => [dataset.place, dataset.racerId],
      ),
    ).toEqual([
      ['1', 'ai-1'],
      ['2', 'player'],
      ['3', 'ai-2'],
    ]);
    expect(
      Array.from(
        host.querySelectorAll<HTMLElement>('[data-results-finishers] [data-racer-id]'),
      ).map(({ dataset }) => dataset.place),
    ).toEqual(['4', '5', '6', '7', '8']);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    'keeps the player identity in the correct finish area for place %i',
    (place) => {
      const host = document.createElement('div');
      host.innerHTML = renderResultsPodium(standingsWithPlayerPlace(place));

      const area = place <= 3 ? '[data-results-podium]' : '[data-results-finishers]';
      expect(
        host.querySelector(`${area} [data-racer-id="player"]`)?.getAttribute('data-place'),
      ).toBe(String(place));
      expect(host.querySelectorAll('[data-results-standings] li')).toHaveLength(8);
    },
  );

  it('uses approved lower-finish reactions by stable character ID only in places four through eight', () => {
    const host = document.createElement('div');
    const standings = standingsWithPlayerPlace(2).map((standing) => {
      if (standing.racerId === 'ai-1') return { ...standing, place: 4 };
      if (standing.racerId === 'ai-3') return { ...standing, place: 5 };
      return standing;
    });
    host.innerHTML = renderResultsPodium(standings);
    const alexReaction = host.querySelector<HTMLImageElement>(
      '[data-results-finishers] [data-racer-id="ai-1"] [data-results-art]',
    );
    const lulaReaction = host.querySelector<HTMLImageElement>(
      '[data-results-finishers] [data-racer-id="ai-3"] [data-results-art]',
    );

    expect(alexReaction?.getAttribute('src')).toContain('aa-01/results/reaction.png');
    expect(alexReaction?.dataset.resultState).toBe('reaction');
    expect(lulaReaction?.getAttribute('src')).toContain('aa-03/results/reaction.png');
    expect(lulaReaction?.dataset.resultState).toBe('reaction');
    expect(
      host
        .querySelector('[data-results-podium] [data-racer-id="ai-2"] [data-results-art]')
        ?.getAttribute('src'),
    ).toContain('aa-02/results/victory.png');
  });

  it('shows approved victory art on the podium and reaction art in the lower-finish rail', () => {
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(standingsWithPlayerPlace(2));
    const approvedVictory = host.querySelector<HTMLImageElement>(
      '[data-results-podium] [data-racer-id="ai-1"] [data-results-art]',
    );
    const selectionFallback = host.querySelector<HTMLImageElement>(
      '[data-results-finishers] [data-racer-id="ai-3"] [data-results-art]',
    );

    expect(approvedVictory?.getAttribute('src')).toContain('aa-01/results/victory.png');
    expect(selectionFallback?.getAttribute('src')).toContain('aa-03/results/reaction.png');
    expect(selectionFallback?.dataset.resultState).toBe('reaction');
  });

  it('resolves reaction artwork from stable character identity and keeps it out of podium places', () => {
    const standings = standingsWithPlayerPlace(2).map((standing) =>
      standing.racerId === 'ai-1'
        ? { ...standing, place: 4, displayName: 'Renamed display label' }
        : standing,
    );
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(standings);

    const reaction = host.querySelector<HTMLImageElement>(
      '[data-results-finishers] [data-racer-id="ai-1"] [data-results-art]',
    );
    expect(reaction?.getAttribute('src')).toContain('aa-01/results/reaction.png');
    expect(reaction?.getAttribute('src')).toContain(
      'v=b6df95f50c0aa83908f2909e231b763031b2099e62b6fb67cff6a5798f97d650',
    );
    expect(host.querySelector('[data-results-podium] [data-racer-id="ai-1"]')).toBeNull();
  });

  it('advances failed art through selection image, portrait, and monogram without removing the row', () => {
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(standingsWithPlayerPlace(2));
    const card = host.querySelector<HTMLElement>('[data-results-podium] [data-racer-id="ai-1"]');
    if (card === null) throw new Error('Alex podium card was not rendered.');
    const image = card.querySelector<HTMLImageElement>('[data-results-art]');
    if (image === null) throw new Error('Alex podium art was not rendered.');
    bindResultsArtFallbacks(host);

    const selectionArt = image.dataset.fallbackSelection;
    const portrait = image.dataset.fallbackPortrait;
    image.dispatchEvent(new Event('error'));
    expect(image.getAttribute('src')).toBe(selectionArt);
    image.dispatchEvent(new Event('error'));
    expect(image.getAttribute('src')).toBe(portrait);
    image.dispatchEvent(new Event('error'));

    expect(image.hidden).toBe(true);
    expect(card.querySelector('[data-art-monogram]')?.textContent).toBe('AX');
    expect(card.querySelector('[data-art-monogram]')?.hasAttribute('hidden')).toBe(false);
    expect(host.querySelectorAll('[data-results-standings] li')).toHaveLength(8);
  });

  it('falls back from a missing reaction image to that character’s selection art', () => {
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(standingsWithPlayerPlace(2));
    const image = host.querySelector<HTMLImageElement>(
      '[data-results-finishers] [data-racer-id="ai-3"] [data-results-art]',
    );
    if (image === null) throw new Error('Lula reaction art was not rendered.');
    bindResultsArtFallbacks(host);

    const selectionArt = image.dataset.fallbackSelection;
    image.dispatchEvent(new Event('error'));

    expect(image.getAttribute('src')).toBe(selectionArt);
    expect(image.hidden).toBe(false);
  });

  it('refreshes late finishers without replacing the action buttons and exposes a separate live status', () => {
    const initial = standingsWithPlayerPlace(1).map((standing, index) =>
      index >= 5 ? { ...standing, place: null, time: null } : standing,
    );
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(initial);
    const raceAgain = host.querySelector('[data-action="race-again"]');
    expect(host.querySelector('[data-results-status]')?.getAttribute('aria-live')).toBe('polite');
    expect(host.querySelector('[data-results-standings]')?.hasAttribute('aria-live')).toBe(false);
    expect(host.querySelector('[data-results-standings-scroll]')?.getAttribute('role')).toBe(
      'region',
    );

    const refreshed = initial.map((standing) =>
      standing.racerId === 'ai-6' ? { ...standing, place: 6, time: 70.875 } : standing,
    );
    updateResultsPodium(host, refreshed);

    expect(host.querySelector('[data-action="race-again"]')).toBe(raceAgain);
    expect(host.querySelector('[data-results-status]')?.textContent).toContain(
      '6 of 8 racers finished',
    );
    expect(host.querySelector('[data-results-standings]')?.textContent).toContain('01:10.875');
    expect(host.querySelectorAll('[data-results-standings] li')).toHaveLength(8);
  });

  it('offers all three named race routes as keyboard-accessible buttons', () => {
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(standingsWithPlayerPlace(2));

    expect(host.querySelector('[data-action="race-again"]')?.textContent).toContain('Race Again');
    expect(host.querySelector('[data-action="change-driver"]')?.textContent).toContain(
      'Change Driver',
    );
    expect(host.querySelector('[data-action="return-to-hub"]')?.textContent).toContain(
      'Return to Hub',
    );
    expect(host.querySelectorAll('button[data-action]')).toHaveLength(3);
  });
});
