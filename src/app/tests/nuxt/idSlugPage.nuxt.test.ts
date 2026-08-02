import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import IdSlugPage from '~/pages/[[segment1]]/[id]-[[slug]].vue';

const mock = vi.hoisted(() => ({
  useRoute: vi.fn(),
  useAlternateUrls: vi.fn(),
  usePagesContext: vi.fn(),
  useBlogPostsContext: vi.fn(),
  usePageReadsContext: vi.fn(),
  usePageLikesContext: vi.fn(),
  useMetadata: vi.fn(),
  useReadProgressTracking: vi.fn(),
  navigateTo: vi.fn(),
  like: vi.fn(),
}));

mockNuxtImport('useRoute', () => mock.useRoute);
mockNuxtImport('useAlternateUrls', () => mock.useAlternateUrls);
mockNuxtImport('usePagesContext', () => mock.usePagesContext);
mockNuxtImport('useBlogPostsContext', () => mock.useBlogPostsContext);
mockNuxtImport('usePageReadsContext', () => mock.usePageReadsContext);
mockNuxtImport('usePageLikesContext', () => mock.usePageLikesContext);
mockNuxtImport('useMetadata', () => mock.useMetadata);
mockNuxtImport('useReadProgressTracking', () => mock.useReadProgressTracking);
mockNuxtImport('navigateTo', () => mock.navigateTo);

const BlogPostStub = {
  props: ['post', 'baseUrl', 'pageReads', 'likes', 'hasLiked'],
  emits: ['like'],
  template: `
    <div data-testid="blog-post">
      <button data-testid="like-button" @click="$emit('like')" />
      <slot name="tableOfContents" />
    </div>`,
};

const stubs = {
  PageContent: { template: '<div><slot /></div>' },
  AppProse: { template: '<div><slot /></div>' },
  ContentRenderer: true,
  BlogPost: BlogPostStub,
  TableOfContents: true,
};

function mountPage() {
  return mountSuspended(IdSlugPage, { global: { stubs } });
}

function arrangeRoute(path: string, params: Record<string, string>) {
  mock.useRoute.mockReturnValue({ path, params, query: {} });
}

function arrangePost(post?: Record<string, unknown>) {
  mock.useBlogPostsContext.mockResolvedValue({ data: ref(post) });
}

function arrangePage(page?: Record<string, unknown>) {
  mock.usePagesContext.mockResolvedValue({ data: ref(page) });
}

const post = {
  title: 'First post',
  url: '/posts/1-first-post',
  authorName: 'jeroenbach',
  category: 'Vue.js',
  readingTime: { words: 100, time: 60_000 },
  body: { toc: { links: [{ id: 'intro', text: 'Intro', depth: 2 }] } },
};

describe('[id]-[[slug]] page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.useAlternateUrls.mockResolvedValue([]);
    mock.usePageReadsContext.mockReturnValue({ pageReads: ref({ reads: 10 }) });
    mock.usePageLikesContext.mockReturnValue({
      likes: ref(42),
      isLoadingLikes: ref(false),
      hasLiked: ref(false),
      like: mock.like,
    });
  });

  it('should render a blog post with its reads and likes', async () => {
    arrangeRoute('/posts/1-first-post', { segment1: 'posts', id: '1', slug: 'first-post' });
    arrangePost(post);

    const w = await mountPage();

    const blogPost = w.findComponent(BlogPostStub);
    expect(blogPost.exists()).toBe(true);
    expect(blogPost.props('post')).toMatchObject({ title: 'First post' });
    expect(blogPost.props('pageReads')).toEqual({ reads: 10 });
    expect(blogPost.props('likes')).toBe(42);
    expect(blogPost.props('hasLiked')).toBe(false);
  });

  it('should pass the post author and category as like tracking props', async () => {
    arrangeRoute('/posts/1-first-post', { segment1: 'posts', id: '1', slug: 'first-post' });
    arrangePost(post);

    await mountPage();

    const trackingProps = mock.usePageLikesContext.mock.calls[0]![0]!;
    expect(toValue(trackingProps)).toEqual({ author: 'jeroenbach', category: 'Vue.js' });
  });

  it('should default the like tracking props when the post has no author or category', async () => {
    arrangeRoute('/posts/1-first-post', { segment1: 'posts', id: '1', slug: 'first-post' });
    arrangePost({ ...post, authorName: undefined, category: undefined });

    await mountPage();

    const trackingProps = mock.usePageLikesContext.mock.calls[0]![0]!;
    expect(toValue(trackingProps)).toEqual({ author: '', category: '' });
  });

  it('should trigger the like action when the blog post emits a like', async () => {
    arrangeRoute('/posts/1-first-post', { segment1: 'posts', id: '1', slug: 'first-post' });
    arrangePost(post);

    const w = await mountPage();
    await w.find('[data-testid="like-button"]').trigger('click');

    expect(mock.like).toHaveBeenCalledTimes(1);
  });

  it('should track the read progress of a blog post', async () => {
    arrangeRoute('/posts/1-first-post', { segment1: 'posts', id: '1', slug: 'first-post' });
    arrangePost(post);

    await mountPage();

    expect(mock.useReadProgressTracking).toHaveBeenCalledWith(
      { wordCount: 100, readingTime: 60_000 },
      { author: 'jeroenbach', category: 'Vue.js' },
    );
    expect(mock.useMetadata).toHaveBeenCalledWith('blogPost', expect.objectContaining({ title: 'First post' }), []);
  });

  it('should render a regular content page without any like or read tracking', async () => {
    arrangeRoute('/content/5-about', { segment1: 'content', id: '5', slug: 'about' });
    arrangePage({ title: 'About', url: '/content/5-about', enableProse: true });

    const w = await mountPage();

    expect(w.find('[data-testid="blog-post"]').exists()).toBe(false);
    expect(mock.usePageLikesContext).not.toHaveBeenCalled();
    expect(mock.usePageReadsContext).not.toHaveBeenCalled();
    expect(mock.useReadProgressTracking).not.toHaveBeenCalled();
    expect(mock.useMetadata).toHaveBeenCalledWith('page', expect.objectContaining({ title: 'About' }), []);
  });

  it('should throw a 404 error when neither a page nor a post is found', async () => {
    arrangeRoute('/posts/999-unknown', { segment1: 'posts', id: '999', slug: 'unknown' });
    arrangePost(undefined);

    await expect(mountPage()).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should redirect (301) when the post url differs from the current path', async () => {
    arrangeRoute('/posts/1-old-slug', { segment1: 'posts', id: '1', slug: 'old-slug' });
    arrangePost(post);

    await mountPage();

    expect(mock.navigateTo).toHaveBeenCalledWith('/posts/1-first-post', { redirectCode: 301 });
  });
});
