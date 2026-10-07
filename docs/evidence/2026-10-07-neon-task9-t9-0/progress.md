# Neon Grid Stage 4 Task 9 — T9.0 evidence

## Scope

T9.0 only. No course-wide visual expansion, gameplay, physics, AI, item, checkpoint, balance, runtime asset, `src/`, or `public/` change is part of this checkpoint.

## Branch hygiene prerequisite

The pre-existing branch head failed CI because two Billboard visual tests exceeded their historical 5-second timeout on the hosted runner while their assertions remained valid. Commit `6a5f28a2367b50aad6df2bb63daac4234856df36` changes only those two timeout ceilings to 15 seconds, matching the already-established allowance for heavy Neon Grid geometry fixtures. The next validate run reached the new Task 9 tests without either Billboard timeout recurring.

## Frozen baseline

The accepted Task 8 representative range remains 0.70–0.85. Exact Medium instance counts and Low/Medium/High quality-scaled counts are frozen in `baseline.json` and ordinary passing assertions in `tests/neon-grid-stage4-task9.test.ts`.

Independent hosted render job `112854508990` in run `37639361779` passed with no render errors. Maximum observed scene load was 125 draw calls / 88,912 visible triangles; Desktop Medium 1920×1080 was 91 calls / 66,520 triangles. This is well below both the Task 9 engineering ceiling (200 / 300,000) and PRD hard cap (250 / 750,000). SwiftShader timing remains diagnostic-only.

## RED proof

On `da16aa42cec7808c8e1e855621e02eba5f622b3c`, hosted typecheck and lint passed, then Vitest reported 1004 passes and exactly four intended failures:

1. no explicit visual-owner disposal contract;
2. hidden Falls Run presentation still advances shader time;
3. Task 9 sector owners do not exist yet;
4. future sector wet-road passes do not exist yet.

Those four cases are converted to `it.fails` in the T9.0 checkpoint so the branch can return green while retaining executable RED contracts. As later increments satisfy them, each corresponding test must be promoted to ordinary `it`.

## Stop gate

T9.0 introduces no Task 9 visuals. T9.1 is the next authorized action only after the final T9.0 hosted checkpoint is green.
