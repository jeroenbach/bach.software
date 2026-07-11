import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppChip from './AppChip.vue';

describe('appChip', () => {
  it('defaults to the gray color', () => {
    const wrapper = mount(AppChip, {
      slots: { default: 'Tech' },
    });

    expect(wrapper.classes()).toContain('from-gray-100');
    expect(wrapper.classes()).not.toContain('from-sky-600');
    expect(wrapper.text()).toBe('Tech');
  });

  it('applies the blue color classes when color is blue', () => {
    const wrapper = mount(AppChip, {
      props: { color: 'blue' },
      slots: { default: 'Tech' },
    });

    expect(wrapper.classes()).toContain('from-sky-600');
    expect(wrapper.classes()).not.toContain('from-gray-100');
  });
});
