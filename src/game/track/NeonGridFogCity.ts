import * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { neonGridRightAt } from './NeonGridVisualCommon';
import type { NeonGrid } from './NeonGrid';

interface FogDistrict {
  readonly name: 'skyline' | 'undercity' | 'falls-run';
  readonly start: number;
  readonly end: number;
  readonly counts: Readonly<Record<GraphicsQuality, number>>;
  readonly color: number;
  readonly accent: readonly [number, number, number];
}

const DISTRICTS: readonly FogDistrict[] = [
  {
    name: 'skyline',
    start: 0.008,
    end: 0.24654910452879084,
    counts: { low: 18, medium: 24, high: 30 },
    color: 0x244454,
    accent: [0.04, 0.72, 0.88],
  },
  {
    name: 'undercity',
    start: 0.24654910452879084,
    end: 0.46154128347522666,
    counts: { low: 14, medium: 18, high: 22 },
    color: 0x45354d,
    accent: [0.82, 0.2, 0.68],
  },
  {
    name: 'falls-run',
    start: 0.46154128347522666,
    end: 0.992,
    counts: { low: 24, medium: 32, high: 40 },
    color: 0x315052,
    accent: [0.12, 0.68, 0.78],
  },
];

/**
 * Remove one complete indexed triangle span while keeping adjacent structural
 * triangles in the same batched draw. This is used only by the opt-in visual
 * experiment; the original buffers and defaults remain intact.
 */
export function suppressIndexedGroundTriangles(
  geometry: THREE.BufferGeometry,
  indexStart: number,
  indexCount: number,
): void {
  const index = geometry.getIndex();
  if (!index) throw new Error('Fog experiment ground suppression requires indexed geometry');
  if (geometry.groups.length > 0)
    throw new Error('Fog experiment cannot safely filter geometry with material groups');
  if (
    !Number.isInteger(indexStart) ||
    !Number.isInteger(indexCount) ||
    indexStart < 0 ||
    indexCount < 0 ||
    indexStart % 3 !== 0 ||
    indexCount % 3 !== 0 ||
    indexStart + indexCount > index.count
  ) {
    throw new Error('Fog experiment ground suppression range is outside the geometry index');
  }
  if (indexCount === 0) return;

  const originalStart = indexStart;
  const originalCount = indexCount;
  const originalEnd = originalStart + originalCount;
  const source = index.array;
  const kept = new Uint32Array(source.length - originalCount);
  let cursor = 0;
  for (let i = 0; i < source.length; i++) {
    if (i >= originalStart && i < originalEnd) continue;
    kept[cursor] = index.getX(i);
    cursor++;
  }
  geometry.setIndex(new THREE.BufferAttribute(kept, 1));

  const removedTriangles = originalCount / 3;
  const removedEndTriangle = originalEnd / 3;
  const ranges = geometry.userData.geometryRanges as
    | Record<string, { startTriangle: number; triangleCount: number }>
    | undefined;
  if (ranges) {
    for (const [name, range] of Object.entries(ranges)) {
      const start = range.startTriangle;
      const end = start + range.triangleCount;
      if (start === originalStart / 3 && end === removedEndTriangle) {
        ranges[name] = { startTriangle: start, triangleCount: 0 };
      } else if (start >= removedEndTriangle) {
        ranges[name] = { startTriangle: start - removedTriangles, triangleCount: range.triangleCount };
      } else if (end > originalStart / 3 && start < removedEndTriangle) {
        throw new Error(`Fog experiment suppression partially overlaps geometry range ${name}`);
      }
    }
    geometry.userData.geometryRanges = ranges;
  }

  const rasterRanges = geometry.userData.rasterSurfaceRanges as
    | readonly { start: number; count: number }[]
    | undefined;
  if (rasterRanges) {
    geometry.userData.rasterSurfaceRanges = rasterRanges
      .map((range) => {
        const end = range.start + range.count;
        if (range.start >= originalEnd) return { start: range.start - originalCount, count: range.count };
        if (range.start >= originalStart && end <= originalEnd) return { start: 0, count: 0 };
        if (end <= originalStart) return range;
        throw new Error('Fog experiment suppression partially overlaps a raster surface range');
      })
      .filter((range: { start: number; count: number }) => range.count > 0);
  }

  geometry.userData.originalFloorIndexStart = originalStart;
  geometry.userData.originalFloorIndexCount = originalCount;
  geometry.userData.suppressedGroundIndexStart = originalStart;
  geometry.userData.suppressedGroundIndexCount = originalCount;
  geometry.userData.suppressedGroundTriangleCount = removedTriangles;
  geometry.userData.floorIndexStart = 0;
  geometry.userData.floorIndexCount = 0;
  geometry.userData.floorTriangleCount = 0;
  geometry.userData.rasterSurfaceIndexStart = 0;
  geometry.userData.rasterSurfaceIndexCount = 0;
  geometry.userData.cityGroundSuppressed = true;
}

