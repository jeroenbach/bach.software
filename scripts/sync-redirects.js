#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

async function syncRedirectsToStaticWebApp() {
  // Import the route rules
  const { routeRules } = await import('../route-rules.js');

  // Extract redirects from routeRules
  const redirects = [];

  for (const [route, rule] of Object.entries(routeRules)) {
    if (rule.redirect) {
      redirects.push({
        route,
        redirect: rule.redirect.to,
        statusCode: rule.redirect.statusCode,
      });
    }
  }

  if (redirects.length === 0) {
    console.log('No redirects to sync');
    return;
  }

  // Read and update static web app config
  const staticWebAppConfigPath = join(rootDir, 'staticwebapp.config.json');
  const currentConfig = JSON.parse(readFileSync(staticWebAppConfigPath, 'utf-8'));

  // Update routes
  currentConfig.routes = redirects;

  // Write updated config
  writeFileSync(staticWebAppConfigPath, `${JSON.stringify(currentConfig, null, 2)}\n`);

  console.log(`✓ Synced ${redirects.length} redirect(s) to staticwebapp.config.json`);
  redirects.forEach((redirect) => {
    console.log(`  ${redirect.route} → ${redirect.redirect} (${redirect.statusCode})`);
  });
}

// Run the sync
syncRedirectsToStaticWebApp().catch((error) => {
  console.error('Error syncing redirects:', error.message);
  process.exit(1);
});
