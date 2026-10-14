import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ZERO_MODE = '000000';
const REGULAR_MODE = '100644';
const SAFE_STATUSES = new Set(['added', 'modified', 'removed', 'renamed']);

function isSafePath(path) {
  if (typeof path !== 'string' || path.length === 0) return false;
  if (path.includes('\\') || path.includes('\0') || path.startsWith('/') || path.includes('%'))
    return false;

  const parts = path.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..')) return false;
  if (parts.some((part) => /^(generated|evidence)$/i.test(part))) return false;

  if (path === 'README.md') return true;
  const inPlanningDirectory =
    path.startsWith('docs/design/') || path.startsWith('docs/superpowers/plans/');
  if (!inPlanningDirectory || !path.endsWith('.md')) return false;

  const name = parts.at(-1).toLowerCase();
  return !(
    name.endsWith('.generated.md') ||
    name.endsWith('.gen.md') ||
    name.endsWith('.lock.md') ||
    name.startsWith('generated-')
  );
}

function validModes(record) {
  const { status, oldMode, newMode } = record;
  if (status === 'added') return oldMode === ZERO_MODE && newMode === REGULAR_MODE;
  if (status === 'removed') return oldMode === REGULAR_MODE && newMode === ZERO_MODE;
  return oldMode === REGULAR_MODE && newMode === REGULAR_MODE;
}

export function classifyChanges({ complete, records }) {
  if (complete !== true) return { docsOnly: false, reason: 'change list is incomplete' };
  if (!Array.isArray(records) || records.length === 0) {
    return { docsOnly: false, reason: 'change list is empty or malformed' };
  }

  for (const record of records) {
    if (!record || !SAFE_STATUSES.has(record.status)) {
      return { docsOnly: false, reason: 'unsupported change status' };
    }
    if (!validModes(record)) return { docsOnly: false, reason: 'file type or mode changed' };

    const paths = record.status === 'renamed' ? [record.previousPath, record.path] : [record.path];
    if (paths.some((path) => !isSafePath(path))) {
      return { docsOnly: false, reason: 'changed path is outside the documentation allowlist' };
    }
  }

  return { docsOnly: true, reason: 'all changed paths are allowlisted planning Markdown' };
}

function decodePath(bytes) {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function parseRawDiff(rawDiff) {
  const buffer = Buffer.isBuffer(rawDiff) ? rawDiff : Buffer.from(rawDiff);
  const fields = [];
  let start = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    if (buffer[index] === 0) {
      fields.push(buffer.subarray(start, index));
      start = index + 1;
    }
  }
  if (start < buffer.length) throw new Error('raw diff is not NUL-terminated');

  const records = [];
  for (let index = 0; index < fields.length;) {
    const header = fields[index++].toString('ascii');
    const match = /^:(\d{6}) (\d{6}) [0-9a-f]+ [0-9a-f]+ ([A-Z]\d*)$/.exec(header);
    if (!match) throw new Error('unsupported raw diff record');

    const [, oldMode, newMode, rawStatus] = match;
    const code = rawStatus[0];
    const pathCount = code === 'R' || code === 'C' ? 2 : 1;
    if (index + pathCount > fields.length) throw new Error('truncated raw diff path record');

    const firstPath = decodePath(fields[index++]);
    const secondPath = pathCount === 2 ? decodePath(fields[index++]) : undefined;
    const status =
      {
        A: 'added',
        M: 'modified',
        D: 'removed',
        R: 'renamed',
      }[code] ?? rawStatus;

    records.push({
      status,
      path: secondPath ?? firstPath,
      previousPath: code === 'R' ? firstPath : undefined,
      oldMode,
      newMode,
    });
  }
  return records;
}

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, ...options });
}

function ensureCommit(sha, { prNumber, isPrHead = false } = {}) {
  if (!/^[0-9a-f]{40}$/i.test(sha ?? '')) throw new Error('invalid commit SHA');
  try {
    git(['cat-file', '-e', `${sha}^{tree}`], { stdio: 'ignore' });
  } catch {
    if (isPrHead && /^\d+$/.test(prNumber ?? '')) {
      try {
        git(
          [
            'fetch',
            '--no-tags',
            '--depth=1',
            'origin',
            `+refs/pull/${prNumber}/head:refs/remotes/origin/ci-pr-${prNumber}-${sha}`,
          ],
          { stdio: 'ignore' },
        );
      } catch {
        // The direct SHA fetch below is a second fail-closed way to obtain a same-repository head.
      }
    }
    try {
      git(['cat-file', '-e', `${sha}^{tree}`], { stdio: 'ignore' });
      return;
    } catch {
      git(['fetch', '--no-tags', '--depth=1', 'origin', sha], { stdio: 'ignore' });
    }
    git(['cat-file', '-e', `${sha}^{tree}`], { stdio: 'ignore' });
  }
}

export function classifyGitRange({ baseSha, headSha, prNumber }) {
  try {
    ensureCommit(baseSha);
    ensureCommit(headSha, { prNumber, isPrHead: true });
    const raw = git(['diff', '--raw', '--no-abbrev', '-z', '--find-renames=50%', baseSha, headSha]);
    const records = parseRawDiff(raw);
    return { ...classifyChanges({ complete: true, records }), records };
  } catch (error) {
    return {
      docsOnly: false,
      reason: `could not verify exact change set: ${error.message}`,
      records: [],
    };
  }
}

function writeGitHubOutput(result) {
  if (!process.env.GITHUB_OUTPUT) return;
  const safeReason = result.reason.replace(/[\r\n]/g, ' ');
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `docs_only=${result.docsOnly}\nreason=${safeReason}\nchanged_count=${result.records.length}\n`,
  );
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const result = classifyGitRange({
    baseSha: process.env.CI_BASE_SHA,
    headSha: process.env.CI_HEAD_SHA,
    prNumber: process.env.CI_PR_NUMBER,
  });
  writeGitHubOutput(result);
  console.log(
    `Documentation-only classification: ${result.docsOnly ? 'true' : 'false'} (${result.reason}; ${result.records.length} file records)`,
  );
}
