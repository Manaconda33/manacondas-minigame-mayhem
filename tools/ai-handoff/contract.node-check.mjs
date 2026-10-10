import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateSchemaInstance } from './schema-validator.mjs';
import {
  REPOSITORY, CONTRACT_VERSION, canonical, manifestDigest, validateManifest, assertApproval,
  safePath, assertPaths, TRANSITIONS, transition, authorizeScope, verifyOwnerDecision,
  applyOwnerDecision, validateEvent, eventRouter, queueItem, validateQueueItem,
  validateLease, leaseAcquire, leaseRelease, validateReview, validateCycle,
  beginTask, validateTask, advanceCycle, terminateTask, reviewPacket, noticeKey
} from './contract.mjs';

const fixtures = JSON.parse(readFileSync(new URL('../../tests/ai-handoff/fixtures.json', import.meta.url), 'utf8'));
const schema = JSON.parse(readFileSync(new URL('./contracts.schema.json', import.meta.url), 'utf8'));
const routing = JSON.parse(readFileSync(new URL('./event-routing.json', import.meta.url), 'utf8'));
const manifestSchema = JSON.parse(readFileSync(new URL('./manifest.schema.json', import.meta.url), 'utf8'));
const cloned = obj => structuredClone(obj);
function prepared(i=0) {
  const fixture=cloned(fixtures[i]);const m=fixture.manifest;
  m.manifest_sha256=manifestDigest(m);m.approval.approved_digest=m.manifest_sha256;
  const trusted={fixture_context:true,provenance:'offline_test_harness',actor:'Manaconda33',authorized:true,event_id:m.approval.event_id,repository:m.repository,task_id:m.id,issue_number:m.issue_number,base_sha:m.base_sha,digest:m.manifest_sha256};
  const event={...fixture.event,manifest_digest:m.manifest_sha256};
  return {m,trusted,fixture,event};
}
function queued(p){const state=authorizeScope(p.m,p.trusted,p.fixture.current_base_sha);assert.equal(state,'scope_approved');assert.equal(eventRouter(p.event,state,new Set(),p.m,p.trusted,p.fixture.current_base_sha),'queued');return queueItem(p.m,p.event.id);}
function startEvidence(p,seen=new Set()){return {event:p.event,trusted:p.trusted,currentBaseSha:p.fixture.current_base_sha,seen};}
function ledger(p){return beginTask(p.m,queueItem(p.m,p.event.id),p.fixture.deadline_ms,startEvidence(p));}
function take(p,l,c,i=0){return advanceCycle(l,c,p.m,{expectedRevision:l.revision,nowMs:p.fixture.now_ms+i*1000});}
function decision(p,type,candidateSha='a'.repeat(40),prNumber=289){return {type,task_id:p.m.id,repository:p.m.repository,issue_number:p.m.issue_number,manifest_digest:p.m.manifest_sha256,base_sha:p.m.base_sha,candidate_sha:candidateSha,pr_number:prNumber,event_id:`fixture-decision-${type}`,approved_by:'Manaconda33',destination:type==='release_authorization'?'main':'implementation_only'};}
function decisionTrust(p,d){return {fixture_context:true,provenance:'offline_test_harness',authorized:true,actor:'Manaconda33',event_id:d.event_id,type:d.type,task_id:d.task_id,repository:d.repository,issue_number:d.issue_number,manifest_digest:d.manifest_digest,candidate_sha:d.candidate_sha,pr_number:d.pr_number,destination:d.destination,base_sha:d.base_sha};}

