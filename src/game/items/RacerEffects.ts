export interface TemporaryBoostSpec {
  readonly id: string;
  readonly label: string;
  readonly durationSeconds: number;
  readonly speedCapMultiplier: number;
  readonly accelerationMultiplier: number;
  readonly ignoreOffRoadSpeedPenalty: boolean;
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
  private readonly spinouts = new Map<string, ActiveSpinout>();
  private readonly itemImmuneRacers = new Set<string>();

  public activateTemporaryBoost(racerId: string, spec: TemporaryBoostSpec): boolean {
    if (racerId.trim().length === 0 || !validBoostSpec(spec)) return false;

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

  public advance(dt: number, paused = false): void {
    if (paused || dt <= 0) return;

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
    const boost = this.temporaryBoosts.get(racerId);
    if (boost === undefined) return { ...NEUTRAL_DRIVE_MODIFIERS };

    return {
      speedCapMultiplier: boost.speedCapMultiplier,
      accelerationMultiplier: boost.accelerationMultiplier,
      ignoreOffRoadSpeedPenalty: boost.ignoreOffRoadSpeedPenalty,
      activeBoostLabel: boost.label,
    };
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

  /** Shared item-immunity boundary; no current item activates it in this increment. */
  public setItemImmune(racerId: string, immune: boolean): boolean {
    if (racerId.trim().length === 0) return false;
    if (immune) this.itemImmuneRacers.add(racerId);
    else this.itemImmuneRacers.delete(racerId);
    return true;
  }

  public isItemImmune(racerId: string): boolean {
    return this.itemImmuneRacers.has(racerId);
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
  }

  public dispose(): void {
    this.temporaryBoosts.clear();
    this.spinouts.clear();
    this.itemImmuneRacers.clear();
  }
}
