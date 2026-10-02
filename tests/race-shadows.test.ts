import { requireValue } from './requireValue';
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { RaceShadows } from '../src/game/rendering/RaceShadows';
import { markBloomMaterial } from '../src/game/rendering/bloomEligibility';

function kart(x = 0): THREE.Group {
  const root = new THREE.Group();
  root.position.x = x;
  root.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));
  return root;
}

function casts(root: THREE.Object3D): boolean {
  let result = false;
  root.traverse((object) => {
    result ||= object.castShadow;
  });
  return result;
}

describe('race shadow selection and stability', () => {
  it('prioritizes the player and nearby karts, caps dynamic roots and retires distant casters', () => {
    const scene = new THREE.Scene();
    const shadows = new RaceShadows(scene, 'medium');
    const player = kart();
    const rivals = [kart(54), kart(56)];
    const projectiles = Array.from({ length: 20 }, (_, i) => kart(i + 1));
    scene.add(player, ...rivals, ...projectiles);
    shadows.update(new THREE.Vector3(), player, rivals, projectiles);
    expect(casts(player)).toBe(true);
    expect(casts(requireValue(rivals[0]))).toBe(true);
    expect(casts(requireValue(rivals[1]))).toBe(false);
    expect(projectiles.filter(casts)).toHaveLength(10);
    expect(casts(requireValue(projectiles[10]))).toBe(false);
    shadows.update(new THREE.Vector3(200, 0, 0), player, rivals, []);
    expect(casts(player)).toBe(true);
    expect(rivals.some(casts)).toBe(false);
    expect(projectiles.some(casts)).toBe(false);
    shadows.dispose();
  });

  it('excludes transparent energy, sprites, hidden parts and transparent-only roots from the budget', () => {
    const scene = new THREE.Scene();
    const shadows = new RaceShadows(scene, 'high');
    const player = kart();
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(),
      new THREE.MeshBasicMaterial({ transparent: true }),
    );
    const sprite = new THREE.Sprite();
    const hidden = kart();
    hidden.visible = false;
    player.add(glow, sprite, hidden);
    const energy = new THREE.Group();
    energy.add(glow.clone());
    const hotCore = new THREE.Mesh(
      new THREE.SphereGeometry(),
      markBloomMaterial(new THREE.MeshBasicMaterial(), 'color'),
    );
    energy.add(hotCore);
    const opaque = Array.from({ length: 15 }, (_, i) => kart(i + 2));
    scene.add(player, energy, ...opaque);
    shadows.update(new THREE.Vector3(), player, [], [energy, ...opaque]);
    expect(glow.castShadow).toBe(false);
    expect(sprite.castShadow).toBe(false);
    expect(casts(hidden)).toBe(false);
    expect(casts(energy)).toBe(false);
    expect(opaque.filter(casts)).toHaveLength(11);
    shadows.dispose();
  });

  it('keeps light-space texels stable for subtexel movement and follows recovery across the course', () => {
    const scene = new THREE.Scene();
    const shadows = new RaceShadows(scene, 'medium');
    const player = kart();
    scene.add(player);
    const mesh = requireValue(player.children[0]) as THREE.Mesh;
    const releaseGeometry = vi.spyOn(mesh.geometry, 'dispose');
    shadows.update(new THREE.Vector3(), player, [], []);
    const sun = requireValue(
      scene.children.find(
        (object): object is THREE.DirectionalLight => object instanceof THREE.DirectionalLight,
      ),
    );
    const before = sun.target.position.clone();
    const right = new THREE.Vector3().setFromMatrixColumn(sun.shadow.camera.matrixWorld, 0);
    shadows.update(right.clone().multiplyScalar(0.01), player, [], []);
    expect(sun.target.position.distanceTo(before)).toBeLessThan(0.00001);
    shadows.update(new THREE.Vector3(300, 0, -200), player, [], []);
    expect(sun.target.position.distanceTo(new THREE.Vector3(300, 0, -200))).toBeLessThan(0.1);
    const projected = new THREE.Vector3(300, 0, -200).project(sun.shadow.camera);
    expect(Math.abs(projected.x)).toBeLessThan(0.01);
    expect(Math.abs(projected.y)).toBeLessThan(0.01);
    expect(Math.abs(projected.z)).toBeLessThan(1);
    shadows.dispose();
    expect(releaseGeometry).not.toHaveBeenCalled();
  });

  it('disables Low and releases the owned shadow resource once without disposing model assets', () => {
    const scene = new THREE.Scene();
    const shadows = new RaceShadows(scene, 'low');
    const player = kart();
    requireValue(player.children[0]).castShadow = true;
    scene.add(player);
    shadows.update(new THREE.Vector3(), player, [], []);
    expect(casts(player)).toBe(false);
    const sun = requireValue(
      scene.children.find(
        (object): object is THREE.DirectionalLight => object instanceof THREE.DirectionalLight,
      ),
    );
    expect(sun.castShadow).toBe(false);
    const dispose = vi.spyOn(sun.shadow, 'dispose');
    shadows.dispose();
    shadows.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(scene.children).toEqual([player]);
  });
});
