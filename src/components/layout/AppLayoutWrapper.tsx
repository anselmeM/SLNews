"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import BottomNavBar from "./BottomNavBar";
import MotionProvider from "./MotionProvider";
import TopAppBar from "./TopAppBar";
import { getSavedArticleIds, loadPreferences } from "@/app/actions/user-actions";
import type { AppSession } from "@/auth";
import EdgeSwipeBack from "@/components/navigation/EdgeSwipeBack";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import ThemeSync from "@/components/ThemeSync";
import { ToastProvider } from "@/components/Toast";
import { useAppStore } from "@/store/useAppStore";

// Non-critical widgets that sit below the fold or stay hidden until interaction.
// Loading them client-side keeps them out of the first-load bundle so the shell
// becomes interactive sooner.
const AudioPlayerBar = dynamic(() => import("@/components/AudioPlayerBar"), { ssr: false });
const BackToTop = dynamic(() => import("@/components/BackToTop"), { ssr: false });
const AuthGateModal = dynamic(() => import("@/components/gates/AuthGateModal"), { ssr: false });
const InstallBanner = dynamic(() => import("@/components/InstallBanner"), { ssr: false });
const InstallModal = dynamic(() => import("@/components/InstallModal"), { ssr: false });
const PostReadInstallSheet = dynamic(() => import("@/components/pwa/PostReadInstallSheet"), {
  ssr: false,
});

export default function AppLayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AppSession | null;
}) {
  const pathname = usePathname();
  const setSavedIds = useAppStore((s) => s.setSavedIds);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const syncedRef = useRef(false);

  useEffect(() => {
    // Rehydrate persisted preferences after mount so the client's first
    // render matches SSR defaults (see useAppStore skipHydration).
    useAppStore.persist?.rehydrate();

    if (session?.user?.id && !syncedRef.current) {
      syncedRef.current = true;
      Promise.all([getSavedArticleIds(), loadPreferences()]).then(
        ([ids, prefs]) => {
          setSavedIds(ids);
          setPreferences(null, prefs.preferredTopics);
        }
      ).catch(() => {});
    }
    if (!session?.user?.id) {
      syncedRef.current = false;
    }
  }, [session?.user?.id, setSavedIds, setPreferences]);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  if (isAuthPage) {
    return (
      <ToastProvider>
        <ThemeSync />
        {children}
      </ToastProvider>
    );
  }

  return (
    <MotionProvider>
      <ToastProvider>
        <ThemeSync />
        <div className="pt-[80px] pb-[100px] md:pb-16 min-h-screen bg-surface">
          <NetworkStatusBar />
          <TopAppBar session={session} />
          <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {children}
          </main>
          <BottomNavBar />
          <EdgeSwipeBack />
          <AudioPlayerBar />
          <BackToTop />
          <InstallBanner />
          <InstallModal />
          <AuthGateModal />
          <PostReadInstallSheet />
        </div>
      </ToastProvider>
    </MotionProvider>
  );
}
