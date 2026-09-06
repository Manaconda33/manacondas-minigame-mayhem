**MANACONDA'S**

**MINIGAME MAYHEM**

**Product Requirements Document**

High-Fidelity HTML5 Kart Racer Vertical Slice + Modular Mini-Game Hub

Version 1.1 - Final approved baseline; working implementation amendment 2.5

August 16, 2026

Implementation starting point: Slice 0 - Repository & Project Bootstrap

Durable source of truth: GitHub repository

## Approved implementation amendment 1.2 - Manual confirmation deployments

Approved August 16, 2026. Beginning with Slice 1, every slice checkpoint must include a testable deployment produced from the checkpoint source through a GitHub deployment environment, with GitHub Pages as the default implementation. A slice may not be presented for manual confirmation without the live deployment URL. Automated validation and CI remain required; the deployment adds product-owner manual confirmation rather than replacing other evidence. The repository must record the deployed commit, workflow result, URL, known manual-test limitations, and whether the next slice remains locked pending approval. This amendment changes delivery governance only and does not expand the gameplay scope assigned to any slice.

## Approved implementation amendment 1.3 - Manual-test course length and Slice 1 corrections

Approved August 16, 2026 after product-owner manual confirmation of Slice 1. Circuit Alpha’s implementation target is shortened from approximately 1.45 km to approximately 0.90 km so repeated manual validation remains practical while preserving twelve checkpoints, three laps, all named track sections, and representative handling tests. Target average lap time becomes approximately 30-45 seconds. Dirt must be an optional partial-width lane or a ramp/jump feature rather than covering the entire road. Sustained grass and dirt penalties must retain a playable forward-speed floor while remaining measurably slower than asphalt. Forward controls must read A/Left as visual left and D/Right as visual right from the chase camera. The track scene must provide a deliberate rendered sky/horizon rather than an unlit black upper viewport. These changes supersede conflicting track-length and full-width dirt details below.

## Approved implementation amendment 1.4 - Mobile race controls and slice-order correction

Approved August 16, 2026 with product-owner authorization to add mobile controls, then corrected after product-owner review of the PRD sequence. The original delivery order in sections 35.4-35.6 remains authoritative: Slice 3 is Character Selection & Avatar Ingestion; Slice 4 is AI Waypoint Navigation & Eight-Racer Grid; Slice 5 is Items; final presentation and hardening remain Slice 6. AI/grid work was executed early because repository status incorrectly labeled it Slice 3. That completed work is retained and recorded as an out-of-order Slice 4 checkpoint rather than renumbering the PRD. Touch controls are an approved addition to Slice 4 and must render only when the browser reports a coarse primary pointer with no hover capability. They must support steering, acceleration, brake/reverse, drift, rear view, and recovery without removing keyboard controls. Desktop/fine-pointer sessions must not show the touch overlay. Because the item system is not implemented until Slice 5, AI-004 item use remains dependency-blocked. This amendment supersedes the earlier statement that mobile touch controls are outside the vertical slice but does not supersede the original slice numbering.

## Approved implementation amendment 1.5 - Runtime character asset delivery contract

Approved August 16, 2026 after Lavi’s production integration was manually confirmed on mobile. Every character package delivered through `public/assets/characters/` must be validated in the deployed build, not only in source. Production Pages checkout must materialize Git LFS objects, pass `git lfs fsck`, and fail the build if a required GLB is an LFS pointer or lacks its expected binary signature. Stable public asset paths must use a base-aware controlled revision query or a changed filename whenever their bytes change, so browser and edge caches cannot reuse a previously bad response. The runtime must preload and select the approved rear, steer-left, steer-right, hit, and victory driver frames while retaining a visible rear-frame fallback. Each kart must be visually inspected from chase and rear cameras; if its authored forward axis disagrees with the runtime, a documented visual-root transform may correct it without altering physics, checkpoints, input, or camera coordinates. This amendment adds repeatable delivery and acceptance evidence to Slice 3; it does not approve any unapproved avatar identity or begin the next slice.

## Approved implementation amendment 1.6 - Front driver art, character AI grid, and visible victory pose

Approved August 20, 2026. Every production character package must add `front.png`, a 512 x 512 transparent front-facing seated driver frame used when the race camera faces the front of that character's kart. The existing five approved frames remain valid; front art is separately approval-gated and may not be inferred, mirrored, or substituted as approved production art. Each race randomly selects seven unique AI identities from the manifest after excluding the player's identity. No character may appear more than once in one race. An AI identity with production assets must load its approved kart and rear driver frame; unfinished identities retain the governed fallback kart and monogram treatment. The finish presentation must leave the live race view and player victory pose visible instead of covering the central play area. These requirements refine Slice 3 asset delivery, the already-completed-early Slice 4 grid, and Slice 6 results presentation without changing the eight-racer count.

## Approved implementation amendment 1.7 - Weight-driven kart-impact speed retention

Approved August 30, 2026. Meaningful kart-to-kart impacts must reduce positive forward speed using the governed Weight and closing-speed curve in section 14.1. Weight must create a measurable retention advantage without making any racer collision-immune: severe-impact retention remains bounded, and Weight 10 must still lose meaningful forward speed. Lateral knockback remains governed separately by relative mass. This amendment applies to player and AI contacts without changing roster statistics, Speed ceilings, Acceleration, surface response, wall response, or items.

## Approved implementation amendment 1.8 - AI Speed-stat authority

Approved August 31, 2026. Every AI racer must use its selected character's Speed-derived kart maximum as its clear-straight target. AI pace profiles may change corner-speed judgment, braking, lane choice, and consistency, but may not replace the character's straight-line ceiling with an unrelated absolute speed. A leading AI receives no hidden top-speed reduction. A trailing AI may receive only the bounded top-speed allowance defined in section 21.6. This amendment changes AI speed targeting without changing roster statistics or player performance.

## Approved implementation amendment 1.9 - Complete and shared driver-sprite states

Approved August 31, 2026. Every active production character must provide the full transparent 512 x 512 driver package: rear, front, steer-left, steer-right, hit, and victory. Transparent openings inside props such as steering wheels must contain alpha rather than baked white or checkerboard pixels. Player and AI racers must use one state-selection contract: steering selects the matching turn frame, a kart impact temporarily selects hit, finishing selects victory, and the player rear-view camera selects front for every visible production driver because the camera is facing the fronts of their karts. Each character may define governed neutral and front placement overrides so the driver remains behind the modeled steering controls and seated in the cockpit. Existing identity, kart, stat, and approved-art locks remain unchanged; new or repaired raster derivatives require visual review before publication.

## Approved implementation amendment 2.0 - Camera-facing action-state parity

Approved September 1, 2026. Every active production character must extend the driver package with `front-steer-left.png`, `front-steer-right.png`, `front-hit.png`, and `front-victory.png`. When the camera faces the front of a kart, the shared player/AI selector must preserve the simulated action and choose the matching front-facing frame rather than a rear-oriented action frame or neutral front substitution. Left/right names continue to describe the kart's commanded turn direction, not the viewer's screen side. During the one-character-at-a-time rollout, a missing front-facing action frame must fall back to that character's approved neutral `front.png`; it must never show a rear-facing action from the front camera or blank the driver. New raster derivatives remain outside runtime paths until Manny approves the character's front-facing action package. Existing chase art, neutral front art, identity, kart, stats, physics, camera geometry, and steering-control ownership remain unchanged.

Rollout checkpoint, September 2, 2026: Manny approved the Lavi and Toph camera-facing steering, hit, and victory candidates. Their eight approved files may enter runtime integration under new controlled revisions while publication, deployment, and live acceptance remain separately gated. Lula and Accu remain on the governed neutral-front fallback until their own candidate packages are approved.

Live review checkpoint, September 2, 2026: Toph's deployed front-action package passed. Lavi's art and state behavior passed, but the shared `[0, 0.45, -0.12]` front placement left the camera-facing layer too low behind Potato's body. PR #70 deployed Lavi's character-specific `[0, 0.9, -0.12]` front placement without changing asset bytes or Toph. Lavi requires another live cockpit check. Lula and Accu remain gated.

Live acceptance checkpoint, September 3, 2026: Manny approved Lavi's corrected deployed placement and closed the Lavi/Toph batch. Both drivers now pass steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation in the live build. Manny also authorized Lula and Accu as the final two-driver front-action batch. Their candidate frames remain outside runtime paths until visual approval; publication, deployment, and live acceptance remain separate gates.

Final candidate checkpoint, September 3, 2026: Manny approved Lula's four camera-facing action candidates, then approved Accu's four-frame set. The eight files may enter local runtime integration under controlled revisions `lula-runtime-20260903-3` and `accu-runtime-20260903-3`. Publishing, deployment, and live acceptance remain separate gates.

Deployment checkpoint, September 3, 2026: Manny authorized publication after local validation. PR #73 merged the eight approved frames at `735da4015bca6f9610f6a358672804f4c73b35f9`; main run `33708310011` passed validation and GitHub Pages deployment. The live bundle references both controlled revisions and all eight action paths, and every deployed PNG hash matches the approved source. Product-owner desktop/mobile live acceptance is the remaining gate.

Final rollout acceptance, September 3, 2026: Manny approved Lula and Accu after testing the deployed camera-facing action package. Both drivers pass steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation on desktop/mobile. All nine active production drivers now have live-accepted front-facing action states. The rollout is complete; new asset or gameplay work requires a separately approved PRD scope.

## Approved implementation amendment 2.1 - Product and repository rebrand

Approved September 3, 2026. The public product name is `Manaconda's Minigame Mayhem`. The title screen must show that exact name without a presentation line above it. The former AA monogram is replaced by an original minigame mark showing multiple arcade paths or tokens, and the same mark supplies the browser icon. User-facing placeholders must not expose the internal `aa-##` compatibility keys.

The canonical public repository is `Manaconda33/manacondas-minigame-mayhem`, and the GitHub Pages base path is `/manacondas-minigame-mayhem/`. Active product copy, page metadata, package identity, repository guidance, current PRD records, asset-builder labels, and public links must use the new brand. Dated history snapshots may retain superseded names and URLs as historical evidence, but they are not current authority. A build-time brand check must reject the former display name or repository slug outside preserved history. This amendment also authorizes publishing Jennifer's approved AA-12 package in the same release. Desktop and mobile live acceptance remain required after deployment.

## Approved implementation amendment 2.2 - Slice 5 item-system implementation contract

Approved September 5, 2026 before Slice 5 gameplay implementation. The fifteen-item roster, Sections 15-17 probability matrix, item state machines, ITEM-001 through ITEM-008, AI-004, and existing item values remain unchanged unless this amendment explicitly fills a previously unspecified behavior. The approved implementation and exit contract is recorded in `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` and is normative for Slice 5.

Circuit Alpha uses four rows of eight shared item boxes at approximately 9%, 34%, 62%, and 89% of lap progress. A valid collection locks the weighted selection immediately using collection-time race state, presents roulette for approximately 0.85 seconds, and deactivates that box globally for approximately 4.5 seconds. A racer with an occupied one-slot inventory does not consume a box. Mobile/coarse-pointer gameplay adds a dedicated ITEM control; holding Brake/Reverse while using ITEM requests backward deployment where supported, matching the keyboard S/Down plus Shift/E contract.

Hyper-Drive Rocket remains restricted to positions 6-8 and additionally requires at least 45 meters of negative race-progress gap to the leader at collection time. Invalid prerequisites remove the item before weighted selection and eligible weights are renormalized. Initial governed boost-cap targets are Nitro Surge 1.18x, Nitro Overdrive pulse 1.15x, Hyper-Drive Rocket 1.25x while on legal spline autopilot, and the existing Prismatic Invincibility 1.12x. These are configuration values subject to later evidence-based balance approval, not silent implementation tuning.

Item effects use the shared PRD spin categories unless otherwise specified in the approved design: standard approximately 0.85 seconds, heavy explosive approximately 1.20 seconds, Blaze short spin approximately 0.55 seconds, Frost momentum/handling impairment without spin, and Slick 360-degree presentation with approximately 60% speed retention. Newly spawned projectiles/hazards receive a short owner-immunity/arming window; after arming, normal collisions may include later self-hit from a returning/ricocheted object or lingering owned hazard.

Slice 5 architecture separates item definitions/selection, inventory and lifecycle, item boxes, projectiles, hazards, generic racer effects, targeting, Rocket spline autopilot, AI item policy, and HUD integration. Item balance remains configuration-driven. Slice 5 may use original procedural/simple models, icons, VFX, and placeholder audio sufficient for gameplay readability; final production audio/VFX polish remains Slice 6. Slice 5 cannot close until the approved exit checklist passes, including at least 100,000 seeded item selections per rank, interaction/counter tests, cleanup/object-count soak, desktop/mobile live deployment checks, and explicit product-owner acceptance.

## Approved implementation amendment 2.3 - Nitro Surge live balance tuning

Approved September 6, 2026 after the first deterministic deployed Nitro Surge acceptance pass. Product-owner testing confirmed the item activation, consumption, inventory release, HUD/VFX tell, off-road override, pause safety, expiry cleanup, desktop/mobile input, deterministic test harness, and normal-selector isolation. Acceleration was functional but not sufficiently pronounced, and the approximately 1.2-second active window felt too short to provide a satisfying or useful boost.

Nitro Surge duration is therefore changed from approximately 1.2 seconds to approximately **2.4 seconds**, and its acceleration multiplier is changed from **1.35x** to **1.50x**. The approved **1.18x normal speed cap remains unchanged**. The off-road speed-penalty override, Traction-governed off-road acceleration, one-charge inventory behavior, pause-safe timer, VFX lifetime coupling, and clean restoration remain unchanged. These values supersede conflicting Nitro Surge duration/acceleration values in the baseline PRD and Slice 5 design while leaving every other item unchanged. This amendment was explicitly approved by Manny before implementation.

