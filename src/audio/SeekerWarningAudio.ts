import type { SeekerWarningLevel } from '../game/items/SeekerWarnings';

export interface WarningToneProfile {
  readonly wave: OscillatorType;
  readonly baseFrequency: number;
  readonly levelStep: number;
  readonly sweep: number;
}
const SEEKER_TONE: WarningToneProfile = {
  wave: 'triangle',
  baseFrequency: 480,
  levelStep: 180,
  sweep: 120,
};
export const APEX_WARNING_TONE: WarningToneProfile = {
  wave: 'sawtooth',
  baseFrequency: 240,
  levelStep: 110,
  sweep: -100,
};

/** Short synthesized warning pulses, owned by the race and explicitly cancellable. */
export class SeekerWarningAudio {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private remaining = 0;
  private level: SeekerWarningLevel | null = null;

  public constructor(
    private readonly createContext: () => AudioContext = () => new AudioContext(),
    private readonly tone: WarningToneProfile = SEEKER_TONE,
  ) {}

  public async unlock(): Promise<void> {
    try {
      this.context ??= this.createContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch {
      /* Visual warning remains available when browser audio is unavailable. */
    }
  }

  public update(
    level: SeekerWarningLevel | null,
    dt: number,
    volume: number,
    paused: boolean,
  ): void {
    if (paused || level === null || volume <= 0) {
      this.stop();
      if (!paused) {
        this.remaining = 0;
        this.level = null;
      }
      return;
    }
    this.remaining -= Math.max(0, dt);
    if (this.gain !== null && this.context !== null)
      this.gain.gain.setValueAtTime(Math.min(1, volume) * 0.06, this.context.currentTime);
    if (this.level !== level) this.remaining = 0;
    this.level = level;
    if (this.remaining > 0 || this.context?.state !== 'running') return;
    this.stop();
    this.remaining = level === 3 ? 0.2 : level === 2 ? 0.45 : 0.9;
    const context = this.context;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = this.tone.wave;
      oscillator.frequency.setValueAtTime(
        this.tone.baseFrequency + level * this.tone.levelStep,
        context.currentTime,
      );
      oscillator.frequency.linearRampToValueAtTime(
        this.tone.baseFrequency + level * this.tone.levelStep + this.tone.sweep,
        context.currentTime + 0.08,
      );
      gain.gain.setValueAtTime(Math.min(1, volume) * 0.06, context.currentTime);
      oscillator.connect(gain).connect(context.destination);
      this.oscillator = oscillator;
      this.gain = gain;
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        if (this.oscillator === oscillator) {
          this.oscillator = null;
          this.gain = null;
        }
      };
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    } catch {
      this.stop();
    }
  }

  private stop(): void {
    if (this.oscillator !== null) {
      this.oscillator.onended = null;
      try {
        this.oscillator.stop();
      } catch {
        /* Already stopped. */
      }
      this.oscillator.disconnect();
      this.gain?.disconnect();
    }
    this.oscillator = null;
    this.gain = null;
  }

  public dispose(): void {
    this.stop();
    if (this.context !== null) void this.context.close().catch(() => undefined);
    this.context = null;
  }
}
