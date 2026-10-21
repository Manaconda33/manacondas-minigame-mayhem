import * as THREE from 'three';

interface Segment {
  index: number;
  a: THREE.Vector3;
  edge: THREE.Vector3;
  lengthSq: number;
  bounds: THREE.Box3;
}
interface Node {
  bounds: THREE.Box3;
  segments?: Segment[];
  left?: Node;
  right?: Node;
}
function build(segments: Segment[]): Node {
  const bounds = new THREE.Box3();
  for (const segment of segments) bounds.union(segment.bounds);
  if (segments.length <= 6) return { bounds, segments };
  const size = bounds.getSize(new THREE.Vector3());
  const axis = size.x >= size.y && size.x >= size.z ? 'x' : size.y >= size.z ? 'y' : 'z';
  segments.sort(
    (a, b) => a.bounds.min[axis] + a.bounds.max[axis] - b.bounds.min[axis] - b.bounds.max[axis],
  );
  const middle = Math.floor(segments.length / 2);
  return { bounds, left: build(segments.slice(0, middle)), right: build(segments.slice(middle)) };
}
function distanceSq(bounds: THREE.Box3, p: THREE.Vector3): number {
  const x = Math.max(bounds.min.x - p.x, 0, p.x - bounds.max.x);
  const y = Math.max(bounds.min.y - p.y, 0, p.y - bounds.max.y);
  const z = Math.max(bounds.min.z - p.z, 0, p.z - bounds.max.z);
  return x * x + y * y + z * z;
}

/** Exact nearest search over open or closed 3D segments; pruning uses a lower distance bound. */
export class TrackSegmentIndex {
  private readonly root: Node;
  public constructor(samples: readonly THREE.Vector3[], closed = true) {
    this.root = build(
      (closed ? samples : samples.slice(0, -1)).map((a, index) => {
        const b = samples[(index + 1) % samples.length] ?? a;
        const edge = b.clone().sub(a);
        return {
          index,
          a: a.clone(),
          edge,
          lengthSq: edge.lengthSq(),
          bounds: new THREE.Box3().setFromPoints([a, b]),
        };
      }),
    );
  }
  public nearest(position: THREE.Vector3): {
    index: number;
    fraction: number;
    point: THREE.Vector3;
  } {
    let bestDistance = Infinity,
      index = 0,
      fraction = 0;
    const point = new THREE.Vector3(),
      offset = new THREE.Vector3(),
      nearest = new THREE.Vector3();
    const visit = (node: Node) => {
      if (distanceSq(node.bounds, position) > bestDistance) return;
      if (node.segments) {
        for (const segment of node.segments) {
          const f =
            segment.lengthSq === 0
              ? 0
              : THREE.MathUtils.clamp(
                  offset.subVectors(position, segment.a).dot(segment.edge) / segment.lengthSq,
                  0,
                  1,
                );
          point.copy(segment.a).addScaledVector(segment.edge, f);
          const distance = position.distanceToSquared(point);
          // Preserve exhaustive traversal's lower-index choice on an exact tie.
          if (distance < bestDistance || (distance === bestDistance && segment.index < index)) {
            bestDistance = distance;
            index = segment.index;
            fraction = f;
            nearest.copy(point);
          }
        }
        return;
      }
      const left = node.left,
        right = node.right;
      if (!left || !right) return;
      if (distanceSq(left.bounds, position) <= distanceSq(right.bounds, position)) {
        visit(left);
        visit(right);
      } else {
        visit(right);
        visit(left);
      }
    };
    visit(this.root);
    return { index, fraction, point: nearest };
  }
}
