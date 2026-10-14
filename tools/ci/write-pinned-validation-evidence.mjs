import {
  fingerprintValidationInputs,
  writeValidationManifest,
  validationCommands,
  validationEvidenceName,
  validationToolchainFingerprint,
  validationRunFromEnvironment,
  lfsInventoryDigest,
  runtimeLockDigest,
  runtimeSourceTree,
} from './pinned-validation-evidence.mjs';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const runtimeRoot = process.env.RUNTIME_ROOT ?? 'runtime-src';
const sourceSha = process.env.PIN_SHA;
const runtimeId = process.env.PIN_ID;
const previewBase = process.env.PREVIEW_BASE;
const actualSha = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: runtimeRoot,
  encoding: 'utf8',
}).trim();
if (actualSha !== sourceSha)
  throw new Error(`pinned source mismatch: ${actualSha} != ${sourceSha}`);
if (process.env.GITHUB_EVENT_NAME !== 'push' || process.env.GITHUB_REF !== 'refs/heads/main') {
  throw new Error('trusted validation evidence may only be written by a main push');
}
const ciSourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (ciSourceSha !== process.env.GITHUB_SHA)
  throw new Error(`CI checkout mismatch: ${ciSourceSha} != ${process.env.GITHUB_SHA}`);
const contract = fingerprintValidationInputs();
if (
  contract.contractSha256 !== process.env.VALIDATION_CONTRACT_SHA256 ||
  contract.workflowBlob !== process.env.VALIDATION_WORKFLOW_BLOB ||
  contract.lockSha256 !== process.env.VALIDATION_LOCK_SHA256
) {
  throw new Error('CI checkout validation inputs do not match the planned contract fingerprint');
}

const nodeVersion = execFileSync('node', ['--version'], { encoding: 'utf8' }).trim();
const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
const runnerImage = `${process.env.ImageOS ?? ''}/${process.env.ImageVersion ?? ''}`;
const toolchainSha256 = validationToolchainFingerprint({ nodeVersion, npmVersion, runnerImage });
const contractSha256 = process.env.VALIDATION_CONTRACT_SHA256;
const workflowBlob = process.env.VALIDATION_WORKFLOW_BLOB;
const contractLockSha256 = process.env.VALIDATION_LOCK_SHA256;
const details = {
  runtimeId,
  sourceSha,
  sourceTree: runtimeSourceTree(runtimeRoot),
  contractSha256,
  workflowBlob,
  contractLockSha256,
  runtimeLockSha256: runtimeLockDigest(runtimeRoot),
  lfsInventorySha256: lfsInventoryDigest(runtimeRoot),
  nodeVersion,
  npmVersion,
  runnerImage,
  toolchainSha256,
  commands: validationCommands(runtimeId, previewBase),
  run: validationRunFromEnvironment(),
};
if (details.sourceTree !== process.env.PIN_TREE_SHA)
  throw new Error('pinned runtime tree does not match the approved matrix identity');
if (details.runtimeLockSha256 !== process.env.PIN_LOCK_SHA256)
  throw new Error('pinned runtime lockfile does not match the approved matrix identity');
if (details.lfsInventorySha256 !== process.env.PIN_LFS_INVENTORY_SHA256)
  throw new Error('pinned runtime LFS inventory does not match the approved matrix identity');

const manifest = writeValidationManifest('validation-evidence/manifest.json', details);
const artifactName = validationEvidenceName(runtimeId, sourceSha, contractSha256, toolchainSha256);
if (process.env.GITHUB_OUTPUT)
  appendFileSync(process.env.GITHUB_OUTPUT, `artifact_name=${artifactName}\n`);
console.log(`Wrote trusted-evidence candidate ${artifactName} for ${manifest.sourceSha}`);
