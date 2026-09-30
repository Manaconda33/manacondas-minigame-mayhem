import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { KartTimeTrial } from '../src/game/KartTimeTrial';
import { characterById } from '../src/characters/manifest';
import type { RaceCaptureMetadata } from '../src/game/diagnostics/raceDiagnostics';

const harness = vi.hoisted(() => ({
  raf: null as FrameRequestCallback | null,
  reads: [] as string[],
  loadedKarts: false,
  animatedKarts: false,
  deferAi: false,
  loaderCalls: 0,
  pendingAi: [] as (() => void)[],
}));
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof THREE>();
  return {
    ...actual,
    WebGLRenderer: class {
      info = { render: { calls: 1, triangles: 2 }, memory: { geometries: 3, textures: 4 } };
      shadowMap = { enabled: false, type: 0 };
      setPixelRatio() {
        /* External renderer/audio/UI behavior is outside this diagnostic test. */
      }
      setSize() {
        /* External renderer/audio/UI behavior is outside this diagnostic test. */
      }
      dispose() {
        /* External renderer/audio/UI behavior is outside this diagnostic test. */
      }
      getPixelRatio() {
        return 1;
      }
      getDrawingBufferSize(target: THREE.Vector2) {
        harness.reads.push('read');
        return target.set(1920, 1080);
      }
      render() {
        harness.reads.push('render');
        this.info.render.calls = 22;
      }
    },
    TextureLoader: class {
      load() {
        return new actual.Texture();
      }
    },
  };
});
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const actual = await vi.importActual<typeof THREE>('three');
  return {
    GLTFLoader: class {
      loadAsync() {
        const scene = new actual.Group();
        if (harness.loadedKarts) {
          const material = new actual.MeshStandardMaterial();
          for (let i = 0; i < 3; i += 1) {
            const mesh = new actual.Mesh(new actual.BoxGeometry(), material);
            mesh.position.x = i;
            scene.add(mesh);
          }
          const wheel = new actual.Mesh(new actual.BoxGeometry(), material);
          wheel.name = 'SteeringWheel';
          scene.add(wheel);
        }
        const result = {
          scene,
          animations: harness.animatedKarts ? [new actual.AnimationClip()] : [],
        };
        harness.loaderCalls += 1;
        if (harness.deferAi && harness.loaderCalls <= 7)
          return new Promise<typeof result>((resolve) => {
            harness.pendingAi.push(() => { resolve(result); });
          });
        return Promise.resolve(result);
      }
    },
  };
});
const metadata: RaceCaptureMetadata = {
  schemaVersion: 1,
  sourceCommit: null,
  capturedAt: 'test',
  quality: 'medium',
  userAgent: 'test',
  hardwareDescription: null,
  scenario: 'unit',
  racerCount: 8,
  nominalViewport: { width: 1920, height: 1080 },
  gpuFrameMs: null,
  jsHeapBytes: null,
  estimatedTextureBytes: null,
};
interface Runtime {
  fixedStep: { advance: (dt: number, simulate: (dt: number) => void) => void };
  raceDirector: { phase: () => 'countdown' | 'racing' | 'finished' };
  updateVisuals: () => void;
  updateHud: () => void;
  world: { free: () => void };
}
const games: KartTimeTrial[] = [];
async function setup(query = '?testRacePerf=1') {
  history.replaceState(null, '', query || '/');
  let phase: 'countdown' | 'racing' | 'finished' = 'racing';
  const callback = vi.fn();
  const game = await KartTimeTrial.create({
    canvas: document.createElement('canvas'),
    character: characterById('aa-02'),
    graphicsQuality: 'medium',
    mobileSession: false,
    onHud: () => {
      /* External renderer/audio/UI behavior is outside this diagnostic test. */
    },
    onFinish: () => {
      /* External renderer/audio/UI behavior is outside this diagnostic test. */
    },
    onDiagnostics: callback,
  });
  games.push(game);
  const internals = game as unknown as Runtime;
  vi.spyOn(internals, 'updateVisuals').mockImplementation(() => {
    /* External renderer/audio/UI behavior is outside this diagnostic test. */
  });
  vi.spyOn(internals, 'updateHud').mockImplementation(() => {
    /* External renderer/audio/UI behavior is outside this diagnostic test. */
  });
  const advance = vi.spyOn(internals.fixedStep, 'advance').mockImplementation(() => {
    /* External renderer/audio/UI behavior is outside this diagnostic test. */
  });
  vi.spyOn(internals.raceDirector, 'phase').mockImplementation(() => phase);
  let now = 0;
  game.start();
  const tick = (dt = 16) => {
    now += dt;
    if (!harness.raf) throw new Error('No scheduled frame');
    harness.raf(now);
  };
  tick();
  for (let i = 0; i < 120; i++) tick();
  return {
    game,
    tick,
    callback,
    advance,
    phase: (p: typeof phase) => {
      phase = p;
    },
  };
}
beforeEach(() => {
  harness.reads.length = 0;
  harness.loadedKarts = false;
  harness.animatedKarts = false;
  harness.deferAi = false;
  harness.loaderCalls = 0;
  harness.pendingAi.length = 0;
  vi.spyOn(performance, 'now').mockReturnValue(0);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    harness.raf = cb;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    /* External renderer/audio/UI behavior is outside this diagnostic test. */
  });
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
afterEach(() => {
  for (const game of games.splice(0)) {
    game.dispose();
    (game as unknown as Runtime).world.free();
  }
  history.replaceState(null, '', '/');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('real race RAF diagnostics wiring', () => {
  it('records a raw 250ms stall while leaving the simulation clamp and post-render reads intact', async () => {
    const r = await setup();
    harness.reads.length = 0;
    r.tick(250);
    expect(r.advance).toHaveBeenLastCalledWith(0.1, expect.any(Function));
    const capture = r.game.exportPerformanceCapture(metadata);
    expect(capture?.samples.at(-1)?.rawFrameMs).toBe(250);
    expect(capture?.samples.at(-1)?.counters?.drawCalls).toBe(22);
    expect(harness.reads).toEqual(['render', 'read']);
    expect(r.callback).toHaveBeenCalled();
  });
  it('excludes pause/hidden/resume and rapid between-frame transitions without clearing warm samples', async () => {
    const r = await setup();
    r.tick();
    const before = r.game.exportPerformanceCapture(metadata)?.summary.scoredFrames;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    r.tick(500);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    r.tick(500);
    r.tick();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    r.tick(500);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    r.tick(500);
    r.tick();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    r.tick(500);
    r.tick();
    const capture = r.game.exportPerformanceCapture(metadata);
    expect(capture?.summary.scoredFrames).toBe((before ?? 0) + 3);
    expect(capture?.summary.maxFrameMs).toBe(16);
  });
  it('stops on finished phase, retains Results export, throttles callbacks and clears disposed capture', async () => {
    const r = await setup();
    r.tick();
    const frames = r.game.exportPerformanceCapture(metadata)?.summary.scoredFrames;
    r.phase('finished');
    r.tick();
    r.tick(2000);
    expect(r.game.exportPerformanceCapture(metadata)).toMatchObject({
      raceCompleted: true,
      summary: { scoredFrames: frames },
    });
    expect(r.callback.mock.calls.length).toBeLessThanOrEqual(4);
    r.game.dispose();
    expect(r.game.exportPerformanceCapture(metadata)).toBeNull();
    const calls = r.callback.mock.calls.length;
    r.tick(2000);
    expect(r.callback).toHaveBeenCalledTimes(calls);
  });
  it.each(['', '?testRacePerf=0', '?testRacePerf=true'])(
    'does not read counters or callback when disabled (%s)',
    async (query) => {
      const r = await setup(query);
      expect(r.game.exportPerformanceCapture(metadata)).toBeNull();
      expect(harness.reads).not.toContain('read');
      expect(r.callback).not.toHaveBeenCalled();
    },
  );
});

describe('loaded kart optimization routing', () => {
  it('retains animated models without batching their moving parts', async () => {
    harness.loadedKarts = true;
    harness.animatedKarts = true;
    const r = await setup();
    const scene = (r.game as unknown as { scene: THREE.Scene }).scene;
    const batches: THREE.Object3D[] = [];
    scene.traverse((object) => {
      if (object.name === 'batched-static-kart-parts') batches.push(object);
    });
    expect(batches).toHaveLength(0);
  });
  it('does not install or batch AI models that arrive after race disposal', async () => {
    harness.loadedKarts = true;
    harness.deferAi = true;
    const r = await setup();
    const scene = (r.game as unknown as { scene: THREE.Scene }).scene;
    const batches = (): number => {
      let count = 0;
      scene.traverse((object) => {
        if (object.name === 'batched-static-kart-parts') count += 1;
      });
      return count;
    };
    expect(harness.pendingAi).toHaveLength(7);
    expect(batches()).toBe(1);
    r.game.dispose();
    for (const resolve of harness.pendingAi.splice(0)) resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(batches()).toBe(1);
  });
  it('batches both player and seven AI karts and releases owned geometry on race disposal', async () => {
    harness.loadedKarts = true;
    const r = await setup();
    const scene = (r.game as unknown as { scene: THREE.Scene }).scene;
    const batches: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.name === 'batched-static-kart-parts')
        batches.push(object as THREE.Mesh);
    });
    expect(batches).toHaveLength(8);
    let disposed = 0;
    for (const mesh of batches)
      mesh.geometry.addEventListener('dispose', () => {
        disposed += 1;
      });
    r.game.dispose();
    expect(disposed).toBe(8);
  });
});
