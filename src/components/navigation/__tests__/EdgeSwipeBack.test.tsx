import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EdgeSwipeBack from "@/components/navigation/EdgeSwipeBack";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
  usePathname: () => "/article/123",
}));

describe("EdgeSwipeBack Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not trigger navigation if touch does not start near left edge", () => {
    render(<EdgeSwipeBack />);

    // Touch started at clientX = 100 (not edge)
    fireEvent.touchStart(window, {
      touches: [{ clientX: 100, clientY: 200 }],
    });
    fireEvent.touchMove(window, {
      touches: [{ clientX: 250, clientY: 200 }],
    });
    fireEvent.touchEnd(window);

    expect(mockBack).not.toHaveBeenCalled();
  });

  it("triggers back navigation when dragged right from edge past threshold", () => {
    render(<EdgeSwipeBack />);

    // Touch started at left edge (clientX = 10)
    fireEvent.touchStart(window, {
      touches: [{ clientX: 10, clientY: 200 }],
    });
    // Dragged to clientX = 120 (deltaX = 110)
    fireEvent.touchMove(window, {
      touches: [{ clientX: 120, clientY: 200 }],
    });
    fireEvent.touchEnd(window);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
