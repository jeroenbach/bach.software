import { describe, vi, it, expect, beforeEach } from "vitest";
import { useStopWatch } from "./useStopWatch";

describe("useStopWatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should initialize with default values", () => {
    const { timer, isActive } = useStopWatch();

    expect(timer.value).toBe(0);
    expect(isActive.value).toBe(false);
  });

  it("should increment timer when running", () => {
    const { timer, resume } = useStopWatch({ interval: 100 });

    resume();
    vi.advanceTimersByTime(500);

    expect(timer.value).toBe(500);
  });

  it("should pause and resume timer", () => {
    const { timer, pause, resume } = useStopWatch({ interval: 100 });

    resume();
    vi.advanceTimersByTime(300);
    expect(timer.value).toBe(300);

    pause();
    vi.advanceTimersByTime(300);
    expect(timer.value).toBe(300);

    resume();
    vi.advanceTimersByTime(200);
    expect(timer.value).toBe(500);
  });

  it("should respect custom interval", () => {
    const { timer, resume } = useStopWatch({ interval: 500 });

    resume();
    vi.advanceTimersByTime(300);
    expect(timer.value).toBe(0);
    vi.advanceTimersByTime(300);
    expect(timer.value).toBe(500);
    vi.advanceTimersByTime(300);
    expect(timer.value).toBe(500);
    vi.advanceTimersByTime(300);
    expect(timer.value).toBe(1000);
  });
});
