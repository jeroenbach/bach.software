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
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 200,
    });
  });

  it("should initialize with default values", () => {
    const { hasRead, percentageScrolled, timeSpent } = usePageRead();

    expect(hasRead.value).toBe(false);
    expect(percentageScrolled.value).toBe(0);
    expect(timeSpent.value).toBe(0);
  });

  describe("usePageRead scroll calculations", () => {
    it.each([
      { scrollY: 0, percentage: 0, description: "no scroll" },
      { scrollY: 400, percentage: 50, description: "half scroll" },
      { scrollY: 800, percentage: 100, description: "full scroll" },
    ])(
      "should calculate $description as $percentage percentage",
      async ({ scrollY, percentage }) => {
        // Setup mocks
        const mockScroll = ref(scrollY);
        mock.useScroll.mockReturnValueOnce({ y: mockScroll });

        // Run test
        const { percentageScrolled } = usePageRead();
        expect(percentageScrolled.value).toBe(percentage);
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