## Approved implementation amendment 2.4 - Kinetic Disc guardrails and perspective-correct spinout

Approved September 6, 2026 before the Kinetic Disc implementation checkpoint. The Ricochet Kinetic Disc retains its existing governed projectile values: forward/backward unguided launch, approximately 28 m/s plus limited inherited velocity, approximately 0.32 m radius, nine-second maximum lifetime, up to three wall ricochets using the contact normal, standard approximately 0.85-second spinout on racer impact, and destruction on racer hit.

Circuit Alpha adds continuous visible guardrails outside the legal road/shoulder racing corridor. These rails are a shared collision boundary for Kinetic Disc ricochets and racers. Racer contact with a guardrail produces bounded inward reflection and speed loss plus a brief existing hit-art reaction; guardrail contact alone does not apply the Kinetic Disc standard spinout. The guardrails do not change the circuit centerline, checkpoints, lap validation, item-box rows, or approved dirt/boost/ramp surfaces.

A Kinetic Disc racer hit applies one visible full-yaw spin over the governed standard spinout window. Player controls are suppressed while that spinout is active and planar momentum decays without teleporting the kart. To make the spin readable, the chase/rear camera holds the player's pre-impact travel heading for the spinout rather than orbiting with the rotating kart. The kart's actual orientation still drives 2D driver-facing selection every frame, so the existing approved `hit` and `front-hit` assets switch according to whether the camera currently sees the driver's rear or front as the kart rotates. The same facing rule applies to AI racers visible from either player camera. No new character raster art is authorized or required by this amendment.

## Approved implementation amendment 2.5 - Kinetic Disc catch-up speed

Approved September 6, 2026 after PR #104 live testing. Raise Ricochet Kinetic Disc base speed from approximately **28 m/s to 42 m/s** so it can close on full-speed racers. Preserve the existing bounded inherited velocity: add 0.35 times the owner's planar velocity after clamping that velocity to 8 m/s, yielding approximately 44.8 m/s for a straight forward shot from a fast-moving kart. This supersedes the Kinetic speed in amendment 2.4 and prior baseline references.

Retain the existing angle-of-incidence reflection, with projectile speed preserved across ricochets. A shallow shot on a curved section may hit the same rail again; there is no forced opposite-rail trajectory, minimum inward angle, or homing. The 0.32 m radius, nine-second lifetime, three-ricochet limit, owner arming/self-hit rules, one-charge successful-spawn consumption, 40-projectile cap, and 0.85-second spinout/camera/sprite contract remain unchanged. Manny passes the other PR #104 live checks; the correction needs focused catch-up and ricochet-expectation acceptance following approved publication. No other item or Slice 6 work is authorized.

# Contents

- 1\. Document Control

- 2\. Executive Summary & Technical Architecture

- 3\. Product Definition

- 4\. Problem and Opportunity

- 5\. Users, Roles, and Authority

- 6\. Goals and Success Measures

- 7\. Non-Goals

- 8\. Product Principles

- 9\. Scope

- 10\. User Experience & Screen Wireflows

- 11\. Character & Avatar Pipeline Specification

- 12\. Game Mechanics & Systems Design

- 13\. Drift & Mini-Turbo

- 14\. Collision Response

- 15\. Item System & Distribution Logic

- 16\. Position-Based Probability Matrix

- 17\. Item State Machines

- 18\. Track Blueprint & Level Design

- 19\. Checkpoints and Lap Validation

- 20\. Track Spline & Waypoint System

- 21\. AI Behavior System

- 22\. Camera System

- 23\. Rendering, VFX & AAA Web Polish

- 24\. Audio Architecture

- 25\. Data Model and Sources of Truth

- 26\. Functional Requirements

- 27\. Design and Content Requirements

- 28\. Privacy, Security, Rights & Access

- 29\. Reliability, Operations & Recovery

- 30\. Analytics & Evidence

- 31\. Repository, GitHub & Cowork Continuity

- 32\. Dependencies

- 33\. Risks and Mitigations

- 34\. Decision Log

- 35\. Phased Implementation Roadmap

- 36\. Test Strategy

- 37\. Acceptance Criteria & Quality Checklist

- 38\. Launch & Rollback Plan

- 39\. Final Definition of Done

- 40\. Open Questions / Deferred Decisions

- 41\. Implementation Readiness Decision

- Appendix A. Slice 0 Cowork Start Prompt

# 1. Document Control

| **Field**                  | **Value**                                   |
|----------------------------|---------------------------------------------|
| Product                    | Manaconda's Minigame Mayhem                 |
| Product Type               | Modular HTML5 browser-game hub              |
| Vertical Slice             | 3D Kart Racer with 2D hybrid avatar drivers |
| PRD Version                | 1.1 - Final                                 |
| Date                       | August 16, 2026                             |
| Product Approver           | Manny                                       |
| Status                     | Final; ready to begin Slice 0               |
| Current Slice              | Slice 0 - Repository & Project Bootstrap    |
| Approval Artifact          | This Word document                          |
| Repository Working PRD     | docs/PRD.md                                 |
| Target Platform            | Desktop web browser                         |
| Input Baseline             | Keyboard                                    |
| Rendering Baseline         | WebGL2                                      |
| Progressive Rendering Path | WebGPU where supported and validated        |
| Network Requirement        | None for core gameplay                      |
| Accounts                   | None in v1                                  |
| Public Deployment          | Approval-gated                              |
| Scope Changes              | Approval-gated                              |

## 1.1 Governance

This PRD is the approved requirements baseline for implementation. The Word document is the approval artifact. Once Slice 0 creates the GitHub repository, the semantically equivalent Markdown copy at docs/PRD.md becomes the canonical working PRD for implementation and must remain aligned with this approved baseline.

Material changes to any of the following require an explicit PRD revision and product-owner approval:

- vertical-slice scope

- six-character-stat model

- item mechanics or balance model

- number of racers

- lap rules

- input contract

- supported browser baseline

- asset rights or avatar representation

- acceptance criteria

- public deployment

- production hosting

- paid dependencies

- telemetry/data collection

Small, reversible implementation decisions inside the approved requirements may be made during implementation without reopening product scope. All material decisions and deviations must be recorded in docs/DECISIONS.md and reflected in docs/IMPLEMENTATION-STATUS.md.

# 2. Executive Summary & Technical Architecture

## 2.1 Product Definition

Manaconda's Minigame Mayhem is a modular browser-based arcade platform with one complete launch-quality vertical slice: an eight-racer, three-lap 3D kart race featuring twelve selectable illustrated drivers inside stylized 3D karts.

The first release must prove both that the hub can support multiple future games without rebuilding its shell, and that browser technology can deliver a polished, responsive, visually rich kart-racing experience at a sustained target of 60 FPS.

The Kart Racer is not a menu prototype or physics demonstration. It must be playable from title screen through character selection, a full three-lap race, AI competition, items, finish ranking, and results.

## 2.2 Product Outcome

A desktop user must be able to complete the following uninterrupted product path:

Open game -\> activate audio -\> choose Kart Racer -\> select one of 12 avatars -\> race seven AI opponents for three valid laps -\> use drift boosts and items -\> finish the race -\> see results -\> race again or return to the hub.

No developer console, debug command, asset substitution, or manual state manipulation may be required to complete that path.

## 2.3 Architecture Decision

### Application

- TypeScript

- HTML5

- CSS3

- Vite build pipeline

- ES modules

- DOM-based menus and HUD

- Canvas/WebGL game viewport

- No mandatory UI framework

### 3D Engine

Three.js is the recommended baseline because it provides a mature browser ecosystem, direct rendering control, strong glTF support, established post-processing options, stable WebGL2 behavior, and a progressive WebGPU path without forcing a heavyweight application framework.

### Physics

Rapier 3D using its WASM implementation. Rapier owns rigid-body collision, broadphase/narrowphase, kart colliders, item colliders, trigger volumes, raycasts, and impulse resolution. Kart driving behavior remains predominantly custom arcade vehicle logic rather than physically simulated automotive wheel joints.

### Audio

- Howler.js for asset loading, music, UI sounds, and mixer control

- Web Audio API for low-latency engine loops and spatial emitters

- PannerNode for spatialized item and collision sounds

- Gain nodes for channel buses

### Application State

BOOT  
↓  
TITLE  
↓  
MAIN_MENU  
↓  
CHARACTER_SELECT  
↓  
RACE_LOADING  
↓  
RACE_COUNTDOWN  
↓  
RACING  
↓  
RACE_FINISH  
↓  
RESULTS  
  
Overlay substates: SETTINGS / CONTROLS / PAUSED

Overlay states may not corrupt the underlying screen state.

## 2.4 Runtime Architecture

Browser  
\|  
+-- App Shell  
\| +-- Screen State Machine  
\| +-- Menu/UI Controller  
\| +-- Settings  
\| +-- Asset Loader  
\|  
+-- Game Runtime  
\| +-- Fixed-Step Simulation  
\| +-- Racer Manager  
\| +-- Kart Controller  
\| +-- AI Controller  
\| +-- Race Director  
\| +-- Track System  
\| +-- Item System  
\| +-- Collision/Hazard System  
\| +-- Camera System  
\|  
+-- Three.js: Scene / Track / Karts / Avatar Sprites / VFX / Post Processing  
+-- Rapier: Kart Bodies / Track Collision / Trigger Volumes / Items  
+-- UI/HUD: Position / Lap / Item / Mini-map / Speed / Turbo / Notifications  
+-- Audio: Music / Engines / Items / Environment / UI

## 2.5 Simulation Loop

const SIM_STEP = 1 / 60;  
const MAX_STEPS_PER_FRAME = 3;

Runtime sequence:

- sample player input

- accumulate frame time

- run zero to three fixed simulation steps

- update Rapier

- resolve race systems

- interpolate visual transforms

- render frame

- update non-simulation UI

Large tab/background delays must not cause unlimited simulation catch-up. When the game tab loses focus, simulation should pause or throttle, gameplay audio should attenuate, and normal fixed-step timing must resume cleanly on return.

## 2.6 60 FPS Performance Budget

| **System**                   | **Budget**          |
|------------------------------|---------------------|
| Main rendering submission    | \<= 5.5 ms CPU      |
| Physics                      | \<= 2.5 ms          |
| AI + race systems            | \<= 1.5 ms          |
| Item/VFX systems             | \<= 1.0 ms          |
| HUD/UI                       | \<= 1.0 ms          |
| Audio/update                 | \<= 0.5 ms          |
| Garbage collection/amortized | \<= 0.5 ms          |
| CPU headroom                 | \>= 4.17 ms         |
| GPU frame                    | \<= 12 ms preferred |
| Total target                 | \<= 16.67 ms        |

Scene budgets:

- Visible triangles: target \<= 750,000

- Draw calls: target \<= 250

- Shadow-casting dynamic objects: \<= 12

- Simultaneous gameplay particles: \<= 2,500

- Simultaneous active physics projectiles: \<= 40

- Simultaneous audio voices: \<= 32

- Runtime JS heap after race load: target \<= 250 MB

- Approximate GPU texture residency: target \<= 256 MB on Medium preset

Download targets: app shell \<= 6 MB compressed before title; first playable Kart Racer content package target \<= 45 MB compressed; secondary avatar/kart assets may load lazily; audio uses compressed browser-supported formats with fallback.

## 2.7 Repository as Durable Source of Truth

The GitHub repository, not a chat or Cowork session, is the durable project record. Code, configuration, the working PRD, decision history, test evidence, implementation status, and session handoff information must be stored in the repository so another Cowork session can resume accurately without relying on conversational memory.

The repository must be self-describing: a fresh collaborator or Cowork session should be able to determine what the product is, which slice is active, what is done, what is blocked, what decisions were made, and which command set proves repository health.

# 3. Product Definition

## 3.1 Hub

The hub is a reusable launcher and shared presentation layer. The first version contains the Title Screen, Main Menu, Kart Racer card, future-game placeholder cards, Settings, Controls, and shared audio controls. Future game cards must be visibly unavailable rather than interactive dead ends.

## 3.2 Kart Racer

- 12 selectable drivers

- standardized kart framework

- six-stat character balancing

- 1 player + 7 AI racers

- three laps

- Circuit Alpha

- drift and three mini-turbo tiers

- off-road surfaces

- boost pads and ramps

- stunt boost

- position tracking

- items

- race HUD and mini-map

- finish logic and results/podium

# 4. Problem and Opportunity

Browser mini-games commonly fail in one of two ways: technically lightweight experiences lack the visual and mechanical feedback expected from modern arcade games, or visually ambitious prototypes lack a maintainable structure for expanding beyond one experience.

Manaconda's Minigame Mayhem should demonstrate that its character roster can support a polished interactive experience without requiring users to install a native executable. The Kart Racer is suited to this proof because it exercises 3D rendering, avatar integration, real-time physics, AI, audio, HUD, animation, input, camera systems, effects, and gameplay balance. If the architecture succeeds for this slice, the surrounding collection can host materially different minigames while preserving menus, settings, loading, input routing, content management, and overall visual identity.

# 5. Users, Roles, and Authority

## 5.1 Player

Can launch the hub, change local settings, select a character, play the Kart Racer, pause/resume, view results, and replay. Cannot modify roster definitions, item probabilities, game assets, or race rules through the production UI.

## 5.2 Content Maintainer

Development-time role represented through files rather than a public interface. Can update character manifest, driver assets, kart visual configuration, audio files, and content labels. The vertical slice does not require an in-browser content-management system.

