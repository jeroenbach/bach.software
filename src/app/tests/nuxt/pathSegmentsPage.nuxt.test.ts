import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PathSegmentsPage from '~/pages/[...pathSegments].vue';

const mock = vi.hoisted(() => ({
  useRoute: vi.fn(),
  useAlternateUrls: vi.fn(),
  usePagesContext: vi.fn(),
  useBlogPostsContext: vi.fn(),
  useMetadata: vi.fn(),
  navigateTo: vi.fn(),
}));

mockNuxtImport('useRoute', () => mock.useRoute);
mockNuxtImport('useAlternateUrls', () => mock.useAlternateUrls);
mockNuxtImport('usePagesContext', () => mock.usePagesContext);
mockNuxtImport('useBlogPostsContext', () => mock.useBlogPostsContext);
mockNuxtImport('useMetadata', () => mock.useMetadata);
mockNuxtImport('navigateTo', () => mock.navigateTo);

const stubs = {
  PageContent: { template: '<div><slot /></div>' },
  AppProse: { template: '<div><slot /></div>' },
  ContentRenderer: true,
  BlogPosts: { template: '<div data-testid="blog-posts"><slot /></div>' },
  BlogPostSummary: true,
};

function mountPage() {
  return mountSuspended(PathSegmentsPage, { global: { stubs } });
}

function arrangeRoute(path: string, pathSegments?: string[]) {
  mock.useRoute.mockReturnValue({ path, params: { pathSegments }, query: {} });
}

function arrangePage(page?: Record<string, unknown>) {
  mock.usePagesContext.mockResolvedValue({ data: ref(page) });
}

const posts = [{ path: '/posts/1-first-post', title: 'First post' }];

describe('[...pathSegments] page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.useAlternateUrls.mockResolvedValue([]);
    mock.useBlogPostsContext.mockResolvedValue({ data: ref(posts) });
  });

  it('should treat the root path as the blog root page', async () => {
    arrangeRoute('/', undefined);
    arrangePage({ title: 'Blog', url: '/posts', enableProse: false });

    const w = await mountPage();

    expect(mock.usePagesContext).toHaveBeenCalledWith(10);
    expect(mock.useBlogPostsContext).toHaveBeenCalledWith({ summary: true });
    expect(w.find('[data-testid="blog-posts"]').exists()).toBe(true);
  });

  it('should treat an empty pathSegments array as the blog root page', async () => {
    arrangeRoute('/', []);
    arrangePage({ title: 'Blog', url: '/posts', enableProse: false });

    await mountPage();

    expect(mock.usePagesContext).toHaveBeenCalledWith(10);
  });

  it('should show the blog root page on the posts path', async () => {
    arrangeRoute('/posts', ['posts']);
    arrangePage({ title: 'Blog', url: '/posts', enableProse: false });

    const w = await mountPage();

    expect(mock.usePagesContext).toHaveBeenCalledWith(10);
    expect(mock.navigateTo).not.toHaveBeenCalled();
    expect(w.find('[data-testid="blog-posts"]').exists()).toBe(true);
  });

  it('should show the blog root page on a localized posts path', async () => {
    arrangeRoute('/de/posts', ['posts']);
    arrangePage({ title: 'Blog', url: '/de/posts', enableProse: false });

    await mountPage();

    expect(mock.usePagesContext).toHaveBeenCalledWith(10);
    expect(mock.navigateTo).not.toHaveBeenCalled();
  });

  it('should use blog metadata for the blog root page', async () => {
    arrangeRoute('/posts', ['posts']);
    const page = { title: 'Blog', url: '/posts', enableProse: false };
    arrangePage(page);

    await mountPage();

    expect(mock.useAlternateUrls).toHaveBeenCalledWith('page', 10);
    expect(mock.useMetadata).toHaveBeenCalledWith('blog', page, [], posts);
  });

  it('should not query blog posts for an unknown path', async () => {
    arrangeRoute('/unknown', ['unknown']);
    arrangePage({ title: 'Unknown', url: '/unknown', enableProse: false });

    await mountPage();

    expect(mock.usePagesContext).toHaveBeenCalledWith(-1);
    expect(mock.useBlogPostsContext).not.toHaveBeenCalled();
  });

  it('should throw a 404 error when the page is not found', async () => {
    arrangeRoute('/unknown', ['unknown']);
    arrangePage(undefined);

    await expect(mountPage()).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should redirect (301) when the page url differs from the current path', async () => {
    arrangeRoute('/posts', ['posts']);
    arrangePage({ title: 'Blog', url: '/nl/posts', enableProse: false });

    await mountPage();

    expect(mock.navigateTo).toHaveBeenCalledWith('/nl/posts', { redirectCode: 301 });
  });

  it('should not redirect on the root path even when the page url differs', async () => {
    arrangeRoute('/', undefined);
    arrangePage({ title: 'Blog', url: '/posts', enableProse: false });

    await mountPage();

    expect(mock.navigateTo).not.toHaveBeenCalled();
  });
});
