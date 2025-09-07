import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useReadProgressTracking } from './useReadProgressTracking';

const mock = vi.hoisted(() => ({
  useScroll: vi.fn(() => ({ y: ref(0) })),
  useDocumentVisibility: vi.fn(() => ref('visible')),
  useTrackEvent: vi.fn(),
}));

vi.mock('@vueuse/core', async () => {
  const actual = (await vi.importActual('@vueuse/core')) as any;
  return {
    ...actual,
    useScroll: mock.useScroll,
    useDocumentVisibility: mock.useDocumentVisibility,
  };
});

mockNuxtImport('useTrackEvent', () => mock.useTrackEvent);

describe('useReadProgressTracking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Mock document dimensions
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 200,
      configurable: true,
    });
  });

  it('should initialize with default values', () => {
    const { timeProgress, scrollProgress } = useReadProgressTracking();

    expect(timeProgress.value).toBe('opened');
    expect(scrollProgress.value).toBe('opened');
    expect(mock.useTrackEvent).toHaveBeenCalledWith('opened', {
      props: { scrolled: 'opened', timeSpend: 'opened' },
    });
  });

  it('should disable event tracking when specified so', () => {
    const { timeProgress, scrollProgress } = useReadProgressTracking({
      disableEventTracking: true,
    });

    expect(timeProgress.value).toBe('opened');
    expect(scrollProgress.value).toBe('opened');
    expect(mock.useTrackEvent).toHaveBeenCalledTimes(0);
  });

  describe('progress tracking', () => {
    it.each([
      { scrollY: 0, progress: 'opened' },
      { scrollY: 80, progress: 'peeked' },
      { scrollY: 200, progress: 'quarter-read' },
      { scrollY: 400, progress: 'half-read' },
      { scrollY: 600, progress: 'three-quarter-read' },
      { scrollY: 800, progress: 'read' },
    ])('should track scroll progress: $progress', ({ scrollY, progress }) => {
      const mockScroll = ref(scrollY);
      mock.useScroll.mockReturnValueOnce({ y: mockScroll });

      const { scrollProgress } = useReadProgressTracking();
      expect(scrollProgress.value).toBe(progress);
    });

    it.each([
      { elapsed: 0, progress: 'opened' },
      { elapsed: 3_000, progress: 'peeked' },
      { elapsed: 7_500, progress: 'quarter-read' },
      { elapsed: 15_000, progress: 'half-read' },
      { elapsed: 22_500, progress: 'three-quarter-read' },
      { elapsed: 30_000, progress: 'read' },
    ])('should track time progress: $progress', ({ elapsed, progress }) => {
      const { timeProgress } = useReadProgressTracking();
      vi.advanceTimersByTime(elapsed);
      expect(timeProgress.value).toBe(progress);
    });

    it.each([
      { scrollY: 0, elapsed: 0, progress: 'opened' },
      { scrollY: 0, elapsed: 3_000, progress: 'opened' },
      { scrollY: 80, elapsed: 0, progress: 'opened' },
      { scrollY: 80, elapsed: 3_000, progress: 'peeked' },
      { scrollY: 80, elapsed: 7_500, progress: 'peeked' },
      { scrollY: 200, elapsed: 3_000, progress: 'peeked' },
      { scrollY: 200, elapsed: 7_500, progress: 'quarter-read' },
      { scrollY: 200, elapsed: 15_000, progress: 'quarter-read' },
      { scrollY: 400, elapsed: 7_500, progress: 'quarter-read' },
      { scrollY: 400, elapsed: 15_000, progress: 'half-read' },
      { scrollY: 400, elapsed: 22_500, progress: 'half-read' },
      { scrollY: 600, elapsed: 15_000, progress: 'half-read' },
      { scrollY: 600, elapsed: 22_500, progress: 'three-quarter-read' },
      { scrollY: 600, elapsed: 30_000, progress: 'three-quarter-read' },
      { scrollY: 800, elapsed: 22_500, progress: 'three-quarter-read' },
      { scrollY: 800, elapsed: 30_000, progress: 'read' },
    ])(
      'should track total progress: $progress',
      ({ scrollY, elapsed, progress }) => {
        const mockScroll = ref(scrollY);
        mock.useScroll.mockReturnValueOnce({ y: mockScroll });

        const { totalProgress } = useReadProgressTracking();
        vi.advanceTimersByTime(elapsed);
        expect(totalProgress.value).toBe(progress);
      },
    );
  });

  describe('event tracking', () => {
    it('should track events when time progress changes', () => {
      const mockScroll = ref(0);
      mock.useScroll.mockReturnValueOnce({ y: mockScroll });

      useReadProgressTracking();
      vi.clearAllMocks();

      mockScroll.value = 400;
      vi.advanceTimersByTime(3_000);
      expect(mock.useTrackEvent).toHaveBeenCalledWith('peeked', {
        props: { scrolled: 'half-read', timeSpend: 'peeked' },
      });

      mockScroll.value = 600;
      vi.advanceTimersByTime(5_000);
      expect(mock.useTrackEvent).toHaveBeenCalledWith('quarter-read', {
        props: { scrolled: 'three-quarter-read', timeSpend: 'quarter-read' },
      });
    });

    it('should include extra tracking props', () => {
      const mockScroll = ref(0);
      mock.useScroll.mockReturnValueOnce({ y: mockScroll });
      vi.clearAllMocks();

      useReadProgressTracking({}, { articleId: '123', category: 'blog' });

      expect(mock.useTrackEvent).toHaveBeenCalledWith('opened', {
        props: {
          scrolled: 'opened',
          timeSpend: 'opened',
          articleId: '123',
          category: 'blog',
        },
      });

      mockScroll.value = 800;
      vi.advanceTimersByTime(22_500);

      expect(mock.useTrackEvent).toHaveBeenCalledWith('three-quarter-read', {
        props: {
          scrolled: 'read',
          timeSpend: 'three-quarter-read',
          articleId: '123',
          category: 'blog',
        },
      });
    });

    it('should not track when progress hasn\'t changed', () => {
      const mockScroll = ref(0);
      mock.useScroll.mockReturnValue({ y: mockScroll });
      useReadProgressTracking();
      vi.clearAllMocks();

      vi.advanceTimersByTime(100);
      expect(mock.useTrackEvent).not.toHaveBeenCalled();

      mockScroll.value = 50;
      expect(mock.useTrackEvent).not.toHaveBeenCalled();
    });

    it('should track with updated extraTrackingProps', () => {
      const mockScroll = ref(0);
      mock.useScroll.mockReturnValue({ y: mockScroll });
      const trackingProps = ref({ articleId: '123' });

      useReadProgressTracking({}, trackingProps);
      vi.clearAllMocks();

      // Update tracking props and trigger a progress change
      trackingProps.value = { articleId: '456' };
      mockScroll.value = 600;
      vi.advanceTimersByTime(3_000);

      expect(mock.useTrackEvent).toHaveBeenCalledWith('peeked', {
        props: {
          scrolled: 'three-quarter-read',
          timeSpend: 'peeked',
          articleId: '456',
        },
      });
    });
  });
});
