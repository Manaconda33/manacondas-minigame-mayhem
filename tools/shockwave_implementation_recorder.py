from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected text not found in {path}: {old[:160]!r}")
    p.write_text(text.replace(old, new, 1))


def write(path: str, content: str) -> None:
    Path(path).write_text(content.rstrip() + "\n")


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
replace_once(
    "src/game/items/itemDefinitions.ts",
    "export const BLAST_ORB_CONFIG = {\n  fuseSeconds: 3,\n  blastRadius: 4,\n  spinoutSeconds: 1.2,\n  ownerImmunitySeconds: 0.35,\n  impactClosingSpeed: 8,\n  forwardSpeed: 14,\n  forwardInheritance: 0.35,\n  backwardInheritance: 0.2,\n  inheritedSpeedCap: 12,\n  drag: 6,\n  spawnOffset: 1.75,\n  radius: 0.4,\n} as const;\n",
    "export const BLAST_ORB_CONFIG = {\n  fuseSeconds: 3,\n  blastRadius: 4,\n  spinoutSeconds: 1.2,\n  ownerImmunitySeconds: 0.35,\n  impactClosingSpeed: 8,\n  forwardSpeed: 14,\n  forwardInheritance: 0.35,\n  backwardInheritance: 0.2,\n  inheritedSpeedCap: 12,\n  drag: 6,\n  spawnOffset: 1.75,\n  radius: 0.4,\n} as const;\n\n/** PRD amendment 2.11 / ADR-072: centered instantaneous counter pulse. */\nexport const SHOCKWAVE_CONFIG = {\n  radius: 5,\n  centerPushMetersPerSecond: 6,\n  edgePushMetersPerSecond: 2,\n  visualSeconds: 0.45,\n} as const;\n",
)


