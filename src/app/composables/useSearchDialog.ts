import { useConfirmDialog, useEventListener } from '@vueuse/core';

/**
 * Manages the open/close state of the search modal via VueUse's confirm-dialog
 * primitive, and wires up the ⌘K / Ctrl+K shortcut to toggle it.
 */
export function useSearchDialog() {
  const { isRevealed: isOpen, reveal: open, cancel: close } = useConfirmDialog();

  useEventListener('keydown', (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      if (isOpen.value) {
        close();
      }
      else {
        open();
      }
    }
  });

  return { isOpen, open, close };
}
