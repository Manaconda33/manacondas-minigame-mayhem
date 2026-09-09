/** Original three-voice arpeggio; no asset, network, or wall-clock scheduling. */
export class PrismaticMusic {
  private context: AudioContext | null = null;
  private voices: OscillatorNode[] = [];
  private gain: GainNode | null = null;
  private time = 0;
  private disposed = false;

  public constructor(
    private readonly createContext: () => AudioContext = () => new AudioContext(),
  ) {}
  public async unlock(): Promise<void> {
    if (this.disposed) return;
    try {
      this.context ??= this.createContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch {
      /* Visual fallback remains available. */
    }
  }

  public update(remaining: number, dt: number, volume: number, paused: boolean): void {
    if (this.disposed) return;
    if (remaining <= 0) {
      this.stop();
      this.time = 0;
      return;
    }
    if (paused) {
      this.stop();
      return;
    }
    if (Number.isFinite(dt) && dt > 0) this.time += dt;
    if (!Number.isFinite(volume) || volume <= 0 || this.context?.state !== 'running') {
      this.stop();
      return;
    }
    try {
      const context = this.context;
      if (!this.gain) {
        this.gain = context.createGain();
        this.gain.connect(context.destination);
        for (let i = 0; i < 3; i++) {
          const voice = context.createOscillator();
          this.voices.push(voice);
          voice.type = 'sine';
          voice.connect(this.gain);
          voice.start();
        }
      }
      const notes = [261.63, 329.63, 392, 493.88];
      const step = Math.floor(this.time / 0.3) % notes.length;
      this.voices.forEach((v, i) =>
        v.frequency.setValueAtTime(notes[(step + i) % notes.length] ?? 261.63, context.currentTime),
      );
      this.gain.gain.setValueAtTime(
        Math.min(1, volume) * Math.min(1, remaining) * 0.018,
        context.currentTime,
      );
    } catch {
      this.stop();
    }
  }

  private stop(): void {
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {
        /* Already stopped. */
      }
      voice.disconnect();
    }
    this.voices = [];
    this.gain?.disconnect();
    this.gain = null;
  }

  public dispose(): void {
    this.disposed = true;
    this.stop();
    if (this.context) void this.context.close().catch(() => undefined);
    this.context = null;
  }
}
