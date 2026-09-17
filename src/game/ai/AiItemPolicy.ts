import * as THREE from 'three';
import type { SurfaceType } from '../../config/kartTuning';
import type { RacerProgress } from '../race/RaceDirector';
import type { HazardSnapshot } from '../items/HazardSystem';
import type { ProjectileSnapshot } from '../items/ProjectileSystem';
import type { RacerDriveModifiers } from '../items/RacerEffects';
import type { DriveInput } from '../physics/KartController';
import type { ItemId, RaceRank } from '../items/itemDefinitions';
import { racersAheadByProgress } from '../items/ItemTargeting';
import type { AiRacerAwareness } from './AiDriver';

/**
 * AI item timing is deliberately a policy layer, not a second item system.
 * These thresholds describe when an already-acquired item is useful; they do
 * not change item definitions, selector probabilities, or racer statistics.
 */
export const AI_ITEM_POLICY = {
  targetRangeMeters: 120,
  rearThreatRangeMeters: 24,
  closeRacerRangeMeters: 6,
  incomingThreatRangeMeters: 12,
  defensiveHazardRangeMeters: 9,
  straightCornerFactor: 0.22,
  recoverySpeedRatio: 0.72,
  catchUpGapMeters: 20,
  immediateThreatClosingSpeed: 1.5,
} as const;

export interface AiItemPolicyContext {
  readonly racerId: string;
  readonly currentItem: ItemId | null;
  readonly rank: RaceRank;
  readonly distanceBehindLeaderMeters: number;
  readonly racers: readonly RacerProgress[];
  readonly awareness: readonly AiRacerAwareness[];
  readonly position: THREE.Vector3;
  readonly forward: THREE.Vector3;
  readonly speed: number;
  readonly characterMaxSpeed: number;
  readonly trackLength: number;
  readonly surface: SurfaceType;
  readonly cornerFactor: number;
  readonly canPlaceSlick: boolean;
  readonly itemPhysicsCapacityAvailable: boolean;
  readonly apexAvailable: boolean;
  readonly overdriveActive: boolean;
  readonly overdriveNextPulseRemaining: number;
  readonly rocketActive: boolean;
  readonly projectiles: readonly ProjectileSnapshot[];
  readonly hazards: readonly HazardSnapshot[];
}

export type AiItemDecision =
  | { readonly action: 'use'; readonly direction: 'forward' | 'backward'; readonly reason: string }
  | { readonly action: 'pulse'; readonly reason: string }
  | { readonly action: 'wait'; readonly reason: string };

interface RacerRelation {
  readonly distanceMeters: number;
  readonly progressGapMeters: number;
  readonly speed: number;
}

interface ItemTargets {
  readonly ahead: readonly RacerRelation[];
  readonly behind: readonly RacerRelation[];
  readonly nearestAhead: RacerRelation | null;
  readonly rearThreat: RacerRelation | null;
}

function horizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function progressGapMeters(
  owner: RacerProgress,
  other: RacerProgress,
  trackLength: number,
): number {
  return (other.lap + other.trackProgress - (owner.lap + owner.trackProgress)) * trackLength;
}

