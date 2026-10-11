import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { assertLivePreflight, MANIFEST_PATH, EXPECTED_FIXTURE, EXPECTED_TASK } from './stage-c-guard.mjs';
import { checkFixture } from './stage-c-fixture-check.mjs';

function insist(ok, why) { if (!ok) throw new Error(`Stage C candidate rejected: ${why}`); }

export function checkedCandidate(raw, original) {
  insist(typeof raw === 'string' && raw.length > 0 && raw.length <= 4096, 'candidate output size');
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('Stage C candidate rejected: output is not JSON'); }
  insist(value && !Array.isArray(value) && typeof value === 'object', 'invalid candidate object');
  insist(Object.keys(value).sort().join(',') === 'rationale,repaired_expected,task_id', 'unexpected candidate fields');
  insist(value.task_id === EXPECTED_TASK, 'wrong task');
  insist(Number.isInteger(value.repaired_expected) && value.repaired_expected >= 0 && value.repaired_expected <= 100, 'invalid expected value');
  insist(typeof value.rationale === 'string' && value.rationale.length >= 1 && value.rationale.length <= 300, 'invalid rationale');
  const updated = structuredClone(original);
  insist(updated?.task_id === EXPECTED_TASK && Array.isArray(updated.cases) && updated.cases.length === 3, 'seed missing/altered');
  insist(updated.cases[0]?.input === 3 && updated.cases[0]?.expected === 6, 'first sample changed');
  insist(updated.cases[1]?.input === 6 && updated.cases[1]?.expected === 20, 'seed no longer present');
  insist(updated.cases[2]?.input === 8 && updated.cases[2]?.expected === 36, 'third sample changed');
  updated.cases[1].expected = value.repaired_expected;
  checkFixture(updated);
  return updated;
}

function git(args) { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim(); }
function gh(args) { return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim(); }

export function validateOnly(raw) {
  const seed = JSON.parse(readFileSync(EXPECTED_FIXTURE, 'utf8'));
  return checkedCandidate(raw, seed);
}

if (process.argv[1]?.endsWith('/stage-c-candidate.mjs')) {
  try {
    const candidate = process.env.CODEX_FINAL_MESSAGE;
    insist(candidate, 'no agent result');
    const updated = validateOnly(candidate);
    if (process.argv[2] === 'validate-only') {
      console.log(JSON.stringify({ candidate: 'valid', task: EXPECTED_TASK, proposed_expected: updated.cases[1].expected, external_actions: 0 }));
    } else if (process.argv[2] === 'publish') {
      const bytes = readFileSync(MANIFEST_PATH);
      const manifest = JSON.parse(bytes.toString('utf8'));
      assertLivePreflight(manifest, bytes, process.env);
      insist(process.env.AI_HANDOFF_DRAFT_PR_ENABLED === 'true', 'draft PR publication not explicitly enabled');
      insist(/^\d{1,18}$/.test(process.env.GITHUB_RUN_ID || ''), 'bad GitHub run ID');
      insist(process.env.GITHUB_RUN_ID !== '0', 'bad GitHub run ID');
      insist(git(['status','--porcelain','--untracked-files=all']) === '', 'dirty checkout before candidate');
      insist(git(['rev-parse','HEAD']) === process.env.GITHUB_SHA, 'checkout not pinned to approved commit');
      // IMPORTANT: model output is only a checked integer; never apply a model-authored patch or execute model-authored code.
      writeFileSync(EXPECTED_FIXTURE, `${JSON.stringify(updated, null, 2)}\n`);
      const paths = git(['diff','--name-only']).split('\n').filter(Boolean);
      insist(paths.length === 1 && paths[0] === EXPECTED_FIXTURE, 'out-of-scope patch');
      insist(git(['diff','--check']) === '', 'diff whitespace errors');
      checkFixture(JSON.parse(readFileSync(EXPECTED_FIXTURE,'utf8')));
      const branch = `pilot/ai-handoff-stage-c-result-${process.env.GITHUB_RUN_ID}`;
      git(['switch','-c',branch]);
      git(['config','user.name','github-actions[bot]']);
      git(['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
      git(['add','--',EXPECTED_FIXTURE]);
      git(['commit','-m',`test(ai-handoff): repair seeded fixture (${process.env.GITHUB_RUN_ID})`]);
      const finalSha = git(['rev-parse','HEAD']);
      git(['push','origin',`HEAD:refs/heads/${branch}`]);
      const url = gh(['pr','create','--draft','--repo',manifest.repository,'--base','main','--head',branch,'--title',`Stage C smoke fixture correction (run ${process.env.GITHUB_RUN_ID})`,'--body',`Automated Stage C engineering smoke only. Task ${manifest.task_id}; base ${process.env.GITHUB_SHA}; candidate ${finalSha}; workflow run ${process.env.GITHUB_RUN_ID}. One file corrected. NOT independently reviewed, owner approved, or authorized to merge/deploy. GitHub-token-created PR events may not start downstream CI; verify separately.`]);
      console.log(JSON.stringify({ result: 'draft_pr_created',url,branch,candidate_sha:finalSha,scope:paths,run_id:process.env.GITHUB_RUN_ID }));
    } else throw new Error('Use validate-only or publish');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
