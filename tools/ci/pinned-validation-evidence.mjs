import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const WORKFLOW_PATH = '.github/workflows/trusted-pinned-runtime-validation.yml';
const EVIDENCE_SCHEMA = 1;

export function trustedValidationJobName(runtimeId) {
  return `trusted-pinned-runtime-validation (${runtimeId})`;
}

const REQUIRED_PRODUCER_STEPS = [
  'Check out trusted validation source',
  'Fingerprint main validation contract',
  'Check out exact pinned runtime',
  'Verify exact pinned source and LFS assets',
  'Set up validation Node.js',
  'Install pinned runtime dependencies',
  'Run full validation (exact pinned runtime)',
  'Write trusted validation evidence',
  'Publish trusted validation evidence',
];

export function validationToolchainFingerprint({ nodeVersion, npmVersion, runnerImage }) {
  return createHash('sha256')
    .update([nodeVersion, npmVersion, runnerImage].join('\0'))
    .digest('hex');
}

export function validationEvidenceName(runtimeId, sourceSha, contractSha256, toolchainSha256) {
  return `pinned-validation-v${EVIDENCE_SCHEMA}-${runtimeId}-${sourceSha}-${contractSha256}-${toolchainSha256}`;
}

export function validationCommands(runtimeId, previewBase) {
  const previewBuild = `npm run build -- --base ${previewBase}`;
  const common = [
    'git lfs fsck',
    'test "$(git rev-parse HEAD)" = "$PIN_SHA"',
    'test "$(git rev-parse \'HEAD^{tree}\')" = "$PIN_TREE_SHA"',
    'echo "$PIN_LOCK_SHA256  package-lock.json" | sha256sum --check',
    'test "$(git lfs ls-files -l | sed -E \'s/^([0-9a-f]{64}) [*+-] /\\1 /\' | sha256sum | cut -d\' \' -f1)" = "$PIN_LFS_INVENTORY_SHA256"',
    'npm ci',
  ];
  const commands = {
    billboard: [
      'npm run typecheck',
      'npm run lint',
      'npm run test:ci -- --testTimeout=15000',
      'npm run build',
      previewBuild,
    ],
    dive: ['npm run validate', previewBuild],
    far300: [
      'npm run typecheck',
      'npm run lint',
      'npm run test:ci -- --testTimeout=15000',
      'npm run build',
      'git diff --check',
      previewBuild,
    ],
    'abyss-fog-004': [
      'npm run typecheck',
      'npm run lint',
      'npm run test:ci -- --maxWorkers=1 --testTimeout=15000',
      'npm run build',
      previewBuild,
    ],
  }[runtimeId];
  if (!commands) throw new Error(`unknown pinned runtime: ${runtimeId}`);
  return [...common, ...commands];
}

const isSha = (value, length = 40) =>
  typeof value === 'string' && new RegExp(`^[0-9a-f]{${length}}$`, 'i').test(value);
const isSha256 = (value) => isSha(value, 64);
const normalizeWorkflowPath = (value) => (typeof value === 'string' ? value.split('@', 1)[0] : '');

