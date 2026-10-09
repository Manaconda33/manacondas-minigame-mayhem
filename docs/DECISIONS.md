## T9.5 second owner visual review — correction scope (2026-10-08)

The owner explicitly rejected the newly pinned `neon-grid-t9-5-portals` preview after mobile-portrait visual inspection. Screenshot evidence shows missing visible Billboard lead-up sponsor mounting, Service Tunnel warnings not aligned to/attached to actual portal mouths (one reverse-readable), and a black opaque wall still blocking the legitimate turn-in. The previously green `64492df` / CI `37818513159` is **not owner acceptance**. Correct placement and visual obstruction only; preserve approved existing sponsor/warning pixels, actual route/collisions/AI/physics/3-lap logic, deep-shortcut camouflage, T9.5 200 target/220 max and all other budgets. Specific bounded six-step plan/acceptance in `docs/design/neon-grid/t9-5-portal-and-signage-owner-correction-plan-2026-10-08.md`. Documenting the request is not implementing it or permission for material roadmap/gameplay changes. Publish separately pinned verified gameplay preview and STOP for fresh owner approval; PR #242 draft, no T9.6/T9.7 or gameplay production merge.

## T9.5 approved hologram binary and bounded runtime placement — 2026-10-08

The owner-approved transparent warning PNG was uploaded *exactly* via GitHub Git Blob API, resolving the previously claimed connector limitation. Master and runtime use identical Git blob 6d1275e9266dc5bd16a78de0a8d91aeead463369 and no image conversion. Two presentation-only, double-sided transparent warning planes reside just inside the physical Service Tunnel mouth and rejoin, with each outward-facing primary side toward its approach. Independent per-portal player-distance fade goes to zero at the traversable entrance/exit and restores distant visibility. Texture is owned by the existing scene, loaded with other approved track assets. Small runtime implementation decision within the prior owner-approved warning plan; all material requirements, Task 9 limits and release gates remain unchanged. Owner T9.5 playability and in-game visual signoff remain outstanding.

## T9.5 holographic Service Tunnel warning artwork — owner approved 2026-10-08

Manny approved the separately presented 1024 × 512 transparent-background "DO NOT ENTER" artwork with "RESTRICTED SERVICE ACCESS" subtext for both ends of the existing Service Tunnel. Approval is limited to the exact displayed artwork and its intended visual-only use. Install as a semi-transparent, non-colliding holographic plane at each legal portal; fade/soften locally during entry, preserve exit/entry visibility, unchanged forward and reverse path access and exterior camouflage. Asset approval is **not** a pass of runtime geometry, interior chase visibility, device performance, full T9.5 acceptance, PR #242 merge, T9.6/T9.7 or production release. Source approved in this conversation, SHA-256 11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4. Do not claim the approved file is in GitHub before bytes/asset verification succeed. CI correction run 37815817969 remains separate from this art acceptance.

## T9.5 owner-reviewed camouflage follow-up — 2026-10-08

Manny approves the overall exterior concealment but requests playability corrections before accepting T9.5: relocate Skyline static ads onto the sightline wall as both wall-faced and supported raised signs; remove the Service Tunnel mouth/interior visual blockers and guarantee forward/reverse camera/kart visibility. Preserve valid normal-road interior occlusion and original route access/physics/AI/checkpoints. A transparent non-colliding magenta/violet DO NOT ENTER hologram at both mouths is the proposed visual treatment, **subject to a separate one-asset-at-a-time 2D-art approval before runtime integration**. No art integration, new balance, approval to merge #242, T9.6/T9.7, or production publication is implied. Existing 200 target/220 full-course cap and the separate structural budgets remain fixed.

## T9.5 shared-mouth versus hidden-interior sightline acceptance — owner approved 2026-10-08

Manny expressly approved correcting the T9.5 Service Tunnel automated sightline check after exact real-camera telemetry established its former 2-of-3 blockers were rays passing through the shared **legal, drivable junction**. This is a diagnostic test-contract correction under the already approved PRD amendment 2.25, **not** permission to expose the interior, relax structural/performance budgets, alter tunnel geometry or hide the route entrance. Maintain the visible, readable magenta tell and bidirectional entrance aperture; exclude junction/main-road targets from *interior-occlusion scoring*. From several ordinary real ChaseCamera approaches including mobile landscape and portrait, evaluate genuinely interior tunnel-road targets; **fail on any in-frustum genuine interior target not occluded by the bounded screen**. Preserve independent lateral occlusion/screen continuity tests, entrance-mouth checks, all legacy CI gates and owner at-speed visual approval. If genuine deep tunnel roadway is exposed, fix the geometry rather than waive it. Source work remains in draft PR #242; publish only an immutable independently hash-verified new owner preview after exact-head CI passes. No T9.6/T9.7 or production gameplay deployment.

## T9.5 second camouflage correction and 220-call owner authority — 2026-10-08

Manny explicitly approved the six-step plan to conceal Billboard and Service Tunnel shortcut interiors using opaque, physically supported roadside facades, actual line-of-sight testing and a new hash-pinned preview. **Only the T9.5 full-course rendered CI blocking ceiling increases to 220 calls**, retaining a **200-call optimization target**; report excess above target. PRD hard limits 250 calls/750k triangles and Task 9 300k engineering triangle maximum remain fixed; separate Skyline/Undercity/Falls A/B budget limits, including the existing Falls +12, remain unchanged. No 2D art changes, physics, AI, items, checkpoint/shortcut authority changes, Task 8 frozen-area changes, PR #242 merge or production release. The earlier corrected T9.5 pin is REJECTED and the new one remains owner-review gated.

# Architecture and Product Decisions

## ADR-101: Bounded quality-dependent peripheral motion blur

- **Date:** 2026-10-01 (America/Chicago).
- **Status:** LIVE ACCEPTED / DEPLOYED. Scope, implementation/validation, pinned-preview visual acceptance, production publication and GitHub Pages deployment are complete.
- **Authority:** Manny's “Scope approved.” at main `b07c5b1ba054f0d4af999b72caf59ee13568ca01`; PRD 23.7 / 35.7. Full-screen High blur is optional; High uses a stronger capped peripheral variant.
- **Decision:** Preserve existing bloom/base rendering; add current-frame blur to left/right 20% bands between 20–80% height. Low/off/reduced-motion bypass textures. Medium/High use 3/5 samples and 0.22/0.32 blend caps; radius follows read-only smoothed normalized forward speed independently of opacity. Two band copies and one overlay avoid history/scene rerender. DOM HUD/touch and central road/player art remain outside the blur region; Manny's pinned-preview visual review passed.
- **Settings/lifecycle:** Persist graphics.motionBlur with v1 compatibility, apply next race. Rear/spinout/countdown/finish/recovery clear; pause/hidden freeze without drawing; startup warms shader/textures; resize/disposal release resources. testMotionBlur=0 is a read-only comparison bypass.
- **Performance:** Input bounded to 4096 per axis / 8,388,608 pixels. After 60 active valid warmup frames, 30-frame mean above 17.67ms or 12 consecutive slow frames disables blur for the race. Timing excludes inactive/invalid frames and lifecycle boundaries independently of diagnostics. This conservative guard does not certify hardware performance or attribute frame cost to blur.
- **Preservation/gates:** No gameplay, accepted bloom, camera transform, roster/art/audio/binary/lockfile/dependency/hosting/protection changes. All prior acceptance remains closed; context-loss recovery stays waived. Evidence: docs/evidence/2026-10-01-motion-blur/. Preview-only publication completed through PR #232 and post-merge CI/Pages run `36921241484`; Manny then approved the motion-blur visual and explicitly authorized PR #231 merge/publication to main. Production deployment verification passed in CI/Pages run `36926139532`. No broader Slice 6 closure or next-slice authority.

### ADR-101 owner acceptance / production authorization — 2026-10-01

Manny reviewed the published pinned motion-blur gameplay preview and approved it for merge/publication to main. Preview infrastructure PR #232 merged at `e933e35717cade97062a9d7e18ffba40a0ec0287`; post-merge CI/Pages run `36921241484` passed validation, the pinned motion-blur build, artifact assembly and Pages deployment. The accepted runtime remains the exact reviewed PR #231 runtime; reconciliation with main may change only governance/workflow continuity outside the reviewed runtime files. Production release is now complete: PR #231 squash-merged at `981d75f83b592bbb5801be6b7a282144b1ab4e20`; post-merge CI/Pages run `36926139532` passed validation, production build, all pinned preview builds, artifact assembly and deploy. The execution environment could not independently resolve the public Pages host, so no public byte/hash refetch is claimed.

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

## ADR-063: Standardize deterministic player-only item acceptance mode

- **Date:** 2026-09-06
- **Status:** Approved for Slice 5 acceptance testing
- **Context:** The first deployed Nitro Surge acceptance gate exposed a practical testing problem: relying on the live position/gap item lottery makes a targeted manual item test unnecessarily slow and inconsistent. The same problem would recur for every later Slice 5 item. Manny also required an in-world Nitro activation tell rather than HUD text alone.
- **Decision:** Add a reusable `testItem=<item-id>` URL acceptance mode that accepts only the fifteen governed item IDs and forces only the player's successful item-box pickup to the requested item. AI pickups remain governed by the normal selector. Missing or invalid values leave production selection unchanged. Surface a visible TEST MODE badge whenever the override is active so forced acceptance sessions cannot be confused with normal balance behavior.
- **Nitro presentation:** Nitro Surge uses an original lightweight procedural rear exhaust/energy tell tied directly to the active `nitro-surge` RacerEffects state. Its visual lifetime therefore matches pause-safe effect lifetime and cleanup rather than running on an independent timer. This is Slice 5 gameplay readability; final production VFX polish remains Slice 6.
- **Testing rule:** Future targeted live item checkpoints should provide a corresponding `?testItem=<governed-id>` link instead of requiring Manny to roll the item randomly. Each checkpoint must still verify the normal URL once to ensure the production selector is not forced.
- **Scope:** Acceptance instrumentation and Nitro readability only. This does not alter the item probability matrix, player inventory rules, AI distribution, normal-game prerequisites, item balance, or authorization for another item effect.
- **Approval:** Manny approved the deterministic item-test approach and Nitro visual tell before the Nitro Surge live acceptance pass on 2026-09-06.

## ADR-064: Tune Nitro Surge after deterministic live acceptance

- **Date:** 2026-09-06
- **Status:** Live accepted / closed
- **Context:** After PR #101 deployed the deterministic item-test harness and Nitro Surge VFX, Manny ran the forced Nitro acceptance matrix. Checks 1-5 and 7-12 passed. Acceleration was measurably stronger but did not feel sufficiently significant, while the approximately 1.2-second active window felt too short; Manny requested roughly double the effect length.
- **Decision:** Change Nitro Surge duration from approximately 1.2 seconds to approximately **2.4 seconds** and acceleration authority from **1.35x** to **1.50x**. Preserve the **1.18x** normal speed cap, off-road speed-penalty bypass, Traction-governed off-road acceleration, one-charge consumption, immediate inventory release, pause-safe timing, VFX lifetime coupling, and clean restoration.
- **PRD impact:** This is an explicitly approved gameplay-balance change and is recorded as PRD amendment 2.3. It supersedes the earlier Nitro duration/acceleration values without changing any other item or Slice 5 requirement.
- **Acceptance:** PR #102 merged at `6c1099ea7cda655e3776a371dccbfa34e9e2de5b`; main CI / Pages run `34029597094` passed and deployed artifact `9988166295` (`sha256:bae1a207a8c5c337be391d1a485bed4271ab7c9702d383993e9a4a864aa8b508`). Manny reran the four focused deployed checks and reported all pass: 1.50x acceleration feel, approximately 2.4-second duration, synchronized VFX/HUD expiry, and normal-URL selector isolation. Nitro Surge is live accepted.
- **Approval:** Manny approved the 2.4-second / 1.50x tuning on 2026-09-06.

## ADR-065: Use shared guardrails and stable camera heading for Kinetic Disc spinouts

- **Date:** 2026-09-06
- **Status:** Live accepted / closed
- **Context:** Manny approved Kinetic Disc as the next Slice 5 item and explicitly expanded the checkpoint to include projectile ricochets, continuous track guardrails that both projectiles and racers can hit, and a visible kart spinout whose 2D hit asset remains correct as the kart rotates in either chase or rear view.
- **Decision:** Preserve the PRD's existing Kinetic Disc values (approximately 28 m/s, 0.32 m radius, nine-second lifetime, three wall ricochets, 0.85-second standard spinout, hit destruction). Add continuous Circuit Alpha guardrails outside the legal racing corridor and use one shared geometric contact boundary for projectile reflection and racer response. Initial reversible guardrail engineering values are 9.25 m from centerline, 1.15 m kart contact radius, 0.82 tangential retention, and 0.22 normal restitution.
- **Spinout presentation:** Kinetic impact applies one full yaw turn during the 0.85-second standard spinout. The player's camera holds the pre-impact travel heading during the spin while the kart's real heading continues to rotate. Existing `hit` / `frontHit` selection remains based on actual kart orientation relative to the camera each frame, so chase and rear views remain perspective-correct without new raster assets.
- **Guardrail racer contact:** Rail impact uses bounded reflection/speed loss and a brief existing hit reaction. A 0.24-second contact cooldown prevents multiplying tangential speed loss every physics frame while positional correction and inward reflection remain active. It does not itself trigger the Kinetic standard spinout.
- **Lifecycle:** The projectile runtime enforces the existing 40-object PRD ceiling and rejects capacity/invalid-launch failures without consuming inventory. Repeated spinout hits refresh duration and direction without stacking yaw rates, retain the original camera anchor, and preserve hit-art priority until spinout expiry, including finish-line crossings.
- **Architecture:** Projectile runtime remains item-domain owned; guardrail geometry/contact math remains track-domain owned; forced spin and static-barrier response remain generic controller/effect capabilities. `KartTimeTrial` only orchestrates these systems.
- **PRD impact:** Recorded as approved implementation amendment 2.4. No item probability, inventory, AI item-policy, lap/checkpoint, or Slice 6 requirement changes.
- **Approval:** Manny explicitly approved this expanded Kinetic Disc checkpoint on 2026-09-06.

## ADR-066: Raise Kinetic Disc speed after live catch-up testing

- **Date:** 2026-09-06
- **Status:** Live accepted / closed
- **Context:** PR #104 deployed at `655e68e554d9d6f4567e5136bdeb3b4e57a6f570`, with validation and Pages run `34033720883` successful. Manny passed all checks except insufficient catch-up speed and unexpected ricochet paths. At 30.8 m/s including inherited velocity, the old disc barely closes on Manaconda (29.67 m/s) and cannot catch Krios (33 m/s). The controlled trajectory review is preserved in `docs/KINETIC-DISC-LIVE-REVIEW-2026-09-06.md`.
- **Decision:** Raise base speed from 28 to **42 m/s**, retaining the bounded inherited contribution (up to 2.8 m/s) and the existing angle-based reflection rule. A curved track may produce successive same-side contacts. Do not force alternating rails or alter the reflected angle to guarantee a crossing.
- **Preserved contract:** Radius, lifetime, bounce limit, owner arming/self-hit, charge/slot behavior, 40-object ceiling, spinout duration, drive-input suppression, camera anchor, approved hit/frontHit art, racer guardrail response, roster statistics, Nitro, probabilities, and all later-item gates remain unchanged.
- **Evidence required:** Moving-target catch-up tests from a 30 m gap against actual Manaconda/Krios normal maximums and the maximum AI speed allowance, plus curved shallow-angle reflection/speed-retention regressions and the full repository gate. Focused live retest follows a separately approved corrective PR merge/deployment.
- **PRD impact:** Approved amendment 2.5 supersedes the earlier Kinetic speed only.
- **Approval:** Manny explicitly replied `Approved` to 42 m/s base speed with the existing angle-based ricochet rule on 2026-09-06.
- **Final acceptance:** PR #105 merged at `1497672c639adaf6ca71f2aa775d4e0c23572b33`; CI/Pages run `34034999554` passed. Manny's [PR #105 comment](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/105#issuecomment-5559436832) accepts 42 m/s, angle-based ricochets, spinout, chase/rear perspective, and normal item selection. This also closes the ADR-065 Kinetic/guardrail/spinout live gate. Issue #106 remains a separate non-blocking future-development defect.

## ADR-067: Implement approved Seeker targeting and bounded pursuit

- **Date:** 2026-09-06
- **Status:** Live accepted / closed
- **Approval:** Manny approved PR #107 merge and the complete Seeker scope before implementation.
- **Decision:** Implement the fill-ins in `docs/SLICE-5-SEEKER-DRONE-SCOPE.md` and PRD amendment 2.6: nearest-ahead progress targeting, fixed target, forward launch, 42-56 m/s dynamic speed with 20 m/s² limit, 120 degrees/s turning, 0.5 s arming, 12 s lifetime, rail destruction, 0.85 s spinout, and escalating warning cues. Use the existing shared cap and effect/camera boundaries.
- **Scope:** Seeker plus reusable targeting and opt-in incoming acceptance fixture only. Issue #106, other item effects, general AI tactics, and Slice 6 remain deferred.

- **Publication:** Manny approved PR #108 merge/deployment; merge `ef5dbaeccde123faedd00f625cf18e32c07875de` and CI/Pages run `34086473571` passed. Manny passed all six live checks and accepted continuation on 2026-09-07 after reviewing the lap-2 investigation. Seeker is live accepted. Diagnostic PR #109 is closed unmerged; the specific shot's cause remains unconfirmed. See `docs/SEEKER-LAP-GATE-REVIEW-2026-09-07.md`.

## ADR-068: Implement approved Apex core and launch-owned global availability

- **Date:** 2026-09-07
- **Status:** Live accepted / closed for Apex core; real Shockwave/Prismatic interaction gates deferred
- **Approval:** Manny approved PR #110 merge and its complete Apex scope. PR #110 merged at `1b3391cfd9731291980552fa6ad3c0d9e635ff6b`.
- **Decision:** Implement all fill-ins in `docs/SLICE-5-APEX-MISSILE-SCOPE.md`, recorded in PRD amendment 2.7. Use separate item-domain Apex lifecycle, validated leader targeting, shared capacity reservation, atomic charge/launch commit, launch-time cooldown, original procedural presentation, warning audio, and generic area/counter boundaries.
- **Boundary:** Counter-boundary automation does not complete real Shockwave/Prismatic interaction acceptance. Those playable items, general AI tactics, issue #106 and Slice 6 remain deferred. Preserve live-accepted Seeker/Kinetic/Nitro and race authority.
- **Publication / live acceptance:** PR #111 squash-merged at `5f37923d2ea64c9e4e95baafb1eee356f5cf114b`; post-merge CI/Pages run `34128841767` passed validation and deployment. Manny passed all focused outgoing Apex checks, all focused incoming Apex checks, and the normal governed-selection regression on 2026-09-07. Apex core is live accepted; real Shockwave/Prismatic interaction acceptance remains a separate later gate.