// Schema and identity.
test('canonical digest ignores field order, mutable proof and runtime state',()=>{const {m}=prepared();assert.equal(canonical({b:1,a:{b:3,a:2}}),canonical({a:{a:2,b:3},b:1}));assert.equal(manifestDigest({...m,manifest_sha256:'f'.repeat(64),state:'running'}),m.manifest_sha256);});
test('manifest and proposed JSON Schema version remain compatible',()=>{const {m}=prepared();assert.equal(validateManifest(m),true);assert.equal(manifestSchema.properties.schema_version.const,'1.2');});
test('reject unknown manifest fields and missing required fields',()=>{const {m}=prepared();m.admin=true;assert.throws(()=>validateManifest(m),/unknown/);delete m.admin;delete m.issue_number;assert.throws(()=>validateManifest(m),/missing/);});
test('reject invalid task, repo and baseline',()=>{const {m}=prepared();m.repository='elsewhere/repo';assert.throws(()=>validateManifest(m),/repository/);m.repository=REPOSITORY;m.base_sha='f';assert.throws(()=>validateManifest(m),/SHA/);});
test('reject widened allowlist and budget caps',()=>{const {m}=prepared();m.scope.allowed_paths.push('src/**');assert.throws(()=>validateManifest(m),/widen/);m.scope.allowed_paths.pop();m.quality_loop.max_corrective_attempts=3;assert.throws(()=>validateManifest(m),/budget/);});
test('versioned queue, lease, event, cycle, review, decision and packet schemas exist',()=>{for(const name of ['queue_item','lease','event','cycle','review','decision','task_ledger','review_packet'])assert.ok(schema.$defs[name],name);assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');assert.equal(routing.contract_version,CONTRACT_VERSION);});
test('event routing map describes accepted and rejected event types and owner gates',()=>{assert.deepEqual(routing.event_routes.map(x=>x.event_type),['manual_fixture','issue_labeled']);assert.ok(routing.rejected_events.includes('pull_request_comment'));assert.deepEqual(routing.human_gates.map(x=>x.to),['scope_approved','implementation_accepted','release_authorized']);});

// Approval and guarded authority.
test('synthetic scope approval only with fully matching fixture context',()=>{const p=prepared();assert.equal(assertApproval(p.m,p.trusted,p.m.base_sha),true);assert.equal(authorizeScope(p.m,p.trusted,p.m.base_sha),'scope_approved');});
test('missing adapter, unknown actor, unauthorized and provenance mismatch rejected',()=>{const p=prepared();for(const x of [{},{...p.trusted,actor:'attacker'},{...p.trusted,authorized:false},{...p.trusted,provenance:'github_automatic'}])assert.throws(()=>assertApproval(p.m,x,p.m.base_sha));});
test('changed digest or objective requires fresh scope approval',()=>{const p=prepared();p.m.objective+=' tampered';assert.throws(()=>authorizeScope(p.m,p.trusted,p.m.base_sha),/digest/);});
test('internally consistent approval still expires when current main changes',()=>{const p=prepared();assert.throws(()=>assertApproval(p.m,p.trusted,'f'.repeat(40)),/stale baseline/);});
test('wrong issue, task ID, event ID, and repository rejected',()=>{const p=prepared();for(const x of [{issue_number:999},{task_id:'MAYHEM-AUTO-999'},{event_id:'forged-event'},{repository:'spoofed/repo'}])assert.throws(()=>authorizeScope(p.m,{...p.trusted,...x},p.m.base_sha),/mismatch/);});
test('graph retains ordinary lifecycle edges but forbids privilege gates',()=>{assert.equal(transition('draft','validated'),'validated');assert.equal(transition('running','validating'),'validating');assert.ok(TRANSITIONS.implementation_accepted.includes('release_authorized'));for(const [a,b]of [['validated','scope_approved'],['scope_approved','queued'],['review_ready','implementation_accepted'],['implementation_accepted','release_authorized'],['release_authorized','delivered']])assert.throws(()=>transition(a,b),/privileged/);});
test('direct illegal release and self approval also rejected',()=>{for(const[a,b]of [['draft','release_authorized'],['review_ready','release_authorized'],['closed','running']])assert.throws(()=>transition(a,b),/illegal/);});
test('proper fixture implementation then separate release decisions can be modeled, but never delivered',()=>{
  const p=prepared();const c='a'.repeat(40);
  const reviewed=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const d1=decision(p,'implementation_acceptance',c);
  const accepted=applyOwnerDecision(p.m,reviewed,d1,decisionTrust(p,d1),p.m.base_sha,c,289);
  assert.equal(accepted.state,'implementation_accepted');
  const d2=decision(p,'release_authorization',c);
  const release=applyOwnerDecision(p.m,accepted,d2,decisionTrust(p,d2),p.m.base_sha,c,289,{decision:d1,trusted:decisionTrust(p,d1)});
  assert.equal(release.state,'release_authorized');
  assert.throws(()=>transition(release.state,'delivered'),/privileged/);
});
test('missing owner decision, forged review ready string, and unreviewed ledger cannot accept implementation',()=>{
  const p=prepared();const d=decision(p,'implementation_acceptance');
  assert.throws(()=>applyOwnerDecision(p.m,'review_ready',d,decisionTrust(p,d),p.m.base_sha,d.candidate_sha,289));
  assert.throws(()=>applyOwnerDecision(p.m,ledger(p),d,decisionTrust(p,d),p.m.base_sha,d.candidate_sha,289),/reviewed task state/);
  assert.throws(()=>applyOwnerDecision(p.m,ledger(p),null,null,p.m.base_sha,d.candidate_sha,289));
});
test('release requires exact PR and candidate SHA, not merely two allowed graph edges',()=>{const p=prepared();const d=decision(p,'release_authorization');for(const [sha,pr] of [['b'.repeat(40),289],[d.candidate_sha,290]])assert.throws(()=>verifyOwnerDecision(p.m,d,decisionTrust(p,d),p.m.base_sha,sha,pr),/wrong decision candidate/);});
test('scope approval event cannot be replayed as an implementation or release decision',()=>{const p=prepared();for(const type of ['implementation_acceptance','release_authorization']){const d=decision(p,type);d.event_id=p.m.approval.event_id;assert.throws(()=>verifyOwnerDecision(p.m,d,decisionTrust(p,d),p.m.base_sha,d.candidate_sha,289),/scope approval cannot/);}});
test('wrong release destination/scope and spoofed trusted record rejected',()=>{const p=prepared();const d=decision(p,'release_authorization');for(const dest of ['dev','implementation_only'])assert.throws(()=>verifyOwnerDecision(p.m,{...d,destination:dest},decisionTrust(p,d),p.m.base_sha,d.candidate_sha,289),/scope\/destination/);assert.throws(()=>verifyOwnerDecision(p.m,d,{...decisionTrust(p,d),actor:'attacker'},p.m.base_sha,d.candidate_sha,289),/adapter/);});
test('release approval tied to stale main, wrong issue and altered manifest fails',()=>{const p=prepared();const d=decision(p,'release_authorization');assert.throws(()=>verifyOwnerDecision(p.m,d,decisionTrust(p,d),'f'.repeat(40),d.candidate_sha,289),/stale/);assert.throws(()=>verifyOwnerDecision(p.m,{...d,issue_number:123},decisionTrust(p,d),p.m.base_sha,d.candidate_sha,289),/identity/);});
test('implementation decision and release decision must use distinct events',()=>{
  const p=prepared();const c='a'.repeat(40);const reviewed=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const d=decision(p,'implementation_acceptance');
  const accepted=applyOwnerDecision(p.m,reviewed,d,decisionTrust(p,d),p.m.base_sha,c,289);
  const rel=decision(p,'release_authorization');rel.event_id=d.event_id;
  assert.throws(()=>applyOwnerDecision(p.m,accepted,rel,decisionTrust(p,rel),p.m.base_sha,c,289,{decision:d,trusted:decisionTrust(p,d)}),/distinct events/);
});
test('release cannot be authorized without authentic prior implementation acceptance',()=>{
  const p=prepared();const c='a'.repeat(40);const reviewed=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const d=decision(p,'implementation_acceptance');const accepted=applyOwnerDecision(p.m,reviewed,d,decisionTrust(p,d),p.m.base_sha,c,289);
  const rel=decision(p,'release_authorization');
  assert.throws(()=>applyOwnerDecision(p.m,accepted,rel,decisionTrust(p,rel),p.m.base_sha,c,289),/distinct implementation acceptance proof/);
  assert.throws(()=>applyOwnerDecision(p.m,{...accepted,implementation_event_id:'forged'},rel,decisionTrust(p,rel),p.m.base_sha,c,289,{decision:d,trusted:decisionTrust(p,d)}),/implementation event/);
});

// Scope paths, input isolation, events, duplicates.
test('allowed paths pass and protected source/assets/workflows are rejected',()=>{const p=prepared();assert.equal(assertPaths(['tools/ai-handoff/contract.mjs','tests/ai-handoff/fixtures.json','docs/automation/report.md'],p.m),true);for(const path of ['src/index.ts','public/game.js','assets/sfx.wav','.github/workflows/ci.yml','AGENTS.md','docs/PRD.md','package-lock.json'])assert.throws(()=>assertPaths([path],p.m),/protected/);});
test('traversal, percent-encoded, drive, slash, nul, and dots rejected',()=>{for(const path of ['../src/a','tools/ai-handoff/../src','/etc/passwd','C:/windows','docs//automation/x','docs/automation/%2e%2e','docs\\automation\\hi','docs/automation/\0'])assert.throws(()=>safePath(path));});
test('out-of-scope paths and widened manifest allowlist are not valid',()=>{const p=prepared();assert.throws(()=>assertPaths(['docs/release.md'],p.m),/outside/);p.m.scope.allowed_paths.push('docs/**');assert.throws(()=>validateManifest(p.m),/widen/);});
test('valid event must bind the exact approval identity and baseline',()=>{const p=prepared();assert.equal(validateEvent(p.event),true);assert.equal(eventRouter(p.event,'scope_approved',new Set(),p.m,p.trusted,p.m.base_sha),'queued');});
test('router rejects state faked as approved without trusted scope record',()=>{const p=prepared();assert.throws(()=>eventRouter(p.event,'scope_approved',new Set(),p.m,{},p.m.base_sha),/trusted adapter/);});
test('unexpected PR comment or unapproved issue label rejected',()=>{const p=prepared();assert.throws(()=>eventRouter({...p.event,type:'pull_request_comment'},'scope_approved',new Set(),p.m,p.trusted,p.m.base_sha),/untrusted event/);assert.throws(()=>eventRouter({...p.event,label:'run-now'},'scope_approved',new Set(),p.m,p.trusted,p.m.base_sha),/unexpected label/);});
test('stale or forged digest, actor, issue and base all blocked at event entry',()=>{const p=prepared();for(const fields of [{manifest_digest:'f'.repeat(64)},{actor:'attacker'},{issue_number:55},{base_sha:'f'.repeat(40)},{task_id:'MAYHEM-AUTO-999'}])assert.throws(()=>eventRouter({...p.event,...fields},'scope_approved',new Set(),p.m,p.trusted,p.m.base_sha),/event not bound/);});
test('duplicate webhook delivery and repeated label with new delivery ID blocked',()=>{const p=prepared();const seen=new Set();assert.equal(eventRouter(p.event,'scope_approved',seen,p.m,p.trusted,p.m.base_sha),'queued');assert.throws(()=>eventRouter(p.event,'scope_approved',seen,p.m,p.trusted,p.m.base_sha),/duplicate/);assert.throws(()=>eventRouter({...p.event,id:'new-delivery'},'scope_approved',seen,p.m,p.trusted,p.m.base_sha),/duplicate/);});
test('hostile issue body stays untrusted data, cannot modify approved scope',()=>{const p=prepared(3);const original=manifestDigest(p.m);assert.match(p.event.untrusted_text,/SYSTEM OVERRIDE/);assert.equal(eventRouter(p.event,'scope_approved',new Set(),p.m,p.trusted,p.m.base_sha),'queued');assert.equal(manifestDigest(p.m),original);assert.throws(()=>assertPaths(['src/evil.ts'],p.m),/protected/);});
test('queue contract binds event and all immutable task identity fields',()=>{const p=prepared();const item=queueItem(p.m,p.event.id);assert.equal(validateQueueItem(item,p.m),true);for(const x of [{task_id:'MAYHEM-AUTO-999'},{manifest_digest:'f'.repeat(64)},{base_sha:'f'.repeat(40)}])assert.throws(()=>validateQueueItem({...item,...x},p.m),/identity/);});
test('queue contract rejects undocumented fields and unauthorized state',()=>{const p=prepared();const item=queueItem(p.m,p.event.id);assert.throws(()=>validateQueueItem({...item,state:'running'},p.m),/contract/);assert.throws(()=>validateQueueItem({...item,elevated:true},p.m),/unknown/);});

// Lease and cumulative budget evidence.
const emptyLease=()=>({version:CONTRACT_VERSION,workstream:'pilot-automation',owner:null,expires_at_ms:0,generation:0});
test('lease schema and same-workstream exclusivity',()=>{const l=emptyLease();assert.equal(validateLease(l),true);const held=leaseAcquire(l,'MAYHEM-AUTO-001',1000,50,0);assert.equal(held.generation,1);assert.throws(()=>leaseAcquire(held,'MAYHEM-AUTO-002',1010,50,1),/occupied/);});
test('stale lease cannot silently transfer ownership and CAS generation protected',()=>{const held=leaseAcquire(emptyLease(),'MAYHEM-AUTO-001',1000,50,0);assert.throws(()=>leaseAcquire(held,'MAYHEM-AUTO-002',1100,50,1),/stale lease/);assert.throws(()=>leaseRelease(held,'MAYHEM-AUTO-001',0),/ownership/);assert.equal(leaseRelease(held,'MAYHEM-AUTO-001',1).owner,null);});
test('malformed lease missing owner or forged generation rejected',()=>{const l=emptyLease();delete l.owner;assert.throws(()=>validateLease(l),/missing/);assert.throws(()=>leaseAcquire(emptyLease(),'MAYHEM-AUTO-001',1000,50,1),/stale lease version/);});
test('first-cycle green produces only simulated review readiness',()=>{const p=prepared();const {ledger:l,outcome}=take(p,ledger(p),p.fixture.cycles[0]);assert.equal(outcome,'review_ready');assert.equal(l.cycles.length,1);assert.equal(l.revision,1);});
test('correction cycle passes only after fresh reviewer evidence on changed SHA',()=>{const p=prepared(1);let l=ledger(p);assert.equal((l=take(p,l,p.fixture.cycles[0],0).ledger).state,'correcting');assert.equal((l=take(p,l,p.fixture.cycles[1],1).ledger).state,'review_ready');assert.deepEqual(l.cycles.map(c=>c.candidate_sha),['b'.repeat(40),'c'.repeat(40)]);});
test('exhausting three attempts and two corrective attempts stops',()=>{const p=prepared(2);let l=ledger(p);for(const[i,c]of p.fixture.cycles.entries())l=take(p,l,c,i).ledger;assert.equal(l.state,'failed_budget_or_checks');assert.equal(l.revision,3);assert.equal(l.corrections_consumed,2);assert.throws(()=>take(p,l,{...p.fixture.cycles[2],cycle:4},3),/late result/);});
test('repeating cycle 1 cannot reset attempts or metering',()=>{const p=prepared(1);let l=take(p,ledger(p),p.fixture.cycles[0]).ledger;assert.throws(()=>take(p,l,p.fixture.cycles[0],1),/retry cycle mismatch/);});
test('task revision is compare-and-swap and stale writes are rejected',()=>{const p=prepared();const l=take(p,ledger(p),p.fixture.cycles[0]).ledger;assert.throws(()=>advanceCycle(l,{...p.fixture.cycles[0],cycle:2},p.m,{expectedRevision:0,nowMs:2000}),/stale task revision/);});
test('two individually cheap cycles exceed cumulative API budget',()=>{const p=prepared(4);let l=ledger(p);l=take(p,l,p.fixture.cycles[0]).ledger;assert.ok(l.cumulative_spend_usd<p.m.quality_loop.api_spend_usd_limit);l=take(p,l,p.fixture.cycles[1],1).ledger;assert.equal(l.state,'failed_budget_or_checks');assert.ok(l.cumulative_spend_usd>p.m.quality_loop.api_spend_usd_limit);});
test('two individually short cycles exceed cumulative elapsed budget',()=>{const p=prepared(5);let l=ledger(p);l=take(p,l,p.fixture.cycles[0]).ledger;l=take(p,l,p.fixture.cycles[1],1).ledger;assert.equal(l.state,'failed_budget_or_checks');assert.equal(l.cumulative_elapsed_minutes,32);});
test('tampering with cumulative total/correction history is rejected',()=>{const p=prepared(1);let l=take(p,ledger(p),p.fixture.cycles[0]).ledger;assert.throws(()=>validateTask({...l,cumulative_spend_usd:0},p.m),/cumulative metering/);assert.throws(()=>validateTask({...l,corrections_consumed:2},p.m),/counter mismatch/);});
test('missing budget value cannot be interpreted as free',()=>{const p=prepared();const c={...p.fixture.cycles[0],spend_usd:undefined};assert.throws(()=>take(p,ledger(p),c),/API spend/);});
test('timeout/late result is recorded as terminal failure, cannot be accepted afterward',()=>{const p=prepared(8);const first=take(p,ledger(p),p.fixture.cycles[0]);assert.equal(first.outcome,'failed_budget_or_checks');assert.throws(()=>take(p,first.ledger,{...p.fixture.cycles[0],cycle:2}),/late result/);});
test('cancellation and supersession reject late job results',()=>{for(const status of ['cancelled','superseded']){const p=prepared();const l=terminateTask(ledger(p),p.m,status,0);assert.throws(()=>take(p,l,p.fixture.cycles[0]),/late result/);}});
test('duplicate mandatory checks and partial mandatory results are never ready',()=>{const p=prepared();const c=p.fixture.cycles[0];const duplicate={...c,checks:[...c.checks,c.checks[0]]};assert.equal(take(p,ledger(p),duplicate).outcome,'correcting');const missing={...c,checks:c.checks.slice(0,1)};assert.equal(take(p,ledger(p),missing).outcome,'correcting');});
test('reviewer-pass with high finding and test/reviewer disagreement cannot pass',()=>{const p=prepared();const c=cloned(p.fixture.cycles[0]);c.review.findings=[{severity:'high',code:'CRITICAL_SIM',description:'unresolved blocker'}];assert.equal(take(p,ledger(p),c).outcome,'correcting');c.review={...c.review,verdict:'fail',findings:[]};assert.equal(take(p,ledger(p),c).outcome,'correcting');});
test('review missing yields owner decision, not review readiness',()=>{const p=prepared(6);assert.equal(take(p,ledger(p),p.fixture.cycles[0]).outcome,'needs_owner_decision');});
test('review for another candidate is rejected before state advances',()=>{const p=prepared(9);assert.throws(()=>take(p,ledger(p),p.fixture.cycles[0]),/stale reviewer candidate/);});
test('out of scope high finding escalates instead of new correction',()=>{const p=prepared();const c=cloned(p.fixture.cycles[0]);c.review.findings=[{severity:'high',code:'SCOPE',description:'protected file requested',type:'out_of_scope'}];assert.equal(take(p,ledger(p),c).outcome,'needs_owner_decision');});
test('fake reviewer flag cannot grant review readiness and fake owner visual cannot grant acceptance',()=>{const p=prepared(7);assert.equal(take(p,ledger(p),p.fixture.cycles[0]).outcome,'needs_owner_decision');const bad=cloned(p.fixture.cycles[0]);bad.review={source:'ai-approved',review_id:'fake',reviewer_id:'fake',candidate_sha:bad.candidate_sha,verdict:'pass',findings:[]};assert.throws(()=>take(p,ledger(p),bad),/not an independent review fixture/);});
test('new Task ledger must come from a matching queue record',()=>{const p=prepared();const q=queued(p);assert.equal(validateTask(beginTask(p.m,q,600000,startEvidence(p)),p.m),true);assert.throws(()=>beginTask(p.m,{...q,task_id:'MAYHEM-AUTO-999'},600000,startEvidence(p)),/identity/);});
test('review packet is immutable-identity complete, reconstructable, labeled synthetic, and cannot grant release',()=>{const p=prepared(1);let l=ledger(p);for(const[i,c]of p.fixture.cycles.entries())l=take(p,l,c,i).ledger;const packet=reviewPacket(p.m,l,p.fixture.pr_number);assert.equal(packet.simulation_only,true);assert.match(packet.evidence_source,/SYNTHETIC/);assert.equal(packet.release_authorization,'NOT GRANTED');assert.equal(packet.human_approval,'NOT GRANTED');assert.deepEqual(packet.candidate_shas,l.cycles.map(c=>c.candidate_sha));assert.deepEqual(packet.ci_run_ids,l.cycles.map(c=>c.ci_run_id));assert.equal(packet.manifest_digest,p.m.manifest_sha256);assert.equal(packet.base_sha,p.m.base_sha);assert.equal(packet.cumulative_elapsed_minutes,l.cumulative_elapsed_minutes);assert.equal(packet.cumulative_spend_usd,l.cumulative_spend_usd);assert.equal(packet.attempts_consumed,2);assert.equal(noticeKey(packet),noticeKey({...packet}));});
test('packet cannot be created from active work or without committed evidence',()=>{const p=prepared();assert.throws(()=>reviewPacket(p.m,ledger(p),289),/active work/);});
test('all 11 fixtures match explicit expected results including negative error scenarios',()=>{for(let i=0;i<fixtures.length;i++){const p=prepared(i);try{const l0=ledger(p);let l=l0;const outcomes=[];for(const[j,c]of p.fixture.cycles.entries()){const a=take(p,l,c,j);l=a.ledger;outcomes.push(a.outcome);}assert.equal(p.fixture.expected_error,undefined);assert.deepEqual(outcomes,p.fixture.expected_outcomes);}catch(e){if(!p.fixture.expected_error)throw e;assert.match(e.message,new RegExp(p.fixture.expected_error));}}});
test('cannot forge review_ready by editing recorded state without successful review evidence',()=>{
  const p=prepared(1);const first=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  assert.equal(first.state,'correcting');
  assert.throws(()=>validateTask({...first,state:'review_ready'},p.m),/not supported by evidence/);
  assert.throws(()=>reviewPacket(p.m,{...first,state:'review_ready'},289),/not supported by evidence/);
});
test('cannot insert another cycle after a successful prior cycle and falsify counters',()=>{
  const p=prepared(1);const good=prepared();let l=take(good,ledger(good),good.fixture.cycles[0]).ledger;
  const c={...p.fixture.cycles[1],cycle:2};
  assert.throws(()=>take(good,l,c,1),/late result/);
  const forged={...l,revision:2,corrections_consumed:1,cycles:[...l.cycles,c],state:'review_ready',cumulative_elapsed_minutes:l.cumulative_elapsed_minutes+c.elapsed_minutes,cumulative_spend_usd:l.cumulative_spend_usd+c.spend_usd};
  assert.throws(()=>validateTask(forged,good.m),/task continued after terminal cycle/);
});
test('cycle time evidence is bound to supplied observation clock, not resettable by caller',()=>{
  const p=prepared();const c={...p.fixture.cycles[0],observed_at_ms:1200};
  assert.throws(()=>take(p,ledger(p),c),/observation clock mismatch/);
});

// Work re-review high finding 1: no independent path from queue-shaped data to running.
test('task start denies direct matching queue injection without approval or routing',()=>{
  const p=prepared();const q=queueItem(p.m,p.event.id);
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms),/task start requires verified approval/);
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms,{}),/routed event envelope/);
});
test('task start rejects fabricated event ID despite otherwise matching queue identity',()=>{
  const p=prepared();const invented=queueItem(p.m,'forged-event-999');
  assert.equal(validateQueueItem(invented,p.m),true);
  assert.throws(()=>beginTask(p.m,invented,p.fixture.deadline_ms,startEvidence(p)),/queue event ID differs/);
});
test('task start freshly rejects a disallowed actor even if queue identity matches',()=>{
  const p=prepared();const q=queueItem(p.m,p.event.id);
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms,{...startEvidence(p),trusted:{...p.trusted,authorized:false}}),/untrusted actor/);
});
test('task start rejects modified manifest digest after purported queueing',()=>{
  const p=prepared();const q=queueItem(p.m,p.event.id);p.m.objective+=' unauthorized change';
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms,startEvidence(p)),/approval digest mismatch/);
});
test('task start rejects otherwise consistent approval when current baseline is stale',()=>{
  const p=prepared();const q=queueItem(p.m,p.event.id);
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms,{...startEvidence(p),currentBaseSha:'f'.repeat(40)}),/stale baseline/);
});
test('task start rejects replay when using the same simulated event ledger',()=>{
  const p=prepared();const q=queueItem(p.m,p.event.id);const seen=new Set();
  assert.equal(beginTask(p.m,q,p.fixture.deadline_ms,startEvidence(p,seen)).state,'running');
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms,startEvidence(p,seen)),/duplicate event/);
});


