<script lang="ts" setup>
import PostsContext from "~/contexts/PostsContext.vue";
import AuthorsContext from "~/contexts/AuthorsContext.vue";
</script>
<template>
  <div class="py-6 sm:py-12">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:mx-0">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          From the blog
        </h2>
        <p class="mt-2 text-lg leading-8 text-gray-600">
          Learn how to grow your business with our expert advice.
        </p>
      </div>
      <div
        class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none"
      >
        <PostsContext summary>
          <template #post="{ post }">
            <AuthorsContext :userName="post.author">
              <template #author="{ author }">
                <article class="flex flex-col items-start gap-8 lg:flex-row">
                  <div class="w-full lg:w-64">
                    <NuxtLink :to="post.url">
                      <NuxtPicture
                        :src="post.imgCoverUrl"
                        :alt="post.title"
                        sizes="sm:640px, lg:256px"
                        :imgAttrs="{
                          class:
                            'aspect-16/9 sm:aspect-2/1 lg:aspect-1/1 w-full rounded-2xl bg-slate-200 object-cover',
                        }"
                      />
                    </NuxtLink>
                  </div>
                  <div
                    class="flex max-w-xl flex-col items-start justify-between"
                  >
                    <div class="flex items-center gap-x-4 text-xs">
                      <time :datetime="post.date" class="text-gray-500"
                        >{{ formatDate(post.date) }}
                      </time>
                      <NuxtLink
                        :to="`/posts?category=${post.category}`"
                        class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                        >{{ post.category }}</NuxtLink
                      >
                    </div>
                    <div class="group relative max-w-xl">
                      <NuxtLink :to="post.url">
                        <h3
                          class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600"
                        >
                          <span class="absolute inset-0" />
                          {{ post.title }}
                        </h3>
                        <ContentRenderer
                          :value="post"
                          :excerpt="true"
                          class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600"
                        />
                      </NuxtLink>
                    </div>
                    <div class="relative mt-8 flex items-center gap-x-4">
                      <NuxtPicture
                        :src="author.imageUrl"
                        sizes="50px"
                        :alt="author.fullName"
                        :imgAttrs="{
                          class: 'h-10 w-10 rounded-full bg-gray-50',
                        }"
                      />
                      <div class="text-sm leading-6">
                        <p class="font-semibold text-gray-900">
                          <NuxtLink
                            class="text-sky-600 hover:text-sky-800 dark:text-sky-500 dark:hover:text-sky-300"
                            :to="author.linkedin"
                          >
                            <span class="absolute inset-0" />
                            {{ author.fullName }}
                          </NuxtLink>
                        </p>
                        <p class="text-gray-600">{{ author.role }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </template>
            </AuthorsContext>
          </template>
        </PostsContext>
      </div>
    </div>
  </div>
</template>
