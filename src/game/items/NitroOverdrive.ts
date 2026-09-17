import { RacerEffects } from './RacerEffects';

/** Amendment 2.20 / ADR-081: bounded, player-triggered continuous boost window. */
export const NITRO_OVERDRIVE_CONFIG = {
  id: 'nitro-overdrive-pulse',
  label: 'Continuous Nitro Overdrive',
  windowSeconds: 6,
  pulseCadenceSeconds: 0.75,
  pulseDurationSeconds: 0.9,
  speedCapMultiplier: 1.15,
  accelerationMultiplier: 1,
  ignoreOffRoadSpeedPenalty: false,
} as const;

export interface NitroOverdriveSnapshot {
  readonly active: boolean;
  readonly windowRemainingSeconds: number;
  readonly pulseRemainingSeconds: number;
  readonly nextPulseRemainingSeconds: number;
}

interface NitroOverdriveState {
  windowRemainingSeconds: number;
  pulseRemainingSeconds: number;
  nextPulseRemainingSeconds: number;
}

const EPSILON = 1e-9;

/** Owns the six-second window and pulse cadence; RacerEffects owns drive authority. */
export class NitroOverdriveSystem {
  private readonly states = new Map<string, NitroOverdriveState>();
  private disposed = false;

  public constructor(private readonly effects: RacerEffects) {}

  public activate(racerId: string, commit: () => boolean): boolean {
    if (this.disposed || racerId !== 'player' || this.states.has(racerId)) return false;

    const pulseDuration = Math.min(
      NITRO_OVERDRIVE_CONFIG.pulseDurationSeconds,
      NITRO_OVERDRIVE_CONFIG.windowSeconds,
    );
    if (!this.activatePulse(racerId, pulseDuration, commit)) return false;

    this.states.set(racerId, {
      windowRemainingSeconds: NITRO_OVERDRIVE_CONFIG.windowSeconds,
      pulseRemainingSeconds: pulseDuration,
      nextPulseRemainingSeconds: NITRO_OVERDRIVE_CONFIG.pulseCadenceSeconds,
    });
    return true;
  }

  public pulse(racerId: string): boolean {
    if (this.disposed || racerId !== 'player') return false;
    const state = this.states.get(racerId);
    if (state === undefined || state.nextPulseRemainingSeconds > EPSILON) return false;

    const pulseDuration = Math.min(
      NITRO_OVERDRIVE_CONFIG.pulseDurationSeconds,
      state.windowRemainingSeconds,
    );
    if (!this.activatePulse(racerId, pulseDuration, () => true)) return false;

    state.pulseRemainingSeconds = pulseDuration;
    state.nextPulseRemainingSeconds = NITRO_OVERDRIVE_CONFIG.pulseCadenceSeconds;
    return true;
  }

  public advance(dt: number, paused = false): void {
    if (this.disposed || paused || !Number.isFinite(dt) || dt <= 0) return;

    for (const [racerId, state] of this.states) {
      state.windowRemainingSeconds = Math.max(0, state.windowRemainingSeconds - dt);
      state.nextPulseRemainingSeconds = Math.max(0, state.nextPulseRemainingSeconds - dt);
      state.pulseRemainingSeconds = Math.min(
        state.windowRemainingSeconds,
        Math.max(0, state.pulseRemainingSeconds - dt),
      );
      if (state.windowRemainingSeconds <= EPSILON) this.clear(racerId);
    }
  }

  public isActive(racerId: string): boolean {
    return this.states.has(racerId);
  }

  public snapshot(racerId: string): NitroOverdriveSnapshot {
    const state = this.states.get(racerId);
    if (state === undefined) {
      return {
        active: false,
        windowRemainingSeconds: 0,
        pulseRemainingSeconds: 0,
        nextPulseRemainingSeconds: 0,
      };
    }
    return { active: true, ...state };
  }

  public clear(racerId: string): void {
    this.states.delete(racerId);
    this.effects.clearTemporaryBoost(racerId, NITRO_OVERDRIVE_CONFIG.id);
  }

  public clearAll(): void {
    for (const racerId of this.states.keys()) this.clear(racerId);
  }

  public dispose(): void {
    this.clearAll();
    this.disposed = true;
  }

  private activatePulse(racerId: string, durationSeconds: number, commit: () => boolean): boolean {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= EPSILON) return false;
    return this.effects.activateTemporaryBoost(
      racerId,
      {
        id: NITRO_OVERDRIVE_CONFIG.id,
        label: NITRO_OVERDRIVE_CONFIG.label,
        durationSeconds,
        speedCapMultiplier: NITRO_OVERDRIVE_CONFIG.speedCapMultiplier,
        accelerationMultiplier: NITRO_OVERDRIVE_CONFIG.accelerationMultiplier,
        ignoreOffRoadSpeedPenalty: NITRO_OVERDRIVE_CONFIG.ignoreOffRoadSpeedPenalty,
      },
      commit,
    );
  }
}
