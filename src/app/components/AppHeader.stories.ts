import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import AppHeader from './AppHeader.vue';
import SearchButton from './SearchButton.vue';
import SearchModal from './SearchModal.vue';

const meta = {
  title: 'Components/Header',
  component: AppHeader,
  args: {
    navigation: [{ label: 'Blog', to: '#' }],
    colorMode: 'system',
  },
  render: args => ({
    components: { AppHeader, SearchButton, SearchModal },
    setup() {
      const colorMode = ref('system');
      const searchOpen = ref(false);
      const searchQuery = ref('');
      return { args, colorMode, searchOpen, searchQuery };
    },
    template: `<AppHeader v-bind="args" v-model="colorMode">
      <template #searchButton>
        <SearchButton @click="searchOpen = true" />
      </template>
      <template #searchModal>
        <SearchModal
          :open="searchOpen"
          :query="searchQuery"
          @update:query="searchQuery = $event"
          @close="searchOpen = false"
        />
      </template>
    </AppHeader>`,
  }),
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
