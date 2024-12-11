import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useReadProgress } from "./useReadProgress";

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

describe("useReadProgress", () => {
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
    const { hasRead, scrollPercentage, timeSpentPercentage, timeSpent } =
      useReadProgress();

    expect(hasRead.value).toBe(false);
    expect(scrollPercentage.value).toBe(0);
    expect(timeSpentPercentage.value).toBe(0);
    expect(timeSpent.value).toBe(0);
  });

  describe("scroll percentage", () => {
    it.each([
      { scrollY: 0, percentage: 0, description: "no scroll" },
      { scrollY: 400, percentage: 50, description: "half scroll" },
      { scrollY: 600, percentage: 75, description: "three quarter scroll" },
      { scrollY: 800, percentage: 100, description: "full scroll" },
    ])(
      "should calculate $description as $percentage percentage",
      async ({ scrollY, percentage }) => {
        const mockScroll = ref(scrollY);
        mock.useScroll.mockReturnValueOnce({ y: mockScroll });

        const { scrollPercentage } = useReadProgress();
        expect(scrollPercentage.value).toBe(percentage);
      },
    );

    it.each([
      { scrollHeight: 200, clientHeight: 200, description: "same heights" },
      {
        scrollHeight: 180,
        clientHeight: 200,
        description: "scroll less than client",
      },
    ])(
      "should set percentage to 100 when $description",
      async ({ scrollHeight, clientHeight }) => {
        Object.defineProperty(document.documentElement, "scrollHeight", {
          value: scrollHeight,
        });
        Object.defineProperty(document.documentElement, "clientHeight", {
          value: clientHeight,
        });

        const mockScroll = ref(0);
        mock.useScroll.mockReturnValueOnce({ y: mockScroll });

        const { scrollPercentage } = useReadProgress();
        expect(scrollPercentage.value).toBe(100);
      },
    );
  });

  it("should track time spent when screen is visible", async () => {
    const mockVisibility = ref("visible");
    mock.useDocumentVisibility.mockReturnValueOnce(mockVisibility);

    const { timeSpent } = useReadProgress();
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
      wordCount: 1375,
      timeElapsed: 300_000, // 1375 / 275 * 60 * 1000
      description: "long article",
    },
    {
      wordCount: 20,
      timeElapsed: 30_000, // minimum time
      description: "short article",
    },
  ])(
    "should calculate time percentage based on $description",
    async ({ wordCount, timeElapsed }) => {
      const { timeSpentPercentage } = useReadProgress({ wordCount });

      vi.advanceTimersByTime(timeElapsed / 2);
      expect(timeSpentPercentage.value).toBe(50);

      vi.advanceTimersByTime(timeElapsed);
      expect(timeSpentPercentage.value).toBe(100);
    },
  );

  it("should respect minimumTime even for short articles", async () => {
    const { timeSpentPercentage } = useReadProgress({
      wordCount: 100, // Very short article
      minimumTime: 45_000, // But require 45 seconds minimum
    });

    vi.advanceTimersByTime(22_500); // 50%
    expect(timeSpentPercentage.value).toBe(50);

    vi.advanceTimersByTime(22_500); // 100%
    expect(timeSpentPercentage.value).toBe(100);
  });

  it.each([
    {
      scroll: 800,
      time: 30_000,
      expected: true,
      description: "both conditions are met",
    },
    {
      scroll: 799,
      time: 30_000,
      expected: false,
      description: "not scrolled enough",
    },
    {
      scroll: 800,
      time: 29_999,
      expected: false,
      description: "not enough time",
    },
  ])(
    "should set read to $expected, when $description",
    async ({ scroll, time, expected }) => {
      const mockScroll = ref(0);
      mock.useScroll.mockReturnValueOnce({ y: mockScroll });

      const { hasRead } = useReadProgress();

      mockScroll.value = scroll;
      vi.advanceTimersByTime(time);

      expect(hasRead.value).toBe(expected);
    },
  );
});
