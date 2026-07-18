import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ArticleImage from "@/components/ArticleImage";

describe("ArticleImage", () => {
  it("renders next/image for local src (starts with '/')", () => {
    render(<ArticleImage src="/test.jpg" alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/test.jpg");
    expect(img).toHaveAttribute("alt", "Test");
  });

  it("renders img tag for external src", () => {
    render(<ArticleImage src="https://example.com/image.jpg" alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "src",
      "/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fimage.jpg"
    );
  });

  it("shows globe.svg fallback when onError fires", () => {
    const { container } = render(<ArticleImage src="/bad.jpg" alt="Test" />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/bad.jpg");
    fireEvent.error(img!);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/globe.svg");
  });

  it("passes fill prop correctly", () => {
    const { container } = render(
      <ArticleImage src="https://example.com/photo.jpg" alt="Test" fill />
    );
    const img = container.querySelector("img");
    expect(img).toHaveStyle({ position: "absolute" });
    expect(img).toHaveStyle({ objectFit: "cover" });
  });

  it("passes priority prop correctly", () => {
    render(
      <ArticleImage src="https://example.com/image.jpg" alt="Test" priority />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
  });
});