function ruinedTowerGeometry(): THREE.BufferGeometry {
  const perimeter: readonly (readonly [number, number])[] = [
    [-0.39, -0.48],
    [0.27, -0.5],
    [0.47, -0.31],
    [0.43, 0.29],
    [0.17, 0.48],
    [-0.35, 0.43],
    [-0.49, 0.12],
    [-0.45, -0.22],
  ];
  const roofBreaks = [0.92, 1.08, 0.72, 0.99, 0.76, 1.04, 0.82, 0.95];
  const ringLevels = [0, 0.58, 0.82, 1];
  const ringScales = [1, 0.96, 0.76, 0.69];
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let ring = 0; ring < ringLevels.length; ring++) {
    const scale = ringScales[ring] ?? 1;
    const level = ringLevels[ring] ?? 0;
    for (let edge = 0; edge < perimeter.length; edge++) {
      const point = perimeter[edge];
      if (!point) continue;
      const roofHeight = roofBreaks[edge] ?? 1;
      const y = ring === ringLevels.length - 1 ? roofHeight : level;
      positions.push(point[0] * scale, y, point[1] * scale);
      uvs.push(edge / perimeter.length, y);
    }
  }

  for (let ring = 0; ring < ringLevels.length - 1; ring++) {
    const lower = ring * perimeter.length;
    const upper = (ring + 1) * perimeter.length;
    for (let edge = 0; edge < perimeter.length; edge++) {
      const next = (edge + 1) % perimeter.length;
      const a = lower + edge;
      const b = lower + next;
      const c = upper + edge;
      const d = upper + next;
      indices.push(a, c, b, b, c, d);
    }
  }

  // A few broken roof plates leave an uneven, open crown instead of a clean box cap.
  const topStart = (ringLevels.length - 1) * perimeter.length;
  const roofCore = positions.length / 3;
  positions.push(0.02, 0.78, -0.04);
  uvs.push(0.5, 0.78);
  for (const edge of [0, 2, 5, 7]) {
    const next = (edge + 1) % perimeter.length;
    indices.push(topStart + edge, roofCore, topStart + next);
  }

  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    .setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.userData.presentationOnly = true;
  geometry.userData.ruinedOpenRoof = true;
  return geometry;
}

function fogSky(): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        mat4 rotationOnlyView = mat4(mat3(viewMatrix));
        vec4 clip = projectionMatrix * rotationOnlyView * vec4(position, 1.0);
        gl_Position = clip.xyww;
      }`,
    fragmentShader: `varying vec3 vDirection;
      void main() {
        vec3 direction = normalize(vDirection);
        float elevation = direction.y;
        float horizon = exp(-abs(elevation + 0.035) * 10.0);
        float lowerMist = 1.0 - smoothstep(-0.36, -0.02, elevation);
        vec3 zenith = vec3(0.002, 0.006, 0.018);
        vec3 upper = vec3(0.004, 0.014, 0.034);
        vec3 horizonTone = vec3(0.008, 0.022, 0.052);
        vec3 lowerTone = vec3(0.004, 0.014, 0.034);
        vec3 color = mix(lowerTone, horizonTone, smoothstep(-0.48, -0.01, elevation));
        color = mix(color, upper, smoothstep(0.08, 0.48, elevation));
        color = mix(color, zenith, smoothstep(0.48, 0.9, elevation));
        float cyanGlow = horizon * (0.45 + 0.55 * abs(direction.x));
        float magentaGlow = horizon * (1.0 - abs(direction.x)) * 0.22;
        color += vec3(0.0, 0.06, 0.10) * max(cyanGlow, 0.0);
        color += vec3(0.055, 0.008, 0.052) * magentaGlow;
        color = mix(color, vec3(0.003, 0.011, 0.028), lowerMist * 0.35);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.userData.bloomBlackAdapter = true;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), material);
  mesh.name = 'neon-grid-fog-backdrop';
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.userData.presentationOnly = true;
  mesh.userData.fogBackdrop = true;
  return mesh;
}

