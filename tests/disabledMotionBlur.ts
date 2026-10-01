import type { WebGLRenderer } from 'three';
import { RaceMotionBlur } from '../src/game/rendering/RaceMotionBlur';

/** Item-runtime rigs omit GPU startup; Low owns no renderer resources. */
export function disabledMotionBlur(): RaceMotionBlur {
  return new RaceMotionBlur({} as WebGLRenderer, 'low');
}