# ---------------------------------------------------------------------------
# Shockwave domain owner
# ---------------------------------------------------------------------------
write(
    "src/game/items/ShockwaveSystem.ts",
    r'''import * as THREE from 'three';
import { SHOCKWAVE_CONFIG as C } from './itemDefinitions';

export interface ShockwaveTarget {
  readonly id: string;
  readonly position: THREE.Vector3;
  readonly finished: boolean;
  readonly itemImmune?: boolean;
}

export interface ShockwavePulse {
  readonly ownerId: string;
  readonly center: THREE.Vector3;
}

export interface ShockwavePush {
  readonly targetId: string;
  readonly velocityDelta: THREE.Vector3;
}

export interface ShockwaveCounterRuntime {
  readonly projectileSystem: {
    queueClearWithinRadius(center: THREE.Vector3, radius: number): void;
  };
  readonly hazardSystem: {
    queueClearWithinRadius(center: THREE.Vector3, radius: number): void;
  };
  readonly apexSystem: {
    queueCounterPulse(center: THREE.Vector3): void;
  };
  readonly targets: readonly ShockwaveTarget[];
}

interface ShockwaveVisual {
  readonly mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  elapsed: number;
}

const MAX_PENDING_PULSES = 8;
const VISUAL_BASE_RADIUS = 0.95;

function finitePosition(position: THREE.Vector3): boolean {
  return [position.x, position.y, position.z].every(Number.isFinite);
}

function fallbackDirection(ownerId: string, targetId: string): THREE.Vector3 {
  const key = `${ownerId}:${targetId}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const angle = ((hash >>> 0) / 0x100000000) * Math.PI * 2;
  return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
}

/** Pure governed racer effect: horizontal velocity delta only. */
export function shockwavePushDelta(
  pulse: ShockwavePulse,
  target: ShockwaveTarget,
): THREE.Vector3 | null {
  if (
    target.id === pulse.ownerId ||
    target.finished ||
    target.itemImmune ||
    !finitePosition(pulse.center) ||
    !finitePosition(target.position)
  )
    return null;

  const dx = target.position.x - pulse.center.x;
  const dz = target.position.z - pulse.center.z;
  const distance = Math.hypot(dx, dz);
  if (!Number.isFinite(distance) || distance > C.radius) return null;

  const direction =
    distance > 1e-9
      ? new THREE.Vector3(dx / distance, 0, dz / distance)
      : fallbackDirection(pulse.ownerId, target.id);
  const ratio = THREE.MathUtils.clamp(distance / C.radius, 0, 1);
  const magnitude = THREE.MathUtils.lerp(
    C.centerPushMetersPerSecond,
    C.edgePushMetersPerSecond,
    ratio,
  );
  return direction.multiplyScalar(magnitude);
}

/**
 * Owns the one-frame pulse queue and finite gameplay-readability VFX. It does
 * not own race progress, racer transforms, projectile lifecycles, or hazards.
 */
export class ShockwaveSystem {
  public readonly group = new THREE.Group();
  private readonly pending: ShockwavePulse[] = [];
  private readonly visuals: ShockwaveVisual[] = [];
  private visualSerial = 0;

  public constructor() {
    this.group.name = 'shockwave-runtime';
  }

  public activate(
    ownerId: string,
    center: THREE.Vector3,
    commitCharge: () => boolean = () => true,
  ): boolean {
    if (
      ownerId.trim().length === 0 ||
      !finitePosition(center) ||
      this.pending.length >= MAX_PENDING_PULSES
    )
      return false;

    const visual = this.createVisual(center);
    let committed = false;
    try {
      committed = commitCharge();
      if (!committed) return false;
      this.pending.push({ ownerId, center: center.clone() });
      this.visuals.push(visual);
      this.group.add(visual.mesh);
      return true;
    } finally {
      if (!committed) this.disposeVisual(visual);
    }
  }

  public drainPulses(): ShockwavePulse[] {
    const pulses = this.pending.map((pulse) => ({
      ownerId: pulse.ownerId,
      center: pulse.center.clone(),
    }));
    this.pending.length = 0;
    return pulses;
  }

  public dispatch(pulse: ShockwavePulse, runtime: ShockwaveCounterRuntime): ShockwavePush[] {
    runtime.projectileSystem.queueClearWithinRadius(pulse.center, C.radius);
    runtime.hazardSystem.queueClearWithinRadius(pulse.center, C.radius);
    runtime.apexSystem.queueCounterPulse(pulse.center);
    return runtime.targets.flatMap((target) => {
      const velocityDelta = shockwavePushDelta(pulse, target);
      return velocityDelta === null ? [] : [{ targetId: target.id, velocityDelta }];
    });
  }

  public advance(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    for (let index = this.visuals.length - 1; index >= 0; index -= 1) {
      const visual = this.visuals[index];
      if (visual === undefined) continue;
      visual.elapsed += dt;
      const ratio = THREE.MathUtils.clamp(visual.elapsed / C.visualSeconds, 0, 1);
      const radius = THREE.MathUtils.lerp(0.65, C.radius, ratio);
      visual.mesh.scale.setScalar(radius / VISUAL_BASE_RADIUS);
      visual.mesh.material.opacity = 0.82 * (1 - ratio);
      if (ratio >= 1) {
        this.visuals.splice(index, 1);
        this.group.remove(visual.mesh);
        this.disposeVisual(visual);
      }
    }
  }

  public pendingCount(): number {
    return this.pending.length;
  }

  public visualCount(): number {
    return this.visuals.length;
  }

  public reset(): void {
    this.pending.length = 0;
    while (this.visuals.length > 0) {
      const visual = this.visuals.pop();
      if (visual === undefined) continue;
      this.group.remove(visual.mesh);
      this.disposeVisual(visual);
    }
  }

  public dispose(): void {
    this.reset();
    this.group.clear();
  }

  private createVisual(center: THREE.Vector3): ShockwaveVisual {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.72, VISUAL_BASE_RADIUS, 48),
      new THREE.MeshBasicMaterial({
        color: 0x9cecff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    mesh.name = `shockwave-pulse-${String(this.visualSerial++)}`;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(center);
    mesh.position.y -= 0.52;
    mesh.scale.setScalar(0.65 / VISUAL_BASE_RADIUS);
    return { mesh, elapsed: 0 };
  }

  private disposeVisual(visual: ShockwaveVisual): void {
    visual.mesh.geometry.dispose();
    visual.mesh.material.dispose();
  }
}
''',
)


