#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'dist');
const templates = fs.readdirSync(path.join(root, 'templates')).filter((name) => name.endsWith('.json')).sort();

for (const template of templates) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/render.mjs'), path.join(root, 'templates', template), output], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
