// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../..');
const playwrightDir = join(root, 'src/app/tests/playwright');
const pinnedImage = 'mcr.microsoft.com/playwright:v1.60.0-jammy';

// A plain string holding a placeholder would trip no-template-curly-in-string
const placeholder = (name: string) => `\${${name}}`;

const readText = (path: string) => readFileSync(join(root, path), 'utf8');
const readJson = (path: string) => JSON.parse(readText(path));

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

const regConfig = readJson('regconfig.json');
const publisher = regConfig.plugins['reg-publish-s3-plugin'];
const notifier = regConfig.plugins['reg-notify-github-plugin'];
const workflow = readText('.github/workflows/20-build-deploy-playwright.yml');
const packageJson = readJson('package.json');
const gitignoreLines = readText('.gitignore').split('\n').map(line => line.trim());

describe('regconfig.json', () => {
  it('should use the git hash key generator, the S3 publisher and the GitHub notifier', () => {
    expect(Object.keys(regConfig.plugins).sort()).toEqual([
      'reg-keygen-git-hash-plugin',
      'reg-notify-github-plugin',
      'reg-publish-s3-plugin',
    ]);
  });

  it('should compare without slack and ignore anti-aliasing noise', () => {
    expect(regConfig.core.thresholdRate).toBe(0);
    expect(regConfig.core.enableAntialias).toBe(true);
  });

  it('should publish to the R2 bucket through the SDK v3 option names', () => {
    expect(publisher.bucketName).toBe('bach-software-visual-regression');
    expect(publisher.sdkOptions).toEqual({
      endpoint: `https://${placeholder('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      region: 'auto',
    });
  });

  it('should not set the option names of the old SDK major', () => {
    expect(publisher.sdkOptions).not.toHaveProperty('s3ForcePathStyle');
    expect(publisher.sdkOptions).not.toHaveProperty('signatureVersion');
  });

  it('should not ask R2 for object ACLs, which it does not support', () => {
    expect(publisher.enableACL).toBe(false);
  });

  it('should leave the credentials to the environment of the SDK default chain', () => {
    expect(publisher.sdkOptions).not.toHaveProperty('credentials');
    expect(publisher).not.toHaveProperty('accessKeyId');
    expect(publisher).not.toHaveProperty('secretAccessKey');
    expect(JSON.stringify(regConfig)).not.toMatch(/AWS_(ACCESS|SECRET)/);
  });

  it('should set the custom domain to the bare public r2.dev host, used only for the report link', () => {
    expect(publisher.customDomain).toBe('pub-f40905f3c59f4f2bbc195e223d7f0de2.r2.dev');
    expect(publisher.customDomain).not.toContain('://');
    expect(publisher.customDomain).not.toContain('/');
    expect(publisher.sdkOptions.endpoint).toBe(`https://${placeholder('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`);
  });

  it('should read the notifier client id from the environment', () => {
    expect(notifier.clientId).toBe('$REG_NOTIFY_CLIENT_ID');
  });

  it('should contain no secret-looking literal', () => {
    const literals = [...JSON.stringify(regConfig).matchAll(/"([^"]+)"/g)].map(match => match[1]!);

    expect(literals.filter(literal => /^[\w+/=-]{32,}$/.test(literal))).toEqual([]);
  });
});

describe('capture specs', () => {
  const specAndFixtureFiles = listFiles(playwrightDir).filter(file => file.endsWith('.ts'));
  const fixtures = readFileSync(join(playwrightDir, 'playwright-fixtures.ts'), 'utf8');

  it('should not compare screenshots, which is the job of reg-suit', () => {
    const offenders = specAndFixtureFiles.filter((file) => {
      const text = readFileSync(file, 'utf8');
      return text.includes('toHaveScreenshot') || text.includes('snapshotSuffix');
    });

    expect(offenders).toEqual([]);
  });

  it('should not wait with fixed timeouts', () => {
    const offenders = specAndFixtureFiles.filter(file => readFileSync(file, 'utf8').includes('waitForTimeout'));

    expect(offenders).toEqual([]);
  });

  it('should freeze animations and wait for fonts and images before capturing', () => {
    expect(fixtures).toContain('page.screenshot(');
    expect(fixtures).toContain(`animations: 'disabled'`);
    expect(fixtures).toContain('document.fonts.ready');
    expect(fixtures).toContain('image.decode()');
  });

  it('should write into the actual directory that reg-suit and git know about', () => {
    const fixtureDir = /actualScreenshotDir = '([^']+)'/.exec(fixtures)?.[1];

    expect(fixtureDir).toBe(regConfig.core.actualDir);
    expect(gitignoreLines).toContain(`/${regConfig.core.actualDir}/`);
  });

  it('should have the capture specs use the shared capture helper', () => {
    for (const spec of ['components.spec.ts', 'pages.spec.ts']) {
      expect(readFileSync(join(playwrightDir, spec), 'utf8')).toContain('captureScreenshot(');
    }
  });
});