function targetRelations(context: AiItemPolicyContext): ItemTargets {
  const owner = context.racers.find((racer) => racer.id === context.racerId);
  if (owner === undefined || !Number.isFinite(context.trackLength) || context.trackLength <= 0)
    return { ahead: [], behind: [], nearestAhead: null, rearThreat: null };

  const awarenessById = new Map<string, AiRacerAwareness>();
  for (const racer of context.awareness) {
    if (racer.id !== undefined) awarenessById.set(racer.id, racer);
  }
  const relations = context.racers
    .filter((racer) => racer.id !== context.racerId && !racer.finished)
    .map((racer) => {
      const observed = awarenessById.get(racer.id);
      return {
        racer,
        distanceMeters:
          observed === undefined
            ? Number.POSITIVE_INFINITY
            : horizontalDistance(context.position, observed.position),
        progressGapMeters: progressGapMeters(owner, racer, context.trackLength),
        speed: observed?.speed ?? 0,
      };
    });
  const ahead = relations
    .filter(({ progressGapMeters: gap }) => gap > 0)
    .sort((a, b) => a.progressGapMeters - b.progressGapMeters);
  const behind = relations
    .filter(({ progressGapMeters: gap }) => gap < 0)
    .sort((a, b) => Math.abs(a.progressGapMeters) - Math.abs(b.progressGapMeters));
  const nearestAhead = ahead[0] ?? null;
  const rearThreat =
    behind.find(
      (relation) =>
        relation.distanceMeters <= AI_ITEM_POLICY.rearThreatRangeMeters &&
        relation.speed >= context.speed - AI_ITEM_POLICY.immediateThreatClosingSpeed,
    ) ?? null;

  return { ahead, behind, nearestAhead, rearThreat };
}

function hasIncomingProjectile(context: AiItemPolicyContext): boolean {
  return context.projectiles.some((projectile) => {
    if (projectile.ownerId === context.racerId) return false;
    if (projectile.targetId === context.racerId) return true;
    return (
      horizontalDistance(context.position, projectile.position) <=
      AI_ITEM_POLICY.incomingThreatRangeMeters
    );
  });
}

function hasNearbyHazard(context: AiItemPolicyContext): boolean {
  return context.hazards.some(
    (hazard) =>
      hazard.ownerId !== context.racerId &&
      horizontalDistance(context.position, hazard.position) <=
        AI_ITEM_POLICY.defensiveHazardRangeMeters,
  );
}

function hasCloseRacer(targets: ItemTargets): boolean {
  return [...targets.ahead, ...targets.behind].some(
    (relation) => relation.distanceMeters <= AI_ITEM_POLICY.closeRacerRangeMeters,
  );
}

function use(direction: 'forward' | 'backward', reason: string): AiItemDecision {
  return { action: 'use', direction, reason };
}

function wait(reason: string): AiItemDecision {
  return { action: 'wait', reason };
}

function hasUsefulAheadTarget(targets: ItemTargets): boolean {
  return (
    targets.nearestAhead !== null &&
    targets.nearestAhead.progressGapMeters <= AI_ITEM_POLICY.targetRangeMeters
  );
}

function straightOrRecovery(context: AiItemPolicyContext): boolean {
  const offRoad = context.surface === 'dirt' || context.surface === 'grass';
  const belowUsefulSpeed =
    context.speed < context.characterMaxSpeed * AI_ITEM_POLICY.recoverySpeedRatio;
  const catchUpLine =
    context.distanceBehindLeaderMeters >= AI_ITEM_POLICY.catchUpGapMeters &&
    context.speed < context.characterMaxSpeed * 0.9;
  return (
    context.cornerFactor <= AI_ITEM_POLICY.straightCornerFactor ||
    offRoad ||
    belowUsefulSpeed ||
    catchUpLine
  );
}

/**
 * Stateless tactical policy. The caller owns timing, inventory transactions,
 * and the actual item effect dispatch.
 */
