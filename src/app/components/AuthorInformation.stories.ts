import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AuthorInformation from './AuthorInformation.vue';

const meta = {
  title: 'Components/AuthorInformation',
  component: AuthorInformation,
  args: {
    fullName: 'Jeroen Bach',
    role: 'Software Engineer & Team Lead',
    imageUrl: '/JEROEN-4238-SQUARE.jpeg',
    homePage: 'https://bach.software',
    linkedIn: 'https://www.linkedin.com/in/jeroenbach/',
  },
} satisfies Meta<typeof AuthorInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutImage: Story = {
  args: {
    imageUrl: undefined,
  },
};

export const WithoutLinkedIn: Story = {
  args: {
    linkedIn: undefined,
  },
};

export const WithoutRole: Story = {
  args: {
    role: undefined,
  },
};

export const WithSlots: Story = {
  render: args => ({
    components: { AuthorInformation },
    setup() {
      return { args };
    },
    template: `<AuthorInformation v-bind="args">
      <template #topLine>Written by Jeroen Bach</template>
      <template #bottomLine>Published on Nov 5, 2024</template>
    </AuthorInformation>`,
  }),
};

export const LongName: Story = {
  args: {
    fullName: 'Alexandria Wilhelmina van der Heijden-Oosterhuis de Bruijn',
    role: 'Principal Software Engineer, Architecture & Technical Leadership',
  },
  render: args => ({
    components: { AuthorInformation },
    setup() {
      return { args };
    },
    template: `<div class="w-72"><AuthorInformation v-bind="args" /></div>`,
  }),
};
