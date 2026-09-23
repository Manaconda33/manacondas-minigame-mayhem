import { Howler } from 'howler';
import { resumeAudioContext } from '../audio/driftTone';
import { audioMixer } from '../audio/AudioMixer';
import { loadGameSettings, saveGameSettings } from '../config/gameSettings';
import { isGraphicsQuality } from '../config/graphicsQuality';
import type {
  HudState,
  RaceResult,
  KartTimeTrial as KartTimeTrialInstance,
} from '../game/KartTimeTrial';
import { isMobileSession } from './mobileSession';
import { characterById, characterManifest } from '../characters/manifest';
import { CharacterKartPreview } from '../ui/characterKartPreview';
import { characterSelectMarkup } from '../ui/characterSelect';
import {
  bindResultsArtFallbacks,
  renderResultsPodium,
  updateResultsPodium,
} from '../ui/resultsPodium';
import type { RaceStanding } from '../game/raceResults';
import { updateItemHud } from './itemHud';
import { raceHudMarkup } from './raceHud';
import { updateRaceMinimap } from './raceMinimap';
import { touchControlsMarkup } from './touchControls';
import {
  routeNightAssetUrl,
  routeNightButtonFrameMarkup,
  routeNightIconMarkup,
  routeNightNodeMarkup,
  routeNightOrnamentMarkup,
  routeNightStatusMarkup,
  type RouteNightButtonFrame,
  type RouteNightIcon,
} from '../ui/routeNight';

export const APP_TITLE = "Manaconda's Minigame Mayhem";

