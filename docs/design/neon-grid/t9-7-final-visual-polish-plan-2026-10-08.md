# Neon Grid Stage 4 T9.7 — Final Visual Polish & Owner Preview Plan

**Prepared:** 2026-10-08 (America/Chicago)  
**Status:** EXECUTION APPROVED / LOCAL IMPLEMENTATION, VALIDATION AND AMENDED SECTOR GATES PASSED — G-05, PREVIEW, OWNER REVIEW AND T9.8 GATES OPEN
**Repository:** `Manaconda33/manacondas-minigame-mayhem`  
**Working branch:** `design/neon-grid-circuit-02`  
**Planning baseline:** `0262a1e89ddd59cf483a274c6a9737a91049ea44`  
**Execution baseline:** `44e0c022631a3bded11beebb3494618906adc6c9`
**Runtime PR:** #242, draft / unmerged; production remains Circuit Alpha  
**Authority:** `docs/PRD.md` (v1.1 with recorded approved amendments), `docs/design/neon-grid/task9-coursewide-visual-plan.md`, `docs/design/neon-grid/stage-4-visual-design.md`, `docs/DECISIONS.md`

## 1. Intent and approval status

Manny requested that the final visual pass consider **bloom and textures/materials** in addition to the previously deferred Skyline architecture/city base, then explicitly instructed “Go ahead and execute T9.7” on 2026-10-09. This bounded T9.7 scope is approved for execution. On the same date, Manny raised the draw-call limit to 500 for every race scene, including Circuit Alpha, and the forward-looking Task 9 engineering draw-call target to 500; this supersedes the earlier 250 PRD and 220 Task 9 values. The active T9.7 sector A/B limits are **+36 Skyline / +30 Undercity / +28 Falls extension** under PRD amendment 2.27. Triangle and G-05 requirements remain unchanged. This approval does not include new binary textures, new 2D art, global renderer rewrites, PR #242 merge, or production gameplay release.

**Owner-directed screenshot correction approved 2026-10-09:** Manny identified a missing city-like ground in the background and generic box-shaped buildings around the waterfall, then approved a focused correction plan. Add grade-following terraced city ground beneath the Skyline and Falls city fields; use stepped tower massing and attached foundations for the 24 existing Falls towers so each visibly rises from the ground. This is a narrow exception to the previously frozen Task 8 **background city floor and tower massing only**. Keep Task 8's route, waterfall and mist presentation, rails, road materials, signs and gold tell, racers, camera behavior, counts, and shortcut access unchanged. No collision, track elevation, physics, art or budget changes are included.

The intended T9.7 outcome is a cohesive, cinematic nighttime Neon Grid across **Skyline Expressway (cyan)**, **Undercity (magenta)** and **Falls Run (gold/cyan)**, with high-speed clarity for the road, 2D driver, shortcuts, warnings and signs. Existing owner-approved work is the starting point; do not reopen T9.2–T9.5 acceptance merely because T9.7 exists.

The owner reports **desktop FPS PASS** in the October 8 work session. Record this as an *owner-reported manual result*; raw desktop captures and hardware metadata are still unavailable, so G-05 remains uncertified. T9.7 visual work may proceed under the explicit execution approval, but it cannot be described as hardware-performance certified or advance T9.6 to complete without the required evidence.

## 2. Explicit scope

### A. Skyline architecture and physically grounded city
- Review all **22 existing procedurally instanced Skyline towers** from actual chase, rear and mobile views. Improve long rectangular silhouettes with differentiated stepped setbacks, roof caps, facade rhythm and height transitions using shared/merged or instanced geometry wherever possible.
- Preserve existing building footprint/route-clearance contracts and approved **Manaconda Racing** and **Taco Bell / Live Más** sponsor art, placements, visibility and Billboard disguise.
- Add a restrained, physically credible **presentation-only city ground/base** beneath the Skyline buildings, including supported foundation/under-deck relationships where helpful. Never introduce collision, alter elevation or route, expose the deep shortcut, cover the road or create a new floating/horizon slab.
- Carry the terraced ground into the visible Falls city backdrop and rest the existing 24 Falls towers on attached stepped foundations. The city floor follows the track's grade, uses visible cross-city terraces, stays outside the roadway and shortcut corridors, and meets or overlaps every tower footing so no building floats above it.

