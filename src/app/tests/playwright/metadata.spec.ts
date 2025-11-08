import { expect, test } from '@playwright/test';

test.describe('Structured Data Tests', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium to avoid redundancy and speed up the test suite.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('BlogPost JSON-LD should be valid', async ({ page }) => {
    await page.goto(
      `/posts/2-ditching-the-cookie-banners-run-plausible-analytics-on-azure-kubernetes`,
    );

    const jsonLdHandles = await page.$$('script[type="application/ld+json"]');
    for (const handle of jsonLdHandles) {
      const content = await handle.evaluate(el => el.textContent || '');
      const data = JSON.parse(content);

      if (data['@type'] === 'BlogPosting') {
        expect(data).toEqual({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline':
            'Ditching the Cookie Banners: Run Plausible Analytics on Azure Kubernetes',
          'datePublished': '2025-04-06T16:11:24+02:00',
          'dateModified': '2025-10-04T13:00:00+02:00',
          'url': 'https://bach.software/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes',
          'author': {
            '@type': 'Person',
            'name': 'Jeroen Bach',
            'url': 'https://bach.software/pages/about',
            'image': {
              '@type': 'ImageObject',
              'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
              'height': '768',
              'width': '768',
            },
          },
          'publisher': {
            '@type': 'Organization',
            '@id': 'https://bach.software',
            'name': 'Bach.Software',
            'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
          },
          'image': {
            '@type': 'ImageObject',
            'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/2/cover.jpeg',
            'height': '768',
            'width': '768',
          },
          'isAccessibleForFree': true,
          'keywords': ['Kubernetes', 'Azure', 'Plausible.io'],
          'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': [
              'html head title',
              'html head meta[name="description"]',
              'html main article [itemprop="articleBody"]',
            ],
          },
        });
      }
      else if (data['@type'] === 'WebSite') {
        expect(data).toEqual({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'Jeroen Bach',
          'url': 'https://bach.software',
        });
        // Test site-wide metadata
      }
      else {
        expect(data).toEqual(
          `New untested structured data type found: ${data['@type']}`,
        );
      }
    }
  });

  test('Blog JSON-LD should be valid', async ({ page }) => {
    await page.goto(`/posts`);

    const jsonLdHandles = await page.$$('script[type="application/ld+json"]');
    for (const handle of jsonLdHandles) {
      const content = await handle.evaluate(el => el.textContent || '');
      const data = JSON.parse(content);

      if (data['@type'] === 'Blog') {
        expect(data).toEqual({
          '@context': 'https://schema.org',
          '@id': 'https://bach.software/posts',
          '@type': 'Blog',
          'blogPost': [
            {
              '@type': 'BlogPosting',
              'author': {
                '@type': 'Person',
                'image': {
                  '@type': 'ImageObject',
                  'height': '768',
                  'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                  'width': '768',
                },
                'name': 'Jeroen Bach',
                'url': 'https://bach.software/pages/about',
              },
              'dateModified': '2025-09-29T21:00:00+02:00',
              'datePublished': '2025-09-27T21:00:00+02:00',
              'headline': 'Array to Map conversion in Typescript, with type safety',
              'image': {
                '@type': 'ImageObject',
                'height': '768',
                'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/5/cover.png',
                'width': '768',
              },
              'isAccessibleForFree': true,
              'keywords': [
                'Typescript',
                'Javascript',
              ],
              'publisher': {
                '@id': 'https://bach.software',
                '@type': 'Organization',
                'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                'name': 'Bach.Software',
              },
              'url': 'https://bach.software/posts/5-array-to-map-conversion-in-typescript-with-type-safety',
            },
            {
              '@type': 'BlogPosting',
              'author': {
                '@type': 'Person',
                'image': {
                  '@type': 'ImageObject',
                  'height': '768',
                  'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                  'width': '768',
                },
                'name': 'Jeroen Bach',
                'url': 'https://bach.software/pages/about',
              },
              'dateModified': '2025-09-29T21:00:00+02:00',
              'datePublished': '2025-09-20T16:34:55+02:00',
              'headline': 'Deploy a production-ready Kubernetes Cluster on Azure with Terraform',
              'image': {
                '@type': 'ImageObject',
                'height': '768',
                'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/4/cover.jpeg',
                'width': '768',
              },
              'isAccessibleForFree': true,
              'keywords': [
                'Kubernetes',
                'Azure',
                'Terraform',
              ],
              'publisher': {
                '@id': 'https://bach.software',
                '@type': 'Organization',
                'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                'name': 'Bach.Software',
              },
              'url': 'https://bach.software/posts/4-deploy-a-production-ready-kubernetes-cluster-on-azure-with-terraform',
            },
            {
              '@type': 'BlogPosting',
              'headline':
                'Track how many people read your articles, using Plausible.io, Vue.js and Azure functions',
              'datePublished': '2025-08-03T15:45:00+02:00',
              'dateModified': '2025-08-03T15:45:00+02:00',
              'url': 'https://bach.software/posts/3-track-how-many-people-read-your-articles-using-plausible_io-vue_js-and-azure-functions',
              'author': {
                '@type': 'Person',
                'name': 'Jeroen Bach',
                'url': 'https://bach.software/pages/about',
                'image': {
                  '@type': 'ImageObject',
                  'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                  'height': '768',
                  'width': '768',
                },
              },
              'publisher': {
                '@type': 'Organization',
                '@id': 'https://bach.software',
                'name': 'Bach.Software',
                'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
              },
              'image': {
                '@type': 'ImageObject',
                'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/3/cover.jpeg',
                'height': '768',
                'width': '768',
              },
              'isAccessibleForFree': true,
              'keywords': ['Vue.js', 'C#'],
            },
            {
              '@type': 'BlogPosting',
              'author': {
                '@type': 'Person',
                'image': {
                  '@type': 'ImageObject',
                  'height': '768',
                  'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                  'width': '768',
                },
                'name': 'Jeroen Bach',
                'url': 'https://bach.software/pages/about',
              },
              'keywords': ['Kubernetes', 'Azure', 'Plausible.io'],
              'publisher': {
                '@id': 'https://bach.software',
                '@type': 'Organization',
                'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                'name': 'Bach.Software',
              },
              'dateModified': '2025-10-04T13:00:00+02:00',
              'datePublished': '2025-04-06T16:11:24+02:00',
              'headline':
                'Ditching the Cookie Banners: Run Plausible Analytics on Azure Kubernetes',
              'image': {
                '@type': 'ImageObject',
                'height': '768',
                'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/2/cover.jpeg',
                'width': '768',
              },
              'isAccessibleForFree': true,
              'url': 'https://bach.software/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes',
            },
            {
              '@type': 'BlogPosting',
              'author': {
                '@type': 'Person',
                'image': {
                  '@type': 'ImageObject',
                  'height': '768',
                  'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                  'width': '768',
                },
                'name': 'Jeroen Bach',
                'url': 'https://bach.software/pages/about',
              },
              'keywords': [
                'Vue.js',
                'Vue 3.3',
                'TypeScript',
                'Generics',
                'Reusable components',
                'Conditional types',
                'MultiSelect component',
                'Frontend development',
              ],
              'publisher': {
                '@id': 'https://bach.software',
                '@type': 'Organization',
                'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
                'name': 'Bach.Software',
              },
              'dateModified': '2025-05-27T11:30:00+02:00',
              'datePublished': '2024-11-04T21:30:00+01:00',
              'headline':
                'Mastering Conditional Property Types with Vue 3.3 Generics',
              'image': {
                '@type': 'ImageObject',
                'height': '768',
                'url': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg',
                'width': '768',
              },
              'isAccessibleForFree': true,
              'url': 'https://bach.software/posts/1-mastering-conditional-property-types-with-vue-3_3-generics',
            },
          ],
          'description':
            'Insights and techniques for writing great software, based on real-world experience. Sharing opinionated solutions and generalized patterns from client projects, without revealing proprietary code.',
          'mainEntityOfPage': 'https://bach.software/posts',
          'name': 'Blog',
          'publisher': {
            '@id': 'https://bach.software',
            '@type': 'Organization',
            'logo': 'https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
            'name': 'Bach.Software',
          },
        });
      }
      else if (data['@type'] === 'WebSite') {
        expect(data).toEqual({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'Jeroen Bach',
          'url': 'https://bach.software',
        });
        // Test site-wide metadata
      }
      else {
        expect(data).toEqual(
          `New untested structured data type found: ${data['@type']}`,
        );
      }
    }
  });
});

