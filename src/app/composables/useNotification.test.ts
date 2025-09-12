import type { ProblemDetails } from '~/types/ProblemDetails';
import type { ValidationProblemDetails } from '~/types/ValidationProblemDetails';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { createPinia, setActivePinia } from './destructiblePinia';
import { useNotificationStore } from './useNotificationStore';

const mock = vi.hoisted(() => ({
  useI18n: () => ({
    t: vi.fn(key => key),
  }),
}));

mockNuxtImport('useI18n', () => mock.useI18n);

setActivePinia(createPinia());

describe('useNotificationStore', () => {
  beforeEach(() => {
    const { clearAll } = useNotificationStore();
    clearAll();
  });

  describe('different instances', () => {
    it('should keep track of its own notifications and remove only those when calling clear', async () => {
      const {
        notifications: notifications1,
        add: add1,
        clear: clear1,
        clearAll: clearAll1,
      } = useNotificationStore();
      const { notifications: notifications2, add: add2 }
        = useNotificationStore();
      const {
        notifications: notifications4,
        add: add3,
        clearAll: clearAll3,
      } = useNotificationStore();
      const {
        notifications: notifications3,
        add: add4,
        clear: clear4,
      } = useNotificationStore();
      clearAll1();

      add1('error', 'Message added by 1');
      add1('error', 'Another message added by 1');
      add2('error', 'Message added by 2');
      add3('error', 'Message added by 3');
      add4('error', 'Message added by 4');
      expect(notifications1.value.length).toBe(5);
      expect(notifications1.value).toEqual(notifications2.value);
      expect(notifications2.value).toEqual(notifications3.value);
      expect(notifications3.value).toEqual(notifications4.value);

      clear1();
      expect(notifications1.value.length).toBe(3);

      clear4();
      expect(notifications1.value).toEqual([
        {
          options: {},
          title: 'Message added by 2',
          notificationId: 2,
          severity: 'error',
        },
        {
          options: {},
          title: 'Message added by 3',
          notificationId: 3,
          severity: 'error',
        },
      ]);

      clearAll3();
      expect(notifications2.value.length).toBe(0);
    });
  });

  describe('unmounting component that created notifications', () => {
    it('should keep track of its own notifications and when parent is unmounted remove only those', async () => {
      const showParent1 = ref(true);
      const showParent2 = ref(true);
      const { notifications } = useNotificationStore();
      const parent1 = defineComponent({
        data() {
          const { add } = useNotificationStore();
          add('error', 'Error reported from parent 1');
          add('error', 'Another Error reported from parent 1');
          return {};
        },
        template: `dummy`,
      });
      const parent2 = defineComponent({
        data() {
          const { add } = useNotificationStore();
          add('warning', 'Warning reported from parent 2');
          add('warning', 'Another Warning reported from parent 2');
          return {};
        },
        template: `dummy`,
      });
      const controller = defineComponent({
        components: { Parent1: parent1, Parent2: parent2 },
        data() {
          return { showParent1, showParent2 };
        },
        template: `
        <Parent1 v-if="showParent1"/>
        <Parent2 v-if="showParent2" />
        `,
      });
      mount(controller);
      expect(notifications.value.length).toBe(4);
      showParent2.value = false;
      await nextTick();
      expect(notifications.value.length).toBe(2);
      showParent1.value = false;
      await nextTick();
      expect(notifications.value.length).toBe(0);
    });
  });

  describe('adding & removing notifications', () => {
    const { notifications, add, addError, clear } = useNotificationStore();

    beforeEach(() => {
      clear();
    });

    it('should add error message', async () => {
      expect(notifications.value.length).toBe(0);
      add('error', 'Some message for the user');
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'Some message for the user',
          severity: 'error',
        }),
      );
    });

    it('should display an unknown error', async () => {
      expect(notifications.value.length).toBe(0);

      try {
        throw new Error('Some message for the user');
      }
      catch (e) {
        addError(e);
      }

      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'notification.error.unknown',
          severity: 'error',
          descriptionList: undefined,
        }),
      );
    });

    it('should display an Problem details error', async () => {
      expect(notifications.value.length).toBe(0);

      try {
        throw {
          status: 500,
          title: 'Internal Server Error',
          detail: 'An unexpected error occurred.',
          type: 'https://example.com/problem/internal-server-error',
        } as ProblemDetails;
      }
      catch (e) {
        addError(e);
      }

      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'Internal Server Error',
          description: 'An unexpected error occurred.',
          descriptionList: undefined,
          severity: 'error',
        }),
      );
    });

    it('should display an Validation Problem details error', async () => {
      expect(notifications.value.length).toBe(0);

      try {
        throw {
          status: 500,
          title: 'Validation Error',
          type: 'https://example.com/problem/internal-server-error',
          errors: {
            additionalData: {
              field1: ['Field1 is required.'],
              field2: [
                'Field2 must be a valid email address.',
                'And another error.',
              ],
            },
          },
        } as ValidationProblemDetails;
      }
      catch (e) {
        addError(e);
      }

      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'Validation Error',
          descriptionList: [
            {
              name: 'field1',
              values: ['Field1 is required.'],
            },
            {
              name: 'field2',
              values: [
                'Field2 must be a valid email address.',
                'And another error.',
              ],
            },
          ],
          severity: 'error',
        }),
      );
    });

    it('should add info message', async () => {
      expect(notifications.value.length).toBe(0);
      add('info', 'Some message for the user');
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'Some message for the user',
          severity: 'info',
        }),
      );
    });
    it('should add warning message', async () => {
      expect(notifications.value.length).toBe(0);
      add('warning', 'Some message for the user');
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'Some message for the user',
          severity: 'warning',
        }),
      );
    });
    it('should add success message', async () => {
      expect(notifications.value.length).toBe(0);
      add('success', 'Some message for the user');
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: 'Some message for the user',
          severity: 'success',
        }),
      );
    });
    it('should clear all notifications', async () => {
      add('error', 'Some message for the user');
      add('success', 'Some message for the user');
      add('warning', 'Some message for the user');
      add('info', 'Some message for the user');
      expect(notifications.value.length).toBe(4);
      clear();
      expect(notifications.value.length).toBe(0);
    });
  });
});
