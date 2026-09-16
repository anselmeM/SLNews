import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DownloadCTA from "@/app/download/_components/DownloadCTA";
import { usePWAStore } from "@/hooks/usePWAInstall";
import { trackCustomMetaEvent } from "@/lib/meta-pixel";

vi.mock("@/lib/meta-pixel", () => ({ trackCustomMetaEvent: vi.fn() }));

describe("DownloadCTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePWAStore.setState({ isStandalone: false, isInstalled: false });
  });

  it("renders the install and Play Store actions", () => {
    render(<DownloadCTA />);
    expect(screen.getByRole("button", { name: /install the app/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get it on google play/i })).toBeInTheDocument();
  });

  it("tracks Play Store clicks", () => {
    render(<DownloadCTA />);
    fireEvent.click(screen.getByRole("link", { name: /get it on google play/i }));
    expect(trackCustomMetaEvent).toHaveBeenCalledWith("PlayStoreClick", {
      placement: "download_page",
    });
  });

  it("shows the open action when the app is already installed", () => {
    usePWAStore.setState({ isStandalone: true });
    render(<DownloadCTA />);
    expect(screen.getByRole("link", { name: /open slnews/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /install the app/i })).not.toBeInTheDocument();
  });
});
