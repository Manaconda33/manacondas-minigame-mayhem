import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CharacterDefinition } from '../characters/manifest';

export interface CharacterPreviewAssetState {
  kartUrl: string | undefined;
  driverUrl: string | undefined;
  kartVisualYaw: number;
  fallbackLabel: string;
}

export function characterPreviewAssetState(
  character: CharacterDefinition,
): CharacterPreviewAssetState {
  return {
    kartUrl: character.kart,
    driverUrl: character.driver?.front,
    kartVisualYaw: character.kartVisualYaw ?? 0,
    fallbackLabel: character.kartName ?? 'Fallback prototype',
  };
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const mesh = object as THREE.Mesh & {
      geometry: THREE.BufferGeometry;
      material: THREE.Material | THREE.Material[];
    };
    mesh.geometry.dispose();
    const materials: THREE.Material[] = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of materials) {
      const materialWithMaps = material as THREE.Material & {
        map?: unknown;
        alphaMap?: unknown;
        normalMap?: unknown;
        roughnessMap?: unknown;
        metalnessMap?: unknown;
      };
      for (const key of ['map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap'] as const) {
        const texture = materialWithMaps[key];
        if (texture instanceof THREE.Texture) texture.dispose();
      }
      material.dispose();
    }
  });
}

function clearGroup(group: THREE.Group): void {
  for (const child of [...group.children]) {
    group.remove(child);
    disposeObject(child);
  }
}

function createFallbackKart(character: CharacterDefinition): THREE.Group {
  const group = new THREE.Group();
  const accent = new THREE.Color(character.accent);
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.5, 2.55),
    new THREE.MeshStandardMaterial({ color: accent, metalness: 0.35, roughness: 0.34 }),
  );
  chassis.position.y = 0.35;
  chassis.castShadow = true;

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.32, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xf5c75b, metalness: 0.3, roughness: 0.3 }),
  );
  nose.position.set(0, 0.48, 1.06);
  nose.castShadow = true;

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.42, 0.85),
    new THREE.MeshStandardMaterial({ color: 0x081326, metalness: 0.2, roughness: 0.4 }),
  );
  canopy.position.set(0, 0.78, -0.2);
  canopy.castShadow = true;
  group.add(chassis, nose, canopy);

  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x080b13, roughness: 0.88 });
  for (const x of [-0.9, 0.9]) {
    for (const z of [-0.78, 0.78]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 16), wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.05, z);
      wheel.castShadow = true;
      group.add(wheel);
    }
  }
  return group;
}

export class CharacterKartPreview {
  private readonly canvas: HTMLCanvasElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private readonly modelHolder = new THREE.Group();
  private readonly loader = new GLTFLoader();
  private readonly renderer: THREE.WebGLRenderer | null;
  private readonly floor: THREE.Mesh;
  private readonly reducedMotion: boolean;
  private animationFrame = 0;
  private loadGeneration = 0;
  private disposed = false;
  private lastFrame = 0;

  public constructor(canvas: HTMLCanvasElement, character: CharacterDefinition) {
    this.canvas = canvas;
    this.reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.camera.position.set(0, 2.25, 7.2);
    this.camera.lookAt(0, 0.65, 0);
    this.scene.add(this.modelHolder);
    this.scene.add(new THREE.HemisphereLight(0x9cecf4, 0x090d1b, 2.1));

    const key = new THREE.DirectionalLight(0xffe4a5, 3.2);
    key.position.set(-4, 7, 5);
    key.castShadow = true;
    this.scene.add(key);

    const cyan = new THREE.PointLight(0x30d9ec, 16, 12, 2);
    cyan.position.set(-3.2, 1.3, 2.8);
    this.scene.add(cyan);

    const violet = new THREE.PointLight(0xa94fe9, 14, 10, 2);
    violet.position.set(3.4, 1.4, -2.5);
    this.scene.add(violet);

    this.floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.35, 64),
      new THREE.MeshStandardMaterial({
        color: 0x071326,
        emissive: 0x071d36,
        emissiveIntensity: 0.7,
        metalness: 0.55,
        roughness: 0.34,
        transparent: true,
        opacity: 0.9,
      }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.06;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.renderer = this.createRenderer(canvas);
    this.setPreviewState(
      this.renderer === null ? 'unavailable' : 'loading',
      this.renderer === null ? 'WEBGL UNAVAILABLE / CSS FALLBACK' : 'LOADING GLB / FALLBACK READY',
    );
    void this.setCharacter(character);
    if (this.renderer === null) return;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.resize();
    window.addEventListener('resize', this.resize);
    this.startRenderLoop();
  }

