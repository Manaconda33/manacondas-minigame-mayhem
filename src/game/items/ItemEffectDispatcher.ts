import type { HazardSystem } from './HazardSystem';
import type { ApexMissileSystem } from './ApexMissileSystem';
import { nearestRacerAhead } from './ItemTargeting';
import type { RacerProgress } from '../race/RaceDirector';
import { ITEM_DEFINITIONS } from './itemDefinitions';
import { ItemSystem, type ItemUseDirection } from './ItemSystem';
import { ProjectileSystem, type ProjectileLaunchContext } from './ProjectileSystem';
import { RacerEffects } from './RacerEffects';

export type ItemUseResolution = 'rejected' | 'unsupported' | 'activated';

export interface ItemEffectRuntime {
  readonly hazardSystem?: HazardSystem;
  readonly apexSystem?: ApexMissileSystem;
  readonly racers?: readonly RacerProgress[];
  readonly projectileSystem?: ProjectileSystem;
  readonly projectileLaunch?: ProjectileLaunchContext;
}

export function executeItemUse(
  itemSystem: ItemSystem,
  racerEffects: RacerEffects,
  racerId: string,
  direction: ItemUseDirection,
  runtime?: ItemEffectRuntime,
): ItemUseResolution {
  const request = itemSystem.requestUse(racerId, direction);
  if (request === null) return 'rejected';

  if (request.itemId === 'slick-trap') {
    if (runtime?.hazardSystem === undefined || runtime.projectileLaunch === undefined)
      return 'unsupported';
    return runtime.hazardSystem.spawnSlick(racerId, runtime.projectileLaunch, () =>
      itemSystem.commitUse(racerId),
    ) !== null
      ? 'activated'
      : 'rejected';
  }

  if (request.itemId === 'blast-orb') {
    if (runtime?.hazardSystem === undefined || runtime.projectileLaunch === undefined)
      return 'unsupported';
    return runtime.hazardSystem.spawnBlastOrb(
      racerId,
      request.direction,
      runtime.projectileLaunch,
      () => itemSystem.commitUse(racerId),
    ) !== null
      ? 'activated'
      : 'rejected';
  }

  if (request.itemId === 'apex-missile') {
    if (runtime?.apexSystem === undefined || runtime.projectileLaunch === undefined)
      return 'unsupported';
    return runtime.apexSystem.launch(
      racerId,
      runtime.projectileLaunch.position,
      runtime.racers ?? [],
      () => itemSystem.commitUse(racerId),
    )
      ? 'activated'
      : 'rejected';
  }

  const definition = ITEM_DEFINITIONS[request.itemId];
  const projectile = definition.projectile;
  if (projectile !== undefined) {
    const projectileSystem = runtime?.projectileSystem;
    const launch = runtime?.projectileLaunch;
    if (projectileSystem === undefined || launch === undefined) return 'unsupported';

    const target =
      request.itemId === 'seeker-drone' ? nearestRacerAhead(racerId, runtime?.racers ?? []) : null;
    if (request.itemId === 'seeker-drone' && target === null) return 'rejected';
    const projectileId = projectileSystem.spawn({
      targetId: target?.id,
      itemId: request.itemId,
      ownerId: racerId,
      direction: request.direction,
      config: projectile,
      launch,
    });
    if (projectileId === null) return 'rejected';
    if (itemSystem.commitUse(racerId)) return 'activated';

    projectileSystem.remove(projectileId);
    return 'rejected';
  }

  const boost = definition.boost;
  if (boost === undefined) return 'unsupported';

  const activated = racerEffects.activateTemporaryBoost(racerId, {
    id: request.itemId,
    label: definition.displayName,
    ...boost,
  });
  if (!activated) return 'rejected';

  if (itemSystem.commitUse(racerId)) return 'activated';

  racerEffects.clearTemporaryBoost(racerId, request.itemId);
  return 'rejected';
}
