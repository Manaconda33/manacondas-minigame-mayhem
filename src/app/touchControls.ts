export function touchControlsMarkup(enabled: boolean): string {
  if (!enabled) return '';

  return `<div id="touch-controls" class="touch-controls" aria-label="Touch driving controls">
    <div class="touch-cluster steering-controls"><button id="mobile-steering-wheel" class="touch-steering-wheel" aria-label="Steering wheel. Hold and drag left or right to steer; holding also accelerates." type="button"><span class="touch-wheel-graphic" aria-hidden="true"></span></button></div>
    <div class="touch-cluster action-controls">
      <button data-touch="rear" aria-label="Rear camera">REAR</button>
      <button data-touch="brake" aria-label="Brake or reverse">BRAKE</button>
      <button data-touch="item" class="touch-item-button" aria-label="Use item. No item held. Keyboard: Shift or E." type="button">
        <span class="touch-item-slot" aria-hidden="true"><img data-touch-item-art alt="" hidden /><span data-touch-item-placeholder>—</span></span>
        <span data-touch-item-label>ITEM</span>
        <small data-touch-item-charges>EMPTY</small>
      </button>
      <button data-touch="drift" class="touch-drift" aria-label="Hop or drift">DRIFT</button>
    </div>
    <div class="touch-cluster recovery-controls"><button id="touch-recover" data-touch="recover" aria-label="Recover kart" type="button" hidden>RECOVER</button></div>
  </div>`;
}

export function updateTouchRecoveryButton(button: HTMLButtonElement, visible: boolean): void {
  button.hidden = !visible;
}
