<script lang="ts" setup>
import type { Config } from "~/types/Config";
import type { Post } from "~/types/Post";

const config = useState<Config>("config");
const { id } = useRoute().params as { id: string; slug: string };
const _post = ref<Post | null>(null);

useMetadata(() => ({
  title: _post.value?.title,
  description: _post.value?.description,
  imageUrl: _post.value?.imgCoverUrl,
  imageAlt: _post.value?.title,
  structuredData: createArticleMetadata(config.value?.baseUrl, _post.value),
}));
</script>
<template>
  <div class="prose mx-auto" itemscope itemtype="https://schema.org/Blog">
    <PostsContext :id="id" @load="(p) => (_post = p)">
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
