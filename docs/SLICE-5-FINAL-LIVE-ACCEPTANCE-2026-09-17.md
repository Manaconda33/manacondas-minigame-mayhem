# Slice 5 Final Desktop/Mobile Whole-Slice Live Acceptance

## Purpose

This is the final Slice 5 product-owner integration gate. It does **not** repeat every item-specific live matrix. Those accepted checkpoints remain cumulative evidence. This gate confirms the complete item layer still works coherently in the deployed game on desktop and mobile after all fifteen items, AI tactics, interaction/counter reconciliation, lifecycle soak, Issue #106 correction, and Item/VFX performance instrumentation have landed.

Baseline under review:

- `main`: `1eec6697e84c61d8cd33cbca243b826a6f14c37a`
- performance evidence PR #171 is merged/deployed;
- post-merge validation/Pages run `35303738281` passed;
- automated baseline: **62 test files / 507 tests**;
- Slice 6 remains locked.

## Evidence model

The final decision combines:

1. existing automated and prior live evidence for all fifteen item definitions and interactions;
2. the final whole-slice live matrix below;
3. product-owner capture or explicit reported observations; and
4. a clean closure-documentation PR plus post-merge CI/Pages.

A live miss or ambiguous encounter is **INCONCLUSIVE**, not PASS. A material defect blocks Slice 5 closure until corrected and re-tested.

Browser/device names and versions must be recorded only when Manny explicitly provides them.

## Desktop matrix

### D1 - Normal unforced Grand Prix integration

Route: `https://manaconda33.github.io/manacondas-minigame-mayhem/`

Complete one ordinary three-lap race.

PASS requires:

- item boxes appear in normal race flow;
- entering a box with an empty inventory starts roulette and resolves to exactly one held item;
- held-item HUD name/glyph/charge state is readable;
- Left Shift and E both remain valid item-use controls during the session;
- at least one ordinary offensive or hazard item visibly resolves without corrupting steering, camera, lap count, position, or finish authority;
- AI racers visibly acquire/use items during ordinary racing, including representative racer-owned VFX where applicable;
- position/lap HUD remains credible through item contacts;
- player finish place/time locks correctly while later AI results can continue to settle;
- Return to Hub leaves no stale item HUD, VFX, warning, overlay, or audio state.

### D2 - Pause/timer integration

Primary route: `?testItem=nitro-overdrive`

Collect and activate Nitro Overdrive. While its active window/countdown is visibly running, pause with **Escape** or **P** for several real seconds, then resume.

PASS requires:

- active item HUD timing does not decrease while paused;
- item VFX motion/audio presentation does not continue as if race time were advancing;
- resume continues from the frozen state rather than expiring/refunding/restarting the item;
- ordinary driving and item input resume normally.

This live check is representative. Full roulette/projectile/hazard/buff/debuff/arming/fuse/cooldown/window pause coverage remains supplied by the complete automated suite and accepted item-specific matrices.

### D3 - Representative tactical categories

Use the already deployed fixed-item routes only as needed:

- offensive / directional: `?testItem=arc-hammers`
- defensive: `?testItem=prismatic-invincibility`
- catch-up/autopilot: `?testItem=hyper-drive-rocket`

PASS requires one visible successful example from each category without a new race-authority, camera, cleanup, or presentation defect. Previously accepted item-specific behavior does not need to be re-proven beyond this integration smoke check.

## Mobile matrix

### M1 - Normal unforced Grand Prix integration

Route: normal deployed game.

Complete one ordinary race using touch controls.

PASS requires:

- dedicated **ITEM** button is visible and usable;
- normal item-box acquisition, roulette, held HUD and successful use work through touch input;
- item HUD and warnings remain readable without preventing steering/action controls;
- at least one ordinary item resolves while the race continues correctly;
- representative AI item use is visible;
- finish/results and Return to Hub behave normally with no stale item presentation.

### M2 - Simultaneous touch ITEM input

Primary route: `?testItem=arc-hammers`

After collecting the forced Arc Hammers:

1. while holding **Accelerate + steer**, tap **ITEM**;
2. while holding **Drift + steer** during valid drift conditions, tap **ITEM**.

PASS requires ITEM activation to coexist with the held driving controls. Item use may not cancel or latch steering/accelerate/drift input incorrectly.

This closes the outstanding mobile simultaneous-input checklist row.

### M3 - Backward touch modifier

Continue on the Arc Hammers route or restart it.

Hold **Brake/Reverse (▼)** while tapping **ITEM**.

PASS requires the governed backward-capable deployment to resolve behind the kart while Brake/Reverse remains functional. Releasing the controls must restore ordinary touch driving with no latched input.

## Cleanup / authority spot checks

Across D1 and M1, also confirm:

- RESET/recovery does not duplicate/refund held inventory or leave stale player item effects;
- a finished racer does not newly acquire/use an item;
- no item contact visibly changes lap count or awards progress directly;
- no persistent projectile/hazard/VFX remains obviously stuck after its normal resolution;
- results remain stable after the player finishes.

The exhaustive versions of these checks are already covered by the published interaction matrix and lifecycle/object-count soak. This section is a live integration spot check.

## Gameplay capture requirement

One short recording is preferred. If recording is inconvenient, a small screenshot set is acceptable when paired with Manny's explicit observed PASS report.

Capture should collectively show:

- normal acquisition/held-item HUD or active use;
- representative AI/item interaction or item effect;
- final results/finish state;
- mobile ITEM controls during gameplay.

Existing deployed performance screenshots remain valid performance evidence but are not by themselves the whole-slice gameplay capture.

## Closure rule

Slice 5 may be marked **LIVE ACCEPTED / COMPLETE** only when:

- Desktop D1-D3 pass;
- Mobile M1-M3 pass;
- cleanup/authority spot checks pass;
- gameplay capture is supplied or explicitly referenced;
- Manny explicitly accepts the whole-slice result;
- final repository documentation records the result;
- closure PR CI and post-merge `main` CI/Pages pass; and
- no unresolved Slice 5 defect or PRD deviation remains.

After that closure record is published, Slice 6 becomes **ready for Manny's separate approval to begin**. Slice 6 must not start automatically.

## PRD deviation

None.
