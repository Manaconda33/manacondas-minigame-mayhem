import * as THREE from 'three';
import { billboardStateAt, type BillboardGap } from './NeonGridBillboard';

const SPONSORS = ['arin', 'raven', 'paprika'] as const;
const SHARDS_PER_CROSSING = 12;
const CROSSING_SLOTS = 8;

function apertureCrossing(
  gap: BillboardGap,
  end: 'entrance' | 'exit',
): {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  approachTangent: THREE.Vector3;
  distance: number;
  width: number;
} {
  const length = gap.curve.getLength();
  const lower = end === 'entrance' ? 0 : Math.max(0, length - 22);
  const upper = end === 'entrance' ? Math.min(length, gap.mouthDistance + 10) : length;
  const clearanceAt = (distance: number) => {
    const point = gap.curve.getPointAt(distance / length);
    const projection = gap.track.projectMain(point);
    return projection.lateralDistance - gap.track.halfWidthAt(projection.progress);
  };
  let insideDistance = end === 'entrance' ? lower : upper;
  if (clearanceAt(insideDistance) > 0)
    throw new Error(`Billboard ${end} search must start inside the main route`);
  const span = upper - lower;
  const steps = Math.max(1, Math.ceil(span / 0.25));
  let crossingDistance = Number.NaN;
  for (let i = 1; i <= steps; i++) {
    const fraction = i / steps;
    const distance = end === 'entrance' ? lower + span * fraction : upper - span * fraction;
    if (clearanceAt(distance) < 0) {
      insideDistance = distance;
      continue;
    }
    let low = Math.min(insideDistance, distance);
    let high = Math.max(insideDistance, distance);
    for (let iteration = 0; iteration < 32; iteration++) {
      const middle = (low + high) / 2;
      const middleInside = clearanceAt(middle) <= 0;
      if (middleInside === (insideDistance < distance)) low = middle;
      else high = middle;
    }
    crossingDistance = (low + high) / 2;
    break;
  }
  if (!Number.isFinite(crossingDistance))
    throw new Error(`Billboard ${end} aperture does not cross the main wall`);

  const approachTangent = gap.curve.getTangentAt(crossingDistance / length).normalize();
  const crossingPoint = gap.curve.getPointAt(crossingDistance / length);
  const crossingProjection = gap.track.projectMain(crossingPoint);
  const wallSide = Math.sign(crossingProjection.lateralOffset) || 1;
  const targetProgress = crossingProjection.progress;
  const halfWindow = 24 / gap.track.curve.getLength();
  const searchStart = Math.max(0, targetProgress - halfWindow);
  const searchEnd = Math.min(1, targetProgress + halfWindow);
  const samples = 512;
  const progressAt = (index: number) => searchStart + ((searchEnd - searchStart) * index) / samples;
  const wallPointAt = (progress: number) => {
    const center = gap.track.curve.getPointAt(progress);
    const tangent = gap.track.curve.getTangentAt(progress);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    return center.addScaledVector(right, wallSide * gap.track.halfWidthAt(progress));
  };
  const openAt = (progress: number) => gap.junctionContains(wallPointAt(progress));
  const runs: number[][] = [];
  for (let i = 0; i <= samples; i++) {
    if (!openAt(progressAt(i))) continue;
    const run = runs.at(-1);
    if (run && i === (run.at(-1) ?? -2) + 1) run.push(i);
    else runs.push([i]);
  }
  const runCenter = (run: number[]) => ((run.at(0) ?? samples) + (run.at(-1) ?? samples)) / 2;
  const run = runs.sort(
    (a, b) => Math.abs(runCenter(a) - samples / 2) - Math.abs(runCenter(b) - samples / 2),
  )[0];
  const runStart = run?.at(0);
  const runEnd = run?.at(-1);
  if (runStart === undefined || runEnd === undefined || runStart === 0 || runEnd === samples)
    throw new Error(`Billboard ${end} wall opening endpoints could not be measured`);
  const boundary = (outsideIndex: number, insideIndex: number) => {
    let outside = progressAt(outsideIndex);
    let inside = progressAt(insideIndex);
    for (let i = 0; i < 28; i++) {
      const middle = (outside + inside) / 2;
      if (openAt(middle)) inside = middle;
      else outside = middle;
    }
    return { progress: (outside + inside) / 2, point: wallPointAt((outside + inside) / 2) };
  };
  const first = boundary(runStart - 1, runStart);
  const last = boundary(runEnd + 1, runEnd);
  const width = Math.hypot(last.point.x - first.point.x, last.point.z - first.point.z);
  if (width < 1) throw new Error(`Billboard ${end} wall opening is too narrow`);
  const tangent = last.point.clone().sub(first.point).setY(0).normalize();
  const position = first.point.clone().lerp(last.point, 0.5);
  position.y = gap.project(position).point.y;
  return {
    position,
    tangent,
    approachTangent,
    distance: crossingDistance,
    width,
  };
}

