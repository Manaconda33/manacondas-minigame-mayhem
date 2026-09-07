# Testing and Validation

This file is the operational source of truth for local and CI validation. Update it when commands, environments, or evidence requirements change.

## Supported environment

- Node.js 22 LTS or newer compatible release
- npm from the selected Node.js installation
- Modern Chromium, Firefox, or Safari for manual browser checks
- Git LFS 3.x before adding production binary assets

## Clean local validation

From the repository root:

```bash
npm ci
npm run typecheck
npm run lint
npm run test:ci
npm run build
```

`npm run validate` runs the validation stages after dependencies are installed. `npm run test` starts Vitest in watch mode for development.

## CI validation

GitHub Actions runs `.github/workflows/ci.yml` on pushes and pull requests targeting `main`:

1. Check out the repository.
2. Set up Node.js 22 with npm caching.
3. Install exactly from `package-lock.json` with `npm ci`.
4. Run strict TypeScript checks.
5. Run ESLint with zero warnings allowed.
6. Run Vitest once with coverage evidence.
7. Produce a Vite production build.
8. On a healthy push to `main`, publish `dist/` through the `github-pages` deployment environment.

Any failed stage fails the workflow.

The production checkout must use `lfs: true`, run `git lfs fsck`, and execute the runtime-asset signature gate through `npm run build`. A pointer file in any required runtime GLB path must fail the build rather than silently deploying a fallback kart.

## Restricted Work LFS publication

When direct Git/LFS push is blocked, follow `docs/LFS-PUBLISHING.md`. A valid checkpoint requires:

- A committed deterministic builder and pinned dependencies.
- SHA-256 checks matching every approved LFS object ID.
- An unchanged-pointer check after the runner regenerates and stages the files.
- A successful object-ID-only LFS upload.
- A fetch from GitHub after the runner deletes its local LFS cache.
- A passing `git lfs fsck` after that fetch.
- Removal of the temporary workflow before review or merge.

The bridge is not valid evidence for a binary that cannot be reproduced byte-for-byte from committed source.

## Manual confirmation deployment

Every Slice 1+ checkpoint must provide a live GitHub deployment URL, normally:

`https://manaconda33.github.io/manacondas-minigame-mayhem/`

The deployment must originate from the reported checkpoint commit after validation. The product owner uses it for manual confirmation. A passing deployment does not imply approval; the next slice remains locked until explicit approval is recorded.

## Evidence expectations

Every slice done-check must record fresh evidence in `docs/IMPLEMENTATION-STATUS.md`:

- Commands executed and whether each passed.
- Test counts and meaningful coverage or scenario evidence.
- Production build result and generated output summary.
- Manual browser/device evidence when the slice changes rendered behavior.
- GitHub Actions workflow result for the checkpoint commit.
- GitHub deployment environment, live URL, and deployed commit.
- Manual confirmation scenarios appropriate to the slice.
- Known defects, deferred checks, and environmental limitations.
- Exact checkpoint commit SHA.

Code presence alone is not completion evidence.

## Player speed-stat regression

Run the automated controller checks on flat asphalt with full throttle, no boost, no steering, and no collisions:

- Every `characterManifest` profile must converge to its `createKartTuning(stats).maxSpeed` value after ten simulated seconds.
- Two otherwise identical profiles with the same Speed and different Acceleration must differ after one second, with the higher-Acceleration profile ahead, then converge to the same sustained maximum.
- A failure means Acceleration, mass, passive damping, collider friction, or another downstream force has regained control of terminal road speed.

For live acceptance, compare Krios, Accu, Kraken, and Lula on the same asphalt straight without boost. Confirm that higher Speed produces the higher sustained maximum, while Acceleration remains visible in time-to-speed. Repeat on desktop and mobile, and record the deployed commit and observed speeds in `docs/IMPLEMENTATION-STATUS.md`.

## Acceleration, surface-transition, and AI-lane regression

- `createKartTuning` must map Acceleration 4 to 6.2 m/s² and Acceleration 8 to 8.4 m/s² before the documented speed-ratio taper.
- Two otherwise identical Speed 8 profiles with Acceleration 4 and 8 must differ by more than 2 m/s after one second. The Acceleration 4 profile must remain below 75% of its maximum after three seconds, and both must still converge to the same Speed-defined ceiling.
- A kart entering dirt or grass at full asphalt speed must lose less than 0.3 m/s during its first simulated frame, then converge to the correct Traction-defined surface maximum within four seconds.
- Every configured AI profile must complete three validated laps, spend less than 2% of simulated frames on grass, and remain within 0.5 meters of the road boundary.
- In the two-kart passing scenario, the faster AI must commit to an adjacent road-bounded lane, move ahead of the slower racer, and remain within the road boundary.

For live acceptance, compare Krios or Accu against Lavi or Lula from a standing start; drive from asphalt into both dirt and grass without braking; and observe a full AI pack through several corners. Confirm a visible launch/recovery difference, progressive off-road slowdown, no systematic inside-grass line, and lateral overtaking around slower racers.

## AI Speed-stat authority regression

- A clear-straight neutral AI target must equal its selected character's `createKartTuning(stats).maxSpeed`, regardless of grid profile pace.
- Profile pace must affect the curvature penalty: a higher-pace AI may carry more speed through the same corner, but pace may not replace the straight-line cap.
- A leading AI must retain a 1.0 top-speed multiplier. A trailing AI allowance must remain between 1.0 and 1.04.
- Every configured AI pace profile must reach at least 98% of its character maximum during the three-lap circuit simulation while preserving valid laps, road bounds, and the grass-time limit.
- The overtaking regression must use different Speed stats for its slower lead racer and faster trailing racer; grid profile pace alone is not evidence of a straight-line speed advantage.

For live acceptance, observe AI-controlled low-, medium-, and high-Speed characters on clear asphalt sections. Confirm that each can approach its displayed unboosted maximum, that high-Speed racers have a visible straight-line advantage, and that AI still brakes for corners and passes slower traffic without systematic grass use.

## Weight-driven kart-collision regression

