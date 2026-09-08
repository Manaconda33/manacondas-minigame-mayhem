import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { HazardSystem } from '../items/HazardSystem';
import { hazardRoutePosition } from './AiHazardAwareness';

export type AiHazardTestKind = 'slick' | 'blast';
export interface AiHazardFixtureTarget {
  readonly id: string;
  readonly name: string;
  readonly position: THREE.Vector3;
  readonly finished: boolean;
}

export function aiHazardTestFromSearch(search: string): AiHazardTestKind | null {
  const value = new URLSearchParams(search).get('testAiHazardAvoidance');
  return value === 'slick' || value === 'blast' ? value : null;
}

/** One real hazard per race; no inventory or tactical-item side effects. */
export class AiHazardFixture {
  private targetName: string | null = null;
  public constructor(private readonly kind: AiHazardTestKind | null) {}

  public update(
    elapsed: number,
    targets: readonly AiHazardFixtureTarget[],
    track: CircuitAlpha,
    hazards: HazardSystem,
  ): void {
    if (this.kind === null || this.targetName !== null || !Number.isFinite(elapsed) || elapsed < 5)
      return;
    const target = targets.find((racer) => !racer.finished);
    if (target === undefined) return;
    const route = hazardRoutePosition(track, target.position);
    const progress = ((route.distance + 12) / track.curve.getLength()) % 1;
    const tangent = track.curve.getTangentAt(progress);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const position = track.curve.getPointAt(progress).addScaledVector(right, route.lateralOffset);
    const id =
      this.kind === 'slick'
        ? hazards.placeSlick('ai-hazard-fixture', position)
        : hazards.placeBlastOrb('ai-hazard-fixture', position);
    if (id !== null) this.targetName = target.name;
  }

  public badge(): string {
    return this.kind === null
      ? ''
      : `AI HAZARD TEST · ${this.kind.toUpperCase()} · ${this.targetName ?? 'WAITING FOR AI'}`;
  }

  public reset(): void {
    this.targetName = null;
  }
}
