import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';

import * as stories from './TableOfContents.stories';

import TableOfContents from './TableOfContents.vue';

// Reuse the story fixtures so the tests cover the same scenarios as Storybook
const { links } = stories.Default.args;

describe('tableOfContents', () => {
  it('renders a link for every heading, including nested children', async () => {
    const w = await mountSuspended(TableOfContents, { props: { links } });

    const anchors = w.findAll('a');
    expect(anchors.map(a => a.attributes('href'))).toEqual([
      '#top',
      '#what-is-plausible-io',
      '#self-hosting-vs-hosted-solution',
      '#hosting-costs',
      '#maintenance',
      '#conclusion',
    ]);
    expect(anchors.map(a => a.text())).toEqual([
      'On this page',
      'What is Plausible.io?',
      'Self-hosting vs. Hosted Solution',
      'Hosting costs',
      'Maintenance',
      'Conclusion',
    ]);
  });

  it('links the heading to the top of the page', async () => {
    const w = await mountSuspended(TableOfContents, { props: { links } });

    const heading = w.find('a[href="#top"]');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('On this page');
  });

  it('highlights only the active link', async () => {
    const w = await mountSuspended(TableOfContents, {
      props: { ...stories.WithActiveSection.args },
    });

    const active = w.findAll('a[aria-current="location"]');
    expect(active).toHaveLength(1);
    expect(active[0]!.attributes('href')).toBe(`#${stories.WithActiveSection.args.activeId}`);
  });

  it('emits select with the heading id when a link is clicked', async () => {
    const w = await mountSuspended(TableOfContents, { props: { links } });

    await w.find('a[href="#conclusion"]').trigger('click');

    expect(w.emitted('select')).toEqual([['conclusion']]);
  });

  it('renders a disclosure that is collapsed by default when collapsible', async () => {
    const w = await mountSuspended(TableOfContents, {
      props: { links, collapsible: true },
    });

    const details = w.find('details');
    expect(details.exists()).toBe(true);
    expect(details.attributes('open')).toBeUndefined();
    expect(w.find('summary').text()).toBe('On this page');
  });

  it('collapses the disclosure again after selecting a link', async () => {
    const w = await mountSuspended(TableOfContents, {
      props: { links, collapsible: true },
    });

    const details = w.find('details');
    details.element.open = true;
    await details.trigger('toggle');
    expect(details.attributes('open')).toBeDefined();

    await w.find('a[href="#what-is-plausible-io"]').trigger('click');
    expect(details.attributes('open')).toBeUndefined();
  });
});
