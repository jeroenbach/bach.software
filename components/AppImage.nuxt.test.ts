import { describe, expect, it } from "vitest";
import * as stories from "./AppImage.stories";
import AppImage from "./AppImage.vue";
import { find, mountStory } from "~/utils/test";

describe("AppImage", () => {
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
    expect(img.attributes("class")).toBe("w-full bg-slate-200 object-cover");
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

  it.only("should calculate only the sizes that are specified", async () => {
    const attr = async (override: stories.Story["args"]) =>
      mountStory(stories.DifferentScreenSizesAndRatios, override).vm.imgSizes;
    // const sizes = (remove?: number, defaultSize?: number = 341) =>
    //   [
    //     "(max-width: 640px) 640px",
    //     "(max-width: 768px) 384px",
    //     "(max-width: 1024px) 341px",
    //     "(max-width: 1280px) 320px",
    //     "(max-width: 1536px) 307px",
    //     `${defaultSize}px`,
    //   ]
    //     .filter((_, i) => i !== remove)
    //     .join(", ");

    // expect(await attr({ partOfScreenExtraSmall: undefined })).toBe(sizes(0));
    // expect(await attr({ partOfScreenSmall: undefined })).toBe(sizes(1));
    expect(await attr({ partOfScreenMedium: undefined })).toBe(sizes(1));
    expect(await attr({ partOfScreenLarge: undefined })).toBe(sizes(2));
    expect(await attr({ partOfScreenExtraLarge: undefined })).toBe(sizes(3));
    expect(await attr({ partOfScreen2ExtraLarge: undefined })).toBe(
      sizes(4, 307),
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
