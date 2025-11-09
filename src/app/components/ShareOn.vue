<script lang="ts" setup>
type Icon = 'X' | 'Linkedin' | 'Whatsapp' | 'Email';
interface Setting {
  url: string
}
interface Props {
  url: string
  text?: string
  icons?: Icon[]
}
const {
  url,
  text = '',
  icons = ['X', 'Linkedin', 'Whatsapp', 'Email'],
} = defineProps<Props>();
const urlEncoded = encodeURIComponent(url);
const textEncoded = encodeURIComponent(text ?? '');
const properties = computed<{ [key in Icon]?: Setting }>(() => ({
  X: {
    url: `https://twitter.com/intent/tweet?url=${urlEncoded}&text=${textEncoded}`,
  },
  Linkedin: {
    url: `https://www.linkedIn.com/shareArticle?mini=true&url=${urlEncoded}&title=${textEncoded}&summary=${textEncoded}&source=${urlEncoded}`,
  },
  Whatsapp: {
    url: `https://wa.me/?text=${urlEncoded}%20${textEncoded}`,
  },
  Email: {
    url: `mailto:?subject=${textEncoded}&body=${urlEncoded}`,
  },
}));
</script>

<template>
  <div class="sharing-buttons flex flex-wrap gap-1">
    <AppLink
      v-for="icon in icons"
      :key="icon"
      class="ease inline-flex items-center rounded-full border-sky-600 bg-linear-to-r from-sky-600 to-sky-500 p-2 text-white transition duration-200 hover:from-sky-700 hover:to-sky-600"
      target="_blank"
      :to="properties[icon]?.url"
      :aria-label="`Share on ${icon}`"
    >
      <AppIcon :icon="icon" class="size-3" />
    </AppLink>
  </div>
</template>
