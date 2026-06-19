#!/usr/bin/env node

/**
 * generate-config-template.mjs
 *
 * Reads the BotConfig interface from src/types/index.ts and generates
 * a config.json.template file with placeholder/default values based on
 * the parsed type information and JSDoc comments.
 *
 * Usage: node scripts/generate-config-template.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TYPES_PATH = resolve(ROOT, 'src', 'types', 'index.ts');
const OUTPUT_PATH = resolve(ROOT, 'config.json.template');

const TYPE_DEFAULTS = {
  string: '',
  number: 0,
  boolean: false,
  any: null,
};

/**
 * Determine default value for a given TypeScript type expression.
 */
function generateDefault(typeExpr, depth = 0) {
  if (depth > 10) return '…';

  // Normalize whitespace: collapse newlines/tabs to single spaces
  let t = typeExpr.replace(/\s+/g, ' ').trim();

  // Literal string: 'foo' → "foo"
  const litMatch = t.match(/^'([^']*)'/);
  if (litMatch) return litMatch[1];

  // Array<T> or T[] (handle possibility of | undefined trailing)
  const arrayMatch = t.match(
    /^(?:Array<(.+?)>|(.+?)\[\])(?:\s*\|\s*(?:undefined|null))*$/,
  );
  if (arrayMatch) {
    const inner = (arrayMatch[1] || arrayMatch[2]).trim();
    return [generateDefault(inner, depth + 1)];
  }

  // Record<K, V>
  const recordMatch = t.match(/^Record<(.+?),\s*(.+?)>(?:\s*\|\s*(?:undefined|null))*$/);
  if (recordMatch) {
    const valDefault = generateDefault(recordMatch[2], depth + 1);
    return { '<key>': valDefault };
  }

  // Union with '|' – pick first non-undefined/null member
  if (t.includes('|') && !t.startsWith('{')) {
    const parts = t.split('|').map((s) => s.trim());
    const nonUndef = parts.find((p) => p !== 'undefined' && p !== 'null');
    if (nonUndef) return generateDefault(nonUndef, depth + 1);
  }

  // Inline object literal: { … }
  if (t.startsWith('{')) {
    return parseInlineObject(t, depth);
  }

  // Primitives
  if (t in TYPE_DEFAULTS) return TYPE_DEFAULTS[t];

  // Fallback string
  return '';
}

/**
 * Parse an inline object literal like:
 *   { status: 'online' | 'idle'; activities: Array<{…}> }
 * into a plain JS object.
 */
function parseInlineObject(str, depth) {
  const obj = {};
  // Normalize whitespace first
  let normalized = str.replace(/\s+/g, ' ').trim();
  if (normalized.startsWith('{') && normalized.endsWith('}')) {
    normalized = normalized.slice(1, -1).trim();
  }

  const props = splitTopLevel(normalized, ';');
  for (const prop of props) {
    const trimmed = prop.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim().replace(/\?$/, '');
    const val = trimmed.slice(colonIdx + 1).trim();
    obj[key] = generateDefault(val, depth + 1);
  }
  return obj;
}

/**
 * Split a string by delimiter, only at depth 0
 * (not inside braces/brackets or angle brackets).
 */
function splitTopLevel(str, delim) {
  const parts = [];
  let braceDepth = 0;
  let angleDepth = 0;
  let current = '';
  for (const ch of str) {
    if (ch === '{' || ch === '[') braceDepth++;
    else if (ch === '}' || ch === ']') braceDepth--;
    else if (ch === '<') angleDepth = Math.max(0, angleDepth + 1);
    else if (ch === '>') angleDepth = Math.max(0, angleDepth - 1);
    if (ch === delim && braceDepth === 0 && angleDepth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/**
 * Extract the body of interface BotConfig from source code using
 * brace-depth tracking.
 */
function extractBotConfigBody(source) {
  const startMarker = 'export interface BotConfig {';
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error('BotConfig interface not found');

  // startMarker includes the opening '{', so we start at depth 1
  const bodyStart = startIdx + startMarker.length;
  let depth = 1;
  let body = '';

  for (let i = bodyStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
    body += ch;
  }

  return body;
}

/**
 * Strip leading JSDoc / multi-line comments from a declaration string.
 */
function stripLeadingComments(str) {
  return str.replace(/^\s*\/\*[\s\S]*?\*\/\s*/m, '').trim();
}

/**
 * Split the extracted body on top-level semicolons to obtain
 * each property declaration as a single string (multi-line safe).
 */
function parsePropertiesRobust(body) {
  const props = [];
  const decls = splitTopLevel(body, ';');

  for (const decl of decls) {
    const stripped = stripLeadingComments(decl);
    if (!stripped) continue;

    // Match: name?: type
    const match = stripped.match(/^(\w+)(\??)\s*:\s*(.+)$/s);
    if (match) {
      props.push({
        name: match[1],
        optional: !!match[2],
        type: match[3].trim(),
      });
    }
  }
  return props;
}

// ── Main ────────────────────────────────────────────────
try {
  const source = readFileSync(TYPES_PATH, 'utf-8');
  const body = extractBotConfigBody(source);
  const props = parsePropertiesRobust(body);

  const template = {};
  for (const prop of props) {
    template[prop.name] = generateDefault(prop.type);
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(template, null, 2) + '\n', 'utf-8');
  console.log(`   Generated ${OUTPUT_PATH}`);
  console.log(`   Based on BotConfig interface from ${TYPES_PATH}`);
  console.log(`   Properties: ${props.map((p) => p.name).join(', ')}`);
} catch (err) {
  console.error('❌ Error generating config.json.template:', err.message);
  process.exit(1);
}