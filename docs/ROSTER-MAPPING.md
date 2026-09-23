# Roster profile allocation

This ledger is the source of truth for mapping approved Manaconda's Minigame Mayhem characters to the twelve fixed PRD balance profiles. Each internal profile may be assigned to one active production character only. An assigned profile is unavailable to every later character unless Manny explicitly approves a remap or retires the assigned character from production.

## Allocation rules

- Every active production character must use one AA-01 through AA-12 profile.
- Each profile may be assigned once among active production characters.
- Each active production character may hold one profile.
- Character appearance or personality may inform discussion but cannot determine a mapping without an approved driving-feel decision.
- A locked mapping records the character, kart, rationale, approval date, and governing decision.
- When Manny retires a character from production, the profile returns to `Available` unless he explicitly reserves it. Historical mapping and package details remain in `docs/CHARACTER-ARCHIVE.md` and the character records.
- The manifest validator must reject duplicate profile IDs or duplicate active production-character assignments.
- Remapping a locked active profile requires Manny's approval and updates to this ledger, the affected avatar records, `docs/DECISIONS.md`, and implementation evidence.

## Required review and update sequence

For every new character:

1. Read this ledger before recommending an archetype.
2. Remove every `Assigned` profile from consideration.
3. Compare the character's approved driving feel, strengths, weaknesses, and weight class against the remaining profiles.
4. Present the strongest recommendation and its tradeoffs to Manny for approval.
5. After approval, update the selected ledger row and add its locked-mapping rationale in the same checkpoint.
6. Update the character record, decision log when required, and implementation evidence so all sources agree.

Do not reserve or mark a profile `Assigned` before Manny approves the mapping. If the ledger and an avatar record disagree, stop character implementation until the conflict is resolved.

## Profile ledger

Stat order is Speed / Acceleration / Weight / Handling / Mini-Turbo / Traction.

| Profile | Archetype           | Class         | Stats                  | Status    | Character    | Kart                 | Approval          |
| ------- | ------------------- | ------------- | ---------------------- | --------- | ------------ | -------------------- | ----------------- |
| AA-01   | Feather Sprinter    | Featherweight | 6 / 9 / 2 / 8 / 7 / 4  | Assigned  | Alex         | The Neon Vector      | Manny, 2026-09-05 |
| AA-02   | Feather Technician  | Featherweight | 5 / 8 / 2 / 9 / 8 / 4  | Assigned  | Lavi         | Potato               | Manny, 2026-08-16 |
| AA-03   | Feather Dirt Ace    | Featherweight | 5 / 8 / 3 / 7 / 6 / 7  | Assigned  | Lula         | The Verdant Hart     | Manny, 2026-08-29 |
| AA-04   | Balanced Racer      | Medium        | 7 / 7 / 5 / 7 / 5 / 5  | Assigned  | Keeg         | The Mycelial Majesty | Manny, 2026-08-26 |
| AA-05   | Drift Specialist    | Medium        | 6 / 7 / 5 / 6 / 9 / 3  | Assigned  | Kraken       | The Abyssal Drifter  | Manny, 2026-08-21 |
| AA-06   | Grip Specialist     | Medium        | 6 / 6 / 5 / 7 / 5 / 7  | Assigned  | Dragon Queen | The Sovereign Wyrm   | Manny, 2026-09-03 |
| AA-07   | High-Speed Cruiser  | Cruiser       | 8 / 6 / 7 / 5 / 4 / 6  | Assigned  | McFleurdel   | The Fleur de Nuit    | Manny, 2026-08-27 |
| AA-08   | Turbo Bruiser       | Cruiser       | 7 / 5 / 7 / 4 / 8 / 5  | Assigned  | Toph         | The Grave Shift      | Manny, 2026-08-28 |
| AA-09   | Technical Cruiser   | Cruiser       | 7 / 6 / 6 / 6 / 6 / 5  | Assigned  | Manaconda    | The Wayfinder        | Manny, 2026-08-16 |
| AA-10   | Straight-Line Heavy | Heavyweight   | 10 / 4 / 9 / 3 / 4 / 6 | Assigned  | Krios        | The Hornbreaker      | Manny, 2026-08-22 |
| AA-11   | Collision Tank      | Heavyweight   | 8 / 4 / 10 / 3 / 5 / 6 | Assigned  | Accu         | Pink Precision       | Manny, 2026-08-20 |
| AA-12   | All-Surface Heavy   | Heavyweight   | 8 / 5 / 8 / 4 / 4 / 7  | Assigned  | Jennifer     | The Hearthwarden     | Manny, 2026-09-03 |

