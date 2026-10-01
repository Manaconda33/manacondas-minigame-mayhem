import * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';

export interface MotionBlurSnapshot {
  enabled: boolean;
  strength: number;
  textureBytes: number;
  fallbackReason: string | null;
}

/** Current-frame peripheral smear. Never replaces the accepted base/bloom image. */
export class RaceMotionBlur {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.Camera();
  private resources: {
    left: THREE.FramebufferTexture;
    right: THREE.FramebufferTexture;
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  } | null = null;
  private width = 0;
  private height = 0;
  private bandWidth = 0;
  private bandHeight = 0;
  private bandY = 0;
  private intensity = 0;
  private frames = 0;
  private slowFrames = 0;
  private readonly timings = new Float64Array(30);
  private timingIndex = 0;
  private timingCount = 0;
  private timingSum = 0;
  private disposed = false;
  private fallbackReason: string | null = null;
  private readonly allowed: boolean;
  private readonly maxStrength: number;

  public constructor(
    private readonly renderer: THREE.WebGLRenderer,
    quality: GraphicsQuality,
    enabled = true,
  ) {
    this.allowed = enabled && quality !== 'low';
    this.maxStrength = quality === 'high' ? 0.32 : 0.22;
    this.samples = quality === 'high' ? 5 : 3;
    this.radius = quality === 'high' ? 12 : 6;
  }
  private readonly samples: number;
  private readonly radius: number;

