<script
  lang="ts"
  setup
  generic="
    TSummary extends true | false | undefined,
    TSingle extends string | undefined
  "
>
import type { PostSummary as _PostSummary, Post as _Post } from "~/types/Post";
import { createSlug } from "~/utils/slug";

export interface Post extends _Post {
  url: string;
}

export interface PostSummary extends Omit<_PostSummary, "_path"> {
  url: string;
}

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
      ? queryContent<_Post>("posts")
      : queryContent<_PostSummary>("posts").only([
          "slug",
          "title",
          "description",
          "category",
          "author",
          "date",
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
  <slot :posts="posts"> </slot>
  <slot name="post" v-for="post in posts" :key="post.slug" :post="post">
    <pre>{{ post }}</pre>
  </slot>
</template>
