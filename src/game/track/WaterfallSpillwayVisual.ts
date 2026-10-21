import * as THREE from 'three';
import type { WaterfallDive } from './NeonGridDive';

/** Texture-free flow: dark water, irregular moving white ribbons and edge foam. */
export function flowingWater(falling = false): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, falling: { value: falling ? 1 : 0 } },
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float time; uniform float falling; varying vec2 vUv;
      void main() {
        float x = vUv.x;
        float travel = vUv.y - time * mix(1.8, 5.5, falling);
        float warp = sin(travel * 1.9 + x * 21.) * .025 + sin(travel * 4.7 - x * 37.) * .012;
        float ribbon = pow(.5 + .5 * sin((x + warp) * 93. + sin(travel * 2.3)), 12.);
        float fine = pow(.5 + .5 * sin(x * 217. + travel * 1.7), 24.);
        float chop = .5 + .5 * sin(travel * 10. + sin(x * 41.) * 2.);
        float banks = pow(abs(x * 2. - 1.), 14.);
        float foam = clamp(ribbon * (.3 + chop * .7) + fine * .3 + banks * .45, 0., 1.);
        vec3 deep = mix(vec3(.025, .16, .21), vec3(.06, .36, .43), falling);
        vec3 color = mix(deep, vec3(.66, .90, .94), foam * .82);
        color += vec3(.02, .07, .09) * sin(travel * 3. + x * 11.);
        gl_FragColor = vec4(color, mix(.83, .72 + foam * .22, falling));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.forceSinglePass = true;
  material.userData.bloomBlackAdapter = true;
  return material;
}

export function rampWater(dive: WaterfallDive): THREE.BufferGeometry {
  const geometry = dive.rampGeometry.clone();
  const positions = geometry.getAttribute('position');
  const uv: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(positions, i);
    positions.setY(i, p.y + 0.035);
    uv.push((dive.lane(p) / dive.roadHalfWidth + 1) / 2, dive.distance(p));
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  return geometry;
}