### B. Selective bloom, emissive and lighting balance (entire course)
- Audit existing `RaceBloom` / eligible material contributions and sector emissive sources, rather than replacing the proven global bloom architecture.
- Balance Skyline cyan edge lights/windows/signage, Undercity magenta service lights/tunnel warnings, and Falls gold/cyan water/chevrons and mist.
- Preserve **legible text and shortcut tells**, driver silhouettes, track boundaries, depth and dark-city contrast. Prevent blown-out billboards, halos masking entrance apertures, excessive glare, bloom leakage and harsh differences between sectors.
- Prefer **Neon Grid-local emissive/material changes** over global bloom tuning; changing Circuit Alpha or shared renderer policy requires separate explicit authorization.
- Inspect Low/Medium/High quality behavior and fallback/non-bloom readability; no added shadow-heavy lighting or uncontrolled real lights.

### C. Texture and material polish (entire course)
- Audit asphalt and wet-look streaks, concrete and city foundations, facade/rooftop surfaces, metal pylons/guardrails, tunnel surfaces, and waterfall/mist surroundings for tiling, seams, roughness, color contrast, depth, clipping and repeated flat-looking geometry.
- Improve with **existing approved texture files, procedural material/shader parameters and batched geometry** where useful. Retain the approved cheap **fake-specular wet-road language** and the Low preset's wet-overlay bypass. Preserve correct 2D-driver-over-road compositing.
- **New binary texture maps / standalone 2D art are outside the currently approved Task 9 plan.** If the audit discovers that new maps or art are necessary, identify each candidate and its precise use, then stop for Manny's distinct asset/scope approval (including the existing one-at-a-time 2D review rule). Do not silently generate, register or ship replacement assets.

### D. Course-wide consistency and readability
- Recheck city atmosphere and the Skyline → Undercity → Falls Run transitions at **real racing speed**, not only from free camera snapshots.
- Preserve the accepted masking doctrine: Billboard Gap uses signage saturation, Service Tunnel uses service-alley camouflage and the two correct framed warning holograms, and Waterfall Dive uses repeated waterfalls with readable gold tell.
- Preserve Task 8's frozen approximately 0.70–0.85 Falls Run presentation and all separately approved avatar/advertising art, except for the owner-approved correction to background city ground and tower massing described above. Do not reinterpret that narrow exception as permission to change effects, signs/tells, road presentation, assets or gameplay rules.

## 3. Six-step proposed execution sequence

