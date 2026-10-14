import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { classifyChanges, parseRawDiff } from '../tools/ci/pr-change-classifier.mjs';
import {
  decideValidationReuse,
  findTrustedValidationArtifact,
  normalizeLfsInventory,
  restoreTrustedValidationEvidence,
  validationCommands,
  validationEvidenceName,
  validationToolchainFingerprint,
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
  workflowPath: '.github/workflows/ci.yml',
  headSha: 'a'.repeat(40),
  attempt: 1,
};

const expected = {
  runtimeId: 'abyss-fog-004',
  sourceSha: '25ea008b15852d593681f5b3b2a17b467a193472',
  sourceTree: 'b'.repeat(40),
  runtimeLockSha256: '2'.repeat(64),
  lfsInventorySha256: '6e084bd177f53ac87a15642acf0054e7fe398a22387274e80fb0565f1e1a293c',
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
    status: trustedRun.status,
    conclusion: trustedRun.conclusion,
    workflowPath: trustedRun.workflowPath,
    sha: trustedRun.headSha,
  },
};

describe('CI change classification', () => {
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
    expect(
      decideValidationReuse({ artifact: completeArtifact, evidence, run: trustedRun, expected })
        .reuse,
    ).toBe(true);
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
      decideValidationReuse({ artifact: null, evidence: null, run: null, expected }).reuse,
    ).toBe(false);
    expect(
      decideValidationReuse({ artifact: completeArtifact, evidence, run: null, expected }).reuse,
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
        decideValidationReuse({ artifact: completeArtifact, evidence, run, expected }).reuse,
      ).toBe(false);
    }
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence: { ...evidence, commands: evidence.commands.slice(0, -1) },
        run: trustedRun,
        expected,
      }).reuse,
    ).toBe(false);
    expect(
      decideValidationReuse({
        artifact: completeArtifact,
        evidence: { ...evidence, status: 'incomplete' },
        run: trustedRun,
        expected,
      }).reuse,
    ).toBe(false);
  });

  it('keeps existing check identities and avoids path-filter or privileged PR triggers', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
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
    expect(workflow).toContain("always() &&\n      (github.event_name == 'pull_request' ||");
    expect(workflow).not.toContain('pinned-runtime-validation-v1-');
    expect(workflow).toContain('actions: read');
  });
});
