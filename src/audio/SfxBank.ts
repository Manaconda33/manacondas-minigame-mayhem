import { Howl, Howler } from 'howler';
import { audioMixer, type AudioMixer } from './AudioMixer';
import manifest from '../../assets/audio/sfx-review-v1/manifest.json';

export interface SfxOutput {
  play(): number;
  stop(id?: number): void;
  volume(value: number, id?: number): void;
  rate(value: number, id?: number): void;
  pos(x: number, y: number, z: number, id?: number): void;
  loop(value: boolean, id?: number): void;
  once(event: string, callback: () => void, id?: number): void;
  unload(): void;
  state?(): string;
  ready?(): boolean;
  off?(event: string, callback?: () => void, id?: number): unknown;
  pannerAttr?(
    options: { refDistance: number; maxDistance: number; rolloffFactor: number },
    id?: number,
  ): unknown;
}
export interface SfxOptions {
  gain?: number;
  bus?: 'sfx' | 'engine';
  rate?: number;
  position?: { x: number; y: number; z: number };
  priority?: number;
}
interface Voice {
  cue: string;
  source: SfxOutput;
  id: number;
  options: SfxOptions;
  looped: boolean;
  cleanup?: () => void;
}
const catalog = new Map(manifest.cues.map((c) => [c.id, c]));
const clamp = (value: number, min = 0, max = 1): number =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

interface PlaybackController {
  usingWebAudio: boolean;
  ctx: { state: string };
  state: string;
  _autoResume(): void;
}
/** Howler 2.2.4 must agree with its context before play can avoid the resume queue. */
export function playbackReady(controller: PlaybackController, locked: boolean): boolean {
  if (!controller.usingWebAudio) return false;
  if (controller.state !== 'running' || controller.ctx.state !== 'running') {
    controller._autoResume();
    return false;
  }
  return !locked;
}

/** Master is applied by Howler globally; this bank applies the selected bus once. */
export class SfxBank {
  private readonly sources = new Map<string, SfxOutput>();
  private readonly voices = new Map<string, Voice>();
  private serial = 0;
  private paused = false;
  private disposed = false;

  public constructor(
    private readonly mixer: AudioMixer = audioMixer,
    private readonly factory: (url: string) => SfxOutput = (url) => {
      const sound = new Howl({ src: [url], preload: true, volume: 0, pool: 4 });
      // Howler defers play while resuming. Never submit stale cues to that queue.
      return Object.assign(sound, {
        ready: () =>
          playbackReady(
            Howler as unknown as PlaybackController,
            Boolean((sound as Howl & { _playLock?: boolean })._playLock),
          ),
      });
    },
    private readonly maxVoices = 24,
  ) {}

  public preload(cues: readonly string[]): void {
    for (const cue of cues) this.source(cue);
  }

  private source(cue: string): SfxOutput | undefined {
    if (this.disposed) return;
    const definition = catalog.get(cue);
    if (!definition) return;
    let source = this.sources.get(cue);
    if (!source) {
      try {
        source = this.factory(
          `${import.meta.env.BASE_URL}assets/audio/sfx-v1/${definition.file.replace(/^wav\//, '')}?v=${definition.sha256.slice(0, 12)}`,
        );
        this.sources.set(cue, source);
      } catch {
        return;
      } // Audio availability never blocks a race.
    }
    return source;
  }

  public play(cue: string, options: SfxOptions = {}): void {
    this.start(cue, `shot-${String(++this.serial)}`, false, options);
  }

  public loop(cue: string, key: string, options: SfxOptions = {}): void {
    const current = this.voices.get(key);
    if (current && current.cue !== cue) {
      this.stop(key);
      this.start(cue, key, true, options);
      return;
    }
    if (current) {
      current.options = options;
      this.mix(current);
      return;
    }
    this.start(cue, key, true, options);
  }

  private start(cue: string, key: string, looped: boolean, options: SfxOptions): void {
    if (this.disposed || this.paused || (typeof document !== 'undefined' && document.hidden))
      return;
    const source = this.source(cue);
    // Do not queue stale impacts/countdown/UI cues behind an asynchronous decode.
    if (
      !source ||
      (source.state && source.state() !== 'loaded') ||
      (source.ready && !source.ready())
    )
      return;
    if (this.voices.size >= this.maxVoices) {
      const victim = [...this.voices].find(
        ([, v]) => !v.looped && (v.options.priority ?? 0) <= (options.priority ?? 0),
      );
      if (!victim) return;
      this.stop(victim[0]);
    }
    try {
      const id = source.play();
      const voice: Voice = { cue, source, id, options, looped };
      source.loop(looped, id);
      this.voices.set(key, voice);
      this.mix(voice);
      const ended = (): void => {
        voice.cleanup?.();
        this.voices.delete(key);
      };
      const failed = (): void => {
        this.stop(key);
      };
      voice.cleanup = () => {
        source.off?.('end', ended, id);
        source.off?.('playerror', failed, id);
      };
      if (!looped) source.once('end', ended, id);
      source.once('playerror', failed, id);
    } catch {
      this.stop(key);
    }
  }

  private mix(voice: Voice): void {
    const gain = clamp(voice.options.gain ?? 1) * this.mixer.snapshot()[voice.options.bus ?? 'sfx'];
    voice.source.volume(gain, voice.id);
    voice.source.rate(clamp(voice.options.rate ?? 1, 0.5, 2), voice.id);
    const p = voice.options.position;
    if (p) {
      voice.source.pos(p.x, p.y, p.z, voice.id);
      voice.source.pannerAttr?.({ refDistance: 6, maxDistance: 70, rolloffFactor: 1 }, voice.id);
    }
  }

  public stop(key: string): void {
    const voice = this.voices.get(key);
    if (!voice) return;
    voice.cleanup?.();
    voice.source.stop(voice.id);
    this.voices.delete(key);
  }

  public stopCue(cue: string): void {
    for (const [key, voice] of this.voices) if (voice.cue === cue) this.stop(key);
  }

  public retainLoops(keys: ReadonlySet<string>): void {
    for (const [key, voice] of this.voices) if (voice.looped && !keys.has(key)) this.stop(key);
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) for (const key of [...this.voices.keys()]) this.stop(key);
  }

  public refreshMix(): void {
    for (const voice of this.voices.values()) this.mix(voice);
  }

  public voiceCount(): number {
    return this.voices.size;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.setPaused(true);
    this.disposed = true;
    for (const source of this.sources.values()) source.unload();
    this.sources.clear();
  }
}
