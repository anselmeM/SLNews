import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ImageLightbox from "@/components/ui/ImageLightbox";

describe("ImageLightbox Component", () => {
  it("does not render modal when isOpen is false", () => {
    render(
      <ImageLightbox
        isOpen={false}
        src="/test-photo.jpg"
        alt="Test Photo"
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByLabelText("Close image viewer")).not.toBeInTheDocument();
  });

  it("renders modal with image and alt text when isOpen is true", () => {
    render(
      <ImageLightbox
        isOpen={true}
        src="/test-photo.jpg"
        alt="Freetown Waterfront"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Freetown Waterfront")).toBeInTheDocument();
    expect(screen.getByLabelText("Close image viewer")).toBeInTheDocument();
  });

  it("triggers onClose when clicking close button", () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        isOpen={true}
        src="/test-photo.jpg"
        alt="Test Photo"
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByLabelText("Close image viewer");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("triggers onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        isOpen={true}
        src="/test-photo.jpg"
        alt="Test Photo"
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
