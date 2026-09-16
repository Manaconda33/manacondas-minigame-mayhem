/** Original brief tones, unlocked by the runtime's keyboard/touch gestures. */
export class ArcBladeAudio {
  private readonly voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();
  private context: AudioContext | null = null;
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
      this.stop();
    }
  }

  public play(kind: 'launch' | 'return' | 'catch', volume: number): void {
    const context = this.context;
    if (
      context?.state !== 'running' ||
      !Number.isFinite(volume) ||
      volume <= 0 ||
      this.voices.size >= 8
    )
      return;
    let oscillator: OscillatorNode | undefined;
    let gain: GainNode | undefined;
    try {
      oscillator = context.createOscillator();
      gain = context.createGain();
      const voice = { oscillator, gain };
      const now = context.currentTime;
      const [from, to] =
        kind === 'launch' ? [520, 1050] : kind === 'return' ? [1100, 700] : [900, 1600];
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(from, now);
      oscillator.frequency.exponentialRampToValueAtTime(to, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.min(1, volume) * 0.045, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        voice.oscillator.disconnect();
        voice.gain.disconnect();
        this.voices.delete(voice);
      };
      this.voices.add(voice);
      oscillator.start(now);
      oscillator.stop(now + 0.13);
    } catch {
      oscillator?.disconnect();
      gain?.disconnect();
      this.stop();
    }
  }

  public stop(): void {
    for (const { oscillator, gain } of this.voices) {
      oscillator.onended = null;
      try {
        oscillator.stop();
      } catch {
        /* Already ended. */
      }
      oscillator.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
  }

  public dispose(): void {
    this.disposed = true;
    this.stop();
    if (this.context) void this.context.close().catch(() => undefined);
    this.context = null;
  }
}
