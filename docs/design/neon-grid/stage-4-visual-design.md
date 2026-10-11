# Stage 4 — Neon-City Presentation Design Draft (Tasks 8–9)

**Status: APPROVED by Manny 2026-10-04 — Stage 4 design input.** Not yet in the repo; staged for placement at `docs/design/neon-grid/stage-4-visual-design.md` on `design/neon-grid-circuit-02`.
**Author:** Paprika (draft) · **Date:** 2026-10-04
**Authoritative sources:** `docs/superpowers/plans/2026-10-02-neon-grid.md` Tasks 8–9 (scope, tests, budgets), `NEON-GRID-SPEC.md` §1/§5 (concept, scene builders), `docs/design/neon-grid/neon-grid-city-concept-reference.jpg` + `neon-grid-waterfall-dive-reference.jpg` (visual north star), `docs/PRD.md` §2.6 (60 FPS / ≤250 draw-call budgets). Manny's direction 2026-10-04: a real level up from Circuit Alpha; city visuals mask the shortcuts; assets carry the original visual identity.

---

## 1. Design intent

**Level up, defined.** Circuit Alpha is a clean stylized dusk racer: gradient sky, road, curbs, reflectors. Neon Grid must feel like a generational leap — a cinematic night city with layered depth (deck / city base / sky), luminous surfaces, atmosphere you can feel (mist, bloom, wet asphalt), and a distinct identity per sector. The reference images are the bar, not the mood board.

**Spectacle as camouflage.** This is the stage's core principle and Manny's masking directive formalized: the city's visual richness hides the shortcuts in plain sight. Every shortcut gets two layers —
- **The mask:** environmental camouflage. The shortcut looks like ordinary city grammar until you learn otherwise.
- **The tell:** the one deliberate readable signal. Unchanged from the shortcut designs (character ad, work-light spill, gold chevrons).

The city must never hide the *tell* — only the shortcut. Mask the door, light the keyhole.

## 2. Visual identity (authoritative — from the references)

- **Palette:** cyan `#37e6ff`, magenta `#ff4fd8`, gold `#ffc63f` on near-black blue asphalt and deep night sky. No other hues lead.
- **Signature elements:** elevated highways with luminous edge lines; waterfalls pouring off deck edges; neon chevron direction signage; light trails; mist; dark city base with scattered lit windows; wet reflective asphalt.
- **Dive reference specifics:** broken guardrail with debris, glowing cyan/magenta falls, volumetric-feel mist, gold launch accents, rain-slick reflections. (Rain is visual guidance only — no rain physics per the build contract.)

## 3. The masking doctrine (per shortcut)

| Shortcut | The mask (city grammar) | The tell (unchanged) |
|---|---|---|
| Billboard Gap | **Signage saturation.** The wall-side corridor carries dozens of ad boards and neon signs — the shortcut hologram is one sign among many, unremarkable until read. | Character ad (Paprika = OFF) + 0.8 s flicker tell. |
| Service Tunnel | **Alley clutter grammar.** Every Undercity alley gets pipes, dumpsters, glow graffiti, work lights. The tunnel mouth is just another dark gap in the clutter. | Magenta work-light spill + drip SFX from the ramp. |
| Waterfall Dive | **Waterfall ubiquity.** Deck-edge falls run all along Sector 3 (straight from the city reference) — the dive gap reads as one more falls overlook. | Gold chevrons + broken rail + landing marker. |

Rule: masking elements must be **cheaper** than the tells to render (instanced/merged), so camouflage never costs more than the signal.

## 4. Visual systems (Task 8 establishes, Task 9 extends)

1. **Sky & atmosphere.** Full night sky shader (deeper than Alpha's dusk), stars, moon glow, horizon city-glow, distance haze. Bloom pipeline already exists (`markBloomMaterial`) — feed it.
2. **Road.** Dark wet-look asphalt: fake specular streaks (cheap, stylized) over the ribbon, luminous edge lines color-coded per sector, gold rail on elevated outer edges (existing guardrail pattern).
3. **Elevated structure.** Support pylons under the Sector 1/3 deck (y=14 spans), cross-bracing, under-deck shadow massing. Sells the height.
4. **City base.** Dark building silhouettes below the deck with **instanced lit windows** — one InstancedMesh, emissive, randomized. Cheap depth.
5. **Waterfalls.** Deck-edge falls along Sector 3 (reference-faithful), the dive's signature falls + plunge pool + mist (48 water / 16 mist instances already built — extend the language, don't reinvent it).
6. **Signage.** Neon chevrons, building signs, ad boards — instanced/merged. This is the masking layer; density is a design dial (see §9.2).
7. **Sector identity.** S1 Skyline Expressway: cyan, speed, sweepers, dense signage. S2 Undercity: magenta, alleys, steam/clutter, work lights. S3 Falls Run: gold + cyan falls, mist, vertical drama.
8. **Lighting.** Emissive + bloom first; few real lights. Quality tiers gate the costly bits (mist density, reflection streaks, window count).

