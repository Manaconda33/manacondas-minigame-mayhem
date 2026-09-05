# Architecture and Product Decisions

This file is the current decision register. The complete original ADR-001 through ADR-021 record is preserved verbatim at `docs/history/DECISIONS-through-ADR-021.md` and remains authoritative except where a later ADR explicitly supersedes an earlier decision.

Future sessions must read this current register and follow the historical link when implementing behavior governed by ADR-001 through ADR-021.

## Existing governing decisions

ADR-001 through ADR-021 remain in force according to their recorded status in `docs/history/DECISIONS-through-ADR-021.md`, including repository governance, Vite/TypeScript/Three.js/Rapier/Howler baselines, Git LFS policy, slice/deployment gates, roster mapping, runtime character asset delivery, orientation rules, unique AI identity sampling, and the approved production locks for existing characters.

ADR-020's historical Cleo-to-AA-06 production mapping is superseded only with respect to **current active roster assignment** by ADR-022 below. Cleo's approved likeness, kart design, source rights, asset approvals, and historical acceptance evidence remain valid archive records.

## ADR-022: Archive Cleo and release AA-06 from active production

- **Date:** 2026-08-26
- **Status:** Approved
- **Context:** Manny directed that Cleo be removed from production while preserving her complete character package and all related work so she can be restored later if desired. Cleo was an active production identity in `characterManifest`, selectable by the player, eligible for the randomized AI grid, and mapped to AA-06 Grip Specialist.
- **Options considered:** Delete Cleo and her assets; retain Cleo as an inactive but profile-reserving production definition; preserve the full package as an archive while returning AA-06 to a governed active-roster placeholder.
- **Decision:** Remove Cleo from the active manifest and AI/player roster. Preserve her complete approved production definition as `archivedCleo`, keep every runtime PNG, GLB/LFS object, deterministic builder, character record, asset brief, hashes, mount, and prior acceptance evidence, and index them in `docs/CHARACTER-ARCHIVE.md`. Restore the active AA-06 slot to a generic placeholder and return AA-06 to `Available` in the roster ledger. Remove AA-06 GLBs from the active runtime-asset signature requirement without deleting the files.
- **Rationale:** This makes the retirement real at runtime while keeping restoration low-risk and lossless. A semantic archive avoids unnecessary LFS moves or binary churn, preserves historical evidence, maintains the PRD's twelve-slot scaffold, and prevents an inactive character from consuming a balance profile indefinitely.
- **Product impact:** Cleo no longer appears in Character Select and cannot appear as an AI racer. AA-06 remains visible only as an unfinished placeholder until a future approved character occupies it. No approved Cleo artwork or 3D work is destroyed.
- **Implementation impact:** `characterManifest` excludes Cleo; `archivedCleo` retains her former complete definition; AA-06 is a placeholder; the roster ledger marks AA-06 available; Cleo's three GLBs are no longer active build dependencies; archive/restoration documentation becomes part of the character-governance workflow.
- **Restoration gate:** Reintroducing Cleo requires explicit Manny approval, a current balance-profile decision, active-manifest reactivation, fresh runtime/LFS validation, full repository validation, deployment, and live product-owner confirmation. Historical 2026-08-21 acceptance does not substitute for current deployment evidence.
- **Approval:** Manny's explicit instruction on 2026-08-26 to remove Cleo from production while retaining her assets and related character work in an archive for possible later return.

## ADR-023: Lock Keeg production identity, kart, and AA-04 balance profile

- **Date:** 2026-08-26
- **Status:** Approved
- **Context:** Slice 3 resumed one-character-at-a-time avatar intake after Krios production closure. Manny supplied a definitive Keeg racing reference and a written character description, confirmed source/control rights, and approved the character and kart design locks.
- **Decision:** Keeg is the active production identity for AA-04 Balanced Racer. His kart is The Mycelial Majesty. The supplied Keeg racing image is the definitive visual authority for likeness and kart design. His selection descriptor uses the AA archetype name, `Balanced Racer`, consistent with the existing roster presentation contract.
- **Character lock:** Flamboyant male witch; well-trimmed beard; tall silver-trimmed pointed witch hat; layered purple, lavender, silver, and pastel enchanted robes; ornate rings, jeweled accessories, elaborate belt; theatrical magic; clever, charismatic, expressive, sophisticated presentation; mushrooms as a canonical secondary motif.
- **Kart lock:** Arcane grand-tourer / enchanted luxury racer with a low wide chassis, rounded shield-like nose, open cockpit, sculpted side pods, royal purple/violet surfaces, blackened-metal secondary surfaces, silver filigree, lavender magical glow, physically connected wheels, and structurally integrated mushroom ornamentation.
- **Balance mapping:** AA-04 Balanced Racer — Speed 7 / Acceleration 7 / Weight 5 / Handling 7 / Mini-Turbo 5 / Traction 5.
- **Rationale:** The profile provides a versatile, responsive, technically capable driving identity without displacing Kraken's drift-specialist role or overlapping heavyweight identities. The substantial enchanted kart retains medium-class presence while remaining broadly controllable.
- **Provenance:** Manny confirmed that he created or controls the definitive supplied reference and authorizes its transformation into production game assets.
- **Implementation gate:** This approval does not approve derived portrait/driver art, GLB geometry, runtime integration, or live activation. Those remain separately approval-gated under the Slice 3 avatar pipeline.
- **Approval:** Manny approved the character and definitive visual authority, confirmed rights, approved The Mycelial Majesty kart design/name, and approved AA-04 Balanced Racer on 2026-08-26.

## ADR-024: Lock McFleurdel production identity, kart, and AA-07 balance profile

- **Date:** 2026-08-27
- **Status:** Approved
- **Context:** Manny supplied a definitive McFleurdel racing reference, confirmed the character lock and transformation rights, and approved the proposed kart and driving identity during Slice 3 intake.
- **Decision:** McFleurdel is the active production identity for AA-07 High-Speed Cruiser. Her kart is The Fleur de Nuit. The supplied racing image is definitive visual authority for both character and kart.
- **Character lock:** Pale human woman; sharply divided black-and-white hair; violet eyes; dark lips; precise eyeliner; tailored black gothic formalwear with pinstripes, silver fleur-de-lis embroidery, dark-academia structure, subtle punk and occult accents; controlled, observant, quietly intimidating demeanor.
- **Kart lock:** Low gothic grand-tourer with black lacquer bodywork, architectural silver filigree, plum throne cockpit, fleur-de-lis nose shield, four exposed connected wheels, integrated candle-like violet flame fixtures, and purple exhaust energy.
- **Balance mapping:** AA-07 High-Speed Cruiser — Speed 8 / Acceleration 6 / Weight 7 / Handling 5 / Mini-Turbo 4 / Traction 6.
- **Provenance:** Manny confirmed he controls the definitive reference and authorizes transformation into game assets.
- **2D approval:** Manny approved the portrait, front, rear, steer-left, steer-right, corrected hit, and corrected victory designs on 2026-08-27. The normalized runtime files pass the PRD size and alpha contract.
- **Implementation closure:** Manny approved The Fleur de Nuit Candidate 9. Deterministic LOD0/LOD1/LOD2 matched the approved hashes and passed the temporary LFS publication bridge. PR #37 passed branch CI, merged at `aa24b655d30ba65438f512e0544e313da3fc343e`, and post-merge CI/Pages deployment passed in run `33037485975`. Manny manually confirmed the live game on 2026-08-27. McFleurdel's production checkpoint is complete.
- **Approval:** Manny approved the character lock, definitive reference, rights, The Fleur de Nuit name/design, AA-07 mapping, and complete 2D design package on 2026-08-27.

## ADR-025: Lock Toph production identity, kart, and AA-08 balance profile

- **Date:** 2026-08-28
- **Status:** Approved
- **Context:** Manny supplied a definitive Toph racing reference, confirmed transformation rights, approved the written character lock, and approved the proposed kart and driving identity during Slice 3 intake.
- **Decision:** Toph is the active production identity for AA-08 Turbo Bruiser. His kart is The Grave Shift. The supplied racing image is definitive visual authority for both character and kart.
- **Character lock:** Stylish young man; shaggy blond hair; pale teal eyes; rectangular black glasses; black ear gauges; fitted black beanie with small purple, silver, and bronze pins; oversized black hoodie with an original purple thorn-like graphic; relaxed, confident, alternative, slightly mischievous presentation.
- **Kart lock:** Low aggressive street-racer construction; dark bronze frame; black and deep-purple bodywork; exposed mechanical structure; wide tires; purple exhaust energy; thorned-skull nose shield.
- **Balance mapping:** AA-08 Turbo Bruiser — Speed 7 / Acceleration 5 / Weight 7 / Handling 4 / Mini-Turbo 8 / Traction 5.
- **Provenance:** Manny confirmed he controls the definitive reference and authorizes transformation into production game assets.
- **2D approval:** Manny approved the portrait, front, rear, steer-left, steer-right, hit, and corrected victory designs on 2026-08-28. Runtime normalization and validation are part of the pre-kart checkpoint.
- **Implementation gate:** This approval does not approve GLB geometry, runtime integration, manifest activation, or live deployment. Those remain separately gated under the Slice 3 avatar pipeline.
- **Approval:** Manny approved the character lock, definitive reference, rights, The Grave Shift name/design, AA-08 mapping, and complete 2D design package on 2026-08-28.