// Second independent Work review: monotonic time, cancellation CAS, and packet truthfulness.
test('backdated second-cycle observation is rejected even if caller supplies matching nowMs',()=>{
  const p=prepared(1); const first=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const second={...p.fixture.cycles[1],observed_at_ms:p.fixture.cycles[0].observed_at_ms-1};
  assert.throws(()=>advanceCycle(first,second,p.m,{expectedRevision:first.revision,nowMs:second.observed_at_ms}),/nonmonotonic cycle observation/);
});
test('duplicate second-cycle clock tick is rejected, not treated as forward progress',()=>{
  const p=prepared(1); const first=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const second={...p.fixture.cycles[1],observed_at_ms:p.fixture.cycles[0].observed_at_ms};
  assert.throws(()=>advanceCycle(first,second,p.m,{expectedRevision:first.revision,nowMs:second.observed_at_ms}),/nonmonotonic cycle observation/);
});
test('late second cycle using a forward clock fails the absolute deadline',()=>{
  const p=prepared(1); const first=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const late=p.fixture.deadline_ms+1;
  const second={...p.fixture.cycles[1],observed_at_ms:late};
  const result=advanceCycle(first,second,p.m,{expectedRevision:first.revision,nowMs:late});
  assert.equal(result.outcome,'failed_budget_or_checks');
  assert.equal(result.ledger.revision,2);
});
test('forged ledger history with regressing observation is not validated',()=>{
  const p=prepared(1); let record=ledger(p);
  record=take(p,record,p.fixture.cycles[0]).ledger;
  record=take(p,record,p.fixture.cycles[1],1).ledger;
  const bad=structuredClone(record);
  bad.cycles[1].observed_at_ms=bad.cycles[0].observed_at_ms-1;
  assert.throws(()=>validateTask(bad,p.m),/nonmonotonic cycle observation history/);
});
test('cancellation consumes revision and invalidates a stale worker revision',()=>{
  const p=prepared(1);const current=ledger(p);const oldRevision=current.revision;
  const cancelled=terminateTask(current,p.m,'cancelled',oldRevision);
  assert.equal(cancelled.revision,oldRevision+1);
  assert.equal(cancelled.cycles.length,0);
  assert.equal(validateTask(cancelled,p.m),true);
  assert.throws(()=>advanceCycle(cancelled,p.fixture.cycles[0],p.m,{expectedRevision:oldRevision,nowMs:p.fixture.now_ms}),/stale task revision/);
});
test('cancellation after a correction preserves cycle evidence and increments revision',()=>{
  const p=prepared(1);const first=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const cancelled=terminateTask(first,p.m,'cancelled',first.revision);
  assert.equal(cancelled.revision,2);
  assert.equal(cancelled.cycles.length,1);
  assert.equal(cancelled.corrections_consumed,0);
  assert.equal(validateTask(cancelled,p.m),true);
  assert.throws(()=>terminateTask(cancelled,p.m,'superseded',first.revision),/stale task revision/);
});
test('supersession also consumes a revision and blocks stale writes',()=>{
  const p=prepared();const old=ledger(p);const stopped=terminateTask(old,p.m,'superseded',0);
  assert.equal(stopped.revision,1);
  assert.equal(validateTask(stopped,p.m),true);
  assert.throws(()=>advanceCycle(stopped,p.fixture.cycles[0],p.m,{expectedRevision:0,nowMs:p.fixture.now_ms}),/stale task revision/);
});
test('forged cancellation retaining old revision cannot pass validation',()=>{
  const p=prepared();const active=ledger(p);
  assert.throws(()=>validateTask({...active,state:'cancelled'},p.m),/task history\/revision mismatch/);
});
test('review-ready packet retains nonblocking medium and low risk findings',()=>{
  const p=prepared();const cycle=structuredClone(p.fixture.cycles[0]);
  cycle.review.findings=[
    {severity:'medium',code:'M-LINT',description:'Manual cleanup still recommended'},
    {severity:'low',code:'L-DOC',description:'Minor docs improvement'}
  ];
  const result=take(p,ledger(p),cycle);
  assert.equal(result.outcome,'review_ready');
  const packet=reviewPacket(p.m,result.ledger,p.fixture.pr_number);
  assert.deepEqual(packet.unresolved_risks,[
    'MEDIUM: M-LINT: Manual cleanup still recommended',
    'LOW: L-DOC: Minor docs improvement'
  ]);
  assert.equal(packet.human_approval,'NOT GRANTED');
});
test('packet reports latest unresolved findings, without relabeling fixed earlier findings',()=>{
  const p=prepared(1);let record=ledger(p);
  for(const [i,cycle] of p.fixture.cycles.entries())record=take(p,record,cycle,i).ledger;
  const packet=reviewPacket(p.m,record,p.fixture.pr_number);
  assert.equal(packet.state,'review_ready');
  assert.deepEqual(packet.unresolved_risks,[]);
  assert.ok(packet.cycles[0].review.findings.length>0);
});

