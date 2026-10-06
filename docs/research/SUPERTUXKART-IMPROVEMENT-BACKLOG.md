# SuperTuxKart-Informed Improvement Backlog

**Status:** Research-derived candidate backlog. No item in this document is an approved product requirement or implementation authorization unless a later PRD amendment, ADR, implementation plan, or explicit owner approval says otherwise.

**Created:** 2026-10-05  
**Reference:** Comparative review of the SuperTuxKart source archive supplied by Manny against the current Manaconda's Minigame Mayhem repository and active kart-racer work.

## Governance

This document records only actionable changes, amendments, improvements, or systems worth considering. It intentionally excludes general observations and features that are merely interesting.

The authority order remains:

1. `docs/PRD.md` defines approved product requirements.
2. `docs/DECISIONS.md` records approved architectural/product decisions.
3. Approved implementation plans define bounded execution.
4. `docs/IMPLEMENTATION-STATUS.md` records what actually exists and where approved work stopped.
5. This research backlog proposes candidates only.

A backlog item may not silently override the PRD, accepted gameplay, current slice ordering, approved Neon Grid contracts, or owner acceptance evidence.

When an item is selected:
- obtain Manny approval where the item changes architecture, gameplay, balance, acceptance criteria, or scope;
- amend the PRD when the approved product requirement materially changes;
- add an ADR when the approved architecture/technical contract needs durable governance;
- create a bounded implementation plan with exact acceptance criteria;
- update `docs/TESTING.md` only when a real new validation contract exists;
- update `docs/IMPLEMENTATION-STATUS.md` only when implementation is authorized or completed.

No SuperTuxKart source code or assets are authorized for direct incorporation. These entries are independent implementation ideas derived from comparative study.

## Status index

| ID | Candidate | Priority | Approval state | Suggested timing | Governance if selected |
| --- | --- | --- | --- | --- | --- |
| STK-001 | Formal minigame lifecycle boundary | P0 | Candidate | Before Minigame 2 | ADR; PRD amendment if architecture baseline changes materially |
| STK-002 | Decompose `KartTimeTrial` into race subsystems | P0 | Candidate | After current gated Neon Grid work / before major racer expansion | ADR |
| STK-003 | Track-module registry and authored navigation metadata | P0 | Candidate | Before Circuit 03 or equivalent | ADR |
| STK-004 | AI skill profiles based on judgment rather than hidden capability | P1 | Candidate | Future kart AI quality pass | PRD amendment if difficulty behavior materially changes |
| STK-005 | AI bounded decision commitment / hysteresis | P1 | Candidate | Future kart AI quality pass | Plan/ADR as needed |
| STK-006 | Presentation-only kart dynamics layer | P1 | Candidate | Future feel/polish pass | Owner visual approval; no physics change |
| STK-007 | Authored steering-response curves | P2 | Candidate experiment | Future handling experiment | PRD amendment if adopted |
| STK-008 | Environment distance/perceptual LOD | P1 | Selected for docs review | Unified render-workload governance initiative | Proposed ADR + testing contract; implementation not authorized |
| STK-009 | Explicit race render-pipeline ownership | P1 | Selected for docs review | Unified render-workload governance initiative | Proposed ADR; implementation not authorized |
| STK-010 | Feature/pass-level render budgets and diagnostics | P1 | Selected for docs review | First phase of unified render-workload governance | Proposed testing contract; instrumentation must precede optimization |
| STK-011 | Shared cosmetic VFX budget coordinator | P2 | Candidate | When simultaneous VFX load justifies it | ADR/testing contract |
| STK-012 | Surface feedback profiles | P2 | Candidate | Future audio/VFX refinement | Plan; PRD only if physics changes |
| STK-013 | Split global race HUD from player HUD | P1 | Candidate | Before local multiplayer or major HUD expansion | ADR |
| STK-014 | Responsive HUD/input layout context | P1 | Candidate | Future mobile/accessibility pass | ADR/testing contract |
| STK-015 | Typed screen registry and app-shell decomposition | P0 | Candidate | Before Minigame 2 | ADR |
| STK-016 | Modularize game-specific CSS and lazy-loaded presentation | P0 | Candidate | Before Minigame 2 | ADR/build validation |

