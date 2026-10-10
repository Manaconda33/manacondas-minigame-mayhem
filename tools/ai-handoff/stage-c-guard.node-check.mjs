import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertLivePreflight, digest, validateManifest, MANIFEST_PATH, EXPECTED_REPOSITORY, EXPECTED_TASK, EXPECTED_FIXTURE } from './stage-c-guard.mjs';
import { checkedCandidate, validateOnly } from './stage-c-candidate.mjs';
import { checkFixture, correctValue } from './stage-c-fixture-check.mjs';

const bytes = readFileSync(MANIFEST_PATH), manifest = JSON.parse(bytes.toString('utf8'));
const rawFixture = JSON.parse(readFileSync(EXPECTED_FIXTURE, 'utf8'));
const goodEnv = {
  GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_ACTOR: 'Manaconda33',
  GITHUB_REPOSITORY: EXPECTED_REPOSITORY, GITHUB_REF: 'refs/heads/main', GITHUB_REF_PROTECTED: 'true',
  GITHUB_SHA: 'a'.repeat(40), APPROVED_BASE_SHA: 'a'.repeat(40),
  TASK_ID: EXPECTED_TASK, MANIFEST_SHA256: digest(bytes), APPROVED_MANIFEST_SHA256: digest(bytes),
  AI_HANDOFF_STAGE_C_ENABLED: 'true', AI_HANDOFF_HARD_SPEND_LIMIT_VERIFIED: 'true',
};
const approved = { ...manifest, activation_state: 'OWNER_APPROVED_SINGLE_RUN' };
const approvedBytes = Buffer.from(`${JSON.stringify(approved, null, 2)}\n`);
const liveEnv = {...goodEnv, MANIFEST_SHA256:digest(approvedBytes), APPROVED_MANIFEST_SHA256:digest(approvedBytes)};
function deny(m,e,re){ assert.throws(() => assertLivePreflight(m, JSON.stringify(m) === JSON.stringify(approved) ? approvedBytes : bytes, e), re); }

test('manifest fixed to narrow task, single path, three cycles and $5/60m limits',()=>assert.equal(validateManifest(manifest), true));
test('not activated even when all external flags are supplied',()=>deny(manifest,goodEnv,/prepared but not activated/));
test('provisional approved manifest passes only for complete trusted metadata',()=>assert.equal(assertLivePreflight(approved,approvedBytes,liveEnv).task_id,EXPECTED_TASK));
test('non-owner dispatch rejects',()=>deny(approved,{...liveEnv,GITHUB_ACTOR:'outsider'},/operator/));
test('PR trigger rejects',()=>deny(approved,{...liveEnv,GITHUB_EVENT_NAME:'pull_request'},/manual dispatch/));
test('other branch rejects',()=>deny(approved,{...liveEnv,GITHUB_REF:'refs/heads/pilot-evil'},/main/));
test('unprotected main branch rejects',()=>deny(approved,{...liveEnv,GITHUB_REF_PROTECTED:'false'},/branch protection/));
test('unapproved base SHA rejects',()=>deny(approved,{...liveEnv,APPROVED_BASE_SHA:'b'.repeat(40)},/SHA/));
test('wrong task ID rejects',()=>deny(approved,{...liveEnv,TASK_ID:'ANOTHER-TASK'},/task identity/));
test('wrong manifest input rejects',()=>deny(approved,{...liveEnv,MANIFEST_SHA256:'c'.repeat(64)},/manifest digest/));
test('unapproved manifest digest rejects',()=>deny(approved,{...liveEnv,APPROVED_MANIFEST_SHA256:'c'.repeat(64)},/owner approval/));
test('disabled repository variable rejects',()=>deny(approved,{...liveEnv,AI_HANDOFF_STAGE_C_ENABLED:'false'},/activation/));
test('unattested external hard spend cap rejects',()=>deny(approved,{...liveEnv,AI_HANDOFF_HARD_SPEND_LIMIT_VERIFIED:''},/hard-spend/));
test('cannot misrepresent altered committed manifest bytes',()=>assert.throws(()=>assertLivePreflight(approved,bytes,liveEnv),/committed bytes/));
test('cannot widen manifest path scope',()=>assert.throws(()=>validateManifest({...manifest,allowed_paths:[EXPECTED_FIXTURE,'src/game/track/NeonGrid.ts']}),/allowlist/));
test('cannot increase the runtime, spend, or attempts',()=>assert.throws(()=>validateManifest({...manifest,max_api_spend_usd:100}),/budget/));
test('seeded fixture fails deliberately, not in normal repo CI suite',()=>assert.throws(()=>checkFixture(rawFixture),/input 6/));
test('corrected fixture passes deterministic checker',()=>{const fixed=structuredClone(rawFixture);fixed.cases[1].expected=21;assert.equal(checkFixture(fixed),true);});
test('correct value 6 is 21',()=>assert.equal(correctValue(6),21));
test('valid Codex proposal can be checked offline with no external actions',()=>assert.equal(validateOnly(JSON.stringify({task_id:EXPECTED_TASK,repaired_expected:21,rationale:'n(n+1)/2'})).cases[1].expected,21));
test('wrong numeric answer rejects',()=>assert.throws(()=>checkedCandidate(JSON.stringify({task_id:EXPECTED_TASK,repaired_expected:20,rationale:'No change'}),rawFixture),/fixture check failed/));
test('unexpected proposal field rejects',()=>assert.throws(()=>checkedCandidate(JSON.stringify({task_id:EXPECTED_TASK,repaired_expected:21,rationale:'ok',path:'src/game/track/NeonGrid.ts'}),rawFixture),/unexpected/));
test('wrong task in proposal rejects',()=>assert.throws(()=>checkedCandidate(JSON.stringify({task_id:'OTHER',repaired_expected:21,rationale:'ok'}),rawFixture),/wrong task/));
test('non-integer or oversized proposal rejects',()=>{
  assert.throws(()=>checkedCandidate(JSON.stringify({task_id:EXPECTED_TASK,repaired_expected:'21',rationale:'ok'}),rawFixture),/invalid expected/);
  assert.throws(()=>checkedCandidate('x'.repeat(4200),rawFixture),/size/);
});
test('candidate cannot silently reinterpret or repair a modified fixture',()=>{
  const fake=structuredClone(rawFixture);fake.cases[0].expected=99;
  assert.throws(()=>checkedCandidate(JSON.stringify({task_id:EXPECTED_TASK,repaired_expected:21,rationale:'ok'}),fake),/first sample changed/);
});
