// Simulation-only Stage B contract. Not a GitHub authentication or execution adapter.
// No network, filesystem writes, Codex launch, CI dispatch, or release operations.
import { createHash } from 'node:crypto';

export const REPOSITORY = 'Manaconda33/manacondas-minigame-mayhem';
export const ALLOW = Object.freeze(['tools/ai-handoff/**', 'tests/ai-handoff/**', 'docs/automation/**']);
export const DENY = Object.freeze(['src/**', 'public/**', '.github/**', 'assets/**', 'package.json', 'package-lock.json', '.gitattributes', 'AGENTS.md', 'docs/PRD.md', 'docs/DECISIONS.md', 'docs/IMPLEMENTATION-STATUS.md']);
export const CONTRACT_VERSION = 'stage-b-1';
const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const ID = /^[A-Z][A-Z0-9-]{3,63}$/;
const own = (obj, key) => Object.hasOwn(obj, key);
const validObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function ensure(condition, message) { if (!condition) throw Error(message); }
function keys(value, required, optional = []) {
  ensure(validObject(value), 'expected object');
  for (const key of required) ensure(own(value, key), `missing ${key}`);
  for (const key of Object.keys(value)) ensure([...required, ...optional].includes(key), `unknown field ${key}`);
}
function string(value, name) { ensure(typeof value === 'string' && value.length > 0, `invalid ${name}`); }
function sha(value, name) { ensure(typeof value === 'string' && SHA.test(value), `invalid ${name}`); }
function digest(value, name) { ensure(typeof value === 'string' && DIGEST.test(value), `invalid ${name}`); }
function integer(value, name, minimum = 0) { ensure(Number.isSafeInteger(value) && value >= minimum, `invalid ${name}`); }
function finite(value, name) { ensure(Number.isFinite(value) && value >= 0, `invalid ${name}`); }
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (validObject(value)) return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  if (typeof value === 'number' && !Number.isFinite(value)) throw Error('nonfinite canonical number');
  const encoded = JSON.stringify(value);
  ensure(encoded !== undefined, 'unsupported canonical value');
  return encoded;
}
export function manifestDigest(manifest) {
  const immutable = Object.fromEntries(Object.entries(manifest).filter(([key]) => !['manifest_sha256', 'approval', 'state'].includes(key)));
  return createHash('sha256').update(canonical(immutable)).digest('hex');
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
export function validateManifest(m) {
  keys(m, ['schema_version','id','repository','issue_number','base_sha','objective','approval','scope','quality_loop','acceptance'], ['manifest_sha256']);
  ensure(m.schema_version === '1.2' && typeof m.id === 'string' && ID.test(m.id), 'unsupported schema or task ID');
  ensure(m.repository === REPOSITORY, 'repository not allowlisted');
  integer(m.issue_number, 'issue number', 1); sha(m.base_sha, 'baseline SHA');
  ensure(typeof m.objective === 'string' && m.objective.trim().length >= 8 && m.objective.length <= 500, 'invalid objective');
  keys(m.approval, ['scope','approver','event_id','approved_digest','approved_base_sha']);
  ensure(m.approval.scope === 'implementation_only', 'invalid approval scope');
  string(m.approval.approver, 'approver'); string(m.approval.event_id, 'approval event');
  ensure(m.approval.event_id.length >= 8, 'invalid approval event');
  digest(m.approval.approved_digest, 'approved digest'); sha(m.approval.approved_base_sha, 'approved baseline SHA');
  keys(m.scope, ['allowed_paths','forbidden_paths','workstream_lock']);
  ensure(m.scope.workstream_lock === 'pilot-automation', 'invalid workstream');
  for (const name of ['allowed_paths','forbidden_paths']) {
    const globs = m.scope[name];
    ensure(Array.isArray(globs) && globs.length > 0 && new Set(globs).size === globs.length && globs.every(validGlob), `invalid ${name}`);
  }
  ensure(m.scope.allowed_paths.every(p => ALLOW.includes(p)), 'allowed paths widen Stage B boundary');
  keys(m.quality_loop, ['total_build_cycles','max_corrective_attempts','elapsed_minutes_limit','api_spend_usd_limit','reviewer_required_for_final_ready']);
  const q = m.quality_loop;
  ensure(q.total_build_cycles === 3 && q.max_corrective_attempts === 2 && q.reviewer_required_for_final_ready === true, 'quality budget/reviewer mismatch');
  ensure(Number.isFinite(q.elapsed_minutes_limit) && q.elapsed_minutes_limit > 0 && Number.isFinite(q.api_spend_usd_limit) && q.api_spend_usd_limit > 0, 'missing budget ceilings');
  keys(m.acceptance, ['mandatory_checks','owner_visual_required']);
  const checks = m.acceptance.mandatory_checks;
  ensure(Array.isArray(checks) && checks.length > 0 && checks.every(c => typeof c === 'string' && c.length > 0) && new Set(checks).size === checks.length, 'invalid checks');
  ensure(typeof m.acceptance.owner_visual_required === 'boolean', 'invalid visual gate');
  if (own(m, 'manifest_sha256')) digest(m.manifest_sha256, 'manifest digest');
  return true;
}

// Trusted evidence is a *synthetic* harness input. Its fields can be forged by a caller.
// It is intentionally not an API-level identity verifier and must not be used as one.
export function assertApproval(m, trusted, currentBaseSha) {
  validateManifest(m);
  ensure(trusted?.fixture_context === true && trusted.provenance === 'offline_test_harness', 'no trusted adapter: Stage B cannot authorize execution');
  ensure(trusted.actor === 'Manaconda33' && trusted.authorized === true, 'untrusted actor');
  ensure(trusted.event_id === m.approval.event_id && trusted.issue_number === m.issue_number && trusted.repository === REPOSITORY && trusted.task_id === m.id, 'approval event/identity mismatch');
  sha(currentBaseSha, 'current baseline');
  ensure(trusted.base_sha === currentBaseSha && m.base_sha === currentBaseSha && m.approval.approved_base_sha === currentBaseSha, 'stale baseline');
  const actual = manifestDigest(m);
  ensure(trusted.digest === actual && m.approval.approved_digest === actual && m.manifest_sha256 === actual, 'approval digest mismatch');
  ensure(m.approval.approver === trusted.actor, 'claimed approver mismatch');
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
const GUARDED = new Set(['scope_approved','queued','implementation_accepted','release_authorized','delivered']);
export function transition(current, next) {
  ensure(own(TRANSITIONS, current) && TRANSITIONS[current].includes(next), `illegal state transition ${current} -> ${next}`);
  ensure(!GUARDED.has(next), `privileged transition requires verified gate: ${next}`);
  return next;
}
export function authorizeScope(m, trusted, currentBaseSha, state = 'validated') {
  ensure(state === 'validated', 'scope approval from invalid state');
  assertApproval(m, trusted, currentBaseSha);
  return 'scope_approved'; // Simulated only; no durable GitHub authority.
}
export function verifyOwnerDecision(m, decision, trusted, currentBaseSha, candidateSha, prNumber) {
  validateManifest(m); sha(currentBaseSha, 'current baseline'); sha(candidateSha, 'candidate SHA'); integer(prNumber, 'PR number', 1);
  keys(decision, ['type','task_id','repository','issue_number','manifest_digest','base_sha','candidate_sha','pr_number','event_id','approved_by','destination']);
  ensure(['implementation_acceptance','release_authorization'].includes(decision.type), 'invalid decision type');
  ensure(decision.task_id === m.id && decision.repository === REPOSITORY && decision.issue_number === m.issue_number, 'decision identity mismatch');
  ensure(decision.manifest_digest === manifestDigest(m) && m.manifest_sha256 === decision.manifest_digest, 'decision digest mismatch');
  ensure(decision.base_sha === m.base_sha && decision.base_sha === currentBaseSha, 'stale decision baseline');
  ensure(decision.candidate_sha === candidateSha && decision.pr_number === prNumber, 'wrong decision candidate/PR');
  ensure(decision.approved_by === 'Manaconda33' && decision.destination === (decision.type === 'release_authorization' ? 'main' : 'implementation_only'), 'wrong decision scope/destination');
  ensure(decision.event_id !== m.approval.event_id, 'scope approval cannot authorize later decision');
  ensure(trusted?.fixture_context === true && trusted.provenance === 'offline_test_harness' && trusted.authorized === true && trusted.actor === 'Manaconda33', 'no authenticated decision adapter');
  ensure(trusted.event_id === decision.event_id && trusted.type === decision.type && trusted.task_id === m.id && trusted.repository === REPOSITORY && trusted.issue_number === m.issue_number && trusted.manifest_digest === decision.manifest_digest && trusted.candidate_sha === candidateSha && trusted.pr_number === prNumber && trusted.destination === decision.destination && trusted.base_sha === currentBaseSha, 'decision authority mismatch');
  return true;
}
export function applyOwnerDecision(m, record, decision, trusted, currentBaseSha, candidateSha, prNumber, priorAcceptance = null) {
  validateManifest(m);
  const implementation = decision?.type === 'implementation_acceptance';
  if(implementation){
    // A caller-supplied "review_ready" string cannot stand in for independently
    // captured test, path and reviewer evidence attached to the same candidate.
    validateTask(record,m);
    ensure(record.state === 'review_ready', 'implementation decision requires reviewed task state');
    ensure(record.cycles.at(-1)?.candidate_sha === candidateSha, 'reviewed candidate mismatch');
  } else {
    keys(record,['version','simulation_only','state','task_id','manifest_digest','base_sha','candidate_sha','pr_number','implementation_event_id']);
    ensure(record.simulation_only === true && record.version === CONTRACT_VERSION && record.state === 'implementation_accepted', 'release requires accepted implementation state');
    ensure(record.task_id === m.id && record.manifest_digest === m.manifest_sha256 && record.base_sha === m.base_sha && record.candidate_sha === candidateSha && record.pr_number === prNumber, 'accepted implementation identity mismatch');
    ensure(priorAcceptance?.decision?.type === 'implementation_acceptance', 'distinct implementation acceptance proof required');
    verifyOwnerDecision(m,priorAcceptance.decision,priorAcceptance.trusted,currentBaseSha,candidateSha,prNumber);
    ensure(record.implementation_event_id === priorAcceptance.decision.event_id, 'implementation event not in accepted state');
    ensure(priorAcceptance.decision.event_id !== decision.event_id, 'implementation and release approvals must use distinct events');
  }
  verifyOwnerDecision(m,decision,trusted,currentBaseSha,candidateSha,prNumber);
  if(implementation)return {version:CONTRACT_VERSION,simulation_only:true,state:'implementation_accepted',task_id:m.id,manifest_digest:m.manifest_sha256,base_sha:m.base_sha,candidate_sha:candidateSha,pr_number:prNumber,implementation_event_id:decision.event_id};
  return {...record,state:'release_authorized',release_event_id:decision.event_id};
}

export function validateEvent(event) {
  keys(event, ['version','id','type','repository','task_id','issue_number','manifest_digest','base_sha','actor'], ['label','untrusted_text']);
  ensure(event.version === CONTRACT_VERSION, 'unknown event version'); string(event.id, 'event ID');
  ensure(['manual_fixture','issue_labeled'].includes(event.type), 'untrusted event type');
  ensure(event.repository === REPOSITORY && typeof event.task_id === 'string' && ID.test(event.task_id), 'event identity');
  integer(event.issue_number, 'event issue', 1); digest(event.manifest_digest, 'event digest'); sha(event.base_sha, 'event base'); string(event.actor, 'event actor');
  if (event.type === 'issue_labeled') ensure(event.label === 'approved-for-agent', 'unexpected label');
  else ensure(!own(event, 'label'), 'unexpected label on manual event');
  if (own(event, 'untrusted_text')) ensure(typeof event.untrusted_text === 'string', 'issue text must be string');
  return true;
}
export function eventRouter(event, state, seen, m, trusted, currentBaseSha) {
  validateEvent(event);
  ensure(state === 'scope_approved', 'task not approved for queue');
  assertApproval(m, trusted, currentBaseSha);
  ensure(event.task_id === m.id && event.issue_number === m.issue_number && event.repository === m.repository && event.manifest_digest === m.manifest_sha256 && event.base_sha === currentBaseSha && event.actor === trusted.actor, 'event not bound to approved manifest');
  ensure(seen instanceof Set, 'deduplication store missing');
  const semantic = `${m.id}:${m.manifest_sha256}:${event.type}:${event.type === 'issue_labeled' ? event.label : 'manual'}`;
  ensure(!seen.has(event.id) && !seen.has(semantic), 'duplicate event');
  seen.add(event.id); seen.add(semantic);
  return 'queued'; // Never dispatches a real job.
}
export function queueItem(m, eventId) {
  validateManifest(m); string(eventId, 'event ID');
  ensure(m.manifest_sha256 === manifestDigest(m), 'queue digest mismatch');
  return {version:CONTRACT_VERSION,repository:m.repository,task_id:m.id,issue_number:m.issue_number,manifest_digest:m.manifest_sha256,base_sha:m.base_sha,event_id:eventId,state:'queued',workstream:'pilot-automation'};
}
export function validateQueueItem(item, m) {
  keys(item, ['version','repository','task_id','issue_number','manifest_digest','base_sha','event_id','state','workstream']);
  ensure(item.version === CONTRACT_VERSION && item.state === 'queued' && item.workstream === 'pilot-automation', 'invalid queue contract');
  string(item.event_id,'queue event ID');
  ensure(item.repository === m.repository && item.task_id === m.id && item.issue_number === m.issue_number && item.manifest_digest === m.manifest_sha256 && item.base_sha === m.base_sha, 'queue identity mismatch');
  return true;
}
export function validateLease(lease) {
  keys(lease,['version','workstream','owner','expires_at_ms','generation']);
  ensure(lease.version === CONTRACT_VERSION && lease.workstream === 'pilot-automation', 'invalid lease contract');
  ensure(lease.owner === null || (typeof lease.owner === 'string' && ID.test(lease.owner)), 'invalid lease owner');
  integer(lease.expires_at_ms,'lease expiry'); integer(lease.generation,'lease generation');
  return true;
}
export function leaseAcquire(lease, taskId, now, ttlMs, expectedGeneration) {
  validateLease(lease); ensure(ID.test(taskId), 'invalid lease task');
  integer(now, 'lease clock'); integer(ttlMs,'lease TTL',1); integer(expectedGeneration,'expected lease generation');
  ensure(lease.generation === expectedGeneration, 'stale lease version');
  if (lease.owner && now < lease.expires_at_ms) throw Error('workstream occupied');
  if (lease.owner) throw Error('stale lease needs operator recovery');
  return {...lease,owner:taskId,expires_at_ms:now+ttlMs,generation:lease.generation+1};
}
export function leaseRelease(lease, taskId, generation) {
  validateLease(lease); ensure(lease.owner === taskId && lease.generation === generation, 'lease ownership mismatch');
  return {...lease,owner:null,expires_at_ms:0,generation:lease.generation+1};
}
export function validateReview(review, candidateSha) {
  keys(review, ['source','review_id','reviewer_id','candidate_sha','verdict','findings']);
  ensure(review.source === 'synthetic_independent_review_fixture', 'not an independent review fixture');
  string(review.review_id, 'review ID'); string(review.reviewer_id,'reviewer ID');
  sha(review.candidate_sha, 'review candidate SHA'); ensure(review.candidate_sha === candidateSha, 'stale reviewer candidate');
  ensure(['pass','fail','needs_owner'].includes(review.verdict), 'invalid reviewer verdict');
  ensure(Array.isArray(review.findings), 'missing reviewer findings');
  for (const finding of review.findings) {
    keys(finding,['severity','code','description'],['path','type']);
    ensure(['info','low','medium','high','critical','blocker'].includes(finding.severity), 'unclassified reviewer finding');
    string(finding.code,'finding code');string(finding.description,'finding description');
    if (own(finding,'path')) safePath(finding.path);
  }
  return true;
}
function validateCheck(check) { keys(check,['name','pass']); string(check.name,'check name'); ensure(typeof check.pass === 'boolean','invalid check result'); }
export function validateCycle(cycle,m) {
  keys(cycle,['cycle','candidate_sha','ci_run_id','observed_at_ms','elapsed_minutes','spend_usd','changed_paths','checks','review']);
  integer(cycle.cycle,'cycle',1);sha(cycle.candidate_sha,'cycle candidate SHA');
  integer(cycle.ci_run_id,'CI run ID',1);integer(cycle.observed_at_ms,'cycle observation clock');finite(cycle.elapsed_minutes,'elapsed time'); finite(cycle.spend_usd,'API spend');
  assertPaths(cycle.changed_paths,m);
  ensure(Array.isArray(cycle.checks), 'missing cycle checks');cycle.checks.forEach(validateCheck);
  if (cycle.review !== null) validateReview(cycle.review,cycle.candidate_sha);
  return true;
}
// A valid-looking queue record is never execution authority. Re-verify approval
// AND route its original event at the moment this ledger is created. The provided
// seen set is simulation-only: Stage C requires an authenticated durable store.
export function beginTask(m, queued, deadlineMs, startEvidence) {
  validateManifest(m); validateQueueItem(queued,m); integer(deadlineMs,'task deadline',1);
  ensure(validObject(startEvidence), 'task start requires verified approval and routed event');
  const {event,trusted,currentBaseSha,seen} = startEvidence;
  ensure(validObject(event), 'task start requires routed event envelope');
  ensure(event.id === queued.event_id, 'queue event ID differs from routed event');
  const approvedState = authorizeScope(m,trusted,currentBaseSha);
  ensure(eventRouter(event,approvedState,seen,m,trusted,currentBaseSha) === 'queued', 'event failed authorization/routing');
  return {version:CONTRACT_VERSION,repository:m.repository,task_id:m.id,issue_number:m.issue_number,manifest_digest:m.manifest_sha256,base_sha:m.base_sha,state:'running',revision:0,deadline_ms:deadlineMs,cycles:[],cumulative_elapsed_minutes:0,cumulative_spend_usd:0,corrections_consumed:0,simulation_only:true};
}
function outcomeForCycle(cycle,m,cumulativeMinutes,cumulativeSpend,deadlineMs) {
  const q=m.quality_loop;
  if(cycle.observed_at_ms>deadlineMs || cumulativeMinutes>=q.elapsed_minutes_limit || cumulativeSpend>=q.api_spend_usd_limit)return 'failed_budget_or_checks';
  if(cycle.review===null)return 'needs_owner_decision';
  const finding=cycle.review.findings;
  if(cycle.review.verdict==='needs_owner' || finding.some(f=>f.type==='out_of_scope' && ['high','critical','blocker'].includes(f.severity)))return 'needs_owner_decision';
  const checksPass=m.acceptance.mandatory_checks.every(name=>cycle.checks.filter(c=>c.name===name).length===1 && cycle.checks.some(c=>c.name===name && c.pass));
  const reviewPass=cycle.review.verdict==='pass' && !finding.some(f=>['high','critical','blocker'].includes(f.severity));
  if(checksPass && reviewPass)return m.acceptance.owner_visual_required?'needs_owner_decision':'review_ready';
  return cycle.cycle===q.total_build_cycles?'failed_budget_or_checks':'correcting';
}
export function validateTask(ledger,m) {
  keys(ledger,['version','repository','task_id','issue_number','manifest_digest','base_sha','state','revision','deadline_ms','cycles','cumulative_elapsed_minutes','cumulative_spend_usd','corrections_consumed','simulation_only']);
  ensure(ledger.version===CONTRACT_VERSION && ledger.simulation_only===true,'invalid task contract');
  ensure(ledger.repository===m.repository && ledger.task_id===m.id && ledger.issue_number===m.issue_number && ledger.manifest_digest===m.manifest_sha256 && ledger.base_sha===m.base_sha,'task identity mismatch');
  ensure(['running','correcting','review_ready','needs_owner_decision','failed_budget_or_checks','cancelled','superseded'].includes(ledger.state),'invalid ledger state');
  integer(ledger.revision,'task version');integer(ledger.deadline_ms,'deadline',1);
  integer(ledger.corrections_consumed,'corrections');finite(ledger.cumulative_elapsed_minutes,'cumulative time');finite(ledger.cumulative_spend_usd,'cumulative spend');
  // Version is a compare-and-swap token for *all* state mutations, not just cycles.
  // Cancellation/supersession consumes one additional revision without inventing a cycle.
  const terminal = ledger.state === 'cancelled' || ledger.state === 'superseded';
  ensure(Array.isArray(ledger.cycles) && ledger.revision===ledger.cycles.length+(terminal?1:0),'task history/revision mismatch');
  let minutes=0,usd=0,previousObservation=-1;
  for(const [i,c] of ledger.cycles.entries()){
    validateCycle(c,m);ensure(c.cycle===i+1,'nonsequential cycle history');
    ensure(c.observed_at_ms>previousObservation,'nonmonotonic cycle observation history');
    previousObservation=c.observed_at_ms;
    minutes+=c.elapsed_minutes;usd+=c.spend_usd;
  }
  ensure(Math.abs(minutes-ledger.cumulative_elapsed_minutes)<1e-9 && Math.abs(usd-ledger.cumulative_spend_usd)<1e-9,'cumulative metering mismatch');
  ensure(ledger.corrections_consumed===Math.max(ledger.cycles.length-1,0),'correction counter mismatch');
  ensure(ledger.cycles.length<=m.quality_loop.total_build_cycles && ledger.corrections_consumed<=m.quality_loop.max_corrective_attempts,'task exceeds correction cap');
  if(ledger.cycles.length){
    let historicalMinutes=0,historicalSpend=0;
    const outcomes=ledger.cycles.map(c=>{
      historicalMinutes+=c.elapsed_minutes;historicalSpend+=c.spend_usd;
      return outcomeForCycle(c,m,historicalMinutes,historicalSpend,ledger.deadline_ms);
    });
    ensure(outcomes.slice(0,-1).every(o=>o==='correcting'),'task continued after terminal cycle');
    if(terminal){
      // A stopped task may have been correcting, review-ready, or awaiting owner.
      // It must not conceal a previously exhausted/failed cycle.
      ensure(['correcting','review_ready','needs_owner_decision'].includes(outcomes.at(-1)),'task terminated after preexisting terminal result');
    } else ensure(outcomes.at(-1)===ledger.state,'recorded review state not supported by evidence');
  }
  return true;
}
export function advanceCycle(ledger,cycle,m,{expectedRevision,nowMs}) {
  validateManifest(m);validateTask(ledger,m);validateCycle(cycle,m);
  integer(expectedRevision,'expected revision');integer(nowMs,'now clock');
  ensure(ledger.revision===expectedRevision,'stale task revision');
  ensure(['running','correcting'].includes(ledger.state),'late result after task termination');
  ensure(cycle.cycle===ledger.cycles.length+1,'retry cycle mismatch');
  ensure(cycle.cycle<=m.quality_loop.total_build_cycles && cycle.cycle-1<=m.quality_loop.max_corrective_attempts,'correction budget exceeded');
  const cumulativeMinutes=ledger.cumulative_elapsed_minutes+cycle.elapsed_minutes;
  const cumulativeSpend=ledger.cumulative_spend_usd+cycle.spend_usd;
  // nowMs is injected synthetic clock evidence in Stage B, NOT authenticated time.
  // Reject both a different reported observation and any backward/equal progression.
  // Stage C must supply this from a trusted monotonic runner clock, never an agent.
  ensure(cycle.observed_at_ms===nowMs, 'cycle observation clock mismatch');
  const previousObservation=ledger.cycles.at(-1)?.observed_at_ms;
  ensure(previousObservation===undefined || nowMs>previousObservation,'nonmonotonic cycle observation');
  const state=outcomeForCycle(cycle,m,cumulativeMinutes,cumulativeSpend,ledger.deadline_ms);
  const updated={...ledger,revision:ledger.revision+1,cycles:[...ledger.cycles,structuredClone(cycle)],cumulative_elapsed_minutes:cumulativeMinutes,cumulative_spend_usd:cumulativeSpend,corrections_consumed:cycle.cycle-1,state};
  validateTask(updated,m);
  return {ledger:updated,outcome:state};
}
export function terminateTask(ledger,m,state,expectedRevision) {
  validateTask(ledger,m);ensure(ledger.revision===expectedRevision,'stale task revision');
  ensure(['cancelled','superseded'].includes(state),'invalid terminal request');
  ensure(['running','correcting','review_ready','needs_owner_decision'].includes(ledger.state),'already terminated');
  const stopped={...ledger,state,revision:ledger.revision+1};
  validateTask(stopped,m);
  return stopped;
}
export function reviewPacket(m,ledger,prNumber) {
  validateTask(ledger,m);integer(prNumber,'PR number',1);
  ensure(['review_ready','needs_owner_decision','failed_budget_or_checks'].includes(ledger.state),'no review packet for active work');
  const last=ledger.cycles.at(-1);ensure(last!==undefined,'no candidate evidence');
  // Findings on the latest candidate remain visible even when nonblocking.
  // Earlier candidate findings stay in cycles; their disposition is not inferred.
  const latestRisks=last.review?.findings.map(f=>`${f.severity.toUpperCase()}: ${f.code}: ${f.description}`)??[];
  const unresolvedRisks=ledger.state==='review_ready'?latestRisks:[...latestRisks,'SIMULATED_GATE_NOT_CLEARED'];
  return {version:CONTRACT_VERSION,simulation_only:true,evidence_source:'SYNTHETIC_FIXTURES_NOT_LIVE_REVIEW',repository:m.repository,task_id:m.id,issue_number:m.issue_number,pr_number:prNumber,manifest_digest:m.manifest_sha256,base_sha:m.base_sha,candidate_sha:last.candidate_sha,state:ledger.state,deadline_ms:ledger.deadline_ms,cycles:structuredClone(ledger.cycles),ci_run_ids:ledger.cycles.map(c=>c.ci_run_id),candidate_shas:ledger.cycles.map(c=>c.candidate_sha),changed_paths:[...new Set(ledger.cycles.flatMap(c=>c.changed_paths))].sort(),attempts_consumed:ledger.cycles.length,corrections_consumed:ledger.corrections_consumed,cumulative_elapsed_minutes:ledger.cumulative_elapsed_minutes,cumulative_spend_usd:ledger.cumulative_spend_usd,unresolved_risks:unresolvedRisks,human_approval:'NOT GRANTED',release_authorization:'NOT GRANTED'};
}
export function noticeKey(packet) {ensure(packet?.simulation_only===true,'notification identity must be synthetic');return `${packet.task_id}:${packet.candidate_sha}:${packet.state}`;}
