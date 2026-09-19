import { minimapPointAtProgress, minimapSvgPath, type MinimapState } from '../game/ui/Minimap';
import { routeNightRaceHudSymbolUrl } from '../ui/routeNight';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const renderedTracks = new WeakMap<HTMLElement, MinimapState['track']>();
let markerSequence = 0;

export function raceMinimapMarkup(): string {
  return `<div class="race-minimap route-hud-panel" data-race-region="minimap" data-race-minimap role="img" aria-label="Circuit Alpha race minimap showing the player and seven opponents">
    <span class="hud-kicker">Route trace</span>
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <g data-minimap-frame-art aria-hidden="true"><use href="${routeNightRaceHudSymbolUrl('frame-minimap')}" x="0" y="0" width="100" height="100"></use></g>
      <path class="minimap-track-outline" data-minimap-track></path>
      <path class="minimap-track-line" data-minimap-track></path>
      <g data-minimap-racers></g>
    </svg>
  </div>`;
}

export function updateRaceMinimap(element: HTMLElement, state: MinimapState): void {
  if (renderedTracks.get(element) !== state.track) {
    const path = minimapSvgPath(state.track);
    for (const track of element.querySelectorAll<SVGPathElement>('[data-minimap-track]')) {
      track.setAttribute('d', path);
    }
    renderedTracks.set(element, state.track);
  }

  const group = element.querySelector<SVGGElement>('[data-minimap-racers]');
  if (group === null) return;

  const existing = new Map(
    Array.from(group.querySelectorAll<SVGGElement>('[data-minimap-racer]')).map((marker) => [
      marker.dataset.minimapRacer ?? '',
      marker,
    ]),
  );
  const activeIds = new Set(state.racers.map(({ id }) => id));
  for (const [id, marker] of existing) {
    if (!activeIds.has(id)) marker.remove();
  }

  for (const racer of [...state.racers].sort((a, b) => Number(a.isPlayer) - Number(b.isPlayer))) {
    let marker = existing.get(racer.id);
    if (marker === undefined) {
      marker = document.createElementNS(SVG_NAMESPACE, 'g');
      marker.dataset.minimapRacer = racer.id;
      marker.setAttribute('data-minimap-racer', racer.id);

      const clipId = `minimap-head-${String(markerSequence)}`;
      markerSequence += 1;

      const clip = document.createElementNS(SVG_NAMESPACE, 'clipPath');
      clip.id = clipId;
      const clipCircle = document.createElementNS(SVG_NAMESPACE, 'circle');
      clipCircle.setAttribute('data-minimap-head-clip', '');
      clip.append(clipCircle);
      marker.append(clip);

      const portrait = document.createElementNS(SVG_NAMESPACE, 'image');
      portrait.setAttribute('data-minimap-portrait', '');
      portrait.setAttribute('preserveAspectRatio', 'xMidYMin slice');
      portrait.setAttribute('clip-path', `url(#${clipId})`);
      marker.append(portrait);

      const frame = document.createElementNS(SVG_NAMESPACE, 'circle');
      frame.setAttribute('data-minimap-frame', '');
      marker.append(frame);
      marker.append(document.createElementNS(SVG_NAMESPACE, 'title'));
    }
    const point = minimapPointAtProgress(state.track, racer.progress);
    const radius = racer.isPlayer ? 6.6 : 5.3;
    marker.classList.toggle('is-player', racer.isPlayer);
    marker.setAttribute('transform', `translate(${String(point.x)} ${String(point.y)})`);
    marker.querySelector('[data-minimap-head-clip]')?.setAttribute('r', String(radius - 0.7));
    const portrait = marker.querySelector<SVGImageElement>('[data-minimap-portrait]');
    if (portrait !== null) {
      portrait.setAttribute('href', racer.portrait);
      portrait.setAttribute('x', String(-radius * 1.5));
      portrait.setAttribute('y', String(-radius * 1.1));
      portrait.setAttribute('width', String(radius * 3));
      portrait.setAttribute('height', String(radius * 3));
    }
    marker.querySelector('[data-minimap-frame]')?.setAttribute('r', String(radius));
    const title = marker.querySelector('title');
    if (title !== null) title.textContent = racer.name;
    group.append(marker);
  }
}
