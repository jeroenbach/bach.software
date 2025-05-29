import { ref, computed } from "vue";
import { tryOnUnmounted } from "@vueuse/core";

import { defineDestructibleStore } from "~/composables/destructiblePinia";

export interface Notification {
  notificationId: number;
  severity?: "info" | "warning" | "error" | "success";
  title?: string;
  description?: string | null;
  options?: {
    /**
     * Specifies the amount of milliseconds that the notification should be shown.
     */
    closeIn?: number;
  };
}

interface InternalNotification extends Notification {
  instanceId: number;
}

/**
 * This is the actual store, shared across the application.
 * We don't export this version as every component will have its own instance
 * so that we can keep track of the notifications of that instance.
 */
const useNotificationInternal = defineDestructibleStore(
  "NotificationStore",
  () => {
    let lastNotificationId = 0;
    let lastInstanceId = 0;
    const internalNotifications = ref<InternalNotification[]>([]);

    const generateNotificationId = () => lastNotificationId++;
    const generateInstanceId = () => lastInstanceId++;

    // Hide the internal working of the messages by removing the instance Id
    const notifications = computed(() =>
      internalNotifications.value.map(
        (x) =>
          ({
            notificationId: x.notificationId,
            severity: x.severity,
            title: x.title,
            description: x.description,
            options: { ...x.options },
          }) as Notification,
      ),
    );

    return {
      notifications,
      add: (
        instanceId: number,
        severity: Notification["severity"],
        title?: string,
        description?: string | null,
        options?: Notification["options"],
      ) => {
        internalNotifications.value.push({
          notificationId: generateNotificationId(),
          severity,
          instanceId,
          title,
          description,
          options,
        });
      },
      generateNotificationId,
      generateInstanceId,
      clear: (instanceId: number) => {
        internalNotifications.value = internalNotifications.value.filter(
          (x) => x.instanceId !== instanceId,
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
export const useNotification = () => {
  const {
    notifications,
    add,
    generateInstanceId,
    clear: clearInternal,
    clearAll,
  } = useNotificationInternal(); // The shared instance

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
     * @param description The message to display to the user
     * @param title Optional title of the message
     * @param closeIn specify in how many milliseconds to close the message. @default this is turned off.
     */
    add: (
      severity: Notification["severity"],
      title: string,
      description?: string,
      options?: Notification["options"],
    ) => {
      add(instanceId, severity, title, description, options);
    },
    /**
     * Display a notification to the user.
     * @param severity The severity of the message: info, warning, error, success
     * @param description The message to display to the user
     * @param title Optional title of the message
     * @param closeIn specify in how many milliseconds to close the message. @default this is turned off.
     */
    addSimple: (
      severity: Notification["severity"],
      title: string,
      options?: Notification["options"],
    ) => {
      add(instanceId, severity, title, null, options);
    },
    clear,
    clearAll,
  };
};
