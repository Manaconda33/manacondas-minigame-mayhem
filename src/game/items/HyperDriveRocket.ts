import { RacerEffects } from './RacerEffects';
import { RocketAutopilot } from './RocketAutopilot';
import type { DriveInput } from '../physics/KartController';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import * as THREE from 'three';

/** Amendment 2.21 / ADR-082: bounded legal catch-up autopilot. */
export const HYPER_DRIVE_ROCKET_CONFIG = {
  id: 'hyper-drive-rocket',
  label: 'Hyper-Drive Rocket',
  windowSeconds: 6,
  controlReturnSeconds: 0.3,
  speedCapMultiplier: 1.25,
  accelerationMultiplier: 1,
  ignoreOffRoadSpeedPenalty: false,
} as const;

export type HyperDriveRocketPhase = 'inactive' | 'autopilot' | 'returning';

export interface HyperDriveRocketSnapshot {
  readonly active: boolean;
  readonly phase: HyperDriveRocketPhase;
  readonly windowRemainingSeconds: number;
  readonly returnBlendRemainingSeconds: number;
  readonly autopilotWeight: number;
}

interface RocketState {
  windowRemainingSeconds: number;
}

const EPSILON = 1e-9;

const EMPTY_SNAPSHOT: HyperDriveRocketSnapshot = {
  active: false,
  phase: 'inactive',
  windowRemainingSeconds: 0,
  returnBlendRemainingSeconds: 0,
  autopilotWeight: 0,
};

/** Owns Rocket state and source-scoped protection; movement stays in KartController. */
export class HyperDriveRocketSystem {
  private readonly states = new Map<string, RocketState>();
  private readonly autopilot: RocketAutopilot;
  private disposed = false;

  public constructor(
    track: CircuitAlpha,
    private readonly effects: RacerEffects,
  ) {
    this.autopilot = new RocketAutopilot(track);
  }

  public activate(racerId: string, commit: () => boolean): boolean {
    if (this.disposed || racerId.trim().length === 0 || this.states.has(racerId)) return false;

    const activated = this.effects.activateTemporaryBoost(
      racerId,
      {
        id: HYPER_DRIVE_ROCKET_CONFIG.id,
        label: HYPER_DRIVE_ROCKET_CONFIG.label,
        durationSeconds: HYPER_DRIVE_ROCKET_CONFIG.windowSeconds,
        speedCapMultiplier: HYPER_DRIVE_ROCKET_CONFIG.speedCapMultiplier,
        accelerationMultiplier: HYPER_DRIVE_ROCKET_CONFIG.accelerationMultiplier,
        ignoreOffRoadSpeedPenalty: HYPER_DRIVE_ROCKET_CONFIG.ignoreOffRoadSpeedPenalty,
      },
      commit,
    );
    if (!activated) return false;

    this.effects.setRacerContactImmunity(racerId, HYPER_DRIVE_ROCKET_CONFIG.id, true);
    this.effects.setGroundHazardImmunity(racerId, HYPER_DRIVE_ROCKET_CONFIG.id, true);
    this.states.set(racerId, {
      windowRemainingSeconds: HYPER_DRIVE_ROCKET_CONFIG.windowSeconds,
    });
    return true;
  }

  public inputFor(
    racerId: string,
    position: THREE.Vector3,
    forward: THREE.Vector3,
    speed: number,
    normalInput: DriveInput,
  ): DriveInput {
    const state = this.states.get(racerId);
    if (state === undefined) return { ...normalInput };
    return this.autopilot.input(
      position,
      forward,
      speed,
      normalInput,
      this.autopilotWeight(state.windowRemainingSeconds),
    );
  }

  public advance(dt: number, paused = false): void {
    if (this.disposed || paused || !Number.isFinite(dt) || dt <= 0) return;
    for (const [racerId, state] of this.states) {
      state.windowRemainingSeconds = Math.max(0, state.windowRemainingSeconds - dt);
      if (state.windowRemainingSeconds <= EPSILON) this.clear(racerId);
    }
  }

  public isActive(racerId: string): boolean {
    return this.states.has(racerId);
  }

  public snapshot(racerId: string): HyperDriveRocketSnapshot {
    const state = this.states.get(racerId);
    if (state === undefined) return { ...EMPTY_SNAPSHOT };

    const remaining = state.windowRemainingSeconds;
    const returnBlendRemainingSeconds = Math.min(
      remaining,
      HYPER_DRIVE_ROCKET_CONFIG.controlReturnSeconds,
    );
    return {
      active: true,
      phase:
        remaining <= HYPER_DRIVE_ROCKET_CONFIG.controlReturnSeconds ? 'returning' : 'autopilot',
      windowRemainingSeconds: remaining,
      returnBlendRemainingSeconds,
      autopilotWeight: this.autopilotWeight(remaining),
    };
  }

  public clear(racerId: string): void {
    this.states.delete(racerId);
    this.effects.clearTemporaryBoost(racerId, HYPER_DRIVE_ROCKET_CONFIG.id);
    this.effects.setRacerContactImmunity(racerId, HYPER_DRIVE_ROCKET_CONFIG.id, false);
    this.effects.setGroundHazardImmunity(racerId, HYPER_DRIVE_ROCKET_CONFIG.id, false);
  }

  public clearAll(): void {
    for (const racerId of [...this.states.keys()]) this.clear(racerId);
  }

  public dispose(): void {
    this.clearAll();
    this.disposed = true;
  }

  private autopilotWeight(remainingSeconds: number): number {
    return THREE.MathUtils.clamp(
      remainingSeconds / HYPER_DRIVE_ROCKET_CONFIG.controlReturnSeconds,
      0,
      1,
    );
  }
}
