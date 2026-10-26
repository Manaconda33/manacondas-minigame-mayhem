# R2.13A/B/C — v1 backup recovery owner exception

**Date:** 2026-10-26

**Production baseline:** `0cac7f00294be5009b4d3b41a484ecc02a9f9955`

**Disposition:** **OWNER ACCEPTED BY EXCEPTION** for the v1 rollback/backup gate in PRD §§38.2–38.3.

Manny accepts the two existing independently verified, private Google Drive recovery packages as sufficient for this v1 checkpoint. The exception acknowledges that the immediately preceding production artifact was not retained and that Drive has no independently verified immutable/write-once retention. It does not convert the technical gaps into a PASS, amend future rollback requirements, or complete formal v1 acceptance.

## Current production recovery point

- Source commit: `0cac7f00294be5009b4d3b41a484ecc02a9f9955`
- Archive size: **211,133,480 bytes**
- Archive SHA-256: `5e274c3a61de61fae0fd6b92e5fd0cc0399458326cc526a55bb0d048ee04d987`
- **417** production files independently verified after retrieval and restoration.
- Reconstructed from the live HTTPS production root. This is not the original GitHub Actions `production-dist` ZIP and is not represented as byte-identical to that ZIP.
- Local static-browser restoration smoke reached the Circuit Alpha countdown.

Private owner-only Drive records:

- [Current recovery package folder](https://drive.google.com/drive/folders/1m6pqwong_j7VzD0itl_iTYxTBQ18Jkg0)
- [Archive manifest](https://drive.google.com/file/d/1jnsf5ammS5mMa4v_AQqcKLS7we16gwmw/view)
- [Per-file SHA-256 manifest](https://drive.google.com/file/d/1yDfPwv0-UL1GOnKd5P9yuowYXUq1iSy7/view)
- [Provenance record](https://drive.google.com/file/d/1RF6eM3PjX4_qua-KnYkLsUuTm4ytHe_B/view)
- [Restore instructions](https://drive.google.com/file/d/1khUIZFStzGgiDqeJIDIFtxurnpBSwtSW/view)
- [Source HTTPS inventory](https://drive.google.com/file/d/11dmc3oBlfMMM9wQVeEuTUXimrMOMTYjk/view)

The parent [private release-backups folder](https://drive.google.com/drive/folders/1ES-2RllrDWoqnY5PbOpAFImdVEHWDCTX) is owner-controlled. These links identify existing records; they do not provide public access or establish retention lock.

## Older historical recovery point

- Source commit: `5df72b270e231790f31121496a10cd58d71378f6`
- Reconstructed production-root archive SHA-256: `0e3907baa48d6557f6a80e3320e124a8f7a31a2989fda797bfe1504dc23c4cde`
- **412** production files verified.
- Recovery package has limited browser-restoration evidence. It is not claimed byte-identical to its original GitHub Actions archive.
- Existing package parts and manifests remain in the [private release-backups folder](https://drive.google.com/drive/folders/1ES-2RllrDWoqnY5PbOpAFImdVEHWDCTX): [archive manifest JSON](https://drive.google.com/file/d/1nS9HWRtD7vXxxLov1_QXxds166qdQ3Kp/view), [archive checksum manifest](https://drive.google.com/file/d/1KXBnGzawtW_jXC64sNXl1W8Lc9cJ5VDC/view), and the nine `manacondas-production-5df72b2-39999642793.tar.gz.part-001` through `part-009` records.

## Restore and verify

For the current package, retrieve all archive parts listed by its archive manifest in the recorded order. Concatenate without recompression, verify the resulting archive SHA-256 against the value above and the manifest, then extract to a new empty directory. From the extracted archive root, verify each file using the supplied per-file manifest:

```sh
sha256sum -c RECOVERY/SHA256SUMS
```

For the older package, retrieve parts in the order and with the checksums listed by `backup-archive-manifest.json`; verify the aggregate archive checksum against `backup-archive-manifest.sha256`, extract into a separate empty directory, then follow that package's recorded per-file verification instructions. Keep both restore locations separate. These are non-destructive local recovery steps; do not deploy recovered files as part of this evidence record.

## Accepted gaps and boundaries

- The immediately preceding production artifact for `12e996ff5b77b3cbfdd5973aabae75f7ca89fa70` was not preserved. Its status remains unresolved; it is not replaced by a claim about either package above. See the existing [predecessor-artifact status record](https://drive.google.com/file/d/1H9BBqSFXyyLC7i98V49IK_cAnpXxis3q/view).
- No verified write-once/immutable retention lock exists for these Drive files. Owner-only access and durable storage are not immutability.
- Neither reconstructed package is claimed byte-identical to the original Actions ZIP.
- The packages cover production roots, not all published historical preview files or their full Pages artifact.
- No additional storage service, paid subscription, cloud bucket, or backup spending is authorized.

Manny's October 26, 2026 product-owner decision accepts these conditions **only for the v1 backup gate**. Original §§38.2–38.3 rollback requirements remain for future release engineering unless separately amended. The separate G-05 exception is recorded under PRD amendment 2.32 and is not modified here. **Formal v1 release acceptance remains pending the Pages packaging assessment and item-by-item PRD §37 reconciliation.** See the [R2 release checklist](../2026-10-23-release-readiness-r1/r2-evidence-checklist.md).
