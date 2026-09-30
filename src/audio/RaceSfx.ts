import { Howler } from 'howler';
import manifest from '../../assets/audio/sfx-review-v1/manifest.json';
import { SfxBank } from './SfxBank';
import { itemTravelCue, itemActivationCue } from './itemSoundCues';
export interface RaceSoundFrame {
  paused: boolean;
  countdown: string;
  finished: boolean;
  lap: number;
  place: number;
  speed: number;
  throttle: number;
  driftTier: string;
  boost: boolean;
  airborne: boolean;
  surface: string;
  wrongWay: boolean;
  itemPhase: string;
  spinout: boolean;
  prismatic: boolean;
  overdrive: boolean;
  rocket: boolean;
  frost: boolean;
  position: { x: number; y: number; z: number };
  forward: { x: number; y: number; z: number };
  ai: { id: string; speed: number; position: { x: number; y: number; z: number } }[];
  projectiles: { id: number; itemId: string; position: { x: number; y: number; z: number } }[];
  hazards: {
    id: number;
    kind: string;
    remainingSeconds: number;
    position: { x: number; y: number; z: number };
  }[];
  seekerWarning: number | null;
  apexWarning: string | null;
}
export class RaceSfx {
  private previous: RaceSoundFrame | null = null;
  private time = 0;
  private readonly nextWarnings = new Map<string, number>();
  private disposed = false;

  public constructor(
    public readonly bank = new SfxBank(),
    private readonly listener: (frame: RaceSoundFrame) => void = (frame) => {
      Howler.pos(frame.position.x, frame.position.y, frame.position.z);
      Howler.orientation(frame.forward.x, frame.forward.y, frame.forward.z, 0, 1, 0);
    },
  ) {
    bank.preload(manifest.cues.filter((c) => c.group !== '04-menus-results').map((c) => c.id));
  }

  public cue(cue: string | undefined, position?: RaceSoundFrame['position'], gain = 0.65): void {
    if (cue && !this.disposed) this.bank.play(cue, { position, gain });
  }

  public itemUse(
    itemId: string | undefined,
    activated: boolean,
    position?: RaceSoundFrame['position'],
  ): void {
    if (!activated) {
      this.cue('item-unavailable', undefined, 0.28);
      return;
    }
    if (!itemId) return;
    this.cue(itemActivationCue(itemId), position);
  }