# ---------------------------------------------------------------------------
# Ordinary projectile clear boundary
# ---------------------------------------------------------------------------
replace_once(
    "src/game/items/ProjectileSystem.ts",
    "  private readonly active = new Map<number, ActiveProjectile>();\n  private readonly reservations = new Set<number>();\n",
    "  private readonly active = new Map<number, ActiveProjectile>();\n  private readonly reservations = new Set<number>();\n  private readonly clears: { center: THREE.Vector3; radius: number }[] = [];\n",
)
replace_once(
    "src/game/items/ProjectileSystem.ts",
    "  public update(dt: number, targets: readonly ProjectileTarget[]): ProjectileImpact[] {\n    if (!Number.isFinite(dt) || dt <= 0) return [];\n    const impacts: ProjectileImpact[] = [];\n",
    "  /** Queued Shockwave clears resolve before ordinary projectile movement/contact. */\n  public queueClearWithinRadius(center: THREE.Vector3, radius: number): void {\n    if (\n      finiteVector(center) &&\n      Number.isFinite(radius) &&\n      radius >= 0 &&\n      this.clears.length < MAX_ACTIVE_PROJECTILES\n    )\n      this.clears.push({ center: center.clone(), radius });\n  }\n\n  public update(dt: number, targets: readonly ProjectileTarget[]): ProjectileImpact[] {\n    if (!Number.isFinite(dt) || dt <= 0) return [];\n    this.resolveQueuedClears();\n    const impacts: ProjectileImpact[] = [];\n",
)
replace_once(
    "src/game/items/ProjectileSystem.ts",
    "  public remove(projectileId: number): boolean {\n",
    "  private resolveQueuedClears(): void {\n    for (const projectile of [...this.active.values()]) {\n      if (projectile.itemId !== 'kinetic-disc' && projectile.itemId !== 'seeker-drone') continue;\n      if (\n        this.clears.some(\n          ({ center, radius }) =>\n            center.distanceToSquared(projectile.group.position) <= radius * radius,\n        )\n      )\n        this.remove(projectile.id);\n    }\n    this.clears.length = 0;\n  }\n\n  public remove(projectileId: number): boolean {\n",
)
replace_once(
    "src/game/items/ProjectileSystem.ts",
    "    for (const id of this.reservations) this.capacity.release(id);\n    this.reservations.clear();\n    this.group.clear();\n",
    "    for (const id of this.reservations) this.capacity.release(id);\n    this.reservations.clear();\n    this.clears.length = 0;\n    this.group.clear();\n",
)


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------
replace_once(
    "src/game/items/ItemEffectDispatcher.ts",
    "import type { HazardSystem } from './HazardSystem';\n",
    "import type { HazardSystem } from './HazardSystem';\nimport type { ShockwaveSystem } from './ShockwaveSystem';\n",
)
replace_once(
    "src/game/items/ItemEffectDispatcher.ts",
    "export interface ItemEffectRuntime {\n  readonly hazardSystem?: HazardSystem;\n",
    "export interface ItemEffectRuntime {\n  readonly hazardSystem?: HazardSystem;\n  readonly shockwaveSystem?: ShockwaveSystem;\n",
)
replace_once(
    "src/game/items/ItemEffectDispatcher.ts",
    "  if (request.itemId === 'slick-trap') {\n",
    "  if (request.itemId === 'shockwave') {\n    if (runtime?.shockwaveSystem === undefined || runtime.projectileLaunch === undefined)\n      return 'unsupported';\n    return runtime.shockwaveSystem.activate(\n      racerId,\n      runtime.projectileLaunch.position,\n      () => itemSystem.commitUse(racerId),\n    )\n      ? 'activated'\n      : 'rejected';\n  }\n\n  if (request.itemId === 'slick-trap') {\n",
)


# ---------------------------------------------------------------------------
# Controller velocity authority
# ---------------------------------------------------------------------------
replace_once(
    "src/game/physics/KartController.ts",
    "  public applyArcadeCollisionImpulse(direction: THREE.Vector3, strength: number): void {\n    this.body.applyImpulse(\n      {\n        x: direction.x * strength,\n        y: 0,\n        z: direction.z * strength,\n      },\n      true,\n    );\n  }\n",
    "  public applyArcadeCollisionImpulse(direction: THREE.Vector3, strength: number): void {\n    this.body.applyImpulse(\n      {\n        x: direction.x * strength,\n        y: 0,\n        z: direction.z * strength,\n      },\n      true,\n    );\n  }\n\n  /** Adds an exact planar velocity delta without moving or rotating the kart. */\n  public addPlanarVelocityDelta(delta: THREE.Vector3): boolean {\n    if (![delta.x, delta.z].every(Number.isFinite)) return false;\n    const velocity = this.body.linvel();\n    this.body.setLinvel(\n      { x: velocity.x + delta.x, y: velocity.y, z: velocity.z + delta.z },\n      true,\n    );\n    return true;\n  }\n",
)


# ---------------------------------------------------------------------------
# Test-mode parser and bounded one-shot fixture
# ---------------------------------------------------------------------------
replace_once(
    "src/game/items/ItemTestMode.ts",
    "const ITEM_ID_SET = new Set<string>(ITEM_IDS);\n",
    "const ITEM_ID_SET = new Set<string>(ITEM_IDS);\n\nexport const SHOCKWAVE_COUNTER_TESTS = [\n  'racer',\n  'kinetic',\n  'seeker',\n  'slick',\n  'blast',\n  'apex',\n] as const;\nexport type ShockwaveCounterTest = (typeof SHOCKWAVE_COUNTER_TESTS)[number];\nconst SHOCKWAVE_COUNTER_TEST_SET = new Set<string>(SHOCKWAVE_COUNTER_TESTS);\n",
)
replace_once(
    "src/game/items/ItemTestMode.ts",
    "export function incomingSlickFromSearch(search: string): boolean {\n  return new URLSearchParams(search).get('testSlickAhead') === '1';\n}\n",
    "export function incomingSlickFromSearch(search: string): boolean {\n  return new URLSearchParams(search).get('testSlickAhead') === '1';\n}\n\nexport function shockwaveCounterFromSearch(search: string): ShockwaveCounterTest | null {\n  const value = new URLSearchParams(search).get('testShockwaveCounter');\n  return value !== null && SHOCKWAVE_COUNTER_TEST_SET.has(value)\n    ? (value as ShockwaveCounterTest)\n    : null;\n}\n",
)

