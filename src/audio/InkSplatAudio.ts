import { Howler } from 'howler';

/** A short original, procedural impact cue for Ink Splat. */
export class InkSplatAudio {
  private readonly voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();
  private disposed = false;

  public constructor(
    private readonly getContext: () => AudioContext | null = () =>
      (Howler as unknown as { ctx?: AudioContext | null }).ctx ?? null,
  ) {}

  public async unlock(): Promise<void> {
    try {
      const context = this.context();
      if (context?.state === 'suspended') await context.resume().catch(() => undefined);
    } catch {
      /* Gameplay remains usable when browser audio is unavailable. */
    }
  }

  public play(volume: number): void {
    let context: AudioContext | null;
    try {
      context = this.context();
    } catch {
      return;
    }
    if (
      this.disposed ||
      context?.state !== 'running' ||
      !Number.isFinite(volume) ||
      volume <= 0 ||
      this.voices.size >= 4
    )
      return;
    let oscillator: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    try {
      oscillator = context.createOscillator();
      gain = context.createGain();
      const voice = { oscillator, gain };
      const now = context.currentTime;
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(190, now);
      oscillator.frequency.exponentialRampToValueAtTime(72, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.min(1, volume) * 0.055, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        oscillator?.disconnect();
        gain?.disconnect();
        this.voices.delete(voice);
      };
      this.voices.add(voice);
      oscillator.start(now);
      oscillator.stop(now + 0.19);
    } catch {
      oscillator?.disconnect();
      gain?.disconnect();
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
  }

  private context(): AudioContext | null {
    return this.getContext();
  }
}
