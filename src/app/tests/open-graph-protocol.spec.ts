import { test, expect, type Page } from "@playwright/test";

const getMetadataProperty = async (page: Page, name: string) => {
  return await page
    .locator(`head > meta[property="${name}"]`)
    .getAttribute("content");
};
const getMetadataName = async (page: Page, name: string) => {
  return await page
    .locator(`head > meta[name="${name}"]`)
    .getAttribute("content");
};

test.describe("Open Graph Protocol Tests", () => {
  test("Blog metadata for sharing", async ({ page }) => {
    await page.goto("/posts");

    await expect(page).toHaveTitle("Bach.Software - Bach.Software");
    expect(await getMetadataProperty(page, "og:title")).toBe("Bach.Software");
    expect(await getMetadataName(page, "description")).toBe(
      "Jeroen Bach is a Freelance Software Engineer, focussed on full stack development and on helping people write better code.",
    );
    expect(await getMetadataProperty(page, "og:description")).toBe(
      "Jeroen Bach is a Freelance Software Engineer, focussed on full stack development and on helping people write better code.",
    );
    expect(await getMetadataProperty(page, "og:url")).toBe(
      "https://bach.software/posts",
    );
    expect(await getMetadataProperty(page, "og:image")).toBe(
      "https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-4238-SQUARE.jpeg",
    );
    expect(await getMetadataProperty(page, "og:image:alt")).toBe("Jeroen Bach");
  });

  test("BlogPost metadata for sharing", async ({ page }) => {
    await page.goto(
      "/posts/1-mastering-conditional-property-types-with-vue-3_3-generics",
    );

    await expect(page).toHaveTitle(
      "Mastering Conditional Property Types with Vue 3.3 Generics - Bach.Software",
    );
    expect(await getMetadataProperty(page, "og:title")).toBe(
      "Mastering Conditional Property Types with Vue 3.3 Generics",
    );
    expect(await getMetadataName(page, "description")).toBe(
      "Learn how to leverage Vue 3.3 generics to dynamically adjust property types based on other property values, making components more flexible and reusable.",
    );
    expect(await getMetadataProperty(page, "og:description")).toBe(
      "Learn how to leverage Vue 3.3 generics to dynamically adjust property types based on other property values, making components more flexible and reusable.",
    );
    expect(await getMetadataProperty(page, "og:url")).toBe(
      "https://bach.software/posts/1-mastering-conditional-property-types-with-vue-3_3-generics",
    );
    expect(await getMetadataProperty(page, "og:image")).toBe(
      "https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg",
    );
    expect(await getMetadataProperty(page, "og:image:alt")).toBe(
      "Mastering Conditional Property Types with Vue 3.3 Generics",
    );
  });
});
