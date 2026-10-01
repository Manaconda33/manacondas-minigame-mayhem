import { expect, it } from 'vitest';
import * as THREE from 'three';
import {
  bloomDisabledFromSearch,
  bloomEmission,
  markBloomMaterial,
} from '../src/game/rendering/bloomEligibility';
it('selects only explicitly marked materials without changing their rendering', () => {
  const m = new THREE.MeshStandardMaterial({ color: 0xffeeff, emissive: 0xffffff, opacity: 0.4 });
  const unselected = m.clone();
  markBloomMaterial(m, 'emissive');
  expect(bloomEmission(m)).toBe('emissive');
  expect(bloomEmission(unselected)).toBeNull();
  expect(m.color.getHex()).toBe(0xffeeff);
  expect(m.opacity).toBe(0.4);
  const energy = markBloomMaterial(new THREE.MeshBasicMaterial(), 'color');
  expect(bloomEmission(energy)).toBe('color');
});

it('allows a nonpersistent bloom-off comparison only in explicit race diagnostics', () => {
  expect(bloomDisabledFromSearch('?testRacePerf=1&testBloom=off')).toBe(true);
  for (const query of [
    '',
    '?testBloom=off',
    '?testRacePerf=true&testBloom=off',
    '?testRacePerf=1&testBloom=false',
  ])
    expect(bloomDisabledFromSearch(query)).toBe(false);
});
