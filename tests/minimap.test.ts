import { describe, expect, it } from 'vitest';
import { minimapPointAtProgress, normalizeMinimapTrack } from '../src/game/ui/Minimap';
import { raceMinimapMarkup, updateRaceMinimap } from '../src/app/raceMinimap';
import { readFileSync } from 'node:fs';

describe('race minimap', () => {
  it('keeps racer portrait markers visible through the Route Night frame cascade', () => {
    const stylesheet = readFileSync('src/style.css', 'utf8');
    const frameRules = Array.from(
      stylesheet.matchAll(/(?:^|\n)\[data-minimap-frame\]\s*\{([^}]*)\}/g),
    );
    const lastFrameRule = frameRules.at(-1)?.[1] ?? '';

    expect(lastFrameRule).toMatch(/\bfill:\s*none\s*;/);
  });

  const track = normalizeMinimapTrack([
    { x: -20, z: -10 },
    { x: 20, z: -10 },
    { x: 20, z: 10 },
    { x: -20, z: 10 },
  ]);

  it('fits shared track topology inside a padded square without stretching it', () => {
    expect(track).toEqual([
      { x: 8, y: 71 },
      { x: 92, y: 71 },
      { x: 92, y: 29 },
      { x: 8, y: 29 },
    ]);
  });

  it('interpolates racer progress and wraps around the closed course', () => {
    expect(minimapPointAtProgress(track, 0.125)).toEqual({ x: 50, y: 71 });
    expect(minimapPointAtProgress(track, 1.125)).toEqual({ x: 50, y: 71 });
  });

  it('renders all racers and keeps the player marker visually distinct', () => {
    const host = document.createElement('div');
    host.innerHTML = raceMinimapMarkup();
    const minimap = host.querySelector<HTMLElement>('[data-race-minimap]');
    if (minimap === null) throw new Error('Missing minimap test element');

    updateRaceMinimap(minimap, {
      track,
      racers: [
        {
          id: 'ai-1',
          name: 'Lavi',
          progress: 0.25,
          portrait: '/lavi.png',
          isPlayer: false,
        },
        {
          id: 'player',
          name: 'YOU',
          progress: 0.5,
          portrait: '/player.png',
          isPlayer: true,
        },
      ],
    });

    expect(minimap.querySelector('[data-minimap-track]')?.getAttribute('d')).toContain('Z');
    expect(minimap.querySelectorAll('[data-minimap-racer]')).toHaveLength(2);
    expect(minimap.querySelector('[data-minimap-racer="player"] image')?.getAttribute('href')).toBe(
      '/player.png',
    );
    expect(minimap.querySelector('[data-minimap-racer="player"]')?.classList).toContain(
      'is-player',
    );
    expect(minimap.textContent).toContain('YOU');
  });
});