## 5.3 Product Owner

Approves roster identity, avatar likenesses, final visual direction, material game-balance changes, public deployment, new scope, production hosting, and changes to acceptance criteria.

# 6. Goals and Success Measures

## G-01 Complete Playable Loop

A user can complete the entire flow from Title to Results without developer intervention.

## G-02 Responsive Driving

Keyboard input must produce predictable, arcade-responsive kart behavior. Player input should be captured within one simulation step and visibly affect motion normally within two rendered frames.

## G-03 Competitive Race

Seven AI racers navigate the entire course, complete valid laps, use items, overtake, recover from collisions, and produce plausible race variation.

## G-04 Character Differentiation

All 12 roster slots have measurably different performance profiles without creating an objectively dominant character.

## G-05 Browser Performance

Medium-quality target is 60 FPS at 1920x1080 on baseline desktop hardware with eight racers active. Median \>= 60 FPS; 95th-percentile frame time \<= 18.3 ms; no sustained sequence of \>50 ms frames under normal race load.

## G-06 Extensible Hub

Adding a future mini-game does not require rewriting Title Screen, Main Menu, global Settings, audio settings, or the game registration mechanism.

## G-07 Asset Resilience

Missing avatar art cannot make the race unusable.

## G-08 Legally Distinct Presentation

Items, names, silhouettes, icons, VFX, audio, menus, environments, and characters use original presentation for Manaconda's Minigame Mayhem rather than reproducing protected franchise presentation.

# 7. Non-Goals

The first vertical slice does not require:

- network multiplayer

- online accounts

- matchmaking

- mobile touch controls

- gamepad support

- track editor

- custom kart builder

- unlock economy

- downloadable content

- user-generated avatar uploads

- online leaderboard

- monetization

- battle mode

- multiple tracks

- campaign mode

- persistent progression

- live-service backend

- deterministic peer-to-peer simulation

- real automotive simulation

- VR

The architecture should not deliberately prevent later additions, but these features may not expand v1 scope.

# 8. Product Principles

- Arcade readability over simulation realism.

- Fast feedback over complex control combinations.

- Characters feel different without creating trap choices.

- The player should understand why something happened.

- Catch-up systems should create tension, not obvious cheating.

- The race must remain recoverable after mistakes.

- Visual polish may degrade gracefully to preserve frame rate.

- Gameplay systems outrank decorative effects.

- Configuration should own balance constants rather than scattering numbers through code.

- Missing non-critical content must fail gracefully.

# 9. Scope

## 9.1 In Scope

### Hub

- Title

- Main Menu

- Kart Racer launch

- future game cards

- Settings

- Controls overlay

- audio unlock

### Racer

- character selection

- 12-character manifest

- kart previews

- Circuit Alpha

- three laps

- player kart

- seven AI

- drift

- mini-turbo

- items

- HUD

- mini-map

- finish results

### Technical

- asset loader

- quality settings

- localStorage preferences

- graphics fallback

- audio mixer

- race-state machine

- deterministic progress system

- performance instrumentation

## 9.2 Out of Scope

See Section 7, Non-Goals.

# 10. User Experience & Screen Wireflows

## 10.1 Primary Flow

Load SPA -\> Title Screen -\> Audio Unlock -\> Main Menu Hub  
  
Main Menu -\> Kart Racer -\> Character Select -\> Race Load -\> Starting Grid -\> 3-2-1-Go -\> Race -\> Finish -\> Results  
  
Race -\> Esc/P -\> Pause -\> Resume / Restart / Quit to Hub  
Results -\> Race Again / Character Select / Hub

## 10.2 Title Screen

Must contain the Manaconda's Minigame Mayhem logo/title, an original minigame icon, animated environmental or splash background, PRESS START / CLICK TO PLAY, audio state, and a subtle intro-theme loop after browser audio activation. The first interaction must satisfy browser audio-unlock requirements. No presentation line appears above the product title.

+--------------------------------------------------------------+  
\| MANACONDA'S \|
\| MINIGAME MAYHEM \|
\| \|  
\| \[ animated background scene \] \|  
\| \|  
\| PRESS START / CLICK TO PLAY \|  
\| Audio On/Off \|  
+--------------------------------------------------------------+

## 10.3 Main Menu Hub

+------------------------------------------------------------------+  
\| MANACONDA'S MINIGAME MAYHEM SETTINGS \|
\| \|  
\| SELECT A GAME \|  
\| \[ KART RACER / PLAY \] \[ FUTURE GAME / COMING SOON \] \[ FUTURE \] \|  
\| \|  
\| \[CONTROLS\] \[AUDIO\] \|  
+------------------------------------------------------------------+

Future-game cards must be visually readable, display COMING SOON, reject activation, and never route to empty screens.

## 10.4 Character Select Grid

+--------------------------------------------------------------------+  
\| \<- HUB CHOOSE DRIVER \|  
\| \|  
\| \[A1\]\[A2\]\[A3\]\[A4\] \[ 3D KART PREVIEW \] \|  
\| \[A5\]\[A6\]\[A7\]\[A8\] \|  
\| \[A9\]\[A10\]\[A11\]\[A12\] DRIVER NAME / WEIGHT CLASS \|  
\| \|  
\| SPEED \#######--- 7 ACCEL \######---- 6 \|  
\| WEIGHT \#####----- 5 HANDLING \#######--- 7 \|  
\| MINI-TURBO \#####----- 5 TRACTION \######---- 6 \|  
\| \[ START RACE \] \|  
+--------------------------------------------------------------------+

Selection must update name, portrait, weight class, stat display, kart preview, and accent treatment. Preview kart rotates slowly while idle.

## 10.5 Race HUD

+---------------------------------------------------------------------+  
\| POSITION 3rd / 8 LAP 2 / 3 \|  
\| \[ MINI-MAP \] \|  
\| \|  
\| 3D RACE VIEW \|  
\| \|  
\| \[PORTRAIT\] PLAYER / TURBO \[ITEM\] 94 km/h \|  
+---------------------------------------------------------------------+

HUD must show current rank, racer count, current lap, item slot, active item count for multi-charge items, mini-map, player portrait, speed, drift-charge feedback, final-lap announcement, and wrong-way warning.

The mini-map uses the same ordered Circuit Alpha samples that drive race progress. It renders the complete closed course and all eight live racer positions. Every racer marker must use a pixel-rendered head crop from that driver's approved 2D portrait. The player marker must be larger and use a gold outline; opponents use a dark outline so overlapping heads remain separable. The map must remain non-interactive and must not obscure track direction, countdown, warnings, driving controls, or the finish presentation. Desktop placement is below the lap HUD on the left. Mobile placement remains in the upper-left HUD column at a reduced size, clear of the centered rear/reset controls and bottom driving controls. The mini-map leaves the interface when the compact finish state begins so the victory pose remains visible.

## 10.6 Pause Menu

+----------------------------+  
\| PAUSED \|  
\| RESUME \|  
\| RESTART RACE \|  
\| SETTINGS \|  
\| CONTROLS \|  
\| QUIT TO HUB \|  
+----------------------------+

Pause freezes player, AI, projectiles, timers, lap timer, and item roulette. Music attenuates rather than restarting.

## 10.7 Results

+-----------------------------------------------------+  
\| RACE COMPLETE \|  
\| 2nd 1st 3rd \|  
\| \|  
\| 1. PLAYER 03:08.442 \|  
\| 2. DRIVER 2 +00:01.304 \|  
\| 3. DRIVER 6 +00:04.208 \|  
\| ... all eight racers \|  
\| \[RACE AGAIN\] \[CHANGE DRIVER\] \[RETURN TO HUB\] \|  
+-----------------------------------------------------+

Results must include all eight racers and finishing times.

The results panel must be docked away from the center of the live race view, remain compact enough to preserve a clear view of the player's kart and victory pose, and keep all eight standings reachable by scrolling when required.

# 11. Character & Avatar Pipeline Specification

## 11.1 Roster Philosophy

All 12 characters receive a six-stat budget of 36 total stat points. Stat range is integer 1-10. Attributes are Speed, Acceleration, Weight, Handling, Mini-Turbo, and Traction. Actual community identities are content inputs. Gameplay balance uses stable roster IDs so names and art can be mapped later without changing physics.

## 11.2 Twelve-Slot Balance Table

| **Slot** | **Archetype**       | **Class**     | **Spd** | **Acc** | **Wgt** | **Hdl** | **Turbo** | **Trac** | **Total** |
|----------|---------------------|---------------|---------|---------|---------|---------|-----------|----------|-----------|
| AA-01    | Feather Sprinter    | Featherweight | 6       | 9       | 2       | 8       | 7         | 4        | 36        |
| AA-02    | Feather Technician  | Featherweight | 5       | 8       | 2       | 9       | 8         | 4        | 36        |
| AA-03    | Feather Dirt Ace    | Featherweight | 5       | 8       | 3       | 7       | 6         | 7        | 36        |
| AA-04    | Balanced Racer      | Medium        | 7       | 7       | 5       | 7       | 5         | 5        | 36        |
| AA-05    | Drift Specialist    | Medium        | 6       | 7       | 5       | 6       | 9         | 3        | 36        |
| AA-06    | Grip Specialist     | Medium        | 6       | 6       | 5       | 7       | 5         | 7        | 36        |
| AA-07    | High-Speed Cruiser  | Cruiser       | 8       | 6       | 7       | 5       | 4         | 6        | 36        |
| AA-08    | Turbo Bruiser       | Cruiser       | 7       | 5       | 7       | 4       | 8         | 5        | 36        |
| AA-09    | Technical Cruiser   | Cruiser       | 7       | 6       | 6       | 6       | 6         | 5        | 36        |
| AA-10    | Straight-Line Heavy | Heavyweight   | 10      | 4       | 9       | 3       | 4         | 6        | 36        |
| AA-11    | Collision Tank      | Heavyweight   | 8       | 4       | 10      | 3       | 5         | 6        | 36        |
| AA-12    | All-Surface Heavy   | Heavyweight   | 8       | 5       | 8       | 4       | 4         | 7        | 36        |

No production character name should be assigned to a balance profile solely because of appearance or personality. Roster mapping is a content and balance decision.

## 11.3 Stat Formulas

### Speed

vMax = 22.0 + (0.85 x Speed) m/s

Range: Speed 1 = 22.85 m/s; Speed 10 = 30.50 m/s. Approximate 82-110 km/h. Boosts may temporarily exceed this cap.

### Acceleration

aLaunch = 4.0 + (0.55 x Acceleration) m/s^2  
  
speedRatio = currentSpeed / vMax  
driveAccel = aLaunch x clamp(1 - 0.72 x speedRatio^2, 0.22, 1.0)  
  
recoveryMultiplier = 0.80 + 0.04 x Acceleration

### Weight

massKg = 105 + (11 x Weight)  
  
dominance = selfMass / (selfMass + otherMass)

Range: Weight 1 = 116 kg; Weight 10 = 215 kg. Relative dominance distributes arcade collision impulse. Weight also affects airborne momentum, impact stability, and outward drift inertia. It does not directly increase engine power.

### Handling

steerMax = 0.30 + (0.018 x Handling) radians  
steerHalfLife = 0.20 - (0.009 x Handling) seconds  
speedSteerScale = lerp(1.0, 0.62, clamp(speed / vMax, 0, 1))

Higher Handling provides larger available steering angle, faster response, and tighter turning radius while retaining high-speed stability.

### Traction

roadGrip = 1.02 + 0.018 x (Traction - 5.5)  
offRoadRetention = 0.38 + (0.045 x Traction)  
offRoadAccel = 0.55 + (0.035 x Traction)

Off-road speed retention ranges from 42.5% to 83%; off-road acceleration ranges from 58.5% to 90%.

### Mini-Turbo

turboN = (MiniTurbo - 1) / 9  
  
Blue threshold = 0.95 - 0.18 x turboN seconds  
Orange threshold = 1.90 - 0.35 x turboN seconds  
Purple threshold = 3.15 - 0.60 x turboN seconds  
  
Blue duration = 0.55 + 0.15 x turboN  
Orange duration = 0.90 + 0.25 x turboN  
Purple duration = 1.35 + 0.40 x turboN  
  
potency = 0.92 + 0.16 x turboN

| **Tier** | **Low Turbo** | **High Turbo** | **Speed-cap Multiplier** |
|----------|---------------|----------------|--------------------------|
| Blue     | 0.95 s        | 0.77 s         | 1.08                     |
| Orange   | 1.90 s        | 1.55 s         | 1.12                     |
| Purple   | 3.15 s        | 2.55 s         | 1.16                     |

## 11.4 UI Portrait Specification

256 x 256 px  
PNG  
sRGB  
transparent background  
straight alpha

Used on Character Select, HUD, ranking badge, Results, and podium. Portrait must retain readable facial/detail silhouette when displayed at approximately 48 px.

## 11.5 In-Game Driver Sprites

512 x 512 px minimum per frame  
PNG  
transparent  
sRGB  
  
Required: rear.png / front.png / steer-left.png / steer-right.png / hit.png / victory.png / front-steer-left.png / front-steer-right.png / front-hit.png / front-victory.png

Rear is the default seated driving frame. Left and right trigger on hard steering or corresponding drift. Hit triggers for spinout, explosive hit, or major collision stun. Victory triggers after finish, on podium, and optionally for a major Purple Burst boost.

Front is the seated view used only when the camera faces the front of the kart. It must preserve character identity, cockpit placement, steering-hand continuity, and kart occlusion. Front art requires its own product-owner approval and may not be created by mirroring another frame.

