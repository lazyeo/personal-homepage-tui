#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_KEY = 'portfolio_context:latest';
const DEFAULT_META_KEY = 'portfolio_context:metadata';
const MAX_CONTEXT_CHARS = 50000;

function argValue(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function summarize(text) {
  const lines = text.split('\n').filter(Boolean);
  return {
    chars: text.length,
    lines: lines.length,
    headings: lines.filter((line) => /^#{1,3}\s+/.test(line)).slice(0, 30),
  };
}

const source = argValue('source') || process.env.PORTFOLIO_CONTEXT_SOURCE;
if (!source) fail('Missing context source. Pass --source <path> or set PORTFOLIO_CONTEXT_SOURCE.');
const sourcePath = resolve(source);
const key = argValue('key') || process.env.PORTFOLIO_CONTEXT_KEY || DEFAULT_KEY;
const metaKey = argValue('metadata-key') || process.env.PORTFOLIO_CONTEXT_METADATA_KEY || DEFAULT_META_KEY;
const namespaceId = argValue('namespace-id') || process.env.PORTFOLIO_CONTEXT_KV_NAMESPACE_ID;
const binding = argValue('binding') || process.env.PORTFOLIO_CONTEXT_KV_BINDING;
const remote = hasFlag('remote') || process.env.PORTFOLIO_CONTEXT_REMOTE === '1';
const dryRun = hasFlag('dry-run') || (!namespaceId && !binding);

const context = readFileSync(sourcePath, 'utf8').trim();
if (!context) fail(`Empty context file: ${sourcePath}`);
if (context.length > MAX_CONTEXT_CHARS) fail(`Context too large: ${context.length} chars > ${MAX_CONTEXT_CHARS}`);

const metadata = {
  source: basename(sourcePath),
  key,
  updatedAt: new Date().toISOString(),
  ...summarize(context),
};

console.log(JSON.stringify({ dryRun, namespaceId: Boolean(namespaceId), binding, key, metadata }, null, 2));

if (dryRun) {
  console.log('Dry-run only. Pass --namespace-id <id> or --binding <name> to publish.');
  process.exit(0);
}

const tempDir = mkdtempSync(join(tmpdir(), 'portfolio-context-'));
const contextPath = join(tempDir, 'context.md');
const metadataPath = join(tempDir, 'metadata.json');
writeFileSync(contextPath, context);
writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

function runWrangler(args) {
  const result = spawnSync('wrangler', args, { stdio: 'inherit' });
  if (result.error) fail(`Failed to run wrangler: ${result.error.message}`);
  if (result.status !== 0) fail(`wrangler exited with status ${result.status}`);
}

function kvArgs(k, path) {
  const args = ['kv', 'key', 'put', k, '--path', path];
  if (namespaceId) args.push('--namespace-id', namespaceId);
  else args.push('--binding', binding);
  if (remote) args.push('--remote');
  return args;
}

runWrangler(kvArgs(key, contextPath));
runWrangler(kvArgs(metaKey, metadataPath));
console.log(`Published ${key} and ${metaKey}.`);
