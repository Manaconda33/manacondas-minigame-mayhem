import * as THREE from 'three';
import type { BloomEmission } from './bloomEligibility';

type Colored = THREE.Material & {
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  map?: THREE.Texture | null;
  alphaMap?: THREE.Texture | null;
  emissiveMap?: THREE.Texture | null;
  vertexColors?: boolean;
  wireframe?: boolean;
};
interface Entry {
  variants: Map<BloomEmission | null, THREE.Material>;
  release: () => void;
}
/** Owns mask variants, never the source material or its textures. */
export class BloomMaskMaterials {
  private readonly entries = new Map<THREE.Material, Entry>();
  private readonly adapters = new Map<THREE.ShaderMaterial, () => THREE.ShaderMaterial>();
  public registerAdapter(source: THREE.ShaderMaterial, create: () => THREE.ShaderMaterial): void {
    this.adapters.set(source, create);
  }
  public variant(source: THREE.Material, emission: BloomEmission | null): THREE.Material {
    let entry = this.entries.get(source);
    if (!entry) {
      const release = (): void => {
        const current = this.entries.get(source);
        if (!current) return;
        this.entries.delete(source);
        source.removeEventListener('dispose', release);
        for (const material of current.variants.values()) material.dispose();
        if (source instanceof THREE.ShaderMaterial) this.adapters.delete(source);
      };
      entry = { variants: new Map(), release };
      this.entries.set(source, entry);
      source.addEventListener('dispose', release);
    }
    let result = entry.variants.get(emission);
    if (!result) {
      if (source instanceof THREE.ShaderMaterial) {
        const adapter = this.adapters.get(source);
        if (!adapter) throw new Error(`Unsupported bloom mask: ${source.type}`);
        result = adapter();
      } else if (source instanceof THREE.SpriteMaterial) result = new THREE.SpriteMaterial();
      else if (source instanceof THREE.LineBasicMaterial) result = new THREE.LineBasicMaterial();
      else if (
        source instanceof THREE.MeshBasicMaterial ||
        source instanceof THREE.MeshStandardMaterial ||
        source instanceof THREE.MeshPhongMaterial ||
        source instanceof THREE.MeshLambertMaterial
      )
        result = new THREE.MeshBasicMaterial();
      else throw new Error(`Unsupported bloom mask: ${source.type}`);
      if (source instanceof THREE.MeshBasicMaterial && result instanceof THREE.MeshBasicMaterial) {
        // Preserve coverage hooks such as the dust pool's per-instance alpha fade.
        result.onBeforeCompile = source.onBeforeCompile.bind(source);
        result.customProgramCacheKey = () =>
          `${source.customProgramCacheKey()}:bloom:${emission ?? 'black'}`;
      }
      result.toneMapped = false;
      (result as THREE.MeshBasicMaterial).fog = false;
      entry.variants.set(emission, result);
    }
    this.sync(source, result, emission);
    return result;
  }
  private sync(source: Colored, target: Colored, emission: BloomEmission | null): void {
    for (const key of [
      'transparent',
      'opacity',
      'side',
      'depthTest',
      'depthWrite',
      'colorWrite',
      'alphaTest',
      'alphaHash',
      'alphaToCoverage',
      'premultipliedAlpha',
      'polygonOffset',
      'polygonOffsetFactor',
      'polygonOffsetUnits',
      'visible',
      'stencilWrite',
      'stencilFunc',
      'stencilRef',
      'stencilWriteMask',
      'stencilFuncMask',
      'stencilFail',
      'stencilZFail',
      'stencilZPass',
    ] as const) {
      if (target[key] !== source[key]) {
        (target as unknown as Record<string, unknown>)[key] = source[key];
        target.needsUpdate = true;
      }
    }
    target.blending = emission === null ? THREE.NormalBlending : source.blending;
    target.blendSrc = source.blendSrc;
    target.blendDst = source.blendDst;
    target.blendEquation = source.blendEquation;
    target.blendSrcAlpha = source.blendSrcAlpha;
    target.blendDstAlpha = source.blendDstAlpha;
    target.blendEquationAlpha = source.blendEquationAlpha;
    if (target.color) {
      if (emission === 'emissive' && source.emissive)
        target.color.copy(source.emissive).multiplyScalar(source.emissiveIntensity ?? 1);
      else if (emission === 'color' && source.color) target.color.copy(source.color);
      else target.color.setHex(0);
    }
    for (const key of ['map', 'alphaMap', 'vertexColors', 'wireframe'] as const) {
      if (!(key in target)) continue;
      const value =
        key === 'map' && emission === 'emissive' ? (source.emissiveMap ?? null) : source[key];
      if (target[key] !== value) {
        (target as unknown as Record<string, unknown>)[key] = value;
        target.needsUpdate = true;
      }
    }
    if (source instanceof THREE.SpriteMaterial && target instanceof THREE.SpriteMaterial) {
      target.rotation = source.rotation;
      target.sizeAttenuation = source.sizeAttenuation;
    }
    if (source instanceof THREE.LineBasicMaterial && target instanceof THREE.LineBasicMaterial)
      target.linewidth = source.linewidth;
    if (source instanceof THREE.ShaderMaterial && target instanceof THREE.ShaderMaterial)
      target.uniforms = source.uniforms;
  }
  public dispose(): void {
    for (const entry of [...this.entries.values()]) entry.release();
    this.adapters.clear();
  }
}
