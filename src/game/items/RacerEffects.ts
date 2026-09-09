export interface TemporaryBoostSpec {
  readonly id: string;
  readonly label: string;
  readonly durationSeconds: number;
  readonly speedCapMultiplier: number;
  readonly accelerationMultiplier: number;
  readonly ignoreOffRoadSpeedPenalty: boolean;
  readonly ignoreOffRoadAccelerationPenalty?: boolean;
}

export interface SpinoutSpec {
  readonly preserveMomentum?: boolean;
  readonly id: string;
  readonly label: string;
  readonly durationSeconds: number;
  readonly direction: -1 | 1;
  readonly turns: number;
}

export interface SpinoutState {
  readonly preserveMomentum: boolean;
  readonly id: string;
  readonly label: string;
  readonly remainingSeconds: number;
  readonly durationSeconds: number;
  readonly yawRateRadiansPerSecond: number;
}

export interface RacerDriveModifiers {
  speedCapMultiplier: number;
  accelerationMultiplier: number;
  ignoreOffRoadSpeedPenalty: boolean;
  ignoreOffRoadAccelerationPenalty?: boolean;
  activeBoostLabel: string | null;
}

interface ActiveTemporaryBoost extends TemporaryBoostSpec {
  remainingSeconds: number;
}

interface ActiveSpinout extends SpinoutSpec {
  remainingSeconds: number;
  yawRateRadiansPerSecond: number;
}

const NEUTRAL_DRIVE_MODIFIERS: Readonly<RacerDriveModifiers> = {
  speedCapMultiplier: 1,
  accelerationMultiplier: 1,
  ignoreOffRoadSpeedPenalty: false,
  activeBoostLabel: null,
};

function validBoostSpec(spec: TemporaryBoostSpec): boolean {
  return (
    spec.id.trim().length > 0 &&
    spec.label.trim().length > 0 &&
    Number.isFinite(spec.durationSeconds) &&
    spec.durationSeconds > 0 &&
    Number.isFinite(spec.speedCapMultiplier) &&
    spec.speedCapMultiplier >= 1 &&
    Number.isFinite(spec.accelerationMultiplier) &&
    spec.accelerationMultiplier >= 1
  );
}

function validSpinoutSpec(spec: SpinoutSpec): boolean {
  return (
    spec.id.trim().length > 0 &&
    spec.label.trim().length > 0 &&
    Number.isFinite(spec.durationSeconds) &&
    spec.durationSeconds > 0 &&
    Math.abs(spec.direction) === 1 &&
    Number.isFinite(spec.turns) &&
    spec.turns > 0
  );
}

export class RacerEffects {
  private readonly temporaryBoosts = new Map<string, ActiveTemporaryBoost>();
  private readonly protections = new Map<string, Map<string, ActiveTemporaryBoost>>();
  private readonly spinouts = new Map<string, ActiveSpinout>();
  private readonly itemImmuneRacers = new Set<string>();

  public activateTemporaryBoost(
    racerId: string,
    spec: TemporaryBoostSpec,
    commit: () => boolean = () => true,
  ): boolean {
    if (racerId.trim().length === 0 || !validBoostSpec(spec)) return false;

    if (!commit()) return false;
    this.temporaryBoosts.set(racerId, {
      ...spec,
      remainingSeconds: spec.durationSeconds,
    });
    return true;
  }

  public activateSpinout(racerId: string, spec: SpinoutSpec): boolean {
    if (racerId.trim().length === 0 || !validSpinoutSpec(spec)) return false;
    this.spinouts.set(racerId, {
      ...spec,
      remainingSeconds: spec.durationSeconds,
      yawRateRadiansPerSecond: (spec.direction * spec.turns * Math.PI * 2) / spec.durationSeconds,
    });
    return true;
  }

  public advanceProtection(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    for (const [racerId, sources] of this.protections) {
      for (const [id, effect] of sources) {
        effect.remainingSeconds = Math.max(0, effect.remainingSeconds - dt);
        if (effect.remainingSeconds < 1e-9) sources.delete(id);
      }
      if (sources.size === 0) this.protections.delete(racerId);
    }
  }

  public advance(dt: number, paused = false, protection = true): void {
    if (paused || !Number.isFinite(dt) || dt <= 0) return;
    if (protection) this.advanceProtection(dt);
    for (const [racerId, boost] of this.temporaryBoosts) {
      boost.remainingSeconds -= dt;
      if (boost.remainingSeconds <= 0) this.temporaryBoosts.delete(racerId);
    }
    for (const [racerId, spinout] of this.spinouts) {
      spinout.remainingSeconds -= dt;
      if (spinout.remainingSeconds <= 0) this.spinouts.delete(racerId);
    }
  }

