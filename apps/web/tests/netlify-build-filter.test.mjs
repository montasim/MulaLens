import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function writeFixture(root, path, value) {
  const destination = join(root, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, value);
}

function runIgnoreCommand(command, cwd, cachedCommit, commit) {
  return spawnSync('bash', ['-c', command], {
    cwd,
    env: { ...process.env, CACHED_COMMIT_REF: cachedCommit, COMMIT_REF: commit },
  });
}

test('Netlify skips extension-only changes and builds web-related changes', () => {
  const config = readFileSync(join(webRoot, 'netlify.toml'), 'utf8');
  const ignoreCommand = config.match(/^\s*ignore\s*=\s*"([^"]+)"/m)?.[1];
  assert.ok(ignoreCommand, 'apps/web/netlify.toml must define build.ignore');

  const fixture = mkdtempSync(join(tmpdir(), 'netlify-build-filter-'));
  try {
    git(fixture, 'init', '--quiet');
    git(fixture, 'config', 'user.email', 'test@example.com');
    git(fixture, 'config', 'user.name', 'Netlify filter test');
    writeFixture(fixture, 'apps/web/index.ts', 'web v1\n');
    writeFixture(fixture, 'apps/extension/index.ts', 'extension v1\n');
    writeFixture(fixture, 'package.json', '{}\n');
    writeFixture(fixture, 'pnpm-lock.yaml', 'lockfileVersion: 9\n');
    writeFixture(fixture, 'pnpm-workspace.yaml', 'packages: []\n');
    git(fixture, 'add', '.');
    git(fixture, 'commit', '--quiet', '-m', 'initial');
    const initial = git(fixture, 'rev-parse', 'HEAD');

    writeFixture(fixture, 'apps/extension/index.ts', 'extension v2\n');
    git(fixture, 'add', '.');
    git(fixture, 'commit', '--quiet', '-m', 'extension only');
    const extensionOnly = git(fixture, 'rev-parse', 'HEAD');
    assert.equal(
      runIgnoreCommand(ignoreCommand, fixture, initial, extensionOnly).status,
      0,
      'an extension-only change should stop the Netlify build',
    );

    writeFixture(fixture, 'apps/web/index.ts', 'web v2\n');
    git(fixture, 'add', '.');
    git(fixture, 'commit', '--quiet', '-m', 'web change');
    const webChange = git(fixture, 'rev-parse', 'HEAD');
    assert.equal(
      runIgnoreCommand(ignoreCommand, fixture, extensionOnly, webChange).status,
      1,
      'a landing-page change should continue the Netlify build',
    );

    writeFixture(fixture, 'package.json', '{"private":true}\n');
    git(fixture, 'add', '.');
    git(fixture, 'commit', '--quiet', '-m', 'workspace change');
    const workspaceChange = git(fixture, 'rev-parse', 'HEAD');
    assert.equal(
      runIgnoreCommand(ignoreCommand, fixture, webChange, workspaceChange).status,
      1,
      'a shared workspace change should continue the Netlify build',
    );
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
