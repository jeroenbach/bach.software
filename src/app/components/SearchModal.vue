<script lang="ts" setup>
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';

interface SearchResult {
  url: string
  meta?: { title?: string }
  excerpt: string
}

interface Props {
  open: boolean
  query: string
  results?: SearchResult[]
  loading?: boolean
  unavailable?: boolean
}

const { results = [], loading = false, unavailable = false } = defineProps<Props>();
const emits = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'close'): void
}>();

function close() {
  emits('close');
}
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="duration-150 ease-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto px-4 pt-[10vh]">
        <TransitionChild
          as="template"
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel class="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10">
            <div class="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
              <MagnifyingGlassIcon class="size-5 shrink-0 text-gray-400" aria-hidden="true" />
              <input
                :value="query"
                class="ml-3 h-14 w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
                :placeholder="$t('search.placeholder')"
                type="search"
                autocomplete="off"
                autofocus
                @input="emits('update:query', ($event.target as HTMLInputElement).value)"
              >
              <button
                class="ml-2 shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                :aria-label="$t('search.close')"
                @click="close"
              >
                <XMarkIcon class="size-5" />
              </button>
            </div>

            <ul v-if="results.length" class="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
              <li v-for="result in results" :key="result.url">
                <NuxtLink
                  :to="result.url"
                  class="flex flex-col px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                  @click="close"
                >
                  <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ result.meta?.title ?? result.url }}
                  </span>
                  <!-- result.excerpt contains <mark> tags from pagefind for keyword highlighting -->
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span class="search-excerpt mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400" v-html="result.excerpt" />
                </NuxtLink>
              </li>
            </ul>

            <p v-else-if="unavailable" class="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              {{ $t('search.unavailable') }}
            </p>
            <p v-else-if="loading" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {{ $t('search.loading') }}
            </p>
            <p v-else-if="query && !loading" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {{ $t('search.noResults') }}
            </p>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
/* Style pagefind's <mark> highlight tags inside v-html content */
:deep(.search-excerpt mark) {
  background-color: transparent;
  color: inherit;
  font-weight: 600;
}
</style>
