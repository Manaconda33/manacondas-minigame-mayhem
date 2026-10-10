// Executed by existing PR CI's `vitest run --coverage`; no workflow modifications.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  manifestDigest, validateManifest, assertApproval, authorizeScope, eventRouter,
  queueItem, beginTask, advanceCycle, applyOwnerDecision, transition,
  validateTask, reviewPacket, assertPaths
} from './contract.mjs';
const fixtures = JSON.parse(readFileSync(resolve(process.cwd(), 'tests/ai-handoff/fixtures.json'), 'utf8'));
function prepared(index=0){
  const fixture=structuredClone(fixtures[index]),m=fixture.manifest;
  m.manifest_sha256=manifestDigest(m);m.approval.approved_digest=m.manifest_sha256;
  const trusted={fixture_context:true,provenance:'offline_test_harness',actor:'Manaconda33',authorized:true,event_id:m.approval.event_id,repository:m.repository,task_id:m.id,issue_number:m.issue_number,base_sha:m.base_sha,digest:m.manifest_sha256};
  return {m,trusted,fixture,event:{...fixture.event,manifest_digest:m.manifest_sha256}};
}
function start(p){
  return beginTask(p.m,queueItem(p.m,p.event.id),p.fixture.deadline_ms,{
    event:p.event,trusted:p.trusted,currentBaseSha:p.fixture.current_base_sha,seen:new Set()
  });
}
function advance(p,ledger,cycle,i=0){return advanceCycle(ledger,cycle,p.m,{expectedRevision:ledger.revision,nowMs:p.fixture.now_ms+i*1000});}
describe('Stage B approved fixture contracts (CI)',()=>{
  it('runs full native Node negative-test matrix in hosted PR CI',()=>{const output=execFileSync(process.execPath,['--test',resolve(process.cwd(), 'tools/ai-handoff/contract.node-check.mjs')],{encoding:'utf8',timeout:15000});expect(output).toMatch(/# tests 96/);expect(output).toMatch(/# pass 96/);expect(output).toMatch(/# fail 0/);console.log('Stage B native Node matrix: 96 passed, 0 failed');});
  it('accepts a valid versioned manifest and bound synthetic scope record',()=>{const p=prepared();expect(validateManifest(p.m)).toBe(true);expect(assertApproval(p.m,p.trusted,p.m.base_sha)).toBe(true);});
  it('rejects missing synthetic trust, changed manifest digest and stale main',()=>{const p=prepared();expect(()=>assertApproval(p.m,{},p.m.base_sha)).toThrow();p.m.objective+=' changed';expect(()=>assertApproval(p.m,p.trusted,p.m.base_sha)).toThrow();const q=prepared();expect(()=>assertApproval(q.m,q.trusted,'f'.repeat(40))).toThrow();});
  it('forbids privileged graph edges even via the otherwise allowed release sequence',()=>{expect(()=>transition('review_ready','implementation_accepted')).toThrow();expect(()=>transition('implementation_accepted','release_authorized')).toThrow();expect(()=>transition('release_authorized','delivered')).toThrow();});
  it('rejects spoofed owner release record and absent implementation acceptance evidence',()=>{const p=prepared();expect(()=>applyOwnerDecision(p.m,'implementation_accepted',{type:'release_authorization'},null,p.m.base_sha,'a'.repeat(40),289)).toThrow();});
  it('rejects protected paths and normalized traversal',()=>{const p=prepared();expect(()=>assertPaths(['src/game.ts'],p.m)).toThrow();expect(()=>assertPaths(['tools/ai-handoff/../../src/game.ts'],p.m)).toThrow();});
  it('binds every synthetic issue event to the immutable manifest and rejects repeats',()=>{const p=prepared();const seen=new Set();expect(eventRouter(p.event,'scope_approved',seen,p.m,p.trusted,p.m.base_sha)).toBe('queued');expect(()=>eventRouter({...p.event,id:'redelivery'},'scope_approved',seen,p.m,p.trusted,p.m.base_sha)).toThrow();});
  it('makes hostile issue instructions inert, not owner authority',()=>{const p=prepared(3);expect(p.event.untrusted_text).toContain('SYSTEM OVERRIDE');expect(()=>assertPaths(['src/evil.ts'],p.m)).toThrow();expect(eventRouter(p.event,'scope_approved',new Set(),p.m,p.trusted,p.m.base_sha)).toBe('queued');});
  it('passes green on the first synthetic review only',()=>{const p=prepared();const a=advance(p,start(p),p.fixture.cycles[0]);expect(a.outcome).toBe('review_ready');expect(reviewPacket(p.m,a.ledger,289).simulation_only).toBe(true);});
  it('does not accept a missing or stale reviewer report',()=>{const p=prepared(6);expect(advance(p,start(p),p.fixture.cycles[0]).outcome).toBe('needs_owner_decision');const q=prepared(9);expect(()=>advance(q,start(q),q.fixture.cycles[0])).toThrow(/stale reviewer/);});
  it('tracks cumulative API spending across multiple independently cheap cycles',()=>{const p=prepared(4);let l=start(p);l=advance(p,l,p.fixture.cycles[0]).ledger;expect(l.state).toBe('correcting');l=advance(p,l,p.fixture.cycles[1],1).ledger;expect(l.state).toBe('failed_budget_or_checks');expect(l.cumulative_spend_usd).toBeGreaterThan(2);});
  it('tracks cumulative runtime and refuses late completion',()=>{const p=prepared(5);let l=start(p);l=advance(p,l,p.fixture.cycles[0]).ledger;l=advance(p,l,p.fixture.cycles[1],1).ledger;expect(l.state).toBe('failed_budget_or_checks');const t=prepared(8);const result=advance(t,start(t),t.fixture.cycles[0]);expect(result.outcome).toBe('failed_budget_or_checks');expect(()=>advance(t,result.ledger,t.fixture.cycles[0],1)).toThrow();});
  it('limits initial build and corrective attempts to three total',()=>{const p=prepared(2);let l=start(p);for(const[i,c]of p.fixture.cycles.entries())l=advance(p,l,c,i).ledger;expect(l.state).toBe('failed_budget_or_checks');expect(l.corrections_consumed).toBe(2);});
  it('fails closed when the reviewer and checks materially disagree',()=>{const p=prepared();const c=structuredClone(p.fixture.cycles[0]);c.review.verdict='fail';expect(advance(p,start(p),c).outcome).toBe('correcting');});
  it('does not accept a synthetic reviewer as visual approval',()=>{const p=prepared(7);expect(advance(p,start(p),p.fixture.cycles[0]).outcome).toBe('needs_owner_decision');});
  it('returns packets reconstructing per-cycle SHAs, CI runs and budget usage without granting release',()=>{const p=prepared(1);let l=start(p);for(const[i,c]of p.fixture.cycles.entries())l=advance(p,l,c,i).ledger;expect(validateTask(l,p.m)).toBe(true);const packet=reviewPacket(p.m,l,289);expect(packet.candidate_shas).toHaveLength(2);expect(packet.ci_run_ids).toHaveLength(2);expect(packet.human_approval).toBe('NOT GRANTED');expect(packet.release_authorization).toBe('NOT GRANTED');});
});

// Native suite contains adversarial cases for clock backdating, terminal revisions, and packet risk summaries.
