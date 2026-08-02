<script lang="ts" setup>
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { computed, nextTick, ref, watch } from 'vue';

interface SearchSubResult {
  url: string
  title: string
  excerpt: string
}

interface SearchResult {
  url: string
  meta?: { title?: string }
  excerpt: string
  sub_results?: SearchSubResult[]
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

// Pagefind's first sub-result is usually just the page's own top section
// (duplicating the main result), so drop it when present and cap the rest —
// otherwise a long post could push several anchors into the results list.
function subResultsFor(result: SearchResult): SearchSubResult[] {
  const subResults = result.sub_results ?? [];
  const [first] = subResults;
  const rest = first?.url === result.url ? subResults.slice(1) : subResults;
  return rest.slice(0, 3);
}

// Keyboard navigation: results and their visible sub-results form one flat
// list in visual order; ↑/↓ move the highlight (wrapping), Enter opens it.
// Focus stays in the input the whole time, like Algolia DocSearch.
const activeIndex = ref(0);

const resultOffsets = computed(() => {
  let next = 0;
  return results.map((result) => {
    const offset = next;
    next += 1 + subResultsFor(result).length;
    return offset;
  });
});

const itemCount = computed(() =>
  results.reduce((count, result) => count + 1 + subResultsFor(result).length, 0),
);

watch(() => results, () => {
  activeIndex.value = 0;
});

function setActive(index: number) {
  activeIndex.value = index;
  nextTick(() => {
    document.getElementById(`search-result-${index}`)?.scrollIntoView({ block: 'nearest' });
  });
}

function onKeydown(event: KeyboardEvent) {
  if (!itemCount.value) {
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setActive((activeIndex.value + 1) % itemCount.value);
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault();
    setActive((activeIndex.value - 1 + itemCount.value) % itemCount.value);
  }
  else if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById(`search-result-${activeIndex.value}`)?.click();
  }
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
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                :aria-activedescendant="itemCount ? `search-result-${activeIndex}` : undefined"
                @input="emits('update:query', ($event.target as HTMLInputElement).value)"
                @keydown="onKeydown"
              >
              <button
                class="ml-2 shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                :aria-label="$t('search.close')"
                @click="close"
              >
                <XMarkIcon class="size-5" />
              </button>
            </div>

            <ul v-if="results.length" id="search-results" class="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
              <li v-for="(result, resultIndex) in results" :key="result.url">
                <NuxtLink
                  :id="`search-result-${resultOffsets[resultIndex]}`"
                  :to="result.url"
                  class="flex flex-col px-4 py-3 transition-colors"
                  :class="{ 'bg-gray-50 dark:bg-slate-800': activeIndex === resultOffsets[resultIndex] }"
                  @click="close"
                  @mouseenter="activeIndex = resultOffsets[resultIndex]!"
                >
                  <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ result.meta?.title ?? result.url }}
                  </span>
                  <!-- result.excerpt contains <mark> tags from pagefind for keyword highlighting -->
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span class="search-excerpt mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400" v-html="result.excerpt" />
                </NuxtLink>
                <ul v-if="subResultsFor(result).length" class="ml-4 border-l border-gray-100 pl-3 dark:border-gray-800">
                  <li v-for="(subResult, subIndex) in subResultsFor(result)" :key="subResult.url">
                    <NuxtLink
                      :id="`search-result-${resultOffsets[resultIndex]! + 1 + subIndex}`"
                      :to="subResult.url"
                      class="flex flex-col px-2 py-2 transition-colors"
                      :class="{ 'bg-gray-50 dark:bg-slate-800': activeIndex === resultOffsets[resultIndex]! + 1 + subIndex }"
                      @click="close"
                      @mouseenter="activeIndex = resultOffsets[resultIndex]! + 1 + subIndex"
                    >
                      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {{ subResult.title }}
                      </span>
                      <!-- subResult.excerpt contains <mark> tags from pagefind for keyword highlighting -->
                      <!-- eslint-disable-next-line vue/no-v-html -->
                      <span class="search-excerpt mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400" v-html="subResult.excerpt" />
                    </NuxtLink>
                  </li>
                </ul>
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
/* Hide the browser's native clear button on type="search" inputs —
   the modal already has its own close/clear button next to the input */
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

/* Style pagefind's <mark> highlight tags inside v-html content */
:deep(.search-excerpt mark) {
  background-color: transparent;
  color: inherit;
  font-weight: 600;
}
</style>
