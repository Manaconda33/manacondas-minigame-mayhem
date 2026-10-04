import * as THREE from 'three';
import { billboardStateAt, type BillboardGap } from './NeonGridBillboard';

const SPONSORS = ['arin', 'raven', 'paprika'] as const;
const SHARDS_PER_CROSSING = 12;
const CROSSING_SLOTS = 8;

/** Visual-only: same race clock and physical mouth as traversal, no collision. */
export class NeonGridBillboardVisual {
  public readonly group = new THREE.Group();
  private readonly ads: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
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
    const mouth = gap.curve.getPointAt(gap.mouthDistance / gap.curve.getLength());
    const tangent = gap.curve.getTangentAt(0);
    const portal = new THREE.Group();
    portal.position.copy(mouth);
    portal.rotation.y = Math.atan2(tangent.x, tangent.z) + Math.PI;
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
      const ad = new THREE.Mesh(new THREE.PlaneGeometry(12, 6.75), material);
      ad.name = `billboard-ad-${sponsor}`;
      ad.position.y = 3.475;
      portal.add(ad);
      this.ads.push(ad);
    }
    const frame = new THREE.Group();
    frame.name = 'billboard-frame';
    for (const x of [-6.35, 6.35]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.1, 0.18), this.frameMaterial);
      post.position.set(x, 3.55, 0);
      frame.add(post);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(12.88, 0.18, 0.18), this.frameMaterial);
    top.position.y = 7.05;
    frame.add(top);
    portal.add(frame);
    this.group.add(portal);
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
      const uniform = this.ads[i]?.material.uniforms.map;
      if (uniform) {
        (uniform.value as THREE.Texture).dispose();
        uniform.value = texture;
      }
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
    this.ads.forEach((ad, i) => {
      const uniforms = ad.material.uniforms;
      if (!uniforms.time || !uniforms.tell || !uniforms.on || !uniforms.opacity) return;
      ad.visible = i === active;
      uniforms.time.value = raceSeconds;
      uniforms.tell.value = state.tellIntensity;
      uniforms.on.value = state.on ? 1 : 0;
      uniforms.opacity.value = state.on ? 0.72 : 0.48;
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