1. **Freeze baseline and perform comparative visual audit.** Confirm latest T9.6 CI/owner evidence and source hash. Capture before images from fixed Skyline, Billboard, city-base, Tunnel/Undercity, Falls and transition camera stations: desktop Medium 1920×1080 and representative Android portrait/landscape; include chase and rear plus Low/Medium/High where applicable. Record exact existing defects/benefits and which visuals *do not* need retuning. Commit a bounded audit/evidence checkpoint.
2. **Improve remaining Skyline architecture.** Refine the 22 shared/instanced tower silhouettes and roofs; preserve deterministic placement, material families, all roadway/shortcut clearance, support attachments, approved billboard visibility and resource lifetime. Add failing-first regression tests as needed and record A/B render cost.
3. **Ground the city fields.** Add lightweight, presentation-only terraced ground below the Skyline and Falls city towers. Attach the 22 Skyline and 24 existing Falls building foundations to that ground. Verify no footing gaps, road/fascia overlap, near/far-plane artifact, shortcut-mouth occlusion or collision; quantify additional triangles/calls and test disposal. The Falls correction is the explicitly approved Task 8 background-only exception; all other frozen visuals remain unchanged.
4. **Polish bloom, lighting and existing textures/materials across all three sectors.** Audit first; apply bounded Neon Grid-local selective-emission and surface tweaks only where before/after views establish a genuine gain. Validate reflection readability, wet road/driver layering, approved signs/DO NOT ENTER legibility, color balance, Low bypass and transition coherence. Seek new explicit owner approval **before** adding new binary textures or unapproved art.
5. **Full testing and independently pinned owner preview.** Run strict typecheck, zero-warning lint, full Vitest and independent Node analyzer tests, production build, approved asset checks and inherited Task 8/9 hosted rendering gates. Capture fixed-camera desktop/mobile comparisons including shortcut entries/exits and multiple quality tiers. Use the owner-approved **≤500 draw calls / ≤425,000 visible triangles Task 9 engineering targets** and global **≤500 / ≤750,000 PRD scene budgets**. Preserve G-05 baseline desktop Medium 1920×1080 ≥60 median FPS, ≤18.3ms p95 and no sustained >50ms frame sequence; software SwiftShader timing is never a substitute for real device data. Publish a **new immutable T9.7 source-pinned GitHub Pages preview** by workflow-only publication, verifying live source/hash, older preview pins, approved assets and unchanged production-root bytes.
6. **Owner full-course review and close-or-correct gate.** Manny drives a full normal three-lap Neon Grid race, including mobile portrait/landscape and desktop where practical; reviews Skyline depth and city base, texture detail, bloom brightness, readability, all three shortcut masking/tells and camera/driver clipping. On CORRECTIONS REQUIRED, fix only documented T9.7 visual/readability defects and republish a distinct source-locked preview after rerunning validations. On explicit owner PASS, record acceptance, exact source, CI/Pages/evidence and move to **T9.8 Stage 4 STOP**, **without** merging #242 or publishing Neon Grid gameplay to production.

## 4. Preserve and exclude

**Must preserve:** Circuit Alpha visuals/gameplay; 300m Neon Grid-only camera clamp (Phase V2 re-evaluation remains separate); accepted 5.3 repaired faces; the real main route, three-lap checkpoints and bidirectional shortcut access; accepted Billboard timing/0.82 retention/boost; AI shortcut rates (5% Tunnel / 45% Billboard / 12% Dive); all kart physics, roster, AI, items, audio, HUD and 2D drivers; approved signage/portal textures and exact T9.5 masking; Task 8 frozen visuals and the approved T9.7 sector A/B ceilings (+36 Skyline / +30 Undercity / +28 Falls extension).

**Out of scope:** new gameplay/rebalance; global renderer rewrite; world-distance culling/LOD architecture; changed camera/far-plane policy; new weather physics; newly commissioned texture or 2D art without its separate owner gate; further PRD hard-cap or sector-budget changes beyond amendments 2.26/2.27; staging or production merge of runtime PR #242; Neon Grid gameplay production release; automatically starting T9.8 implementation beyond documenting acceptance and stopping.

## 5. Objective evidence / exit checklist

- [ ] Final T9.6 CI and owner-report status reconciled and documented without unverified benchmark claims.
- [ ] Fixed-station before/after capture matrix for all 3 sectors, including Android portrait/landscape, desktop, Low/Medium/High and chase/rear.
- [ ] Skyline's 22 towers read as deliberate stepped/roof-capped architecture and maintain drivable-route/billboard clearance.
- [ ] City base and foundations read as grounded; no floating/clipping/road/driver occlusion or visual obstruction of valid shortcuts.
- [ ] Selective bloom is intentional, text/driver/edge readable; Low/fallback legibility retained.
- [ ] Texture/material differences improve real-road views without unapproved art or collision and without wet-road 2D compositing regressions.
- [ ] Full inherited lifecycle/cleanup, deterministic placement, masking and shortcut tests pass.
- [ ] Engineering draw/triangle targets and amended sector A/B ceilings (+36 / +30 / +28 calls) met or separately reviewed; PRD hard caps and representative-hardware FPS/frame-time acceptance preserved.
- [ ] Strict CI, build, assets, all relevant render gates PASS; no known regressions; failures are corrected before checkpoint acceptance.
- [ ] New T9.7 immutable preview passes live hash/source/preserved-production-byte checks; owner explicitly approves after driving.
- [ ] Evidence, docs and Git checkpoint are durable and the project stops at T9.8 approval boundary.

