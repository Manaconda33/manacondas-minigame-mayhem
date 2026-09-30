import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, expect, it } from 'vitest';
import { arcRuntimeRig } from './arc-runtime-rig';
import { RaceSfx } from '../src/audio/RaceSfx';
import { SfxBank } from '../src/audio/SfxBank';
import { AudioMixer } from '../src/audio/AudioMixer';

beforeAll(async () => {
  await RAPIER.init();
});
it('production ITEM routing sounds only committed boost use, with rejection feedback preserving inventory', () => {
  const rig = arcRuntimeRig();
  const heard: string[] = [];
  const audio = new RaceSfx(
    new SfxBank(new AudioMixer(() => undefined), (url) => ({
      play: () => {
        heard.push(url.split('/').at(-1)?.split('.wav')[0] ?? '');
        return heard.length;
      },
      stop: () => undefined,
      volume: () => undefined,
      rate: () => undefined,
      pos: () => undefined,
      loop: () => undefined,
      once: () => undefined,
      unload: () => undefined,
    })),
    () => undefined,
  );
  Object.assign(rig.game, { raceAudio: audio });
  try {
    rig.itemSystem.acquire('player', 'nitro-surge');
    rig.itemSystem.advance(1);
    rig.game.requestPlayerItemUse();
    expect(heard).toContain('nitro-surge-activate');
    expect(rig.itemSystem.heldItem('player')).toBeNull();
    rig.itemSystem.acquire('player', 'seeker-drone');
    rig.itemSystem.advance(1);
    const rival = rig.opponents[0];
    if (!rival) throw new Error('Missing runtime rig rival');
    rival.progress.trackProgress = rig.playerProgress.trackProgress - 0.1;
    rig.game.requestPlayerItemUse();
    expect(heard).toContain('item-unavailable');
    expect(heard).not.toContain('seeker-launch');
    expect(rig.itemSystem.heldItem('player')?.itemId).toBe('seeker-drone');
  } finally {
    audio.dispose();
    rig.dispose();
  }
});
