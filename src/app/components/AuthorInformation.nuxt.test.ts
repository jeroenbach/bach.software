import { mountSuspended } from '@nuxt/test-utils/runtime';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { collectTestIds, expectConventionalTestIds, expectUniqueWithinScope } from '~/tests/helpers/dataTestid';
import AuthorInformation from './AuthorInformation.vue';

enableAutoUnmount(afterEach);

const author = {
  fullName: 'Jeroen Bach',
  role: 'Software developer',
  homePage: '/about',
  linkedIn: 'https://www.linkedin.com/in/jeroenbach',
};

describe('authorInformation', () => {
  it('should expose the container, name, LinkedIn link and role under the default base', async () => {
    const wrapper = await mountSuspended(AuthorInformation, { props: author });

    expect(collectTestIds(wrapper.element)).toEqual([
      'author-information-card',
      'author-information-name-link',
      'author-information-linkedin-link',
      'author-information-role-value',
    ]);
    expectConventionalTestIds(collectTestIds(wrapper.element), 'author-information');
  });

  it('should rename every id when baseDataTestid is overridden', async () => {
    const wrapper = await mountSuspended(AuthorInformation, { props: { ...author, baseDataTestid: 'post-author' } });

    expect(collectTestIds(wrapper.element)).toEqual([
      'post-author-card',
      'post-author-name-link',
      'post-author-linkedin-link',
      'post-author-role-value',
    ]);
  });

  it('should show the role value by its id', async () => {
    const wrapper = await mountSuspended(AuthorInformation, { props: author });

    expect(wrapper.find('[data-testid="author-information-role-value"]').text()).toBe('Software developer');
  });

  it('should leave out the name id without a full name', async () => {
    const wrapper = await mountSuspended(AuthorInformation, { props: { ...author, fullName: undefined } });

    expect(wrapper.find('[data-testid="author-information-name-link"]').exists()).toBe(false);
  });

  it('should leave out the LinkedIn id without a LinkedIn address', async () => {
    const wrapper = await mountSuspended(AuthorInformation, { props: { ...author, linkedIn: undefined } });

    expect(wrapper.find('[data-testid="author-information-linkedin-link"]').exists()).toBe(false);
  });

  it('should stay unique within a list of instances that use different bases', async () => {
    const host = defineComponent({
      setup: () => () => h('div', [
        h(AuthorInformation, { ...author, baseDataTestid: 'first-author' }),
        h(AuthorInformation, { ...author, baseDataTestid: 'second-author' }),
      ]),
    });

    const wrapper = await mountSuspended(host);

    expectUniqueWithinScope(wrapper.element);
    expect(collectTestIds(wrapper.element)).toHaveLength(8);
  });
});