- Contacts with less than 0.75 m/s closing speed must retain 100% of forward speed so parallel or resting overlap does not create repeated slowdown.
- At 16 m/s closing speed, Weight 10 versus Weight 2 must retain approximately 85.9% speed, while Weight 2 versus Weight 10 retains approximately 67.1%.
- The heavy racer's retention advantage in that comparison must exceed 15 percentage points, but the Weight 10 racer must still lose at least 13% of forward speed.
- Every Weight 1–10 pairing at full severity must remain inside the governed 65–96% retention range.
- Controller evidence must confirm that retention reduces only positive forward velocity and preserves lateral collision motion.

For live acceptance, collide Accu and a light racer with comparable approach speeds in both directions. Confirm that Accu retains visibly more momentum but still suffers a noticeable slowdown, the light racer accepts greater risk, lateral knockback remains readable, and bumper-to-bumper contact does not continuously drain speed.

## Slice 5 RacerEffects and Nitro Surge checkpoint

Automated evidence for this bounded checkpoint must confirm:

- the player-only `testItem=<item-id>` acceptance override accepts only the fifteen governed IDs, ignores invalid/missing values, and never forces AI inventories;
- normal URLs without `testItem` continue through the governed position/gap selector unchanged;
- the Nitro Surge procedural rear exhaust/energy visual is hidden outside the effect, visible while the `nitro-surge` RacerEffects state is active, and releases its Three.js resources on disposal;
- Nitro Surge tuning remains configuration data at approximately 2.4 seconds, 1.18x normal speed cap, and 1.50x acceleration authority;
- the temporary boost applies strong acceleration without changing the permanent Speed stat;
- the off-road override bypasses only dirt/grass speed-ceiling penalties while Traction-governed off-road acceleration remains active;
- the effect timer freezes under pause and restores neutral modifiers on expiry;
- successful Nitro activation consumes its single charge and immediately frees the one inventory slot;
- an unsupported/not-yet-implemented item remains held and unconsumed when ITEM is pressed;
- use during roulette remains rejected;
- the existing AI 1.00-1.04 speed allowance remains separately bounded;
- built-in drift boost and item boost do not multiply into an unintended compounded cap/acceleration state; and
- disposal/explicit cleanup removes temporary effects without leaking state.

For deployed product-owner acceptance after merge:

Use `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=nitro-surge` for the Nitro acceptance pass. The test-mode badge must identify Nitro Surge, every player pickup must resolve to Nitro Surge, and AI pickups remain normal. Load the normal URL once to confirm production selection is not forced.

1. Collect a player box in forced Nitro test mode; confirm roulette remains approximately 0.85 seconds and resolves to Nitro Surge every time.
2. After reveal, press ITEM and confirm Nitro activates rather than merely registering input.
3. Confirm the held Nitro charge is consumed and the item slot clears immediately, allowing another item box to be collected while the boost is still active.
4. Confirm the race status reports `NITRO SURGE ACTIVE` and the kart shows a clear rear exhaust/energy Nitro tell for the same active interval.
5. On asphalt, confirm noticeably stronger acceleration and a temporary ceiling above the racer's normal top speed, targeting approximately 1.18x.
6. Activate Nitro immediately before or while entering dirt/grass and confirm the usual off-road speed ceiling is bypassed during the effect; Traction may still influence how quickly the kart accelerates there.
7. Confirm Nitro expires after approximately 2.4 seconds and the normal road/off-road speed behavior returns without a persistent buff.
8. Pause during Nitro and confirm the remaining effect duration freezes until gameplay resumes.
9. Confirm both desktop ITEM inputs (Left Shift and E) and the mobile ITEM button can activate Nitro after reveal.
10. Confirm a non-Nitro held item still does not fire or consume in this checkpoint.

Record the deployed commit, CI/Pages run, desktop result, mobile result, any effect/timing/speed defect, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint authorizes no other item effect.

## Slice 5 roulette, HUD, and input checkpoint

Automated evidence for this bounded checkpoint must confirm:

- the actual selected item is locked at collection while roulette only changes presentation;
- roulette duration is approximately 0.85 seconds and freezes while paused;
- item use is rejected during roulette;
- Left Shift and E are accepted desktop ITEM inputs after reveal, while unsupported keys are not;
- S / Down modifies desktop use intent to backward;
- the mobile gameplay markup exposes exactly one dedicated ITEM control, while non-mobile sessions do not render touch controls;
- Brake/Reverse held with mobile ITEM produces backward intent;
- the HUD renders empty, roulette, held, multi-charge, and input-feedback states without exposing a second inventory slot;
- registering input before item effects exist does not consume a charge or free the occupied inventory slot; and
- the future effect-dispatch boundary consumes one charge only when `commitUse()` is explicitly called.

For deployed product-owner acceptance after merge:

1. On desktop, collect a box and confirm roulette begins immediately, remains readable, and resolves to a held item after approximately 0.85 seconds.
2. Pause during roulette and confirm the roulette freezes until gameplay resumes.
3. Confirm the held HUD shows the final item name/glyph and, for Blaze Orbs, Frost Orbs, Arc Blade, or Arc Hammers, the governed charge count.
4. Press Left Shift and E separately after reveal and confirm forward input registration. No visible item effect or charge consumption is expected in this checkpoint.
5. Hold S or Down while pressing ITEM and confirm backward input registration.
6. On mobile, confirm the dedicated ITEM control is present without obscuring steering, acceleration, braking, drift, rear-view, reset, minimap, or race HUD surfaces.
7. Tap ITEM after reveal and confirm forward registration; hold Brake/Reverse while tapping ITEM and confirm backward registration.
8. Confirm the racer remains unable to collect a second item box because the held item is intentionally not consumed until the later effects increment.

Record the deployed commit, CI/Pages run, desktop result, mobile result, any layout/readability defect, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint does not authorize item effects or close Slice 5.

## Slice 4 AI/grid manual matrix

