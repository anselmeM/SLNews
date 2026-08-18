"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function InstallModal() {
  const { isModalOpen, closeInstallModal, isIOS, isAndroid, promptInstall, canPrompt } = usePWAInstall();
  const [selectedTab, setSelectedTab] = useState<"ios" | "android" | "desktop" | null>(null);

  const activeTab = selectedTab ?? (isIOS ? "ios" : isAndroid ? "android" : "desktop");

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeInstallModal();
    }
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeInstallModal]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant/60 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-primary shadow-sm flex items-center justify-center shrink-0">
              <Image
                src="/icon-192x192.png"
                alt="SLNews Icon"
                width={48}
                height={48}
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 id="install-modal-title" className="text-lg font-black text-on-surface">
                Install SLNews App
              </h2>
              <p className="text-xs text-on-surface-variant">
                Fast, free & works offline on any device
              </p>
            </div>
          </div>

          <button
            onClick={closeInstallModal}
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Benefits Badges */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-primary/5 dark:bg-primary/10 border-b border-outline-variant/20 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-xl">offline_pin</span>
            <span className="text-[11px] font-bold text-on-surface">Works Offline</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
            <span className="text-[11px] font-bold text-on-surface">Breaking Alerts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-xl">bolt</span>
            <span className="text-[11px] font-bold text-on-surface">0 Data Saved</span>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="p-6 space-y-5">
          <div className="flex bg-surface-container rounded-xl p-1 gap-1">
            <button
              onClick={() => setSelectedTab("android")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "android"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">android</span>
              Android / Chrome
            </button>
            <button
              onClick={() => setSelectedTab("ios")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ios"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
              iPhone / iPad
            </button>
            <button
              onClick={() => setSelectedTab("desktop")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "desktop"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">laptop</span>
              Desktop
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "ios" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                3 Steps to install on Safari:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-on-surface">
                      Tap the <strong className="text-primary font-bold">Share</strong> button at the bottom of your Safari screen.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">ios_share</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-on-surface">
                      Scroll down and tap <strong className="text-primary font-bold">Add to Home Screen</strong>.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">add_box</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-on-surface">
                      Tap <strong className="text-primary font-bold">Add</strong> in the top-right corner.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "android" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {canPrompt ? (
                <div className="text-center p-4 bg-surface-container rounded-2xl space-y-3">
                  <p className="text-xs text-on-surface-variant">
                    Your browser is ready to install the SLNews app directly to your home screen!
                  </p>
                  <button
                    onClick={promptInstall}
                    className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/95 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Install App Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    How to install on Chrome / Android:
                  </p>
                  <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-xs font-semibold text-on-surface flex-1">
                      Tap the <strong className="text-primary font-bold">three dots (⋮)</strong> menu icon at the top right of Chrome.
                    </p>
                    <span className="material-symbols-outlined text-primary text-xl">more_vert</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-xs font-semibold text-on-surface flex-1">
                      Select <strong className="text-primary font-bold">Install app</strong> or <strong className="text-primary font-bold">Add to Home screen</strong>.
                    </p>
                    <span className="material-symbols-outlined text-primary text-xl">add_to_home_screen</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "desktop" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {canPrompt ? (
                <div className="text-center p-4 bg-surface-container rounded-2xl space-y-3">
                  <p className="text-xs text-on-surface-variant">
                    Install SLNews as a standalone desktop app on your computer.
                  </p>
                  <button
                    onClick={promptInstall}
                    className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/95 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">desktop_windows</span>
                    Install Desktop App
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    How to install on Chrome / Edge / Brave:
                  </p>
                  <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-xs font-semibold text-on-surface flex-1">
                      Look for the <strong className="text-primary font-bold">Install Icon (⊕)</strong> on the right side of the address bar.
                    </p>
                    <span className="material-symbols-outlined text-primary text-xl">install_desktop</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-surface-container rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-xs font-semibold text-on-surface flex-1">
                      Click <strong className="text-primary font-bold">Install</strong> in the popup to launch SLNews.
                    </p>
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end">
          <button
            onClick={closeInstallModal}
            className="px-5 py-2 rounded-full font-bold text-xs bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