## ADR-026: Make Speed authoritative for sustained player road velocity

- **Date:** 2026-08-30
- **Status:** Approved
- **Context:** Live tests showed Speed 5–6 drivers exceeding Speed 8–10 drivers without boost. The controller clamped velocity to a Speed-derived maximum before Rapier applied passive damping and collider friction, so lower Acceleration could prevent a driver from reaching that maximum.
- **Decision:** The custom arcade controller exclusively owns player-kart longitudinal deceleration, lateral grip, and surface response. Player kart bodies use zero passive linear damping and zero collider friction with the minimum friction-combine rule. `createKartTuning(stats).maxSpeed` remains the sustained full-throttle asphalt ceiling; Acceleration controls time-to-speed but not the ceiling.
- **Rationale:** This restores the existing PHYS-002 contract that Speed affects maximum road velocity while preserving Acceleration as a distinct, legible stat. It also keeps surface, coasting, braking, drift, and boost behavior inside the controller that already defines those systems.
- **Product impact:** A higher Speed score now produces a higher reachable unboosted asphalt maximum under equivalent conditions. Drivers sharing a Speed score converge to the same maximum even when their Acceleration differs.
- **Scope:** No roster statistics, tuning formulas, boost values, or AI pacing are changed. Numerical balance follows after the corrected player model is deployed and evaluated live.
- **Approval:** Manny requested implementation on 2026-08-30 after supplying live Kraken, Accu, Krios, and Lula speed evidence.

## ADR-027: Restore the PRD acceleration, off-road transition, and AI lane contracts

- **Date:** 2026-08-30
- **Status:** Approved
- **Context:** Live testing accepted the corrected Speed ceilings but found three remaining gameplay gaps. Acceleration values felt too similar because launch force was far above the PRD curve; entering dirt or grass clamped speed to the surface cap in one frame; AI used an excessive sample-count lookahead, cut across inside grass, and had no nearby-racer input for overtaking.
- **Decision:** Use the PRD launch formula `4.0 + 0.55 × Acceleration` with its speed-ratio taper. Preserve Traction-defined dirt and grass caps while reducing excess entry speed progressively. Calculate AI lookahead in the PRD's 5–14 meter range, constrain candidate lanes to the road with a kart margin, and give each AI nearby-racer position, speed, and lateral-offset data for committed passing decisions.
- **Rationale:** Each change closes an existing PHYS-004 or Slice 4 acceptance gap. Acceleration becomes visible without changing Speed ceilings, off-road entry remains readable without erasing Traction, and AI can follow the road and pass instead of targeting long chords or queuing on one line.
- **Product impact:** Low-Acceleration racers take longer to build momentum. Dirt and grass slow racers over a short transition. AI racers use multiple legal lines and can move around slower traffic.
- **Scope:** Driver stats, Speed ceilings, boost values, items, AI item use, and final difficulty tuning are unchanged.
- **Approval:** The existing PRD formulas and Slice 4 acceptance criteria govern this correction. Manny directed the follow-up on 2026-08-30 after testing the deployed Speed fix.

## ADR-028: Make kart-impact speed retention Weight-driven but bounded

- **Date:** 2026-08-30
- **Status:** Approved
- **Context:** Kart-to-kart contact used relative mass for lateral displacement but did not explicitly reduce forward speed. Manny requested a measurable Weight advantage while requiring Accu at Weight 10 to retain meaningful collision risk.
- **Decision:** Meaningful closing impacts reduce positive forward velocity with the governed PRD retention curve. Impact severity scales with closing speed; the racer's Weight sets the base loss; the opponent's Weight applies a small bounded pressure modifier. Retention is clamped to 65–96%, and contacts below 0.75 m/s do not reduce speed. Lateral velocity and knockback remain intact.
- **Rationale:** The 15-point full-impact loss range makes Weight legible without erasing the value of positioning or collision avoidance. At severe impact, Accu retains approximately 86% against a Weight 2 racer, while that Weight 2 racer retains approximately 67% against Accu. Accu therefore gains a clear advantage but still loses roughly 14% of forward speed.
- **Scope:** The change applies equally to player and AI kart contacts. It does not alter driver stats, mass-based lateral impulse, walls, items, Speed ceilings, Acceleration, or surface response.
- **Approval:** Manny explicitly requested Weight-driven collision speed reduction on 2026-08-30 and specified that Weight 10 must not become virtually immune.

## ADR-029: Make character Speed authoritative for AI straight-line pace

- **Date:** 2026-08-31
- **Status:** Approved
- **Context:** Live testing found that player-controlled racers frequently reached their Speed-defined maximum while AI-controlled versions did not. AI desired speed used an absolute 20.5–26.0 m/s range derived from grid profile pace rather than the selected character's kart tuning. The first circuit profile peaked at 24.1 m/s against a 29.7 m/s character maximum.
- **Decision:** Each AI driver receives its selected character's `maxSpeed` and uses that value as its neutral clear-straight target. Profile pace now adjusts the curvature penalty, preserving difficulty differences through corner-speed judgment rather than an unrelated straight-line ceiling. Leading AI receives no hidden top-speed reduction. Trailing top-speed allowance is clamped to the PRD's 4% maximum and passed explicitly to the kart controller.
- **Rationale:** Speed must describe the same physical capability whether a character is controlled by the player or AI. Corner judgment, braking, overtaking, collisions, and surface response provide sufficient honest sources of race-performance variation.
- **Product impact:** AI versions of high-Speed racers can now use their straight-line advantage, while low-Speed racers retain their lower cap. Clear straights become more competitive without giving every AI identical performance or altering player handling.
- **Scope:** Roster stats, player caps, Acceleration, Weight collision response, lane selection, items, and global difficulty settings are unchanged.
- **Approval:** Manny approved the character-cap AI balance model on 2026-08-31 after confirming that AI racers consistently appeared unable to reach the maximum speeds available to players.

## ADR-030: Render the race minimap from shared Circuit Alpha topology

- **Date:** 2026-08-31
- **Status:** Approved
- **Context:** TRACK-004 and UI-001 require a race minimap, but the live HUD exposed only textual rank and lap information. Manny requested a minimap that tracks all racers and explicitly required mobile placement to be considered.
- **Decision:** Normalize Circuit Alpha's ordered 384 world samples into one aspect-preserving SVG view box and reuse that same immutable point set for the rendered course and progress-interpolated racer markers. Render each racer as a nearest-neighbor head crop from their approved transparent 2D portrait; render the player last at a larger size with a gold outline. Place the map below Lap on desktop and as a reduced upper-left element on mobile. Hide it with the rest of the live HUD during the finish presentation.
- **Rationale:** Deriving the map from the race-progress topology prevents visual drift between the course, lap logic, and marker positions. SVG stays sharp across desktop and mobile without a new image asset, while a single static path plus eight lightweight markers stays within the HUD performance budget.
- **Product impact:** Players can read pack spacing and approaching traffic without relying only on rank. The map remains visible during normal and rear-camera driving but does not compete with mobile controls or the victory pose.
- **Scope:** This closes the minimap portion of Slice 6. It does not add item HUD, player portrait HUD, final-lap treatment, pause, audio, or other remaining Slice 6 work.
- **Approval:** Manny requested the racer-tracking minimap and mobile-aware placement on 2026-08-31, then selected pixel-rendered driver heads as the marker treatment before publication.

## ADR-031: Use one driver-sprite state contract for player and AI racers

- **Date:** 2026-08-31
- **Status:** Approved
- **Context:** Production AI drivers remained on their rear frame while turning, colliding, finishing, and appearing in the player's rear-view camera. Three active drivers also lacked the required front frame, and Accu exposed baked checkerboard pixels and incorrect cockpit depth.
- **Decision:** Player and AI sprites use the same ordered state selector: victory, hit, front during rear view, steering, then rear. Every involved racer receives a hit window after kart contact. Character-specific neutral/front placement overrides remain manifest data. New or repaired bitmap derivatives stay outside runtime paths until they pass alpha validation and Manny's visual approval.
- **Rationale:** A single selector prevents player and AI behavior from drifting while preserving character-specific art and cockpit placement. Keeping visual candidates approval-gated protects existing likeness and asset locks.
- **Product impact:** AI drivers visibly react to the race rather than appearing static, and rear view can show every driver's face once all missing front assets are approved.
- **Scope:** This does not change AI driving decisions, physics, roster stats, kart geometry, cameras, race ranking, or character identity.
- **Implementation closure:** Manny approved the Lavi, corrected Manaconda, and Accu front candidates plus deterministic alpha cleanup on 2026-08-31. All active production packages now contain six validated states; Accu's three affected wheel apertures are transparent; controlled revisions prevent stale cached art.
- **Approval:** Manny requested complete driver-state behavior and the Accu corrections on 2026-08-31.

