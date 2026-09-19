import { describe, expect, it } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';
import { routeNightAssetUrl } from '../src/ui/routeNight';

function mountRoot(): HTMLElement {
  const root = document.createElement('div');
  document.body.append(root);
  mountAppShell(root);
  return root;
}

function clickAction(root: HTMLElement, action: string): void {
  const control = root.querySelector<HTMLElement>(`[data-action="${action}"]`);
  expect(control).not.toBeNull();
  control?.click();
}

describe('Route Night UI system', () => {
  it('resolves authored Route Night assets through the deployed base path', () => {
    expect(routeNightAssetUrl('title-hero')).toContain(
      'assets/ui/route-night/route-night-title-hero.webp',
    );
    expect(routeNightAssetUrl('circuit-alpha-card')).toContain(
      'assets/ui/route-night/circuit-alpha-route-card.webp',
    );

    const resolveAsset = routeNightAssetUrl as (asset: string) => string;
    expect(resolveAsset('title-lockup')).toContain(
      'assets/ui/route-night/route-night-title-lockup.svg',
    );
    expect(resolveAsset('title-lockup-brush')).toContain(
      'assets/ui/route-night/route-night-title-lockup-brush.webp',
    );
    expect(resolveAsset('panel-texture')).toContain(
      'assets/ui/route-night/route-night-panel-texture.webp',
    );
    expect(resolveAsset('editorial-strip')).toContain(
      'assets/ui/route-night/route-night-editorial-strip.webp',
    );
    expect(resolveAsset('character-select-bay')).toContain(
      'assets/ui/route-night/route-night-character-select-bay.webp',
    );
    expect(resolveAsset('character-select-energy')).toContain(
      'assets/ui/route-night/route-night-character-select-energy.webp',
    );
    expect(resolveAsset('character-select-hero-aura')).toContain(
      'assets/ui/route-night/route-night-character-select-hero-aura.webp',
    );
    expect(resolveAsset('mark')).toContain('assets/ui/route-night/route-night-mark.svg');
    expect(resolveAsset('ui-sprite')).toContain('assets/ui/route-night/route-night-ui.svg');
    expect(resolveAsset('button-frames')).toContain(
      'assets/ui/route-night/route-night-button-frames.svg',
    );
    expect(resolveAsset('route-ornaments')).toContain(
      'assets/ui/route-night/route-night-route-ornaments.svg',
    );
    expect(resolveAsset('status')).toContain('assets/ui/route-night/route-night-status.svg');
  });

  it('presents the title screen as a cinematic, audio-aware entry point', () => {
    const root = mountRoot();

    expect(root.querySelector('main[data-screen="title"]')).not.toBeNull();
    expect(
      root.querySelector('.route-night-backdrop[data-route-asset="title-hero"]'),
    ).not.toBeNull();
    expect(root.querySelector('[data-route-asset="title-lockup-brush"]')).not.toBeNull();
    expect(
      root.querySelector('source[data-route-asset="title-lockup-brush"]')?.getAttribute('srcset'),
    ).toContain('route-night-title-lockup-brush.webp');
    expect(root.querySelector('img[data-route-asset="title-lockup-fallback"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="panel-texture"]')).not.toBeNull();
    expect(root.querySelector('svg[data-route-asset="mark"] image')).not.toBeNull();
    expect(root.querySelector('[data-audio-state]')).not.toBeNull();
    expect(root.textContent).toContain("Manaconda's Minigame Mayhem");
    expect(root.textContent).toMatch(/PRESS START|CLICK TO PLAY/);
    expect(root.querySelector('[data-action="enter"]')?.textContent).toMatch(
      /PRESS START|CLICK TO PLAY/,
    );
    expect(root.querySelector('[data-route-icon="play"] use')?.getAttribute('href')).toContain(
      '#icon-play',
    );
  });

  it('uses art-directed action plaques and a denser Route Night title board', () => {
    const root = mountRoot();

    const start = root.querySelector<HTMLButtonElement>('[data-action="enter"]');
    expect(start?.getAttribute('data-route-button')).toBe('primary');
    expect(start?.querySelector('[data-route-frame="primary"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="race"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="signal"]')).not.toBeNull();
    expect(root.querySelector('[data-route-board="title"]')).not.toBeNull();
    expect(root.querySelectorAll('[data-route-board="title"] [data-route-node]')).toHaveLength(2);
  });

  it('makes Circuit Alpha the playable hub destination and gates future cards', () => {
    const root = mountRoot();
    clickAction(root, 'enter');

    expect(root.querySelector('main[data-screen="hub"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="panel-texture"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="editorial-strip"]')).not.toBeNull();
    expect(root.querySelector('[data-route-board="hub"]')).not.toBeNull();
    expect(root.querySelectorAll('[data-route-board="hub"] [data-route-node]')).toHaveLength(3);
    expect(root.querySelector('[data-route-card="circuit-alpha"]')).not.toBeNull();
    expect(
      root.querySelector('img[data-route-asset="circuit-alpha-card"]')?.getAttribute('src'),
    ).toContain('assets/ui/route-night/circuit-alpha-route-card.webp');
    expect(root.querySelector('[data-action="play"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="play"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="controls"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="settings"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="minigames"]')).not.toBeNull();

    const comingSoonCards = root.querySelectorAll('[data-availability="coming-soon"]');
    expect(comingSoonCards).toHaveLength(2);
    comingSoonCards.forEach((card) => {
      expect(card.getAttribute('aria-disabled')).toBe('true');
      expect(card.textContent).toContain('COMING SOON');
      expect(card.querySelector('[data-action]')).toBeNull();
    });

    const unavailableCard = comingSoonCards[0] as HTMLElement;
    unavailableCard.click();
    expect(root.querySelector('main[data-screen="hub"]')).not.toBeNull();
    expect(root.querySelector('[data-action="controls"]')).not.toBeNull();
    expect(root.querySelector('[data-action="settings"]')).not.toBeNull();
  });

  it('keeps the existing desktop and mobile control bindings readable', () => {
    const root = mountRoot();
    clickAction(root, 'enter');
    clickAction(root, 'controls');

    expect(root.querySelector('main[data-screen="controls"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="panel-texture"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="editorial-strip"]')).not.toBeNull();
    expect(root.querySelector('[data-route-utility="input"]')).not.toBeNull();
    expect(root.querySelector('[data-control="accelerate"]')?.textContent).toContain('W');
    expect(root.querySelector('[data-control="brake-reverse"]')?.textContent).toContain('S');
    expect(root.querySelector('[data-control="steer"]')?.textContent).toContain('A');
    expect(root.querySelector('[data-control="use-item"]')?.textContent).toContain('Left Shift');
    expect(root.textContent).toContain('Mobile');
    expect(root.querySelector('[data-route-icon="back"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="controls"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="input"]')).not.toBeNull();
  });

  it('keeps settings controls in the Route Night utility destination', () => {
    const root = mountRoot();
    clickAction(root, 'enter');
    clickAction(root, 'settings');

    expect(root.querySelector('main[data-screen="settings"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="panel-texture"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="editorial-strip"]')).not.toBeNull();
    expect(root.querySelector('[data-route-utility="system"]')).not.toBeNull();
    expect(root.querySelector('#master-volume')).not.toBeNull();
    expect(root.querySelector('#music-volume')).not.toBeNull();
    expect(root.querySelector('#sfx-volume')).not.toBeNull();
    expect(root.querySelector('#graphics-quality')).not.toBeNull();
    expect(root.querySelector('[data-setting="master"]')).not.toBeNull();
    expect(root.querySelector('[data-setting="music"]')).not.toBeNull();
    expect(root.querySelector('[data-setting="sfx"]')).not.toBeNull();
    expect(root.querySelector('[data-setting="graphics"]')).not.toBeNull();
    expect(root.querySelector('[data-setting-value="master"]')?.textContent).toBe('100%');

    const master = root.querySelector<HTMLInputElement>('#master-volume');
    if (master !== null) {
      master.value = '0.65';
      master.dispatchEvent(new Event('input'));
    }
    expect(root.querySelector('[data-setting-value="master"]')?.textContent).toBe('65%');
    expect(root.querySelector('[data-route-icon="back"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="audio"]')).not.toBeNull();
    expect(root.querySelector('[data-route-icon="graphics"]')).not.toBeNull();
  });
});
