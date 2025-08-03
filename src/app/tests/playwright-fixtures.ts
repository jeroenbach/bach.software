import { test as base } from "@playwright/test";
export { expect } from "@playwright/test";

type ComponentFixture = {
  storybookUrl: string;
};

export const test = base.extend<ComponentFixture>({
  storybookUrl: async ({ page: _ }, use) => {
    const url = process.env.STORYBOOK_URL || "http://localhost:6006";
    await use(url);
  },
});
