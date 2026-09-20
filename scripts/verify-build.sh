#!/bin/bash
# Check emitted artifacts, independently of source files or a running server.
set -euo pipefail

node --input-type=module <<'NODE'
import { readdirSync, readFileSync, statSync } from 'node:fs';

function requireFile(file) {
  if (!statSync(file).isFile() || statSync(file).size === 0) {
    throw new Error(`Missing or empty build artifact: ${file}`);
  }
}

try {
  requireFile('dist/index.html');
  const assets = readdirSync('dist/assets');
  for (const extension of ['.js', '.css']) {
    const files = assets.filter((name) => name.endsWith(extension));
    if (files.length === 0) throw new Error(`No ${extension} assets emitted`);
    files.forEach((name) => requireFile(`dist/assets/${name}`));
  }
  for (const prefix of ['idioms', 'languages']) {
    const files = assets.filter((name) => name.startsWith(`${prefix}-`) && name.endsWith('.json'));
    if (files.length === 0) throw new Error(`No ${prefix} JSON asset emitted`);
    for (const name of files) {
      const data = JSON.parse(readFileSync(`dist/assets/${name}`, 'utf8'));
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`${name} must contain a non-empty JSON array`);
      }
    }
  }
  console.log('Build artifacts verified: HTML, JS, CSS, idioms and languages JSON.');
} catch (error) {
  console.error(`Build verification failed: ${error.message}`);
  process.exit(1);
}
NODE
