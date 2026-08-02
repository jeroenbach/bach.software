import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import * as stories from './BlogPost.stories';

import BlogPost from './BlogPost.vue';
import LikeButton from './LikeButton.vue';

type Story = stories.Story;

function mountStory(story: Story, argsOverride?: Story['args']) {
  return mount(BlogPost, {
    props: { ...story.args, ...argsOverride },
    global: {
      // BlogPost is presentational; translations come from the app's i18n plugin
      mocks: { $t: (key: string) => key },
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
});
