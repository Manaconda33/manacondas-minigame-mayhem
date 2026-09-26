import { routeNightAssetUrl, routeNightRaceHudMarkup } from '../ui/routeNight';
import { itemHudMarkup } from './itemHud';
import { raceMinimapMarkup } from './raceMinimap';

export function raceHudMarkup(touchControls: string): string {
  const touchSession = touchControls.trim() !== '';
  return `<section class="game-shell route-night-race"${touchSession ? ' data-touch-session="true"' : ''} aria-label="Circuit Alpha Grand Prix">
    <canvas id="game-canvas" tabindex="0"></canvas>
    <div class="race-hud-atmosphere" data-route-asset="race-hud-atmosphere" aria-hidden="true" style="--race-hud-atmosphere: url('${routeNightAssetUrl('race-hud-atmosphere')}')"></div>
    <div id="ink-overlay" class="ink-overlay" aria-hidden="true" hidden>
      <span class="ink-splat ink-splat-northwest"></span>
      <span class="ink-splat ink-splat-northeast"></span>
      <span class="ink-splat ink-splat-southwest"></span>
      <span class="ink-splat ink-splat-center"></span>
      <span class="ink-splat ink-splat-southeast"></span>
    </div>
    <div class="race-hud" data-race-hud aria-label="Live race HUD">
      <section class="hud route-hud-panel top-left" data-race-region="lap">
        ${routeNightRaceHudMarkup('frame-panel', 'race-hud-panel-art')}
        <div class="race-hud-panel-content"><span class="hud-kicker">Lap</span><strong id="lap">1 / 3</strong></div>
      </section>
      <section class="hud route-hud-panel top-center" data-race-region="time">
        ${routeNightRaceHudMarkup('frame-panel', 'race-hud-panel-art')}
        <div class="race-hud-panel-content"><span class="hud-kicker">Race time</span><strong id="time">0:00.00</strong></div>
      </section>
      <section class="hud route-hud-panel top-right speed-hud" data-race-region="speed">
        ${routeNightRaceHudMarkup('gauge-speed', 'race-hud-speed-art')}
        <div class="race-hud-panel-content"><span class="hud-kicker">Speed</span><strong id="speed">0 km/h</strong></div>
      </section>
      <section class="hud route-hud-panel position-hud" data-race-region="position">
        ${routeNightRaceHudMarkup('badge-placement', 'race-hud-position-art')}
        <div class="race-hud-panel-content"><span class="hud-kicker">Position</span><strong id="position">1 / 8</strong></div>
      </section>
      ${itemHudMarkup()}
      ${raceMinimapMarkup()}
      <section class="hud route-hud-panel bottom-left surface-hud" data-race-region="surface">
        ${routeNightRaceHudMarkup('frame-panel', 'race-hud-panel-art')}
        <div class="race-hud-panel-content"><span class="hud-kicker">Surface</span><strong id="surface">ASPHALT</strong></div>
      </section>
      <section class="hud route-hud-panel bottom-right performance" data-race-region="performance">
        ${routeNightRaceHudMarkup('frame-panel', 'race-hud-panel-art')}
        <div class="race-hud-panel-content"><span class="hud-kicker">Performance</span><strong id="performance">60 FPS · 16.7 ms</strong></div>
      </section>
      <div id="drift-panel" class="drift-panel" data-tier="none" data-race-region="drift">
        ${routeNightRaceHudMarkup('gauge-drift', 'race-hud-drift-art')}
        <div class="drift-panel-content">
          <span id="drift-label">Hold Space + steer to drift</span>
          <div class="drift-meter"><i id="drift-fill"></i></div>
          <div id="overdrive-status" class="overdrive-status" role="status" hidden></div>
          <div id="rocket-status" class="rocket-status" role="status" hidden></div>
        </div>
      </div>
      <div id="wrong-way" class="warning" hidden>WRONG WAY</div>
      <div id="countdown" class="countdown">3</div>
      <div id="seeker-warning" class="seeker-warning" role="status" hidden></div>
      <div id="apex-warning" class="apex-warning" role="status" hidden></div>
      <div id="item-use-message" class="item-use-message" role="status" hidden></div>
      <div id="item-test-mode" class="item-test-mode" hidden></div>
    </div>
    <div id="loading" class="loading-card"><span class="spinner"></span><h2>Initializing Circuit Alpha</h2><p>Loading Rapier physics and the procedural track…</p></div>
    <div id="finish" hidden></div>
    <div class="game-help">WASD / arrows drive · Space + steer drift · Shift/E item · C rear view · R recover · Esc pause</div>
    ${touchControls}
  </section>`;
}