// Third independent Work review: scope gate, durable report provenance, schema instances, merge denial.
for (const severity of ['info','low','medium','high','critical','blocker']) {
  test(`out-of-scope ${severity} finding always requires owner disposition, never review_ready`, () => {
    const p=prepared();const c=cloned(p.fixture.cycles[0]);
    c.review.findings=[{severity,type:'out_of_scope',code:`SCOPE-${severity}`,description:'Attempted operation outside approved paths'}];
    c.review.verdict='pass';
    const result=take(p,ledger(p),c);
    assert.equal(result.outcome,'needs_owner_decision');
    const packet=reviewPacket(p.m,result.ledger,p.fixture.pr_number);
    assert.match(packet.unresolved_risks.join(' / '),new RegExp(`SCOPE-${severity}`));
    assert.equal(packet.human_approval,'NOT GRANTED');
  });
}
test('task and final review packet retain both immutable approval and routed event IDs',()=>{
  const p=prepared();const started=ledger(p);
  assert.equal(started.scope_approval_event_id,p.m.approval.event_id);
  assert.equal(started.routed_event_id,p.event.id);
  const finished=take(p,started,p.fixture.cycles[0]).ledger;
  const packet=reviewPacket(p.m,finished,p.fixture.pr_number);
  assert.equal(packet.scope_approval_event_id,p.m.approval.event_id);
  assert.equal(packet.routed_event_id,p.event.id);
  assert.equal(validateTask(finished,p.m),true);
  assert.equal(validateSchemaInstance(schema,finished,'#/$defs/task_ledger'),true);
  assert.equal(validateSchemaInstance(schema,packet,'#/$defs/review_packet'),true);
});
test('task history cannot be relabeled to a different scope approval event',()=>{
  const p=prepared();const started=ledger(p);
  assert.throws(()=>validateTask({...started,scope_approval_event_id:'unrelated-approval'},p.m),/task approval provenance mismatch/);
  assert.throws(()=>validateTask({...started,routed_event_id:''},p.m),/routed event provenance/);
  assert.throws(()=>validateTask({...started,routed_event_id:p.m.approval.event_id},p.m),/must be distinct/);
});

