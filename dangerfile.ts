import { danger, markdown, schedule, warn } from 'danger';

const modified = danger.git.modified_files;
const created = danger.git.created_files;
const allFiles = [...modified, ...created];

function isFrontendTestFile(file: string): boolean {
  return /\.(?:nuxt\.)?(?:test|spec)\.ts$/.test(file);
}

// Only code files count as functional changes: content markdown, locale JSON, images
// and styles don't need an accompanying test change.
function isFrontendSourceFile(file: string): boolean {
  return file.startsWith('src/app/')
    && /\.(?:ts|vue|js|mjs)$/.test(file)
    && !file.startsWith('src/app/services/backend/')
    && !file.startsWith('src/app/content/')
    && !file.startsWith('src/app/locales/')
    && !isFrontendTestFile(file)
    && !file.endsWith('.stories.ts')
    && !file.includes('/tests/playwright/');
}

// FE-06: a frontend functional change should carry a matching test change.
const frontendSourceChanged = allFiles.some(isFrontendSourceFile);
const frontendTestChanged = allFiles.some(isFrontendTestFile);
if (frontendSourceChanged && !frontendTestChanged) {
  warn('FE-06: frontend files changed without an accompanying unit/component test change. If this is a pure refactor, styling, or content change, this warning can be ignored.');
}

// FE-06: HTML snapshot tests are forbidden; a Storybook story + Playwright visual entry replaces them.
// Danger loads this file with require(), so async work goes through schedule() instead of a top-level await.
schedule(async () => {
  for (const file of allFiles.filter(isFrontendTestFile)) {
    const diff = await danger.git.diffForFile(file);
    if (diff && /toMatch(?:Inline|File)?Snapshot\s*\(/.test(diff.added)) {
      warn(`FE-06: \`${file}\` adds a snapshot assertion (\`toMatchSnapshot\`/\`toMatchInlineSnapshot\`/\`toMatchFileSnapshot\`). HTML snapshot tests are forbidden here — add a Storybook story and a Playwright visual-regression entry in \`components.spec.ts\` instead. (Snapshots of non-markup data are the rare acceptable exception.)`);
    }
  }
});

// FE-13: a new shared component should ship with a matching Storybook story.
const newComponents = created.filter(file =>
  /^src\/app\/components\/.*\.vue$/.test(file) && !file.startsWith('src/app/components/content/'),
);
for (const component of newComponents) {
  const storyFile = component.replace(/\.vue$/, '.stories.ts');
  if (!allFiles.includes(storyFile)) {
    warn(`FE-13: \`${component}\` is a new component with no matching Storybook story (\`${storyFile}\`).`);
  }
}

// CS-02 / API-03: a backend functional change should carry a matching test change.
const backendSourceChanged = allFiles.some(file =>
  file.startsWith('src/api/') && file.endsWith('.cs') && !file.includes('/Bach.Software.Tests/'),
);
const backendTestChanged = allFiles.some(file =>
  file.startsWith('src/api/Bach.Software.Tests/') && file.endsWith('.cs'),
);
if (backendSourceChanged && !backendTestChanged) {
  warn('CS-02: backend C# files changed without an accompanying test change in Bach.Software.Tests.');
}

// API-07: outbound HTTP goes through IHttpClientFactory-managed (typed) clients; constructing
// HttpClient directly defeats handler pooling/rotation. Tests are exempt (stub handlers are the
// isolation seam). The companion ServiceRegistrationTests guards the singleton-capture variant.
schedule(async () => {
  const backendSourceFiles = allFiles.filter(file =>
    file.startsWith('src/api/') && file.endsWith('.cs') && !file.includes('/Bach.Software.Tests/'),
  );
  for (const file of backendSourceFiles) {
    const diff = await danger.git.diffForFile(file);
    if (diff && /new\s+HttpClient\s*\(/.test(diff.added)) {
      warn(`API-07: \`${file}\` constructs an \`HttpClient\` directly. Outbound HTTP must go through \`IHttpClientFactory\`: register the consumer as a typed client (\`AddHttpClient<TInterface, TImplementation>()\`) or inject \`IHttpClientFactory\` if the consumer must be a singleton.`);
    }
  }
});

// CS-01: nullability and analyzer warnings are fixed, never suppressed. New suppressions
// (#pragma warning disable, <NoWarn>, null-forgiving !) need an explicit justification in the PR.
schedule(async () => {
  const backendFiles = allFiles.filter(file =>
    file.startsWith('src/api/') && /\.(?:cs|csproj)$/.test(file),
  );
  for (const file of backendFiles) {
    const diff = await danger.git.diffForFile(file);
    if (!diff) {
      continue;
    }
    if (/#pragma\s+warning\s+disable/.test(diff.added) || /<NoWarn>/.test(diff.added)) {
      warn(`CS-01: \`${file}\` adds a warning suppression (\`#pragma warning disable\` or \`<NoWarn>\`). Warnings are fixed at the source, never silenced: justify this suppression explicitly in the PR description.`);
    }
    // Word char or closing paren/bracket followed by `!` that is not `!=`: the null-forgiving
    // operator. String contents can false-positive; treat the warning as a prompt, not a verdict.
    if (file.endsWith('.cs') && /[\w)\]]!(?![=])/.test(diff.added)) {
      warn(`CS-01: \`${file}\` adds a null-forgiving \`!\`. Fix nullability at the source (better types, guard clauses, \`required\` members) or justify the assertion explicitly in the PR description.`);
    }
  }
});

// API-06: object mapping, when it arrives, is Mapperly — compile-checked, no runtime assets.
// Reflection mappers hide unmapped members until production.
schedule(async () => {
  const csprojFiles = allFiles.filter(file => file.startsWith('src/api/') && file.endsWith('.csproj'));
  for (const file of csprojFiles) {
    const diff = await danger.git.diffForFile(file);
    if (!diff) {
      continue;
    }
    if (/PackageReference\s+Include="(?:AutoMapper|Mapster)/.test(diff.added)) {
      warn(`API-06: \`${file}\` adds a reflection mapper (AutoMapper/Mapster). Mapping goes through Mapperly, which is compile-checked (RMG012/RMG020 are build errors here): use \`Riok.Mapperly\` instead.`);
    }
    const mapperlyRef = diff.added.match(/<PackageReference\s+Include="Riok\.Mapperly"[^>]*>/);
    if (mapperlyRef && !(/ExcludeAssets="runtime"/.test(mapperlyRef[0]) && /PrivateAssets="all"/.test(mapperlyRef[0]))) {
      warn(`API-06: \`${file}\` references \`Riok.Mapperly\` without \`ExcludeAssets="runtime" PrivateAssets="all"\`. Mapperly is a compile-time source generator; nothing of it should ship at runtime.`);
    }
  }
});

const endpointsChanged = allFiles.some(file => /src\/api\/.*\/(?:Endpoints|ErrorHandling)\/.*\.cs$/.test(file));
if (endpointsChanged && !backendTestChanged) {
  warn('API-03: Endpoints/ErrorHandling changed without a matching integration test change in Bach.Software.Tests.');
}

markdown('Checked by the `/spec:enforce` danger rules — see `specs/enforcement.md` for what these cover and what is review-only.');
