import { describe, expect, it } from "vitest";
import * as stories from "./ResponsiveImage.stories";
import ResponsiveImage from "./ResponsiveImage.vue";
import { find, mountStory } from "~/utils/test";

describe("ResponsiveImage", () => {
  it("should have the same html output", async () => {
    const w = mountStory(stories.Default);
    expect(w.html()).toMatchSnapshot();
  });

  it("should render alt", async () => {
    const w = mountStory(stories.Default);
    const img = await find(w, "img");
    expect(img.attributes("alt")).toBe("alt text");
  });

  it("should render caption", async () => {
    const w = mountStory(stories.Default);
    const caption = await find(w, "figcaption");
    expect(caption.text()).toBe("Figure caption");
  });

  it("should add correct classes to image", async () => {
    const w = mountStory(stories.Default);
    const img = await find(w, "img");
    expect(img.attributes("class")).toBe(
      "w-full aspect-1/1 bg-slate-50 dark:bg-slate-900 object-cover",
    );
  });

  it("should render a placeholder when no image is provided", async () => {
    const w = mountStory(stories.NoImage);
    const placeholder = await find(w, "figure div");
    expect(placeholder.exists()).toBe(true);
    expect(placeholder.attributes("class")).toBe(
      "w-full aspect-1/1 bg-slate-50 dark:bg-slate-900 object-cover",
    );
  });

  it("should render avif & webp", async () => {
    const w = mountStory(stories.Default);
    const sourceAvif = await find(w, "source[type='image/avif']");
    const sourceWebp = await find(w, "source[type='image/webp']");
    const img = await find(w, "img");
    expect(sourceAvif.exists()).toBe(true);
    expect(sourceWebp.exists()).toBe(true);
    expect(img.exists()).toBe(true);
  });

  it("should set correct sizes with default screen sizes", async () => {
    const w = mountStory(stories.Default);
    const img = await find(w, "img");
    expect(img.attributes("sizes")).toBe(
      "(max-width: 640px) 320px, (max-width: 768px) 640px, (max-width: 1024px) 768px, (max-width: 1280px) 1024px, (max-width: 1536px) 1280px, 1536px",
    );
  });

  it("should add only sizes if its specified", async () => {
    const w = mountStory(stories.OneSize);
    const img = await find(w, "img");
    expect(img.attributes("sizes")).toBe("320px");
  });

  it("should calculate the correct ratios for each screen size", async () => {
    const w = mountStory(stories.DifferentScreenSizesAndRatios);
    const img = await find(w, "img");
    expect(img.classes()).toEqual(
      expect.arrayContaining([
        "xs:aspect-1/1",
        "sm:aspect-2/1",
        "md:aspect-16/9",
        "lg:aspect-1/1",
        "xl:aspect-2/1",
        "xxl:aspect-16/9",
      ]),
    );
  });

  it("should calculate the correct sizes for each screen size", async () => {
    const w = mountStory(stories.DifferentScreenSizesAndRatios);
    const img = await find(w, "img");
    expect(img.attributes("sizes")).toEqual(
      [
        "(max-width: 640px) 640px",
        "(max-width: 768px) 384px",
        "(max-width: 1024px) 341px",
        "(max-width: 1280px) 320px",
        "(max-width: 1536px) 307px",
        "341px",
      ].join(", "),
    );
  });

  it("should calculate only the sizes that are specified", async () => {
    const getImgSizes = async (override?: stories.Story["args"]) =>
      (
        (
          await getComponent(
            mountStory(stories.DifferentScreenSizesAndRatios, override),
            ResponsiveImage,
          )
        ).vm as any
      ).imgSizes;

    const sizes = (remove?: number) =>
      ["xs:640px", "sm:384px", "md:341px", "lg:320px", "xl:307px", "xxl:341px"]
        .filter((_, i) => i !== remove)
        .join(" ");

    expect(await getImgSizes({ partOfScreenExtraSmall: undefined })).toBe(
      sizes(0),
    );
    expect(await getImgSizes({ partOfScreenSmall: undefined })).toBe(sizes(1));
    expect(await getImgSizes({ partOfScreenMedium: undefined })).toBe(sizes(2));
    expect(await getImgSizes({ partOfScreenLarge: undefined })).toBe(sizes(3));
    expect(await getImgSizes({ partOfScreenExtraLarge: undefined })).toBe(
      sizes(4),
    );
    expect(await getImgSizes({ partOfScreen2ExtraLarge: undefined })).toBe(
      sizes(5),
    );
  });

  it("should calculate the correct image sizes", async () => {
    const w = mountStory(stories.DifferentScreensSameSizesAndRatios);
    const img = await find(w, "img");
    expect(img.attributes("sizes")).toBe(
      [
        "(max-width: 640px) 640px",
        "(max-width: 768px) 768px",
        "(max-width: 1024px) 1024px",
        "(max-width: 1280px) 1280px",
        "(max-width: 1536px) 1536px",
        "2048px",
      ].join(", "),
    );

    const w2 = mountStory(stories.DifferentScreensSameSizesAndRatios, {
      partOfScreen: 1 / 2,
    });
    const img2 = await find(w2, "img");
    expect(img2.attributes("sizes")).toBe(
      [
        "(max-width: 640px) 320px",
        "(max-width: 768px) 384px",
        "(max-width: 1024px) 512px",
        "(max-width: 1280px) 640px",
        "(max-width: 1536px) 768px",
        "1024px",
      ].join(", "),
    );
  });
});