Front-steer-left, front-steer-right, front-hit, and front-victory preserve the corresponding simulated action when the camera faces the front of the kart. They must keep the approved neutral-front seated footprint, camera-facing anatomy, cockpit occlusion, and character-specific steering-control ownership. They require product-owner approval and may not be inferred by mirroring rear-oriented art. Until a character's action package is approved, the neutral front frame is the only allowed camera-facing fallback.

## 11.6 Sprite Atlas

2048 x 1024 atlas  
512 x 512 cells  
  
\[ REAR \]\[ LEFT \]\[ RIGHT \]\[ HIT \]  
\[ VICTORY \]\[ EMPTY \]\[ EMPTY \]\[ EMPTY \]

- 2-4 px RGB edge dilation under transparent boundaries

- mipmaps enabled

- anisotropy as supported

- alphaTest approximately 0.02

- depth-write disabled for sprite plane

- depth-test enabled

## 11.7 Cockpit Rendering

Driver sprite is rendered on a kart-mounted plane parented to DriverMount. It follows kart position, pitch, and roll; faces the chase camera within a constrained yaw range; does not behave as a globally free billboard; and remains visually seated inside the cockpit. The kart body must occlude the lower sprite.

## 11.8 Rear-View Camera

C activates a backward-looking camera. While the camera faces the front of the player's kart, the runtime uses the approved front-facing driver frame. Before that frame is approved, the runtime must use a clearly recorded provisional fallback without presenting it as final art. Camera placement should keep the driver seated in the cockpit and preserve the kart silhouette.

## 11.9 3D Kart Specification

Preferred source format: glTF 2.0 / GLB.

KartRoot  
+-- Chassis  
+-- AccentMesh  
+-- SteeringWheel  
+-- Wheel_FL  
+-- Wheel_FR  
+-- Wheel_RL  
+-- Wheel_RR  
+-- Exhaust_L  
+-- Exhaust_R  
+-- DriverMount  
+-- ItemMountRear  
+-- ItemMountForward

Triangle targets: LOD0 \<= 25,000; LOD1 \<= 12,000; LOD2 \<= 5,000. Maximum principal materials: chassis, accent, tire, emissive detail. Accent color is controlled by character config.

## 11.10 Procedural Placeholder System

If avatar or kart content is unavailable, generate a stable palette from character ID, load the standard fallback kart, apply deterministic body/accent colors, create a CanvasTexture monogram, mount the badge on the kart, generate a portrait tile from initials, and use a neutral driver silhouette. Missing optional art produces a warning, not a fatal error.

## 11.11 Folder Layout

/public  
/assets  
/characters  
/aa-01  
portrait.png  
/driver  
rear.png  
steer-left.png  
steer-right.png  
hit.png  
victory.png  
kart.glb  
... /aa-12  
/karts  
fallback-kart.glb  
/track  
circuit-alpha.glb  
circuit-alpha-collision.glb  
circuit-alpha-nav.json  
circuit-alpha-minimap.svg  
/items  
/models  
/icons  
/textures  
/audio  
/music  
/engines  
/items  
/environment  
/ui  
  
/src  
/app  
/game  
/ai /camera /characters /items /physics /race /track /vfx  
/ui  
/audio  
/config  
/schemas

## 11.12 Character Manifest

{  
"schemaVersion": "1.0.0",  
"characters": \[  
{  
"id": "aa-01",  
"name": "Avatar Name",  
"weightClass": "featherweight",  
"stats": {  
"speed": 6,  
"acceleration": 9,  
"weight": 2,  
"handling": 8,  
"miniTurbo": 7,  
"traction": 4  
},  
"portraitUrl": "/assets/characters/aa-01/portrait.png",  
"kartModelUrl": "/assets/characters/aa-01/kart.glb",  
"kart": {  
"primaryColor": "#334455",  
"accentColor": "#FFCC44"  
},  
"driverSprites": {  
"rear": "/assets/characters/aa-01/driver/rear.png",  
"steerLeft": "/assets/characters/aa-01/driver/steer-left.png",  
"steerRight": "/assets/characters/aa-01/driver/steer-right.png",  
"hit": "/assets/characters/aa-01/driver/hit.png",  
"victory": "/assets/characters/aa-01/driver/victory.png"  
}  
}  
\]  
}

Validation: id is required, stable, lowercase, and unique; name is required and 1-32 display characters; weightClass is one of featherweight, medium, cruiser, heavyweight; stats are integer 1-10; total stat points must equal 36 unless an approved balance revision changes the global budget. Missing content URLs invoke fallback behavior.

# 12. Game Mechanics & Systems Design

## 12.1 Input Mapping

| **Action**          | **Primary** | **Alternate / Modifier**  |
|---------------------|-------------|---------------------------|
| Accelerate          | W           | Up Arrow                  |
| Brake / Reverse     | S           | Down Arrow                |
| Steer Left          | A           | Left Arrow                |
| Steer Right         | D           | Right Arrow               |
| Hop / Drift         | Space       | \-                        |
| Use Item            | Left Shift  | E                         |
| Rear View           | C           | \-                        |
| Pause               | Escape      | P                         |
| Backward Item Throw | Use Item    | Hold S / Down while using |

Input uses KeyboardEvent.code rather than localized character output where possible. Browser-default actions conflicting with gameplay must be prevented while the game viewport has focus.

## 12.2 Arcade Kart Controller

Each kart uses one Rapier dynamic rigid body, compound chassis collider, ground raycasts, custom engine force, custom lateral grip, speed-sensitive steering, and custom drift state. No physically modeled gearbox is required.

## 12.3 Ground Detection

Four downward raycasts approximate wheel contact. A kart is grounded when at least two ground rays hit. Suspension correction uses spring/damper forces. Recommended ride height is approximately 0.45 m. Kart local up direction should align gradually toward the averaged ground normal to support ramps and banked corners.

## 12.4 Normal Steering

desiredSteer = inputX x steerMax x speedSteerScale

Steering is smoothed using exponential decay rather than direct snapping. Yaw response should maintain an arcade feel rather than tire-level simulation.

## 12.5 Lateral Grip

vLat = dot(velocity, kartRight)  
FGrip = -vLat x gripCoefficient

Grip coefficient depends on surface, Traction, drift state, and temporary item effects.

# 13. Drift & Mini-Turbo

## 13.1 Drift Entry

grounded  
speed \>= 6.5 m/s  
Space newly pressed  
abs(steerInput) \>= 0.25 within entry window  
not stunned  
not autopilot

Space initiates a brief hop of approximately 0.12 s. Drift direction locks from steering input.

## 13.2 Drift State

During drift, steering remains possible; rear lateral grip decreases; kart yaw response increases; visual slip angle increases; lateral momentum is preserved; and sparks charge. Target slip-angle operating window is 8-24 degrees.

quality = clamp(abs(slipAngle) / targetSlipAngle, 0.65, 1.35)  
charge += dt x quality

Mini-Turbo modifies charge thresholds and resulting boost, not player input precision.

## 13.3 Tier Feedback

| **Tier**     | **Visual**                                  | **Audio**                    |
|--------------|---------------------------------------------|------------------------------|
| Blue Spark   | Blue wheel sparks                           | First escalating charge tone |
| Orange Flame | Orange flame/spark mix; stronger wheel glow | Second charge confirmation   |
| Purple Burst | Violet/purple energy; high-energy particles | High-pitch charge lock       |

HUD may echo the charge state but the player must not need to read text during a corner.

## 13.4 Drift Release

if charge \>= purpleThreshold -\> Purple boost  
else if charge \>= orangeThreshold -\> Orange boost  
else if charge \>= blueThreshold -\> Blue boost  
else -\> no boost  
  
charge resets after release

## 13.5 Drift Cancellation

Drift cancels on spinout, severe collision, airborne state \>0.6 s, speed \<3 m/s, player release, or autopilot activation.

# 14. Collision Response

## 14.1 Kart-to-Kart

Collision response combines Rapier contact with an arcade lateral impulse. Relative weight affects displacement. A lighter racer colliding side-on with a heavy racer receives a greater lateral velocity change. Repeated continuous contacts must use an impulse cooldown to prevent vibration.

An actual impact also reduces each racer's positive forward speed. The loss must be Weight-driven, measurable, and bounded so Weight 10 retains a clear advantage without becoming collision-immune:

```text
if closingSpeed < 0.75 m/s: retention = 1.0
impactSeverity = clamp(closingSpeed / 16, 0.25, 1.0)
weightN = clamp((Weight - 1) / 9, 0, 1)
fullImpactLoss = lerp(0.31, 0.16, weightN)
opponentPressure = clamp(1 + 0.015 * (otherWeight - Weight), 0.86, 1.14)
retention = clamp(1 - fullImpactLoss * impactSeverity * opponentPressure, 0.65, 0.96)
```

Retention applies only to positive velocity along the kart's forward axis; lateral velocity and collision knockback remain intact. At maximum impact severity, equal Weight 1 racers retain 69% speed and equal Weight 10 racers retain 84%. Weight 10 versus Weight 1 retains approximately 86%, while Weight 1 versus Weight 10 retains 65%. Thus every racer risks meaningful speed loss, while heavier racers recover position more reliably after contact.

## 14.2 Wall Collision

| **Severity**      | **Response**                                          |
|-------------------|-------------------------------------------------------|
| Low-energy scrape | Speed loss \<=8%; sparks; no stun                     |
| Medium collision  | Speed loss 15-30%; yaw disturbance                    |
| Severe head-on    | Speed loss up to 45%; brief recovery steering penalty |

Wall collisions should not repeatedly re-trigger every frame.

## 14.3 Spinout

Standard spin duration is approximately 0.85 s; heavy explosive spin approximately 1.20 s. During spin, steering is mostly disabled, throttle is ineffective or strongly reduced, velocity decays, and the hit sprite is active. Acceleration governs subsequent recovery.

# 15. Item System & Distribution Logic

## 15.1 Item Box

Item boxes are track triggers with a rendered pickup object. On valid collection: item box deactivates, racer enters roulette state, a weighted item is selected, item appears in the slot, and the box begins respawn. Respawn target is 4.5 s; roulette presentation approximately 0.85 s. Selection may be determined immediately while animation continues visually.

## 15.2 Inventory

The vertical slice uses one active inventory slot. Multi-shot items report remaining charges in the same slot. A racer carrying an item cannot collect a second item.

## 15.3 Ricochet Kinetic Disc

Forward or backward unguided projectile. Speed ~42 m/s plus limited inherited velocity under amendment 2.5; radius ~0.32 m; lifetime 9 s; up to 3 wall bounces. On hit: standard spinout and projectile destruction. Wall reflection uses the contact normal. Visual identity is a luminous rotating kinetic disc with metallic-energy ricochet audio.

## 15.4 Homing Seeker Drone

Guided attack against the nearest valid racer ahead according to race-progress distance. Arming delay 0.5 s; maximum lifetime 12 s; maximum turn rate ~120 deg/s. Speed dynamically closes distance without teleporting. Target receives escalating warning cues.

## 15.5 Apex Orbital Missile

Rare anti-leader item. Launches vertically, travels in non-colliding sky state, locks the leader, warns, enters terminal dive, then creates an AoE blast. Approximate warning 2.5 s; blast radius 5.5 m; leader spin 1.2 s. Countered by Prismatic Invincibility or a precisely timed Shockwave in terminal state. One active globally; minimum 18 s global spawn interval.

## 15.6 Timed Blast Orb

Dropped or thrown forward/backward. Fuse 3.0 s; blast radius 4.0 m. May detonate early on a sufficiently strong direct kart impact.

## 15.7 Blaze Orbs

Five-charge rapid-fire offensive item with minimum shot cadence 0.55 s. Fast straight projectiles with limited lifetime; each successful hit causes a short spinout.

## 15.8 Frost Orbs

Three charges. A hit reduces momentum rather than fully freezing: speed retention approximately 55%, handling penalty approximately 20%, duration approximately 1.2 s. Repeated hits refresh duration but do not stack multiplicatively.

## 15.9 Rebounding Arc Blade

Three charges. Launches forward, follows a curved outbound path, reaches maximum range, and returns to the owner. A rival may be hit once outbound and once on return; continuous overlap does not repeatedly damage.

## 15.10 Kinetic Arc Hammers

Five charges with a 0.35 s minimum cadence. Uses ballistic trajectories. Hammers bounce once after terrain impact and expire shortly afterward.

## 15.11 Hazard Oil / Slick Trap

Dropped behind the racer. Lifetime 12 s; trigger radius approximately 1.1 m. Contact causes a 360-degree spin and speed reduction. Per-racer active cap is two slicks.

## 15.12 Acoustic Shockwave Pulse

Instant radial defense with approximately 5 m radius. Pushes nearby racers, destroys ordinary projectiles, clears slicks and Blast Orbs, and can neutralize a terminal Apex Missile. Visual is an expanding pressure ring.

## 15.13 Vision-Obscuring Ink Splat

Affects racers ahead. Human view receives partial screen-space organic ink shapes fading over approximately 2.5 s. AI equivalent increases lateral path noise, adds approximately 80 ms reaction latency, and temporarily reduces precision without making navigation impossible.

## 15.14 Nitro Surge

One-use immediate boost lasting approximately 1.2 s. Provides strong acceleration, temporary higher speed cap, and ignores off-road speed penalty during the effect.

## 15.15 Continuous Nitro Overdrive

Activates a 6.0 s boost window. During the window the user may trigger repeated Nitro pulses no faster than once every 0.75 s; each pulse lasts approximately 0.9 s.

## 15.16 Hyper-Drive Rocket

Catch-up autopilot. Racer enters a distinct energy-rocket state with racing-line autopilot, collision immunity, hazard immunity, increased speed, and automatic overtakes. Maximum approximately 6 s. Exit must not deliberately place the player directly into first. Control fades back over approximately 0.3 s.

