import { describe, expect, it } from 'vitest';
import { composePlayerDriveInput } from '../src/game/input/composePlayerDrive';
import { itemUseDirection } from '../src/game/items/ItemSystem';

const neutralKeyboard = { forward: false, reverse: false, left: false, right: false };
const neutralWheel = { held: false, steering: 0 };

describe('composePlayerDriveInput', () => {
  it('accelerates whenever the wheel is held, including at center', () => {
    expect(
      composePlayerDriveInput(neutralKeyboard, {
        wheel: { held: true, steering: 0 },
        brake: false,
      }),
    ).toEqual({ throttle: 1, steering: 0 });
  });

  it('uses wheel steering while held and keyboard steering while released', () => {
    expect(
      composePlayerDriveInput(neutralKeyboard, {
        wheel: { held: true, steering: 0.65 },
        brake: false,
      }),
    ).toEqual({ throttle: 1, steering: 0.65 });
    expect(
      composePlayerDriveInput(
        { ...neutralKeyboard, left: true },
        {
          wheel: neutralWheel,
          brake: false,
        },
      ),
    ).toEqual({ throttle: 0, steering: 1 });
  });

  it('keeps keyboard forward precedence when no wheel is held', () => {
    expect(
      composePlayerDriveInput(
        { ...neutralKeyboard, forward: true, reverse: true },
        { wheel: neutralWheel, brake: false },
      ),
    ).toEqual({ throttle: 1, steering: 0 });
  });

  it('preserves backward item direction when reverse is held', () => {
    expect(itemUseDirection(true)).toBe('backward');
    expect(itemUseDirection(false)).toBe('forward');
  });

  it('lets brake or reverse override wheel throttle and restores it on release', () => {
    const wheel = { held: true, steering: -0.4 };
    expect(composePlayerDriveInput(neutralKeyboard, { wheel, brake: true })).toEqual({
      throttle: -1,
      steering: -0.4,
    });
    expect(
      composePlayerDriveInput({ ...neutralKeyboard, reverse: true }, { wheel, brake: false }),
    ).toEqual({ throttle: -1, steering: -0.4 });
    expect(composePlayerDriveInput(neutralKeyboard, { wheel, brake: false })).toEqual({
      throttle: 1,
      steering: -0.4,
    });
  });
});
