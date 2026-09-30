import { SfxBank } from './SfxBank';
import { audioMixer } from './AudioMixer';
import manifest from '../../assets/audio/sfx-review-v1/manifest.json';
/** Four UI voices leave room for race audio and the existing Prismatic music layer. */
export const uiSfx = new SfxBank(audioMixer, undefined, 4);
export function preloadUiSfx(): void {
  uiSfx.preload(manifest.cues.filter((c) => c.group === '04-menus-results').map((c) => c.id));
}

// One application-lifetime listener also covers menu/results sounds outside a race.
if (typeof document !== 'undefined') {
  const syncVisibility = (): void => {
    uiSfx.setPaused(document.hidden);
  };
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
}