export function decideValidationReuse({ artifact, evidence, run, producerJob, expected }) {
  const miss = (reason) => ({ reuse: false, reason });
  if (!artifact || !evidence || !run || !expected) return miss('trusted evidence is missing');
  if (!Number.isSafeInteger(artifact.id) || artifact.expired !== false)
    return miss('artifact is missing, expired, or malformed');
  if (artifact.name !== expected.artifactName)
    return miss('artifact name does not match the exact evidence key');
  if (!/^sha256:[0-9a-f]{64}$/i.test(artifact.digest ?? ''))
    return miss('artifact digest is missing or malformed');
  if (artifact.workflowRunId !== run.id)
    return miss('artifact and workflow run provenance do not match');

  if (
    run.event !== 'push' ||
    run.branch !== 'main' ||
    run.status !== 'completed' ||
    run.conclusion !== 'success'
  ) {
    return miss('trusted validation workflow run is not a completed successful push to main');
  }
  if (normalizeWorkflowPath(run.workflowPath) !== WORKFLOW_PATH || !isSha(run.headSha)) {
    return miss('workflow path or main-run commit is not trusted');
  }
  if (
    !producerJob ||
    producerJob.runId !== run.id ||
    producerJob.runAttempt !== run.attempt ||
    producerJob.name !== expected.producerJobName ||
    producerJob.status !== 'completed' ||
    producerJob.conclusion !== 'success'
  ) {
    return miss('exact pinned-runtime producer job is missing or unsuccessful');
  }
  const successfulSteps = new Set(
    (Array.isArray(producerJob.steps) ? producerJob.steps : [])
      .filter((step) => step?.status === 'completed' && step?.conclusion === 'success')
      .map((step) => step.name),
  );
  if (REQUIRED_PRODUCER_STEPS.some((name) => !successfulSteps.has(name))) {
    return miss('trusted producer did not complete every required source, test, and evidence step');
  }

  if (
    evidence.schema !== EVIDENCE_SCHEMA ||
    evidence.status !== 'success' ||
    evidence.completed !== true ||
    evidence.exitCode !== 0
  ) {
    return miss('validation manifest is failed, incomplete, or unsupported');
  }
  if (
    evidence.runtimeId !== expected.runtimeId ||
    evidence.sourceSha !== expected.sourceSha ||
    !isSha(evidence.sourceTree) ||
    evidence.sourceTree !== expected.sourceTree
  ) {
    return miss('pinned runtime commit or tree does not match');
  }
  if (
    evidence.contractSha256 !== expected.contractSha256 ||
    evidence.workflowBlob !== expected.workflowBlob ||
    evidence.toolchainSha256 !== expected.toolchainSha256
  ) {
    return miss('validation contract or workflow identity changed');
  }
  if (
    !isSha256(evidence.contractLockSha256) ||
    evidence.contractLockSha256 !== expected.contractLockSha256
  ) {
    return miss('current dependency lock identity changed');
  }
  if (
    !isSha256(evidence.runtimeLockSha256) ||
    evidence.runtimeLockSha256 !== expected.runtimeLockSha256 ||
    !isSha256(evidence.lfsInventorySha256) ||
    !isSha256(expected.lfsInventorySha256) ||
    evidence.lfsInventorySha256 !== expected.lfsInventorySha256
  ) {
    return miss('pinned dependency lock or exact verified asset inventory does not match');
  }
  if (
    evidence.nodeVersion !== expected.nodeVersion ||
    evidence.npmVersion !== expected.npmVersion ||
    evidence.runnerImage !== expected.runnerImage
  ) {
    return miss('Node, npm, or runner toolchain changed');
  }
  if (JSON.stringify(evidence.commands) !== JSON.stringify(expected.commands)) {
    return miss('validation command contract is incomplete or changed');
  }

  const manifestRun = evidence.workflowRun;
  if (
    !manifestRun ||
    manifestRun.id !== run.id ||
    manifestRun.event !== 'push' ||
    manifestRun.branch !== 'main' ||
    manifestRun.ref !== 'refs/heads/main' ||
    manifestRun.workflowPath !== WORKFLOW_PATH ||
    manifestRun.sha !== run.headSha ||
    manifestRun.attempt !== run.attempt ||
    manifestRun.producerJobName !== expected.producerJobName
  ) {
    return miss('manifest does not bind to this exact trusted validation workflow and job');
  }

  return {
    reuse: true,
    reason:
      'exact validation artifact verified against successful independent main validation provenance',
  };
}

async function getJson(fetchImpl, url, token) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub Actions API returned HTTP ${response.status}`);
  return response.json();
}

function mapRun(run) {
  return {
    id: run.id,
    event: run.event,
    branch: run.head_branch,
    status: run.status,
    conclusion: run.conclusion,
    workflowPath: run.path,
    headSha: run.head_sha,
    attempt: run.run_attempt,
  };
}

function mapProducerJob(job) {
  return {
    id: job.id,
    runId: job.run_id,
    runAttempt: job.run_attempt,
    name: job.name,
    status: job.status,
    conclusion: job.conclusion,
    steps: Array.isArray(job.steps)
      ? job.steps.map((step) => ({
          name: step.name,
          status: step.status,
          conclusion: step.conclusion,
        }))
      : [],
  };
}

function githubApi(repository, path) {
  return `https://api.github.com/repos/${repository}/${path}`;
}

