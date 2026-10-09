# Neon Grid Stage 4 T9.7 — Final Visual Polish & Owner Preview Plan

**Prepared:** 2026-10-08 (America/Chicago)  
**Status:** PROPOSED / RECORDED FOR OWNER REVIEW — NOT AUTHORIZED FOR IMPLEMENTATION  
**Repository:** `Manaconda33/manacondas-minigame-mayhem`  
**Working branch:** `design/neon-grid-circuit-02`  
**Planning baseline:** `0262a1e89ddd59cf483a274c6a9737a91049ea44`  
**Runtime PR:** #242, draft / unmerged; production remains Circuit Alpha  
**Authority:** `docs/PRD.md` (v1.1 with recorded approved amendments), `docs/design/neon-grid/task9-coursewide-visual-plan.md`, `docs/design/neon-grid/stage-4-visual-design.md`, `docs/DECISIONS.md`

## 1. Intent and approval status

Manny requested that the final visual pass consider **bloom and textures/materials** in addition to the previously deferred Skyline architecture/city base. This document captures the **expanded T9.7 proposal for a decision**, not an approval to execute the expanded scope. Writing this plan is the only work authorized by the request to record it. Obtain Manny's explicit approval or amendments **before changing gameplay, scene visuals, materials, rendering code, CI thresholds, or asset files**.

The intended T9.7 outcome is a cohesive, cinematic nighttime Neon Grid across **Skyline Expressway (cyan)**, **Undercity (magenta)** and **Falls Run (gold/cyan)**, with high-speed clarity for the road, 2D driver, shortcuts, warnings and signs. Existing owner-approved work is the starting point; do not reopen T9.2–T9.5 acceptance merely because T9.7 exists.

The owner reports **desktop FPS PASS** in the October 8 work session. Record this as an *owner-reported manual result*; do not invent raw desktop captures, exact measured FPS, GPU identity, test resolution or independent certification. Before implementing T9.7, confirm the preceding source-locked T9.6 CI result and resolve any outstanding T9.6 gate according to the PRD and the owner record.

## 2. Explicit scope

### A. Skyline architecture and physically grounded city
- Review all **22 existing procedurally instanced Skyline towers** from actual chase, rear and mobile views. Improve long rectangular silhouettes with differentiated stepped setbacks, roof caps, facade rhythm and height transitions using shared/merged or instanced geometry wherever possible.
- Preserve existing building footprint/route-clearance contracts and approved **Manaconda Racing** and **Taco Bell / Live Más** sponsor art, placements, visibility and Billboard disguise.
- Add a restrained, physically credible **presentation-only city ground/base** beneath the Skyline buildings, including supported foundation/under-deck relationships where helpful. Never introduce collision, alter elevation or route, expose the deep shortcut, cover the road or create a new floating/horizon slab.

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
- Preserve Task 8's frozen approximately 0.70–0.85 Falls Run presentation and all separately approved avatar/advertising art; do not reinterpret earlier acceptance as permission to replace those assets or gameplay rules.

## 3. Six-step proposed execution sequence

1. **Freeze baseline and perform comparative visual audit.** Confirm latest T9.6 CI/owner evidence and source hash. Capture before images from fixed Skyline, Billboard, city-base, Tunnel/Undercity, Falls and transition camera stations: desktop Medium 1920×1080 and representative Android portrait/landscape; include chase and rear plus Low/Medium/High where applicable. Record exact existing defects/benefits and which visuals *do not* need retuning. Commit a bounded audit/evidence checkpoint.
2. **Improve remaining Skyline architecture.** Refine the 22 shared/instanced tower silhouettes and roofs; preserve deterministic placement, material families, all roadway/shortcut clearance, support attachments, approved billboard visibility and resource lifetime. Add failing-first regression tests as needed and record A/B render cost.
3. **Ground the Skyline city.** Add lightweight, presentation-only below-tower city base/foundations with deliberate silhouette and structural connections. Verify no floating material, fascia/road overlap, near/far-plane artifact, shortcut-mouth occlusion or collision; quantify additional triangles/calls and test disposal.
4. **Polish bloom, lighting and existing textures/materials across all three sectors.** Audit first; apply bounded Neon Grid-local selective-emission and surface tweaks only where before/after views establish a genuine gain. Validate reflection readability, wet road/driver layering, approved signs/DO NOT ENTER legibility, color balance, Low bypass and transition coherence. Seek new explicit owner approval **before** adding new binary textures or unapproved art.
5. **Full testing and independently pinned owner preview.** Run strict typecheck, zero-warning lint, full Vitest and independent Node analyzer tests, production build, approved asset checks and inherited Task 8/9 hosted rendering gates. Capture fixed-camera desktop/mobile comparisons including shortcut entries/exits and multiple quality tiers. Use the owner-approved **≤220 draw calls / ≤350,000 visible triangles Task 9 engineering targets** and unchanged **≤250 / ≤750,000 PRD scene budgets**. Preserve G-05 baseline desktop Medium 1920×1080 ≥60 median FPS, ≤18.3ms p95 and no sustained >50ms frame sequence; software SwiftShader timing is never a substitute for real device data. Publish a **new immutable T9.7 source-pinned GitHub Pages preview** by workflow-only publication, verifying live source/hash, older preview pins, approved assets and unchanged production-root bytes.
6. **Owner full-course review and close-or-correct gate.** Manny drives a full normal three-lap Neon Grid race, including mobile portrait/landscape and desktop where practical; reviews Skyline depth and city base, texture detail, bloom brightness, readability, all three shortcut masking/tells and camera/driver clipping. On CORRECTIONS REQUIRED, fix only documented T9.7 visual/readability defects and republish a distinct source-locked preview after rerunning validations. On explicit owner PASS, record acceptance, exact source, CI/Pages/evidence and move to **T9.8 Stage 4 STOP**, **without** merging #242 or publishing Neon Grid gameplay to production.