const schemaCases = {
  queue_item: (p) => queueItem(p.m,p.event.id),
  event: (p) => p.event,
  lease: () => ({version:CONTRACT_VERSION,workstream:'pilot-automation',owner:null,expires_at_ms:0,generation:0}),
  review: (p) => p.fixture.cycles[0].review,
  cycle: (p) => p.fixture.cycles[0],
  decision: (p) => decision(p,'implementation_acceptance'),
  task_ledger: (p) => ledger(p),
  review_packet: (p) => reviewPacket(p.m,take(p,ledger(p),p.fixture.cycles[0]).ledger,p.fixture.pr_number)
};
for (const [kind,build] of Object.entries(schemaCases)) {
  test(`Draft 2020-12 ${kind} schema checks valid and malformed instances`,()=>{
    const p=prepared();const valid=build(p),ref=`#/$defs/${kind}`;
    assert.equal(validateSchemaInstance(schema,valid,ref),true,`${kind} valid instance`);
    // Required fields and additionalProperties are actual schema assertions.
    const without=cloned(valid);delete without[Object.keys(valid)[0]];
    assert.equal(validateSchemaInstance(schema,without,ref),false,`${kind} missing required property`);
    assert.equal(validateSchemaInstance(schema,{...valid,unexpected_escalation:true},ref),false,`${kind} unexpected property`);
  });
}
test('Draft 2020-12 discriminated top-level contract and nested constraints reject invalid types',()=>{
  const p=prepared();const q=queueItem(p.m,p.event.id);
  assert.equal(validateSchemaInstance(schema,q),true);
  assert.equal(validateSchemaInstance(schema,{...q,base_sha:'bad'}),false);
  assert.equal(validateSchemaInstance(schema,{...q,workstream:'production'}),false);
  const c=cloned(p.fixture.cycles[0]);c.review.findings=[{severity:'not-a-severity',code:'X',description:'bad'}];
  assert.equal(validateSchemaInstance(schema,c,'#/$defs/cycle'),false);
  assert.equal(validateSchemaInstance(manifestSchema,p.m),true);
  assert.equal(validateSchemaInstance(manifestSchema,{...p.m,scope:{...p.m.scope,workstream_lock:'another-workstream'}}),false);
});
test('schema instance runner refuses silently ignoring new unsupported assertion keywords',()=>{
  const altered=cloned(schema);altered.$defs.queue_item.properties.event_id.not_a_real_keyword=true;
  const p=prepared();assert.throws(()=>validateSchemaInstance(altered,queueItem(p.m,p.event.id),'#/$defs/queue_item'),/unimplemented JSON Schema keyword/);
});
test('simulated merge request without exact authorization is always rejected',()=>{
  const p=prepared();const candidate=p.fixture.cycles[0].candidate_sha;
  const reviewed=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const accept=decision(p,'implementation_acceptance',candidate);
  const accepted=applyOwnerDecision(p.m,reviewed,accept,decisionTrust(p,accept),p.m.base_sha,candidate,289);
  // Stage B does not route merge events or contain a merge/publish function.
  assert.throws(()=>validateEvent({...p.event,type:'merge_request'}),/untrusted event type/);
  assert.throws(()=>transition('release_authorized','delivered'),/privileged transition/);
  const release=decision(p,'release_authorization',candidate);
  assert.throws(()=>applyOwnerDecision(p.m,accepted,null,null,p.m.base_sha,candidate,289,{decision:accept,trusted:decisionTrust(p,accept)}));
  for (const [variant,decisionChange,baseline,sha,pr] of [
    ['stale baseline',{},'f'.repeat(40),candidate,289],
    ['wrong PR',{},p.m.base_sha,candidate,290],
    ['wrong candidate SHA',{},p.m.base_sha,'f'.repeat(40),289],
    ['wrong owner',{approved_by:'unauthorized'},p.m.base_sha,candidate,289]
  ]) {
    assert.throws(()=>applyOwnerDecision(p.m,accepted,{...release,...decisionChange},decisionTrust(p,release),baseline,sha,pr,{decision:accept,trusted:decisionTrust(p,accept)}),undefined,variant);
  }
});

