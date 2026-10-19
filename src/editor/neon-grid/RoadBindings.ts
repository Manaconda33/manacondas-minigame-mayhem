import { requireValue } from './EditorDocument';
import * as THREE from 'three';
import type { NeonGrid } from '../../game/track/NeonGrid';
import type { EditorCatalogue, SceneComponent } from './ComponentCatalogue';
import type { EditorPaths } from './EditorRoad';
import { pathFrame } from './EditorRoad';
export interface VertexAnchor {
  progress: number;
  offset: THREE.Vector3;
}
export interface RoadBinding {
  path: string;
  progress: number;
  inverseFrame: THREE.Matrix4;
  centerOffset: THREE.Vector3;
  halfWidth: number;
  vertices: VertexAnchor[] | null;
}
export function baselinePath(track: NeonGrid, id: string): THREE.Curve<THREE.Vector3> {
  return id === 'service-tunnel'
    ? track.serviceTunnel.curve
    : id === 'billboard-gap'
      ? track.billboardGap.curve
      : id === 'waterfall-dive'
        ? new THREE.LineCurve3(track.waterfallDive.origin, track.waterfallDive.end)
        : track.curve;
}
function nearestProgress(track: NeonGrid, path: string, point: THREE.Vector3): number {
  if (path === 'service-tunnel')
    return track.serviceTunnel.fraction(track.serviceTunnel.project(point));
  if (path === 'billboard-gap')
    return track.billboardGap.fraction(track.billboardGap.project(point));
  if (path === 'waterfall-dive')
    return THREE.MathUtils.clamp(
      track.waterfallDive.distance(point) / track.waterfallDive.length,
      0,
      1,
    );
  return track.projectMain(point).progress;
}
export function buildRoadBindings(
  catalogue: EditorCatalogue,
  track: NeonGrid,
): Map<string, RoadBinding> {
  const bindings = new Map<string, RoadBinding>();
  for (const [id, component] of catalogue.components) {
    const a = component.record.attachment;
    if (a.mode !== 'road') continue;
    const curve = baselinePath(track, a.path),
      inverseFrame = pathFrame(curve, a.progress).invert();
    let vertices: VertexAnchor[] | null = null;
    if (
      component.instance === null &&
      /track-road|neon-grid-wall-|service-tunnel-(floor|left-wall|right-wall|roof)|billboard-plaza|deck-fascia|sightline-screens|asphalt|cyan-edges|luminous-edges|luminous-top-rails|wall-cladding|dive-ramp|dive-landing/.test(
        component.object.name,
      )
    ) {
      vertices = [];
      const positions = component.baselineGeometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        const world = new THREE.Vector3()
          .fromBufferAttribute(positions, i)
          .applyMatrix4(component.baselineWorld);
        const u = nearestProgress(track, a.path, world);
        vertices.push({ progress: u, offset: world.applyMatrix4(pathFrame(curve, u).invert()) });
      }
    }
    bindings.set(id, {
      path: a.path,
      progress: a.progress,
      inverseFrame,
      centerOffset: new THREE.Vector3()
        .setFromMatrixPosition(component.baselineWorld)
        .applyMatrix4(inverseFrame),
      halfWidth: track.halfWidthAt(a.progress),
      vertices,
    });
  }
  return bindings;
}
export function roadDelta(binding: RoadBinding, paths: EditorPaths): THREE.Matrix4 {
  const curve = binding.path === 'main' ? paths.main : paths.shortcuts[binding.path];
  if (!curve) throw new Error(`Missing edited path ${binding.path}`);
  const delta = pathFrame(curve, binding.progress);
  if (binding.path === 'main') {
    const x = binding.centerOffset.x,
      width = paths.widthAt(binding.progress);
    const moved =
      Math.abs(x) <= binding.halfWidth
        ? (x * width) / binding.halfWidth
        : x + Math.sign(x) * (width - binding.halfWidth);
    delta.multiply(new THREE.Matrix4().makeTranslation(moved - x, 0, 0));
  }
  return delta.multiply(binding.inverseFrame);
}
export function projectVertices(
  component: SceneComponent,
  binding: RoadBinding,
  paths: EditorPaths,
  track: NeonGrid,
): THREE.BufferGeometry {
  const geometry = component.baselineGeometry.clone();
  const positions = geometry.getAttribute('position');
  const inverseWorld = component.baselineWorld.clone().invert();
  const curve = binding.path === 'main' ? paths.main : requireValue(paths.shortcuts[binding.path]);
  const cache = new Map<number, THREE.Matrix4>();
  requireValue(binding.vertices).forEach((anchor, i) => {
    let frame = cache.get(anchor.progress);
    if (!frame) {
      frame = pathFrame(curve, anchor.progress);
      cache.set(anchor.progress, frame);
    }
    const offset = anchor.offset.clone();
    if (binding.path === 'main')
      offset.x *= paths.widthAt(anchor.progress) / track.halfWidthAt(anchor.progress);
    const point = offset.applyMatrix4(frame).applyMatrix4(inverseWorld);
    positions.setXYZ(i, point.x, point.y, point.z);
  });
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  // Recompute physical concrete longitudinal UVs against edited arc length; keep approved 2.2 m scale.
  const uv = geometry.getAttribute('uv');
  if (geometry.hasAttribute('uv') && component.record.scenePath.includes('neon-grid-wall-')) {
    requireValue(binding.vertices).forEach((a, i) =>
      uv.setX(i, (a.progress * curve.getLength()) / 2.2),
    );
    uv.needsUpdate = true;
  }
  return geometry;
}