---

## Render-workload governance selection — 2026-10-05

Manny approved a documentation-only design phase that unifies STK-008, STK-009 and STK-010, conditional on two hard requirements: **instrumentation-first sequencing** and a specified **executable enforcement mechanism**. The draft is `docs/superpowers/plans/2026-10-05-render-workload-governance.md`. This selection does not authorize runtime implementation, does not change the PRD, and does not make the proposed ADR/testing contract active. Those governance changes remain subject to owner document review.

## Architecture and multi-minigame modularity

### STK-001 — Formal minigame lifecycle boundary

**Recommendation:** Add a small hub-level contract for independently loadable minigames instead of allowing kart concepts to become the application's global architecture.

**Problem to solve:** The current product has one mature game type, so hub and kart responsibilities can still blur. Future non-racing minigames should not inherit assumptions about tracks, racers, laps, items, cameras, or kart physics.

**Proposed implementation shape:**
- introduce a hub-owned `MinigameModule` / `GameSession` contract;
- support preload/load, start, pause/resume, result return, and deterministic disposal;
- keep kart-only services behind the kart module;
- support Vite dynamic import/code splitting so opening the hub does not require loading the complete kart runtime;
- keep shared settings, audio policy, input/accessibility policy, and navigation at the hub boundary only where genuinely cross-game.

**Scope boundaries:** No gameplay, physics, item, race-rule, roster, or track changes are implied. Do not redesign current kart internals merely to manufacture generic abstractions.

**Dependencies:** Stable understanding of current hub lifecycle and cleanup.

**Acceptance evidence if implemented:**
- kart game launches and returns to the hub through the new contract with identical behavior;
- repeat enter/exit cycles leave no owned listeners, animation loops, physics state, audio voices, WebGL resources, or stale UI;
- a minimal fixture minigame can mount/unmount without importing kart-specific modules;
- production build demonstrates separate lazy-load chunks where practical.

**Governance:** Manny approval required before material architecture change. Record an ADR. Amend the PRD if the approved application architecture baseline materially changes.

---

### STK-002 — Decompose `KartTimeTrial` into bounded race subsystems

**Recommendation:** Reduce `src/game/KartTimeTrial.ts` from a large cross-domain orchestrator into a thin race-session coordinator.

**Problem to solve:** The class currently touches physics, AI, items, VFX, cameras, tracks, characters, audio, diagnostics, standings, UI snapshots, and rendering. Continued feature growth increases coupling and regression surface.

**Proposed implementation shape:** Evolve toward explicit owners such as:
- `KartSimulation`: fixed-step world, kart controllers, collisions;
- `RaceRules`: checkpoints, progress, laps, finish authority, standings;
- `RaceAI`: driver intent, hazard awareness, item policy;
- `RacePresentation`: track scene, kart visuals, cameras, VFX, post effects;
- `RaceAudio`: race-local SFX/music state;
- `RaceHudAdapter`: read-only transformation from race state to HUD state.

`KartTimeTrial` or its successor should coordinate lifecycle and sequencing rather than implement each domain.

**Scope boundaries:** Behavior-preserving refactor first. Do not combine this work with physics tuning, AI rebalance, track redesign, item changes, or visual restyling.

**Dependencies:** STK-001 is helpful but not mandatory.

**Acceptance evidence if implemented:**
- full pre-refactor test suite remains green;
- deterministic race-state comparison for representative scenarios;
- no changed physics telemetry or race outcomes unless separately authorized;
- bundle/chunk composition is measured before and after;
- lifecycle cleanup remains bounded across repeated sessions.

