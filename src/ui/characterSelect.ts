import type { CharacterDefinition, CharacterStats } from '../characters/manifest';
import {
  routeNightAssetUrl,
  routeNightButtonFrameMarkup,
  routeNightIconMarkup,
  routeNightNodeMarkup,
  routeNightOrnamentMarkup,
  routeNightStatusMarkup,
  type RouteNightButtonFrame,
  type RouteNightIcon,
} from './routeNight';

const STAT_DEFINITIONS: readonly [keyof CharacterStats, string][] = [
  ['speed', 'Speed'],
  ['acceleration', 'Acceleration'],
  ['weight', 'Weight'],
  ['handling', 'Handling'],
  ['miniTurbo', 'Mini-Turbo'],
  ['traction', 'Traction'],
];

const CHARACTER_CLASS_BY_ID: Readonly<Record<string, string>> = {
  'aa-01': 'Featherweight',
  'aa-02': 'Featherweight',
  'aa-03': 'Featherweight',
  'aa-04': 'Medium',
  'aa-05': 'Medium',
  'aa-06': 'Medium',
  'aa-07': 'Cruiser',
  'aa-08': 'Cruiser',
  'aa-09': 'Cruiser',
  'aa-10': 'Heavyweight',
  'aa-11': 'Heavyweight',
  'aa-12': 'Heavyweight',
};

function actionButton(
  label: string,
  action: string,
  frame: RouteNightButtonFrame,
  icon: RouteNightIcon,
): string {
  return `<button class="menu-button route-asset-button character-select-action ${frame === 'primary' ? 'primary' : ''}" data-action="${action}" data-route-button="${frame}">${routeNightButtonFrameMarkup(frame)}${routeNightIconMarkup(icon, 'route-button-icon')}<span class="route-button-label">${label}</span>${routeNightIconMarkup('arrow', 'route-button-arrow')}</button>`;
}

function portraitMarkup(character: CharacterDefinition, alt = ''): string {
  return character.portrait === undefined
    ? `<span class="portrait-fallback" data-character-portrait-fallback>${character.initials}</span>`
    : `<img data-character-portrait data-initials="${character.initials}" src="${character.portrait}" alt="${alt}" loading="lazy" decoding="async" />`;
}

function driverArtMarkup(character: CharacterDefinition): string {
  const heroArt = character.selectionArt ?? character.driver?.front;
  const selectionArtAttribute =
    character.selectionArt === undefined ? '' : ' data-selected-selection-art';
  return heroArt === undefined
    ? `<span class="character-hero-driver portrait-fallback" data-character-portrait-fallback>${character.initials}</span>`
    : `<img class="character-hero-driver" data-selected-driver-art${selectionArtAttribute} data-character-portrait data-initials="${character.initials}" src="${heroArt}" alt="${character.displayName}" decoding="async" />`;
}

export function characterSelectStatRows(character: CharacterDefinition): string {
  return STAT_DEFINITIONS.map(([key, label]) => {
    const value = character.stats[key];
    return `<div class="character-stat" data-stat="${key}"><span>${label}</span><i aria-hidden="true"><b style="width:${String(value * 10)}%"></b></i><strong data-stat-value>${String(value)}</strong></div>`;
  }).join('');
}

export function characterWeightClass(character: CharacterDefinition): string {
  const governedClass = CHARACTER_CLASS_BY_ID[character.id];
  if (governedClass !== undefined) return governedClass;
  if (character.stats.weight <= 3) return 'Featherweight';
  if (character.stats.weight >= 8) return 'Heavyweight';
  return 'Medium';
}

