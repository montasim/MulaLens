import { cp, mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';

const appRoot = process.cwd();
const workspaceRoot = resolve(appRoot, '../..');
const output = join(workspaceRoot, 'dist', 'extension');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all([
  build({
    entryPoints: [join(appRoot, 'extension/content.ts')],
    outfile: join(output, 'content.js'),
    bundle: true,
    format: 'iife',
    target: 'chrome120',
    minify: true,
  }),
  build({
    entryPoints: [join(appRoot, 'extension/background.ts')],
    outfile: join(output, 'background.js'),
    bundle: true,
    format: 'esm',
    target: 'chrome120',
    minify: true,
  }),
  build({
    entryPoints: [join(appRoot, 'extension/popup.ts')],
    outfile: join(output, 'popup.js'),
    bundle: true,
    format: 'iife',
    target: 'chrome120',
    minify: true,
  }),
]);

await Promise.all(
  [
    'manifest.json',
    'styles.css',
    'popup.html',
    'popup.css',
    'media/logo-16.png',
    'media/logo-32.png',
    'media/logo-48.png',
    'media/logo-128.png',
  ].map((name) =>
    cp(join(appRoot, 'extension', name), join(output, name)),
  ),
);

console.log('Built dist/extension.');
