import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classifyChanges, parseRawDiff } from '../tools/ci/pr-change-classifier.mjs';
import { fingerprintValidationInputs } from '../tools/ci/validation-input-fingerprint.mjs';
import {
  decideValidationReuse,
  findTrustedValidationArtifact,
  normalizeLfsInventory,
  restoreTrustedValidationEvidence,
  validationCommands,
  validationEvidenceName,
  validationToolchainFingerprint,
  validationRunFromEnvironment,
} from '../tools/ci/pinned-validation-evidence.mjs';

const changed = (status: string, path: string, previousPath?: string) => ({
  status,
  path,
  previousPath,
  oldMode: status === 'added' ? '000000' : '100644',
  newMode: status === 'removed' ? '000000' : '100644',
});

const requestUrl = (input: string | URL | Request): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

const trustedRun = {
  id: 712345,
  event: 'push',
  branch: 'main',
  status: 'completed',
  conclusion: 'success',
  workflowPath: '.github/workflows/trusted-pinned-runtime-validation.yml',
  headSha: 'a'.repeat(40),
  attempt: 1,
};

const trustedProducerJob = {
  id: 712346,
  runId: trustedRun.id,
  runAttempt: trustedRun.attempt,
  name: 'trusted-pinned-runtime-validation (abyss-fog-004)',
  status: 'completed',
  conclusion: 'success',
  steps: [
    'Check out trusted validation source',
    'Fingerprint main validation contract',
    'Check out exact pinned runtime',
    'Verify exact pinned source and LFS assets',
    'Set up validation Node.js',
    'Install pinned runtime dependencies',
    'Run full validation (exact pinned runtime)',
    'Write trusted validation evidence',
    'Publish trusted validation evidence',
  ].map((name) => ({ name, status: 'completed', conclusion: 'success' })),
};

const trustedApiProducerJob = {
  id: trustedProducerJob.id,
  run_id: trustedProducerJob.runId,
  run_attempt: trustedProducerJob.runAttempt,
  name: trustedProducerJob.name,
  status: trustedProducerJob.status,
  conclusion: trustedProducerJob.conclusion,
  steps: trustedProducerJob.steps,
};

const expected = {
  runtimeId: 'abyss-fog-004',
  sourceSha: '25ea008b15852d593681f5b3b2a17b467a193472',
  sourceTree: 'b'.repeat(40),
  runtimeLockSha256: '2'.repeat(64),
  lfsInventorySha256: '234d0e7336e2d824e9af54f107a2628ce544b42a2260bafb2d32d8e807c765bc',
  contractSha256: 'c'.repeat(64),
  workflowBlob: 'd'.repeat(40),
  contractLockSha256: 'e'.repeat(64),
  nodeVersion: 'v22.23.1',
  npmVersion: '10.9.2',
  runnerImage: 'ubuntu24/20261010.1',
  toolchainSha256: validationToolchainFingerprint({
    nodeVersion: 'v22.23.1',
    npmVersion: '10.9.2',
    runnerImage: 'ubuntu24/20261010.1',
  }),
  artifactName: validationEvidenceName(
    'abyss-fog-004',
    '25ea008b15852d593681f5b3b2a17b467a193472',
    'c'.repeat(64),
    validationToolchainFingerprint({
      nodeVersion: 'v22.23.1',
      npmVersion: '10.9.2',
      runnerImage: 'ubuntu24/20261010.1',
    }),
  ),
  commands: validationCommands(
    'abyss-fog-004',
    '/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-004/',
  ),
  producerJobName: 'trusted-pinned-runtime-validation (abyss-fog-004)',
};

const evidence = {
  schema: 1,
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
  nodeVersion: expected.nodeVersion,
  npmVersion: expected.npmVersion,
  runnerImage: expected.runnerImage,
  toolchainSha256: expected.toolchainSha256,
  lfsInventorySha256: expected.lfsInventorySha256,
  commands: expected.commands,
  workflowRun: {
    id: trustedRun.id,
    attempt: trustedRun.attempt,
    event: trustedRun.event,
    branch: trustedRun.branch,
    ref: 'refs/heads/main',
    workflowPath: trustedRun.workflowPath,
    sha: trustedRun.headSha,
    producerJobName: trustedProducerJob.name,
  },
};