export function characterSelectMarkup(
  characters: readonly CharacterDefinition[],
  selectedCharacter: CharacterDefinition,
): string {
  const kartName = selectedCharacter.kartName ?? 'Fallback prototype';
  const selectedClass = characterWeightClass(selectedCharacter);
  return `
    <main class="screen route-night-screen character-select-screen" data-screen="character-select" style="--character-accent:${selectedCharacter.accent}">
      <div class="route-night-backdrop character-select-backdrop" data-route-asset="character-select-bay" aria-hidden="true">
        <img src="${routeNightAssetUrl('character-select-bay')}" alt="" decoding="async" fetchpriority="high" />
      </div>
      <div class="character-select-energy" data-route-asset="character-select-energy" aria-hidden="true"><img src="${routeNightAssetUrl('character-select-energy')}" alt="" decoding="async" /></div>
      <div class="character-select-hero-aura" data-route-asset="character-select-hero-aura" aria-hidden="true"><img src="${routeNightAssetUrl('character-select-hero-aura')}" alt="" decoding="async" /></div>
      <div class="route-night-panel-texture" data-route-asset="panel-texture" aria-hidden="true"><img src="${routeNightAssetUrl('panel-texture')}" alt="" loading="lazy" decoding="async" /></div>
      <div class="route-night-editorial-strip" data-route-asset="editorial-strip" aria-hidden="true"><img src="${routeNightAssetUrl('editorial-strip')}" alt="" loading="lazy" decoding="async" /></div>
      <div class="route-night-grid" aria-hidden="true"></div>
      <div class="route-night-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>

      <header class="character-select-header">
        <div><p class="route-label">ROUTE NIGHT / CIRCUIT ALPHA</p><h1>Choose your driver</h1><p class="character-select-intro">Pick a racer. Plot a brighter night.</p></div>
        <div class="character-select-route-status" aria-label="Character checkpoint status">
          ${routeNightStatusMarkup('live', 'status-marker-icon')}
          <span><small>DRIVER CHECKPOINT</small><strong>02 / 12 LIVE</strong></span>
        </div>
        ${routeNightOrnamentMarkup('branch', 'character-select-route-branch')}
      </header>

      <div class="character-select-route-board" aria-hidden="true">
        <span>ROSTER ROUTE</span>
        <div>${routeNightNodeMarkup('01', 'live')}<i class="is-live"></i>${routeNightNodeMarkup('02', 'next')}<i></i>${routeNightNodeMarkup('03', 'locked')}</div>
        <strong>SELECT · PREVIEW · CONFIRM</strong>
      </div>

      <div class="character-select-layout">
        <section class="character-roster-panel" data-character-roster aria-label="Twelve approved driver roster">
          <div class="character-panel-heading"><span class="panel-node"><i>01</i></span>${routeNightIconMarkup('route', 'panel-heading-icon')}<div><p>DRIVER ROSTER</p><h2>Choose a line</h2></div><b>12 / 12</b></div>
          <div class="character-grid">
            ${characters
              .map(
                (
                  character,
                ) => `<button class="character-card route-character-card${character.id === selectedCharacter.id ? ' selected' : ''}" data-character="${character.id}" style="--character-accent:${character.accent}" aria-pressed="${String(character.id === selectedCharacter.id)}" aria-label="Select ${character.displayName}">
                  <span class="character-card-node">${character.id.replace('aa-', '')}</span>
                  <span class="character-card-portrait">${portraitMarkup(character, character.displayName)}</span>
                  <span class="character-card-copy"><strong>${character.displayName}</strong><small>${character.descriptor}</small></span>
                </button>`,
              )
              .join('')}
          </div>
          <div class="character-roster-footer"><span>${routeNightIconMarkup('checkpoint', 'route-footer-icon')} ALL DRIVER PROFILES LIVE</span><span>ROSTER LOCKED</span></div>
        </section>

        <section class="character-profile-panel" aria-live="polite" aria-label="Selected driver profile">
          <div class="character-profile-heading"><p class="route-label">LIVE PROFILE / SELECTED CHECKPOINT</p><span>AA / ${selectedCharacter.id.replace('aa-', '')}</span></div>
          <div class="character-hero-stage">
            <div class="character-hero-identity-lane">
              <div class="character-hero-copy"><span class="character-hero-kicker">${selectedCharacter.descriptor}</span><h2 data-selected-driver-name>${selectedCharacter.displayName}</h2><p class="character-hero-caption">${selectedCharacter.assetState === 'production' ? 'Approved driver identity' : 'Roster placeholder'}</p></div>
              <div class="character-driver-art-lane" data-character-visual-lane="driver">${driverArtMarkup(selectedCharacter)}</div>
            </div>
            <div class="character-kart-lane" data-character-visual-lane="kart">
              <div class="character-kart-preview" data-kart-preview data-kart-url="${selectedCharacter.kart ?? ''}" data-kart-visual-yaw="${String(selectedCharacter.kartVisualYaw ?? 0)}" data-fallback-label="${kartName}">
                <canvas data-kart-preview-canvas aria-label="Slowly rotating ${kartName} 3D kart preview"></canvas>
                <div class="character-kart-preview-fallback" data-kart-preview-fallback aria-hidden="true"><span>WEBGL FALLBACK</span><i></i><strong>${kartName}</strong></div>
                <span class="character-kart-preview-label">3D KART PREVIEW</span>
                <span class="character-kart-preview-state" data-kart-preview-state-label>GLB / FALLBACK READY</span>
              </div>
            </div>
            <span class="character-hero-node">02</span>
          </div>
          <div class="character-profile-detail">
            <div class="character-driver-meta"><span class="character-meta-label">DRIVER / CLASS</span><strong data-selected-driver-class>${selectedClass}</strong><span class="character-meta-label">KART IDENTITY</span><strong data-selected-driver-kart>${kartName}</strong></div>
            <div class="character-stat-list" aria-label="Driver statistics">${characterSelectStatRows(selectedCharacter)}</div>
          </div>
          <div class="character-profile-actions">${actionButton('START RACE', 'confirm-character', 'primary', 'play')}</div>
        </section>
      </div>

      <footer class="character-select-footer">${routeNightOrnamentMarkup('divider', 'character-select-divider')}<span><i></i> SELECT A DRIVER</span><span><i></i> PREVIEW KART</span><span><i></i> CONFIRM YOUR ROUTE</span>${actionButton('BACK TO HUB', 'menu', 'utility', 'back')}</footer>
    </main>`;
}
