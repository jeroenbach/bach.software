<script
  lang="ts"
  setup
  generic="
    TSummary extends true | false | undefined,
    TSingle extends string | undefined
  "
>
import type { PostSummary as _PostSummary, Post as _Post } from "~/types/Post";
import slugify from "slugify";

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

const { data: posts } = await useAsyncData<TPost[]>("posts", async () => {
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
  const createSlug = (slug?: string, title?: string) =>
    slug ?? slugify(title ?? "", { lower: true });
  const posts = raw.map((p) => ({
    ...p,
    url: `${p._path}-${createSlug(p.slug, p.title)}`,
  }));

  if (props.id) emit("load", posts[0] as TPostSingleOrMultiple);
  else emit("load", posts as TPostSingleOrMultiple);

  return posts as TPost[];
});
</script>
<template>
  <slot :posts="posts"> </slot>
  <slot name="post" v-for="post in posts" :key="post.slug" :post="post">
    <pre>{{ post }}</pre>
  </slot>
</template>
