import { describe, expect, it } from 'vitest';
import { APP_TITLE, markGameFinished, mountAppShell, standingsMarkup } from '../src/app/mountAppShell';
import { raceMinimapMarkup } from '../src/app/raceMinimap';
import { GAME_SETTINGS_STORAGE_KEY } from '../src/config/gameSettings';

describe('Slice 0 app shell', () => {
  it('mounts the product title without entering gameplay', () => {
    const root = document.createElement('div');

    mountAppShell(root);

    expect(APP_TITLE).toBe("Manaconda's Minigame Mayhem");
    expect(root.querySelector('h1')?.textContent).toBe(APP_TITLE);
    expect(root.querySelector('.title-mark svg')).not.toBeNull();
    expect(root.querySelector('.title-screen .eyebrow')).toBeNull();
    expect(root.querySelector('.title-mark')?.textContent.trim()).toBe('');
    expect(root.textContent).toContain('Enter the Hub');
    expect(root.querySelector('canvas')).toBeNull();
  });

  it('routes Grand Prix through a twelve-slot character selection scaffold', () => {
    const root = document.createElement('div');
    mountAppShell(root);
    root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    root.querySelector<HTMLElement>('[data-action="play"]')?.click();

    expect(root.querySelectorAll('[data-character]')).toHaveLength(12);
    expect(root.querySelector('[data-character="aa-02"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(root.textContent).toContain('Race as Lavi');

    root.querySelector<HTMLElement>('[data-character="aa-01"]')?.click();
    expect(root.textContent).toContain('Race as Alex');
    expect(root.textContent).toContain('The Neon Vector');
    expect(root.textContent).toContain('Feather Sprinter');
    expect(root.textContent).not.toContain('Racer 01');

    root.querySelector<HTMLElement>('[data-character="aa-06"]')?.click();
    expect(root.textContent).toContain('Race as Dragon Queen');
    expect(root.textContent).toContain('The Sovereign Wyrm');
    expect(root.textContent).toContain('Grip Specialist');
    expect(root.textContent).not.toContain('Roster placeholder');
    expect(root.textContent).not.toContain('Fallback prototype');
    expect(root.textContent).not.toContain('Cleo');
    expect(root.textContent).not.toContain('The Gilded Stitch');

    root.querySelector<HTMLElement>('[data-character="aa-09"]')?.click();
    expect(root.textContent).toContain('Race as Manaconda');
    expect(root.textContent).toContain('The Wayfinder');

    root.querySelector<HTMLElement>('[data-character="aa-11"]')?.click();
    expect(root.textContent).toContain('Race as Accu');
    expect(root.textContent).toContain('Pink Precision');
    expect(root.textContent).toContain('Perfect aim. Maximum armor.');

    root.querySelector<HTMLElement>('[data-character="aa-04"]')?.click();
    expect(root.textContent).toContain('Race as Keeg');
    expect(root.textContent).toContain('The Mycelial Majesty');
    expect(root.textContent).not.toContain('Fallback prototype');

    root.querySelector<HTMLElement>('[data-character="aa-12"]')?.click();
    expect(root.textContent).toContain('Race as Jennifer');
    expect(root.textContent).toContain('The Hearthwarden');
    expect(root.textContent).toContain('All-Surface Heavy');
    expect(root.textContent).not.toContain('Roster placeholder');
  });

  it('replaces a failed production portrait with the character monogram', () => {
    const root = document.createElement('div');
    mountAppShell(root);
    root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    root.querySelector<HTMLElement>('[data-action="play"]')?.click();
    const portrait = root.querySelector<HTMLImageElement>('[data-character="aa-02"] img');
    portrait?.dispatchEvent(new Event('error'));
    expect(root.querySelector('[data-character="aa-02"] .portrait-fallback')?.textContent).toBe(
      'LV',
    );
  });

  it('marks the game shell so finished-race controls can clear the victory view', () => {
    const shell = document.createElement('section');
    shell.className = 'game-shell';

    markGameFinished(shell);

    expect(shell.classList.contains('is-finished')).toBe(true);
  });

  it('refreshes post-finish standings markup as later racers finish', () => {
    const initial = standingsMarkup([
      { name: 'YOU', place: 1, time: 62.5 },
      { name: 'Krios', place: null, time: null },
      { name: 'Alex', place: null, time: null },
    ]);
    expect(initial).toContain('Krios</span><strong>RACING');
    expect(initial).toContain('Alex</span><strong>RACING');

    const updated = standingsMarkup([
      { name: 'YOU', place: 1, time: 62.5 },
      { name: 'Krios', place: 2, time: 64.25 },
      { name: 'Alex', place: 3, time: 65.75 },
    ]);
    expect(updated).not.toContain('RACING');
    expect(updated).toContain('2. Krios</span><strong>1:04.25');
    expect(updated).toContain('3. Alex</span><strong>1:05.75');
  });

  it('provides a non-interactive race minimap surface for responsive HUD placement', () => {
    const host = document.createElement('div');
    host.innerHTML = raceMinimapMarkup();

    expect(host.querySelector('[data-race-minimap]')?.getAttribute('role')).toBe('img');
    expect(host.querySelector('[data-minimap-racers]')).not.toBeNull();
  });

  it('persists audio and graphics settings across shell mounts', () => {
    window.localStorage.clear();
    const root = document.createElement('div');
    mountAppShell(root);
    root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    root.querySelector<HTMLElement>('[data-action="settings"]')?.click();

    const master = root.querySelector<HTMLInputElement>('#master-volume');
    const music = root.querySelector<HTMLInputElement>('#music-volume');
    const sfx = root.querySelector<HTMLInputElement>('#sfx-volume');
    const graphics = root.querySelector<HTMLSelectElement>('#graphics-quality');
    if (master === null || music === null || sfx === null || graphics === null)
      throw new Error('Settings controls were not rendered.');

    master.value = '0.65';
    master.dispatchEvent(new Event('input'));
    music.value = '0.45';
    music.dispatchEvent(new Event('input'));
    sfx.value = '0.8';
    sfx.dispatchEvent(new Event('input'));
    graphics.value = 'low';
    graphics.dispatchEvent(new Event('change'));

    const stored = JSON.parse(window.localStorage.getItem(GAME_SETTINGS_STORAGE_KEY) ?? '{}') as {
      audio?: { master?: number; music?: number; sfx?: number };
      graphics?: { quality?: string };
    };
    expect(stored.audio).toMatchObject({ master: 0.65, music: 0.45, sfx: 0.8 });
    expect(stored.graphics?.quality).toBe('low');

    const remount = document.createElement('div');
    mountAppShell(remount);
    remount.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    remount.querySelector<HTMLElement>('[data-action="settings"]')?.click();

    expect(remount.querySelector<HTMLInputElement>('#master-volume')?.value).toBe('0.65');
    expect(remount.querySelector<HTMLInputElement>('#music-volume')?.value).toBe('0.45');
    expect(remount.querySelector<HTMLInputElement>('#sfx-volume')?.value).toBe('0.8');
    expect(remount.querySelector<HTMLSelectElement>('#graphics-quality')?.value).toBe('low');
    window.localStorage.clear();
  });

});