async function inspectArtifact({ fetchImpl, repository, token, artifact, expected }) {
  if (artifact.name !== expected.artifactName || artifact.expired || !artifact.workflow_run?.id)
    return null;
  const runData = await getJson(
    fetchImpl,
    githubApi(repository, `actions/runs/${artifact.workflow_run.id}`),
    token,
  );
  const run = mapRun(runData);
  const jobsData = await getJson(
    fetchImpl,
    githubApi(repository, `actions/runs/${artifact.workflow_run.id}/jobs?per_page=100`),
    token,
  );
  if (!Array.isArray(jobsData.jobs)) throw new Error('trusted producer job list is malformed');
  const matchingJobs = jobsData.jobs.filter((job) => job.name === expected.producerJobName);
  if (matchingJobs.length !== 1) {
    return {
      metadata: null,
      run,
      producerJob: null,
      reason: 'exact pinned-runtime producer job is missing or ambiguous',
    };
  }
  const producerJob = mapProducerJob(matchingJobs[0]);
  const metadata = {
    id: artifact.id,
    name: artifact.name,
    expired: artifact.expired,
    digest: artifact.digest,
    workflowRunId: artifact.workflow_run.id,
  };
  const candidateEvidence = {
    schema: EVIDENCE_SCHEMA,
    status: 'success',
    completed: true,
    exitCode: 0,
    runtimeId: expected.runtimeId,
    sourceSha: expected.sourceSha,
    sourceTree: expected.sourceTree,
    contractSha256: expected.contractSha256,
    workflowBlob: expected.workflowBlob,
    contractLockSha256: expected.contractLockSha256,
    runtimeLockSha256: expected.runtimeLockSha256,
    lfsInventorySha256: expected.lfsInventorySha256,
    nodeVersion: expected.nodeVersion,
    npmVersion: expected.npmVersion,
    runnerImage: expected.runnerImage,
    toolchainSha256: expected.toolchainSha256,
    commands: expected.commands,
    workflowRun: {
      id: run.id,
      event: run.event,
      branch: run.branch,
      ref: run.branch === 'main' ? 'refs/heads/main' : '',
      workflowPath: WORKFLOW_PATH,
      sha: run.headSha,
      attempt: run.attempt,
      producerJobName: producerJob.name,
    },
  };
  const provenance = decideValidationReuse({
    artifact: metadata,
    evidence: candidateEvidence,
    run,
    producerJob,
    expected: { ...expected, artifactName: expected.artifactName },
  });
  if (!provenance.reuse) return { metadata, run, producerJob, reason: provenance.reason };
  return { metadata, run, producerJob };
}

export async function findTrustedValidationArtifact({
  repository,
  token,
  expected,
  fetchImpl = fetch,
}) {
  if (!repository || !token || !expected?.artifactName)
    return {
      artifact: null,
      run: null,
      producerJob: null,
      reason: 'read-only GitHub Actions credentials are unavailable',
    };
  try {
    let rejectedReason;
    for (let page = 1; page <= 20; page += 1) {
      const url = githubApi(
        repository,
        `actions/artifacts?name=${encodeURIComponent(expected.artifactName)}&per_page=100&page=${page}`,
      );
      const data = await getJson(fetchImpl, url, token);
      const artifacts = Array.isArray(data.artifacts) ? data.artifacts : [];
      for (const candidate of artifacts) {
        const inspected = await inspectArtifact({
          fetchImpl,
          repository,
          token,
          artifact: candidate,
          expected,
        });
        if (!inspected) continue;
        if (inspected.reason) {
          rejectedReason = inspected.reason;
          continue;
        }
        return {
          artifact: inspected.metadata,
          run: inspected.run,
          producerJob: inspected.producerJob,
          reason: 'matching trusted main artifact is available',
        };
      }
      if (artifacts.length < 100 || page * 100 >= (data.total_count ?? 0)) break;
    }
    return {
      artifact: null,
      run: null,
      producerJob: null,
      reason: rejectedReason
        ? `candidate evidence rejected: ${rejectedReason}`
        : 'no completed successful independent main-validation artifact matches this source and contract',
    };
  } catch (error) {
    return {
      artifact: null,
      run: null,
      producerJob: null,
      reason: `evidence lookup failed closed: ${error.message}`,
    };
  }
}

