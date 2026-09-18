import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAME_SETTINGS,
  GAME_SETTINGS_STORAGE_KEY,
  loadGameSettings,
  normalizeGameSettings,
  saveGameSettings,
  type SettingsStorage,
} from '../src/config/gameSettings';
import { GRAPHICS_QUALITY_PROFILES } from '../src/config/graphicsQuality';

class MemoryStorage implements SettingsStorage {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('Slice 6 settings', () => {
  it('uses Medium graphics and full-volume buses when no saved settings exist', () => {
    const settings = loadGameSettings(new MemoryStorage());

    expect(settings).toEqual(DEFAULT_GAME_SETTINGS);
    expect(GRAPHICS_QUALITY_PROFILES.medium).toEqual({
      pixelRatioCap: 1.5,
      shadows: true,
      shadowMapSize: 2048,
    });
  });

  it('sanitizes persisted volume and graphics values', () => {
    const settings = normalizeGameSettings({
      version: 1,
      audio: {
        master: 1.4,
        music: -0.2,
        sfx: 0.55,
        engine: Number.NaN,
      },
      graphics: {
        quality: 'high',
      },
    });

    expect(settings.audio).toEqual({
      master: 1,
      music: 0,
      sfx: 0.55,
      engine: 1,
    });
    expect(settings.graphics.quality).toBe('high');
  });

  it('round-trips saved settings through the versioned storage key', () => {
    const storage = new MemoryStorage();
    const saved = saveGameSettings(
      {
        version: 1,
        audio: {
          master: 0.75,
          music: 0.5,
          sfx: 0.9,
          engine: 0.65,
        },
        graphics: {
          quality: 'low',
        },
      },
      storage,
    );

    expect(storage.getItem(GAME_SETTINGS_STORAGE_KEY)).not.toBeNull();
    expect(loadGameSettings(storage)).toEqual(saved);
  });

  it('falls back safely for corrupt or unsupported settings payloads', () => {
    const corrupt = new MemoryStorage();
    corrupt.setItem(GAME_SETTINGS_STORAGE_KEY, '{not json');
    expect(loadGameSettings(corrupt)).toEqual(DEFAULT_GAME_SETTINGS);

    const unsupported = new MemoryStorage();
    unsupported.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadGameSettings(unsupported)).toEqual(DEFAULT_GAME_SETTINGS);
  });

  it('defines distinct low, medium, and high render-cost profiles', () => {
    expect(GRAPHICS_QUALITY_PROFILES.low.pixelRatioCap).toBeLessThan(
      GRAPHICS_QUALITY_PROFILES.medium.pixelRatioCap,
    );
    expect(GRAPHICS_QUALITY_PROFILES.medium.pixelRatioCap).toBeLessThan(
      GRAPHICS_QUALITY_PROFILES.high.pixelRatioCap,
    );
    expect(GRAPHICS_QUALITY_PROFILES.low.shadows).toBe(false);
    expect(GRAPHICS_QUALITY_PROFILES.medium.shadows).toBe(true);
    expect(GRAPHICS_QUALITY_PROFILES.high.shadows).toBe(true);
  });
});
