import { describe, expect, it } from 'vitest';
import {
  bindResultsArtFallbacks,
  formatResultTime,
  renderResultsPodium,
  updateResultsPodium,
} from '../src/ui/resultsPodium';
import type { RaceStanding } from '../src/game/raceResults';

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

  it('shows approved victory art only when mapped and uses full-body art for the lower-finish rail', () => {
    const host = document.createElement('div');
    host.innerHTML = renderResultsPodium(standingsWithPlayerPlace(2));
    const approvedVictory = host.querySelector<HTMLImageElement>(
      '[data-results-podium] [data-racer-id="ai-1"] [data-results-art]',
    );
    const selectionFallback = host.querySelector<HTMLImageElement>(
      '[data-results-finishers] [data-racer-id="ai-3"] [data-results-art]',
    );

    expect(approvedVictory?.getAttribute('src')).toContain('aa-01/results/victory.png');
    expect(selectionFallback?.getAttribute('src')).toContain('aa-03/selection/full-body.png');
    expect(selectionFallback?.dataset.resultState).toBe('selection-fallback');
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