- Desktop/fine-pointer session: touch controls are absent; keyboard controls remain functional.
- Mobile/coarse-pointer session: touch controls appear only in gameplay and support simultaneous accelerate-plus-steer and drift-plus-steer input.
- Countdown prevents an early start and transitions through 3, 2, 1, and GO.
- Exactly seven visible opponents join the player, live position changes during overtakes, and collisions do not produce sustained vibration.
- The player identity is absent from the AI grid, all seven AI identities are unique, and repeated races vary the sampled roster.
- A sampled production identity displays its approved kart and rear driver frame. A sampled unfinished identity remains an explicit fallback and never borrows another character's art.
- AI racers follow the course, recover after displacement, overtake, and complete validated laps without player involvement.
- AI racers use visibly different road-bounded lanes, do not systematically cut inside corners through grass, and move laterally around slower racers instead of forming a permanent bumper-to-bumper queue.
- Player completion records a placement from first through eighth and presents standings.
- Drift tiers, boost pads, ramp/stunt boost, off-road floors, recovery, rear view, and three-lap validation regressions remain functional.

## Slice 3 Character Select and Lavi manual matrix

- Hub `Start Grand Prix` opens Character Select rather than starting the race immediately.
- Exactly twelve slots render; every production identity, including Alex at AA-01, displays its approved portrait. No roster placeholder remains.
- Selecting any slot updates its name, descriptor, six statistics, kart label, selected state, and race button without layout clipping.
- Lavi remains the default selection and `Race as Lavi` loads Potato rather than the procedural fallback kart.
- Potato reads as one opaque natural russet body with a continuous sculpted cockpit, rooted rear sprouts, connected wheels/axles, and no body clipping or translucency.
- Potato's steering wheel sits in front of Lavi, and its intended nose faces the race direction; a rear-camera check confirms the visual alignment is not reversed.
- Lavi's rear driver artwork sits convincingly in the cockpit without floating, clipping, or obscuring the kart silhouette.
- Lavi's five camera-facing frames use `[0, 0.9, -0.12]` so the upper body clears Potato's tall nose and the hands align with the modeled steering wheel. Toph's accepted `[0, 0.45, -0.12]` placement must not change.
- Holding visual left/right steering switches Lavi to the matching approved steer-left/steer-right frame within two rendered frames; releasing steering restores the rear frame.
- Collision impulse selects the approved hit frame briefly, and a completed player race selects the approved victory frame.
- Rear view preserves Lavi's steering, hit, and victory state through the four matching front-action frames from `lavi-runtime-20260902-5`.
- Lavi's commanded-left and commanded-right poses lean toward opposite camera sides. None of the four front-action sprites contains wheel or kart geometry; Potato supplies the only steering wheel.
- Lavi's AA-02 profile feels nimble and responsive and remains the controlled player kart throughout the race.
- The missing-asset test fixture starts the same race with the governed monogram/fallback kart and selected profile statistics; it does not borrow another production identity or final art.
- Simulated missing portrait replaces the image with the correct monogram; simulated missing GLB loads the fallback kart and does not crash or change physics.
- Desktop and mobile layouts expose all twelve slots, detail panel, back action, and race action without horizontal scrolling or controls hidden outside the viewport.

## Required runtime character-asset contract

Run this matrix for every future production character, in addition to its slice-specific checks:

- CI uses an LFS-materialized checkout, passes `git lfs fsck`, and the production build rejects a pointer or bad binary signature at each required kart path.
- The deployed response uses the current controlled asset revision (or changed filename), not a cached response from an earlier object.
- The selected production kart loads in the live deployment; a fallback kart is evidence of a failed delivery check, not a passing degraded experience.
- All six approved driver states are preloaded. Rear is the safe fallback; the reverse camera selects front, visual left/right select the matching steer frame, hit overrides steering briefly, and victory overrides normal driving after the player finishes.
- Chase and rear cameras confirm the kart’s nose and steering wheel face forward of the driver. Any visual-root rotation or other axis correction is recorded in that character’s record and asset brief.
- Every production GLB declares `extras.forward: "-Z"`, and every production manifest entry uses `NEGATIVE_Z_KART_VISUAL_YAW`. Automated checks must fail if either side of this orientation contract changes independently.
- Every active production character with GLB LODs must have all required LOD paths listed in `tools/verify-runtime-assets.mjs`. Manifest activation without corresponding runtime-gate coverage is an incomplete production checkpoint.
- A product-owner test on desktop and mobile confirms the portrait, controlled kart, driver states, and orientation. Record the tested deployment, commit, browser/device result, and limitations in implementation status.

## Keeg / Mycelial Majesty manual matrix

- AA-04 renders Keeg's approved portrait, Balanced Racer descriptor, and 7 / 7 / 5 / 7 / 5 / 5 statistics.
- `Race as Keeg` loads The Mycelial Majesty rather than the fallback kart.
- The approved purple-and-silver grand-tourer body, mushroom crest and fixtures, four connected wheels, open cockpit, and angled chassis-mounted steering assembly load without clipping or floating geometry.
- Keeg sits correctly in the cockpit with the steering wheel forward of the driver.
- Keeg's driving hands align with the steering-wheel center; the wheel must not cross his abdomen or float below his hands in chase view.
- All ten driver states load from `keeg-runtime-20260901-3`.
- Rear view preserves steering, hit, and victory through Keeg's matching front-facing action frames. The two steering silhouettes must read as opposite directions, and no Keeg front-action frame may contain wheel or kart geometry.
- Chase and rear views confirm the mushroom shield is at the race-forward nose and the exhausts remain behind Keeg.
- Keeg appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-04 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates every AA-04 PNG and validates its RGBA dimensions and PNG scanline filters; a header-only or partially decodable image must fail the build.
- Product-owner acceptance is recorded only after the deployed game confirms Keeg is selectable and all approved assets load as intended on desktop and mobile.

## Krios / Hornbreaker manual matrix

