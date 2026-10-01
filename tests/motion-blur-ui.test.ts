import { expect, it } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';
import { GAME_SETTINGS_STORAGE_KEY } from '../src/config/gameSettings';
import { requireValue } from './requireValue';

it('retains the blur choice when changing quality and reopening settings', () => {
  localStorage.clear();
  const root = document.createElement('div');
  const cleanup = mountAppShell(root);
  root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
  root.querySelector<HTMLElement>('[data-action="settings"]')?.click();
  const blur = requireValue(root.querySelector<HTMLSelectElement>('#motion-blur'));
  blur.value = 'off';
  blur.dispatchEvent(new Event('change'));
  const quality = requireValue(root.querySelector<HTMLSelectElement>('#graphics-quality'));
  quality.value = 'high';
  quality.dispatchEvent(new Event('change'));
  const saved = JSON.parse(requireValue(localStorage.getItem(GAME_SETTINGS_STORAGE_KEY))) as {
    graphics: unknown;
  };
  expect(saved.graphics).toEqual({
    quality: 'high',
    motionBlur: false,
  });
  root.querySelector<HTMLElement>('[data-action="menu"]')?.click();
  root.querySelector<HTMLElement>('[data-action="settings"]')?.click();
  expect(root.querySelector<HTMLSelectElement>('#motion-blur')?.value).toBe('off');
  cleanup();
  localStorage.clear();
});
