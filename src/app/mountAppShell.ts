import { Howler } from 'howler';
import { resumeAudioContext } from '../audio/driftTone';
import type { HudState, KartTimeTrial as KartTimeTrialInstance } from '../game/KartTimeTrial';
import { isMobileSession } from './mobileSession';
import { characterById, characterManifest, type CharacterDefinition } from '../characters/manifest';
import { itemHudMarkup, updateItemHud } from './itemHud';
import { raceMinimapMarkup, updateRaceMinimap } from './raceMinimap';
import { touchControlsMarkup } from './touchControls';

export const APP_TITLE = "Manaconda's Minigame Mayhem";

export function markGameFinished(shell: HTMLElement): void {
  shell.classList.add('is-finished');
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${String(minutes)}:${remainder.toFixed(2).padStart(5, '0')}`;
}

function button(label: string, action: string, className = ''): string {
  return `<button class="menu-button ${className}" data-action="${action}">${label}</button>`;
}

export function mountAppShell(root: HTMLElement): void {
  let game: KartTimeTrialInstance | null = null;
  let selectedCharacter = characterById('aa-02');

  const unlockAudio = async (): Promise<void> => {
    const context = (Howler as unknown as { ctx?: AudioContext | null }).ctx;
    await resumeAudioContext(context);
  };

  const renderTitle = (): void => {
    root.innerHTML = `
      <main class="screen title-screen">
        <div class="title-mark" aria-hidden="true">
          <svg viewBox="0 0 72 72" role="presentation">
            <rect class="mark-frame" x="5" y="5" width="62" height="62" rx="17" />
            <path class="mark-route" d="M17 51 C 25 19, 43 59, 56 21" />
            <circle class="mark-token mark-token-start" cx="17" cy="51" r="5" />
            <rect class="mark-token mark-token-mid" x="31" y="31" width="10" height="10" rx="3" />
            <path class="mark-token mark-token-finish" d="M56 14 L59 20 L66 21 L61 26 L62 33 L56 30 L50 33 L51 26 L46 21 L53 20 Z" />
          </svg>
        </div>
        <h1>${APP_TITLE}</h1>
        <p class="lead">A modular arcade playground. The eight-racer Circuit Alpha competition is ready.</p>
        ${button('Enter the Hub', 'enter', 'primary')}
        <p class="microcopy">Press or click to unlock browser audio.</p>
      </main>`;
  };

  const renderMenu = (): void => {
    root.innerHTML = `
      <main class="screen menu-screen">
        <header><p class="eyebrow">Minigame collection</p><h1>Choose an experience</h1></header>
        <section class="game-grid">
          <article class="game-card playable">
            <span class="card-tag">Slice 3 playable</span>
            <h2>Circuit Alpha Grand Prix</h2>
            <p>Three laps. Eight racers. Live ranking. Keyboard and mobile touch control.</p>
            ${button('Start Grand Prix', 'play', 'primary')}
          </article>
          <article class="game-card unavailable" aria-disabled="true">
            <span class="card-tag">Future game</span><h2>Gallery Gauntlet</h2><p>Unavailable in this build.</p>
          </article>
          <article class="game-card unavailable" aria-disabled="true">
            <span class="card-tag">Future game</span><h2>Inkstorm Arena</h2><p>Unavailable in this build.</p>
          </article>
        </section>
        <nav class="utility-nav">${button('Controls', 'controls')}${button('Settings', 'settings')}</nav>
      </main>`;
  };

  const renderControls = (): void => {
    root.innerHTML = `
      <main class="screen compact-screen"><p class="eyebrow">Reference</p><h1>Controls</h1>
        <dl class="control-list">
          <div><dt>Accelerate</dt><dd>W / ↑</dd></div><div><dt>Brake &amp; reverse</dt><dd>S / ↓</dd></div>
          <div><dt>Steer</dt><dd>A D / ← →</dd></div><div><dt>Hop / drift</dt><dd>Space + steer</dd></div>
          <div><dt>Use item</dt><dd>Left Shift / E</dd></div><div><dt>Backward item</dt><dd>S / ↓ + item</dd></div>
          <div><dt>Rear camera</dt><dd>C</dd></div><div><dt>Recover kart</dt><dd>R</dd></div>
          <div><dt>Pause</dt><dd>Esc / P</dd></div>
          <div><dt>Mobile</dt><dd>ITEM uses held item · Brake + ITEM requests backward</dd></div>
        </dl>${button('Back', 'menu', 'primary')}</main>`;
  };

  const renderSettings = (): void => {
    root.innerHTML = `
      <main class="screen compact-screen"><p class="eyebrow">Local settings</p><h1>Settings</h1>
        <label class="setting"><span>Master volume</span><input id="volume" type="range" min="0" max="1" step="0.05" value="${String(Howler.volume())}" /></label>
        <p class="lead small">Visual quality adapts to the browser in this foundational slice.</p>
        ${button('Back', 'menu', 'primary')}</main>`;
    const volume = root.querySelector<HTMLInputElement>('#volume');
    if (volume !== null) {
      volume.addEventListener('input', (event) => {
        Howler.volume(Number((event.target as HTMLInputElement).value));
      });
    }
  };

  const statRows = (character: CharacterDefinition): string =>
    Object.entries(character.stats)
      .map(
        ([name, value]) =>
          `<div><span>${name === 'miniTurbo' ? 'Mini-Turbo' : name}</span><i><b style="width:${String(value * 10)}%"></b></i><strong>${String(value)}</strong></div>`,
      )
      .join('');

  const portrait = (character: CharacterDefinition, alt = ''): string =>
    character.portrait === undefined
      ? `<span class="portrait-fallback">${character.initials}</span>`
      : `<img data-character-portrait data-initials="${character.initials}" src="${character.portrait}" alt="${alt}" />`;

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
    const kartName = selectedCharacter.kartName ?? 'Fallback prototype';
    root.innerHTML = `
      <main class="screen character-select-screen">
        <header><p class="eyebrow">Circuit Alpha Grand Prix</p><h1>Choose your driver</h1></header>
        <div class="character-select-layout">
          <section class="character-grid" aria-label="Twelve character roster slots">
            ${characterManifest
              .map(
                (character) => `
              <button class="character-card${character.id === selectedCharacter.id ? ' selected' : ''}" data-character="${character.id}" style="--character-accent:${character.accent}" aria-pressed="${String(character.id === selectedCharacter.id)}">
                ${portrait(character)}
                <span class="character-card-copy"><strong>${character.displayName}</strong><small>${character.assetState === 'production' ? character.descriptor : 'Portrait pending'}</small></span>
              </button>`,
              )
              .join('')}
          </section>
          <aside class="character-detail" style="--character-accent:${selectedCharacter.accent}">
            <div class="detail-portrait">${portrait(selectedCharacter, selectedCharacter.displayName)}</div>
            <p class="eyebrow">${selectedCharacter.assetState === 'production' ? 'Production driver' : 'Roster placeholder'}</p>
            <h2>${selectedCharacter.displayName}</h2><p>${selectedCharacter.descriptor}</p>
            <div class="stat-list">${statRows(selectedCharacter)}</div>
            <p class="kart-label">Kart <strong>${kartName}</strong></p>
            ${button(`Race as ${selectedCharacter.displayName}`, 'confirm-character', 'primary')}
          </aside>
        </div>
        ${button('Back to Hub', 'menu')}
      </main>`;
    bindPortraitFallbacks();
  };

  const renderGame = async (): Promise<void> => {
    const touchControls = touchControlsMarkup(isMobileSession());
    root.innerHTML = `
      <section class="game-shell" aria-label="Circuit Alpha Grand Prix">
        <canvas id="game-canvas" tabindex="0"></canvas>
        <div class="hud top-left"><span>Lap</span><strong id="lap">1 / 3</strong></div>
        <div class="hud top-center"><span>Time</span><strong id="time">0:00.00</strong></div>
        <div class="hud top-right"><span>Speed</span><strong id="speed">0 km/h</strong></div>
        <div class="hud position-hud"><span>Position</span><strong id="position">1 / 8</strong></div>
        ${itemHudMarkup()}
        ${raceMinimapMarkup()}
        <div class="hud bottom-left"><span>Surface</span><strong id="surface">ASPHALT</strong></div>
        <div class="hud bottom-right performance"><span>Performance</span><strong id="performance">60 FPS · 16.7 ms</strong></div>
        <div id="drift-panel" class="drift-panel" data-tier="none">
          <span id="drift-label">Hold Space + steer to drift</span>
          <div class="drift-meter"><i id="drift-fill"></i></div>
        </div>
        <div id="wrong-way" class="warning" hidden>WRONG WAY</div>
        <div id="countdown" class="countdown">3</div>
        <div id="seeker-warning" class="seeker-warning" role="status" hidden></div>
        <div id="apex-warning" class="apex-warning" role="status" hidden></div>
        <div id="item-use-message" class="item-use-message" role="status" hidden></div>
        <div id="item-test-mode" class="item-test-mode" hidden></div>
        <div id="loading" class="loading-card"><span class="spinner"></span><h2>Initializing Circuit Alpha</h2><p>Loading Rapier physics and the procedural track…</p></div>
        <div id="finish" class="finish-card" hidden><p class="eyebrow">Grand Prix complete</p><h2 id="finish-place">1st place</h2><p id="finish-time">0:00.00</p><ol id="standings" class="standings"></ol>${button('Return to Hub', 'finish-menu', 'primary')}</div>
        <div class="game-help">WASD / arrows drive · Space + steer drift · Shift/E item · C rear view · R recover · Esc pause</div>
        ${touchControls}
      </section>`;

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
    game = await KartTimeTrial.create({
      canvas,
      character: selectedCharacter,
      onHud: updateHud,
      onFinish: (result) => {
        const gameShell = getElement('.game-shell');
        markGameFinished(gameShell);
        getElement('#finish').hidden = false;
        const suffix =
          result.place === 1 ? 'st' : result.place === 2 ? 'nd' : result.place === 3 ? 'rd' : 'th';
        getElement('#finish-place').textContent = `${String(result.place)}${suffix} place`;
        getElement('#finish-time').textContent = formatTime(result.time);
        getElement('#standings').innerHTML = result.standings
          .map(
            (racer, index) =>
              `<li><span>${String(index + 1)}. ${racer.name}</span><strong>${racer.time === null ? 'RACING' : formatTime(racer.time)}</strong></li>`,
          )
          .join('');
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
    if (action === 'finish-menu') {
      game?.dispose();
      game = null;
      renderMenu();
    }
  });

  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-character]');
    if (target === null) return;
    selectedCharacter = characterById(target.dataset.character ?? '');
    renderCharacterSelect();
  });

  renderTitle();
}