  public update(frame: RaceSoundFrame, dt: number): void {
    if (this.disposed) return;
    this.bank.setPaused(frame.paused);
    if (frame.paused) return;
    this.time += Math.min(0.1, Math.max(0, dt));
    this.listener(frame);
    this.bank.refreshMix();
    const prev = this.previous;
    if (frame.countdown && frame.countdown !== prev?.countdown)
      this.cue(frame.countdown === 'GO!' ? 'race-start-go' : 'countdown-tick');
    if (prev && frame.lap > prev.lap && !frame.finished)
      this.cue(frame.lap === 3 ? 'final-lap' : 'lap-complete');
    if (frame.finished && !prev?.finished) {
      this.cue('race-finish');
      this.cue(
        frame.place === 1
          ? 'placement-win'
          : frame.place <= 3
            ? 'placement-podium'
            : 'placement-other',
        undefined,
        0.42,
      );
    }
    const loops = new Set<string>();
    const loop = (
      cue: string,
      key: string,
      gain: number,
      rate = 1,
      position?: RaceSoundFrame['position'],
      bus: 'engine' | 'sfx' = 'sfx',
    ): void => {
      loops.add(key);
      this.bank.loop(cue, key, { gain, rate, position, bus, priority: 2 });
    };
    if (!frame.finished) {
      const duck = frame.seekerWarning || frame.apexWarning ? 0.45 : 1;
      const engine = (
        id: string,
        speed: number,
        gain: number,
        position?: RaceSoundFrame['position'],
      ): void => {
        const rpm = Math.min(
          1,
          Math.max(
            0,
            Math.abs(speed) / 36 + (id === 'player' ? Math.abs(frame.throttle) * 0.08 : 0.04),
          ),
        );
        loop(
          'engine-low-rpm',
          `engine-${id}-low`,
          gain * (1 - rpm * 0.8) * duck,
          0.75 + rpm * 0.85,
          position,
          'engine',
        );
        loop(
          'engine-high-rpm',
          `engine-${id}-high`,
          gain * rpm * 0.75 * duck,
          0.75 + rpm * 0.85,
          position,
          'engine',
        );
      };
      engine('player', frame.speed, 0.32);
      const distance = (p: RaceSoundFrame['position']): number =>
        Math.hypot(p.x - frame.position.x, p.y - frame.position.y, p.z - frame.position.z);
      for (const ai of [...frame.ai]
        .filter((a) => distance(a.position) < 55)
        .sort((a, b) => distance(a.position) - distance(b.position))
        .slice(0, 2))
        engine(ai.id, ai.speed, 0.14, ai.position);
      if (Math.abs(frame.speed) > 2 && !frame.airborne) {
        const surface =
          frame.surface === 'grass' ? 'grass' : frame.surface === 'dirt' ? 'dirt' : 'asphalt';
        loop(`tires-${surface}-loop`, 'terrain', Math.min(0.18, Math.abs(frame.speed) / 160));
      }
      if (frame.driftTier !== 'none') {
        loop('tire-drift-loop', 'drift', 0.18);
        if (frame.driftTier !== prev?.driftTier) this.cue(`drift-${frame.driftTier}`);
      }
      if (frame.boost) {
        loop('boost-sustain-loop', 'boost', 0.14);
        if (!prev?.boost) this.cue(frame.surface === 'boost' ? 'boost-pad' : 'drift-boost-release');
      } else if (prev?.boost) this.cue('boost-end', undefined, 0.3);
      if (frame.airborne && !prev?.airborne) this.cue('jump-takeoff', undefined, 0.4);
      if (!frame.airborne && prev?.airborne)
        this.cue(Math.abs(frame.speed) > 22 ? 'landing-heavy' : 'landing-light', undefined, 0.5);
      if (frame.spinout && !prev?.spinout) this.cue('spinout', undefined, 0.4);
      if (!frame.prismatic && prev?.prismatic) this.cue('prismatic-expire', undefined, 0.4);
      if (!frame.frost && prev?.frost) this.cue('frost-end', undefined, 0.4);
      if (!frame.overdrive && prev?.overdrive) this.cue('overdrive-expire', undefined, 0.4);
      if (frame.rocket) loop('rocket-propulsion-loop', 'rocket', 0.22, 1, undefined, 'engine');
      if (!frame.rocket && prev?.rocket) this.cue('rocket-return');
      if (frame.itemPhase === 'roulette' && prev?.itemPhase !== 'roulette')
        this.cue('item-box-collect', undefined, 0.45);
      if (frame.itemPhase === 'held' && prev?.itemPhase === 'roulette')
        this.cue('item-ready', undefined, 0.45);
      this.warning(
        'seeker',
        frame.seekerWarning === null ? null : frame.seekerWarning >= 3,
        frame.seekerWarning === 3 ? 0.22 : 0.65,
      );
      this.warning(
        'apex',
        frame.apexWarning === null ? null : frame.apexWarning === 'diving',
        frame.apexWarning === 'diving' ? 0.22 : 0.7,
      );
      if (frame.wrongWay && this.time >= (this.nextWarnings.get('wrong-way') ?? 0)) {
        this.cue('wrong-way', undefined, 0.4);
        this.nextWarnings.set('wrong-way', this.time + 2.5);
      }
      for (const p of [...frame.projectiles]
        .filter((p) => distance(p.position) < 55)
        .sort((a, b) => distance(a.position) - distance(b.position))
        .slice(0, 3)) {
        const cue = itemTravelCue(p.itemId);
        if (cue) loop(cue, `projectile-${String(p.id)}`, 0.12, 1, p.position);
      }
      const fuseKeys = new Set<string>();
      for (const h of frame.hazards
        .filter((h) => h.kind === 'blast' && distance(h.position) < 35)
        .slice(0, 3)) {
        const key = `fuse-${String(h.id)}`;
        fuseKeys.add(key);
        if (this.time >= (this.nextWarnings.get(key) ?? 0)) {
          this.cue('blast-orb-fuse-tick', h.position, 0.3);
          this.nextWarnings.set(key, this.time + (h.remainingSeconds < 1 ? 0.18 : 0.65));
        }
      }
      for (const key of this.nextWarnings.keys())
        if (key.startsWith('fuse-') && !fuseKeys.has(key)) this.nextWarnings.delete(key);
    } else {
      this.warning('seeker', null, 0);
      this.warning('apex', null, 0);
    }
    this.bank.retainLoops(loops);
    this.previous = { ...frame };
  }

  private warning(family: string, urgent: boolean | null, interval: number): void {
    const key = family + '-warning';
    if (urgent === null) {
      this.nextWarnings.delete(key);
      this.bank.stopCue(key);
      this.bank.stopCue(key + '-urgent');
      return;
    }
    if (this.time < (this.nextWarnings.get(key) ?? 0)) return;
    this.bank.play(key + (urgent ? '-urgent' : ''), { gain: 0.85, priority: 5 });
    this.nextWarnings.set(key, this.time + interval);
  }

  public dispose(): void {
    this.disposed = true;
    this.bank.dispose();
    this.nextWarnings.clear();
  }
}