## Front-action rollout checkpoint

Manny approved Lula and Accu's four-frame camera-facing action packages, then accepted the deployed desktop/mobile result on 2026-09-03. Their AA-03 and AA-11 mappings, stats, karts, and approval dates remain unchanged. The eight PNGs are live accepted under `lula-runtime-20260903-3` and `accu-runtime-20260903-3`. All nine active production drivers now meet the front-action runtime contract.

## Dragon Queen intake checkpoint

Dragon Queen's literal-dragon character lock, definitive visual authority, transformation rights, The Sovereign Wyrm kart lock, and AA-06 Grip Specialist mapping were approved on 2026-09-03. Manny approved portrait Candidate 2, all ten driver states, and Sovereign Wyrm geometry Candidate 2 by 2026-09-04. Her complete package is locally active under `dragon-queen-runtime-20260904-1`. Publication and live acceptance remain gated.

## Alex intake checkpoint

Alex's character lock, definitive visual authority, transformation rights, The Neon Vector kart lock, and AA-01 Feather Sprinter mapping were approved on 2026-09-05. Manny approved portrait Option A, all ten driver states, Neon Vector geometry Candidate 3, and the deployed desktop/mobile result. Her package is live accepted under `alex-runtime-20260905-1`; PR #92 merged at `617312394decfcb95af4f8fee6431ee9d339201b`, and final acceptance was recorded against deployed checkpoint `daf1e3127478981e40cca9533300f8617f61004d`. All twelve profiles are assigned and the Slice 3 roster mapping is complete.

## Jennifer release checkpoint

Jennifer's character lock, definitive reference, transformation rights, The Hearthwarden kart lock, and AA-12 All-Surface Heavy mapping were approved on 2026-09-03. Her complete package is live accepted in `characterManifest` under `jennifer-runtime-20260903-2`. AA-06 is assigned to Dragon Queen and AA-01 is assigned to Alex.

## Locked mapping rationale

### AA-01: Alex / The Neon Vector

Alex's intended driving identity is a warm, clever competitor who wins through rapid launch recovery, precise corrections, and well-timed drift conversion. Acceleration 9 and Handling 8 make responsiveness the headline strengths; Mini-Turbo 7 rewards confident drift timing. Speed 6 keeps her from becoming a straight-line specialist, while Weight 2 and Traction 4 preserve meaningful collision and off-road weaknesses. The profile fits the lightweight cyber-racer without overlapping Lavi's more technical AA-02 tuning or Lula's higher-traction AA-03 identity. Manny approved the mapping on 2026-09-05.

### AA-06: Dragon Queen / The Sovereign Wyrm

Dragon Queen's intended driving identity is controlled, planted, and deliberate. Handling 7 and Traction 7 reward stable line discipline and reliable grip. Speed 6 and Acceleration 6 keep her capable without making straight-line pace the defining strength, while Weight 5 and Mini-Turbo 5 preserve contact and drift tradeoffs. The profile expresses calm authority through control and avoids assigning performance from her powerful appearance alone. Manny approved the mapping on 2026-09-03.

### AA-12: Jennifer / The Hearthwarden

