import { expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { bloomEmission } from '../src/game/rendering/bloomEligibility';
import { DriftVisual } from '../src/game/vfx/DriftVisual';
import { ExhaustVisual } from '../src/game/vfx/ExhaustVisual';
import { WheelDustVisual } from '../src/game/vfx/WheelDustVisual';
import { PlayerSpeedVisual } from '../src/game/vfx/PlayerSpeedVisual';
import { NitroSurgeVisual } from '../src/game/items/NitroSurgeVisual';
import { NitroOverdriveVisual } from '../src/game/items/NitroOverdriveVisual';
import { HyperDriveRocketVisual } from '../src/game/items/HyperDriveRocketVisual';
import { PrismaticVisual } from '../src/game/items/PrismaticVisual';
import { ArcBladeVisual } from '../src/game/items/ArcBladeVisual';
import { ArcHammerVisual } from '../src/game/items/ArcHammerVisual';
import { ApexPresentation } from '../src/game/items/ApexPresentation';
import { frostCrystal } from '../src/game/items/FrostVisual';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { createTrackScene } from '../src/game/track/createTrackScene';
vi.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation(() => new THREE.Texture());
function materials(group: THREE.Object3D): THREE.Material[] {
  const list: THREE.Material[] = [];
  group.traverse((node) => {
    if ('material' in node) {
      const value = node.material as THREE.Material | THREE.Material[];
      list.push(...(Array.isArray(value) ? value : [value]));
    }
  });
  return list;
}
it('selects player and shared AI effect energy while leaving dust speed lines and solid bodies clear', () => {
  const selected = [
    new DriftVisual('medium'),
    new ExhaustVisual('medium'),
    new NitroSurgeVisual(),
    new NitroOverdriveVisual(),
    new HyperDriveRocketVisual(),
    new PrismaticVisual(),
    new ArcBladeVisual(),
    new ArcHammerVisual(),
    new ApexPresentation(),
  ];
  for (const visual of selected) {
    expect(
      materials(
        'group' in visual ? visual.group : 'blade' in visual ? visual.blade : visual.hammer,
      ).filter((m) => bloomEmission(m) !== null).length,
    ).toBeGreaterThan(0);
    visual.dispose();
  }
  const dust = new WheelDustVisual('medium'),
    speed = new PlayerSpeedVisual(new THREE.PerspectiveCamera(62), 'medium');
  expect(materials(dust.group).every((m) => bloomEmission(m) === null)).toBe(true);
  expect(materials(speed.group).every((m) => bloomEmission(m) === null)).toBe(true);
  const prismatic = new PrismaticVisual();
  expect(bloomEmission(prismatic.shell.material)).toBeNull();
  prismatic.dispose();
  dust.dispose();
  speed.dispose();
  expect(bloomEmission(frostCrystal(0.2).material as THREE.Material)).toBe('color');
});
it('glows boost chevrons without selecting road base or scenery', () => {
  const scene = createTrackScene(new CircuitAlpha());
  const boost =
    scene.getObjectByName('boost-pad-0.450') ??
    scene.children.find((c) => c.name.startsWith('boost-pad-'));
  if (!boost) throw new Error('Missing boost pad');
  const base = boost.children[0] as THREE.Mesh;
  expect(bloomEmission(base.material as THREE.Material)).toBeNull();
  expect(materials(boost).filter((m) => bloomEmission(m) === 'emissive').length).toBe(5);
  const road = scene.getObjectByName('track-road') as THREE.Mesh;
  expect(bloomEmission(road.material as THREE.Material)).toBeNull();
});
