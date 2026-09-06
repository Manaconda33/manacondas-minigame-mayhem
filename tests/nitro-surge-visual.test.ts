import { describe, expect, it } from 'vitest';
import { NitroSurgeVisual } from '../src/game/items/NitroSurgeVisual';

describe('NitroSurgeVisual', () => {
  it('tracks the active effect, animates, and cleans up', () => {
    const visual = new NitroSurgeVisual();
    expect(visual.group.visible).toBe(false);
    visual.update(true, 0.1);
    expect(visual.group.visible).toBe(true);
    const firstScale = visual.group.children[0]?.scale.y;
    visual.update(true, 0.15);
    expect(visual.group.children[0]?.scale.y).not.toBe(firstScale);
    visual.update(false, 0.2);
    expect(visual.group.visible).toBe(false);
    expect(visual.group.children.length).toBeGreaterThanOrEqual(6);
    visual.dispose();
    expect(visual.group.children).toHaveLength(0);
  });
});
