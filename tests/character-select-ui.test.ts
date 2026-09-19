import { describe, expect, it } from 'vitest';
import { characterById } from '../src/characters/manifest';
import { mountAppShell } from '../src/app/mountAppShell';
import { CharacterKartPreview, characterPreviewAssetState } from '../src/ui/characterKartPreview';
import { characterWeightClass } from '../src/ui/characterSelect';

function openCharacterSelect(): HTMLElement {
  const root = document.createElement('div');
  mountAppShell(root);
  root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
  root.querySelector<HTMLElement>('[data-action="play"]')?.click();
  return root;
}

describe('Route Night Character Select', () => {
  it('renders a Route Night twelve-driver selection surface with approved generated layers', () => {
    const root = openCharacterSelect();

    expect(root.querySelector('main[data-screen="character-select"]')).not.toBeNull();
    expect(root.querySelector('.route-night-screen')).not.toBeNull();
    expect(root.querySelector('[data-character-roster]')).not.toBeNull();
    expect(root.querySelectorAll('[data-character]')).toHaveLength(12);
    expect(root.querySelectorAll('.character-grid [data-character-portrait]')).toHaveLength(12);
    expect(root.querySelector('[data-route-asset="character-select-bay"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="character-select-energy"]')).not.toBeNull();
    expect(root.querySelector('[data-route-asset="character-select-hero-aura"]')).not.toBeNull();
    expect(root.querySelector('[data-kart-preview]')).not.toBeNull();
    expect(root.querySelector('[data-kart-preview-canvas]')).not.toBeNull();
  });

  it('binds the selected driver art, kart, class, and six fixed stats to the manifest entry', () => {
    const root = openCharacterSelect();
    const lavi = characterById('aa-02');
    const selectedArt = root.querySelector<HTMLImageElement>('[data-selected-driver-art]');
    const preview = root.querySelector<HTMLElement>('[data-kart-preview]');

    expect(root.querySelector('[data-selected-driver-name]')?.textContent).toBe('Lavi');
    expect(root.querySelector('[data-selected-driver-class]')?.textContent).toContain(
      'Featherweight',
    );
    expect(selectedArt?.getAttribute('src')).toBe(lavi.driver?.front);
    expect(preview?.dataset.kartUrl).toBe(lavi.kart);
    expect(preview?.dataset.kartVisualYaw).toBe(String(lavi.kartVisualYaw));
    expect(root.querySelectorAll('[data-stat]')).toHaveLength(6);
    expect(root.querySelector('[data-stat="speed"] [data-stat-value]')?.textContent).toBe('5');
    expect(root.querySelector('[data-stat="miniTurbo"] [data-stat-value]')?.textContent).toBe('8');
    expect(root.querySelector('[data-action="confirm-character"]')?.textContent).toContain(
      'START RACE',
    );
  });

  it('updates the selected profile and preview contract when a roster card is chosen', () => {
    const root = openCharacterSelect();
    const alex = characterById('aa-01');

    const alexCard = root.querySelector<HTMLElement>('[data-character="aa-01"]');
    alexCard?.click();

    expect(root.querySelector('[data-character="aa-01"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(root.querySelector('[data-selected-driver-name]')?.textContent).toBe('Alex');
    expect(root.querySelector<HTMLImageElement>('[data-selected-driver-art]')?.src).toContain(
      alex.driver?.front ?? '',
    );
    expect(root.querySelector<HTMLElement>('[data-kart-preview]')?.dataset.kartUrl).toBe(alex.kart);
    expect(root.querySelector('[data-selected-driver-kart]')?.textContent).toContain(
      'The Neon Vector',
    );
  });

  it('uses the governed roster class mapping instead of deriving classes from raw weight', () => {
    expect(characterWeightClass(characterById('aa-01'))).toBe('Featherweight');
    expect(characterWeightClass(characterById('aa-04'))).toBe('Medium');
    expect(characterWeightClass(characterById('aa-09'))).toBe('Cruiser');
    expect(characterWeightClass(characterById('aa-10'))).toBe('Heavyweight');
  });

  it('exposes the governed preview asset contract and shared visual yaw', () => {
    const state = characterPreviewAssetState(characterById('aa-09'));

    expect(state.kartUrl).toContain('/assets/characters/aa-09/kart.glb');
    expect(state.driverUrl).toContain('/assets/characters/aa-09/driver/front.png');
    expect(state.kartVisualYaw).toBe(Math.PI);
    expect(state.fallbackLabel).toBe('The Wayfinder');
  });

  it('publishes a visible fallback state when WebGL is unavailable', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <canvas data-kart-preview-canvas></canvas>
      <span data-kart-preview-state-label></span>`;
    const canvas = wrapper.querySelector<HTMLCanvasElement>('[data-kart-preview-canvas]');
    const label = wrapper.querySelector<HTMLElement>('[data-kart-preview-state-label]');

    expect(canvas).not.toBeNull();
    if (canvas === null) throw new Error('Kart preview canvas did not render');
    const preview = new CharacterKartPreview(canvas, characterById('aa-02'));

    expect(canvas.dataset.kartPreviewState).toBe('unavailable');
    expect(label?.textContent).toContain('CSS FALLBACK');

    preview.dispose();
  });

  it('retains portrait fallback behavior inside the redesigned roster', () => {
    const root = openCharacterSelect();
    const portrait = root.querySelector<HTMLImageElement>('[data-character="aa-02"] img');

    portrait?.dispatchEvent(new Event('error'));

    expect(root.querySelector('[data-character="aa-02"] .portrait-fallback')?.textContent).toBe(
      'LV',
    );
  });
});
