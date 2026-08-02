import type { CurriculumVitaeItem } from '~/types/CurriculumVitaeItem';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import CurriculumVitaeTable from './CurriculumVitaeTable.vue';

const curriculumVitae: CurriculumVitaeItem[] = [
  {
    title: 'Software Engineer',
    company: 'Bach.Software',
    date: 'Jul 2018 - Present',
    description: 'Delivered full-stack solutions.',
    keyPoints: ['Led teams of 4-8 engineers', 'Technical leadership'],
    technologies: ['Vue.js', 'React'],
  },
  {
    title: 'Developer',
    company: 'Acme',
    date: 'Jan 2015 - Jun 2018',
    description: 'Built internal tooling.',
    technologies: ['C#'],
  },
];

describe('curriculumVitaeTable', () => {
  it('renders an entry per curriculum vitae item with title, company and date', async () => {
    const wrapper = await mountSuspended(CurriculumVitaeTable, { props: { curriculumVitae } });

    const items = wrapper.findAll('ol > li');
    expect(items).toHaveLength(2);
    expect(items[0]?.find('h3').text()).toBe('Software Engineer - Bach.Software');
    expect(items[0]?.text()).toContain('Jul 2018 - Present');
    expect(items[1]?.find('h3').text()).toBe('Developer - Acme');
  });

  it('renders key points and technologies as chips', async () => {
    const wrapper = await mountSuspended(CurriculumVitaeTable, { props: { curriculumVitae } });

    const chips = wrapper.findAll('ol > li')[0]!.findAll('ul li');
    expect(chips.map(chip => chip.text())).toEqual([
      'Led teams of 4-8 engineers',
      'Technical leadership',
      'Vue.js',
      'React',
    ]);
  });

  it('renders only technology chips when an item has no key points', async () => {
    const wrapper = await mountSuspended(CurriculumVitaeTable, { props: { curriculumVitae } });

    const chips = wrapper.findAll('ol > li')[1]!.findAll('ul li');
    expect(chips.map(chip => chip.text())).toEqual(['C#']);
  });

  it('renders no entries without curriculum vitae items', async () => {
    const wrapper = await mountSuspended(CurriculumVitaeTable, {});

    expect(wrapper.findAll('ol > li')).toHaveLength(0);
  });
});
