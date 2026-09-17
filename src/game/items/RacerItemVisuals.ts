import * as THREE from 'three';
import type { HyperDriveRocketSnapshot } from './HyperDriveRocket';
import { HyperDriveRocketVisual } from './HyperDriveRocketVisual';
import type { NitroOverdriveSnapshot } from './NitroOverdrive';
import { NitroOverdriveVisual } from './NitroOverdriveVisual';
import { NitroSurgeVisual } from './NitroSurgeVisual';
import { PrismaticVisual } from './PrismaticVisual';

export interface RacerItemVisualState {
  nitroSurgeActive: boolean;
  nitroOverdrive: NitroOverdriveSnapshot;
  hyperDriveRocket: HyperDriveRocketSnapshot;
  prismaticRemainingSeconds: number;
  position: THREE.Vector3;
}

/**
 * Reuses the player-approved racer-owned item presentation for any racer. The
 * boost effects are kart-local; the Prismatic shell remains world-positioned.
 */
export class RacerItemVisuals {
  public readonly localGroup = new THREE.Group();
  public readonly worldGroup = new THREE.Group();
  private readonly nitroSurge = new NitroSurgeVisual();
  private readonly nitroOverdrive = new NitroOverdriveVisual();
  private readonly hyperDriveRocket = new HyperDriveRocketVisual();
  private readonly prismatic = new PrismaticVisual();

  public constructor() {
    this.localGroup.name = 'racer-item-visuals-local';
    this.worldGroup.name = 'racer-item-visuals-world';
    this.localGroup.add(
      this.nitroSurge.group,
      this.nitroOverdrive.group,
      this.hyperDriveRocket.group,
    );
    this.worldGroup.add(this.prismatic.group);
  }

  public update(state: RacerItemVisualState, elapsedSeconds: number, simulationDt: number): void {
    this.nitroSurge.update(state.nitroSurgeActive, elapsedSeconds);
    this.nitroOverdrive.update(
      state.nitroOverdrive.active,
      state.nitroOverdrive.pulseRemainingSeconds > 0,
      elapsedSeconds,
    );
    this.hyperDriveRocket.update(state.hyperDriveRocket, elapsedSeconds);
    this.prismatic.update(state.prismaticRemainingSeconds, state.position, simulationDt);
  }

  public dispose(): void {
    this.nitroSurge.dispose();
    this.nitroOverdrive.dispose();
    this.hyperDriveRocket.dispose();
    this.prismatic.dispose();
    this.localGroup.removeFromParent();
    this.worldGroup.removeFromParent();
    this.localGroup.clear();
    this.worldGroup.clear();
  }
}
