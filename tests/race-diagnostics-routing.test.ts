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
  shadowCenterAtRender: null as number[] | null,
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
      render(scene?: THREE.Scene) {
        const sun = scene?.children.find(
          (object): object is THREE.DirectionalLight => object instanceof actual.DirectionalLight,
        );
        if (sun !== undefined) harness.shadowCenterAtRender = sun.target.position.toArray();
        harness.reads.push('render');
        this.info.render.calls = 22;
      }
      copyFramebufferToTexture() {
        /* GPU copy boundary only. */
      }
    },
    TextureLoader: class {
      loadAsync() {
        return Promise.resolve(new actual.Texture());
      }
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
async function setup(
  query = '?testRacePerf=1',
  trackId: 'circuit-alpha' | 'neon-grid' = 'circuit-alpha',
  characterId = 'aa-02',
  mobileSession = false,
) {
  history.replaceState(null, '', query || '/');
  let phase: 'countdown' | 'racing' | 'finished' = 'racing';
  const callback = vi.fn();
  const game = await KartTimeTrial.create({
    trackId,
    canvas: document.createElement('canvas'),
    character: characterById(characterId),
    graphicsQuality: 'medium',
    mobileSession,
    onHud: () => {
      /* External renderer/audio/UI behavior is outside this diagnostic test. */
    },
    onFinish: () => {
      /* External renderer/audio/UI behavior is outside this diagnostic test. */
    },
    onDiagnostics: callback,
  });
  games.push(game);
  // Buffer sizing at startup is independent of opt-in frame-counter capture.
  harness.reads.length = 0;
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
  harness.shadowCenterAtRender = null;
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
  }
  history.replaceState(null, '', '/');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('real race RAF diagnostics wiring', () => {
  it('centers the real shadow map on the player and applies caster policy before rendering', async () => {
    harness.loadedKarts = true;
    const r = await setup('');
    const runtime = r.game as unknown as {
      scene: THREE.Scene;
      kartMesh: THREE.Group;
      kart: import('../src/game/physics/KartController').KartController;
      opponents: { mesh: THREE.Group }[];
    };
    const anchor = new THREE.Vector3(250, 0, -120);
    vi.spyOn(runtime.kart, 'position').mockImplementation((target = new THREE.Vector3()) =>
      target.copy(anchor),
    );
    r.tick();
    const sun = requireValue(
      runtime.scene.children.find(
        (object): object is THREE.DirectionalLight => object instanceof THREE.DirectionalLight,
      ),
    );
    expect(sun.target.position.distanceTo(anchor)).toBeLessThan(0.1);
    expect(
      new THREE.Vector3().fromArray(requireValue(harness.shadowCenterAtRender)).distanceTo(anchor),
    ).toBeLessThan(0.1);
    let playerCasts = false;
    runtime.kartMesh.traverse((object) => {
      playerCasts ||= object.castShadow;
    });
    expect(playerCasts).toBe(true);
    for (const rival of runtime.opponents) {
      let casts = false;
      rival.mesh.traverse((object) => {
        casts ||= object.castShadow;
      });
      expect(casts).toBe(false);
    }
  });
  it('enforces the blur frame budget in ordinary play with diagnostics disabled', async () => {
    const r = await setup('');
    const runtime = r.game as unknown as {
      kart: import('../src/game/physics/KartController').KartController;
      playerNormalTopSpeed: number;
      motionBlur: import('../src/game/rendering/RaceMotionBlur').RaceMotionBlur;
    };
    const velocity = runtime.kart.forward().multiplyScalar(runtime.playerNormalTopSpeed);
    vi.spyOn(runtime.kart, 'velocity').mockImplementation((target = new THREE.Vector3()) =>
      target.copy(velocity),
    );
    for (let i = 0; i < 90; i++) r.tick();
    for (let i = 0; i < 60; i++) r.tick(i % 2 === 0 ? 16 : 25);
    expect(runtime.motionBlur.snapshot().fallbackReason).toBe('Frame budget');
    expect(runtime.motionBlur.snapshot().textureBytes).toBe(0);
    expect(r.game.exportPerformanceCapture(metadata)).toBeNull();
  });
  it('drives blur from actual player speed and clears rear view recovery and Results', async () => {
    const r = await setup();
    const runtime = r.game as unknown as {
      kart: import('../src/game/physics/KartController').KartController;
      playerNormalTopSpeed: number;
      updateVisuals: (dt: number) => void;
      respawn: () => void;
    };
    vi.spyOn(runtime, 'updateVisuals').mockRestore();
    const velocity = runtime.kart.forward().multiplyScalar(runtime.playerNormalTopSpeed);
    vi.spyOn(runtime.kart, 'velocity').mockImplementation((target = new THREE.Vector3()) =>
      target.copy(velocity),
    );
    const snapshot = () => r.game.exportPerformanceCapture(metadata)?.metadata.motionBlur;
    for (let i = 0; i < 90; i++) r.tick();
    expect(snapshot()?.strength).toBeGreaterThan(0.2);
    const before = snapshot()?.strength;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    r.tick(500);
    expect(snapshot()?.strength).toBe(before);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyC' }));
    r.tick();
    expect(snapshot()?.strength).toBe(0);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyC' }));
    for (let i = 0; i < 90; i++) r.tick();
    expect(snapshot()?.strength).toBeGreaterThan(0.2);
    runtime.respawn();
    expect(snapshot()?.strength).toBe(0);
    r.phase('finished');
    r.tick();
    expect(snapshot()?.strength).toBe(0);
    r.game.dispose();
  });
  it('records a raw 250ms stall while leaving the simulation clamp and post-render reads intact', async () => {
    const r = await setup();
    harness.reads.length = 0;
    r.tick(250);
    expect(r.advance).toHaveBeenLastCalledWith(0.1, expect.any(Function));
    const capture = r.game.exportPerformanceCapture(metadata);
    expect(capture?.metadata.bloom).toMatchObject({ quality: 'medium' });
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
  it('applies shadow policy to AI models that arrive after the first rendered frame', async () => {
    harness.loadedKarts = true;
    harness.deferAi = true;
    const r = await setup('');
    const runtime = r.game as unknown as {
      kart: import('../src/game/physics/KartController').KartController;
      opponents: { mesh: THREE.Group }[];
    };
    const anchor = runtime.kart.position();
    const rival = requireValue(runtime.opponents[0]);
    rival.mesh.position.copy(anchor).add(new THREE.Vector3(10, 0, 0));
    for (const resolve of harness.pendingAi.splice(0)) resolve();
    await Promise.resolve();
    await Promise.resolve();
    r.tick();
    const casters: THREE.Object3D[] = [];
    rival.mesh.traverse((object) => {
      if (object.castShadow) casters.push(object);
    });
    expect(casters.length).toBeGreaterThan(0);
    expect(casters.some((object) => object.name === 'batched-static-kart-parts')).toBe(true);
    rival.mesh.position.copy(anchor).add(new THREE.Vector3(70, 0, 0));
    r.tick();
    expect(casters.every((object) => !object.castShadow)).toBe(true);
  });
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

it('routes nearby AI drift and real off-road dust into two shared batches without physics writes', async () => {
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (dt: number) => void;
    scene: THREE.Scene;
    track: import('../src/game/track/CircuitAlpha').CircuitAlpha;
    world: import('@dimforge/rapier3d-compat').World;
    kart: import('../src/game/physics/KartController').KartController;
    opponents: {
      id: string;
      controller: import('../src/game/physics/KartController').KartController;
      progress: { finished: boolean };
    }[];
  };
  const group = runtime.scene.getObjectByName('AiDrivingVisual');
  expect(group).toBeDefined();
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  const point = requireValue(runtime.track.samples[30]).clone();
  const forward = requireValue(runtime.track.tangents[30]).clone();
  point.addScaledVector(new THREE.Vector3(forward.z, 0, -forward.x), 8);
  point.y = 0.34;
  runtime.kart.body.setTranslation(point.clone().addScaledVector(forward, -8), true);
  const ai = requireValue(runtime.opponents[0]);
  ai.controller.body.setTranslation(point, true);
  ai.controller.body.setLinvel(forward.clone().multiplyScalar(16), true);
  vi.spyOn(ai.controller, 'feedback').mockReturnValue({
    drifting: true,
    driftTier: 'purple',
    chargeRatio: 1,
    airborne: false,
    boostActive: false,
  });
  runtime.world.step();
  const velocity = ai.controller.body.linvel();
  for (let i = 0; i < 6; i++) runtime.updateVisuals(0.1);
  const sparks = requireValue(group).getObjectByName('drift-spark-pool') as THREE.InstancedMesh;
  const dust = requireValue(group).getObjectByName('wheel-dust-pool') as THREE.InstancedMesh;
  expect(sparks.count).toBeGreaterThan(0);
  expect(dust.count).toBeGreaterThan(0);
  expect(ai.controller.body.linvel()).toEqual(velocity);
  const before = dust.instanceMatrix.array.slice();
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  runtime.updateVisuals(0.1);
  expect(dust.instanceMatrix.array).toEqual(before);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  r.phase('finished');
  runtime.updateVisuals(0.1);
  expect(dust.count).toBe(0);
  expect(sparks.count).toBe(0);
  let disposed = 0;
  sparks.addEventListener('dispose', () => disposed++);
  dust.addEventListener('dispose', () => disposed++);
  r.game.dispose();
  expect(disposed).toBe(2);
});

it('uses normalized AI model wheel anchors after batching and suppresses distant or unseen emissions', async () => {
  harness.modeledDustWheels = true;
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (dt: number) => void;
    scene: THREE.Scene;
    racerEffects: import('../src/game/items/RacerEffects').RacerEffects;
    world: import('@dimforge/rapier3d-compat').World;
    kart: import('../src/game/physics/KartController').KartController;
    opponents: {
      id: string;
      controller: import('../src/game/physics/KartController').KartController;
      mesh: THREE.Group;
      progress: { finished: boolean };
    }[];
    recoverOpponent: (ai: unknown, projection: unknown) => void;
    track: import('../src/game/track/CircuitAlpha').CircuitAlpha;
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  const offroad = requireValue(runtime.track.samples[30]).clone();
  const tangent = requireValue(runtime.track.tangents[30]);
  offroad.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x), 8);
  offroad.y = 0.34;
  const playerPoint = offroad.clone().add(new THREE.Vector3(0, 0, -8));
  runtime.kart.respawn(playerPoint, 0);
  runtime.kart.body.setTranslation(playerPoint, true);
  runtime.opponents.forEach((ai) => {
    ai.controller.body.setTranslation({ x: 1000, y: 0.34, z: 0 }, true);
  });
  const ai = requireValue(runtime.opponents[0]);
  ai.controller.respawn(offroad, 0);
  ai.controller.body.setTranslation(offroad, true);
  ai.controller.body.setLinvel({ x: 0, y: 0, z: 20 }, true);
  vi.spyOn(ai.controller, 'feedback').mockReturnValue({
    drifting: true,
    driftTier: 'purple',
    chargeRatio: 1,
    airborne: false,
    boostActive: false,
  });
  runtime.world.step();
  const origin = ai.controller.position();
  runtime.updateVisuals(0.1);
  const group = requireValue(runtime.scene.getObjectByName('AiDrivingVisual'));
  const dust = group.getObjectByName('wheel-dust-pool') as THREE.InstancedMesh;
  const sparks = group.getObjectByName('drift-spark-pool') as THREE.InstancedMesh;
  expect(ai.mesh.getObjectByName('Wheel_FL')).toBeUndefined();
  expect(dust.count).toBe(4);
  const expected = [
    [0.966667, -1.45],
    [0.966667, 0.483333],
    [-1.691667, -1.45],
    [-1.691667, 0.483333],
  ];
  const matrix = new THREE.Matrix4();
  expected.forEach(([x, z], i) => {
    dust.getMatrixAt(i, matrix);
    expect(Math.abs(matrix.elements[12] - origin.x - requireValue(x))).toBeLessThan(0.041);
    expect(Math.abs(matrix.elements[14] - origin.z - requireValue(z))).toBeLessThan(0.041);
  });
  // Outside the 60m budget, then near but behind the chase camera.
  for (const point of [
    origin.clone().add(new THREE.Vector3(0, 0, 90)),
    origin.clone().add(new THREE.Vector3(0, 0, -35)),
  ]) {
    ai.controller.body.setTranslation(point, true);
    for (let i = 0; i < 12; i++) runtime.updateVisuals(0.1);
    expect(dust.count).toBe(0);
    expect(sparks.count).toBe(0);
    ai.controller.body.setTranslation(origin, true);
    runtime.updateVisuals(0.001);
    expect(sparks.count).toBe(0); // No deferred purple charge/release burst.
    runtime.updateVisuals(0.1);
    expect(dust.count).toBeGreaterThan(0);
  }
  runtime.racerEffects.activateSpinout(ai.id, {
    id: 'test',
    label: 'test',
    durationSeconds: 1,
    direction: 1,
    turns: 1,
  });
  for (let i = 0; i < 12; i++) runtime.updateVisuals(0.1);
  expect(dust.count).toBe(0);
  expect(sparks.count).toBe(0);
  runtime.racerEffects.clearSpinout(ai.id);
  runtime.updateVisuals(0.001);
  expect(sparks.count).toBe(0);
  runtime.updateVisuals(0.1);
  expect(dust.count).toBeGreaterThan(0);
  runtime.recoverOpponent(ai, runtime.track.project(origin));
  expect(sparks.count).toBe(0);
  ai.progress.finished = true;
  runtime.updateVisuals(0.1);
  expect(dust.count).toBe(0);
  r.game.dispose();
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

it('routes player forward speed into camera FOV and peripheral strokes with lifecycle cleanup', async () => {
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (dt: number) => void;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    kart: import('../src/game/physics/KartController').KartController;
    respawn: () => void;
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  const forward = runtime.kart.forward();
  const velocity = forward.clone().multiplyScalar(70);
  runtime.kart.body.setLinvel(velocity, true);
  for (let i = 0; i < 60; i++) runtime.updateVisuals(1 / 60);
  const group = runtime.scene.getObjectByName('PlayerSpeedVisual');
  expect(group).toBeDefined();
  const strokes = requireValue(group).getObjectByName('speed-line-pool') as THREE.InstancedMesh;
  expect(strokes.count).toBeGreaterThan(0);
  expect(runtime.camera.fov).toBeGreaterThan(67);
  expect(runtime.camera.fov).toBeLessThanOrEqual(68);
  expect(runtime.kart.body.linvel().x).toBeCloseTo(velocity.x);
  expect(runtime.kart.body.linvel().z).toBeCloseTo(velocity.z);
  const matrix = strokes.instanceMatrix.array.slice();
  const fov = runtime.camera.fov;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  runtime.updateVisuals(0.1);
  expect(strokes.instanceMatrix.array).toEqual(matrix);
  expect(runtime.camera.fov).toBe(fov);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  runtime.updateVisuals(0.1);
  expect(strokes.instanceMatrix.array).toEqual(matrix);
  expect(runtime.camera.fov).toBe(fov);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  runtime.respawn();
  expect(strokes.count).toBe(0);
  expect(runtime.camera.fov).toBe(62);
  runtime.kart.body.setLinvel(velocity, true);
  runtime.updateVisuals(0.1);
  expect(strokes.count).toBeGreaterThan(0);
  r.phase('countdown');
  runtime.updateVisuals(0.1);
  expect(strokes.count).toBe(0);
  expect(runtime.camera.fov).toBe(62);
  r.phase('racing');
  runtime.updateVisuals(0.1);
  expect(strokes.count).toBeGreaterThan(0);
  r.phase('finished');
  runtime.updateVisuals(0.1);
  expect(strokes.count).toBe(0);
  expect(runtime.camera.fov).toBe(62);
  let disposed = 0;
  strokes.addEventListener('dispose', () => disposed++);
  strokes.geometry.addEventListener('dispose', () => disposed++);
  (strokes.material as THREE.Material).addEventListener('dispose', () => disposed++);
  r.game.dispose();
  expect(disposed).toBe(3);
});

it('suppresses reverse and lateral speed, clears spinout cues and retains cues in rear view', async () => {
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (dt: number) => void;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    kart: import('../src/game/physics/KartController').KartController;
    racerEffects: import('../src/game/items/RacerEffects').RacerEffects;
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  const group = requireValue(runtime.scene.getObjectByName('PlayerSpeedVisual'));
  const mesh = requireValue(group.getObjectByName('speed-line-pool')) as THREE.InstancedMesh;
  const forward = runtime.kart.forward();
  for (const velocity of [
    forward.clone().multiplyScalar(-70),
    new THREE.Vector3(forward.z, 0, -forward.x).multiplyScalar(70),
  ]) {
    runtime.kart.body.setLinvel(velocity, true);
    for (let i = 0; i < 20; i++) runtime.updateVisuals(0.1);
    expect(runtime.camera.fov).toBe(62);
    expect(mesh.count).toBe(0);
  }
  runtime.kart.body.setLinvel(forward.clone().multiplyScalar(70), true);
  for (let i = 0; i < 20; i++) runtime.updateVisuals(0.1);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyC' }));
  runtime.updateVisuals(0.1);
  expect(runtime.camera.fov).toBeGreaterThan(67.9);
  expect(mesh.count).toBeGreaterThan(0);
  runtime.racerEffects.activateSpinout('player', {
    id: 'speed-test',
    label: 'speed-test',
    durationSeconds: 0.85,
    direction: 1,
    turns: 1,
    preserveMomentum: false,
  });
  runtime.updateVisuals(0.1);
  expect(runtime.camera.fov).toBe(62);
  expect(mesh.count).toBe(0);
});

it('routes player and nearby AI exhaust with item overlap suppression and lifecycle cleanup', async () => {
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (dt: number) => void;
    scene: THREE.Scene;
    kart: import('../src/game/physics/KartController').KartController;
    opponents: {
      id: string;
      controller: import('../src/game/physics/KartController').KartController;
      progress: { finished: boolean };
    }[];
    racerEffects: import('../src/game/items/RacerEffects').RacerEffects;
    respawn: () => void;
    nitroOverdrive: import('../src/game/items/NitroOverdrive').NitroOverdriveSystem;
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  const mesh = runtime.scene.getObjectByName('exhaust-flare-pool') as THREE.InstancedMesh;
  expect(mesh).toBeDefined();
  runtime.opponents.forEach((ai) => {
    ai.controller.body.setTranslation({ x: 1000, y: 0, z: 0 }, true);
  });
  const velocity = runtime.kart.forward().multiplyScalar(70);
  runtime.kart.body.setLinvel(velocity, true);
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);
  const before = runtime.kart.body.linvel();
  const matrices = mesh.instanceMatrix.array.slice();
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  runtime.updateVisuals(0.1);
  expect(mesh.instanceMatrix.array).toEqual(matrices);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  runtime.updateVisuals(0.1);
  expect(mesh.instanceMatrix.array).toEqual(matrices);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  expect(runtime.kart.body.linvel()).toEqual(before);
  runtime.respawn();
  expect(mesh.count).toBe(0);
  runtime.kart.body.setLinvel(velocity, true);
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);
  runtime.racerEffects.activateSpinout('player', {
    id: 'exhaust-test',
    label: 'test',
    durationSeconds: 1,
    direction: 1,
    turns: 1,
  });
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(0);
  runtime.racerEffects.clearSpinout('player');
  runtime.kart.body.setLinvel(velocity, true);
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);
  r.phase('countdown');
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(0);
  r.phase('racing');
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);
  const ai = requireValue(runtime.opponents[0]);
  const near = runtime.kart.position().addScaledVector(runtime.kart.forward(), 5);
  ai.controller.respawn(near, Math.atan2(runtime.kart.forward().x, runtime.kart.forward().z));
  ai.controller.body.setLinvel(velocity, true);
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(4);
  ai.progress.finished = true;
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);
  runtime.racerEffects.activateTemporaryBoost('player', {
    id: 'nitro-surge',
    label: 'Nitro',
    durationSeconds: 1,
    speedCapMultiplier: 1.2,
    accelerationMultiplier: 1,
    ignoreOffRoadSpeedPenalty: false,
  });
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(0);
  runtime.racerEffects.clearTemporaryBoost('player', 'nitro-surge');
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);
  runtime.nitroOverdrive.activate('player', () => true);
  runtime.nitroOverdrive.advance(1);
  expect(runtime.nitroOverdrive.snapshot('player')).toMatchObject({
    active: true,
    pulseRemainingSeconds: 0,
  });
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(0);
  runtime.nitroOverdrive.clear('player');
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(2);

  r.phase('finished');
  runtime.updateVisuals(0.1);
  expect(mesh.count).toBe(0);
});

