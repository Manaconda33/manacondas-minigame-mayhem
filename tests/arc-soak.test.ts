import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { ARC_BLADE_CONFIG } from '../src/game/items/ArcBlade';
import { ProjectileSystem } from '../src/game/items/ProjectileSystem';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { requireValue } from './requireValue';

describe('Arc capacity stress', () => {
  it('remains finite and returns resources to baseline over 800 throws at shared capacity', () => {
    const track = new CircuitAlpha();
    const system = new ProjectileSystem(track);
    const position = requireValue(track.samples[24]).clone().setY(0.72);
    const forward = requireValue(track.tangents[24]).clone().setY(0).normalize();
    const targets = Array.from({ length: 8 }, (_, i) => ({
      id: i === 0 ? 'owner' : `rival-${String(i)}`,
      position: position.clone().addScaledVector(forward, i * -40),
      forward,
      finished: false,
    }));
    const samples: number[] = [];
    for (let cycle = 0; cycle < 20; cycle++) {
      for (let i = 0; i < 40; i++)
        expect(
          system.spawn({
            itemId: 'arc-blade',
            ownerId: 'owner',
            direction: 'forward',
            config: ARC_BLADE_CONFIG,
            launch: { position, forward, velocity: new Vector3() },
          }),
        ).not.toBeNull();
      expect(system.activeCount()).toBe(40);
      for (let frame = 0; frame < 100; frame++) {
        const count = system.activeCount();
        const start = performance.now();
        system.update(1 / 60, targets);
        const elapsed = performance.now() - start;
        if (cycle >= 2 && count === 40) samples.push(elapsed);
        for (const p of system.snapshots())
          expect(
            [...p.position.toArray(), ...p.velocity.toArray(), p.remainingSeconds].every(
              Number.isFinite,
            ),
          ).toBe(true);
        expect(system.group.children.length).toBeLessThanOrEqual(81);
      }
      expect(system.activeCount()).toBe(0);
      expect(system.group.children).toHaveLength(0);
    }
    samples.sort((a, b) => a - b);
    // Informational CPU observation only: CI coverage/JSDOM is not a rendered-device benchmark.
    console.log(
      `Arc 40-object update, 8 racer snapshots: ${String(samples.length)} samples; median=${(samples[Math.floor(samples.length * 0.5)] ?? 0).toFixed(3)}ms; p95=${(samples[Math.floor(samples.length * 0.95)] ?? 0).toFixed(3)}ms; max=${(samples.at(-1) ?? 0).toFixed(3)}ms`,
    );
    system.dispose();
    expect(system.group.children).toHaveLength(0);
  }, 20000);
});
