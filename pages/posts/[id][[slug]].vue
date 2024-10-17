<script lang="ts" setup>
import type { Config } from "~/types/Config";
import type { Post } from "~/types/Post";

const config = useState<Config>("config");
const { id } = useRoute().params as { id: string; slug: string };

const setPost = (post: Post) => {
  if (!post) return;
  useSeoMeta({
    title: post.title,
    ogTitle: post.title,
    description: post.description,
    ogDescription: post.description,
    ogImage: post.imgCoverUrl,
    ogImageAlt: post.title,
  });
};
</script>
<template>
  <div class="prose mx-auto" itemscope itemtype="https://schema.org/Blog">
    <PostsContext :id="id" @load="setPost">
      <template #post="{ post }">
        <AuthorsContext :userName="post.author">
          <template #author="{ author }">
            <BlogPost
              :post="post"
              :author="author"
              :baseUrl="config?.baseUrl"
            />
          </template>
        </AuthorsContext>
      </template>
    </PostsContext>
  </div>
</template>