it('keeps legacy spherical indicators exclusive to charged active drifting, not boost-strip or released boosts', async () => {
  const r = await setup();
  const runtime = r.game as unknown as {
    updateVisuals: (dt: number) => void;
    kart: import('../src/game/physics/KartController').KartController;
    driftLights: THREE.Mesh[];
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  const feedback = vi.spyOn(runtime.kart, 'feedback');
  for (const tier of ['blue', 'orange', 'purple'] as const) {
    feedback.mockReturnValue({
      drifting: false,
      driftTier: tier,
      chargeRatio: 0,
      boostActive: true,
      airborne: false,
    });
    runtime.updateVisuals(0.1);
    expect(runtime.driftLights.every((light) => !light.visible)).toBe(true);
    feedback.mockReturnValue({
      drifting: true,
      driftTier: tier,
      chargeRatio: 1,
      boostActive: false,
      airborne: false,
    });
    runtime.updateVisuals(0.1);
    expect(runtime.driftLights.every((light) => light.visible)).toBe(true);
  }
  feedback.mockReturnValue({
    drifting: true,
    driftTier: 'none',
    chargeRatio: 0,
    boostActive: false,
    airborne: false,
  });
  runtime.updateVisuals(0.1);
  expect(runtime.driftLights.every((light) => !light.visible)).toBe(true);
});

it('runs the selected Neon route with eight unique bodies and retains earned gates on recovery', async () => {
  const { game, tick, advance } = await setup('', 'neon-grid');
  const runtime = game as unknown as {
    track: { id: string; samples: THREE.Vector3[] };
    opponents: { id: string; controller: { isFinite: () => boolean } }[];
    kart: { isFinite: () => boolean };
    lapTracker: {
      enterCheckpoint: (index: number, forwardDot: number, time: number) => boolean;
      snapshot: () => { nextCheckpoint: number };
    };
    respawn: () => void;
    minimapTrack: unknown;
    world: { free: () => void };
  };
  expect(runtime.track.id).toBe('neon-grid');
  expect(runtime.opponents).toHaveLength(7);
  expect(new Set(runtime.opponents.map((r) => r.id)).size).toBe(7);
  expect(runtime.minimapTrack).toBeTruthy();
  advance.mockRestore();
  for (let i = 0; i < 300; i++) tick(1000 / 60);
  expect(runtime.kart.isFinite()).toBe(true);
  expect(runtime.opponents.every((r) => r.controller.isFinite())).toBe(true);
  expect(runtime.lapTracker.enterCheckpoint(1, 1, 6)).toBe(true);
  const earned = runtime.lapTracker.snapshot().nextCheckpoint;
  runtime.respawn();
  expect(runtime.lapTracker.snapshot().nextCheckpoint).toBe(earned);
  const free = vi.spyOn(runtime.world, 'free');
  game.dispose();
  game.dispose();
  expect(free).toHaveBeenCalledTimes(1);
}, 15000);

it.each(['aa-02', 'aa-13', 'aa-14'])(
  'moves Neon player %s from the real countdown using mobile pointer input',
  async (characterId) => {
    const { game, tick, advance } = await setup('', 'neon-grid', characterId, true);
    const runtime = game as unknown as {
      raceDirector: { phase: () => string };
      kart: { position: () => THREE.Vector3; velocity: () => THREE.Vector3 };
      track: { project: (p: THREE.Vector3) => { point: THREE.Vector3 } };
    };
    vi.spyOn(runtime.raceDirector, 'phase').mockRestore();
    advance.mockRestore();
    for (let i = 0; i < 210; i++) tick(1000 / 60);
    const start = runtime.kart.position();
    const { bindTouchWheel } = await import('../src/app/touchWheel');
    const wheel = document.createElement('button');
    Object.defineProperty(wheel, 'setPointerCapture', { value: () => undefined });
    Object.defineProperty(wheel, 'hasPointerCapture', { value: () => false });
    const release = bindTouchWheel(wheel, (state) => {
      game.setTouchWheel(state);
    });
    wheel.dispatchEvent(
      Object.assign(new Event('pointerdown', { cancelable: true }), { pointerId: 1, clientX: 0 }),
    );
    for (let i = 0; i < 120; i++) tick(1000 / 60);
    const end = runtime.kart.position();
    release();
    expect(end.y).toBeGreaterThan(13);
    expect(runtime.kart.velocity().clone().setY(0).length()).toBeGreaterThan(3);
    expect(end.clone().sub(start).setY(0).length()).toBeGreaterThan(3);
  },
  15000,
);

it('frames the elevated Neon player in portrait through the real camera integration', async () => {
  const { game } = await setup('', 'neon-grid', 'aa-13', true);
  const runtime = game as unknown as {
    camera: THREE.PerspectiveCamera;
    kart: { position: () => THREE.Vector3 };
    updateVisuals: (dt: number) => void;
  };
  vi.spyOn(runtime, 'updateVisuals').mockRestore();
  runtime.camera.aspect = 0.5;
  runtime.camera.updateProjectionMatrix();
  for (let i = 0; i < 240; i++) runtime.updateVisuals(1 / 60);
  const screen = runtime.kart.position().project(runtime.camera);
  expect(Math.abs(screen.x)).toBeLessThan(0.9);
  expect(Math.abs(screen.y)).toBeLessThan(0.9);
});

it('selects the approved Neon map orientation in the real race and keeps Alpha orientation', async () => {
  for (const route of ['neon-grid', 'circuit-alpha'] as const) {
    const { game } = await setup('', route);
    const runtime = game as unknown as {
      track: { samples: THREE.Vector3[] };
      minimapTrack: { x: number; y: number }[];
    };
    const samples = runtime.track.samples;
    const lowZ = samples.reduce((best, p, i) => (p.z < (samples[best]?.z ?? 0) ? i : best), 0);
    const highZ = samples.reduce((best, p, i) => (p.z > (samples[best]?.z ?? 0) ? i : best), 0);
    const delta = (runtime.minimapTrack[highZ]?.y ?? 0) - (runtime.minimapTrack[lowZ]?.y ?? 0);
    expect(delta * (route === 'neon-grid' ? 1 : -1)).toBeGreaterThan(0);
  }
});

it('keeps Neon player and Rocket on racer-local tunnel support through simulation pause and recovery', async () => {
  const { game, tick, advance, phase } = await setup('', 'neon-grid');
  const runtime = game as unknown as {
    track: import('../src/game/track/NeonGrid').NeonGrid;
    neonRoute: (id: string) => import('../src/game/track/RacerTrack').RacerTrack;
    kart: import('../src/game/physics/KartController').KartController;
    hyperDriveRocket: import('../src/game/items/HyperDriveRocket').HyperDriveRocketSystem;
    lapTracker: import('../src/game/race/LapTracker').LapTracker;
    respawn: () => void;
    racerRoutes: Map<string, unknown>;
  };
  const tunnel = runtime.track.serviceTunnel,
    route = runtime.neonRoute('player');
  const at = (d: number) => tunnel.curve.getPointAt(d / tunnel.curve.getLength());
  // Fixture placement only: simulate/controller/world movement below are real.
  route.advance(at(5), at(9));
  const p = at(38),
    t = tunnel.curve.getTangentAt(38 / tunnel.curve.getLength());
  runtime.kart.respawn(p, Math.atan2(t.x, t.z));
  runtime.kart.body.setLinvel({ x: t.x * 12, y: 0, z: t.z * 12 }, true);
  expect(runtime.hyperDriveRocket.activate('player', () => true)).toBe(true);
  advance.mockRestore();
  const earned = runtime.lapTracker.snapshot().nextCheckpoint;
  for (let i = 0; i < 30; i++) tick(1000 / 60);
  expect(route.project(runtime.kart.position()).pathId).toBe('service-tunnel');
  expect(runtime.kart.position().y).toBeLessThan(-2);
  expect(runtime.lapTracker.snapshot().nextCheckpoint).toBe(earned);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  const paused = runtime.kart.position();
  tick(500);
  expect(runtime.kart.position().distanceTo(paused)).toBe(0);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  phase('racing');
  runtime.respawn();
  expect(route.project(runtime.kart.position()).pathId).toBeUndefined();
  expect(runtime.lapTracker.snapshot().nextCheckpoint).toBe(earned);
  game.dispose();
  expect(runtime.racerRoutes.size).toBe(0);
}, 15000);

it('does not apply planar kart or Prismatic contacts through the tunnel ceiling', async () => {
  const { game } = await setup('', 'neon-grid');
  const runtime = game as unknown as {
    track: import('../src/game/track/NeonGrid').NeonGrid;
    kart: import('../src/game/physics/KartController').KartController;
    opponents: {
      id: string;
      controller: import('../src/game/physics/KartController').KartController;
    }[];
    resolveKartContacts: (dt: number) => void;
    prismatic: import('../src/game/items/PrismaticSystem').PrismaticSystem;
    racerEffects: import('../src/game/items/RacerEffects').RacerEffects;
  };
  const p = runtime.track.serviceTunnel.curve.getPointAt(0.5),
    rival = runtime.opponents[0];
  if (!rival) throw new Error('Missing rival');
  runtime.kart.respawn(p, 0);
  rival.controller.respawn(p.clone().add(new THREE.Vector3(1, 4, 0)), 0);
  const before = runtime.kart.velocity();
  runtime.prismatic.activate('player', () => true);
  runtime.resolveKartContacts(1 / 60);
  expect(runtime.kart.velocity().distanceTo(before)).toBe(0);
  expect(
    runtime.prismatic.contacts([
      { id: 'player', position: runtime.kart.position(), finished: false },
      { id: rival.id, position: rival.controller.position(), finished: false },
    ]),
  ).toHaveLength(0);
  game.dispose();
});

it.each(
  [0, 4].flatMap((seconds) =>
    [0, Math.PI / 2, Math.PI].map((yawOffset) => ({ seconds, yawOffset })),
  ),
)(
  'uses authoritative race time for billboard entry and applies one exit retention, phase=$seconds yaw=$yawOffset',
  async ({ seconds, yawOffset }) => {
    const { game, tick, advance } = await setup('', 'neon-grid');
    const runtime = game as unknown as {
      track: import('../src/game/track/NeonGrid').NeonGrid;
      neonRoute: (id: string) => import('../src/game/track/RacerTrack').RacerTrack;
      kart: import('../src/game/physics/KartController').KartController;
      raceDirector: { raceTime: () => number };
      respawn: () => void;
    };
    vi.spyOn(runtime.raceDirector, 'raceTime').mockReturnValue(seconds);
    const gap = runtime.track.billboardGap,
      route = runtime.neonRoute('player');
    const t = gap.curve.getTangentAt(gap.mouthDistance / gap.curve.getLength()),
      at = (d: number) => gap.curve.getPointAt(d / gap.curve.getLength());
    runtime.kart.respawn(at(gap.mouthDistance - 0.2), Math.atan2(t.x, t.z));
    runtime.kart.body.setLinvel({ x: t.x * 28, y: 0, z: t.z * 28 }, true);
    advance.mockRestore();
    tick(1000 / 60);
    expect(route.project(runtime.kart.position()).pathId).toBe('billboard-gap');
    expect(route.project(runtime.kart.position()).surface).toBe(
      seconds === 0 ? 'static' : 'asphalt',
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    const paused = runtime.kart.position();
    tick(500);
    expect(runtime.kart.position().distanceTo(paused)).toBe(0);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    const end = gap.curve.getPointAt(1),
      tEnd = gap.curve.getTangentAt(1),
      planarEnd = tEnd.clone().setY(0).normalize();
    runtime.kart.respawn(
      end
        .clone()
        .addScaledVector(tEnd, -0.2)
        .add(new THREE.Vector3(0, -0.6, 0)),
      Math.atan2(tEnd.x, tEnd.z) + yawOffset,
    );
    runtime.kart.body.setLinvel({ x: planarEnd.x * 28, y: 0, z: planarEnd.z * 28 }, true);
    tick(34);
    expect(route.project(runtime.kart.position()).pathId).toBeUndefined();
    expect(runtime.kart.speedMetersPerSecond()).toBeCloseTo(
      28 *
        Math.exp((-(yawOffset === Math.PI / 2 ? 20 / 3 : 0.65) * 2) / 60) *
        (seconds === 0 ? 0.82 : 1),
      1,
    );
    const exitedSpeed = runtime.kart.speedMetersPerSecond();
    tick(1000 / 60);
    expect(runtime.kart.speedMetersPerSecond()).toBeGreaterThan(
      exitedSpeed * (yawOffset === Math.PI / 2 ? 0.85 : 0.97),
    );
    runtime.respawn();
    expect(route.project(runtime.kart.position()).pathId).toBeUndefined();
    game.dispose();
  },
  15000,
);

it('freezes Neon race time and billboard visuals while hidden and drops the resumed wall-time interval', async () => {
  const { game, tick, advance } = await setup('', 'neon-grid');
  const runtime = game as unknown as {
    raceDirector: { raceTime: () => number; advance: (seconds: number) => void };
    trackScene: import('../src/game/track/createNeonGridScene').NeonGridScene;
  };
  runtime.raceDirector.advance(4);
  advance.mockRestore();
  tick(34);
  const before = runtime.raceDirector.raceTime();
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
  tick(500);
  expect(runtime.raceDirector.raceTime()).toBe(before);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new Event('visibilitychange'));
  tick(500);
  expect(runtime.raceDirector.raceTime()).toBe(before);
  tick(34);
  expect(runtime.raceDirector.raceTime()).toBeGreaterThan(before);
  game.dispose();
});

it.each(['player', 'ai'])(
  'keeps %s dive splash recovery once-only, paused, before gate 9 and earned-gates-only in the real race',
  async (owner) => {
    const { game, tick, advance, phase } = await setup('', 'neon-grid');
    const r = game as unknown as {
      track: import('../src/game/track/NeonGrid').NeonGrid;
      kart: import('../src/game/physics/KartController').KartController;
      opponents: {
        id: string;
        controller: import('../src/game/physics/KartController').KartController;
        lapTracker: import('../src/game/race/LapTracker').LapTracker;
      }[];
      neonRoute: (id: string) => import('../src/game/track/RacerTrack').RacerTrack;
      lapTracker: import('../src/game/race/LapTracker').LapTracker;
      raceDirector: { raceTime: () => number };
      respawn: () => void;
    };
    advance.mockRestore();
    for (let i = 0; i < 260; i++) tick(1000 / 60);
    const opponent = r.opponents[0];
    if (!opponent) throw new Error('No opponent');
    const id = owner === 'player' ? 'player' : opponent.id,
      kart = owner === 'player' ? r.kart : opponent.controller,
      laps = owner === 'player' ? r.lapTracker : opponent.lapTracker;
    const route = r.neonRoute(id),
      d = r.track.waterfallDive,
      p = d.pointAtDistance(d.mouthDistance),
      v = d.direction.clone().multiplyScalar(25);
    route.advanceDive(p.clone().addScaledVector(d.direction, -1), p, v, r.raceDirector.raceTime());
    // Fixture establishes a genuine missed landing; all subsequent physics/race/recovery wiring is real.
    kart.respawn(d.pointAtDistance(19).setY(-0.8), 0);
    const earned = laps.snapshot().nextCheckpoint;
    tick(1000 / 60);
    expect(route.diveState.splashing).toBe(true);
    const spy = vi.spyOn(kart, 'respawn');
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    const paused = kart.position();
    tick(500);
    expect(kart.position().distanceTo(paused)).toBe(0);
    expect(spy).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
    phase('racing');
    if (owner === 'player') {
      r.respawn();
      expect(spy).not.toHaveBeenCalled();
    }
    for (let i = 0; i < 88; i++) tick(1000 / 60);
    expect(spy).not.toHaveBeenCalled();
    for (let i = 0; i < 4; i++) tick(1000 / 60);
    expect(spy).toHaveBeenCalledTimes(1);
    const recovery = spy.mock.calls[0]?.[0];
    expect(recovery?.distanceTo(d.recoveryPosition)).toBeLessThan(0.001);
    expect(r.track.projectMain(kart.position()).progress).toBeLessThan(
      r.track.lapCheckpointProgress(9),
    );
    expect(laps.snapshot().nextCheckpoint).toBe(earned);
    for (let i = 0; i < 30; i++) tick(1000 / 60);
    expect(spy).toHaveBeenCalledTimes(1);
  },
  15000,
);

it('physically carries an already-selected player Dive through Rocket and releases at landing without gate awards', async () => {
  const { game, tick, advance } = await setup('', 'neon-grid');
  const r = game as unknown as {
    track: import('../src/game/track/NeonGrid').NeonGrid;
    neonRoute: (id: string) => import('../src/game/track/RacerTrack').RacerTrack;
    kart: import('../src/game/physics/KartController').KartController;
    world: import('@dimforge/rapier3d-compat').World;
    lapTracker: import('../src/game/race/LapTracker').LapTracker;
    hyperDriveRocket: import('../src/game/items/HyperDriveRocket').HyperDriveRocketSystem;
    raceDirector: { raceTime: () => number };
  };
  advance.mockRestore();
  for (let i = 0; i < 260; i++) tick(1000 / 60);
  const d = r.track.waterfallDive,
    route = r.neonRoute('player'),
    p = d.pointAtDistance(7),
    v = d.direction.clone().multiplyScalar(25);
  route.advanceDive(p.clone().addScaledVector(d.direction, -1), p, v, r.raceDirector.raceTime());
  // Fixture starts on the authored ramp; native launch and flight are unmodified.
  r.kart.respawn(d.pointAtDistance(13).setY(9), Math.atan2(d.direction.x, d.direction.z));
  for (let i = 0; i < 60; i++) r.world.step();
  r.kart.body.setLinvel({ x: v.x, y: 0, z: v.z }, true);
  expect(r.hyperDriveRocket.activate('player', () => true)).toBe(true);
  const earned = r.lapTracker.snapshot().nextCheckpoint;
  let air = 0,
    landed = false;
  for (let i = 0; i < 240; i++) {
    tick(1000 / 60);
    if (route.diveState.active && r.kart.feedback().airborne) air++;
    landed ||= route.diveState.landed;
    if (landed) break;
  }
  expect({ landed, air, splash: route.diveState.splashing }).toMatchObject({
    landed: true,
    splash: false,
  });
  expect(air).toBeGreaterThan(3);
  expect(r.lapTracker.snapshot().nextCheckpoint).toBe(earned);
}, 15000);