describe('CI change classification', () => {
  it('binds trusted evidence to the independent producer workflow blob and invalidates changes to it', () => {
    const root = mkdtempSync(join(tmpdir(), 'trusted-ci-contract-'));
    const git = (...args: string[]): void => {
      execFileSync('git', ['-C', root, ...args]);
    };
    try {
      mkdirSync(join(root, '.github/workflows'), { recursive: true });
      writeFileSync(join(root, 'package-lock.json'), '{}\n');
      writeFileSync(join(root, '.github/workflows/ci.yml'), 'name: CI\n');
      writeFileSync(
        join(root, '.github/workflows/trusted-pinned-runtime-validation.yml'),
        'name: Trusted A\n',
      );
      git('init', '-q');
      git('config', 'user.name', 'CI contract test');
      git('config', 'user.email', 'ci-contract@example.invalid');
      git('add', '.');
      git('commit', '-qm', 'fixture A');

      const first = fingerprintValidationInputs(root);
      writeFileSync(
        join(root, '.github/workflows/trusted-pinned-runtime-validation.yml'),
        'name: Trusted B\n',
      );
      git('add', '.');
      git('commit', '-qm', 'fixture B');
      const second = fingerprintValidationInputs(root);

      expect(second.workflowBlob).not.toBe(first.workflowBlob);
      expect(second.contractSha256).not.toBe(first.contractSha256);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('takes the fast path for a README-only change', () => {
    expect(
      classifyChanges({ complete: true, records: [changed('modified', 'README.md')] }).docsOnly,
    ).toBe(true);
  });

  it('takes the fast path for Markdown planning changes', () => {
    expect(
      classifyChanges({
        complete: true,
        records: [
          changed('added', 'docs/design/new-plan.md'),
          changed('modified', 'docs/superpowers/plans/current.md'),
        ],
      }).docsOnly,
    ).toBe(true);
  });

  it.each([
    ['runtime TypeScript', 'modified', 'src/game/race/Race.ts'],
    ['test contract', 'modified', 'tests/race.test.ts'],
    ['workflow', 'modified', '.github/workflows/ci.yml'],
    ['CI helper', 'modified', 'tools/ci/pr-change-classifier.mjs'],
    ['dependency/toolchain', 'modified', 'package-lock.json'],
    ['runtime asset', 'added', 'public/assets/track/new.png'],
    ['generated document', 'added', 'docs/design/generated/report.md'],
    ['governance contract', 'modified', 'docs/TESTING.md'],
  ])('runs full validation for %s changes', (_name, status, path) => {
    expect(classifyChanges({ complete: true, records: [changed(status, path)] }).docsOnly).toBe(
      false,
    );
  });

  it('checks both old and new paths for renames and permits only planning-document renames', () => {
    expect(
      classifyChanges({
        complete: true,
        records: [
          {
            ...changed('renamed', 'docs/design/new.md', 'docs/design/old.md'),
            oldMode: '100644',
            newMode: '100644',
          },
        ],
      }).docsOnly,
    ).toBe(true);
    expect(
      classifyChanges({
        complete: true,
        records: [
          {
            ...changed('renamed', 'src/new.ts', 'docs/design/old.md'),
            oldMode: '100644',
            newMode: '100644',
          },
        ],
      }).docsOnly,
    ).toBe(false);
  });

  it('allows deletion only inside the documentation planning allowlist', () => {
    expect(
      classifyChanges({ complete: true, records: [changed('removed', 'docs/design/retired.md')] })
        .docsOnly,
    ).toBe(true);
    expect(
      classifyChanges({ complete: true, records: [changed('removed', 'tools/verify.mjs')] })
        .docsOnly,
    ).toBe(false);
  });

  it('fails closed for incomplete diffs, unsupported statuses, unsafe paths, and mode changes', () => {
    expect(classifyChanges({ complete: false, records: [] }).docsOnly).toBe(false);
    expect(classifyChanges({ complete: true, records: [] }).docsOnly).toBe(false);
    expect(
      classifyChanges({ complete: true, records: [changed('copied', 'docs/design/copy.md')] })
        .docsOnly,
    ).toBe(false);
    expect(
      classifyChanges({ complete: true, records: [changed('modified', '../README.md')] }).docsOnly,
    ).toBe(false);
    expect(
      classifyChanges({
        complete: true,
        records: [{ ...changed('modified', 'README.md'), oldMode: '100755' }],
      }).docsOnly,
    ).toBe(false);
  });

  it('parses NUL-delimited add, delete, and rename records without losing either pathname or mode', () => {
    const raw = [
      `:000000 100644 ${'0'.repeat(40)} ${'1'.repeat(40)} A\0docs/design/added.md\0`,
      `:100644 000000 ${'1'.repeat(40)} ${'0'.repeat(40)} D\0docs/design/removed.md\0`,
      `:100644 100644 ${'1'.repeat(40)} ${'2'.repeat(40)} R100\0docs/design/old plan.md\0docs/design/new plan.md\0`,
    ].join('');
    const records = parseRawDiff(raw);
    expect(records.map(({ status }) => status)).toEqual(['added', 'removed', 'renamed']);
    expect(records[2]).toMatchObject({
      previousPath: 'docs/design/old plan.md',
      path: 'docs/design/new plan.md',
    });
    expect(classifyChanges({ complete: true, records }).docsOnly).toBe(true);
  });
});

describe('trusted immutable-runtime validation evidence', () => {
  const completeArtifact = {
    id: 998877,
    name: expected.artifactName,
    expired: false,
    digest: `sha256:${'1'.repeat(64)}`,
    workflowRunId: trustedRun.id,
  };

  it('normalizes LFS inventory independently of local materialization markers', () => {
    const oid = 'a'.repeat(64);
    const materialized = `${oid} * public/assets/track/test.glb\n`;
    const pointerOnly = `${oid} - public/assets/track/test.glb\n`;
    expect(normalizeLfsInventory(materialized)).toBe(normalizeLfsInventory(pointerOnly));
    expect(normalizeLfsInventory(`${oid} * public/assets/track/other.glb\n`)).not.toBe(
      normalizeLfsInventory(pointerOnly),
    );
    expect(() => normalizeLfsInventory('not-an-lfs-record\n')).toThrow('unsupported record');
  });

  it('uses an exact successful source-pinned artifact from a trusted main push', () => {
    expect(expected.commands).toContain('npm ci');
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence,
        run: trustedRun,
        producerJob: trustedProducerJob,
        expected,
      }).reuse,
    ).toBe(true);
  });

  it('does not claim workflow completion before GitHub reports the final outcome', () => {
    const run = validationRunFromEnvironment({
      GITHUB_RUN_ID: String(trustedRun.id),
      GITHUB_RUN_ATTEMPT: String(trustedRun.attempt),
      GITHUB_EVENT_NAME: 'push',
      GITHUB_REF_NAME: 'main',
      GITHUB_REF: 'refs/heads/main',
      GITHUB_SHA: trustedRun.headSha,
      TRUSTED_PRODUCER_JOB_NAME: trustedProducerJob.name,
    });
    expect(run).toMatchObject({
      id: trustedRun.id,
      workflowPath: trustedRun.workflowPath,
      producerJobName: trustedProducerJob.name,
    });
    expect(run).not.toHaveProperty('status');
    expect(run).not.toHaveProperty('conclusion');
  });

  it('rejects Pages-workflow artifacts even when their main-run application checks succeeded', () => {
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence,
        run: { ...trustedRun, workflowPath: '.github/workflows/ci.yml' },
        producerJob: trustedProducerJob,
        expected,
      }).reuse,
    ).toBe(false);
  });

  it('requires the exact trusted producer job and every evidence-producing step to succeed', () => {
    for (const producerJob of [
      { ...trustedProducerJob, status: 'in_progress', conclusion: null },
      { ...trustedProducerJob, conclusion: 'failure' },
      { ...trustedProducerJob, name: 'validate (abyss-fog-004)' },
      {
        ...trustedProducerJob,
        steps: trustedProducerJob.steps.map((step) =>
          step.name === 'Run full validation (exact pinned runtime)'
            ? { ...step, conclusion: 'skipped' }
            : step,
        ),
      },
      {
        ...trustedProducerJob,
        steps: trustedProducerJob.steps.map((step) =>
          step.name === 'Publish trusted validation evidence'
            ? { ...step, conclusion: 'failure' }
            : step,
        ),
      },
    ]) {
      expect(
        decideValidationReuse({
          artifact: completeArtifact,
          evidence,
          run: trustedRun,
          producerJob,
          expected,
        }).reuse,
      ).toBe(false);
    }
  });

  it('rejects an artifact attached to an untrusted PR run during the GitHub API lookup', async () => {
    const artifact = {
      id: 998877,
      name: expected.artifactName,
      expired: false,
      digest: `sha256:${'1'.repeat(64)}`,
      workflow_run: { id: 712345 },
    };
    const fetchImpl = (url: string | URL | Request) => {
      const href = requestUrl(url);
      if (href.includes('/actions/artifacts?')) {
        return Promise.resolve(
          new Response(JSON.stringify({ artifacts: [artifact], total_count: 1 }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      if (href.endsWith('/jobs?per_page=100')) {
        return Promise.resolve(
          new Response(JSON.stringify({ jobs: [trustedApiProducerJob] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            id: trustedRun.id,
            event: 'pull_request',
            head_branch: 'untrusted/contributor',
            status: 'completed',
            conclusion: 'success',
            path: '.github/workflows/ci.yml',
            head_sha: trustedRun.headSha,
            run_attempt: trustedRun.attempt,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    };

    const result = await findTrustedValidationArtifact({
      repository: 'Manaconda33/manacondas-minigame-mayhem',
      token: 'read-only-fixture',
      expected,
      fetchImpl,
    });
    expect(result.artifact).toBeNull();
    expect(result.run).toBeNull();
  });

  it('locates only a completed main trusted-producer artifact with the exact successful matrix job', async () => {
    const artifact = {
      id: completeArtifact.id,
      name: expected.artifactName,
      expired: false,
      digest: completeArtifact.digest,
      workflow_run: { id: trustedRun.id },
    };
    const fetchImpl = (url: string | URL | Request) => {
      const href = requestUrl(url);
      if (href.includes('/actions/artifacts?'))
        return Promise.resolve(
          new Response(JSON.stringify({ artifacts: [artifact], total_count: 1 })),
        );
      if (href.endsWith('/jobs?per_page=100'))
        return Promise.resolve(new Response(JSON.stringify({ jobs: [trustedApiProducerJob] })));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            id: trustedRun.id,
            event: trustedRun.event,
            head_branch: trustedRun.branch,
            status: trustedRun.status,
            conclusion: trustedRun.conclusion,
            path: trustedRun.workflowPath,
            head_sha: trustedRun.headSha,
            run_attempt: trustedRun.attempt,
          }),
        ),
      );
    };

    const result = await findTrustedValidationArtifact({
      repository: 'Manaconda33/manacondas-minigame-mayhem',
      token: 'read-only-fixture',
      expected,
      fetchImpl,
    });
    expect(result.artifact).toMatchObject({ id: completeArtifact.id, name: expected.artifactName });
    expect(result.producerJob).toMatchObject({
      name: expected.producerJobName,
      status: 'completed',
      conclusion: 'success',
    });
  });

  it('fails closed when the downloaded GitHub artifact digest does not match', async () => {
    const artifact = {
      id: 998877,
      name: expected.artifactName,
      expired: false,
      digest: `sha256:${'1'.repeat(64)}`,
      workflow_run: { id: trustedRun.id },
    };
    const fetchImpl = (url: string | URL | Request) => {
      const href = requestUrl(url);
      if (href.includes('/actions/artifacts?')) {
        return Promise.resolve(
          new Response(JSON.stringify({ artifacts: [artifact], total_count: 1 }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      if (href.endsWith('/zip'))
        return Promise.resolve(new Response('altered evidence archive', { status: 200 }));
      if (href.endsWith('/jobs?per_page=100'))
        return Promise.resolve(
          new Response(JSON.stringify({ jobs: [trustedApiProducerJob] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      return Promise.resolve(
        new Response(
          JSON.stringify({
            id: trustedRun.id,
            event: trustedRun.event,
            head_branch: trustedRun.branch,
            status: trustedRun.status,
            conclusion: trustedRun.conclusion,
            path: trustedRun.workflowPath,
            head_sha: trustedRun.headSha,
            run_attempt: trustedRun.attempt,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    };

    const result = await restoreTrustedValidationEvidence({
      repository: 'Manaconda33/manacondas-minigame-mayhem',
      token: 'read-only-fixture',
      expected,
      destination: '/tmp/ci-validation-optimization-test-manifest.json',
      fetchImpl,
    });
    expect(result.evidence).toBeNull();
    expect(result.reason).toContain('artifact archive digest mismatch');
  });

  it('runs validation when evidence is missing or artifact provenance is unavailable', () => {
    expect(
      decideValidationReuse({
        artifact: null,
        evidence: null,
        run: null,
        producerJob: null,
        expected,
      }).reuse,
    ).toBe(false);
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence,
        run: null,
        producerJob: null,
        expected,
      }).reuse,
    ).toBe(false);
  });

  it('rejects wrong source, fingerprint, lockfile, workflow, toolchain, artifact, or asset inventory', () => {
    for (const patch of [
      { evidence: { ...evidence, sourceSha: 'f'.repeat(40) } },
      { evidence: { ...evidence, contractSha256: 'f'.repeat(64) } },
      { evidence: { ...evidence, contractLockSha256: 'f'.repeat(64) } },
      { evidence: { ...evidence, runtimeLockSha256: '' } },
      { evidence: { ...evidence, lfsInventorySha256: 'f'.repeat(64) } },
      { evidence: { ...evidence, workflowBlob: 'f'.repeat(40) } },
      {
        evidence: {
          ...evidence,
          workflowRun: { ...evidence.workflowRun, producerJobName: 'validate' },
        },
      },
      { evidence: { ...evidence, nodeVersion: 'v22.24.0' } },
      { evidence: { ...evidence, npmVersion: '11.0.0' } },
      { evidence: { ...evidence, lfsInventorySha256: '' } },
      { artifact: { ...completeArtifact, name: 'user-supplied-passed-marker' } },
      { artifact: { ...completeArtifact, expired: true } },
      { artifact: { ...completeArtifact, workflowRunId: trustedRun.id + 1 } },
    ]) {
      expect(
        decideValidationReuse({
          artifact: completeArtifact,
          evidence,
          run: trustedRun,
          producerJob: trustedProducerJob,
          expected,
          ...patch,
        }).reuse,
      ).toBe(false);
    }
  });

  it('does not accept evidence uploaded by an untrusted pull-request run', () => {
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence,
        expected,
        producerJob: trustedProducerJob,
        run: { ...trustedRun, event: 'pull_request', branch: 'contributor/ci' },
      }).reuse,
    ).toBe(false);
  });

  it('rejects failed, cancelled, in-progress, or incomplete validation', () => {
    for (const run of [
      { ...trustedRun, conclusion: 'failure' },
      { ...trustedRun, conclusion: 'cancelled' },
      { ...trustedRun, status: 'in_progress' },
    ]) {
      expect(
        decideValidationReuse({
          artifact: completeArtifact,
          evidence,
          run,
          producerJob: trustedProducerJob,
          expected,
        }).reuse,
      ).toBe(false);
    }
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence: { ...evidence, commands: evidence.commands.slice(0, -1) },
        run: trustedRun,
        producerJob: trustedProducerJob,
        expected,
      }).reuse,
    ).toBe(false);
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence: { ...evidence, status: 'incomplete' },
        run: trustedRun,
        producerJob: trustedProducerJob,
        expected,
      }).reuse,
    ).toBe(false);
  });

  it('keeps existing check identities and avoids path-filter or privileged PR triggers', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
    const producer = readFileSync(
      '.github/workflows/trusted-pinned-runtime-validation.yml',
      'utf8',
    );
    for (const job of [
      'validate:',
      'preview-plan:',
      'preview-build:',
      'pinned-runtime-validation:',
      'spillway-render:',
    ]) {
      expect(workflow).toContain(`  ${job}`);
    }
    expect(workflow).not.toMatch(/^\s+paths(-ignore)?:/m);
    expect(workflow).not.toContain('pull_request_target');
    expect(workflow).toContain('docs-only fast path');
    expect(workflow).toContain('run full validation on miss');
    expect(workflow).toContain("steps.validation-evidence.outputs.reuse != 'true'");
    expect(workflow).toContain(
      `test "$(git lfs ls-files -l | sed -E 's/^([0-9a-f]{64}) [*+-] /\\1 /' | sha256sum | cut -d' ' -f1)" = "$PIN_LFS_INVENTORY_SHA256"`,
    );
    expect(workflow).toContain('Report documentation-only preview-build skip');
    expect(workflow).toContain('Report documentation-only pinned-validation skip');
    expect(workflow).toContain('Report documentation-only spillway skip');
    expect(workflow).toContain('Check out trusted target-branch CI helpers');
    expect(workflow).toContain('node trusted-ci/tools/ci/pr-change-classifier.mjs');
    expect(workflow).toContain('node trusted-ci/tools/ci/validation-input-fingerprint.mjs');
    expect(workflow).toContain('Trusted evidence verifier unavailable');
    expect(workflow).not.toContain('pinned-runtime-validation-v1-');
    expect(workflow).toContain('actions: read');
    expect(workflow).toContain('  validate:\n    name: validate');
    expect(workflow).toContain('name: preview-build (${{ matrix.id }})');
    expect(workflow).toContain('name: pinned-runtime-validation (${{ matrix.id }})');
    expect(workflow).toContain(
      "  pinned-runtime-validation:\n    name: pinned-runtime-validation (${{ matrix.id }})\n    if: always() && github.event_name == 'pull_request'",
    );
    expect(workflow).not.toContain('name: Write trusted validation evidence');
    expect(workflow).not.toContain('name: Publish trusted validation evidence');
    expect(producer).toContain('on:\n  push:\n    branches: [main]');
    expect(producer).toContain('permissions:\n  contents: read');
    expect(producer).toContain(
      "if: github.event_name == 'push' && github.ref == 'refs/heads/main'",
    );
    expect(producer).not.toMatch(
      /pages:\s*write|id-token:\s*write|actions:\s*write|pull_request|workflow_run/,
    );
    expect(producer).toContain('name: trusted-pinned-runtime-validation (${{ matrix.id }})');
    expect(producer).toContain('Run full validation (exact pinned runtime)');
    expect(producer).toContain('git lfs fsck');
    expect(producer).toContain('npm ci');
    expect(producer).toContain("git rev-parse 'HEAD^{tree}'");
    expect(producer).toContain('Publish trusted validation evidence');
    expect(producer).not.toContain('actions/cache@');
    const producerActions = [...producer.matchAll(/^\s+uses: ([^\s#]+)(?:\s+#.*)?$/gm)].map(
      (match) => match[1],
    );
    expect(producerActions).toEqual([
      'actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8',
      'actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8',
      'actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444',
      'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02',
    ]);

    const pinRows = (source: string) =>
      [
        ...source.matchAll(
          /^\s+- id: (billboard|dive|far300|abyss-fog-004)\n\s+sha: ([0-9a-f]{40})/gm,
        ),
      ].map((match) => [match[1], match[2]]);
    const pinnedJob = workflow.slice(workflow.indexOf('  pinned-runtime-validation:'));
    expect(pinRows(pinnedJob)).toEqual(pinRows(producer));
  });

  it('uses the verified LFS inventory digest for all pinned runtime checks', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
    const digests = [...workflow.matchAll(/^\s+lfs_inventory_sha256: ([0-9a-f]{64})$/gm)].map(
      (match) => match[1],
    );

    expect(digests).toHaveLength(4);
    expect(digests).toEqual(
      Array(4).fill('234d0e7336e2d824e9af54f107a2628ce544b42a2260bafb2d32d8e807c765bc'),
    );
  });
});
