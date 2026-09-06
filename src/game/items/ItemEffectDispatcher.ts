import { ITEM_DEFINITIONS } from './itemDefinitions';
import { ItemSystem, type ItemUseDirection } from './ItemSystem';
import { ProjectileSystem, type ProjectileLaunchContext } from './ProjectileSystem';
import { RacerEffects } from './RacerEffects';

export type ItemUseResolution = 'rejected' | 'unsupported' | 'activated';

export interface ItemEffectRuntime {
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

  const definition = ITEM_DEFINITIONS[request.itemId];
  const projectile = definition.projectile;
  if (projectile !== undefined) {
    const projectileSystem = runtime?.projectileSystem;
    const launch = runtime?.projectileLaunch;
    if (projectileSystem === undefined || launch === undefined) return 'unsupported';

    const projectileId = projectileSystem.spawn({
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
