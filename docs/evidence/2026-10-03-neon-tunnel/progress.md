# Neon Grid Task 5 — Service Tunnel execution

## Authorization and baseline

Manny approved Stage 3 Task 5 on 2026-10-03 after the residual 5.3 owner PASS at b1169af90123ff512b2731464cbb01724a65f145. Scope: Service Tunnel bypassing all fuchsia hairpins, persistent racer-owned traversal, physical gate order, AI/Rocket path use, paired time measurements, and a pinned GitHub Pages owner preview. Billboard, Dive, city polish, new audio and production/runtime merge remain outside this increment. PR #242 stays draft/unmerged.

Repository catch-up confirmed PRD v1.1 and approved amendments, active Slice 6, runtime b1169af, pinned accepted runtime 9459bf0, preview-only PR #248 merged, and recorded runtime/publication/Pages CI successes. Fresh baseline suite: 111 files / 850 tests PASS; git lfs fsck PASS. Read AGENTS and required governance, approved Neon plan, build contract and layout; mapped race, AI, Rocket, native support, scripted boundary, surface sampler and recovery consumers.

## 5.1 — Working evidence saved

Development is local and not published as runtime by this documentation checkpoint. Traversal no-op behavior failed 3/4 assertions before implementation; new tunnel floor/scene checks failed 2/2 before integration; navigation checks failed 2/2 before selected-path AI/Rocket integration. Native physical three-lap runs then exposed a committed AI choice surviving a physical tunnel exit and steering back toward the entrance. A separate rejoin regression failed before clearing that commitment. Further physical validation is in progress; no Task 5 completion, device or owner pass is claimed.

Ruling: retain exact entry/rejoin progress and the straight x/z chord, but use level approximately 7 m junction aprons and eased ramps to the y=-4 m straight. The design's polyline was explicitly provisional curved/collided geometry. This prevents a road-edge step; it costs a slightly different realized tunnel length/time and must be measured before acceptance. Main centerline and the accepted climbing repair remain intact.

Ruling: scripted Alpha-style boundaries remain the sole kart wall authority; tunnel roof/floor use native support with declared orientation. Do not introduce a second native wall impulse. The underground straight is covered; entry/exit ramps are open approaches. Verify body clearance and junction continuity physically before review.

Next: complete physical gate-order/AI/Rocket/junction/containment checks and paired measurements, full validation and fresh independent review. Push verified runtime checkpoint, then publish authorized pinned preview and stop for owner tunnel feedback. No production release.

## 5.2–5.4 — Implementation and native validation complete

Per-racer traversal retains physical forward entry through pause/partial reversal, releases at physical rejoin, and resets on recovery/disposal. Arc-length progress is monotonic in the authored skipped interval and awards no checkpoint. Main projection remains exact; stateless physical surface queries are a separate item/support concern. AI makes seeded eligible choices (default 35%) before entry and follows its selected path; Rocket follows the selected path and cannot make a new shortcut choice while active. Main geometry and accepted climbing triangulation are retained, with only junction wall apertures.

Shared Float32 render/native tunnel floor and downward-oriented roof pass 89 longitudinal samples × three lanes; three real controller lanes cross entry/exit ramps with clearance >0.2 m, no roof contact and native speed loss <1.83 m/s. Three character profiles complete three physical ordered laps through the tunnel without recovery or unsupported steps. Player/Rocket, pause, earned gates, recovery and disposal use actual runtime integration checks. Independent review findings and the single regression/fix pass are in review.md.

Ruling: preserve the exact main route and Alpha defaults while supplying local underground camera elevation/ceiling and physical-layer contact filtering for tunnel/street overlap. These are path integration requirements, not item radius/probability, vehicle tuning or global collision changes. Native tunnel walls remain absent; scripted kart containment is sole authority. No new assets/audio or further shortcut work.

Full `npm run validate`: PASS, 116 files / 876 tests; statement/branch/function/line coverage 91.47/82.45/92.27/93.60 percent. Typecheck, zero-warning lint, asset inventories and production build PASS. `git diff --check` and `git lfs fsck` PASS. Existing Vite chunk-size warning remains. Software native evidence does not certify whole-frame/GPU/device behavior or owner gameplay.