## 15.17 Prismatic Invincibility

Approximately 6 s. Grants hazard/projectile immunity, approximately +12% speed, and hostile contact that spins rivals. Uses a distinct chromatic pulse and music layer.

# 16. Position-Based Probability Matrix

| **Item**                | **1st** | **2nd** | **3rd** | **4th** | **5th** | **6th** | **7th** | **8th** |
|-------------------------|---------|---------|---------|---------|---------|---------|---------|---------|
| Kinetic Disc            | 18      | 16      | 14      | 10      | 8       | 5       | 3       | 2       |
| Seeker Drone            | 0       | 8       | 12      | 14      | 15      | 12      | 10      | 6       |
| Apex Missile            | 0       | 0       | 0       | 1       | 3       | 8       | 11      | 13      |
| Blast Orb               | 2       | 4       | 6       | 8       | 10      | 9       | 8       | 6       |
| Blaze Orbs              | 0       | 2       | 4       | 6       | 7       | 8       | 8       | 6       |
| Frost Orbs              | 0       | 0       | 2       | 4       | 6       | 8       | 9       | 8       |
| Arc Blade               | 5       | 6       | 7       | 8       | 8       | 7       | 6       | 4       |
| Arc Hammers             | 0       | 1       | 2       | 4       | 6       | 7       | 8       | 6       |
| Slick Trap              | 32      | 24      | 18      | 12      | 8       | 5       | 3       | 2       |
| Shockwave               | 18      | 15      | 12      | 8       | 6       | 4       | 2       | 2       |
| Ink Splat               | 0       | 0       | 2       | 4       | 6       | 7       | 8       | 8       |
| Nitro Surge             | 22      | 20      | 16      | 15      | 12      | 8       | 6       | 5       |
| Nitro Overdrive         | 0       | 0       | 0       | 2       | 3       | 6       | 9       | 13      |
| Hyper-Drive Rocket      | 0       | 0       | 0       | 0       | 0       | 6       | 9       | 15      |
| Prismatic Invincibility | 3       | 4       | 5       | 4       | 2       | 0       | 0       | 4       |
| Total                   | 100     | 100     | 100     | 100     | 100     | 100     | 100     | 100     |

## 16.1 Dynamic Adjustment

gapFactor = clamp(1 + distanceBehindLeader / 250, 1.0, 1.35)

For positions 6-8, Apex Missile, Nitro Overdrive, Hyper-Drive Rocket, and Prismatic Invincibility may receive the gap multiplier. Remaining weights are renormalized. This prevents eighth place two meters behind seventh from receiving the same catch-up assistance as a racer 150 meters behind the field.

## 16.2 Item Restrictions

- Apex Missile: one active globally; minimum 18-second global cooldown.

- Hyper-Drive Rocket: unavailable to places 1-5 and should require meaningful negative race-progress gap.

- No item may spawn while its runtime prerequisite prevents use.

- Final item table is configuration data, not hard-coded switch logic.

# 17. Item State Machines

## 17.1 Generic

AVAILABLE_IN_TABLE -\> SELECTED -\> ROULETTE -\> HELD -\> ACTIVATING -\> ACTIVE -\> IMPACT / COMPLETE / EXPIRE -\> DESTROYED

## 17.2 Projectile

HELD -\> SPAWN -\> ARMING -\> FLYING -\> COLLISION? -\> IMPACT/DESTROY or EXPIRE/DESTROY

## 17.3 Trap

HELD -\> DROP -\> ARM -\> ACTIVE -\> TRIGGERED -\> DESTROY

## 17.4 Multi-Charge

HELD(n) -\> FIRE -\> HELD(n-1) -\> ... -\> EMPTY

## 17.5 Autopilot

HELD -\> ENTER_TRANSITION -\> AUTOPILOT -\> EXIT_TRANSITION -\> NORMAL_CONTROL

## 17.6 Invincibility

HELD -\> ACTIVE -\> EXPIRING_WARNING -\> NORMAL

# 18. Track Blueprint & Level Design

## 18.1 Circuit Alpha

Target lap length approximately 0.90 km. Target average lap 30-45 seconds. Road width 9-12 m. Primary road surface is asphalt; secondary surfaces include dirt, grass, rumble/edge, boost surface, and ramps. The original 1.45 km target was superseded by approved implementation amendment 1.3 after Slice 1 manual testing.

## 18.2 Track Segments

| **Segment**           | **Approx. Distance** | **Feature**                            |
|-----------------------|----------------------|----------------------------------------|
| Start/Finish Straight | 0-112 m              | Wide asphalt, grid, first item cluster |
| Banked Left           | 112-205 m            | Medium-radius 12-degree bank           |
| Split S-Bend          | 205-292 m            | Safe asphalt vs shorter dirt line      |
| Climb                 | 292-385 m            | Elevation gain and boost pads          |
| Crest Ramp            | 385-435 m            | Jump and stunt boost                   |
| Downhill Switchback   | 435-540 m            | Technical braking section              |
| Fast Sweep            | 540-640 m            | High-speed handling test               |
| Underpass             | 640-700 m            | Lighting transition                    |
| Heavy Hairpin         | 700-790 m            | Collision/overtake zone                |
| Final Chicane         | 790-855 m            | Drift opportunity                      |
| Finish Approach       | 855-900 m            | Final boost opportunity                |

## 18.3 Elevation

Vertical range approximately 25-35 m. Elevation influences visuals, airborne state, and momentum but may not allow shortcutting major checkpoint sequences.

## 18.4 Boost Pads

Recommended: two on the climb, one after the technical hairpin, and one optional final-line pad. Boost effect approximately 0.8 s and must visibly activate on contact.

## 18.5 Jump Ramp

Ramp angle approximately 10-14 degrees; target aerial time 0.6-1.1 s. Timing near the jump crest may trigger a stunt, granting approximately 0.6 s landing boost. The stunt must not require a separate key.

## 18.6 Surface Definitions

| **Surface** | **Speed / Accel / Grip Behavior**                                   |
|-------------|---------------------------------------------------------------------|
| Asphalt     | speed 1.00; accel 1.00; base grip 1.00                              |
| Dirt        | uses Traction; baseline speed retention ~0.60; reduced lateral grip; optional partial-width line with playable minimum speed |
| Grass       | more severe than dirt; baseline speed retention ~0.48; playable minimum speed while throttle is held |
| Boost Pad   | temporarily overrides normal acceleration                           |
| Ramp        | asphalt grip before airborne transition                             |

# 19. Checkpoints and Lap Validation

## 19.1 Gates

Recommended CP00 = Start/Finish and CP01-CP11 as sequential progress checkpoints. Every checkpoint is an invisible volume crossing the complete legal racing corridor.

## 19.2 Progress State

interface RacerProgress {  
lap: number;  
nextCheckpoint: number;  
checkpointSequence: number\[\];  
splineProgress: number;  
totalRaceProgress: number;  
finished: boolean;  
}

## 19.3 Valid Lap

A lap increments only when every required checkpoint has been crossed in sequence, the racer crosses Start/Finish, crossing direction is valid, and the racer has not already triggered the gate during the current overlap. Reversing repeatedly across the finish line may not increment laps.

## 19.4 Wrong Way

dot(kartForward, localTrackForward)

If the value remains below the wrong-way threshold, display WRONG WAY and do not alter checkpoint state.

## 19.5 Recovery

Respawn may occur when the kart is outside legal recovery bounds, inverted longer than 2.5 s, or motionless outside the race corridor longer than 4 s. Respawn uses the last valid recovery marker associated with checkpoint progress, with approximately 1.0-1.5 s recovery animation and approximately 1.0 s post-respawn invulnerability.

# 20. Track Spline & Waypoint System

Circuit Alpha owns a primary closed spline. Each spline sample may contain:

interface TrackSample {  
position: Vec3;  
forward: Vec3;  
right: Vec3;  
up: Vec3;  
widthLeft: number;  
widthRight: number;  
targetSpeed: number;  
curvature: number;  
surface: SurfaceType;  
}

AI navigation uses progress along this spline rather than discrete node-to-node steering alone. Candidate lane offsets are -0.75, -0.40, 0, +0.40, and +0.75 normalized across usable track width.

# 21. AI Behavior System

## 21.1 AI Pipeline

- determine spline progress

- calculate lookahead

- evaluate desired speed

- choose lane

- inspect obstacles

- calculate steer/throttle/brake

- consider drift

- consider item use

## 21.2 Lookahead

Dynamic lookahead 5-14 m, increasing with speed. Very short lookahead causing oscillation is prohibited.

## 21.3 Desired Speed

Precomputed racing-line speed considers curvature, road width, surface, jumps, nearby racers, and item hazards. AI should brake before turns rather than only reacting after excessive steering error.

On a clear asphalt straight, each AI racer's neutral desired speed equals `createKartTuning(character.stats).maxSpeed`. Pace modifies the curvature penalty rather than the straight-line ceiling:

```text
cornerPenalty = lerp(0.48, 0.34, clamp(pace, 0, 1))
desiredSpeed = characterMaxSpeed * (1 - clamp(corner, 0, 1) * cornerPenalty)
```

Temporary reductions for a blocking racer, surface, collision, hazard, or required braking remain valid. Grid position and AI profile assignment may not substitute an absolute target-speed range for the selected character's Speed stat.

## 21.4 Overtaking

AI periodically evaluates lane offsets using path curvature, collision risk, hazard risk, distance to opponents, off-road risk, and future track width. It switches only when candidate improvement exceeds hysteresis threshold to prevent lane thrashing.

## 21.5 Obstacle Avoidance

AI detects kart bodies, oil slicks, Blast Orbs, and static track obstacles; temporarily deviates from the ideal spline; then returns gradually rather than snapping.

## 21.6 Rubber-Banding

Rubber-banding is bounded. Trailing AI may receive up to +6% engine force and +4% top-speed allowance. Leading AI may receive at most -2% engine-force correction, but no reduction to its Speed-defined top-speed ceiling. No teleporting, impossible item immunity, or hidden collision changes. Race-progress gap, not rank alone, drives the correction.

## 21.7 AI Items

AI considers target distance, rear attackers, nearby projectiles, rank, track geometry, and current item. Seeker is used when a target ahead is within useful range; Slick when a rival is reasonably close behind; Shockwave is held defensively when practical; Nitro is preferred on straight or recovery lines; Rocket activates promptly.

# 22. Camera System

## 22.1 Chase Camera

Camera target is a kart-local anchor slightly above and behind the chassis. Distance increases from approximately 5.2 m at low speed to 6.4 m at high speed. Height approximately 2.4-3.0 m. FOV transitions from approximately 62 degrees to 68 degrees at high speed. All transitions are smoothed.

## 22.2 Drift Camera

During sustained drift, apply a small horizontal offset, slight FOV increase, and mild roll limited to a few degrees. Camera motion may not obscure track direction.

## 22.3 Collision Camera

Impact response may use a short positional impulse and optional screen shake. Settings must allow reducing or disabling screen shake.

## 22.4 Rear View

While C is held or toggled according to final input implementation, camera faces behind the kart while movement controls remain unchanged and mini-map remains available. Return transition must be quick enough for racing use.

# 23. Rendering, VFX & AAA Web Polish

## 23.1 Lighting

Recommended: HDR/environment contribution, directional sun/key, one principal shadow map, and baked/static environmental lighting where practical. Avoid many shadow-casting point lights.

## 23.2 Materials

Track uses PBR materials, roughness variation, selective normal maps, and baked AO. Kart uses semi-gloss chassis, configurable accent, and emissive boost elements.

## 23.3 Shadows

Dynamic shadows prioritize the player, nearby karts, and prominent projectiles. Low graphics preset may reduce resolution, distance, and caster count.

## 23.4 Drift VFX

Blue: short blue sparks. Orange: stronger orange sparks/flame. Purple: purple/violet burst, additional particles, and stronger exhaust pulse.

## 23.5 Speed VFX

At elevated velocity, use restrained speed lines, FOV expansion, and stronger exhaust. Boost adds an exhaust flare, subtle chromatic streak, and additional particles.

## 23.6 Dust

Off-road wheels emit instanced particles scaled by speed, wheel slip, and surface.

## 23.7 Motion Blur

Motion blur is quality-tier dependent. High may use full-screen directional or velocity-inspired blur; Medium uses simplified speed-edge blur; Low disables it. Gameplay must never miss the 60 FPS target solely to preserve motion blur.

## 23.8 Bloom

Bloom is limited to controlled emissive elements such as drift tiers, boost pads, item energy, and selected HUD transitions. It may not wash out the road.

# 24. Audio Architecture

## 24.1 Mixer

Master  
+-- Music  
+-- Engines  
+-- Items  
+-- Environment  
+-- UI

Each category has independent gain and persists locally.

## 24.2 Engine Audio

Use at least low-RPM and high-RPM loop layers. Synthetic RPM is based on normalized speed plus throttle influence. Pitch range target approximately 0.75-1.60. Crossfade avoids obvious loop switching. Nearby AI engines use spatial emitters and voice limiting.

## 24.3 Drift Audio

Components include tire squeal, spark tier cues, and boost-release cues. Tier transitions must be distinguishable without looking at the HUD.

## 24.4 Item Audio

Each item receives activation, travel loop where relevant, warning cue where relevant, and impact sound. Seeker and Apex warnings must be identifiable from generic item noise.

## 24.5 Final Lap Music

Preferred implementation is a pre-produced final-lap arrangement with a musically compatible bar-boundary transition. It should convey approximately an 8-12% intensity increase through tempo, percussion, instrumentation, or arrangement rather than merely restarting the same track faster.

