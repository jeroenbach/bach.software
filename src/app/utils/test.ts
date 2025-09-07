import type { StoryObj } from '@storybook/vue3-vite';
import type { DOMWrapper, VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';

/**
 * Helper to mount a storybook story
 * @param story the storybook story to mount
 * @param argsOverride specify args that you want to override
 * @returns wrapper with mounted component
 */
export function mountStory<Story extends StoryObj>(story: Story, argsOverride?: Story['args']) {
  return mount(story.render, { props: { ...story.args, ...argsOverride } });
}

export async function setInputValue(wrapper: VueWrapper, cssQuery: string, value: string) {
  const input = await find(wrapper, cssQuery);
  await input.setValue(value);
}

export async function getComponent(wrapper: VueWrapper, component: any, cssQuery?: string): Promise<VueWrapper> {
  if (!cssQuery) {
    return wrapper.findComponent(component);
  }

  const specific = await find(wrapper, cssQuery);
  return specific.findComponent(component);
}

export async function getComponentVM(wrapper: VueWrapper, component: any, cssQuery?: string) {
  const fieldComponent = await getComponent(wrapper, component, cssQuery);
  return fieldComponent.vm as any;
}

export async function find(wrapper: VueWrapper, cssQuery: string, havePatience: boolean = true, count = 1): Promise<DOMWrapper<Element>> {
  const element = wrapper.find(cssQuery);

  if (element?.exists() || count > 10 || !havePatience)
    return element;

  await nextTick();
  return await find(wrapper, cssQuery, havePatience, ++count);
}

/**
 * Gets the text of an field element
 */
export async function text(wrapper: VueWrapper, cssQuery: string, havePatience: boolean = true) {
  const element = await find(wrapper, cssQuery, havePatience);
  if (!element.exists())
    return null;
  return element.text();
}

export async function exists(wrapper: VueWrapper, cssQuery: string, havePatience: boolean = true) {
  const element = await find(wrapper, cssQuery, havePatience);
  return element.exists();
}

export async function trigger(wrapper: VueWrapper, cssQuery: string, eventString: string, havePatience: boolean = true) {
  const element = await find(wrapper, cssQuery, havePatience);
  if (!element.exists())
    return;
  await element.trigger(eventString);
}

export async function click(wrapper: VueWrapper, cssQuery: string, times: number = 1, havePatience: boolean = true) {
  for (let i = 0; i < times; i++) {
    await trigger(wrapper, cssQuery, 'click', havePatience);
  }
}
