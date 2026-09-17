import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  AiDriver,
  aiCornerSeverity,
  aiLookaheadMeters,
  aiTargetSpeed,
  rubberBandFactor,
} from '../src/game/ai/AiDriver';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

describe('spline AI driver', () => {
  const at = <T>(values: readonly T[], index: number): T => {
    const value = values[index];
    if (value === undefined) throw new Error(`Missing test sample ${String(index)}`);
    return value;
  };

  it('uses dynamic lookahead to produce bounded driving input', () => {
    const track = new CircuitAlpha();
    const driver = new AiDriver(track, { laneOffset: 1.5, pace: 0.7, aggression: 0.6 }, 30);
    const position = at(track.samples, 40).clone();
    const input = driver.input(position, at(track.tangents, 40).clone(), 18);
    expect(input.throttle).toBeGreaterThan(0);
    expect(Math.abs(input.steering)).toBeLessThanOrEqual(1);
    expect(aiLookaheadMeters(0)).toBe(5);
    expect(aiLookaheadMeters(30)).toBe(14);
  });

  it('steers back toward the spline from an offset', () => {
    const track = new CircuitAlpha();
    const tangent = at(track.tangents, 80).clone();
    const position = at(track.samples, 80)
      .clone()
      .add(new THREE.Vector3(tangent.z, 0, -tangent.x).multiplyScalar(9));
    const driver = new AiDriver(track, { laneOffset: 0, pace: 0.5, aggression: 0.2 }, 30);
    expect(Math.abs(driver.input(position, tangent, 15).steering)).toBeGreaterThan(0.2);
  });

  it('allows only a trailing top-speed bonus and never slows a leader below their stat cap', () => {
    expect(rubberBandFactor(99)).toBe(1.04);
    expect(rubberBandFactor(-99)).toBe(1);
  });

  it('uses the character maximum on straights and pace only for corner speed', () => {
    expect(aiTargetSpeed(33, 0.28, 0, 0)).toBe(33);
    expect(aiTargetSpeed(27.4, 0.82, 0, 0)).toBe(27.4);
    expect(aiTargetSpeed(30, 0.82, 0.5, 0)).toBeGreaterThan(aiTargetSpeed(30, 0.28, 0.5, 0));
  });

  it('turns upcoming heading angle into meaningful pre-turn corner severity', () => {
    const forward = new THREE.Vector3(0, 0, 1);
    const straight = forward.clone();
    const sixDegrees = new THREE.Vector3(
      Math.sin(THREE.MathUtils.degToRad(6)),
      0,
      Math.cos(THREE.MathUtils.degToRad(6)),
    );
    const fifteenDegrees = new THREE.Vector3(
      Math.sin(THREE.MathUtils.degToRad(15)),
      0,
      Math.cos(THREE.MathUtils.degToRad(15)),
    );

    expect(aiCornerSeverity(forward, straight, straight)).toBeCloseTo(0);
    expect(aiCornerSeverity(forward, straight, sixDegrees)).toBeCloseTo(0.2, 2);
    expect(aiCornerSeverity(forward, straight, fifteenDegrees)).toBeCloseTo(0.5, 2);
  });

  it('commits to a clear adjacent lane when a slower racer blocks its line', () => {
    const track = new CircuitAlpha();
    const index = 120;
    const position = at(track.samples, index).clone();
    const tangent = at(track.tangents, index).clone();
    const blocker = position.clone().addScaledVector(tangent, 8);
    const driver = new AiDriver(track, { laneOffset: 0, pace: 0.8, aggression: 0.7 }, 30);

    driver.input(position, tangent, 18, 0, [{ position: blocker, speed: 12, lateralOffset: 0 }]);

    expect(Math.abs(driver.desiredLaneOffset())).toBeGreaterThan(1);
    expect(Math.abs(driver.desiredLaneOffset())).toBeLessThan(track.roadHalfWidth - 1);
  });
});
