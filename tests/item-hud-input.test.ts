import { describe, expect, it } from 'vitest';
import { itemHudMarkup, updateItemHud, updateTouchItemButton } from '../src/app/itemHud';
import { touchControlsMarkup } from '../src/app/touchControls';
import type { ItemHudSnapshot } from '../src/game/items/ItemSystem';

function host(): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = itemHudMarkup();
  const element = container.querySelector<HTMLElement>('#item-hud');
  if (element === null) throw new Error('item HUD test host missing');
  return element;
}

const empty: ItemHudSnapshot = {
  phase: 'empty',
  itemId: null,
  displayName: 'Empty',
  icon: '—',
  remainingCharges: 0,
  totalCharges: 0,
  rouletteProgress: 0,
  useFeedback: null,
};

function touchItemButton(): HTMLButtonElement {
  const container = document.createElement('div');
  container.innerHTML = touchControlsMarkup(true);
  const button = container.querySelector<HTMLButtonElement>('[data-touch="item"]');
  if (button === null) throw new Error('touch item button missing');
  return button;
}

describe('Slice 5 item HUD', () => {
  it('renders an empty one-slot item surface', () => {
    const element = host();
    updateItemHud(element, empty);

    expect(element.dataset.phase).toBe('empty');
    expect(element.querySelector('#item-name')?.textContent).toBe('EMPTY');
    expect(element.querySelector('#item-meta')?.textContent).toBe('DRIVE THROUGH ITEM BOX');
    expect(element.querySelector<HTMLElement>('#item-roulette-meter')?.hidden).toBe(true);
  });

  it('shows roulette presentation without exposing the locked final item', () => {
    const element = host();
    updateItemHud(element, {
      phase: 'roulette',
      itemId: 'shockwave',
      displayName: 'Acoustic Shockwave Pulse',
      icon: '◌',
      remainingCharges: 0,
      totalCharges: 0,
      rouletteProgress: 0.42,
      useFeedback: null,
    });

    expect(element.dataset.phase).toBe('roulette');
    expect(element.querySelector('#item-icon')?.textContent).toBe('◌');
    expect(element.querySelector('#item-meta')?.textContent).toBe('ROULETTE 42%');
    expect(element.querySelector<HTMLElement>('#item-roulette-fill')?.style.width).toBe('42%');
  });

  it('shows multi-charge count and registered backward input', () => {
    const element = host();
    const held: ItemHudSnapshot = {
      phase: 'held',
      itemId: 'blaze-orbs',
      displayName: 'Blaze Orbs',
      icon: '✹',
      remainingCharges: 5,
      totalCharges: 5,
      rouletteProgress: 1,
      useFeedback: null,
    };

    updateItemHud(element, held);
    expect(element.querySelector('#item-meta')?.textContent).toBe('5 / 5 CHARGES · SHIFT / E');

    updateItemHud(element, { ...held, useFeedback: 'backward' });
    expect(element.querySelector('#item-meta')?.textContent).toBe('BACKWARD INPUT REGISTERED');
  });
});

describe('Slice 5 mobile ITEM control', () => {
  it('remains absent for non-mobile sessions', () => {
    expect(touchControlsMarkup(false)).toBe('');
  });

  it('adds a dedicated ITEM control alongside the existing touch controls', () => {
    const container = document.createElement('div');
    container.innerHTML = touchControlsMarkup(true);

    expect(container.querySelector('#mobile-steering-wheel')?.getAttribute('aria-label')).toContain(
      'accelerates',
    );
    expect(container.querySelector('[data-touch="brake"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="accelerate"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="drift"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="rear"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="recover"]')).not.toBeNull();
    expect(container.querySelector('[data-touch-item-label]')?.textContent).toBe('ITEM');
  });

  it('starts with an empty item visualization and an accurate accessible name', () => {
    const button = touchItemButton();
    updateTouchItemButton(button, empty);

    expect(button.dataset.phase).toBe('empty');
    expect(button.querySelector<HTMLImageElement>('[data-touch-item-art]')?.hidden).toBe(true);
    expect(button.querySelector('[data-touch-item-placeholder]')?.textContent).toBe('—');
    expect(button.getAttribute('aria-label')).toContain('No item held');
    expect(button.getAttribute('aria-label')).toContain('Shift or E');
  });

  it('keeps roulette artwork neutral and shows only approved artwork for a held item', () => {
    const button = touchItemButton();
    updateTouchItemButton(button, {
      ...empty,
      phase: 'roulette',
      itemId: 'shockwave',
      displayName: 'Acoustic Shockwave Pulse',
      icon: '◌',
      rouletteProgress: 0.62,
    });

    const art = button.querySelector<HTMLImageElement>('[data-touch-item-art]');
    expect(art?.hidden).toBe(true);
    expect(art?.hasAttribute('src')).toBe(false);
    expect(button.querySelector('[data-touch-item-placeholder]')?.textContent).toBe('◌');
    expect(button.getAttribute('aria-label')?.toLowerCase()).toContain('roulette');
    expect(button.getAttribute('aria-label')).toContain('Shift or E');

    updateTouchItemButton(button, {
      phase: 'held',
      itemId: 'blaze-orbs',
      displayName: 'Blaze Orbs',
      icon: '✹',
      remainingCharges: 3,
      totalCharges: 5,
      rouletteProgress: 1,
      useFeedback: null,
    });
    expect(art?.hidden).toBe(false);
    expect(art?.getAttribute('src')).toContain('assets/items/route-night/blaze-orbs.png');
    expect(button.querySelector('[data-touch-item-charges]')?.textContent).toBe('3 / 5');
    expect(button.getAttribute('aria-label')).toContain('Use Blaze Orbs, 3 of 5 charges.');
    expect(button.getAttribute('aria-label')).toContain('Shift or E');
  });

  it('clears consumed artwork and falls back to the approved text glyph after an image error', () => {
    const button = touchItemButton();
    updateTouchItemButton(button, {
      phase: 'held',
      itemId: 'shockwave',
      displayName: 'Acoustic Shockwave Pulse',
      icon: '◌',
      remainingCharges: 1,
      totalCharges: 1,
      rouletteProgress: 1,
      useFeedback: null,
    });
    const art = button.querySelector<HTMLImageElement>('[data-touch-item-art]');
    art?.dispatchEvent(new Event('error'));
    expect(art?.hidden).toBe(true);
    expect(button.querySelector('[data-touch-item-placeholder]')?.textContent).toBe('◌');

    updateTouchItemButton(button, empty);
    expect(art?.hidden).toBe(true);
    expect(art?.hasAttribute('src')).toBe(false);
    expect(button.querySelector('[data-touch-item-placeholder]')?.textContent).toBe('—');
    expect(button.getAttribute('aria-label')).toContain('No item held');
  });
});
