// Read-only Stage B fixture driver. No GitHub, Work, Codex, secrets, or filesystem writes.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { manifestDigest, authorizeScope, eventRouter, queueItem, validateQueueItem, beginTask, advanceCycle, reviewPacket, noticeKey } from './contract.mjs';

const fixtures = JSON.parse(readFileSync(resolve(process.argv[2] ?? 'tests/ai-handoff/fixtures.json'), 'utf8'));
const results = [];
let failed = 0;
for(const fixture of fixtures){
  const m = structuredClone(fixture.manifest);
  m.manifest_sha256 = manifestDigest(m);
  m.approval.approved_digest = m.manifest_sha256;
  const trusted = {fixture_context:true,provenance:'offline_test_harness',actor:'Manaconda33',authorized:true,event_id:m.approval.event_id,task_id:m.id,repository:m.repository,issue_number:m.issue_number,base_sha:m.base_sha,digest:m.manifest_sha256};
  const event = {...fixture.event,manifest_digest:m.manifest_sha256};
  try {
    const scoped = authorizeScope(m,trusted,fixture.current_base_sha);
    const state = eventRouter(event,scoped,new Set(),m,trusted,fixture.current_base_sha);
    if(state!=='queued')throw Error('fixture not queued');
    const queued = queueItem(m,event.id);
    validateQueueItem(queued,m);
    let ledger = beginTask(m,queued,fixture.deadline_ms);
    const outcomes=[];
    for(const [i,cycle] of fixture.cycles.entries()){
      const advanced=advanceCycle(ledger,cycle,m,{expectedRevision:ledger.revision,nowMs:fixture.now_ms+i*1000});
      ledger=advanced.ledger;outcomes.push(advanced.outcome);
    }
    const packet = reviewPacket(m,ledger,fixture.pr_number);
    if(JSON.stringify(outcomes)!==JSON.stringify(fixture.expected_outcomes))throw Error(`outcome mismatch expected=${JSON.stringify(fixture.expected_outcomes)} actual=${JSON.stringify(outcomes)}`);
    if(fixture.expected_error)throw Error('expected rejection but scenario passed');
    results.push({fixture:fixture.name,passed:true,outcomes,packet,notice_key:noticeKey(packet)});
  }catch(error){
    const matched=Boolean(fixture.expected_error && error.message.includes(fixture.expected_error));
    if(!matched)failed++;
    results.push({fixture:fixture.name,passed:matched,expected_error:fixture.expected_error??null,error:error.message});
  }
}
console.log(JSON.stringify({simulation_only:true,external_actions:0,fixtures:fixtures.length,failed,results},null,2));
if(failed)process.exitCode=1;
