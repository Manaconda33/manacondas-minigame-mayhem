# NEON GRID — Circuit 02 · Build Spec

**Game:** Manaconda's Minigame Mayhem · **Route:** Route Night · **Status:** Design spec (not yet in repo)
**Author:** Paprika (design) + Manny (direction) · **Date:** 2026-10-02

> You don't look at Route Night anymore. You drive through it.

This spec is written against the existing track architecture as reviewed in
`src/game/track/` (CircuitAlpha, createTrackScene, TrackMaterials,
TrackSceneResources), `src/game/race/LapTracker.ts`, `src/config/kartTuning.ts`,
and `src/ui/routeNight.ts`. It mirrors existing interfaces exactly so the build
is additive — no refactors to current systems.

---

## 1. Concept

Neon Grid is Circuit 02 of Route Night: a neon-city night race in three sectors.
Fast and chaotic overall, with a technical middle act. Three hidden shortcuts
reward discovery; per Manny's direction they are **skill-gated, never luck-gated** —
every shortcut is always usable, and failure costs time, never the race.

| Sector | Name | Character | Width | Elevation |
|---|---|---|---|---|
| 1 | Skyline Straight | Wide elevated expressway, boost pads, sweepers — pack racing | halfWidth 6 | y = 14 |
| 2 | The Undercity | Neon alleyways, hairpins, 90° flicks — technical | halfWidth 4.5 | y = 0 |
| 3 | Falls Run | Climbing highway past waterfalls, jump finale | halfWidth 6 | y = 0 → 14 |

Reference visuals (in this folder):
- `track-concept-art.webp` — overall vibe: elevated night highway, waterfalls, cyan/magenta palette
- `track-layout.html` — top-down schematic: sectors, shortcuts, tokens, boost pads (open in browser)
- `media-generation-neon-grid-waterfall-dive-*.webp` — the signature Sector 3 jump moment

---

## 2. Track class: `NeonGrid`

New file: `src/game/track/NeonGrid.ts`. **Same public API as `CircuitAlpha`**
so `LapTracker`, `createTrackScene`, and tests interoperate unchanged:

- `curve: THREE.CatmullRomCurve3` (closed, `'centripetal'`, tension 0.5)
- `samples: THREE.Vector3[]`, `tangents: THREE.Vector3[]`, `sampleCount = 384`
- `sampleSpacing`, `checkpointIndices` (12 checkpoints)
- `project(position): TrackProjection`, `checkpointPosition(i)`,
  `lapCheckpointPosition(i)`, `lapCheckpointProgress(i)`, `lapCheckpointTangent(i)`
- `startFinishDistance = 22`

### 2.1 Extensions (additive)

- **Width profile.** CircuitAlpha uses a single `roadHalfWidth = 6`. NeonGrid needs
  per-sector width: add `halfWidthAt(progress: number): number` backed by a
  profile table `[{ progress: number, halfWidth: number }]` with linear
  interpolation. Suggested stops: S1 → 6, S2 → 4.5, S3 → 6, tunnel shortcut → 3.2.
  `project()` uses `halfWidthAt(progress)` instead of the constant.
- **Elevation.** Control points carry `y` (highway deck vs. street level).
  `poseAt` in the scene builder must account for pitch on climbs — check the
  existing crest-ramp pitch handling and reuse it.

### 2.2 Control points (tuned, clockwise from start/finish)

```ts
const points = [
  new THREE.Vector3(0, 14, -120),    // start/finish — elevated
  new THREE.Vector3(70, 14, -118),   // S1 straight (boost pads)
  new THREE.Vector3(130, 14, -85),   // sweeper
  new THREE.Vector3(150, 14, -10),   // billboard corner
  new THREE.Vector3(140, 12, 60),    // descent
  new THREE.Vector3(100, 4, 105),    // S2 entry
  new THREE.Vector3(30, 0, 125),     // hairpin 1 — Undercity
  new THREE.Vector3(-45, 0, 120),    // hairpin 2
  new THREE.Vector3(-100, 0, 80),    // esses
  new THREE.Vector3(-130, 0, 20),    // tunnel exit zone
  new THREE.Vector3(-120, 2, -45),   // climb begins — S3
  new THREE.Vector3(-70, 8, -90),    // waterfall dive ramp
  new THREE.Vector3(-20, 12, -112),  // landing / rejoin
];
```