test('task start rejects a routed event reusing the scope-approval event ID before consuming deduplication',()=>{
  const p=prepared();const altered={...p.event,id:p.m.approval.event_id};const seen=new Set();
  const q=queueItem(p.m,altered.id);
  assert.throws(()=>beginTask(p.m,q,p.fixture.deadline_ms,{...startEvidence(p,seen),event:altered}),/routed event must differ/);
  assert.equal(seen.size,0);
});

// Narrow pilot-closeout fixes: provenance consistency and nonempty owner decisions.
test('routed start-event evidence binds the routed ID and survives a packet without issue instructions',()=>{
  const p=prepared(3);const started=ledger(p);
  assert.equal(started.routed_event_evidence.id,p.event.id);
  assert.equal(started.routed_event_evidence.manifest_digest,p.m.manifest_sha256);
  assert.ok(!Object.hasOwn(started.routed_event_evidence,'untrusted_text'));
  const reviewed=take(p,started,p.fixture.cycles[0]).ledger;
  const packet=reviewPacket(p.m,reviewed,p.fixture.pr_number);
  assert.deepEqual(packet.routed_event_evidence,started.routed_event_evidence);
  assert.equal(packet.routed_event_id,packet.routed_event_evidence.id);
  assert.equal(validateSchemaInstance(schema,reviewed,'#/$defs/task_ledger'),true);
  assert.equal(validateSchemaInstance(schema,packet,'#/$defs/review_packet'),true);
});
test('relabeling the routed event ID fails ledger validation and packet generation',()=>{
  const p=prepared();const reviewed=take(p,ledger(p),p.fixture.cycles[0]).ledger;
  const tampered={...reviewed,routed_event_id:'forged-but-nonempty-event'};
  assert.throws(()=>validateTask(tampered,p.m),/routed event provenance mismatch/);
  assert.throws(()=>reviewPacket(p.m,tampered,p.fixture.pr_number),/routed event provenance mismatch/);
});
test('changing the retained start-event evidence ID or identity fails closed',()=>{
  const p=prepared();const started=ledger(p);
  assert.throws(()=>validateTask({...started,routed_event_evidence:{...started.routed_event_evidence,id:'forged-id'}},p.m),/routed event provenance mismatch/);
  assert.throws(()=>validateTask({...started,routed_event_evidence:{...started.routed_event_evidence,manifest_digest:'f'.repeat(64)}},p.m),/routed event evidence identity mismatch/);
  const missing=structuredClone(started);delete missing.routed_event_evidence;
  assert.throws(()=>validateTask(missing,p.m),/missing routed_event_evidence/);
});
test('empty decision event ID is rejected for implementation acceptance and release authorization',()=>{
  const p=prepared();
  for(const type of ['implementation_acceptance','release_authorization']){
    const d={...decision(p,type),event_id:''};
    const trust={...decisionTrust(p,d),event_id:''};
    assert.throws(()=>verifyOwnerDecision(p.m,d,trust,p.m.base_sha,d.candidate_sha,d.pr_number),/invalid owner decision event ID/);
    assert.equal(validateSchemaInstance(schema,d,'#/$defs/decision'),false);
  }
});