## ADR-069: Establish shared HazardSystem capacity and approved Timed Blast Orb behavior

- **Date:** 2026-09-07
- **Status:** Live accepted / closed for Timed Blast Orb and reusable HazardSystem foundation; playable Shockwave/Prismatic interaction acceptance deferred
- **Context:** After Apex core live acceptance and completion of the seeded distribution gate, Slice 5 still lacks the approved hazard runtime. The PRD already requires Timed Blast Orb and Slick to be owned by `HazardSystem`, while Shockwave must later clear supported hazards. Implementing Blast Orb first establishes that reusable boundary without prematurely implementing Shockwave or duplicating hazard architecture.
- **Decision:** Implement `HazardSystem` as the owner of Blast Orb lifecycle and use one shared maximum of 40 active/reserved projectile + hazard objects. Blast Orb uses the approved 3.0 s fuse, 4.0 m AoE, 1.20 s heavy spin, 0.35 s owner immunity, 8 m/s early-impact threshold, forward 14 m/s toss with 0.35x inherited planar velocity capped at 12 m/s, backward drop with 0.20x inherited planar velocity capped at 12 m/s, and 6 m/s² planar drag. Guardrails contain rather than detonate the orb. Generic immunity and a pre-detonation hazard-clear query are reused; synthetic Shockwave tests use the approved 5 m pulse radius.
- **Ordering:** Queued hazard-clear/counter queries resolve before Blast Orb movement/contact/fuse detonation for the simulation step so a successfully cleared orb cannot detonate later in that same step.
- **Capacity:** Kinetic, Seeker, Apex reservations, and hazards share the 40-object budget. Full-capacity activation rejects without consuming inventory. This replaces projectile-only counting as the Slice 5 item-physics capacity contract; it does not change any accepted projectile behavior.
- **Deferred:** Playable Shockwave and real cross-item counter acceptance; Slick; AI avoidance for Blast/Slick; general AI item tactics; Prismatic; issue #106; Slice 6.
- **Evidence gate:** Clean validation must cover directional deployment, threshold boundaries, fuse/pause, area immunity, shared capacity, same-step counter ordering, restart/disposal cleanup, fixture isolation, and all accepted Nitro/Kinetic/Seeker/Apex regressions. Desktop/mobile deployed acceptance remains separate.
- **Approval:** Manny approved the complete `docs/SLICE-5-BLAST-ORB-SCOPE.md` proposal on 2026-09-07. PRD amendment 2.8 governs the approved product fill-ins.

- **Implementation evidence:** PR #115 merged at `c2ca9887562b8dd0f8f943f28c1016e234103969`; CI/Pages `34144668993` passed. The gameplay uses shared `ItemPhysicsCapacity`, hazard-owned lifecycle/rendering and existing generic area/spinout boundaries. Local full validation passes 33 files / 233 tests; hosted clean-install CI is recorded in the gameplay PR before publication review.

- **Live acceptance:** PR #117 squash-merged at `9efbceaf06db3ba6c32ec0147b85ad0673c2d1da`; post-merge CI/Pages run `34148220153` passed. Manny completed the deployed Blast Orb playtests and reported all checks pass on 2026-09-07. PR #118 then merged the durable acceptance record at `a2bd4e3a873bcd6a2b67789ebc06ac2c3ccfec76`; post-merge run `34149673641` passed validation and Pages deployment.

## ADR-070: Approve bounded Slick Trap hazard behavior

- **Date:** 2026-09-07
- **Status:** Live accepted / closed for Slick Trap core; AI hazard response and playable counter interactions deferred
- **Context:** Timed Blast Orb and the reusable `HazardSystem` foundation are live accepted. Slick Trap is the next bounded Slice 5 item and already has governed rear-drop, lifetime, trigger, spin/speed, owner-cap, and future Shockwave-clear requirements; remaining operational fill-ins required product-owner approval before implementation.
- **Decision:** Implement the complete approved behavior in `docs/SLICE-5-SLICK-TRAP-SCOPE.md` and PRD amendment 2.9: rear-only stationary 1.75 m drop; shared 40-object capacity; 0.35 s owner immunity; <=1.1 m unfinished/non-immune trigger; one-shot removal; 60% planar speed retention; one 360-degree yaw over 0.85 s with control suppression and accepted camera/driver-state presentation; two active per owner with successful-third FIFO replacement; 12 race-second pause-safe lifetime; generic immunity leaves the Slick in place; generic queued hazard clear resolves before triggers; and deterministic `?testSlickAhead=1` acceptance instrumentation.
- **Counter boundary:** Synthetic 5 m Shockwave clearing proves the reusable hazard interface only. Playable Shockwave, real Prismatic/Hyper-Drive interactions, and cross-item counter acceptance remain deferred.
- **AI boundary:** Do not implement AI hazard avoidance in this item increment. Once Slick is live accepted, Blast Orb + Slick avoidance should be implemented together in a separately approved shared AI hazard-response increment.
- **Preserved scope:** No probability, accepted-item tuning, racer stats, track/checkpoint geometry, character assets, issue #106 handling, or Slice 6 requirement changes.
- **Evidence gate:** Automated and deployed checks in `docs/TESTING.md` and `docs/SLICE-5-SLICK-TRAP-SCOPE.md` must pass before publication/live acceptance claims.
- **Approval:** Manny explicitly approved the complete Slick Trap scope as written on 2026-09-07 and directed the ADR-069 live-acceptance status correction in this governance checkpoint.
- **Publication / live acceptance:** PR #120 reviewed head `d6f7f752eaa06f38954ed6fa3adab8a617b3d1b9` passed hosted PR CI run `34153344029`. Manny approved publication; PR #120 squash-merged at `bcc5bcc500b08ea42984eed8afa188fa87ba1cf9`, and post-merge CI/Pages run `34153760001` passed. Manny completed the deployed Slick Trap acceptance matrix and reported all playtests passed on 2026-09-07; product-owner evidence is PR #120 comment `5574748827`.

- **Implementation checkpoint:** PR #119 governance merge `2ce2212e5d89e192b9118ec07c655bacefbdf45a` and CI/Pages `34151395918` passed. Manny authorized gameplay implementation. The gameplay feature branch extends HazardSystem and the generic hostile-spin boundary with the approved Slick behavior; surface placement derives from existing track meshes. See `docs/TESTING.md` and the gameplay PR for validation. No live acceptance is claimed.

## ADR-071: Use bounded lane-intent AI avoidance for accepted Slick and Blast hazards

- **Status:** Live accepted / closed for bounded Slick + Blast hazard response; full AI item policy and static-obstacle expansion remain deferred.
- **Context:** Timed Blast Orb and Slick Trap are both live accepted, satisfying the deliberate dependency recorded in their scopes. PRD Section 21.5 already requires AI to detect slicks and Blast Orbs, deviate from the ideal spline, and return gradually. Existing `AiDriver` already owns bounded five-lane racer avoidance.
- **Decision:** Extend `AiDriver` with typed read-only hazard awareness for Slick Trap and Timed Blast Orb only. Use wrapped route-relative detection up to 20 m ahead; the existing five bounded lane candidates; 2.5 m Slick and 4.5 m Blast planning footprints; 0.5 s drag-aware Blast prediction capped by fuse; hazard-first lane clearance with existing racer pressure retained where possible; greatest-minimum-clearance fallback when boxed in; and a 0.6 race-second clear hold before preferred-lane recovery.
- **Guardrails:** Lane intent only. No teleport/snapping, hidden speed or braking rule, rubber-band change, hazard-physics change, item probability change, racer-stat change, lap/checkpoint mutation, AI item acquisition/use, or Slice 6 work. Pause freezes avoidance timers; restart/disposal clears temporary state.
- **Testing rule:** Automated tests must cover route wrap/distance filtering, planning-footprint boundaries, moving-Blast prediction, multi-hazard fallback, racer/hazard coexistence, gradual recovery, pause/cleanup, fixture isolation, and accepted-item/AI regressions. Deployed review uses `?testAiHazardAvoidance=slick` and `?testAiHazardAvoidance=blast` plus a normal unforced URL.
- **Implementation:** PR #122 merged at `a782ee0996e032ffae06cb41dddafc7e62eed08c`; post-merge CI/Pages run `34157568033` passed. Manny explicitly authorized the bounded gameplay implementation. The implementation reuses lane scoring and steering, with detached read-only hazard snapshots and no controller or race-progress mutation.
- **Publication / live acceptance:** Gameplay PR #123 reviewed head `2ebba5ee39b636251a20abc5bcf5230d8e063da2` passed hosted PR CI run `34173735120`. Manny approved publication; PR #123 squash-merged at `b6e92fc79dad27764df9fe6248b4a496503fec00`, and post-merge CI/Pages run `34174464098` passed. Manny completed the deployed eight-check AI hazard-response matrix and reported the playtest passed on 2026-09-07; product-owner evidence is PR #123 comment `5577444120`.
- **Approval:** Manny approved the complete bounded AI hazard-response scope as written on 2026-09-07 and directed the same governance checkpoint to correct README's stale Slick/count status.

## ADR-072: Implement Acoustic Shockwave as an instantaneous ordered counter pulse

- **Status:** Gameplay merged/deployed; bounded correction and live acceptance pending.
- **Date:** 2026-09-07.
- **Context:** Slice 5 already exposes accepted counter boundaries for terminal Apex, Blast Orb, and Slick Trap. Shockwave is the highest-leverage next item because it closes those real interactions and establishes the ordinary-projectile counter contract before Blaze/Frost/Arc projectiles are added.
- **Decision:** Use one instantaneous 5 m pulse centered on the user. Forward/backward ITEM direction is equivalent. Eligible unfinished non-owner/non-immune racers receive an outward planar velocity delta falling linearly from 6 m/s at the center to 2 m/s at 5 m, with no conventional spinout or transform snap. Kinetic Disc and Seeker Drone projectiles within 5 m are destroyed; Slick/Blast use the existing queued hazard clear; only terminal/dive Apex is counterable within the existing 5 m 3D boundary. Counter resolution precedes affected object movement/contact/fuse/blast in the same simulation step. Shockwave consumes one charge on a committed pulse, uses no persistent shared-capacity slot, and does not enable AI item tactics.
- **Consequences:** Existing accepted item state machines remain authoritative except for their approved removal by a successful Shockwave pulse. Later ordinary projectile items can integrate against one established counter boundary. Final production audio/VFX remains Slice 6.
- **Approval:** Manny approved the recommended Shockwave scope and the 6-to-2 m/s push falloff on 2026-09-07.
- **Gate:** `docs/SLICE-5-SHOCKWAVE-SCOPE.md`, PRD amendment 2.11, `docs/TESTING.md`, and `docs/IMPLEMENTATION-STATUS.md` form the governance checkpoint. Gameplay may begin only after this checkpoint merges and post-merge CI/Pages passes; gameplay publication and live acceptance remain separate approvals.
- **Publication review:** PR #126 squash-merged at `3f0c9e9d0d89961936beaec3294bfeef2a6c78fe`; post-merge CI/Pages run `34178644577` passed. Independent review then found that non-Apex clears used 3D rather than horizontal distance and that live target snapshots omitted generic immunity. The bounded correction uses horizontal X/Z distance for ordinary projectiles and hazards, preserves Apex's 3D terminal counter, and wires a neutral-by-default shared immunity source without enabling Prismatic or AI item tactics.

## ADR-073: Implement timed Prismatic immunity and hostile contact

- **Date:** 2026-09-09.
- **Status:** Live accepted for the bounded Prismatic increment; remaining Slice 5 interactions remain open.
- **Context:** Shockwave is live accepted through PR #131. Prismatic is the next bounded increment exercising the existing shared immunity boundaries. Manny clarified Slick immunity and explicitly added dirt/grass slowdown immunity, then approved the revised scope and visual direction.
- **Decision:** PRD amendment 2.12 and `docs/SLICE-5-PRISMATIC-INVINCIBILITY-SCOPE.md` are normative. Use one committed charge, exactly six race seconds, a 1.12x road-based cap, normal acceleration, and no dirt/grass speed-cap/deceleration/acceleration penalty. Preserve terrain geometry and steering/traction. Refresh without stacking; maintain independent boost timers with maximum-only composition.
- **Interactions:** Absorb valid armed Kinetic/Seeker contacts; leave Slick intact without triggering/spinning/slowing protected racers; preserve normal Blast/Apex resolution with per-victim immunity; block Shockwave push. Preserve ordinary physical kart/rail contact. Apply a 0.85-second one-turn hostile spin once per contact encounter below 2.35 m, rearming only after separation to at least 2.35 m. Finished/immune rivals are excluded. Activation does not cleanse existing spin or restore momentum.
- **Presentation:** Following translucent faceted shell, smoothly flowing cyan/violet/pink/gold highlights, short fading particle trail, blocked-hit shimmer, separate countdown, musical layer, and final-second fade. Keep gameplay visible; no rapid strobe. Honor master volume, audio availability, pause, and cleanup.
- **Engineering contract:** Timed immunity ownership and boost composition must preserve other active sources and rollback. Drive, racer contact, and item impacts must agree on active/expired state. Fixed-item protected/expired fixtures must validate the actual encounter and distinguish misses/interceptions from immunity success.
- **Boundary:** No other item implementation, probabilities, racer stats, accepted balance, race authority, dependencies, AI acquisition/use, or Slice 6 expansion. Future-item interaction acceptance remains deferred.
- **Approval:** Manny approved the revised scope and visual description in Work. Governance publication, gameplay publication, and final live acceptance remain separately gated.

- **Local implementation evidence:** PR #132 governance merge `16e8248498a8dea2086db832e5b7db386d4bd485` passed post-merge validation/Pages `34354999380`. See `docs/IMPLEMENTATION-STATUS.md` for gameplay validation, coverage interpretation, fixture corrections, and remaining live checks. No gameplay publication or live acceptance is claimed.

- **Subsequent publication and acceptance:** Gameplay PR #133 merged at `3d79a7cb5291c53444cf3ae53f261b4a60ea9f0a`; hosted PR CI `34387276561` and post-merge validation/Pages `34387476666` passed. Manny explicitly approved and accepted the deployed checkpoint in Work. This supersedes the preceding local-only status. No device-specific results were supplied.

## ADR-074: Approve bounded Blaze Orbs increment

- **Status:** Live accepted for the bounded Blaze increment; remaining Slice 5 gates stay open.
- **Context:** Prismatic is live accepted. Blaze introduces rapid-fire multi-charge gameplay against the accepted projectile, spinout, Shockwave, and immunity boundaries.
- **Decision:** PRD amendment 2.13 and `docs/SLICE-5-BLAZE-ORBS-SCOPE.md` are normative. Preserve five charges, minimum 0.55-second cadence, and the approved 0.55-second short spin. Use 42 m/s straight planar travel, 0.28 m radius, three-second lifetime, no velocity inheritance, forward/backward aim, no wall bounce, and 0.18-second owner arming.
- **Boundary:** No other item tuning, probabilities, racer stats, race authority, dependencies, AI item tactics, or Slice 6 work. Manny approved the complete operational scope and presentation. Governance must merge and pass post-merge validation/Pages before gameplay begins; gameplay publication and live acceptance remain separate gates.

- **Subsequent acceptance:** PR #135 merged at `a034d40e3185a17f3d5a04cbe330656fe7961b46`; the governing scope at `6ffef50800eea8b1f3f952c3d227020aebfe8913` records Manny's “Pass” and PR comment `5608640298`. Follow-on validation/Pages `34404232942` passed. The historical publication gates above are satisfied for Blaze.

## ADR-075: Approve bounded Frost momentum and handling impairment

- **Status:** LIVE ACCEPTED. PR #137 deployed at `b69648b429c78161593403ce0074b9df0567603e`, validation/Pages `34475955547` passed, and Manny's final acceptance is recorded in PR comment `5625755529`. The scope records acceptance at `f44176ceef38dfeebee10f6d44a0c41fdb869629`; follow-on validation/Pages `34533224332` passed.
- **Context:** Blaze is live accepted. Frost is the next bounded ordinary-projectile item and introduces a non-spin effect. Amendment 2.14 and section 15.8 preserve three charges, approximately 55% momentum retention per valid hit, approximately 20% handling impairment per active stack for 1.2 seconds, and no full freeze/spin. Manny approved repeat-hit stacking with each subsequent hit resetting the shared handling-penalty timer.
- **Decision:** `docs/SLICE-5-FROST-ORBS-SCOPE.md` is normative. Each valid hit applies one 0.55 current-planar-velocity multiplier and one 0.80 steering multiplier; every subsequent valid hit adds another stack, applies the same multipliers again, and resets the shared 1.2-second timer. All active stacks expire together. Use the approved 42 m/s flight, 0.28 m radius, three-second lifetime, zero bounces, no inheritance, 0.18-second owner immunity and 0.55-second cadence. Normal acceleration remains available; no new freeze, spin, speed cap, acceleration penalty, or momentum restoration on expiry.
- **Boundary:** Independent effect ownership, unchanged drift inputs/charge and race authority, typed non-spin resolution, Prismatic absorption, Shockwave ordering, actual velocity/steering verification, and deterministic moving fixtures are required. No other item tuning, AI item tactics, dependency or Slice 6 expansion is authorized.
- **Approval:** Manny said “Sure, let's try it like that” after reviewing the cumulative stack and timer-reset interpretation. Governance publication, gameplay publication, and live acceptance remain separate gates.

## ADR-076: Approve bounded Rebounding Arc Blade flight and return

