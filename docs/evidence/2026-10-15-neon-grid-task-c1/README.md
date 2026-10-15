# Neon Grid Task C1 — Service Tunnel Concrete A/B

**Status:** Isolated prototype for owner visual and technical review. Production integration, deployment, PR #242, and Task C2 remain gated.

## Source and approval

- Implementation baseline: `e52fef8169233e5c612f8683e8074423c8cf1c07` (Task A/B nonproduction branch).
- C0.1 target-selection checkpoint: `48d4b474cf8c9ce590a7623c8e83b44ac0914ef8`.
- Approved Task A runtime: `692e9424c2cbf15decbb467b230c02c2e10452a0`.
- Production `main` was verified at `e8cb78f1f9c678d08d84ab30cb8585f99e70c800` before work.
- PR #242 remains open, draft, and unmerged.

The approved experiment applies Poly Haven Concrete Wall 007 to only the existing Service Tunnel left/right sidewall meshes. The `?neonGridMaterial=service-tunnel-concrete-001` query enables B. Omitting it selects the existing blockout material A. The approved Task A visual query remains independent (`?neonGridVisual=neon-grid-task-a-001`).

## Scope and implementation

- One shared wall material and the existing two sidewall meshes. No extra object or material group is added, so the prototype predicts no additional draw call.
- U follows each wall's tunnel arc distance; V follows wall height. The prototype repeats the square maps at the 2.2 m scale recorded by the C0 source review. The source page review records width but the source height has not been independently retrieved, so the vertical scale is a stated square-map assumption for owner review.
- The base-color map is sRGB. OpenGL normal and roughness maps use `NoColorSpace`. The optional metallic map is omitted.
- Existing wall positions, indices, and triangle counts are preserved. UVs are added only to render sidewall geometry in B. Floor, roof, lighting, fog, shadows, bloom, motion blur, sponsors, camera, collisions, and route logic remain on their existing paths.
- Texture loads are awaited before the game starts. If any required map fails, B setup fails explicitly and releases successful partial loads; it does not silently present A as B.
- Task B's capture schema is extended additively with the selected material variant so A/B captures are attributable.

## Asset acquisition

The three owner-provided Drive files were downloaded and byte-verified in the isolated workspace. Their dimensions, bit depth, channels, byte counts, and SHA-256 values are recorded in [asset-manifest.json](asset-manifest.json). All are 1024×1024, 16-bit PNGs. The repository tracks these runtime files through Git LFS under `.gitattributes`.

The C0 source review records Poly Haven's CC0 license, the official asset page, a 2.2 m width, and native 1K availability. A fresh TLS-verified request to the publisher's file API returned HTTP 403 through the configured proxy. Publisher-provided archive/map hashes were unavailable; the manifest therefore identifies the received bytes without claiming independent publisher-hash verification. No mirror, proxy bypass, or TLS bypass was used.

The three compressed PNGs total 13,585,286 bytes. A rough RGBA8 full-mipmap storage estimate would be about 16 MiB across three 1024² maps, but actual GPU formats/residency are not reported by Three.js and are not measured here. Download size is not GPU memory.

## Fixture and evidence

The source-pinned browser fixture uses the real `KartTimeTrial`, Task A visuals, Medium quality, eight racers, a fixed roster seed, a tunnel midpoint, and the same chase/rear cameras at desktop 1920×1080 and portrait 390×844 drawing buffers. The `.mjs` runner and machine-readable report are stored alongside the captures.

| Camera / viewport        | A capture | B capture | Difference/report |
| ------------------------ | --------- | --------- | ----------------- |
| Chase, desktop 1920×1080 | pending   | pending   | pending           |
| Rear, desktop 1920×1080  | pending   | pending   | pending           |
| Chase, portrait 390×844  | pending   | pending   | pending           |
| Rear, portrait 390×844   | pending   | pending   | pending           |
| Controlled B close-up    | —         | pending   | pending           |

The render-pass output records the existing main-scene and bloom counters, draw/triangle totals, and render-target sizes. CPU-observed render-call timings are reported separately if repeatability supports them; no GPU time or physical-device FPS is inferred. Software-WebGL output is correctness and appearance evidence only.

## Validation

Exact-source validation commands and results, visual comparisons, pass reconciliation, errors, runtime asset checks, LFS checks, and any limitations are recorded below after the browser and repository checks finish. No approved graphics limit is modified. No production runtime, CI behavior, or game physics changes are included.

## Owner review gate

Review wall readability at racing distance and the close-up normal orientation/tiling. Decide whether the 2.2 m tile scale and visible concrete treatment are acceptable before any broader material application. No merge or deployment is authorized by this checkpoint.
