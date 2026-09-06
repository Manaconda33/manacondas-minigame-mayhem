export interface TemporaryBoostSpec {
  readonly id: string;
  readonly label: string;
  readonly durationSeconds: number;
  readonly speedCapMultiplier: number;
  readonly accelerationMultiplier: number;
  readonly ignoreOffRoadSpeedPenalty: boolean;
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

export class RacerEffects {
  private readonly temporaryBoosts = new Map<string, ActiveTemporaryBoost>();

  public activateTemporaryBoost(racerId: string, spec: TemporaryBoostSpec): boolean {
    if (racerId.trim().length === 0 || !validBoostSpec(spec)) return false;

    this.temporaryBoosts.set(racerId, {
      ...spec,
      remainingSeconds: spec.durationSeconds,
    });
    return true;
  }

  public advance(dt: number, paused = false): void {
    if (paused || dt <= 0) return;

    for (const [racerId, boost] of this.temporaryBoosts) {
      boost.remainingSeconds -= dt;
      if (boost.remainingSeconds <= 0) this.temporaryBoosts.delete(racerId);
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

  public remainingSeconds(racerId: string, effectId?: string): number {
    const boost = this.temporaryBoosts.get(racerId);
    if (boost === undefined || (effectId !== undefined && boost.id !== effectId)) return 0;
    return boost.remainingSeconds;
  }

  public clearTemporaryBoost(racerId: string, effectId?: string): boolean {
    const boost = this.temporaryBoosts.get(racerId);
    if (boost === undefined || (effectId !== undefined && boost.id !== effectId)) return false;
    return this.temporaryBoosts.delete(racerId);
  }

  public clear(racerId: string): void {
    this.temporaryBoosts.delete(racerId);
  }

  public dispose(): void {
    this.temporaryBoosts.clear();
  }
}
