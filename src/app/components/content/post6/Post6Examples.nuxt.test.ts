import type { VueWrapper } from '@vue/test-utils';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Post6Example1 from './Post6Example1.vue';
import Post6Example2 from './Post6Example2.vue';
import Post6Example3 from './Post6Example3.vue';

async function submit(wrapper: VueWrapper) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

function findInput(wrapper: VueWrapper, idPart: string) {
  return wrapper.findAll('input').find(i => i.attributes('id')?.includes(idPart))!;
}

describe('post6Example1 - basic person form', () => {
  it('renders the fields and shows required validation on empty submit', async () => {
    const wrapper = mount(Post6Example1);
    await flushPromises();

    expect(wrapper.text()).toContain('Person');
    expect(wrapper.text()).toContain('First name');

    await submit(wrapper);

    expect(wrapper.text()).toContain('is required');
  });

  it('submits values under the person path', async () => {
    const wrapper = mount(Post6Example1);
    await flushPromises();

    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue('Ada');
    await inputs[1]!.setValue('Lovelace');
    await submit(wrapper);

    expect(wrapper.text()).toContain('Submitted values:');
    expect(wrapper.find('pre').text()).toContain('"firstName": "Ada"');
    expect(wrapper.find('pre').text()).toContain('"person"');
  });
});

describe('post6Example2 - arrays and choices', () => {
  it('auto-adds one contact and can add more up to maxOccurs', async () => {
    const wrapper = mount(Post6Example2);
    await flushPromises();

    expect(wrapper.text()).toContain('Project contacts');
    const nameInputs = () => wrapper.findAll('input').filter(i => i.attributes('id')?.includes('name'));
    expect(nameInputs().length).toBe(1);

    const addButton = wrapper.findAll('button').find(b => b.text().includes('Add'))!;
    await addButton.trigger('click');
    await flushPromises();

    expect(nameInputs().length).toBe(2);
  });

  it('shows occurrence validation on empty submit', async () => {
    const wrapper = mount(Post6Example2);
    await flushPromises();

    await submit(wrapper);

    expect(wrapper.text()).toContain('Add at least 1 item(s)');
    expect(wrapper.text()).toContain('Fill in at least 1 of these options');
  });

  it('disables the phone branch when email is filled and submits successfully', async () => {
    const wrapper = mount(Post6Example2);
    await flushPromises();

    await findInput(wrapper, 'contacts[0].name').setValue('Ada Lovelace');
    await findInput(wrapper, 'contacts[0].email').setValue('ada@example.com');
    await findInput(wrapper, 'contactMethod.email').setValue('ada@example.com');
    await flushPromises();

    expect(findInput(wrapper, 'contactMethod.phone').attributes('disabled')).toBeDefined();

    await submit(wrapper);

    expect(wrapper.find('pre').exists()).toBe(true);
    expect(wrapper.find('pre').text()).toContain('"contacts"');
  });

  it('rejects an invalid email pattern', async () => {
    const wrapper = mount(Post6Example2);
    await flushPromises();

    await findInput(wrapper, 'contacts[0].name').setValue('Ada');
    await findInput(wrapper, 'contacts[0].email').setValue('not-an-email');
    await findInput(wrapper, 'contactMethod.email').setValue('x@y.z');
    await submit(wrapper);

    expect(wrapper.text()).toContain('This is not a valid Email');
  });
});

describe('post6Example3 - computedProps', () => {
  it('disables VAT number for personal accounts and enables + requires it for business', async () => {
    const wrapper = mount(Post6Example3);
    await flushPromises();

    const vat = () => findInput(wrapper, 'vatNumber');
    expect(vat().attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('Only applicable to business accounts');

    await wrapper.find('select').setValue('business');
    await flushPromises();

    expect(vat().attributes('disabled')).toBeUndefined();
    expect(wrapper.text()).not.toContain('Only applicable to business accounts');

    await submit(wrapper);

    expect(wrapper.text()).toContain('VAT number is required');
  });

  it('submits without VAT for personal accounts', async () => {
    const wrapper = mount(Post6Example3);
    await flushPromises();

    await wrapper.find('select').setValue('personal');
    await flushPromises();
    await submit(wrapper);

    expect(wrapper.find('pre').exists()).toBe(true);
    expect(wrapper.find('pre').text()).toContain('"accountType": "personal"');
  });
});
