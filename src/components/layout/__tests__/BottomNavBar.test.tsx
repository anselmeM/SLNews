import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BottomNavBar from "@/components/layout/BottomNavBar";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/lib/haptics", () => ({
  vibrateLight: vi.fn(),
}));

describe("BottomNavBar Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockPathname = "/";
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all four navigation items", () => {
    render(<BottomNavBar />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /national news/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /world/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shorts/i })).toBeInTheDocument();
  });

  it("is visible by default at top of page", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });

  it("hides when scrolling actively down the page", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    // Scroll down past the 60px threshold
    act(() => {
      window.scrollY = 200;
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-36");
    expect(nav.className).toContain("opacity-0");
  });

  it("reappears immediately when scrolling up", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    // Scroll down to hide
    act(() => {
      window.scrollY = 300;
      fireEvent.scroll(window);
    });
    expect(nav.className).toContain("translate-y-36");

    // Scroll up by 20px (diff < -8)
    act(() => {
      window.scrollY = 280;
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });

  it("reappears after scrolling stops (1200ms idle delay)", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    act(() => {
      window.scrollY = 300;
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-36");

    // Fast-forward past idle debounce
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });

  it("always remains visible when near top of the page (< 60px)", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    act(() => {
      window.scrollY = 40; // < 60px
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });
});
