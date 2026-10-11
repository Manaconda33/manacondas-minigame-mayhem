// Automatically exercised by the existing Vitest CI AFTER separately authorized installation.
// No live runner, API calls, secret lookup or GitHub mutation is performed here.
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

describe('Stage C preparation remains offline and fail-closed', () => {
  it('passes the native 25-case offline safety matrix', () => {
    const output = execFileSync(process.execPath, ['--test', resolve(process.cwd(), 'tools/ai-handoff/stage-c-guard.node-check.mjs')], {encoding:'utf8',timeout:10000});
    expect(output).toMatch(/# tests 25/);
    expect(output).toMatch(/# pass 25/);
    expect(output).toMatch(/# fail 0/);
  });
  it('proves the deliberately seeded fixture currently fails', () => {
    const result=spawnSync(process.execPath,[resolve(process.cwd(),'tools/ai-handoff/stage-c-fixture-check.mjs')],{encoding:'utf8',timeout:5000});
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/fixture check failed at input 6/);
  });
  it('proves launch guard refuses execution before activation', () => {
    const result=spawnSync(process.execPath,[resolve(process.cwd(),'tools/ai-handoff/stage-c-guard.mjs'),'preflight'],{encoding:'utf8',timeout:5000});
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/manifest prepared but not activated/);
  });
});
