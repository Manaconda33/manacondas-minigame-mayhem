import * as THREE from 'three';
import { NeonGrid } from '../../game/track/NeonGrid';
import { createNeonGridScene } from '../../game/track/createNeonGridScene';
import { loadServiceTunnelConcreteWallMaterial } from '../../game/track/ServiceTunnelConcreteMaterial';
import { disposeTrackScene } from '../../game/track/TrackSceneResources';
import { RaceBloom } from '../../game/rendering/RaceBloom';
import { RaceShadows } from '../../game/rendering/RaceShadows';
import type { EditorView } from './EditorDocument';
import type { EditorPaths } from './EditorRoad';
import { TrackSegmentIndex } from '../../game/track/TrackSegmentIndex';
import type { TrackProjection } from '../../game/track/TrackDefinition';
export function createEditorWorld() {
  const track = new NeonGrid();
  const root = createNeonGridScene(
    track,
    'medium',
    'fog-experiment-c2-background',
    'concrete-coverage-c2-001',
  );
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080f1d);
  scene.fog = new THREE.Fog(0x10192b, 180, 650);
  scene.add(root, new THREE.HemisphereLight(0xcbb7ff, 0x263822, 2.1));
  const shadows = new RaceShadows(scene, 'medium');
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
  camera.position.set(250, 260, 310);
  camera.lookAt(20, 0, 10);
  const overlayScene = new THREE.Scene();
  // Freeze source animation before taking component baselines. Later frames never overwrite edits.
  root.billboard.update(0);
  root.dive.update(0);
  root.fallsRun.update(0);
  root.fallsRunExtension.update(0);
  root.skyline.update(0);
  root.undercity.update(0);
  let disposed = false;
  const originalMain = track.projectMain.bind(track),
    originalTunnel = track.serviceTunnel.project.bind(track.serviceTunnel);
  function setFogPaths(paths: EditorPaths) {
    if (paths.unchanged) {
      track.projectMain = originalMain;
      track.serviceTunnel.project = originalTunnel;
      return;
    }
    function projector(curve: THREE.Curve<THREE.Vector3>, tunnel: boolean) {
      const count = 384,
        index = new TrackSegmentIndex(
          Array.from({ length: count + 1 }, (_, i) => curve.getPointAt(i / count)),
          false,
        );
      return (position: THREE.Vector3): TrackProjection => {
        const nearest = index.nearest(position),
          u = THREE.MathUtils.clamp((nearest.index + nearest.fraction) / count, 0, 1),
          tangent = curve.getTangentAt(u).normalize();
        const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(),
          offset = position.clone().sub(nearest.point).dot(right);
        const progress = tunnel
          ? THREE.MathUtils.lerp(
              track.serviceTunnel.entry.progress[0],
              track.serviceTunnel.exitProgress,
              u,
            )
          : u;
        return {
          index: Math.floor(progress * count),
          progress,
          point: nearest.point,
          tangent,
          lateralDistance: Math.abs(offset),
          lateralOffset: offset,
          surface: 'asphalt',
          ...(tunnel ? { pathId: 'service-tunnel' as const } : {}),
        };
      };
    }
    track.projectMain = projector(paths.main, false);
    if (paths.shortcuts['service-tunnel'])
      track.serviceTunnel.project = projector(paths.shortcuts['service-tunnel'], true);
  }
  return {
    track,
    root,
    scene,
    camera,
    overlayScene,
    shadows,
    setFogPaths,
    async load() {
      await loadEditorAssets([
        () => root.billboard.load(),
        () => root.skyline.load(),
        () => root.undercity.load(),
        () => root.tunnelWarnings.load(),
        () => loadServiceTunnelConcreteWallMaterial(root),
      ]);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      shadows.dispose();
      disposeTrackScene(root);
      disposeTrackScene(overlayScene);
      scene.clear();
    },
  };
}
export type EditorWorld = ReturnType<typeof createEditorWorld>;
/** allSettled prevents late uploads from racing cleanup when any source asset fails. */
export async function loadEditorAssets(loaders: (() => Promise<unknown>)[]): Promise<void> {
  const results = await Promise.allSettled(loaders.map((load) => load()));
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected')
    throw new Error(`Editor approved-asset load failed: ${String(failed.reason)}`);
}
export async function createEditorScene(canvas: HTMLCanvasElement) {
  const world = createEditorWorld();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (error) {
    world.dispose();
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const bloom = new RaceBloom(renderer, 'medium');
  const fog = world.scene.fog;
  const fogUniforms = new Map<THREE.IUniform<number>, number>();
  const patched = new Set<THREE.Material>();
  let fogEnabled = true;
  function captureFogUniforms() {
    world.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const sourceMaterial = object.material as THREE.Material | THREE.Material[];
      const materials = Array.isArray(sourceMaterial) ? sourceMaterial : [sourceMaterial];
      for (const material of materials) {
        if (patched.has(material) || !material.userData.abyssVerticalFog) continue;
        patched.add(material);
        const original = material.onBeforeCompile.bind(material);
        material.onBeforeCompile = (shader, currentRenderer) => {
          original(shader, currentRenderer);
          const uniform = shader.uniforms.uAbyssFogV3MaximumBlend as
            THREE.IUniform<number> | undefined;
          if (uniform && !fogUniforms.has(uniform)) fogUniforms.set(uniform, uniform.value);
          if (uniform && !fogEnabled) uniform.value = 0;
        };
      }
    });
  }
  try {
    await world.load();
    captureFogUniforms();
  } catch (error) {
    bloom.dispose();
    renderer.dispose();
    world.dispose();
    throw error;
  }
  let disposed = false;
  const emptyCaster = new THREE.Group();
  let metrics = {
    calls: 0,
    triangles: 0,
    helperCalls: 0,
    helperTriangles: 0,
    textures: 0,
    geometries: 0,
    renderMs: 0,
  };
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    world.camera.aspect = Math.max(1, width) / Math.max(1, height);
    world.camera.updateProjectionMatrix();
    const drawing = renderer.getDrawingBufferSize(new THREE.Vector2());
    bloom.resize(drawing.x, drawing.y);
  }
  resize();
  return {
    ...world,
    renderer,
    bloom,
    resize,
    metrics: () => ({ ...metrics, bloom: bloom.snapshot() }),
    render(view: Pick<EditorView, 'fog' | 'helpers' | 'target'>) {
      if (disposed) return;
      const start = performance.now();
      fogEnabled = view.fog;
      world.scene.fog = fogEnabled ? fog : null;
      for (const [uniform, maximum] of fogUniforms) uniform.value = fogEnabled ? maximum : 0;
      const backdrop = world.root.getObjectByName('neon-grid-abyss-fog-v3-backdrop');
      if (backdrop) backdrop.visible = fogEnabled;
      world.shadows.update(new THREE.Vector3().fromArray(view.target), emptyCaster, [], []);
      bloom.render(world.scene, world.camera, false);
      const base = { ...renderer.info.render };
      if (view.helpers) {
        const reset = renderer.info.autoReset;
        renderer.info.autoReset = false;
        const autoClear = renderer.autoClear;
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(world.overlayScene, world.camera);
        renderer.autoClear = autoClear;
        renderer.info.autoReset = reset;
      }
      metrics = {
        calls: base.calls,
        triangles: base.triangles,
        helperCalls: renderer.info.render.calls - base.calls,
        helperTriangles: renderer.info.render.triangles - base.triangles,
        textures: renderer.info.memory.textures,
        geometries: renderer.info.memory.geometries,
        renderMs: performance.now() - start,
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      bloom.dispose();
      renderer.dispose();
      world.dispose();
    },
  };
}
export type EditorScene = Awaited<ReturnType<typeof createEditorScene>>;
