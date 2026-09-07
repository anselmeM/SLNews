import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BottomNavBar from "@/components/layout/BottomNavBar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("@/lib/haptics", () => ({
  vibrateLight: vi.fn(),
}));

describe("BottomNavBar Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      writable: true,
    });
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

    // Scroll to 300px
    act(() => {
      window.scrollY = 300;
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-28");
    expect(nav.className).toContain("opacity-0");
  });

  it("reappears after scrolling stops (350ms idle delay)", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    act(() => {
      window.scrollY = 300;
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-28");

    // Fast-forward past idle debounce
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });

  it("always remains visible when near top of the page", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    act(() => {
      window.scrollY = 40; // < 60px
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });

  it("always remains visible when near the bottom of the page", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");

    act(() => {
      window.scrollY = 1200; // innerHeight(800) + scrollY(1200) = 2000 >= scrollHeight(2000) - 60
      fireEvent.scroll(window);
    });

    expect(nav.className).toContain("translate-y-0");
    expect(nav.className).toContain("opacity-100");
  });
});
