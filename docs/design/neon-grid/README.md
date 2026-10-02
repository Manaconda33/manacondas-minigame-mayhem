# Neon Grid — Circuit 02 design intake

This branch records Manny's supplied design materials for review. It does not amend the approved PRD, activate a route, or authorize gameplay implementation or production publication.

- [Build spec](NEON-GRID-SPEC.md): supplied text, unchanged. Its references to `track-concept-art.webp` and `media-generation-neon-grid-waterfall-dive-*.webp` are historical filenames in the supplied draft; the visual references available in this intake are the JPEGs below.
- [Top-down builder's guide](track-layout.html): supplied HTML, unchanged; schematic and explicitly not to scale.
- [City and elevated highway visual reference](neon-grid-city-concept-reference.jpg): review derivative of supplied `image(5).png`.
- [Waterfall dive visual reference](neon-grid-waterfall-dive-reference.jpg): review derivative of supplied `image(6).png`.

The supplied 1920 × 1280 PNG files were not placed in this repository. These 1500 × 1000 JPEGs are reference-only derivatives, not approved runtime assets or source masters. The original files remain with Manny's attachments.

| File | Original SHA-256 | Review JPEG SHA-256 |
| --- | --- | --- |
| `image(5).png` → city reference | `2255c22a771b605793eeb94d0c5535f667030821df1681cf7a4641e8e3578a6e` | `49aa2409f18ca28e411472aecf2943f2cb12b0e741456c033f83b8f8b4f6033b` |
| `image(6).png` → dive reference | `3e60c5260a8e7ce9fb7c4d621104416c6da0f6b84bee7ffc839dfc4b5b146f12` | `b9003b9c342a0cba37e61316d8e908c5dc1804c87df31aabca9d1f65cdfac34b` |

Design reconciliation against the current PRD and runtime is required before implementation. In particular, the PRD's single Circuit Alpha decision, the actual route-selection flow, checkpoint/lap authority for off-spline paths, elevation and collision boundaries, `static` tuning semantics, AI shortcut behavior, audio identity, and measured lap targets need an approved implementation contract. The supplied spec is design intent, not a claim that its proposed API already satisfies those contracts.