describe('repository', () => {
  it('should not contain committed baseline images', () => {
    const images = listFiles(playwrightDir).filter(file => /\.(?:png|jpe?g)$/i.test(file));

    expect(images).toEqual([]);
  });

  it('should keep the sitemap text snapshot', () => {
    expect(existsSync(join(playwrightDir, 'sitemap.xml.spec.ts-snapshots/sitemap-chromium-linux.xml'))).toBe(true);
  });

  it('should ignore the reg-suit working directory', () => {
    expect(gitignoreLines).toContain(`/${regConfig.core.workingDir}/`);
  });

  it('should not keep the workflow that regenerated committed baselines', () => {
    expect(existsSync(join(root, '.github/workflows/30-update-snapshots.yml'))).toBe(false);
  });
});

describe('package.json', () => {
  const { scripts, devDependencies } = packageJson;

  it('should have no script that regenerates baselines', () => {
    expect(Object.keys(scripts).filter(name => /update-snapshots|:update$/.test(name))).toEqual([]);
    expect(JSON.stringify(scripts)).not.toContain('update-snapshots');
  });

  it('should capture inside the pinned container', () => {
    expect(scripts['ci:playwright:docker']).toContain(pinnedImage);
    expect(scripts['ci:playwright:docker']).toContain('pnpm ci:playwright');
  });

  it('should compare against the published baseline and run reg-suit in CI', () => {
    expect(scripts['vrt:compare']).toBe('reg-suit sync-expected && reg-suit compare');
    expect(scripts['vrt:ci']).toBe('reg-suit run');
  });

  it('should depend on reg-suit and the three plugins', () => {
    for (const name of ['reg-suit', 'reg-keygen-git-hash-plugin', 'reg-publish-s3-plugin', 'reg-notify-github-plugin']) {
      expect(devDependencies).toHaveProperty(name);
    }
  });
});

describe('visual regression workflow', () => {
  const playwrightJob = workflow.slice(workflow.indexOf('  playwright_job:'));

  it('should run on pull requests and pushes to main', () => {
    expect(workflow).toMatch(/on:\n {2}push:\n {4}branches:\n {6}- main\n {2}pull_request:/);
  });

  it('should fetch the full history for the merge-base lookup', () => {
    expect(playwrightJob).toContain('fetch-depth: 0');
  });

  it('should capture in the pinned container, named once', () => {
    expect(workflow.split(pinnedImage)).toHaveLength(2);
    expect(playwrightJob).toContain(`image: ${pinnedImage}`);
  });

  it('should run reg-suit after the capture', () => {
    const capture = playwrightJob.indexOf('run: pnpm ci:playwright');
    const report = playwrightJob.indexOf('run: pnpm vrt:ci');

    expect(capture).toBeGreaterThan(-1);
    expect(report).toBeGreaterThan(capture);
  });

  it('should supply the environment the config reads, from secrets only', () => {
    for (const name of ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'REG_NOTIFY_CLIENT_ID']) {
      expect(playwrightJob).toContain(`${name}: \${{ secrets.${name} }}`);
    }
  });

  it('should skip the report when the secrets are not available', () => {
    expect(playwrightJob).toContain(`if: \${{ steps.reg.outputs.enabled == 'true' }}`);
  });

  it('should let runs on main finish so every main commit gets published', () => {
    expect(workflow).toContain(`cancel-in-progress: \${{ github.ref != 'refs/heads/main' }}`);
  });
});

describe('claude hooks', () => {
  const settings = readJson('.claude/settings.json');
  const commands: string[] = Object.values<Array<{ hooks: Array<{ command: string }> }>>(settings.hooks)
    .flat()
    .flatMap(group => group.hooks.map(hook => hook.command));

  it('should register only hook scripts that exist', () => {
    const scripts = commands.map(command => /\.claude\/hooks\/[\w-]+\.sh/.exec(command)?.[0]);

    expect(scripts.every(Boolean)).toBe(true);
    for (const script of scripts) {
      expect(existsSync(join(root, script!)), script).toBe(true);
    }
  });

  it('should not keep the hook that guarded the committed baselines', () => {
    expect(existsSync(join(root, '.claude/hooks/block-snapshot-image-edits.sh'))).toBe(false);
    expect(commands.join('\n')).not.toContain('block-snapshot-image-edits');
  });
});
