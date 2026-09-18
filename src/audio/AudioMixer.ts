import { Howler } from 'howler';
import type { AudioSettings } from '../config/gameSettings';

export type AudioBus = 'music' | 'sfx' | 'engine';

function clampUnit(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export class AudioMixer {
  private settings: AudioSettings = {
    master: 1,
    music: 1,
    sfx: 1,
    engine: 1,
  };

  public constructor(
    private readonly setGlobalVolume: (volume: number) => void = (volume) => {
      Howler.volume(volume);
    },
  ) {}

  public configure(settings: AudioSettings): void {
    this.settings = {
      master: clampUnit(settings.master),
      music: clampUnit(settings.music),
      sfx: clampUnit(settings.sfx),
      engine: clampUnit(settings.engine),
    };
    this.setGlobalVolume(this.settings.master);
  }

  public volume(bus: AudioBus): number {
    return clampUnit(this.settings.master * this.settings[bus]);
  }

  public snapshot(): AudioSettings {
    return { ...this.settings };
  }
}

export const audioMixer = new AudioMixer();