- AA-10 renders Krios's approved portrait, Straight-Line Heavy descriptor, and 10 / 4 / 9 / 3 / 4 / 6 statistics.
- `Race as Krios` loads The Hornbreaker rather than the fallback kart.
- The Hornbreaker's low broad chassis, integrated front ram horns, oversized studded tires, open cockpit, and twin rear exhausts load without clipping or detached housings.
- Krios sits correctly in the cockpit without floating or obscuring the kart silhouette.
- Rear, front, steer-left, steer-right, hit, and victory driver states load from the controlled Krios runtime revision.
- Rear view preserves steering, hit, and victory through Krios's matching front-facing action frames. No Krios frame contains wheel or kart geometry.
- Front-steer-left, front-steer-right, and front-victory retain two substantial transparent enclosed horn apertures; no pale or checkerboard matte remains between the horns.
- Chase and rear views confirm the integrated ram horns remain at the race-forward nose and the rear exhausts remain behind Krios.
- Krios appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-10 GLBs: `kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each must begin with the binary glTF signature and declare `extras.forward: "-Z"`.
- Product-owner acceptance is recorded only after the deployed game confirms Krios is present and all approved assets load as intended.

## Jennifer / Hearthwarden local integration matrix

- AA-12 renders Jennifer's approved portrait, All-Surface Heavy descriptor, and 8 / 5 / 8 / 4 / 4 / 7 statistics.
- `Race as Jennifer` loads The Hearthwarden rather than a placeholder or fallback kart.
- CI materializes and validates `public/assets/characters/aa-12/kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each must begin with the binary glTF signature and declare `extras.forward: "-Z"`.
- LOD0, LOD1, and LOD2 remain within 25,000, 12,000, and 5,000 triangles while preserving the required thirteen-node hierarchy and one `SteeringWheel` node.
- Direct GLB review confirms that the tree-of-life medallion intersects its central pear-wood boss and paired bronze braces, and that every rear herb stem enters its remedy box.
- The kart-right dog perch, kart-left staff rack, wide tires, open cockpit, woven side panels, and rear exhausts remain attached at every LOD.
- All ten driver states load from `jennifer-runtime-20260903-2`; every frame is wheel-free and keeps the Newfoundland on Jennifer's physical right.
- `NEGATIVE_Z_KART_VISUAL_YAW` keeps the tree-of-life medallion at the race-forward nose and the remedy cargo behind Jennifer.
- Chase-facing position `[0, 0.92, -0.12]` seats Jennifer behind the rear structure without hiding her head, shoulders, or dog.
- Camera-facing position `[0, 0.84, -0.12]` and modeled-wheel position `[0, 1.86, -0.42]` place The Hearthwarden's single wheel between Jennifer's hands without covering her face.
- Product-owner acceptance is recorded only after the deployed desktop and mobile game confirms orientation, every driver state, cockpit occlusion, dog-side continuity, and single-wheel presentation.

## Dragon Queen / Sovereign Wyrm local integration matrix

- AA-06 renders Dragon Queen's approved portrait, Grip Specialist descriptor, and 6 / 6 / 5 / 7 / 5 / 7 statistics.
- `Race as Dragon Queen` loads The Sovereign Wyrm rather than a placeholder, Cleo, The Gilded Stitch, or a fallback kart.
- CI materializes and validates `public/assets/characters/aa-06/kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- LOD0, LOD1, and LOD2 remain within 25,000, 12,000, and 5,000 triangles. Each retains the thirteen-node hierarchy and one `SteeringWheel` node.
- All ten driver states load from `dragon-queen-runtime-20260904-1`. Every frame remains free of kart and control geometry, keeps both wings visible, and shows exactly one long tail.
- `NEGATIVE_Z_KART_VISUAL_YAW` keeps the dragon shield at the race-forward nose and the open tail channel behind Dragon Queen.
- Chase-facing position `[0, 0.95, -0.12]` keeps the wings above the bodywork and seats the lower body behind the cockpit edge.
- Neutral, steer-left, hit, and victory camera-facing states use `[0, 0.84, -0.12]`; front-steer-right uses `[0, 0.80, -0.12]` to account for its higher foreclaw pose.
- The kart's single modeled steering control remains between Dragon Queen's foreclaws in front view without covering her face.
- Cleo's ten archived files at `public/assets/archive/characters/cleo-aa-06/` retain their recorded SHA-256 values and remain excluded from the active roster.
- Product-owner acceptance is recorded only after the deployed desktop and mobile game confirms orientation, every driver state, cockpit occlusion, visible wings and tail, and single-control presentation.

## Alex / Neon Vector production acceptance matrix

- AA-01 renders Alex's approved portrait, Feather Sprinter descriptor, and 6 / 9 / 2 / 8 / 7 / 4 statistics.
- `Race as Alex` loads The Neon Vector rather than the former AA-01 placeholder or a fallback kart.
- CI materializes and validates `public/assets/characters/aa-01/kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- LOD0, LOD1, and LOD2 remain within 25,000, 12,000, and 5,000 triangles. Each retains the required thirteen-node hierarchy and one `SteeringWheel` node.
- All ten driver states load from `alex-runtime-20260905-1`. Every frame is character-only, wheel-free, 512 x 512 transparent sRGBA, and retains Alex's cyan/magenta cheek-node identity.
- `NEGATIVE_Z_KART_VISUAL_YAW` keeps The Neon Vector's triangle nose and twin violet exhausts race-forward and its cockpit-to-thruster conduits behind Alex.
- Chase-facing position `[0, 0.92, -0.12]` keeps Alex seated behind the cockpit edge. Camera-facing position `[0, 0.84, -0.12]` keeps the modeled wheel visible between her hands; no sprite-owned wheel is permitted.
- The approved Candidate 3 conduit pair remains structurally attached and readable in rear three-quarter and profile views; no floating hood emblem or steering-wheel intrusion is permitted.
- Manny confirmed the deployed desktop/mobile game against checkpoint `daf1e3127478981e40cca9533300f8617f61004d` on 2026-09-05. Selection, orientation, all ten driver states, cockpit occlusion, conduit visibility, one-hand steering silhouettes, torso rotation, and single-wheel presentation pass. Alex / The Neon Vector is live accepted.

## McFleurdel / Fleur de Nuit manual matrix

