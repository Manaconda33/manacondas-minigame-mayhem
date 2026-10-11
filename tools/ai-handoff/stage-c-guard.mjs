import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const MANIFEST_PATH = 'tools/ai-handoff/stage-c-manifest.json';
export const EXPECTED_REPOSITORY = 'Manaconda33/manacondas-minigame-mayhem';
export const EXPECTED_TASK = 'MAYHEM-AUTO-SMOKE-001';
export const EXPECTED_FIXTURE = 'tests/ai-handoff/stage-c-smoke-fixture.json';

export function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
function insist(ok, reason) {
  if (!ok) throw new Error(`Stage C preflight denied: ${reason}`);
}
export function validateManifest(m) {
  insist(m && typeof m === 'object' && !Array.isArray(m), 'manifest missing');
  insist(m.version === 'stage-c-prep-1', 'manifest version');
  insist(m.repository === EXPECTED_REPOSITORY && m.owner === 'Manaconda33', 'repository or owner');
  insist(m.task_id === EXPECTED_TASK, 'unexpected task');
  insist(m.base_ref === 'refs/heads/main', 'unexpected base ref');
  insist(m.fixture_path === EXPECTED_FIXTURE, 'unexpected fixture');
  insist(Array.isArray(m.allowed_paths) && m.allowed_paths.length === 1 && m.allowed_paths[0] === EXPECTED_FIXTURE, 'path allowlist must be exact');
  insist(m.max_build_cycles === 3 && m.max_runtime_minutes === 60 && m.max_api_spend_usd === 5, 'budget contract');
  insist(m.publication === 'draft_pr_only' && m.no_gameplay_or_deployment === true, 'unsafe publication or runtime scope');
  insist(['PREPARED_DISABLED', 'OWNER_APPROVED_SINGLE_RUN'].includes(m.activation_state), 'invalid activation state');
  return true;
}
export function assertLivePreflight(manifest, manifestBytes, env) {
  insist(JSON.stringify(manifest) === JSON.stringify(JSON.parse(manifestBytes.toString('utf8'))), 'manifest record does not match committed bytes');
  validateManifest(manifest);
  // PREPARED_DISABLED is deliberate: a separate reviewed commit and launch approval are required.
  insist(manifest.activation_state === 'OWNER_APPROVED_SINGLE_RUN', 'manifest prepared but not activated');
  insist(env.GITHUB_EVENT_NAME === 'workflow_dispatch', 'not an authenticated manual dispatch');
  insist(env.GITHUB_ACTOR === manifest.owner, 'operator is not the owner');
  insist(env.GITHUB_REPOSITORY === manifest.repository, 'repository mismatch');
  insist(env.GITHUB_REF === manifest.base_ref, 'not dispatched on main');
  insist(env.GITHUB_REF_PROTECTED === 'true', 'default branch protection/ruleset not configured');
  insist(/^[a-f0-9]{40}$/.test(env.GITHUB_SHA || ''), 'invalid executing SHA');
  insist(env.APPROVED_BASE_SHA === env.GITHUB_SHA, 'unapproved executing SHA');
  insist(env.TASK_ID === manifest.task_id, 'task identity mismatch');
  const actual = digest(manifestBytes);
  insist(/^[a-f0-9]{64}$/.test(env.MANIFEST_SHA256 || '') && env.MANIFEST_SHA256 === actual, 'manifest digest mismatch');
  insist(env.APPROVED_MANIFEST_SHA256 === actual, 'owner approval not bound to manifest');
  insist(env.AI_HANDOFF_STAGE_C_ENABLED === 'true', 'owner-controlled activation is off');
  insist(env.AI_HANDOFF_HARD_SPEND_LIMIT_VERIFIED === 'true', 'external API project hard-spend control not attested');
  return { task_id: manifest.task_id, approved_sha: env.GITHUB_SHA, manifest_sha256: actual };
}

if (process.argv[1]?.endsWith('/stage-c-guard.mjs') && process.argv[2] === 'preflight') {
  try {
    const bytes = readFileSync(MANIFEST_PATH);
    const result = assertLivePreflight(JSON.parse(bytes.toString('utf8')), bytes, process.env);
    console.log(JSON.stringify({ preflight: 'passed', ...result }));
    // github action steps only see success if this process exits zero.
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
