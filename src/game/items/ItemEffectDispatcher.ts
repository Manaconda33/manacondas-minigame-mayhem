import { ITEM_DEFINITIONS } from './itemDefinitions';
import { ItemSystem, type ItemUseDirection } from './ItemSystem';
import { RacerEffects } from './RacerEffects';

export type ItemUseResolution = 'rejected' | 'unsupported' | 'activated';

export function executeItemUse(
  itemSystem: ItemSystem,
  racerEffects: RacerEffects,
  racerId: string,
  direction: ItemUseDirection,
): ItemUseResolution {
  const request = itemSystem.requestUse(racerId, direction);
  if (request === null) return 'rejected';

  const definition = ITEM_DEFINITIONS[request.itemId];
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
