import { Vector3 } from 'three';
import { guardrailContact } from '../track/GuardrailSystem';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { ItemProjectileConfig } from './itemDefinitions';
import type { ProjectileTarget } from './ProjectileSystem';

/** PRD amendment 2.15 / ADR-076. No inherited speed, homing outbound, or rail bounce. */
export const ARC = {
  cadence: 0.55,
  range: 30,
  bow: 2,
  returnSpeed: 56,
  hitRadius: 1.37,
} as const;
export const ARC_BLADE_CONFIG: Readonly<ItemProjectileConfig> = {
  speedMetersPerSecond: 42,
  radiusMeters: 0.32,
  lifetimeSeconds: 4,
  maxWallBounces: 0,
  inheritedVelocityFactor: 0,
  maxInheritedSpeedMetersPerSecond: 0,
  ownerArmSeconds: 0.18,
  spinoutSeconds: 0.85,
};
export type ArcPhase = 'outbound' | 'return';
export type ArcEnd =
  'catch' | 'absorbed' | 'wall' | 'expired' | 'cancelled' | 'cleared' | 'rollback';
export interface ArcEvent {
  readonly id: number;
  readonly ownerId: string;
  readonly phase: ArcPhase;
  readonly kind: ArcEnd | 'launch' | 'return' | 'hit';
  readonly targetId?: string;
}

// Integrate ds * sqrt(1 + (dy/ds)^2), then invert the monotone table. The 1 cm
// Simpson intervals keep path speed independent of forward displacement.
const INTERVAL = 0.01;
const arcDistances = [0];
function slope(s: number): number {
  return ((ARC.bow * Math.PI) / ARC.range) * Math.cos((Math.PI * s) / ARC.range);
}
function metric(s: number): number {
  return Math.hypot(1, slope(s));
}
for (let i = 1; i <= ARC.range / INTERVAL; i++) {
  const a = (i - 1) * INTERVAL;
  arcDistances.push(
    (arcDistances[i - 1] ?? 0) +
      (INTERVAL / 6) * (metric(a) + 4 * metric(a + INTERVAL / 2) + metric(a + INTERVAL)),
  );
}
export const ARC_OUTBOUND_DISTANCE = arcDistances.at(-1) ?? ARC.range;

export function arcCoordinates(distance: number): { forward: number; right: number } {
  const d = Math.max(0, Math.min(ARC_OUTBOUND_DISTANCE, distance));
  let low = 0;
  let high = arcDistances.length - 1;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if ((arcDistances[mid] ?? 0) < d) low = mid;
    else high = mid;
  }
  const a = arcDistances[low] ?? 0;
  const b = arcDistances[high] ?? ARC_OUTBOUND_DISTANCE;
  const s = (low + (d - a) / (b - a)) * INTERVAL;
  return { forward: s, right: ARC.bow * Math.sin((Math.PI * s) / ARC.range) };
}

