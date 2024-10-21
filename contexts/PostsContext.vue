<script
  lang="ts"
  setup
  generic="
    TSummary extends true | false | undefined,
    TSingle extends string | undefined
  "
>
import type { PostSummary, Post } from "~/types/Post";
import { createSlug } from "~/utils/url";

type TPost = undefined extends TSummary
  ? Post
  : TSummary extends true
    ? PostSummary
    : Post;
type TPostSingleOrMultiple = undefined extends TSingle ? TPost[] : TPost;

interface Props {
  id?: TSingle;
  summary?: TSummary;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "load", posts: TPostSingleOrMultiple): void;
}>();

const uniqueId = computed(() => `postsContext-${props.id}-${props.summary}`);

const { data: posts } = await useAsyncData<TPost[]>(
  uniqueId.value,
  async () => {
    const query = isFalseOrUndefined(props.summary)
      ? queryContent<Post>("posts")
      : queryContent<PostSummary>("posts").only([
          "slug",
          "title",
          "description",
          "category",
          "author",
          "datePublished",
          "dateModified",
          "imgCoverUrl",
          "readTime",
          "_path",
          "excerpt",
        ]);

    if (props.id) {
      query.where({ _path: { $eq: `/posts/${props.id}` } });
    }

    const raw = await query.find();
    const createPostSlug = (slug?: string, title?: string) =>
      slug ?? createSlug(title);
    const posts = raw.map((p) => ({
      ...p,
      url: `${p._path}-${createPostSlug(p.slug, p.title)}`,
    }));

    return posts as TPost[];
  },
);

// Added a watch, to make sure SSR also works
watch(
  posts,
  (p) =>
    p && props.id
      ? emit("load", p[0] as TPostSingleOrMultiple)
      : emit("load", p as TPostSingleOrMultiple),
  { immediate: true },
);
</script>
<template>
  <slot :posts="posts" />
  <slot name="post" v-for="post in posts" :key="post.slug" :post="post" />
</template>