- **Status:** LIVE ACCEPTED. Governance PR #138 and gameplay PR #139 are merged/deployed; post-merge gameplay validation/Pages `35118484183` passed. Manny reported all deployed Arc Blade live tests passed on September 16, 2026; PR #139 comment `5700594653` records the product-owner evidence.
- **Context:** Frost is live accepted. PRD section 15.9 specifies three forward curved throws that return to the owner, with one rival hit per outbound/return leg. Numerical flight/cadence values, wall termination and owner return contact need resolution before implementation. Manny requested continued Slice 5 work and prefers unrestricted racing for item tests.
- **Decision:** Amendment 2.15 and `docs/SLICE-5-ARC-BLADE-SCOPE.md` specify the approved 0.55-second cadence, 42 m/s outbound curve, 30 m forward range/2 m bow, 56 m/s direct return, 0.32 m radius, 0.18-second owner arming, four-second total lifetime, first-wall destruction, and the accepted 0.85-second spin. Rival hits continue flight, with separate per-leg hit sets and separation required across a turnaround overlap.
- **Approved exception:** Return owner contact safely catches/removes the blade without refund; this is an Arc-only exception to amendment 2.2's returning-projectile self-hit rule. Armed outbound owner contact stays eligible. Owner recovery/finish/removal cancels owned blades.
- **Boundary:** Preserve shared capacity, atomic inventory use, generic immunity, Shockwave ordering, accepted spin/camera behavior, other item tuning and racer/race authority. No probabilities, AI item acquisition/use, dependencies, assets, or Slice 6 work. Primary fixed-item tests allow normal driving and unrestricted ITEM input.
- **Implementation:** Arc-specific flight state remains within ProjectileSystem's existing capacity/effect boundary. Distance lookup integrates the approved curve; swept subsegments split at arming, turnaround and expiry. Separate hit sets plus turnaround-overlap tracking prevent repeated damage. The shared runtime retains standard spin/camera authority. Procedural visuals and explicitly gesture-unlocked audio clean up on pause/disposal; moving diagnostics never block ITEM. No approved values or other item mechanics changed.
- **Gate:** Closed. Hosted PR CI `35118244169`, merge `8822341b61900799e0166cfe94bf69cb3986bf0e`, post-merge validation/Pages `35118484183`, and Manny's all-tests-pass live acceptance complete the Arc Blade increment. No device/browser versions beyond that explicit report are inferred.
## ADR-077: Bound Kinetic Arc Hammers to one physical terrain rebound

- **Date:** 2026-09-16
- **Status:** Historical governance publication checkpoint through PR #142 at `ba7e20ab69666ce04ba253a147c93b1ae985db8f`; post-merge validation and GitHub Pages `35124948452` passed. The implementation gate is superseded by ADR-078.
- **Approval at publication:** Manny approved the complete `docs/SLICE-5-ARC-HAMMERS-SCOPE.md` contract. The separate implementation authorization is recorded in ADR-078.
- **Context:** PRD Section 15.10 fixes five charges, a 0.35-second minimum cadence, ballistic trajectories, exactly one terrain bounce and short post-bounce expiry, while leaving launch physics, bounce coefficients, collision ordering, exact lifetimes, counters and lifecycle behavior unspecified. The existing runtime has reusable inventory, capacity, RacerEffects, immunity and Shockwave boundaries but no ballistic terrain-bounce projectile path.
- **Decision:** Amendment 2.16 and the approved scope define forward/backward use; 36 m/s horizontal launch, 11 m/s upward velocity, 24 m/s^2 gravity, 0.20x capped planar inheritance, 0.36 m radius, 0.18-second owner arming; one actual supporting-surface rebound with 0.78 tangential retention and 0.55 normal restitution; 0.75-second post-bounce and 2.25-second hard lifetime; first-wall destruction; standard 0.85-second hit spin and destruction; later owner self-hit; Prismatic/generic immunity absorption; Shockwave pre-movement clearing; guardrail > racer > terrain same-time ordering; and existing shared-capacity/pause/cleanup authority.
- **Architecture:** Any later authorized implementation keeps Hammer ballistic state inside the existing ProjectileSystem/item ownership boundary and samples the actual supporting race surface. It may add only the focused surface-query support necessary for the governed bounce; it does not move item logic into kart physics or redesign Circuit Alpha.
- **Rationale:** The approved numbers create a visibly lobbed projectile that remains useful at kart-racing speeds while the short post-bounce interval prevents five charges from becoming persistent track clutter. Wall destruction keeps the Hammer mechanically distinct from Ricochet Kinetic Disc.
- **Consequences:** The authorized implementation requires bounded 3D ballistic/surface-contact tests, but no new gameplay subsystem, capacity pool, track rewrite, dependency, binary asset, or AI item policy.

## ADR-078: Authorize bounded Kinetic Arc Hammers implementation and original presentation

- **Date:** 2026-09-16.
- **Status:** **LIVE ACCEPTED.** Gameplay merged/deployed through PR #144 at `a129bbac75f919dc7136ac50dfd63564fe5cd52e`; hosted PR CI `35137395927` and post-merge validation/Pages `35137681000` passed. Manny reported all deployed Arc Hammers tests passed on 2026-09-16; PR #144 comment `5703186707` records the product-owner evidence.
- **Approval:** Manny explicitly authorized Arc Hammers gameplay and all Arc Hammers asset/model/VFX/audio/presentation development in Work after the amendment 2.16 governance publication gate had cleared.
- **Decision:** Implement the amendment 2.16 contract in the existing item/inventory, ProjectileSystem, shared-capacity, RacerEffects, Shockwave, KartTimeTrial and supporting-surface-query boundaries. Original procedural model geometry, finite trail/bounce/impact VFX and original procedural launch/bounce/hit audio are authorized for this bounded increment. Preserve the fixed-item route and optional counter routes from the scope; diagnostics must verify actual encounters and may not grant AI inventory, mutate race progress or block normal ITEM input.
- **Boundary:** Publication and bounded product-owner live acceptance are complete. No browser/device-specific result is inferred beyond Manny's explicit all-tests-pass report. The accepted increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.
- **Publication evidence:** Reviewed head `e395c63e3f0a425a985de2208e624adf2dd87574` passed hosted PR CI `35137395927` with 50 test files / 446 tests and 82.19% statement coverage; PR #144 squash-merged at `a129bbac75f919dc7136ac50dfd63564fe5cd52e` and post-merge validation/GitHub Pages `35137681000` passed.
## ADR-079: Bound Vision-Obscuring Ink Splat to progress-authoritative multi-target impairment

- **Date:** 2026-09-16.
- **Status:** APPROVED GOVERNANCE SCOPE. Gameplay and presentation implementation are not authorized by this checkpoint.
- **Approval:** Manny approved the complete Vision-Obscuring Ink Splat governance/scoping contract in Work after Kinetic Arc Hammers live acceptance.
- **Context:** PRD Section 15.13 requires an Ink effect against racers ahead, partial human screen obscuration fading over approximately 2.5 seconds, and an AI equivalent with lateral path noise, approximately 80 ms reaction latency, and reduced precision without making navigation impossible. The PRD did not yet define exact targeting semantics, repeat-hit behavior, immunity, lifecycle, screen coverage, AI impairment constants, or testing fixtures.
- **Decision:** Amendment 2.18 and `docs/SLICE-5-INK-SPLAT-SCOPE.md` define a one-charge instantaneous all-racers-ahead effect using lap-validated progress. No-target use rejects without consumption; a valid attack commits once even if every ahead target is immune. Per-target item immunity blocks application. Duration is 2.50 race seconds; repeat hits refresh without stacking. Human coverage is capped at approximately 35% and stays below HUD/touch controls. AI impairment is 0.55 m smooth deterministic lateral path-noise amplitude, 0.080 s reaction latency, and 0.88 steering-correction precision, with legal-road bounding and no speed/race-authority changes. Recovery preserves Ink; finish/restart/hub/disposal clear it; pause freezes it.
- **Architecture:** Any later authorized implementation uses a focused `InkSplatSystem`, existing progress-authoritative targeting and atomic inventory boundaries, existing `RacerEffects` item-immunity authority, bounded `AiDriver` impairment, and a local race-view overlay. Ink owns no projectile/hazard and no shared physics-capacity slot.
- **Counter/effect boundary:** Prismatic/generic immunity blocks application only when active at resolution; later immunity does not cleanse already-landed Ink. Shockwave cannot clear Ink. Ink remains independent of Frost, boosts, spinouts, surfaces, camera, and race-progress state.
- **Acceptance:** Future `?testItem=ink-splat`, incoming-Ink, and Prismatic protected/expired fixtures must prove actual resolved encounters. Automated tests must include real production orchestration/AI/HUD paths rather than helper-only assertions. Live desktop/mobile review remains separately gated.
- **Boundary:** No gameplay, VFX/audio implementation, probabilities, accepted-item tuning, racer stats, kart physics, Circuit Alpha authority, AI item acquisition/use, dependency, Overdrive, Rocket, or Slice 6 work is authorized by this governance publication.

## ADR-080: Tune Vision-Obscuring Ink Splat AI impairment after live review

- **Date:** 2026-09-17.
- **Status:** **LIVE ACCEPTED.** Amendment 2.19 was published through PR #149 at `af4fa73c2a05ad25e4e2d7343f89f3cf6b9f510f`; hosted PR CI `35173826253` and post-merge validation/Pages `35188684882` passed.
- **Approval:** Manny approved the bounded tuning amendment in Work after reporting that the deployed AI impairment produced virtually no noticeable racer impairment.
- **Context:** The 2.18 implementation correctly delivered deterministic lateral noise, buffered steering decisions, and reduced steering precision, but the approved values were below the intended perceptual threshold during live review. The correction had to improve visible imprecision without changing Ink targeting, duration, inventory, immunity, human coverage, speed authority, race authority, or lifecycle boundaries.
- **Decision:** Amendment 2.19 supersedes only the AI impairment constants in ADR-079: increase smooth deterministic lateral target-path noise from 0.55 m to **0.95 m**, increase steering/lane-decision latency from 0.080 s to **0.160 s**, and reduce the Ink-only steering precision multiplier from 0.88 to **0.74**. Keep the 2.50-second duration, legal-road bounding, unchanged throttle/speed/braking/acceleration/rubber-band authority, no spinout, no physics mutation, no shared capacity, and all targeting/immunity/lifecycle rules unchanged.
- **Rationale:** The original values were technically active but not perceptually legible in ordinary racing. The revised values produced the intended visibly late, less precise corrections while retaining continuous legal navigation and avoiding a hidden speed penalty; Manny's deployed **“Pass”** confirms the result.
- **Boundary:** This amendment changes no item probability, racer statistic, track/checkpoint authority, AI item acquisition/use, accepted item behavior, dependency, binary asset, Overdrive, Rocket, or Slice 6 scope. Tuning publication, post-merge validation/Pages, and Manny's live acceptance are complete. PR #149 comment `5709839182` is the product-owner acceptance evidence.


## ADR-081: Bound Continuous Nitro Overdrive to a six-second repeated-pulse boost window

- **Date:** 2026-09-17
- **Status:** **LIVE ACCEPTED.** Gameplay and original presentation merged/deployed through PR #152; product-owner acceptance recorded 2026-09-17.
- **Approval:** Manny approved the bounded Continuous Nitro Overdrive contract in Work after Vision-Obscuring Ink Splat live acceptance.
- **Context:** PRD Section 15.15 requires a six-second boost window in which the user may trigger repeated Nitro pulses at least 0.75 race seconds apart, with each pulse lasting approximately 0.9 seconds. The existing Slice 5 runtime already owns generic temporary boosts, atomic item use, HUD/input routing, pause-safe timers, and original gameplay-readable presentation boundaries, but the exact activation, pulse refresh, composition, lifecycle, diagnostics, and acceptance requirements were not yet governed.
- **Decision:** Amendment 2.20 and docs/SLICE-5-NITRO-OVERDRIVE-SCOPE.md define one one-charge item. The first valid ITEM use atomically consumes the charge, frees the inventory slot, starts an exactly 6.0 race-second window, and commits the first pulse immediately. Subsequent ITEM presses during the window commit no more than once every 0.75 race seconds. Each accepted pulse refreshes one non-stacking approximately 0.9-second temporary boost source, capped at 1.15x normal speed and neutral additional acceleration; no pulse extends beyond the six-second window.
- **Composition and lifecycle:** Overdrive composes with Nitro Surge, Prismatic, drift boosts, boost pads, and surfaces through existing maximum-authority rules. It does not bypass dirt/grass penalties, change permanent racer statistics, alter steering/traction/race authority, apply hostile effects, create immunity, create a projectile/hazard, or consume shared item-physics capacity. Pause freezes window/cadence/pulse/presentation state. Recovery does not refund or restart the effect; finish/restart/hub/removal/disposal clear it.
- **Architecture and presentation:** Keep configuration in item definitions; keep charge/window/cadence/input ownership in ItemSystem or a focused bounded Overdrive state seam; keep the active pulse in generic RacerEffects; orchestrate through KartTimeTrial/HUD and existing desktop/mobile controls. Original procedural exhaust/pulse VFX, readable HUD state, and short original activation/pulse audio are authorized by the scope, with no binary dependency or Slice 6 final polish.
- **Acceptance:** The future player-only route is ?testItem=nitro-overdrive. Automated tests must exercise production dispatch/orchestration, first-use rollback and slot release, cadence boundaries, pause/expiry/lifecycle cleanup, non-stacking composition, surface behavior, HUD/input/audio/VFX cleanup, normal-selector isolation, and unchanged AI/race authority. Deployment review must cover desktop/mobile, chase/rear presentation, six-second timing, pulse cadence, no-target-equivalent invalid requests, overlap with accepted boosts, and normal unforced isolation.
- **Implementation authorization:** After governance PR #151 merged at `6c1fe1b78274b25c23fe6fc0a2090e26c086febb` and hosted PR CI/post-merge validation/Pages run `35223980439` passed, Manny separately authorized the bounded Nitro Overdrive gameplay, VFX, audio, and presentation implementation on 2026-09-17. The checkpoint passed 55 test files / 473 tests, strict typecheck, zero-warning lint, runtime-asset/branding checks, and production build; gameplay PR #152 CI runs `35229580296` and `35230154302` passed.
- **Publication and live acceptance:** PR #152 squash-merged at `59897fcd48b8f7b8e156764f75a44360bf0f2281`; post-merge validation and GitHub Pages run `35230540886` passed. The deployed player-only route is `?testItem=nitro-overdrive`. Manny reported **“Pass”** on 2026-09-17. No browser/device-specific result is inferred beyond that explicit report.
- **Boundary:** This authorization changes no Hyper-Drive Rocket behavior, AI item acquisition/use, probabilities, dynamic gap factor, accepted item behavior, racer statistics, track/checkpoint authority, issue #106, dependencies, or Slice 6 scope.

## ADR-082: Bound Hyper-Drive Rocket to legal six-second catch-up autopilot

- **Date:** 2026-09-17.
- **Status:** **APPROVED / PUBLISHED GOVERNANCE SCOPE.** Gameplay, VFX, audio, and presentation implementation are not authorized by this checkpoint.
- **Approval:** Manny reviewed and approved the bounded Hyper-Drive Rocket governance scope after Nitro Overdrive live acceptance. PR #154 squash-merged at `ae977623bdc7a209634816e1cea8ef4a799b98c8`; post-merge validation and Pages run `35243454845` passed. Implementation remains a separate approval gate.
- **Context:** PRD Section 15.16 requires a catch-up Rocket state for trailing racers with racing-line autopilot, collision/hazard immunity, increased speed, automatic overtakes, a maximum approximately six-second window, and a controlled return to the player. Existing item definitions and selector weights already contain Rocket, with rank 6-8 and at least 45 m behind the leader as the runtime eligibility prerequisite, but the legal navigation, authority, protection, lifecycle, AI, and presentation boundaries were not yet operationally governed.
- **Decision:** Amendment 2.21 and `docs/SLICE-5-HYPER-DRIVE-ROCKET-SCOPE.md` define one atomic charge; unchanged rank/gap selection; an exactly 6.0 race-second active state including a 0.30-second control-return blend; legal Circuit Alpha projection/lookahead through normal `KartController` input; a 1.25x speed-cap target with normal acceleration and surface rules; and overtakes earned only through ordinary movement and checkpoint traversal. Rocket cannot cancel through steering/braking, teleport, edit transform/velocity/progress/checkpoints/laps/rank/finish/racer stats, or deliberately deposit the player into first.
- **Protection boundary:** The approved immunity covers ordinary racer-contact impulses/speed-retention penalties and supported ground/area hazards such as Slick, Blast, and Shockwave hostile effects. Track geometry, guardrails, checkpoints, and legal movement remain authoritative. Projectile immunity is deliberately not inferred; any broader protection requires a separate decision.
- **Composition and lifecycle:** Rocket protection/boost state must be source-scoped and compose with Nitro/Overdrive/Prismatic, drift boosts, pads, and surfaces without multiplying authority or clearing unrelated effects. Pause freezes the state; recovery reprojects and preserves remaining time; finish, restart, hub return, removal, and disposal clear gameplay and presentation state. The one-slot item is freed on committed activation, while failed activation retains the held charge.
- **Architecture:** Any later authorized implementation remains within item definitions/selector, ItemSystem transactions, a focused `RocketAutopilot`/`HyperDriveRocketSystem`, Circuit Alpha legal geometry, KartController movement, RacerEffects source-scoped composition, and KartTimeTrial orchestration. No second race director, physics world, item-capacity pool, or general AI item-policy system is introduced. A racer-generic autopilot seam may be prepared without enabling AI item use.
- **Acceptance and testing:** The future player-only `?testItem=hyper-drive-rocket` route, normal unforced URL, real dispatcher/controller/race lifecycle, selector boundary, exact timer/blend, legal movement, no direct authority writes, contact/ground-hazard protection, recovery, pause, cleanup, desktop/mobile presentation, and AI regression must be covered. Governance publication requires docs-only PR CI and post-merge Pages validation; gameplay publication and Manny's live acceptance remain later gates.
- **Boundary:** This approved scope changes no selector probabilities, gap factor, accepted item behavior, AI acquisition/selection/tactical use, projectile behavior beyond the existing boundary, dependencies, binary assets, issue #106, or Slice 6 scope. It does not authorize Hyper-Drive gameplay, VFX, audio, or presentation implementation.

## ADR-083: Implement full AI item tactics through a stateless policy layer

