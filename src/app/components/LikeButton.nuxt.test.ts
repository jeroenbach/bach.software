import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import * as stories from './LikeButton.stories';

import LikeButton from './LikeButton.vue';

type Story = stories.Story;

function mountStory(story: Story, argsOverride?: Story['args']) {
  return mount(LikeButton, {
    props: { ...story.args, ...argsOverride },
    global: {
      // LikeButton is presentational; translations come from the app's i18n plugin
      mocks: { $t: (key: string) => key },
    },
  });
}

describe('likeButton', () => {
  it('should have the same html output', async () => {
    const w = mountStory(stories.Default);
    expect(w.html()).toMatchSnapshot();
  });

  it('should render the like count', async () => {
    const w = mountStory(stories.Default);
    expect(w.find('span').text()).toBe('11');
  });

  it('should hide the count when there are no likes', async () => {
    const w = mountStory(stories.WithoutCount);
    expect(w.find('span').exists()).toBe(false);
  });

  it('should emit a like event when clicked', async () => {
    const w = mountStory(stories.Default);
    await w.find('button').trigger('click');
    expect(w.emitted('like')).toHaveLength(1);
  });

  it('should mark the button as pressed when liked', async () => {
    const w = mountStory(stories.Liked);
    expect(w.find('button').attributes('aria-pressed')).toBe('true');
  });

  it('should not mark the button as pressed when not liked', async () => {
    const w = mountStory(stories.Default);
    expect(w.find('button').attributes('aria-pressed')).toBe('false');
  });
});
