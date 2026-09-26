# Route Night Race HUD, Circuit Alpha Mini-map, and Results/Podium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the next bounded Slice 6 increment: a Route Night Race HUD and Circuit Alpha mini-map plus a cinematic post-race Results/Podium transition that uses the approved ImageGen-led visual direction while preserving the accepted race authority, item behavior, Character Select package, and Slice 5 systems.
**Architecture:** Keep gameplay truth in `KartTimeTrial` and `MinimapState`; add presentation seams in `src/ui/raceHud.ts`, `src/ui/resultsPodium.ts`, and `src/ui/raceAssets.ts`; keep `mountAppShell.ts` as the route/lifecycle coordinator; keep all copy, values, standings, map topology, controls, and accessibility live in DOM/CSS/SVG.
**Tech Stack:** TypeScript, Vite, Three.js, Vitest/jsdom, DOM/CSS/SVG, existing Route Night SVG/raster library, ImageGen-derived raster runtime derivatives, Git LFS for source/high-resolution masters, normal Git only for approved fixed-size runtime derivatives.
**Spec:** `docs/SLICE-6-RACE-HUD-RESULTS-PODIUM-DESIGN-2026-09-19.md`

## Global Constraints

- Work from merged main commit `7e8a9ea8901bef6ea4dd785780c4cc8295225ead` and preserve the accepted Character Select result recorded in PR #187 and post-merge run `35422609359`.
- Do not modify item balance/probability, item behavior, AI tactics, race authority, lap/checkpoint topology, kart identity/geometry, PBR/material assets, settings semantics, or accepted Slice 5 behavior.
- Treat the Route Night canonical target as a visual-language reference only. Generated art must be original, text-free, free of logos/commercial marks, and subordinate to live UI.
- Use ImageGen for all new artistic assets listed in the design brief: 15 item identities, one race atmosphere overlay, one Results/Podium backdrop, 12 victory poses, and 12 reaction/defeat poses.
- Keep every generated asset's source ID, reference input, preparation steps, rejection notes, dimensions, format, and SHA-256 in the provenance records before runtime use.
- Preserve fallback behavior at every asset boundary. Missing art must never block race entry, finish transition, standings, restart, driver change, or Hub return.
- Every task must add or update focused tests before moving to the next task. Finish with the complete repository validation sequence and deployed desktop/mobile acceptance.

## Review Focus

- Is the race still authoritative in `KartTimeTrial`, with the UI consuming typed snapshots rather than inventing state?
- Does the mini-map still use the exact normalized Circuit Alpha samples and stable racer IDs?
- Can any of the 12 active racers appear in the top three or places 4-8 with the correct generated art and safe fallback?
- Does the full Results/Podium stage preserve all eight standings and the three required actions on desktop and mobile?
- Are the generated assets visually additive while the Route Night UI remains legible, original, and responsive?

---

## Task 1: Establish the implementation baseline and asset worklist

- [ ] Create the implementation branch from the accepted main head; verify `git rev-parse --verify HEAD` resolves to the full PR #187 merge SHA.
- [ ] Read `docs/AGENTS.md`, `README.md`, `docs/IMPLEMENTATION-STATUS.md`, `docs/DECISIONS.md`, the design brief, `docs/TESTING.md`, `src/game/KartTimeTrial.ts`, `src/game/ui/Minimap.ts`, `src/app/mountAppShell.ts`, `src/app/itemHud.ts`, `src/app/raceMinimap.ts`, `src/style.css`, and the existing Character Select asset brief before code changes.
- [ ] Record the implementation asset worklist in `docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md` with the exact 15 item IDs, the two atmosphere paths, the twelve victory paths, and the twelve reaction paths.
- [ ] Add a focused review checklist to that brief: no embedded text/marks, approved likeness references only, text-free atmosphere, fixed dimensions, alpha behavior, runtime hashes, fallback chain, and desktop/mobile readability.

## Task 2: Generate and prepare the approved ImageGen asset pack

