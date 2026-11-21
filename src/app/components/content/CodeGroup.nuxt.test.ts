import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { useNuxtApp } from '#imports';
import { collectTestIds, expectConventionalTestIds } from '~/tests/helpers/dataTestid';
import { fixedOutlet, mountWithMessageBars, renderedAlerts } from '~/tests/helpers/messageBarHarness';
import CodeGroup from './CodeGroup.vue';

const mock = vi.hoisted(() => ({ copy: vi.fn() }));

vi.mock('@vueuse/core', async (importOriginal) => {
  const { ref } = await import('vue');
  return {
    ...await importOriginal<typeof import('@vueuse/core')>(),
    useClipboard: () => ({ copy: mock.copy, isSupported: ref(true), copied: ref(false) }),
  };
});

const t = (key: string) => useNuxtApp().$i18n.t(key);

const slots = {
  default: () => [
    h('pre', { code: 'const first = 1;', filename: 'first.ts' }),
    h('pre', { code: 'const second = 2;', filename: 'second.ts' }),
  ],
};

async function mountCodeGroup() {
  mock.copy.mockClear();
  const harness = await mountWithMessageBars(CodeGroup, { slots });
  const copyButton = () => document.body.querySelector<HTMLElement>(`button[aria-label="${t('codeGroup.copyToClipboard')}"]`);
  await vi.waitFor(() => expect(copyButton()).not.toBeNull());
  return { ...harness, copyButton: () => copyButton()! };
}

describe('codeGroup', () => {
  it('should add a success message with the copied text when the copy button is clicked', async () => {
    const { copyButton, messages } = await mountCodeGroup();

    copyButton().click();

    await vi.waitFor(() => expect(messages.value).toHaveLength(1));
    expect(messages.value[0]).toMatchObject({
      severity: 'success',
      description: t('Copied to clipboard!'),
    });
    await vi.waitFor(() => expect(renderedAlerts().map(alert => alert.textContent)).toEqual([expect.stringContaining('Copied to clipboard!')]));
  });

  it('should render the confirmation in the fixed outlet', async () => {
    const { copyButton } = await mountCodeGroup();

    copyButton().click();

    await vi.waitFor(() => expect(fixedOutlet().querySelectorAll('[role="alert"]')).toHaveLength(1));
  });

  it('should add the message with a closeIn of 3000', async () => {
    const { copyButton, messages } = await mountCodeGroup();

    copyButton().click();

    await vi.waitFor(() => expect(messages.value).toHaveLength(1));
    expect(messages.value[0]!.closeIn).toBe(3000);
  });

  it('should pass the active tab code to the clipboard', async () => {
    const { copyButton } = await mountCodeGroup();

    copyButton().click();

    expect(mock.copy).toHaveBeenCalledWith('const first = 1;');
  });

  it('should keep the message after the code group unmounts', async () => {
    const { copyButton, messages, unmountComponent } = await mountCodeGroup();
    copyButton().click();
    await vi.waitFor(() => expect(messages.value).toHaveLength(1));

    unmountComponent();
    await nextTick();

    expect(messages.value).toHaveLength(1);
    expect(renderedAlerts()).toHaveLength(1);
  });

  it('should add no message and not copy when there is no code', async () => {
    const { wrapper, messages } = await mountCodeGroup();
    const codeGroup = wrapper.findComponent(CodeGroup);

    (codeGroup.vm as unknown as { copy: (code: string) => void }).copy('');
    await nextTick();

    expect(mock.copy).not.toHaveBeenCalled();
    expect(messages.value).toHaveLength(0);
  });

  describe('several groups on one page', () => {
    async function mountTwoGroups() {
      mock.copy.mockClear();
      const host = defineComponent({
        render: () => h('div', [
          h(CodeGroup, null, { default: () => [h('pre', { code: 'first group code', filename: 'a.ts' })] }),
          h(CodeGroup, null, { default: () => [h('pre', { code: 'second group code', filename: 'b.ts' })] }),
        ]),
      });
      const wrapper = await mountSuspended(host, { attachTo: document.body });
      onTestFinished(() => wrapper.unmount());
      await vi.waitFor(() => expect(document.body.querySelectorAll('[data-testid="code-group-copy-button"]')).toHaveLength(2));
      return Array.from(document.body.querySelectorAll<HTMLElement>('[data-testid^="code-group-row-"]'));
    }

    it('should give every group a row container with its own id', async () => {
      const rows = await mountTwoGroups();

      expect(rows).toHaveLength(2);
      const ids = rows.map(row => row.getAttribute('data-testid'));
      expect(new Set(ids).size).toBe(2);
      expectConventionalTestIds(ids as string[]);
    });

    it('should keep the plain copy button id inside each row so a test can scope through the row', async () => {
      const rows = await mountTwoGroups();

      for (const row of rows)
        expect(collectTestIds(row).filter(id => id === 'code-group-copy-button')).toHaveLength(1);
    });

    it('should copy the code of the group whose button was clicked', async () => {
      const rows = await mountTwoGroups();

      rows[1]!.querySelector<HTMLElement>('[data-testid="code-group-copy-button"]')!.click();

      expect(mock.copy).toHaveBeenCalledWith('second group code');
    });

    it('should derive the row id from a custom baseDataTestid', async () => {
      const wrapper = await mountSuspended(CodeGroup, {
        props: { baseDataTestid: 'install-code-group' },
        slots: { default: () => [h('pre', { code: 'x', filename: 'a.ts' })] },
        attachTo: document.body,
      });
      onTestFinished(() => wrapper.unmount());

      expect(document.body.querySelector('[data-testid^="install-code-group-row-"]')).not.toBeNull();
    });
  });
});
