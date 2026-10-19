import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyAsset, editorHtmlAtRoot, assertBuildIdentity } from './build-neon-grid-editor.mjs';
test('rejects LFS pointers, wrong signatures and changed approved payloads', () => {
  const data = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 1]);
  const entry = { path: 'assets/a.png', sha256: createHash('sha256').update(data).digest('hex') };
  assert.doesNotThrow(() => verifyAsset(data, entry));
  assert.throws(
    () => verifyAsset(Buffer.from('version https://git-lfs.github.com/spec/v1'), entry),
    /LFS|pointer/i,
  );
  assert.throws(() => verifyAsset(Buffer.from('broken'), entry), /signature/i);
  assert.throws(() => verifyAsset(Buffer.concat([data, Buffer.from([5])]), entry), /hash/i);
});
test('makes portable root HTML work while keeping explicitly hosted URLs intact', () => {
  assert.equal(
    editorHtmlAtRoot('<script src="../../assets/a.js"></script>'),
    '<script src="./assets/a.js"></script>',
  );
  assert.equal(
    editorHtmlAtRoot('<link href="/approved/editor/assets/a.css">'),
    '<link href="/approved/editor/assets/a.css">',
  );
});
test('requires an exact build source rather than inventing a commit', () => {
  assert.throws(() => assertBuildIdentity('development'), /source|SHA/i);
  assert.doesNotThrow(() => assertBuildIdentity('a'.repeat(40)));
});
