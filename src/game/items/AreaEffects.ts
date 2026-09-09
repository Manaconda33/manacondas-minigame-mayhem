import type { ItemId } from './itemDefinitions';
import type { Vector3 } from 'three';

export interface AreaEffectTarget {
  readonly id: string;
  readonly position: Vector3;
  readonly finished: boolean;
  readonly itemImmune?: boolean;
  readonly onItemContact?: (itemId: ItemId, blocked: boolean, objectId?: number) => void;
}

export function finitePosition(position: Vector3): boolean {
  return [position.x, position.y, position.z].every(Number.isFinite);
}

/** One result per racer, center-based horizontal blast; immunity is per victim. */
export function areaEffectVictims<T extends AreaEffectTarget>(
  center: Vector3,
  radius: number,
  targets: readonly T[],
  itemId?: ItemId,
  objectId?: number,
): T[] {
  if (!finitePosition(center) || !Number.isFinite(radius) || radius < 0) return [];
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.id) || target.finished || !finitePosition(target.position)) return false;
    const dx = target.position.x - center.x;
    const dz = target.position.z - center.z;
    if (dx * dx + dz * dz > radius * radius) return false;
    seen.add(target.id);
    if (itemId) target.onItemContact?.(itemId, target.itemImmune === true, objectId);
    return !target.itemImmune;
  });
}
