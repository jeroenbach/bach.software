import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { usePageRead } from "./usePageRead";

const mock = vi.hoisted(() => ({
  useScroll: vi.fn(() => ({ y: ref(0) })),
  useDocumentVisibility: vi.fn(() => ref("visible")),
}));

vi.mock("@vueuse/core", async () => {
  const actual = (await vi.importActual("@vueuse/core")) as any;
  return {
    ...actual,
    useScroll: mock.useScroll,
    useDocumentVisibility: mock.useDocumentVisibility,
  };
});

describe("usePageRead", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock document dimensions
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 200,
      configurable: true,
    });
  });

  it("should initialize with default values", () => {
    const {
      hasRead,
      scrollPercentage: percentageScrolled,
      timeSpent,
      timeProgress,
      scrollProgress,
    } = usePageRead();

    expect(hasRead.value).toBe(false);
    expect(percentageScrolled.value).toBe(0);
    expect(timeSpent.value).toBe(0);
    expect(timeProgress.value).toBe("opened");
    expect(scrollProgress.value).toBe("opened");
  });

  describe("usePageRead scroll progress", () => {
    it.each([
      {
        scrollY: 0,
        percentage: 0,
        progress: "opened",
        description: "no scroll",
      },
      {
        scrollY: 400,
        percentage: 50,
        progress: "half-read",
        description: "half scroll",
      },
      {
        scrollY: 600,
        percentage: 75,
        progress: "three-quarter-read",
        description: "three quarter scroll",
      },
      {
        scrollY: 800,
        percentage: 100,
        progress: "read",
        description: "full scroll",
      },
    ])(
      "should calculate $description as $percentage percentage with progress $progress",
      async ({ scrollY, percentage, progress }) => {
        const mockScroll = ref(scrollY);
        mock.useScroll.mockReturnValueOnce({ y: mockScroll });

        const { scrollPercentage: percentageScrolled, scrollProgress } =
          usePageRead();
        expect(percentageScrolled.value).toBe(percentage);
        expect(scrollProgress.value).toBe(progress);
      },
    );

    it("should set percentage to 100 when page is not scrollable", async () => {
      Object.defineProperty(document.documentElement, "scrollHeight", {
        value: 200,
      });
      Object.defineProperty(document.documentElement, "clientHeight", {
        value: 200,
      });

      const mockScroll = ref(0);
      mock.useScroll.mockReturnValueOnce({ y: mockScroll });

      const { scrollPercentage: percentageScrolled, scrollProgress } =
        usePageRead();
      expect(percentageScrolled.value).toBe(100);
      expect(scrollProgress.value).toBe("read");
    });
  });

  describe("usePageRead time progress", () => {
    it.each([
      { elapsed: 0, progress: "opened", description: "just opened" },
      { elapsed: 3_000, progress: "peeked", description: "peeked" },
      { elapsed: 7_500, progress: "quarter-read", description: "quarter time" },
      { elapsed: 15_000, progress: "half-read", description: "half time" },
      {
        elapsed: 22_500,
        progress: "three-quarter-read",
        description: "three quarter time",
      },
      { elapsed: 30_000, progress: "read", description: "full time" },
    ])(
      "should show $description progress after $elapsed ms",
      async ({ elapsed, progress }) => {
        const { timeProgress } = usePageRead({ timeThreshold: 100 });
        vi.advanceTimersByTime(elapsed);
        expect(timeProgress.value).toBe(progress);
      },
    );
  });

  describe("usePageRead time progress with 10% threshold", () => {
    it.each([
      { elapsed: 0, progress: "opened", description: "just opened" },
      { elapsed: 300, progress: "peeked", description: "peeked" },
      { elapsed: 750, progress: "quarter-read", description: "quarter time" },
      { elapsed: 1500, progress: "half-read", description: "half time" },
      {
        elapsed: 2250,
        progress: "three-quarter-read",
        description: "three quarter time",
      },
      { elapsed: 3000, progress: "read", description: "full time" },
    ])(
      "should show $description progress after $elapsed ms",
      async ({ elapsed, progress }) => {
        const { timeProgress } = usePageRead({ timeThreshold: 10 });
        vi.advanceTimersByTime(elapsed);
        expect(timeProgress.value).toBe(progress);
      },
    );
  });

  it("should track time spent when screen is visible", async () => {
    const mockVisibility = ref("visible");
    mock.useDocumentVisibility.mockReturnValueOnce(mockVisibility);

    const { timeSpent } = usePageRead();
    expect(timeSpent.value).toBe(0);

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5_000);
    expect(timeSpent.value).toBe(5_000);

    mockVisibility.value = "hidden";

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5_000);
    expect(timeSpent.value).toBe(5_000);

    mockVisibility.value = "visible";

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5_000);
    expect(timeSpent.value).toBe(10_000);
  });

  it.each([
    {
      timeElapsed: 0,
      scrollY: 0,
      expectedRead: false,
      description: "no conditions met",
    },
    {
      timeElapsed: 31_000,
      scrollY: 0,
      expectedRead: false,
      description: "only time met",
    },
    {
      timeElapsed: 0,
      scrollY: 600,
      expectedRead: false,
      description: "only scroll met",
    },
    {
      timeElapsed: 31_000,
      scrollY: 600,
      expectedRead: true,
      description: "both conditions met",
    },
  ])(
    "should mark as read when $description",
    async ({ timeElapsed, scrollY, expectedRead }) => {
      const mockScroll = ref(0);
      mock.useScroll.mockReturnValueOnce({ y: mockScroll });

      const { hasRead } = usePageRead({
        scrollThreshold: 70,
        timeThreshold: 30,
      });

      if (timeElapsed > 0) {
        vi.advanceTimersByTime(timeElapsed);
      }

      mockScroll.value = scrollY;
      expect(hasRead.value).toBe(expectedRead);
    },
  );

  it.each([
    {
      timeThreshold: 100,
      wordCount: 1200,
      minSeconds: 261, // 1200 / 275 * 60 = 261,82 seconds
      description: "long article",
    },
    {
      timeThreshold: 70,
      wordCount: 1200,
      minSeconds: 183, // 1200 / 275 * 60 = 261,82 seconds * 70% = 183,27 seconds
      description: "long article but 70% minimum read",
    },
    {
      timeThreshold: 100,
      wordCount: 20,
      minSeconds: 30, // 20 / 275 * 60 = 4,36 seconds ... so we take the default minimum of 30 seconds
      description: "short article",
    },
  ])(
    "should adjust minimum time based on $description",
    async ({ timeThreshold, wordCount, minSeconds }) => {
      const mockScroll = ref(600); // 75% scroll

      mock.useScroll.mockReturnValueOnce({ y: mockScroll });

      const { hasRead } = usePageRead({
        timeThreshold,
        wordCount,
      });

      // Advance time to not enough seconds
      vi.advanceTimersByTime((minSeconds - 5) * 1000);
      expect(hasRead.value).toBe(false);

      // Advance to enough seconds
      vi.advanceTimersByTime(6_000);
      expect(hasRead.value).toBe(true);
    },
  );

  it("should respect minimumTime even for short articles", async () => {
    const mockScroll = ref(600); // 75% scroll
    mock.useScroll.mockReturnValueOnce({ y: mockScroll });

    const { hasRead } = usePageRead({
      wordCount: 100, // Very short article
      minimumTime: 45_000, // But require 45 seconds minimum
      timeThreshold: 70, // 70% of 45 seconds = 31.5 seconds required
    });

    // Not enough time (30 seconds)
    vi.advanceTimersByTime(30_000);
    expect(hasRead.value).toBe(false);

    // Enough time (32 seconds)
    vi.advanceTimersByTime(2_000);
    expect(hasRead.value).toBe(true);
  });
});
