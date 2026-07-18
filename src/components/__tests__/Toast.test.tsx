import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ToastProvider, useToast } from "@/components/Toast";

function ToastTrigger({ type }: { type?: "success" | "error" | "info" }) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast("Test message", type)}>Show Toast</button>
  );
}

describe("Toast", () => {
  describe("ToastProvider", () => {
    it("renders children", () => {
      render(
        <ToastProvider>
          <div>Child content</div>
        </ToastProvider>
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });
  });

  describe("useToast", () => {
    it("useToast().toast() adds a toast to the DOM", async () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Toast"));
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it('has success styling for "success" type', async () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Toast"));
      const toast = screen.getByText("Test message");
      expect(toast.className).toContain("bg-primary-container");
      expect(toast.className).toContain("text-on-primary-container");
    });

    it('has error styling for "error" type', async () => {
      render(
        <ToastProvider>
          <ToastTrigger type="error" />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Toast"));
      const toast = screen.getByText("Test message");
      expect(toast.className).toContain("bg-error-container");
      expect(toast.className).toContain("text-on-error-container");
    });

    it("shows the message text", async () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Toast"));
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });
  });
});
