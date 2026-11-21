import { mountSuspended } from '@nuxt/test-utils/runtime';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { buildPost } from '~/tests/builders/postBuilder';
import { collectTestIds, expectUniqueWithinScope } from '~/tests/helpers/dataTestid';
import BlogPostSummary from './BlogPostSummary.vue';

enableAutoUnmount(afterEach);

const firstPost = buildPost((post) => {
  post.id = 'posts_en/1.md';
});
const secondPost = buildPost((post) => {
  post.id = 'posts_en/2.md';
});

describe('blogPostSummary', () => {
  it('should identify its container by the post it shows', async () => {
    const wrapper = await mountSuspended(BlogPostSummary, { props: { post: firstPost } });

    expect(wrapper.attributes('data-testid')).toBe('blog-post-summary-row-posts_en/1.md');
  });

  it('should keep the author ids unique inside every summary of a list', async () => {
    const host = defineComponent({
      setup: () => () => h('div', [firstPost, secondPost].map(post => h(BlogPostSummary, { post }))),
    });

    const wrapper = await mountSuspended(host);

    const rows = wrapper.findAll('[data-testid^="blog-post-summary-row-"]');
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expectUniqueWithinScope(row.element);
      expect(collectTestIds(row.element)).toContain('author-information-card');
    }
  });
});
