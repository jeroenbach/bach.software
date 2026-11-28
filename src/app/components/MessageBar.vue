<script lang="ts" setup>
import type { Message } from '~/composables/useMessageStore';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import { useAnimate, useEventListener } from '@vueuse/core';
import { computed, inject, onUnmounted, ref } from 'vue';
import {
  fallbackOutlets,
  messageBarRegistryKey,
} from '~/components/messageBarRegistry';

interface Props extends Omit<Message, 'messageId'> {
  /** Render in place instead of teleporting to a MessageBarOutlet. */
  teleport?: boolean
  baseDataTestid?: string
}

defineOptions({ inheritAttrs: false });

const {
  teleport = true,
  severity = 'error',
  description = undefined,
  closeIn = undefined,
  sticky = false,
  fixed = false,
  isClosable = true,
  closeOnClick = true,
  closed = false,
  baseDataTestid = 'message-bar',
} = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'click'): void
}>();

const { currentOutlets, registerMessage, unregisterMessage } = inject(
  messageBarRegistryKey,
  { currentOutlets: fallbackOutlets },
);
const outlets = currentOutlets();

const barElement = ref<HTMLElement>();
const progressElement = ref<HTMLElement>();
const dismissed = ref(false);

const severityClasses: Record<
  NonNullable<Message['severity']>,
  { bar: string, floatingBar: string, accent: string, icon: string, text: string, progress: string }
> = {
  success: {
    bar: 'bg-green-50 dark:bg-gray-800 dark:text-green-400',
    floatingBar: 'bg-white dark:bg-gray-800 dark:text-green-400',
    accent: 'border-l-green-300',
    icon: 'text-green-400',
    text: 'text-green-800 dark:text-green-500',
    progress: 'bg-green-400 dark:bg-green-800',
  },
  error: {
    bar: 'bg-red-50 dark:bg-gray-800 dark:text-red-400',
    floatingBar: 'bg-red-50 dark:bg-gray-800 dark:text-red-400',
    accent: 'border-l-red-400',
    icon: 'text-red-400',
    text: 'text-red-800 dark:text-red-500',
    progress: 'bg-red-400',
  },
  warning: {
    bar: 'bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300',
    floatingBar: 'bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300',
    accent: 'border-l-yellow-400',
    icon: 'text-yellow-400',
    text: 'text-yellow-800 dark:text-yellow-500',
    progress: 'bg-yellow-400',
  },
  info: {
    bar: 'bg-blue-50 dark:bg-gray-800 dark:text-blue-400',
    floatingBar: 'bg-white dark:bg-gray-800 dark:text-blue-400',
    accent: 'border-l-blue-400',
    icon: 'text-blue-400',
    text: 'text-blue-800 dark:text-blue-500',
    progress: 'bg-blue-400',
  },
};
const classes = computed(() => severityClasses[severity]);

const teleportTarget = computed(() => {
  const outlet = sticky ? outlets.sticky : fixed ? outlets.fixed : outlets.main;
  return `[data-message-outlet='${outlet}']`;
});

// Fixed bars fly in from the right; in-flow bars slide down into place.
const hiddenClass = computed(() =>
  fixed ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-y-2',
);

// The auto-close countdown doubles as the progress indicator: the bar's width
// animates to 100% over `closeIn` milliseconds, and finishing closes the message.
const { currentTime, pause, play } = useAnimate(
  progressElement,
  { width: '100%' },
  {
    duration: closeIn,
    persist: true,
    immediate: !!closeIn,
    onReady: (animation) => {
      animation.onfinish = () => close();
    },
  },
);
const percentageComplete = computed(() =>
  closeIn ? ((currentTime.value as number) / closeIn) * 100 : 0,
);

// Hovering pauses the countdown so the visitor gets time to read.
useEventListener(barElement, 'mouseenter', () => closeIn && pause(), { passive: true });
useEventListener(barElement, 'mouseleave', () => closeIn && play(), { passive: true });

const messageId = registerMessage?.(outlets.main, { severity, description, fixed });

