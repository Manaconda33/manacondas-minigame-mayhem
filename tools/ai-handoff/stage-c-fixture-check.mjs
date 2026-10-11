import { readFileSync } from 'node:fs';
import { EXPECTED_FIXTURE, EXPECTED_TASK } from './stage-c-guard.mjs';

export const correctValue = (n) => n * (n + 1) / 2;

export function checkFixture(fixture) {
  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) throw new Error('invalid fixture object');
  if (fixture.task_id !== EXPECTED_TASK || !Array.isArray(fixture.cases) || fixture.cases.length !== 3) throw new Error('invalid fixture identity or cases');
  const inputs = [3, 6, 8];
  for (let i = 0; i < inputs.length; i++) {
    const sample = fixture.cases[i];
    if (!sample || Object.keys(sample).sort().join(',') !== 'expected,input' || sample.input !== inputs[i] || !Number.isInteger(sample.expected)) throw new Error(`invalid sample ${i}`);
    if (sample.expected !== correctValue(sample.input)) throw new Error(`fixture check failed at input ${sample.input}: actual ${sample.expected}, expected ${correctValue(sample.input)}`);
  }
  return true;
}

if (process.argv[1]?.endsWith('/stage-c-fixture-check.mjs')) {
  try {
    checkFixture(JSON.parse(readFileSync(EXPECTED_FIXTURE, 'utf8')));
    console.log('Stage C seeded fixture: PASS');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