- [ ] Generate the 15 item identity images as a coherent text-free set using the canonical Route Night target only for indigo/cyan/violet/gold lighting flavor; keep each silhouette distinct and do not render labels, glyphs, counters, logos, or copied UI.
- [ ] Generate `public/assets/ui/route-night/race-hud-atmosphere.webp` as a restrained alpha-capable edge/energy layer with no track geometry, characters, karts, item semantics, or copy.
- [ ] Generate `public/assets/ui/route-night/results-podium-backdrop.webp` as a text-free, wide cinematic Route Night environment plate that leaves clear contrast zones for the live podium stage and standings.
- [ ] Generate `results/victory.png` and `results/reaction.png` for every AA-01 through AA-12 character using the approved roster/full-body assets as identity references. Victory poses must read celebratory; reactions must read finish-based and lower-rank without changing likeness, costume, or character identity.
- [ ] Use deterministic preparation for transparent character assets and item art: remove only intended edge-connected background, preserve subject pixels, normalize to the contract dimensions, export straight-alpha sRGBA, and reject halos, embedded copy, marks, or accidental scenery.
- [ ] Record generator output IDs and exact SHA-256 values in `docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md` and `docs/ASSET-PROVENANCE.md`. Do not ship transient source renders or unreviewed candidates.

## Task 3: Add asset mapping, storage policy, and runtime validation

- [ ] Add `src/ui/raceAssets.ts` with base-aware item-art URLs keyed by the existing `ITEM_IDS`, plus base-aware victory/reaction URLs keyed by stable character IDs. Export a total mapping and a fallback-safe lookup; do not duplicate item names or probabilities.
- [ ] Extend `src/ui/routeNight.ts` with `race-hud-atmosphere` and `results-podium-backdrop` assets and a revision query shared by the new Route Night layer.
- [ ] Add scoped `.gitattributes` exceptions for fixed-size runtime item PNGs and character `results/victory.png` / `results/reaction.png` derivatives only after their final dimensions and hashes pass validation. Keep all high-resolution/generated masters under LFS governance.
- [ ] Extend `tools/verify-runtime-assets.mjs` to validate the 15 item PNGs and 24 character result PNGs for signature, dimensions, RGBA channels, transparent corners, and recorded hashes; add WebP signature/dimension checks for the two atmosphere assets.
- [ ] Add the new asset brief and all provenance rows before wiring runtime imports. Run the asset verifier independently and confirm it fails on a missing file, wrong dimensions, non-transparent corner, or changed hash.

## Task 4: Enrich the standings identity contract without changing race authority

- [x] In `src/game/KartTimeTrial.ts`, introduce a named `RaceStanding` shape containing stable racer ID, stable character ID, display name, portrait URL, locked place, and locked finish time; keep `RaceResult` as the existing player result envelope.
- [x] Store the AI character ID alongside each opponent when `createOpponents` selects the seven-character roster. Populate the player standing from the selected manifest character.
- [x] Update `resultStandings()` and the `onStandings` callback to return the enriched identity fields while preserving authoritative order, locked player place/time, late-finisher updates, and all existing cleanup semantics.
- [x] Add `tests/race-results.test.ts` covering eight unique racers, player identity, stable character IDs, authoritative sort order, late AI finishes, and unchanged locked player result.
- [x] Keep the contract compatible with existing tests and callers by retaining `name`, `place`, and `time` fields with the same meanings.

## Task 5: Build the Route Night race HUD presentation seam