## ADR-032: Record the canonical repository as public

- **Date:** 2026-08-31
- **Status:** Approved
- **Context:** Project-session instructions still described the canonical repository as private, while GitHub reported it as public. That mismatch created an avoidable publication-authority stop during the Accu correction.
- **Decision:** Treat and describe the canonical GitHub repository as public in durable project guidance. Public visibility does not grant blanket authority to publish, merge, deploy, delete, or change protected state; the existing PRD and approval gates continue to govern each action.
- **Product impact:** Future sessions can assess disclosure risk and repository state accurately before proposing or executing work.
- **Implementation impact:** `AGENTS.md` and `README.md` explicitly identify the repository as public. Stale external project instructions should be updated to match when their settings surface is available.
- **Approval:** Manny confirmed the repository is public and approved correcting the project instructions on 2026-08-31.

## ADR-033: Accept Accu's deployed camera and steering-control correction

- **Date:** 2026-08-31
- **Status:** Approved
- **Context:** PR #54's vertical-only placement left Accu's chase hair cut by a firm horizontal cockpit seam and did not expose a readable steering wheel in rear-camera view. PR #56 instead corrected sprite depth and moved Pink Precision's modeled steering control only for the neutral front frame.
- **Decision:** Preserve PR #56's chase-oriented driver position `[0, 0.82, -0.72]`, neutral front position `[0, 0.9, 0.22]`, and front-frame-only modeled steering-control position `[0, 1.46, -0.46]`. Preserve the accepted chase-state wheel suppression and stopped-on-grass relaunch behavior.
- **Evidence:** PR #56 CI run `33447987037` and main validation/deployment run `33448083520` passed. Manny then approved the deployed chase-camera hair edge, rear-camera seated composition and visible wheel, chase-state wheel suppression, and grass relaunch behavior.
- **Product impact:** Accu and Pink Precision now pass their runtime camera-presentation checkpoint without changing approved PNG or GLB bytes, physics, camera selection, or other drivers.
- **Approval:** Manny approved the deployed correction on 2026-08-31.

## ADR-034: Preserve driver actions in front-facing camera views

- **Date:** 2026-09-01
- **Status:** Approved
- **Context:** Amendment 1.9 completed one neutral front frame per active production driver, but rear-camera steering fell back to neutral front while hit and victory could expose rear-oriented action art. This breaks pose continuity when the camera faces the front of a kart.
- **Decision:** Add front-steer-left, front-steer-right, front-hit, and front-victory to the production driver contract. Select action first and facing second for player and AI racers. During the one-character-at-a-time rollout, missing front actions use neutral front as the only allowed front-facing fallback.
- **Rationale:** The camera should change the view of the simulated state, not erase or reverse the state. A neutral-front fallback preserves facing without publishing unapproved art.
- **Scope:** No approved chase or neutral-front raster is replaced. Identity, kart geometry, stats, physics, camera placement, and steering-control ownership remain unchanged. Each character's new raster package and public integration remain separately approval-gated.
- **Rollout:** Kraken is first because his approved front-victory frame already satisfies one quarter of the new contract.
- **Kraken pilot approval:** Manny approved Kraken's front-steer-left, front-steer-right, and front-hit candidates on 2026-09-01. Integrate them with the unchanged approved front-victory frame and require live verification before beginning another driver.
- **Approval:** Manny directed the project to address the missing front-facing steering, hit, and victory states on 2026-09-01.

## ADR-035: Accept Kraken's front-action pilot

- **Date:** 2026-09-01
- **Status:** Approved
- **Context:** PR #59 deployed Kraken's approved front-steer-left, front-steer-right, and front-hit frames with the unchanged approved front-victory frame. The one-character rollout blocked the next driver until live verification passed.
- **Decision:** Accept Kraken's `kraken-runtime-20260901-2` camera-facing action package. Preserve its four front-action files, shared selector behavior, neutral-front fallback contract, placement, and steering-control ownership.
- **Evidence:** PR #59 head CI run `33464307463` and main run `33464380102` passed. Deployed response hashes matched the approved local files. Manny reported the requested steering, hit, victory, chase restoration, transparency, cockpit, and wheel checks passed on 2026-09-01.
- **Product impact:** Kraken's pilot is complete. The one-character rollout may begin the next active driver's separately reviewed package.
- **Approval:** Manny reported "Passed" after testing the deployed checkpoint on 2026-09-01.

## ADR-036: Approve the Manaconda and Krios front-action batch

- **Date:** 2026-09-01
- **Status:** Approved
- **Context:** Kraken's live pilot passed, unlocking the next rollout package. Manny authorized two drivers per batch and selected the next active-roster pair: Manaconda and Krios.
- **Decision:** Add approved front-steer-left, front-steer-right, front-hit, and front-victory frames for both drivers. Preserve each character's existing front placement and kart contract. Manaconda's four sprites each contain exactly one steering wheel because The Wayfinder is wheel-free. Krios's sprites contain no steering wheel or kart geometry because The Hornbreaker supplies the modeled control.
- **Transparency correction:** Krios's first review sheet retained baked pale matte inside the closed horn loops. Manny rejected that defect. The approved revision clears the enclosed horn apertures to alpha in both steering frames and victory; the hit frame was already clean. The runtime gate must reject future loss of the two substantial enclosed transparent horn apertures.
- **Controlled revisions:** `manaconda-runtime-20260901-3` and `krios-runtime-20260901-2`.
- **Scope:** Existing chase art, neutral front art, kart GLBs, placement, physics, stats, camera geometry, and shared selector behavior remain unchanged.
- **Approval:** Manny approved the revised two-driver package on 2026-09-01.

## ADR-037: Accept the Manaconda and Krios front-action batch

- **Date:** 2026-09-01
- **Status:** Approved
- **Context:** PR #62 deployed the approved Manaconda and Krios camera-facing steering, hit, and victory packages. PR #63 recorded the deployed bundle and matching response hashes. The rollout blocked the next pair until Manny completed the live camera/action check.
- **Decision:** Accept `manaconda-runtime-20260901-3` and `krios-runtime-20260901-2`. Preserve all eight front-action files, the shared selector behavior, each driver's approved front placement, and the existing steering-control ownership rules. Manaconda's sprites retain exactly one wheel. Krios's sprites remain wheel-free, and the enclosed areas between his horns remain transparent.
- **Evidence:** PR #62 head run `33507676888` and main run `33507775105` passed. PR #63 merged at `2ca852b47f16b8221275ee2b5542650d609b9a0d`; main run `33508253050` passed. The deployed bundle references both controlled revisions, and all eight response hashes match the approved files. Manny confirmed the requested live checks on 2026-09-01.
- **Product impact:** The Manaconda and Krios batch is complete. The next approved two-driver batch may enter visual review.
- **Approval:** Manny reported "Confirmed" after testing the deployed checkpoint on 2026-09-01.

## ADR-038: Approve the Keeg and McFleurdel front-action batch

- **Date:** 2026-09-01
- **Status:** Approved
- **Context:** After the Manaconda and Krios batch passed live testing, Manny authorized Keeg and McFleurdel as the next two-driver front-action batch. Keeg's first steering pair did not separate the directions clearly. McFleurdel's first review retained green and white matte in hair and arm gaps.
- **Decision:** Add four approved front-facing action frames for both drivers. Keeg's steering frames use opposite camera-side leans and distinct arm positions. McFleurdel's frames preserve black hair on the viewer's left and white hair on the viewer's right, with transparent black-curl interiors and arm gaps.
- **Regression controls:** The runtime gate decodes all eight files, checks 512 x 512 non-interlaced RGBA data and transparent corners, and rejects a connected pale matte component of 30 pixels or more in McFleurdel's reviewed steering gaps.
- **Controlled revisions:** `keeg-runtime-20260901-3` and `mcfleurdel-runtime-20260901-2`.
- **Scope:** Existing chase art, neutral front art, kart GLBs, placement, physics, stats, camera geometry, and shared selector behavior remain unchanged.
- **Approval:** Manny approved Keeg first, then approved McFleurdel after the corrected steering transparency review on 2026-09-01.

## ADR-039: Accept the Keeg and McFleurdel front-action batch

