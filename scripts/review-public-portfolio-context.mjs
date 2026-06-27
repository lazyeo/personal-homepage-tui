#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = process.argv[2] || process.env.PORTFOLIO_CONTEXT_SOURCE;
if (!source) {
  console.error('Missing context source. Pass a path or set PORTFOLIO_CONTEXT_SOURCE.');
  process.exit(1);
}
const sourcePath = resolve(source);
const text = readFileSync(sourcePath, 'utf8');

const checks = [
  { name: 'api key pattern', pattern: /AIza[0-9A-Za-z_-]{10,}|sk-[0-9A-Za-z_-]{10,}|Bearer\s+[^\s]+/i },
  { name: 'private memory path', pattern: /\.openclaw|MEMORY\.md|memory\/\d{4}-\d{2}-\d{2}|Discord message|diary/i },
  { name: 'placeholder personal interests', pattern: /\(Add your hobbies, interests, or other personal details here\)/i },
  { name: 'raw internal wording', pattern: /system prompt|hidden context|internal rules/i },
];

let failed = false;
for (const check of checks) {
  const match = text.match(check.pattern);
  if (match) {
    failed = true;
    console.error(`FAILED: ${check.name}: ${match[0].slice(0, 120)}`);
  } else {
    console.log(`OK: ${check.name}`);
  }
}

const chars = text.length;
const lines = text.split('\n').length;
const headings = text.split('\n').filter((line) => /^#{1,3}\s+/.test(line));
console.log(JSON.stringify({ sourcePath, chars, lines, headingCount: headings.length }, null, 2));

if (failed) process.exit(1);
