#!/bin/bash
# Validate the emitted static site independently of source data or a server.
set -euo pipefail
node --input-type=module <<'NODE'
import { readdirSync, readFileSync, statSync } from 'node:fs';
function requireFile(file) {
  let stat;
  try { stat = statSync(file); } catch { throw new Error(`Missing build artifact: ${file}`); }
  if (!stat.isFile() || !stat.size) throw new Error(`Missing or empty build artifact: ${file}`);
}
function json(file) { requireFile(file); return JSON.parse(readFileSync(file, 'utf8')); }
function ids(value, field) {
  if (!Array.isArray(value) || !value.length || value.some(id => typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) || new Set(value).size !== value.length) {
    throw new Error(`Invalid build manifest ${field}: expected unique route identifiers`);
  }
}
try {
  const manifest = json('dist/build-manifest.json');
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || manifest.version !== 2) throw new Error('Invalid build manifest version');
  if (typeof manifest.commit !== 'string' || !/^[a-f0-9]{40}$/i.test(manifest.commit)) throw new Error('Invalid build manifest commit');
  if (typeof manifest.base !== 'string' || !/^\/(?:[a-zA-Z0-9_-]+\/?)*$/.test(manifest.base)) throw new Error('Invalid build manifest base');
  ids(manifest.idioms, 'idioms'); ids(manifest.languages, 'languages');
  if (!Number.isInteger(manifest.implementations) || manifest.implementations < manifest.idioms.length) throw new Error('Invalid build manifest implementations');
  for (const file of ['index.html', 'languages/index.html', 'favorites/index.html', 'idioms/index.html', '404.html']) requireFile(`dist/${file}`);
  for (const id of manifest.idioms) requireFile(`dist/idiom/${id}/index.html`);
  for (const id of manifest.languages) requireFile(`dist/language/${id}/index.html`);
  const assets = readdirSync('dist/_astro');
  for (const extension of ['.js', '.css']) {
    const files = assets.filter(name => name.endsWith(extension));
    if (!files.length) throw new Error(`No ${extension} assets emitted`);
    files.forEach(name => requireFile(`dist/_astro/${name}`));
  }
  const search = json('dist/search-index.json');
  if (!Array.isArray(search) || search.length !== manifest.idioms.length) throw new Error('Search index must match manifest idiom count');
  const searchIds = new Set(); let implementationCount = 0;
  for (const entry of search) {
    if (!entry || typeof entry !== 'object' || !manifest.idioms.includes(entry.id) || searchIds.has(entry.id)) throw new Error('Search index contains an unknown or duplicate idiom');
    searchIds.add(entry.id);
    for (const field of ['title', 'description', 'category', 'tags', 'languages', 'code', 'explanation']) {
      if (!Array.isArray(entry.fields?.[field]) || entry.fields[field].some(value => typeof value !== 'string')) throw new Error(`Invalid search index fields.${field} for ${entry.id}`);
    }
    if (!entry.fields.code.length || entry.fields.code.some(code => !code.trim())) throw new Error(`Empty search index code for ${entry.id}`);
    implementationCount += entry.fields.code.length;
  }
  if (implementationCount !== manifest.implementations) throw new Error('Search index implementation count differs from manifest');
  console.log(`Build artifacts verified: ${manifest.idioms.length} idiom routes, ${manifest.languages.length} language routes, ${implementationCount} implementations, static HTML, JS, CSS and field search index.`);
} catch (error) {
  console.error(`Build verification failed: ${error.message}`);
  process.exit(1);
}
NODE
