import { expect, it } from 'vitest';
import {
  loadGameSettings,
  normalizeGameSettings,
  saveGameSettings,
} from '../src/config/gameSettings';

it('keeps old volume and quality choices while supplying a blur default', () => {
  const settings = normalizeGameSettings({
    version: 1,
    audio: { music: 0.4 },
    graphics: { quality: 'high' },
  });
  expect(settings.graphics).toMatchObject({ quality: 'high', motionBlur: true });
  expect(settings.audio.music).toBe(0.4);
  expect(
    normalizeGameSettings({ version: 1, graphics: { motionBlur: 'false' } }).graphics.motionBlur,
  ).toBe(true);
});

it('persists an explicit blur opt-out independently of quality', () => {
  let value: string | null = null;
  const storage = {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
  const settings = normalizeGameSettings({
    version: 1,
    graphics: { quality: 'medium', motionBlur: false },
  });
  saveGameSettings(settings, storage);
  expect(loadGameSettings(storage).graphics).toMatchObject({
    quality: 'medium',
    motionBlur: false,
  });
});
