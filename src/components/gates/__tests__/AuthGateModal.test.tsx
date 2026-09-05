import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import AuthGateModal from "@/components/gates/AuthGateModal";
import { useAuthGateStore } from "@/store/useAuthGateStore";

describe("AuthGateModal & useAuthGateStore", () => {
  beforeEach(() => {
    act(() => {
      useAuthGateStore.getState().closeGate();
    });
  });

  it("does not render when closed", () => {
    render(<AuthGateModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with bookmark context when triggered", () => {
    render(<AuthGateModal />);
    act(() => {
      useAuthGateStore.getState().openGate("bookmark");
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Save Articles for Offline Reading/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Saved Articles/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create Free Account/i })).toHaveAttribute(
      "href",
      "/sign-up"
    );
  });

  it("renders with reel_watch context when triggered", () => {
    render(<AuthGateModal />);
    act(() => {
      useAuthGateStore.getState().openGate("reel_watch");
    });

    expect(
      screen.getByRole("heading", { name: /Watch Unlimited Video News Reels/i })
    ).toBeInTheDocument();
  });

  it("renders with market_alert context when triggered", () => {
    render(<AuthGateModal />);
    act(() => {
      useAuthGateStore.getState().openGate("market_alert");
    });

    expect(
      screen.getByRole("heading", { name: /Get Real-Time Price Alerts/i })
    ).toBeInTheDocument();
  });

  it("closes when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<AuthGateModal />);
    act(() => {
      useAuthGateStore.getState().openGate("comment");
    });

    const closeBtn = screen.getByRole("button", { name: /Close/i });
    await user.click(closeBtn);

    expect(useAuthGateStore.getState().isOpen).toBe(false);
  });
});