/** Starts at every actual ramp-lip vertex, rounds the edge, and terminates at pool level. */
export function fallingSheet(dive: WaterfallDive): THREE.BufferGeometry {
  const vertices: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const positions = dive.rampGeometry.getAttribute('position');
  const lips: THREE.Vector3[] = [];
  for (let i = 0; i < positions.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(positions, i);
    if (Math.abs(dive.distance(p) - dive.lipDistance) < 0.001) lips.push(p);
  }
  lips.sort((a, b) => dive.lane(a) - dive.lane(b));
  const rows = 24;
  lips.forEach((lip, j) => {
    for (let i = 0; i <= rows; i++) {
      const f = i / rows,
        arc = (Math.min(1, f * 5) * Math.PI) / 2;
      const p = lip.clone().addScaledVector(dive.direction, Math.sin(arc) * 0.7);
      p.y += 0.035 - (1 - Math.cos(arc)) * 0.7;
      if (f > 0.2) p.y = THREE.MathUtils.lerp(lip.y + 0.035 - 0.7, 0.08, (f - 0.2) / 0.8);
      // No gap at the lip; only the lower sheet has a gently torn silhouette.
      p.addScaledVector(dive.right, Math.sin(j * 1.7 + f * 13) * 0.045 * f);
      vertices.push(...p.toArray());
      uv.push(j / (lips.length - 1), dive.lipDistance + f * 11);
      if (j < lips.length - 1 && i < rows) {
        const a = j * (rows + 1) + i,
          b = a + rows + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  });
  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    .setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    .setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Raised, supported scenery channel feeding the left side of the ramp. No collider. */
export function leftWaterway(dive: WaterfallDive): {
  water: THREE.BufferGeometry;
  banks: THREE.BufferGeometry;
} {
  const ramp = new THREE.Mesh(
    dive.rampGeometry,
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
  );
  const ray = new THREE.Raycaster();
  const join = dive.pointAtDistance(13).addScaledVector(dive.right, 1.8);
  ray.set(join.clone().setY(30), new THREE.Vector3(0, -1, 0));
  const hit = ray.intersectObject(ramp)[0];
  if (!hit) throw new Error('Waterway must meet actual ramp support');
  join.y = hit.point.y + 0.035;
  const start = join
    .clone()
    .addScaledVector(dive.right, 27)
    .addScaledVector(dive.direction, -4)
    .setY(12.3);
  const curve = new THREE.CubicBezierCurve3(
    start,
    start.clone().addScaledVector(dive.right, -10),
    join
      .clone()
      .addScaledVector(dive.right, 7)
      .setY(join.y + 1),
    join,
  );
  const vertices: number[] = [],
    uv: number[] = [],
    indices: number[] = [],
    walls: number[] = [];
  const rows = 32,
    halfWidth = 1.35;
  const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
    for (const p of [a, b, c, b, d, c]) walls.push(...p.toArray());
  };
  let previous: [THREE.Vector3, THREE.Vector3] | undefined;
  for (let i = 0; i <= rows; i++) {
    const f = i / rows,
      center = curve.getPoint(f),
      tangent = curve.getTangent(f).setY(0).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const edges: [THREE.Vector3, THREE.Vector3] = [
      center.clone().addScaledVector(right, -halfWidth),
      center.clone().addScaledVector(right, halfWidth),
    ];
    if (f > 0.8) {
      for (const edge of edges) {
        ray.set(edge.clone().setY(30), new THREE.Vector3(0, -1, 0));
        const support = ray.intersectObject(ramp)[0];
        if (support)
          edge.y = THREE.MathUtils.lerp(edge.y, support.point.y + 0.035, (f - 0.8) / 0.2);
      }
    }
    for (const [j, p] of edges.entries()) {
      vertices.push(...p.toArray());
      uv.push(j, f * 27 - 11);
    }
    if (i < rows) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    if (previous) {
      // Solid retaining sides continue to the ground and explain the elevated source.
      // Taper the final bank height away as the channel merges onto the driving ramp.
      for (const side of [0, 1] as const) {
        const a = previous[side],
          b = edges[side];
        const height = f < 0.85 ? 0.28 : (0.28 * (1 - f)) / 0.15;
        quad(
          a.clone().setY(0),
          b.clone().setY(0),
          a.clone().add(new THREE.Vector3(0, height, 0)),
          b.clone().add(new THREE.Vector3(0, height, 0)),
        );
      }
      quad(
        previous[0].clone().add(new THREE.Vector3(0, -0.15, 0)),
        edges[0].clone().add(new THREE.Vector3(0, -0.15, 0)),
        previous[1].clone().add(new THREE.Vector3(0, -0.15, 0)),
        edges[1].clone().add(new THREE.Vector3(0, -0.15, 0)),
      );
    }
    previous = edges;
  }
  ramp.material.dispose();
  const water = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    .setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    .setIndex(indices);
  water.computeVertexNormals();
  const banks = new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute(walls, 3),
  );
  banks.computeVertexNormals();
  return { water, banks };
}

export function poolWater(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float time; varying vec2 vUv;
      void main() {
        vec2 p = vUv - vec2(.5, .42); float r = length(p);
        float ring = pow(.5 + .5 * sin(r * 110. - time * 4.), 12.);
        float impact = exp(-r * 18.);
        float foam = impact * (.5 + .5 * sin(p.x * 90. + sin(p.y * 87.) + time * 5.));
        vec3 c = mix(vec3(.025, .12, .16), vec3(.43, .76, .81), foam + ring * .18 * exp(-r * 4.));
        gl_FragColor = vec4(c, .91);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
  material.userData.bloomBlackAdapter = true;
  return material;
}

export function softMist(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main() {
      vUv = uv;
      vec4 center = modelViewMatrix * instanceMatrix * vec4(0., 0., 0., 1.);
      float scale = length(instanceMatrix[0].xyz);
      center.xy += position.xy * scale;
      gl_Position = projectionMatrix * center;
    }`,
    fragmentShader: `varying vec2 vUv; void main() {
      float r = length(vUv - .5) * 2.; if (r > 1.) discard;
      gl_FragColor = vec4(.67, .83, .86, exp(-r * r * 5.) * .15 * (1. - smoothstep(.65, 1., r)));
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
    transparent: true,
    depthWrite: false,
  });
  material.userData.bloomBlackAdapter = true;
  return material;
}