## 4. Preserve and exclude

**Must preserve:** Circuit Alpha visuals/gameplay; 300m Neon Grid-only camera clamp (Phase V2 re-evaluation remains separate); accepted 5.3 repaired faces; the real main route, three-lap checkpoints and bidirectional shortcut access; accepted Billboard timing/0.82 retention/boost; AI shortcut rates (5% Tunnel / 45% Billboard / 12% Dive); all kart physics, roster, AI, items, audio, HUD and 2D drivers; approved signage/portal textures and exact T9.5 masking; Task 8 frozen visuals and sector A/B incremental budgets.

**Out of scope:** new gameplay/rebalance; global renderer rewrite; world-distance culling/LOD architecture; changed camera/far-plane policy; new weather physics; newly commissioned texture or 2D art without its separate owner gate; PRD hard-cap relaxation; staging or production merge of runtime PR #242; Neon Grid gameplay production release; automatically starting T9.8 implementation beyond documenting acceptance and stopping.

## 5. Objective evidence / exit checklist

- [ ] Final T9.6 CI and owner-report status reconciled and documented without unverified benchmark claims.
- [ ] Fixed-station before/after capture matrix for all 3 sectors, including Android portrait/landscape, desktop, Low/Medium/High and chase/rear.
- [ ] Skyline's 22 towers read as deliberate stepped/roof-capped architecture and maintain drivable-route/billboard clearance.
- [ ] City base and foundations read as grounded; no floating/clipping/road/driver occlusion or visual obstruction of valid shortcuts.
- [ ] Selective bloom is intentional, text/driver/edge readable; Low/fallback legibility retained.
- [ ] Texture/material differences improve real-road views without unapproved art or collision and without wet-road 2D compositing regressions.
- [ ] Full inherited lifecycle/cleanup, deterministic placement, masking and shortcut tests pass.
- [ ] Engineering draw/triangle targets met or separately reviewed; PRD hard caps and representative-hardware FPS/frame-time acceptance preserved.
- [ ] Strict CI, build, assets, all relevant render gates PASS; no known regressions; failures are corrected before checkpoint acceptance.
- [ ] New T9.7 immutable preview passes live hash/source/preserved-production-byte checks; owner explicitly approves after driving.
- [ ] Evidence, docs and Git checkpoint are durable and the project stops at T9.8 approval boundary.

## 6. Approval request / execution gate

**Status at creation: PROPOSED, NOT APPROVED TO BEGIN.** Manny has requested this expanded plan be recorded. Implementation starts only after a separate explicit approval of this scope. Approval of T9.7 **will not** imply approval for new 2D artwork, new binary texture assets, PR #242 merge, or production Neon Grid deployment.

Cross-references: [Task 9 master plan](task9-coursewide-visual-plan.md), [Stage 4 visual design](stage-4-visual-design.md), [implementation status](../../IMPLEMENTATION-STATUS.md), [testing](../../TESTING.md), [decisions](../../DECISIONS.md), [T9.6 evidence](../../evidence/2026-10-08-neon-task9-t9-6/progress.md).
