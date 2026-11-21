import { danger, markdown, warn } from 'danger';

const modified = danger.git.modified_files;
const created = danger.git.created_files;
const allFiles = [...modified, ...created];

function isFrontendTestFile(file: string): boolean {
  return /\.(?:test|spec)\.ts$/.test(file) || /\.nuxt\.(?:test|spec)\.ts$/.test(file);
}

function isFrontendSourceFile(file: string): boolean {
  return file.startsWith('src/app/')
    && !file.startsWith('src/app/services/backend/')
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
for (const file of allFiles.filter(isFrontendTestFile)) {
  const diff = await danger.git.diffForFile(file);
  if (diff?.added.includes('toMatchSnapshot(')) {
    warn(`FE-06: \`${file}\` adds a \`toMatchSnapshot()\` call. HTML snapshot tests are forbidden here — add a Storybook story and a Playwright visual-regression entry in \`components.spec.ts\` instead.`);
  }
}

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

const endpointsChanged = allFiles.some(file => /src\/api\/.*\/(?:Endpoints|ErrorHandling)\/.*\.cs$/.test(file));
if (endpointsChanged && !backendTestChanged) {
  warn('API-03: Endpoints/ErrorHandling changed without a matching integration test change in Bach.Software.Tests.');
}

markdown('Checked by the `/spec:enforce` danger rules — see `specs/enforcement.md` for what these cover and what is review-only.');
