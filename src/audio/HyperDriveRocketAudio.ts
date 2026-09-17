import { Howler } from 'howler';

export type HyperDriveRocketCue = 'activate' | 'return';

interface Voice {
  oscillator: OscillatorNode;
  gain: GainNode;
}

/** Original gesture-gated cues and bounded engine tone for Rocket. */
export class HyperDriveRocketAudio {
  private readonly cues = new Set<Voice>();
  private engine: Voice | null = null;
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

  public play(kind: HyperDriveRocketCue, volume: number): void {
    if (this.disposed || !Number.isFinite(volume) || volume <= 0) return;
    const context = this.context();
    if (context?.state !== 'running' || this.cues.size >= 3) return;
    const duration = kind === 'activate' ? 0.24 : 0.18;
    const startFrequency = kind === 'activate' ? 180 : 520;
    const endFrequency = kind === 'activate' ? 680 : 230;
    let voice: Voice | null = null;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const scheduledVoice: Voice = { oscillator, gain };
      voice = scheduledVoice;
      const now = context.currentTime;
      oscillator.type = kind === 'activate' ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(startFrequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration * 0.8);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.min(1, volume) * 0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        this.cues.delete(scheduledVoice);
      };
      this.cues.add(scheduledVoice);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.01);
    } catch {
      if (voice !== null) this.cues.delete(voice);
      voice?.oscillator.disconnect();
      voice?.gain.disconnect();
    }
  }

  public update(active: boolean, autopilotWeight: number, volume: number, paused: boolean): void {
    if (this.disposed || !active || paused || !Number.isFinite(volume) || volume <= 0) {
      this.stop();
      return;
    }
    const context = this.context();
    if (context?.state !== 'running') return;
    if (this.engine === null) this.startEngine(context, volume);
    const engine = this.engine;
    if (engine === null) return;
    const now = context.currentTime;
    const intensity = Math.min(1, volume) * (0.012 + Math.max(0, autopilotWeight) * 0.012);
    engine.gain.gain.setValueAtTime(intensity, now);
  }

  public stop(): void {
    this.stopEngine();
    for (const voice of this.cues) this.stopVoice(voice);
    this.cues.clear();
  }

  public dispose(): void {
    this.disposed = true;
    this.stop();
  }

  private context(): AudioContext | null {
    try {
      return this.getContext();
    } catch {
      return null;
    }
  }

  private startEngine(context: AudioContext, volume: number): void {
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(94, now);
      gain.gain.setValueAtTime(Math.min(1, volume) * 0.012, now);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      this.engine = { oscillator, gain };
    } catch {
      this.engine = null;
    }
  }

  private stopEngine(): void {
    if (this.engine === null) return;
    this.stopVoice(this.engine);
    this.engine = null;
  }

  private stopVoice(voice: Voice): void {
    voice.oscillator.onended = null;
    try {
      voice.oscillator.stop();
    } catch {
      /* Already ended. */
    }
    voice.oscillator.disconnect();
    voice.gain.disconnect();
  }
}