write(
    "src/game/items/ShockwaveCounterFixture.ts",
    r'''import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { RacerProgress } from '../race/RaceDirector';
import type { ApexMissileSystem, ApexTarget } from './ApexMissileSystem';
import type { HazardSystem } from './HazardSystem';
import type { ShockwaveCounterTest } from './ItemTestMode';
import type { ProjectileSystem } from './ProjectileSystem';
import { ITEM_DEFINITIONS } from './itemDefinitions';

const FIXTURE_SECONDS = 5;

/** One-shot acceptance scenarios; no fixture reads or spends AI inventory. */
export class ShockwaveCounterFixture {
  private placed = false;

  public constructor(private readonly mode: ShockwaveCounterTest | null) {}

  public update(
    elapsed: number,
    playerFinished: boolean,
    playerPosition: THREE.Vector3,
    track: CircuitAlpha,
    projectiles: ProjectileSystem,
    hazards: HazardSystem,
    apex: ApexMissileSystem,
    racers: readonly RacerProgress[],
    targets: readonly ApexTarget[],
  ): void {
    if (this.mode === null || this.placed || playerFinished || elapsed < FIXTURE_SECONDS) return;
    if (this.mode === 'racer') {
      this.placed = true;
      return;
    }

    const projection = track.project(playerPosition);
    const length = track.curve.getLength();
    const positionAtOffset = (meters: number): THREE.Vector3 => {
      const progress = (projection.progress + meters / length + 1) % 1;
      return track.curve.getPointAt(progress);
    };
    const launchAtOffset = (meters: number) => {
      const progress = (projection.progress + meters / length + 1) % 1;
      return {
        position: track.curve.getPointAt(progress).setY(0.72),
        forward: track.curve.getTangentAt(progress),
        velocity: new THREE.Vector3(),
      };
    };

    if (this.mode === 'kinetic') {
      const config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
      if (config === undefined) return;
      this.placed =
        projectiles.spawn({
          itemId: 'kinetic-disc',
          ownerId: 'shockwave-counter-kinetic-fixture',
          direction: 'forward',
          config,
          launch: launchAtOffset(-8),
        }) !== null;
      return;
    }

    if (this.mode === 'seeker') {
      const config = ITEM_DEFINITIONS['seeker-drone'].projectile;
      if (config === undefined) return;
      this.placed =
        projectiles.spawn({
          itemId: 'seeker-drone',
          ownerId: 'shockwave-counter-seeker-fixture',
          targetId: 'player',
          direction: 'forward',
          config,
          launch: launchAtOffset(-18),
        }) !== null;
      return;
    }

    if (this.mode === 'slick') {
      this.placed =
        hazards.placeSlick('shockwave-counter-slick-fixture', positionAtOffset(3.5)) !== null;
      return;
    }

    if (this.mode === 'blast') {
      this.placed =
        hazards.placeBlastOrb('shockwave-counter-blast-fixture', positionAtOffset(3.5)) !== null;
      return;
    }

    const leader = racers.find((racer) => !racer.finished);
    if (leader === undefined || targets.every((target) => target.finished)) return;
    this.placed = apex.launch(
      'shockwave-counter-apex-fixture',
      launchAtOffset(-45).position,
      racers,
    );
  }

  public badge(): string {
    if (this.mode === null) return '';
    if (this.mode === 'racer') return 'SHOCKWAVE COUNTER · USE WITHIN 5m OF A RACER';
    if (this.mode === 'kinetic') return 'SHOCKWAVE COUNTER · ONE KINETIC AFTER 5s';
    if (this.mode === 'seeker') return 'SHOCKWAVE COUNTER · ONE SEEKER AFTER 5s';
    if (this.mode === 'slick') return 'SHOCKWAVE COUNTER · ONE SLICK 3.5m AHEAD AFTER 5s';
    if (this.mode === 'blast') return 'SHOCKWAVE COUNTER · ONE BLAST 3.5m AHEAD AFTER 5s';
    return 'SHOCKWAVE COUNTER · ONE APEX AFTER 5s · DRIVE INTO FIRST';
  }

  public reset(): void {
    this.placed = false;
  }
}
''',
)


