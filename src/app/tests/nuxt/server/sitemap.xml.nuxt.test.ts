import { $fetch, setup, url } from '@nuxt/test-utils/e2e';
import { describe, expect, it, vi } from 'vitest';

describe('sitemap.xml', async () => {
  await setup({
    server: true,
  });
  it('should generate a sitemap', async () => {
    const sitemap = await $fetch(url('/sitemap.xml'));

    expect(sitemap).toBe(true);
  });
});