- AA-07 renders McFleurdel's approved portrait, High-Speed Cruiser descriptor, and 8 / 6 / 7 / 5 / 4 / 6 statistics.
- `Race as McFleurdel` loads The Fleur de Nuit rather than the fallback kart.
- The approved black body, raised silver fleur-de-lis, black nose shield, plum throne cockpit, attached silver trim, four connected wheels, ivory candles, and violet flames load without clipping or floating geometry.
- McFleurdel sits correctly in the cockpit with the steering wheel forward of the driver.
- All ten driver states load from `mcfleurdel-runtime-20260901-2`.
- Rear view preserves steering, hit, and victory through McFleurdel's matching front-facing action frames. Her front-action hair remains black on the viewer's left and white on the viewer's right.
- Front-steer-left and front-steer-right must expose transparent background inside the black-hair curls and behind both arms. Any connected pale matte component of 30 pixels or more in the reviewed gap regions fails the runtime gate.
- Chase and rear views confirm the fleur-de-lis shield is at the race-forward nose and exhausts remain behind McFleurdel.
- McFleurdel appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-07 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates and validates every AA-07 PNG as complete RGBA image data.
- Product-owner acceptance is recorded only after the deployed game confirms McFleurdel is selectable and all approved assets load as intended on desktop and mobile.

## Toph / Grave Shift manual matrix

- AA-08 renders Toph's approved portrait, Turbo Bruiser descriptor, and 7 / 5 / 7 / 4 / 8 / 5 statistics.
- `Race as Toph` loads The Grave Shift rather than the fallback kart.
- The approved purple-dominant armored body, bronze perimeter, low splitter, integrated sidepods, flat skull shield, angular thorn crown, enclosed rear engine, connected wide tires, and twin violet exhausts load without clipping or floating geometry.
- Toph sits correctly in the open cockpit with the steering wheel forward of the driver.
- All ten driver states load from `toph-runtime-20260902-2`.
- Rear view preserves commanded steering, hit, and victory through Toph's matching front-action frames. Commanded left and right lean toward opposite camera sides.
- Toph's front-action files have transparent corners and no retained checkerboard or pale fringe. None contains wheel or kart geometry; The Grave Shift supplies the only steering wheel.
- Chase and rear views confirm the skull shield remains at the race-forward nose and the enclosed engine/exhausts remain behind Toph.
- Toph appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-08 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates and validates every AA-08 PNG as complete RGBA image data.
- Product-owner acceptance is recorded only after the deployed game confirms Toph is selectable and all approved assets load as intended on desktop and mobile.

## Lula / Verdant Hart manual matrix

- AA-03 renders Lula's approved portrait, Feather Dirt Ace descriptor, and 5 / 8 / 3 / 7 / 6 / 7 statistics.
- `Race as Lula` loads The Verdant Hart rather than the fallback kart.
- The low living-root body, unified stag face, brow-mounted antlers, embedded green leaves, connected wheel housings, and restrained wooden outlets load without clipping or floating geometry.
- Lula sits correctly in the open cockpit with the steering wheel forward of the driver.
- Rear, front, steer-left, steer-right, hit, and corrected victory states load from `lula-runtime-20260830-2`.
- Chase and rear views confirm the stag face remains at the race-forward nose and the wooden outlets remain behind Lula.
- Lula appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-03 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates and validates every AA-03 PNG as complete RGBA image data.
- CI reconstructs every AA-03 PNG scanline and rejects any opaque neutral-white pixel outside the protected face/eye regions.
- Portrait and front remain the skin-tone authority; rear, steer-left, steer-right, hit, and victory must use the same pale neutral complexion without altering pose, clothing, hair, or alpha edges.
- The front-camera-only placement override must align Lula's hands with The Verdant Hart steering wheel without moving rear, steering, hit, victory, or AI states.
- Product-owner acceptance is recorded only after the deployed game confirms Lula is selectable and all approved assets load as intended on desktop and mobile.
- Manny confirmed the corrected live mobile deployment at checkpoint `ef74ca9eabb2a242c02d35d72c55377ee9b5529c` on 2026-08-30; the full Lula / Verdant Hart matrix passes.

## Mobile finish-state matrix

- Completing a race adds the `is-finished` state to the game shell before results become visible.
- Lap, time, speed, position, surface, performance, drift guidance, game help, and touch-driving controls leave the finished mobile view.
- The results card docks to the top of a portrait viewport and stays within 42% of the viewport height.
- Standings scroll inside their own compact region; they do not expand the card over the kart or victory driver frame.
- The lower chase-camera area remains unobstructed so the selected character's victory pose is visible.
- The results card stays above all retired touch targets, and Return to Hub remains reachable without scrolling the page.
- After the player finishes, the compact results panel leaves the live kart and victory pose clearly visible while all eight standings remain reachable.

## Race minimap matrix

- The rendered closed-course path is generated from Circuit Alpha's ordered samples, not a separately authored approximation.
- Track normalization preserves the course aspect ratio and keeps every point inside the padded SVG view box.
- Exactly eight markers appear during a full race: seven pixel-rendered head crops from approved driver portraits and one larger, gold-outlined player head drawn above them.
- Marker positions interpolate closed-course progress and wrap cleanly from progress 1 back to 0.
- Desktop places the map below the Lap HUD on the left without obscuring the track horizon, Surface HUD, or drift meter.
- Mobile reduces the map in the upper-left HUD column so it stays clear of Position, centered REAR/RESET controls, and bottom steering/action controls.
- Rear camera retains the minimap. The compact finish state hides it with the live HUD so it cannot obscure the victory pose or results controls.
- The static track path is written only when its shared topology reference changes; normal HUD updates move markers without rebuilding the SVG course every frame.

For live acceptance, complete at least one desktop and one mobile race. Confirm that all eight driver heads are recognizable, move continuously around the correct course shape, the player remains easy to identify in a cluster, mobile controls remain unobstructed, and the map disappears when results open.

## Shared driver-sprite state matrix

