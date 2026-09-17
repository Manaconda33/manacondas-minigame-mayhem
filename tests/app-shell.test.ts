import { describe, expect, it } from 'vitest';
import { APP_TITLE, markGameFinished, mountAppShell, standingsMarkup } from '../src/app/mountAppShell';
import { raceMinimapMarkup } from '../src/app/raceMinimap';

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
});
