import { tryOnUnmounted } from '@vueuse/core';
import { computed, ref } from 'vue';

import { defineDestructibleStore } from '~/composables/destructiblePinia';
import { isProblemDetails } from '~/types/ProblemDetails';
import { isValidationProblemDetails } from '~/types/ValidationProblemDetails';

export type DescriptionList = Array<{ name: string, values: string[] }>;

export interface Notification {
  notificationId: number
  severity?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  description?: string
  /**
   * A bullet list of extra information.
   */
  descriptionList?: DescriptionList
  options?: {
    /**
     * Specifies the amount of milliseconds that the notification should be shown.
     */
    closeIn?: number
  }
}

interface InternalNotification extends Notification {
  instanceId: number
}

/**
 * This is the actual store, shared across the application.
 * We don't export this version as every component will have its own instance
 * so that we can keep track of the notifications of that instance.
 */
const useNotificationStoreInternal = defineDestructibleStore(
  'NotificationStore',
  () => {
    let lastNotificationId = 0;
    let lastInstanceId = 0;
    const internalNotifications = ref<InternalNotification[]>([]);

    const generateNotificationId = () => lastNotificationId++;
    const generateInstanceId = () => lastInstanceId++;

    // Hide the internal working of the messages by removing the instance Id
    const notifications = computed(() =>
      internalNotifications.value.map(
        x =>
          ({
            notificationId: x.notificationId,
            severity: x.severity,
            title: x.title,
            description: x.description,
            descriptionList: x.descriptionList,
            options: { ...x.options },
          }) as Notification,
      ),
    );

    return {
      notifications,
      add: (
        instanceId: number,
        severity: Notification['severity'],
        title?: string,
        description?: string,
        descriptionList?: DescriptionList,
        options?: Notification['options'],
      ) => {
        internalNotifications.value.push({
          notificationId: generateNotificationId(),
          severity,
          instanceId,
          title,
          description,
          descriptionList,
          options,
        });
      },
      generateNotificationId,
      generateInstanceId,
      clear: (instanceId: number) => {
        internalNotifications.value = internalNotifications.value.filter(
          x => x.instanceId !== instanceId,
        );
      },
      clearAll: () => {
        internalNotifications.value = [];
      },
    };
  },
);

/**
 * Notify the user with messages, errors and warnings.
 * The messages will be bound to the component invoking them, so if that component
 * unmounts, also it's messages will be unmounted.
 */
export function useNotificationStore() {
  const {
    notifications,
    add,
    generateInstanceId,
    clear: clearInternal,
    clearAll,
  } = useNotificationStoreInternal(); // The shared instance

  const { t } = useI18n();

  // Here we operate on individual instance bases, so that we can remove all messages added by this instance
  // when it is unmounted. Therefore we keep track of an instance id.
  const instanceId = generateInstanceId();
  const clear = () => clearInternal(instanceId);

  // hook into the owner component's lifecycle to remove all messages added by the parent component
  tryOnUnmounted(() => clear());

  return {
    notifications,
    /**
     * Display a notification to the user.
     * @param severity The severity of the message: info, warning, error, success
     * @param title Optional title of the message
     * @param description The message to display to the user
     * @param options Optional configuration for the notification
     */
    add: (
      severity: Notification['severity'],
      title: string,
      description?: string,
      options?: Notification['options'],
    ) => {
      add(instanceId, severity, title, description, undefined, options);
    },
    /**
     * Display a thrown error to the user.
     * We check the type of the error and
     * @param error The error that is thrown
     * @param options Optional configuration for the notification
     */
    addError: (error: unknown, options?: Notification['options']) => {
      let title: string = t('notification.error.unknown');
      let description: string | undefined;
      let validationErrors: { name: string, values: string[] }[] | undefined;

      if (isProblemDetails(error)) {
        title = error.title;
        description = error.detail;
      }

      if (isValidationProblemDetails(error)) {
        validationErrors = Object.entries(error.errors.additionalData).map(
          ([name, values]) => ({
            name,
            values,
          }),
        );
      }

      add(instanceId, 'error', title, description, validationErrors, options);
    },
    clear,
    clearAll,
  };
}
