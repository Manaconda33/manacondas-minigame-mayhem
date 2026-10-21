import { expect, it } from 'vitest';
import * as THREE from 'three';
import { RaceMotionBlur } from '../src/game/rendering/RaceMotionBlur';
import { RenderPassInstrumentation } from '../src/game/diagnostics/RenderPassInstrumentation';

function fixture() {
  const copies: { width: number; height: number; x: number; y: number }[] = [];
  const draws: THREE.Scene[] = [];
  const bufferSize = new THREE.Vector2(1920, 1080);
  let fail = false;
  const renderer = {
    info: { autoReset: true, render: { calls: 0, triangles: 0 } },
    autoClear: true,
    debug: { checkShaderErrors: false, onShaderError: null as (() => void) | null },
    copyFramebufferToTexture(texture: THREE.FramebufferTexture, position: THREE.Vector2) {
      if (fail) throw new Error('copy unavailable');
      copies.push({
        width: texture.image.width,
        height: texture.image.height,
        x: position.x,
        y: position.y,
      });
    },
    render(scene: THREE.Scene) {
      draws.push(scene);
      renderer.info.render.calls++;
      renderer.info.render.triangles += 2;
    },
    getRenderTarget: () => null,
    getDrawingBufferSize: (size: THREE.Vector2) => size.copy(bufferSize),
    compile() {
      /* External GPU compilation boundary. */
    },
  };
  return {
    renderer: renderer as unknown as THREE.WebGLRenderer,
    state: renderer,
    copies,
    draws,
    setBufferSize: (width: number, height: number) => bufferSize.set(width, height),
    fail: () => {
      fail = true;
    },
  };
}
function accelerate(blur: RaceMotionBlur) {
  for (let i = 0; i < 90; i++) blur.update(1, 1 / 60, true, 16);
}

