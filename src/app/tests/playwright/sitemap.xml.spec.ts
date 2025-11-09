import { expect, test } from '@playwright/test';

test.describe('Sitemap.xml Tests', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium to avoid redundancy and speed up the test suite.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('should be accessible with correct status and content-type', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');

    expect(response?.status()).toBe(200);

    const headers = response?.headers();
    const contentType = Object.entries(headers || {}).find(([key]) =>
      key.toLowerCase() === 'content-type',
    )?.[1];

    expect(contentType).toBeTruthy();
    expect(contentType).toContain('xml');
  });

  test('should contain valid XML structure with proper namespaces', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    // Check XML declaration
    expect(content).toContain('<?xml version="1.0"');

    // Check urlset with proper namespaces
    expect(content).toContain('<urlset');
    expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(content).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(content).toContain('</urlset>');
  });

  test('should contain URL entries with required fields', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    // Check for URL entries
    expect(content).toContain('<url>');
    expect(content).toContain('</url>');
    expect(content).toContain('<loc>');
    expect(content).toContain('<lastmod>');
    expect(content).toContain('<changefreq>monthly</changefreq>');
  });

  test('should contain hreflang links', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    // Check for xhtml:link elements
    expect(content).toContain('xhtml:link');
    expect(content).toContain('hreflang');
    expect(content).toContain('hreflang="x-default"');
  });

  test('should contain valid and properly formed URLs', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    // Extract all URLs
    const urlMatches = content?.match(/<loc>(.*?)<\/loc>/g);
    expect(urlMatches).toBeTruthy();
    expect(urlMatches!.length).toBeGreaterThan(0);

    // Verify each URL is properly formed
    urlMatches?.forEach((urlTag) => {
      const url = urlTag.replace(/<\/?loc>/g, '');
      expect(url).toMatch(/^https?:\/\//);
      expect(url).not.toContain(' ');
    });
  });

  test('should contain expected pages', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    // Check for specific pages (adjust based on your content)
    expect(content).toMatch(/30-about/);
    expect(content).toMatch(/20-portfolio/);
  });

  test('should match the complete sitemap structure', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    // Use snapshot testing - this handles formatting automatically
    expect(content).toMatchSnapshot('sitemap.xml');
  });
});
