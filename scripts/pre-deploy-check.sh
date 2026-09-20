#!/bin/bash
# One production validation pass. Stop on failure; keep diagnostic output visible.
set -euo pipefail

node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const { engines } = JSON.parse(readFileSync('package.json', 'utf8'));
const match = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(engines.node);
if (!match) throw new Error(`Unsupported Node range in pre-deploy check: ${engines.node}`);
const minimum = match.slice(1).map(Number);
const current = process.versions.node.split('.').map(Number);
const valid = current[0] === minimum[0] &&
  (current[1] > minimum[1] || (current[1] === minimum[1] && current[2] >= minimum[2]));
if (!valid) {
  console.error(`Node ${engines.node} required; found ${process.versions.node}. Run nvm use.`);
  process.exit(1);
}
NODE

VITE_ENV=production npm run validate
npm run verify-build