Jennifer's intended driving identity is a patient all-surface guardian that holds momentum across rough terrain. Speed 8, Weight 8, and Traction 7 give The Hearthwarden strong road presence, collision stability, and off-road retention. Acceleration 5 and Handling 4 make recovery and sudden corrections costly, while Mini-Turbo 4 keeps careful route choice more important than drift chaining. The profile remains distinct from Krios's Speed 10 straight-line heavy and Accu's Weight 10 collision tank. Manny approved the mapping on 2026-09-03.

### AA-03: Lula / The Verdant Hart

Lula's intended driving identity is an agile woodland racer that remains composed on imperfect terrain. Acceleration 8, Handling 7, and Traction 7 support fast recovery, responsive lines, and strong off-road grip. Speed 5 and Weight 3 limit straight-line dominance and collision resistance, while Mini-Turbo 6 rewards controlled drifting without overlapping Lavi's more technical AA-02 profile. Manny approved the mapping on 2026-08-29.

### AA-08: Toph / The Grave Shift

Toph's intended driving identity is a substantial street racer that converts committed drift lines into explosive exits. Speed 7 and Weight 7 give The Grave Shift momentum and road presence, while Mini-Turbo 8 makes drift chains its main advantage. Acceleration 5 and Handling 4 make missed lines and poor recovery costly. Traction 5 keeps the kart usable without overlapping the all-surface heavy, and the cruiser-class mass distinguishes Toph from Kraken's lighter AA-05 Drift Specialist. Manny approved the mapping on 2026-08-28.

### AA-07: McFleurdel / The Fleur de Nuit

McFleurdel's intended driving identity is elegant, deliberate, and fast rather than twitchy or boost-dependent. Speed 8 and Weight 7 give The Fleur de Nuit strong momentum and substantial road presence. Acceleration 6 and Traction 6 keep it controlled, while Handling 5 and Mini-Turbo 4 make committed lines and anticipation more important than rapid corrections or drift chaining. Manny approved the mapping on 2026-08-27.

### AA-02: Lavi / Potato

Lavi's intended driving identity is nimble, responsive, and technical. Acceleration 8, Handling 9, and Mini-Turbo 8 reward quick reactions, precise lines, and controlled drifting. Speed 5, Weight 2, and Traction 4 keep the profile distinct: Lavi gives up collision resistance, off-road forgiveness, and top-end speed in exchange for immediate control. Manny approved the mapping on 2026-08-16.

### AA-04: Keeg / The Mycelial Majesty

Keeg's intended driving identity is versatile, responsive, technically capable, and expressive without becoming a pure specialist. Speed 7, Acceleration 7, and Handling 7 create a broadly competent racer that rewards deliberate control. Weight 5 gives The Mycelial Majesty enough presence for its substantial enchanted grand-tourer form without turning Keeg into a heavyweight. Mini-Turbo 5 preserves Kraken's dedicated drift-specialist role, while Traction 5 leaves meaningful consequences for poor lines and off-road mistakes. Manny approved the mapping on 2026-08-26.

### AA-09: Manaconda / The Wayfinder

Manaconda is a prepared, heavily equipped explorer whose driving identity is composed route-reading rather than twitchy reflexes or brute force. Speed 7 preserves journeying momentum; the four middle values at 6 reward deliberate all-round competence; Weight 6 gives the equipped field vehicle substance without making it a heavyweight; and Traction 5 retains a real off-road weakness. Manny approved the mapping on 2026-08-16.

### AA-11: Accu / Pink Precision

Accu's compact tank-inspired kart is the roster's collision specialist. Weight 10 and Handling 3 reward committed lines and contact rather than quick corrections. Speed 8 keeps Pink Precision threatening once it builds momentum, while Acceleration 4 makes mistakes costly. Mini-Turbo 5 and Traction 6 preserve basic race usability without weakening the heavyweight identity. Manny approved the mapping on 2026-08-20.