## 6. Approval request / execution gate

**Status at creation: PROPOSED.** This gate was satisfied on 2026-10-09 by Manny's direct instruction: “Go ahead and execute T9.7.” The 500-call budget, T9.7 sector ceilings and 425,000 Task 9 engineering triangle ceiling are recorded in [PRD amendments 2.26–2.28](../../PRD.md) and [DECISIONS.md](../../DECISIONS.md). Approval of T9.7 still does **not** imply approval for new 2D artwork, new binary texture assets, PR #242 merge, or production Neon Grid deployment.

Cross-references: [Task 9 master plan](task9-coursewide-visual-plan.md), [Stage 4 visual design](stage-4-visual-design.md), [implementation status](../../IMPLEMENTATION-STATUS.md), [testing](../../TESTING.md), [decisions](../../DECISIONS.md), [T9.6 evidence](../../evidence/2026-10-08-neon-task9-t9-6/progress.md).

## 7. Execution checkpoint — 2026-10-09

Manny's direct execution approval, global 500-call amendment and 425,000 Task 9 triangle ceiling are recorded in [DECISIONS.md](../../DECISIONS.md) and [PRD amendments 2.26–2.28](../../PRD.md). The T9.7 implementation adds batched foundations and stepped roof caps for all 22 existing towers, corrects instance-color materials that lacked vertex-color attributes, and makes the existing Neon Grid custom shaders compatible with the selective bloom mask. No new runtime texture or 2D art was introduced.

The first bloom-enabled capture changed the Task 8 rail appearance. The candidate now opts the frozen Falls Run edge lights, waterfall lips and signage out of bloom; the final 1280×720 Medium chase screenshot at progress 0.72 is pixel-identical to its baseline. Both images have SHA-256 `8e57ad2df8206efd494a8f739fd4fd0f88f817b7e6f94eb00a3832a353620bce`.

Fresh `npm run validate` passed strict typecheck, zero-warning lint, **131 test files / 1,046 tests**, approved asset verification and production build. The standalone T9.6 analyzer suite passed **8/8**, and `git diff --check` is clean. At the time of the prior 350,000-triangle ceiling, all three Local Chromium/SwiftShader sector gates passed with zero captured errors: Skyline **+36 calls**, peak **286 calls / 311,199 triangles**; Undercity **+30**, peak **314 / 313,135**; Falls extension **+24** against its +28 ceiling, peak **266 / 329,723**, with stable reverse-order hidden/visible counters. Full reports and the preserved pre-amendment captures are in the [sector-gate evidence](../../evidence/2026-10-09-neon-grid-t9-7/after/sector-gates/summary.json). The sector diagnostics wait for all seven asynchronously loaded AI kart GLTF models before measuring. On October 9, the owner raised the forward-looking Task 9 engineering triangle ceiling to **425,000** under PRD amendment 2.28; the active full-course gate now pins the seven highest-triangle AI kart models and checks the full scene against the new ceiling. Its 34-station run passed with **404,291 triangles / 416 calls** at `waterfall-dive-rear`, 300 scored frames and zero errors; the [report and representative captures](../../evidence/2026-10-09-neon-grid-t9-7/after/full-course-worst-case/) are preserved. The PRD hard cap remains 750,000, and G-05 hardware requirements remain open.

These captures use Chromium SwiftShader; mobile-sized viewports are simulations, and they do not establish G-05 hardware performance. The owner-reported desktop FPS PASS has no original raw capture or hardware metadata, so T9.6 remains open. No T9.7 preview has been published and owner visual/playability review remains open. PR #242 remains draft/unmerged; production gameplay is unchanged; stop before T9.8.