### 2.3 Surface zones (`project()`)

`SurfaceType` today: `'asphalt' | 'dirt' | 'grass' | 'boost' | 'ramp'`
(`src/config/kartTuning.ts`). Add **`'static'`** — the billboard slowdown state —
with `surfaceSpeedMultiplier` between dirt and asphalt (~0.82) and no minimum-speed
penalty (it must never stop a kart, only scrub exit speed).

| Surface | Progress window | Lateral rule |
|---|---|---|
| boost | 0.08–0.095, 0.14–0.155, 0.20–0.215 (S1 pads); 0.78–0.795 (S3 pad) | lateralDistance ≤ 4.5 |
| ramp | 0.72–0.75 (waterfall dive) | lateralDistance ≤ 4.5 |
| static | 0.22–0.26 (billboard gap) — only while hologram is ON | within shortcut bounds |
| asphalt / grass | default | ≤ halfWidth / > halfWidth |

---

## 3. Shortcuts

Shortcuts are separate short curves. New interface (in `NeonGrid.ts`):

```ts
interface Shortcut {
  id: 'billboard-gap' | 'service-tunnel' | 'waterfall-dive';
  curve: THREE.CatmullRomCurve3;   // own centerline, own samples
  entry: { progress: [number, number]; lateral: [number, number] };
  exitProgress: number;             // main-curve progress at rejoin — MUST exceed entry
  roadHalfWidth: number;
}
```

`project()` checks shortcut bounds first when the kart is inside an entry window;
otherwise main curve. **Anti-cheat invariant:** `exitProgress > entry.progress[1]`
always — shortcuts only ever move you forward along lap progress. LapTracker
(12 main-curve checkpoints) is untouched.

### 3.1 Billboard Gap (Sector 1, entry ≈ progress 0.22)

- **What:** holographic billboard spanning the track at the sweeper exit. A chord
  path cuts the corner across the plaza behind it.
- **Behavior:** the billboard is **always smashable**. Flicker cycle: 6s
  (4s ON / 2s OFF) with a 0.8s glitch/static visual tell before each switch.
  - Hit during OFF → clean pass, full speed.
  - Hit during ON → pass through, `static` surface on the shortcut: exit speed ×0.82.
- **Fail state:** none — worst case is a slower exit. The gamble is *how much*
  speed you keep, and the tell makes it a skill read.
- **Time save:** ~0.6–0.9s vs. the long way around.

### 3.2 Service Tunnel (Sector 2, entry ≈ progress 0.42)

- **What:** unmarked maintenance ramp behind a dumpster prop in the Undercity;
  a straight tunnel chord skipping two hairpins.
- **Behavior:** narrow (`roadHalfWidth` 3.2) but **fully walled** — the test is
  line choice at speed, not survival. Dim magenta work-lights, dripping-pipe SFX.
- **Fail state:** none beyond losing the advantage — scrub the walls and you exit
  slower than the hairpin line. No falls, no respawns.
- **Time save:** ~1.0–1.4s when threaded clean.

### 3.3 Waterfall Dive (Sector 3, entry ≈ progress 0.72)

- **What:** broken guardrail section feeding a ramp over the plunge pool at the
  falls — the signature set piece (see dive visual).
- **Behavior:** `ramp` surface launches the kart; landing zone rejoins the main
  line at higher progress. Landing quality scales with entry speed and angle —
  reward the brave, not the lucky.
- **Fail state:** miss the landing → splashdown → respawn on-track at the landing
  zone with a ~1.5s penalty. A risk you can *learn*, not fear.
- **Time save:** ~1.8–2.2s on a stuck landing.

---

## 4. Tokens

