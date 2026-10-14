import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function included(path) {
  return (
    path === 'package.json' ||
    path === 'package-lock.json' ||
    path === 'docs/PRD.md' ||
    path === 'docs/TESTING.md' ||
    path === 'docs/DECISIONS.md' ||
    path.startsWith('.github/') ||
    path === '.npmrc' ||
    path === '.nvmrc' ||
    path === '.node-version' ||
    path.startsWith('tests/') ||
    path.startsWith('tools/') ||
    path.startsWith('scripts/') ||
    /^tsconfig(?:\.[^/]+)?\.json$/.test(path) ||
    /^vite\.config\.[^/]+$/.test(path) ||
    /^vitest\.config\.[^/]+$/.test(path) ||
    /^eslint\.config\.[^/]+$/.test(path)
  );
}

export function fingerprintValidationInputs(root = process.cwd()) {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'buffer' });
  const paths = tracked.toString('utf8').split('\0').filter(Boolean).filter(included).sort();
  if (!paths.includes('package-lock.json') || !paths.includes('.github/workflows/ci.yml')) {
    throw new Error('required validation inputs are missing from the tracked tree');
  }

  const hash = createHash('sha256');
  for (const path of paths) {
    const content = readFileSync(`${root}/${path}`);
    const mode = statSync(`${root}/${path}`).mode & 0o777;
    hash.update(path).update('\0').update(String(mode)).update('\0').update(content).update('\0');
  }

  const workflowBlob = execFileSync('git', ['rev-parse', `HEAD:.github/workflows/ci.yml`], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  const lockSha256 = createHash('sha256')
    .update(readFileSync(`${root}/package-lock.json`))
    .digest('hex');
  return {
    contractSha256: hash.digest('hex'),
    workflowBlob,
    lockSha256,
    inputCount: paths.length,
  };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const result = fingerprintValidationInputs(process.cwd());
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `contract_sha256=${result.contractSha256}\nworkflow_blob=${result.workflowBlob}\nlock_sha256=${result.lockSha256}\ninput_count=${result.inputCount}\n`,
    );
  }
  console.log(
    `Validation input fingerprint ${result.contractSha256} (${result.inputCount} tracked inputs)`,
  );
}