it.each(['low', 'medium'] as const)('allocates nothing for %s when bypassed', (quality) => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, quality, quality === 'low');
  blur.resize(1920, 1080);
  accelerate(blur);
  blur.render();
  expect(f.copies).toHaveLength(0);
  expect(f.draws).toHaveLength(0);
  expect(blur.snapshot().textureBytes).toBe(0);
  blur.dispose();
});
it('copies only two peripheral bands and preserves renderer state and frame counters', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'medium', true);
  blur.resize(1920, 1080);
  accelerate(blur);
  blur.render();
  expect(f.copies).toEqual([
    { width: 384, height: 648, x: 0, y: 216 },
    { width: 384, height: 648, x: 1536, y: 216 },
  ]);
  expect(f.draws).toHaveLength(1);
  expect(f.state.autoClear).toBe(true);
  expect(f.state.info.autoReset).toBe(true);
  expect(blur.snapshot().textureBytes).toBe(1990656);
  expect(blur.snapshot().strength).toBeGreaterThan(0);
  expect(blur.snapshot().strength).toBeLessThanOrEqual(0.22);
  blur.dispose();
});
it('attributes the motion-blur shader draw and reports framebuffer copies separately', () => {
  const f = fixture();
  f.setBufferSize(320, 200);
  const instrumentation = new RenderPassInstrumentation(true);
  instrumentation.beginFrame();
  const blur = new RaceMotionBlur(f.renderer, 'medium', true, instrumentation);
  blur.resize(320, 200);
  accelerate(blur);
  blur.render();
  const frame = instrumentation.finishFrame({ drawCalls: 1, triangles: 2 });
  expect(frame.stages.motionBlurComposite).toMatchObject({
    status: 'measured',
    drawCalls: 1,
    triangles: 2,
    target: { width: 320, height: 200, pixels: 64000 },
    framebufferCopies: 2,
    copiedPixels: 2 * 64 * 120,
  });
  expect(frame.reconciliation).toMatchObject({
    status: 'complete',
    unattributedDrawCalls: 0,
    unattributedTriangles: 0,
  });
  expect(f.state.info.autoReset).toBe(true);
  expect(f.state.autoClear).toBe(true);
  blur.dispose();
});
it('bypasses slow reverse invalid speed and freezes on pause without retaining a captured frame', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'high', true);
  blur.resize(1080, 1920);
  for (const speed of [0, -1, 0.5, NaN, Infinity]) {
    blur.update(speed, 0.1, true, 16);
    blur.render();
  }
  expect(f.copies).toHaveLength(0);
  accelerate(blur);
  const before = blur.snapshot().strength;
  blur.update(0, 0, true, 16);
  expect(blur.snapshot().strength).toBe(before);
  blur.render(false);
  expect(f.copies).toHaveLength(0);
  blur.update(1, 0, false, 16);
  blur.render();
  expect(blur.snapshot().strength).toBe(0);
  blur.dispose();
});
it('turns blur off for the race after sustained over-budget frames', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'high', true);
  blur.resize(1920, 1080);
  accelerate(blur);
  for (let i = 0; i < 12; i++) blur.update(1, 0.025, true, 25);
  blur.render();
  expect(f.copies).toHaveLength(0);
  expect(blur.snapshot().fallbackReason).toBe('Frame budget');
  for (let i = 0; i < 100; i++) blur.update(1, 1 / 60, true, 16);
  expect(blur.snapshot().textureBytes).toBe(0);
  blur.dispose();
});
it('drops blur for recurring slow frames even when no slow streak reaches twelve', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'medium', true);
  blur.resize(1920, 1080);
  accelerate(blur);
  for (let i = 0; i < 60; i++) blur.update(1, 0.02, true, i % 2 === 0 ? 16 : 25);
  expect(blur.snapshot().fallbackReason).toBe('Frame budget');
  expect(blur.snapshot().textureBytes).toBe(0);
  blur.dispose();
});
it('ignores budget timing when no blur is drawn and excludes invalid transition samples', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'medium', true);
  blur.resize(1920, 1080);
  for (let i = 0; i < 120; i++) blur.update(0, 0.03, true, 30);
  expect(blur.snapshot().enabled).toBe(true);
  accelerate(blur);
  blur.update(1, 0.1, true, NaN);
  expect(blur.snapshot().fallbackReason).toBeNull();
  blur.dispose();
});
it('bounds resize memory and restores state after a copy failure', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'medium', true);
  blur.resize(1920, 1080);
  accelerate(blur);
  f.fail();
  blur.render();
  expect(blur.snapshot().fallbackReason).toBe('copy unavailable');
  expect(blur.snapshot().textureBytes).toBe(0);
  expect(f.state.autoClear).toBe(true);
  expect(f.state.debug.checkShaderErrors).toBe(false);
  blur.dispose();
  const oversize = new RaceMotionBlur(f.renderer, 'high', true);
  oversize.resize(8000, 8000);
  expect(oversize.snapshot().textureBytes).toBe(0);
  expect(oversize.snapshot().fallbackReason).toBe('Buffer budget');
  oversize.dispose();
});
it('marks a failed framebuffer-copy pass unavailable without inventing draw work', () => {
  const f = fixture();
  f.setBufferSize(320, 200);
  const instrumentation = new RenderPassInstrumentation(true);
  instrumentation.beginFrame();
  const blur = new RaceMotionBlur(f.renderer, 'medium', true, instrumentation);
  blur.resize(320, 200);
  accelerate(blur);
  f.fail();
  blur.render();
  const frame = instrumentation.finishFrame({ drawCalls: 0, triangles: 0 });
  expect(frame.stages.motionBlurComposite).toMatchObject({
    status: 'unavailable',
    drawCalls: null,
    triangles: null,
    framebufferCopies: 0,
    reason: 'copy unavailable',
  });
  expect(frame.reconciliation).toMatchObject({
    status: 'partial',
    unattributedDrawCalls: null,
    unattributedTriangles: null,
  });
  blur.dispose();
});
it('releases replaced textures and all owned resources once and cannot revive', () => {
  const f = fixture(),
    blur = new RaceMotionBlur(f.renderer, 'high', true);
  blur.resize(100, 100);
  accelerate(blur);
  blur.render();
  const mesh = f.draws[0]?.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  const old = mesh.material.uniforms.left?.value as THREE.Texture;
  let disposed = 0;
  old.addEventListener('dispose', () => {
    disposed++;
  });
  blur.resize(200, 100);
  expect(disposed).toBe(1);
  const next = mesh.material.uniforms.left?.value as THREE.Texture;
  let released = 0;
  for (const resource of [next, mesh.geometry, mesh.material])
    resource.addEventListener('dispose', () => {
      released++;
    });
  blur.clear();
  expect(blur.snapshot().strength).toBe(0);
  blur.dispose();
  blur.dispose();
  expect(released).toBe(3);
  blur.resize(100, 100);
  accelerate(blur);
  expect(blur.snapshot().textureBytes).toBe(0);
});
