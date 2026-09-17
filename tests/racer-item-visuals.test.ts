import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { RacerItemVisuals } from '../src/game/items/RacerItemVisuals';

describe('racer-owned item visuals', () => {
  it('reuses boost and Prismatic presentation for a non-player racer and cleans it up', () => {
    const visuals = new RacerItemVisuals();
    visuals.update(
      {
        nitroSurgeActive: true,
        nitroOverdrive: {
          active: true,
          windowRemainingSeconds: 5,
          pulseRemainingSeconds: 0.8,
          nextPulseRemainingSeconds: 0,
        },
        hyperDriveRocket: {
          active: true,
          phase: 'autopilot',
          windowRemainingSeconds: 5,
          returnBlendRemainingSeconds: 0,
          autopilotWeight: 1,
        },
        prismaticRemainingSeconds: 5,
        position: new THREE.Vector3(3, 0, 4),
      },
      1,
      1 / 60,
    );

    expect(visuals.localGroup.children).toHaveLength(3);
    expect(visuals.localGroup.children.every((child) => child.visible)).toBe(true);
    expect(visuals.worldGroup.children[0]?.visible).toBe(true);

    visuals.update(
      {
        nitroSurgeActive: false,
        nitroOverdrive: {
          active: false,
          windowRemainingSeconds: 0,
          pulseRemainingSeconds: 0,
          nextPulseRemainingSeconds: 0,
        },
        hyperDriveRocket: {
          active: false,
          phase: 'inactive',
          windowRemainingSeconds: 0,
          returnBlendRemainingSeconds: 0,
          autopilotWeight: 0,
        },
        prismaticRemainingSeconds: 0,
        position: new THREE.Vector3(),
      },
      2,
      1 / 60,
    );

    expect(visuals.localGroup.children.every((child) => !child.visible)).toBe(true);
    expect(visuals.worldGroup.children[0]?.visible).toBe(false);
    visuals.dispose();
  });
});