- **Date:** 2026-09-01
- **Status:** Approved
- **Context:** PR #65 deployed the approved Keeg and McFleurdel camera-facing steering, hit, and victory packages. PR #66 recorded the deployed bundle, regression coverage, and matching response hashes. The rollout blocked the next pair until Manny completed the live camera/action check.
- **Decision:** Accept `keeg-runtime-20260901-3` and `mcfleurdel-runtime-20260901-2`. Preserve all eight front-action files, the shared selector behavior, each driver's approved front placement, and their modeled steering-control ownership. McFleurdel's reviewed black-curl interiors and arm gaps remain transparent.
- **Evidence:** PR #65 head run `33563640441` and main run `33563732551` passed. PR #66 merged at `f8a2ed8be0d72fde62c9403dae4b15e94222f7da`; main run `33564231150` passed. The deployed bundle references both controlled revisions, and all eight response hashes match the approved files. Manny confirmed both steering directions, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation on 2026-09-01.
- **Product impact:** The Keeg and McFleurdel batch is complete. Lavi, Toph, Lula, and Accu remain on the governed neutral-front fallback until their separately approved packages are published.
- **Approval:** Manny's final "Approved" records product-owner live acceptance and authorizes publication of this documentation checkpoint.

## ADR-040: Approve the Lavi and Toph front-action batch

- **Date:** 2026-09-02
- **Status:** Approved
- **Context:** Keeg and McFleurdel passed live acceptance, leaving Lavi, Toph, Lula, and Accu on the neutral-front rollout fallback. Manny approved Lavi and Toph as the next two-driver batch, then reviewed their four camera-facing action candidates per driver.
- **Decision:** Integrate the approved front-steer-left, front-steer-right, front-hit, and front-victory frames for Lavi and Toph. Commanded left leans toward the viewer's right; commanded right leans toward the viewer's left. Both packages remain free of wheel and kart geometry because Potato and The Grave Shift supply modeled steering controls.
- **Transparency treatment:** Lavi's generated files preserve native alpha. Toph's generated previews contained an opaque checkerboard, so the reviewed derivatives remove the edge-connected background and a one-pixel alpha fringe without changing the approved character artwork. The runtime gate must decode all eight files as 512 x 512 non-interlaced RGBA PNGs and reject non-transparent corners.
- **Controlled revisions:** `lavi-runtime-20260902-5` and `toph-runtime-20260902-2`.
- **Scope:** Existing chase art, neutral front art, kart GLBs, placement, physics, stats, camera geometry, and modeled steering controls remain unchanged.
- **Publication gate:** This approval authorizes local runtime integration and validation. Publishing the branch, opening or merging a pull request, deploying, and recording live acceptance require a later explicit approval.
- **Approval:** Manny approved both candidate sheets on 2026-09-02.

## ADR-041: Correct and accept Lavi's camera-facing placement

- **Date:** 2026-09-03
- **Status:** Approved
- **Context:** The deployed Lavi and Toph batch passed asset delivery and state selection. Manny accepted Toph. Lavi's camera-facing layer rendered too low behind Potato's tall body, leaving the head near the modeled wheel and hiding the torso.
- **Decision:** Preserve Toph at `[0, 0.45, -0.12]`. Raise only Lavi's neutral front and four front-action states to `[0, 0.9, -0.12]`. Keep Lavi's chase-facing states at the existing default position.
- **Rationale:** Lavi's neutral front image places the hands about 0.46 world units below the face at the runtime sprite scale. Raising the layer by 0.45 moves the hands to Potato's wheel while exposing enough upper body for a seated composition. The value also matches the proven front-height correction used by Accu without copying Accu's depth or wheel override.
- **Scope:** No PNG or GLB bytes change. Toph, Potato, camera logic, physics, stats, action selection, chase-facing placement, and modeled steering controls remain unchanged.
- **Deployment evidence:** PR #70 head run `33664237133` passed. The PR merged at `ac39b1ad490999007429713a3f5b82aca274f1dc`; main run `33664361276` passed validation and Pages deployment. The live bundle maps Lavi to `[0, 0.9, -0.12]` and preserves Toph at `[0, 0.45, -0.12]`.
- **Acceptance evidence:** PR #71 recorded the deployment evidence and merged at `cd9dad3013208e973421616d90b534c3bbfc4e77`; main run `33664925678` passed. Manny approved the corrected live cockpit result on 2026-09-03 after previously accepting Toph.
- **Product impact:** The Lavi and Toph front-action batch is complete. Both drivers pass the full live camera/action matrix with their character-specific front placements and one modeled wheel each.
- **Approval:** Manny's 2026-09-03 approval records Lavi's live acceptance and authorizes publication of the acceptance checkpoint.

## ADR-042: Start the Lula and Accu front-action batch

- **Date:** 2026-09-03
- **Status:** Completed
- **Context:** Lavi and Toph passed live acceptance. Lula and Accu are the only active production drivers still using the neutral-front fallback for camera-facing steering, hit, and victory.
- **Decision:** Prepare four camera-facing action candidates for Lula, then four for Accu. Each package must derive from the approved front-facing identity and retain the character's existing placement and steering-control ownership.
- **Character constraints:** Lula retains her approved complexion, green hair, leaf forehead mark, seated footprint, wheel-free driver art, and `[0, 0.45, -0.12]` front placement. Accu retains her pink-hat silhouette, two-tone pink hair, heart-pattern top, seated orientation, `[0, 0.9, 0.22]` front placement, and Pink Precision's modeled front wheel.
- **Scope:** Candidate preparation only. Existing runtime PNGs, kart GLBs, manifest revisions, gameplay code, physics, stats, cameras, and previously accepted drivers remain unchanged.
- **Approval gate:** Manny must approve each driver's four-frame candidate package before runtime integration. Publishing runtime assets, deploying them, and recording live acceptance remain separate gates.
- **Approval:** Manny directed the project to move onto Lula and Accu on 2026-09-03, approved Lula's four-frame review set, then approved Accu's set and authorized local integration.

## ADR-043: Integrate the approved Lula and Accu front-action packages

- **Date:** 2026-09-03
- **Status:** Deployed; live acceptance pending
- **Context:** Manny approved all eight camera-facing action frames in the final rollout batch. Lula and Accu are the last active production drivers on the neutral-front action fallback.
- **Decision:** Add each driver's front-steer-left, front-steer-right, front-hit, and front-victory files to the ten-state runtime contract. Use controlled revisions `lula-runtime-20260903-3` and `accu-runtime-20260903-3`.
- **Character constraints:** Lula keeps `[0, 0.45, -0.12]` and The Verdant Hart's modeled wheel. Accu keeps `[0, 0.9, 0.22]`, the front-only modeled-wheel position `[0, 1.46, -0.46]`, and Pink Precision's modeled wheel. None of the eight sprites contains a wheel or kart geometry.
- **Scope:** Eight PNGs, their manifest URLs, runtime-asset validation, manifest tests, and governed records. Kart GLBs, chase art, neutral fronts, gameplay logic, physics, stats, camera geometry, and previously accepted packages remain unchanged.
- **Verification:** Local validation passed with 16 test files / 83 tests, 72 decoded runtime PNGs, 27 materialized GLBs, matching source/build hashes, and both revision strings plus all eight new paths in the production bundle.
- **Deployment evidence:** Manny authorized publication on 2026-09-03. PR #73 head run `33708240532` passed, the PR merged at `735da4015bca6f9610f6a358672804f4c73b35f9`, and main run `33708310011` passed validation and Pages deployment. The live `assets/index-D84iBLTd.js` bundle references both revisions and all eight paths; every deployed PNG response matches the approved SHA-256 value.
- **Approval gate:** Publication and deployment are complete. Product-owner desktop/mobile camera-action playtesting remains required before recording live acceptance and closing the rollout.
- **Approval:** Manny approved Accu's four-frame review set after approving Lula's set, then authorized publication on 2026-09-03.

## ADR-044: Accept Lula and Accu and close the front-action rollout

- **Date:** 2026-09-03
- **Status:** Approved
- **Context:** PR #73 deployed the final eight front-facing action frames. PR #74 recorded the deployed bundle, response hashes, and remaining live test gate.
- **Decision:** Accept `lula-runtime-20260903-3` and `accu-runtime-20260903-3`. Preserve all eight front-action files, shared selector behavior, approved placements, transparent internal gaps, and modeled-wheel ownership. The front-action rollout is complete for all nine active production drivers.
- **Evidence:** PR #73 head run `33708240532` and main run `33708310011` passed. PR #74 merged at `95fcf26fb699065cd9082951b3e8a3e18790e8a2`; main run `33708825661` passed validation and Pages deployment. The live bundle references both controlled revisions, and all eight response hashes match the approved files. Manny confirmed both steering directions, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation on 2026-09-03.
- **Product impact:** No active production driver remains on the neutral-front fallback because of missing camera-facing action art. New character, asset, or gameplay work requires separate approval.
- **Approval:** Manny's final "Approved" records product-owner live acceptance and authorizes publication of this documentation checkpoint.

## ADR-045: Lock Jennifer's character identity and source authority

