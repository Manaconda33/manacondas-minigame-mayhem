import {
  appendEvidenceOutputs,
  restoreTrustedValidationEvidence,
  validationCommands,
  validationEvidenceName,
  validationToolchainFingerprint,
  trustedValidationJobName,
} from './pinned-validation-evidence.mjs';
import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const nodeVersion = execFileSync('node', ['--version'], { encoding: 'utf8' }).trim();
const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
const runnerImage = `${process.env.ImageOS ?? ''}/${process.env.ImageVersion ?? ''}`;
const toolchainSha256 = validationToolchainFingerprint({ nodeVersion, npmVersion, runnerImage });
const runtimeId = process.env.PIN_ID;
const sourceSha = process.env.PIN_SHA;
const contractSha256 = process.env.VALIDATION_CONTRACT_SHA256;
const workflowBlob = process.env.VALIDATION_WORKFLOW_BLOB;
const contractLockSha256 = process.env.VALIDATION_LOCK_SHA256;
const sourceTree = process.env.PIN_TREE_SHA;
const runtimeLockSha256 = process.env.PIN_LOCK_SHA256;
const lfsInventorySha256 = process.env.PIN_LFS_INVENTORY_SHA256;
const previewBase = process.env.PREVIEW_BASE;
const expected = {
  runtimeId,
  sourceSha,
  sourceTree,
  runtimeLockSha256,
  lfsInventorySha256,
  contractSha256,
  workflowBlob,
  contractLockSha256,
  nodeVersion,
  npmVersion,
  runnerImage,
  toolchainSha256,
  commands: validationCommands(runtimeId, previewBase),
  producerJobName: trustedValidationJobName(runtimeId),
  artifactName: validationEvidenceName(runtimeId, sourceSha, contractSha256, toolchainSha256),
};

const result = await restoreTrustedValidationEvidence({
  repository: process.env.GITHUB_REPOSITORY,
  token: process.env.GITHUB_TOKEN,
  expected,
  destination: `${process.env.RUNNER_TEMP}/pinned-validation-manifest.json`,
});
const reuse = Boolean(result.evidence);
const reason = result.reason ?? 'trusted evidence unavailable';
appendEvidenceOutputs({ reuse, reason });
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Pinned runtime evidence\n\n- Runtime: \`${runtimeId}\`\n- Source: \`${sourceSha}\`\n- Decision: ${reuse ? 'reused' : 'full validation required'}\n- Reason: ${reason}\n`,
  );
}
console.log(
  `${reuse ? 'Trusted evidence hit' : 'Trusted evidence miss'} for ${runtimeId}: ${reason}`,
);
