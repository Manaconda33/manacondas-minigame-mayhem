import { expect, it } from 'vitest';
import * as THREE from 'three';
import { RaceBloom } from '../src/game/rendering/RaceBloom';
import { markBloomMaterial } from '../src/game/rendering/bloomEligibility';
function rendererFixture() {
  let target: THREE.WebGLRenderTarget | null = null;
  const viewport = new THREE.Vector4(0, 0, 1920, 1080),
    scissor = viewport.clone(),
    clear = new THREE.Color(0x123456);
  const seen: { target: THREE.WebGLRenderTarget | null; color: number | null }[] = [];
  const renderer = {
    info: {
      autoReset: true,
      render: { calls: 0, triangles: 0 },
      reset() {
        this.render.calls = 0;
        this.render.triangles = 0;
      },
    },
    debug: { checkShaderErrors: false, onShaderError: null as (() => void) | null },
    getContext: () => ({
      FRAMEBUFFER: 0x8d40,
      FRAMEBUFFER_COMPLETE: 0x8cd5,
      checkFramebufferStatus: () => 0x8cd5,
    }),
    autoClear: true,
    shadowMap: { autoUpdate: true, needsUpdate: false },
    outputColorSpace: THREE.SRGBColorSpace,
    getRenderTarget: () => target,
    setRenderTarget: (value: THREE.WebGLRenderTarget | null) => {
      target = value;
      viewport.set(0, 0, value?.width ?? 1920, value?.height ?? 1080);
      scissor.copy(viewport);
    },
    getViewport: (v: THREE.Vector4) => v.copy(viewport),
    setViewport: (v: THREE.Vector4) => {
      viewport.copy(v);
    },
    getScissor: (v: THREE.Vector4) => v.copy(scissor),
    setScissor: (v: THREE.Vector4) => {
      scissor.copy(v);
    },
    getScissorTest: () => false,
    setScissorTest: () => {
      /* GPU boundary; scissor tested through saved state. */
    },
    getClearColor: (c: THREE.Color) => c.copy(clear),
    getClearAlpha: () => 1,
    setClearColor: (c: THREE.Color) => {
      clear.copy(c);
    },
    clear: () => {
      /* GPU boundary. */
    },
    compile: () => {
      /* GPU boundary. */
    },
    render: (scene: THREE.Scene) => {
      const m = (scene.children[0] as THREE.Mesh | undefined)?.material as
        Partial<THREE.MeshBasicMaterial> | undefined;
      if (renderer.info.autoReset) renderer.info.reset();
      renderer.info.render.calls += seen.length === 0 ? 22 : seen.length === 1 ? 17 : 1;
      seen.push({ target, color: m?.color?.getHex() ?? null });
    },
  };
  return { renderer: renderer as unknown as THREE.WebGLRenderer, seen, state: renderer };
}
it('bypasses Low and caps enabled buffer dimensions with preserved aspect', () => {
  const f = rendererFixture(),
    low = new RaceBloom(f.renderer, 'low');
  low.resize(1920, 1080);
  low.render(new THREE.Scene(), new THREE.Camera());
  expect(low.snapshot()).toMatchObject({ enabled: false, maskWidth: 0, maskHeight: 0 });
  expect(f.seen).toHaveLength(1);
  const medium = new RaceBloom(f.renderer, 'medium');
  medium.resize(1920, 1080);
  expect(medium.snapshot()).toMatchObject({ enabled: true, maskWidth: 768, maskHeight: 432 });
  medium.resize(1080, 1920);
  expect(medium.snapshot()).toMatchObject({ maskWidth: 432, maskHeight: 768 });
  const high = new RaceBloom(f.renderer, 'high');
  high.resize(1920, 1080);
  expect(high.snapshot()).toMatchObject({ maskWidth: 960, maskHeight: 540 });
  high.resize(3840, 2160);
  expect(high.snapshot()).toMatchObject({ maskWidth: 1024, maskHeight: 576 });
  high.resize(0, 0);
  expect(high.snapshot()).toMatchObject({ maskWidth: 1, maskHeight: 1 });
  low.dispose();
  medium.dispose();
  high.dispose();
});
it('renders an occluding mask and restores original scene and renderer after all passes', () => {
  const f = rendererFixture(),
    bloom = new RaceBloom(f.renderer, 'medium');
  bloom.resize(1920, 1080);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xabcdef);
  scene.fog = new THREE.Fog(0xffffff, 1, 5);
  const original = new THREE.MeshBasicMaterial({ color: 0xffffff });
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(), original));
  const energy = markBloomMaterial(new THREE.MeshBasicMaterial({ color: 0x00ff00 }), 'color');
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(), energy));
  const bg = scene.background,
    fog = scene.fog;
  bloom.render(scene, new THREE.Camera());
  expect(f.seen).toHaveLength(5);
  expect(f.seen[0]?.target).toBeNull();
  expect(f.seen[1]?.color).toBe(0);
  expect((scene.children[0] as THREE.Mesh).material).toBe(original);
  expect(scene.background).toBe(bg);
  expect(scene.fog).toBe(fog);
  expect(f.renderer.getViewport(new THREE.Vector4()).toArray()).toEqual([0, 0, 1920, 1080]);
  expect(f.state.autoClear).toBe(true);
  expect(f.state.shadowMap.autoUpdate).toBe(true);
  expect(f.renderer.getRenderTarget()).toBeNull();
  bloom.dispose();
  bloom.dispose();
  original.dispose();
  energy.dispose();
});
it('restores state and disables bloom after unsupported mask without changing base image', () => {
  const f = rendererFixture(),
    bloom = new RaceBloom(f.renderer, 'high');
  bloom.resize(100, 100);
  const scene = new THREE.Scene(),
    source = new THREE.ShaderMaterial();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(), source));
  bloom.render(scene, new THREE.Camera());
  expect(bloom.snapshot()).toMatchObject({ enabled: false });
  expect(bloom.snapshot().fallbackReason).toContain('Unsupported bloom mask');
  expect((scene.children[0] as THREE.Mesh).material).toBe(source);
  expect(f.renderer.getRenderTarget()).toBeNull();
  expect(f.renderer.getViewport(new THREE.Vector4()).toArray()).toEqual([0, 0, 1920, 1080]);
  expect(f.state.autoClear).toBe(true);
  const calls = f.seen.length;
  bloom.render(scene, new THREE.Camera());
  expect(f.seen.length - calls).toBe(1);
  bloom.dispose();
});

