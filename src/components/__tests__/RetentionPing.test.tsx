import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RetentionPing from "../RetentionPing";
import { recordVisitAndReport } from "@/lib/retention-client";

vi.mock("@/lib/retention-client", () => ({
  recordVisitAndReport: vi.fn(() => Promise.resolve()),
}));

describe("RetentionPing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports the visit once on mount and renders nothing", () => {
    const { container } = render(<RetentionPing />);

    expect(recordVisitAndReport).toHaveBeenCalledTimes(1);
    expect(container).toBeEmptyDOMElement();
  });
});
