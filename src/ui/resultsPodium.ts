import { characterManifest } from '../characters/manifest';
import type { RaceStanding } from '../game/raceResults';
import { raceResultsVictoryUrl } from './raceAssets';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}

function orderedStandings(standings: readonly RaceStanding[]): RaceStanding[] {
  return standings
    .map((standing, index) => ({ standing, index }))
    .sort((a, b) => {
      if (a.standing.place !== null && b.standing.place !== null)
        return a.standing.place - b.standing.place || a.index - b.index;
      if (a.standing.place !== null) return -1;
      if (b.standing.place !== null) return 1;
      return a.index - b.index;
    })
    .map(({ standing }) => standing);
}

export function ordinalPlace(place: number): string {
  const lastTwo = place % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${String(place)}th`;
  switch (place % 10) {
    case 1:
      return `${String(place)}st`;
    case 2:
      return `${String(place)}nd`;
    case 3:
      return `${String(place)}rd`;
    default:
      return `${String(place)}th`;
  }
}

export function formatResultTime(seconds: number): string {
  const totalMilliseconds = Math.round(Math.max(0, seconds) * 1000);
  const minutes = Math.floor(totalMilliseconds / 60_000);
  const secondsWithinMinute = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(secondsWithinMinute).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function finishedCount(standings: readonly RaceStanding[]): number {
  return standings.filter(({ place, time }) => place !== null && time !== null).length;
}

function resultsStatus(standings: readonly RaceStanding[]): string {
  const count = finishedCount(standings);
  return count === 8 ? 'All 8 racers finished.' : `${String(count)} of 8 racers finished.`;
}

function initialsFor(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return initials || '?';
}

function characterFor(standing: RaceStanding) {
  return characterManifest.find(({ id }) => id === standing.characterId);
}

function resultArtMarkup(standing: RaceStanding, isPodium: boolean): string {
  const character = characterFor(standing);
  const name = character?.displayName ?? standing.displayName;
  const initials = character?.initials ?? initialsFor(name);
  const selectionArt = character?.selectionArt;
  const portrait = standing.portrait || character?.portrait;
  const victoryArt = isPodium ? raceResultsVictoryUrl(standing.characterId, standing.place) : null;
  const source = victoryArt ?? selectionArt ?? portrait;
  const fallbackSelection = victoryArt === null ? '' : (selectionArt ?? '');
  const fallbackPortrait = portrait !== source ? (portrait ?? '') : '';
  const image = source
    ? `<img data-results-art data-result-state="${victoryArt === null ? 'selection-fallback' : 'victory'}" data-fallback-selection="${escapeHtml(fallbackSelection)}" data-fallback-portrait="${escapeHtml(fallbackPortrait)}" src="${escapeHtml(source)}" alt="${escapeHtml(`${name} character artwork`)}" decoding="async" loading="lazy" />`
    : '';
  return `<div class="results-art-frame">${image}<span class="results-art-monogram" data-art-monogram${source ? ' hidden' : ''} aria-hidden="true">${escapeHtml(initials)}</span></div>`;
}

function racerCardMarkup(standing: RaceStanding, isPodium: boolean): string {
  const place = standing.place ?? 0;
  const displayName = characterFor(standing)?.displayName ?? standing.displayName;
  const playerTag =
    standing.racerId === 'player' ? '<span class="results-player-tag">YOU</span>' : '';
  const label = place > 0 ? ordinalPlace(place) : 'Racing';
  return `<article class="results-racer-card${standing.racerId === 'player' ? ' is-player' : ''}" data-racer-id="${escapeHtml(standing.racerId)}" data-place="${String(place)}" aria-label="${escapeHtml(`${label} place, ${displayName}${standing.racerId === 'player' ? ', you' : ''}`)}">${resultArtMarkup(standing, isPodium)}<div class="results-racer-caption"><span class="results-place-label">${escapeHtml(label)}</span><h3>${escapeHtml(displayName)}</h3>${playerTag}</div></article>`;
}

function podiumMarkup(standings: readonly RaceStanding[]): string {
  return orderedStandings(standings)
    .filter(({ place }) => place !== null && place >= 1 && place <= 3)
    .map((standing) => racerCardMarkup(standing, true))
    .join('');
}

function lowerFinishersMarkup(standings: readonly RaceStanding[]): string {
  return orderedStandings(standings)
    .filter(({ place }) => place !== null && place >= 4 && place <= 8)
    .map((standing) => racerCardMarkup(standing, false))
    .join('');
}

export function resultsStandingsMarkup(standings: readonly RaceStanding[]): string {
  return orderedStandings(standings)
    .map((standing, index) => {
      const displayName = characterFor(standing)?.displayName ?? standing.displayName;
      const place = standing.place === null ? '—' : ordinalPlace(standing.place);
      const time = standing.time === null ? 'RACING' : formatResultTime(standing.time);
      const playerTag =
        standing.racerId === 'player' ? '<span class="results-player-tag">YOU</span>' : '';
      return `<li data-racer-id="${escapeHtml(standing.racerId)}" data-place="${standing.place === null ? '' : String(standing.place)}"><span class="results-standing-place">${escapeHtml(place)}</span><span class="results-standing-name">${escapeHtml(displayName)}${playerTag}</span><strong>${escapeHtml(time)}</strong><span class="sr-only">Position ${String(index + 1)} of 8</span></li>`;
    })
    .join('');
}

function actionsMarkup(): string {
  return `<button class="menu-button primary results-action" data-action="race-again" data-route-button="primary">Race Again</button><button class="menu-button secondary results-action" data-action="change-driver" data-route-button="secondary">Change Driver</button><button class="menu-button results-action" data-action="return-to-hub" data-route-button="utility">Return to Hub</button>`;
}

export function renderResultsPodium(standings: readonly RaceStanding[]): string {
  return `<section class="results-screen" data-results-root data-screen="results" aria-labelledby="results-title"><div class="results-screen-glow" aria-hidden="true"></div><div class="results-board"><header class="results-header"><p class="eyebrow">GRAND PRIX · COMPLETE</p><h2 id="results-title" tabindex="-1">Race Results</h2><p class="results-status" data-results-status role="status" aria-live="polite">${resultsStatus(standings)}</p></header><div class="results-layout"><section class="results-podium" data-results-podium aria-label="Top three finishers"><h3>Podium</h3><div class="results-podium-cards">${podiumMarkup(standings)}</div></section><section class="results-finishers" data-results-finishers aria-label="Finishers in places four through eight"><h3>Other finishers</h3><div class="results-finisher-cards">${lowerFinishersMarkup(standings)}</div></section><section class="results-standings-panel"><header><h3 id="results-standings-title">Final standings</h3><span>8 RACERS</span></header><div class="results-standings-scroll" data-results-standings-scroll role="region" aria-labelledby="results-standings-title" tabindex="0"><ol class="results-standings" data-results-standings>${resultsStandingsMarkup(standings)}</ol></div></section></div><nav class="results-actions" data-results-actions aria-label="Race options">${actionsMarkup()}</nav></div></section>`;
}

export function updateResultsPodium(root: HTMLElement, standings: readonly RaceStanding[]): void {
  const podium = root.querySelector<HTMLElement>('[data-results-podium] .results-podium-cards');
  const finishers = root.querySelector<HTMLElement>(
    '[data-results-finishers] .results-finisher-cards',
  );
  const rows = root.querySelector<HTMLOListElement>('[data-results-standings]');
  const status = root.querySelector<HTMLElement>('[data-results-status]');
  if (podium !== null) podium.innerHTML = podiumMarkup(standings);
  if (finishers !== null) finishers.innerHTML = lowerFinishersMarkup(standings);
  if (rows !== null) rows.innerHTML = resultsStandingsMarkup(standings);
  if (status !== null) status.textContent = resultsStatus(standings);
  bindResultsArtFallbacks(root);
}

export function bindResultsArtFallbacks(root: ParentNode): void {
  for (const image of root.querySelectorAll<HTMLImageElement>('[data-results-art]')) {
    image.addEventListener('error', () => {
      const fallbacks = [image.dataset.fallbackSelection, image.dataset.fallbackPortrait].filter(
        (source): source is string => source !== undefined && source !== '',
      );
      const index = Number(image.dataset.fallbackIndex ?? 0);
      const nextSource = fallbacks[index];
      if (nextSource !== undefined) {
        image.dataset.fallbackIndex = String(index + 1);
        image.src = nextSource;
        return;
      }

      image.hidden = true;
      const monogram = image.parentElement?.querySelector<HTMLElement>('[data-art-monogram]');
      if (monogram !== null && monogram !== undefined) monogram.hidden = false;
    });
  }
}