## 5. Task 8 representative stretch [proposal]

**The Falls Run dive stretch, progress ~0.70–0.85.** Rationale: it's the visual climax and exercises the most systems at once — wet asphalt, elevation, waterfall treatment, mist, gold markers, and the masking doctrine (falls ubiquity around the dive). If this stretch sings, the language scales to the whole course. Alternatives in §9.1.

## 6. Performance contract (Task 9)

- Hard budgets from PRD §2.6: **≤250 draw calls**, 60 FPS target, 95th-percentile frame ≤18.3 ms at 1920×1080 medium.
- Techniques: instanced windows/signage/chevrons, merged static geometry, bounded particle pools, quality bypass for mist/reflections on Low.
- Measure on reviewed devices — no device pass inferred from cloud screenshots (plan's explicit rule).
- Masking must be cheaper than tells (§3 rule).

## 7. Acceptance criteria (mirror Tasks 8–9, sharpened)

- [ ] Task 8: one stretch polished to the reference bar; desktop/mobile Low/Medium/High captures; named scene groups present (billboard, service-tunnel, waterfall-dive, 4 boost pads); **owner visual review of the stretch before extending** (plan's explicit stop).
- [ ] Driver visibility check: road edges and driver actions stay readable at speed on mobile — spectacle must not cost legibility.
- [ ] Task 9: lifecycle tests (owned geometry/material/texture cleanup, finite transforms, bounded particles/lights, pause/hidden freeze, quality bypass) written failing-first, then extended look.
- [ ] Masking review: each shortcut's mask reads as city grammar; each tell reads at speed. Verify from chase camera, not just freecam.
- [ ] Measured frame times/draw calls/resources vs PRD budgets on reviewed devices; full checks green.
- [ ] Pinned preview published, hash-verified, owner full-course visual feedback resolved.

## 8. Non-goals (explicit)

- No rain physics (visual guidance only, per build contract).
- No gameplay/physics/stat/item changes; no tokens; no new binary artwork beyond the approved asset path (procedural + instanced first).
- No audio (Stage 5). No wet-weather handling changes.
- The 5.3 repaired faces and all accepted shortcut geometry are contract — presentation only.

## 9. Open questions for Manny — answered 2026-10-04 (all Paprika's recommendations accepted: 1A, 2B, 3B, 4B, 5A, 6A)

1. **Task 8 representative stretch:** **A — Falls Run dive stretch (~0.70–0.85).** The visual climax; most systems exercised at once.
2. **Masking intensity:** **B — balanced.** Masked, but an observant first-time player can spot the anomalies.
3. **Wet asphalt:** **B — fake specular streaks.** Cheap, stylized, matches the reference feel.
4. **City base density:** **B — silhouette masses + instanced lit windows**, with the door open to **A (dense skyline)** if B doesn't satisfy on the eyes. Decide at the Task 8 stretch review.
5. **Waterfalls:** **A — reference-faithful.** Deck-edge falls all along Sector 3, instanced.
6. **Sky:** **A — full night + horizon city glow.**

## 10. Proposed build order

1. Task 8: sky/atmosphere + road (wet asphalt, edge lines) + waterfall treatment on the chosen stretch
2. Elevated structure + city base + signage on the stretch
3. Sector identity accents + tell legibility pass (chase camera)
4. Owner stretch review (hard stop per plan)
5. Task 9: extend language course-wide, lifecycle tests, perf measurement vs budgets
6. Pinned preview → owner full-course visual feedback

---

*Approved by Manny 2026-10-04 (all six questions answered per Paprika's recommendations; city density B with an open door to A at the Task 8 review). Next: place at `docs/design/neon-grid/stage-4-visual-design.md` on `design/neon-grid-circuit-02`; ChatGPT implements Task 8 after Task 7 + Step 4 balance; Paprika verifies.*
