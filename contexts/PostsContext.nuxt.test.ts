import { describe, expect, it } from "vitest";
import PostsContext from "~/contexts/PostsContext.vue";
import { mount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";

describe("PostsContext", () => {
  it("should render Context (not working for now)", async () => {
    const TestComponent = defineComponent({
      components: { PostsContext },
      template: "<Suspense><PostsContext/></Suspense>",
    });
    const w = mount(TestComponent);
    await flushPromises();
    await nextTick();
    await nextTick();
    await nextTick();
    await nextTick();
    await nextTick();
    await nextTick();
    expect(w.html()).toBe("");
  });
});
