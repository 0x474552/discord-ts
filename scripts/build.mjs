#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const esbuildCli = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild');

/**
 * Edit this array if you want to change which files are emitted to /dist.
 * Each entry becomes one output file.
 *
 * Current output format:
 * - dist/index.js
 * - dist/utils/deploy-commands.js
 */
const ENTRY_POINTS = [
  {
    entry: path.join(root, 'src', 'index.ts'),
    outfile: path.join(distDir, 'index.js'),
  },
  {
    entry: path.join(root, 'src', 'utils', 'deploy-commands.ts'),
    outfile: path.join(distDir, 'utils', 'deploy-commands.js'),
  },
];

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(path.join(distDir, 'utils'), { recursive: true });

for (const item of ENTRY_POINTS) {
  execFileSync(
    process.execPath,
    [
      esbuildCli,
      item.entry,
      '--bundle',
      '--platform=node',
      '--target=node18',
      '--format=cjs',
      '--legal-comments=none',
      `--outfile=${item.outfile}`,
    ],
    { stdio: 'inherit' },
  );
}

console.log('Build complete.');
