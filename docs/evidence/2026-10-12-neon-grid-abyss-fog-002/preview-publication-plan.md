# Abyss Fog v2 immutable preview publication plan

- **Publication branch:** `preview/neon-grid-abyss-fog-002`
- **Base:** `main` at `ef61cde41701d54cdbaecdcee8dc41374545216a`
- **Runtime source pin:** `7d087f19dfd86bca36b500280309d9c86b4af77d`
- **Distinct Pages path:** `previews/neon-grid-abyss-fog-002/`
- **Expected URL after merge and successful deployment:** <https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-002/?neonGridVisual=abyss-fog-002>

The proposed workflow change is limited to `.github/workflows/ci.yml`. It adds the pinned source to the existing preview-build matrix, a SHA-and-toolchain keyed cache restore, an isolated copy into the new preview directory, protected-signage file/hash checks, and delivery byte/source-pin verification. Production build steps and all existing preview paths remain unchanged.

The expected URL is not live before the publication change is approved, merged to `main`, and the Pages deployment completes. Merging the publication PR has not been authorized. Do not merge it or describe the expected URL as a live preview until Manny gives that separate authorization and deployment is verified.