**Governance:** ADR recommended because subsystem ownership becomes a durable architecture contract.

---

### STK-003 — Track-module registry and authored navigation metadata

**Recommendation:** Replace growing track-type checks in generic systems with registered track-owned factories and metadata.

**Problem to solve:** Current code includes explicit Circuit Alpha/Neon Grid selection and Neon Grid-specific decisions inside generic AI. That is manageable with two circuits but will scale poorly.

**Proposed implementation shape:** Define a kart-local `TrackModule` or equivalent descriptor capable of supplying:
- track topology;
- scene factory;
- collider factory;
- minimap/topology metadata;
- surface policy;
- AI navigation hints;
- shortcut descriptors and legal route metadata;
- authored corner/braking hints where geometry alone is insufficient;
- track-specific visual/performance policy.

Generic `AiDriver` should ask the track for navigational information instead of branching on `track.id === 'neon-grid'` or named shortcut IDs.

**Scope boundaries:** Preserve all accepted Circuit Alpha and Neon Grid geometry, shortcut behavior, timing, balance, repaired faces, checkpoint authority, and AI rates during the architectural migration.

**Dependencies:** Should follow current Neon Grid approval gates rather than destabilize active Task 8 work.

**Acceptance evidence if implemented:**
- no generic AI source contains behavior branches for a concrete track identity except explicitly approved escape hatches;
- Circuit Alpha and Neon Grid route decisions remain behaviorally equivalent in locked regression cases;
- a fixture third track can register topology/scene/collision/navigation without editing generic selection logic;
- full validation and track-specific native/render tests pass.

**Governance:** ADR recommended. PRD amendment only if the approved architecture requirement materially changes.

---

### STK-015 — Typed screen registry and app-shell decomposition

**Recommendation:** Move Title, Hub, Character Select, Race, Results, and future minigame screens behind a typed navigation/screen contract.

**Problem to solve:** `mountAppShell.ts` owns increasing amounts of rendering, routing, audio unlock, selection state, results behavior, race mounting, and mobile hookup. Additional minigames would multiply this responsibility.

**Proposed implementation shape:**
- define screen IDs and typed enter/exit payloads;
- separate screen rendering/controller modules;
- make hub navigation own transitions, not minigame internals;
- let the kart module register kart-specific screens or a contained kart flow;
- preserve shared accessibility/navigation semantics.

**Scope boundaries:** No Route Night redesign and no change to approved Title → Hub → Character Select → Race → Results behavior.

**Dependencies:** Coordinates strongly with STK-001.

**Acceptance evidence if implemented:**
- existing end-to-end flow and mobile portrait/landscape acceptance routes remain unchanged;
- back/return behavior is deterministic;
- screen teardown removes owned listeners/resources;
- a fixture non-kart screen can be registered without modifying kart flow code.

**Governance:** ADR recommended.

---

### STK-016 — Modularize game-specific CSS and lazy-loaded presentation

**Recommendation:** Split the growing global stylesheet into shared shell/theme layers and game-specific style modules.

**Problem to solve:** `src/style.css` is already large enough that unrelated future minigame styling could create accidental coupling, naming collisions, and unavoidable download cost.

**Proposed implementation shape:**
- shared shell/accessibility/settings primitives;
- shared Route Night or product design tokens where genuinely global;
- kart-specific Character Select, race HUD, Results, and touch-control styles;
- future minigame styles owned by their modules;
- lazy-load game-specific CSS with its minigame where Vite supports a clean output.

**Scope boundaries:** Pixel-preserving refactor first. Do not restyle approved screens while modularizing ownership.

**Dependencies:** STK-001/STK-015 make boundaries clearer.

**Acceptance evidence if implemented:**
- visual regression/manual owner checks show no approved-screen changes;
- mobile portrait and landscape remain intact;
- no selector leakage from a fixture minigame into kart screens;
- bundle output shows kart-specific presentation can be isolated from initial hub load where practical.