export async function restoreTrustedValidationEvidence({
  repository,
  token,
  expected,
  destination,
  fetchImpl = fetch,
}) {
  const found = await findTrustedValidationArtifact({ repository, token, expected, fetchImpl });
  if (!found.artifact || !found.run || !found.producerJob) return { ...found, evidence: null };
  try {
    const response = await fetchImpl(
      githubApi(repository, `actions/artifacts/${found.artifact.id}/zip`),
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );
    if (!response.ok) throw new Error(`artifact download returned HTTP ${response.status}`);
    const zip = Buffer.from(await response.arrayBuffer());
    if (zip.length === 0 || zip.length > 1024 * 1024)
      throw new Error('artifact archive is empty or exceeds the 1 MiB evidence limit');
    const actualDigest = `sha256:${createHash('sha256').update(zip).digest('hex')}`;
    if (actualDigest !== found.artifact.digest)
      throw new Error('GitHub artifact archive digest mismatch');

    const scratch = join(tmpdir(), `ci-evidence-${found.artifact.id}`);
    mkdirSync(scratch, { recursive: true });
    const archive = join(scratch, 'evidence.zip');
    writeFileSync(archive, zip);
    const entries = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    if (entries.length !== 1 || entries[0] !== 'manifest.json')
      throw new Error('evidence artifact has an unexpected file layout');
    const manifestText = execFileSync('unzip', ['-p', archive, 'manifest.json'], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024,
    });
    const evidence = JSON.parse(manifestText);
    const decision = decideValidationReuse({
      artifact: found.artifact,
      evidence,
      run: found.run,
      producerJob: found.producerJob,
      expected,
    });
    if (!decision.reuse)
      return {
        artifact: null,
        run: null,
        evidence: null,
        reason: `evidence manifest rejected: ${decision.reason}`,
      };

    writeFileSync(destination, JSON.stringify(evidence, null, 2));
    return { ...found, evidence, reason: decision.reason };
  } catch (error) {
    return {
      artifact: null,
      run: null,
      evidence: null,
      reason: `evidence download/verification failed closed: ${error.message}`,
    };
  }
}

export function createValidationManifest({
  runtimeId,
  sourceSha,
  sourceTree,
  contractSha256,
  workflowBlob,
  contractLockSha256,
  runtimeLockSha256,
  lfsInventorySha256,
  nodeVersion,
  npmVersion,
  runnerImage,
  toolchainSha256,
  commands,
  run,
}) {
  if (!Array.isArray(commands) || commands.length === 0)
    throw new Error('complete validation command list is required');
  return {
    schema: EVIDENCE_SCHEMA,
    status: 'success',
    completed: true,
    exitCode: 0,
    runtimeId,
    sourceSha,
    sourceTree,
    contractSha256,
    workflowBlob,
    contractLockSha256,
    runtimeLockSha256,
    lfsInventorySha256,
    nodeVersion,
    npmVersion,
    runnerImage,
    toolchainSha256,
    commands,
    workflowRun: run,
  };
}

export function writeValidationManifest(outputPath, details) {
  const manifest = createValidationManifest(details);
  mkdirSync(outputPath.slice(0, outputPath.lastIndexOf('/')) || '.', { recursive: true });
  writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

export function validationRunFromEnvironment(env = process.env) {
  return {
    id: Number(env.GITHUB_RUN_ID),
    attempt: Number(env.GITHUB_RUN_ATTEMPT),
    event: env.GITHUB_EVENT_NAME,
    branch: env.GITHUB_REF_NAME,
    ref: env.GITHUB_REF,
    sha: env.GITHUB_SHA,
    workflowPath: WORKFLOW_PATH,
    producerJobName: env.TRUSTED_PRODUCER_JOB_NAME,
  };
}

export function lfsInventoryDigest(runtimeRoot) {
  const output = execFileSync('git', ['lfs', 'ls-files', '-l'], {
    cwd: runtimeRoot,
    encoding: 'utf8',
  });
  return createHash('sha256').update(normalizeLfsInventory(output)).digest('hex');
}

export function normalizeLfsInventory(output) {
  const lines = output.trimEnd().split('\n');
  const normalized = lines.map((line) => {
    const match = /^([0-9a-f]{64}) [*+-] (.+)$/.exec(line);
    if (!match) throw new Error('Git LFS inventory contains an unsupported record');
    return `${match[1]} ${match[2]}`;
  });
  return `${normalized.join('\n')}\n`;
}

export function runtimeSourceTree(runtimeRoot) {
  return execFileSync('git', ['rev-parse', 'HEAD^{tree}'], {
    cwd: runtimeRoot,
    encoding: 'utf8',
  }).trim();
}

export function runtimeLockDigest(runtimeRoot) {
  return createHash('sha256')
    .update(readFileSync(join(runtimeRoot, 'package-lock.json')))
    .digest('hex');
}

export function appendEvidenceOutputs({ reuse, reason }, outputPath = process.env.GITHUB_OUTPUT) {
  if (!outputPath) return;
  const safeReason = reason.replace(/[\r\n]/g, ' ');
  appendFileSync(outputPath, `reuse=${reuse}\nreason=${safeReason}\n`);
}