### AA-05: Kraken / The Abyssal Drifter

Kraken is the roster's dedicated drift specialist. Mini-Turbo 9 rewards deliberate drift chains and repeated boost conversion. Acceleration 7 helps him recover momentum between corners, while Speed 6, Weight 5, and Handling 6 keep the profile controlled rather than twitchy. Traction 3 is the defining weakness: poor lines and off-road mistakes cost meaningful time. Manny approved the mapping on 2026-08-21.

### AA-10: Krios / The Hornbreaker

Krios is the roster's straight-line heavyweight bully. Speed 10 and Weight 9 give The Hornbreaker dominant momentum and collision presence. Acceleration 4 and Handling 3 make recovery and tight corrections deliberately costly, while Mini-Turbo 4 prevents overlap with drift-focused racers. Traction 6 keeps the kart usable without turning Krios into the all-surface heavy. Manny approved the mapping on 2026-08-22.

## Character Select full-body art checkpoint

The AA profile assignments, kart assignments, and race-facing driver packages are unchanged. Manny approved a separate full-body Character Select layer for every active profile on 2026-09-19. The manifest paths below are selection-only and do not replace the roster-card portraits or race driver frames.

| Profile | Character | Selection-only runtime asset |
| --- | --- | --- |
| AA-01 | Alex | `public/assets/characters/aa-01/selection/full-body.png` |
| AA-02 | Lavi | `public/assets/characters/aa-02/selection/full-body.png` |
| AA-03 | Lula | `public/assets/characters/aa-03/selection/full-body.png` |
| AA-04 | Keeg | `public/assets/characters/aa-04/selection/full-body.png` |
| AA-05 | Kraken | `public/assets/characters/aa-05/selection/full-body.png` |
| AA-06 | Dragon Queen | `public/assets/characters/aa-06/selection/full-body.png` |
| AA-07 | McFleurdel | `public/assets/characters/aa-07/selection/full-body.png` |
| AA-08 | Toph | `public/assets/characters/aa-08/selection/full-body.png` |
| AA-09 | Manaconda | `public/assets/characters/aa-09/selection/full-body.png` |
| AA-10 | Krios | `public/assets/characters/aa-10/selection/full-body.png` |
| AA-11 | Accu | `public/assets/characters/aa-11/selection/full-body.png` |
| AA-12 | Jennifer | `public/assets/characters/aa-12/selection/full-body.png` |

The approved package is governed by ADR-091 and the durable source/runtime ledger in `docs/assets/CHARACTER-SELECT-FULL-BODY-ASSET-BRIEF.md`. It changes no balance profile, kart identity or geometry, driver frame, race authority, or material implementation.

## Results/Podium victory art checkpoint

Manny approved the first Results/Podium victory art for McFleurdel, Toph, and
Manaconda on 2026-09-23. The character assignments, balance profiles, and
Character Select references above remain unchanged. The three transparent
runtime derivatives and their provenance are recorded in
`docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md` and
`docs/ASSET-PROVENANCE.md`.

| Profile | Character | Approved Results/Podium asset |
| --- | --- | --- |
| AA-07 | McFleurdel | `public/assets/characters/aa-07/results/victory.png` |
| AA-08 | Toph | `public/assets/characters/aa-08/results/victory.png` |
| AA-09 | Manaconda | `public/assets/characters/aa-09/results/victory.png` |

## Historical archived mappings

### AA-06: Cleo / The Gilded Stitch

Manny approved Cleo for AA-06 on 2026-08-21. Handling 7 and Traction 7 supported her precision-craft, stable-line identity while moderate remaining values kept her distinct from the drift and heavyweight specialists. Manny retired Cleo from production on 2026-08-26 while preserving her complete approved package for possible restoration. AA-06 was released for reassignment and is now assigned to Dragon Queen. See `docs/CHARACTER-ARCHIVE.md` for Cleo's durable archive and restoration gate.
