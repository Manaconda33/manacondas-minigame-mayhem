export interface WheelState {
  held: boolean;
  steering: number;
}

const NEUTRAL: WheelState = { held: false, steering: 0 };

export function bindTouchWheel(
  element: HTMLElement,
  onChange: (state: WheelState) => void,
): () => void {
  let pointerId: number | null = null;
  let disposed = false;

  const emitNeutral = (): void => {
    if (pointerId === null) return;
    pointerId = null;
    onChange(NEUTRAL);
  };

  const updateSteering = (event: PointerEvent): void => {
    if (pointerId !== event.pointerId) return;
    const bounds = element.getBoundingClientRect();
    const halfWidth = bounds.width / 2;
    const offset = halfWidth > 0 ? (event.clientX - (bounds.left + halfWidth)) / halfWidth : 0;
    const steering = offset === 0 ? 0 : Math.max(-1, Math.min(1, -offset));
    onChange({ held: true, steering });
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (pointerId !== null || disposed) return;
    event.preventDefault();
    pointerId = event.pointerId;
    element.setPointerCapture(event.pointerId);
    updateSteering(event);
  };
  const onPointerMove = (event: PointerEvent): void => {
    updateSteering(event);
  };
  const onPointerEnd = (event: PointerEvent): void => {
    if (pointerId !== event.pointerId) return;
    emitNeutral();
  };
  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') emitNeutral();
  };

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerEnd);
  element.addEventListener('pointercancel', onPointerEnd);
  element.addEventListener('lostpointercapture', onPointerEnd);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return (): void => {
    if (disposed) return;
    disposed = true;
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', onPointerEnd);
    element.removeEventListener('pointercancel', onPointerEnd);
    element.removeEventListener('lostpointercapture', onPointerEnd);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (pointerId !== null) {
      const activePointer = pointerId;
      pointerId = null;
      if (element.hasPointerCapture(activePointer)) element.releasePointerCapture(activePointer);
    }
    onChange(NEUTRAL);
  };
}