export class AiItemPolicy {
  public decide(context: AiItemPolicyContext): AiItemDecision {
    if (context.overdriveActive) {
      return context.overdriveNextPulseRemaining <= 1e-9
        ? { action: 'pulse', reason: 'overdrive cadence ready' }
        : wait('overdrive pulse cadence');
    }
    if (context.currentItem === null || context.rocketActive) return wait('no ready item');

    const targets = targetRelations(context);
    const incomingThreat = hasIncomingProjectile(context);
    const nearbyHazard = hasNearbyHazard(context);
    const closeRacer = hasCloseRacer(targets);
    const defensiveThreat = incomingThreat || nearbyHazard || closeRacer;
    const usefulAheadTarget = hasUsefulAheadTarget(targets);

    switch (context.currentItem) {
      case 'kinetic-disc':
        if (!context.itemPhysicsCapacityAvailable) return wait('item physics capacity unavailable');
        if (usefulAheadTarget) return use('forward', 'target ahead in disc range');
        if (targets.rearThreat !== null) return use('backward', 'rear attacker in disc range');
        return wait('no disc target');
      case 'seeker-drone':
        if (!context.itemPhysicsCapacityAvailable) return wait('item physics capacity unavailable');
        return usefulAheadTarget
          ? use('forward', 'nearest progress-valid target ahead')
          : wait('no useful seeker target');
      case 'apex-missile':
        return context.apexAvailable && usefulAheadTarget
          ? use('forward', 'leader ahead and Apex slot available')
          : wait('Apex target or slot unavailable');
      case 'blast-orb':
        if (!context.itemPhysicsCapacityAvailable) return wait('item physics capacity unavailable');
        if (targets.rearThreat !== null) return use('backward', 'rear attacker in Blast range');
        if (usefulAheadTarget) return use('forward', 'target ahead in Blast range');
        return wait('no Blast target');
      case 'blaze-orbs':
      case 'frost-orbs':
      case 'arc-blade':
      case 'arc-hammers':
        if (!context.itemPhysicsCapacityAvailable) return wait('item physics capacity unavailable');
        if (targets.rearThreat !== null)
          return use('backward', 'rear attacker in projectile range');
        if (usefulAheadTarget) return use('forward', 'target ahead in projectile range');
        return wait('no projectile target');
      case 'slick-trap':
        return targets.rearThreat !== null && context.canPlaceSlick
          ? use('backward', 'rear attacker is close enough for Slick')
          : wait(
              context.canPlaceSlick ? 'no rear attacker for Slick' : 'Slick capacity unavailable',
            );
      case 'shockwave':
        return defensiveThreat
          ? use('forward', 'incoming projectile, hazard, or close racer')
          : wait('Shockwave held for a defensive threat');
      case 'ink-splat':
        return usefulAheadTarget
          ? use('forward', 'target ahead for Ink impairment')
          : wait('no target ahead for Ink');
      case 'nitro-surge':
        return straightOrRecovery(context)
          ? use('forward', 'straight or recovery line for Nitro Surge')
          : wait('Nitro Surge held for a useful line');
      case 'nitro-overdrive':
        return straightOrRecovery(context)
          ? use('forward', 'straight or recovery line for Overdrive')
          : wait('Overdrive held for a useful line');
      case 'hyper-drive-rocket':
        return use('forward', 'Rocket activates promptly after acquisition');
      case 'prismatic-invincibility':
        return defensiveThreat || (context.rank <= 3 && straightOrRecovery(context))
          ? use(
              'forward',
              defensiveThreat ? 'defensive threat detected' : 'leader protection on a clear line',
            )
          : wait('Prismatic held for contact or item threat');
      default:
        return wait('unrecognized item');
    }
  }
}

/** Exported for focused policy tests without exposing mutable policy state. */
export function aiItemTargets(context: AiItemPolicyContext): {
  aheadCount: number;
  rearThreat: boolean;
  nearestAheadDistanceMeters: number | null;
} {
  const targets = targetRelations(context);
  return {
    aheadCount: racersAheadByProgress(context.racerId, context.racers).length,
    rearThreat: targets.rearThreat !== null,
    nearestAheadDistanceMeters: targets.nearestAhead?.progressGapMeters ?? null,
  };
}

/** Apply every item-owned drive authority before the existing AI controller runs. */
export function driveInputWithItemModifiers(
  input: DriveInput,
  modifiers: RacerDriveModifiers,
): DriveInput {
  return {
    ...input,
    effectSpeedCapMultiplier: modifiers.speedCapMultiplier,
    effectAccelerationMultiplier: modifiers.accelerationMultiplier,
    effectSteeringMultiplier: modifiers.steeringMultiplier,
    ignoreOffRoadSpeedPenalty: modifiers.ignoreOffRoadSpeedPenalty,
    ignoreOffRoadAccelerationPenalty: modifiers.ignoreOffRoadAccelerationPenalty,
  };
}