## Paired measurements and limits

`node tools/diagnostics/neon-tunnel.mjs` uses real Rapier at 1/60 s, eight character/profile pairs, identical per-pair settings/spawn/seed, and only eligible attempt rate 0 vs 1. Physical gates remain 1→11→0; no progress/transform shortcut award or recovery is used. Main length 1448.938445 m; realized tunnel 89.058140 m. Savings range 16.6833–17.9000 s; main AI laps 77.03–79.62 s and tunnel AI laps 59.47–61.90 s. These AI measurements do not certify the human clean-lap duration or gameplay balance. The obsolete 1.0–1.4 s target is not reinstated and the full hairpin bypass is not shortened.

An extra profile-0 wall-scrub run holds throttle=1, steering=1 after physical entry: 852 scripted boundary contacts, 9680 tunnel steps and no finished lap in the 180 s window, losing the time advantage without recovery. This is a controlled penalty illustration, not a distribution of human mistakes. Complete-input SHA256, sampled input traces, physical gate times and reproducible methodology are archived in paired-measurements.json. No rivals/items are included in the paired timing probe.

## Publication and owner gate

Implementation is ready for a validated source checkpoint and preview-only Pages workflow. Exact hosted runtime CI, source pin and public delivery must be recorded before claiming the preview live. PR #242 stays draft/unmerged. Stop after preview delivery for owner's entry, tunnel, exit, reverse/partial reversal, walls, chase/rear camera, items and repeated-lap review on desktop/mobile. Billboard/Dive/Stage 4 and production runtime merge/release await separate approval.

## 5.5 — Pinned preview delivered; stop for owner

Runtime source checkpoint `0f1922845e70e82055f4327fc89c022d51a6b4d6` was pushed. PR242 could not start hosted CI because its status documentation conflicted with preview-only main; reconciliation `4367961d5e2471480d09ccee97cceb0223b258e0` keeps both status records and current preview workflow. `git diff 0f19228 4367961 -- src public tests tools` is empty. Exact-head runtime CI37148627462 passed (validate job111277631089,116files/876tests and all asset/build gates).

Workflow-only PR249 head `d4a518231853842f8eefcf7817218cfac5c94a9e` passed CI37148666225, then squash-merged at `96d5b5b52ff493a9d2a7f73590ea2bd346ef5043`. `git diff c3c2a04 96d5b5b --name-only` contains only `.github/workflows/ci.yml`; no runtime src/public entered main. Main CI/Pages37148818476 passed validate111278188330 and deploy111279341968. The existing allowed github-pages environment path was used; no environment rules changed.

Live owner preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-tunnel/?review=4367961 . Marker source is exactly `4367961d5e2471480d09ccee97cceb0223b258e0`. Expected hashes artifact11282179220 and verified artifact11282508948 prove HTTP200/byte-count/SHA256 for14files: four production bundles, five accepted residual5.3 files and five tunnel files. The workflow compares all production bytes to live before publication and after. Fresh independent HTTP refetch also passes all14files and both source markers; JSON evidence is saved alongside this note. Production and accepted5.3 delivery are preserved.

Final documentation/workflow reconciliation records delivery with unchanged runtime src/public/tests/tools relative to the pinned source; it does not imply a new owner pass. PR242 remains draft/unmerged. No Billboard, Dive, Stage4 or production runtime release has begun. Native local/hosted checks pass, but owner desktop/mobile gameplay and balance remain PENDING. Review entry/exit at the fuchsia-hairpin bypass, tunnel walls, chase/rear camera, items, reverse/partial reversal, recovery and repeated physical lap completion. After recording/fixing feedback, request separate authority before further shortcut/presentation/release work.

## Owner feedback checkpoint — 2026-10-03

Manny reports entrance/exit wall mismatch; otherwise everything else is a full pass. Preserve the remainder's owner acceptance. Task5 wall junctions remain open; previous Minor deferral is superseded by this owner issue. Source inspection confirms separate7m rendered/entry and9m opening definitions; exact entrance/contact reproduction remains next. Feedback-only checkpoint with unchanged runtime/pin/production; PR242 draft/unmerged. Full wording and bounded next scope: owner-playtest.md.
