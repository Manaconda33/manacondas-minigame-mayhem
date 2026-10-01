import { requireValue } from './requireValue';
import type { KartFeedback } from '../src/game/physics/KartController';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { KartTimeTrial } from '../src/game/KartTimeTrial';
import { characterById } from '../src/characters/manifest';
import type { RaceCaptureMetadata } from '../src/game/diagnostics/raceDiagnostics';

const harness = vi.hoisted(() => ({
  raf: null as FrameRequestCallback | null,
  reads: [] as string[],
  compiledDrift: false,
  compiledDust: false,
  modeledDustWheels: false,
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
      compile(group: THREE.Object3D) {
        const mesh = group.getObjectByName('drift-spark-pool') as THREE.InstancedMesh | undefined;
        harness.compiledDrift ||=
          mesh !== undefined && mesh.instanceColor !== null && mesh.count === 0;
        const dust = group.getObjectByName('wheel-dust-pool') as THREE.InstancedMesh | undefined;
        harness.compiledDust ||=
          dust?.count === 0 &&
          dust.instanceColor !== null &&
          dust.geometry.hasAttribute('dustOpacity');
        return new Set();
      }

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
        if (harness.modeledDustWheels) {
          const parent = new actual.Group();
          parent.position.set(0.3, 0, 0.4);
          parent.rotation.y = Math.PI / 2;
          const material = new actual.MeshStandardMaterial();
          for (const [name, x, z] of [
            ['Wheel_FL', -0.8, -1.1],
            ['Wheel_FR', 0.8, -1.1],
            ['Wheel_RL', -0.8, 1.1],
            ['Wheel_RR', 0.8, 1.1],
          ] as const) {
            const wheel = new actual.Mesh(new actual.BoxGeometry(0.2, 0.2, 0.2), material);
            wheel.name = name;
            wheel.position.set(x, 0.4, z);
            parent.add(wheel);
          }
          scene.add(parent);
        }
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
            harness.pendingAi.push(() => {
              resolve(result);
            });
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
  harness.compiledDrift = false;
  harness.compiledDust = false;
  harness.modeledDustWheels = false;
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

describe('drift visual runtime wiring', () => {
  it('prepares the drift material during race startup before driving', async () => {
    await setup();
    expect(harness.compiledDrift).toBe(true);
  });
  it('uses actual player feedback, freezes paused frames and clears Results/recovery/disposal', async () => {
    const r = await setup();
    const runtime = r.game as unknown as {
      updateVisuals: (seconds: number) => void;
      kart: { feedback: () => KartFeedback };
      scene: THREE.Scene;
      respawn: () => void;
    };
    vi.spyOn(runtime, 'updateVisuals').mockRestore();
    vi.spyOn(runtime.kart, 'feedback').mockReturnValue({
      drifting: true,
      driftTier: 'purple',
      chargeRatio: 1,
      boostActive: false,
      airborne: false,
    });
    runtime.updateVisuals(0.1);
    const mesh = runtime.scene.getObjectByName('drift-spark-pool') as
      THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> | undefined;
    expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    if (mesh === undefined) throw new Error('No runtime drift pool');
    expect(mesh.count).toBeGreaterThan(0);
    const count = mesh.count;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    runtime.updateVisuals(0.1);
    expect(mesh.count).toBe(count);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    runtime.updateVisuals(0.1);
    expect(mesh.count).toBe(count);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    runtime.respawn();
    expect(mesh.count).toBe(0);
    runtime.updateVisuals(0.1);
    expect(mesh.count).toBeGreaterThan(0);
    r.phase('finished');
    runtime.updateVisuals(0.1);
    expect(mesh.count).toBe(0);
    let released = 0;
    mesh.geometry.addEventListener('dispose', () => {
      released += 1;
    });
    mesh.material.addEventListener('dispose', () => {
      released += 1;
    });
    r.game.dispose();
    expect(released).toBe(2);
  });
});

describe('player wheel dust runtime wiring', () => {
  it('prewarms dust and samples real off-road contacts without altering player motion', async () => {
    const r = await setup();
    expect(harness.compiledDust).toBe(true);
    const runtime = r.game as unknown as {
      updateVisuals: (seconds: number) => void;
      kart: import('../src/game/physics/KartController').KartController;
      track: import('../src/game/track/CircuitAlpha').CircuitAlpha;
      world: import('@dimforge/rapier3d-compat').World;
      scene: THREE.Scene;
      respawn: () => void;
    };
    vi.spyOn(runtime, 'updateVisuals').mockRestore();
    const point = requireValue(runtime.track.samples[30]).clone();
    const forward = requireValue(runtime.track.tangents[30]).clone();
    point.addScaledVector(new THREE.Vector3(forward.z, 0, -forward.x), 8);
    point.y = 0.34;
    runtime.kart.respawn(point, Math.atan2(forward.x, forward.z));
    runtime.kart.body.setTranslation(point, true);
    runtime.kart.body.setLinvel(forward.multiplyScalar(16), true);
    runtime.world.step();
    const before = runtime.kart.body.linvel();
    runtime.updateVisuals(0.1);
    runtime.updateVisuals(0.1);
    const dust = runtime.scene.getObjectByName('wheel-dust-pool') as THREE.InstancedMesh;
    expect(dust.count).toBeGreaterThan(0);
    expect(runtime.kart.body.linvel()).toEqual(before);
    const matrix = dust.instanceMatrix.array.slice();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    runtime.updateVisuals(0.1);
    expect(dust.instanceMatrix.array).toEqual(matrix);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    runtime.updateVisuals(0.1);
    expect(dust.instanceMatrix.array).toEqual(matrix);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    runtime.respawn();
    expect(dust.count).toBe(0);
    runtime.kart.body.setTranslation(point, true);
    runtime.kart.body.setLinvel(before, true);
    runtime.world.step();
    runtime.updateVisuals(0.1);
    runtime.updateVisuals(0.1);
    expect(dust.count).toBeGreaterThan(0);
    r.phase('finished');
    runtime.updateVisuals(0.1);
    expect(dust.count).toBe(0);
    let released = 0;
    dust.geometry.addEventListener('dispose', () => {
      released++;
    });
    (dust.material as THREE.MeshBasicMaterial).addEventListener('dispose', () => {
      released++;
    });
    r.game.dispose();
    expect(released).toBe(2);
  });
});

it('keeps normalized modeled wheel emission positions after static batching removes wheel meshes', async () => {
  harness.modeledDustWheels = true;
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (seconds: number) => void;
    kart: import('../src/game/physics/KartController').KartController;
    world: import('@dimforge/rapier3d-compat').World;
    scene: THREE.Scene;
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  runtime.kart.respawn(new THREE.Vector3(), 0);
  runtime.kart.body.setTranslation({ x: 0, y: 0.34, z: 0 }, true);
  runtime.kart.body.setLinvel({ x: 0, y: 0, z: 20 }, true);
  runtime.world.step();
  const origin = runtime.kart.position();
  runtime.updateVisuals(0.1);
  const dust = runtime.scene.getObjectByName('wheel-dust-pool') as THREE.InstancedMesh;
  expect(runtime.scene.getObjectByName('Wheel_FL')).toBeUndefined();
  expect(dust.count).toBe(4);
  // Parent yaw PI/2, translation (0.3,0,0.4), model yaw PI; 2.9m / 2.4m scale.
  const expected = [
    [0.966667, -1.45],
    [0.966667, 0.483333],
    [-1.691667, -1.45],
    [-1.691667, 0.483333],
  ];
  const transform = new THREE.Matrix4();
  expected.forEach(([x, z], index) => {
    dust.getMatrixAt(index, transform);
    expect(
      Math.abs(requireValue(transform.elements[12]) - origin.x - requireValue(x)),
    ).toBeLessThan(0.041);
    expect(
      Math.abs(requireValue(transform.elements[14]) - origin.z - requireValue(z)),
    ).toBeLessThan(0.041);
    expect(transform.elements[13]).toBeCloseTo(0.08, 4);
  });
});
