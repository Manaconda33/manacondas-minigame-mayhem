// Offline Stage B fixture driver. No external side effects.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { manifestDigest, assertApproval, eventRouter, evaluateCycle, reviewPacket, noticeKey } from './contract.mjs';
const path = process.argv[2] ?? 'tests/ai-handoff/fixtures.json';
const cases = JSON.parse(readFileSync(resolve(path), 'utf8'));
const results = [];
for (const fixture of cases) {
  const m = structuredClone(fixture.manifest);
  m.manifest_sha256 = manifestDigest(m);
  m.approval.approved_digest = m.manifest_sha256;
  const trusted = {fixture_context:true, actor:'Manaconda33', authorized:true, event_id:m.approval.event_id, base_sha:m.base_sha, issue_number:m.issue_number, digest:m.manifest_sha256};
  try {
    assertApproval(m, trusted);
    const queued = eventRouter({id:`fixture-${fixture.name}`,type:'manual_fixture'}, 'scope_approved', new Set());
    const outcomes = fixture.cycles.map((cycle, index) => evaluateCycle({...cycle, cycles:index+1, manifest:m, changedPaths:fixture.changed_paths}));
    const terminal = outcomes.at(-1);
    const packet = terminal === 'correcting' ? null : reviewPacket({taskId:m.id,sha:fixture.candidate_sha,cycles:outcomes.length,state:terminal,checks:fixture.cycles.at(-1).checks,findings:fixture.cycles.at(-1).findings});
    results.push({fixture:fixture.name, queued, outcomes, notice_key:packet ? noticeKey(packet) : null, packet});
  } catch (error) { results.push({fixture:fixture.name, error:error.message}); }
}
console.log(JSON.stringify({simulation_only:true, external_actions:0, results},null,2));
