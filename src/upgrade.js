import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { exists, listFiles } from './copy.js';
import {
  DEFAULT_LANGUAGE, DEFAULT_ORCHESTRATOR, LANGUAGES, TEMPLATE_ENTRIES,
  languageRoot, templateFilter,
} from './manifest.js';
import { migrateLegacyStatus, parseFrontmatter, setFrontmatterFields } from './workflow.js';
import { LEGACY_HASHES } from './legacy.js';

export const INSTALL_MANIFEST = '.specs/.create-spec-flow.json';
export const GENERATOR_VERSION = '0.5.0';

const digest = (text) => createHash('sha256').update(text).digest('hex');

async function hashFile(path) {
  return digest(await readFile(path));
}

export async function writeInstallManifest({ target, lang, orchestrator, files, hashes: suppliedHashes }) {
  const hashes = suppliedHashes ?? {};
  if (!suppliedHashes) for (const rel of files.sort()) {
    const path = join(target, rel);
    if (await exists(path)) hashes[rel] = await hashFile(path);
  }
  const manifest = {
    schemaVersion: 1,
    generatorVersion: GENERATOR_VERSION,
    workflowVersion: 2,
    lang,
    orchestrator,
    clients: ['claude', 'codex'],
    files: hashes,
  };
  const path = join(target, INSTALL_MANIFEST);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function desiredFiles(lang, orchestrator) {
  const root = languageRoot(lang);
  const filter = templateFilter(orchestrator);
  const out = [];
  for (const entry of TEMPLATE_ENTRIES) {
    for (const rel of (await listFiles(root, entry)).filter(filter)) out.push({ rel, source: join(root, rel) });
  }
  // Codex files are deterministic aliases of their Claude counterparts.
  out.push({ rel: 'AGENTS.md', source: join(root, 'CLAUDE.md'), transform: true });
  for (const item of [...out].filter(({ rel }) => rel.startsWith('.claude/skills/'))) {
    out.push({ rel: item.rel.replace('.claude/skills/', '.agents/skills/'), source: item.source, transform: true });
  }
  return out;
}

async function legacyMigrations(root, dryRun) {
  const migrated = [];
  for (const area of ['changes', 'archive']) {
    const directory = join(root, '.specs', area);
    if (!(await exists(directory))) continue;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const specPath = join(directory, entry.name, 'spec.md');
      if (!(await exists(specPath))) continue;
      const text = await readFile(specPath, 'utf8');
      const { attributes } = parseFrontmatter(text);
      if (!['todo', 'in-progress', 'done'].includes(attributes.status)) continue;
      const reviewPath = join(directory, entry.name, 'review.md');
      const approvedReview = await exists(reviewPath)
        ? parseFrontmatter(await readFile(reviewPath, 'utf8')).attributes.verdict === 'approved'
        : false;
      const fields = migrateLegacyStatus(attributes.status, { archived: area === 'archive', approvedReview });
      fields.workflow_version = 2;
      if (attributes.attempt === undefined) fields.attempt = 0;
      migrated.push({ change: entry.name, from: attributes.status, to: fields.status });
      if (!dryRun) await writeFile(specPath, setFrontmatterFields(text, fields));
    }
  }
  return migrated;
}

export async function upgrade({
  target = process.cwd(), dryRun = false, lang, orchestrator, fromVersion,
} = {}) {
  const root = resolve(target);
  const manifestPath = join(root, INSTALL_MANIFEST);
  let previous = null;
  if (await exists(manifestPath)) previous = JSON.parse(await readFile(manifestPath, 'utf8'));
  let chosenLang = lang ?? previous?.lang ?? DEFAULT_LANGUAGE;
  if (!lang && !previous) {
    let best = { lang: DEFAULT_LANGUAGE, matches: 0 };
    for (const candidateLang of Object.keys(LANGUAGES)) {
      let matches = 0;
      for (const [rel, hash] of Object.entries(LEGACY_HASHES['0.4.0'][candidateLang])) {
        if (await exists(join(root, rel)) && await hashFile(join(root, rel)) === hash) matches += 1;
      }
      if (matches > best.matches) best = { lang: candidateLang, matches };
    }
    if (best.matches >= 2) chosenLang = best.lang;
  }
  const chosenProfile = orchestrator ?? previous?.orchestrator ?? DEFAULT_ORCHESTRATOR;
  if (!LANGUAGES[chosenLang]) throw new Error(`Unknown language: ${chosenLang}`);

  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const conflictRoot = join(root, '.specs/.create-spec-flow/conflicts', runId);
  const added = [], updated = [], conflicts = [], nextHashes = {};
  const desired = await desiredFiles(chosenLang, chosenProfile);
  let legacy = fromVersion ? LEGACY_HASHES[fromVersion]?.[chosenLang] : null;
  if (fromVersion && !legacy) throw new Error(`Unsupported source version: ${fromVersion}`);
  if (!previous && !legacy) {
    const candidate = LEGACY_HASHES['0.4.0'][chosenLang];
    let matches = 0;
    for (const [rel, hash] of Object.entries(candidate)) {
      if (await exists(join(root, rel)) && await hashFile(join(root, rel)) === hash) matches += 1;
    }
    if (matches >= 2) legacy = candidate;
  }

  for (const item of desired) {
    const destination = join(root, item.rel);
    let next = await readFile(item.source, 'utf8');
    if (item.transform) next = next.replaceAll('.claude/skills/', '.agents/skills/');
    nextHashes[item.rel] = digest(next);
    if (!(await exists(destination))) {
      added.push(item.rel);
      if (!dryRun) {
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, next);
      }
      continue;
    }
    const currentHash = await hashFile(destination);
    const oldHash = previous?.files?.[item.rel] ?? legacy?.[item.rel];
    if (currentHash === digest(next)) continue;
    if (oldHash && currentHash === oldHash) {
      updated.push(item.rel);
      if (!dryRun) await writeFile(destination, next);
      continue;
    }
    conflicts.push(item.rel);
    if (!dryRun) {
      const candidate = join(conflictRoot, item.rel);
      await mkdir(dirname(candidate), { recursive: true });
      await writeFile(candidate, next);
    }
  }

  const migrated = await legacyMigrations(root, dryRun);
  if (!dryRun) {
    const managed = desired.map(({ rel }) => rel);
    await writeInstallManifest({ target: root, lang: chosenLang, orchestrator: chosenProfile, files: managed, hashes: nextHashes });
  }
  return { target: root, lang: chosenLang, orchestrator: chosenProfile, sourceVersion: previous?.generatorVersion ?? (legacy ? '0.4.0' : null), added, updated, conflicts, migrated, dryRun };
}