## 24.6 Finish Audio

Race Director triggers a finish sting, player placement cue, and music transition. Results music must not overlap uncontrolled race stems.

# 25. Data Model and Sources of Truth

Core configuration objects:

CharacterDefinition  
KartVisualDefinition  
RaceDefinition  
TrackDefinition  
CheckpointDefinition  
SurfaceDefinition  
ItemDefinition  
ItemDistributionTable  
AIProfile  
GraphicsPreset  
AudioSettings  
PlayerSettings

Runtime objects:

RacerRuntime  
RaceProgress  
KartRuntime  
ItemRuntime  
ProjectileRuntime  
HazardRuntime  
DriftRuntime  
AIState

Persistent browser data is limited to volume settings, graphics settings, motion blur setting, screen shake setting, and last selected character. No race result persistence is required.

# 26. Functional Requirements

## Hub

**HUB-001** The SPA must load into Title Screen without entering gameplay.

**HUB-002** The first user interaction must unlock browser audio.

**HUB-003** The Main Menu must list Kart Racer as playable.

**HUB-004** Unavailable future games must be visibly marked and non-activating.

**HUB-005** Settings and Controls must be available from Main Menu.

**HUB-006** The title screen must show `Manaconda's Minigame Mayhem`, omit the former presentation line, and use the approved minigame mark instead of a letter monogram.

**HUB-007** Browser metadata and the favicon must use the current product name and approved minigame mark.

## Character Selection

**CHAR-001** The system must load twelve roster entries from the character manifest.

**CHAR-002** Selecting a driver must update portrait, name, class, six stats, and kart preview.

**CHAR-003** Invalid or missing artwork must invoke procedural fallback rather than block selection.

**CHAR-004** The player must explicitly confirm a selected driver before the race begins.

## Race

**RACE-001** A race must contain exactly eight active racers: one human and seven AI.

**RACE-002** The standard race must require three valid laps.

**RACE-003** Race ranking must derive from total validated race progress.

**RACE-004** The race must provide a starting countdown.

**RACE-005** Crossing the finish line after three valid laps must lock that racer's finish time and placement.

**RACE-006** The player must be able to finish in any rank from first through eighth.

## Physics

**PHYS-001** All karts must use fixed-step simulation.

**PHYS-002** Character stat values must affect the defined physics formulas.

**PHYS-003** Kart-to-kart collision response must incorporate relative mass.

**PHYS-004** Off-road behavior must use Traction.

**PHYS-005** Karts must recover from inversion or unrecoverable track exits.

**PHYS-006** Physics state must never generate NaN or infinite transforms during a normal race.

## Drift

**DRIFT-001** Space must initiate valid hop/drift behavior.

**DRIFT-002** Drift must expose Blue, Orange, and Purple charge tiers.

**DRIFT-003** Releasing drift must apply the highest achieved tier.

**DRIFT-004** Mini-Turbo stat must modify both charge threshold and boost effectiveness.

## Items

**ITEM-001** Item boxes must use rank-weighted distribution.

**ITEM-002** The item system must support the fifteen defined item types.

**ITEM-003** Player inventory must contain one item slot.

**ITEM-004** Items with multiple uses must display remaining charge count.

**ITEM-005** Items must resolve cleanup after impact or expiration.

**ITEM-006** Shockwave must destroy supported nearby threats.

**ITEM-007** Apex Missile must target the first-place racer at terminal lock.

**ITEM-008** Hyper-Drive Rocket must use track navigation rather than uncontrolled forward physics.

## AI

**AI-001** Every AI racer must complete Circuit Alpha without player involvement.

**AI-002** AI must use track splines and dynamic lookahead.

**AI-003** AI must avoid straightforward static hazards.

**AI-004** AI must use items.

**AI-005** Rubber-banding must remain inside documented limits.

## Track

**TRACK-001** Circuit Alpha must include all required surface types and features.

**TRACK-002** Checkpoint sequence must prevent shortcut lap completion.

**TRACK-003** Wrong-way traversal must not increment lap count.

**TRACK-004** The mini-map must derive from the same track topology used by race progress.

## UI

**UI-001** HUD must display rank, lap, item, mini-map, portrait, and speed.

**UI-002** Final lap must produce a clearly visible notification.

**UI-003** Pause must stop race simulation.

**UI-004** Results must show all eight finish positions.

## Audio

**AUD-001** Audio may not start before browser permission through interaction.

**AUD-002** Engine pitch must respond continuously to kart state.

**AUD-003** Final lap must alter musical presentation.

**AUD-004** Independent master/music/effects-style controls must persist.

## Performance

**PERF-001** Rendering must support quality presets.

**PERF-002** Decorative effects must be reducible independently of core simulation.

**PERF-003** Representative eight-racer gameplay must meet performance acceptance conditions on baseline hardware.

## Repository

**REPO-001** The GitHub repository must be created before Slice 1 implementation begins.

**REPO-002** The repository must contain the approved PRD, working Markdown PRD, architecture folders, status documentation, decision log, testing documentation, CI workflow, and documented developer commands.

**REPO-003** A clean checkout must install, typecheck, lint, test, build, and run according to repository documentation.

**REPO-004** Implementation status must be updated at every slice checkpoint so a new Cowork session can resume without relying on chat history.

**REPO-005** Large binary asset handling must be configured before production binary art/audio is committed.

**REPO-006** Slice 0 must not expand into Slice 1 gameplay implementation beyond a minimal app-shell proof.

**REPO-007** The canonical repository and Pages base path must use `manacondas-minigame-mayhem`.

**REPO-008** The production build must fail if the superseded product name or repository slug returns outside preserved history.

# 27. Design and Content Requirements

The visual language should be polished, colorful, kinetic, high-contrast, arcade-oriented, and original. Arcade-kart games may inspire it, but branding, items, characters, karts, UI, landmarks, sound, and effects must remain distinct. Presentation must extend beyond renamed familiar items, with separately authored silhouettes, VFX, audio, and icons.

# 28. Privacy, Security, Rights & Access

## 28.1 Data

v1 requires no account and no server-side personal data. Local storage may contain only non-sensitive gameplay settings.

## 28.2 Avatar Rights

Before public release, every real-community-member avatar must have verified permission/provenance for the intended game use. Maintain at minimum asset owner/source, approved use, approval status, source file, and production derivative. Unapproved likenesses must not be publicly deployed.

## 28.3 External Libraries

Production build must record package, version, and license. No dependency with incompatible redistribution terms may ship.

## 28.4 IP Differentiation Gate

Pre-release review must confirm that item presentation and other game content are not direct replicas. This is a product-content control and not a substitute for formal legal advice if commercial/public-release circumstances require it.

# 29. Reliability, Operations & Recovery

## 29.1 Fatal Asset Failure

If Circuit Alpha itself cannot load, stop race launch, show a user-readable load error, and allow return to hub. Do not enter broken race state.

## 29.2 Non-Critical Asset Failure

Fallback is allowed for character portraits, driver sprites, individual kart models, optional SFX, and decorative effects.

## 29.3 WebGL Context Loss

webglcontextlost  
webglcontextrestored

If restoration succeeds, rebuild resources. Otherwise offer a clean reload.

## 29.4 Race Restart

Restart reconstructs race runtime state rather than manually resetting every mutable entity. Dispose projectiles, hazards, race timers, transient VFX, and stale audio emitters.

# 30. Analytics & Evidence

No remote analytics are required for v1. Development instrumentation must expose:

FPS  
frame time  
draw calls  
triangle count  
physics step time  
AI update time  
active objects  
active particles  
active audio voices

Debug instrumentation must be removable or disabled in release presentation. Evidence for PRD completion comes from automated tests, performance captures, race recordings/screenshots, asset validation, browser tests, and done-check records.

# 31. Repository, GitHub & Cowork Continuity

## 31.1 Repository Policy

The project must live in a dedicated GitHub repository. Unless the product owner explicitly chooses otherwise during creation, the initial repository should be private because it may later contain community avatar art and unreleased game assets. If GitHub exposes multiple possible repository owners or organizations and the correct owner cannot be inferred safely, Cowork must ask before creating the repository.

## 31.2 Required Repository Layout

/  
+-- docs/  
\| +-- PRD.md  
\| +-- Manacondas_Minigame_Mayhem_PRD_v1.1.docx
\| +-- DECISIONS.md  
\| +-- IMPLEMENTATION-STATUS.md  
\| +-- TESTING.md  
+-- public/  
\| +-- assets/  
\| +-- characters/  
\| +-- karts/  
\| +-- track/  
\| +-- items/  
\| +-- audio/  
+-- src/  
\| +-- app/  
\| +-- audio/  
\| +-- config/  
\| +-- game/  
\| \| +-- ai/  
\| \| +-- camera/  
\| \| +-- characters/  
\| \| +-- items/  
\| \| +-- physics/  
\| \| +-- race/  
\| \| +-- track/  
\| \| +-- vfx/  
\| +-- schemas/  
\| +-- ui/  
+-- tests/  
+-- .github/workflows/  
+-- README.md  
+-- package.json  
+-- tsconfig.json  
+-- vite.config.ts  
+-- .gitignore  
+-- .gitattributes

## 31.3 Documentation Contract

README.md must state product purpose, local setup, development/build/test commands, architecture summary, current implementation slice, and links to the working PRD and implementation status. docs/IMPLEMENTATION-STATUS.md must record current slice, completed requirements, work in progress, known defects, deferred work, next recommended action, and last verified commit. docs/DECISIONS.md records technical/product decisions made after approval. docs/TESTING.md defines test commands, environments, manual checks, and evidence expectations.

## 31.4 PRD Representation

This DOCX is retained in docs as the approved versioned artifact. Cowork creates docs/PRD.md as a semantically equivalent implementation copy. Any approved PRD revision must update both the versioned approval artifact and the working Markdown PRD, with the revision noted in DECISIONS and IMPLEMENTATION-STATUS.

## 31.5 Git LFS / Binary Asset Policy

Large binary handling must be configured before production art/audio enters Git history. At minimum, GLB and production audio formats should be considered for Git LFS. High-resolution character PNG/WebP assets may also be placed under LFS according to the repository asset policy. The .gitattributes file must make the policy explicit before those assets are committed.

## 31.6 CI Contract

GitHub Actions must run the repository health pipeline on pushes and pull requests:

install -\> typecheck -\> lint -\> test -\> production build

The exact package manager is selected in Slice 0 and must be locked consistently. CI failure blocks declaring a slice checkpoint healthy.

## 31.7 Cowork Session Handoff

At the end of every material Cowork implementation session, update IMPLEMENTATION-STATUS.md before the final checkpoint commit. A new session should begin by reading README.md, docs/PRD.md, docs/IMPLEMENTATION-STATUS.md, and docs/DECISIONS.md before changing code. Chat history is supplemental only.

## 31.8 Branching and Checkpoints

Initial bootstrap may occur on the default branch if the repository is new and isolated. After bootstrap, material implementation work should use small, reviewable branches or commits appropriate to the connected Cowork workflow. Every slice ends in a named checkpoint commit with passing CI and an updated implementation-status record.

# 32. Dependencies

Required runtime and build dependencies include Three.js, Rapier 3D, Howler.js or equivalent agreed audio wrapper, TypeScript, and Vite. Development dependencies should include a test runner, linting, formatting, and type-check support selected in Slice 0. Content dependencies include 12 approved avatar identities/art packages, kart assets, Circuit Alpha art, item icons/models, SFX, race music, and final-lap arrangement. Early slices may use placeholders; final asset approval is not required to prove the physics architecture.

# 33. Risks and Mitigations

| **Risk**                                   | **Impact** | **Mitigation**                                              |
|--------------------------------------------|------------|-------------------------------------------------------------|
| Physics feels overly realistic             | High       | Custom arcade controller over Rapier                        |
| Physics becomes unstable                   | High       | Fixed timestep, bounded impulses, recovery tests            |
| AAA effects reduce FPS                     | High       | Quality tiers and effect budgets                            |
| 2D drivers look disconnected from 3D kart  | High       | Controlled billboard, cockpit occlusion, matched lighting   |
| AI looks robotic                           | Medium     | Lane selection, overtaking, drift, tactical items           |
| AI rubber-band feels dishonest             | Medium     | Hard percentage caps; no teleport                           |
| Items overwhelm skill                      | High       | Rank table, cooldowns, global caps                          |
| Heavy items create unavoidable frustration | Medium     | Warnings and counters                                       |
| Missing avatar assets block development    | High       | Procedural fallback                                         |
| Large download                             | Medium     | Lazy loading and compressed assets                          |
| Browser audio blocked                      | High       | Title interaction unlock                                    |
| Lap shortcut exploits                      | High       | Ordered checkpoints                                         |
| Franchise similarity                       | High       | Original names, silhouettes, icons, audio, effects          |
| Cowork session loses project context       | High       | Repo-held PRD, status, decisions, tests, checkpoint commits |
| Large binaries bloat Git history           | Medium     | Configure LFS policy before production assets               |

# 34. Decision Log

