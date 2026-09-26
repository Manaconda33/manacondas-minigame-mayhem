import { describe, expect, it } from 'vitest';
import { itemHudMarkup, updateItemHud } from '../src/app/itemHud';
import { raceHudMarkup } from '../src/app/raceHud';
import { raceMinimapMarkup } from '../src/app/raceMinimap';
import {
  routeNightAssetUrl,
  routeNightItemAssetUrl,
  routeNightRaceHudMarkup,
} from '../src/ui/routeNight';
import type { ItemHudSnapshot } from '../src/game/items/ItemSystem';

describe('Route Night race HUD asset contracts', () => {
  it('resolves the authored race HUD vector and atmosphere through the deployed base path', () => {
    expect(routeNightAssetUrl('race-hud')).toContain(
      'assets/ui/route-night/route-night-race-hud.svg',
    );
    expect(routeNightAssetUrl('race-hud-atmosphere')).toContain(
      'assets/ui/route-night/race-hud-atmosphere.webp',
    );
    expect(routeNightItemAssetUrl('shockwave')).toContain('assets/items/route-night/shockwave.png');
    expect(routeNightRaceHudMarkup('frame-panel')).toContain('#frame-panel');
  });

  it('renders a semantic race shell that composes the live HUD and authored vector layer', () => {
    const host = document.createElement('div');
    host.innerHTML = raceHudMarkup('');

    expect(host.querySelector('[data-race-hud]')).not.toBeNull();
    expect(host.querySelector('[data-route-asset="race-hud-atmosphere"]')).not.toBeNull();
    expect(host.querySelector('[data-race-region="lap"]')).not.toBeNull();
    expect(host.querySelector('[data-race-region="speed"]')).not.toBeNull();
    expect(host.querySelector('[data-race-region="item"]')).not.toBeNull();
    expect(host.querySelector('[data-race-region="minimap"]')).not.toBeNull();
    expect(host.querySelector('[data-race-symbol="frame-panel"]')).not.toBeNull();
  });

  it('keeps per-frame HUD values out of live announcement regions', () => {
    const host = document.createElement('div');
    host.innerHTML = raceHudMarkup('');

    for (const selector of [
      '#lap',
      '#time',
      '#speed',
      '#position',
      '#surface',
      '#performance',
      '#item-hud',
    ]) {
      expect(host.querySelector(selector)?.closest('[aria-live]')).toBeNull();
    }
  });

  it('exposes each live HUD value in one region and preserves warning hooks on mobile', () => {
    const host = document.createElement('div');
    host.innerHTML = raceHudMarkup('touch controls');

    for (const region of [
      'lap',
      'time',
      'speed',
      'position',
      'item',
      'minimap',
      'surface',
      'performance',
      'drift',
    ]) {
      expect(host.querySelectorAll(`[data-race-region="${region}"]`)).toHaveLength(1);
    }
    for (const selector of [
      '#countdown',
      '#wrong-way',
      '#seeker-warning',
      '#apex-warning',
      '#item-use-message',
    ]) {
      expect(host.querySelector(selector)).not.toBeNull();
    }
  });

  it('applies the touch HUD only when coarse-only controls are present', () => {
    const desktop = document.createElement('div');
    desktop.innerHTML = raceHudMarkup('');
    const touch = document.createElement('div');
    touch.innerHTML = raceHudMarkup('<div id="touch-controls"></div>');

    expect(desktop.querySelector('.route-night-race')?.hasAttribute('data-touch-session')).toBe(
      false,
    );
    expect(touch.querySelector('.route-night-race')?.getAttribute('data-touch-session')).toBe(
      'true',
    );
  });

  it('maps a held item to its approved visual while keeping text fallback data live', () => {
    const host = document.createElement('div');
    host.innerHTML = itemHudMarkup();
    const itemHud = host.querySelector<HTMLElement>('#item-hud');
    if (itemHud === null) throw new Error('Missing item HUD');

    const held: ItemHudSnapshot = {
      phase: 'held',
      itemId: 'shockwave',
      displayName: 'Acoustic Shockwave Pulse',
      icon: '◌',
      remainingCharges: 1,
      totalCharges: 1,
      rouletteProgress: 1,
      useFeedback: null,
    };
    updateItemHud(itemHud, held);

    expect(itemHud.querySelector<HTMLImageElement>('#item-art')?.getAttribute('src')).toContain(
      'assets/items/route-night/shockwave.png',
    );
    expect(itemHud.querySelector('#item-name')?.textContent).toBe('ACOUSTIC SHOCKWAVE PULSE');
    expect(itemHud.querySelector('#item-icon')?.textContent).toBe('◌');
  });

  it('keeps minimap geometry live while adding the authored Route Night frame', () => {
    const host = document.createElement('div');
    host.innerHTML = raceMinimapMarkup();

    expect(host.querySelector('[data-minimap-frame-art] use')?.getAttribute('href')).toContain(
      '#frame-minimap',
    );
    expect(host.querySelector('[data-minimap-track]')).not.toBeNull();
    expect(host.querySelector('[data-minimap-racers]')).not.toBeNull();
  });
});
