 // Offline-only Stage B contract. No network, GitHub token, Codex, or write operations.
import { createHash } from 'node:crypto';

export const REPOSITORY = 'Manaconda33/manacondas-minigame-mayhem';
export const ALLOW = Object.freeze(['tools/ai-handoff/**', 'tests/ai-handoff/**', 'docs/automation/**']);
export const DENY = Object.freeze(['src/**', 'public/**', '.github/**', 'assets/**', 'package.json', 'package-lock.json', '.gitattributes', 'AGENTS.md', 'docs/PRD.md', 'docs/DECISIONS.md', 'docs/IMPLEMENTATION-STATUS.md']);
const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const ID = /^[A-Z][A-Z0-9-]{3,63}$/;
const own = (obj, key) => Object.hasOwn(obj, key);

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw Error('nonfinite canonical number');
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw Error('unsupported canonical value');
  return encoded;
}

// Exclude mutable state and proof fields. The *approval* is checked against independently
// supplied trusted event facts, never against a claimed approver in the manifest alone.
export function manifestDigest(manifest) {
  const immutable = Object.fromEntries(Object.entries(manifest).filter(([key]) => !['manifest_sha256', 'approval', 'state'].includes(key)));
  return createHash('sha256').update(canonical(immutable)).digest('hex');
}

function ensure(condition, message) { if (!condition) throw Error(message); }
function exactKeys(object, required, optional = []) {
  ensure(object && typeof object === 'object' && !Array.isArray(object), 'expected object');
  for (const key of required) ensure(own(object, key), `missing ${key}`);
  for (const key of Object.keys(object)) ensure([...required, ...optional].includes(key), `unknown field ${key}`);
}
function validGlob(glob) {
  return typeof glob === 'string' && (/^[a-zA-Z0-9_.\/-]+\/\*\*$/.test(glob) || /^[a-zA-Z0-9_.\/-]+$/.test(glob)) && !glob.includes('..') && !glob.includes('\\') && !glob.startsWith('/');
}
function match(path, pattern) { return pattern.endsWith('/**') ? path.startsWith(pattern.slice(0, -3) + '/') : path === pattern; }
export function safePath(path) {
  ensure(typeof path === 'string' && path.length > 0 && !path.startsWith('/') && !path.includes('\\') && !path.includes('\0') && !path.includes('%'), 'invalid path');
  ensure(path.split('/').every(p => p && p !== '.' && p !== '..'), 'path traversal');
  ensure(!/^[a-zA-Z]:/.test(path), 'absolute path');
  return path;
}
export function assertPaths(changed, manifest) {
  ensure(Array.isArray(changed), 'changed paths missing');
  for (const raw of changed) {
    const path = safePath(raw);
    ensure(!DENY.some(glob => match(path, glob)), `protected path: ${path}`);
    ensure(manifest.scope.allowed_paths.some(glob => match(path, glob)), `outside approved scope: ${path}`);
    ensure(!manifest.scope.forbidden_paths.some(glob => match(path, glob)), `forbidden by manifest: ${path}`);
  }
  return true;
}

// Schema-equivalent core checks without introducing any new dependency to the game.
export function validateManifest(m) {
  exactKeys(m, ['schema_version','id','repository','issue_number','base_sha','objective','approval','scope','quality_loop','acceptance'], ['manifest_sha256']);
  ensure(m.schema_version === '1.2' && ID.test(m.id), 'unsupported schema or task ID');
  ensure(m.repository === REPOSITORY, 'repository not allowlisted');
  ensure(Number.isSafeInteger(m.issue_number) && m.issue_number > 0, 'invalid issue');
  ensure(SHA.test(m.base_sha), 'invalid baseline SHA');
  ensure(typeof m.objective === 'string' && m.objective.trim().length >= 8 && m.objective.length <= 500, 'invalid objective');
  exactKeys(m.approval, ['scope','approver','event_id','approved_digest','approved_base_sha']);
  ensure(m.approval.scope === 'implementation_only' && typeof m.approval.approver === 'string' && m.approval.approver.length > 0, 'invalid approval');
  ensure(typeof m.approval.event_id === 'string' && m.approval.event_id.length >= 8, 'invalid approval event');
  ensure(DIGEST.test(m.approval.approved_digest) && SHA.test(m.approval.approved_base_sha), 'invalid approval hashes');
  exactKeys(m.scope, ['allowed_paths','forbidden_paths','workstream_lock']);
  ensure(m.scope.workstream_lock === 'pilot-automation', 'invalid workstream');
  for (const name of ['allowed_paths','forbidden_paths']) {
    const globs = m.scope[name];
    ensure(Array.isArray(globs) && globs.length > 0 && new Set(globs).size === globs.length && globs.every(validGlob), `invalid ${name}`);
  }
  ensure(m.scope.allowed_paths.every(p => ALLOW.includes(p)), 'allowed paths widen Stage B boundary');
  exactKeys(m.quality_loop, ['total_build_cycles','max_corrective_attempts','elapsed_minutes_limit','api_spend_usd_limit','reviewer_required_for_final_ready']);
  const q = m.quality_loop;
  ensure(q.total_build_cycles === 3 && q.max_corrective_attempts === 2 && q.reviewer_required_for_final_ready === true, 'quality budget/reviewer mismatch');
  ensure(Number.isFinite(q.elapsed_minutes_limit) && q.elapsed_minutes_limit > 0 && Number.isFinite(q.api_spend_usd_limit) && q.api_spend_usd_limit > 0, 'missing budget ceilings');
  exactKeys(m.acceptance, ['mandatory_checks','owner_visual_required']);
  ensure(Array.isArray(m.acceptance.mandatory_checks) && m.acceptance.mandatory_checks.length > 0 && m.acceptance.mandatory_checks.every(x => typeof x === 'string' && x.length > 0) && new Set(m.acceptance.mandatory_checks).size === m.acceptance.mandatory_checks.length, 'invalid checks');
  ensure(typeof m.acceptance.owner_visual_required === 'boolean', 'invalid visual gate');
  if (own(m, 'manifest_sha256')) ensure(DIGEST.test(m.manifest_sha256), 'invalid manifest digest');
  return true;
}