| **ID** | **Decision**                                  | **Rationale**                                                                 |
|--------|-----------------------------------------------|-------------------------------------------------------------------------------|
| D-001  | Three.js baseline                             | Browser maturity and rendering flexibility                                    |
| D-002  | Rapier physics                                | Stable WASM physics with custom arcade control                                |
| D-003  | WebGL2 baseline                               | Wider production compatibility                                                |
| D-004  | WebGPU progressive                            | Initial gameplay does not depend on availability                              |
| D-005  | 60 Hz fixed simulation                        | Responsive and predictable browser physics                                    |
| D-006  | One inventory slot                            | Keeps first vertical slice readable                                           |
| D-007  | 12 characters / 36 stat points each           | Balance transparency                                                          |
| D-008  | 8-racer grid                                  | Requested competitive target with manageable browser load                     |
| D-009  | Single Circuit Alpha                          | Concentrates vertical-slice quality                                           |
| D-010  | No backend                                    | Unnecessary for current product outcome                                       |
| D-011  | Originalized item presentation                | Distinct product identity                                                     |
| D-012  | 2D driver sprite mounted in 3D kart           | Preserves the approved illustrated roster while controlling asset cost        |
| D-013  | GitHub repository before gameplay code        | Provides durable source of truth and cross-session continuity                 |
| D-014  | DOCX approval artifact + Markdown working PRD | Combines reviewable final artifact with repo-native implementation reference  |
| D-015  | Slice 0 bootstrap before Slice 1              | Prevents architecture, CI, docs, and binary policy from being bolted on later |

# 35. Phased Implementation Roadmap

## 35.1 Slice 0 - Repository & Project Bootstrap

### Objective

Create the canonical GitHub repository, establish the project structure, install the approved technical foundation, configure repository health checks, and make the repo self-describing before gameplay implementation begins.

### Implementation Work

- Create the GitHub repository (current name: manacondas-minigame-mayhem). Default to private unless the product owner explicitly chooses otherwise; ask only if the repository owner/organization cannot be safely determined.

- Initialize a TypeScript/Vite application and select one package manager; commit its lockfile.

- Create the repository directory structure defined in Section 31 and the asset substructure defined in Section 11.

- Place this approved Word PRD in docs/ and create docs/PRD.md as the semantically equivalent canonical working PRD.

- Create README.md covering product purpose, local setup, build/run/test commands, architecture summary, current slice, and links to PRD/status docs.

- Create docs/IMPLEMENTATION-STATUS.md with current slice, completed requirements, work in progress, known defects, deferred work, next recommended action, and last verified commit.

- Create docs/DECISIONS.md and seed it with the approved decisions from Section 34.

- Create docs/TESTING.md documenting local and CI validation commands plus evidence expectations.

- Install and pin the initial foundation: Three.js, Rapier, Howler.js, TypeScript, Vite, plus linting, formatting, and testing tooling appropriate to the stack.

- Configure TypeScript strictness, formatting, linting, and basic test execution.

- Add package scripts at minimum for dev, build, typecheck, lint, test, and CI-friendly testing.

- Configure GitHub Actions to install, typecheck, lint, test, and create a production build on push/pull request.

- Configure .gitignore and .gitattributes, including the approved Git LFS/binary-asset policy before production art/audio is added.

- Add placeholder asset directories/manifests so later slices do not invent competing structures.

- Create only the minimum application shell needed to prove the repository builds and serves; do not implement gameplay physics in Slice 0.

- Run all documented checks locally, fix failures, commit the clean bootstrap checkpoint, push it, and verify CI.

- Update IMPLEMENTATION-STATUS.md with evidence, repository URL, default branch, checkpoint commit SHA, CI status, any deviations, and whether Slice 1 is ready.

### Acceptance Criteria

- Repository exists in GitHub.

- Fresh checkout can be installed and run using documented commands.

- Production build succeeds.

- Type checking and linting succeed.

- Automated test command succeeds, even if only bootstrap tests exist.

- GitHub Actions run successfully.

- Approved PRD is committed and identifiable as the authoritative requirements baseline.

- docs/PRD.md exists as the working implementation copy.

- Folder structure matches this PRD.

- Large binary asset handling is configured before production art enters Git history.

- IMPLEMENTATION-STATUS.md is sufficient for a new Cowork session to determine completed work and the next action.

- No game-specific implementation beyond the minimum app-shell proof has leaked into Slice 0.

### Done-Check Evidence

Repository URL:  
Default branch:  
Checkpoint commit SHA:  
CI result:  
Clean install/build result:  
PRD version:  
Files/folders created:  
Known deviations:  
Open defects:  
Slice 1 ready: YES / NO

### Approval Gate

Slice 0 may begin from this final PRD. Stop after a healthy Slice 0 checkpoint and wait for product-owner approval before starting Slice 1.

## 35.2 Slice 1 - Engine Setup, Basic Kart Physics, Keyboard Controls, Single Track Loop & Time Trial

### Objective

Prove that the browser runtime can deliver stable, responsive kart driving around a complete Circuit Alpha loop.

### Included

- HUB-001-005 baseline shell

- PHYS-001-006 foundational portions

- TRACK-001-003

- basic HUD timing

- player kart only

### Implementation Work

- Vite/TypeScript runtime already bootstrapped

- app state machine

- Three.js scene

- Rapier initialization

- fixed-step loop

- Circuit Alpha blockout

- kart rigid body

- custom throttle/brake/steering

- chase camera

- surface tags

- checkpoint/lap validation

- time-trial timer

- respawn

- performance overlay

### Acceptance Criteria

- player can drive three consecutive valid laps

- reverse finish-line crossing cannot increment lap

- grass/dirt slows vehicle

- kart recovery works

- 10-minute driving test produces no invalid transforms

- keyboard input remains responsive

- representative blockout remains at target performance

### Evidence Required

Gameplay capture, lap-validation test output, physics soak log, FPS/frame-time capture, and repository test output.

### Approval Gate

Any material change to core physics contract or track validation rules.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.3 Slice 2 - Drift Engine, Three-Tier Mini-Turbo & Multi-Surface Traction

### Objective

Transform basic steering into the required arcade-driving identity.

### Included

- DRIFT-001-004

- complete character-independent traction equations

- Blue/Orange/Purple boost logic

- boost pads

- jump/stunt boost

### Implementation Work

- hop state

- drift entry

- slip logic

- charge calculation

- three tiers

- tier VFX placeholders

- tier audio placeholders

- boost state

- dirt and grass tuning

- jump/stunt state

### Acceptance Criteria

- all three drift tiers can be intentionally achieved

- release applies correct tier

- tier charge timing matches configuration

- surface traction changes behavior measurably

- drift remains stable on banked corners

- kart cannot indefinitely charge turbo while stationary

### Evidence Required

Automated threshold tests, gameplay capture of all three tiers, telemetry trace, and surface-speed comparison.

### Approval Gate

Any change to the six-stat contract or requested three-tier drift model.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.4 Slice 3 - Character Selection & Avatar Ingestion

### Objective

Integrate the complete twelve-slot roster framework without requiring every final production asset.

### Included

- CHAR-001-004

- six-stat mapping

- character select UI

- kart preview

- hybrid driver sprites

- fallback generator

### Implementation Work

- JSON schema

- manifest validator

- twelve balance profiles

- Character Select

- kart preview scene

- driver sprite controller

- sprite atlas pipeline

- fallback kart

- monogram generator

- player-selection handoff into race

### Acceptance Criteria

- exactly 12 slots render

- each slot produces correct statistics

- every stat total validates at 36

- selected character values drive physics

- removing one portrait invokes fallback

- removing one kart invokes fallback

- missing optional assets do not crash race

### Evidence Required

Manifest validation test, Character Select screenshots, twelve automated profile tests, and missing-asset test.

### Approval Gate

Final mapping of real community identities and approved likeness assets.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.5 Slice 4 - AI Waypoint Navigation & Eight-Racer Grid

### Objective

Turn the time trial into a complete competitive race.

### Included

- RACE-001-006

- AI-001-005

- race ranking

- eight-racer start grid

- collision interaction

### Implementation Work

- race director

- grid spawning

- spline AI

- desired-speed profile

- lane system

- overtaking

- obstacle avoidance

- AI drift

- bounded rubber-band

- position ranking

- AI finish times

### Acceptance Criteria

- seven AI racers complete three laps

- no AI consistently becomes permanently stuck

- AI can overtake

- race positions update correctly through crossings

- AI collision recovery works

- all eight racers receive finish positions

- repeated races show meaningful order variation

- seven AI identities are sampled from the available roster without duplicating the player or each other

- every sampled production identity loads its approved kart and rear driver frame; sampled unfinished identities use governed fallbacks

### Evidence Required

Ten automated or supervised full-race simulations, AI path telemetry, finish-order data, and collision-stress recording.

### Approval Gate

Any major increase beyond seven opponents or material redesign of rubber-band rules.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.6 Slice 5 - Item Boxes, Weapons & Position-Based Distribution

### Objective

Implement the complete tactical and catch-up layer.

### Included

- ITEM-001-008

- all fifteen items

- item boxes

- one-slot inventory

- complete probability matrix

- AI item use

### Implementation Work

- item registry

- item state machine

- probability selector

- roulette UI

- projectile framework

- hazard framework

- buffs/debuffs

- defensive pulse

- Apex targeting

- Rocket autopilot

- AI item logic

- global caps

- cleanup/pooling

### Acceptance Criteria

- all fifteen items can be acquired and successfully resolve

- every rank table sums to 100%

- random distribution statistically approximates configured values

- no item leaves immortal runtime objects

- Apex targets current first-place racer

- Shockwave counters supported objects

- Rocket follows legal race path

- AI uses tactical items

- item interactions do not invalidate lap state

### Evidence Required

Automated probability report, item interaction test matrix, gameplay capture, and object-count soak test. At least 100,000 simulated item selections per rank; expected deviation \<= approximately 0.5 percentage points for common items or a documented statistical goodness-of-fit test.

### Approval Gate

Material balance changes outside approved item definitions or matrix.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.7 Slice 6 - UI/HUD Polish, Audio, Post Processing & Optimization

### Objective

Convert the mechanically complete game into the intended high-fidelity vertical slice.

### Included

- final HUD

- mini-map

- pause

- results

- approved avatars

- production audio

- final-lap music

- shadows

- particles

- bloom

- motion blur quality mode

- graphics presets

- performance optimization

### Implementation Work

- complete HUD

- Canvas/SVG mini-map

- final menus

- portrait states

- podium/results

- audio mixer

- engine system

- item audio

- music transitions

- particles

- boost effects

- post processing

- dynamic quality controls

- memory cleanup

- cross-browser QA

- asset-rights validation

- production build

### Acceptance Criteria

- full Title -\> Results flow passes

- HUD values remain correct

- final-lap music transitions correctly

- settings persist

- graphics quality changes without reload where feasible

- no material memory increase across five race restarts

- Medium graphics meets performance target

- missing WebGPU never blocks WebGL2 play

- approved production likenesses are the only likenesses shipped

- release candidate passes final quality checklist

### Evidence Required

Complete gameplay recording, browser matrix, performance capture, memory capture, rights/provenance record, and production build validation.

### Approval Gate

Public deployment, final avatar likeness package, material acceptance-criteria change, paid production services, and production hosting/domain changes.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.8 Slice 7 - Jennifer release and product rebrand

### Objective

Publish Jennifer and The Hearthwarden while moving the public product, repository, and Pages URL to Manaconda's Minigame Mayhem.

### Included

- Jennifer's approved AA-12 runtime package and cockpit placement
- title-screen, metadata, browser-icon, package, repository, and Pages-path rebrand
- removal of the presentation line and player-facing AA monogram
- current documentation and Word approval-artifact updates
- build-time protection against superseded brand copy and paths

The internal `aa-##` profile and asset keys remain stable compatibility identifiers. Dated history snapshots remain unchanged as historical evidence.

### Acceptance Criteria

- The title screen shows `Manaconda's Minigame Mayhem` with no presentation line above it.
- The minigame route-and-token mark replaces the AA letter logo and supplies the favicon.
- Jennifer is selectable as AA-12 and loads The Hearthwarden, all ten approved frames, and the 8 / 5 / 8 / 4 / 4 / 7 profile.
- Active product copy, metadata, package identity, repository guidance, builder labels, and public links use the new brand.
- The canonical repository is `Manaconda33/manacondas-minigame-mayhem` and the live site uses `/manacondas-minigame-mayhem/`.
- Automated validation rejects the superseded display name or repository slug outside dated history.
- Full local validation, pull-request CI, main CI, Pages deployment, and source-to-live asset checks pass.

### Evidence Required

Rendered desktop and mobile title screens, Jennifer selection and race entry, repository metadata, Pages response, production-bundle brand scan, asset hashes, CI results, and product-owner live playtest.

### Approval Gate

Manny approved the brand, repository rename, public URL change, Jennifer publication, and deployment on September 3, 2026. Product-owner live acceptance remains required after deployment.

### Rollback

Keep the last accepted deployment commit available. If the renamed Pages site fails, restore the prior source checkpoint on the renamed repository while retaining the new repository identity; do not restore the superseded public brand.

### Done-Check

Status: Local release gate passed; publication in progress
Evidence: Brand guard; strict typecheck; zero-warning lint; 16 test files / 84 tests; 30 GLBs; 83 PNGs; production build; Git LFS fsck; 43-page Word PRD integrity and rendered review
Defects: None recorded
Deferred: Desktop and mobile live acceptance after deployment
PRD Changes: Amendment 2.1, HUB-006, HUB-007, REPO-007, REPO-008, and Slice 7
Next Slice Ready: NO

# 36. Test Strategy

## 36.1 Unit Tests

Cover stat calculations, probability normalization, rank selection, checkpoint sequencing, lap increment, race-progress comparison, drift thresholds, boost durations, surface modifiers, character manifest, and item state transitions.

## 36.2 Simulation Tests

Use headless or reduced-render tests where feasible for AI race completion, projectile cleanup, racer finish ordering, wrong-way lap rejection, repeated collisions, repeated respawns, and item selection distribution.

## 36.3 Integration Tests

Title -\> Menu -\> Character Select -\> Race -\> Pause -\> Race -\> Finish -\> Results -\> Replay

