import type { ItemHudSnapshot } from '../game/items/ItemSystem';
import { routeNightItemAssetUrl, routeNightRaceHudMarkup } from '../ui/routeNight';

export function itemHudMarkup(): string {
  return `<section id="item-hud" class="hud item-hud route-hud-panel" data-race-region="item" data-phase="empty" aria-label="Held item">
    ${routeNightRaceHudMarkup('frame-item', 'item-hud-frame')}
    <div class="item-hud-content">
      <span class="hud-kicker">Item</span>
      <div class="item-hud-main">
        <div class="item-art-wrap">
          <img id="item-art" class="item-art" alt="" hidden />
          <strong id="item-icon" aria-hidden="true">—</strong>
        </div>
        <b id="item-name">EMPTY</b>
      </div>
      <small id="item-meta">DRIVE THROUGH ITEM BOX</small>
      <div id="item-roulette-meter" class="item-roulette-meter" hidden><i id="item-roulette-fill"></i></div>
    </div>
  </section>`;
}

function requiredElement(host: HTMLElement, selector: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`Required item HUD element missing: ${selector}`);
  return element;
}

export function updateItemHud(host: HTMLElement, state: ItemHudSnapshot): void {
  host.dataset.phase = state.phase;
  const icon = requiredElement(host, '#item-icon');
  const art = requiredElement(host, '#item-art') as HTMLImageElement;
  const name = requiredElement(host, '#item-name');
  const meta = requiredElement(host, '#item-meta');
  const meter = requiredElement(host, '#item-roulette-meter');
  const fill = requiredElement(host, '#item-roulette-fill');

  if (art.dataset.fallbackBound !== 'true') {
    art.addEventListener('error', () => {
      art.hidden = true;
      icon.hidden = false;
      art.dataset.failed = 'true';
    });
    art.dataset.fallbackBound = 'true';
  }

  icon.textContent = state.icon;
  name.textContent = state.phase === 'empty' ? 'EMPTY' : state.displayName.toUpperCase();
  art.dataset.failed = 'false';
  if (state.itemId === null) {
    art.hidden = true;
    art.removeAttribute('src');
    icon.hidden = false;
  } else {
    art.hidden = false;
    art.src = routeNightItemAssetUrl(state.itemId);
    icon.hidden = true;
  }

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

function requiredTouchElement(host: HTMLElement, selector: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`Required touch item element missing: ${selector}`);
  return element;
}

export function updateTouchItemButton(button: HTMLElement, state: ItemHudSnapshot): void {
  const art = requiredTouchElement(button, '[data-touch-item-art]') as HTMLImageElement;
  const placeholder = requiredTouchElement(button, '[data-touch-item-placeholder]');
  const label = requiredTouchElement(button, '[data-touch-item-label]');
  const charges = requiredTouchElement(button, '[data-touch-item-charges]');

  if (art.dataset.fallbackBound !== 'true') {
    art.addEventListener('error', () => {
      art.hidden = true;
      placeholder.textContent = art.dataset.fallbackGlyph ?? '—';
      placeholder.hidden = false;
      art.dataset.failed = 'true';
    });
    art.dataset.fallbackBound = 'true';
  }

  button.dataset.phase = state.phase;
  if (state.phase === 'empty' || state.itemId === null) {
    art.hidden = true;
    art.removeAttribute('src');
    art.dataset.failed = 'false';
    placeholder.textContent = '—';
    placeholder.hidden = false;
    label.textContent = 'ITEM';
    charges.textContent = 'EMPTY';
    button.setAttribute('aria-label', 'Use item. No item held. Keyboard: Shift or E.');
    return;
  }

  if (state.phase === 'roulette') {
    art.hidden = true;
    art.removeAttribute('src');
    art.dataset.failed = 'false';
    placeholder.textContent = '◌';
    placeholder.hidden = false;
    label.textContent = 'ITEM';
    charges.textContent = 'ROLLING';
    button.setAttribute('aria-label', 'Use item. Roulette in progress. Keyboard: Shift or E.');
    return;
  }

  const asset = routeNightItemAssetUrl(state.itemId);
  if (art.getAttribute('src') !== asset) {
    art.src = asset;
    art.dataset.failed = 'false';
    art.dataset.fallbackGlyph = state.icon;
  }
  const failed = art.dataset.failed === 'true';
  art.hidden = failed;
  placeholder.textContent = state.icon;
  placeholder.hidden = !failed;
  label.textContent = 'ITEM';
  charges.textContent = `${String(state.remainingCharges)} / ${String(state.totalCharges)}`;
  button.setAttribute(
    'aria-label',
    `Use ${state.displayName}, ${String(state.remainingCharges)} of ${String(state.totalCharges)} charges. Keyboard: Shift or E.`,
  );
}
