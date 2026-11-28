import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import * as stories from './BlogPost.stories';

import BlogPost from './BlogPost.vue';
import LikeButton from './LikeButton.vue';

type Story = stories.Story;

function mountStory(story: Story, argsOverride?: Partial<NonNullable<Story['args']>>) {
  return mount(BlogPost, {
    props: { ...story.args, ...argsOverride },
    global: {
      // BlogPost is presentational; translations come from the app's i18n plugin
      mocks: { $t: (key: string, params?: { n: number }) => params ? `${key} ${params.n}` : key },
      stubs: { ContentRenderer: true },
    },
  });
}

describe('blogPost', () => {
  it('should render the post title', () => {
    const w = mountStory(stories.Default);
    expect(w.find('h1').text()).toBe(stories.Default.args.post?.title);
  });

  it('should pass the likes to the like button', () => {
    const w = mountStory(stories.Default);
    const likeButton = w.findComponent(LikeButton);
    expect(likeButton.props('count')).toBe(5);
    expect(likeButton.props('liked')).toBe(false);
  });

  it('should show the liked state', () => {
    const w = mountStory(stories.Liked);
    const likeButton = w.findComponent(LikeButton);
    expect(likeButton.props('count')).toBe(6);
    expect(likeButton.props('liked')).toBe(true);
  });

  it('should re-emit the like event of the like button', async () => {
    const w = mountStory(stories.Default);
    await w.findComponent(LikeButton).find('button').trigger('click');
    expect(w.emitted('like')).toHaveLength(1);
  });

  describe('read count', () => {
    const readCountElement = (wrapper: ReturnType<typeof mountStory>) => wrapper.find('[title^="blog.readCount "]');

    it('shows the read count with its translated title when the view model has reads', () => {
      const w = mountStory(stories.Default, { reads: { readCount: 11 } });

      expect(readCountElement(w).attributes('title')).toBe('blog.readCount 11');
      expect(readCountElement(w).text()).toBe('11');
    });

    it('hides the read count when the count is zero', () => {
      const w = mountStory(stories.Default, { reads: { readCount: 0 } });

      expect(readCountElement(w).exists()).toBe(false);
    });

    it('hides the read count when the view model has no count', () => {
      const w = mountStory(stories.Default, { reads: {} });

      expect(readCountElement(w).exists()).toBe(false);
    });

    it('hides the read count when no reads are passed', () => {
      const w = mountStory(stories.Default, { reads: undefined });

      expect(readCountElement(w).exists()).toBe(false);
    });
  });

  it('renders nothing and does not throw while the post is loading', () => {
    const w = mountStory(stories.Default, { post: undefined, reads: undefined });

    expect(w.find('article').exists()).toBe(false);
  });
});