function ruinedCityMaterial(accent: readonly [number, number, number]): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const [r, g, b] = accent;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
          varying vec3 vAbyssWorldPosition;
          varying float vAbyssViewDepth;
          varying vec2 vAbyssUv;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
          vec4 abyssPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            abyssPosition = instanceMatrix * abyssPosition;
          #endif
          vec4 abyssWorldPosition = modelMatrix * abyssPosition;
          vec4 abyssViewPosition = viewMatrix * abyssWorldPosition;
          vAbyssWorldPosition = abyssWorldPosition.xyz;
          vAbyssViewDepth = length(abyssViewPosition.xyz);
          vAbyssUv = uv;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
          varying vec3 vAbyssWorldPosition;
          varying float vAbyssViewDepth;
          varying vec2 vAbyssUv;
          float abyssHash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
          vec2 windowCell = floor(vAbyssUv * vec2(14.0, 40.0));
          vec2 windowLocal = fract(vAbyssUv * vec2(14.0, 40.0));
          float windowFrame = step(0.22, windowLocal.x) * step(windowLocal.x, 0.78)
            * step(0.25, windowLocal.y) * step(windowLocal.y, 0.75);
          float windowHash = abyssHash(windowCell + floor(vAbyssWorldPosition.xz * 0.025));
          float windowLit = step(0.965, windowHash) * windowFrame;
          vec3 windowColor = mix(vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}),
            vec3(0.72, 0.16, 0.64), step(0.72, abyssHash(windowCell + 17.0)));
          diffuseColor.rgb = mix(diffuseColor.rgb, windowColor, windowLit * 0.42);
          float lowFog = 1.0 - smoothstep(-42.0, 20.0,
            vAbyssWorldPosition.y - cameraPosition.y);
          float distanceFog = smoothstep(220.0, 380.0, vAbyssViewDepth) * 0.60;
          float fogAmount = clamp(max(lowFog * 0.68, distanceFog), 0.0, 0.84);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.004, 0.014, 0.038), fogAmount);`,
      );
  };
  material.customProgramCacheKey = () =>
    `neon-grid-abyss-ruin-${String(r)}-${String(g)}-${String(b)}`;
  material.userData.presentationOnly = true;
  material.userData.heightFoggedRuins = true;
  material.userData.lowerFogHideOffset = -42;
  material.userData.lowerFogClearOffset = 20;
  return material;
}

export class NeonGridFogCityVisual {
  public readonly group = new THREE.Group();

  public constructor(
    track: NeonGrid,
    quality: GraphicsQuality,
  ) {
    this.group.name = 'neon-grid-fog-city';
    this.group.userData.presentationOnly = true;
    this.group.add(fogSky());

    const geometry = ruinedTowerGeometry();
    const routeSamples = track.curve.getPoints(512);
    const dummy = new THREE.Object3D();
    for (const district of DISTRICTS) {
      const count = district.counts[quality];
      const buildings = new THREE.InstancedMesh(
        geometry,
        ruinedCityMaterial(district.accent),
        count,
      );
      buildings.name = `neon-grid-fog-silhouettes-${district.name}`;
      buildings.userData.presentationOnly = true;
      buildings.userData.collision = false;
      buildings.userData.district = district.name;
      buildings.userData.progressRange = [district.start, district.end];
      buildings.userData.ruinedOpenRoof = true;
      buildings.castShadow = false;
      buildings.receiveShadow = false;

      const baseColor = new THREE.Color(district.color);
      for (let i = 0; i < count; i++) {
        const fraction = (i + 0.34 + ((i * 17) % 7) * 0.07) / count;
        const progress = THREE.MathUtils.lerp(district.start, district.end, fraction);
        const center = track.curve.getPointAt(progress);
        const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
        const right = neonGridRightAt(track, progress);
        const side = i % 2 === 0 ? -1 : 1;
        const longitudinal = ((i % 5) - 2) * 9 + ((i * 13) % 11) - 5;
        const baseY = center.y - 150 - ((i * 19) % 6);
        const height = 185 + ((i * 37) % 10);
        const width = 17 + ((i * 11) % 15);
        const depth = 15 + ((i * 7) % 12);

        let lateral = track.halfWidthAt(progress) + 220 + ((i * 29) % 90);
        let minimumCourseClearance = 0;
        for (let placementAttempt = 0; placementAttempt < 20; placementAttempt++) {
          dummy.position
            .copy(center)
            .addScaledVector(right, side * lateral)
            .addScaledVector(tangent, longitudinal)
            .setY(baseY);
          minimumCourseClearance = Infinity;
          for (const routePoint of routeSamples) {
            minimumCourseClearance = Math.min(
              minimumCourseClearance,
              Math.hypot(dummy.position.x - routePoint.x, dummy.position.z - routePoint.z),
            );
          }
          if (minimumCourseClearance > 188) break;
          lateral += 32;
        }
        if (minimumCourseClearance <= 188) {
          throw new Error(`Fog-city ruin ${String(i)} could not clear the full course`);
        }
        dummy.rotation.set(0, (i * 1.73) % (Math.PI * 2), 0);
        dummy.scale.set(width, height, depth);
        dummy.updateMatrix();
        buildings.setMatrixAt(i, dummy.matrix);

        const shade = baseColor.clone().multiplyScalar(0.72 + ((i * 23) % 7) * 0.055);
        buildings.setColorAt(i, shade);
      }
      buildings.instanceMatrix.needsUpdate = true;
      if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;
      this.group.add(buildings);
    }
  }
}
