import { expect, it } from 'vitest';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { LapTracker } from '../src/game/race/LapTracker';
import { RaceDirector, type RacerProgress } from '../src/game/race/RaceDirector';
import { IncomingSeekerFixture } from '../src/game/items/IncomingSeekerFixture';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { seekerThreats } from '../src/game/items/SeekerWarnings';

it.each([1, 2, 3])('resolves an incoming Seeker correctly when completing lap %s', (lap) => {
  const track = new CircuitAlpha();
  const length = track.curve.getLength();
  const tracker = new LapTracker();
  const director = new RaceDirector();
  const progress: RacerProgress = {
    id: 'player',
    lap: 0,
    trackProgress: 0,
    finished: false,
    finishPlace: null,
    finishTime: null,
  };
  // Earn all earlier laps and CP01-CP11 using the production lap validator.
  for (let prior = 1; prior <= lap; prior++) {
    for (let cp = 1; cp < 12; cp++) tracker.enterCheckpoint(cp, 1, prior * 30);
    if (prior < lap) tracker.enterCheckpoint(0, 1, prior * 30);
  }
  const projectiles = new ProjectileSystem(track);
  const fixture = new IncomingSeekerFixture(true);
  const startDistance = track.startFinishDistance - 20;
  let position = track.curve.getPointAt(startDistance / length).setY(0.72);
  fixture.update(5, false, position, track, projectiles);
  let crossed = false;
  let hit = false;
  let warningAtGate = false;
  let activeAtGate = 0;
  for (let frame = 1; frame <= 360; frame++) {
    const u = ((startDistance + (frame * 33) / 60) / length) % 1;
    position = track.curve.getPointAt(u).setY(0.72);
    let enteredThisFrame = false;
    // Match runtime CP00 proximity trigger and finished-target propagation.
    if (!crossed && position.distanceToSquared(track.lapCheckpointPosition(0)) < 13 * 13) {
      expect(tracker.enterCheckpoint(0, 1, 5 + frame / 60)).toBe(true);
      crossed = enteredThisFrame = true;
      if (tracker.snapshot().finished) director.registerFinish(progress);
      progress.lap = tracker.snapshot().lap;
    }
    const target = {
      id: 'player',
      position,
      forward: track.curve.getTangentAt(u),
      velocity: track.curve.getTangentAt(u).multiplyScalar(33),
      finished: progress.finished,
    };
    hit ||= projectiles.update(1 / 60, [target]).some((impact) => impact.targetId === 'player');
    if (enteredThisFrame) {
      activeAtGate = projectiles.activeCount();
      warningAtGate = seekerThreats(projectiles.snapshots(), [target]).length > 0;
    }
    if (crossed && projectiles.activeCount() === 0) break;
  }
  expect(crossed).toBe(true);
  expect(tracker.snapshot().lap).toBe(lap);
  expect(progress.finished).toBe(lap === 3);
  expect(activeAtGate).toBe(lap === 3 ? 0 : 1);
  expect(warningAtGate).toBe(lap !== 3);
  expect(hit).toBe(lap !== 3);
  expect(projectiles.drainSeekerResolutions()).toMatchObject([
    {
      reason: lap === 3 ? 'target-finished' : 'racer-hit',
      hitRacerId: lap === 3 ? null : 'player',
    },
  ]);
  fixture.update(100, progress.finished, position, track, projectiles);
  expect(projectiles.activeCount()).toBe(lap === 3 ? 0 : 1);
  projectiles.dispose();
});