  public async setCharacter(character: CharacterDefinition): Promise<void> {
    const generation = ++this.loadGeneration;
    clearGroup(this.modelHolder);
    this.modelHolder.rotation.y = 0;
    this.modelHolder.add(createFallbackKart(character));
    this.setPreviewState(
      this.renderer === null ? 'unavailable' : 'fallback',
      this.renderer === null ? 'WEBGL UNAVAILABLE / CSS FALLBACK' : 'FALLBACK CHASSIS READY',
    );

    if (this.renderer === null || character.kart === undefined) return;

    try {
      const gltf = await this.loader.loadAsync(character.kart);
      if (this.disposed || generation !== this.loadGeneration) {
        disposeObject(gltf.scene);
        return;
      }
      clearGroup(this.modelHolder);
      const model = gltf.scene;
      model.rotation.y = character.kartVisualYaw ?? 0;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      model.scale.setScalar(3.65 / Math.max(size.x, size.z, 0.001));
      bounds.setFromObject(model);
      model.position.y = -bounds.min.y;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      this.modelHolder.add(model);
      this.setPreviewState('loaded', 'GLB / YAW LOCKED');
      this.renderScene();
    } catch (error) {
      if (!this.disposed && generation === this.loadGeneration) {
        this.setPreviewState('fallback', 'FALLBACK CHASSIS / GLB UNAVAILABLE');
        this.renderScene();
        console.warn(
          `Could not load ${character.displayName}'s preview kart; using fallback.`,
          error,
        );
      }
    }
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.loadGeneration += 1;
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.resize);
    clearGroup(this.modelHolder);
    this.scene.remove(this.floor);
    disposeObject(this.floor);
    this.renderer?.dispose();
  }

  private createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer | null {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return null;
    try {
      return new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return null;
    }
  }

  private readonly resize = (): void => {
    if (this.renderer === null) return;
    const width = Math.max(this.canvas.clientWidth, this.canvas.parentElement?.clientWidth ?? 0, 1);
    const height = Math.max(
      this.canvas.clientHeight,
      this.canvas.parentElement?.clientHeight ?? 0,
      1,
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private startRenderLoop(): void {
    if (this.renderer === null) return;
    if (this.reducedMotion) {
      this.renderScene();
      return;
    }
    this.lastFrame = performance.now();
    this.animationFrame = requestAnimationFrame(this.renderFrame);
  }

  private readonly renderFrame = (time: number): void => {
    if (this.disposed || this.renderer === null) return;
    const delta = Math.min((time - this.lastFrame) / 1000, 0.05);
    this.lastFrame = time;
    this.modelHolder.rotation.y += delta * 0.24;
    this.renderScene();
    this.animationFrame = requestAnimationFrame(this.renderFrame);
  };

  private renderScene(): void {
    if (this.disposed || this.renderer === null) return;
    this.renderer.render(this.scene, this.camera);
  }

  private setPreviewState(state: string, label: string): void {
    this.canvas.dataset.kartPreviewState = state;
    const stateLabel = this.canvas.parentElement?.querySelector<HTMLElement>(
      '[data-kart-preview-state-label]',
    );
    if (stateLabel !== null && stateLabel !== undefined) stateLabel.textContent = label;
  }
}
