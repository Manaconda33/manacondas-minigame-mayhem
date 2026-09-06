import type { ItemHudSnapshot } from '../game/items/ItemSystem';

export function itemHudMarkup(): string {
  return `<div id="item-hud" class="hud item-hud" data-phase="empty" aria-live="polite" aria-label="Held item">
    <span>Item</span>
    <div class="item-hud-main"><strong id="item-icon" aria-hidden="true">—</strong><b id="item-name">EMPTY</b></div>
    <small id="item-meta">DRIVE THROUGH ITEM BOX</small>
    <div id="item-roulette-meter" class="item-roulette-meter" hidden><i id="item-roulette-fill"></i></div>
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
