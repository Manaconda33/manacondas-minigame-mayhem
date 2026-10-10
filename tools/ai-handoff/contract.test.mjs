import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { manifestDigest, validateManifest, assertApproval, assertPaths, transition, evaluateCycle, eventRouter } from './contract.mjs';
const fixture = JSON.parse(readFileSync(new globalThis.URL('../../tests/ai-handoff/fixtures.json', import.meta.url), 'utf8'))[0];
function prepared() {
  const m = globalThis.structuredClone(fixture.manifest);
  m.manifest_sha256 = manifestDigest(m);
  m.approval.approved_digest = m.manifest_sha256;
  const trust = {fixture_context:true,actor:'Manaconda33',authorized:true,event_id:m.approval.event_id,issue_number:m.issue_number,base_sha:m.base_sha,digest:m.manifest_sha256};
  return {m,trust};
}
describe('Stage B offline contracts (Vitest CI)', () => {
  it('accepts schema-equivalent valid handoff',()=>{const {m,trust}=prepared();expect(validateManifest(m)).toBe(true);expect(assertApproval(m,trust)).toBe(true);});
  it('rejects untrusted approvals and mutated digest',()=>{const {m,trust}=prepared();expect(()=>assertApproval(m,{})).toThrow();m.objective+='changed';expect(()=>assertApproval(m,trust)).toThrow();});
  it('rejects protected and traversal paths',()=>{const {m}=prepared();expect(()=>assertPaths(['src/game/foo.ts'],m)).toThrow();expect(()=>assertPaths(['tools/ai-handoff/../../src/foo.ts'],m)).toThrow();});
  it('rejects duplicate or unauthorized events',()=>{const seen=new Set();expect(eventRouter({type:'manual_fixture',id:'evt'},'scope_approved',seen)).toBe('queued');expect(()=>eventRouter({type:'manual_fixture',id:'evt'},'scope_approved',seen)).toThrow();});
  it('requires real owner release decision',()=>{expect(()=>transition('review_ready','release_authorized')).toThrow();});
  it('stops at correction limit',()=>{const {m}=prepared();const state=evaluateCycle({manifest:m,changedPaths:['docs/automation/test.md'],cycles:3,checks:[],findings:[],elapsedMinutes:1,spendUsd:0});expect(state).toBe('failed_budget_or_checks');});
  it('holds visual approval for owner',()=>{const {m}=prepared();m.acceptance.owner_visual_required=true;const state=evaluateCycle({manifest:m,changedPaths:['docs/automation/test.md'],cycles:1,checks:[{name:'fixture_tests',pass:true},{name:'path_diff',pass:true}],findings:[],elapsedMinutes:1,spendUsd:0,reviewerAvailable:true});expect(state).toBe('needs_owner_decision');});
});