**Governance:** ADR recommended because style ownership becomes part of the multi-game architecture.

---

## Kart AI and gameplay feel

### STK-004 — AI skill profiles based on judgment rather than hidden kart capability

**Recommendation:** Add a formal AI skill model that varies decision quality while keeping each character's physical capabilities authoritative.

**Problem to solve:** Difficulty feels more believable when weaker AI reacts later, sees less, commits poorly, or takes worse risks instead of receiving arbitrary hidden top-speed changes.

**Proposed implementation shape:** A data-driven `AiSkillProfile` may govern:
- decision/reaction latency;
- hazard and opportunity perception distance;
- steering correction precision;
- lane/target commitment;
- shortcut risk tolerance;
- drift decision quality;
- overtaking aggressiveness;
- item targeting and defensive timing.

Keep character max speed, acceleration, weight, handling, traction, and other approved kart capabilities authoritative.

**Scope boundaries:** Do not increase the existing catch-up allowance or introduce hidden physical advantages without separate approval.

**Dependencies:** STK-003 makes track-aware risk decisions cleaner.

**Acceptance evidence if implemented:**
- identical character profiles retain identical physical limits across player/AI;
- controlled simulations demonstrate measurable decision-quality differences;
- harder AI wins through better choices, not ungoverned speed;
- race distributions and edge cases are simulated before owner playtest.

**Governance:** Product approval and likely PRD amendment required if this changes the formal difficulty contract.

---

### STK-005 — Bounded AI decision commitment / hysteresis

**Recommendation:** Make AI retain chosen lanes, targets, item-box goals, overtakes, or shortcut choices for bounded intervals unless a defined abort condition occurs.

**Problem to solve:** Re-evaluating a nearly tied choice every frame can produce oscillation or visibly indecisive steering.

**Proposed implementation shape:**
- explicit decision IDs/state;
- minimum commitment duration or progress window;
- meaningful improvement threshold before switching;
- safety aborts for hazards, invalid geometry, blocked routes, or race-state changes;
- separate commitment windows by decision type.

**Scope boundaries:** Do not change approved shortcut attempt rates, shortcut balance, or item distribution merely by adding commitment state.

**Dependencies:** Compatible with current AI architecture; benefits from STK-003 and STK-004.

**Acceptance evidence if implemented:**
- synthetic near-tie scenarios no longer oscillate;
- AI still aborts genuinely unsafe or invalid choices;
- route-selection probabilities remain statistically consistent where rates are contractually fixed;
- no new grass cutting or illegal-route behavior.

**Governance:** Bounded engineering improvement unless observed gameplay materially changes, in which case owner approval is required.

---

### STK-006 — Presentation-only kart dynamics layer

**Recommendation:** Add controlled visual body motion that is independent from the authoritative Rapier/controller transform.

**Problem to solve:** A predictable arcade physics model can still look more energetic and weighty through visual motion without changing handling.

**Proposed implementation shape:** Consider read-only presentation offsets for:
- drift body yaw relative to travel;
- speed-dependent lean/roll;
- acceleration/braking pitch;
- landing compression/rebound;
- collision recoil;
- smoother post-drift realignment;
- camera framing responses coordinated with those states.

Apply offsets to visual descendants rather than the authoritative physics body.

**Scope boundaries:** No physical collision shape, velocity, drift thresholds, boost timing, or stat formulas may change in this item.

**Dependencies:** Existing kart-model hierarchy must expose a clean presentation root.

**Acceptance evidence if implemented:**
- physics telemetry is byte/number-equivalent in locked scenarios with the visual layer on/off;
- visual offsets are bounded and reset on recovery, pause, finish, restart, and disposal;
- driver sprites/steering wheel remain visually registered;
- owner visual approval on desktop/mobile.

**Governance:** Owner visual approval required. ADR optional if a durable visual-transform contract is introduced.

---

### STK-007 — Authored steering-response curves

