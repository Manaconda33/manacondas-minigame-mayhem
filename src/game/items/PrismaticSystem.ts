import type { Vector3 } from 'three';
import { RacerEffects } from './RacerEffects';

/** Amendment 2.12 / ADR-073; presentation never determines gameplay reach. */
export const PRISMATIC = {
  id: 'prismatic-invincibility',
  durationSeconds: 6,
  speedCapMultiplier: 1.12,
  contactRadius: 2.35,
  spinoutSeconds: 0.85,
} as const;

export interface ContactRacer {
  readonly id: string;
  readonly position: Vector3;
  readonly finished: boolean;
}

/** Owns encounter latches, never transforms, input, or race progress. */
export class PrismaticSystem {
  private readonly owners = new Set<string>();
  private readonly overlaps = new Map<string, readonly [string, string]>();
  public constructor(private readonly effects: RacerEffects) {}

  public activate(ownerId: string, commit: () => boolean): boolean {
    const activated = this.effects.activateProtection(
      ownerId,
      {
        id: PRISMATIC.id,
        label: 'Prismatic Invincibility',
        durationSeconds: PRISMATIC.durationSeconds,
        speedCapMultiplier: PRISMATIC.speedCapMultiplier,
        accelerationMultiplier: 1,
        ignoreOffRoadSpeedPenalty: true,
        ignoreOffRoadAccelerationPenalty: true,
      },
      commit,
    );
    if (activated) this.owners.add(ownerId);
    return activated;
  }

  public remaining(ownerId: string): number {
    return this.effects.protectionRemainingSeconds(ownerId, PRISMATIC.id);
  }

  public contacts(racers: readonly ContactRacer[]): string[] {
    const activePairs = new Set<string>();
    const victims = new Set<string>();
    for (let i = 0; i < racers.length; i++) {
      for (let j = i + 1; j < racers.length; j++) {
        const a = racers[i];
        const b = racers[j];
        if (!a || !b) continue;
        if (a.finished || b.finished || a.id === b.id) continue;
        const distance = Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z);
        if (!Number.isFinite(distance) || distance >= PRISMATIC.contactRadius) continue;
        const pair = [a.id, b.id].sort() as [string, string];
        const key = JSON.stringify(pair);
        activePairs.add(key);
        if (this.remaining(a.id) <= 0 && this.remaining(b.id) <= 0) continue;
        if (this.overlaps.has(key)) continue;
        this.overlaps.set(key, pair);
        if (this.remaining(a.id) > 0 && !this.effects.isItemImmune(b.id)) victims.add(b.id);
        if (this.remaining(b.id) > 0 && !this.effects.isItemImmune(a.id)) victims.add(a.id);
      }
    }
    for (const key of this.overlaps.keys()) if (!activePairs.has(key)) this.overlaps.delete(key);
    return [...victims];
  }

  public clear(ownerId: string): void {
    this.owners.delete(ownerId);
    this.effects.clearProtection(ownerId, PRISMATIC.id);
    for (const [key, pair] of this.overlaps) if (pair.includes(ownerId)) this.overlaps.delete(key);
  }

  public dispose(): void {
    for (const ownerId of this.owners) this.effects.clearProtection(ownerId, PRISMATIC.id);
    this.owners.clear();
    this.overlaps.clear();
  }
}