- [ ] Create `src/ui/raceHud.ts` with `raceHudMarkup` and `updateRaceHud`. Move presentation-only DOM updates out of the large inline closure in `mountAppShell.ts` while keeping `HudState` as the input contract.
- [ ] Preserve every current HUD value and warning: lap, elapsed time, speed, surface, position, countdown, wrong-way, seeker, Apex, item-use feedback, item test mode, drift tier/charge, Frost, Nitro Overdrive, Hyper-Drive Rocket, Prismatic, Ink, and performance badge.
- [ ] Add a semantic `data-race-hud` structure with explicit groups for route/lap/position, race time/speed, item state, drift/boost state, and warnings. Keep numeric values and labels as live DOM text, not image pixels.
- [ ] Replace the Unicode item glyph with the mapped 512 × 512 item art while retaining accessible item name, live charge count, roulette progress, and a text fallback when the image fails.
- [ ] Insert the race atmosphere layer beneath HUD controls with `aria-hidden`, `pointer-events: none`, lazy-safe loading, and reduced-motion-safe styling.
- [ ] Add `tests/race-hud.test.ts` for markup groups, every `HudState` update path, item art mapping, warning visibility, charge count, missing-image fallback, and reduced-motion data attributes.

## Task 6: Restyle and harden the shared Circuit Alpha mini-map

- [ ] Update `src/app/raceMinimap.ts` only at the presentation seam: retain `normalizeMinimapTrack`, `minimapPointAtProgress`, stable marker IDs, portrait head crops, and SVG path geometry.
- [ ] Add the Route Night route frame, cyan track line, restrained edge energy, gold player marker, dark opponent outlines, optional start/finish node, and accessible label without embedding copy into an image.
- [ ] Keep the map non-interactive, below the lap block on desktop, in the upper-left HUD column on mobile, clear of countdown/rear/reset/touch controls, and hidden once the Results/Podium state begins.
- [ ] Verify that updating the same eight racers reuses markers, removes finished/disposed racers, never duplicates DOM nodes, and keeps player/opponent identity distinct.
- [ ] Extend `tests/minimap.test.ts` for eight markers, marker reuse/removal, player emphasis, portrait fallback, route-frame markup, and finish-state hiding.

## Task 7: Implement the cinematic Results/Podium transition

- [ ] Create `src/ui/resultsPodium.ts` with pure render helpers for top-three selection, lower-rank reaction selection, all-eight standings, ordinal labels, time formatting, fallback chains, and action markup.
- [ ] Render `results-podium-backdrop.webp` behind the live stage. Keep the first-place hero centered, second/third heroes offset left/right, and places 4-8 represented in a compact finish-reaction rail tied to their authoritative rank.
- [ ] Use `results/victory.png` for places 1-3 and `results/reaction.png` for places 4-8. Resolve every asset from stable `characterId`; never infer art from array index or display name.
- [ ] Keep all eight rows visible/reachable with place, display name, and locked time. On narrow screens let the standings scroll within the Results panel while the primary actions remain reachable.
- [ ] Add `RACE AGAIN`, `CHANGE DRIVER`, and `RETURN TO HUB`. Race Again disposes the finished game and starts the same selected character; Change Driver returns to Character Select; Return to Hub uses the existing Hub route.
- [ ] Add image error fallback listeners: result pose → selection full-body → portrait → monogram. Fallback must preserve dimensions and never throw from an image event.
- [ ] Update `mountAppShell.ts` to mount the Results/Podium stage on `onFinish`, keep rendering late standings until all eight finish, hide the mini-map/nonessential HUD, and cleanly dispose the race instance before route changes.
- [ ] Add `tests/results-podium.test.ts` for all eight rows, first/second/third ordering, player in each possible place, 4th-8th reaction mapping, missing-art fallback, late finish refresh, three actions, and reduced-motion markup.

## Task 8: Apply responsive Route Night styling and accessibility rules

- [ ] Update `src/style.css` for the new HUD groups, item art, race atmosphere, mini-map, finish transition, podium stage, lower-rank rail, standings scroll region, and action row.
- [ ] Preserve the approved Route Night grammar: graphite/indigo surfaces, cyan route lines, violet energy, gold selected/primary state, clipped geometry, dense route-board labeling, high-contrast silhouettes, and readable live copy.
- [ ] Add desktop and mobile breakpoints that keep the map and warnings clear of touch controls, protect safe-area insets, prevent horizontal scrolling, and keep the Results actions reachable above the mobile viewport edge.
- [ ] Add focus-visible styles for all Results actions and live status regions. Use `aria-live` only for changing status, not for the complete standings table on every frame.
- [ ] Add `prefers-reduced-motion` rules that remove pose entrance/parallax/pulse transitions while retaining the same static hierarchy and fallback behavior.
- [ ] Verify no decorative layer captures pointer input and no generated image contains readable UI copy.

