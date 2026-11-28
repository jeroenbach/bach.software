import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { storyNameFromExport, toId } from 'storybook/internal/csf';
import { describe, expect, it } from 'vitest';
import { storyRegistrations } from '../playwright/componentStories';

const repoRoot = join(import.meta.dirname, '..', '..', '..', '..');
const appRoot = join(repoRoot, 'src', 'app');
const componentsRoot = join(appRoot, 'components');

/**
 * Presentational components that deliberately have no story: they cannot render
 * without a real store, clipboard or scroll tracker, and a story must not fake a
 * context to get around that.
 */
const unstoriedComponents: Record<string, string> = {
  'content/CodeGroup': 'writes to the message store and reads the clipboard',
  'content/PageReadProgress': 'runs timers and scroll listeners through useReadProgressTracking',
  'content/post1/Post1Example1': 'post-specific embed of a demo from src/app/examples, not a reusable component',
  'content/post1/Post1Example2': 'post-specific embed of a demo from src/app/examples, not a reusable component',
  'content/post2/Post2Example1': 'post-specific embed of a demo from src/app/examples, not a reusable component',
  'content/post2/Post2Example2': 'post-specific embed of a demo from src/app/examples, not a reusable component',
};

/** Stories whose file must hold more than the default state. */
const splitStoryFiles = ['AppHero', 'CurriculumVitaeTable', 'PortfolioGrid', 'AppHeader', 'ChipLink'];

function listFiles(directory: string, suffix: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? listFiles(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}

function componentKey(file: string) {
  return relative(componentsRoot, file).split(sep).join('/').replace(/\.vue$/, '');
}

function storyFiles() {
  return listFiles(componentsRoot, '.stories.ts');
}

function parseStoryFile(file: string) {
  const source = readFileSync(file, 'utf8');
  const title = /const meta = \{\s*title:\s*'([^']+)'/.exec(source)?.[1];
  const exports = [...source.matchAll(/^export const (\w+)\b/gm)].map(match => match[1]!);
  const stories = exports.filter(name => name !== 'meta');
  return { file, source, title, stories };
}

const parsedStories = storyFiles().map(parseStoryFile);

const allStoryIds = parsedStories.flatMap(({ title, stories }) =>
  stories.map(story => toId(title!, storyNameFromExport(story))),
);

describe('storybook coverage', () => {
  it('lists no presentational component without a story except the reasoned exclusions', () => {
    const storied = new Set(storyFiles().map(file => componentKey(file.replace('.stories.ts', '.vue'))));
    const missing = listFiles(componentsRoot, '.vue')
      .map(componentKey)
      .filter(key => !storied.has(key) && !(key in unstoriedComponents));

    expect(missing).toEqual([]);
  });

  it('keeps every exclusion pointing at a component that still exists', () => {
    Object.keys(unstoriedComponents).forEach((key) => {
      expect(existsSync(join(componentsRoot, `${key}.vue`)), key).toBe(true);
    });
  });

  it('has a co-located stories file for every presentational component', () => {
    const stray = parsedStories.filter(({ file }) => !existsSync(file.replace('.stories.ts', '.vue')));

    expect(stray.map(({ file }) => relative(appRoot, file))).toEqual([]);
  });

  it('gives every story file a title and at least one story', () => {
    parsedStories.forEach(({ file, title, stories }) => {
      expect(title, relative(appRoot, file)).toBeTruthy();
      expect(stories.length, relative(appRoot, file)).toBeGreaterThan(0);
    });
  });

  it('exports a Default story from every story file', () => {
    const missing = parsedStories
      .filter(({ stories }) => !stories.includes('Default'))
      .map(({ file }) => relative(appRoot, file));

    expect(missing).toEqual([]);
  });

  it('uses the Elements or Components sidebar prefix in every title', () => {
    const wrong = parsedStories
      .filter(({ title }) => !/^(?:Elements|Components)\//.test(title ?? ''))
      .map(({ file }) => relative(appRoot, file));

    expect(wrong).toEqual([]);
  });

  it('has no story for a context component', () => {
    expect(storyFiles().filter(file => file.includes(`${sep}contexts${sep}`))).toEqual([]);
    expect(existsSync(join(appRoot, 'contexts'))).toBe(true);
    expect(listFiles(join(appRoot, 'contexts'), '.stories.ts')).toEqual([]);

    const importingContexts = parsedStories
      .filter(({ source }) => /from '[~@]\/contexts\//.test(source))
      .map(({ file }) => relative(appRoot, file));
    expect(importingContexts).toEqual([]);
  });

  it('splits the formerly default-only story files into more than one story', () => {
    splitStoryFiles.forEach((name) => {
      const story = parsedStories.find(({ file }) => file.endsWith(`${sep}${name}.stories.ts`));
      expect(story, name).toBeDefined();
      expect(story!.stories.length, name).toBeGreaterThan(1);
    });
  });

  it('registers every story export in the capture spec', () => {
    const registered = new Set(storyRegistrations.map(({ id }) => id));
    const unregistered = allStoryIds.filter(id => !registered.has(id));

    expect(unregistered).toEqual([]);
  });

  it('registers only ids that resolve to an existing story', () => {
    const existing = new Set(allStoryIds);
    const stale = storyRegistrations.map(({ id }) => id).filter(id => !existing.has(id));

    expect(stale).toEqual([]);
  });

  it('registers each story id once', () => {
    const ids = storyRegistrations.map(({ id }) => id);

    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });

  it('does not track any png baseline under the playwright folder', () => {
    let tracked: string[];
    try {
      tracked = execFileSync('git', ['ls-files', '--', 'src/app/tests/playwright'], { cwd: repoRoot, encoding: 'utf8' })
        .split('\n')
        .filter(path => path.endsWith('.png') && existsSync(join(repoRoot, path)));
    }
    catch {
      // Not a git checkout (e.g. a source archive): there is nothing tracked to inspect.
      return;
    }

    expect(tracked).toEqual([]);
  });
});
