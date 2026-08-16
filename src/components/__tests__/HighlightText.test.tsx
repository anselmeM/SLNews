import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HighlightText from "@/components/HighlightText";

describe("HighlightText", () => {
  it("renders text as-is when query is empty", () => {
    render(<HighlightText text="Sierra Leone Breaking News" query="" />);
    expect(screen.getByText("Sierra Leone Breaking News")).toBeInTheDocument();
  });

  it("highlights matched search terms with mark tags", () => {
    const { container } = render(
      <HighlightText text="Major infrastructure project in Freetown" query="Freetown" />
    );
    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("Freetown");
  });

  it("handles case-insensitive and multi-word queries", () => {
    const { container } = render(
      <HighlightText text="New economic policies in Sierra Leone" query="economic sierra" />
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0]?.textContent).toBe("economic");
    expect(marks[1]?.textContent).toBe("Sierra");
  });
});
