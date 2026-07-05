import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';

import TableOfContents from './TableOfContents.vue';

const links = [
  { id: 'intro', text: 'Introduction', depth: 2 },
  {
    id: 'setup',
    text: 'Setup',
    depth: 2,
    children: [
      { id: 'requirements', text: 'Requirements', depth: 3 },
    ],
  },
  { id: 'conclusion', text: 'Conclusion', depth: 2 },
];

describe('tableOfContents', () => {
  it('renders a link for every heading, including nested children', async () => {
    const w = await mountSuspended(TableOfContents, { props: { links } });

    const anchors = w.findAll('a');
    expect(anchors.map(a => a.attributes('href'))).toEqual([
      '#intro',
      '#setup',
      '#requirements',
      '#conclusion',
    ]);
    expect(anchors.map(a => a.text())).toEqual([
      'Introduction',
      'Setup',
      'Requirements',
      'Conclusion',
    ]);
  });

  it('highlights only the active link', async () => {
    const w = await mountSuspended(TableOfContents, {
      props: { links, activeId: 'requirements' },
    });

    const active = w.findAll('a[aria-current="location"]');
    expect(active).toHaveLength(1);
    expect(active[0]!.attributes('href')).toBe('#requirements');
  });

  it('emits select with the heading id when a link is clicked', async () => {
    const w = await mountSuspended(TableOfContents, { props: { links } });

    await w.find('a[href="#setup"]').trigger('click');

    expect(w.emitted('select')).toEqual([['setup']]);
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

    await w.find('a[href="#intro"]').trigger('click');
    expect(details.attributes('open')).toBeUndefined();
  });
});
