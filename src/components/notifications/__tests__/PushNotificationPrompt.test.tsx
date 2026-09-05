import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";

describe("PushNotificationPrompt", () => {
  it("does not render when isOpen is false", () => {
    render(<PushNotificationPrompt isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with custom title and value props when isOpen is true", () => {
    render(
      <PushNotificationPrompt
        isOpen={true}
        onClose={vi.fn()}
        title="Custom Price Alert Title"
        description="Custom description for price alerts."
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Custom Price Alert Title/i })).toBeInTheDocument();
    expect(screen.getByText(/Custom description for price alerts./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enable Push Notifications/i })).toBeInTheDocument();
  });

  it("calls onClose when Not Now is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<PushNotificationPrompt isOpen={true} onClose={handleClose} />);

    const notNowBtn = screen.getByRole("button", { name: /Not Now/i });
    await user.click(notNowBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
