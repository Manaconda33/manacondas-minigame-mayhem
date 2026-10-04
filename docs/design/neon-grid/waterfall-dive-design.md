# Waterfall Dive — design draft (Task 7)

**Status: APPROVED by Manny 2026-10-03 — Task 7 design input.** Not yet in the repo; staged for placement at `docs/design/neon-grid/waterfall-dive-design.md` on `design/neon-grid-circuit-02`.
**Author:** Paprika (draft) · **Date:** 2026-10-03
**Authoritative sources:** `docs/design/neon-grid/BUILD-CONTRACT.md` (geometry, recovery), `docs/superpowers/plans/2026-10-02-neon-grid.md` Task 7 (interfaces, tests), `NEON-GRID-SPEC.md` §3.3 (original intent), `docs/design/neon-grid/neon-grid-waterfall-dive-reference.jpg` (visual reference). Numbers below are copied from the build contract unless marked [proposal].

---

## 1. Design intent

The signature set piece. After the long Falls Run climb, the track reaches a broken guardrail section above the plunge pool — and the brave can launch the gap instead of taking the climbing line. This is the only shortcut with a real fail state, which makes it the emotional peak of the shortcut grammar: the Billboard taught you to read tells, the Tunnel taught you line choice, the Dive asks for commitment.

This is also the **authored jump** Manny scoped on 2026-10-03: a deliberately designed lip, tuned launch, and real-physics landing — not the retained 5.3 defect (which was explicitly rejected as a feature). Everything about the flight is authored and tested; nothing is a leftover bug.

Per Manny's standing direction the Dive stays **skill-gated, never luck-gated**: the launch is always available, the landing envelope is learnable, and the fail state costs time (~1.5 s), never the race. "A risk you can learn, not fear."

## 2. Authoritative geometry (from BUILD-CONTRACT.md)

- **Entry window (forward):** progress 0.792717–0.797717 · **Rejoin:** 0.827030
- **Main distance:** 49.754 m · **Ramp-to-landing chord:** 33.695 m (~34 m design envelope)
- **Elevation:** launch near y ≈ 6 m, landing near y ≈ 9 m
- **Checkpoint pair:** gates 8/9 on common road before/after (entry/rejoin separation ≈ 18–25 m along the main curve)
- **Anti-cheat invariant:** rejoin progress > entry window end, always

Critical contract note: the 34 m chord is **a design envelope for a real ballistic jump, not evidence the current kart can clear it**. Task 7 must tune ramp/landing geometry with real Rapier launches. The normal climbing line stays continuous and safe; only the selected shortcut launches. **No teleport, no automatic landing correction.**

Flow note: the Sector 3 boost pad at 0.730 feeds the dive approach — the skill is carrying pad boost into the launch. The pad-to-launch run-up is part of the design, not an accident.

## 3. Behavior contract (from Task 7 + build contract)