- **Date:** 2026-09-03
- **Status:** Approved
- **Context:** Manny started Jennifer's one-character Slice 3 intake with a detailed written description and a supplied racer collage showing Jennifer, her Newfoundland companion, and a nature-built kart.
- **Decision:** Lock Jennifer as a tall, sturdy druidic herbalist, caretaker, and protector with the physical features, clothing, staff, restrained magic, temperament, and massive gray Newfoundland defined in `docs/avatars/JENNIFER.md`. Treat the supplied collage as definitive visual authority for Jennifer, the dog, and the kart design language. The written character lock controls any conflict in color, body, material, or accessory detail.
- **Required corrections from the reference:** Production art must use Jennifer's mandatory purple wire-rimmed glasses and the Newfoundland's gray coat even where the collage appears darker. The amethyst staff glow remains subtle.
- **Provenance:** Manny confirmed that he controls the supplied reference and authorizes its transformation into public production game assets after later approval gates pass.
- **Scope:** This decision approves identity, reference authority, and transformation rights only. It does not approve a kart name or final design, a companion implementation method, an AA profile, raster derivatives, GLB geometry, manifest activation, publication, or deployment.
- **Next gate:** Approve the kart concept and companion treatment, then define driving feel and select among the still-available AA-01, AA-06, and AA-12 profiles.
- **Approval:** Manny answered yes to the character lock, definitive-reference rule, and transformation authorization on 2026-09-03.

## ADR-046: Lock Jennifer's Hearthwarden kart direction

- **Date:** 2026-09-03
- **Status:** Approved
- **Context:** Jennifer's character and source authority were locked under ADR-045. Her racing reference established a broad pear-wood, bronze, green, and tree-medallion language, but the production kart required a name, construction rule, companion position, staff mount, and separation from Lula's living Verdant Hart.
- **Decision:** Name Jennifer's kart The Hearthwarden. Build it as a low, broad druidic field roadster converted from a working apothecary wagon, using shaped pear wood, woven willow panels, bronze brackets, forest-green surfaces, turquoise accents, a round tree-of-life nose medallion, and restrained amethyst details. Four wide practical tires use bronze hubs with turquoise-green rim details.
- **Companion treatment:** The massive gray Newfoundland rides on a reinforced right-rear perch and appears in all ten driver frames. The dog remains on the same physical side when camera facing changes. Jennifer's portrait stays solo so her face remains readable in small HUD and minimap uses.
- **Staff and steering:** Jennifer's six-foot staff mounts upright on the left-rear rail, opposite the dog. The Hearthwarden supplies one modeled steering wheel; every driver raster remains free of wheel and kart geometry.
- **Differentiation:** The Hearthwarden is a constructed field vehicle. It does not use The Verdant Hart's living-root chassis, stag face, antlers, structural foliage, or delicate silhouette. Secured vines, herbs, and flowers may appear only as cargo or trim.
- **Effects:** Boost treatment uses restrained teal exhaust and brief herbal particles without turning Jennifer's practical magic into a large spectacle.
- **Scope:** This locks the kart name and visual direction. It does not assign an AA profile, approve raster artwork or GLB geometry, activate the character manifest, publish assets, or deploy the package.
- **Next gate:** Approve Jennifer's driving feel and one available AA profile before asset preparation.
- **Approval:** Manny approved The Hearthwarden and the complete proposed kart lock on 2026-09-03.

## ADR-047: Assign Jennifer and The Hearthwarden to AA-12

- **Date:** 2026-09-03
- **Status:** Approved
- **Context:** Jennifer's character and The Hearthwarden were locked under ADR-045 and ADR-046. The available profiles were AA-01 Feather Sprinter, AA-06 Grip Specialist, and AA-12 All-Surface Heavy.
- **Decision:** Assign Jennifer and The Hearthwarden to AA-12 All-Surface Heavy: Speed 8 / Acceleration 5 / Weight 8 / Handling 4 / Mini-Turbo 4 / Traction 7.
- **Driving identity:** The Hearthwarden is a patient, planted racer that holds momentum, resists displacement, and remains dependable on dirt and grass. Acceleration 5 and Handling 4 make launch recovery and tight direction changes costly. Mini-Turbo 4 makes deliberate line choice more valuable than repeated drift boosts.
- **Rationale:** AA-12 supports the approved heavy field-roadster construction and companion load while preserving clear weaknesses. It does not overlap Krios's Speed 10 straight-line dominance or Accu's Weight 10 collision specialization. AA-01 would make the package a fragile featherweight, while AA-06 would shift it toward a lighter and more agile grip identity.
- **Roster impact:** AA-12 is assigned to Jennifer and is unavailable to later characters unless Manny approves a remap or retirement. AA-01 and AA-06 remain available. Jennifer remains outside `characterManifest` until her asset and implementation gates pass.
- **Scope:** This decision locks the six-stat mapping and selection descriptor. It does not approve raster assets, GLB geometry, runtime activation, publication, or deployment.
- **Next gate:** Prepare Jennifer's portrait candidate for visual review, followed by the ten driver states and kart geometry as separate approvals.
- **Approval:** Manny approved Jennifer / The Hearthwarden for AA-12 All-Surface Heavy on 2026-09-03.

## ADR-048: Lock Jennifer's corrected portrait design

- **Date:** 2026-09-03
- **Status:** Approved; runtime derivative complete
- **Context:** Jennifer's character, kart, and balance mapping were approved under ADR-045 through ADR-047. The first portrait candidate retained visible makeup and heavier frames. A corrected candidate removed the makeup treatment and used thin purple wire-rimmed glasses while preserving the approved hair, expression, jewelry, and robe language.
- **Decision:** Lock the corrected solo portrait as Jennifer's portrait design authority. It preserves her natural bare face, dark-teal eyes, thin purple wire-rimmed glasses, small sincere smile, dense dark chocolate-brown curls, half-up braids, threaded feathers, turquoise jewelry, and deep forest-green floral robe with restrained bronze detail.
- **Technical state:** The approved 1254 x 1254 preview is an RGB PNG with a baked checkerboard and no alpha channel. Two built-in background-extraction passes failed to produce genuine transparency. The preview cannot enter the runtime path or satisfy the portrait contract.
- **Scope:** This approval locks the portrait appearance only. It does not approve a runtime derivative, the ten driver states, kart geometry, manifest activation, publication, deployment, or live acceptance.
- **Normalization sequence:** Manny approved deterministic edge-connected background removal on 2026-09-03. Defer that cleanup until the portrait and all ten driver-frame designs are approved, then normalize and validate the complete eleven-image set immediately before its asset commit.
- **Closure:** After the ten-frame design approval, the portrait was normalized to a 256 x 256 transparent sRGBA PNG with transparent corners. The approved RGB preview remains outside the runtime path.
- **Next gate:** Complete Jennifer's ten-frame driver design package without placing opaque previews in the runtime path.
- **Approval:** Manny approved the corrected portrait design on 2026-09-03.

## ADR-049: Approve and normalize Jennifer's ten-frame driver set

- **Date:** 2026-09-03
- **Status:** Approved and complete
- **Context:** Jennifer's portrait was locked under ADR-048. The remaining 2D package required neutral, steer-left, steer-right, hit, and victory in both chase-facing and camera-facing orientations, with the Newfoundland permanently on Jennifer's physical right.
- **Decision:** Approve all ten driver designs. The dog appears viewer-right in chase-facing art and viewer-left in camera-facing art. Steering pairs are directionally distinct; hit uses a controlled recoil and protective dog response; victory uses a restrained raised fist and proud dog posture. Every raster remains free of kart, wheel, seat, staff, and tire geometry.
- **Normalization:** Manny authorized deterministic cleanup and directed that it occur only after all eleven designs were approved. `tools/assets/prepare_jennifer_2d.py` removes edge-connected checker pixels, enclosed pale checker pockets between curls, and the narrow pale source outline before premultiplied-alpha resizing.
- **Evidence:** The runtime set contains one 256 x 256 portrait and ten 512 x 512 driver frames as transparent sRGBA PNGs with transparent corners. Dark- and light-background contact sheets show clean silhouettes and interior gaps. The runtime gate decodes every AA-12 PNG and rejects an opaque pale-neutral component of eight pixels or more; the largest current component is four pixels.
- **Scope:** This approves and prepares Jennifer's 2D runtime package. It does not approve The Hearthwarden's GLB geometry, manifest activation, publication, deployment, or live acceptance.
- **Next gate:** Prepare The Hearthwarden's deterministic LOD0, LOD1, and LOD2 geometry candidate for Manny's review.
- **Approval:** Manny approved the ten-frame driver design set on 2026-09-03.

## ADR-050: Approve The Hearthwarden Candidate 2 geometry

