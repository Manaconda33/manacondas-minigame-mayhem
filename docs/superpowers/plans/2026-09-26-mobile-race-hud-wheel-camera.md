# Mobile Race HUD, Wheel, and Camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give portrait mobile players a readable race view and thumb controls, with a wheel that accelerates on contact and an item button that displays the held item.

**Architecture:** Keep `HudState` and `ItemHudSnapshot` authoritative. Add a small pointer-wheel adapter and a pure drive-input combiner, then compose them through the existing `KartTimeTrial` input path. Reflow only coarse/no-hover race HUD sessions and select a mobile-only forward chase framing; keep desktop and rear framing established.

**Tech Stack:** Vite, TypeScript, Three.js, DOM/CSS/SVG, Vitest, GitHub Pages branch preview.

**Spec:** `docs/superpowers/specs/2026-09-26-mobile-race-controls-camera-character-art-design.md`

## Global Constraints

- Inspect Manny's preferred mockup `Image 4.png` (Library ID `libfile_afbfc12171208191a519eef0fbe45a5a`), current mobile HUD screenshot `image(4).png` (`libfile_697c52186a6c81918aa4e3114a65ee16`), and current camera `Image 3.jpg` (`libfile_9292ca3e458c8191ab8edac4ca4f01b8`). The mockup controls/layout guide composition; its illustrative icons, numbers, fuel/gear/boost gauges, and cropped white area are not runtime assets.
- The wheel accelerates even at center. Brake/Reverse overrides it regardless of press order; release of Brake/Reverse restores acceleration if the wheel remains held; release/cancel of the wheel coasts absent keyboard input.
- Use approved item graphics and existing base-aware URL mapping. The item action begins with an empty slot; final held art appears only after roulette locks, then clears when inventory empties.
- Touch UI renders only when `(hover: none) and (pointer: coarse)`; keep keyboard bindings, item semantics, race authority, kart/AI physics, rear camera, and Results routing intact.
- No approved asset changes, new plugins, Vercel, production deployment, GitHub Pages setting change, unrelated balance/audio/post-processing, or acceptance-gate closure.

## Review Focus

- Two-finger input order: wheel, brake, drift and item presses never leave throttle stuck or lose the backward item modifier.
- Interrupted pointer capture or hidden tab: release wheel input on cancel, lost capture, visibility change and route disposal.
- Roulette and missing item image: no premature final art or blank action target; accessible item identity remains.
- Very narrow portrait screen and safe insets: buttons remain distinct and usable without hiding racers or warnings.
- Spinout and rear-view transitions: mobile forward framing never changes existing rear camera or driver-facing state selection.

---

### Task 1: Wheel state and input priority

**Files:**

- Create: `src/app/touchWheel.ts` (DOM pointer capture and normalized wheel state)
- Create: `src/game/input/composePlayerDrive.ts` (pure touch/keyboard drive composition)
- Modify: `src/app/touchControls.ts`, `src/app/mountAppShell.ts:475-495`, `src/game/KartTimeTrial.ts:225-230,450-462,508-529`
- Test: `tests/touch-wheel.test.ts`, `tests/player-drive-input.test.ts`, `tests/item-hud-input.test.ts`

**Interfaces:**

- `bindTouchWheel(element: HTMLElement, onChange: (state: WheelState) => void): () => void` where `WheelState = { held: boolean; steering: number }`; returned function releases capture/listeners and emits neutral state.
- `KartTimeTrial.setTouchWheel(state: WheelState): void` stores the touch wheel state; existing `setTouchControl(control: string, pressed: boolean)` keeps discrete actions.
- `composePlayerDriveInput(keyboard: { forward: boolean; reverse: boolean; left: boolean; right: boolean }, touch: { wheel: WheelState; brake: boolean }): { throttle: -1 | 0 | 1; steering: number }`; left has the existing positive steering sign, right negative. Preserve keyboard forward/reverse precedence when no wheel is held.

- [x] **Step 1: Write failing tests** for center/left/right pointer steering (clamped to ±1), wheel contact throttle, brake before/after wheel press, restoration, wheel release/cancel/lost capture/visibility cleanup, simultaneous drift/rear/item controls, and return-to-route disposal. Add a regression test for keyboard precedence and backward item use.
- [x] **Step 2: Run** `npx vitest run tests/touch-wheel.test.ts tests/player-drive-input.test.ts tests/item-hud-input.test.ts`; expected failures from missing interfaces/markup were observed.
- [x] **Step 3: Implement** the wheel adapter, state combiner, wheel markup with accessible name, and app-shell binding/disposer. Route wheel state through `KartTimeTrial` and merge throttle/steering with existing keyboard inputs; leave the physics controller and special-item input modifiers unchanged. One pointer owns the wheel, other buttons keep their own capture.
- [x] **Step 4: Run** the same focused suites; `15/15` tests passed. `npm run validate` passed typecheck, lint, `74/74` files and `594/594` tests, runtime asset checks, and build. Wheel release, cancel, lost capture, hidden-document, independent control markup, and disposer cleanup are covered. Game disposal neutralizes stored wheel state.
- [x] **Step 5: Commit** as `feat: add mobile steering wheel drive input`.

**Evidence:** focused tests passed after the expected red run; full validation passed on 2026-09-26. `touchWheel.test.ts` reports 100% line coverage. Build emitted the existing large `KartTimeTrial` chunk warning.

### Task 2: Compact item action and race HUD

**Files:**

- Modify: `src/app/touchControls.ts`, `src/app/raceHud.ts`, `src/app/itemHud.ts`, `src/app/mountAppShell.ts:365-465`, `src/style.css:730-790,4077-4555`
- Test: `tests/item-hud-input.test.ts`, `tests/race-hud-ui.test.ts`

