import { audioMixer, type AudioMixer } from './AudioMixer';
import { musicCatalog, type MusicCue, type RaceMusicState } from './musicCatalog';
import { WebAudioMusicOutput, type MusicOutput, type MusicVoice } from './WebAudioMusicOutput';

interface Playing {
  cue: MusicCue;
  voice: MusicVoice;
  at: number;
}
const BASE_GAIN = 0.5;

/** App-lifetime music; route/race state changes never affect simulation or SFX. */
export class MusicDirector {
  private wanted: MusicCue | null = null;
  private current: Playing | null = null;
  private outgoing: Playing | null = null;
  private fadeEnd = 0;
  private saved: { cue: MusicCue; offset: number } | null = null;
  private generation = 0;
  private unlocked = false;
  private hidden = false;
  private paused = false;
  private preparingRace = false;
  private duck = false;
  private disposed = false;
  private loading: MusicCue | null = null;

  public constructor(
    private readonly output: MusicOutput = new WebAudioMusicOutput(),
    private readonly mixer: AudioMixer = audioMixer,
  ) {}

  public async unlock(): Promise<void> {
    if (this.disposed) return;
    this.unlocked = await this.output.unlock();
    // Disposal can occur while unlock is awaiting the browser.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.disposed) return;
    this.reconcile();
  }

  public route(cue: MusicCue | null): void {
    this.preparingRace = false;
    this.paused = false;
    this.duck = false;
    this.select(cue);
  }

  public race(state: RaceMusicState): void {
    this.preparingRace = state.phase === 'countdown';
    this.paused = state.paused;
    this.duck = state.prismatic && state.phase === 'racing';
    if (this.paused && this.current && this.outgoing && this.output.time() < this.current.at) {
      this.current.voice.stop();
      this.current = this.outgoing;
      this.outgoing = null;
      this.generation++;
      this.loading = null;
    }
    this.select(
      state.phase === 'finished'
        ? 'results'
        : state.phase === 'countdown'
          ? null
          : state.lap >= 3
            ? 'final-lap'
            : 'race',
    );
    this.tick();
  }

  private select(cue: MusicCue | null): void {
    if (this.disposed) return;
    if (this.wanted !== cue) {
      this.wanted = cue;
      this.generation++;
      this.loading = null;
      // Cancel future audio immediately, even while the context or replacement decode is unavailable.
      if (this.current && this.output.time() < this.current.at) {
        this.current.voice.stop();
        this.current = this.outgoing;
        this.outgoing = null;
      }
      if (!this.output.ready()) {
        this.clear();
        this.saved = null;
      }
    }
    this.reconcile();
  }

  private reconcile(): void {
    if (this.disposed) return;
    if (this.wanted === null) {
      this.saved = null;
      this.clear();
      this.output.retain(this.preparingRace ? ['race', 'final-lap'] : []);
      if (this.preparingRace && !this.hidden && this.unlocked && this.output.ready()) {
        void this.output.load('race');
        void this.output.load('final-lap');
      }
      return;
    }
    if (this.hidden || !this.unlocked || !this.output.ready()) return;
    if (this.saved) {
      const saved = this.saved;
      this.saved = null;
      if (saved.cue === this.wanted || (saved.cue === 'race' && this.wanted === 'final-lap'))
        this.start(saved.cue, saved.offset);
    }
    if (this.current?.cue === this.wanted || this.loading === this.wanted) return;
    if (this.paused && this.wanted === 'final-lap') return;
    const cue = this.wanted;
    const generation = this.generation;
    const retained: MusicCue[] = [cue];
    if (this.current) retained.push(this.current.cue);
    if (cue === 'race') retained.push('final-lap');
    if (cue === 'select') retained.push('race');
    this.output.retain(retained);
    this.loading = cue;
    void this.output.load(cue).then((loaded) => {
      if (generation !== this.generation || this.disposed || this.hidden) return;
      this.loading = null;
      if (!this.output.ready()) return;
      if (!loaded || this.wanted !== cue || (this.paused && cue === 'final-lap')) return;
      this.start(cue);
      if (cue === 'race' || cue === 'select') {
        void this.output.load(cue === 'select' ? 'race' : 'final-lap');
      }
    });
  }

  private start(cue: MusicCue, offset = 0): void {
    const now = this.output.time();
    let at = now;
    let fade = cue === 'results' ? 0.8 : 0.7;
    // Future sources use audio-clock scheduling, not setTimeout beat timing.
    if (cue === 'final-lap' && this.current?.cue === 'race') {
      const bar = (4 * 60) / musicCatalog.race.bpm;
      const position = this.current.voice.position();
      at = now + (bar - (position % bar));
      fade = 2 * bar;
    }
    const voice = this.output.play(cue, at, offset);
    if (!voice) return;
    // If a rapid route change supersedes a fade, never leave a third source.
    if (this.outgoing) this.outgoing.voice.stop();
    if (this.current && this.output.time() < this.current.at) {
      this.current.voice.stop();
      this.current = null;
    }
    this.outgoing = this.current;
    this.current = { cue, voice, at };
    this.fadeEnd = at + (this.outgoing ? fade : 0);
    this.tick();
  }

  public tick(): void {
    if (this.disposed || this.hidden) return;
    const gain =
      this.mixer.volume('music') * BASE_GAIN * (this.paused ? 0.25 : 1) * (this.duck ? 0.25 : 1);
    const now = this.output.time();
    const current = this.current;
    if (!current) return;
    const progress = this.outgoing
      ? Math.max(0, Math.min(1, (now - current.at) / (this.fadeEnd - current.at)))
      : now < current.at
        ? 0
        : 1;
    current.voice.gain(gain * Math.sin((progress * Math.PI) / 2));
    this.outgoing?.voice.gain(gain * Math.cos((progress * Math.PI) / 2));
    if (this.outgoing && now >= this.fadeEnd) {
      this.outgoing.voice.stop();
      this.outgoing = null;
      this.output.retain(
        current.cue === 'race'
          ? ['race', 'final-lap']
          : current.cue === 'select'
            ? ['select', 'race']
            : [current.cue],
      );
    }
  }

  public visibility(hidden: boolean): void {
    if (this.disposed || this.hidden === hidden) return;
    this.hidden = hidden;
    this.generation++;
    this.loading = null;
    if (hidden) {
      const playing =
        this.current && this.output.time() >= this.current.at ? this.current : this.outgoing;
      this.saved = playing ? { cue: playing.cue, offset: playing.voice.position() } : null;
      this.clear();
    } else {
      this.reconcile();
    }
  }

  private clear(): void {
    this.current?.voice.stop();
    this.outgoing?.voice.stop();
    this.current = null;
    this.outgoing = null;
  }
  public dispose(): void {
    this.disposed = true;
    this.generation++;
    this.clear();
    this.output.dispose();
  }
}
