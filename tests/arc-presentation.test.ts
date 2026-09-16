import { describe, expect, it, vi } from 'vitest';
import { Frustum, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
import { ArcBladeAudio } from '../src/audio/ArcBladeAudio';
import { ArcBladeFlashes, ArcBladeVisual } from '../src/game/items/ArcBladeVisual';
import { ARC_BLADE_CONFIG, ARC_OUTBOUND_DISTANCE } from '../src/game/items/ArcBlade';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { ChaseCamera } from '../src/game/camera/ChaseCamera';
import { requireValue } from './requireValue';

describe('Arc presentation and resource lifecycle', () => {
  it('uses three segments, a bounded ribbon and a brighter return accent; pause freezes animation', () => {
    const v = new ArcBladeVisual();
    expect(v.blade.children).toHaveLength(5);
    for (let i = 0; i < 1000; i++) v.update(new Vector3(i * 0.25, 4, 0), 'outbound', 0.25 / 42);
    expect(v.trail.geometry.getAttribute('position').count).toBe(20);
    expect(v.trail.geometry.drawRange.count).toBe(54);
    const oldPositions = Array.from(v.trail.geometry.getAttribute('position').array);
    const rotation = v.blade.rotation.y;
    const accent = requireValue(v.blade.getObjectByName('arc-return-accent')) as Mesh<
      import('three').TorusGeometry,
      MeshBasicMaterial
    >;
    expect(accent.material.opacity).toBe(0.35);
    v.update(new Vector3(500, 4, 0), 'return', 0);
    expect(accent.material.opacity).toBe(1);
    expect(v.blade.rotation.y).toBe(rotation);
    expect(Array.from(v.trail.geometry.getAttribute('position').array)).toEqual(oldPositions);
    const dispose = vi.spyOn(v.trail.geometry, 'dispose');
    v.dispose();
    expect(dispose).toHaveBeenCalledOnce();
    expect(v.blade.children).toHaveLength(0);
  });

  it.each([9 / 16, 16 / 9])(
    'puts blade geometry in both production camera frustums at aspect %s',
    (aspect) => {
      for (const rear of [false, true]) {
        const v = new ArcBladeVisual();
        const player = new Vector3(10, 0.35, 5);
        v.blade.position.copy(player).add(new Vector3(0, 0.25, rear ? -3 : 4));
        v.update(v.blade.position, rear ? 'return' : 'outbound', 0.01);
        v.blade.updateMatrixWorld(true);
        const camera = new PerspectiveCamera(62, aspect, 0.1, 900);
        const chase = new ChaseCamera(camera);
        // Arc use is unavailable during countdown; advance beyond the 2.85s intro.
        for (let i = 0; i < 240; i++) chase.update(player, new Vector3(0, 0, 1), rear, 1 / 60);
        expect(Math.sign(camera.position.z - player.z)).toBe(rear ? 1 : -1);
        camera.updateMatrixWorld(true);
        const frustum = new Frustum().setFromProjectionMatrix(
          new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
        );
        let visible = 0;
        v.blade.traverse((node) => {
          if (!(node instanceof Mesh)) return;
          const mesh = node as Mesh;
          const vertices = mesh.geometry.getAttribute('position');
          for (let i = 0; i < vertices.count; i++) {
            const p = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(node.matrixWorld);
            if (p.y > 0.08 && frustum.containsPoint(p)) visible++;
          }
        });
        expect(visible).toBeGreaterThan(20);
        v.dispose();
      }
    },
  );

  it('bounds hit/catch flashes and clears them after race time, with paused state preserved', () => {
    const flashes = new ArcBladeFlashes();
    for (let i = 0; i < 200; i++) flashes.emit(new Vector3(i, 1, 0), i % 2 === 0);
    expect(flashes.group.children).toHaveLength(40);
    const scale = requireValue(flashes.group.children[0]).scale.clone();
    flashes.update(0);
    expect(requireValue(flashes.group.children[0]).scale).toEqual(scale);
    flashes.update(0.18);
    expect(flashes.group.children).toHaveLength(0);
    flashes.emit(new Vector3(), true);
    flashes.dispose();
    expect(flashes.group.children).toHaveLength(0);
  });

  it('releases trails, meshes, capacity and contact state through 200 complete throws and repeated disposal', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const position = requireValue(track.samples[24]).clone().setY(0.72);
    const forward = requireValue(track.tangents[24]).clone().setY(0).normalize();
    const owner = { id: 'owner', position, forward, finished: false };
    for (let i = 0; i < 200; i++) {
      const id = system.spawn({
        itemId: 'arc-blade',
        ownerId: 'owner',
        direction: 'forward',
        config: ARC_BLADE_CONFIG,
        launch: { position, forward, velocity: new Vector3() },
      });
      expect(id).not.toBeNull();
      system.update(ARC_OUTBOUND_DISTANCE / 42, [owner]);
      system.update(1, [owner]);
      system.update(0.18, [owner]);
      expect(system.activeCount()).toBe(0);
      expect(system.group.children).toHaveLength(0);
    }
    system.dispose();
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  });

  it('plays distinct original cues only with unlocked non-muted audio, bounds voices, and stops on cleanup', async () => {
    const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
    const oscillators: {
      stop: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
      onended: (() => void) | null;
      frequency: ReturnType<typeof param>;
    }[] = [];
    const gains: { disconnect: ReturnType<typeof vi.fn> }[] = [];
    const context = {
      state: 'running',
      currentTime: 0,
      destination: {},
      resume: vi.fn(() => {
        context.state = 'running';
        return Promise.resolve();
      }),
      close: vi.fn(() => {
        context.state = 'closed';
        return Promise.resolve();
      }),
      createOscillator: vi.fn(() => {
        const o = {
          type: '',
          frequency: param(),
          start: vi.fn(),
          stop: vi.fn(),
          connect: vi.fn((g: unknown) => g),
          disconnect: vi.fn(),
          onended: null as (() => void) | null,
        };
        oscillators.push(o);
        return o;
      }),
      createGain: vi.fn(() => {
        const gain = { gain: param(), connect: vi.fn(), disconnect: vi.fn() };
        gains.push(gain);
        return gain;
      }),
    };
    const ctx = context as unknown as AudioContext;
    const audio = new ArcBladeAudio(() => ctx);
    audio.play('launch', 1);
    await audio.unlock();
    audio.play('launch', 0);
    audio.play('launch', NaN);
    context.state = 'suspended';
    audio.play('launch', 1);
    expect(oscillators).toHaveLength(0);
    await audio.unlock();
    expect(context.resume).toHaveBeenCalledOnce();
    for (const kind of ['launch', 'return', 'catch'] as const) audio.play(kind, 1);
    for (const [i, hz] of [520, 1100, 900].entries())
      expect(oscillators[i]?.frequency.setValueAtTime).toHaveBeenCalledWith(hz, 0);
    for (let i = 0; i < 40; i++) audio.play('launch', 1);
    expect(oscillators).toHaveLength(8);
    requireValue(oscillators[0]?.onended)();
    audio.play('catch', 1);
    expect(oscillators).toHaveLength(9);
    audio.stop();
    expect(oscillators.every((o) => o.disconnect.mock.calls.length > 0)).toBe(true);
    expect(gains.every((g) => g.disconnect.mock.calls.length > 0)).toBe(true);
    audio.play('launch', 1);
    expect(oscillators).toHaveLength(10);
    audio.stop();
    context.createGain.mockImplementationOnce(() => {
      throw new Error('Audio unavailable');
    });
    expect(() => {
      audio.play('launch', 1);
    }).not.toThrow();
    expect(oscillators.at(-1)?.disconnect).toHaveBeenCalled();
    audio.dispose();
    expect(context.close).toHaveBeenCalledOnce();
    await audio.unlock();
    audio.play('launch', 1);
    expect(context.state).toBe('closed');
  });
});