## Task 9: Expand automated integration coverage

- [ ] Extend `tests/app-shell.test.ts` for Race → Results route state, enriched result markup, finish-state minimap hiding, Race Again, Change Driver, Return to Hub, and selected-character preservation.
- [ ] Extend `tests/route-night-ui.test.ts` for the two new atmosphere asset URLs, live Results/Podium route markers, button frames/icons, and no regression to Title/Hub/Character Select.
- [ ] Extend `tests/item-hud-input.test.ts` or add `tests/item-art.test.ts` to assert one image mapping for every existing `ITEM_IDS`, exact text names, charge counts, and no new item behavior.
- [ ] Add test fixtures that cover a player finish in places 1 through 8, seven distinct AI characters, all eight standings, and a late final AI finish after the player's result opens.
- [ ] Keep all existing Slice 5, race-authority, item, AI, Character Select, settings, and PBR tests unchanged except for the enriched result-type fixtures they must explicitly satisfy.

## Task 10: Run verification and collect the release evidence

- [x] Run focused suites for race HUD, mini-map, results/podium, app shell, route-night UI, item art, race results, and Character Select. **2026-09-25:** `npx vitest run tests/race-hud-ui.test.ts tests/minimap.test.ts tests/results-podium.test.ts tests/results-routing.test.ts tests/app-shell.test.ts tests/route-night-ui.test.ts tests/item-hud-input.test.ts tests/race-results-assets.test.ts tests/race-results.test.ts tests/character-select-ui.test.ts --coverage=false` passed **10 files / 79 tests**.
- [x] Run the full repository sequence: `npm run typecheck`, `npm run lint`, `npm run test:ci`, `npm run build`, branding/runtime-asset validation, `git diff --check`, and `git lfs fsck`. **2026-09-25:** `npm run validate` passed typecheck, zero-warning lint, **72 files / 584 tests**, branding/runtime-asset verification, and production build; `git diff --check` and `git lfs fsck` passed.
- [x] Record the complete test-file/test-count and coverage output, the production-build result, runtime asset hashes, and any known nonblocking warnings without changing unrelated historical formatting. **2026-09-25:** coverage was **81.93% statements / 76.25% branches / 87.07% functions / 83.64% lines**; the build emitted the existing non-blocking `KartTimeTrial` large-chunk warning. Runtime asset verification checked 18 Results/Podium assets including the backdrop, 36 materialized GLBs, and 135 character PNGs. Exact approved source/runtime hashes remain in `docs/ASSET-PROVENANCE.md` and `docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md`; the backdrop runtime SHA-256 is `24812fcd47e20c28601cbdcc15e1f824a3e17b1fdd679c346578bb600a539465`.
- [ ] Run the five-restart cleanup/memory check. Confirm no material increase, stale markers, orphaned DOM nodes, undisposed game instance, or results-only asset leak remains across Race Again, Change Driver, and Hub return.
- [ ] Run the hosted PR CI and post-merge CI/Pages workflow only through the normal repository process. **2026-09-25:** GitHub showed no open PR for this branch and no PR-triggered workflow run for commit `1c942fc2c5913859bc46d7a22188e132a15f6822`; hosted CI and Pages are therefore pending. Do not claim deployed acceptance from local or CI-only evidence.

**Five-restart evidence, 2026-09-25:** still pending. The existing `tests/results-routing.test.ts` verifies one mocked cycle per action: Race Again calls disposal and preserves the selected character; Change Driver and Return to Hub call disposal and route correctly. It does not exercise repeated cycles, real `KartTimeTrial` resource cleanup, marker/DOM accumulation over five restarts, browser memory, or Results-only network/image-cache residency. Repository inspection found no whole-app browser memory/soak harness. This is not a five-restart memory pass; keep Task 10 open until suitable evidence is collected.

