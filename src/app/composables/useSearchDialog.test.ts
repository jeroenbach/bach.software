import { afterEach, describe, expect, it } from 'vitest';
import { effectScope } from 'vue';
import { useSearchDialog } from './useSearchDialog';

describe('useSearchDialog', () => {
  let scope: ReturnType<typeof effectScope> | undefined;

  function setup() {
    scope = effectScope();
    return scope.run(() => useSearchDialog())!;
  }

  afterEach(() => {
    scope?.stop();
    scope = undefined;
  });

  function pressK(init: KeyboardEventInit = {}) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', cancelable: true, ...init }));
  }

  it('starts closed and opens/closes via the returned functions', () => {
    const { isOpen, open, close } = setup();

    expect(isOpen.value).toBe(false);
    open();
    expect(isOpen.value).toBe(true);
    close();
    expect(isOpen.value).toBe(false);
  });

  it('toggles the dialog with meta+K', () => {
    const { isOpen } = setup();

    pressK({ metaKey: true });
    expect(isOpen.value).toBe(true);

    pressK({ metaKey: true });
    expect(isOpen.value).toBe(false);
  });

  it('toggles the dialog with ctrl+K', () => {
    const { isOpen } = setup();

    pressK({ ctrlKey: true });
    expect(isOpen.value).toBe(true);

    pressK({ ctrlKey: true });
    expect(isOpen.value).toBe(false);
  });

  it('ignores K without a modifier and other modifier combos', () => {
    const { isOpen } = setup();

    pressK();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', metaKey: true, cancelable: true }));

    expect(isOpen.value).toBe(false);
  });
});