test.describe('Canonical tests', () => {
  test('BlogPost canonical link', async ({ page }) => {
    await page.goto(
      '/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes',
    );

    const canonicalLink = await page.$eval('link[rel="canonical"]', link =>
      link.getAttribute('href'));

    expect(canonicalLink).toBe(
      'https://bach.software/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes',
    );
  });
  test('HomePage canonical link', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const canonicalLink = await page.$eval('link[rel="canonical"]', link =>
      link.getAttribute('href'));

    expect(canonicalLink).toBe('https://bach.software/posts');
  });
});

test.describe('Icon tests', () => {
  test('Check icon links', async ({ page }) => {
    // <link rel="icon" sizes="192x192" href="/ico/192.png">
    // <link rel="icon" sizes="128x128" href="/ico/128.png">
    // <link rel="icon" type="image/png" href="/ico/favicon.png">
    // <link rel="icon" sizes="any" type="image/svg+xml" href="/ico/favicon.svg">
    // <link rel="apple-touch-icon" sizes="76x76" href="/ico/76.png">
    // <link rel="apple-touch-icon" sizes="120x120" href="/ico/120.png">
    // <link rel="apple-touch-icon" sizes="152x152" href="/ico/152.png">
    // <link rel="apple-touch-icon" sizes="167x167" href="/ico/167.png">
    // <link rel="apple-touch-icon" sizes="180x180" href="/ico/180.png">
    await page.goto('http://localhost:3000');

    const iconLinks = await page.$$eval(
      'link[rel="icon"], link[rel="apple-touch-icon"]',
      links =>
        links.map(link => ({
          rel: link.getAttribute('rel') ?? undefined,
          sizes: link.getAttribute('sizes') ?? undefined,
          type: link.getAttribute('type') ?? undefined,
          href: link.getAttribute('href') ?? undefined,
        })),
    );

    expect(iconLinks).toEqual([
      { rel: 'icon', sizes: '192x192', href: '/ico/192.png' },
      { rel: 'icon', sizes: '128x128', href: '/ico/128.png' },
      { rel: 'icon', type: 'image/png', href: '/ico/favicon.png' },
      {
        rel: 'icon',
        sizes: 'any',
        type: 'image/svg+xml',
        href: '/ico/favicon.svg',
      },
      { rel: 'apple-touch-icon', sizes: '76x76', href: '/ico/76.png' },
      { rel: 'apple-touch-icon', sizes: '120x120', href: '/ico/120.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/ico/152.png' },
      { rel: 'apple-touch-icon', sizes: '167x167', href: '/ico/167.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/ico/180.png' },
    ]);
  });
});
