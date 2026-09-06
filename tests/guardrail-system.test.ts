import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import {
  GUARDRAIL_KART_RADIUS_METERS,
  GUARDRAIL_OFFSET_METERS,
  createGuardrailVisual,
  guardrailContact,
} from '../src/game/track/GuardrailSystem';

describe('Circuit Alpha guardrail system', () => {
  it('keeps the legal road and shoulder inside the collision boundary', () => {
    const track = new CircuitAlpha();
    const point = track.samples[20]?.clone();
    const tangent = track.tangents[20]?.clone();
    if (point === undefined || tangent === undefined) throw new Error('Missing track sample');
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();

    expect(
      guardrailContact(
        track,
        point.clone().addScaledVector(right, track.roadHalfWidth),
        GUARDRAIL_KART_RADIUS_METERS,
      ),
    ).toBeNull();
  });

  it('returns an inward correction after crossing either guardrail', () => {
    const track = new CircuitAlpha();
    const point = track.samples[40]?.clone();
    const tangent = track.tangents[40]?.clone();
    if (point === undefined || tangent === undefined) throw new Error('Missing track sample');
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();

    const rightContact = guardrailContact(
      track,
      point.clone().addScaledVector(right, GUARDRAIL_OFFSET_METERS),
      GUARDRAIL_KART_RADIUS_METERS,
    );
    expect(rightContact).not.toBeNull();
    expect(rightContact?.side).toBe(1);
    expect(rightContact?.penetration).toBeCloseTo(GUARDRAIL_KART_RADIUS_METERS);
    expect(rightContact?.inwardNormal.dot(right)).toBeLessThan(-0.99);

    const leftContact = guardrailContact(
      track,
      point.clone().addScaledVector(right, -GUARDRAIL_OFFSET_METERS),
      GUARDRAIL_KART_RADIUS_METERS,
    );
    expect(leftContact?.side).toBe(-1);
    expect(leftContact?.inwardNormal.dot(right)).toBeGreaterThan(0.99);
  });

  it('builds continuous double rails plus instanced support posts', () => {
    const visual = createGuardrailVisual(new CircuitAlpha());
    expect(visual.name).toBe('track-guardrails');
    for (const name of [
      'guardrail-left-lower',
      'guardrail-left-upper',
      'guardrail-right-lower',
      'guardrail-right-upper',
    ]) {
      expect(visual.getObjectByName(name)).toBeInstanceOf(THREE.Mesh);
    }
    const posts = visual.getObjectByName('guardrail-posts');
    expect(posts).toBeInstanceOf(THREE.InstancedMesh);
    expect((posts as THREE.InstancedMesh).count).toBeGreaterThanOrEqual(60);
  });
});

describe('whole-circuit guardrail boundary', () => {
  it('resolves both sides at every track sample and never contacts the center', () => {
    const track = new CircuitAlpha();
    for (const [index, point] of track.samples.entries()) {
      const tangent = track.tangents[index];
      if (tangent === undefined) throw new Error('Missing tangent');
      const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
      expect(guardrailContact(track, point, GUARDRAIL_KART_RADIUS_METERS)).toBeNull();
      for (const side of [-1, 1]) {
        const outside = point
          .clone()
          .addScaledVector(right, side * (GUARDRAIL_OFFSET_METERS + 0.4));
        const contact = guardrailContact(track, outside, GUARDRAIL_KART_RADIUS_METERS);
        if (contact === null) throw new Error('Missing rail contact');
        expect(contact.inwardNormal.dot(right) * side).toBeLessThan(-0.99);
        outside.addScaledVector(contact.inwardNormal, contact.penetration + 0.02);
        expect(guardrailContact(track, outside, GUARDRAIL_KART_RADIUS_METERS)).toBeNull();
      }
    }
  });
});
