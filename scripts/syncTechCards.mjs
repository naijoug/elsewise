#!/usr/bin/env node
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced']);

function unique(values) {
  return Array.from(new Set(values));
}

async function directoryExists(directory) {
  try {
    return (await stat(directory)).isDirectory();
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw error;
  }
}

function assertNonEmptyString(value, field, featureId) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${featureId}: ${field} must be a non-empty string`);
  }
}

function assertStringArray(value, field, featureId) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new Error(`${featureId}: ${field} must be a non-empty string array`);
  }
}

function normalizeImplementation(languageId, implementation, featureId) {
  if (!implementation || typeof implementation !== 'object') {
    throw new Error(`${featureId}: implementation for ${languageId} must be an object`);
  }
  const status = implementation.status ?? 'draft';
  if (!['ready', 'draft', 'todo'].includes(status)) {
    throw new Error(`${featureId}: implementation for ${languageId} has invalid status ${status}`);
  }
  if (status !== 'ready') return null;

  assertNonEmptyString(implementation.code, `implementations.${languageId}.code`, featureId);
  assertNonEmptyString(implementation.explanation, `implementations.${languageId}.explanation`, featureId);

  const normalized = {
    languageId,
    code: implementation.code.trimEnd(),
    explanation: implementation.explanation,
  };

  for (const optionalField of ['output', 'errorOutput', 'designRationale', 'sourceCard']) {
    if (typeof implementation[optionalField] === 'string' && implementation[optionalField].trim() !== '') {
      normalized[optionalField] = implementation[optionalField];
    }
  }
  for (const optionalArrayField of ['pros', 'cons', 'references']) {
    if (Array.isArray(implementation[optionalArrayField]) && implementation[optionalArrayField].length > 0) {
      normalized[optionalArrayField] = implementation[optionalArrayField];
    }
  }

  return normalized;
}

function validateFeature(feature, knownLanguageIds) {
  const featureId = feature?.id ?? '<unknown>';
  if (!feature || typeof feature !== 'object') {
    throw new Error('feature file must contain an object');
  }
  assertNonEmptyString(feature.id, 'id', featureId);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(feature.id)) {
    throw new Error(`${feature.id}: id must be kebab-case`);
  }
  assertNonEmptyString(feature.title, 'title', feature.id);
  assertNonEmptyString(feature.description, 'description', feature.id);
  assertNonEmptyString(feature.category, 'category', feature.id);
  if (!DIFFICULTIES.has(feature.difficulty)) {
    throw new Error(`${feature.id}: difficulty must be beginner, intermediate, or advanced`);
  }
  assertStringArray(feature.paradigms, 'paradigms', feature.id);
  assertStringArray(feature.tags, 'tags', feature.id);
  if (!feature.implementations || typeof feature.implementations !== 'object') {
    throw new Error(`${feature.id}: implementations must be an object keyed by language id`);
  }

  const coverage = feature.coverage ?? {};
  const required = Array.isArray(coverage.required) ? coverage.required : [];
  const optional = Array.isArray(coverage.optional) ? coverage.optional : [];
  const notApplicable = coverage.notApplicable && typeof coverage.notApplicable === 'object' ? coverage.notApplicable : {};
  const languagesMentioned = unique([
    ...required,
    ...optional,
    ...Object.keys(notApplicable),
    ...Object.keys(feature.implementations),
  ]);

  for (const languageId of languagesMentioned) {
    if (knownLanguageIds && !knownLanguageIds.includes(languageId)) {
      throw new Error(`${feature.id}: unknown language id ${languageId}`);
    }
  }

  for (const languageId of required) {
    const implementation = feature.implementations[languageId];
    const status = implementation?.status ?? 'draft';
    if (!implementation && !notApplicable[languageId]) {
      throw new Error(`${feature.id} is missing required implementation for ${languageId}`);
    }
    if (implementation && status !== 'ready' && !notApplicable[languageId]) {
      throw new Error(`${feature.id} required implementation for ${languageId} is ${status}, expected ready`);
    }
  }
}

function compareImplementationsByLanguage(knownLanguageIds) {
  const languageOrder = new Map((knownLanguageIds ?? []).map((languageId, index) => [languageId, index]));
  return (left, right) => {
    const leftOrder = languageOrder.has(left.languageId)
      ? languageOrder.get(left.languageId)
      : Number.MAX_SAFE_INTEGER;
    const rightOrder = languageOrder.has(right.languageId)
      ? languageOrder.get(right.languageId)
      : Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.languageId.localeCompare(right.languageId);
  };
}

export async function loadKnownLanguageIds(projectDir) {
  const languagesPath = path.join(projectDir, 'src', 'data', 'languages.json');
  const languages = JSON.parse(await readFile(languagesPath, 'utf8'));
  return languages.map((language) => language.id);
}

export async function generateIdiomsFromHandbook({ handbookDir, knownLanguageIds }) {
  const featuresDir = path.join(handbookDir, 'data', 'features');
  const entries = await readdir(featuresDir, { withFileTypes: true });
  const featureFiles = entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const ids = new Set();
  const idioms = [];

  for (const fileName of featureFiles) {
    const raw = await readFile(path.join(featuresDir, fileName), 'utf8');
    const feature = parseYaml(raw);
    validateFeature(feature, knownLanguageIds);
    if (ids.has(feature.id)) {
      throw new Error(`duplicate feature id ${feature.id}`);
    }
    ids.add(feature.id);

    const implementations = Object.entries(feature.implementations)
      .map(([languageId, implementation]) => normalizeImplementation(languageId, implementation, feature.id))
      .filter(Boolean)
      .sort(compareImplementationsByLanguage(knownLanguageIds));

    if (implementations.length < 1) {
      throw new Error(`${feature.id}: at least one ready implementation is required for export`);
    }

    idioms.push({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      category: feature.category,
      difficulty: feature.difficulty,
      paradigms: feature.paradigms,
      tags: feature.tags,
      source: feature.source ?? 'tech-cards-handbook',
      implementations,
    });
  }

  return idioms.sort((a, b) => a.id.localeCompare(b.id));
}

async function loadExistingIdioms(outputPath) {
  try {
    const raw = await readFile(outputPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
}

function mergeWithLegacyIdioms(generatedIdioms, legacyIdioms) {
  const generatedById = new Map(generatedIdioms.map((idiom) => [idiom.id, idiom]));
  const merged = legacyIdioms.map((idiom) => generatedById.get(idiom.id) ?? idiom);
  const legacyIds = new Set(legacyIdioms.map((idiom) => idiom.id));
  for (const idiom of generatedIdioms) {
    if (!legacyIds.has(idiom.id)) merged.push(idiom);
  }
  return merged;
}

export async function syncTechCards({
  handbookDir,
  projectDir,
  knownLanguageIds,
  preserveLegacy = false,
  allowMissingHandbook = false,
}) {
  const outputPath = path.join(projectDir, 'src', 'data', 'idioms.json');
  const featuresDir = path.join(handbookDir, 'data', 'features');
  if (allowMissingHandbook && !(await directoryExists(featuresDir))) {
    const existingIdioms = await loadExistingIdioms(outputPath);
    if (existingIdioms.length === 0) {
      throw new Error(
        `Tech cards handbook not found at ${featuresDir}, and no existing Elsewise idioms were found at ${outputPath}`
      );
    }
    return existingIdioms;
  }

  const languageIds = knownLanguageIds ?? await loadKnownLanguageIds(projectDir);
  const generatedIdioms = await generateIdiomsFromHandbook({ handbookDir, knownLanguageIds: languageIds });
  const idioms = preserveLegacy
    ? mergeWithLegacyIdioms(generatedIdioms, await loadExistingIdioms(outputPath))
    : generatedIdioms;
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(idioms, null, 2)}\n`, 'utf8');
  return idioms;
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectDir = path.resolve(scriptDir, '..');
  const handbookDir = path.resolve(
    process.env.TECH_CARDS_HANDBOOK_DIR ?? path.join(projectDir, '..', 'books', 'tech-cards-handbook')
  );
  const featuresDir = path.join(handbookDir, 'data', 'features');
  const usedExistingIdioms = !(await directoryExists(featuresDir));
  const idioms = await syncTechCards({
    handbookDir,
    projectDir,
    preserveLegacy: true,
    allowMissingHandbook: true,
  });

  if (usedExistingIdioms) {
    console.warn(
      `Tech cards handbook not found at ${featuresDir}; keeping existing src/data/idioms.json (${idioms.length} idioms).`
    );
    return;
  }

  console.log(`Synced ${idioms.length} Elsewise idioms from ${path.relative(projectDir, handbookDir)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
