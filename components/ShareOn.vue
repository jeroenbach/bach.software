<script lang="ts" setup>
type Icon = "X" | "Linkedin" | "Whatsapp" | "Email";
type Setting = {
  viewBox: string;
  url: string;
};
interface Props {
  url: string;
  text?: string;
  icons?: Icon[];
}
const props = withDefaults(defineProps<Props>(), {
  icons: () => ["X", "Linkedin", "Whatsapp", "Email"],
});
const urlEncoded = encodeURIComponent(props.url);
const textEncoded = encodeURIComponent(props.text ?? "");
const properties = computed<{ [key in Icon]?: Setting }>(() => ({
  X: {
    url: `https://twitter.com/intent/tweet?url=${urlEncoded}&text=${textEncoded}`,
    viewBox: "0 0 1200 1227",
  },
  Linkedin: {
    url: `https://www.linkedIn.com/shareArticle?mini=true&url=${urlEncoded}&title=${textEncoded}&summary=${textEncoded}&source=${urlEncoded}`,
    viewBox: "0 0 512 512",
  },
  Whatsapp: {
    url: `https://wa.me/?text=${urlEncoded}%20${textEncoded}`,
    viewBox: "0 0 512 512",
  },
  Email: {
    url: `mailto:?subject=${textEncoded}&body=${urlEncoded}`,
    viewBox: "0 0 512 512",
  },
}));
</script>
<template>
  <div class="sharing-buttons flex flex-wrap">
    <a
      v-for="icon in icons"
      class="ease mr-1 inline-flex items-center rounded-full border-sky-600 bg-gradient-to-r from-sky-600 to-sky-500 p-2 text-white transition duration-200 hover:from-sky-700 hover:to-sky-600"
      target="_blank"
      rel="noopener"
      :href="properties[icon]?.url"
      :aria-label="`Share on ${icon}`"
    >
      <svg
        aria-hidden="true"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="properties[icon]?.viewBox"
        class="size-3"
      >
        <title>{{ icon }}</title>
        <path
          v-if="icon === 'X'"
          d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
          fill="white"
        />
        <path
          v-if="icon === 'Linkedin'"
          d="M136 183v283H42V183h94zm6-88c1 27-20 49-53 49-32 0-52-22-52-49 0-28 21-49 53-49s52 21 52 49zm333 208v163h-94V314c0-38-13-64-47-64-26 0-42 18-49 35-2 6-3 14-3 23v158h-94V183h94v41c12-20 34-48 85-48 62 0 108 41 108 127z"
        ></path>
        <path
          v-if="icon === 'Whatsapp'"
          d="M413 97A222 222 0 0 0 64 365L31 480l118-31a224 224 0 0 0 330-195c0-59-25-115-67-157zM256 439c-33 0-66-9-94-26l-7-4-70 18 19-68-4-7a185 185 0 0 1 287-229c34 36 56 82 55 131 1 102-84 185-186 185zm101-138c-5-3-33-17-38-18-5-2-9-3-12 2l-18 22c-3 4-6 4-12 2-32-17-54-30-75-66-6-10 5-10 16-31 2-4 1-7-1-10l-17-41c-4-10-9-9-12-9h-11c-4 0-9 1-15 7-5 5-19 19-19 46s20 54 23 57c2 4 39 60 94 84 36 15 49 17 67 14 11-2 33-14 37-27s5-24 4-26c-2-2-5-4-11-6z"
        ></path>
        <path
          v-if="icon === 'Email'"
          d="M464 64a48 48 0 0 1 29 86L275 314c-11 8-27 8-38 0L19 150a48 48 0 0 1 29-86h416zM218 339c22 17 54 17 76 0l218-163v208c0 35-29 64-64 64H64c-35 0-64-29-64-64V176l218 163z"
        ></path>
      </svg>
    </a>
  </div>
</template>