**Recommendation:** Experiment with data-driven steering response over speed and input transition instead of relying only on a fixed damping/linear high-speed reduction.

**Problem to solve:** Low-speed responsiveness, medium-speed cornering, high-speed stability, and drift steering can require different response shapes.

**Proposed implementation shape:** Prototype curves/parameters for:
- steering authority versus forward speed;
- time to reach requested steer;
- time to return toward neutral;
- optional drift-specific response.

Keep the existing character Handling stat semantically authoritative.

**Scope boundaries:** Experiment only until explicitly approved. Do not alter production handling while current track acceptance depends on the existing controller.

**Dependencies:** Requires robust telemetry and representative Circuit Alpha/Neon Grid test cases.

**Acceptance evidence if adopted:**
- handling differentiation remains monotonic and understandable;
- time-trial, hairpin, high-speed straight, off-road and drift test matrices pass;
- AI and player use compatible physical steering rules unless separately justified;
- owner feel approval across keyboard and mobile.

**Governance:** Product/PRD approval required before replacing the accepted steering contract.

---

## Rendering, visuals, and performance

### STK-008 — Environment distance/perceptual LOD

**Recommendation:** Add track-scenery LOD that reduces cost based on distance and perceptual importance, not only global graphics quality.

**Problem to solve:** Instancing and low triangle count do not control shader cost, transparent overdraw, shadow cost, post-processing participation, or unnecessary distant detail.

**Proposed implementation shape:**
- near: full authored geometry/effects;
- mid: reduced instance density/material complexity;
- far: silhouette/emissive simplification and reduced transparency;
- very far: backdrop/impostor or culled representation where appropriate;
- per-quality distance multipliers;
- track-owned LOD policy, not hard-coded Neon Grid rules in the renderer.

Prioritize expensive transparent atmospheric layers and shadow/bloom participants based on measurement.

**Scope boundaries:** LOD must not remove gameplay tells, shortcut readability, collision geometry, navigation cues, checkpoint visibility, or accepted route landmarks.

**Dependencies:** STK-010 measurement should guide where LOD actually matters.

**Acceptance evidence if implemented:**
- objective before/after frame-time evidence on the same camera routes;
- no collision or gameplay-state differences;
- visual-owner approval of transitions;
- no visible popping at normal race speeds beyond approved tolerance;
- low/medium/high behavior is deterministic and documented.

**Governance:** ADR plus `docs/TESTING.md` update when the LOD validation contract is real.

---

### STK-009 — Explicit race render-pipeline ownership

**Recommendation:** Create one race-local owner for the order and lifecycle of scene, shadow, selective bloom, transparency, motion blur, and final presentation passes.

**Problem to solve:** As post effects accumulate, small visual features can multiply scene work or render-target cost without a single place showing the total pipeline.

**Proposed implementation shape:**
- named render stages;
- explicit render-target ownership and resolution;
- explicit scene/layer eligibility per pass;
- centralized resize, pause, visibility, quality and disposal behavior;
- diagnostics hooks per stage.

**Scope boundaries:** Initial migration should preserve the accepted appearance of bloom, blur, shadows, VFX, kart rendering, and HUD.

**Dependencies:** Coordinate with existing `RaceBloom`, `RaceMotionBlur`, `RaceShadows`, and renderer counters.

**Acceptance evidence if implemented:**
- visual parity at locked camera scenes;
- identical or improved frame time;
- all render targets/material overrides restored correctly after each pass;
- no GPU resource growth over repeated sessions;
- per-stage diagnostics available in development/testing routes.

**Governance:** ADR recommended.

---

### STK-010 — Feature/pass-level render budgets and diagnostics

**Recommendation:** Extend diagnostics so visual-cost decisions can be made by subsystem rather than by total triangles/draw calls alone.

**Problem to solve:** A scene can sit comfortably below a triangle target yet run poorly because of fullscreen pixels, transparency, shader complexity, shadow passes, bloom extraction/composite, motion blur, or repeated scene rendering.