/** Visual-only: same race clock and physical mouth as traversal, no collision. */
export class NeonGridBillboardVisual {
  public readonly group = new THREE.Group();
  private readonly ads: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[][] = [];
  private readonly frameMaterial = new THREE.MeshBasicMaterial({ color: 0x58dbff });
  private readonly shards = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.14, 0.25),
    new THREE.MeshBasicMaterial({
      color: 0x8debff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
    SHARDS_PER_CROSSING * CROSSING_SLOTS,
  );
  private readonly bursts = Array.from({ length: CROSSING_SLOTS }, () => ({
    time: -Infinity,
    position: new THREE.Vector3(),
    on: false,
  }));
  private slot = 0;
  private disposed = false;
  private readonly scratch = new THREE.Object3D();

  public constructor(gap: BillboardGap) {
    this.group.name = 'billboard-hologram';
    const createPortal = (
      name: 'entrance' | 'exit',
      crossing: ReturnType<typeof apertureCrossing>,
    ) => {
      const portal = new THREE.Group();
      portal.name = `billboard-portal-${name}`;
      portal.position.copy(crossing.position);
      const wallTangent = crossing.tangent.clone();
      portal.rotation.y = Math.atan2(-wallTangent.z, wallTangent.x);
      const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        portal.rotation.y,
      );
      if (front.dot(crossing.approachTangent) > 0) portal.rotation.y += Math.PI;
      const portalAds: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
      const artWidth = crossing.width;
      const artHeight = (artWidth * 9) / 16;
      for (const sponsor of SPONSORS) {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: new THREE.Texture() },
            time: { value: 0 },
            tell: { value: 0 },
            opacity: { value: 0.72 },
            on: { value: 1 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          vertexShader:
            'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
          fragmentShader: `uniform sampler2D map; uniform float time,tell,opacity,on; varying vec2 vUv;
            void main(){
              float stripe=floor(vUv.y*48.0);
              float pulse=sin(time*28.0+stripe*7.0);
              vec2 uv=vUv; uv.x+=tell*0.012*pulse;
              vec4 ad=texture2D(map,uv);
              float scan=0.94+0.06*sin(vUv.y*650.0-time*2.0)*on;
              float glitch=1.0-tell*0.24*step(0.25,pulse);
              gl_FragColor=vec4(ad.rgb*scan,opacity*glitch);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`,
        });
        const ad = new THREE.Mesh(new THREE.PlaneGeometry(artWidth, artHeight), material);
        ad.name = name === 'entrance' ? `billboard-ad-${sponsor}` : `billboard-exit-ad-${sponsor}`;
        ad.position.y = artHeight / 2;
        portal.add(ad);
        portalAds.push(ad);
      }
      const frame = new THREE.Group();
      frame.name = name === 'entrance' ? 'billboard-frame' : 'billboard-exit-frame';
      for (const x of [-artWidth / 2 + 0.45, artWidth / 2 - 0.45]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, artHeight + 0.2, 0.18), this.frameMaterial);
        post.position.set(x, artHeight / 2, 0);
        frame.add(post);
      }
      const top = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, artWidth - 0.72), 0.18, 0.18), this.frameMaterial);
      top.position.y = artHeight + 0.1;
      frame.add(top);
      portal.add(frame);
      this.group.add(portal);
      this.ads.push(portalAds);
    };
    createPortal('entrance', apertureCrossing(gap, 'entrance'));
    createPortal('exit', apertureCrossing(gap, 'exit'));
    this.shards.name = 'billboard-shards';
    this.shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.shards.frustumCulled = false;
    this.shards.visible = false;
    this.group.add(this.shards);
    this.update(0);
  }

  public async load(): Promise<void> {
    const loader = new THREE.TextureLoader();
    // Await every result so disposal on a failed load cannot race another upload.
    const results = await Promise.allSettled(
      SPONSORS.map((sponsor) =>
        loader.loadAsync(
          `${import.meta.env.BASE_URL}assets/track/neon-grid/billboard/${sponsor}-v1.webp`,
        ),
      ),
    );
    results.forEach((result, i) => {
      if (result.status === 'rejected') return;
      const texture = result.value;
      if (this.disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      this.ads.forEach((portalAds) => {
        const uniform = portalAds[i]?.material.uniforms.map;
        if (!uniform) return;
        (uniform.value as THREE.Texture).dispose();
        uniform.value = texture;
      });
    });
    if (results.some((result) => result.status === 'rejected'))
      throw new Error('Neon Grid sponsor artwork failed to load');
  }

  public smash(position: THREE.Vector3, on: boolean, raceSeconds: number): void {
    const burst = this.bursts[this.slot];
    if (!burst || this.disposed) return;
    burst.position.copy(position);
    burst.time = raceSeconds;
    burst.on = on;
    this.slot = (this.slot + 1) % CROSSING_SLOTS;
  }

  public update(raceSeconds: number): void {
    if (this.disposed) return;
    const state = billboardStateAt(raceSeconds);
    const phase = THREE.MathUtils.euclideanModulo(Math.max(0, raceSeconds), 6);
    const active = state.on ? (phase < 2 ? 0 : 1) : 2;
    this.ads.forEach((portalAds) => {
      portalAds.forEach((ad, i) => {
        const uniforms = ad.material.uniforms;
        if (!uniforms.time || !uniforms.tell || !uniforms.on || !uniforms.opacity) return;
        ad.visible = i === active;
        uniforms.time.value = raceSeconds;
        uniforms.tell.value = state.tellIntensity;
        uniforms.on.value = state.on ? 1 : 0;
        uniforms.opacity.value = state.on ? 0.72 : 0.48;
      });
    });
    // ON ad rotation is distinct from the stronger 0.8s state-change tell.
    this.frameMaterial.color.setHex(state.on ? 0x58dbff : 0xffcf76);
    this.frameMaterial.color.multiplyScalar(
      1 - state.tellIntensity * 0.25 * (1 + Math.sin(raceSeconds * 28)),
    );
    let visible = false;
    for (let slot = 0; slot < CROSSING_SLOTS; slot++) {
      const burst = this.bursts[slot];
      if (!burst) continue;
      const elapsed = raceSeconds - burst.time;
      const alive = elapsed >= 0 && elapsed < 0.55;
      const age = alive ? elapsed : 0;
      visible ||= alive;
      for (let j = 0; j < SHARDS_PER_CROSSING; j++) {
        const angle = (j * Math.PI * 2) / SHARDS_PER_CROSSING;
        this.scratch.position.copy(burst.position);
        this.scratch.position.x += Math.cos(angle) * age * 3;
        this.scratch.position.z += Math.sin(angle) * age * 3;
        this.scratch.position.y += 0.5 + age * (burst.on ? 2 : 1.2);
        this.scratch.rotation.set(age * 4, angle, age * 3);
        this.scratch.scale.setScalar(alive ? (1 - age / 0.55) * (burst.on ? 1 : 0.7) : 0);
        this.scratch.updateMatrix();
        this.shards.setMatrixAt(slot * SHARDS_PER_CROSSING + j, this.scratch.matrix);
      }
    }
    this.shards.visible = visible;
    this.shards.instanceMatrix.needsUpdate = true;
  }

  /** Geometry/materials/textures are released by the owning track scene. */
  public stop(): void {
    this.disposed = true;
  }
}
