import * as THREE from 'three';
import { expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { neonGridRibbon } from '../src/game/track/NeonGridGeometry';
import { serviceTunnelGeometry } from '../src/game/track/ServiceTunnelGeometry';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { guardrailContact } from '../src/game/track/GuardrailSystem';

it.each([false, true])(
  'keeps exact tunnel edges consistently inside the main aperture, exit=%s',
  (exit) => {
    const tunnel = new NeonGrid().serviceTunnel,
      length = tunnel.curve.getLength();
    for (let d = 2; d <= 8; d += 0.1) {
      const f = exit ? 1 - d / length : d / length;
      const p = tunnel.curve.getPointAt(f),
        t = tunnel.curve.getTangentAt(f);
      for (const side of [-1, 1]) {
        const q = p
          .clone()
          .addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), side * 3.2);
        expect(tunnel.junctionContains(q), `${String(d)}/${String(side)}`).toBe(true);
      }
    }
  },
);

it.each(['left-wall', 'right-wall'] as const)(
  'does not render %s across the joined main road',
  (kind) => {
    const track = new NeonGrid(),
      tunnel = track.serviceTunnel;
    const geometry = serviceTunnelGeometry(tunnel, kind),
      positions = geometry.getAttribute('position'),
      indices = geometry.getIndex();
    if (!indices) throw new Error('Missing triangles');
    for (let i = 0; i < indices.count; i += 3) {
      const q = new THREE.Vector3();
      for (let j = 0; j < 3; j++)
        q.add(new THREE.Vector3().fromBufferAttribute(positions, indices.getX(i + j)));
      q.multiplyScalar(1 / 3);
      const start = tunnel.curve.getPointAt(0),
        chord = tunnel.curve.getPointAt(1).sub(start).setY(0);
      const along = q.clone().sub(start).setY(0).dot(chord) / chord.length();
      if (along < 0 || along > chord.length()) continue;
      const local = tunnel.project(q),
        d = tunnel.fraction(local) * tunnel.curve.getLength();
      if (d > 12 && d < tunnel.curve.getLength() - 12) continue;
      q.y = local.point.y;
      const main = track.projectMain(q);
      expect(
        main.lateralDistance - track.halfWidthAt(main.progress),
        `d=${String(d)}`,
      ).toBeGreaterThanOrEqual(-0.02);
    }
    geometry.dispose();
  },
);

it('leaves the legal main-road join open before and after traversal activation', () => {
  const track = new NeonGrid(),
    route = new RacerTrack(track),
    tunnel = track.serviceTunnel,
    length = tunnel.curve.getLength();
  const p = (d: number, lane: number) => {
    const f = THREE.MathUtils.clamp(d / length, 0, 1),
      t = tunnel.curve.getTangentAt(f);
    return tunnel.curve
      .getPointAt(f)
      .addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), lane)
      .addScaledVector(t, Math.max(0, d - length))
      .add(new THREE.Vector3(0, 0.5, 0));
  };
  for (const lane of [-1.8, 0, 1.8]) {
    route.reset();
    expect(guardrailContact(route, p(6.8, lane), 1.15)).toBeNull();
    route.advance(p(6.8, lane), p(7.2, lane));
    expect(route.project(p(7.2, lane)).pathId).toBe('service-tunnel');
    for (const d of [7.2, 8, length - 10, length - 9, length - 7, length - 1]) {
      expect(guardrailContact(route, p(d, lane), 1.15), `${String(d)}/${String(lane)}`).toBeNull();
    }
    route.advance(p(length - 0.2, lane), p(length + 0.2, lane));
    expect(route.project(p(length + 0.2, lane)).pathId).toBeUndefined();
  }
});

it.each([-1, 1] as const)(
  'joins main wall %s to the tunnel edges without wall tips in the aperture',
  (side) => {
    const track = new NeonGrid(),
      tunnel = track.serviceTunnel;
    const geometry = neonGridRibbon(track, side),
      positions = geometry.getAttribute('position'),
      indices = geometry.getIndex();
    if (!indices) throw new Error('Missing triangles');
    for (let i = 0; i < indices.count; i += 3) {
      const q = new THREE.Vector3();
      for (let j = 0; j < 3; j++)
        q.add(new THREE.Vector3().fromBufferAttribute(positions, indices.getX(i + j)));
      q.multiplyScalar(1 / 3);
      const start = tunnel.curve.getPointAt(0),
        chord = tunnel.curve.getPointAt(1).sub(start).setY(0);
      const along = q.clone().sub(start).setY(0).dot(chord) / chord.length();
      if (along < 0 || along > chord.length()) continue;
      const local = tunnel.project(q),
        d = tunnel.fraction(local) * tunnel.curve.getLength();
      if ((d > 12 && d < tunnel.curve.getLength() - 12) || Math.abs(q.y - local.point.y) > 1.5)
        continue;
      expect(local.lateralDistance, `wall tip d=${String(d)}`).toBeGreaterThanOrEqual(3.18);
    }
    for (const tunnelSide of [-1, 1] as const) {
      const wall = serviceTunnelGeometry(tunnel, tunnelSide === -1 ? 'left-wall' : 'right-wall'),
        wp = wall.getAttribute('position');
      for (const index of [0, 1, wp.count - 2, wp.count - 1]) {
        const endpoint = new THREE.Vector3().fromBufferAttribute(wp, index),
          main = track.projectMain(endpoint);
        if ((main.lateralOffset < 0 ? -1 : 1) !== side) continue;
        let nearest = Infinity;
        for (let i = 0; i < indices.count; i++) {
          const v = new THREE.Vector3().fromBufferAttribute(positions, indices.getX(i));
          nearest = Math.min(nearest, v.distanceTo(endpoint));
        }
        expect(nearest, `join ${String(tunnelSide)}/${String(index)}`).toBeLessThan(0.08);
      }
      wall.dispose();
    }
    geometry.dispose();
  },
);

it.each([-1, 1] as const)(
  'contains the outside lane only beside a rendered tunnel wall, side=%s',
  (side) => {
    const track = new NeonGrid(),
      tunnel = track.serviceTunnel,
      length = tunnel.curve.getLength();
    const geometry = serviceTunnelGeometry(tunnel, side === -1 ? 'left-wall' : 'right-wall'),
      positions = geometry.getAttribute('position');
    for (const [vertex, direction] of [
      [0, 1],
      [positions.count - 2, -1],
    ] as const) {
      const endpoint = new THREE.Vector3().fromBufferAttribute(positions, vertex);
      const fraction = tunnel.fraction(tunnel.project(endpoint));
      for (const delta of [-0.01, 0.01]) {
        const f = fraction + (delta * direction) / length,
          t = tunnel.curve.getTangentAt(f);
        const q = tunnel.curve
          .getPointAt(f)
          .addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), side * 3.3);
        const boundary = track.boundaryHalfWidthAt(tunnel.project(q));
        expect(boundary, `${String(vertex)}/${String(delta)}`).toBe(delta < 0 ? null : 3.2);
      }
    }
    geometry.dispose();
  },
);