**Proposed implementation shape:** Measure or derive, where practical:
- frame CPU and GPU/proxy timing by pass;
- draw calls and triangles by stage/feature;
- render-target dimensions and pixels processed;
- transparent object/instance counts and approximate screen coverage;
- shadow casters;
- bloom-eligible objects/materials;
- animated shader/material counts;
- quality-tier deltas.

Support controlled A/B feature toggles for diagnostic builds so a track feature can be measured against the same camera/run with one subsystem disabled.

**Scope boundaries:** Diagnostics must not silently weaken acceptance thresholds. A diagnostic branch may disable features only for paired measurement, never as evidence that the full candidate passes.

**Dependencies:** Can begin independently; becomes cleaner with STK-009.

**Acceptance evidence if implemented:**
- a known test scene reports stable pass/feature deltas across repeated captures;
- diagnostics distinguish a triangle-bound change from a post/transparent-bound change;
- capture metadata records quality, viewport, DPR, effect toggles, commit and route;
- testing documentation defines how evidence may and may not be interpreted.

**Near-term relevance:** Use this methodology for Task 8 performance diagnosis before indiscriminately reducing geometry merely because FPS is low.

**Governance:** Update `docs/TESTING.md` when adopted as an official evidence method.

---

### STK-011 — Shared cosmetic VFX budget coordinator

**Recommendation:** Add a race-local quality budget capable of degrading nonessential cosmetic density when simultaneous VFX demand becomes high.

**Problem to solve:** Each individual VFX pool may be bounded while their combined worst case still exceeds the desired visual-performance envelope.

**Proposed implementation shape:**
- register cosmetic effect categories and priority;
- preserve gameplay-critical tells first;
- reduce spawn density, lifetime, or expensive secondary layers for low-priority cosmetics under load;
- never alter authoritative gameplay state;
- make quality-tier baseline capacities explicit;
- prefer deterministic budget decisions where tests require repeatability.

**Scope boundaries:** Item warnings, hit confirmation, shortcut state tells, recovery cues, and other gameplay-critical information cannot disappear due to cosmetic budgeting.

**Dependencies:** STK-010 should first show a real combined-VFX need.

**Acceptance evidence if implemented:**
- worst-case VFX soak remains within capacity/performance targets;
- gameplay state and race outcomes are invariant with budget pressure;
- critical cues remain legible;
- pools/resources return to baseline after expiry/disposal.

**Governance:** ADR/testing contract if implemented.

---

### STK-012 — Surface feedback profiles

**Recommendation:** Separate surface audiovisual identity from physical surface behavior through data-driven feedback profiles.

**Problem to solve:** Richer track materials should be able to change tire sound, particles, spray/debris, and contact treatment without embedding presentation rules in `KartController`.

**Proposed implementation shape:** A surface feedback descriptor may select:
- tire loop/crossfade;
- skid sound;
- wheel particle family;
- spray/dust/debris parameters;
- contact sparks/debris;
- optional visual wetness cues.

Physics continues to read the existing authoritative surface type/tuning contract.

**Scope boundaries:** No traction, speed, acceleration, or minimum-playable-speed changes unless separately approved.

**Dependencies:** Existing tire/dirt/grass audio and wheel-dust systems provide a starting point.

**Acceptance evidence if implemented:**
- switching feedback profiles cannot change kart velocities or controller state;
- audio transitions are bounded and pause/disposal-safe;
- particle resources remain within quality caps;
- owner visual/audio approval on representative surfaces.

**Governance:** Plan only if purely presentational; PRD approval required if coupled to new physics behavior.

---

## UI, HUD, and input

### STK-013 — Split global race HUD from player-local HUD

**Recommendation:** Separate race-wide information from player-specific telemetry and status.

**Problem to solve:** One HUD update surface currently mixes concepts that would scale differently for local multiplayer, spectating, alternate layouts, or multiple minigame presentations.

