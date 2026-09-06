import { describe, expect, it } from 'vitest';
import { itemHudMarkup, updateItemHud } from '../src/app/itemHud';
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

describe('Slice 5 item HUD', () => {
  it('renders an empty one-slot item surface', () => {
    const element = host();
    updateItemHud(element, empty);

    expect(element.dataset.phase).toBe('empty');
    expect(element.querySelector('#item-name')?.textContent).toBe('EMPTY');
    expect(element.querySelector('#item-meta')?.textContent).toBe('DRIVE THROUGH ITEM BOX');
    expect((element.querySelector('#item-roulette-meter') as HTMLElement).hidden).toBe(true);
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
    expect((element.querySelector('#item-roulette-fill') as HTMLElement).style.width).toBe('42%');
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

    expect(container.querySelector('[data-touch="left"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="brake"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="drift"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="rear"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="recover"]')).not.toBeNull();
    expect(container.querySelector('[data-touch="item"]')?.textContent).toBe('ITEM');
  });
});
