# Classification methodology and reproduction limits

`generator-source.json` losslessly retains the original C5-A `build_manifest.py` UTF-8 bytes and their SHA256, including original EOF whitespace. The adjacent `generate-c5-a-manifest.py` wrapper verifies that content hash before executing it. `../SOURCE-SHA256SUMS` covers the envelope; the checkpoint verifier separately checks the decoded original-source hash. It is historical generation source, not installed CI tooling. Its original input path is `/workspace/attachments/gate-c5-a`.

Full regeneration uses the separately supplied `gate-c5-a-report-bundle.zip`, SHA256 `9a11be951f7e52227023874ad8676cacf6fcffe9a8294cd3842b17cd33ca7f65`. Its larger API caches, complete retained DAGs/object sets and text index are intentionally excluded from Git. Restore the bundle at the expected path, verify its checksums and run the original generator to reproduce the frozen observations. Stale inputs do not establish fresh repository state.

The canonical inventory, complete manifest, exceptions, source-pin graph and preservation dependencies retain outputs and GitHub evidence references. `verify_checkpoint.py` independently checks hashes, 176 unique records, inventory representation, counts, exceptions, actual artifact-content hashes and non-authorization.

C5-A enumerated 100+76+0 refs twice and checked exact sorted `branch<TAB>HEAD<LF>` identity plus complete retained DAG closure. It used exact main ancestry for 48 historical tips, exact changed-file path/status/blob comparisons to main-ancestral integrations for 87 branches, and retained shared ancestry or canonical supersession for 27 additional candidates.

Final-file equivalence does not permanently retain every squash-source commit. The later 5.3 publisher also uses accepted C3 disposition and its exact canonical delivery blob. Source reachability is distinct from SHA text. Active development will need its own durable reference when frozen.

The original 174-name inventory is UNVERIFIABLE and is not reconstructed. The 176-name inventory remains frozen. The newly authorized preservation branch adds one intentional ref, recorded separately rather than silently rewriting the snapshot.

C5-A files/classifications remain unchanged; C5-B outcomes are separate. Remote LFS availability and final retirement gates remain open. No script grants permissions or changes runtime, CI, deployment, refs or approval states.
