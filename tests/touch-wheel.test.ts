import { describe, expect, it, vi } from 'vitest';
import { bindTouchWheel } from '../src/app/touchWheel';

type Pointerish = Event & { pointerId: number; clientX: number };

function pointer(type: string, pointerId: number, clientX: number): Pointerish {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
    pointerId,
    clientX,
  });
}

function wheelElement(): {
  element: HTMLButtonElement;
  captures: { set: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> };
} {
  const element = document.createElement('button');
  element.getBoundingClientRect = () => ({
    left: 100,
    right: 300,
    top: 0,
    bottom: 100,
    width: 200,
    height: 100,
    x: 100,
    y: 0,
    toJSON: () => ({}),
  });
  const captures = { set: vi.fn(), release: vi.fn() };
  Object.defineProperty(element, 'setPointerCapture', { value: captures.set });
  Object.defineProperty(element, 'releasePointerCapture', { value: captures.release });
  Object.defineProperty(element, 'hasPointerCapture', { value: vi.fn(() => true) });
  return { element, captures };
}

describe('bindTouchWheel', () => {
  it('reports held throttle and normalized center, left, right, and clamped steering', () => {
    const { element, captures } = wheelElement();
    const onChange = vi.fn();
    bindTouchWheel(element, onChange);

    element.dispatchEvent(pointer('pointerdown', 4, 200));
    expect(onChange).toHaveBeenLastCalledWith({ held: true, steering: 0 });
    expect(captures.set).toHaveBeenCalledWith(4);
    element.dispatchEvent(pointer('pointermove', 4, 150));
    expect(onChange).toHaveBeenLastCalledWith({ held: true, steering: 0.5 });
    element.dispatchEvent(pointer('pointermove', 4, 100));
    expect(onChange).toHaveBeenLastCalledWith({ held: true, steering: 1 });
    element.dispatchEvent(pointer('pointermove', 4, 20));
    expect(onChange).toHaveBeenLastCalledWith({ held: true, steering: 1 });
    element.dispatchEvent(pointer('pointermove', 4, 300));
    expect(onChange).toHaveBeenLastCalledWith({ held: true, steering: -1 });
  });

  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])(
    'neutralizes on %s and ignores unrelated pointers',
    (endingEvent) => {
      const { element } = wheelElement();
      const onChange = vi.fn();
      bindTouchWheel(element, onChange);
      element.dispatchEvent(pointer('pointerdown', 2, 200));
      element.dispatchEvent(pointer('pointerdown', 3, 100));
      expect(onChange).toHaveBeenCalledTimes(1);
      element.dispatchEvent(pointer(endingEvent, 3, 100));
      expect(onChange).toHaveBeenCalledTimes(1);
      element.dispatchEvent(pointer(endingEvent, 2, 200));
      expect(onChange).toHaveBeenLastCalledWith({ held: false, steering: 0 });
    },
  );

  it('neutralizes on document hiding and route disposer releases capture and listeners', () => {
    const { element, captures } = wheelElement();
    const onChange = vi.fn();
    const dispose = bindTouchWheel(element, onChange);
    element.dispatchEvent(pointer('pointerdown', 9, 150));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onChange).toHaveBeenLastCalledWith({ held: false, steering: 0 });

    element.dispatchEvent(pointer('pointerdown', 10, 250));
    dispose();
    expect(captures.release).toHaveBeenCalledWith(10);
    expect(onChange).toHaveBeenLastCalledWith({ held: false, steering: 0 });
    const count = onChange.mock.calls.length;
    element.dispatchEvent(pointer('pointerdown', 11, 100));
    expect(onChange).toHaveBeenCalledTimes(count);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onChange).toHaveBeenCalledTimes(count);
  });
});