  public resize(width: number, height: number): void {
    if (!this.allowed || this.disposed || this.fallbackReason !== null) return;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return;
    if (width > 4096 || height > 4096 || width * height > 8388608) {
      this.fail('Buffer budget');
      return;
    }
    if (this.width === width && this.height === height && this.resources) return;
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.bandWidth = Math.max(1, Math.floor(this.width * 0.2));
    this.bandY = Math.floor(this.height * 0.2);
    this.bandHeight = Math.max(1, Math.floor(this.height * 0.8) - this.bandY);
    try {
      const texture = (): THREE.FramebufferTexture => {
        const value = new THREE.FramebufferTexture(this.bandWidth, this.bandHeight);
        // Already display-encoded framebuffer bytes; no second tone/color conversion.
        value.colorSpace = THREE.NoColorSpace;
        value.minFilter = value.magFilter = THREE.LinearFilter;
        return value;
      };
      if (this.resources) {
        this.resources.left.dispose();
        this.resources.right.dispose();
        this.resources.left = texture();
        this.resources.right = texture();
      } else {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
        );
        const material = new THREE.ShaderMaterial({
          uniforms: {
            left: { value: null },
            right: { value: null },
            strength: { value: 0 },
            band: { value: new THREE.Vector4() },
            bufferSize: { value: new THREE.Vector2() },
          },
          vertexShader: `varying vec2 uvScreen; void main() { uvScreen = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
          fragmentShader: `
            uniform sampler2D left; uniform sampler2D right;
            uniform float strength; uniform vec4 band; uniform vec2 bufferSize;
            varying vec2 uvScreen;
            void main() {
              bool isLeft = uvScreen.x < band.x;
              if ((!isLeft && uvScreen.x < 1.0 - band.x) || uvScreen.y < band.y || uvScreen.y > band.y + band.z) discard;
              vec2 uv = vec2(isLeft ? uvScreen.x / band.x : (uvScreen.x - (1.0 - band.x)) / band.x, (uvScreen.y - band.y) / band.z);
              float edge = smoothstep(0.6, 0.95, abs(uvScreen.x * 2.0 - 1.0));
              float vertical = smoothstep(band.y, band.y + 0.08, uvScreen.y) * (1.0 - smoothstep(band.y + band.z - 0.08, band.y + band.z, uvScreen.y));
              vec2 delta = (uvScreen - 0.5) * ${this.radius.toFixed(1)} * (strength / ${this.maxStrength.toFixed(2)}) / bufferSize / vec2(band.x, band.z);
              vec3 color = vec3(0.0);
              for (int i = 0; i < ${String(this.samples)}; i++) {
                vec2 sampleUv = clamp(uv + delta * (float(i) / ${String(this.samples - 1)}.0 - 0.5), vec2(0.0), vec2(1.0));
                color += isLeft ? texture2D(left, sampleUv).rgb : texture2D(right, sampleUv).rgb;
              }
              gl_FragColor = vec4(color / ${String(this.samples)}.0, strength * edge * vertical);
            }`,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          toneMapped: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        this.scene.add(mesh);
        this.resources = { left: texture(), right: texture(), mesh };
      }
      const uniforms = this.resources.mesh.material.uniforms;
      const left = uniforms.left,
        right = uniforms.right,
        band = uniforms.band,
        size = uniforms.bufferSize;
      if (!left || !right || !band || !size) throw new Error('Missing blur uniforms');
      left.value = this.resources.left;
      right.value = this.resources.right;
      (band.value as THREE.Vector4).set(
        this.bandWidth / this.width,
        this.bandY / this.height,
        this.bandHeight / this.height,
        0,
      );
      (size.value as THREE.Vector2).set(this.width, this.height);
      const debug = (this.renderer as Partial<THREE.WebGLRenderer>).debug;
      const oldHook = debug?.onShaderError,
        oldCheck = debug?.checkShaderErrors;
      try {
        if (debug) {
          debug.checkShaderErrors = true;
          debug.onShaderError = () => {
            throw new Error('Blur shader compilation failed');
          };
        }
        const initTexture = (this.renderer as Partial<THREE.WebGLRenderer>).initTexture;
        initTexture?.call(this.renderer, this.resources.left);
        initTexture?.call(this.renderer, this.resources.right);
        this.renderer.compile(this.scene, this.camera);
      } finally {
        if (debug) {
          debug.onShaderError = oldHook ?? null;
          debug.checkShaderErrors = oldCheck ?? true;
        }
      }
    } catch (error) {
      this.fail(error instanceof Error ? error.message : 'Blur unavailable');
    }
  }

  public update(speed: number, seconds: number, eligible: boolean, rawFrameMs: number): void {
    if (!this.allowed || this.disposed || this.fallbackReason !== null) return;
    if (!eligible) {
      this.clear();
      return;
    }
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const ratio = THREE.MathUtils.clamp(((Number.isFinite(speed) ? speed : 0) - 0.7) / 0.3, 0, 1);
    const target = ratio * ratio * (3 - 2 * ratio);
    this.intensity += (target - this.intensity) * (1 - Math.exp(-5 * Math.min(seconds, 0.1)));
    // Only score valid frames while blur is actually active. Boundaries/paused time aren't costs.
    if (this.intensity < 0.01 || !Number.isFinite(rawFrameMs) || rawFrameMs <= 0) return;
    this.frames++;
    if (this.frames > 60) {
      const budgetMs = 1000 / 60 + 1;
      this.slowFrames = rawFrameMs > budgetMs ? this.slowFrames + 1 : 0;
      this.timingSum += rawFrameMs - (this.timings[this.timingIndex] ?? 0);
      this.timings[this.timingIndex] = rawFrameMs;
      this.timingIndex = (this.timingIndex + 1) % this.timings.length;
      this.timingCount = Math.min(this.timingCount + 1, this.timings.length);
      if (
        this.slowFrames >= 12 ||
        (this.timingCount === this.timings.length && this.timingSum / this.timingCount > budgetMs)
      ) {
        this.fail('Frame budget');
        return;
      }
    }
  }

  public render(active = true): void {
    const r = this.resources;
    if (!r || this.disposed || !active || this.intensity < 0.01) return;
    const autoClear = this.renderer.autoClear,
      autoReset = this.renderer.info.autoReset;
    const debug = (this.renderer as Partial<THREE.WebGLRenderer>).debug,
      oldHook = debug?.onShaderError,
      oldCheck = debug?.checkShaderErrors;
    try {
      if (debug) {
        debug.checkShaderErrors = true;
        debug.onShaderError = () => {
          throw new Error('Blur shader compilation failed');
        };
      }
      this.renderer.copyFramebufferToTexture(r.left, new THREE.Vector2(0, this.bandY));
      this.renderer.copyFramebufferToTexture(
        r.right,
        new THREE.Vector2(this.width - this.bandWidth, this.bandY),
      );
      this.renderer.autoClear = false;
      this.renderer.info.autoReset = false;
      const strength = r.mesh.material.uniforms.strength;
      if (!strength) throw new Error('Missing blur strength');
      strength.value = this.intensity * this.maxStrength;
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      this.fail(error instanceof Error ? error.message : 'Blur unavailable');
    } finally {
      this.renderer.autoClear = autoClear;
      this.renderer.info.autoReset = autoReset;
      if (debug) {
        debug.onShaderError = oldHook ?? null;
        debug.checkShaderErrors = oldCheck ?? true;
      }
    }
  }
  public clear(): void {
    this.intensity = 0;
    this.slowFrames = 0;
    this.frames = 0;
    this.timings.fill(0);
    this.timingIndex = this.timingCount = this.timingSum = 0;
  }
  public snapshot(): MotionBlurSnapshot {
    return {
      enabled: this.resources !== null && !this.disposed,
      strength: this.intensity * this.maxStrength,
      textureBytes: this.resources ? this.bandWidth * this.bandHeight * 8 : 0,
      fallbackReason: this.fallbackReason,
    };
  }
  private fail(reason: string): void {
    this.fallbackReason = reason;
    this.clear();
    this.release();
  }
  private release(): void {
    const r = this.resources;
    this.resources = null;
    if (r) {
      r.left.dispose();
      r.right.dispose();
      r.mesh.geometry.dispose();
      r.mesh.material.dispose();
      this.scene.clear();
    }
  }
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clear();
    this.release();
  }
}
