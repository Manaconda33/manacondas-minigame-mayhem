# R2.14 production-only Pages publication closeout

Date: 2026-10-26  
Production source: `fd762de24cda6d738b99bfeb65c9cd928d40108a`  
Squash merge: PR #346  
Baseline: `42bac750bbb1fa5387ed3cbc888b4c1783943742`

## Publication result

PR #346 was squash-merged by the normal protected-branch workflow at `fd762de24cda6d738b99bfeb65c9cd928d40108a`. Main CI run [40396592161](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40396592161) completed successfully. The `validate`, production-only `assemble`, Pages `deploy`, and post-deployment exact-byte verification jobs passed. Trusted pinned-runtime run [40396592304](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40396592304) also completed successfully; all four cases passed: Dive, Abyss Fog V3.2, Billboard, and Far300.

The deployed root is [the production game](https://manaconda33.github.io/manacondas-minigame-mayhem/). A live HTTPS request returned HTTP 200. The deployed HTML's main JavaScript and stylesheet URLs returned HTTP 200. This was a static HTTP check, not an interactive browser session.

## Packaging and production-byte evidence

| Evidence                                 | Result                                                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Previous Pages artifact                  | 5,164,346,802 bytes; run `40355995777`, artifact `12668110878`                                                                                                    |
| Last reviewed PR candidate reference     | 211,513,918 bytes; artifact `12684100185`; SHA-256 `49a36ca63509c585c9a0daaaedd82d886fdcf3e890078556daa2b789eb602908`; candidate only, not post-merge measurement |
| Published production-only Pages artifact | 211,514,731 bytes; run `40396592161`, artifact `12688210450`; GitHub artifact SHA-256 `3b8cbf70f5ace67911cc10be078791fc730ee8feb02a9dbfceed008aa6ec5f4d`          |
| Reduction                                | 4,952,832,071 bytes (**95.90433%**) from the previous Pages archive size                                                                                          |
| Production delivery inventory            | 417 paths, 234,304,563 uncompressed bytes; 0 paths under `previews/`                                                                                              |
| Post-deployment verification             | 417/417 returned HTTP 200 and matched the expected path, byte count, and SHA-256; no mismatch or missing path                                                     |
| Expected delivery-manifest artifact      | `12686768794`, 23,355 bytes; artifact SHA-256 `d146ed75d8530580c6a5db491d76fcee7a9af8bcc50326c6b7bcb72507c717e2`                                                  |
| Verified-live delivery report artifact   | `12687726512`, 23,419 bytes; artifact SHA-256 `06312bc7f261d9555e31b8d31fa23e2ac964c0324afed1d4471add9bc0b69577`                                                  |

The two small delivery artifacts were independently downloaded. Their archive hashes matched GitHub artifact metadata. The live-verification JSON contains 417 entries, all HTTP 200; it was compared entry-by-entry against the expected manifest. All 417 path/hash/byte tuples matched. Both raw JSON files are preserved here: [expected delivery manifest](delivery-expected.json) and [verified live delivery report](delivery-verified.json). Their SHA-256 values are in [SHA256SUMS](SHA256SUMS); verify from this directory with `sha256sum -c SHA256SUMS`. Neither the application runtime nor approved assets changed in PR #346; the changed files are workflow, delivery-verifier, test, and R2.14 evidence/documentation files.

The Pages artifact's published size and digest are taken from the completed GitHub Actions artifact record. The entire 211 MB archive was not independently downloaded and rehashed in this checkpoint; its GitHub-reported SHA-256 is recorded above. This is not a player network-transfer measurement.

## Historical preview retirement

The owner explicitly authorized retiring the 27 preview paths in the original [R2.14 candidate inventory](../2026-10-26-r2-14-production-only-packaging/README.md#historical-public-preview-paths-affected-by-a-production-only-deployment). After publication, each URL was requested over HTTPS. All 27 now return HTTP 404 at the requested URL, with no redirect to another page, so none still serves its former playable preview. One initial request returned HTTP 503; three immediate no-cache retries returned 404. The full confirmed list:

1. `/previews/neon-grid/` — 404
2. `/previews/neon-grid-5-3/` — 404
3. `/previews/neon-grid-tunnel/` — 404
4. `/previews/neon-grid-billboard/` — 404
5. `/previews/neon-grid-dive/` — 404
6. `/previews/neon-grid-far300/` — 404
7. `/previews/neon-grid-t9-2/` — 404
8. `/previews/neon-grid-t9-3/` — 404
9. `/previews/neon-grid-t9-3-correction/` — 404
10. `/previews/neon-grid-t9-4/` — 404
11. `/previews/neon-grid-t9-5/` — 404
12. `/previews/neon-grid-t9-5-correction/` — 404
13. `/previews/neon-grid-t9-5-sightline/` — 404
14. `/previews/neon-grid-t9-5-portals/` — 404
15. `/previews/neon-grid-t9-5-owner-correction/` — 404
16. `/previews/neon-grid-t9-6-diagnostics/` — 404
17. `/previews/neon-grid-t9-7/` — 404
18. `/previews/neon-grid-t9-7-city-ground/` — 404
19. `/previews/neon-grid-t9-7-environment-correction/` — 404
20. `/previews/neon-grid-abyss-fog-001/` — 404
21. `/previews/neon-grid-abyss-fog-002/` — 404
22. `/previews/neon-grid-abyss-fog-004/` — 404
23. `/previews/neon-grid-task-a-001/` — 404
24. `/previews/neon-grid-task-c1-001/` — 404
25. `/previews/neon-grid-c2-concrete/` — 404
26. `/previews/neon-grid-layout-studio/` — 404
27. `/previews/neon-grid-owner-layout/` — 404

This retires only the public built preview outputs. Historical source commits, branches, assets, exported layouts, pinned-source validation contracts, approval records, manifests, and evidence remain preserved. No complete historical preview bundle backup is claimed.

## Gameplay smoke scope and remaining release work

The R2.14 workflow-only PR did not change game source or production assets. The prior isolated Chromium software-rendered smoke is preserved in the candidate evidence; it is not a post-deployment browser smoke. No connected browser-control tool was available for this session, so live interactive Title/Hub, default-track, selection, WebGL2, and race-start checks in Chrome or Edge are **UNMEASURED**. The small HTTP checks above do not establish browser playability. Run the concise live startup smoke in a supported Chrome and Edge session before claiming post-publication browser confirmation; do not repeat full gameplay acceptance.

G-05 remains **OWNER ACCEPTED BY EXCEPTION** under PRD amendment 2.32. Backup/rollback remains **OWNER ACCEPTED BY EXCEPTION** under amendment 2.33; no immutable predecessor archive is claimed. PRD §37 item-by-item acceptance reconciliation remains pending. This record does not declare formal v1 acceptance.
