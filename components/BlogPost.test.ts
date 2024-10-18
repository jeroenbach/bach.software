import { describe, expect, it } from "vitest";
import * as stories from "./BlogPost.stories";
import BlogPost from "./BlogPost.vue";
import { mountStory } from "~/utils/test";

describe("BlogPost", () => {
  it("should render alt", async () => {
    const w = mountStory(stories.Default);
    expect(w.html()).toBe("");
  });
});
