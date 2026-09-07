import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BottomSheet from "@/components/BottomSheet";

describe("BottomSheet Component", () => {
  it("does not render content when open is false", () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet Content")).not.toBeInTheDocument();
  });

  it("renders sheet content and title when open is true", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()} title="Test Title">
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Sheet Content")).toBeInTheDocument();
  });

  it("triggers onClose when pressing the Escape key", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