**Proposed implementation shape:**

Global race layer:
- countdown/race phase;
- lap/final-lap events;
- standings/race result events;
- course/minimap state where appropriate.

Player-local layer:
- speed;
- held item;
- incoming warnings;
- temporary status effects;
- recovery prompt;
- touch controls.

Use read-only snapshots and allow lower-frequency updates for information that does not need frame-level refresh.

**Scope boundaries:** Preserve approved Route Night HUD composition during the architectural split.

**Dependencies:** STK-002 may expose cleaner state sources but is not mandatory.

**Acceptance evidence if implemented:**
- current desktop/mobile HUD remains visually equivalent;
- race-global and player-local state can be tested independently;
- no stale HUD state across finish/restart/hub return;
- a fixture second-player viewport can consume a player HUD without duplicating global race state.

**Governance:** ADR recommended.

---

### STK-014 — Responsive HUD/input layout context

**Recommendation:** Formalize layout inputs instead of relying primarily on global CSS breakpoints and ad hoc orientation rules.

**Problem to solve:** More game types, safe-area devices, accessibility scaling, and alternate control layouts will make responsive behavior increasingly difficult to govern.

**Proposed implementation shape:** Introduce a read-only layout context carrying:
- viewport size;
- orientation;
- safe-area insets;
- mobile/desktop interaction mode;
- control scale;
- handedness/layout preference if later approved;
- UI density/accessibility scale.

Kart HUD/touch controls consume the context while shared shell navigation uses the same normalized viewport information.

**Scope boundaries:** No new control scheme or accessibility setting is implied until separately approved.

**Dependencies:** Works well with STK-013 and STK-015.

**Acceptance evidence if implemented:**
- existing accepted desktop, portrait, and landscape layouts reproduce correctly;
- safe-area fixture tests prevent control/HUD clipping;
- resize/orientation changes do not leak listeners or retain stale measurements;
- touch targets remain within approved dimensions.

**Governance:** ADR and testing update if the layout context becomes a cross-game contract.

---

## Selection guidance

### P0 candidates: protect future development before more game types arrive

The highest architectural leverage comes from:
- STK-001 formal minigame boundary;
- STK-002 race-session decomposition;
- STK-003 track-module registry;
- STK-015 typed screen registry;
- STK-016 modular/lazy game-specific presentation.

These should not interrupt current approval-gated Neon Grid work. Their value increases sharply before a second minigame or several additional circuits are added.

### P1 candidates: improve the racer without redefining it

The strongest quality/performance opportunities are:
- STK-004 AI skill profiles;
- STK-005 AI decision commitment;
- STK-006 presentation-only kart dynamics;
- STK-008 environment LOD;
- STK-009 explicit render pipeline;
- STK-010 feature/pass diagnostics;
- STK-013 HUD separation;
- STK-014 responsive layout context.

### P2 candidates: implement only after a demonstrated need or approved experiment

- STK-007 steering-response curves;
- STK-011 VFX budget coordinator;
- STK-012 surface feedback profiles.

## Promotion workflow

For any selected ID:

1. Re-read the current PRD, implementation status, decisions, testing rules, active branches/PRs, and relevant acceptance evidence.
2. Verify that the candidate is still needed against the live repository state.
3. Define the exact problem and current baseline measurements.
4. Determine whether owner approval, PRD amendment, ADR, or only an implementation plan is required.
5. Record the approved scope and explicit non-goals.
6. Implement in a bounded branch with failing-first tests where applicable.
7. Run the repository validation gates plus candidate-specific evidence.
8. Obtain required owner visual/feel acceptance.
9. Update the authoritative documents only with facts established by the completed work.
10. Commit/merge through the existing repository workflow.

This backlog should remain compact. When an item is fully adopted and governed elsewhere, change its index state to `Promoted` and link the authoritative PRD/ADR/plan rather than duplicating the final contract here.
