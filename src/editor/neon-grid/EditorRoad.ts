import * as THREE from 'three';
import type { NeonGrid } from '../../game/track/NeonGrid';
import layout from '../../game/track/neonGridLayout.json';
import { cloneData, type RoadState, requireValue } from './EditorDocument';
export interface EditorPaths {
  main: THREE.CatmullRomCurve3;
  shortcuts: Record<string, THREE.Curve<THREE.Vector3>>;
  widthAt(progress: number): number;
  unchanged: boolean;
  warnings: string[];
}
function editedMain(track: NeonGrid, road: RoadState): THREE.CatmullRomCurve3 {
  if (
    road.controlPoints.length !== layout.controlPoints.length ||
    road.controlPoints.some(
      (p) =>
        p.position.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e6) ||
        !Number.isFinite(p.widthMultiplier) ||
        p.widthMultiplier <= 0.01 ||
        p.widthMultiplier > 100,
    )
  )
    throw new Error('Invalid road point or width.');
  if (
    road.controlPoints.every((p, i) =>
      p.position.every((v, j) => v === layout.controlPoints[i]?.[j]),
    )
  )
    return track.curve;
  const curve = new THREE.CatmullRomCurve3(
    road.controlPoints.map((p) => new THREE.Vector3().fromArray(p.position)),
    true,
    'centripetal',
    0.5,
  );
  if (!Number.isFinite(curve.getLength()) || curve.getLength() < 1)
    throw new Error('Degenerate road length.');
  for (let i = 0; i < 128; i++) {
    const tangent = curve.getTangentAt(i / 128);
    if (!tangent.toArray().every(Number.isFinite) || Math.hypot(tangent.x, tangent.z) < 1e-6)
      throw new Error('Degenerate vertical road segment.');
  }
  return curve;
}
export function updateRoadState(track: NeonGrid, baseline: RoadState, state: RoadState): RoadState {
  const road = cloneData(state);
  const main = editedMain(track, road);
  for (const [id, original] of Object.entries(baseline.shortcutPaths)) {
    const start = main
      .getPointAt(original.entryProgress)
      .sub(track.curve.getPointAt(original.entryProgress));
    const end = main
      .getPointAt(original.exitProgress)
      .sub(track.curve.getPointAt(original.exitProgress));
    road.shortcutPaths[id] = {
      ...original,
      points: original.points.map((p, i) =>
        new THREE.Vector3()
          .fromArray(p)
          .add(start.clone().lerp(end, i / (original.points.length - 1)))
          .toArray(),
      ),
    };
  }
  return road;
}
export function createEditedPaths(track: NeonGrid, road: RoadState): EditorPaths {
  const main = editedMain(track, road);
  const unchanged =
    main === track.curve && road.controlPoints.every((p) => p.widthMultiplier === 1);
  const shortcuts: EditorPaths['shortcuts'] = {};
  for (const [id, path] of Object.entries(road.shortcutPaths)) {
    if (!path.points.length || path.points.some((p) => p.some((v) => !Number.isFinite(v))))
      throw new Error('Invalid shortcut path.');
    shortcuts[id] = new THREE.CatmullRomCurve3(
      path.points.map((p) => new THREE.Vector3().fromArray(p)),
      false,
      'centripetal',
    );
  }
  if (unchanged) {
    shortcuts['service-tunnel'] = track.serviceTunnel.curve;
    shortcuts['billboard-gap'] = track.billboardGap.curve;
    shortcuts['waterfall-dive'] = new THREE.LineCurve3(
      track.waterfallDive.origin,
      track.waterfallDive.end,
    );
  }
  const cumulative = main.getLengths(road.controlPoints.length * 100);
  const length = requireValue(cumulative.at(-1));
  const knots = road.controlPoints.map((p, i) => ({
    progress: requireValue(cumulative[i * 100]) / length,
    value: p.widthMultiplier,
  }));
  const widthAt = (progress: number) => {
    const u = THREE.MathUtils.euclideanModulo(progress, 1);
    if (unchanged) return track.halfWidthAt(u);
    let i = knots.length - 1;
    for (let j = 0; j < knots.length - 1; j++)
      if (u >= requireValue(knots[j]).progress && u < requireValue(knots[j + 1]).progress) {
        i = j;
        break;
      }
    const a = requireValue(knots[i]),
      b = requireValue(knots[(i + 1) % knots.length]);
    const end = i === knots.length - 1 ? 1 : b.progress;
    return (
      track.halfWidthAt(u) *
      THREE.MathUtils.lerp(a.value, b.value, (u - a.progress) / Math.max(1e-9, end - a.progress))
    );
  };
  const warnings: string[] = [];
  if (!unchanged) {
    warnings.push(
      'Layout proposal: shortcut junctions, climbing-repair topology, collision, AI and checkpoints require verification before playable integration.',
    );
    const points = Array.from({ length: 128 }, (_, i) => main.getPointAt(i / 128));
    for (let i = 0; i < points.length; i++) {
      const a = requireValue(points[i]),
        b = requireValue(points[(i + 1) % points.length]);
      if (Math.abs(b.y - a.y) > Math.hypot(b.x - a.x, b.z - a.z) * 0.5) {
        warnings.push(
          'An edited road section exceeds a 50% visual grade; no drivability is implied.',
        );
        break;
      }
    }
  }
  return { main, shortcuts, widthAt, unchanged, warnings };
}
export function pathFrame(curve: THREE.Curve<THREE.Vector3>, progress: number): THREE.Matrix4 {
  const u = THREE.MathUtils.clamp(progress, 0, 1);
  const tangent = curve.getTangentAt(u).setY(0).normalize();
  if (tangent.lengthSq() < 1e-8) throw new Error('Degenerate road frame.');
  return new THREE.Matrix4()
    .makeBasis(new THREE.Vector3(tangent.z, 0, -tangent.x), new THREE.Vector3(0, 1, 0), tangent)
    .setPosition(curve.getPointAt(u));
}