export function assertApproval(manifest, trusted) {
  validateManifest(manifest);
  // There is deliberately no production GitHub trust adapter in Stage B.
  // trusted must be injected by the offline test harness, never parsed from an issue.
  ensure(trusted?.fixture_context === true, 'no trusted adapter: Stage B cannot authorize execution');
  ensure(trusted.actor === 'Manaconda33' && trusted.authorized === true, 'untrusted actor');
  ensure(trusted.event_id === manifest.approval.event_id, 'approval event mismatch');
  ensure(trusted.issue_number === manifest.issue_number, 'approval issue mismatch');
  ensure(trusted.base_sha === manifest.base_sha && manifest.approval.approved_base_sha === manifest.base_sha, 'stale baseline');
  const digest = manifestDigest(manifest);
  ensure(trusted.digest === digest && manifest.approval.approved_digest === digest && manifest.manifest_sha256 === digest, 'approval digest mismatch');
  ensure(manifest.approval.approver === trusted.actor, 'claimed approver mismatch');
  return true;
}

export const TRANSITIONS = Object.freeze({
  draft:['validated','cancelled'], validated:['scope_approved','cancelled'], scope_approved:['queued','cancelled'], queued:['running','cancelled'],
  running:['validating','escalated','failed','cancelled'], validating:['reviewing','correcting','failed','escalated'],
  reviewing:['correcting','review_ready','escalated','failed'], correcting:['running','escalated','failed'],
  review_ready:['implementation_accepted','changes_requested','cancelled'], implementation_accepted:['release_authorized','closed'],
  release_authorized:['delivered','cancelled'], delivered:['verified','escalated'], verified:['closed'],
  changes_requested:[], escalated:[], failed:[], cancelled:[], superseded:[], closed:[]
});
export function transition(current, next) {
  ensure(own(TRANSITIONS, current) && TRANSITIONS[current].includes(next), `illegal state transition ${current} -> ${next}`);
  return next;
}

export function eventRouter(event, state, seen) {
  ensure(event && typeof event === 'object' && typeof event.id === 'string', 'invalid event');
  ensure(event.type === 'manual_fixture' || event.type === 'issue_labeled', 'untrusted event type');
  ensure(event.type !== 'issue_labeled' || event.label === 'approved-for-agent', 'unexpected label');
  ensure(!seen.has(event.id), 'duplicate event');
  ensure(state === 'scope_approved', 'task not approved for queue');
  seen.add(event.id);
  return transition(state, 'queued');
}

export function leaseAcquire(ledger, taskId, now, ttlMs) {
  ensure(Number.isSafeInteger(now) && Number.isSafeInteger(ttlMs) && ttlMs > 0, 'invalid lease clock');
  if (ledger.owner && now < ledger.expiresAt) throw Error('workstream occupied');
  // Expired leases do not silently transfer execution authority: recovery is manual.
  if (ledger.owner) throw Error('stale lease needs operator recovery');
  return {owner:taskId, expiresAt:now + ttlMs, generation:ledger.generation + 1};
}
export function leaseRelease(ledger, taskId, generation) {
  ensure(ledger.owner === taskId && ledger.generation === generation, 'lease ownership mismatch');
  return {owner:null, expiresAt:0, generation};
}

export function evaluateCycle({ cycles, checks, findings, elapsedMinutes, spendUsd, manifest, changedPaths, reviewerAvailable = true }) {
  validateManifest(manifest);
  assertPaths(changedPaths, manifest);
  ensure(Number.isInteger(cycles) && cycles >= 1, 'invalid cycle');
  ensure(Array.isArray(checks) && Array.isArray(findings), 'missing evidence');
  const q = manifest.quality_loop;
  if (cycles > q.total_build_cycles || elapsedMinutes >= q.elapsed_minutes_limit || spendUsd >= q.api_spend_usd_limit) return 'failed_budget_or_checks';
  if (!reviewerAvailable) return 'needs_owner_decision';
  if (findings.some(f => ['critical','high','blocker'].includes(f.severity) && f.type === 'out_of_scope')) return 'needs_owner_decision';
  const allPassed = manifest.acceptance.mandatory_checks.every(name => checks.filter(c => c.name === name).length === 1 && checks.some(c => c.name === name && c.pass === true));
  const blockers = findings.some(f => ['critical','high','blocker'].includes(f.severity));
  if (!allPassed || blockers) return cycles < q.total_build_cycles ? 'correcting' : 'failed_budget_or_checks';
  // No model-supplied boolean can satisfy a real owner's visual decision.
  if (manifest.acceptance.owner_visual_required) return 'needs_owner_decision';
  return 'review_ready'; // NEVER implementation_accepted, release_authorized or deployed.
}

export function reviewPacket({taskId, sha, cycles, state, checks, findings}) {
  ensure(ID.test(taskId) && SHA.test(sha), 'invalid review identifiers');
  ensure(['review_ready','needs_owner_decision','failed_budget_or_checks'].includes(state), 'not a review terminal result');
  return {taskId, candidate_sha:sha, state, cycles, mandatory_checks:checks, findings, human_approval:'NOT GRANTED', release_authorization:'NOT GRANTED'};
}
export function noticeKey(packet) { return `${packet.taskId}:${packet.candidate_sha}:${packet.state}`; }
