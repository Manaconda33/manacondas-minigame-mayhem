# CI-1 Trusted Evidence Reuse Fixture

Temporary, unmerged verification-only document. This is intentionally outside the narrow documentation fast-path allowlist and outside the pinned-runtime validation contract fingerprint.

Source under test: merged PR #301 at `178750c4a6b078398d8c20a6d33e684531c2e025`. Expected behavior: `validate` executes the full application tests; historical pinned-runtime jobs reuse independently verified evidence produced by `main` without rerunning the unchanged 3–19 minute pinned suites. Any absence or mismatch must trigger full validation, not a false PASS.

The fixture is not an approval or a change to graphics, gameplay, or CI policy. Close without merging after recording the GitHub Actions result.