- Every active production driver supplies rear, front, steer-left, steer-right, hit, and victory as 512 x 512 transparent PNGs with transparent corners and no baked checkerboard or neutral-white background islands.
- The player and every production AI racer use the same state priority: victory, hit, front during rear view, steering, then neutral rear.
- Positive steering selects steer-left and negative steering selects steer-right for both player and AI racers; the dead zone returns to rear.
- A kart contact activates hit for every involved production driver, including AI-to-AI contacts, for the same governed reaction window.
- Each AI finisher activates victory independently of the player's finish state.
- Holding desktop or mobile rear view activates front for all visible production racers because the camera faces the fronts of their karts; releasing rear view restores each racer's simulation-driven state.
- While rear view is active, positive and negative steering select front-steer-left and front-steer-right, collision selects front-hit, and a finished racer selects front-victory. Direction names follow kart input direction rather than the viewer's mirrored screen side.
- During the character-by-character rollout, a missing front-facing action texture falls back to the approved neutral front frame. It must not select a rear-oriented action texture, fall back to rear, or blank the driver.
- All four front-facing action frames use the character's approved front placement and steering-control ownership. They must not move chase-oriented frames or introduce a duplicate wheel.
- Kraken's live pilot must select front-steer-left and front-steer-right for the matching kart input while rear view is held, select front-hit during contact, and retain the approved front-victory presentation after finishing.
- Releasing rear view during Kraken's steering or hit state must restore the matching chase-oriented action rather than leaving a front-facing frame active. All transitions must preserve his approved seated footprint, clean alpha edge, cockpit depth, and single modeled steering wheel.
- Accu's body remains behind Pink Precision's modeled steering control in neutral, turning, hit, and victory views. Her sprite contains no opaque white/checkerboard pixels inside steering-wheel openings.

Kraken live acceptance passed on 2026-09-01. Manny confirmed the requested steering, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-wheel checks against deployed checkpoint `6b0b9239fa34edc521b4fa4e18a19a8397deaea3`.

Manaconda and Krios live acceptance passed on 2026-09-01 against deployed checkpoint `2ca852b47f16b8221275ee2b5542650d609b9a0d`. Manny confirmed both steering directions, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-control ownership. Manaconda shows exactly one sprite-owned wheel. Krios uses The Hornbreaker's modeled wheel without a duplicate, and no pale matte remains between his horns.

Keeg and McFleurdel live acceptance passed on 2026-09-01 against deployed checkpoint `f8a2ed8be0d72fde62c9403dae4b15e94222f7da`. Manny confirmed both steering directions, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-control ownership. Both drivers use their karts' modeled wheels without sprite duplicates. McFleurdel's reviewed black-curl interiors and arm gaps remain transparent.

Lavi and Toph live acceptance passed. Their eight deployed source hashes, controlled revisions, PNG decoding, transparent corners, and modeled-wheel ownership passed. Manny accepted Toph at `[0, 0.45, -0.12]` on 2026-09-02, then accepted Lavi's corrected `[0, 0.9, -0.12]` camera-facing placement on 2026-09-03. Both drivers pass steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation.

Lula and Accu are the final front-action batch. Manny approved all eight candidates and the deployed desktop/mobile result on 2026-09-03. The live files preserve commanded-direction separation, forward-seated body orientation, identity locks, transparent corners and internal gaps, and modeled-wheel ownership without adding kart pixels. Lula retains `[0, 0.45, -0.12]`; Accu retains `[0, 0.9, 0.22]` and Pink Precision's front-only modeled-wheel position `[0, 1.46, -0.46]`.

PR #73 head run `33708240532` and main run `33708310011` passed. The merged checkpoint is `735da4015bca6f9610f6a358672804f4c73b35f9`. The live `assets/index-D84iBLTd.js` bundle exposes both controlled revisions and all eight action paths; all eight deployed PNG responses match the approved SHA-256 values. The runtime gate decodes 72 production PNGs. Review exports, discarded candidates, and Python caches remain outside the repository.

The 2026-09-03 local checkpoint passed `npm run validate`: strict typecheck, zero-warning lint, 16 Vitest files / 83 tests, 83.14% statement coverage, 27 materialized GLBs, 72 decoded PNGs, and a production Vite build. The source and built hashes match for all eight new frames, and the bundle contains both new revisions and all eight paths.

Live acceptance passed on 2026-09-03 against checkpoint `95fcf26fb699065cd9082951b3e8a3e18790e8a2`. Manny confirmed Lula and Accu's steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation. This closes the front-facing action-state rollout for all nine active production drivers.

## Manaconda / Wayfinder manual matrix

- AA-09 renders Manaconda's approved portrait and identifies the kart as The Wayfinder rather than a placeholder or fallback prototype.
- `Race as Manaconda` loads the wheel-free Wayfinder and the approved rear driver frame; no second modeled steering wheel appears.
- Manaconda sits within the recessed cockpit without floating or clipping, and the wheel contained in each driver frame reads in front of him.
- Visual left/right steering selects the matching approved frame; collision selects hit briefly; finishing selects victory.
- Rear view preserves steering, hit, and victory through Manaconda's matching front-facing action frames. Each contains exactly one visible wheel, and The Wayfinder adds no modeled duplicate.
- Chase and rear cameras confirm Wayfinder's grille/navigation core points forward and the rear satchel/twin exhausts remain behind Manaconda. No 180-degree visual correction is applied.
- The selected AA-09 profile remains 7 / 6 / 6 / 6 / 6 / 5 throughout the race.
- Desktop and mobile both load the controlled `manaconda-runtime-20260831-2` URLs rather than cached pre-integration assets.

## Accu / Pink Precision manual matrix

- AA-11 renders Accu's approved portrait and identifies the kart as Pink Precision rather than a placeholder or fallback prototype.
- `Race as Accu` loads Pink Precision and the approved rear driver frame. The compact armored hull, continuous treads, cannon, and heart-bullseye emblem remain visible.
- Accu sits inside the cockpit without floating or clipping. The 3D steering wheel stays in front of her and does not conflict with the driver art.
- In chase view, Accu's rear hair remains continuous into the cockpit; no straight raster edge is visible across the hair or torso above the cockpit rim.
- In rear-camera view, the front frame reads as one seated driver with visible upper-body context rather than a detached face behind the cannon. The cannon may occlude the centerline, but it must not erase the body or separate the head from the cockpit.
- In rear-camera view, Pink Precision's dark steering-wheel ring is visibly readable between and beneath Accu's hands. It must not disappear behind the front sprite, merge with the cockpit collar, or render during chase-oriented states whose approved art already contains a wheel.
- Visual left/right steering selects the matching approved frame; collision selects hit briefly; finishing selects victory.
- Chase and rear cameras confirm the cannon and nose point forward while the antennae and exhausts remain behind Accu. No visual-root rotation is applied.
- The selected AA-11 profile remains 8 / 4 / 10 / 3 / 5 / 6 throughout the race.
- **Live acceptance:** Manny approved deployed PR #56 on 2026-08-31 after verifying the corrected chase-camera hair edge and rear-camera steering-wheel presentation. The previously accepted grass relaunch and chase-state modeled-wheel suppression remain passing.
- Desktop and mobile both load the controlled `accu-runtime-20260831-2` URLs rather than cached pre-integration assets.

