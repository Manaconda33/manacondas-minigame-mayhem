import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { batchStaticKartMeshes } from '../src/game/rendering/batchStaticKartMeshes';

function meshCount(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) count += 1;
  });
  return count;
}

// Independent vertex multiset detects moved/lost faces, wrong normals/materials/shadow flags.
function vertices(root: THREE.Object3D): Map<string, number[]> {
  root.updateMatrixWorld(true);
  const result = new Map<string, number[]>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return;
    const mesh = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    const position = mesh.geometry.getAttribute('position');
    const normal = mesh.geometry.getAttribute('normal');
    const uv = mesh.geometry.getAttribute('uv') as THREE.BufferAttribute | undefined;
    const index = mesh.geometry.index;
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
    // Multi-material controls load as groups; their child primitives remain dynamic too.
    let steeringControl: THREE.Object3D | null = object;
    while (steeringControl !== null && steeringControl.name !== 'SteeringWheel')
      steeringControl = steeringControl.parent;
    const key = [
      mesh.material.uuid,
      object.castShadow,
      object.receiveShadow,
      steeringControl !== null ? 'steering' : 'static',
    ].join('|');
    const values = result.get(key) ?? [];
    for (let i = 0; i < (index?.count ?? position.count); i += 1) {
      const vertex = index?.getX(i) ?? i;
      const p = new THREE.Vector3()
        .fromBufferAttribute(position, vertex)
        .applyMatrix4(object.matrixWorld);
      const n = new THREE.Vector3()
        .fromBufferAttribute(normal, vertex)
        .applyNormalMatrix(normalMatrix);
      values.push(...p.toArray(), ...n.toArray());
      if (uv !== undefined) values.push(uv.getX(vertex), uv.getY(vertex));
    }
    result.set(key, values);
  });
  return result;
}

function expectPreserved(actual: Map<string, number[]>, expected: Map<string, number[]>): void {
  expect([...actual.keys()].sort()).toEqual([...expected.keys()].sort());
  for (const [key, before] of expected) {
    const after = actual.get(key);
    expect(after?.length).toBe(before.length);
    if (after === undefined) throw new Error('Lost material/shadow group');
    let maximumError = 0;
    for (let i = 0; i < before.length; i += 1) {
      maximumError = Math.max(maximumError, Math.abs((before[i] ?? 0) - (after[i] ?? 0)));
    }
    // Float32 geometry baking introduces sub-micrometer rounding; triangle order must remain exact.
    expect(maximumError).toBeLessThan(0.000002);
  }
}

describe('static kart batching', () => {
  it('combines same-material static parts without moving geometry or dynamic steering/anchors', () => {
    const root = new THREE.Group();
    const material = new THREE.MeshStandardMaterial();
    const geometry = new THREE.BoxGeometry();
    for (let i = 0; i < 3; i += 1) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(i * 2, 0.5, -1);
      mesh.castShadow = mesh.receiveShadow = true;
      root.add(mesh);
    }
    const steering = new THREE.Mesh(geometry, material);
    steering.name = 'SteeringWheel';
    const anchor = new THREE.Object3D();
    anchor.name = 'DriverMount';
    root.add(steering, anchor);
    const before = vertices(root);
    const release = batchStaticKartMeshes(root);
    expect(meshCount(root)).toBe(2);
    expectPreserved(vertices(root), before);
    expect(root.getObjectByName('SteeringWheel')).toBe(steering);
    expect(root.getObjectByName('DriverMount')).toBe(anchor);
    steering.position.x = 7;
    expect(root.getObjectByName('SteeringWheel')?.position.x).toBe(7);
    let disposed = 0;
    root.traverse((object) => {
      if (object instanceof THREE.Mesh && object !== steering) {
        (object as THREE.Mesh).geometry.addEventListener('dispose', () => {
          disposed += 1;
        });
      }
    });
    release();
    release();
    expect(disposed).toBe(1);
  });

  it('releases replaced source buffers at load time and preserves rotated/scaled nested parts', () => {
    const root = new THREE.Group();
    root.rotation.y = 1.1;
    root.scale.setScalar(0.7);
    const nested = new THREE.Group();
    nested.position.set(0.3, 0.4, 0.5);
    nested.rotation.z = 0.3;
    root.add(nested);
    const material = new THREE.MeshStandardMaterial();
    let retired = 0;
    for (let i = 0; i < 2; i += 1) {
      const geometry = new THREE.BoxGeometry();
      geometry.addEventListener('dispose', () => {
        retired += 1;
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i;
      nested.add(mesh);
    }
    const before = vertices(root);
    const release = batchStaticKartMeshes(root);
    expect(retired).toBe(2);
    expectPreserved(vertices(root), before);
    release();
    expect(retired).toBe(2);
  });

  it('leaves transparent, skinned, morph, hidden and mirrored parts untouched', () => {
    const root = new THREE.Group();
    const opaque = new THREE.MeshStandardMaterial();
    const glass = new THREE.MeshStandardMaterial({ transparent: true });
    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < 2; i += 1) {
      const transparent = new THREE.Mesh(new THREE.BoxGeometry(), glass);
      const skinned = new THREE.SkinnedMesh(new THREE.BoxGeometry(), opaque);
      const hidden = new THREE.Mesh(new THREE.BoxGeometry(), opaque);
      hidden.visible = false;
      const mirrored = new THREE.Mesh(new THREE.BoxGeometry(), opaque);
      mirrored.scale.x = -1;
      const morphGeometry = new THREE.BoxGeometry();
      morphGeometry.morphAttributes.position = [morphGeometry.getAttribute('position').clone()];
      const morph = new THREE.Mesh(morphGeometry, opaque);
      meshes.push(transparent, skinned, hidden, mirrored, morph);
    }
    root.add(...meshes);
    batchStaticKartMeshes(root);
    expect(root.children).toEqual(meshes);
  });

  it('keeps distinct shadow policies and layers in separate batches', () => {
    const root = new THREE.Group();
    const material = new THREE.MeshStandardMaterial();
    for (let i = 0; i < 4; i += 1) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
      mesh.castShadow = i < 2;
      mesh.layers.set(i % 2);
      root.add(mesh);
    }
    batchStaticKartMeshes(root);
    expect(meshCount(root)).toBe(4);
  });

  for (let id = 1; id <= 14; id += 1) {
    it(`preserves approved production kart aa-${String(id).padStart(2, '0')} while reducing submissions`, async () => {
      const encoded = readFileSync(
        `public/assets/characters/${id === 14 ? 'lunarcrystal' : `aa-${String(id).padStart(2, '0')}`}/kart.glb`,
        'base64',
      );
      const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
      // JSDOM cannot decode embedded PNGs. Replace only image decoding; real GLTF geometry/material loading stays intact.
      const loader = new GLTFLoader();
      loader.register(() => ({
        name: 'TestImageDecode',
        loadTexture: () => Promise.resolve(new THREE.Texture()),
      }));
      const gltf = await loader.parseAsync(bytes.buffer, '');
      expect(gltf.animations).toHaveLength(0);
      const root = gltf.scene;
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) object.castShadow = object.receiveShadow = true;
      });
      const before = vertices(root);
      const count = meshCount(root);
      const steering = root.getObjectByName('SteeringWheel');
      const anchor = root.getObjectByName('DriverMount');
      const release = batchStaticKartMeshes(root);
      expect(meshCount(root)).toBeLessThan(count);
      expectPreserved(vertices(root), before);
      expect(root.getObjectByName('SteeringWheel')).toBe(steering);
      expect(root.getObjectByName('DriverMount')).toBe(anchor);
      release();
    });
  }
});