- **Date:** 2026-09-17.
- **Status:** **LIVE ACCEPTED.** Full AI item tactics merged/deployed through PR #158; the bounded ADR-084 corrective merged/deployed through PR #159 and passed product-owner live acceptance.
- **Authorization:** Manny authorized the next Slice 5 task, full AI item tactics, in Work on 2026-09-17 after Hyper-Drive Rocket live acceptance. This ADR records the bounded implementation contract; final acceptance is recorded below and in ADR-084.
- **Publication / live acceptance:** PR #158 merged at `cb67183b902e7732b3cab8d95af3e865890b1835`; hosted PR CI `35255837582` and post-merge validation / GitHub Pages `35256074171` passed. Live review then found the bounded race-authority and AI-presentation defects recorded in ADR-084. Corrective PR #159 merged at `e36477022a5fc8363da074dfca302ff263b9758a`; its clean validation gate passed 60 test files / 499 tests, strict typecheck, zero-warning lint, runtime-asset/branding verification, production build, `git diff --check`, and `git lfs fsck`; post-merge validation / GitHub Pages run `35265993137` passed. Manny reported **“all live tests accepted.”** Product-owner evidence is PR #159 comment `5720570319`. Documentation closeout PR #160 then merged at `b6abae2b4a9f1caaf1e8db34d788c15390c87ef4` and post-merge validation / Pages run `35278242805` passed. No browser/device-specific result is inferred beyond Manny's explicit report.
- **Context:** Slice 5 already has governed item definitions, one-slot inventory, rank/gap selection, progress-authoritative targeting, accepted effect systems, AI hazard response, generic Rocket/Overdrive state, and legal `KartController` movement. General AI item acquisition/use was intentionally deferred so tactical behavior would be modeled before enabling it.
- **Decision:** Enable AI acquisition and use for every eligible governed item through a stateless `AiItemPolicy`. The policy observes rank, race-progress gap, progress-valid target distance, rear attackers, nearby projectiles/hazards, track surface/curvature, current inventory item, and active Overdrive/Rocket state. It returns only `use`, `pulse`, or `wait` with forward/backward intent. The baseline is first legal opportunity; defensive and directional predicates may hold an item until its condition exists.
- **Tactical contract:** Kinetic/Seeker/Apex/Ink use progress-valid ahead targets; Blast/Slick and directional multi-charge items select rear or forward intent from observed relations; Shockwave waits for an incoming projectile, hostile hazard, or close racer; Nitro Surge/Overdrive prefer a straight or recovery line; Rocket activates promptly; Prismatic protects a threatened racer or a leading racer on a clear line. The exact non-item-tuning thresholds are recorded in `docs/SLICE-5-AI-ITEM-TACTICS-SCOPE.md`.
- **Architecture:** AI dispatches through `ItemSystem`, `ItemEffectDispatcher`, existing projectile/hazard/counter systems, `RacerEffects`, and generic Nitro/Hyper state. AI drive input receives all active effect modifiers and composes Rocket through `HyperDriveRocketSystem.inputFor`; `AiDriver` remains the owner of steering, lane selection, hazard avoidance, and rubber-band speed. No direct transform, velocity, checkpoint, lap, rank, finish, or statistic mutation is permitted.
- **Runtime fixture:** `?testAiItem=<item-id>&testAiRacer=ai-1` is opt-in deterministic acceptance instrumentation. It scopes the next collected item to one valid AI racer, leaves roulette and dispatch legality intact, and does not alter normal selection or other inventories. `?testItem=<item-id>` remains player-only.
- **Lifecycle and evidence:** AI finish cleanup clears inventory, active Overdrive/Rocket state, Frost, Prismatic, Ink, and owned Arc projectiles. Automated evidence covers all fifteen policy decisions, no-target/defensive waits, generic Overdrive/Rocket activation, modifier-to-controller integration, fixture isolation, unchanged 100,000-per-rank distribution evidence, item interaction/lifecycle regressions, and the existing AI spline/hazard tests. The full-AI-tactics hosted publication and live acceptance gates are closed. Final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, issue #106 disposition as appropriate, and overall Slice 5 closure remain separate gates.
- **Boundary:** This ADR changes no item definitions, probability weights, accepted item values, racer statistics, checkpoint/lap authority, physics world, dependency set, binary assets, issue #106, or Slice 6 scope. Existing item presentation remains authoritative; AI-specific VFX/audio polish is not part of this gameplay increment.

## ADR-084: Correct validated race progression and expose existing racer-owned item visuals for AI

- **Date:** 2026-09-17.
- **Status:** **LIVE ACCEPTED / CLOSED.** Corrective PR #159 merged/deployed and Manny accepted the deployed correction on 2026-09-17.
- **Authorization:** After playing the deployed full-AI-tactics build, Manny approved the bounded correction for the observed lap/finish inconsistency and missing AI racer-owned item graphics.
- **Context:** The live build could display the player ahead using raw spline projection while the ordered checkpoint tracker had not awarded the same lap/finish state. Checkpoints were sampled before the physics step at one point, allowing a valid high-speed crossing to be missed. The same review showed that AI-dispatched Nitro Surge, Nitro Overdrive, Hyper-Drive Rocket, and Prismatic state had gameplay effect but no corresponding racer-owned visual because those procedural groups were mounted and updated only for the player. World-owned projectiles and hazards already rendered for AI.
- **Decision:** Use the next required `LapTracker` checkpoint as a forward swept gate after physics/contact resolution. The shared validated race-progress snapshot constrains raw spline projection to the next unpassed checkpoint and preserves the already-approved CP11-to-offset-finish wrapped segment. Standings, item ranking/selection, progress-targeted item behavior, and AI gap inputs consume that same snapshot; `LapTracker` and `RaceDirector` remain the sole owners of lap validity, finish time, and finish order. Recoveries do not count a swept transition.
- **Presentation:** Reuse the existing original procedural Nitro Surge, Nitro Overdrive, Hyper-Drive Rocket, and Prismatic visual classes for AI racers. Local exhaust/rocket groups follow the AI kart; the existing Prismatic shell stays world-positioned. Do not add AI audio, new assets/models, balance changes, or a separate item-effect state.
- **Evidence closure:** Focused swept-gate, validated-progress ranking, AI-race/Rocket regression, and racer-owned visual lifecycle coverage were included in the corrective validation. PR #159 merged at `e36477022a5fc8363da074dfca302ff263b9758a` after the clean validation gate passed 60 test files / 499 tests, strict typecheck, zero-warning lint, runtime-asset/branding verification, production build, `git diff --check`, and `git lfs fsck`. Post-merge validation / GitHub Pages run `35265993137` passed. Manny reported **“all live tests accepted.”** Product-owner evidence is PR #159 comment `5720570319`. Documentation-only closeout PR #160 merged at `b6abae2b4a9f1caaf1e8db34d788c15390c87ef4` and post-merge validation / Pages run `35278242805` passed. No browser/device-specific result is inferred beyond Manny's explicit report.
- **Boundary:** No item probability, item tuning, racer statistic, track layout, checkpoint order, manual state manipulation, dependency, asset publication, or Slice 6 scope changes are authorized.


## ADR-085: Slice 6 reference-led original art direction, licensed material sourcing, and batched creative approvals

- **Date:** 2026-09-18.
- **Status:** APPROVED FOR BASELINE AUDIT / ART-DIRECTION GATE.
- **Authorization:** Manny approved beginning Slice 6 and explicitly requested two additions to the working method: evaluate free-to-use textures for 3D assets, and use strong existing menu/UI design as inspiration while creating original project assets. Manny also directed the workflow to avoid wasting turns while preserving creative collaboration.
- **Decision:** Begin Slice 6 with one consolidated baseline package: current-state keep/polish/replace audit; licensed PBR material shortlist; racing/menu UI reference study; 2-3 coherent original visual directions; asset-production plan; and one meaningful visual-direction approval gate. Small reversible aesthetic choices inside the approved direction do not require micro-approval.
- **Material sourcing:** Prefer CC0 sources, initially Poly Haven and ambientCG. Record source, license, asset identifier, source resolution, derivative path, and transformation notes for every production import. Do not ship source-resolution scans by default. Respect the PRD Medium-preset GPU texture-residency and download budgets.
- **Technical finding:** Circuit Alpha's procedural road and segmented strips currently emit positions/normals but no UV attribute. Most approved kart builders use PBR factors without a general-purpose authored UV layout. Therefore the first texture-related engineering work is material-coordinate support, not wholesale texture assignment. Approved kart silhouettes/material identity remain protected.
- **UI reference boundary:** Commercial racing-game interfaces may inform hierarchy, pacing, motion, density, selection clarity and panel behavior. Do not copy logos, icons, exact screen layouts, typography, proprietary artwork, franchise motifs or trade dress. Final UI assets must be original to Manaconda's Minigame Mayhem.
- **Initial visual directions:** Route Night, Pit Poster and Twilight Broadcast are the comparison set. The recommended synthesis is Route Night core identity + Pit Poster character scale + Twilight Broadcast race-HUD restraint.
- **Approval cadence:** Batch discovery and alternatives; Manny approves visual language or a hybrid; implementation owns small reversible choices within that language; return to Manny for material visual-language changes, likeness decisions, material PRD changes, paid services, public hosting/deployment, and final release acceptance.
- **Boundary:** This ADR changes no gameplay balance, item probabilities, race authority, track topology, roster identity, approved likeness, dependency set, public hosting, or Slice 5 behavior.


## ADR-086: Lock Route Night as the Slice 6 production visual language

- **Date:** 2026-09-18.
- **Status:** **APPROVED / LOCKED.**
- **Authorization:** Manny reviewed individual rendered examples of Route Night, Pit Poster, Twilight Broadcast, and the proposed hybrid, then explicitly selected Route Night and directed: **“Lock it in!”**
- **Context:** ADR-085 established the reference-led original-art workflow and comparison set but intentionally left the final visual language approval-gated. The rendered comparison made Route Night's design, formatting, hierarchy, cinematic framing, and route-based identity the preferred direction.
- **Decision:** Route Night is the governing production visual language for Slice 6. Use deep indigo/graphite structural surfaces, cyan route/node/checkpoint graphics, warm gold placement/focus/action accents, violet/magenta secondary energy, strong approved-character portrait crops, clipped readable panels, cinematic title/results framing, and high-clarity race-HUD hierarchy. The route/token/checkpoint/arc motif is the recurring original grammar tying screens together.
- **Canonical visual artifact:** `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png` is the primary visual reference for Route Night. Its composition, formatting, information density, panel proportions, typographic behavior, accent relationships, Character Select framing, in-race HUD organization, and results/podium staging are governing visual evidence alongside this ADR. The committed PNG is a lossless pixel-identical re-encode of Manny's approved/re-attached Route Night concept at 1672 × 941; compression changed, visual pixels did not.
- **Character Select boundary:** Production Character Select uses only the real approved game roster, approved portraits/driver art, names, stats, and kart identities. Characters shown in visual-concept renders are placeholders only and carry no roster or likeness approval. The PRD-required rotating 3D kart preview remains part of Slice 6.
- **Track-lighting boundary:** Route Night is a UI/presentation identity, not a mandate that all tracks occur at night. Circuit Alpha may retain its authored dusk/twilight presentation. Future tracks developed after completion of the current vertical-slice PRD may use unique time-of-day, lighting, sky, weather, and environmental palettes while retaining Route Night's UI grammar, route motif, readability system, panel language, and semantic accent hierarchy.
- **Implementation authority:** The art-direction gate is closed. Production UI styling may proceed within Route Night without micro-approval for small reversible aesthetic decisions. Material changes to the visual language, approved likeness packages, material PRD requirements, paid services, public hosting/deployment, or final release acceptance remain approval-gated.
- **Preserved boundaries:** No gameplay balance, item probability, racer statistic, race authority, track/checkpoint topology, approved avatar likeness, approved kart identity, or Slice 5 behavior changes through this decision.


## ADR-087: Versioned settings, bounded graphics presets, and centralized audio mixer foundation

- **Date:** 2026-09-18.
- **Status:** **PUBLISHED / DEPLOYED 2026-09-18.**
- **Authorization:** Manny approved moving forward in Slice 6 after ADR-086 locked Route Night. The approved Slice 6 implementation order names settings/persistence architecture, graphics presets, and the audio mixer skeleton as the first bounded engineering increment.
- **Settings persistence:** Store production settings under versioned local key `mmm.settings.v1`. Invalid, corrupt, unavailable, or unsupported-version storage falls back to safe defaults instead of blocking startup. Defaults are Medium graphics and 1.0 Master/Music/SFX/Engine volume.
- **Graphics presets:** Low caps device pixel ratio at 1.0 and disables shadows; Medium caps DPR at 1.5 and preserves the accepted pre-Slice-6 PCF-soft-shadow / 2048 shadow-map baseline; High caps DPR at 2.0 while retaining the current shadow tier. Post-processing, texture resolution, particles, and other later Slice 6 quality dimensions will extend these preset profiles rather than create parallel settings authorities.
- **Application timing:** A saved graphics preset applies when the next race renderer is created, so a page reload is not required. Live mutation of an already-running renderer remains deferred until the final pause/settings and post-processing integration makes that behavior materially useful and testable.
- **Audio architecture:** Use one mixer authority with Master, Music, SFX, and Engine buses. Master also configures Howler's global level; direct procedural Web Audio receives the effective Master × bus value because those nodes bypass Howler's internal master-gain path. Existing item, warning, and drift cues use SFX; the existing Prismatic musical layer uses Music. Engine is reserved for the later production kart-engine system.
- **Evidence:** Final PR-head CI run `35352383087` passed Git LFS verification, clean install, strict typecheck, zero-warning lint, **64 test files / 515 tests**, **81.40% statement / 76.90% branch / 86.24% function / 83.15% line coverage**, branding/runtime-asset verification, and production build. Manny approved publication on 2026-09-18; PR #176 squash-merged at `0144bcb6f1ce2bc0acb0e7e6adc229f38fd2e109`; post-merge validation / GitHub Pages run `35353036562` passed; publication evidence is PR #176 comment `5731036246`.
- **Boundary:** This decision changes no gameplay balance, race authority, item behavior, roster/likeness, Route Night visual language, production audio asset, external dependency, track topology, post-processing effect, or PBR material. Publication of this checkpoint is complete; later material acceptance and release gates remain governed separately.

## ADR-088: Use meter-scaled procedural strip UVs and one bounded CC0 asphalt PBR set

- **Date:** 2026-09-18.
- **Status:** **LIVE ACCEPTED 2026-09-18.**
- **Authorization:** The approved Slice 6 implementation order in ADR-085 names material-coordinate infrastructure plus the first Circuit Alpha PBR material pass as the second bounded increment after the settings/graphics/audio foundation. Manny's 2026-09-18 continuation instruction explicitly authorizes this bounded work and normal PR/CI/deployment publication.
- **Context:** Circuit Alpha's procedural loop and segment strips previously emitted positions/normals without general-purpose UVs. Blind texture assignment would have produced uncontrolled scale/seams, while broad kart remapping would risk approved identities for no gameplay benefit.
- **Coordinate decision:** Generate deterministic UVs from world-meter geometry. Use a 2 m baseline material tile. Closed loops choose the nearest integer number of longitudinal repeats so the duplicated closing vertices terminate at an integral V coordinate; segment strips use cumulative centerline distance. Lateral coordinates remain meter-scaled. This adds a reusable material coordinate only and does not alter positions, indices, track samples, collision, topology, checkpoint/lap authority, or physics.
- **Material decision:** Use one CC0 Poly Haven `asphalt_track` source set, limited to the 1024 x 1024 diffuse, OpenGL normal, and roughness JPEG maps. Apply it only to `track-road` and `asphalt-racing-wear` in this increment. Shoulder/dirt remain color-only but UV-ready; karts remain untouched. Exact source, license, author, derivative paths, and hashes are recorded in `docs/ASSET-PROVENANCE.md`.
- **Budget decision:** Reuse the same three maps across both asphalt materials. The shipped files total about 2.05 MiB compressed; a conservative RGBA-plus-mip estimate is approximately 16 MiB decoded GPU residency, kept visible against the PRD Medium <=256 MB texture target. Final rendered Medium performance/residency certification remains a later Slice 6 gate.
- **Lifecycle decision:** Because this increment introduces actual texture resources, race teardown now explicitly deduplicates and disposes track textures, materials, and geometries through `disposeTrackScene`. This is preventive memory hygiene; it does not claim the final five-restart memory acceptance criterion.
- **Integrity decision:** `tools/verify-runtime-assets.mjs` verifies JPEG signatures and exact SHA-256 values for the three runtime maps. The current `.gitattributes` does not LFS-govern track JPGs, so these small 1K runtime derivatives remain normal Git files and no LFS policy is changed. Existing LFS-governed assets remain subject to `git lfs fsck` during CI and Pages publication.
- **Publication evidence:** Hosted PR CI `35356556627` on head `35bce580f6bff5c475baa869e4888d0644bafd36` passed Git LFS verification, clean install, strict typecheck, zero-warning lint, **65 test files / 519 tests**, **81.52% statement / 76.86% branch / 86.42% function / 83.26% line coverage**, exact track-texture verification, branding/runtime-asset verification, and production build. PR #178 squash-merged at `c721fc083e2d18ad534387227968bb0a75982ae7`; post-merge run `35365068619` passed validation and GitHub Pages deployment. Manny reviewed the deployed checkpoint on 2026-09-18 and reported **“Looks good.”** Product-owner evidence is recorded in PR #182 comment `5732962712`; no defect was reported. The bounded deployed visual gate is closed.
- **Boundary:** No gameplay balance, item behavior/probabilities, racer statistics, AI tactics, race authority, track topology, approved avatar likeness, approved kart identity/geometry, dependency, public-hosting configuration, or Route Night visual-language change is authorized by this ADR.


## ADR-089: Implement the bounded Route Night title, hub, controls, and settings UI system

- **Date:** 2026-09-18.
- **Status:** **BASELINE IMPLEMENTED / MERGED / DEPLOYED; BOUNDED DRIVER/KART COMPOSITION CORRECTION IN REVIEW; DEPLOYED VISUAL ACCEPTANCE PENDING.**
- **Authorization:** Manny's continuation instruction explicitly authorizes the first bounded Route Night title/hub/controls/settings increment and approved an original image-asset package whose assets can be placed deliberately within the responsive UI.
- **Decision:** Establish one reusable Route Night UI layer around graphite/indigo structural surfaces, cyan route/node/checkpoint graphics, warm gold action/focus state, violet/magenta secondary energy, clipped panels, visible focus treatment, restrained motion, and reduced-motion fallback. Keep the title, hub, Controls, and Settings as views of the same system. Use authored SVG/CSS/DOM route primitives for structure and a bounded set of original raster layers only where expressive title or atmospheric surface treatment materially improves the interface.
- **Asset package:** Commit `route-night-title-hero.webp` for the title/hub atmosphere and `circuit-alpha-route-card.webp` for Circuit Alpha's playable hub card under `public/assets/ui/route-night/`. Record generated provenance, transformations, placement, and hashes in `docs/ASSET-PROVENANCE.md`; resolve URLs through `src/ui/routeNight.ts` so the deployed Vite base path remains authoritative.
- **Hybrid refinement:** After visual review against the canonical reference, add the original painterly `route-night-title-lockup-brush.webp` and restrained opaque `route-night-panel-texture.webp` layers. The former is paired with the exact-text SVG fallback and live accessible product-name heading; the latter is a low-opacity backdrop behind responsive DOM/SVG UI. This remains within the bounded Title/Hub/Controls/Settings objective and does not turn interface copy or controls into raster art.
- **Density/action refinement:** After visual review identified the largest remaining gaps in buttons, icons, utility UI, and composition density, add one original text-free `route-night-editorial-strip.webp` backing layer plus authored route-board/node primitives, stronger filled gold/cyan/violet button frames, and bespoke race/minigame/input/signal symbols. The raster layer remains subordinate to live DOM/SVG content and carries no copy or interaction state.
- **Behavior preservation:** Keep product naming/route-token mark identity, browser audio unlock, hub navigation, all existing control bindings, versioned Master/Music/SFX persistence, Low/Medium/High graphics quality, and next-race graphics application unchanged. Unavailable hub cards remain non-activating and cannot route to empty screens.
- **Validation boundary:** Add UI-contract tests for asset resolution, title audio-aware entry, hub availability, binding readability, and settings destinations. Complete strict typecheck, zero-warning lint, automated tests, branding/runtime-asset validation, production build, and deployed desktop/mobile visual review before claiming acceptance.
- **Preserved boundaries:** No Character Select, rotating kart preview, race HUD, mini-map, pause/results, race audio, engine audio, final-lap music, post-processing, PBR/material, Circuit Alpha topology, racer statistics, item behavior/probability, AI tactics, hosting, avatar likeness, kart identity/geometry, or Candidate B experiment changes are authorized by this ADR. Stop at Manny's deployed Route Night visual-acceptance gate.


