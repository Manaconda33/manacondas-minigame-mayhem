# Character Select Driver Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the selected full-body driver prominent at 100% desktop zoom without hiding stats, Start Race, kart, or the character's feet.

**Architecture:** Adjust the existing profile stage's grid and art sizing in CSS while preserving the approved image source and current responsive fallback. Use browser measurements and screenshots to verify geometry because DOM unit tests cannot establish the visual result.

**Tech Stack:** Vite, TypeScript, CSS, Vitest, GitHub Pages branch preview.

**Spec:** `docs/superpowers/specs/2026-09-26-mobile-race-controls-camera-character-art-design.md`

## Global Constraints

- Use Manny's desktop reference `image(3).png`, Library ID `libfile_a4459ce90fa881918d7bdf6709055d52`; inspect its actual image. The desired driver is larger than its current approximately 170 px silhouette.
- Preserve approved character images, kart models, identities, and manifest URL/revision contracts.
- Preserve responsive mobile selection, image fallback, six stats, Start Race, and 100% desktop zoom reachability.
- GitHub is source of truth. Publish only to `feature/slice6-race-hud-minimap-results-podium` after local validation and the project's publication gate; do not alter production Pages or approved assets.

## Review Focus

- Tall, narrow driver silhouettes: full head and feet remain visible; inspect at least Lavi and Dragon Queen.
- Long character names: copy does not overlay the driver's face.
- Short desktop viewport: stats and Start Race remain visible or reachable by actual scroll.
- Kart loading failure: fallback remains visible beside the driver.
- Coarse mobile viewport: the prior stacked selection layout and button remain usable.

---

### Task 1: Desktop profile composition

**Files:**

- Modify: `src/style.css:3419-3540,3829-4005`
- Test: `tests/character-select-ui.test.ts`

**Interfaces:**

- Consumes: existing `.character-hero-stage`, `.character-hero-identity-lane`, `.character-driver-art-lane`, `.character-hero-driver`, and `.character-kart-lane` markup from `src/ui/characterSelect.ts`.
- Produces: CSS-only layout change; no changed TypeScript API.

- [ ] **Step 1: Write a failing markup contract** in `tests/character-select-ui.test.ts` that checks the selected driver and kart have distinct lanes, the selected driver points at the approved selection-art URL, the six stats and Start Race exist, and the fallback remains available. If existing assertions already cover these, add only the uncovered regression.
- [ ] **Step 2: Run** `npx vitest run tests/character-select-ui.test.ts`; confirm the new assertion fails for a real missing contract, or record that existing coverage makes a new unit test redundant. The visual size itself needs browser evidence.
- [ ] **Step 3: Adjust** `src/style.css` to allot more width/height to the driver while keeping its image `object-fit: contain`, both lanes unclipped, and the compact-height rule compatible with the stats/footer. Do not increase the overall page beyond the viewport without functional scrolling.
- [ ] **Step 4: Run** `npx vitest run tests/character-select-ui.test.ts`; expect pass. Review 100% zoom at approximately 1915 × 902 and 1363 × 936 desktop viewports plus a narrow coarse mobile viewport using the branch preview when published. Record driver/lane and Start Race bounding rectangles; inspect Lavi, Dragon Queen, a long name, and kart fallback. Revise CSS if feet, button, or stats are clipped.
- [ ] **Step 5: Commit** the focused code/test edit with `fix: enlarge selected driver without clipping controls`.

### Task 2: Checkpoint and preview evidence

**Files:**

- Modify: `docs/TESTING.md`, `docs/IMPLEMENTATION-STATUS.md`, `docs/superpowers/plans/2026-09-19-race-hud-results-podium.md`

**Interfaces:**

- Consumes: Task 1 commit and exact branch preview URL/commit.
- Produces: recorded visual evidence with unresolved acceptance gates explicit.

- [ ] **Step 1: Run** `npm run validate`, `npx vitest run tests/character-select-ui.test.ts`, targeted `npx prettier --check` for edited files, `git diff --check`, and `git lfs fsck`; record exact outputs.
- [ ] **Step 2: Publish** only the authorized feature-branch checkpoint through the connected GitHub integration. If publication approval is not already present in the active session, present the validated commit/diff for Manny's approval before updating the remote ref.
- [ ] **Step 3: Review** the browser-reachable `https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/` after the preview workflow pins the new feature commit, if that workflow change is authorized. Verify the ordinary root still serves main. Do not equate preview with deployed Task 11 acceptance.
- [ ] **Step 4: Record** exact preview commit, URL, viewport, measurements, screenshots/observations, limitations, and unresolved Task 10/11 gates in the three evidence documents. Run focused/complete validation, targeted Prettier, `git diff --check`, and `git lfs fsck` after documentation edits. Publish only authorized docs to the feature branch.