- **Date:** 2026-09-03
- **Status:** Approved and prepared
- **Context:** The Hearthwarden required deterministic LOD0, LOD1, and LOD2 geometry under the approved kart lock. Candidate 1 matched the intended field-roadster identity but left the rear herb details and front tree-of-life medallion visually detached. Candidate 2 corrected both connections. Manny noted that this was the quickest kart-design approval cycle he could remember.
- **Decision:** Approve Candidate 2 as The Hearthwarden's production geometry. Keep its constructed pear-wood frame, woven willow side panels, forest-green bodywork, aged bronze joints, turquoise accents, four wide tires, one modeled steering wheel, kart-right Newfoundland perch, kart-left staff rack, restrained amethyst, remedy cargo, and tree-of-life nose emblem.
- **Connection corrections:** Rear herb stems extend below the remedy-box lids. The nose emblem overlaps a central pear-wood mounting boss, while two bronze stays connect it to the front frame.
- **Evidence:** LOD0 uses 14,220 triangles with SHA-256 `2e787f1acef4fae95d12833424bb93939b3803233c40c51ed03d7c6e4ec18277`; LOD1 uses 8,604 with `420461571b7bfb9202c91c94b0513d40dc933ba63796051bb14c7904468891d9`; LOD2 uses 4,156 with `d139dbc9e263ad1090b208d217bc61df15d194a7f7d7b9025b131df1bd48d207`. All three provide four materials, thirteen required nodes, one `SteeringWheel` node, and `extras.forward: "-Z"`. Deterministic reruns matched byte for byte.
- **Efficiency record:** The short cycle came from converting the kart lock into explicit silhouette, construction, asymmetry, and anti-overlap rules before modeling; checking current builder scale and runtime contracts first; reusing one deterministic exporter for all LODs; and pairing direct GLB review with a four-angle sheet. Future reviews must test numerical overlap for every attached detail and use a new filename for every revision so viewer caching cannot hide a correction.
- **Scope:** This approval places the three GLBs in AA-12 and adds them to the materialization gate. It does not activate Jennifer in `characterManifest`, approve cockpit placement, publish, deploy, or record live acceptance.
- **Next gate:** Prepare Jennifer's local runtime integration and cockpit-placement review.
- **Approval:** Manny approved Candidate 2 on 2026-09-03 and asked that its faster workflow be preserved for later 3D assets.

## ADR-051: Integrate Jennifer and The Hearthwarden locally

- **Date:** 2026-09-03
- **Status:** Locally integrated; publication pending
- **Context:** Jennifer's character, AA-12 mapping, complete 2D package, and corrected Hearthwarden geometry were approved under ADR-045 through ADR-050. Manny approved proceeding to the local runtime integration gate.
- **Decision:** Replace the AA-12 placeholder with Jennifer under controlled revision `jennifer-runtime-20260903-1`. Use her approved portrait, ten driver frames, The Hearthwarden LOD0 runtime kart, `NEGATIVE_Z_KART_VISUAL_YAW`, All-Surface Heavy descriptor, and 8 / 5 / 8 / 4 / 4 / 7 statistics. Preserve one modeled steering wheel by keeping every Jennifer frame wheel-free.
- **Cockpit placement:** Use chase-facing driver position `[0, 0.92, -0.12]`, camera-facing position `[0, 0.84, -0.12]`, and camera-facing modeled-wheel position `[0, 1.86, -0.42]`.
- **Evidence:** Manifest and app-shell contracts confirm AA-12 selection and race handoff, all approved asset URLs, controlled revision, profile statistics, negative-Z orientation, camera-specific placement, and modeled-wheel ownership. An offline render using the production scale/grounding math, deterministic GLB geometry, and approved PNGs confirms rear-structure occlusion, kart-right dog placement, and the wheel between Jennifer's hands without covering her face. The remote preview window could not reach the workspace loopback server, so deployed desktop and mobile playtests remain the visual authority. The full local gate passed with strict typecheck, zero-warning lint, 16 Vitest files / 84 tests, 83.19% statement coverage, 30 materialized GLBs, 83 decoded runtime PNGs, and a production build.
- **Scope:** Local code, tests, records, and commit only. This does not authorize pushing the branch, opening or merging a pull request, deploying, or recording live acceptance.
- **Next gate:** Request explicit publication approval, then complete deployed desktop and mobile acceptance.

## ADR-052: Rebrand the product and authorize Jennifer's release

- **Date:** 2026-09-03
- **Status:** Approved for publication
- **Context:** Jennifer and The Hearthwarden passed every local asset, mapping, geometry, and cockpit gate. Manny then approved publication and directed a complete public rebrand that removes the former product name, presentation line, repository slug, live URL, and AA letter logo.
- **Decision:** Rename the public product to `Manaconda's Minigame Mayhem`, rename the canonical repository to `Manaconda33/manacondas-minigame-mayhem`, and move GitHub Pages to `/manacondas-minigame-mayhem/`. The title screen shows the new name without a presentation line. An original route-and-token minigame mark replaces the AA monogram in the shell and favicon.
- **Compatibility rule:** Internal `aa-##` profile, archive, and asset keys remain stable implementation identifiers. They are not public brand copy. User-facing unassigned slots use neutral racer labels.
- **Drift prevention:** Current product copy, metadata, package identity, repository guidance, public links, builder labels, Markdown PRD, and Word approval artifact use the new brand. The production build runs an automated guard that rejects the superseded display name or repository slug outside dated history.
- **Validated binary treatment:** Existing approved GLB bytes remain unchanged so their accepted geometry hashes, cache revisions, and rollback evidence remain valid. Non-rendered generator metadata inside those immutable files is historical build provenance, not player-facing branding. Every maintained kart builder now emits the new generator label for future revisions.
- **Jennifer release migration:** Because Jennifer had not yet been deployed, her three GLBs were regenerated with the new generator metadata and advanced to controlled revision `jennifer-runtime-20260903-2`. Geometry, triangle counts, materials, nodes, and orientation are unchanged. Release hashes are LOD0 `0415224b88770726152a3313b6e0fc517a626a6167558af7a6ccbd836b13f3f0`, LOD1 `545d22ab7f17a17fa14bdb6281db80ac070af159f0a700a57a3694f828e880a8`, and LOD2 `ff7cf64b9eb06defd47d708cf88dfd7780814d9a20d89ac967bc79c8d0baeeb9`.
- **LFS materialization:** Temporary bridge run `33788191680` regenerated only Jennifer's three GLBs with NumPy 2.3.5 and Matplotlib 3.10.8, matched all release hashes, proved the committed pointers unchanged, uploaded only the three approved object IDs, deleted the runner cache, fetched the branch objects back, and passed `git lfs fsck`. The temporary workflow was removed before review.
- **Scope:** Publish Jennifer's approved AA-12 runtime package in the same release. Gameplay, physics, balance, existing character visuals, and previously accepted asset bytes remain unchanged.
- **Local evidence:** The rebrand guard passed across current source, metadata, documentation, filenames, and the Word artifact. Full validation passed with strict typecheck, zero-warning lint, 16 Vitest files / 84 tests, 83.19% statement coverage, 30 materialized runtime GLBs, 83 decoded runtime PNGs, a production build at the new Pages base, and `git lfs fsck`. The renamed 43-page Word PRD passed ZIP integrity and page-by-page rendered review; 30 unchanged pages remained pixel-identical to the approved source, and all 13 changed pages were inspected without clipping or collisions.
- **Approval:** Manny approved publication, repository and Pages renaming, the complete public rebrand, and the new icon direction on 2026-09-03. Desktop and mobile live acceptance remain required after deployment.

## ADR-053: Lock Dragon Queen, The Sovereign Wyrm, and AA-06

- **Date:** 2026-09-03
- **Status:** Approved for asset preparation
- **Context:** Manny began a one-character Slice 3 intake for Dragon Queen with a detailed written description and a supplied racer collage. AA-01 and AA-06 were the only available balance profiles. Manny confirmed that he controls the image, authorized its transformation into public game assets, and designated it as the definitive visual reference.
- **Character decision:** Dragon Queen is a literal sovereign dragon with deep navy scales, subtle gold flecking, molten-gold eyes, broad wings, a long scaled tail, dark-blue and gold ceremonial cloths, minimal royal jewelry, and calm benevolent authority. She must never become humanoid, dragonborn-like, feral, casually comic, or sexualized. Wings and tail remain visible in every portrait and driver-state silhouette.
- **Kart decision:** Name her kart The Sovereign Wyrm. Preserve the reference's low royal grand-tourer body, midnight-blue finish, sculpted gold structural trim, jewel-like blue lighting, substantial tires, and gold dragon nose shield. Build the cockpit around literal dragon anatomy with wing clearance and a visible tail channel. The kart supplies one modeled steering control.
- **Balance decision:** Assign Dragon Queen and The Sovereign Wyrm to AA-06 Grip Specialist: Speed 6 / Acceleration 6 / Weight 5 / Handling 7 / Mini-Turbo 5 / Traction 7. The profile expresses her control-first identity through stable handling and traction without turning appearance into heavyweight performance.
- **Archive treatment:** Cleo remains inactive and restorable. Before Dragon Queen assets enter the standard AA-06 paths, move Cleo's complete approved package byte-for-byte to a dedicated archive location and update `archivedCleo` to those preserved paths. Do not delete, regenerate, or overwrite Cleo's files.
- **Scope:** This approval locks identity, rights, reference authority, kart direction, name, and balance mapping. It does not approve raster derivatives, GLB geometry, runtime activation, publication, deployment, or live acceptance.
- **Next gate:** Prepare one solo portrait candidate and stop for Manny's visual approval before creating the ten driver states.
- **Approval:** Manny approved the definitive reference and transformation rights, The Sovereign Wyrm design/name, and AA-06 Grip Specialist mapping on 2026-09-03.