  public driveModifiers(racerId: string): RacerDriveModifiers {
    const boosts = [...(this.protections.get(racerId)?.values() ?? [])];
    const temporary = this.temporaryBoosts.get(racerId);
    if (temporary) boosts.push(temporary);
    const modifiers: RacerDriveModifiers = { ...NEUTRAL_DRIVE_MODIFIERS };
    for (const boost of boosts) {
      if (boost.speedCapMultiplier >= modifiers.speedCapMultiplier)
        modifiers.activeBoostLabel = boost.label;
      modifiers.speedCapMultiplier = Math.max(
        modifiers.speedCapMultiplier,
        boost.speedCapMultiplier,
      );
      modifiers.accelerationMultiplier = Math.max(
        modifiers.accelerationMultiplier,
        boost.accelerationMultiplier,
      );
      modifiers.ignoreOffRoadSpeedPenalty ||= boost.ignoreOffRoadSpeedPenalty;
      if (boost.ignoreOffRoadAccelerationPenalty) modifiers.ignoreOffRoadAccelerationPenalty = true;
    }
    return modifiers;
  }

  public spinoutState(racerId: string): SpinoutState | null {
    const spinout = this.spinouts.get(racerId);
    if (spinout === undefined) return null;
    return {
      preserveMomentum: spinout.preserveMomentum ?? false,
      id: spinout.id,
      label: spinout.label,
      remainingSeconds: spinout.remainingSeconds,
      durationSeconds: spinout.durationSeconds,
      yawRateRadiansPerSecond: spinout.yawRateRadiansPerSecond,
    };
  }

  public activateProtection(
    racerId: string,
    spec: TemporaryBoostSpec,
    commit: () => boolean,
  ): boolean {
    if (!racerId.trim() || !validBoostSpec(spec) || !commit()) return false;
    const sources = this.protections.get(racerId) ?? new Map<string, ActiveTemporaryBoost>();
    sources.set(spec.id, { ...spec, remainingSeconds: spec.durationSeconds });
    this.protections.set(racerId, sources);
    return true;
  }

  public protectionRemainingSeconds(racerId: string, source: string): number {
    return this.protections.get(racerId)?.get(source)?.remainingSeconds ?? 0;
  }

  public clearProtection(racerId: string, source: string): void {
    const sources = this.protections.get(racerId);
    sources?.delete(source);
    if (sources?.size === 0) this.protections.delete(racerId);
  }

  /** Separate external immunity source; timed expiry must not clear it. */
  public setItemImmune(racerId: string, immune: boolean): boolean {
    if (racerId.trim().length === 0) return false;
    if (immune) this.itemImmuneRacers.add(racerId);
    else this.itemImmuneRacers.delete(racerId);
    return true;
  }

  public isItemImmune(racerId: string): boolean {
    return this.itemImmuneRacers.has(racerId) || (this.protections.get(racerId)?.size ?? 0) > 0;
  }

  public remainingSeconds(racerId: string, effectId?: string): number {
    const boost = this.temporaryBoosts.get(racerId);
    if (boost === undefined || (effectId !== undefined && boost.id !== effectId)) return 0;
    return boost.remainingSeconds;
  }

  public spinoutRemainingSeconds(racerId: string, effectId?: string): number {
    const spinout = this.spinouts.get(racerId);
    if (spinout === undefined || (effectId !== undefined && spinout.id !== effectId)) return 0;
    return spinout.remainingSeconds;
  }

  public clearTemporaryBoost(racerId: string, effectId?: string): boolean {
    const boost = this.temporaryBoosts.get(racerId);
    if (boost === undefined || (effectId !== undefined && boost.id !== effectId)) return false;
    return this.temporaryBoosts.delete(racerId);
  }

  public clearSpinout(racerId: string, effectId?: string): boolean {
    const spinout = this.spinouts.get(racerId);
    if (spinout === undefined || (effectId !== undefined && spinout.id !== effectId)) return false;
    return this.spinouts.delete(racerId);
  }

  public clear(racerId: string): void {
    this.temporaryBoosts.delete(racerId);
    this.spinouts.delete(racerId);
    this.itemImmuneRacers.delete(racerId);
    this.protections.delete(racerId);
  }

  public dispose(): void {
    this.temporaryBoosts.clear();
    this.spinouts.clear();
    this.itemImmuneRacers.clear();
    this.protections.clear();
  }
}