## ADR-090: Implement the bounded Route Night Character Select and kart preview

- **Date:** 2026-09-19.
- **Status:** **BASELINE + COMPOSITION CORRECTION + FULL-BODY PACKAGE LIVE ACCEPTED 2026-09-19.**
- **Authorization:** Manny approved the next bounded Slice 6 increment after the Route Night title/hub/utility work: redesign Character Select using the locked Route Night language, use the real approved roster and production identity assets, and add a real rotating 3D kart preview. Character Select remains separate from the later race HUD, pause/results, and final audio/post-processing work.
- **Decision:** Replace the earlier rounded Character Select scaffold with a responsive Route Night driver checkpoint. Use live DOM/CSS/SVG for headings, route boards, roster cards, stats, buttons, focus states, and responsive layout. Use a bounded original image package only for atmospheric bay, route-energy, and hero-aura layers; these assets carry no copy, identity, interaction, or layout authority.
- **Roster and identity:** Render all twelve approved manifest entries, real approved portrait assets, real approved front driver art where available, fixed manifest statistics, approved class labels, and approved kart names. Preserve portrait fallback behavior. Do not invent characters, alter likenesses, change racer statistics, or change kart geometry/identity.
- **Kart preview:** Add an isolated `CharacterKartPreview` UI seam that loads the manifest kart GLB through `GLTFLoader`, applies the manifest-governed visual yaw, provides a restrained idle rotation, honors reduced motion, and falls back to a procedural preview kart when WebGL or a production GLB is unavailable. This preview does not touch `KartTimeTrial`, race authority, materials, topology, or gameplay kart loading.
- **Behavior preservation:** Keep the existing title → hub → Character Select → race handoff, audio unlock, selected-character state, confirm action, and back-to-hub navigation. The new screen must not route unavailable hub cards to empty destinations and must not alter settings/audio/graphics semantics.
- **Original generated assets:** Commit only the three approved atmospheric derivatives under `public/assets/ui/route-night/`: `route-night-character-select-bay.webp`, `route-night-character-select-energy.webp`, and `route-night-character-select-hero-aura.webp`. Record generation source, placement, transformations, and hashes in `docs/ASSET-PROVENANCE.md`.
- **Validation boundary:** Add focused markup/asset/manifest/preview-contract tests. Complete strict typecheck, zero-warning lint, full automated tests, branding/runtime-asset validation, production build, and actual desktop/mobile browser review after normal publication. The browser review must compare the deployed result directly with ADR-086 and the canonical Route Night reference.
- **Closure evidence:** The bounded baseline merged through PR #185 at `300a4d5d174e962d6ef4db19dcbee3184bc22202`; the responsive composition correction merged through PR #186 at `5e65b092e2049a214db39aec0bce89c9f9817117`; the approved full-body package merged through PR #187 at `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`; post-merge CI/Pages run `35422609359` passed; Manny's deployed desktop/mobile Character Select visual acceptance against the approved Route Night design and twelve approved roster assets passed.
- **Preserved boundaries:** This ADR did not authorize race HUD, mini-map, pause/results, final audio, post-processing, PBR/material, Circuit Alpha topology, racer statistics, item behavior/probability, AI tactics, avatar likeness changes, kart identity/geometry changes, Candidate B experiments, hosting architecture, or later Slice 6 work. The next bounded asset direction is authorized separately for planning by ADR-093.## ADR-091: Add approved full-body selection art without changing race assets

- **Date:** 2026-09-19.
- **Status:** **APPROVED / MERGED / DEPLOYED / LIVE ACCEPTED 2026-09-19.**
- **Authorization:** Manny approved the Character Select full-body art direction in batches: Lavi individually, then Manaconda/Accu/Kraken, Krios/Keeg/McFleurdel, Toph/Lula/Jennifer, and Dragon Queen/Alex. The package is the next bounded increment inside the already approved Character Select screen; it does not authorize later Slice 6 screens.
- **Decision:** Add a separate `selectionArt` manifest field for each active AA-01 through AA-12 racer and render that asset only in the selected Character Select identity lane. Keep existing portraits for roster cards and existing `driver/*.png` frames for race runtime. Full-body art is not a replacement for the race driver contract.
- **Asset contract:** Store each approved asset at `public/assets/characters/aa-##/selection/full-body.png` as a 1024 × 1536 sRGBA PNG with genuine transparency. Use the shared revision `character-select-full-body-20260919-4`, the ADR-092 normal-Git runtime-delivery classification, base-aware manifest URLs, and runtime validation for dimensions, PNG signature, RGBA channels, and transparent corners.
- **Visual contract:** Original character illustrations follow the locked roster records and Route Night language: indigo/cyan/magenta/gold lighting may support the identity lane, but the images contain no UI copy, logos, scenery, karts, interaction state, copied canonical pixels, commercial artwork, or exact commercial layouts. Toph's initial marked candidate was rejected before the approved derivative was staged; Jennifer's selection image is alone; Dragon Queen remains a literal dragon with wings and tail.
- **Integration boundary:** The selected full-body image is separate from the kart preview lane and does not change kart GLBs, kart identity or geometry, driver-frame bytes, driver mount coordinates, race cameras, race authority, stats, items, AI, topology, PBR/material work, settings/audio behavior, or hosting architecture.
- **Evidence:** The mapping and source/runtime hashes are recorded in `docs/assets/CHARACTER-SELECT-FULL-BODY-ASSET-BRIEF.md` and `docs/ASSET-PROVENANCE.md`; active avatar records and `docs/ROSTER-MAPPING.md` record the selection-only allocation. PR #187 merged at `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`; post-merge CI/Pages run `35422609359` passed; Manny's deployed desktop/mobile visual acceptance against the approved Route Night design and twelve approved roster assets passed. The Character Select gate is closed; later screens require their own decision.## ADR-092: Deliver Character Select full-body art as normal-Git runtime derivatives

- **Date:** 2026-09-19.
- **Status:** **APPROVED.**
- **Context:** The approved Character Select illustrations are fixed-size, transparent runtime delivery files, but the initial ADR-091 integration matched them to the broad high-resolution character-art LFS pattern. The established avatar workflow already keeps approved runtime portrait and driver-frame derivatives in normal Git, while the connected GitHub publication path cannot upload arbitrary LFS objects from this workspace.
- **Decision:** Add a narrow `.gitattributes` exception for `public/assets/characters/**/selection/full-body.png`. Keep the twelve approved 1024 × 1536 delivery PNGs as ordinary Git blobs; keep any future generated/source masters, 3D models, audio, and unrelated high-resolution character/kart/track art under their existing LFS rules.
- **Rationale:** The selection files are authored runtime derivatives, not source masters. This preserves direct GitHub connector publication and Pages delivery without weakening LFS governance for source art or other large production binaries.
- **Integrity boundary:** Do not regenerate, recompress, recolor, resize, or otherwise alter the approved PNG bytes as part of this storage correction. Runtime validation continues to enforce the recorded dimensions, signatures, RGBA channels, transparency, and SHA-256 values.
- **Approval:** Manny approved this narrow storage classification on 2026-09-19 after reviewing the prior normal-Git publication path for the portrait and driver-frame runtime derivatives.

## ADR-093: ImageGen-led item identity and cinematic Slice 6 race/results assets

- **Date:** 2026-09-19.
- **Status:** **APPROVED FOR DESIGN / IMPLEMENTATION PLANNING.**
- **Authorization:** Manny approved the expanded visual direction after direct review of the Route Night canonical target: the next bounded increment must use ImageGen for item identity art at minimum, add atmospheric race/results layers, and replace the compact finish card with a full post-race podium/results presentation. This ADR records the planning direction; runtime asset generation, code implementation, publication, and live acceptance remain later gates.
- **Decision:** Plan one bounded Slice 6 increment covering the Route Night Race HUD, the Circuit Alpha mini-map, and a cinematic Results/Podium transition. Use ImageGen for a coherent text-free 15-item identity pack, one restrained race-HUD atmosphere/edge layer, one Results/Podium backdrop, twelve full-body podium victory poses, and twelve full-body 4th-8th reaction/defeat poses. Keep all text, numbers, live values, map topology, gauges, warnings, rank/podium geometry, controls, and accessibility semantics in live DOM/CSS/SVG.
- **Item pack:** The fifteen assets map one-to-one to `kinetic-disc`, `seeker-drone`, `apex-missile`, `blast-orb`, `blaze-orbs`, `frost-orbs`, `arc-blade`, `arc-hammers`, `slick-trap`, `shockwave`, `ink-splat`, `nitro-surge`, `nitro-overdrive`, `hyper-drive-rocket`, and `prismatic-invincibility`. Item display names, charge counts, probability tables, effects, VFX, audio, and behavior remain unchanged.
- **Character results pack:** Generate both `results/victory.png` and `results/reaction.png` for every active AA-01 through AA-12 character because any racer may finish in the top three or in places four through eight. Top three use the victory pose; places four through eight use the reaction/defeat state. The existing 512 × 512 `driver/victory.png` remains a race-frame fallback and is not promoted to hero podium art.
- **Reuse:** Reuse approved `portrait.png` files for minimap markers and compact standings rows; reuse approved Character Select `selection/full-body.png` for a missing-result-art fallback/secondary identity view; reuse kart GLBs, the existing minimap topology, the existing Route Night SVG libraries, existing item identity/VFX semantics, and the protected Circuit Alpha material baseline.
- **Asset boundary:** Generated images must be original, text-free, and subordinate to live UI. Approved roster references may establish likeness, costume, silhouette, and color identity. Do not copy canonical Route Night pixels, commercial artwork, logos, exact commercial typography, track geometry, karts, item semantics, or UI layout into generated imagery. Atmosphere assets must not contain characters, karts, embedded copy, or hidden interaction state.
- **Runtime delivery recommendation:** Use 512 × 512 transparent PNG item derivatives under `public/assets/items/route-night/`; use a transparent WebP race atmosphere layer and an opaque WebP Results/Podium backdrop under `public/assets/ui/route-night/`; use 1024 × 1536 transparent sRGBA `results/victory.png` and `results/reaction.png` derivatives under each active character. Add only scoped fixed-size runtime exceptions to `.gitattributes`; keep generated/source masters under the existing high-resolution/LFS governance.
- **Preserved boundaries:** No item balance/probability, item behavior, race authority, checkpoint/lap topology, roster mapping, kart identity/geometry, PBR/material baseline, settings/audio semantics, final-lap/engine music, pause-menu scope, or hosting architecture changes are authorized by this planning decision.
- **Acceptance gate:** The implementation must pass asset provenance and rights review, exact runtime asset validation, strict typecheck, zero-warning lint, full automated tests, production build, five-restart cleanup/memory checks, and deployed desktop/mobile visual acceptance for Race HUD, mini-map, Results/Podium, the complete Title → Hub → Character Select → Race → Results flow, all eight standings, fallback/reduced-motion behavior, and no regression to accepted Character Select or Slice 5 behavior.

## ADR-094: Task 10 five-restart gate passed by product-owner manual review

- **Date:** 2026-09-26.
- **Status:** **TASK 10 FIVE-RESTART GATE AND SLICE 6 MEMORY CRITERION PASSED BY OWNER MANUAL REVIEW.**
- **Authorization:** Manny stated, “I'm passing task 10 via manual review,” after approving the corrected mobile HUD preview. He clarified that he actually played, restarted, reselected, and returned to main at least ten times on both mobile and desktop. The reviewed feature branch head was `5d58b6a0e7d909eb115612c0df10335126bb1996`.
- **Decision:** Record the repeated manual exercise as the Task 10 five-restart pass and the product-owner acceptance of the Slice 6 no-material-memory-increase criterion. The ten-or-more cycles on each platform exceed the five-restart minimum. The prior documentation assertion that no five-restart run occurred was incorrect; this correction supersedes it.
- **Evidence boundary:** The result is qualitative manual measurement reported by Manny. Focused/full validation and one mocked routing/disposal cycle per action are separate automated evidence. No device models or numerical heap, marker/DOM, or Results-only asset-residency figures were supplied, so none are inferred. The PRD criterion is unchanged.
- **Remaining gates:** Task 11 deployed desktop/mobile acceptance and hosted PR/post-merge CI remain pending. This decision does not authorize merge, production deployment, or whole-Slice-6 acceptance.

## Results composition clarification — 2026-09-28

Manny rejected the deployed Results layout because winners still overlap podium fronts and places 4–8 are tiny beneath the duplicate standings list. He approved replacing that list with five larger reaction-portrait cards in the upper-right Results panel, each with placing, name, and finish time overlaid at the bottom, and positioning the top-three full-body portraits so their feet stand on the platform tops. The already-approved backdrop and character art remain unchanged. This supersedes the earlier request to retain the compact lower-finisher reaction rail alongside the eight-row list. The visible eight placements are represented by three podium portraits plus five lower-finisher cards. Publication and Task 11 acceptance remain separate approval gates; Task 10 remains PASSED.

## ADR-095: Approved Route Night music integration and exact runtime upload exception

- **Date:** 2026-09-30.
- **Status:** Revision 2 assets/listening approved; review integration authorized; integrated listening and separate production-publication acceptance pending.
- **Authorization:** Manny approved planning and Suno prompts, supplied five recordings, authorized loop edits and seam repairs, then stated “These are much better -- approved!” and authorized integration/private preview with “Yes.” After the blocked shell Git/LFS upload, Manny explicitly instructed: “Find an alternative path, please,” referring to previous uploads outside LFS. This instruction governs the narrow exception below.
- **Music:** One Title/Hub cue (also Controls/Settings), Character Select, Circuit Alpha racing, its final-lap arrangement, and Results/Podium. Exact revision 2 stereo PCM16/48kHz loops retain approved SHA-256s, sample counts and edit records in `assets/audio/music-review-v2/manifest.json`. No new generated audio or further edits accompany integration.
- **Runtime delivery:** The five exact `public/assets/audio/music-v2/*.wav` filenames listed individually in `.gitattributes` are normal-Git runtime delivery exceptions, uploaded through the authenticated connected GitHub binary blob API. This supersedes ADR-012/AGENTS/LFS-PUBLISHING only for those exact files. Source MP3s remain outside the repository; the 96 accepted SFX and all other LFS-governed assets retain their policy. No broad audio wildcard exception, Actions bridge or protection change is introduced.
- **Playback:** Gesture-created Web Audio context avoids Howler automatically suspending native menu sources. Direct gain applies effective Master × Music once, with 0.5 base gain; pause and Prismatic each attenuate to 0.25. Existing procedural Prismatic remains. Race/final-lap handoff begins on the next race bar, over two bars at 130.85 BPM. Title/Hub remains continuous; route fades use 0.7 seconds, Results 0.8 seconds. Countdown silences the preparation cue; hidden tabs stop voices and restore position on return. Race callbacks carry authoritative phase/lap/pause/Prismatic state without changing simulation.
- **Review boundary:** Review branch/PR and owner-private full-game preview only. Asset acceptance is complete; integrated listening and production publication remain separate. Existing Task 10/11 and SFX approval remain closed. Full-game performance/browser matrix, final quality checklist, release evidence and next PRD slice remain separate gates.


### ADR-095 approval disposition — 2026-09-30

Manny explicitly reported: **“Good stuff. Integrated listening approved. Ready for merge & production publication.”** This closes the integrated listening gate and authorizes PR #210 merge plus production delivery through the existing protected-main CI/Pages workflow. PR #210 merged at `40f42c13a7700257aebc87cf7b8fe80e707e3837`. The five exact WAV exceptions and hashes remain unchanged; no workflow/protection or gameplay changes accompany publication. Previous review-only wording is historical. Broader performance/browser, final quality/release evidence and next-slice approval remain separate.


## ADR-096: Bounded player-only off-road wheel dust

- **Date:** 2026-09-30 (America/Chicago).
- **Status:** Scope and owner runtime visual acceptance approved; merge/public production publication pending.
- **Authority:** Manny replied “Approved.” to the player-only dust design after post-drift repository catch-up. PRD 23.6 supplies the speed/slip/surface-driven instanced dust requirement; no material PRD change is introduced.
- **Decision:** Cache actual normalized approved GLB wheel centers before static mesh batching; use four read-only ground rays and shared Circuit Alpha surface projection. One camera-facing world-space pool with normal alpha blending, a procedural 32×32 radial-alpha map, and quality caps 32/64/96. Emission requires grounded dirt/grass motion above 1.2m/s; rate depends on speed and lateral slip. Pause/hidden freeze, old trails fade after emission stops, recovery/finish/disposal clear. Dispose mesh instance buffers plus owned texture/geometry/material. Use independent visual RNG.
- **Preserved boundaries:** Existing accepted drift caps/effects, physics/surface penalties, boosts, controls, cameras, UI/HUD/Results, audio, roster/art/assets, settings persistence and next-race quality application remain unchanged. AI effects, speed/FOV, bloom/blur and later slices remain outside this scope. No claim that these local caps close global particle or full-race performance gates.
- **Evidence/gates:** `docs/evidence/2026-09-30-wheel-dust/` records focused/full validation, observed red/green and review resolution, canonical branch/CI and private preview. Owner new-effect review passed with “Approved.” on 2026-09-30 for private version 4. Separate merge/publication approval remains required. Existing Task 10/11 and audio/manual acceptance are not reopened.

