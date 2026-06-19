#!/usr/bin/env node
import { copyFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'config.json.example');
const target = path.join(root, 'config.json.template');

// The template should stay human-friendly, so we copy the maintained example
// file instead of trying to auto-generate JSON from TypeScript types.
copyFileSync(source, target);

console.log(`Generated ${path.relative(root, target)} from ${path.relative(root, source)}.`);
