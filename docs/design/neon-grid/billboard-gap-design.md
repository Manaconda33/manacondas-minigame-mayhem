# Billboard Gap — design draft (Task 6)

**Status: APPROVED by Manny 2026-10-03 — Task 6 design input.** Placed in the repo 2026-10-03; ChatGPT implements Task 6 against this document.
**Author:** Paprika (draft) · **Date:** 2026-10-03
**Authoritative sources:** `docs/design/neon-grid/BUILD-CONTRACT.md` (geometry, surfaces), `docs/superpowers/plans/2026-10-02-neon-grid.md` Task 6 (interfaces, tests), `NEON-GRID-SPEC.md` §3.1 (original intent). Numbers below are copied from the build contract unless marked [proposal].

---

## 1. Design intent

The first shortcut the player meets, and the gentlest teacher. Coming off three boost pads (0.035 / 0.060 / 0.085) at full song, the pack hits the Sector 1 sweeper exit — and there's a shimmering holographic billboard with a corner-cutting plaza chord behind it. The decision is made at speed: commit to the chord while reading the flicker tell, or take the long sweeper.

Per Manny's standing direction, this is **skill-gated, never luck-gated**: the billboard is always smashable, the flicker tell is always readable, and the worst outcome is a slower exit — never a trap, never a race-ender. It teaches the shortcut grammar (read the tell, commit, profit) that the Tunnel and the Dive will later test harder.

## 2. Authoritative geometry (from BUILD-CONTRACT.md)

- **Entry window (forward):** progress 0.111234–0.116234 · **Rejoin:** 0.178525
- **Main distance:** 97.571 m · **Plaza chord:** 89.103 m · **Deck:** y ≈ 14 m
- **Checkpoint pair:** gates 2/3 on common road before/after (entry/rejoin separation ≈ 18–25 m along the main curve)
- **Anti-cheat invariant:** rejoin progress > entry window end, always — shortcuts only move forward

Note the distance saving is small (~8.5 m). The 0.6–0.9 s target saving comes from *carrying speed* through the chord versus scrubbing the sweeper — which means the skill test is entry speed plus the ON/OFF read, not distance. That's the right shape for a skill gate.

## 3. Behavior contract (from Task 6 + build contract)

- **Flicker cycle:** 6 s (4 s ON / 2 s OFF), 0.8 s glitch/static tell before each switch. ON/OFF state derives from **authoritative race seconds**, shared by visuals and tuning; frozen while paused/hidden.
- **OFF hit:** clean pass, full speed. **ON hit:** pass through, `static` surface on the shortcut — exit speed ×0.82.
- **`static` surface semantics:** 0.82 speed multiplier, asphalt acceleration, **no** off-road minimum-speed floor. Applied **once** (exit speed), never compounded per frame. **Never blocks passage.**
- **Interface:** `billboardStateAt(raceSeconds)` returns ON/OFF plus tell intensity. New file `NeonGridBillboard.ts`; `static` added to `SurfaceType` in kartTuning.
- One bounded smash cue (shard particles / zap) per crossing.

## 4. Lessons applied from the Service Tunnel build

The tunnel's owner playtest caught entrance/exit wall-junction mismatches (7 m vs 9 m aperture discrepancy). The billboard's junction risk is a different species — the hologram is visual-only and always passable, so there are no walls to misalign — but the discipline transfers:

- **Entry/rejoin must be tested at both ON and OFF phases**, at multiple speeds, including lap-1 pack arrival. The junction to verify is *projection bounds + checkpoint gates 2/3*, not walls: entering the window must resolve the shortcut projection, and gates 2→3 must trace exactly once per lap on all eight shortcut combinations (already geometrically verified in the contract; runtime must confirm).
- **Width context:** `halfWidthAt(progress)` on the main road must not be affected by the shortcut's width — projection retains path context (build contract § "Every path has its own support surface").
- **No repeated slowdown:** the 0.82 applies once per crossing. Test repeated crossings and re-entry explicitly (Task 6 checklist already requires this; calling it out because per-frame compounding is the classic bug here).

## 5. Skill-gating analysis [proposal]

| Element | Skill tested | Luck element | Verdict |
|---|---|---|---|
| 0.8 s flicker tell at ~100 km/h | Reading + commitment | None — tell is deterministic | Skill-gated ✓ |
| Chord line at speed | Entry speed, racing line | None | Skill-gated ✓ |
| ON vs OFF outcome | Timing the arrival | Cycle phase is deterministic from race seconds | Skill-gated ✓, *provided the initial phase is documented* |

**Design consideration — initial cycle phase:** on lap 1, the pack reaches the entry window at a deterministic race time, which fixes whether the first decision is ON or OFF for everyone. Manny's decision (§7.2): document the initial phase explicitly and tune lap-1 arrival to OFF — a clean discovery moment; the tax comes later.

