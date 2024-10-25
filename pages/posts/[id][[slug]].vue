<script lang="ts" setup>
import type { Author } from "~/types/Author";
import type { Post } from "~/types/Post";

const { company, config } = useBlogMetadata();
const { id } = useRoute().params as { id: string; slug: string };
const _post = ref<Post>();
const _author = ref<Author>();

useMetadata(
  () =>
    _post.value && {
      baseUrl: config.value.baseUrl,
      title: _post.value.title,
      description: _post.value.description,
      imageUrl: _post.value.imgCoverUrl,
      imageAlt: _post.value.title,
      url: _post.value.url,
      structuredData:
        _author.value &&
        createBlogPostingMetadataContext(
          config.value.baseUrl,
          _post.value,
          _author.value,
          company,
        ),
    },
);
</script>
<template>
  <PageContent>
    <PostsContext :id="id" @load="(p) => (_post = p)">
      <template #post="{ post }">
        <AuthorsContext :userName="post.author" @load="(a) => (_author = a)">
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
  </PageContent>
</template>
