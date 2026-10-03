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

it('matches Neon drawing orientation and puts eight racer markers on the same oriented road', async () => {
  const { NeonGrid } = await import('../src/game/track/NeonGrid');
  const neon = new NeonGrid();
  const points = normalizeMinimapTrack(neon.samples, 100, 8, 'positive-z-down');
  const lowZ = neon.samples.reduce((best, p, i, all) => (p.z < (all[best]?.z ?? 0) ? i : best), 0);
  const highZ = neon.samples.reduce((best, p, i, all) => (p.z > (all[best]?.z ?? 0) ? i : best), 0);
  expect(points[lowZ]?.y ?? Infinity).toBeLessThan(points[highZ]?.y ?? -Infinity);
  const host = document.createElement('div');
  host.innerHTML = raceMinimapMarkup();
  const element = host.querySelector<HTMLElement>('[data-race-minimap]');
  if (!element) throw new Error('Missing minimap');
  const progresses = [0, 0.12, 0.3, 0.36, 0.42, 0.6, 0.8154, 0.98];
  const racers = progresses.map((progress, i) => ({
    id: `r${String(i)}`,
    name: `Racer ${String(i)}`,
    progress,
    portrait: '/portrait.png',
    isPlayer: i === 0,
  }));
  updateRaceMinimap(element, { track: points, racers });
  for (const [i, progress] of progresses.entries()) {
    const expected = minimapPointAtProgress(points, progress);
    expect(
      element.querySelector(`[data-minimap-racer="r${String(i)}"]`)?.getAttribute('transform'),
    ).toBe(`translate(${String(expected.x)} ${String(expected.y)})`);
    const world = neon.project(neon.curve.getPointAt(progress)).point;
    const scale =
      84 /
      Math.max(
        Math.max(...neon.samples.map((p) => p.x)) - Math.min(...neon.samples.map((p) => p.x)),
        Math.max(...neon.samples.map((p) => p.z)) - Math.min(...neon.samples.map((p) => p.z)),
      );
    const x =
      50 +
      (world.x -
        (Math.max(...neon.samples.map((p) => p.x)) + Math.min(...neon.samples.map((p) => p.x))) /
          2) *
        scale;
    const y =
      50 +
      (world.z -
        (Math.max(...neon.samples.map((p) => p.z)) + Math.min(...neon.samples.map((p) => p.z))) /
          2) *
        scale;
    expect(Math.abs(expected.x - x)).toBeLessThan(0.01);
    expect(Math.abs(expected.y - y)).toBeLessThan(0.01);
  }
});