## 6. Acceptance criteria (mirrors Task 6, sharpened)

- [ ] Failing-first tests: boundary at 3.2/4.0/5.2/6.0 race seconds, paused time, OFF clean passage, ON slowdown, always-passable (no collision), repeated crossings, tuning restored after exit.
- [ ] Real player + AI traversal at ON and OFF phases; no hologram state ever traps a kart.
- [ ] All eight shortcut combinations trace gates 1→11→0 exactly once per lap in the runtime (3 laps, player and AI).
- [ ] Paired same-driver/settings measurements: 0.6–0.9 s saving with a readable ON/OFF delta. Geometry alone can't guarantee the number — measure, don't assert.
- [ ] Focused + full suite green; evidence recorded the tunnel way (delivery, validation, paired measurements).
- [ ] Owner preview checkpoint: readability of the tell and the driving feel, desktop + mobile.

## 7. Open questions for Manny — answered 2026-10-03

1. **Hologram content:** **A — in-world neon ad.** Brand: three cycling character ads from Manny's universe — **Paprika, Arin, and Raven** as in-world sponsors. Confirmed by Manny during visual review 2026-10-03: the ad shown correlates with flicker state — **Paprika's ad displays during the OFF window (the clean pass)**, Arin/Raven cycle during the 4 s ON window. The 0.8 s glitch tell precedes each ad switch, making the state change a readable character moment rather than an abstract flicker. Deterministic and skill-gated: see Paprika → clean pass. Paprika OFF assignment is approved.
2. **Initial cycle phase:** **A — tune to OFF.** Lap-1 arrival reads as a clean discovery; the tax comes later.
3. **Plaza chord surface:** **B — subtle plaza pavers/inlay**, no gameplay effect.
4. **AI shortcut rate:** **B — measure the tunnel's AI behavior first**, set both together.
5. **Saving target:** **B — measure-first**, set the target from data (the tunnel approach).

## 8. Non-goals (explicit)

- No tokens (omitted per Manny's 2026-10-02 direction).
- No main-route geometry changes; no physics/stat/item changes.
- No music/audio beyond the existing Stage 5 gates (the static-zap SFX hook is noted in the spec but follows the audio approval path).
- The parked jump-feature discussion is separate; Waterfall Dive (Task 7) is its proper home, not this draft.

## 9. Proposed build order within Task 6

1. `billboardStateAt` + `static` surface in kartTuning (failing tests first)
2. Shortcut projection bounds + gates 2/3 runtime verification
3. Scene: hologram plane, flicker/tell animation, smash cue
4. Paired measurements + AI traversal
5. Preview → owner readability/driving review

---

*Approved by Manny 2026-10-03; verified against BUILD-CONTRACT.md, the Task 6 plan, kartTuning.ts, and IMPLEMENTATION-STATUS.md; placed in the repo 2026-10-03. ChatGPT implements Task 6 against it; Paprika verifies. Then the same loop for Waterfall Dive (Task 7).*

## 10. Approved visual execution — 2026-10-03 America/Chicago

Manny approved individual concepts, prompts and images, then authorized exact16:9 preparation and integration. Paprika’s Pathfinder / FOLLOW YOUR CURIOSITY. is inviting OFF imagery: small upright orange fox, gray hooded cloak, white muzzle/chest/tailtip, based on supplied references. Second Life Cybernetics / STILL GOT MORE. features Arin’s weathered white-haired/bearded cybernetic identity and prominent mechanical arm. Raven’s Afterglow / BOTTLED TROUBLE. features Raven’s black hair, tattoos/jewelry, violet drink and controlled magic. These are sponsors, not playable roster additions or remaps.

Final runtime derivatives2048×1152,12×6.75m passable projection at the physical7m mouth, posts outside±6m driving corridor. OFF artwork opacity0.48, ON0.72, keeping subtle road visibility. Paprika occupies2sOFF; Arin/Raven occupy2seachON. Sponsor rotation atONmidpoint is distinct from the0.8s gameplay-state glitch; strong state tells precede4s/6sboundaries. Deterministic scan/glitch and short bounded shards use race time; no audio added. Plaza uses shared exact support with subtle nonphysical inlay. Local render-wall apertures expose the existing passable joins; mainfloor/tunnel support/tuning unchanged.

Manny explicitly directed normalGit/directupload for these three approved ads, superseding defaultLFS for their exact paths only. ADR106 and visual-assets.json record exceptions/hashes. Owner gameplay readability remains pending despite artwork approval. First-lapOFF tuning, savings, AIapproachfeel and finaljoint rates remain pending Step4.
