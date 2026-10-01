import * as THREE from 'three';
import { graphicsQualityProfile, type GraphicsQuality } from '../../config/graphicsQuality';
import { bloomEmission, type BloomEmission } from './bloomEligibility';
import { BloomMaskMaterials } from './BloomMaskMaterials';
import { fullscreenVertex, filterFragment, compositeFragment } from './bloomShaders';
export interface BloomSnapshot {
  enabled: boolean;
  quality: GraphicsQuality;
  maskWidth: number;
  maskHeight: number;
  fallbackReason: string | null;
}
type Renderable = THREE.Object3D & { material: THREE.Material | THREE.Material[] };
interface Resources {
  mask: THREE.WebGLRenderTarget;
  horizontal: THREE.WebGLRenderTarget;
  vertical: THREE.WebGLRenderTarget;
  geometry: THREE.BufferGeometry;
  filter: THREE.ShaderMaterial;
  composite: THREE.ShaderMaterial;
  scene: THREE.Scene;
  mesh: THREE.Mesh;
  camera: THREE.Camera;
}
/** Adds only a selected glow overlay; the ordinary scene remains the base image. */
export class RaceBloom {
  private readonly profile;
  private readonly masks = new BloomMaskMaterials();
  private readonly overrides = new WeakMap<THREE.Object3D, BloomEmission>();
  private readonly adapted = new WeakSet<THREE.ShaderMaterial>();
  private readonly swapped: { object: Renderable; material: THREE.Material | THREE.Material[] }[] =
    [];
  private resources: Resources | null = null;
  private width = 0;
  private height = 0;
  private fallbackReason: string | null = null;
  private disposed = false;
  private buffersValidated = false;
  public constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly quality: GraphicsQuality,
    disabled = false,
  ) {
    this.profile = disabled ? null : graphicsQualityProfile(quality).bloom;
  }
  public register(object: THREE.Object3D, emission: BloomEmission): void {
    this.overrides.set(object, emission);
  }
  public unregister(object: THREE.Object3D): void {
    this.overrides.delete(object);
  }
  public resize(width: number, height: number): void {
    if (!this.profile || this.disposed || this.fallbackReason !== null) return;
    const w = Number.isFinite(width) ? Math.max(1, width) : 1;
    const h = Number.isFinite(height) ? Math.max(1, height) : 1;
    const scale = Math.min(this.profile.scale, this.profile.maxEdge / Math.max(w, h));
    const previousWidth = this.width,
      previousHeight = this.height;
    this.width = Math.max(1, Math.floor(w * scale));
    this.height = Math.max(1, Math.floor(h * scale));
    if (this.width !== previousWidth || this.height !== previousHeight)
      this.buffersValidated = false;
    try {
      this.resources ??= this.createResources();
      for (const target of [
        this.resources.mask,
        this.resources.horizontal,
        this.resources.vertical,
      ]) {
        if (target.width !== this.width || target.height !== this.height)
          target.setSize(this.width, this.height);
      }
    } catch (error) {
      this.fail(error);
    }
  }
  private createResources(): Resources {
    const owned: { dispose(): void }[] = [];
    try {
      const target = (depthBuffer: boolean): THREE.WebGLRenderTarget => {
        const value = new THREE.WebGLRenderTarget(this.width, this.height, {
          depthBuffer,
          stencilBuffer: false,
          type: THREE.UnsignedByteType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
        });
        value.texture.colorSpace = THREE.LinearSRGBColorSpace;
        owned.push(value);
        return value;
      };
      const mask = target(true),
        horizontal = target(false),
        vertical = target(false);
      const geometry = new THREE.BufferGeometry();
      owned.push(geometry);
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
      );
      const filter = new THREE.ShaderMaterial({
        vertexShader: fullscreenVertex,
        fragmentShader: filterFragment,
        uniforms: { source: { value: null }, stepSize: { value: new THREE.Vector2() } },
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      owned.push(filter);
      const composite = new THREE.ShaderMaterial({
        vertexShader: fullscreenVertex,
        fragmentShader: compositeFragment,
        uniforms: { source: { value: vertical.texture }, gain: { value: this.profile?.gain ?? 0 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      owned.push(composite);
      const scene = new THREE.Scene(),
        mesh = new THREE.Mesh(geometry, filter);
      mesh.frustumCulled = false;
      scene.add(mesh);
      return {
        mask,
        horizontal,
        vertical,
        geometry,
        filter,
        composite,
        scene,
        mesh,
        camera: new THREE.Camera(),
      };
    } catch (error) {
      for (const resource of owned) resource.dispose();
      throw error;
    }
  }
  private swap(scene: THREE.Scene): void {
    scene.traverseVisible((object) => {
      if (!('material' in object)) return;
      const renderable = object as Renderable,
        original = renderable.material;
      const variant = (source: THREE.Material): THREE.Material => {
        if (
          source instanceof THREE.ShaderMaterial &&
          source.userData.bloomBlackAdapter === true &&
          !this.adapted.has(source)
        ) {
          this.masks.registerAdapter(source, () => {
            const material = source.clone();
            const end = material.fragmentShader.lastIndexOf('}');
            if (end < 0) throw new Error('Unsupported bloom mask shader');
            material.fragmentShader =
              material.fragmentShader.slice(0, end) +
              'gl_FragColor.rgb = vec3(0.0);\n' +
              material.fragmentShader.slice(end);
            return material;
          });
          this.adapted.add(source);
        }
        return this.masks.variant(source, this.overrides.get(object) ?? bloomEmission(source));
      };
      // Record before conversion so failures in mixed-material arrays also restore earlier objects.
      this.swapped.push({ object: renderable, material: original });
      renderable.material = Array.isArray(original) ? original.map(variant) : variant(original);
    });
  }
  private restoreMaterials(): void {
    for (const entry of this.swapped) entry.object.material = entry.material;
    this.swapped.length = 0;
  }
  public warmup(scene: THREE.Scene, camera: THREE.Camera): void {
    if (!this.resources || this.disposed) return;
    try {
      this.swap(scene);
      this.renderer.compile(scene, camera);
      this.resources.mesh.material = this.resources.filter;
      this.renderer.compile(this.resources.scene, this.resources.camera);
      this.resources.mesh.material = this.resources.composite;
      this.renderer.compile(this.resources.scene, this.resources.camera);
    } catch (error) {
      this.fail(error);
    } finally {
      this.restoreMaterials();
    }
  }
  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    const info = (this.renderer as Partial<THREE.WebGLRenderer>).info as
      (Omit<THREE.WebGLRenderer['info'], 'reset'> & { reset?: () => void }) | undefined;
    const autoReset = info?.autoReset;
    if (info) {
      info.autoReset = false;
      info.reset?.();
    }
    try {
      this.renderPasses(scene, camera);
    } finally {
      if (info) info.autoReset = autoReset ?? true;
    }
  }
  private renderPasses(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
    const r = this.resources;
    if (!r || this.disposed) return;
    const renderer = this.renderer;
    const background = scene.background,
      fog = scene.fog;
    // Guard state retrieval as well as GPU work so unsupported surfaces retain direct rendering.
    let restore: (() => void) | null = null;
    const debug = (renderer as Partial<THREE.WebGLRenderer>).debug;
    const oldShaderError = debug?.onShaderError,
      oldCheckShaderErrors = debug?.checkShaderErrors;
    const restoreDebug = (): void => {
      if (debug) {
        debug.onShaderError = oldShaderError ?? null;
        debug.checkShaderErrors = oldCheckShaderErrors ?? true;
      }
    };
    try {
      const target = renderer.getRenderTarget(),
        viewport = renderer.getViewport(new THREE.Vector4()),
        scissor = renderer.getScissor(new THREE.Vector4());
      const scissorTest = renderer.getScissorTest(),
        clearColor = renderer.getClearColor(new THREE.Color()),
        clearAlpha = renderer.getClearAlpha();
      const autoClear = renderer.autoClear,
        shadowUpdate = renderer.shadowMap.autoUpdate,
        shadowNeeds = renderer.shadowMap.needsUpdate;
      restore = () => {
        renderer.setRenderTarget(target);
        renderer.setViewport(viewport);
        renderer.setScissor(scissor);
        renderer.setScissorTest(scissorTest);
        renderer.setClearColor(clearColor, clearAlpha);
        renderer.autoClear = autoClear;
        renderer.shadowMap.autoUpdate = shadowUpdate;
        renderer.shadowMap.needsUpdate = shadowNeeds;
      };
      if (debug) {
        debug.checkShaderErrors = true;
        debug.onShaderError = () => {
          throw new Error('Bloom shader compilation failed');
        };
      }
      this.swap(scene);
      scene.background = null;
      scene.fog = null;
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = false;
      renderer.setScissorTest(false);
      renderer.autoClear = true;
      renderer.setClearColor(new THREE.Color(0), 0);
      if (!this.buffersValidated) {
        const gl = renderer.getContext();
        for (const buffer of [r.mask, r.horizontal, r.vertical]) {
          renderer.setRenderTarget(buffer);
          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error('Bloom framebuffer initialization failed');
        }
        this.buffersValidated = true;
      }
      renderer.setRenderTarget(r.mask);
      renderer.render(scene, camera);
      this.restoreMaterials();
      scene.background = background;
      scene.fog = fog;
      r.mesh.material = r.filter;
      const sourceUniform = r.filter.uniforms.source;
      const stepUniform = r.filter.uniforms.stepSize;
      if (!sourceUniform || !stepUniform || !(stepUniform.value instanceof THREE.Vector2))
        throw new Error('Missing bloom filter uniforms');
      sourceUniform.value = r.mask.texture;
      stepUniform.value.set((this.profile?.radius ?? 0) / 4 / this.width, 0);
      renderer.setRenderTarget(r.horizontal);
      renderer.render(r.scene, r.camera);
      sourceUniform.value = r.horizontal.texture;
      stepUniform.value.set(0, (this.profile?.radius ?? 0) / 4 / this.height);
      renderer.setRenderTarget(r.vertical);
      renderer.render(r.scene, r.camera);
      r.mesh.material = r.composite;
      renderer.setRenderTarget(target);
      renderer.setViewport(viewport);
      renderer.setScissor(scissor);
      renderer.setScissorTest(scissorTest);
      renderer.autoClear = false;
      renderer.render(r.scene, r.camera);
    } catch (error) {
      this.restoreMaterials();
      scene.background = background;
      scene.fog = fog;
      restore?.();
      restore = null;
      restoreDebug();
      this.fail(error);
      // A composite failure may leave partial glow; redraw the original screen once.
      renderer.render(scene, camera);
    } finally {
      this.restoreMaterials();
      scene.background = background;
      scene.fog = fog;
      restore?.();
      restoreDebug();
    }
  }
  public snapshot(): BloomSnapshot {
    return {
      enabled: this.resources !== null && !this.disposed,
      quality: this.quality,
      maskWidth: this.resources ? this.width : 0,
      maskHeight: this.resources ? this.height : 0,
      fallbackReason: this.fallbackReason,
    };
  }
  private fail(error: unknown): void {
    this.fallbackReason = error instanceof Error ? error.message : 'Bloom unavailable';
    this.release();
  }
  private release(): void {
    this.masks.dispose();
    const r = this.resources;
    this.resources = null;
    if (r) {
      r.mask.dispose();
      r.horizontal.dispose();
      r.vertical.dispose();
      r.geometry.dispose();
      r.filter.dispose();
      r.composite.dispose();
      r.scene.clear();
    }
  }
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.restoreMaterials();
    this.release();
  }
}