# ---------------------------------------------------------------------------
# KartTimeTrial integration
# ---------------------------------------------------------------------------
replace_once(
    "src/game/KartTimeTrial.ts",
    "import { HazardSystem } from './items/HazardSystem';\n",
    "import { HazardSystem } from './items/HazardSystem';\nimport { ShockwaveSystem } from './items/ShockwaveSystem';\nimport { ShockwaveCounterFixture } from './items/ShockwaveCounterFixture';\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "  incomingBlastOrbFromSearch,\n  incomingSlickFromSearch,\n} from './items/ItemTestMode';\n",
    "  incomingBlastOrbFromSearch,\n  incomingSlickFromSearch,\n  shockwaveCounterFromSearch,\n} from './items/ItemTestMode';\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "  private readonly nitroSurgeVisual = new NitroSurgeVisual();\n  private readonly itemPhysicsCapacity = new ItemPhysicsCapacity();\n",
    "  private readonly nitroSurgeVisual = new NitroSurgeVisual();\n  private readonly shockwave = new ShockwaveSystem();\n  private readonly shockwaveCounterTest = shockwaveCounterFromSearch(window.location.search);\n  private readonly shockwaveCounterFixture = new ShockwaveCounterFixture(this.shockwaveCounterTest);\n  private readonly itemPhysicsCapacity = new ItemPhysicsCapacity();\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "      this.projectiles.group,\n      this.hazards.group,\n      this.seekerWarningVisual.group,\n",
    "      this.projectiles.group,\n      this.hazards.group,\n      this.shockwave.group,\n      this.seekerWarningVisual.group,\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "    this.hazards.dispose();\n    this.slickGround.dispose();\n    this.projectiles.dispose();\n",
    "    this.hazards.dispose();\n    this.slickGround.dispose();\n    this.projectiles.dispose();\n    this.shockwaveCounterFixture.reset();\n    this.shockwave.dispose();\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "    this.itemSystem.advance(dt);\n    this.racerEffects.advance(dt);\n    this.incomingSeekerFixture.update(\n",
    "    this.itemSystem.advance(dt);\n    this.racerEffects.advance(dt);\n    this.shockwave.advance(dt);\n    this.incomingSeekerFixture.update(\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "  private updateProjectiles(dt: number): void {\n    const targets = this.projectileTargets();\n    const racers = this.itemTargetingProgress();\n    const impacts = [\n",
    "  private updateProjectiles(dt: number): void {\n    const targets = this.projectileTargets();\n    const racers = this.itemTargetingProgress();\n    this.shockwaveCounterFixture.update(\n      this.elapsed,\n      this.playerProgress.finished,\n      this.kart.position(),\n      this.track,\n      this.projectiles,\n      this.hazards,\n      this.apex,\n      racers,\n      targets,\n    );\n    for (const pulse of this.shockwave.drainPulses()) {\n      const pushes = this.shockwave.dispatch(pulse, {\n        projectileSystem: this.projectiles,\n        hazardSystem: this.hazards,\n        apexSystem: this.apex,\n        targets,\n      });\n      for (const push of pushes) {\n        const controller =\n          push.targetId === 'player'\n            ? this.kart\n            : this.opponents.find((opponent) => opponent.id === push.targetId)?.controller;\n        controller?.addPlanarVelocityDelta(push.velocityDelta);\n      }\n    }\n    const impacts = [\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "        hazardSystem: this.hazards,\n        projectileLaunch: {\n",
    "        hazardSystem: this.hazards,\n        shockwaveSystem: this.shockwave,\n        projectileLaunch: {\n",
)
replace_once(
    "src/game/KartTimeTrial.ts",
    "          this.incomingBlastTest ? 'ONE BLAST ORB AHEAD AFTER 5s' : '',\n        ]\n",
    "          this.incomingBlastTest ? 'ONE BLAST ORB AHEAD AFTER 5s' : '',\n          this.shockwaveCounterFixture.badge(),\n        ]\n",
)


# ---------------------------------------------------------------------------
# Automated tests
# ---------------------------------------------------------------------------
write(
    "tests/shockwave.test.ts",
    r'''import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { executeItemUse } from '../src/game/items/ItemEffectDispatcher';
import { ItemPhysicsCapacity } from '../src/game/items/ItemPhysicsCapacity';
import { ItemSystem } from '../src/game/items/ItemSystem';
import { ProjectileSystem, type ProjectileTarget } from '../src/game/items/ProjectileSystem';
import { RacerEffects } from '../src/game/items/RacerEffects';
import {
  ShockwaveSystem,
  shockwavePushDelta,
  type ShockwavePulse,
  type ShockwaveTarget,
} from '../src/game/items/ShockwaveSystem';
import { HazardSystem } from '../src/game/items/HazardSystem';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { shockwaveCounterFromSearch } from '../src/game/items/ItemTestMode';
import { ShockwaveCounterFixture } from '../src/game/items/ShockwaveCounterFixture';
import { ApexMissileSystem } from '../src/game/items/ApexMissileSystem';

function launch(track: CircuitAlpha, progress = 0.2) {
  return {
    position: track.curve.getPointAt(progress).setY(0.72),
    forward: track.curve.getTangentAt(progress),
    velocity: new THREE.Vector3(),
  };
}

function target(
  id: string,
  position: THREE.Vector3,
  overrides: Partial<ShockwaveTarget> = {},
): ShockwaveTarget {
  return { id, position, finished: false, ...overrides };
}

describe('Acoustic Shockwave Pulse', () => {
  it.each(['forward', 'backward'] as const)(
    'commits one charge for %s intent even with no target and queues one centered pulse',
    (direction) => {
      const track = new CircuitAlpha();
      const items = new ItemSystem();
      const effects = new RacerEffects();
      const shockwave = new ShockwaveSystem();
      expect(items.acquire('player', 'shockwave')).toBe(true);
      items.advance(1);
      const origin = launch(track).position;
      expect(
        executeItemUse(items, effects, 'player', direction, {
          shockwaveSystem: shockwave,
          projectileLaunch: {
            position: origin,
            forward: new THREE.Vector3(0, 0, 1),
            velocity: new THREE.Vector3(),
          },
        }),
      ).toBe('activated');
      expect(items.heldItem('player')).toBeNull();
      const pulses = shockwave.drainPulses();
      expect(pulses).toHaveLength(1);
      expect(pulses[0]?.center).toEqual(origin);
      expect(shockwave.visualCount()).toBe(1);
      shockwave.dispose();
    },
  );

  it('uses exact governed horizontal push falloff and deterministic finite coincident fallback', () => {
    const pulse: ShockwavePulse = { ownerId: 'owner', center: new THREE.Vector3() };
    const center = shockwavePushDelta(pulse, target('center', new THREE.Vector3()));
    const mid = shockwavePushDelta(pulse, target('mid', new THREE.Vector3(2.5, 100, 0)));
    const edge = shockwavePushDelta(pulse, target('edge', new THREE.Vector3(5, -100, 0)));
    expect(center?.length()).toBeCloseTo(6, 8);
    expect(mid?.length()).toBeCloseTo(4, 8);
    expect(edge?.length()).toBeCloseTo(2, 8);
    expect(center?.toArray().every(Number.isFinite)).toBe(true);
    expect(shockwavePushDelta(pulse, target('center', new THREE.Vector3()))).toEqual(center);
    expect(shockwavePushDelta(pulse, target('outside', new THREE.Vector3(5.0001, 0, 0)))).toBeNull();
    expect(shockwavePushDelta(pulse, target('owner', new THREE.Vector3(1, 0, 0)))).toBeNull();
    expect(
      shockwavePushDelta(
        pulse,
        target('finished', new THREE.Vector3(1, 0, 0), { finished: true }),
      ),
    ).toBeNull();
    expect(
      shockwavePushDelta(
        pulse,
        target('immune', new THREE.Vector3(1, 0, 0), { itemImmune: true }),
      ),
    ).toBeNull();
  });

  it('queues all three counter boundaries at 5m and returns only eligible racer pushes', () => {
    const calls: string[] = [];
    const shockwave = new ShockwaveSystem();
    const pulse: ShockwavePulse = { ownerId: 'owner', center: new THREE.Vector3(1, 2, 3) };
    const pushes = shockwave.dispatch(pulse, {
      projectileSystem: {
        queueClearWithinRadius: (center, radius) => calls.push(`p:${center.x}:${radius}`),
      },
      hazardSystem: {
        queueClearWithinRadius: (center, radius) => calls.push(`h:${center.x}:${radius}`),
      },
      apexSystem: { queueCounterPulse: (center) => calls.push(`a:${center.x}`) },
      targets: [
        target('inside', new THREE.Vector3(4, 500, 3)),
        target('owner', new THREE.Vector3(2, 2, 3)),
        target('outside', new THREE.Vector3(6.001, 2, 3)),
      ],
    });
    expect(calls).toEqual(['p:1:5', 'h:1:5', 'a:1']);
    expect(pushes.map(({ targetId }) => targetId)).toEqual(['inside']);
    expect(pushes[0]?.velocityDelta.y).toBe(0);
  });

  it('clears Kinetic and Seeker before movement while preserving outside ordinary projectiles and capacity', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const projectiles = new ProjectileSystem(track, capacity);
    const kinetic = ITEM_DEFINITIONS['kinetic-disc'].projectile;
    const seeker = ITEM_DEFINITIONS['seeker-drone'].projectile;
    expect(kinetic).toBeDefined();
    expect(seeker).toBeDefined();
    if (kinetic === undefined || seeker === undefined) return;

    const insideId = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner-a',
      direction: 'forward',
      config: kinetic,
      launch: launch(track, 0.2),
    });
    const outsideId = projectiles.spawn({
      itemId: 'kinetic-disc',
      ownerId: 'owner-b',
      direction: 'forward',
      config: kinetic,
      launch: launch(track, 0.45),
    });
    expect(insideId).not.toBeNull();
    expect(outsideId).not.toBeNull();
    const inside = projectiles.snapshots().find(({ id }) => id === insideId);
    expect(inside).toBeDefined();
    if (inside === undefined) return;
    projectiles.queueClearWithinRadius(inside.position, 5);
    expect(projectiles.update(1 / 60, [])).toEqual([]);
    expect(projectiles.snapshots().some(({ id }) => id === insideId)).toBe(false);
    expect(projectiles.snapshots().some(({ id }) => id === outsideId)).toBe(true);

    const seekerId = projectiles.spawn({
      itemId: 'seeker-drone',
      ownerId: 'owner-c',
      targetId: 'target',
      direction: 'forward',
      config: seeker,
      launch: launch(track, 0.6),
    });
    expect(seekerId).not.toBeNull();
    const seekerSnapshot = projectiles.snapshots().find(({ id }) => id === seekerId);
    expect(seekerSnapshot).toBeDefined();
    if (seekerSnapshot === undefined) return;
    const targetSnapshot: ProjectileTarget = {
      id: 'target',
      position: seekerSnapshot.position.clone().add(new THREE.Vector3(25, 0, 0)),
      velocity: new THREE.Vector3(),
      forward: new THREE.Vector3(0, 0, 1),
      finished: false,
    };
    projectiles.queueClearWithinRadius(seekerSnapshot.position, 5);
    expect(projectiles.update(1 / 60, [targetSnapshot])).toEqual([]);
    expect(projectiles.snapshots().some(({ id }) => id === seekerId)).toBe(false);
    expect(capacity.count()).toBe(1);
    projectiles.dispose();
    expect(capacity.count()).toBe(0);
  });

  it('lets a queued hazard clear win the same frame over Slick trigger and preserves outside hazard', () => {
    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const hazards = new HazardSystem(track, capacity);
    const center = track.curve.getPointAt(0.3);
    const inside = hazards.placeSlick('owner', center.clone());
    const outside = hazards.placeSlick('other', center.clone().add(new THREE.Vector3(0, 0, 5.001)));
    expect(inside).not.toBeNull();
    expect(outside).not.toBeNull();
    const actual = hazards.slickSnapshots().find(({ id }) => id === inside)?.position;
    expect(actual).toBeDefined();
    if (actual === undefined) return;
    hazards.queueClearWithinRadius(actual, 5);
    const overlapping: ProjectileTarget = {
      id: 'rival',
      position: actual.clone(),
      velocity: new THREE.Vector3(),
      forward: new THREE.Vector3(0, 0, 1),
      finished: false,
    };
    expect(hazards.update(0.01, [overlapping])).toEqual([]);
    expect(hazards.slickSnapshots().some(({ id }) => id === inside)).toBe(false);
    expect(hazards.slickSnapshots().some(({ id }) => id === outside)).toBe(true);
  });

  it('parses only approved explicit counter fixture values and fixture placement is one-shot', () => {
    expect(shockwaveCounterFromSearch('?testShockwaveCounter=kinetic')).toBe('kinetic');
    expect(shockwaveCounterFromSearch('?testShockwaveCounter=bogus')).toBeNull();
    expect(shockwaveCounterFromSearch('')).toBeNull();

    const track = new CircuitAlpha();
    const capacity = new ItemPhysicsCapacity();
    const projectiles = new ProjectileSystem(track, capacity);
    const hazards = new HazardSystem(track, capacity);
    const apex = new ApexMissileSystem(track, projectiles);
    const fixture = new ShockwaveCounterFixture('slick');
    const player = track.curve.getPointAt(0.4).setY(0.72);
    const racers = [
      { id: 'player', lap: 0, trackProgress: 0.4, finished: false, finishTime: null, finishPlace: null },
      { id: 'rival', lap: 0, trackProgress: 0.5, finished: false, finishTime: null, finishPlace: null },
    ];
    const targets: ProjectileTarget[] = [
      {
        id: 'player',
        position: player,
        velocity: new THREE.Vector3(),
        forward: track.curve.getTangentAt(0.4),
        finished: false,
      },
    ];
    fixture.update(4.99, false, player, track, projectiles, hazards, apex, racers, targets);
    expect(hazards.activeCount()).toBe(0);
    fixture.update(5, false, player, track, projectiles, hazards, apex, racers, targets);
    fixture.update(10, false, player, track, projectiles, hazards, apex, racers, targets);
    expect(hazards.activeCount()).toBe(1);
    expect(fixture.badge()).toContain('ONE SLICK');
  });

  it('keeps pulse VFX finite and reset/disposal clears pending and presentation state', () => {
    const system = new ShockwaveSystem();
    expect(system.activate('player', new THREE.Vector3(0, 1, 0))).toBe(true);
    expect(system.pendingCount()).toBe(1);
    expect(system.visualCount()).toBe(1);
    system.advance(0.2);
    expect(system.visualCount()).toBe(1);
    system.advance(1);
    expect(system.visualCount()).toBe(0);
    expect(system.pendingCount()).toBe(1);
    system.reset();
    expect(system.pendingCount()).toBe(0);
    expect(system.visualCount()).toBe(0);
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });
});
''',
)

replace_once(
    "tests/kart-controller-effects.test.ts",
    "  it('reflects outward barrier velocity and retains bounded tangential speed', () => {\n",
    "  it('adds an exact finite planar velocity delta without moving, rotating, or changing vertical velocity', () => {\n    const { world, kart } = makeKart();\n    kart.applyArcadeCollisionImpulse(new Vector3(0.2, 0, 1), 8);\n    const beforePosition = kart.position();\n    const beforeForward = kart.forward();\n    const beforeVelocity = kart.velocity();\n    expect(kart.addPlanarVelocityDelta(new Vector3(3.5, 99, -1.25))).toBe(true);\n    const after = kart.velocity();\n    expect(after.x).toBeCloseTo(beforeVelocity.x + 3.5, 8);\n    expect(after.z).toBeCloseTo(beforeVelocity.z - 1.25, 8);\n    expect(after.y).toBe(beforeVelocity.y);\n    expect(kart.position()).toEqual(beforePosition);\n    expect(kart.forward()).toEqual(beforeForward);\n    expect(kart.addPlanarVelocityDelta(new Vector3(Number.NaN, 0, 1))).toBe(false);\n    expect(kart.velocity()).toEqual(after);\n    world.free();\n  });\n\n  it('reflects outward barrier velocity and retains bounded tangential speed', () => {\n",
)


# ---------------------------------------------------------------------------
# Continuity docs: implementation authorized, not yet live accepted.
# ---------------------------------------------------------------------------
replace_once(
    "docs/SLICE-5-SHOCKWAVE-SCOPE.md",
    "**Status: APPROVED FOR IMPLEMENTATION; GAMEPLAY GATED UNTIL THIS GOVERNANCE CHECKPOINT MERGES AND POST-MERGE CI/PAGES PASSES.**",
    "**Status: GOVERNANCE MERGED / GAMEPLAY IMPLEMENTATION AUTHORIZED; PUBLICATION AND LIVE ACCEPTANCE PENDING.**",
)
replace_once(
    "docs/SLICE-5-SHOCKWAVE-SCOPE.md",
    "Gameplay implementation may begin only after this documentation checkpoint merges to `main` and its post-merge CI/Pages run passes. Gameplay publication/deployment and live acceptance remain later separate gates. No other item effect is authorized by this scope.",
    "Governance PR #125 squash-merged to `main` at `0825ed02f80a67e088416d2d55925309e38eabe5`; post-merge CI/Pages run `34177188784` passed validation and deployment. The gameplay gate is therefore cleared for `feature/slice-5-shockwave`. Gameplay publication/deployment and live acceptance remain later separate gates. No other item effect is authorized by this scope.",
)
replace_once(
    "docs/IMPLEMENTATION-STATUS.md",
    "This governance checkpoint changes no gameplay source. It does not enable AI item acquisition/use, change item probabilities, alter racer stats, track/checkpoint authority, accepted Nitro/Kinetic/Seeker/Apex/Blast/Slick behavior outside the new counter interaction, or begin Slice 6. The gameplay implementation is gated until this documentation checkpoint merges to `main` and its post-merge CI/Pages run passes.",
    "Governance PR #125 squash-merged to `main` at `0825ed02f80a67e088416d2d55925309e38eabe5`; post-merge CI/Pages run `34177188784` passed validation and deployment, clearing the gameplay gate. Implementation is proceeding on `feature/slice-5-shockwave` and remains unpublished / not live accepted until its own hosted validation, review, approved merge/deployment, and deployed eight-check gate pass. This increment does not enable AI item acquisition/use, change item probabilities, alter racer stats, track/checkpoint authority, or begin Slice 6.",
)
replace_once(
    "docs/IMPLEMENTATION-STATUS.md",
    "Review and merge the approved Shockwave governance checkpoint after clean-install CI passes. After its post-merge CI/Pages run succeeds, implement only the bounded Acoustic Shockwave Pulse contract in `docs/SLICE-5-SHOCKWAVE-SCOPE.md` on a dedicated gameplay branch, preserving all accepted item behavior and the live-accepted Slick/Blast AI hazard response. Gameplay publication/deployment and live acceptance remain separate gates.",
    "Review the bounded Acoustic Shockwave Pulse gameplay implementation on `feature/slice-5-shockwave` after clean-install CI passes. Confirm the diff contains only the approved Shockwave/counter/fixture/test integration and continuity updates. Merge/deployment and the deployed eight-check live gate remain separate approvals; do not start another item until Shockwave is live accepted.",
)