## ADR-054: Lock Dragon Queen portrait Candidate 2

- **Date:** 2026-09-03
- **Status:** Approved for driver-state preparation
- **Context:** Candidate 1 preserved Dragon Queen's identity but showed too much of her seated body, which would shrink her face below the established HUD and minimap presentation. Candidate 2 tightened the crop while retaining both wings and the long tail.
- **Decision:** Lock Candidate 2 as Dragon Queen's portrait design authority. Preserve its deep navy scales, gold flecking, molten-gold eyes, long muzzle, crown, horns, broad wings, curling tail, layered ceremonial cloths, restrained jewelry, and calm sovereign expression.
- **Normalization:** The approved 1254 x 1254 review export is RGB with a baked checkerboard. Keep it outside runtime paths. After all eleven raster designs are approved, remove the checkerboard deterministically and create the 256 x 256 transparent sRGBA derivative with premultiplied-alpha resizing.
- **Scope:** This approval locks the portrait appearance only. It does not approve the runtime derivative, ten driver states, kart geometry, runtime activation, publication, deployment, or live acceptance.
- **Next gate:** Prepare ten driver-state candidates from the approved portrait identity, then stop for Manny's visual review before normalization.
- **Approval:** Manny approved Candidate 2 on 2026-09-03.

## ADR-055: Approve Dragon Queen's ten driver states and staged 2D package

- **Date:** 2026-09-04
- **Status:** Approved and prepared outside runtime paths
- **Context:** Dragon Queen required five chase-facing and five camera-facing driver designs derived from the approved portrait identity. Both wings and one long tail had to remain visible without adding kart or control geometry.
- **Decision:** Approve rear, steer-left, steer-right, hit, victory, front, front-steer-left, front-steer-right, front-hit, and front-victory. The steering pairs show opposite commanded turns. Hit uses controlled recoil. Victory remains closed-mouth and uses a restrained draconic foreclaw salute.
- **Rejected defects:** Candidate preparation exposed a duplicate tail in chase steer-right, a roaring chase victory, and a human-like circular finger gesture in front victory. Corrected replacements were reviewed as part of the approved set. Future derivatives must keep exactly one tail, avoid feral victory expressions, and avoid recognizable human hand signs.
- **Normalization:** `tools/assets/prepare_dragon_queen_2d.py` preserves native alpha and removes edge-connected pale neutral checkerboards only from opaque review exports. It clears hidden RGB and uses premultiplied-alpha resizing. The outputs remain staged outside the AA-06 runtime path.
- **Evidence:** Two deterministic runs produced the same eleven hashes. The relative-path SHA-256 manifest is `6be70b53cb3f63a33e349c7ba2e66d4d413034d32f47ab549d96f23bcc74d7fd`. The staged set contains one 256 x 256 portrait and ten 512 x 512 driver frames as 8-bit, non-interlaced sRGBA PNGs with transparent corners. A dark-matte sheet shows no checkerboard blocks or pale outer halos.
- **Archive boundary:** Cleo's approved package still occupies `public/assets/characters/aa-06/`. No Cleo file was changed. The local integration gate must copy that package byte-for-byte to a dedicated archive and update `archivedCleo` before Dragon Queen enters the standard AA-06 paths.
- **Scope:** This approval covers Dragon Queen's complete 2D design package and staged runtime derivatives. It does not approve The Sovereign Wyrm geometry, AA-06 activation, publication, deployment, or live acceptance.
- **Next gate:** Prepare The Sovereign Wyrm's deterministic LOD0, LOD1, and LOD2 geometry candidate for Manny's review.
- **Approval:** Manny approved the complete ten-frame driver-state sheet on 2026-09-04.

## ADR-056: Approve The Sovereign Wyrm geometry Candidate 2

- **Date:** 2026-09-04
- **Status:** Approved for local runtime integration
- **Context:** Dragon Queen's identity, 2D package, kart direction, and AA-06 mapping were already approved. The kart still required deterministic runtime geometry with a literal-dragon cockpit, readable royal construction, three LODs, one modeled control, and the shared negative-Z orientation contract.
- **Rejected candidate:** Candidate 1 was withheld because its round nose read as a grille, its separate side scales read as dots, and the steering wheel dominated the cockpit.
- **Decision:** Approve Candidate 2. It uses a shield-shaped prow, joined gold chevrons, a smaller lower steering control, midnight-blue bodywork, structural gold rails, blue jewel lights, substantial tires, broad wing clearance, and an open tail channel.
- **Evidence:** LOD0 contains 12,164 triangles with SHA-256 `57b3f4b248ed96cd19b0c2b233aec4462fde73b102ad9acde8941550bf69e305`; LOD1 contains 7,268 with `31bdd684fb764fdb4d6e04726971e0bf3f34ee4f36aefbf652fcdf3b133053c3`; LOD2 contains 3,620 with `124ec43e1ada192d67a3d4fe6bb6c3ec1cdd3f9df6b6c22b1af05b25762197de`. Each GLB has four materials, thirteen required nodes, one `SteeringWheel`, and `extras.forward: "-Z"`. Repeated builds matched byte-for-byte.
- **Scope:** Geometry approval allows local AA-06 integration after Cleo's approved package is copied unchanged to a dedicated archive. It does not authorize publication, deployment, or live acceptance.
- **Next gate:** Preserve Cleo, integrate Dragon Queen locally, verify cockpit placement and runtime contracts, then request publication approval.
- **Approval:** Manny approved Candidate 2 on 2026-09-04.

## ADR-057: Integrate Dragon Queen and preserve Cleo locally

- **Date:** 2026-09-04
- **Status:** Locally integrated; publication pending
- **Context:** Dragon Queen's identity, rights, AA-06 mapping, portrait, ten driver states, and Sovereign Wyrm Candidate 2 were approved. Cleo's inactive AA-06 package had to be preserved before Dragon Queen could occupy the standard runtime paths.
- **Archive decision:** Copy Cleo's portrait, six driver frames, and three Gilded Stitch GLBs unchanged to `public/assets/archive/characters/cleo-aa-06/`. Point `archivedCleo` only to that package and pin all ten files to their approved SHA-256 values in the runtime verifier.
- **Runtime decision:** Activate Dragon Queen at AA-06 under `dragon-queen-runtime-20260904-1`. Use The Sovereign Wyrm, `NEGATIVE_Z_KART_VISUAL_YAW`, all ten approved driver frames, the Grip Specialist 6 / 6 / 5 / 7 / 5 / 7 profile, and `[0, 0.95, -0.12]` for chase-facing and camera-facing placement.
- **Cockpit evidence:** `tools/assets/render_dragon_queen_cockpit_review.py` uses the runtime model scale, ground offset, sprite size, and approved assets. The render keeps both wings above the bodywork, seats the lower body behind the cockpit edge, and places the kart's single modeled control between the foreclaws in front view. Two runs matched SHA-256 `7ee269aec57cd1cc95aaa17d66aedeaf2ffe20ccee460f56e7e91c82d6a8f917`.
- **Validation:** The full local gate passes strict typecheck, zero-warning lint, 18 Vitest files / 91 tests, 89.7% statement coverage, 33 materialized runtime GLBs, 94 decoded runtime PNGs, the branding guard, production build, and `git lfs fsck`. The existing large-chunk warning is unchanged.
- **Scope:** Local source, assets, tests, records, and commit only. This decision does not authorize pushing the branch, opening or merging a pull request, publishing, deploying, or recording live acceptance.
- **Next gate:** Request explicit publication approval, then complete deployed desktop and mobile checks for selection, orientation, all driver states, cockpit occlusion, wing and tail visibility, and the single modeled control.

## ADR-058: Correct Dragon Queen's camera-facing driver mounts

