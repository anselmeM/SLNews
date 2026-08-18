import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePWAStore } from "@/hooks/usePWAInstall";

describe("PWA Install & Device Download Store", () => {
  beforeEach(() => {
    usePWAStore.setState({
      deferredPrompt: null,
      isInstalled: false,
      isStandalone: false,
      isIOS: false,
      isAndroid: false,
      isModalOpen: false,
    });
    localStorage.clear();
  });

  it("initializes with expected default values", () => {
    const state = usePWAStore.getState();
    expect(state.deferredPrompt).toBeNull();
    expect(state.isInstalled).toBe(false);
    expect(state.isStandalone).toBe(false);
    expect(state.isModalOpen).toBe(false);
  });

  it("opens and closes the install modal", () => {
    usePWAStore.getState().openInstallModal();
    expect(usePWAStore.getState().isModalOpen).toBe(true);

    usePWAStore.getState().closeInstallModal();
    expect(usePWAStore.getState().isModalOpen).toBe(false);
  });

  it("opens install modal when promptInstall is called without a deferred prompt", async () => {
    const res = await usePWAStore.getState().promptInstall();
    expect(res.outcome).toBe("modal_opened");
    expect(usePWAStore.getState().isModalOpen).toBe(true);
  });

  it("triggers native prompt when deferredPrompt exists and handles acceptance", async () => {
    const promptMock = vi.fn().mockResolvedValue({ outcome: "accepted" as const });
    const mockEvent = {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    } as unknown as NonNullable<ReturnType<typeof usePWAStore.getState>["deferredPrompt"]>;

    usePWAStore.getState().setDeferredPrompt(mockEvent);
    expect(usePWAStore.getState().deferredPrompt).not.toBeNull();

    const res = await usePWAStore.getState().promptInstall();
    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(res.outcome).toBe("accepted");
    expect(usePWAStore.getState().isInstalled).toBe(true);
    expect(usePWAStore.getState().deferredPrompt).toBeNull();
    expect(localStorage.getItem("slnews-pwa-installed")).toBe("1");
  });

  it("triggers native prompt when deferredPrompt exists and handles dismissal", async () => {
    const promptMock = vi.fn().mockResolvedValue({ outcome: "dismissed" as const });
    const mockEvent = {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    } as unknown as NonNullable<ReturnType<typeof usePWAStore.getState>["deferredPrompt"]>;

    usePWAStore.getState().setDeferredPrompt(mockEvent);

    const res = await usePWAStore.getState().promptInstall();
    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(res.outcome).toBe("dismissed");
    expect(usePWAStore.getState().isInstalled).toBe(false);
  });

  it("updates device and standalone states", () => {
    usePWAStore.getState().setIsIOS(true);
    expect(usePWAStore.getState().isIOS).toBe(true);

    usePWAStore.getState().setIsAndroid(true);
    expect(usePWAStore.getState().isAndroid).toBe(true);

    usePWAStore.getState().setIsStandalone(true);
    expect(usePWAStore.getState().isStandalone).toBe(true);
  });
});
