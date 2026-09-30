/** Multi-charge families reuse their approved sound signatures. */
export const ITEM_SOUND_FAMILY: Readonly<Record<string, string>> = {
  'nitro-surge': 'nitro-surge',
  'nitro-surge-triple': 'nitro-surge',
  'kinetic-disc': 'kinetic-disc',
  'kinetic-disc-triple': 'kinetic-disc',
  'seeker-drone': 'seeker',
  'apex-missile': 'apex',
  'blast-orb': 'blast-orb',
  'slick-trap': 'slick',
  shockwave: 'shockwave',
  'prismatic-invincibility': 'prismatic',
  'blaze-orbs': 'blaze',
  'frost-orbs': 'frost',
  'arc-blade': 'arc-blade',
  'arc-hammers': 'arc-hammer',
  'ink-splat': 'ink',
  'nitro-overdrive': 'overdrive',
  'hyper-drive-rocket': 'rocket',
};
export function itemActivationCue(itemId: string): string | undefined {
  const family = ITEM_SOUND_FAMILY[itemId];
  if (!family) return;
  const suffix = [
    'kinetic-disc',
    'seeker',
    'apex',
    'blaze',
    'frost',
    'arc-blade',
    'arc-hammer',
  ].includes(family)
    ? 'launch'
    : ['slick', 'blast-orb'].includes(family)
      ? 'deploy'
      : 'activate';
  return `${family}-${suffix}`;
}
export function itemImpactCue(itemId: string): string | undefined {
  const family = ITEM_SOUND_FAMILY[itemId];
  if (!family) return;
  return `${family}-${family === 'arc-hammer' ? 'hit' : family === 'slick' ? 'trigger-skid' : family === 'apex' || family === 'blast-orb' ? 'explosion' : 'impact'}`;
}
export function itemTravelCue(itemId: string): string | undefined {
  const family = ITEM_SOUND_FAMILY[itemId];
  return family && ['kinetic-disc', 'seeker', 'blaze', 'frost', 'arc-blade'].includes(family)
    ? `${family}-${family === 'arc-blade' ? 'flight' : 'travel'}-loop`
    : undefined;
}
