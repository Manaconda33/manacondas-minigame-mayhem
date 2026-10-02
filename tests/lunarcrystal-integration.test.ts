import { describe, expect, it } from 'vitest';
import {
  characterById,
  characterManifest,
  validateCharacterManifest,
} from '../src/characters/manifest';
import { selectAiRoster } from '../src/characters/raceRoster';
import { mountAppShell } from '../src/app/mountAppShell';
import { raceResultsReactionUrl, raceResultsVictoryUrl } from '../src/ui/raceAssets';

describe('Lunarcrystal integration', () => {
  it('binds the approved unique profile and complete revisioned asset package', () => {
    const lunar = characterById('aa-14');
    expect(lunar.displayName).toBe('Lunarcrystal');
    expect(lunar.kartName).toBe('The Moonlit Carriage');
    expect(lunar.stats).toEqual({
      speed: 6,
      acceleration: 7,
      weight: 4,
      handling: 8,
      miniTurbo: 5,
      traction: 6,
    });
    expect(characterManifest).toHaveLength(14);
    expect(validateCharacterManifest()).toEqual([]);
    expect(lunar.kartVisualYaw).toBe(Math.PI);
    expect(lunar.kart).toContain('/lunarcrystal/kart.glb?v=');
    expect(lunar.selectionArt).toContain('/lunarcrystal/selection/full-body.png?v=');
    expect(Object.values(lunar.driver ?? {})).toHaveLength(10);
    for (const [key, filename] of Object.entries({
      rear: 'rear',
      front: 'front',
      steerLeft: 'steer-left',
      steerRight: 'steer-right',
      hit: 'hit',
      victory: 'victory',
      frontSteerLeft: 'front-steer-left',
      frontSteerRight: 'front-steer-right',
      frontHit: 'front-hit',
      frontVictory: 'front-victory',
    })) {
      expect(lunar.driver?.[key as keyof NonNullable<typeof lunar.driver>]).toBe(
        `/assets/characters/lunarcrystal/driver/${filename}.png?v=lunarcrystal-runtime-20261002-1`,
      );
    }
  });

  it('selects her beside Archer on page two and restores her selected page', () => {
    const root = document.createElement('div');
    mountAppShell(root);
    root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    root.querySelector<HTMLElement>('[data-action="play"]')?.click();
    expect(root.querySelectorAll('[data-character]')).toHaveLength(12);
    expect(
      [...root.querySelectorAll<HTMLElement>('[data-character]')].map((e) => e.dataset.character),
    ).toEqual([
      'aa-02',
      'aa-09',
      'aa-11',
      'aa-05',
      'aa-10',
      'aa-04',
      'aa-07',
      'aa-08',
      'aa-03',
      'aa-12',
      'aa-06',
      'aa-01',
    ]);
    root.querySelector<HTMLElement>('[data-action="roster-next"]')?.click();
    expect(
      [...root.querySelectorAll<HTMLElement>('[data-character]')].map((e) => e.dataset.character),
    ).toEqual(['aa-13', 'aa-14']);
    root.querySelector<HTMLElement>('[data-character="aa-14"]')?.click();
    expect(root.querySelector('[data-selected-driver-name]')?.textContent).toBe('Lunarcrystal');
    expect(root.querySelector('[data-selected-driver-class]')?.textContent).toContain('Medium');
    expect(root.querySelector('[data-selected-driver-kart]')?.textContent).toBe(
      'The Moonlit Carriage',
    );
    root.querySelector<HTMLElement>('[data-action="roster-previous"]')?.click();
    expect(root.querySelectorAll('[data-character]')).toHaveLength(12);
    expect(root.querySelector('[data-selected-driver-name]')?.textContent).toBe('Lunarcrystal');
    root.querySelector<HTMLElement>('[data-action="menu"]')?.click();
    root.querySelector<HTMLElement>('[data-action="play"]')?.click();
    expect(root.querySelector('[data-character="aa-14"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('retains seven unique AI opponents and admits Lunarcrystal to other drivers grids', () => {
    const opponents = selectAiRoster(characterManifest, 'aa-14', 7, () => 0.42);
    expect(new Set(opponents.map(({ id }) => id)).size).toBe(7);
    expect(opponents.some(({ id }) => id === 'aa-14')).toBe(false);
    expect(
      selectAiRoster(characterManifest, 'aa-01', 7, () => 0.4).some(({ id }) => id === 'aa-14'),
    ).toBe(true);
  });

  it('uses her exact approved Results poses only in their appropriate finish places', () => {
    expect(raceResultsVictoryUrl('aa-14', 1)).toBe(
      '/assets/characters/lunarcrystal/results/victory-full-body.png?v=dfeed0f933eba8ea9da26fea0f63d3206729b67502a9c8d826c230a91637ebab',
    );
    expect(raceResultsVictoryUrl('aa-14', 4)).toBeNull();
    expect(raceResultsReactionUrl('aa-14', 8)).toBe(
      '/assets/characters/lunarcrystal/results/reaction-full-body.png?v=637d4a41abeeb61f0b44500e1a4f4257783bb510ca8680027ae3b2f02137842e',
    );
    expect(raceResultsReactionUrl('aa-14', 3)).toBeNull();
  });
});