- **Interface:** `classifyDiveContact(position, velocity): 'airborne' | 'landed' | 'missed'` — uses authored landing/pool bounds and actual physics state.
- **Racer-owned dive state:** recovery is once-only; a missed dive places the racer in the approved landing recovery area **before gate 9**. Existing lap authority retains only earned gates — no checkpoint is awarded by exit progress, recovery, or reverse/missed gates.
- **Missed dive:** splashdown → respawn on-track at the landing zone, ~1.5 s penalty. Recovery happens on the shared landing approach before gate 9.
- **Files:** new `NeonGridDive.ts`; modify Neon geometry/colliders/scene and race recovery; new `tests/neon-grid-dive.test.ts`, `tests/neon-grid-lap-routes.test.ts`.
- **Ramp/rail/pool:** build the ramp, the rail gap, landing support, and the pool miss volume. Pause freezes timers; double-trigger is prevented; state resets/disposes cleanly.
- **Target saving:** 1.8–2.2 s on a stuck landing (paired same-driver/settings measurement; geometry alone can't guarantee it).

## 4. Lessons applied from the Tunnel and Billboard builds

- **Junction discipline, elevation-flavored:** the tunnel taught rendered-aperture vs. physical-containment checks at entry/rejoin. The dive's version is vertical: the plan's invariant #1 — nearby road at another elevation must not acquire a checkpoint or surface through planar proximity. Gates 8/9 are height-aware; test the launch/landing at the real y ≈ 6→9 m against the climbing line below/above.
- **Width/path context:** projection retains path context through the flight (build contract § "Every path has its own support surface"). Reversing, pausing, or recovering mid-flight must not drop the racer back onto the wrong path's width or progress.
- **Deterministic skill gate:** like the billboard's flicker, the dive's outcome must be a pure function of entry speed + angle + authored geometry. No random timing, no hidden variance. The 0.8 s-style readability principle transfers: the launch point needs a readable visual marker (see §7.3).
- **Do not disturb the 5.3 repair:** the dive entry (0.7927) sits just past the repaired climbing bend. The repaired faces are contract — the authored ramp/landing geometry must be placed without re-breaking them (§8).

## 5. Skill-gating analysis [proposal]

| Element | Skill tested | Luck element | Verdict |
|---|---|---|---|
| Launch commitment at the rail gap | Reading the marker, entry speed, line | None — launch always available | Skill-gated ✓ |
| Landing quality | Entry speed + angle control | None — real physics, learnable envelope | Skill-gated ✓, *provided the envelope is tuned and documented* |
| Miss → splashdown → ~1.5 s | Risk assessment | None — miss only on genuinely bad entries | Skill-gated ✓ |

Risk/reward symmetry: ~1.5 s penalty vs. 1.8–2.2 s reward. The dive is worth attempting once learned, punishing when misjudged — the right shape for a signature risk. It is the harshest shortcut fail state, but it still costs time, never the race.

## 6. Acceptance criteria (mirrors Task 7, sharpened)

- [ ] Failing-first tests: `classifyDiveContact` across the launch envelope (clean, angled, low-speed, edge, reverse approach), AI + Rocket traversal, pause mid-flight, double-trigger prevention, reset/disposal.
- [ ] Real Rapier trajectory tests — not geometric assertions: prove the kart clears the gap across the documented entry-speed/angle envelope, and misses land in the pool volume.
- [ ] All eight shortcut combinations over three laps, player and AI: physical gates 1→11→0, no wrong-height gate acquisition, no exit-progress checkpoint award, no lap from reverse/missed gates or recovery.
- [ ] Paired measurements: launch/landing envelopes documented; 1.8–2.2 s saving measured on stuck landings (measure, don't assert).
- [ ] The repaired 5.3 faces are untouched: regression-run the residual-repair matrix (zero airborne steps outside the dive) after the dive geometry lands.
- [ ] Focused + full suite green; evidence recorded the tunnel way (delivery, validation, paired measurements, trajectory data).
- [ ] Owner preview checkpoint: the dive feel and the fail-state fairness, desktop + mobile.

## 7. Open questions for Manny — answered 2026-10-03 (all Paprika's recommendations accepted: 1A, 2A, 3A, 4A, 5B)

1. **Fail-state harshness:** **A — keep the contract.** Splashdown, respawn at the landing zone, ~1.5 s penalty.
2. **Landing envelope:** **A — forgiving landing, variable quality.** Most committed attempts stick it; mastery is in *how well* you land ("landing quality scales with entry speed and angle").
3. **Launch-point tell:** **A — yes.** A readable visual marker at the rail gap (broken-rail chevrons / warning signage); every shortcut gets a tell.
4. **AI dive behavior:** **A — tunable attempt rate** like the other shortcuts, set from measured data.
5. **Saving target:** **B — measure-first.** Set the target from trajectory data (the 34 m chord is an envelope, not evidence).

## 8. Non-goals (explicit)

- No tokens (omitted per Manny's 2026-10-02 direction).
- No changes to the repaired 5.3 climbing-bend faces — regression-guard them.
- No teleport, no automatic landing correction, no checkpoint awarded by exit progress or recovery.
- No main-route geometry changes beyond the authored ramp/landing/rail-gap; no physics/stat/item changes.
- No music/audio beyond the existing Stage 5 gates (waterfall-roar proximity and splashdown SFX hooks follow the audio approval path).
- The parked jump-feature debate is settled: the Dive is its home, as an authored feature — not the 5.3 defect.

## 9. Proposed build order within Task 7

1. `classifyDiveContact` + dive state machine (failing tests first, incl. Rapier trajectories)
2. Ramp lip + rail gap + landing support + pool miss volume geometry, tuned against real launches
3. Recovery routing (once-only, before gate 9, earned-gates-only)
4. Scene: waterfall particles, plunge pool, broken rail, landing marker
5. Eight-combination lap tests (3 laps, player + AI) + paired measurements
6. Preview → owner dive-feel/fairness review, desktop + mobile

---

*Approved by Manny 2026-10-03 (all five questions answered per Paprika's recommendations). Next: place at `docs/design/neon-grid/waterfall-dive-design.md` on `design/neon-grid-circuit-02`; ChatGPT implements Task 7 against it after Task 6; Paprika verifies.*
