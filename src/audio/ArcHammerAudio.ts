/** Original procedural Arc Hammer cues; no binary audio asset or persistent voice. */
export class ArcHammerAudio {
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

  public play(kind: 'launch' | 'bounce' | 'hit', volume: number): void {
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
      const profile =
        kind === 'launch'
          ? { type: 'triangle' as OscillatorType, from: 310, to: 780, duration: 0.12 }
          : kind === 'bounce'
            ? { type: 'square' as OscillatorType, from: 760, to: 420, duration: 0.09 }
            : { type: 'sawtooth' as OscillatorType, from: 240, to: 110, duration: 0.13 };
      oscillator.type = profile.type;
      oscillator.frequency.setValueAtTime(profile.from, now);
      oscillator.frequency.exponentialRampToValueAtTime(profile.to, now + profile.duration * 0.75);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.min(1, volume) * 0.05, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        voice.oscillator.disconnect();
        voice.gain.disconnect();
        this.voices.delete(voice);
      };
      this.voices.add(voice);
      oscillator.start(now);
      oscillator.stop(now + profile.duration + 0.01);
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
