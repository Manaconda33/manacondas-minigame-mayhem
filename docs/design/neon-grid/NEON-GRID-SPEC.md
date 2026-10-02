# NEON GRID — Circuit 02 · Build Spec

**Game:** Manaconda's Minigame Mayhem · **Route:** Route Night · **Status:** Design review branch; not an approved PRD amendment
**Author:** Paprika (design) + Manny (direction) · **Date:** 2026-10-02

**2026-10-02 design revision:** Manny directed shortcut-safe checkpoint placement
and a longer course length appropriate to the 62–68-second target. Sections 2,
3, 8, and 9 incorporate those decisions. Geometry and lap times still require
runtime measurement before implementation acceptance.


**Stage 1 review prepared:** See `BUILD-CONTRACT.md`, `layout.svg`, and `layout.json` for the refined dimensional course, underground tunnel, ordered gates, and proposed token rule. Owner review is pending; the coordinates below are proposed blockout geometry, not accepted gameplay.

> You don't look at Route Night anymore. You drive through it.

This spec is written against the existing track architecture as reviewed in
`src/game/track/` (CircuitAlpha, createTrackScene, TrackMaterials,
TrackSceneResources), `src/game/race/LapTracker.ts`, `src/config/kartTuning.ts`,
and `src/ui/routeNight.ts`. Manny approved the staged build approach on
2026-10-02. The implementation plan is
`docs/superpowers/plans/2026-10-02-neon-grid.md`. Introduce the minimal shared
track contract and route selection needed by current Circuit Alpha consumers;
retain existing race authorities and use route-specific scene/collision
builders. The refined course shape and final product contract are reviewed in
Stage 1 before runtime implementation.

---

## 1. Concept

Neon Grid is Circuit 02 of Route Night: a neon-city night race in three sectors.
Fast and chaotic overall, with a technical middle act. Three hidden shortcuts
reward discovery; per Manny's direction they are **skill-gated, never luck-gated** —
every shortcut is always usable, and failure costs time, never the race.
The main-curve length target is **1.40–1.50 km** so a clean no-shortcut lap can
land near 62–68 seconds after actual driving and AI balance measurements.

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
through the shared track contract. `LapTracker` retains its existing authority;
scene construction selects a route-specific builder:

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

### 2.2 Refined control points — Stage 1 proposal

The dimensional proposal has genuine Undercity switchbacks and a localized
waterfall jump. Dense centripetal length is 1,450.000 m; the 200-division
estimate is 1,449.096 m. Validate with actual Three.js and Rapier in the build.
`layout.json` is the geometric source and `build_layout.py` reproduces the
measurements/drawing. Horizontal scaling preserves the 0/14 m sector intent.

```ts
const points = [
  new THREE.Vector3(0.0, 14.0, -135.75),
  new THREE.Vector3(98.041, 14.0, -135.75),
  new THREE.Vector3(173.458, 14.0, -131.979),
  new THREE.Vector3(211.166, 14.0, -98.041),
  new THREE.Vector3(214.937, 14.0, -45.25),
  new THREE.Vector3(207.395, 10.0, -7.542),
  new THREE.Vector3(173.458, 2.0, 18.854),
  new THREE.Vector3(131.979, 0.0, 18.854),
  new THREE.Vector3(122.929, 0.0, 32.429),
  new THREE.Vector3(131.979, 0.0, 45.25),
  new THREE.Vector3(145.554, 0.0, 49.021),
  new THREE.Vector3(154.604, 0.0, 62.596),
  new THREE.Vector3(145.554, 0.0, 75.416),
  new THREE.Vector3(131.979, 0.0, 79.187),
  new THREE.Vector3(122.929, 0.0, 92.762),
  new THREE.Vector3(131.979, 0.0, 105.583),
  new THREE.Vector3(192.312, 0.0, 113.125),
  new THREE.Vector3(214.937, 0.0, 143.291),
  new THREE.Vector3(196.083, 0.0, 173.458),
  new THREE.Vector3(75.416, 0.0, 173.458),
  new THREE.Vector3(-60.333, 0.0, 173.458),
  new THREE.Vector3(-143.291, 1.0, 165.916),
  new THREE.Vector3(-173.458, 3.0, 128.208),
  new THREE.Vector3(-169.687, 6.0, 75.416),
  new THREE.Vector3(-188.541, 8.0, 58.825),
  new THREE.Vector3(-169.687, 9.0, 39.217),
  new THREE.Vector3(-158.374, 10.0, 7.542),
  new THREE.Vector3(-143.291, 12.0, -67.875),
  new THREE.Vector3(-109.354, 14.0, -113.125),
  new THREE.Vector3(-52.791, 14.0, -134.241),
];
```

### 2.3 Ordered checkpoint placement

Keep 12 physical gates and existing ordered LapTracker authority. Common-road
pairs are 2/3 around Billboard, 4/5 around Tunnel, and 8/9 around Dive.

| Gate | Main progress | checkpointIndices entry |
|---|---:|---:|
| 0 | 22 m finish after grid origin | 0 |
| 1 | 0.072917 | 28 |
| 2 | 0.104167 | 40 |
| 3 | 0.205729 | 79 |
| 4 | 0.263021 | 101 |
| 5 | 0.380208 | 146 |
| 6 | 0.588542 | 226 |
| 7 | 0.658854 | 253 |
| 8 | 0.752604 | 289 |
| 9 | 0.820312 | 315 |
| 10 | 0.898438 | 345 |
| 11 | 0.958333 | 368 |

Gate 0 uses `lapCheckpointPosition(0)` at 22 m after the origin; the topology
index 0 still identifies the starting grid. Gate half-width 13 m and vertical
tolerance 1.5 m are proposed for runtime validation. Geometric main-curve
crossing checks and skipped-interval checks pass. Physical trigger/lap tests
remain pending. All paths cross 1→11→0; rejoin progress grants no checkpoint.
Splash recovery resumes before gate 9 and retains only earned gates.

