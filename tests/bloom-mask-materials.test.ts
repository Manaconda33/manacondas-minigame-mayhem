import { WheelDustVisual } from '../src/game/vfx/WheelDustVisual';
import { expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { BloomMaskMaterials } from '../src/game/rendering/BloomMaskMaterials';
it('keeps sprite alpha coverage while suppressing unselected color', () => {
  const masks = new BloomMaskMaterials();
  const map = new THREE.Texture();
  const source = new THREE.SpriteMaterial({
    map,
    alphaTest: 0.2,
    color: 0xffffff,
    opacity: 0.6,
    depthWrite: false,
  });
  const mask = masks.variant(source, null) as THREE.SpriteMaterial;
  expect(mask.color.getHex()).toBe(0);
  expect(mask.map).toBe(map);
  expect(mask.alphaTest).toBe(0.2);
  expect(mask.opacity).toBe(0.6);
  expect(source.color.getHex()).toBe(0xffffff);
  masks.dispose();
});
it('syncs emissive and instance-compatible mask properties and releases only owned variants', () => {
  const masks = new BloomMaskMaterials();
  const source = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0x00ff00,
    emissiveIntensity: 0.5,
    side: THREE.DoubleSide,
  });
  const sourceDispose = vi.spyOn(source, 'dispose');
  const mask = masks.variant(source, 'emissive') as THREE.MeshBasicMaterial;
  expect(mask.color.r).toBe(0);
  expect(mask.color.g).toBeCloseTo(0.5);
  const release = vi.spyOn(mask, 'dispose');
  source.emissive.setHex(0x0000ff);
  source.opacity = 0.3;
  expect(masks.variant(source, 'emissive')).toBe(mask);
  expect(mask.color.b).toBeCloseTo(0.5);
  expect(mask.opacity).toBe(0.3);
  expect(mask.side).toBe(THREE.DoubleSide);
  source.dispose();
  masks.dispose();
  masks.dispose();
  expect(release).toHaveBeenCalledTimes(1);
  expect(sourceDispose).toHaveBeenCalledTimes(1);
});
it('requires explicit custom shader adapters and retains their vertex contract', () => {
  const masks = new BloomMaskMaterials();
  const shader = new THREE.ShaderMaterial({
    vertexShader: 'void main(){gl_Position=vec4(0.0);}',
    fragmentShader: 'void main(){gl_FragColor=vec4(1.0);}',
  });
  expect(() => masks.variant(shader, null)).toThrow('Unsupported bloom mask');
  masks.registerAdapter(shader, () => shader.clone());
  const adapted = masks.variant(shader, null) as THREE.ShaderMaterial;
  expect(adapted).not.toBe(shader);
  expect(adapted.vertexShader).toBe(shader.vertexShader);
  masks.dispose();
});

it('retains customized per-instance dust alpha coverage in the black mask', () => {
  const dust = new WheelDustVisual('medium');
  const mesh = dust.group.children[0] as THREE.InstancedMesh<
    THREE.BufferGeometry,
    THREE.MeshBasicMaterial
  >;
  const masks = new BloomMaskMaterials();
  const mask = masks.variant(mesh.material, null);
  const shader = {
    vertexShader: THREE.ShaderLib.basic.vertexShader,
    fragmentShader: THREE.ShaderLib.basic.fragmentShader,
    uniforms: {},
  };
  mask.onBeforeCompile(
    shader as Parameters<THREE.Material['onBeforeCompile']>[0],
    {} as THREE.WebGLRenderer,
  );
  expect(shader.vertexShader).toContain('vDustOpacity = dustOpacity');
  expect(shader.fragmentShader).toContain('diffuseColor.a *= vDustOpacity');
  expect(mask.customProgramCacheKey()).toContain('player-wheel-dust-v1');
  masks.dispose();
  dust.dispose();
});

it('retires every owned variant across repeated dynamic source recreation', () => {
  const masks = new BloomMaskMaterials();
  const releases: (() => number)[] = [];
  for (let i = 0; i < 40; i++) {
    const source = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const variant = masks.variant(source, 'color');
    const release = vi.spyOn(variant, 'dispose');
    releases.push(() => release.mock.calls.length);
    source.dispose();
  }
  masks.dispose();
  expect(releases.every((release) => release() === 1)).toBe(true);
});
