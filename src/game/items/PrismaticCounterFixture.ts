import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { RacerProgress } from '../race/RaceDirector';
import type { ProjectileSystem } from './ProjectileSystem';
import type { HazardSystem } from './HazardSystem';
import type { ApexMissileSystem } from './ApexMissileSystem';
import type { ShockwaveSystem } from './ShockwaveSystem';
import { BLAZE_ORB_CONFIG } from './BlazeOrbs';
import { ITEM_DEFINITIONS, type ItemId } from './itemDefinitions';
import { currentRaceLeader } from './ItemTargeting';

const CASES = ['kinetic', 'seeker', 'blaze', 'slick', 'blast', 'apex', 'shockwave', 'racer'] as const;
export type PrismaticCase = (typeof CASES)[number];
export interface PrismaticTest {
  mode: PrismaticCase;
  expired: boolean;
}
export function prismaticTestFromSearch(search: string): PrismaticTest | null {
  const params = new URLSearchParams(search);
  const blazeMode = params.get('testBlaze') === 'prismatic' ? 'blaze' : null;
  const mode = blazeMode ?? params.get('testPrismaticCounter');
  const phase = params.get('testBlazePhase') ?? params.get('testPrismaticPhase') ?? 'protected';
  if (
    params.get('testItem') !== 'prismatic-invincibility' ||
    !CASES.includes(mode as PrismaticCase) ||
    !['protected', 'expired'].includes(phase)
  )
    return null;
  return { mode: mode as PrismaticCase, expired: phase === 'expired' };
}

export interface PrismaticFixtureRuntime {
  position: THREE.Vector3;
  speed: number;
  finished: boolean;
  held: boolean;
  remaining: number;
  track: CircuitAlpha;
  racers: readonly RacerProgress[];
  projectiles: ProjectileSystem;
  hazards: HazardSystem;
  apex: ApexMissileSystem;
  shockwave: ShockwaveSystem;
  placeRacer(position: THREE.Vector3, forward: THREE.Vector3): string | null;
}

/** Stationary, marked encounters. A miss is inconclusive, never an immunity pass. */
export class PrismaticCounterFixture {
  public readonly group = new THREE.Group();
  private readonly marker: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial> | null;
  private stage: 'pickup' | 'ready' | 'expiry' | 'encounter' | 'done' = 'pickup';
  private message = 'COLLECT PRISMATIC';
  private elapsed = 0;
  private origin = new THREE.Vector3();
  private objectId: number | null = null;
  private racerId: string | null = null;
  private seenActivation = false;
  public constructor(public readonly test: PrismaticTest | null) {
    this.marker =
      test?.mode === 'racer'
        ? new THREE.Mesh(
            new THREE.ConeGeometry(0.45, 1, 4),
            new THREE.MeshBasicMaterial({ color: 0x66ffff }),
          )
        : null;
    if (this.marker) {
      this.marker.rotation.z = Math.PI;
      this.group.add(this.marker);
    }
    this.group.name = 'prismatic-test-rival-marker';
    this.group.visible = false;
  }

  public updateMarker(position?: THREE.Vector3): void {
    this.group.visible =
      this.marker !== null && this.controlledRacer() !== null && position !== undefined;
    if (position) this.group.position.copy(position).y += 4.5;
  }

  public dispose(): void {
    this.marker?.geometry.dispose();
    this.marker?.material.dispose();
    this.group.visible = false;
    this.group.removeFromParent();
    this.group.clear();
  }

  public activationAllowed(
    position: THREE.Vector3,
    speed: number,
    track: CircuitAlpha,
    racers: readonly RacerProgress[],
  ): boolean {
    if (!this.test || this.stage === 'done') return true;
    const projection = track.project(position);
    const ready =
      speed < 1 &&
      Math.abs(projection.lateralOffset) < 2 &&
      (projection.surface === 'asphalt' || projection.surface === 'boost') &&
      (this.test.mode !== 'apex' || currentRaceLeader(racers)?.id === 'player');
    this.message = ready
      ? 'READY · ACTIVATE THEN STAY STILL'
      : this.test.mode === 'apex'
        ? 'REACH FIRST · STOP NEAR ROAD CENTER · ACTIVATE'
        : 'STOP NEAR ROAD CENTER · ACTIVATE';
    return ready && !this.seenActivation;
  }

