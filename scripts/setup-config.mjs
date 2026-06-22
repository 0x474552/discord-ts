#!/usr/bin/env node
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'config.json.example');
const target = path.join(root, 'config.json');
const shouldOverwrite = process.argv.includes('--force');

if (existsSync(target) && !shouldOverwrite) {
  console.log('config.json already exists. Re-run with --force to overwrite it.');
  process.exit(0);
}

copyFileSync(source, target);
console.log(`Created ${path.relative(root, target)} from ${path.relative(root, source)}.`);
