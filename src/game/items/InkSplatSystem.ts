import type { RacerProgress } from '../race/RaceDirector';
import { racersAheadByProgress } from './ItemTargeting';

/** PRD amendment 2.18 / ADR-079. Gameplay values are intentionally local. */
export const INK_SPLAT_CONFIG = {
  durationSeconds: 2.5,
  humanCoverage: 0.35,
  aiNoiseAmplitudeMeters: 0.55,
  aiReactionLatencySeconds: 0.08,
  aiSteeringPrecisionMultiplier: 0.88,
  aiNoiseFrequencyHz: 0.78,
} as const;

export interface InkAiImpairmentSnapshot {
  readonly remainingSeconds: number;
  readonly noiseAmplitudeMeters: number;
  readonly noisePhaseRadians: number;
  readonly reactionLatencySeconds: number;
  readonly steeringPrecisionMultiplier: number;
}

export interface InkViewSnapshot {
  readonly active: boolean;
  readonly remainingSeconds: number;
  readonly durationSeconds: number;
  readonly fade: number;
  readonly coverage: number;
}

export interface InkApplicationResult {
  readonly accepted: boolean;
  readonly ownerId: string;
  readonly candidateTargetIds: readonly string[];
  readonly appliedTargetIds: readonly string[];
  readonly blockedTargetIds: readonly string[];
}

interface ActiveInk {
  remainingSeconds: number;
  noisePhaseRadians: number;
}

const EMPTY_VIEW: InkViewSnapshot = {
  active: false,
  remainingSeconds: 0,
  durationSeconds: INK_SPLAT_CONFIG.durationSeconds,
  fade: 0,
  coverage: 0,
};

function stablePhase(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 0xffffffff) * Math.PI * 2;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Owns Ink's timed impairment state; it does not mutate race or physics authority. */
export class InkSplatSystem {
  private readonly active = new Map<string, ActiveInk>();

  public apply(
    ownerId: string,
    racers: readonly RacerProgress[],
    isImmune: (racerId: string) => boolean,
    commit: () => boolean,
  ): InkApplicationResult {
    const candidates = racersAheadByProgress(ownerId, racers);
    const candidateTargetIds = candidates.map((racer) => racer.id);
    if (candidateTargetIds.length === 0) return this.result(false, ownerId, candidateTargetIds);
    if (!commit()) return this.result(false, ownerId, candidateTargetIds);

    const appliedTargetIds: string[] = [];
    const blockedTargetIds: string[] = [];
    for (const target of candidates) {
      if (isImmune(target.id)) {
        blockedTargetIds.push(target.id);
        continue;
      }
      const existing = this.active.get(target.id);
      this.active.set(target.id, {
        remainingSeconds: INK_SPLAT_CONFIG.durationSeconds,
        noisePhaseRadians: existing?.noisePhaseRadians ?? stablePhase(target.id),
      });
      appliedTargetIds.push(target.id);
    }

    return {
      accepted: true,
      ownerId,
      candidateTargetIds,
      appliedTargetIds,
      blockedTargetIds,
    };
  }

  public advance(dt: number, paused = false): void {
    if (paused || !Number.isFinite(dt) || dt <= 0) return;
    const phaseStep = dt * Math.PI * 2 * INK_SPLAT_CONFIG.aiNoiseFrequencyHz;
    for (const [racerId, state] of this.active) {
      state.remainingSeconds = Math.max(0, state.remainingSeconds - dt);
      state.noisePhaseRadians = (state.noisePhaseRadians + phaseStep) % (Math.PI * 2);
      if (state.remainingSeconds <= 1e-9) this.active.delete(racerId);
    }
  }

  public aiSnapshot(racerId: string): InkAiImpairmentSnapshot | null {
    const state = this.active.get(racerId);
    if (state === undefined) return null;
    return {
      remainingSeconds: state.remainingSeconds,
      noiseAmplitudeMeters: INK_SPLAT_CONFIG.aiNoiseAmplitudeMeters,
      noisePhaseRadians: state.noisePhaseRadians,
      reactionLatencySeconds: INK_SPLAT_CONFIG.aiReactionLatencySeconds,
      steeringPrecisionMultiplier: INK_SPLAT_CONFIG.aiSteeringPrecisionMultiplier,
    };
  }

  public viewSnapshot(racerId: string): InkViewSnapshot {
    const state = this.active.get(racerId);
    if (state === undefined) return { ...EMPTY_VIEW };
    const remainingSeconds = Math.max(0, state.remainingSeconds);
    const fade = clamp01(remainingSeconds / INK_SPLAT_CONFIG.durationSeconds);
    return {
      active: remainingSeconds > 0,
      remainingSeconds,
      durationSeconds: INK_SPLAT_CONFIG.durationSeconds,
      fade,
      coverage: INK_SPLAT_CONFIG.humanCoverage * (0.72 + 0.28 * fade),
    };
  }

  public isActive(racerId: string): boolean {
    return this.active.has(racerId);
  }

  public activeRacerIds(): string[] {
    return [...this.active.keys()].sort();
  }

  public clear(racerId: string): void {
    this.active.delete(racerId);
  }

  public clearAll(): void {
    this.active.clear();
  }

  public dispose(): void {
    this.clearAll();
  }

  private result(
    accepted: boolean,
    ownerId: string,
    candidateTargetIds: readonly string[],
  ): InkApplicationResult {
    return {
      accepted,
      ownerId,
      candidateTargetIds,
      appliedTargetIds: [],
      blockedTargetIds: [],
    };
  }
}
