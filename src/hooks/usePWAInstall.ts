"use client";

import { create } from "zustand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isModalOpen: boolean;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setIsInstalled: (v: boolean) => void;
  setIsStandalone: (v: boolean) => void;
  setIsIOS: (v: boolean) => void;
  setIsAndroid: (v: boolean) => void;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  promptInstall: () => Promise<{ outcome: "accepted" | "dismissed" | "modal_opened" }>;
}

export const usePWAStore = create<PWAState>((set, get) => ({
  deferredPrompt: null,
  isInstalled: false,
  isStandalone: false,
  isIOS: false,
  isAndroid: false,
  isModalOpen: false,
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
  setIsInstalled: (isInstalled) => set({ isInstalled }),
  setIsStandalone: (isStandalone) => set({ isStandalone }),
  setIsIOS: (isIOS) => set({ isIOS }),
  setIsAndroid: (isAndroid) => set({ isAndroid }),
  openInstallModal: () => set({ isModalOpen: true }),
  closeInstallModal: () => set({ isModalOpen: false }),
  promptInstall: async () => {
    const { deferredPrompt } = get();
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          set({ isInstalled: true, deferredPrompt: null });
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("slnews-pwa-installed", "1");
          }
        }
        return choice;
      } catch {
        set({ isModalOpen: true });
        return { outcome: "modal_opened" as const };
      }
    }
    // No native prompt available (e.g. iOS Safari, desktop without trigger)
    set({ isModalOpen: true });
    return { outcome: "modal_opened" as const };
  },
}));

export function usePWAInstall() {
  const deferredPrompt = usePWAStore((s) => s.deferredPrompt);
  const isInstalled = usePWAStore((s) => s.isInstalled);
  const isStandalone = usePWAStore((s) => s.isStandalone);
  const isIOS = usePWAStore((s) => s.isIOS);
  const isAndroid = usePWAStore((s) => s.isAndroid);
  const isModalOpen = usePWAStore((s) => s.isModalOpen);
  const openInstallModal = usePWAStore((s) => s.openInstallModal);
  const closeInstallModal = usePWAStore((s) => s.closeInstallModal);
  const promptInstall = usePWAStore((s) => s.promptInstall);
  const setDeferredPrompt = usePWAStore((s) => s.setDeferredPrompt);
  const setIsStandalone = usePWAStore((s) => s.setIsStandalone);
  const setIsIOS = usePWAStore((s) => s.setIsIOS);
  const setIsAndroid = usePWAStore((s) => s.setIsAndroid);
  const setIsInstalled = usePWAStore((s) => s.setIsInstalled);

  return {
    deferredPrompt,
    canPrompt: !!deferredPrompt,
    isInstalled,
    isStandalone,
    isIOS,
    isAndroid,
    isModalOpen,
    openInstallModal,
    closeInstallModal,
    promptInstall,
    setDeferredPrompt,
    setIsStandalone,
    setIsIOS,
    setIsAndroid,
    setIsInstalled,
  };
}