### ADR-096 release disposition — 2026-09-30 (America/Chicago)

Manny accepted the private version 4 wheel-dust review with “Approved.”, then explicitly answered the separate merge/public release question with “Yep, approved.” PR #215 merged at `416e5e2b4c1a2ffc4949607ea8a028f96125e338`; final PR CI `36801543503` and post-merge CI/Pages `36801897851` passed. Public index/entry JS/kart JS/CSS were fetched and matched the validated build exactly. This closes the bounded dust review and release gates; earlier pending statements are historical. All existing acceptance remains passed, and no new device/performance pass, broader Slice 6 release acceptance or next-slice authority is inferred. Evidence: `docs/evidence/2026-09-30-wheel-dust/production-delivery.json`.

## ADR-097: Bounded AI drift and off-road wheel dust

- **Date:** 2026-09-30 (America/Chicago); resumed review publication 2026-10-01.
- **Status:** LIVE ACCEPTED; owner visual acceptance and explicit merge/publication approval complete.
- **Authority:** Manny approved AI drift parity and added AI wheel dust: “Approved. I think you should do the wheel dust for AI racers at the same time.”
- **Decision:** Reuse accepted drift/dust presentation in two shared AI batches with aggregate quality caps (drift 48/96/144, dust 32/64/96), independent racer transition/emission history and independent visual RNG. Restrict new emission to unfinished, non-spinout racers within 60m and the camera frustum. Ground support/surface queries are read-only. Cache normalized GLB wheel centers before batching; retain procedural fallback. Freeze pause/hidden; per-owner recovery/finish cleanup and race disposal release owned resources.
- **Preservation:** Player emission equations/limits, all gameplay/AI tactics, boost timing, camera behavior, HUD/Results/audio/art/settings and earlier acceptance remain intact. No speed/FOV, bloom, blur or next slice. Local aggregate bounds do not close global particle or hardware performance gates.
- **Evidence and release:** `docs/evidence/2026-10-01-ai-driving-vfx/`; review PR and sole-owner private preview only. Require new-effect visual acceptance, then separate merge/publication approval.

### ADR-097 release disposition — 2026-10-01

Manny accepted private version 5 and explicitly approved merge/publication: **“Approved - merge & publish approved.”** PR #217 merged at `8380390ed07d281d8b99a3956272550ff6fdf0a6`; final PR CI `36861828504` and post-merge CI/Pages `36865162215` passed. Public index/entry JS/kart JS/CSS hashes match the validated production build exactly (`production-delivery.json`). AI drift/dust is LIVE ACCEPTED; earlier pending statements are historical. Existing acceptance remains passed; no broader performance, full Slice 6 closure, new asset or next-scope authority is inferred.


## ADR-098: Bounded player speed cues

- **Date:** 2026-10-01 (America/Chicago).
- **Status:** LIVE ACCEPTED; owner visual and explicit merge/publication approval complete.
- **Authority:** Manny's “Approved” to player FOV expansion 62–68° and faint peripheral speed lines with quality/lifecycle bounds.
- **Decision:** Use read-only signed forward speed normalized to each kart's normal top speed; eased 70–100% band and exponential smoothing. Preserve all camera transforms/anchors and update projection only. One clip-space ShaderMaterial InstancedMesh allocates 6/10/14 strokes per Low/Medium/High, alpha ≤0.15, no textures or shadow draws. Central horizontal road/kart region remains clear; owner verifies actual HUD/legibility. Existing next-race quality application remains intact.
- **Lifecycle:** Freeze pause/hidden; reset countdown/spinout/finish/recovery; release owned resources once at disposal; warm the shader at race creation.
- **Preservation:** All existing acceptance through PRs #212–218 remains closed; player/AI drift/dust, gameplay, boost/exhaust identity, HUD/Results/audio/assets/settings remain intact. No bloom, blur, new slice or hardware/global-budget claim. This is only part of PRD 22.1/23.5, not full speed/boost polish or Slice 6 closure.
- **Evidence/gates:** `docs/evidence/2026-10-01-player-speed-cues/`. Owner accepted private version 6 and approved merge/publication; release disposition follows.

### ADR-098 release disposition — 2026-10-01

Manny accepted private version 6 and explicitly authorized merge/publication with “Approved for merge / publish.” on 2026-10-01 (America/Chicago). PR #219 merged at `845f68fc173a147d54ecdf74395e65bda328fc4e`; final PR CI `36870557916` and post-merge CI/Pages `36871486372` passed. Public index, both JS bundles and CSS returned HTTP 200 with exact validated-production-build hashes. Full validation passed 90 files / 720 tests. Existing acceptance remains passed. No new device/hardware/global-budget result, bloom/blur or next-slice authority is inferred. Evidence: `docs/evidence/2026-10-01-player-speed-cues/production-delivery.json`. Earlier pending statements are historical.


## ADR-099: Bounded shared exhaust and ordinary boost flares

- **Date:** 2026-10-01 (America/Chicago).
- **Status:** LIVE ACCEPTED; private version 8 owner visual and explicit merge/publication approval complete.
- **Authority:** Manny's “Approved” to stronger ordinary high-speed exhaust and boost flares for the player and nearby AI, after accepted player speed cues.
- **Decision:** One shared unlit InstancedMesh capped at 24/48/72 Low/Medium/High, 3/6/9 per racer. Captured normalized modeled outlet ends precede batching; read-only signed forward speed and controller ordinary-boost feedback drive bounded rearward cones and short cyan/violet flecks. No physics, camera, HUD, audio, asset or dependency changes.
- **Preservation:** Suppress during accepted purple boosts and Nitro Surge, the entire Nitro Overdrive window and Hyper-Drive Rocket; preserve their existing identity. All existing acceptance remains passed. No bloom, blur, next slice, wider speed/boost completion or hardware/global-budget result.
- **Lifecycle:** Freeze pause/hidden; clear countdown/finish; suppress spinout/finished/camera-culled AI; per-owner recovery cleanup; once-only disposal and startup warmup.
- **Evidence:** `docs/evidence/2026-10-01-exhaust-boost-flares/`. Private gameplay review precedes separate merge/publication approval.


### ADR-099 owner review adjustment — 2026-10-01

Manny reported “The exhaust effects are great.” on private version 7, then identified legacy blue spheres still appearing after boost strips at fixed chassis positions. Manny approved the bounded correction: the existing spherical drift indicators are visible only while actively drifting with a charged tier. Ordinary boost flares retain boost-strip/released-boost presentation; accepted drift particles, purple pulses and item effects are unchanged. Owner review of this correction and separate merge/publication approval remain pending. Full validation passed 91 files / 727 tests, including a red-before-fix regression covering blue/orange/purple boost suppression and preserved active drift indicators.


### ADR-099 release disposition — 2026-10-01

Manny accepted private version 8, including the boost-bubble correction, and explicitly authorized merge/publication with “Approved for merge / publish” on 2026-10-01 (America/Chicago). PR #221 merged at `fa9487615330d74f79e46a09c1fdbf1dd14fc8c5`; final PR CI `36881140355` and post-merge CI/Pages `36882109291` passed. Public index, both JS bundles and CSS returned HTTP 200 with exact validated-production-build hashes. Full validation passed 91 files / 727 tests. All prior acceptance stays passed; no hardware/global-performance result, bloom, blur or next-slice authority is inferred. Evidence: `docs/evidence/2026-10-01-exhaust-boost-flares/production-delivery.json`. Earlier pending statements are historical.

## Approved roster extension — Archer, 2026-10-01

Manny approved AA-13 Archer / Precision Speedster (8/5/4/8/7/4), page-two placement, all fourteen 2D illustrations, corrected Candidate 3 geometry and kart name The Precision Shot. Capacity is thirteen while the existing twelve profiles/order remain on page one and races remain eight unique drivers. Page state preserves selection and reopening restores the selected page. Normal-Git runtime PNG exceptions and the deterministic Actions bridge remain authoritative; source masters retain LFS governance. Candidate 3 arrow points toward the curved bow; steering faces the driver. Model normalization retains shared PI yaw, thirteen nodes and four materials. Final runtime mounts are rear `[0, 0.85, -0.12]` and front `[0, 0.78, -0.12]`.

### Archer release disposition — 2026-10-01

Manny tested the published pinned preview and explicitly approved merge/publication. The tested preview pinned runtime `62583845461098caee5fec3e1334502da671de1d`; before merge, PR #223 was reconciled with current main without any `src/` or `public/` delta from that tested runtime. Hosted PR CI `36901694798` passed 95 files / 750 tests plus typecheck, zero-warning lint, LFS verification and build. PR #223 squash-merged at `89fb56e8e8f5f1d45efd45e5cc5fc32c83917f6e`; post-merge CI/Pages `36901993155` passed validation, pinned Archer review verification/build, artifact assembly and production deployment. Archer / The Precision Shot is LIVE ACCEPTED / DEPLOYED. Existing roster order, eight-racer grid, physics, items, graphics, audio and prior acceptance remain intact. Source-master authenticated LFS handoff remains deferred; runtime delivery is complete. No separate owner production-root playtest or device-performance claim is inferred.

## ADR-100: Context-loss recovery scope waiver and selective bloom direction

- **Date:** 2026-10-01 (America/Chicago).
- **Status:** Context-loss scope waiver effective; selective bloom LIVE ACCEPTED; owner visual acceptance and explicit merge/publication approval complete.
- **Authority:** Manny: “Let's skip the context-loss recovery & remove it from our work. I've run this game hundreds of times across mobile & desktop & this has never occurred. Let's do bloom.” Then “approved” to selective race bloom, Low off and capped Medium/High, preserved road/art/HUD, private review and separate publication approval.
- **Decision:** Remove application-owned context-loss recovery from remaining implementation and release gates; supersede PRD 29.3's prior requirement and historical audit recommendations. Do not claim implemented recovery or a context-loss test pass. Prepare explicit eligibility, depth-occluded selective bloom with original base rendering preserved and quality-capped buffers; written design is `docs/superpowers/specs/2026-10-01-selective-bloom-design.md`.
- **Preservation:** Existing acceptance stays closed. Motion blur, character/Archer work and next slice remain outside scope. No runtime/asset/dependency/workflow/protection/publication change at this design checkpoint.
- **Release state:** The written design, implementation plan, Native execution, private visual review and public merge/publication are complete. Context-loss recovery remains deliberately waived, not passed.


### ADR-100 implementation checkpoint

Manny approved the implementation plan and Native execution with “Approved, let's get started.” Selective bloom completed review with full 95-file/743-test validation and independent-review fixes; evidence in `docs/evidence/2026-10-01-selective-bloom/`. Private version 9 owner visual acceptance and public merge/publication are now complete. All earlier acceptance stays closed; no identified-device performance pass, motion blur, Archer work or next-slice authority is inferred.


### ADR-100 release disposition — 2026-10-01

Manny approved private version 9 and explicitly authorized merge/publication with **“Approved for merge/publication.”** PR #224 merged at `e4defab83b19fcd7a94d27b8ddb361e3b34fadc5`; post-merge CI/Pages run `36896865717` passed, including validate job `110485924179` and deploy job `110487025858`. The accepted selective bloom keeps Low off; Medium/High are quality-bounded and restricted to explicitly eligible drift/exhaust/boost-chevron/item energy, while road, kart bodies, driver art, HUD, dust and speed lines remain excluded. Final review validation remains 95 files / 743 tests plus typecheck, zero-warning lint, exact asset checks, production build, diff and LFS checks. Owner visual acceptance is PASSED. No identified-device/global-performance certification or independent public-site byte/hash refetch is claimed because the current session's external network path could not resolve the Pages host; GitHub's deployment job itself completed successfully. Context-loss recovery remains explicitly waived, and no motion blur, Archer work, broader Slice 6 closure or next-slice authority is inferred. Evidence: `docs/evidence/2026-10-01-selective-bloom/production-delivery.json`.


## CI action runtime maintenance — 2026-10-01