- **Date:** 2026-09-04
- **Status:** Front-camera correction approved for publication
- **Context:** Dragon Queen passed every reported live playtest item except rear-view hand-to-control alignment. The five camera-facing frames shared the chase-facing `[0, 0.95, -0.12]` mount. The first correction lowered all five to `[0, 0.84, -0.12]`, but Manny found steer-right slightly high and requested review of the complete front-camera set.
- **Decision:** Keep chase-facing states at `[0, 0.95, -0.12]`. Use `[0, 0.84, -0.12]` for front neutral, steer-left, hit, and victory. Use a state-specific `[0, 0.80, -0.12]` override for front-steer-right because its foreclaws sit higher within the approved raster. Keep the approved raster files, kart geometry, modeled-control position, sprite scale, depth, character mapping, statistics, and asset revision unchanged.
- **Evidence:** The complete five-state front-camera renderer produced identical review sheets across two runs at SHA-256 `1375abc4e30eaecadb1409030e0fea3e6ca3dd793ad8916227e24925a94006b2`. Two focused placement suites pass 36 tests, pin the base and state-specific mount values, and verify override precedence. Full local validation passes strict typecheck, zero-warning lint, 18 test files / 92 tests, 89.71% statement coverage, 33 materialized runtime GLBs, 94 decoded runtime PNGs, the brand guard, production build, and `git lfs fsck`.
- **Scope:** This approval authorizes publishing the correction branch. Pull-request merge, deployment, and acceptance closure remain separately governed.
- **Next gate:** Publish the correction branch, complete the pull-request and deployment workflow, and retest rear-view neutral, steering, hit, and victory states on the deployed release.
- **Approval:** Manny approved the complete front-camera placement sheet and authorized branch publication on 2026-09-04.

## ADR-059: Integrate and deploy Alex and The Neon Vector

- **Date:** 2026-09-05
- **Status:** Live accepted / closed
- **Context:** Manny approved Alex as the final Slice 3 racer for the formerly unassigned AA-01 profile. Her definitive reference, written character lock, warm clever competitor personality, The Neon Vector kart name and direction, Option A portrait, ten driver states, and Candidate 3 geometry were approved before integration.
- **Decision:** Assign Alex to AA-01 Feather Sprinter with Speed 6 / Acceleration 9 / Weight 2 / Handling 8 / Mini-Turbo 7 / Traction 4. Activate `alex-runtime-20260905-1` in `characterManifest` with The Neon Vector, `NEGATIVE_Z_KART_VISUAL_YAW`, chase-facing driver position `[0, 0.92, -0.12]`, camera-facing position `[0, 0.84, -0.12]`, and the single modeled steering wheel supplied by the kart.
- **Asset evidence:** Install the approved 256 x 256 portrait, ten 512 x 512 transparent character-only driver frames, and Candidate 3 LOD0/LOD1/LOD2 GLBs. The GLBs contain 10,396 / 6,444 / 3,420 triangles, four materials, thirteen required nodes, one `SteeringWheel`, and `extras.forward: "-Z"`. The approved rear cockpit-to-thruster conduits remain exposed.
- **Validation evidence:** `npm ci` installed 198 lockfile-pinned packages. `npm run validate` passed strict typecheck, zero-warning lint, 18 Vitest files / 93 tests, 89.71% statement coverage, branding, 36 materialized GLBs, 105 decoded PNGs, and the production build. `git lfs fsck` and deterministic LOD hash comparisons passed. Temporary LFS bridge run `33989497206` uploaded and fetch-verified only the three approved GLBs. PR CI run `33989589113` passed; PR #92 merged at `617312394decfcb95af4f8fee6431ee9d339201b`; and main CI / Pages run `33989653688` passed validation and deployment with artifact `9976234566` at digest `sha256:e2188b050b5047f5985401eac22b5973c035c843ffaff214361ddbea6296e131`. Extracted deployment bytes match all fourteen approved Alex runtime files. The existing large-chunk warning remains non-blocking.
- **Live acceptance:** Manny approved the complete deployed desktop/mobile matrix against checkpoint `daf1e3127478981e40cca9533300f8617f61004d` on 2026-09-05. Character Select, race startup, all five chase states, all five rear-view states, one-hand turn silhouettes, torso rotation, single-wheel ownership/alignment, seated occlusion, kart orientation, hood/steering geometry, exposed conduits, touch presentation, and existing-racer regressions passed.
- **Scope:** This decision closes Alex publication, deployment, and product-owner acceptance while assigning the final balance profile. It does not authorize Slice 5.
- **Next gate:** None for Alex. Hold after Slice 3 closure until Manny explicitly authorizes the next incomplete roadmap slice.
- **Approval:** Manny approved the Alex integration checkpoint on 2026-09-05 and explicitly authorized publication/deployment after the full local gate passed.

## ADR-060: Close Slice 3 after Alex live acceptance

- **Date:** 2026-09-05
- **Status:** Accepted / closed
- **Context:** Alex was the twelfth and final production racer and the last unfilled Slice 3 balance-profile assignment. All automated, publication, deployment, artifact-integrity, and product-owner gates in `docs/SLICE-3-EXIT-CHECKLIST.md` are complete.
- **Decision:** Mark **Slice 3 — Character Selection & Avatar Ingestion** `COMPLETE / LIVE ACCEPTED`. Preserve all twelve unique AA-01 through AA-12 mappings, the controlled character asset revisions, and Cleo's inactive archive package.
- **Evidence:** Manny's final `Approved` confirms the requested deployed desktop/mobile Alex matrix. PR #92, PR CI run `33989589113`, merge `617312394decfcb95af4f8fee6431ee9d339201b`, main CI / Pages run `33989653688`, artifact `9976234566`, deployment-evidence PR #93, and deployed acceptance checkpoint `daf1e3127478981e40cca9533300f8617f61004d` provide the traceable release chain.
- **Scope:** This closes Slice 3 only. Slice 4's already-completed out-of-order AI/grid work remains retained. Slice 5 Items, further balance changes, and unrelated presentation scope remain unauthorized.
- **Next gate:** Await Manny's explicit approval before beginning Slice 5 or another bounded project task.
- **Approval:** Manny approved the complete live result and Slice 3 closeout on 2026-09-05.


## ADR-061: Approve the Slice 5 item-system implementation contract

- **Date:** 2026-09-05
- **Status:** Approved; implementation authorized after the design checkpoint merges
- **Context:** Slice 3 is live accepted, the previously completed out-of-order Slice 4 checkpoint remains retained, and Slice 5 is the next incomplete PRD slice. The PRD already fixes fifteen items, one-slot inventory, distribution weights, core state machines, major item values, AI item use, and evidence requirements, but several operational details needed explicit product-owner resolution before implementation.
- **Decision:** Preserve the existing fifteen-item roster and rank probability matrix. Implement the approved architecture and exit checklist in `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md`. Use four rows of eight shared item boxes at approximately 9%, 34%, 62%, and 89% of lap progress; lock item selection at valid collection time; do not consume a box when inventory is occupied; add a dedicated mobile ITEM control with Brake/Reverse as the backward-use modifier; require Hyper-Drive Rocket to be position 6-8 and at least 45 m behind the leader; use the approved shared impact taxonomy; apply short owner immunity while spawned objects arm, then allow ordinary later self-interaction; and begin with configuration speed-cap targets of 1.18x Nitro Surge, 1.15x Nitro Overdrive pulse, 1.25x Hyper-Drive Rocket, and the existing 1.12x Prismatic Invincibility.
- **Architecture:** Keep item definitions/weights in configuration; separate selection, inventory/lifecycle, boxes, projectiles, hazards, generic racer effects, targeting, Rocket legal-path autopilot, AI item policy, and HUD integration. Do not turn `KartTimeTrial` or `KartController` into item-name switchboards.
- **Presentation:** Slice 5 uses original Manaconda's Minigame Mayhem item names and original procedural/simple gameplay-readable presentation. Final production audio/VFX/post-processing remains Slice 6.
- **Evidence:** Slice 5 cannot close on code presence. The approved gate requires at least 100,000 seeded selections per rank, probability-fit evidence, item/counter interaction tests, lifecycle/object-count soak, regression coverage, GitHub Pages deployment, desktop/mobile product-owner playtest, and explicit acceptance.
- **Product impact:** This amendment resolves implementation ambiguity without changing the approved item roster or probability matrix and without reopening the abandoned competitive-balance experiment.
- **Approval:** Manny approved the reconciled Slice 5 item-system design and exit checklist on 2026-09-05.


## ADR-062: Clarify Slice 5 item-box collection and respawn presentation

- **Date:** 2026-09-05
- **Status:** Approved for implementation
- **Context:** After authorizing Slice 5 implementation, Manny clarified the intended shared item-box presentation: a collected box should visibly pop, disappear from the field while unavailable, then fade back into existence when it refreshes.
- **Decision:** A successful collection makes the box non-collectible immediately, plays a brief pop/disappearance transition, hides the box for the inactive portion of the existing approximately 4.5-second respawn window, then fades it back while it is still non-collectible. The box becomes collectible only after the fade completes. The shared-world lockout and one-slot inventory rules are unchanged.
- **Initial engineering defaults:** Use approximately 0.12 seconds for the pop and 0.45 seconds for the fade-back. These are configuration values that may be refined without changing the approved pop -> absent -> fade back -> collectible sequence or the approximately 4.5-second total respawn target.
- **Scope:** Presentation/lifecycle clarification only. This does not change item probabilities, box ownership, row placement, inventory rules, roulette timing, or any item effect.
- **Approval:** Manny approved Slice 5 implementation and supplied this item-box behavior clarification on 2026-09-05.
