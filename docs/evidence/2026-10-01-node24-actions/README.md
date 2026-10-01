# GitHub Actions Node 24 maintenance — 2026-10-01

Status: **LIVE / VERIFIED**

## Scope

Manny approved a bounded CI-maintenance update after reviewing the Node.js 20 warning surfaced on the earlier transient Pages failure. The project build runtime remains `node-version: 22`; only the GitHub Action execution runtimes were modernized.

Changes in PR #229:

- `actions/checkout@v4` → `actions/checkout@v5`
- `actions/setup-node@v4` → `actions/setup-node@v5`
- `actions/configure-pages@v5` → `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v3` → `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v4` → `actions/deploy-pages@v5`

Upstream action metadata was checked before implementation. Checkout v5, setup-node v5, configure-pages v6 and deploy-pages v5 declare Node 24. Upload-pages-artifact v5 is composite and pins a Node-24 upload-artifact implementation.

## Verification

PR CI: `36907406442` — **PASS**

- Git LFS runtime verification
- project Node 22 setup through `setup-node@v5`
- typecheck
- zero-warning lint
- 95 test files / 750 tests
- production build

Merge: PR #229 → `a9506b0e1727d70db65c9d284bc3d2da38a06416`

Post-merge CI/Pages: `36907725782` — **PASS**

- checkout v5 + LFS on current main
- setup-node v5 with project Node 22
- full test/build validation
- pinned Race Results preview checkout/build
- pinned Archer preview checkout/build
- Pages artifact assembly
- `configure-pages@v6` PASS
- `upload-pages-artifact@v5` PASS
- `deploy-pages@v5` PASS

A completed-job log scan found no Node-20 action-runtime warning or forced-Node-24 compatibility message.

## Remaining warnings

The successful post-merge logs still contain Node deprecation messages for `punycode` (DEP0040) and `url.parse()` (DEP0169). They occur inside current GitHub Action/tool dependency execution and are nonblocking. They are distinct from the retired Node-20 runner warning and are not evidence of a game-code failure.

## Boundaries

No gameplay, asset, lockfile, product requirement, PRD, acceptance criterion or roadmap change. Existing Archer, Bloom and all prior acceptance remain closed.