## Slice 0 evidence boundary

Slice 0 validates only installation, typechecking, linting, unit testing, production build, the minimal app shell, repository organization, and CI. It does not validate rendering, physics, controls, AI, racing, items, audio playback, or performance requirements assigned to later slices.

## Slice 5 item-system validation matrix

This matrix is required in addition to the repository-wide validation commands and the complete approved checklist in `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md`.

### Distribution and inventory

- Every configured rank column must sum to exactly 100 before dynamic adjustment.
- Use a deterministic seedable selector and run at least 100,000 simulated selections for each rank. Record observed percentages and expected percentages. Common-item absolute deviation should remain within approximately 0.5 percentage points unless a documented goodness-of-fit test is used instead.
- Verify the documented 1.00-1.35 gap multiplier and renormalization after dynamic catch-up adjustment.
- Verify prerequisites are filtered before selection: Apex global availability and cooldown; Hyper-Drive position 6-8 plus at least 45 m behind the leader; any unavailable runtime prerequisite.
- Verify one-slot inventory, multi-charge counts, collection-time outcome lock, approximately 0.85-second roulette, occupied-inventory pass-through, and approximately 4.5-second shared-box respawn.
- Verify all four rows contain eight boxes in the legal racing corridor near 9%, 34%, 62%, and 89% lap progress.

### Item functional and counter matrix

- Kinetic Disc: forward/backward launch, governed travel, no more than three wall ricochets, standard spinout, hit destruction, nine-second lifetime cleanup.
- Seeker Drone: nearest valid racer ahead by race progress, 0.5-second arming, bounded turn, no teleport, warning cue/state, twelve-second maximum cleanup.
- Apex Missile: one active globally, minimum 18-second global interval, current leader at terminal lock, warning/sky/dive phases, 5.5 m AoE, heavy spin, Prismatic immunity, and precisely timed Shockwave terminal counter.
- Blast Orb: directional deploy, three-second fuse, qualifying early direct-impact detonation, 4 m AoE, heavy spin, Shockwave cleanup.
- Blaze Orbs: five charges, at least 0.55 seconds between shots, short 0.55-second spin, expiry cleanup.
- Frost Orbs: three charges, approximately 55% momentum retention, approximately 20% handling penalty for approximately 1.2 seconds, refresh without multiplicative stacking.
- Arc Blade: three charges, curved outbound/return path, at most one rival hit outbound and one on return per throw, no repeated overlap damage.
- Arc Hammers: five charges, at least 0.35-second cadence, ballistic movement, one terrain bounce, short post-bounce expiry.
- Slick: rear drop, approximately 12-second lifetime, approximately 1.1 m trigger, approved 360-degree spin/60% speed-retention effect, two active per owner, Shockwave cleanup.
- Shockwave: approximately 5 m radial push and destruction/clearing of all supported ordinary projectiles, Slicks, Blast Orbs, and terminal Apex.
- Ink: approximately 2.5-second partial human screen obstruction; AI path noise, approximately 80 ms reaction latency, and reduced precision without navigation failure.
- Nitro Surge: approximately 2.4-second active window, 1.18x cap target, 1.50x acceleration authority, off-road penalty ignore, clean restoration.
- Nitro Overdrive: six-second window, pulse no faster than every 0.75 seconds, approximately 0.9-second pulse, 1.15x initial cap target, clean window expiry.
- Hyper-Drive Rocket: position/gap prerequisite, legal Circuit Alpha spline autopilot, immunity, approximately 1.25x initial cap target, automatic overtakes, maximum approximately six seconds, approximately 0.3-second control return, no teleport/progress mutation/direct first-place deposit.
- Prismatic Invincibility: approximately six seconds, +12% speed, hazard/projectile immunity, hostile-contact spin, expiry warning/restoration.

### Input, AI, race authority, and pause

- Left Shift and E both activate held items.
- S/Down plus item requests backward deployment where supported.
- Coarse-pointer gameplay exposes a dedicated ITEM button; Brake/Reverse plus ITEM requests backward deployment where supported. Verify simultaneous accelerate/steer/drift combinations remain functional.
- AI must acquire and use items tactically. Validate Seeker range, rear-attacker Slick use, defensive Shockwave hold/use, Nitro straight/recovery preference, and prompt Rocket activation.
- AI obstacle awareness must include Slicks and Blast Orbs.
- Seeker/Apex targeting must use validated race progress, not visual proximity alone.
- Item effects may not directly edit checkpoint sequence, lap count, race rank authority, or finish placement. Hyper-Drive must earn progress through legal movement/checkpoint traversal.
- Pause must freeze roulette, arming, fuses, projectiles, hazards, buffs/debuffs, item windows, respawn/cooldown timers, AI item decisions, and related audio progression as appropriate.

### Lifecycle, soak, and performance

- Track active item runtimes, projectile bodies/colliders, hazards, VFX emitters, listeners, timers, and audio voices through repeated use and restart/disposal.
- No object may survive impact/completion/expiry without a documented state reason. Race restart/disposal must return item runtime counts to baseline.
- Enforce the PRD maximum of 40 simultaneous active physics projectiles.
- Instrument item/VFX CPU update cost against the approximately 1.0 ms budget and confirm no NaN/infinite transform under collision/item stress.
- Run existing Speed, Acceleration, Weight, drift, surface, AI, lap, recovery, camera, minimap, and driver-state regression suites unchanged.

### Live Slice 5 acceptance