  public update(dt: number, r: PrismaticFixtureRuntime): void {
    if (!this.test || this.stage === 'done' || !Number.isFinite(dt) || dt <= 0) return;
    if (r.finished) {
      this.finish('CANCELLED · RACE FINISHED');
      return;
    }
    if (!this.seenActivation) {
      if (r.held) {
        this.stage = 'ready';
        this.activationAllowed(r.position, r.speed, r.track, r.racers);
      }
      if (r.remaining <= 0) return;
      this.seenActivation = true;
      this.origin.copy(r.position);
      this.stage = 'expiry';
    }
    if (r.position.distanceTo(this.origin) > 3) {
      this.finish('INCONCLUSIVE · MOVED FROM TEST POSITION · RESTART');
      return;
    }
    if (this.stage === 'expiry') {
      if (this.test.expired && r.remaining > 0) {
        this.message = 'STAY STILL · WAITING FOR EXPIRY';
        return;
      }
      const projection = r.track.project(r.position);
      const launch = (meters: number) => {
        const t = (projection.progress + meters / r.track.curve.getLength() + 1) % 1;
        return {
          position: r.track.curve.getPointAt(t),
          forward: r.track.curve.getTangentAt(t),
          velocity: new THREE.Vector3(),
        };
      };
      const ownerId = 'prismatic-counter-fixture';
      if (this.test.mode === 'kinetic' || this.test.mode === 'seeker' || this.test.mode === 'blaze') {
        const itemId: ItemId =
          this.test.mode === 'kinetic'
            ? 'kinetic-disc'
            : this.test.mode === 'seeker'
              ? 'seeker-drone'
              : 'blaze-orbs';
        const config = itemId === 'blaze-orbs' ? BLAZE_ORB_CONFIG : ITEM_DEFINITIONS[itemId].projectile;
        if (!config) return;
        const incoming = launch(this.test.mode === 'seeker' ? -45 : -12);
        if (this.test.mode !== 'seeker')
          incoming.forward.copy(r.position).sub(incoming.position).setY(0).normalize();
        this.objectId = r.projectiles.spawn({
          itemId,
          ownerId,
          direction: 'forward',
          targetId: itemId === 'seeker-drone' ? 'player' : undefined,
          config,
          launch: incoming,
        });
        if (this.objectId === null) return;
      } else if (this.test.mode === 'slick') {
        this.objectId = r.hazards.placeSlick(ownerId, r.position);
        if (this.objectId === null) return;
      } else if (this.test.mode === 'blast') {
        this.objectId = r.hazards.placeBlastOrb(ownerId, r.position);
        if (this.objectId === null) return;
      } else if (this.test.mode === 'apex') {
        if (currentRaceLeader(r.racers)?.id !== 'player') {
          this.finish('INCONCLUSIVE · LOST FIRST · RESTART');
          return;
        }
        if (!r.apex.launch(ownerId, r.position, r.racers)) return;
      } else if (this.test.mode === 'shockwave') {
        if (
          !r.shockwave.activate(
            ownerId,
            r.position.clone().addScaledVector(projection.tangent, 2),
            () => true,
          )
        )
          return;
      } else {
        this.racerId = r.placeRacer(
          r.position.clone().addScaledVector(projection.tangent, 4),
          projection.tangent.clone().negate(),
        );
        if (this.racerId === null) return;
      }
      this.stage = 'encounter';
      this.message =
        this.test.mode === 'racer'
          ? 'CYAN ARROW = TEST RIVAL · STAY STILL'
          : 'ENCOUNTER ACTIVE · STAY STILL';
    }
    this.elapsed += dt;
    if (this.elapsed > 5.5) this.finish('INCONCLUSIVE · NO VERIFIED CONTACT · RESTART');
  }

  public observe(itemId: ItemId, blocked: boolean, targetId: string, objectId?: number): void {
    if (!this.test || this.stage !== 'encounter') return;
    const expected: Record<PrismaticCase, ItemId> = {
      kinetic: 'kinetic-disc',
      seeker: 'seeker-drone',
      blaze: 'blaze-orbs',
      slick: 'slick-trap',
      blast: 'blast-orb',
      apex: 'apex-missile',
      shockwave: 'shockwave',
      racer: 'prismatic-invincibility',
    };
    if (
      itemId !== expected[this.test.mode] ||
      targetId !== (this.test.mode === 'racer' ? this.racerId : 'player') ||
      (this.objectId !== null && objectId !== this.objectId)
    )
      return;
    const correct =
      this.test.mode === 'racer' ? blocked === this.test.expired : blocked !== this.test.expired;
    this.finish(
      correct
        ? 'PASS · VERIFIED CONTACT · RESTART TO REPEAT'
        : 'FAIL · WRONG PROTECTION STATE · RESTART',
    );
  }

  public controlledRacer(): string | null {
    return this.stage === 'encounter' ? this.racerId : null;
  }
  private finish(message: string): void {
    this.group.visible = false;
    this.stage = 'done';
    this.message = message;
  }
  public badge(): string {
    return this.test
      ? `PRISMATIC ${this.test.mode.toUpperCase()} ${this.test.expired ? 'EXPIRED' : 'PROTECTED'} · ${this.message}`
      : '';
  }
}