Manny approved replacing the remaining Node-20-era GitHub Actions chain as one bounded maintenance increment rather than updating only `deploy-pages`. The workflow now uses `actions/checkout@v5`, `actions/setup-node@v5`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5` and `actions/deploy-pages@v5`; the project's own build runtime remains Node 22. Upstream action metadata was verified before the change: the JavaScript actions use Node 24, and `upload-pages-artifact@v5` pins a Node-24 `upload-artifact` implementation. PR #229 merged at `a9506b0e1727d70db65c9d284bc3d2da38a06416`; post-merge CI/Pages `36907725782` exercised the complete main-only publication path successfully. This is CI/tooling maintenance only and does not alter gameplay, assets, product requirements, acceptance criteria or the Slice 6 roadmap. Current dependency-level `punycode` and `url.parse()` deprecation messages remain upstream/nonblocking and should not be confused with the retired Node-20 runner warning.


## ADR-101: Complete Circuit Alpha terrain materials before final diagnostics

- **Date:** 2026-10-01 (America/Chicago).
- **Authority:** Manny: “We can skip the diagnostic for now. I'd like to execute 100% of our visual improvements ahead of that action. My experience regarding performance has been positive on all devices so far.” Then: “I'm aligned with completing Circuit Alpha’s materials.”
- **Decision:** Defer final diagnostics until the remaining visual increments are complete. Preserve the PRD performance criteria and prior owner-approved mobile baseline substitution; do not infer a new hardware pass. Complete the existing grass, dirt and shoulder materials first using compact provenance-backed CC0 PBR textures and restrained baked surface AO. Retain the accepted asphalt material, track topology/surface physics, authored dusk sky and Route Night palette.
- **Implementation:** Leafy Grass, Brown Mud and Gravel Floor 02; albedo/OpenGL normal/shared ARM, 1K source JPEGs; 2m/1.3m/2m tile scales. Original flat-color fallback on missing albedo, independent normal/packed-map fallback, deduplicated resource cleanup. No displacement, geometry, shader post-processing pass or external game dependency.
- **Gates:** Owner materials acceptance and production merge/publication approved on 2026-10-01 after the hosted pinned preview. PR #234 and verified CI/Pages release are recorded below. Lighting/shadow and camera polish remain later bounded proposals. No prior accepted gate is reopened; context-loss recovery remains waived; Slice 6 remains active.


### ADR-101 production release disposition — 2026-10-01

**Circuit Alpha terrain materials: LIVE ACCEPTED / DEPLOYED (2026-10-01).** Manny approved production merge/publication after the pinned gameplay preview with “merge & publication to main approved.” PR #234 merged at `0aaea588b1260548cd96d5e4226da7ecfc8397f3`; exact-head PR CI `36932505230` and post-merge main CI/Pages `36934885453` passed. Production HTML, JS, CSS and all nine terrain JPEGs were fetched and matched the validated production build byte-for-byte. Review validation passed 99 files / 768 tests plus typecheck, zero-warning lint, exact assets, LFS and build; hosted preview desktop/portrait startup passed with nine textures and no page/console errors. Accepted asphalt, track geometry/physics, gameplay, karts/art, HUD/Results, audio, bloom and motion blur remain intact. Context-loss recovery remains waived; diagnostics deferred. No separate owner production-root playtest or numeric hardware performance result is inferred. Lighting/shadow/camera increments and final Slice 6 gates remain separate. Evidence: `docs/evidence/2026-10-01-terrain-materials/production-delivery.json`. Earlier review/pending entries are historical.

## Lunarcrystal approved concept and AA-14 allocation — 2026-10-02

Manny approved The Moonlit Carriage celestial kart concept/name and a new unique AA-14 Lunar Navigator Medium profile, 6 / 7 / 4 / 8 / 5 / 6 (36). Extend capacity to fourteen while preserving original assignments and page-one ordering; Lunarcrystal joins Archer on page two, races remain eight unique drivers. Reuse established deterministic geometry/export and LOD/mount contracts. Prepare/review actual candidate geometry before sprite mounting. No candidate geometry or runtime production approval is inferred. Asset-only PR #237 remains a separate checkpoint, hosted CI `37010681712` succeeded.

## Lunarcrystal Candidate 1 geometry approval and namespace — 2026-10-02

Manny approved the actual Moonlit Carriage GLB after personal inspection. Preserve the three Candidate 1 hashes exactly for runtime; all are LFS-governed. Keep the already published art namespace `lunarcrystal` while the unique balance ID is AA-14, avoiding redundant copies/remaps. Reuse the shared sprite selector and actual 2.9 m normalization/PI yaw, with per-character rear/front mount overrides. Results poses retain their approved filenames and hashes. Local integration tests and offline mounts do not close publication, live visual or production gates.

## ADR-102 — exact Lunarcrystal kart direct-upload exception — 2026-10-02

Manny explicitly directed: “You shouldn't use LFS -- it never works. Use the workflow you've executed in the past.” This supersedes the earlier LFS publication plan for the three approved Moonlit Carriage runtime GLBs only. Use the connected GitHub binary blob API with unchanged approved bytes, matching the successful direct-upload route recorded by ADR-095. Add only their exact paths as normal-Git exceptions in `.gitattributes`; no wildcard policy change. Preserve the approved SHA-256 inventory in `docs/evidence/2026-10-02-lunarcrystal-kart/approved-kart.json` and verify remote Git blob IDs and byte counts before handoff. Other models/audio retain existing governance.

Bridge run `37018057458` built LOD0 but failed the approved-byte hash assertion before any upload. Its dependencies installed successfully; hosted regeneration is not proven byte-for-byte despite local reproducibility. Remove the temporary workflow and publish the original approved binaries directly; do not change geometry/hashes to match the runner. Review-branch publication and only preview merge/deployment are authorized; production integration and asset PR #237 remain unmerged pending separate acceptance.

## Lunarcrystal production release disposition — 2026-10-02

**Lunarcrystal / The Moonlit Carriage: LIVE ACCEPTED / DEPLOYED.** Manny approved the pinned gameplay review with “All good. Lunarcrystal approved!” and authorized merge/deployment to main. PR #238 merged the reviewed runtime `1051cd9c8c6b1ff7237dc605417b17869f4cea9b` at `798cbd1aea5c1707e6894d43ddd2d6c11aade1aa`. PR CI `37018571495` and post-merge CI/Pages `37022981830` passed. The production Pages artifact contains all fourteen approved Lunarcrystal PNGs and all three approved Moonlit Carriage GLBs; the exact-path ADR-102 direct-upload exception remains limited to those three GLBs. Asset-only PR #237 was not separately merged; GitHub closed it as merged because its head commit is an ancestor of #238’s runtime history. Preserve AA-14 Lunar Navigator Medium (6 / 7 / 4 / 8 / 5 / 6), page-two placement beside Archer, the eight-unique-racer format, approved sprite mappings, Candidate 1 geometry and the shared negative-Z visual convention. No gameplay, stats, roster ordering or other product requirement changed at release. Evidence: `docs/evidence/2026-10-02-lunarcrystal-production/production-delivery.json`.

## ADR-103 — Recreated bounded Circuit Alpha shadow polish — 2026-10-02

Manny authorized recreation after the original local commits could not be recovered. Keep the approved single 2048 shadow map, player-centered 144-unit light-space-snapped volume, bias -0.001/normal bias 0.2 and nearby 55m caster policy. Prioritize the player and nearby karts, then opaque projectiles, capped at twelve dynamic root objects (not submeshes). Exclude sprites, hidden/transparent/additive parts and color-bloom energy cores. Retain static scenery casters, dusk key/fill values, accepted materials, karts/art, physics, cameras, gameplay, HUD and audio. Low shadows stay off. Owned shadow teardown is once-only. This is a recreated implementation on accepted Lunarcrystal main, not recovery of the old SHA. Review branch publication and preview-only Pages promotion are already authorized; owner shadow visual acceptance and production runtime merge remain separate gates. Camera polish and final QA remain unfinished; diagnostics deferred and context-loss recovery waived. Evidence: `docs/evidence/2026-10-02-shadow-polish/`.

## ADR-103 production release disposition — 2026-10-02

**LIVE ACCEPTED / DEPLOYED.** Manny visually approved the pinned Circuit Alpha shadow-polish runtime `efbcc74f5c8103d2b6411c8bdedd35953b224f3f` and explicitly authorized merging PR #240 and publishing through GitHub Pages. Preview-publication reconciliation at `297ac6e66b833cf9535fd90b87e32d03f7054539` changed no `src/` or `public/` bytes relative to that accepted runtime. Exact-head PR CI `37066044882` passed; PR #240 merged with an expected-head lock at `168ba8113d37ad0672345a2326d20d279115c9d8`; post-merge CI/Pages `37066390953` passed validation and deployment. Preserve ADR-103's single 2048 map, 144-unit snapped volume, 55 m / 12-root dynamic-caster policy, Low-off behavior and exclusions. All prior accepted gameplay, roster/characters, visuals, audio, HUD/Results, bloom, motion blur and terrain materials remain closed. No PRD deviation. Camera polish remains a later bounded item; final diagnostics remain deferred and context-loss recovery remains waived. Evidence: `docs/evidence/2026-10-02-shadow-polish/production-delivery.json`.


## ADR-104 — Neon Grid Circuit 02 approved contract and no tokens — 2026-10-02

Manny approved the approximately 1,450 m Neon Grid course, sharp reversing Undercity hairpins, and a service tunnel bypassing all fuchsia hairpins. He authorized native implementation of the saved five-stage plan and explicitly omitted tokens on 2026-10-02. This amendment supersedes D-009’s single-circuit scope only: Circuit Alpha remains unchanged and selectable as circuit 01; Neon Grid is circuit 02. Retain eight unique racers, three validated laps, all accepted roster/stat/item tuning, visuals, audio, HUD and Results contracts.

The reviewed contract and coordinate authority are docs/design/neon-grid/BUILD-CONTRACT.md and layout.json. Main-road half-widths are 6/4.5/6 m with interpolated transitions; the underground service tunnel has its own 3.2 m half-width. Every shortcut rejoins at strictly higher main-route progress and physically crosses all common-road gates; mapped progress awards no checkpoint. Gate elevation tolerance is 1.5 m for Neon Grid while legacy Alpha defaults remain unchanged. Billboard adds a static surface at 0.82 speed with asphalt acceleration and no off-road speed floor; its 6-second cycle freezes with race time. Dive landing/miss behavior remains physical, with approximately 1.5-second recovery penalty before the downstream gate.

Normal-route lap target is 62–68 seconds, subject to actual driving evidence. Full-hairpin tunnel savings must be measured and supersede the former 1.0–1.4-second target. Compare paired same-driver shortcut runs; do not weaken the approved hairpins or add a hidden speed cap to fit old targets. Tokens and collection counters are excluded. Use unique Neon Grid race/final-lap audio filenames without replacing accepted music. Route identity persists through selection, restart, replay, minimap and Results. Assets/audio retain separate approval gates. Publish pinned GitHub Pages previews at the plan’s owner review checkpoints. No production merge/deployment is authorized until visual acceptance and explicit release direction.

This is a reviewed design contract, not evidence of runtime collision, physics, race, timing or device performance acceptance. Slice 6 remains active; diagnostics remain deferred and context-loss recovery remains waived.


## Neon Grid bounded repair under ADR-104 — 2026-10-03

Manny explicitly authorized the rough-driving diagnosis repair scope. Keep exact 3D projection/elevation with a static segment BVH and bounded exact-coordinate cache; caller-owned vector copies prevent cache mutation. Do not rely on rounded positions or stale racer-progress hints. Track/path topology changes must reconstruct/invalidate the index/cache.

Use one kart barrier authority on Neon: the existing Alpha scripted radius/retention/restitution/cooldown response, with native elevated road support and visible walls retained. Remove Neon's additional native wall meshes from kart collision. Footprint evidence confirms the reported large native impulse is valid leading-corner contact; do not describe it as proven defective geometry. This adopts Alpha's accepted barrier envelope without changing kart bodies, tuning, controls, camera, widths, shape or Alpha runtime. Future shortcut/tunnel colliders must not reintroduce competing kart impulses. Legitimate head-on impacts may still slow strongly; phone smoothness remains an owner gate.

Neon map uses +Z-down as the approved drawing; Alpha retains its existing +Z-up. Road and racer portraits share the same oriented sample transform. No new HUD/art/heading assets. CPU and collision comparisons and limits are in docs/evidence/2026-10-03-neon-repair/README.md. PR #242 stays draft/unmerged; only a pinned preview-only Pages republish is authorized after hosted checks. Stage 3, tokens/scenery and production remain outside this repair. No material PRD change.


## Neon Grid road-support orientation correction under ADR-104 — 2026-10-03

Manny authorized continuing the unresolved track driving repair from 3d56e74. Real Rapier probes isolate displacement cancellation on the upward-wound thin road ribbon despite steady velocity; ORIENTED (8), added to FIX_INTERNAL_EDGES (144), removes the flat-road contact artifact. Explicitly declare the existing ribbon's upward support orientation while retaining internal-edge correction. This changes collider contact interpretation, not geometry, kart/roster/stat/item tuning, controls, camera, scripted boundary authority or accepted Alpha. The ribbon is top support, not a solid underside; future tunnel/jump surfaces must declare their own orientation and boundaries. No additional road plane or interpolation/teleport/speed-limit workaround. Evidence/limits: docs/evidence/2026-10-03-neon-road-contact/README.md. Publish only a validated pinned preview; PR #242 remains draft/unmerged and production requires owner acceptance/release authorization. Main-route phone smoothness remains unresolved pending retest; Stage 3/Dive/scenery stay paused. No material PRD change.

## Residual Neon diagnosis handoff and checkpoint cadence — 2026-10-03

Manny directed saving the agreed plan for a new session and repo updates/status reporting between every step to protect continuity through disconnections. Record a pushed checkpoint after each numbered substep, plus intermediate evidence on extended runs; remote verification and a report precede further work. Next session starts catch-up and diagnosis; Step 4 checkpoints measured findings and pauses for Manny before corrective implementation. Explicitly trace driveSupported and every recovery/respawn as well as staged controller/physics/barrier effects. Muse's deletion clusters remain a leading hypothesis, not confirmed uncovered support or a proven initiator. Preserve ORIENTED, course shape/hairpins/elevations/widths/tuning/Alpha; repair, preview and production gates remain separate. Plan and ledger are linked in IMPLEMENTATION-STATUS. This planning checkpoint changes documentation only; no new product/PRD requirement or runtime repair is introduced.

## Residual Neon diagnosis review gate — 2026-10-03

Manny authorized diagnosis through Step 4 with pushed/reportable checkpoints. Controlled native and production-stage evidence identifies the folded climbing ribbon's steep retained face as the launch/speed-loss initiator, followed by support loss and possible separate scripted boundary slowdown; sampled interior support is present. Exact attribution to original footage remains inference because input/contact telemetry is unavailable. Evidence: `docs/evidence/2026-10-03-neon-road-contact/diagnosis.md`. This records diagnosis and a proposed `NeonGridGeometry.ts`-only topology repair, **not** approval or implementation of that repair. Preserve ORIENTED/internal-edge handling, centerline/width/elevations/sharp bend, tuning, visible/collider agreement and Alpha. No runtime change, preview pin, PRD amendment, Step 5 or production authorization. Stop at the pushed Step-4 checkpoint for Manny's review.


### Residual Neon Step4 repair-scope approval — 2026-10-03

Manny approved the recorded diagnosis and bounded NeonGridGeometry.ts-only correction proposal, directing “Approved. Start 5.1.” First execute/report the independent failing regression checkpoint; retain shared visible/native support, authored centerline/width/elevations/sharp bend, ORIENTED|FIX_INTERNAL_EDGES, existing controller/barrier authority and accepted Alpha. No additional runtime-file scope, gameplay tuning, new preview publication, production release or Stage3 authority. Step5.1 preserves RED evidence outside the passing suite; no corrective runtime patch yet. Evidence and per-substep gates: docs/evidence/2026-10-03-neon-road-contact/execution-progress.md and approved residual repair plan.


## Residual Neon local triangulation under ADR-104 — 2026-10-03

Manny selected the 5.2 local-grade candidate and authorized 5.3 within NeonGridGeometry.ts only, lifting the strategy pause. Keep its localized inside-edge elevation anchors and replace unconstrained contour ears with a triangulation minimizing maximum face grade across valid internal diagonals, preserving all authored centerline edges/heights and polygon boundary segments. Evaluate actual Float32 support geometry. No broad interpolation, dense inner cells, deleted-face restoration, controller/barrier/collider/tuning/layout/asset/workflow changes or launch feature. All patched faces must fit the measured surrounding-original slope envelope, while unchanged focused assertions and native matrix loss≤1.83m/s/zeroair remain binding. Evidence: residual repair-5.3.md. Full gates pass; stop for Paprika independent verification before preview. Preview/release/Stage3 remain separately gated; no material PRD amendment.


## Approved Neon Task 5 execution rulings — 2026-10-03

Manny approved Service Tunnel after the residual 5.3 owner pass. Retain exact authored endpoints and x/z chord with 7 m level aprons/eased ramps to y=-4 m; realized length89.058140 m is measured, not the provisional polyline or obsolete saving target. Render/native floor and roof share Float32 support; scripted Alpha-style walls remain sole kart boundary authority. Racer-owned legal traversal is distinct from exact main projection and stateless physical support/item projection. Local camera ceiling and tunnel/street contact separation resolve overlapping floors while preserving Alpha defaults and approved item/vehicle tuning. Eight paired native AI runs save16.68–17.90 s, which awaits human balance acceptance. No PRD deviation, new scenery/audio, Billboard/Dive or production authority is introduced. Independent review Important findings were fixed once; Minor2m exit wall presentation mismatch is deferred to Stage4. Publish only a validated pinned owner preview, then stop for tunnel feedback; PR242 stays draft/unmerged. Evidence: docs/evidence/2026-10-03-neon-tunnel/.


## Bounded Task5 wall-junction correction — 2026-10-03

Manny reported entrance/exit wall mismatch and fullPASS for everything else, then authorized only its correction, validation and replacement pinned Pages preview. This supersedes the Task5 Minor wall deferral above. Compute side-specific wall intersections with the joined main-road footprint and use those endpoints for tunnel containment. Clip partial main-wall cells to the tunnel edge; use10micron construction tolerance at exact3.2m edges. Match main lower/upper wall corners with6m render-only local height tapers. Keep all floor/roof/native support, authored geometry, widths, 7m traversal activation, gates/AI/Rocket/items/camera/tuning/Alpha and accepted gameplay intact. No material PRD change. Focused owner wall retest remains required; PR242 draft/unmerged, production and Billboard/Dive/Stage4 remain gated. Evidence: docs/evidence/2026-10-03-neon-tunnel/junction/repair.md.


## ADR-105 — Billboard timing/traversal checkpoint and visual stop gate — 2026-10-03

Manny approved Steps1–2 and explicitly required discussion before Step3 visuals. Follow the approved Billboard Gap design’s once-at-exit0.82 retention for an ON mouth crossing: latch authoritative race-time state at entry, keep asphalt controller cap/acceleration while on static, and apply planar retention exactly once at physical forward exit. OFF retains1; no minimum-speed floor. This reconciles older while-ON wording without a repeated tax. Physical directional mouth crossing selects the chord; mapped main progress earns no gate. Signed lanes cannot be rejected solely because nearest-main progress shifts relative to the logical centerline window. Reject main-sweeper movement even when its inner lane is closer to the plaza centerline. Use the existing planar retention helper so spinout/slide headings cannot bypass the tax.

Keep Billboard’s ordinary AI attempt rate0 pending measure-first joint rate review; its configurable fourth RacerTrack constructor argument supports real native tests and uses a separate seeded stream. Tunnel rate/RNG remain accepted. First-lap OFF phase selection and savings/entry-feel measurements remain pending, rather than altering6/4/2 or claiming unmeasured pack timing. Eight independent reference approaches are evidence only. No visual/character/art/audio execution or preview publication in this checkpoint; no production/PR242 merge, Dive or Stage4. Detailed rulings, review fixes, reproduction/evidence and STOP gate: docs/evidence/2026-10-03-neon-billboard/progress.md. No material PRD change; Task6 as a whole remains incomplete.

## ADR-106 — Approved Billboard sponsors and direct asset delivery — 2026-10-03

Manny approved Paprika’s Pathfinder / FOLLOW YOUR CURIOSITY. (OFF), Second Life Cybernetics / STILL GOT MORE. (ArinON), Raven’s Afterglow / BOTTLED TROUBLE. (RavenON), each individual reference-guided prompt/artwork and a common16:9 billboard. He then authorized asset preparation and Step3 visual integration. Paprika is the supplied cloaked upright fox identity, not the unclothed companion depiction initially proposed and corrected. Arin’s wider first image is superseded by the approved16:9composition. No playable roster/profile changes.

Manny’s explicit instruction after the delivery discussion is to use directupload rather thanLFS for these ads. Exact `.gitattributes` exceptions: public/assets/track/neon-grid/billboard/{paprika,arin,raven}-v1.webp. Approved2048×1152derivative hashes: docs/evidence/2026-10-03-neon-billboard/visual-assets.json. Other track/character sources remain governed by existing policy. Build must reject wrong hashes/dimensions/missing ads.

Approved visuals keep subtle road visibility; same physical mouth and race clock govern gameplay/advertisements, PaprikaOFF/ArinRavenON,0.8sstateglitch, bounded0.55scrossing shards. No sound. Renderedwallopenings affect onlyvisibleplazajoins; exactmainfloor and acceptedtunnel remain unchanged. Hidden Neon clock drops hidden/resume intervals; Alpha timing remains unchanged. No Step4balance/Dive/Stage4/production scope. Pinned owner preview and live delivery verification follow engineering validation.

### ADR-106 Task 9 Skyline direct-delivery addendum — 2026-10-07

For T9.2, Manny approved the plan's narrow normal-Git delivery exception for the two already owner-approved fixed 1024×512 Skyline masking derivatives: `public/assets/track/neon-grid/signage/manaconda-racing-v1.webp` and `public/assets/track/neon-grid/signage/taco-bell-live-mas-v1.webp`. Runtime bytes must exactly match the preserved review derivatives and are hash/dimension gated by `tools/verify-task9-skyline-assets.mjs`. This extends ADR-106's direct-delivery mechanism only to these two named files and does not relax the default LFS policy for other track PNG/WebP assets. The ads remain static ordinary city grammar with no Billboard ON/OFF, flicker, route, arrow, chevron, balance or gameplay semantics.

## ADR-107 — Approved curved wall-side Billboard relocation — 2026-10-04 UTC

Manny approved the early-descent curved bypass and wall-side ad after rejecting the first preview's obstructive placement. Entry0.101–0.106/rejoin0.215, width8m, cubic18m tangent handles, mouth19m; gate2=0.087/gate3=0.222 exactly, about10.1m rejoin clearance explicitly accepted. The12m prototype folded the inside offset; native regression requires18m. Allframevertices remainoutside maincorridor; approved16:9ads display8×4.5m unchanged. Use real curved support/projection/open index, delayed20m AIsteering, commitment tophysicalmouth and pavedjunctionasphalt withoutprematureownership. No maincurve/tunnel/controller/stat/item changes or progress-awarded gates. Real paired native18runs zero contacts/gatesordered; OFFsaving0.483–0.633s/ON0.450–0.600s are sectionevidence only. First-lapOFF, meaningfulONOFFbalance/finaljointrates and ownerdevicefeel remain open. PR242draft/unmerged; publish only isolated pinned replacementreview. NoLFS operations. Full rulings/evidence: docs/evidence/2026-10-03-neon-billboard/relocation-review.md. No Task7runtime or Stage4 authority.


## Bounded Billboard exit support correction — 2026-10-04

Manny reports an exit symptom like the earlier solved track issue and authorizes comparing and applying known successful remedies. Native isolation identifies conflicting overlapping main/plaza support. Preserve ORIENTED/internal-edge handling, controller/barrier/tuning, main mesh, accepted tunnel and approved artwork. Replace only the local plaza exit with a polygon terminating at the exact unchanged main Float32 boundary, grade its edges from the unchanged approach, and reuse the proven constrained minimax triangulator. Its extraction preserves the entire accepted main mesh byte-for-byte. Align the subtle inlay to shared rendered/native support. The route curve, endpoints, gates, clock and once-only0.82tax remain unchanged. Tests that previously demanded a second overlapping deck now test actual shared native/render support while retaining original isolated prejoin checks. Fullvalidation122files/958tests PASS; replacement isolated preview and owner exit retest remain required. Remainder review is preserved; Step4balance/production/PR242merge/Dive/Stage4 remain gated. Details and measured limits: docs/evidence/2026-10-04-neon-billboard-exit/repair.md.

## Task 7 Waterfall Dive implementation — 2026-10-04

Implement the approved waterfall-dive-design.md without reopening its five decisions. Add only native/render support outside the existing main floor, derive joins from its actual mesh boundary, and reuse the existing ramp/controller authority. Retain all repaired climbing faces and ORIENTED/internal-edge handling. Racer-owned flight/splash state delays miss recovery by1.5 race seconds, consumes it once, and uses existing cleanup before gate9 without granting checkpoints. Rocket follows an already-selected legal route. Default AI dive rate remains0 pending the separately requested joint balance/rates work; a separate seeded configurable rate exists for native verification. No tokens, audio/assets, controller/stat tuning, main curve/gate changes, or production authority. The new runtime side branch leaves PR242 unchanged. Native section timings are measurements, not a target-driven tuning decision. Evidence and exact limitations: docs/evidence/2026-10-04-neon-dive/progress.md.

## Task 7 owner-approved ramp waterfall visual revision — 2026-10-04

Manny rejects fbff249's detached cyan column and approves the ramp itself as the waterfall spillway: a waterway arrives from the track's left, feeds onto the ramp, and pours from its actual lip into the pool. Procedural source/channel retaining geometry, water matched to actual ramp vertices, lip-matched falling sheet, foam/streak shaders, soft mist and pool ripples replace the weak block presentation. Retain gold tell/landing readability, existing shared race-time animation and splash events. No new binary assets, reflection/refraction render passes, lights, physics/controller/stat/item/AI-rate/recovery changes or repaired5.3 face changes. PRD draw-call ceiling250 remains binding; real WebGL must validate before pinned isolated preview publication. Owner visual/playtest acceptance remains separate.


## Task 7 approved ramp-as-waterfall visual revision — 2026-10-04 America/Chicago

Manny approved the supported waterway entering from the driver's left and flowing across the unchanged ramp into a continuous cascade bonded to the actual launch lip. Use procedural water, foam, low mist and pool ripples with no new binary runtime assets. Preserve gameplay/physics/stats/items, repaired 5.3 faces, gold launch tell, landing marker and the <=250 draw-call budget. This is a bounded Task 7 visual revision. Published isolated runtime b49d987 replaces rejected fbff249; no production gameplay integration or Stage 4 acceptance. Automated validation, residual matrix and bounded hosted rendering passed; owner visual retest remains pending. Delivery and limitations are recorded in docs/evidence/2026-10-04-waterfall-spillway/publication.md.


## Owner visual approval — 2026-10-04 America/Chicago

Manny approved the published waterfall spillway preview on 2026-10-04 at 20:05 America/Chicago with “Approved”. Approval applies to the revised waterfall presentation at runtime b49d9876f8c6ce87956f8b91675c3c8180e56b55: the left waterway, water flowing over the ramp, and cascade from its launch lip into the pool. This closes the visual retest gate for this bounded Task 7 revision. It does not independently establish gameplay balance, final AI rates, device performance or authorize production integration or Stage 4.

The earlier pending-owner-retest statements are historical and superseded for this visual revision only. Engineering and delivery evidence remains unchanged. Approval recorded on feature/neon-grid-waterfall-dive; production unchanged.

## Neon Grid joint shortcut balance decision — 2026-10-05

Manny approved the joint defaults Tunnel 5% / Billboard 45% / Dive 12%, Billboard race-time phase offset +3.6 s, one modest standard boost pad after Billboard commitment and before rejoin, and unchanged forgiving 1.5 s Dive splash recovery. Billboard ON/static remains a once-only 0.82 exit retention.

Runtime candidate `c71b2287b463f6a17645d664d3307d6b591561bf` places the pad at Billboard path fraction 0.93 and passed hosted full validation in CI `37352477495`. Real paired native sections measured OFF saving 0.517–0.650 s (mean 0.569), ON saving 0.500–0.633 s (mean 0.536), and ON/OFF separation 0.017–0.050 s (mean 0.033). The approved 0.8–1.0 s OFF and 0.25–0.4 s tell-separation targets are not met. Per owner direction, do not alter 0.82 without a new decision. Publish only the measured isolated candidate and stop for owner playtest.

## ADR-108 — Accept Billboard ON/OFF tell as flavor and move the boost to the committed entrance

- **Date:** 2026-10-05 (America/Chicago).
- **Status:** **APPROVED / IMPLEMENTED / VALIDATED.**
- **Authority:** Manny explicitly accepted the Billboard ON/OFF tell as flavor, directed no further separation chasing, kept the 0.82 ON multiplier unchanged, and directed the single existing boost pad to move from gap fraction 0.55 to just inside the shortcut entrance.
- **Decision:** Place the unchanged standard Billboard boost pad at gap fraction **0.16**, inside the approved 0.1–0.2 entrance band. Keep the existing pad half-length 3 m and half-width 3.5 m. The pad's leading edge must remain beyond the physical commitment distance so a main-line racer cannot trigger it. Treat paired timing only as a placement/function sanity check; no savings or tell-separation threshold governs this placement.
- **Preserved balance:** Keep the once-only **0.82 ON/static exit retention**, AI shortcut rates **5% / 45% / 12%** for Tunnel/Billboard/Dive, **+3.6 s** Billboard phase offset, and the forgiving approximately **1.5 s** Dive recovery unchanged.
- **Preserved boundaries:** No kart statistics, global physics, item behavior, Tunnel/Dive geometry, repaired 5.3 faces, or Stage 4 work is authorized. This decision supersedes only amendment 2.23's active tell-separation target and prior boost-pad placement checkpoint.
- **Validation:** Runtime `406bb5c2f606c2db4d1f2fa9ee7e36e1d6217308`; CI `37361803233` passed. Evidence: `docs/evidence/2026-10-05-neon-billboard-balance/`.


## ADR-109 — Adopt the validated 300 m Neon Grid far-plane clamp as a temporary production policy

- **Date:** 2026-10-06 (America/Chicago).
- **Status:** **APPROVED FOR PRODUCTION ADOPTION.**
- **Authority:** Manny explicitly approved the 300 m Neon Grid clamp for production after passing the locked owner review.
- **Decision:** Use a 300 m race-camera far plane for Neon Grid only. Circuit Alpha remains unchanged.
- **Evidence:** The one-variable stopgap candidate reduced software-render median frame time from 286.3 ms to 170.5 ms and increased median FPS from 3.49 to 5.87. Manny then passed clipping/horizon review and, after the wet-road/2D-driver compositing repair, passed the corrected preview.
- **Visual gate:** PASSED. The owner reported “Clipping passes” and later “This fix is passed.”
- **Boundary:** This is a temporary mitigation, not the shared render-workload architecture and not a future-minigame default. It must retain the render-governance removal/re-evaluation condition at Neon Grid Phase V2.
- **Preserved behavior:** no physics, AI, checkpoints, shortcut geometry/balance, items, materials, fog, bloom or Circuit Alpha camera change is authorized by this decision.
- **Deployment state:** approved for production adoption; actual runtime deployment and verification are separate implementation evidence and must not be claimed until merged and published.

## Task 9 owner approval and 2D asset gate — 2026-10-06

Manny approved `docs/design/neon-grid/task9-coursewide-visual-plan.md` for execution. Task 9 remains presentation-only under the recorded scope boundaries.

Any new 2D billboard/ad/sign asset is owner-gated individually: generate and present **one asset at a time**, state its intended in-game use, and obtain explicit approval before runtime integration or asset-manifest registration. Unapproved candidates stay review-only.


## ADR-111 — Bidirectional shortcut access and rejected T9.2 visual correction — 2026-10-07

- **Status:** APPROVED / correction in progress.
- **Authority:** Manny's owner review of the pinned T9.2 preview rejected the first Skyline presentation as final and explicitly directed removal of shortcut wrong-direction blockades.
- **Traversal decision:** Billboard Gap, Service Tunnel and Waterfall Dive are physically approachable from either end. Reverse travel remains wrong-way and cannot award reverse/skipped checkpoints or laps. AI keeps its accepted forward-only shortcut choice policy and existing 5% / 45% / 12% rates. Billboard ON/OFF timing, +3.6 s phase, committed entrance boost and once-only 0.82 forward exit retention remain unchanged. Waterfall Dive reverse entry must not trigger the forward splash/recovery state merely because the kart entered from the landing side.
- **T9.2 visual correction:** replace the amateur box-slab Skyline treatment with bounded stepped procedural masses and multi-face emissive detail; mount the approved Manaconda Racing and Taco Bell / Live Más ads and ordinary masking signage on architecture; enforce drivable-route clearance for city/signage placement; conform Skyline/Falls presentation road passes to the accepted dense main ribbon; make the Falls night sky camera-relative so no world-space sphere boundary can enter the course view.
- **Preserved contracts:** no main-curve, checkpoint-order, kart-stat, global-physics, item, audio, AI-rate, Billboard balance, Tunnel support, Dive support, repaired 5.3 face, culling/LOD or T9.3 Undercity presentation change.
- **Delivery gate:** preserve rejected pinned preview source `bef603649eeb7a5bd1c767aa4b53da0ac3583f9e` as historical evidence; publish a distinct replacement T9.2 preview after full validation and stop for owner review.
- **Numbering:** ADR-110 remains reserved for the separately approved cross-minigame render-workload governance decision.

## T9.5 visual-enhancement scope approval — 2026-10-07 America/Chicago

Manny approved the revised T9.5 plan, expanding the original full-course lifecycle/masking pass to permit bounded **proactive visual enhancements**, not merely defect repair. Approved examples are building-attached industrial ventilation in the Undercity and pylon-attached deck cap/downlight detailing in Falls Run outside the accepted Task 8 range. The additions must remain presentation-only, locally owned, procedurally batched, physically supported, measurable under the Task 9 structural budgets and reviewed in an isolated pinned owner preview. New 2D artwork remains one-at-a-time owner-gated. The two specific T9.2 Skyline building mass/city-base issues remain strictly deferred to T9.7; T9.6 retains hardware FPS/p95 certification. No PR #242 merge or gameplay deployment is authorized.

## T9.5 owner camouflage correction and contingent draw-call authority — 2026-10-07 America/Chicago

Manny confirmed the T9.5 original preview deployed, but explicitly rejected shortcut camouflage: the Billboard Gap, Service Tunnel and Waterfall Dive entrances remained too obvious. Correct the original T9.5 task instead of advancing T9.6. Add physically supported, non-colliding, pre-approved-art and procedural visual masking at the **actual** entrances; preserve their unique existing tells, path geometry and all prior acceptance. The earlier render fixture captured the wrong shortcut positions and must be retargeted to entrance/mouth views before owner retest.

Manny also gave **conditional approval** to raise the existing T9.4/Falls-extension incremental render-call ceiling from +12 to +15 **if necessary for camouflage**. This is not an instruction to increase it automatically; prefer the approved +12 limit, document exact A/B measurements and only amend PRD and tests if a +12-safe design cannot meet the visual correction. Global Task 9 engineering ceiling (200 calls / 300k visible triangles), Task 8 frozen 0.70–0.85 appearance/geometry, T9.7 deferred Skyline polish, no new unreviewed 2D asset, and owner/production gates remain in force. Owner review status is CORRECTIONS REQUIRED / NOT APPROVED until the new pinned preview is visually accepted.

## T9.5 owner visual/playability acceptance — 2026-10-08 America/Chicago

Manny replied **“Approved”** to the verified, immutable corrected T9.5 gameplay preview at https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4 (exact source `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`). This explicit approval closes the previously rejected Billboard lead-up artwork and Service Tunnel warning/portal/camera camouflage review **for T9.5**. The earlier screenshot-based rejection and remediation history remain in the evidence ledger. Structural CI [37826321830](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830) and isolated publication [37857511926](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857511926) were already successful; no new physical/gameplay/asset work is authorized or required by this decision record.

**Scope boundary:** owner approval is **not** approval of T9.6 hardware FPS/p95 performance certification, T9.7 deferred Skyline building/city-ground polish, PR #242 draft runtime merge or Neon Grid gameplay production publication. Keep PRD v1.1/amendment 2.25 and the existing draw-call ceilings unchanged. The next action is T9.6 plan/gate review and separate owner authorization; no roadmap reordering.

## T9.6 diagnostic methodology (technical implementation, 2026-10-08)

Within the separately owner-approved T9.6 performance/readiness step, the implementation reuses the existing race-owned frame recorder and its opt-in `?testRacePerf=1` panel rather than adding a parallel benchmark subsystem. Preserve per-frame timestamps and scene counters, and export actual selected track and graphics quality with optional WebGL renderer identity. The separate offline auditor independently recomputes metrics from original samples and requires immutable source provenance, full Neon Grid three-lap / eight-racer Medium 1920×1080 effective-resolution evidence, documented real hardware and three repeated runs. Software-rendered GitHub Actions values remain structural/diagnostic only. A candidate analyzer pass cannot attest the physical device; hardware verification is separate.

This is a reversible engineering/evidence implementation within the approved Task 9 plan, not a change to any PRD threshold or authorization for culling/LOD, visual sacrifice, T9.7, production runtime PR #242 merge or Neon Grid deployment. Source artifact `t9-5-render-check.json` showed 206 calls only at waterfall-dive-rear; keep the Task 9 200-call target as an unresolved measurement and do not copy T9.5's exception into T9.6.


## T9.6 owner-adjusted engineering headroom — 2026-10-08

**Approved:** Manny directed that draw-call and triangle engineering limits be raised rather than strip accepted visuals, citing hundreds of Neon Grid playtests without perceived performance issues. T9.6 / future Task 9 diagnostics now use **≤220 draw calls and ≤350,000 visible triangles**. This revises the Task 9 *internal engineering budgets* only. Prior T9.5 historical pass/fail evidence remains recorded under its then-effective 200 optimization goal and 220 full-course blocking ceiling; per-sector A/B contracts remain unchanged. PRD v1.1 hard scene caps **≤250 calls and ≤750,000 triangles** and G-05 hardware median ≥60 FPS / p95 ≤18.3 ms / no sustained >50ms stutter remain untouched, so no base-PRD/DOCX revision is needed.

**Why:** The real mobile diagnostic screenshot records max 206 calls / 317,908 triangles, p95 16.8 ms, 59.9 displayed median FPS, max stall 216.8ms and longest >50ms run of one across 9,559 scored frames. Those counts pass the revised *engineering* budgets; the screenshot is not raw JSON or a representative 1920×1080 desktop benchmark. The owner's repeated at-speed playability acceptance is retained as qualitative evidence. Existing T9.6 analyzer must report engineering overruns and still hard-fail the original PRD thresholds. Do not infer an overall hardware PASS, silently round 59.9 up, waive a missing original capture, advance T9.7 or merge draft runtime PR #242 based solely on the new numerical targets.


## T9.7 expanded final-visual-scope proposal logged — 2026-10-08

**State: PROPOSED / NOT YET AN APPROVED PRODUCT DECISION.** Manny asked whether final Neon Grid polish should include bloom and textures and subsequently instructed this **plan to be recorded**. The proposed execution scope adds **Neon Grid-local selective bloom, emissive/lighting balance, existing texture/material polish, and full-course visual consistency** to the already-deferred T9.7 **Skyline stepped-building and grounded-city-base work**, followed by source-pinned owner preview and explicit T9.8 STOP. Complete six-step proposal and acceptance requirements: [T9.7 Final Visual Polish Plan](design/neon-grid/t9-7-final-visual-polish-plan-2026-10-08.md). Recording it does **not** authorize changes to runtime or amend the PRD. Existing Task 9 non-goal prohibiting *new texture assets* stays effective; new binary art and unapproved 2D assets require separate owner approval even if the expanded proposal is later approved. No global bloom/render-policy or Circuit Alpha changes, T9.7 runtime work, #242 merge or production release are approved by this entry.


## T9.7 execution approval and global 500-call budget — 2026-10-09

Manny explicitly directed **“Go ahead and execute T9.7.”** This approves the bounded expanded scope in the linked [T9.7 plan](design/neon-grid/t9-7-final-visual-polish-plan-2026-10-08.md): procedural Skyline roof/foundation work, existing-material and local selective-bloom audit, full-course validation and a pinned owner-preview gate. New binary texture maps, unapproved 2D artwork, a global renderer rewrite, PR #242 merge and production release remain outside this approval. Preserve the accepted Task 8 Falls Run appearance.

Manny then directed that the PRD hard draw-call cap move to **500 for all race scenes, including Circuit Alpha**, and that forward-looking Task 9 use the same **500-call engineering target**. This supersedes the prior 250-call PRD cap and 220-call Task 9 engineering target. The **350,000 Task 9 / 750,000 PRD visible-triangle limits** and all G-05 hardware frame-time/FPS requirements remain unchanged. This is a call-budget amendment only; it does not certify T9.6 or grant performance/visual acceptance. Historical measurements and already-completed decisions retain their original thresholds.


## T9.7 sector A/B draw-call budget amendment — 2026-10-09

Manny approved amending the active T9.7 per-sector incremental draw-call ceilings to **Skyline +36**, **Undercity +30**, and **Falls Run extension +28**; see [PRD amendment 2.27](PRD.md). The preceding local A/B captures measured +36, +30, and +24 on the stable Falls recheck (+28 on the first unstable Falls sample). Investigation attributed the extra render work to the selective-bloom mask pass, which preserves depth/alpha occlusion. The revised ceilings permit these measured T9.7 additions while retaining the 500-call global scene cap. Do not modify shared `RaceBloom` behavior under this decision. The 350,000 Task 9 / 750,000 PRD triangle ceilings and G-05 representative-hardware requirements are unchanged; this budget approval is not hardware certification or owner visual acceptance. Historical captures retain their original pass/fail classification.

## Task 9 engineering triangle ceiling update — 2026-10-09

Manny approved raising the forward-looking Task 9 engineering visible-triangle ceiling to **425,000**, superseding the prior 350,000 internal limit. The PRD hard cap remains **750,000** for all race scenes. The 500-call scene cap, T9.7 sector call deltas (+36 Skyline / +30 Undercity / +28 Falls extension), G-05 FPS/frame-time requirements, and the requirement to inspect a source-pinned owner preview remain unchanged. Historical measurements preserve their original thresholds. This adjustment does not certify hardware performance or grant visual acceptance, PR #242 merge approval, or production release.


## Owner-approved T9.7 background-city correction — 2026-10-09

After reviewing the T9.7 preview, Manny identified that the background lacked a city-like ground and that the generic buildings around the waterfall remained box-shaped. He requested the plan first and explicitly approved the bounded correction. Add grade-following terraced ground beneath the Skyline city and into the Falls backdrop; give the existing Falls towers stepped massing and foundations that meet or overlap the ground. The work is presentation-only and does not add collision or change routes, elevations, shortcut geometry, waterfall/mist, rails, signs/tells, driver/camera behavior, or existing entity counts and budgets. This is a narrow exception to the previously frozen Task 8 range for **background city ground and tower massing only**. All other Task 8 visuals and gameplay remain accepted and protected. The new preview must be inspected by Manny; this implementation approval does not approve PR #242 merge or production release.
