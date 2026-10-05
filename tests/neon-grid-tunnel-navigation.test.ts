import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { RocketAutopilot } from '../src/game/items/RocketAutopilot';
import { AiDriver } from '../src/game/ai/AiDriver';
import { guardrailContact } from '../src/game/track/GuardrailSystem';

describe('per-racer navigation through the legal tunnel', () => {
  it('keeps one racer underground while another continues on the main hairpins', () => {
    const track = new NeonGrid(),
      a = new RacerTrack(track),
      b = new RacerTrack(track);
    const tunnel = track.serviceTunnel;
    const at = (d: number) =>
      tunnel.curve.getPointAt(d / tunnel.curve.getLength()).add(new THREE.Vector3(0, 0.5, 0));
    a.advance(at(5), at(9));
    a.advance(at(9), at(45));
    expect(a.project(at(45)).pathId).toBe('service-tunnel');
    expect(b.project(track.curve.getPointAt(0.35)).pathId).toBeUndefined();
    const target = a.navigationAt(at(45), 13);
    expect(target.point.y).toBeLessThan(-3);
    expect(target.halfWidth).toBe(3.2);
    const rocket = new RocketAutopilot(a).routeTarget(at(45));
    expect(rocket.targetPosition.y).toBeLessThan(-3);
    expect(rocket.targetPosition.distanceTo(target.point)).toBeLessThan(0.1);
    const tangent = tunnel.curve.getTangentAt(0.5),
      right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const contact = guardrailContact(a, at(45).addScaledVector(right, 2.5), 1.15);
    expect(contact?.penetration).toBeCloseTo(0.45, 2);
    a.reset();
    expect(a.project(at(45)).pathId).toBeUndefined();
  });
  it('clears the committed AI choice after the physical rejoin', () => {
    const track = new NeonGrid(),
      route = new RacerTrack(track, 1, 1),
      tunnel = track.serviceTunnel;
    const approach = track.curve.getPointAt(
      tunnel.entry.progress[0] - 25 / track.curve.getLength(),
    );
    route.prepareAiRoute(
      approach,
      track.curve.getTangentAt(tunnel.entry.progress[0] - 25 / track.curve.getLength()),
      18,
    );
    const at = (d: number) => tunnel.curve.getPointAt(d / tunnel.curve.getLength());
    route.advance(at(5), at(9));
    const end = at(tunnel.curve.getLength());
    route.advance(
      at(tunnel.curve.getLength() - 1),
      end.clone().addScaledVector(tunnel.curve.getTangentAt(1), 1),
    );
    expect(route.navigationAt(end, 10).pathId).toBeUndefined();
    expect(route.navigationAt(end, 10).point.distanceTo(approach)).toBeGreaterThan(50);
  });
  it('uses a configurable seeded choice before the split; Rocket cannot choose a new path', () => {
    const track = new NeonGrid(),
      tunnel = track.serviceTunnel;
    const p = track.curve.getPointAt(tunnel.entry.progress[0] - 25 / track.curve.getLength());
    const t = track.curve.getTangentAt(tunnel.entry.progress[0] - 25 / track.curve.getLength());
    const yes = new RacerTrack(track, 1, 1),
      no = new RacerTrack(track, 1, 0),
      rocket = new RacerTrack(track, 1, 1);
    yes.prepareAiRoute(p, t, 18);
    no.prepareAiRoute(p, t, 18);
    rocket.prepareAiRoute(p, t, 18, false);
    expect(yes.navigationAt(p, 10).pathId).toBe('service-tunnel');
    expect(no.navigationAt(p, 10).pathId).toBeUndefined();
    expect(rocket.navigationAt(p, 10).pathId).toBeUndefined();
    const driver = new AiDriver(yes, { laneOffset: 3.3, pace: 0.5, aggression: 0.8 }, 30);
    const at = tunnel.curve.getPointAt(0.5).add(new THREE.Vector3(0, 0.5, 0));
    yes.advance(
      tunnel.curve.getPointAt(5 / tunnel.curve.getLength()),
      tunnel.curve.getPointAt(9 / tunnel.curve.getLength()),
    );
    const input = driver.input(at, tunnel.curve.getTangentAt(0.5), 15);
    expect(Math.abs(input.steering)).toBeLessThan(0.9);
    expect(Math.abs(driver.desiredLaneOffset())).toBeLessThanOrEqual(3.2 - 1.4);
  });
});

it('cancels an AI commitment when the racer physically misses the entrance', () => {
  const track = new NeonGrid(),
    route = new RacerTrack(track, 1, 1),
    tunnel = track.serviceTunnel;
  const p = track.curve.getPointAt(tunnel.entry.progress[0] - 25 / track.curve.getLength());
  route.prepareAiRoute(
    p,
    track.curve.getTangentAt(tunnel.entry.progress[0] - 25 / track.curve.getLength()),
    18,
  );
  const missed = track.curve.getPointAt(0.3);
  route.prepareAiRoute(missed, track.curve.getTangentAt(0.3), 15);
  expect(route.navigationAt(missed, 13).pathId).toBeUndefined();
});
it('releases a physical rejoin into the wider common road', () => {
  const track = new NeonGrid(),
    route = new RacerTrack(track),
    tunnel = track.serviceTunnel;
  route.advance(
    tunnel.curve.getPointAt(5 / tunnel.curve.getLength()),
    tunnel.curve.getPointAt(9 / tunnel.curve.getLength()),
  );
  const end = tunnel.curve.getPointAt(1),
    t = tunnel.curve.getTangentAt(1).setY(0).normalize(),
    r = new THREE.Vector3(t.z, 0, -t.x);
  const before = end.clone().addScaledVector(t, -1).addScaledVector(r, 4),
    after = end.clone().addScaledVector(t, 2).addScaledVector(r, 4);
  expect(track.projectMain(after).lateralDistance).toBeLessThan(
    track.halfWidthAt(tunnel.exitProgress),
  );
  route.advance(before, after);
  expect(route.project(after).pathId).toBeUndefined();
});
