<script lang="ts" setup>
import type { Notification } from '~/composables/useNotificationStore';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';

import { useAnimate, useEventListener } from '@vueuse/core';

interface Props extends Omit<Notification, 'notificationId'> {
  disableTeleport?: boolean
}

const {
  disableTeleport = false,
  severity = 'error',
  options,
} = defineProps<Props>();

const emits = defineEmits<{
  (e: 'close'): void
}>();

const progress = ref();
const dismissed = ref(false);
const notification = useTemplateRef('notification');

const { currentTime, pause, play } = useAnimate(
  progress,
  { width: '100%' },
  {
    duration: options?.closeIn,
    persist: true,
    immediate: !!options?.closeIn,
    onReady: (animate) => {
      animate.onfinish = () => close();
    },
  },
);

useEventListener(notification, 'mouseenter', () => options?.closeIn && pause(), { passive: true });
useEventListener(notification, 'mouseleave', () => options?.closeIn && play(), { passive: true });

const percentageComplete = computed(() =>
  options?.closeIn
    ? ((currentTime.value as number) / options?.closeIn) * 100
    : 0,
);

function close() {
  dismissed.value = true;
  emits('close');
}
</script>

<template>
  <ClientOnly>
    <Teleport :disabled="disableTeleport" to="[notification='main']">
      <div
        v-if="!dismissed"
        ref="notification"
        role="alert"
        class="cursor-pointer pointer-events-auto mb-1 w-full max-w-md overflow-hidden rounded-lg shadow-lg border-t border-e border-black/5 dark:border-white/5"
        :class="{
          'border-l-4 border-l-green-300 dark:border-l-green-300 bg-white dark:bg-gray-800 dark:text-green-400':
            severity === 'success',
          'border-l-4 border-l-red-400 dark:border-l-red-400 bg-red-50 dark:bg-gray-800 dark:text-red-400':
            severity === 'error',
          'border-l-4 border-l-yellow-400 dark:border-l-yellow-400 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300':
            severity === 'warning',
          'border-l-4 border-l-blue-400 dark:border-l-blue-400 bg-white dark:bg-gray-800 dark:text-blue-400':
            severity === 'info',
        }"
        @click="close"
      >
        <div class="p-4">
          <div class="flex items-start gap-4">
            <CheckCircleIcon
              v-if="severity === 'success'"
              class="size-6 shrink-0 text-green-400"
            />
            <XCircleIcon
              v-if="severity === 'error'"
              class="size-6 shrink-0 text-red-400"
            />
            <ExclamationTriangleIcon
              v-if="severity === 'warning'"
              class="size-6 shrink-0 text-yellow-400"
            />
            <InformationCircleIcon
              v-if="severity === 'info'"
              class="size-6 shrink-0 text-blue-400"
            />
            <div class="my-auto flex grow flex-col gap-1 text-sm">
              <p
                v-if="title"
                class="font-medium"
                :class="{
                  'text-green-800 dark:text-green-500': severity === 'success',
                  'text-red-800 dark:text-red-500': severity === 'error',
                  'text-yellow-800 dark:text-yellow-500':
                    severity === 'warning',
                  'text-blue-800 dark:text-blue-500': severity === 'info',
                }"
              >
                {{ title }}
              </p>
              <slot v-if="$slots.default" />
              <template v-else>
                <p
                  v-if="description"
                  :class="{
                    'text-gray-500 dark:text-green-800': severity === 'success',
                    'text-red-500 dark:text-red-800': severity === 'error',
                    'text-yellow-500 dark:text-yellow-800':
                      severity === 'warning',
                    'text-blue-500 dark:text-blue-800': severity === 'info',
                  }"
                >
                  {{ description }}
                </p>
                <ul v-if="descriptionList?.length">
                  <li
                    v-for="({ name, values }, i) in descriptionList"
                    :key="i"
                    class="ms-5 list-disc"
                  >
                    <div class="inline-flex flex-wrap">
                      <div v-if="name" class="me-1 inline-block">
                        {{ name }}:
                      </div>
                      <div class="grow">
                        <span
                          v-for="value in values"
                          :key="value"
                          class="block"
                        >{{ value }}</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </template>
            </div>
            <div class="flex">
              <span class="sr-only">Close</span>
              <button
                class="flex size-6 rounded-lg text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                @click="close"
              >
                <XMarkIcon class="m-auto size-5" />
              </button>
            </div>
          </div>
        </div>
        <div
          ref="progress"
          role="progressbar"
          class="h-0.5"
          :class="{
            'bg-green-400 dark:bg-green-800': severity === 'success',
            'bg-red-400': severity === 'error',
            'bg-yellow-400': severity === 'warning',
            'bg-blue-400': severity === 'info',
          }"
          :aria-valuenow="percentageComplete"
          aria-valuemin="0"
          aria-valuemax="100"
          style="width: 0%"
        />
      </div>
    </Teleport>
  </ClientOnly>
</template>
