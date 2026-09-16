import * as THREE from 'three';
import type { RacerProgress } from '../race/RaceDirector';
import { validTargetingProgress } from './ItemTargeting';
import { InkSplatSystem, type InkApplicationResult } from './InkSplatSystem';

export type InkSplatCounterTest = 'incoming' | 'protected' | 'expired';

export function inkSplatCounterFromSearch(search: string): InkSplatCounterTest | null {
  const params = new URLSearchParams(search);
  const item = params.get('testItem');
  const counter = params.get('testInkCounter');
  if (item === 'ink-splat' && counter === 'incoming') return 'incoming';
  const phase = params.get('testInkPhase') ?? params.get('testPrismaticPhase');
  if (
    item === 'prismatic-invincibility' &&
    (counter === 'ink' || counter === 'prismatic') &&
    (phase === 'protected' || phase === 'expired')
  )
    return phase;
  return null;
}

export interface InkSplatFixtureContext {
  readonly racers: readonly RacerProgress[];
  readonly playerFinished: boolean;
  readonly protectionRemaining: number;
  readonly ink: InkSplatSystem;
  readonly isImmune: (racerId: string) => boolean;
}

/**
 * Opt-in diagnostic routes only. The fixture invokes the real Ink resolver;
 * it never grants an AI item or changes race/physics authority.
 */
export class InkSplatCounterFixture {
  public readonly group = new THREE.Group();
  private elapsed = 0;
  private seenProtection = false;
  private result: string | null = null;
  private message = 'WAITING FOR A VERIFIED INK ENCOUNTER';

  public constructor(public readonly test: InkSplatCounterTest | null) {
    this.group.name = 'ink-splat-counter-fixture';
    this.group.visible = false;
  }

  public badge(): string | null {
    if (this.test === null) return null;
    return `INK ${this.test.toUpperCase()} · ${this.result ?? this.message} · Restart to retry`;
  }

  public update(dt: number, context: InkSplatFixtureContext): void {
    if (this.test === null || this.result !== null || !Number.isFinite(dt) || dt <= 0) return;
    this.elapsed += dt;
    if (context.playerFinished) {
      this.result = 'INCONCLUSIVE · racer finished';
      return;
    }
    if (this.elapsed > 12) {
      this.result = 'INCONCLUSIVE · no verified encounter';
      return;
    }

    if (this.test === 'protected') {
      if (context.protectionRemaining <= 0) {
        this.message = 'ACTIVATE PRISMATIC · WAITING FOR INK';
        return;
      }
      this.seenProtection = true;
    }
    if (this.test === 'expired') {
      if (context.protectionRemaining > 0) {
        this.seenProtection = true;
        this.message = 'PRISMATIC ACTIVE · WAITING FOR EXPIRY';
        return;
      }
      if (!this.seenProtection) {
        this.message = 'ACTIVATE PRISMATIC · WAIT FOR EXPIRY';
        return;
      }
    }

    const player = context.racers.find((racer) => racer.id === 'player');
    if (player === undefined || !validTargetingProgress(player)) return;
    const playerTotal = player.lap + player.trackProgress;
    const source = context.racers
      .filter(
        (racer) =>
          racer.id !== 'player' &&
          validTargetingProgress(racer) &&
          racer.lap + racer.trackProgress < playerTotal,
      )
      .sort((a, b) => {
        const gap = b.lap + b.trackProgress - (a.lap + a.trackProgress);
        if (gap !== 0) return gap;
        return a.id === b.id ? 0 : a.id < b.id ? -1 : 1;
      })[0];
    if (source === undefined) {
      this.message = 'RACE AHEAD OF AN AI · WAITING FOR INK';
      return;
    }

    const resolution = context.ink.apply(source.id, context.racers, context.isImmune, () => true);
    this.observe(resolution);
  }

  public cancel(): void {
    if (this.test !== null && this.result === null) this.result = 'INCONCLUSIVE · restart required';
    this.group.visible = false;
  }

  public dispose(): void {
    this.cancel();
    this.group.removeFromParent();
    this.group.clear();
  }

  private observe(result: InkApplicationResult): void {
    if (!result.accepted || !result.candidateTargetIds.includes('player')) {
      this.message = 'NO PLAYER TARGET · KEEP RACING';
      return;
    }
    if (this.test === 'protected') {
      this.result = result.blockedTargetIds.includes('player')
        ? 'PASS · PRISMATIC BLOCKED INK'
        : 'FAIL · PRISMATIC DID NOT BLOCK INK';
      return;
    }
    if (this.test === 'expired') {
      this.result = result.appliedTargetIds.includes('player')
        ? 'PASS · EXPIRED PRISMATIC ALLOWED INK'
        : 'FAIL · EXPIRED PRISMATIC STILL BLOCKED INK';
      return;
    }
    this.result = result.appliedTargetIds.includes('player')
      ? 'PASS · INCOMING INK APPLIED'
      : 'INCONCLUSIVE · PLAYER REMAINED PROTECTED';
  }
}
