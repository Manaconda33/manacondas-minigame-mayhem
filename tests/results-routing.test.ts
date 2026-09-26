import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';
import { characterById, characterManifest } from '../src/characters/manifest';
import { buildRaceStandings, type RaceStanding } from '../src/game/raceResults';
import type { RaceResult, TimeTrialOptions } from '../src/game/KartTimeTrial';

const raceHarness = vi.hoisted(() => ({
  games: [] as { options: unknown; instance: { start: () => void; dispose: () => void } }[],
  startedCount: 0,
  disposalCount: 0,
}));
const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');

vi.mock('../src/game/KartTimeTrial', () => ({
  KartTimeTrial: {
    create: (options: unknown) => {
      const instance = {
        start: () => {
          raceHarness.startedCount += 1;
        },
        dispose: () => {
          raceHarness.disposalCount += 1;
        },
      };
      raceHarness.games.push({ options, instance });
      return instance;
    },
  },
}));

interface RaceCallbacks {
  character: TimeTrialOptions['character'];
  onFinish: TimeTrialOptions['onFinish'];
  onStandings: TimeTrialOptions['onStandings'];
}

function makeResult(characterId: string): RaceResult {
  const player = characterById(characterId);
  const opponents = characterManifest.filter(({ id }) => id !== player.id).slice(0, 7);
  const identities = [
    {
      racerId: 'player',
      characterId: player.id,
      displayName: player.displayName,
      portrait: player.portrait ?? '',
    },
    ...opponents.map((character, index) => ({
      racerId: `ai-${String(index + 1)}`,
      characterId: character.id,
      displayName: character.displayName,
      portrait: character.portrait ?? '',
    })),
  ];
  const progress = [
    { id: 'player', finishPlace: 1, finishTime: 64.375 },
    ...opponents.map((_, index) => ({
      id: `ai-${String(index + 1)}`,
      finishPlace: index + 2,
      finishTime: 65.125 + index,
    })),
  ];
  const standings = buildRaceStandings(progress, identities);
  return { place: 1, time: 64.375, standings };
}

function raceCallbacks(): RaceCallbacks {
  const game = raceHarness.games.at(-1);
  if (game === undefined) throw new Error('Race was not created.');
  return game.options as RaceCallbacks;
}

async function startRace(characterId = 'aa-09'): Promise<HTMLElement> {
  const root = document.createElement('div');
  mountAppShell(root);
  root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
  root.querySelector<HTMLElement>('[data-action="play"]')?.click();
  root.querySelector<HTMLElement>(`[data-character="${characterId}"]`)?.click();
  root.querySelector<HTMLElement>('[data-action="confirm-character"]')?.click();
  await vi.waitFor(() => {
    expect(raceHarness.games).toHaveLength(1);
  });
  return root;
}

function finishRace(characterId: string): void {
  const result = makeResult(characterId);
  raceCallbacks().onFinish(result);
}

describe('Results navigation', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false }) as MediaQueryList,
    });
    raceHarness.games.length = 0;
    raceHarness.startedCount = 0;
    raceHarness.disposalCount = 0;
  });

  afterEach(() => {
    if (originalMatchMediaDescriptor === undefined) {
      Reflect.deleteProperty(window, 'matchMedia');
    } else {
      Object.defineProperty(window, 'matchMedia', originalMatchMediaDescriptor);
    }
  });

  it('restarts with the same selected character after disposing the finished race', async () => {
    const root = await startRace('aa-09');
    finishRace('aa-09');

    root.querySelector<HTMLElement>('[data-action="race-again"]')?.click();
    await vi.waitFor(() => {
      expect(raceHarness.games).toHaveLength(2);
    });

    expect(raceHarness.disposalCount).toBe(1);
    expect((raceHarness.games[1]?.options as RaceCallbacks).character.id).toBe('aa-09');
    expect(root.querySelector('[data-screen="results"]')).toBeNull();
    expect(root.querySelector('.game-shell')).not.toBeNull();
  });

  it('returns to Character Select with the selected character preserved', async () => {
    const root = await startRace('aa-09');
    finishRace('aa-09');

    root.querySelector<HTMLElement>('[data-action="change-driver"]')?.click();

    expect(raceHarness.disposalCount).toBe(1);
    expect(root.querySelector('[data-screen="character-select"]')).not.toBeNull();
    expect(root.querySelector('[data-character="aa-09"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('returns to the Hub after disposing the finished race', async () => {
    const root = await startRace('aa-09');
    finishRace('aa-09');

    root.querySelector<HTMLElement>('[data-action="return-to-hub"]')?.click();

    expect(raceHarness.disposalCount).toBe(1);
    expect(root.querySelector('[data-action="play"]')).not.toBeNull();
  });

  it('routes late authoritative standings into the open Results screen', async () => {
    const root = await startRace('aa-09');
    const initial = makeResult('aa-09');
    const unfinished = initial.standings.map((standing) =>
      standing.racerId === 'ai-7' ? { ...standing, place: null, time: null } : standing,
    );
    raceCallbacks().onFinish({ ...initial, standings: unfinished });
    const raceAgain = root.querySelector('[data-action="race-again"]');
    const refreshed: RaceStanding[] = unfinished.map((standing) =>
      standing.racerId === 'ai-7' ? { ...standing, place: 8, time: 72.875 } : standing,
    );

    raceCallbacks().onStandings?.(refreshed);

    expect(root.querySelector('[data-results-status]')?.textContent).toContain(
      'All 8 racers finished',
    );
    expect(root.querySelector('[data-results-standings]')?.textContent).toContain('01:12.875');
    expect(root.querySelector('[data-action="race-again"]')).toBe(raceAgain);
  });
});
