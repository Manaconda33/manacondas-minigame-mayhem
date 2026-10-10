import { describe, expect, it, vi } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';

vi.mock('../ui/characterKartPreview', () => ({
  CharacterKartPreview: class {
    dispose() {
      return undefined;
    }
  },
}));
describe('kart circuit choice remains separate from minigame index', () => {
  it('selects Neon Grid before the driver and can return to Alpha without altering the Hub detours', () => {
    const root = document.createElement('div');
    document.body.append(root);
    const dispose = mountAppShell(root);
    root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    expect(root.querySelector('[data-route-card="gallery-gauntlet"]')).not.toBeNull();
    const neon = root.querySelector<HTMLElement>('[data-action="play-neon-grid"]');
    expect(neon).not.toBeNull();
    neon?.click();
    expect(
      root.querySelector('[data-screen="character-select"]')?.getAttribute('data-track-id'),
    ).toBe('neon-grid');
    expect(root.querySelector('.character-select-header .route-label')?.textContent).toBe(
      'ROUTE NIGHT / NEON GRID',
    );
    root.querySelector<HTMLElement>('[data-action="menu"]')?.click();
    root.querySelector<HTMLElement>('[data-action="play"]')?.click();
    expect(
      root.querySelector('[data-screen="character-select"]')?.getAttribute('data-track-id'),
    ).toBe('circuit-alpha');
    expect(root.querySelector('.character-select-header .route-label')?.textContent).toBe(
      'ROUTE NIGHT / CIRCUIT ALPHA',
    );
    dispose();
    root.remove();
  });
});