export function markGameFinished(shell: HTMLElement): void {
  shell.classList.add('is-finished');
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${String(minutes)}:${remainder.toFixed(2).padStart(5, '0')}`;
}

export function standingsMarkup(
  standings: readonly Pick<RaceStanding, 'name' | 'place' | 'time'>[],
): string {
  return standings
    .map(
      (racer, index) =>
        `<li><span>${String(index + 1)}. ${racer.name}</span><strong>${racer.time === null ? 'RACING' : formatTime(racer.time)}</strong></li>`,
    )
    .join('');
}

function button(
  label: string,
  action: string,
  className = '',
  icon: RouteNightIcon | null = null,
): string {
  if (icon === null) {
    return `<button class="menu-button ${className}" data-action="${action}" data-route-button="${className.includes('primary') ? 'primary' : 'utility'}">${label}</button>`;
  }

  const frame: RouteNightButtonFrame = className.includes('primary')
    ? 'primary'
    : className.includes('secondary')
      ? 'secondary'
      : className.includes('disabled')
        ? 'disabled'
        : 'utility';

  return `<button class="menu-button route-asset-button ${className}" data-action="${action}" data-route-button="${frame}">${routeNightButtonFrameMarkup(frame)}${routeNightIconMarkup(icon, 'route-button-icon')}<span class="route-button-label">${label}</span>${routeNightIconMarkup('arrow', 'route-button-arrow')}</button>`;
}

function routeNightPanelTextureMarkup(): string {
  return `<div class="route-night-panel-texture" data-route-asset="panel-texture" aria-hidden="true"><img src="${routeNightAssetUrl('panel-texture')}" alt="" loading="lazy" decoding="async" /></div>`;
}

function routeNightEditorialStripMarkup(): string {
  return `<div class="route-night-editorial-strip" data-route-asset="editorial-strip" aria-hidden="true"><img src="${routeNightAssetUrl('editorial-strip')}" alt="" loading="lazy" decoding="async" /></div>`;
}

export function mountAppShell(root: HTMLElement): void {
  let game: KartTimeTrialInstance | null = null;
  let characterPreview: CharacterKartPreview | null = null;
  let selectedCharacter = characterById('aa-02');
  let appSettings = loadGameSettings();
  audioMixer.configure(appSettings.audio);

  const disposeGame = (): void => {
    game?.dispose();
    game = null;
  };

  const unlockAudio = async (): Promise<void> => {
    const context = (Howler as unknown as { ctx?: AudioContext | null }).ctx;
    await resumeAudioContext(context);
  };

  const renderTitle = (): void => {
    root.innerHTML = `
      <main class="screen title-screen route-night-screen" data-screen="title">
        <div class="route-night-backdrop title-backdrop" data-route-asset="title-hero" aria-hidden="true">
          <img src="${routeNightAssetUrl('title-hero')}" alt="" decoding="async" fetchpriority="high" />
        </div>
        ${routeNightPanelTextureMarkup()}
        ${routeNightEditorialStripMarkup()}
        <div class="route-night-grid" aria-hidden="true"></div>
        <div class="route-night-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <header class="route-night-masthead title-masthead" aria-label="Route Night identity">
          <span class="masthead-route">A — ROUTE NIGHT</span>
          <span class="masthead-title">MANACONDA'S MINIGAME MAYHEM</span>
          <span class="masthead-meta">SAME NIGHT · MORE TO PLAY</span>
        </header>
        <section class="title-content" aria-labelledby="app-title">
          <div class="title-mark" aria-hidden="true">
            <svg data-route-asset="mark" viewBox="0 0 72 72" role="presentation">
              <image href="${routeNightAssetUrl('mark')}" width="72" height="72" preserveAspectRatio="xMidYMid meet" />
            </svg>
          </div>
          <picture class="title-lockup-visual" data-route-asset="title-lockup-brush" aria-hidden="true">
            <source data-route-asset="title-lockup-brush" srcset="${routeNightAssetUrl('title-lockup-brush')}" type="image/webp" />
            <img class="title-lockup" data-route-asset="title-lockup-fallback" src="${routeNightAssetUrl('title-lockup')}" alt="" decoding="async" />
          </picture>
          <h1 id="app-title" class="sr-only">${APP_TITLE}</h1>
          <p class="title-subtitle">Routes, tokens, and tight corners. Circuit Alpha is ready to run.</p>
          <div class="title-meta" aria-label="Route Night status">
            <span>ROUTE NIGHT · CIRCUIT 01</span>
            <span data-audio-state role="status">${routeNightStatusMarkup('audio', 'inline-status-icon')} AUDIO · CLICK TO ENABLE</span>
          </div>
          <div class="title-action">
            ${button('PRESS START', 'enter', 'primary', 'play')}
            <span class="sr-only">Enter the Hub</span>
          </div>
          <p class="microcopy"><span class="keycap">ENTER</span> / CLICK TO PLAY · AUDIO UNLOCKS ON FIRST INPUT</p>
        </section>
        <aside class="title-route-readout" aria-label="Route Night introduction">
          ${routeNightOrnamentMarkup('arc', 'title-route-arc')}
          <span class="route-readout-line"></span>
          <span class="route-readout-label">WAYPOINT 00</span>
          <strong>THE HUB</strong>
          <small>FOLLOW THE CYAN LINE</small>
        </aside>
        <aside class="title-route-board" data-route-board="title" aria-label="Route board">
          <div class="route-board-heading"><span>ROUTE BOARD</span><strong>01 / LIVE</strong></div>
          <div class="route-board-track">${routeNightNodeMarkup('01', 'live')}${routeNightNodeMarkup('02', 'next')}</div>
          <div class="route-board-row is-live">${routeNightIconMarkup('race', 'route-board-icon')}<span><small>LIVE ROUTE</small><strong>CIRCUIT ALPHA</strong></span><b>01</b></div>
          <div class="route-board-row">${routeNightIconMarkup('signal', 'route-board-icon')}<span><small>NEXT DETOUR</small><strong>MINIGAMES / 02</strong></span><b>SOON</b></div>
        </aside>
      </main>`;
  };

  const renderMenu = (): void => {
    characterPreview?.dispose();
    characterPreview = null;
    root.innerHTML = `
      <main class="screen menu-screen route-night-screen hub-screen" data-screen="hub">
        <div class="route-night-backdrop hub-backdrop" aria-hidden="true">
          <img src="${routeNightAssetUrl('title-hero')}" alt="" decoding="async" />
        </div>
        ${routeNightPanelTextureMarkup()}
        ${routeNightEditorialStripMarkup()}
        <div class="route-night-grid" aria-hidden="true"></div>
        <header class="hub-header">
          <div>
            <p class="route-label">ROUTE NIGHT / HUB</p>
            <h1>Choose your route</h1>
            <p class="hub-intro">A compact map of the Mayhem collection. One checkpoint is live; the next routes are being charted.</p>
          </div>
          ${routeNightOrnamentMarkup('branch', 'hub-route-branch')}
          <div class="hub-route-status" aria-label="Route progress">
            ${routeNightStatusMarkup('live', 'status-marker-icon')}
            <span><small>LIVE ROUTE</small><strong>01 / 03</strong></span>
          </div>
        </header>
        <div class="hub-route-board" data-route-board="hub" aria-label="Hub route progress">
          <div class="hub-route-board-label"><span>ROUTE BOARD</span><strong>DETOUR INDEX / 03</strong></div>
          <div class="hub-route-track">${routeNightNodeMarkup('01', 'live')}<span class="hub-route-segment is-live"></span>${routeNightNodeMarkup('02', 'locked')}<span class="hub-route-segment"></span>${routeNightNodeMarkup('03', 'locked')}</div>
          <div class="hub-route-caption"><span>${routeNightIconMarkup('minigames', 'hub-route-icon')} MINIGAME ROUTES</span><span>ONE CHECKPOINT LIVE · TWO ROUTES CHARTING</span></div>
        </div>
        <section class="game-grid route-grid" aria-label="Available and upcoming minigames">
          <article class="game-card route-card playable" data-route-card="circuit-alpha">
            <div class="route-card-art">
              <img data-route-asset="circuit-alpha-card" src="${routeNightAssetUrl('circuit-alpha-card')}" alt="" loading="lazy" decoding="async" />
              <span class="route-card-art-wash" aria-hidden="true"></span>
              ${routeNightOrnamentMarkup('checkpoint', 'route-card-checkpoint')}
              <span class="route-card-art-marker" aria-hidden="true">01</span>
            </div>
            <div class="route-card-body">
              <div class="card-heading"><span class="card-tag">AVAILABLE NOW</span><span class="card-route-code">CA / 01</span></div>
              <h2>Circuit Alpha</h2>
              <p>Three laps. Eight racers. Live ranking. Keyboard and mobile touch control.</p>
              ${button('START GRAND PRIX', 'play', 'primary', 'play')}
            </div>
          </article>
          <article class="game-card route-card unavailable" data-route-card="gallery-gauntlet" data-availability="coming-soon" aria-disabled="true">
            <div class="route-card-signal" aria-hidden="true">${routeNightStatusMarkup('locked', 'card-lock-icon')}<span>02</span><i></i><strong>LOCKED</strong></div>
            <div class="route-card-body">
              <div class="card-heading"><span class="card-tag">COMING SOON</span><span class="card-route-code">GG / 02</span></div>
              <h2>Gallery Gauntlet</h2>
              <p>The next route is still behind the checkpoint gate.</p>
            </div>
          </article>
          <article class="game-card route-card unavailable" data-route-card="inkstorm-arena" data-availability="coming-soon" aria-disabled="true">
            <div class="route-card-signal" aria-hidden="true">${routeNightStatusMarkup('locked', 'card-lock-icon')}<span>03</span><i></i><strong>LOCKED</strong></div>
            <div class="route-card-body">
              <div class="card-heading"><span class="card-tag">COMING SOON</span><span class="card-route-code">IA / 03</span></div>
              <h2>Inkstorm Arena</h2>
              <p>The arena route is being tuned for a later Mayhem drop.</p>
            </div>
          </article>
        </section>
        <nav class="utility-nav route-utility-nav" aria-label="Route utilities">
          <span class="utility-label">UTILITY</span>${button('CONTROLS', 'controls', '', 'controls')}${button('SETTINGS', 'settings', '', 'settings')}
        </nav>
        <footer class="hub-footer">${routeNightOrnamentMarkup('divider', 'hub-divider')}<span class="route-line-dot"></span> SELECT A LIVE CHECKPOINT <span class="route-line-dot"></span> UNAVAILABLE ROUTES STAY LOCKED</footer>
      </main>`;
  };

  const renderControls = (): void => {
    characterPreview?.dispose();
    characterPreview = null;
    root.innerHTML = `
      <main class="screen utility-screen route-night-screen controls-screen" data-screen="controls">
        ${routeNightPanelTextureMarkup()}
        ${routeNightEditorialStripMarkup()}
        <div class="route-night-grid" aria-hidden="true"></div>
        <header class="utility-header">
          <div><p class="route-label">ROUTE NIGHT / UTILITY</p><h1>Controls</h1><p class="utility-intro">Your route map for desktop and mobile input. Bindings remain unchanged.</p></div>
          ${routeNightOrnamentMarkup('branch', 'utility-route-branch')}
          <span class="utility-code" data-route-utility="input">${routeNightIconMarkup('input', 'utility-code-icon')} INPUT MAP / 01</span>
        </header>
        <div class="utility-route-stamp" aria-hidden="true"><span>UTILITY ROUTE</span><strong>01 / INPUT</strong><i></i></div>
        <div class="utility-panels">
          <section class="utility-panel control-panel" aria-labelledby="desktop-controls-title">
            <div class="panel-heading"><span class="panel-node"><i>01</i></span>${routeNightIconMarkup('controls', 'panel-heading-icon')}<div><p>DRIVER INPUT</p><h2 id="desktop-controls-title">Desktop</h2></div></div>
            <dl class="control-list">
              <div data-control="accelerate"><dt>Accelerate</dt><dd><span class="control-key">W / ↑</span></dd></div>
              <div data-control="brake-reverse"><dt>Brake &amp; reverse</dt><dd><span class="control-key">S / ↓</span></dd></div>
              <div data-control="steer"><dt>Steer</dt><dd><span class="control-key">A D / ← →</span></dd></div>
              <div data-control="hop-drift"><dt>Hop / drift</dt><dd><span class="control-key">Space + steer</span></dd></div>
              <div data-control="use-item"><dt>Use item</dt><dd><span class="control-key">Left Shift / E</span></dd></div>
              <div data-control="backward-item"><dt>Backward item</dt><dd><span class="control-key">S / ↓ + item</span></dd></div>
              <div data-control="rear-camera"><dt>Rear camera</dt><dd><span class="control-key">C</span></dd></div>
              <div data-control="recover-kart"><dt>Recover kart</dt><dd><span class="control-key">R</span></dd></div>
              <div data-control="pause"><dt>Pause</dt><dd><span class="control-key">Esc / P</span></dd></div>
            </dl>
          </section>
          <aside class="utility-panel mobile-control-panel" aria-labelledby="mobile-controls-title">
            <div class="panel-heading"><span class="panel-node is-gold"><i>02</i></span>${routeNightIconMarkup('route', 'panel-heading-icon is-gold')}<div><p>TOUCH ROUTE</p><h2 id="mobile-controls-title">Mobile</h2></div></div>
            <div class="mobile-control-graphic" aria-hidden="true"><span>STEER</span><i></i><span>ITEM</span><i></i><span>DRIFT</span></div>
            <p>ITEM uses held item · Brake + ITEM requests backward</p>
            <p class="panel-note">Hold the route line. Release any touch control to coast.</p>
          </aside>
        </div>
        ${button('RETURN TO HUB', 'menu', 'primary', 'back')}
      </main>`;
  };

  const renderSettings = (): void => {
    characterPreview?.dispose();
    characterPreview = null;
    root.innerHTML = `
      <main class="screen utility-screen route-night-screen settings-screen" data-screen="settings">
        ${routeNightPanelTextureMarkup()}
        ${routeNightEditorialStripMarkup()}
        <div class="route-night-grid" aria-hidden="true"></div>
        <header class="utility-header">
          <div><p class="route-label">ROUTE NIGHT / UTILITY</p><h1>Settings</h1><p class="utility-intro">Tune the signal before you leave the hub. Changes save on this device.</p></div>
          ${routeNightOrnamentMarkup('branch', 'utility-route-branch')}
          <span class="utility-code" data-route-utility="system">${routeNightIconMarkup('signal', 'utility-code-icon')} SYSTEM / 02</span>
        </header>
        <div class="utility-route-stamp" aria-hidden="true"><span>UTILITY ROUTE</span><strong>02 / SYSTEM</strong><i></i></div>
        <section class="settings-layout" aria-label="Audio and graphics settings">
          <div class="utility-panel settings-panel">
            <div class="panel-heading"><span class="panel-node"><i>01</i></span>${routeNightIconMarkup('audio', 'panel-heading-icon')}<div><p>AUDIO BUS</p><h2>Mix</h2></div></div>
            <label class="setting" data-setting="master" for="master-volume"><span><strong>Master volume</strong><small>Global output level</small></span><output data-setting-value="master">${String(Math.round(appSettings.audio.master * 100))}%</output><input id="master-volume" type="range" min="0" max="1" step="0.05" value="${String(appSettings.audio.master)}" /></label>
            <label class="setting" data-setting="music" for="music-volume"><span><strong>Music</strong><small>Route Night score</small></span><output data-setting-value="music">${String(Math.round(appSettings.audio.music * 100))}%</output><input id="music-volume" type="range" min="0" max="1" step="0.05" value="${String(appSettings.audio.music)}" /></label>
            <label class="setting" data-setting="sfx" for="sfx-volume"><span><strong>Sound effects</strong><small>Items and interface</small></span><output data-setting-value="sfx">${String(Math.round(appSettings.audio.sfx * 100))}%</output><input id="sfx-volume" type="range" min="0" max="1" step="0.05" value="${String(appSettings.audio.sfx)}" /></label>
          </div>
          <div class="utility-panel settings-panel graphics-panel">
            <div class="panel-heading"><span class="panel-node is-gold"><i>02</i></span>${routeNightIconMarkup('graphics', 'panel-heading-icon is-gold')}<div><p>RENDER PATH</p><h2>Graphics quality</h2></div></div>
            <label class="setting setting-select" data-setting="graphics" for="graphics-quality"><span><strong>Graphics quality</strong><small>Applies to the next race</small></span><select id="graphics-quality"><option value="low"${appSettings.graphics.quality === 'low' ? ' selected' : ''}>Low</option><option value="medium"${appSettings.graphics.quality === 'medium' ? ' selected' : ''}>Medium</option><option value="high"${appSettings.graphics.quality === 'high' ? ' selected' : ''}>High</option></select></label>
            <p class="settings-note">No page reload required. The next Circuit Alpha race uses the selected render profile.</p>
          </div>
        </section>
        ${button('RETURN TO HUB', 'menu', 'primary', 'back')}
      </main>`;

    const bindVolume = (selector: string, bus: 'master' | 'music' | 'sfx'): void => {
      const input = root.querySelector<HTMLInputElement>(selector);
      input?.addEventListener('input', (event) => {
        const value = Number((event.target as HTMLInputElement).value);
        appSettings = saveGameSettings({
          ...appSettings,
          audio: {
            ...appSettings.audio,
            [bus]: value,
          },
        });
        audioMixer.configure(appSettings.audio);
        const output = root.querySelector<HTMLOutputElement>(`[data-setting-value="${bus}"]`);
        if (output !== null) output.textContent = `${String(Math.round(value * 100))}%`;
      });
    };

    bindVolume('#master-volume', 'master');
    bindVolume('#music-volume', 'music');
    bindVolume('#sfx-volume', 'sfx');

    const graphics = root.querySelector<HTMLSelectElement>('#graphics-quality');
    graphics?.addEventListener('change', (event) => {
      const quality = (event.target as HTMLSelectElement).value;
      if (!isGraphicsQuality(quality)) return;
      appSettings = saveGameSettings({
        ...appSettings,
        graphics: {
          quality,
        },
      });
    });
  };

  const bindPortraitFallbacks = (): void => {
    for (const image of root.querySelectorAll<HTMLImageElement>('[data-character-portrait]')) {
      image.addEventListener(
        'error',
        () => {
          const fallback = document.createElement('span');
          fallback.className = 'portrait-fallback';
          fallback.textContent = image.dataset.initials ?? 'MM';
          image.replaceWith(fallback);
        },
        { once: true },
      );
    }
  };

  const renderCharacterSelect = (): void => {
    characterPreview?.dispose();
    characterPreview = null;
    root.innerHTML = characterSelectMarkup(characterManifest, selectedCharacter);
    bindPortraitFallbacks();
    const canvas = root.querySelector<HTMLCanvasElement>('[data-kart-preview-canvas]');
    if (canvas !== null) characterPreview = new CharacterKartPreview(canvas, selectedCharacter);
  };

  const renderGame = async (): Promise<void> => {
    characterPreview?.dispose();
    characterPreview = null;
    const touchControls = touchControlsMarkup(isMobileSession());
    root.innerHTML = raceHudMarkup(touchControls);

    const canvas = root.querySelector<HTMLCanvasElement>('#game-canvas');
    if (canvas === null) throw new Error('Game canvas was not created.');
    const { KartTimeTrial } = await import('../game/KartTimeTrial');
    const getElement = (selector: string): HTMLElement => {
      const element = root.querySelector<HTMLElement>(selector);
      if (element === null) throw new Error(`Required UI element missing: ${selector}`);
      return element;
    };
    const minimap = getElement('[data-race-minimap]');
    const itemHud = getElement('#item-hud');
    const updateHud = (state: HudState): void => {
      getElement('#lap').textContent = `${String(state.lap)} / 3`;
      getElement('#time').textContent = formatTime(state.elapsed);
      getElement('#speed').textContent = `${String(state.speedKph)} km/h`;
      getElement('#surface').textContent = state.surface.toUpperCase();
      getElement('#performance').textContent =
        `${String(state.fps)} FPS · ${state.frameMs.toFixed(1)} ms`;
      getElement('#position').textContent = `${String(state.position)} / 8`;
      getElement('#countdown').textContent = state.countdown;
      getElement('#countdown').hidden = state.countdown === '';
      getElement('#wrong-way').hidden = !state.wrongWay;
      const inkOverlay = getElement('#ink-overlay');
      inkOverlay.hidden = !state.ink.active;
      inkOverlay.style.setProperty('--ink-fade', String(state.ink.fade));
      inkOverlay.style.setProperty('--ink-coverage', String(state.ink.coverage));
      inkOverlay.dataset.active = String(state.ink.active);
      updateRaceMinimap(minimap, state.minimap);
      updateItemHud(itemHud, state.item);
      const testMode = getElement('#item-test-mode');
      testMode.hidden = state.testModeItemLabel === null;
      testMode.textContent =
        state.testModeItemLabel === null
          ? ''
          : `TEST MODE · ${state.testModeItemLabel.toUpperCase()}`;
      const seekerWarning = getElement('#seeker-warning');
      seekerWarning.hidden = state.seekerWarning === null;
      seekerWarning.dataset.level = String(state.seekerWarning ?? 0);
      seekerWarning.textContent =
        state.seekerWarning === 3
          ? 'SEEKER · IMPACT IMMINENT'
          : state.seekerWarning === 2
            ? 'SEEKER · CLOSING IN'
            : 'SEEKER · TARGETED';
      const apexWarning = getElement('#apex-warning');
      apexWarning.hidden = state.apexWarning === null;
      apexWarning.dataset.phase = state.apexWarning ?? '';
      apexWarning.textContent =
        state.apexWarning === 'diving' ? 'APEX DIVING · IMPACT IMMINENT' : 'APEX LOCKED ON YOU';
      const useMessage = getElement('#item-use-message');
      useMessage.hidden = state.itemUseMessage === null;
      useMessage.textContent = state.itemUseMessage;
      const driftPanel = getElement('#drift-panel');
      const overdriveStatus = getElement('#overdrive-status');
      overdriveStatus.hidden = !state.nitroOverdrive.active;
      overdriveStatus.textContent =
        state.nitroOverdrive.pulseRemainingSeconds > 0
          ? `OVERDRIVE PULSE · ${state.nitroOverdrive.pulseRemainingSeconds.toFixed(1)}s · WINDOW ${state.nitroOverdrive.windowRemainingSeconds.toFixed(1)}s`
          : state.nitroOverdrive.nextPulseRemainingSeconds > 0
            ? `OVERDRIVE LOCK · ${state.nitroOverdrive.nextPulseRemainingSeconds.toFixed(1)}s · WINDOW ${state.nitroOverdrive.windowRemainingSeconds.toFixed(1)}s`
            : `OVERDRIVE READY · WINDOW ${state.nitroOverdrive.windowRemainingSeconds.toFixed(1)}s`;
      const rocketStatus = getElement('#rocket-status');
      rocketStatus.hidden = !state.hyperDriveRocket.active;
      rocketStatus.textContent =
        state.hyperDriveRocket.phase === 'returning'
          ? `ROCKET RETURN · ${state.hyperDriveRocket.returnBlendRemainingSeconds.toFixed(2)}s`
          : `ROCKET AUTOPILOT · ${state.hyperDriveRocket.windowRemainingSeconds.toFixed(1)}s`;
      let frostLabel = driftPanel.querySelector<HTMLElement>('[data-frost-countdown]');
      if (!frostLabel) {
        frostLabel = document.createElement('div');
        frostLabel.dataset.frostCountdown = '';
        frostLabel.style.color = '#a9eaff';
        driftPanel.append(frostLabel);
      }
      frostLabel.hidden = !(state.frostSeconds > 0);
      frostLabel.textContent =
        state.frostSeconds > 0
          ? `FROST ×${String(state.frostStacks)} · ${state.frostSeconds.toFixed(1)}s`
          : '';
      driftPanel.dataset.tier = state.driftTier;
      getElement('#drift-fill').style.width = `${String(Math.round(state.driftCharge * 100))}%`;
      getElement('#drift-label').textContent =
        state.prismaticSeconds > 0
          ? `PRISMATIC · ${state.prismaticSeconds.toFixed(1)}s`
          : state.airborne
            ? 'AIRBORNE'
            : state.activeBoostLabel !== null
              ? `${state.activeBoostLabel.toUpperCase()} ACTIVE`
              : state.boostActive
                ? `${state.driftTier.toUpperCase()} BOOST`
                : state.driftTier === 'none'
                  ? 'Hold Space + steer to drift'
                  : `${state.driftTier.toUpperCase()} CHARGE`;
    };
    const renderStandings = (standings: RaceResult['standings']): void => {
      const finish = root.querySelector<HTMLElement>('#finish');
      if (finish === null || finish.hidden) return;
      updateResultsPodium(finish, standings);
    };
    game = await KartTimeTrial.create({
      canvas,
      character: selectedCharacter,
      graphicsQuality: appSettings.graphics.quality,
      onHud: updateHud,
      onStandings: renderStandings,
      onFinish: (result) => {
        const gameShell = getElement('.game-shell');
        markGameFinished(gameShell);
        const finish = getElement('#finish');
        finish.innerHTML = renderResultsPodium(result.standings);
        finish.hidden = false;
        bindResultsArtFallbacks(finish);
        root.querySelector<HTMLElement>('#results-title')?.focus();
      },
    });
    const loading = root.querySelector('#loading');
    if (loading !== null) loading.remove();
    canvas.focus();
    const controls = root.querySelector('#touch-controls');
    if (controls !== null) {
      const release = (event: Event): void => {
        const control = (event.currentTarget as HTMLElement).dataset.touch;
        if (control !== undefined) game?.setTouchControl(control, false);
      };
      for (const control of controls.querySelectorAll<HTMLElement>('[data-touch]')) {
        control.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          control.setPointerCapture(event.pointerId);
          game?.setTouchControl(control.dataset.touch ?? '', true);
        });
        control.addEventListener('pointerup', release);
        control.addEventListener('pointercancel', release);
        control.addEventListener('lostpointercapture', release);
      }
    }
    game.start();
  };

  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (target === null) return;
    const action = target.dataset.action;
    void unlockAudio();
    if (action === 'enter' || action === 'menu') renderMenu();
    if (action === 'controls') renderControls();
    if (action === 'settings') renderSettings();
    if (action === 'play') renderCharacterSelect();
    if (action === 'confirm-character') void renderGame();
    if (action === 'race-again') {
      disposeGame();
      void renderGame();
    }
    if (action === 'change-driver') {
      disposeGame();
      renderCharacterSelect();
      root.querySelector<HTMLElement>(`[data-character="${selectedCharacter.id}"]`)?.focus();
    }
    if (action === 'return-to-hub') {
      disposeGame();
      renderMenu();
      root.querySelector<HTMLElement>('[data-action="play"]')?.focus();
    }
  });

  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-character]');
    if (target === null) return;
    selectedCharacter = characterById(target.dataset.character ?? '');
    renderCharacterSelect();
    root.querySelector<HTMLElement>(`[data-character="${selectedCharacter.id}"]`)?.focus();
  });

  renderTitle();
}
