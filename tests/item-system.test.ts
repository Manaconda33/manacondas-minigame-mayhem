import { describe, expect, it } from 'vitest';
import {
  ITEM_ROULETTE_SECONDS,
  ItemSystem,
  isItemUseKey,
  itemUseDirection,
} from '../src/game/items/ItemSystem';

describe('Slice 5 item roulette and use intent', () => {
  it('locks the actual item at collection while roulette remains presentation-only', () => {
    const items = new ItemSystem();

    expect(items.acquire('player', 'blaze-orbs')).toBe(true);
    expect(items.canCollect('player')).toBe(false);
    expect(items.heldItem('player')).toEqual({ itemId: 'blaze-orbs', remainingCharges: 5 });
    expect(items.hudSnapshot('player').phase).toBe('roulette');

    items.advance(0.35);
    expect(items.hudSnapshot('player').phase).toBe('roulette');
    expect(items.heldItem('player')).toEqual({ itemId: 'blaze-orbs', remainingCharges: 5 });

    items.advance(ITEM_ROULETTE_SECONDS);
    expect(items.hudSnapshot('player')).toMatchObject({
      phase: 'held',
      itemId: 'blaze-orbs',
      displayName: 'Blaze Orbs',
      remainingCharges: 5,
      totalCharges: 5,
    });
  });

  it('freezes roulette while paused', () => {
    const items = new ItemSystem();
    items.acquire('player', 'kinetic-disc');
    items.advance(0.4);
    const beforePause = items.hudSnapshot('player');

    items.advance(5, true);
    const duringPause = items.hudSnapshot('player');

    expect(duringPause.phase).toBe('roulette');
    expect(duringPause.rouletteProgress).toBe(beforePause.rouletteProgress);
    expect(items.heldItem('player')?.itemId).toBe('kinetic-disc');
  });

  it('blocks item use during roulette and registers direction after reveal without consuming', () => {
    const items = new ItemSystem();
    items.acquire('player', 'frost-orbs');

    expect(items.requestUse('player', 'forward')).toBeNull();
    items.advance(ITEM_ROULETTE_SECONDS);

    expect(items.requestUse('player', 'backward')).toEqual({
      racerId: 'player',
      itemId: 'frost-orbs',
      direction: 'backward',
      remainingCharges: 3,
    });
    expect(items.hudSnapshot('player').useFeedback).toBe('backward');
    expect(items.heldItem('player')?.remainingCharges).toBe(3);
  });

  it('keeps charge consumption behind the future effect-dispatch commit boundary', () => {
    const items = new ItemSystem();
    items.acquire('player', 'arc-hammers');
    items.advance(ITEM_ROULETTE_SECONDS);

    expect(items.requestUse('player', 'forward')).not.toBeNull();
    expect(items.heldItem('player')?.remainingCharges).toBe(5);
    expect(items.commitUse('player')).toBe(true);
    expect(items.heldItem('player')?.remainingCharges).toBe(4);

    for (let remaining = 3; remaining >= 0; remaining -= 1) {
      expect(items.commitUse('player')).toBe(true);
      expect(items.heldItem('player')?.remainingCharges ?? 0).toBe(remaining);
    }
    expect(items.canCollect('player')).toBe(true);
  });

  it('recognizes only the approved keyboard item inputs and backward modifier state', () => {
    expect(isItemUseKey('ShiftLeft')).toBe(true);
    expect(isItemUseKey('KeyE')).toBe(true);
    expect(isItemUseKey('ShiftRight')).toBe(false);
    expect(isItemUseKey('Space')).toBe(false);
    expect(itemUseDirection(false)).toBe('forward');
    expect(itemUseDirection(true)).toBe('backward');
  });

  it('clears and disposes racer item state cleanly', () => {
    const items = new ItemSystem();
    items.acquire('player', 'nitro-surge');
    items.clear('player');
    expect(items.hudSnapshot('player').phase).toBe('empty');
    expect(items.canCollect('player')).toBe(true);

    items.acquire('player', 'kinetic-disc');
    items.dispose();
    expect(items.hudSnapshot('player').phase).toBe('empty');
  });
});
