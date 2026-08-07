#!/usr/bin/env node
/**
 * Verifies dist/_routes.json for Cloudflare Pages. Read-only: it never writes
 * to the file.
 *
 * Cloudflare Pages imposes two limits that Nitro's auto-generation does not
 * fully respect:
 *   1. At most 100 include/exclude rules combined. Nitro generates one exclude
 *      rule per output file and silently truncates the list at 100. Any
 *      prerendered page that falls off the list is SSR'd by the Worker on
 *      every request (~400-700ms) instead of served as a static asset (~50ms).
 *   2. At most 100 characters per rule. Nitro does not check this at all, and
 *      wrangler rejects the whole deployment when a rule (e.g. a long blog
 *      post slug) exceeds it.
 *
 * This script only inspects the generated dist/_routes.json and the prerendered
 * output; it does NOT modify anything. It fails the build (exit 1) when:
 *   - any exclude rule is longer than 100 characters, or
 *   - the total number of rules (include + exclude) exceeds 100, or
 *   - any prerendered HTML page route is not covered by an exclude rule.
 * It warns (without failing) when only _payload.json files are uncovered;
 * those are client-side navigation prefetches that still work via the Worker.
 *
 * When this fails: see "Static-vs-Worker routing on Cloudflare Pages" in
 * CLAUDE.md. Short version: widen the wildcard rules in nuxt.config.ts
 * (nitro.cloudflare.pages.routes.exclude), and shorten over-long post URLs by
 * adding a `slug` field to the post's YAML frontmatter (the durable fix).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const MAX_RULES = 100;
const MAX_RULE_LENGTH = 100;
const DIST = new URL('../dist', import.meta.url).pathname;
const ROUTES_FILE = join(DIST, '_routes.json');

const routesFile = JSON.parse(readFileSync(ROUTES_FILE, 'utf8'));
const excludeRules = routesFile.exclude ?? [];

// A rule either matches exactly or is a trailing-wildcard prefix ("/dir/*").
function isCoveredBy(route, rules) {
  return rules.some(rule =>
    rule.endsWith('*')
      ? route.startsWith(rule.slice(0, -1))
      : rule === route,
  );
}

// ── 1. Collect the prerendered routes that must be covered ───────────────────
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// Directories that never contain page routes and are excluded via wildcards.
const skip = ['_worker.js', '_nuxt', '_ipx', '_storybook', 'pagefind', '__nuxt_content', 'ico', 'portfolio'];

const files = walk(DIST)
  .map(path => path.slice(DIST.length))
  .filter(route => !skip.some(dir => route.startsWith(`/${dir}/`)));

const htmlRoutes = files
  .filter(route => route.endsWith('.html'))
  .map(route => route.replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/');
const payloadRoutes = files.filter(route => route.endsWith('_payload.json'));

// ── 2. Verify ────────────────────────────────────────────────────────────────
const uncoveredPages = htmlRoutes.filter(route => !isCoveredBy(route, excludeRules));
const uncoveredPayloads = payloadRoutes.filter(route => !isCoveredBy(route, excludeRules));
const overlongRules = excludeRules.filter(rule => rule.length > MAX_RULE_LENGTH);

const totalRules = (routesFile.include?.length ?? 0) + excludeRules.length;
console.log(`[verify-cf-routes] ${totalRules}/${MAX_RULES} rules used, ${htmlRoutes.length} page routes, ${payloadRoutes.length} payloads`);

if (uncoveredPayloads.length > 0) {
  console.warn(`[verify-cf-routes] WARN: ${uncoveredPayloads.length} _payload.json files fall through to the Worker (client-side navigation prefetches only, pages themselves are static):`);
  for (const route of uncoveredPayloads) console.warn(`  ${route}`);
}

if (uncoveredPages.length > 0 || overlongRules.length > 0 || totalRules > MAX_RULES) {
  if (uncoveredPages.length > 0) {
    console.error(`[verify-cf-routes] ERROR: ${uncoveredPages.length} prerendered pages are NOT covered by _routes.json and would be SSR'd by the Worker on every request:`);
    for (const route of uncoveredPages) console.error(`  ${route}`);
  }
  if (overlongRules.length > 0) {
    console.error(`[verify-cf-routes] ERROR: rules over ${MAX_RULE_LENGTH} characters (wrangler rejects the deployment):`);
    for (const rule of overlongRules) console.error(`  ${rule}`);
  }
  if (totalRules > MAX_RULES) {
    console.error(`[verify-cf-routes] ERROR: ${totalRules} rules exceed the ${MAX_RULES}-rule limit.`);
  }
  console.error('[verify-cf-routes] Add or widen wildcard rules in nuxt.config.ts (nitro.cloudflare.pages.routes.exclude) to free up rule slots.');
  console.error('[verify-cf-routes] Shorten over-long post URLs by adding a `slug` field to the post\'s YAML frontmatter.');
  console.error('[verify-cf-routes] See "Static-vs-Worker routing on Cloudflare Pages" in CLAUDE.md for all remediation options, including migrating to a Worker with static assets.');
  process.exit(1);
}

console.log('[verify-cf-routes] OK: all prerendered pages are served statically.');
