import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { HazardSystem } from './HazardSystem';
import { BLAST_ORB_CONFIG } from './itemDefinitions';

const FIXTURE_START_SECONDS = 5;
const FIXTURE_AHEAD_METERS = 12;
const FIXTURE_OWNER_ID = 'test-blast-orb-fixture';

/** Opt-in victim-side fixture; never consumes AI inventory or enables AI tactics. */
export class IncomingBlastOrbFixture {
  private attempted = false;

  public constructor(private readonly enabled: boolean) {}

  public update(
    elapsedRaceSeconds: number,
    playerFinished: boolean,
    playerPosition: THREE.Vector3,
    track: CircuitAlpha,
    hazards: HazardSystem,
  ): void {
    if (
      !this.enabled ||
      this.attempted ||
      playerFinished ||
      elapsedRaceSeconds < FIXTURE_START_SECONDS
    ) {
      return;
    }

    const projection = track.project(playerPosition);
    const samplesAhead = Math.max(1, Math.round(FIXTURE_AHEAD_METERS / track.sampleSpacing));
    const index = (projection.index + samplesAhead) % track.sampleCount;
    const position = track.samples[index]?.clone();
    if (position === undefined) return;

    this.attempted = hazards.spawnFixture(
      FIXTURE_OWNER_ID,
      position,
      BLAST_ORB_CONFIG,
      new THREE.Vector3(),
    ) !== null;
  }
}