function distanceSq(a: Vector3, b: Vector3): number {
  return (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
}
function finite(v: Vector3): boolean {
  return [v.x, v.y, v.z].every(Number.isFinite);
}

/** First entry into a stationary snapshot's planar circle along this swept segment. */
export function arcContactFraction(start: Vector3, end: Vector3, center: Vector3): number | null {
  const x = start.x - center.x;
  const z = start.z - center.z;
  const c = x * x + z * z - ARC.hitRadius ** 2;
  if (c <= 1e-10) return 0;
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const a = dx * dx + dz * dz;
  if (a < 1e-18) return null;
  const b = x * dx + z * dz;
  const discriminant = b * b - a * c;
  if (discriminant < 0) return null;
  const t = (-b - Math.sqrt(discriminant)) / a;
  return t >= 0 && t <= 1 ? t : null;
}

/** Bounded Arc-only flight state. Capacity, inventory and effect application stay outside. */
export class ArcBladeFlight {
  public phase: ArcPhase = 'outbound';
  public remainingSeconds = ARC_BLADE_CONFIG.lifetimeSeconds;
  public ownerArmSeconds = ARC_BLADE_CONFIG.ownerArmSeconds;
  public distance = 0;
  public readonly position: Vector3;
  public readonly velocity: Vector3;
  private readonly right: Vector3;
  private readonly outboundHits = new Set<string>();
  private readonly returnHits = new Set<string>();
  private readonly turnaroundOverlap = new Set<string>();

  public constructor(
    private readonly origin: Vector3,
    private readonly forward: Vector3,
  ) {
    this.position = origin.clone();
    this.right = new Vector3(forward.z, 0, -forward.x);
    this.velocity = forward
      .clone()
      .addScaledVector(this.right, slope(0))
      .normalize()
      .multiplyScalar(42);
  }

  public update(
    dt: number,
    ownerId: string,
    targets: readonly ProjectileTarget[],
    track: CircuitAlpha,
    onContact: (target: ProjectileTarget) => void,
    onReturn: () => void,
    onMove: () => void,
  ): ArcEnd | null {
    const owner = targets.find((r) => r.id === ownerId);
    if (!owner || owner.finished || owner.recovering || !finite(owner.position)) return 'cancelled';
    let time = Math.min(dt, this.remainingSeconds);
    while (time > 1e-10) {
      const outbound = this.phase === 'outbound';
      const speed = outbound ? 42 : ARC.returnSpeed;
      const toTurn = outbound ? (ARC_OUTBOUND_DISTANCE - this.distance) / speed : Infinity;
      const step = Math.min(time, 0.25 / speed, toTurn, this.ownerArmSeconds || Infinity);
      const start = this.position.clone();
      const end = start.clone();
      if (outbound) {
        const coordinates = arcCoordinates(this.distance + speed * step);
        end
          .copy(this.origin)
          .addScaledVector(this.forward, coordinates.forward)
          .addScaledVector(this.right, coordinates.right);
      } else {
        const direction = owner.position.clone().sub(start).setY(0);
        const travel = Math.min(direction.length(), speed * step);
        end.addScaledVector(direction.normalize(), travel);
      }
      this.velocity.copy(end).sub(start).divideScalar(step);
      const expires = this.remainingSeconds - step < 1e-9;
      const hits = outbound ? this.outboundHits : this.returnHits;
      for (const id of this.turnaroundOverlap) {
        const target = targets.find((r) => r.id === id);
        if (!target || distanceSq(start, target.position) > ARC.hitRadius ** 2 + 1e-10)
          this.turnaroundOverlap.delete(id);
      }

      // Subsegments are <=25 cm, with a swept racer intersection and a refined
      // first rail boundary. Never process a farther racer before a nearer wall.
      let wall: number | null = null;
      // Spawn and every surviving segment already validated the starting point.
      if (guardrailContact(track, end, ARC_BLADE_CONFIG.radiusMeters)) {
        let low = 0;
        let high = 1;
        for (let i = 0; i < 26; i++) {
          const mid = (low + high) / 2;
          if (guardrailContact(track, start.clone().lerp(end, mid), ARC_BLADE_CONFIG.radiusMeters))
            high = mid;
          else low = mid;
        }
        wall = high;
      }
      const contacts: { target: ProjectileTarget; fraction: number; catchOwner: boolean }[] = [];
      for (const target of targets) {
        if (target.finished || !finite(target.position) || !finite(target.forward)) continue;
        const catchOwner = !outbound && target.id === ownerId;
        if (
          !catchOwner &&
          (hits.has(target.id) || (!outbound && this.turnaroundOverlap.has(target.id)))
        )
          continue;
        let fraction = arcContactFraction(start, end, target.position);
        if (outbound && target.id === ownerId && this.ownerArmSeconds > 1e-9) {
          // Arming at the end of a step grants endpoint contact only, never an
          // earlier sweep through an owner who was still protected by arming.
          fraction =
            this.ownerArmSeconds - step <= 1e-9 &&
            distanceSq(end, target.position) <= ARC.hitRadius ** 2 + 1e-10
              ? 1
              : null;
        }
        if (fraction === null || (expires && fraction >= 1 - 1e-9)) continue;
        contacts.push({ target, fraction, catchOwner });
      }
      contacts.sort((a, b) =>
        Math.abs(a.fraction - b.fraction) <= 1e-7
          ? Number(b.catchOwner) - Number(a.catchOwner) || a.target.id.localeCompare(b.target.id)
          : a.fraction - b.fraction,
      );
      for (const contact of contacts) {
        if (wall !== null && wall <= contact.fraction + 1e-7) {
          this.position.copy(start).lerp(end, wall);
          return 'wall';
        }
        this.position.copy(start).lerp(end, contact.fraction);
        if (contact.catchOwner) return 'catch';
        hits.add(contact.target.id);
        onContact(contact.target);
        if (contact.target.itemImmune) return 'absorbed';
      }
      if (wall !== null && (!expires || wall < 1 - 1e-9)) {
        this.position.copy(start).lerp(end, wall);
        return 'wall';
      }
      this.position.copy(end);
      this.remainingSeconds = Math.max(0, this.remainingSeconds - step);
      this.ownerArmSeconds = Math.max(0, this.ownerArmSeconds - step);
      time = Math.max(0, time - step);
      if (expires) return 'expired';
      if (outbound) this.distance = Math.min(ARC_OUTBOUND_DISTANCE, this.distance + speed * step);
      onMove();
      if (outbound && ARC_OUTBOUND_DISTANCE - this.distance < 1e-8) {
        this.phase = 'return';
        for (const target of targets) {
          if (
            target.id !== ownerId &&
            distanceSq(end, target.position) <= ARC.hitRadius ** 2 + 1e-10
          )
            this.turnaroundOverlap.add(target.id);
        }
        this.velocity
          .copy(owner.position)
          .sub(end)
          .setY(0)
          .normalize()
          .multiplyScalar(ARC.returnSpeed);
        onReturn();
      }
    }
    return null;
  }
}