## Task 11: Perform the deployed visual acceptance and reconcile docs

- [ ] Review the deployed flow on representative desktop and mobile sizes: Title → Hub → Character Select → Race → finish in 1st, 2nd, 3rd, and 8th → Results/Podium → Race Again / Change Driver / Return to Hub.
- [ ] Check all 15 item visuals at readable HUD size, all eight mini-map markers, player/opponent marker contrast, countdown/warning clearance, touch-control clearance, atmosphere restraint, top-three composition, 4th-8th reactions, all-eight standings access, fallback, and reduced motion.
- [ ] Compare the deployed result directly with the canonical Route Night target and the design brief; reject any generated asset with embedded copy, copied marks, unreadable silhouette, or an atmosphere layer that competes with live data.
- [ ] After Manny's explicit deployed acceptance, update `docs/IMPLEMENTATION-STATUS.md`, `docs/TESTING.md`, `docs/DECISIONS.md`, the design/asset briefs, and `README.md` with the final merge SHA, hosted run, asset hashes, acceptance result, and any bounded defect.
- [ ] Keep pause, final audio, post-processing, and unrelated Slice 6 work explicitly deferred unless a separate approval changes the scope.

## Separately approved runtime subset — 2026-09-23

Manny approved the Results/Podium runtime work that can proceed while the remaining image assets are pending. Task 4 above is complete. The feature branch also adds rank-ordered podium and lower-finisher DOM, all-eight standings, updates for late AI finishes, identity-keyed use of the six approved victory poses, the approved full-body → portrait → monogram fallback, the three race actions, responsive styling, and reduced-motion-safe static presentation.

This subset does not complete the ImageGen pack, reaction poses, backdrop, full Race HUD/mini-map styling, the entire Task 7/8/9 acceptance scope, or deployed desktop/mobile visual review. No merge or deployment is included. Remaining checkboxes continue to describe the full increment.

## Handoff

The original handoff anticipated a documentation-only plan branch. Manny later approved the bounded runtime subset above on the existing feature branch. Continue the remaining plan work only under its separate asset and acceptance gates; the current branch checkpoint makes no deployment or visual-acceptance claim.

**Browser evidence 1, 2026-09-25:** the current GitHub Pages URL renders the Route Night Title, but the workflow deploys only `main` (`7e8a9ea8901bef6ea4dd785780c4cc8295225ead`) while the feature branch is `cf9e357bb8faa88696865e28ab56323e15df1eee`. Its Title-state DOM counts and inaccessible `window.performance` provide no five-restart evidence. Use a branch-matched local preview for local lifecycle observations; keep deployed acceptance pending.

**Browser evidence 2, 2026-09-25:** Vite started on loopback, but the connected cloud browser blocked `127.0.0.1` and `localhost` with `ERR_BLOCKED_BY_CLIENT`; its URL policy denied further inspection. No feature-branch race or cleanup measurements were possible. Vite was stopped. Keep five-restart and deployed acceptance pending; resume with an approved browser-reachable branch preview, without working around browser policy.

**Browser evidence 3, 2026-09-25:** to supply Manny a GitHub gameplay link while preserving the usual game, temporary workflow commit `81f59f2831891c609c5bc4c0526a2de3034849aa` built `main` (`7e8a9ea8901bef6ea4dd785780c4cc8295225ead`) at the Pages root and the feature branch at the intended `/previews/race-hud-results/` path. Local `npm run build -- --base /manacondas-minigame-mayhem/previews/race-hud-results/` and targeted workflow Prettier passed. Hosted run [`36194146120`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36194146120) passed both LFS checks, both builds, and the 141 MB artifact upload (`sha256:cf9bf34768b390d252c57183b75c247f1dd1ea5156ddee2e70ba87b6c68283ba`). The deploy job never started: GitHub reported `Branch "feature/slice6-race-hud-minimap-results-podium" is not allowed to deploy to github-pages due to environment protection rules.` The temporary workflow was removed. The normal Pages script and stylesheet remained `assets/index-Dt74Qa1M.js` and `assets/index-612kuw8p.css` before and after the attempt. No branch preview URL, race cycles, real-instance disposal, stale DOM/marker count, Results-only asset request/residency result, or memory measure exists. Task 10 remains inconclusive and Task 11 deployed visual review remains pending.

