export function touchControlsMarkup(enabled: boolean): string {
  if (!enabled) return '';

  return `<div id="touch-controls" class="touch-controls" aria-label="Touch driving controls">
    <div class="touch-cluster steering-controls"><button data-touch="left" aria-label="Steer left">◀</button><button data-touch="right" aria-label="Steer right">▶</button></div>
    <div class="touch-cluster action-controls"><button data-touch="brake" aria-label="Brake or reverse">▼</button><button data-touch="accelerate" aria-label="Accelerate">▲</button><button data-touch="drift" class="touch-drift" aria-label="Hop or drift">DRIFT</button></div>
    <div class="touch-utility"><button data-touch="rear" aria-label="Rear camera">REAR</button><button data-touch="item" aria-label="Use held item">ITEM</button><button data-touch="recover" aria-label="Recover kart">RESET</button></div>
  </div>`;
}
