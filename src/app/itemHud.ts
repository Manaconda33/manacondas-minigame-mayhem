import type { ItemHudSnapshot } from '../game/items/ItemSystem';

export function itemHudMarkup(): string {
  return `<div id="item-hud" class="hud item-hud" data-phase="empty" aria-live="polite" aria-label="Held item" style="top:9.5rem;right:1rem;min-width:11rem;max-width:min(17rem,46vw);text-align:right">
    <span>Item</span>
    <div class="item-hud-main" style="display:flex;align-items:center;justify-content:flex-end;gap:.55rem"><strong id="item-icon" aria-hidden="true" style="font-size:1.65rem;line-height:1">—</strong><b id="item-name" style="max-width:12rem;font-size:.72rem;line-height:1.15">EMPTY</b></div>
    <small id="item-meta" style="display:block;margin-top:.35rem;color:#d8cbe1;font-size:.55rem;font-weight:800;letter-spacing:.05em">DRIVE THROUGH ITEM BOX</small>
    <div id="item-roulette-meter" class="item-roulette-meter" hidden style="height:.28rem;margin-top:.4rem;overflow:hidden;border-radius:999px;background:rgb(255 255 255 / 14%)"><i id="item-roulette-fill" style="display:block;width:0;height:100%;border-radius:inherit;background:#f6d66a"></i></div>
  </div>`;
}

function requiredElement(host: HTMLElement, selector: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`Required item HUD element missing: ${selector}`);
  return element;
}

export function updateItemHud(host: HTMLElement, state: ItemHudSnapshot): void {
  host.dataset.phase = state.phase;
  const icon = requiredElement(host, '#item-icon');
  const name = requiredElement(host, '#item-name');
  const meta = requiredElement(host, '#item-meta');
  const meter = requiredElement(host, '#item-roulette-meter');
  const fill = requiredElement(host, '#item-roulette-fill');

  icon.textContent = state.icon;
  name.textContent = state.phase === 'empty' ? 'EMPTY' : state.displayName.toUpperCase();

  if (state.phase === 'roulette') {
    const progress = Math.round(state.rouletteProgress * 100);
    meta.textContent = `ROULETTE ${String(progress)}%`;
    meter.hidden = false;
    fill.style.width = `${String(progress)}%`;
    return;
  }

  meter.hidden = true;
  fill.style.width = state.phase === 'held' ? '100%' : '0%';

  if (state.phase === 'empty') {
    meta.textContent = 'DRIVE THROUGH ITEM BOX';
    return;
  }

  if (state.useFeedback !== null) {
    meta.textContent = `${state.useFeedback.toUpperCase()} INPUT REGISTERED`;
    return;
  }

  const charges =
    state.totalCharges > 1
      ? `${String(state.remainingCharges)} / ${String(state.totalCharges)} CHARGES · `
      : '';
  meta.textContent = `${charges}SHIFT / E`;
}