Desktop and mobile must both verify item-box pickup/respawn, roulette, HUD icon/count, keyboard/touch item input, backward use, representative offensive/defensive/catch-up interactions, AI item use, pause/restart cleanup, and that existing race controls remain usable. Record the deployed commit, CI/deployment run, browser/device evidence, defects, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md` before Slice 5 can close.

## Slice 5 Kinetic Disc / guardrail acceptance

Automated and live validation for the Kinetic Disc checkpoint must verify:

- `?testItem=kinetic-disc` deterministically grants the player Kinetic Disc while the normal URL remains unforced.
- Forward and backward launch both consume the single charge only after a projectile spawns.
- Travel uses the governed approximately 42 m/s base speed (amendment 2.5), approximately 0.32 m radius, nine-second lifetime, bounded inherited velocity, and short owner arming immunity.
- The projectile visibly reflects from Circuit Alpha guardrails using the contact normal, never exceeds three successful ricochets, destroys on the next wall contact after the third bounce, and destroys immediately on racer hit.
- After arming, a returning ricochet can hit its owner.
- Player and AI racers are physically constrained by the same continuous guardrail boundary; a meaningful rail impact reflects inward, loses bounded speed, and shows a brief existing hit reaction without starting an item spinout.
- Kinetic racer impact applies one full visible yaw spin across approximately 0.85 seconds and suppresses driving controls for the effect window without mutating lap/checkpoint state.
- In chase view, the camera remains on the pre-impact travel heading while the kart spins; the driver switches between approved `hit` and `frontHit` frames according to the kart's actual orientation to the camera.
- Repeat the same spinout-facing check while holding rear view. The camera remains on the opposite side of the held travel heading, and the 2D asset must remain perspective-correct throughout the rotation.
- AI racers hit by a Kinetic Disc use the same 0.85-second spin and hit/front-hit facing rule when visible from either player camera.
- Pause freezes item/effect simulation. Restart/disposal returns projectile/effect counts to baseline with no surviving projectile meshes, geometries, materials, listeners, or timers.

Recovery regression coverage also checks both rail sides at all 384 track samples, oblique reflection without overlap bounce spam, zero-time pause, failed-spawn/capacity inventory retention, the 40-projectile ceiling, deterministic effect refresh/disposal, half-turn then full-turn controller motion under held inputs, clean acceleration recovery, rear-view switching during an anchored spin, and hit-art priority through a finish-line crossing.


## Kinetic Disc speed correction regression gate

Use the actual 42 m/s registry config and bounded inherited velocity. Forward launch from a fast kart must reach approximately 44.8 m/s; backward launch from rest is -42 m/s along the owner's forward axis. The moving-target regression advances targets at the actual Manaconda and Krios normal maximums, plus Krios with the 1.04 maximum AI allowance, from a 30 m initial gap on a clear straight and requires successful interception within three seconds. This uses an analytic straight-corridor fixture with the real projectile and shared guardrail contact math to isolate closing speed; it is not a guarantee of hits through turns or intervening obstacles. A shallow-angle Circuit Alpha trace must retain projectile speed, normal ricochets, valid same-side contacts, and eventual cleanup. All existing item/guardrail/spinout/camera/sprite gates must still pass.

After approved corrective deployment, use `?testItem=kinetic-disc`: confirm clearly faster catch-up against full-speed rivals, inspect ordinary angle-based ricochets with no guaranteed opposite-rail crossing, and briefly recheck the previously passed spinout/camera behavior. Verify the normal URL remains unforced. The other passed PR #104 checks remain accepted unless a regression is observed; do not start the next item until this focused gate passes.

The focused Kinetic correction gate above **passed on 2026-09-06**: deployed PR #105 / `1497672c639adaf6ca71f2aa775d4e0c23572b33`, CI/Pages run `34034999554`, and Manny's [final acceptance comment](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/105#issuecomment-5559436832). Earlier pending-gate wording describes the test procedure, not the current acceptance state. Issue #106 is future development and does not invalidate this result.

The approved Seeker increment is implemented under amendment 2.6. Its automated evidence and pending live gate follow.


## Seeker Drone checkpoint

`tests/seeker-drone.test.ts` and `tests/seeker-warning-audio.test.ts` cover nearest-ahead lap/progress and stable ties, offset finish-gate wrap, unchanged input race state, selection eligibility, unsuccessful-use charge retention, successful forward launch, full-speed Manaconda/Krios/max-AI catch-up, five real Circuit Alpha pursuit paths, bounded speed/acceleration/turning, arming, owner interception, rail destruction, target finish/removal, lifetime, shared cap, disposal, warning escalation/overlap/cleanup, volume/pause/browser audio fallback, and explicit incoming-fixture isolation. Full local gate on 2026-09-07: **30 files / 181 tests passed**. Existing Kinetic, Nitro, spinout/camera, AI, and runtime-asset tests also pass.

After separately approved gameplay deployment, use:

- Outgoing pickup test: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=seeker-drone`
- Incoming warning/impact test: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testSeekerIncoming=1`
- Combined test: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=seeker-drone&testSeekerIncoming=1`
- Normal selection: `https://manaconda33.github.io/manacondas-minigame-mayhem/`

These URLs describe the pending deployment, not the currently deployed gameplay. The incoming fixture fires after five race seconds and every sixteen seconds thereafter, from 45 m behind the player along the route; an intervening racer or guardrail may intercept it normally. Drive forward to observe the full warning progression; stop on a clear straight to verify impact. Its badge explicitly identifies incoming test mode.

Focused desktop/mobile live gate:

1. Acquire Seeker, resolve roulette, and use Left Shift/E or mobile ITEM. Forward pursuit is visible; holding reverse does not fire Seeker backward. Successful launch frees the slot.
2. From behind rivals, confirm nearest-ahead selection and readable catch-up on straight/curved sections. Confirm rail collision destroys the drone; shots are not guaranteed hits.
3. From first with forced Seeker, use it with no rival ahead: feedback says no racer ahead, the charge remains held, and occupied-slot pickup stays blocked.
4. In incoming mode, confirm target marker, escalating HUD warning and tone, master-volume silence/restoration, and clean pause/resume. Pausing during a tone stops audio immediately. The marked fixture is absent from a normal URL.
5. Let an incoming drone hit: confirm the accepted 0.85-second spinout and chase/rear perspective-correct driver art. Confirm warning cleanup after impact/expiry and on return to hub/restart.
6. Briefly recheck accepted Kinetic/Nitro behavior and the normal unforced selector. Prior acceptance remains valid unless an actual regression is observed.

Record Manny's result before starting the next item. Issue #106 remains a separate future-development defect, not part of this gate.
