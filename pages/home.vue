<script lang="ts" setup>
useHeadSafe({
  title: "Home",
  meta: [
    {
      name: "description",
      content: "Welcome to the home page",
    },
  ],
});

const people = [
  {
    name: "Calvin Hawkins",
    email: "calvin.hawkins@example.com",
    image:
      "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Kristen Ramos",
    email: "kristen.ramos@example.com",
    image:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Ted Fox",
    email: "ted.fox@example.com",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];
</script>
<template>
  <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
    <div class="hidden sm:mb-8 sm:flex sm:justify-center">
      <div
        class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
      >
        Announcing our next round of funding.
        <a href="#" class="font-semibold text-indigo-600"
          ><span class="absolute inset-0" aria-hidden="true" />Read more
          <span aria-hidden="true">&rarr;</span></a
        >
      </div>
    </div>
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Data to enrich your online business
      </h1>
      <p class="mt-6 text-lg leading-8 text-gray-600">
        Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem
        cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="#"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >Get started</a
        >
        <a href="#" class="text-sm font-semibold leading-6 text-gray-900"
          >Learn more <span aria-hidden="true">→</span></a
        >
      </div>
    </div>
  </div>

  <div>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
    <ul class="divide-y divide-gray-200">
      <li v-for="person in people" :key="person.email" class="flex py-4">
        <img class="h-10 w-10 rounded-full" :src="person.image" alt="" />
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">{{ person.name }}</p>
          <p class="text-sm text-gray-500">{{ person.email }}</p>
        </div>
      </li>
    </ul>
  </div>
  <blockquote class="text-center text-2xl font-semibold italic text-slate-900">
    When you look
    <span class="relative">
      <span
        class="absolute -inset-1 block -skew-y-3 bg-pink-500"
        aria-hidden="true"
      ></span>
      <span class="relative text-white">annoyed</span>
    </span>
    all the time, people think that you're busy.
  </blockquote>

  <div
    class="mx-auto max-w-md overflow-hidden rounded-xl shadow-md md:max-w-2xl"
  >
    <div class="md:flex">
      <div class="md:shrink-0">
        <img
          class="h-48 w-full object-cover md:h-full md:w-48"
          src="~/assets/img/building.jpg"
          alt="Modern building architecture"
        />
      </div>
      <div class="p-8">
        <div
          class="text-sm font-semibold uppercase tracking-wide text-indigo-500"
        >
          Company retreats
        </div>
        <a
          href="#"
          class="mt-1 block text-lg font-medium leading-tight text-black hover:underline"
          >Incredible accommodation for your team</a
        >
        <p class="mt-2 text-slate-500">
          Looking to take your team away on a retreat to enjoy awesome food and
          take in some sunshine? We have a list of places to do just that.
        </p>
      </div>
    </div>
  </div>

  <div class="columns-3">
    asdfasdfasdfasdfasdfasdfasdfasdfasdf asdfasdfasdfasdfasdfasdfasdfasdfasdf
  </div>
</template>
