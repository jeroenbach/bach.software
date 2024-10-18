import { describe, expect, it } from "vitest";
import { buildPost } from "~/components/__tests__/postBuilder";

describe("getMetadataImageUrl", () => {
  it("should render the correct full url of an image", async () => {
    expect(getMetadataImageUrl("/test.jpeg", "https://bach.software")).toBe(
      "https://bach.software/_ipx/w_1024&f_jpeg&q_80/test.jpeg",
    );
  });

  it("should not have extra slashes", async () => {
    expect(getMetadataImageUrl("//test.jpeg", "https://bach.software/")).toBe(
      "https://bach.software/_ipx/w_1024&f_jpeg&q_80/test.jpeg",
    );
    expect(
      getMetadataImageUrl("asdf/d//test.jpeg", "https://bach.software//"),
    ).toBe("https://bach.software/_ipx/w_1024&f_jpeg&q_80/asdf/d/test.jpeg");
  });
});

describe("createArticleMetadata", () => {
  const baseUrl = "https://bach.software";
  it("should render the correct structured data", async () => {
    const post = buildPost();
    expect(createArticleMetadata(baseUrl, buildPost())).toEqual({});
  });
});
