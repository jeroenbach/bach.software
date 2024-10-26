import { describe, expect, it, vi } from "vitest";
import PostsContext from "~/contexts/BlogPostsContext.vue";
import { mount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mock = vi.hoisted(() => ({
  useAsyncData: vi.fn(),
  queryContent: vi.fn(() => ({
    only: mock.only,
    where: mock.where,
    find: mock.find,
  })),
  only: vi.fn(),
  where: vi.fn(),
  find: vi.fn(),
}));

mockNuxtImport("queryContent", () => mock.queryContent);

describe("PostsContext", () => {
  it("should render Context (not working for now)", async () => {
    const TestComponent = defineComponent({
      components: { PostsContext },
      template: "<Suspense><PostsContext/></Suspense>",
    });
    const w = mount(TestComponent);
    expect(mock.queryContent).toBeCalledWith("posts");
  });
});
