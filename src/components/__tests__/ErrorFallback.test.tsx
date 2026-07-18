import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import ErrorFallback from "@/components/ErrorFallback";

describe("ErrorFallback", () => {
  it("renders error message and action buttons", () => {
    const reset = vi.fn();
    const error = new Error("Test error message");

    render(<ErrorFallback error={error} reset={reset} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("We couldn't load this page. Please try again or return home.")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go Home")).toBeInTheDocument();
  });

  it("calls reset when Try Again is clicked", async () => {
    const reset = vi.fn();
    const error = new Error("test");

    render(<ErrorFallback error={error} reset={reset} />);

    await userEvent.click(screen.getByText("Try Again"));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("Go Home links to /home", () => {
    const reset = vi.fn();
    const error = new Error("test");

    render(<ErrorFallback error={error} reset={reset} />);

    const homeLink = screen.getByText("Go Home");
    expect(homeLink).toHaveAttribute("href", "/home");
  });
});