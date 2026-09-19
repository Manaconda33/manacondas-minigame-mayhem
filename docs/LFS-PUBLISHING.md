# Git LFS publication from restricted Work environments

Normal authenticated Git is the first choice for LFS publication. Use this fallback when the hosted Work shell cannot reach GitHub but the connected GitHub app can update repository branches.

## Eligibility

The GitHub Actions bridge is allowed only when all of these conditions are true:

1. `.gitattributes` assigns the asset to Git LFS.
2. A committed builder can reproduce the approved binary byte-for-byte on a GitHub-hosted runner.
3. The approved SHA-256 value and LFS object ID are known before publication.
4. The connected GitHub app can create or update a feature branch.

If any condition fails, use an authenticated external Git/LFS handoff. Do not commit the binary to normal Git.

## Required sequence

1. Validate the builder locally and confirm that each generated file's SHA-256 value equals its LFS object ID.
2. Publish the approved text files, builder, and LFS pointer files to a feature branch through the connected GitHub app.
3. Add a branch-scoped temporary workflow with `contents: write` and no broader permission.
4. Pin the builder dependencies and regenerate only the named assets.
5. Check every generated SHA-256 value before running any upload command.
6. Run `git add` on the generated files and require `git diff --cached --exit-code` to prove that the committed pointers did not change.
7. Upload only the approved object IDs with `git lfs push --object-id`.
8. Delete the runner's local LFS object cache, fetch the branch objects from GitHub, and require `git lfs fsck` to pass.
9. Record the successful workflow run and object IDs in `docs/IMPLEMENTATION-STATUS.md`.
10. Delete the temporary workflow before review or merge.

The feature branch may contain LFS pointers before the bridge runs. It must not be merged until the upload and fetch-back checks pass.

## Limits

This bridge does not apply to arbitrary high-resolution art, audio, or models without deterministic committed source. Those files require an authenticated external Git/LFS handoff. The normal-Git exceptions for fixed-size runtime avatar delivery PNGs remain governed by `.gitattributes`, ADR-012, and the approved Character Select extension in ADR-092.

## First verified use

Lavi's Potato kart established this procedure on 2026-08-16. GitHub Actions run `31983718813` rebuilt all three GLBs, matched the approved hashes, uploaded three LFS objects, deleted the runner cache, fetched the objects from GitHub, and passed `git lfs fsck`.

## Runtime Pages delivery

Uploading a valid LFS object is not proof that the deployed game can use it. Any Pages workflow that builds runtime GLBs must check out with `lfs: true`, run `git lfs fsck`, and invoke the repository’s binary-signature gate before publishing `dist/`. The gate must reject an LFS pointer at a required runtime path.

When bytes at a public runtime path change, update that character package’s controlled asset revision (or use a new filename) before requesting manual confirmation. A correct build can otherwise be masked by a browser or edge-cache response for an older bad object. Record the materialization run, deployment run, deployed commit, asset revision, and manual device result in `docs/IMPLEMENTATION-STATUS.md`.