## 36.4 Physics Stress Tests

| **Test**  | **Pass Condition**                                                                                 |
|-----------|----------------------------------------------------------------------------------------------------|
| Pile-Up   | Eight racers in constrained contact; no NaN, no unbounded velocity, racers separate/recover        |
| Wall Test | Maximum-speed impact does not tunnel through major boundary; player remains recoverable            |
| Ramp Test | Repeated jump landings cause no sinking, persistent airborne state, or escalating angular velocity |

## 36.5 Browser Matrix

Baseline: latest Chrome, latest Edge, latest Firefox, and current desktop Safari where WebGL2 capabilities meet the required baseline. Core gameplay must not depend on WebGPU.

# 37. Acceptance Criteria & Quality Checklist

## Complete Gameplay

☐ Title Screen works.

☐ Browser audio unlock works.

☐ Hub loads.

☐ Kart Racer card starts correct flow.

☐ All 12 character slots load.

☐ Character selection affects race stats.

☐ Eight racers start.

☐ Countdown works.

☐ Three laps validate.

☐ Finish order works.

☐ Results contain all racers.

☐ Replay works.

☐ Return to hub works.

## Controls

☐ WASD works.

☐ Arrow keys work.

☐ Space drift works.

☐ Shift item use works.

☐ E alternate item use works.

☐ Backward throw modifier works.

☐ C rear view works.

☐ Escape works.

☐ P pause works.

☐ Browser scrolling does not interfere during active gameplay.

## Physics

☐ No NaN transforms in 30-minute soak.

☐ No uncontrolled velocity explosion.

☐ Kart stays stable on banked road.

☐ Kart lands correctly from ramp.

☐ Heavy racer has observable collision advantage.

☐ Handling changes steering behavior.

☐ Acceleration changes recovery behavior.

☐ Traction changes off-road retention.

☐ Speed affects maximum road velocity.

## Drift

☐ Blue tier reachable.

☐ Orange tier reachable.

☐ Purple tier reachable.

☐ VFX matches tier.

☐ Audio matches tier.

☐ Release activates correct boost.

☐ Zero-speed exploit impossible.

☐ Drift resets after hit.

## Track

☐ Circuit closes cleanly.

☐ All checkpoints are sequential.

☐ Skipping checkpoint blocks lap.

☐ Reversing finish line does not farm laps.

☐ Wrong-way warning works.

☐ Recovery returns to legal location.

☐ Dirt behaves distinctly.

☐ Grass behaves distinctly.

☐ Boost pads work.

☐ Jump/stunt works.

## AI

☐ Seven AI complete race.

☐ AI handles major turns.

☐ AI uses multiple lanes.

☐ AI overtakes.

☐ AI avoids obvious hazards.

☐ AI uses items.

☐ AI recovers after collision.

☐ AI rubber-band remains inside configured limits.

## Items

☐ Kinetic Disc works.

☐ Seeker Drone works.

☐ Apex Missile works.

☐ Blast Orb works.

☐ Blaze Orbs work.

☐ Frost Orbs work.

☐ Arc Blade works.

☐ Arc Hammers work.

☐ Slick Trap works.

☐ Shockwave works.

☐ Ink works.

☐ Nitro works.

☐ Nitro Overdrive works.

☐ Hyper-Drive Rocket works.

☐ Prismatic Invincibility works.

☐ Weighted tables sum to 100%.

☐ Global item limits work.

☐ Expired items are destroyed.

## HUD

☐ Rank is accurate.

☐ Lap is accurate.

☐ Portrait is accurate.

☐ Item icon is accurate.

☐ Charge count is accurate.

☐ Mini-map positions are accurate.

☐ Speed is displayed.

☐ Final lap appears.

☐ Wrong way appears.

## Audio

☐ Music starts only after user interaction.

☐ Engine pitch responds to speed.

☐ AI engines spatialize.

☐ Drift cues work.

☐ Projectile warnings work.

☐ Final-lap music works.

☐ Pause attenuates correctly.

☐ Result music does not overlap race music.

☐ Volume settings persist.

## Visual

☐ Driver sprites sit correctly in kart.

☐ Left/right states trigger correctly.

☐ Hit state triggers correctly.

☐ Victory state triggers correctly.

☐ Shadows do not materially exceed budget.

☐ Drift tiers visually differ.

☐ Boost pads read clearly.

☐ Off-road dust works.

☐ Bloom is controlled.

☐ Motion blur can be disabled.

## Fallback

☐ Missing portrait falls back.

☐ Missing sprite falls back.

☐ Missing kart falls back.

☐ Fallback displays correct monogram.

☐ Fallback does not affect physics.

## Performance

☐ Median \>=60 FPS.

☐ p95 frame \<=18.3 ms.

☐ GPU target \<=12 ms where measurable.

☐ Draw calls target \<=250.

☐ Visible triangles target \<=750k.

☐ Gameplay particles \<=2,500.

☐ Audio voices \<=32.

☐ No sustained major frame stalls.

☐ Five race restarts do not show material memory leakage.

## Repository / Slice 0

☐ GitHub repository exists.

☐ README documents fresh setup and commands.

☐ Approved DOCX PRD is committed.

☐ docs/PRD.md exists and matches approved scope.

☐ IMPLEMENTATION-STATUS.md is current.

☐ DECISIONS.md exists.

☐ TESTING.md exists.

☐ CI pipeline passes.

☐ Clean checkout install/build succeeds.

☐ Typecheck succeeds.

☐ Lint succeeds.

☐ Tests succeed.

☐ Binary/LFS policy is configured before production assets.

☐ Slice 0 contains no gameplay implementation beyond minimal shell.

## Production

☐ Optimized production build completes.

☐ Console contains no uncaught gameplay errors.

☐ All asset paths resolve.

☐ Licenses recorded.

☐ Avatar usage rights verified.

☐ Original item presentation reviewed.

☐ WebGL2 fallback verified.

☐ Production deployment has explicit approval.

# 38. Launch & Rollback Plan

## 38.1 Candidate Build

MMM-v1.0.0-rcN

The candidate must be tested independently from local development state.

## 38.2 Launch Preconditions

- complete vertical-slice flow passes

- baseline browser matrix passes

- performance target passes

- avatar rights are verified

- production dependencies/licenses recorded

- final item/visual differentiation review completed

- production build matches approved PRD

- rollback artifact exists

- public deployment is explicitly approved

## 38.3 Rollback

Retain the previous successful production bundle. Rollback should restore the previous immutable build rather than manually undoing individual production files. A failed release should not modify player data because the vertical slice stores only local preferences.

# 39. Final Definition of Done

The v1 vertical slice is complete only when a clean browser session can:

Load site -\> enter Title Screen -\> activate audio -\> enter Hub -\> launch Kart Racer -\> choose any of 12 roster slots -\> start an eight-racer race -\> drive Circuit Alpha -\> drift through all three turbo tiers -\> collect and use items -\> complete three validated laps -\> receive a final rank -\> see complete results -\> replay or return to Hub

The same release candidate must also satisfy the 60 FPS performance criteria, physics stability, AI completion, item distribution tests, asset fallback tests, cross-browser baseline, production asset-rights requirements, and public-release approval. A successful local build alone is not evidence that this definition of done has been met.

# 40. Open Questions / Deferred Decisions

| **ID** | **Decision Needed**                                                                         | **Responsible Point**          |
|--------|---------------------------------------------------------------------------------------------|--------------------------------|
| OQ-01  | Final mapping of specific roster characters to AA-01 through AA-12 internal balance profiles | Slice 3                        |
| OQ-02  | Canonical approved portrait/cutout source package                                           | Slice 3 / Slice 6 finalization |
| OQ-03  | Circuit Alpha final environmental art theme                                                 | Before Slice 6 final art       |
| OQ-04  | Production hosting provider/domain                                                          | Launch                         |
| OQ-05  | Final music and SFX assets                                                                  | Slice 6                        |

These items do not block Slice 0, Slice 1, or Slice 2 unless a later implementation choice unexpectedly makes one technically prerequisite.

# 41. Implementation Readiness Decision

PRD state: FINAL. Slice 0 is authorized to begin from this document. No additional product clarification is required to create the repository and complete the defined bootstrap work, except where GitHub presents multiple possible repository owners/organizations and the correct destination cannot be safely inferred.

First executable implementation slice: Slice 0 - Repository & Project Bootstrap. Slice 0 must end at a healthy checkpoint with passing CI and updated repository status documentation. Cowork must stop there and wait for product-owner approval before beginning Slice 1.

# Appendix A. Slice 0 Cowork Start Prompt

Use the following prompt in Cowork with this final PRD available to the session. The same prompt is also delivered as a separate text file alongside this document.

You are beginning implementation of Manaconda's Minigame Mayhem from the attached/available final PRD v1.1.
  
Execute ONLY Slice 0 - Repository & Project Bootstrap. Do not begin Slice 1 physics or gameplay implementation.  
  
Treat the final PRD as the approved requirements baseline. GitHub must become the durable project source of truth, not this Cowork conversation.  
  
1. Repository creation and ownership  
- Check my connected GitHub first for an existing repository clearly intended for this project. Do not create a duplicate if one already exists.  
- If no project repository exists, create \`manacondas-minigame-mayhem\`.
- Create it as PRIVATE unless I explicitly tell you otherwise.  
- If GitHub gives you multiple plausible owners/organizations and you cannot safely infer the correct owner, ask me before creating the repository. Otherwise proceed without unnecessary clarification.  
  
2. Bootstrap the technical project  
- Initialize a TypeScript + Vite SPA.  
- Use Three.js as the rendering baseline, Rapier 3D as the physics dependency, and Howler.js/Web Audio as specified by the PRD.  
- Select one package manager and commit its lockfile.  
- Configure TypeScript strictness, linting, formatting, and a test runner suitable for this stack.  
- Add package scripts at minimum for: dev, build, typecheck, lint, test, and a CI-friendly test command if needed.  
  
3. Create the repository structure required by the PRD  
Create the documented structure, including at minimum:  
- \`docs/PRD.md\`  
- \`docs/Accurate_Artistry_Game_Hub_PRD_v1.1.docx\` (retain the final approved Word PRD in the repo if the session can access the file directly; if it cannot, tell me exactly what file action remains for me)  
- \`docs/DECISIONS.md\`  
- \`docs/IMPLEMENTATION-STATUS.md\`  
- \`docs/TESTING.md\`  
- \`public/assets/characters/\`  
- \`public/assets/karts/\`  
- \`public/assets/track/\`  
- \`public/assets/items/\`  
- \`public/assets/audio/\`  
- \`src/app/\`  
- \`src/audio/\`  
- \`src/config/\`  
- \`src/game/ai/\`  
- \`src/game/camera/\`  
- \`src/game/characters/\`  
- \`src/game/items/\`  
- \`src/game/physics/\`  
- \`src/game/race/\`  
- \`src/game/track/\`  
- \`src/game/vfx/\`  
- \`src/schemas/\`  
- \`src/ui/\`  
- \`tests/\`  
- \`.github/workflows/\`  
- \`README.md\`  
- \`.gitignore\`  
- \`.gitattributes\`  
  
4. Establish repository documentation and continuity  
- Convert the final PRD into \`docs/PRD.md\` as a semantically equivalent working implementation copy. Do not simplify or drop requirements.  
- In \`README.md\`, document the product purpose, local setup, run/build/test commands, architecture summary, current slice, and links to the PRD/status documents.  
- Seed \`docs/DECISIONS.md\` with the approved architecture/repository decisions and establish a format for later decisions.  
- Create \`docs/IMPLEMENTATION-STATUS.md\` with: current slice, completed requirements, work in progress, known defects, deferred work, next recommended action, and last verified commit.  
- Create \`docs/TESTING.md\` with local/CI commands, environments, and evidence expectations.  
- Treat these repo files as the primary context for future Cowork sessions. Chat history is supplemental only.  
  
5. Configure binary asset policy before production art is added  
- Configure \`.gitattributes\` and Git LFS policy for large binary game assets before those assets enter Git history.  
- At minimum address GLB and production audio formats; also cover high-resolution character PNG/WebP assets where appropriate.  
- Document the policy so later sessions do not invent a different asset-storage approach.  
  
6. Configure GitHub Actions  
Create a CI workflow that runs on appropriate pushes/pull requests and performs:  
install -\> typecheck -\> lint -\> test -\> production build  
  
CI must use the committed lockfile and fail on validation errors.  
  
7. Minimal app-shell proof only  
- Create only enough SPA shell code to prove the project installs, serves, tests, and builds successfully.  
- Do NOT implement kart physics, Circuit Alpha gameplay, drifting, AI, items, or other Slice 1+ functionality.  
- Placeholder files/directories are acceptable where needed to establish architecture.  
  
8. Validate and repair  
- Run the full documented local validation sequence.  
- Fix any issues you can fix within Slice 0.  
- Verify the production build succeeds.  
- Push the bootstrap state and verify GitHub Actions passes.  
  
9. Close the Slice 0 checkpoint  
Before the final Slice 0 commit/checkpoint, update \`docs/IMPLEMENTATION-STATUS.md\` with the evidence and exact current state.  
  
Report back with:  
- repository URL  
- repository visibility  
- default branch  
- package manager  
- checkpoint commit SHA  
- CI result  
- clean install/build/typecheck/lint/test result  
- top-level files/folders created  
- Git LFS/binary policy configured  
- any deviations from PRD and why  
- open defects/blockers  
- whether every Slice 0 acceptance criterion passed  
- whether Slice 1 is ready to begin  
  
STOP after Slice 0. Do not begin Slice 1 until I explicitly approve the Slice 0 checkpoint.

End of PRD v1.1
