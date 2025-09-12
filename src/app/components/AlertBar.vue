<script lang="ts" setup>
import type { Notification } from '~/composables/useNotificationStore';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';

interface Props extends Omit<Notification, 'notificationId' | 'title'> {
  title?: string
  disableTeleport?: boolean
}

const {
  title = undefined,
  disableTeleport = false,
  severity = 'error',
} = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void
}>();

const dismissed = ref(false);
function close() {
  dismissed.value = true;
  emit('close');
}
</script>

<template>
  <Teleport :disabled="disableTeleport" to="[alert-bar='main']" defer>
    <div
      v-if="!dismissed"
      role="alert"
      class="pointer-events-auto mb-1 w-full overflow-hidden"
      :class="{
        'bg-green-50 dark:bg-gray-800 dark:text-green-400':
          severity === 'success',
        'bg-red-50 dark:bg-gray-800 dark:text-red-400': severity === 'error',
        'bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300':
          severity === 'warning',
        'bg-blue-50 dark:bg-gray-800 dark:text-blue-400': severity === 'info',
      }"
    >
      <div class="p-4">
        <div class="flex items-start gap-4">
          <slot name="left">
            <CheckCircleIcon
              v-if="severity === 'success'"
              class="size-6 text-green-400"
            />
            <XCircleIcon
              v-if="severity === 'error'"
              class="size-6 text-red-400"
            />
            <ExclamationTriangleIcon
              v-if="severity === 'warning'"
              class="size-6 text-yellow-400"
            />
            <InformationCircleIcon
              v-if="severity === 'info'"
              class="size-6 text-blue-400"
            />
          </slot>
          <div class="my-auto flex grow flex-col gap-1 text-sm">
            <p
              v-if="title"
              class="font-medium"
              :class="{
                'text-green-800 dark:text-green-500': severity === 'success',
                'text-red-800 dark:text-red-500': severity === 'error',
                'text-yellow-800 dark:text-yellow-500': severity === 'warning',
                'text-blue-800 dark:text-blue-500': severity === 'info',
              }"
            >
              {{ title }}
            </p>
            <slot>
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
            </slot>
          </div>
          <slot name="right">
            <div class="flex">
              <span class="sr-only">Close</span>
              <button
                class="flex size-6 rounded-lg text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                @click="close"
              >
                <XMarkIcon class="m-auto size-5" />
              </button>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
