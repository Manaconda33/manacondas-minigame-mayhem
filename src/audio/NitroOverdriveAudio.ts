import { Howler } from 'howler';

export type NitroOverdriveCue = 'activate' | 'pulse';

/** Short original procedural cues for the Overdrive window and accepted pulses. */
export class NitroOverdriveAudio {
  private readonly voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();
  private disposed = false;

  public constructor(
    private readonly getContext: () => AudioContext | null = () =>
      (Howler as unknown as { ctx?: AudioContext | null }).ctx ?? null,
  ) {}

  public async unlock(): Promise<void> {
    try {
      const context = this.getContext();
      if (context?.state === 'suspended') await context.resume().catch(() => undefined);
    } catch {
      /* Gameplay remains usable when browser audio is unavailable. */
    }
  }

  public play(kind: NitroOverdriveCue, volume: number): void {
    let context: AudioContext | null;
    try {
      context = this.getContext();
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

    const activation = kind === 'activate';
    const duration = activation ? 0.24 : 0.13;
    const startFrequency = activation ? 220 : 150;
    const endFrequency = activation ? 620 : 310;
    let oscillator: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    let voice: { oscillator: OscillatorNode; gain: GainNode } | null = null;
    try {
      const createdOscillator = context.createOscillator();
      const createdGain = context.createGain();
      oscillator = createdOscillator;
      gain = createdGain;
      const scheduledVoice = { oscillator: createdOscillator, gain: createdGain };
      voice = scheduledVoice;
      const now = context.currentTime;
      createdOscillator.type = activation ? 'triangle' : 'square';
      createdOscillator.frequency.setValueAtTime(startFrequency, now);
      createdOscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration * 0.8);
      createdGain.gain.setValueAtTime(0.0001, now);
      createdGain.gain.exponentialRampToValueAtTime(
        Math.min(1, volume) * (activation ? 0.045 : 0.032),
        now + 0.008,
      );
      createdGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      createdOscillator.connect(createdGain).connect(context.destination);
      createdOscillator.onended = () => {
        createdOscillator.disconnect();
        createdGain.disconnect();
        this.voices.delete(scheduledVoice);
      };
      this.voices.add(scheduledVoice);
      createdOscillator.start(now);
      createdOscillator.stop(now + duration + 0.01);
    } catch {
      if (voice !== null) this.voices.delete(voice);
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
}
