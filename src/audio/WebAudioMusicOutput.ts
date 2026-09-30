import { musicCatalog, musicUrl, type MusicCue } from './musicCatalog';

export interface MusicVoice {
  position(): number;
  gain(value: number): void;
  stop(): void;
}
export interface MusicOutput {
  time(): number;
  ready(): boolean;
  unlock(): Promise<boolean>;
  load(cue: MusicCue): Promise<boolean>;
  retain(cues: readonly MusicCue[]): void;
  play(cue: MusicCue, at: number, offset: number): MusicVoice | null;
  dispose(): void;
}

/** A gesture-created context avoids Howler auto-suspending native music sources. */
export class WebAudioMusicOutput implements MusicOutput {
  private readonly buffers = new Map<MusicCue, AudioBuffer>();
  private readonly pending = new Map<MusicCue, Promise<boolean>>();
  private readonly requests = new Map<MusicCue, AbortController>();
  private retained = new Set<MusicCue>();
  private readonly voices = new Set<MusicVoice>();
  private disposed = false;

  private ownedContext: AudioContext | null = null;

  public constructor(
    private readonly context: () => AudioContext | null = () => this.ownedContext,
    private readonly fetchAudio: typeof fetch = (...args) => fetch(...args),
  ) {}

  public time(): number {
    return this.context()?.currentTime ?? 0;
  }
  public ready(): boolean {
    return !this.disposed && this.context()?.state === 'running';
  }
  public async unlock(): Promise<boolean> {
    if (this.disposed) return false;
    try {
      let context = this.context();
      if (!context && typeof AudioContext !== 'undefined') {
        this.ownedContext = new AudioContext();
        context = this.ownedContext;
      }
      if (!context) return false;
      if (context.state === 'suspended') await context.resume();
      return this.ready();
    } catch {
      return false;
    }
  }

  public retain(cues: readonly MusicCue[]): void {
    this.retained = new Set(cues);
    for (const cue of this.buffers.keys()) if (!this.retained.has(cue)) this.buffers.delete(cue);
    for (const [cue, request] of this.requests) if (!this.retained.has(cue)) request.abort();
  }

  public async load(cue: MusicCue): Promise<boolean> {
    if (this.disposed) return false;
    if (this.buffers.has(cue)) return true;
    const pending = this.pending.get(cue);
    if (pending && !this.requests.get(cue)?.signal.aborted) return pending;
    const context = this.context();
    if (!context) return false;
    const request = new AbortController();
    this.requests.set(cue, request);
    const load = (async (): Promise<boolean> => {
      try {
        const response = await this.fetchAudio(musicUrl(cue), { signal: request.signal });
        if (!response.ok) return false;
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (this.disposed || request.signal.aborted || !this.retained.has(cue)) return false;
        // Invalid duration must not silently move the authored loop boundary.
        if (Math.abs(buffer.duration - musicCatalog[cue].duration) > 1 / 48000 + 0.000001)
          return false;
        this.buffers.set(cue, buffer);
        return true;
      } catch {
        return false;
      } finally {
        // A superseded aborted decode must not remove its replacement request.
        if (this.requests.get(cue) === request) {
          this.requests.delete(cue);
          this.pending.delete(cue);
        }
      }
    })();
    this.pending.set(cue, load);
    return load;
  }

  public play(cue: MusicCue, at: number, offset: number): MusicVoice | null {
    const context = this.context();
    const buffer = this.buffers.get(cue);
    if (!this.ready() || !context || !buffer) return null;
    const source = context.createBufferSource();
    const gain = context.createGain();
    const duration = buffer.duration;
    const position = ((offset % duration) + duration) % duration;
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = duration;
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(context.destination);
    let stopped = false;
    const voice: MusicVoice = {
      position: () => (position + Math.max(0, context.currentTime - at)) % duration,
      gain: (value) => {
        if (!stopped) gain.gain.setTargetAtTime(Math.max(0, value), context.currentTime, 0.025);
      },
      stop: () => {
        if (stopped) return;
        stopped = true;
        source.stop();
        source.disconnect();
        gain.disconnect();
        this.voices.delete(voice);
      },
    };
    source.start(at, position);
    this.voices.add(voice);
    return voice;
  }

  public dispose(): void {
    this.disposed = true;
    for (const request of this.requests.values()) request.abort();
    for (const voice of [...this.voices]) voice.stop();
    this.buffers.clear();
    this.pending.clear();
    this.requests.clear();
    if (this.ownedContext) void this.ownedContext.close().catch(() => undefined);
  }
}
