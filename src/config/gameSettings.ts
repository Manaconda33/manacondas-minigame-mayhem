import { isGraphicsQuality, type GraphicsQuality } from './graphicsQuality';

export const GAME_SETTINGS_STORAGE_KEY = 'mmm.settings.v1';
export const GAME_SETTINGS_VERSION = 1;

export interface AudioSettings {
  readonly master: number;
  readonly music: number;
  readonly sfx: number;
  readonly engine: number;
}

export interface GraphicsSettings {
  readonly quality: GraphicsQuality;
}

export interface GameSettings {
  readonly version: typeof GAME_SETTINGS_VERSION;
  readonly audio: AudioSettings;
  readonly graphics: GraphicsSettings;
}

export interface SettingsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  version: GAME_SETTINGS_VERSION,
  audio: {
    master: 1,
    music: 1,
    sfx: 1,
    engine: 1,
  },
  graphics: {
    quality: 'medium',
  },
};

function clampUnit(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

function record(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function defaults(): GameSettings {
  return {
    version: GAME_SETTINGS_VERSION,
    audio: { ...DEFAULT_GAME_SETTINGS.audio },
    graphics: { ...DEFAULT_GAME_SETTINGS.graphics },
  };
}

function browserStorage(): SettingsStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function normalizeGameSettings(value: unknown): GameSettings {
  const source = record(value);
  if (source === null || source.version !== GAME_SETTINGS_VERSION) return defaults();

  const audio = record(source.audio);
  const graphics = record(source.graphics);
  const quality = graphics?.quality;

  return {
    version: GAME_SETTINGS_VERSION,
    audio: {
      master: clampUnit(audio?.master, DEFAULT_GAME_SETTINGS.audio.master),
      music: clampUnit(audio?.music, DEFAULT_GAME_SETTINGS.audio.music),
      sfx: clampUnit(audio?.sfx, DEFAULT_GAME_SETTINGS.audio.sfx),
      engine: clampUnit(audio?.engine, DEFAULT_GAME_SETTINGS.audio.engine),
    },
    graphics: {
      quality: isGraphicsQuality(quality) ? quality : DEFAULT_GAME_SETTINGS.graphics.quality,
    },
  };
}

export function loadGameSettings(storage: SettingsStorage | null = browserStorage()): GameSettings {
  if (storage === null) return defaults();

  try {
    const stored = storage.getItem(GAME_SETTINGS_STORAGE_KEY);
    return stored === null ? defaults() : normalizeGameSettings(JSON.parse(stored) as unknown);
  } catch {
    return defaults();
  }
}

export function saveGameSettings(
  settings: GameSettings,
  storage: SettingsStorage | null = browserStorage(),
): GameSettings {
  const normalized = normalizeGameSettings(settings);
  if (storage !== null) {
    try {
      storage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      /* Settings remain usable for this session when storage is unavailable. */
    }
  }
  return normalized;
}
