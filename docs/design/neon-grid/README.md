# Neon Grid — Circuit 02 design and build checkpoint

This branch records Manny's supplied design materials and approved five-stage build approach. Manny directed documenting the plan on 2026-10-02. The refined course shape and final product contract are reviewed in Stage 1 before runtime implementation; the branch does not itself amend the approved PRD or activate a route.

- [Five-stage implementation plan](../../superpowers/plans/2026-10-02-neon-grid.md): ten tasks with file/interface boundaries, validation, owner reviews, and publication gates. Recommended execution: native, one stage at a time.

- [Build spec](NEON-GRID-SPEC.md): supplied design text, revised on 2026-10-02 for shortcut-safe checkpoints and a longer course target. Its references to `track-concept-art.webp` and `media-generation-neon-grid-waterfall-dive-*.webp` are historical filenames in the supplied draft; the visual references available in this intake are the JPEGs below.
- [Top-down builder's guide](track-layout.html): supplied HTML, unchanged; schematic and explicitly not to scale.
- [City and elevated highway visual reference](neon-grid-city-concept-reference.jpg): review derivative of supplied `image(5).png`.
- [Waterfall dive visual reference](neon-grid-waterfall-dive-reference.jpg): review derivative of supplied `image(6).png`.

The supplied 1920 × 1280 PNG files were not placed in this repository. These 1500 × 1000 JPEGs are reference-only derivatives, not approved runtime assets or source masters. The original files remain with Manny's attachments.

| File | Original SHA-256 | Review JPEG SHA-256 |
| --- | --- | --- |
| `image(5).png` → city reference | `2255c22a771b605793eeb94d0c5535f667030821df1681cf7a4641e8e3578a6e` | `49aa2409f18ca28e411472aecf2943f2cb12b0e741456c033f83b8f8b4f6033b` |
| `image(6).png` → dive reference | `3e60c5260a8e7ce9fb7c4d621104416c6da0f6b84bee7ffc839dfc4b5b146f12` | `b9003b9c342a0cba37e61316d8e908c5dc1804c87df31aabca9d1f65cdfac34b` |

Design reconciliation against the current PRD and runtime is required before implementation. The design revision proposes common-road checkpoint gates around all three shortcuts and a 1.40–1.50 km main curve. The PRD's single Circuit Alpha decision, actual route-selection flow, realized checkpoint and shortcut geometry, elevation and collision boundaries, `static` tuning semantics, AI shortcut behavior, audio identity, and measured lap times still need an approved implementation contract. The supplied spec is design intent, not a claim that its proposed API already satisfies those contracts.

## Stage 1 — refined course ready for review

Native execution started on 2026-10-02. Review the [build contract](BUILD-CONTRACT.md) and [dimensional course drawing](layout.svg) ([PNG](layout.png)); [numeric layout](layout.json) and [design generator](build_layout.py) contain the proposed control points and gates. Geometry measures 1,450 m and passes the recorded gate/progress checks. Owner shape/token review and runtime physics/lap tests remain pending. Progress/rulings: [execution ledger](../../evidence/2026-10-02-neon-grid/progress.md).

### Undercity bend correction

Manny rejected the gentle S-curve. The latest dimensional drawing restores tight reversing bends and crosswise alley straights from the original guide. Main length is 1,450.001 m by dense measurement; the gate/shortcut geometry checks still pass. Tokens remain a proposed optional collectible/count rule, not an existing game system or approved handling effect.