### 2.4 Surface zones (`project()`)

`SurfaceType` today: `'asphalt' | 'dirt' | 'grass' | 'boost' | 'ramp'`
(`src/config/kartTuning.ts`). Add **`'static'`** — the billboard slowdown state —
with `surfaceSpeedMultiplier` between dirt and asphalt (~0.82) and no minimum-speed
penalty (it must never stop a kart, only scrub exit speed).

| Surface | Progress window | Lateral rule |
|---|---|---|
| boost | centers 0.035, 0.060, 0.085 (S1), 0.730 (S3); each ±0.0075 | lateralDistance ≤ 4.5 |
| ramp | 0.768546–0.773546 at selected waterfall shortcut entry | lateralDistance ≤ 4.5 |
| static | 0.119998–0.192591 (billboard path) — only while hologram is ON | within shortcut bounds |
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

The proposed entry/rejoin windows are Billboard Gap 0.119998–0.124998 → 0.192591,
Service Tunnel 0.279230–0.284230 → 0.367226, and Waterfall Dive
0.768546–0.773546 → 0.805549.
`project()` recognizes a valid forward entry and follows that shortcut's own
curve through its rejoin; it must not fall back to main projection immediately
after leaving the narrow entry window. Its mapped main-curve progress stays
within the entry-to-exit interval until the kart physically rejoins. **Anti-cheat
invariants:** `exitProgress > entry.progress[1]`, and none of these intervals
contains an ordered checkpoint gate. The existing `LapTracker` remains the
authority: proximity to a downstream sample never grants a checkpoint or lap.

### 3.1 Billboard Gap (Sector 1, entry ≈ progress 0.120)

- **What:** holographic billboard spanning the track at the sweeper exit. A chord
  path cuts the corner across the plaza behind it.
- **Behavior:** the billboard is **always smashable**. Flicker cycle: 6s
  (4s ON / 2s OFF) with a 0.8s glitch/static visual tell before each switch.
  - Hit during OFF → clean pass, full speed.
  - Hit during ON → pass through, `static` surface on the shortcut: exit speed ×0.82.
- **Fail state:** none — worst case is a slower exit. The gamble is *how much*
  speed you keep, and the tell makes it a skill read.
- **Time save:** ~0.6–0.9s vs. the long way around.

### 3.2 Service Tunnel (Sector 2, entry ≈ progress 0.279)

- **What:** unmarked maintenance ramp behind a dumpster prop in the Undercity;
  a tunnel chord skipping the switchback sequence. Entry/exit ramps descend
  below the street to a y=-4 m straight section, so the paths can cross safely.
  Verify headroom with actual kart geometry; see `BUILD-CONTRACT.md`.
- **Behavior:** narrow (`roadHalfWidth` 3.2) but **fully walled** — the test is
  line choice at speed, not survival. Dim magenta work-lights, dripping-pipe SFX.
- **Fail state:** none beyond losing the advantage — scrub the walls and you exit
  slower than the hairpin line. No falls, no respawns.
- **Time save:** ~1.0–1.4s when threaded clean.

### 3.3 Waterfall Dive (Sector 3, entry ≈ progress 0.769)

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

5 tokens per lap (new collectible behavior; current runtime economy is not assumed).
The proposed race-local count, reset/ownership rules, and exact anchors are in
`BUILD-CONTRACT.md` for Manny's review:
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

- Main-curve length: 1.40–1.50 km after sampling the actual spline; tune the
  refined dimensional plan if the sampled length falls outside that range.
- Target lap: ~62–68s for a clean no-shortcut lap, validated by real driving
  and representative AI runs. This is a distinct, longer circuit with its own
  target rather than a Circuit Alpha parity claim.
- All-shortcut target: the same driver's measured normal-route time minus
  paired shortcut savings (approximately 3.4–4.5s improvement). The earlier
  independent 57–60s range is superseded because it conflicted with the full
  62–68s normal-route range. No single shortcut target exceeds approximately
  2.2s; tune realized geometry or review the target if real driving disagrees.
- AI rubber-banding: AI should take shortcuts at a tunable rate (suggest 35%)
  so they stay competitive without looking scripted.

## 9. Test plan (mirror existing)

- `tests/neon-grid.test.ts` (mirror `circuit-alpha.test.ts`): closed loop,
  384 samples, 12 distinct checkpoints, sampled length 1.40–1.50 km, width
  profile transitions per sector, control-point/elevation sanity.
- Shortcut invariants: `exitProgress > entry.progress[1]` for all three;
  valid forward entry persists on the shortcut until physical rejoin; mapped
  progress never jumps ahead of the kart or awards a checkpoint.
- `track-scene.test.ts`: assert named groups exist
  (`billboard`, `service-tunnel`, `waterfall-dive`, 4 boost pads).
- `lap-tracker.test.ts`: unchanged authority — each of the eight shortcut-use
  combinations and the ordinary route crosses all 12 gates in order; reverse
  entries, missed gates, premature rejoin, splash recovery, and finish-line
  bypass cannot grant a lap.

## 10. Build order (suggested)

1. `NeonGrid.ts` + `halfWidthAt` + surface zones + `static` surface in kartTuning
2. Scene: road ribbon → supports/walls → boost pads → billboard → tunnel → dive
3. Tokens + checkpoints + Route Night UI card
4. Audio hooks
5. Tests + balance pass (AI shortcut rate, lap-time targets)

---

*This spec is on a design review branch. Reconcile it with the approved PRD and
record the final track contract before implementing or publishing gameplay.*
