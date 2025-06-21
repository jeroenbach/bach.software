/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StoryObj } from "@storybook/vue3-vite";
import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import { mount } from "@vue/test-utils";

/**
 * Helper to mount a storybook story
 * @param story the storybook story to mount
 * @param argsOverride specify args that you want to override
 * @returns wrapper with mounted component
 */
export const mountStory = <Story extends StoryObj>(
  story: Story,
  argsOverride?: Story["args"],
) => mount(story.render, { props: { ...story.args, ...argsOverride } });

export const setInputValue = async (
  wrapper: VueWrapper,
  cssQuery: string,
  value: string,
) => {
  const input = await find(wrapper, cssQuery);
  await input.setValue(value);
};

export const getComponent = async (
  wrapper: VueWrapper,
  component: any,
  cssQuery?: string,
): Promise<VueWrapper> => {
  if (!cssQuery) {
    return wrapper.findComponent(component);
  }

  const specific = await find(wrapper, cssQuery);
  return specific.findComponent(component);
};

export const getComponentVM = async (
  wrapper: VueWrapper,
  component: any,
  cssQuery?: string,
) => {
  const fieldComponent = await getComponent(wrapper, component, cssQuery);
  return fieldComponent.vm as any;
};

export const find = async (
  wrapper: VueWrapper,
  cssQuery: string,
  havePatience: boolean = true,
  count = 1,
): Promise<DOMWrapper<Element>> => {
  const element = wrapper.find(cssQuery);

  if (element?.exists() || count > 10 || !havePatience) return element;

  await nextTick();
  return await find(wrapper, cssQuery, havePatience, ++count);
};

/**
 * Gets the text of an field element
 */
export const text = async (
  wrapper: VueWrapper,
  cssQuery: string,
  havePatience: boolean = true,
) => {
  const element = await find(wrapper, cssQuery, havePatience);
  if (!element.exists()) return null;
  return element.text();
};

export const exists = async (
  wrapper: VueWrapper,
  cssQuery: string,
  havePatience: boolean = true,
) => {
  const element = await find(wrapper, cssQuery, havePatience);
  return element.exists();
};

export const trigger = async (
  wrapper: VueWrapper,
  cssQuery: string,
  eventString: string,
  havePatience: boolean = true,
) => {
  const element = await find(wrapper, cssQuery, havePatience);
  if (!element.exists()) return;
  await element.trigger(eventString);
};

export const click = async (
  wrapper: VueWrapper,
  cssQuery: string,
  times: number = 1,
  havePatience: boolean = true,
) => {
  for (let i = 0; i < times; i++) {
    await trigger(wrapper, cssQuery, "click", havePatience);
  }
};