**Browser evidence 4, 2026-09-25:** Manny approved a temporary workflow-only `main` change. Commit `29fad5d1e66de2fff9f3007bafedb4c2f551df09` pinned feature revision `5ed7199a92061f1b9034ab7b69a6e6a18660fe92` under `https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/`; hosted CI/Pages [run `36212375736`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36212375736) passed validation and deployment. Local `main` `npm ci && npm run build`, `npm run validate` (67 files / 536 tests), targeted workflow Prettier, `git diff --check`, and `git lfs fsck` passed. Connected Chrome rendered the preview Title with preview-relative `index-UqrfspIU.js` and `index-wawQ29f5.css`; the usual root Title still loaded `index-Dt74Qa1M.js` and `index-612kuw8p.css`. This is preview availability and root-bundle identity evidence only. No five-cycle race, disposal, stale-marker/DOM, Results-only asset, or memory result was observed. Task 10 and Task 11 acceptance checkboxes stay open pending their respective evidence and Manny's explicit acceptance.

**Browser evidence 5, 2026-09-26:** Manny reported a desktop Character Select defect: at 100% zoom (1915 × 902 screenshot), the statistics and START RACE fell below the screen, but at 75% (1910 × 906 screenshot) they appeared. Connected Chrome reproduced at 1363 × 936 CSS pixels on the pinned preview: START RACE bottom 1032.59 px, screen bottom 1128.13 px, `scrollHeight = clientHeight = 1128 px`, body scrolling disabled. A local CSS correction bounds the screen to 100svh and compacts the hero stage on shorter desktops. Focused 3 files / 20 tests and `npm run validate` (72 files / 584 tests) passed. The correction is not yet published or browser-verified; Task 10 and Task 11 remain open. No restart cycles or cleanup/memory measure were collected in this observation.

**Browser evidence 6, 2026-09-26:** feature commit `d06e9ead16214304deb15086ffc78d579f39db02` was pinned by `main` workflow commit `ff474bd71c679748feeff820a105153bf639767b`; [CI/Pages run `36253714178`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36253714178) passed. Connected Chrome observed the new preview CSS `index-DN4ieFcL.css` and measured START RACE bottom 830.61 px at 1363 × 936, within view. A screenshot exposed a new defect: the full-body driver image clipped at the knees because it was 383.06 px high inside a 207.95 px art lane. A local follow-up removes the image's intrinsic minimum height to fit the lane; it remains unpublished and unverified. Task 10 cleanup/memory and Task 11 acceptance remain open.

**Browser evidence 7, 2026-09-26:** feature commit `c13aa67fa5fc5929c3efde9c0ffc9a119a8d8aa1` was pinned by `main` workflow commit `ab49071802c0d8dcac95dc3eb7b1244c175128d6`; [CI/Pages run `36254115150`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36254115150) passed. Connected Chrome reloaded the preview at 1363 × 936 and observed `index-C4TC_rqF.css`. The driver image and lane both measured 207.95 px high with matching top/bottom; screenshot showed full head-to-shoes silhouette, stats, and START RACE. The button bottom was 830.61 px, within viewport. Normal root JS/CSS remained `index-Dt74Qa1M.js` / `index-612kuw8p.css`. This passes only the inspected preview desktop control/art check. Manny's 1915 × 902 view, mobile, actual GLB appearance, five-restart cleanup/memory, and full Task 11 acceptance remain open.