**Interfaces:**

- Consumes: `ItemHudSnapshot` from existing `updateHud`; Task 1 touch controls and wheel.
- Produces: `updateTouchItemButton(button: HTMLElement, state: ItemHudSnapshot): void` in `src/app/itemHud.ts`, using `routeNightItemAssetUrl` and the same error fallback convention as the main item HUD.

- [x] **Step 1: Write failing tests** for empty slot, neutral roulette, held approved art URL and charge label, consumed empty slot, image-load fallback, item button keyboard/accessibility label, and a single `data-race-region` per HUD value. Pin coarse-only touch markup and preserved warning IDs.
- [x] **Step 2: Run** `npx vitest run tests/item-hud-input.test.ts tests/race-hud-ui.test.ts`; expected missing-interface and markup failures were observed.
- [x] **Step 3: Implement** the item-button projection from the existing snapshot and compact mobile CSS for lap/time/speed/position/minimap, lower wheel/action row, item/drift/effect state and recovery. Keep countdown and warnings legible; do not render example mockup numbers or new gauges. Desktop layout stays intact.
- [ ] **Step 4: Run** the focused suites; expect pass. Inspect actual 360–430 CSS-pixel portrait viewports with safe-area emulation/real mobile; test a held item, empty item, drift, warning, and Results transition. Adjust overlap and tap targets from browser evidence.
- [x] **Step 5: Commit** as `feat: organize mobile race HUD and item action`.

**Evidence so far:** focused suites passed (`15/15` tests), and full `npm run validate` passed (`74/74` test files; `599/599` tests, typecheck, lint, runtime asset checks and build). GitHub Actions run 620 passed and refreshed the isolated preview at commit `194f9b5`; the ordinary main URL still loads its unchanged main-branch assets. The browser viewport is 1363×936 with `pointer: coarse` and `hover: none` both false, and the available browser interface has no viewport emulation control. Local browser navigation remains rejected with `net::ERR_BLOCKED_BY_CLIENT`. The branch preview race DOM renders, but its WebGL context is disabled in this browser, so the game stays at initialization and live control behavior cannot be visually inspected. The required 360–430 portrait view remains unobserved; keep Step 4 open for a real mobile/safe-area view.

### Task 3: Mobile forward chase framing

**Files:**

- Modify: `src/game/camera/ChaseCamera.ts`, `src/game/KartTimeTrial.ts:330-340`
- Test: `tests/chase-camera.test.ts`

**Interfaces:**

- `new ChaseCamera(camera: THREE.PerspectiveCamera, mobileForward = false)`; `KartTimeTrial` passes the existing coarse/no-hover session result. The `update(position, forward, rearView, dt)` signature stays unchanged.

- [x] **Step 1: Write failing tests** showing mobile forward framing targets more road/less sky than desktop after intro, while desktop chase height/distance and rear-view height/distance remain at established values; test switching rear/forward and spinout anchor behavior.
- [x] **Step 2: Run** `npx vitest run tests/chase-camera.test.ts`; the new mobile comparison failed before implementation as expected.
- [x] **Step 3: Implement** a mobile forward-only look target/position profile, preserving intro continuity and existing rear profile. Do not crop the renderer or alter physics and checkpoint coordinates.
- [ ] **Step 4: Run** the camera suite; expect pass. Inspect actual gameplay on narrow portrait and desktop preview: horizon, road sightline, racer position, hazards and rear view. Tune numeric values from screenshots rather than treating geometry tests as pixel acceptance.
- [x] **Step 5: Commit** as `feat: frame mobile race toward the road`.

**Evidence so far:** `tests/chase-camera.test.ts` passed (`7/7` tests); typecheck, targeted lint, diff check and LFS check passed. Pixel inspection remains open under the same browser limitation recorded at Task 2. Retest the camera after the next authorized preview refresh; keep Task 11 acceptance pending.

### Task 4: Integrated validation and preview review

**Files:**

- Modify: `docs/TESTING.md`, `docs/IMPLEMENTATION-STATUS.md`, `docs/superpowers/plans/2026-09-19-race-hud-results-podium.md`

**Interfaces:**

- Consumes: Tasks 1–3, exact GitHub feature commit and branch preview.
- Produces: review record and explicit remaining Task 10/11 gates.

- [ ] **Step 1: Run** `npm run validate`; focused `npx vitest run tests/touch-wheel.test.ts tests/player-drive-input.test.ts tests/item-hud-input.test.ts tests/race-hud-ui.test.ts tests/chase-camera.test.ts tests/character-select-ui.test.ts`; targeted Prettier; `git diff --check`; `git lfs fsck`. Fix any failures before requesting publication.
- [ ] **Step 2: Publish** only the validated feature branch via connected GitHub integration when publication is authorized in the active session. Pin the existing non-production GitHub Pages branch preview to the new commit only with authorization; ordinary main URL must remain unchanged.
- [ ] **Step 3: Inspect** the branch preview on desktop and real mobile through Title → Hub → Character Select → Race → Results. Exercise center/left/right wheel, Brake/Reverse priority, drift, rear view, item pickup/roulette/held/use/backward use, recovery, warnings, and Results routes. Record exact device/viewport, URL, commit, measurements and defects. This preview does not itself pass Task 11 deployed acceptance.
- [ ] **Step 4: Record** evidence and limitations in the three documents; keep Task 10 five-restart cleanup/memory inconclusive until its separate five-cycle real-game measure is established and Task 11 pending Manny's deployed review. Re-run full/focused validation, targeted Prettier, diff check and LFS fsck after evidence edits, then publish only authorized documentation.