it('counts base mask and all fullscreen passes as one frame', () => {
  const f = rendererFixture(),
    bloom = new RaceBloom(f.renderer, 'medium');
  bloom.resize(100, 100);
  bloom.render(new THREE.Scene(), new THREE.Camera());
  expect(f.state.info.render.calls).toBe(42);
  expect(f.state.info.autoReset).toBe(true);
  bloom.dispose();
});

it('disables failed GPU shader linking and incomplete buffers and restores debug hooks', () => {
  for (const failure of ['shader', 'framebuffer']) {
    const f = rendererFixture();
    const original = f.state.debug.onShaderError;
    const originalRender = f.state.render;
    let calls = 0;
    f.state.render = (scene) => {
      calls++;
      if (failure === 'shader' && calls === 2) f.state.debug.onShaderError?.();
      originalRender(scene);
    };
    if (failure === 'framebuffer')
      f.state.getContext = () => ({
        FRAMEBUFFER: 0x8d40,
        FRAMEBUFFER_COMPLETE: 0x8cd5,
        checkFramebufferStatus: () => 0x8cd6,
      });
    const bloom = new RaceBloom(f.renderer, 'medium');
    bloom.resize(100, 100);
    bloom.render(new THREE.Scene(), new THREE.Camera());
    expect(bloom.snapshot().enabled).toBe(false);
    expect(bloom.snapshot().fallbackReason).toMatch(/shader|framebuffer/i);
    expect(f.state.debug.onShaderError).toBe(original);
    expect(f.state.debug.checkShaderErrors).toBe(false);
    const before = calls;
    bloom.render(new THREE.Scene(), new THREE.Camera());
    expect(calls - before).toBe(1);
    bloom.dispose();
  }
});
it('restores material target and renderer state after a failure in each pass', () => {
  for (const failPass of [2, 3, 4, 5]) {
    const f = rendererFixture(),
      render = f.state.render;
    let calls = 0;
    f.state.render = (scene) => {
      calls++;
      if (calls === failPass) throw new Error('injected pass failure');
      render(scene);
    };
    const scene = new THREE.Scene(),
      source = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(), source));
    const bloom = new RaceBloom(f.renderer, 'high');
    bloom.resize(100, 100);
    bloom.render(scene, new THREE.Camera());
    expect(bloom.snapshot().enabled).toBe(false);
    expect((scene.children[0] as THREE.Mesh).material).toBe(source);
    expect(f.renderer.getRenderTarget()).toBeNull();
    expect(f.renderer.getViewport(new THREE.Vector4()).toArray()).toEqual([0, 0, 1920, 1080]);
    expect(f.state.autoClear).toBe(true);
    expect(f.state.shadowMap.autoUpdate).toBe(true);
    expect(f.state.info.autoReset).toBe(true);
    bloom.dispose();
    source.dispose();
  }
});

it('keeps material-array selection separate and preserves instance colors', () => {
  const f = rendererFixture(),
    originalRender = f.state.render;
  const source = [
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    markBloomMaterial(new THREE.MeshBasicMaterial({ color: 0x00ff00 }), 'color'),
  ];
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(), source, 2);
  mesh.setColorAt(0, new THREE.Color(0xff0000));
  mesh.setColorAt(1, new THREE.Color(0x0000ff));
  const colors = mesh.instanceColor?.array.slice();
  const scene = new THREE.Scene();
  scene.add(mesh);
  let calls = 0;
  f.state.render = (s) => {
    calls++;
    if (calls === 2) {
      const masked = mesh.material;
      expect(masked[0]?.color.getHex()).toBe(0);
      expect(masked[1]?.color.getHex()).toBe(0x00ff00);
      expect(mesh.instanceColor?.array).toEqual(colors);
    }
    originalRender(s);
  };
  const bloom = new RaceBloom(f.renderer, 'medium');
  bloom.resize(100, 100);
  bloom.render(scene, new THREE.Camera());
  expect(mesh.material).toBe(source);
  expect(bloom.snapshot().enabled).toBe(true);
  bloom.dispose();
});