function click(event?: MouseEvent) {
  emit('click');
  if (closeOnClick)
    close(event);
}

function close(event?: MouseEvent) {
  if (!isClosable)
    return;
  const target = event?.target as HTMLElement | undefined;
  // A link or button inside the bar performs its own action; don't also dismiss.
  if (target?.closest('a') || target?.closest('button'))
    return;
  dismissed.value = true;
}

// The close is announced once the leave transition finished, so listeners don't
// react while the bar is still animating out.
let closeNotified = false;
function notifyClosed() {
  if (closeNotified)
    return;
  closeNotified = true;
  emit('close');
  if (messageId)
    unregisterMessage?.(messageId);
}

onUnmounted(notifyClosed);
</script>

<template>
  <Teleport :to="teleportTarget" :disabled="!teleport" defer>
    <Transition
      enterActiveClass="transition duration-200 ease-out"
      leaveActiveClass="transition duration-150 ease-in"
      :enterFromClass="hiddenClass"
      :leaveToClass="hiddenClass"
      @afterLeave="notifyClosed"
    >
      <div
        v-if="!dismissed && !closed"
        v-bind="$attrs"
        ref="barElement"
        role="alert"
        :data-testid="`${baseDataTestid}-card`"
        class="pointer-events-auto relative mb-1 w-full overflow-hidden"
        :class="[
          fixed ? classes.floatingBar : classes.bar,
          fixed && `mb-3 max-w-md rounded-lg border-l-4 border-e border-t border-black/5 shadow-lg dark:border-white/5 ${classes.accent}`,
          isClosable && closeOnClick && 'cursor-pointer',
        ]"
        @click="click($event)"
      >
        <div class="p-4">
          <div class="flex items-start gap-4">
            <CheckCircleIcon
              v-if="severity === 'success'"
              class="size-6 shrink-0"
              :class="classes.icon"
            />
            <XCircleIcon
              v-if="severity === 'error'"
              class="size-6 shrink-0"
              :class="classes.icon"
            />
            <ExclamationTriangleIcon
              v-if="severity === 'warning'"
              class="size-6 shrink-0"
              :class="classes.icon"
            />
            <InformationCircleIcon
              v-if="severity === 'info'"
              class="size-6 shrink-0"
              :class="classes.icon"
            />
            <div
              class="my-auto flex max-h-48 grow flex-col gap-1 overflow-y-auto text-sm"
              :data-testid="`${baseDataTestid}-content-value`"
            >
              <slot>
                <p v-if="description" class="font-medium" :class="classes.text">
                  {{ description }}
                </p>
                <ul v-if="details?.length" class="flex list-['-_'] flex-col gap-1 ps-3">
                  <li
                    v-for="({ label, values, indent }, index) in details"
                    :key="index"
                    :class="{ 'ms-5': indent }"
                  >
                    <!-- A field with several messages gets them as a nested list;
                         a single message stays on the field's own line. -->
                    <template v-if="values.length > 1">
                      <span v-if="label">{{ label }}:</span>
                      <ul class="flex list-['-_'] flex-col gap-1 ps-3">
                        <li v-for="value in values" :key="value">
                          {{ value }}
                        </li>
                      </ul>
                    </template>
                    <div v-else class="flex flex-wrap">
                      <span v-if="label" class="me-1">{{ label }}:</span>
                      <span class="grow">{{ values[0] }}</span>
                    </div>
                  </li>
                </ul>
              </slot>
            </div>
            <div v-if="isClosable" class="flex">
              <button
                type="button"
                :aria-label="$t('messageBar.close')"
                class="flex size-6 cursor-pointer rounded-lg text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                :data-testid="`${baseDataTestid}-close-button`"
                @click="close()"
              >
                <XMarkIcon class="m-auto size-5" />
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="closeIn"
          ref="progressElement"
          role="progressbar"
          class="h-0.5 w-0"
          :class="classes.progress"
          :aria-valuenow="percentageComplete"
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </Transition>
  </Teleport>
</template>