5 tokens per lap (mirrors Circuit Alpha's token economy):
- 1 on the S1 straight (rewards the racing line)
- 1 in the Billboard Gap (rewards discovery)
- 1 in the Service Tunnel (rewards discovery)
- 1 on the S3 climb before the dive (decision point: dive or play safe)
- 1 past the finish-line sweeper (lap reward)

No token on the dive landing itself — the time save is the reward.

---

## 5. Scene build (`createTrackScene` additions)

Follow existing conventions: named groups (`boost-pad-{progress}`, checkpoint
pylons as InstancedMesh, `markBloomMaterial` for emissive). New builders:

- `createBillboard(track)` — hologram plane with flicker cycle
  (emissiveIntensity animation + glitch tell), breakaway shard particles on smash.
- `createServiceTunnel(track)` — walled tunnel chord, magenta work-lights,
  dumpster prop at entry (the landmark), drip SFX hook.
- `createWaterfallDive(track)` — ramp mesh (reuse `createRamp` geometry pattern),
  broken guardrail segments, waterfall particle planes off the deck edge,
  plunge pool disc with splash SFX hook, landing-zone marker.
- `createElevatedSupports(track)` — highway pylons under Sector 1 & 3 deck
  (y = 14 spans); Undercity needs none (street level).
- `createNeonSignage(track)` — emissive sign planes along all sectors, Route Night
  palette (cyan #37e6ff, magenta #ff4fd8, gold #ffc63f). Keep draw calls low:
  merge static geometry where possible.
- Guardrails: Sector 1 & 3 outer edges (gold rail material, existing pattern);
  Sector 2 uses alley walls instead of rails.

Materials: reuse `TrackMaterials` asphalt; new emissive trims only. Terrain under
S1/S3 deck: dark city-base plane with scattered window-light points (cheap).

## 6. Route Night UI integration

- New card asset: `public/assets/ui/route-night/neon-grid-route-card.webp`
  (use `track-concept-art.webp` in this folder as the art source).
- Route board: slot `02`, label `NEON GRID`, state LIVE; Circuit Alpha stays `01`.
- `src/ui/routeNight.ts`: add `'neon-grid-card': 'neon-grid-route-card.webp'`
  to the asset map (mirrors `'circuit-alpha-card'`).

## 7. Audio

Mirror Circuit Alpha's convention (`public/assets/audio/music-v2/`):
- `04-neon-grid-race-loop.wav` — driving synthwave, 140 BPM target
- `05-neon-grid-final-lap-loop.wav` — intensified variant
- SFX hooks: billboard static zap, tunnel drips, waterfall roar (proximity),
  splashdown.

## 8. Balance targets

- Target lap: ~62–68s for a clean no-shortcut lap (Circuit Alpha parity ±10%).
- All three shortcuts + clean lines: ~57–60s. No single shortcut should be
  worth more than ~2.2s — discovery matters, mastery matters more.
- AI rubber-banding: AI should take shortcuts at a tunable rate (suggest 35%)
  so they stay competitive without looking scripted.

## 9. Test plan (mirror existing)

- `tests/neon-grid.test.ts` (mirror `circuit-alpha.test.ts`): closed loop,
  384 samples, 12 checkpoints, width profile monotonic per sector, control-point
  sanity.
- Shortcut invariants: `exitProgress > entry.progress[1]` for all three;
  `project()` returns shortcut surface only inside entry windows.
- `track-scene.test.ts`: assert named groups exist
  (`billboard`, `service-tunnel`, `waterfall-dive`, 4 boost pads).
- `lap-tracker.test.ts`: unchanged behavior — shortcuts must not break lap
  counting (rejoin always advances progress).

## 10. Build order (suggested)

1. `NeonGrid.ts` + `halfWidthAt` + surface zones + `static` surface in kartTuning
2. Scene: road ribbon → supports/walls → boost pads → billboard → tunnel → dive
3. Tokens + checkpoints + Route Night UI card
4. Audio hooks
5. Tests + balance pass (AI shortcut rate, lap-time targets)

---

*Spec lives outside the repo by request. To build: copy this folder's contents
into `docs/` or attach to the implementing issue — no repo writes were made.*
