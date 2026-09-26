import type { WheelState } from '../../app/touchWheel';

export interface KeyboardDriveInput {
  forward: boolean;
  reverse: boolean;
  left: boolean;
  right: boolean;
}

export interface TouchDriveInput {
  wheel: WheelState;
  brake: boolean;
}

export interface ComposedPlayerDriveInput {
  throttle: -1 | 0 | 1;
  steering: number;
}

export function composePlayerDriveInput(
  keyboard: KeyboardDriveInput,
  touch: TouchDriveInput,
): ComposedPlayerDriveInput {
  const throttle: -1 | 0 | 1 =
    touch.brake || (touch.wheel.held && keyboard.reverse)
      ? -1
      : touch.wheel.held
        ? 1
        : keyboard.forward
          ? 1
          : keyboard.reverse
            ? -1
            : 0;

  return {
    throttle,
    steering: touch.wheel.held ? touch.wheel.steering : keyboard.left ? 1 : keyboard.right ? -1 : 0,
  };
}
